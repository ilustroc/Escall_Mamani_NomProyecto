package com.escall.crm.servicio;

import com.escall.crm.config.Reloj;
import com.escall.crm.dto.CargaDto;
import com.escall.crm.excepcion.ReglaNegocioException;
import com.escall.crm.modelo.*;
import com.escall.crm.repositorio.*;
import com.escall.crm.seguridad.UsuarioActual;
import com.escall.crm.util.CsvReader;
import com.escall.crm.util.CsvReader.CsvRow;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

/**
 * Data Integration Service (RF18 - RF21): Batch loading of portfolio assignments and payments via CSV files.
 * Validates each row individually: valid rows are persisted and invalid rows are reported with line number and cause.
 */
@Service
@RequiredArgsConstructor
public class IntegracionService {

    public static final Set<String> COLUMNAS_ASIGNACION = Set.of(
            "documento", "nombres", "numero_operacion", "entidad", "producto",
            "cartera", "cosecha", "deuda", "dias_mora", "asesor"
    );
    public static final Set<String> COLUMNAS_PAGO = Set.of("numero_operacion", "fecha_pago", "monto");

    private static final int MAX_ERRORES_GUARDADOS = 500;
    private static final List<DateTimeFormatter> DATE_FORMATTERS = List.of(
            DateTimeFormatter.ISO_LOCAL_DATE,
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("d/M/yyyy")
    );

    private final ClienteRepository clientes;
    private final CuentaRepository cuentas;
    private final AsignacionRepository asignaciones;
    private final PagoRepository pagos;
    private final PromesaRepository promesas;
    private final UsuarioRepository usuarios;
    private final CargaRepository cargas;
    private final UsuarioActual usuarioActual;
    private final AuditoriaService auditoria;
    private final Reloj reloj;

    // =================================================================== ASSIGNMENTS

    @Transactional
    public CargaDto importAssignments(MultipartFile file) {
        List<CsvRow> rows = readCsvFile(file, COLUMNAS_ASIGNACION);
        Carga batch = initBatch(Carga.Tipo.ASIGNACION, file, rows.size());
        LocalDate today = reloj.today();

        Map<String, Usuario> advisorsByUsername = new HashMap<>();
        Set<String> operationsInFile = new HashSet<>();
        List<String> errors = new ArrayList<>();
        int acceptedCount = 0;

        for (CsvRow row : rows) {
            try {
                String missing = COLUMNAS_ASIGNACION.stream()
                        .filter(col -> row.get(col) == null)
                        .sorted()
                        .findFirst()
                        .orElse(null);
                if (missing != null) {
                    throw new ReglaNegocioException("falta el campo \"" + missing + "\"");
                }

                String operation = row.get("numero_operacion");
                if (!operationsInFile.add(operation)) {
                    throw new ReglaNegocioException("la operación " + operation + " está repetida en el archivo");
                }

                String document = row.get("documento");
                if (!document.matches("[A-Za-z0-9-]{6,20}")) {
                    throw new ReglaNegocioException("documento inválido \"" + document + "\"");
                }

                BigDecimal debt = parseDecimal(row.get("deuda"), "deuda");
                if (debt.signum() < 0) {
                    throw new ReglaNegocioException("la deuda no puede ser negativa");
                }

                int delinquencyDays = parseInteger(row.get("dias_mora"), "dias_mora");
                String advisorUsername = row.get("asesor").toLowerCase(Locale.ROOT);
                Usuario advisor = advisorsByUsername.computeIfAbsent(advisorUsername,
                        key -> usuarios.findByUsuarioIgnoreCase(key)
                                .filter(u -> u.getRol() == Rol.ASESOR && u.isActivo())
                                .orElse(null));
                if (advisor == null) {
                    throw new ReglaNegocioException("el asesor \"" + advisorUsername + "\" no existe o no está activo");
                }

                Cuenta account = cuentas.findByNumeroOperacion(operation).orElseGet(Cuenta::new);
                if (account.getId() != null && !account.getCliente().getDocumento().equals(document)) {
                    throw new ReglaNegocioException("la operación " + operation + " ya pertenece a otro cliente");
                }

                Cliente client = clientes.findByDocumento(document).orElseGet(Cliente::new);
                client.setDocumento(document);
                client.setTipoDocumento(Optional.ofNullable(row.get("tipo_documento")).orElse("DNI").toUpperCase(Locale.ROOT));
                client.setNombres(row.get("nombres"));
                if (row.get("email") != null) client.setEmail(row.get("email"));
                if (row.get("direccion") != null) client.setDireccion(row.get("direccion"));
                client.agregarTelefono(row.get("telefono"), "CELULAR");
                client = clientes.save(client);

                account.setCliente(client);
                account.setNumeroOperacion(operation);
                account.setEntidad(row.get("entidad"));
                account.setProducto(row.get("producto"));
                account.setCartera(row.get("cartera"));
                account.setCosecha(row.get("cosecha"));
                account.setDeudaTotal(debt);
                account.setDiasMora(delinquencyDays);
                account = cuentas.save(account);

                Optional<Asignacion> currentAssignment = asignaciones.findByCuentaIdAndActivaTrue(account.getId());
                if (currentAssignment.isEmpty() || !currentAssignment.get().getAsesor().getId().equals(advisor.getId())) {
                    currentAssignment.ifPresent(a -> {
                        a.setActiva(false);
                        a.setFechaFin(today);
                    });
                    Asignacion newAssignment = new Asignacion();
                    newAssignment.setCuenta(account);
                    newAssignment.setAsesor(advisor);
                    newAssignment.setFechaAsignacion(today);
                    newAssignment.setCarga(batch);
                    asignaciones.save(newAssignment);
                }
                acceptedCount++;
            } catch (ReglaNegocioException e) {
                errors.add("Fila " + row.rowNumber() + ": " + e.getMessage());
            }
        }
        return closeBatch(batch, acceptedCount, errors);
    }

