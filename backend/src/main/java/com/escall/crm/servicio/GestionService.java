package com.escall.crm.servicio;

import com.escall.crm.config.Reloj;
import com.escall.crm.dto.GestionDto;
import com.escall.crm.dto.GestionRequest;
import com.escall.crm.excepcion.RecursoNoEncontradoException;
import com.escall.crm.excepcion.ReglaNegocioException;
import com.escall.crm.modelo.*;
import com.escall.crm.repositorio.AsignacionRepository;
import com.escall.crm.repositorio.CuentaRepository;
import com.escall.crm.repositorio.GestionRepository;
import com.escall.crm.repositorio.TipificacionN2Repository;
import com.escall.crm.seguridad.UsuarioActual;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class GestionService {

    static final int DIAS_MAXIMOS_COMPROMISO = 30;

    private final GestionRepository gestiones;
    private final CuentaRepository cuentas;
    private final AsignacionRepository asignaciones;
    private final TipificacionN2Repository tipificaciones;
    private final UsuarioActual usuarioActual;
    private final Reloj reloj;

    @Transactional
    public GestionDto recordManagement(GestionRequest req) {
        Usuario advisor = usuarioActual.obtener();
        Cuenta account = cuentas.findById(req.cuentaId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Cuenta no encontrada"));

        Asignacion assignment = asignaciones.findByCuentaIdAndActivaTrue(account.getId())
                .filter(a -> a.getAsesor().getId().equals(advisor.getId()))
                .orElseThrow(() -> new ReglaNegocioException("Esta cuenta no está asignada a tu cartera"));

        TipificacionN2 n2 = tipificaciones.findWithN1ById(req.tipificacionN2Id())
                .filter(t -> t.isActivo() && t.getN1().isActivo())
                .orElseThrow(() -> new ReglaNegocioException("La tipificación elegida no existe o está inactiva"));

        LocalDateTime now = reloj.now();
        LocalDateTime actionDateTime = req.fechaHora() != null ? req.fechaHora() : now;
        if (actionDateTime.isAfter(now.plusMinutes(5))) {
            throw new ReglaNegocioException("La fecha de la gestión no puede ser futura");
        }

        Gestion g = new Gestion();
        g.setCuenta(assignment.getCuenta());
        g.setAsesor(advisor);
        g.setFechaHora(actionDateTime);
        g.setTelefono(req.telefono().trim());
        g.setTipificacionN1(n2.getN1());
        g.setTipificacionN2(n2);
        g.setObservacion(req.observacion().trim());

        if (n2.isRequiereCompromiso()) {
            g.setPromesa(createPromise(req, g, account, advisor));
        }

        account.getCliente().agregarTelefono(g.getTelefono(), "GESTION");

        return GestionDto.desde(gestiones.save(g), false);
    }

    @Transactional
    public GestionDto registrar(GestionRequest req) {
        return recordManagement(req);
    }

    private Promesa createPromise(GestionRequest req, Gestion g, Cuenta account, Usuario advisor) {
        if (req.fechaCompromiso() == null || req.montoCompromiso() == null) {
            throw new ReglaNegocioException("Esta tipificación requiere fecha y monto de compromiso");
        }
        LocalDate today = reloj.today();
        if (req.fechaCompromiso().isBefore(today)) {
            throw new ReglaNegocioException("La fecha de compromiso no puede ser anterior a hoy");
        }
        if (req.fechaCompromiso().isAfter(today.plusDays(DIAS_MAXIMOS_COMPROMISO))) {
            throw new ReglaNegocioException("La fecha de compromiso no puede superar " + DIAS_MAXIMOS_COMPROMISO + " días");
        }
        if (req.montoCompromiso().compareTo(account.getDeudaTotal()) > 0) {
            throw new ReglaNegocioException("El monto comprometido no puede superar la deuda de la cuenta");
        }
        Promesa p = new Promesa();
        p.setGestion(g);
        p.setCuenta(account);
        p.setAsesor(advisor);
        p.setFechaCompromiso(req.fechaCompromiso());
        p.setMonto(req.montoCompromiso());
        return p;
    }
}
