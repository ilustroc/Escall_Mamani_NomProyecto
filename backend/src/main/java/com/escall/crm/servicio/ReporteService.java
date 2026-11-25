package com.escall.crm.servicio;

import com.escall.crm.config.Reloj;
import com.escall.crm.dto.*;
import com.escall.crm.modelo.Pago;
import com.escall.crm.modelo.Usuario;
import com.escall.crm.repositorio.GestionRepository;
import com.escall.crm.repositorio.PagoRepository;
import com.escall.crm.repositorio.PromesaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Report Generation Service for managements, payments, and promises (RF13 - RF15), role-scoped.
 */
@Service
@RequiredArgsConstructor
public class ReporteService {

    /** Maximum row limit per report to avoid browser overload. */
    private static final PageRequest REPORT_ROW_LIMIT = PageRequest.of(0, 5_000);

    private final GestionRepository gestiones;
    private final PagoRepository pagos;
    private final PromesaRepository promesas;
    private final AlcanceConsulta alcanceConsulta;
    private final Reloj reloj;

    @Transactional(readOnly = true)
    public List<GestionDto> getManagementReport(Filtros filters) {
        AlcanceConsulta.Alcance a = alcanceConsulta.resolver(filters);
        return gestiones.delPeriodo(
                a.desde().atStartOfDay(),
                a.hasta().plusDays(1).atStartOfDay(),
                a.asesores(),
                a.cartera(),
                a.cosecha(),
                REPORT_ROW_LIMIT
        ).stream().map(g -> GestionDto.desde(g, true)).toList();
    }

    @Transactional(readOnly = true)
    public List<GestionDto> gestiones(Filtros f) {
        return getManagementReport(f);
    }

    @Transactional(readOnly = true)
    public List<PromesaDto> getPromisesReport(Filtros filters) {
        AlcanceConsulta.Alcance a = alcanceConsulta.resolver(filters);
        return promesas.delPeriodo(
                a.desde().atStartOfDay(),
                a.hasta().plusDays(1).atStartOfDay(),
                a.asesores(),
                a.cartera(),
                a.cosecha(),
                REPORT_ROW_LIMIT
        ).stream().map(p -> PromesaDto.desde(p, reloj.today(), true)).toList();
    }

    @Transactional(readOnly = true)
    public List<PromesaDto> promesas(Filtros f) {
        return getPromisesReport(f);
    }

    @Transactional(readOnly = true)
    public List<PagoDto> getPaymentsReport(Filtros filters) {
        AlcanceConsulta.Alcance a = alcanceConsulta.resolver(filters);
        return pagos.delPeriodo(
                a.desde(),
                a.hasta(),
                a.todos(),
                a.asesores(),
                a.cartera(),
                a.cosecha(),
                REPORT_ROW_LIMIT
        ).stream().map(fila -> PagoDto.desde((Pago) fila[0], (Usuario) fila[1], true)).toList();
    }

    @Transactional(readOnly = true)
    public List<PagoDto> pagos(Filtros f) {
        return getPaymentsReport(f);
    }
}