    @Transactional
    public CargaDto cargarAsignaciones(MultipartFile archivo) {
        return importAssignments(archivo);
    }

    // =================================================================== PAYMENTS

    @Transactional
    public CargaDto importPayments(MultipartFile file) {
        List<CsvRow> rows = readCsvFile(file, COLUMNAS_PAGO);
        Carga batch = initBatch(Carga.Tipo.PAGO, file, rows.size());
        LocalDate today = reloj.today();

        Set<String> keysInFile = new HashSet<>();
        List<String> errors = new ArrayList<>();
        int acceptedCount = 0;

        for (CsvRow row : rows) {
            try {
                String missing = COLUMNAS_PAGO.stream()
                        .filter(col -> row.get(col) == null)
                        .sorted()
                        .findFirst()
                        .orElse(null);
                if (missing != null) {
                    throw new ReglaNegocioException("falta el campo \"" + missing + "\"");
                }

                String operation = row.get("numero_operacion");
                Cuenta account = cuentas.findByNumeroOperacion(operation)
                        .orElseThrow(() -> new ReglaNegocioException("la operación " + operation + " no existe"));

                LocalDate paymentDate = parseDate(row.get("fecha_pago"));
                if (paymentDate.isAfter(today)) {
                    throw new ReglaNegocioException("la fecha de pago no puede ser futura");
                }

                BigDecimal amount = parseDecimal(row.get("monto"), "monto");
                if (amount.signum() <= 0) {
                    throw new ReglaNegocioException("el monto debe ser mayor a 0");
                }
                String reference = Optional.ofNullable(row.get("referencia")).orElse("");

                String uniqueKey = account.getId() + "|" + paymentDate + "|" + amount.stripTrailingZeros().toPlainString() + "|" + reference;
                if (!keysInFile.add(uniqueKey)
                        || pagos.existsByCuentaIdAndFechaPagoAndMontoAndReferencia(account.getId(), paymentDate, amount, reference)) {
                    throw new ReglaNegocioException("pago duplicado (misma operación, fecha, monto y referencia)");
                }

                Pago payment = new Pago();
                payment.setCuenta(account);
                payment.setFechaPago(paymentDate);
                payment.setMonto(amount);
                payment.setReferencia(reference);
                payment.setCarga(batch);
                pagos.save(payment);

                promesas.marcarCumplidas(account.getId(), paymentDate.plusDays(1).atStartOfDay());
                acceptedCount++;
            } catch (ReglaNegocioException e) {
                errors.add("Fila " + row.rowNumber() + ": " + e.getMessage());
            }
        }
        return closeBatch(batch, acceptedCount, errors);
    }

