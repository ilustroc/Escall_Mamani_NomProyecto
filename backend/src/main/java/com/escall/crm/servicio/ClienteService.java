package com.escall.crm.servicio;

import com.escall.crm.config.Reloj;
import com.escall.crm.dto.*;
import com.escall.crm.excepcion.RecursoNoEncontradoException;
import com.escall.crm.excepcion.ReglaNegocioException;
import com.escall.crm.modelo.*;
import com.escall.crm.repositorio.*;
import com.escall.crm.seguridad.UsuarioActual;
import com.escall.crm.util.TextUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private static final int MAX_RESULTADOS = 30;

    private final ClienteRepository clientes;
    private final CuentaRepository cuentas;
    private final AsignacionRepository asignaciones;
    private final GestionRepository gestiones;
    private final PagoRepository pagos;
    private final PromesaRepository promesas;
    private final UsuarioActual usuarioActual;
    private final Reloj reloj;
    private final AuditoriaService auditoria;

    @Transactional(readOnly = true)
    public List<ClienteResumenDto> search(String query) {
        String cleanQuery = TextUtils.clean(query);
        if (cleanQuery == null || cleanQuery.length() < 3) {
            throw new ReglaNegocioException("Escribe al menos 3 caracteres para buscar");
        }
        String pattern = "%" + cleanQuery.toLowerCase(Locale.ROOT) + "%";
        Usuario currentUser = usuarioActual.obtener();
        PageRequest limit = PageRequest.of(0, MAX_RESULTADOS);
        List<Cliente> matches = currentUser.getRol() == Rol.ADMIN
                ? clientes.buscar(pattern, limit)
                : clientes.buscarEnCartera(pattern, UsuarioActual.noVacia(usuarioActual.asesoresVisibles(currentUser)), limit);

        return matches.stream().map(c -> {
            List<Cuenta> clientAccounts = cuentas.findByClienteIdOrderByNumeroOperacionAsc(c.getId());
            BigDecimal totalDebt = clientAccounts.stream()
                    .map(Cuenta::getDeudaTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            return new ClienteResumenDto(c.getId(), c.getTipoDocumento(), c.getDocumento(), c.getNombres(),
                    clientAccounts.size(), totalDebt);
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<ClienteResumenDto> buscar(String texto) {
        return search(texto);
    }

    @Transactional(readOnly = true)
    public ClienteDetalleDto getDetail(Long clientId) {
        Cliente c = clientes.findById(clientId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado"));
        verifyAccess(clientId);

        List<Cuenta> clientAccounts = cuentas.findByClienteIdOrderByNumeroOperacionAsc(clientId);
        List<Pago> clientPayments = pagos.delCliente(clientId);
        Map<Long, Usuario> advisorByAccount = getAdvisorByAccount(clientAccounts);
        List<CuentaDto> accountDtos = clientAccounts.stream()
                .map(acc -> toDto(acc, calculateTotalPaid(acc.getId(), clientPayments), advisorByAccount.get(acc.getId()), false))
                .toList();

        return new ClienteDetalleDto(
                c.getId(),
                c.getTipoDocumento(),
                c.getDocumento(),
                c.getNombres(),
                c.getEmail(),
                c.getDireccion(),
                c.getTelefonos().stream().filter(Telefono::isActivo).map(TelefonoDto::desde).toList(),
                accountDtos,
                gestiones.historialDelCliente(clientId).stream().map(g -> GestionDto.desde(g, false)).toList(),
                clientPayments.stream().map(p -> PagoDto.desde(p, advisorByAccount.get(p.getCuenta().getId()), false)).toList(),
                promesas.delCliente(clientId).stream().map(p -> PromesaDto.desde(p, reloj.today(), false)).toList()
        );
    }

    @Transactional(readOnly = true)
    public ClienteDetalleDto detalle(Long clienteId) {
        return getDetail(clienteId);
    }

    @Transactional(readOnly = true)
    public List<CuentaDto> getPortfolio() {
        Usuario advisor = usuarioActual.obtener();
        List<Asignacion> assignments = asignaciones.findByAsesorIdAndActivaTrueOrderByCuentaDiasMoraDesc(advisor.getId());
        List<Long> accountIds = assignments.stream().map(a -> a.getCuenta().getId()).toList();
        Map<Long, BigDecimal> paidMap = accountIds.isEmpty() ? Map.of() : pagos.totalesPorCuenta(accountIds).stream()
                .collect(Collectors.toMap(f -> (Long) f[0], f -> (BigDecimal) f[1]));
        return assignments.stream()
                .map(a -> toDto(a.getCuenta(), paidMap.getOrDefault(a.getCuenta().getId(), BigDecimal.ZERO), advisor, true))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CuentaDto> cartera() {
        return getPortfolio();
    }

    @Transactional(readOnly = true)
    public List<PromesaDto> getSchedule() {
        Usuario advisor = usuarioActual.obtener();
        return promesas.delAsesorPorEstado(advisor.getId(), EstadoPromesa.PENDIENTE).stream()
                .map(p -> PromesaDto.desde(p, reloj.today(), true)).toList();
    }

    @Transactional(readOnly = true)
    public List<PromesaDto> agenda() {
        return getSchedule();
    }

    @Transactional
    public ClienteDetalleDto create(ClienteRequest req) {
        String document = req.documento().trim();
        if (clientes.existsByDocumento(document)) {
            throw new ReglaNegocioException("Ya existe un cliente con ese documento");
        }
        Cliente c = new Cliente();
        c.setTipoDocumento(TextUtils.clean(req.tipoDocumento()) == null ? "DNI" : TextUtils.clean(req.tipoDocumento()));
        c.setDocumento(document);
        c.setNombres(req.nombres().trim());
        c.setEmail(TextUtils.clean(req.email()));
        c.setDireccion(TextUtils.clean(req.direccion()));
        c = clientes.save(c);
        auditoria.registrar(usuarioActual.obtener().getUsuario(), "CREAR", "Cliente", c.getId(), c.getDocumento());
        return getDetail(c.getId());
    }

    @Transactional
    public ClienteDetalleDto crear(ClienteRequest req) {
        return create(req);
    }

    @Transactional
    public ClienteDetalleDto update(Long id, ClienteEdicionRequest req) {
        Cliente c = clientes.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado"));
        verifyAccess(id);
        c.setNombres(req.nombres().trim());
        c.setEmail(TextUtils.clean(req.email()));
        c.setDireccion(TextUtils.clean(req.direccion()));
        auditoria.registrar(usuarioActual.obtener().getUsuario(), "EDITAR", "Cliente", id, c.getDocumento());
        return getDetail(id);
    }

    @Transactional
    public ClienteDetalleDto actualizar(Long id, ClienteEdicionRequest req) {
        return update(id, req);
    }

    @Transactional
    public void delete(Long id) {
        Cliente c = clientes.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado"));
        if (cuentas.existsByClienteId(id)) {
            throw new ReglaNegocioException("El cliente tiene cuentas registradas; no se puede eliminar");
        }
        String document = c.getDocumento();
        clientes.delete(c);
        auditoria.registrar(usuarioActual.obtener().getUsuario(), "ELIMINAR", "Cliente", id, document);
    }

    @Transactional
    public void eliminar(Long id) {
        delete(id);
    }

    private void verifyAccess(Long clientId) {
        Usuario currentUser = usuarioActual.obtener();
        if (currentUser.getRol() != Rol.ADMIN
                && !clientes.esVisiblePara(clientId, UsuarioActual.noVacia(usuarioActual.asesoresVisibles(currentUser)))) {
            throw new RecursoNoEncontradoException("Cliente no encontrado");
        }
    }

    private Map<Long, Usuario> getAdvisorByAccount(List<Cuenta> accounts) {
        if (accounts.isEmpty()) {
            return Map.of();
        }
        return asignaciones.findByCuentaIdInAndActivaTrue(accounts.stream().map(Cuenta::getId).toList()).stream()
                .collect(Collectors.toMap(a -> a.getCuenta().getId(), Asignacion::getAsesor, (a, b) -> a));
    }

    private static BigDecimal calculateTotalPaid(Long accountId, List<Pago> clientPayments) {
        return clientPayments.stream()
                .filter(p -> p.getCuenta().getId().equals(accountId))
                .map(Pago::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static CuentaDto toDto(Cuenta c, BigDecimal paid, Usuario advisor, boolean includeClient) {
        BigDecimal balance = c.getDeudaTotal().subtract(paid).max(BigDecimal.ZERO);
        return new CuentaDto(
                c.getId(),
                c.getNumeroOperacion(),
                c.getEntidad(),
                c.getProducto(),
                c.getCartera(),
                c.getCosecha(),
                c.getDeudaTotal(),
                c.getDiasMora(),
                paid,
                balance,
                advisor != null ? advisor.getId() : null,
                advisor != null ? advisor.getNombre() : null,
                includeClient ? c.getCliente().getId() : null,
                includeClient ? c.getCliente().getDocumento() : null,
                includeClient ? c.getCliente().getNombres() : null
        );
    }
}