    @Transactional
    public CargaDto cargarPagos(MultipartFile archivo) {
        return importPayments(archivo);
    }

    @Transactional(readOnly = true)
    public List<CargaDto> getHistory() {
        return cargas.findTop20ByOrderByCreadoEnDesc().stream().map(CargaDto::desde).toList();
    }

    @Transactional(readOnly = true)
    public List<CargaDto> historial() {
        return getHistory();
    }

    // =================================================================== HELPER METHODS

    private List<CsvRow> readCsvFile(MultipartFile file, Set<String> mandatoryColumns) {
        if (file == null || file.isEmpty()) {
            throw new ReglaNegocioException("Selecciona un archivo");
        }
        String filename = Optional.ofNullable(file.getOriginalFilename()).orElse("").toLowerCase(Locale.ROOT);
        if (!filename.endsWith(".csv") && !filename.endsWith(".txt")) {
            throw new ReglaNegocioException("Formato no soportado: usa un archivo .csv (en Excel: Guardar como > CSV UTF-8)");
        }
        try {
            return CsvReader.readCsv(file.getInputStream(), mandatoryColumns);
        } catch (IOException e) {
            throw new ReglaNegocioException("No se pudo leer el archivo");
        }
    }

    private Carga initBatch(Carga.Tipo type, MultipartFile file, int total) {
        Carga batch = new Carga();
        batch.setTipo(type);
        String name = Optional.ofNullable(file.getOriginalFilename()).orElse("archivo.csv");
        batch.setNombreArchivo(name.length() > 200 ? name.substring(0, 200) : name);
        batch.setUsuario(usuarioActual.obtener());
        batch.setTotal(total);
        return cargas.save(batch);
    }

    private CargaDto closeBatch(Carga batch, int acceptedCount, List<String> errors) {
        batch.setAceptados(acceptedCount);
        batch.setRechazados(errors.size());
        List<String> savedErrors = errors.size() > MAX_ERRORES_GUARDADOS
                ? new ArrayList<>(errors.subList(0, MAX_ERRORES_GUARDADOS))
                : errors;
        if (errors.size() > MAX_ERRORES_GUARDADOS) {
            savedErrors.add("... y " + (errors.size() - MAX_ERRORES_GUARDADOS) + " errores más");
        }
        batch.setDetalleErrores(String.join("\n", savedErrors));
        auditoria.registrar(batch.getUsuario().getUsuario(), "CARGA_" + batch.getTipo(), "Carga", batch.getId(),
                batch.getNombreArchivo() + ": " + acceptedCount + " aceptados, " + errors.size() + " rechazados");
        return CargaDto.desde(batch);
    }

    private static BigDecimal parseDecimal(String value, String fieldName) {
        try {
            return new BigDecimal(value.replace(" ", "").replace(",", "."));
        } catch (NumberFormatException e) {
            throw new ReglaNegocioException("\"" + fieldName + "\" debe ser un número (ej: 1250.50)");
        }
    }

    private static int parseInteger(String value, String fieldName) {
        try {
            int n = Integer.parseInt(value.trim());
            if (n < 0) throw new NumberFormatException();
            return n;
        } catch (NumberFormatException e) {
            throw new ReglaNegocioException("\"" + fieldName + "\" debe ser un número entero positivo");
        }
    }

    private static LocalDate parseDate(String value) {
        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                return LocalDate.parse(value.trim(), formatter);
            } catch (DateTimeParseException ignored) {
                // Try next pattern
            }
        }
        throw new ReglaNegocioException("fecha inválida \"" + value + "\" (usa AAAA-MM-DD o DD/MM/AAAA)");
    }
}
