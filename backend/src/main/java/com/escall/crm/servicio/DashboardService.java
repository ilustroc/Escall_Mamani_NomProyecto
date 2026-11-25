package com.escall.crm.servicio;

import com.escall.crm.dto.DashboardDto;
import com.escall.crm.dto.Filtros;
import com.escall.crm.dto.OpcionesFiltroDto;
import com.escall.crm.modelo.*;
import com.escall.crm.repositorio.*;
import com.escall.crm.seguridad.UsuarioActual;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Operational Dashboard Service (RF10 - RF12): Metrics for collections, contacts, promises, and payments.
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final PageRequest NO_LIMIT = PageRequest.of(0, 100_000);

    private final GestionRepository gestiones;
    private final PromesaRepository promesas;
    private final PagoRepository pagos;
    private final UsuarioRepository usuarios;
    private final CuentaRepository cuentas;
    private final UsuarioActual usuarioActual;
    private final AlcanceConsulta alcanceConsulta;

    @Transactional(readOnly = true)
    public DashboardDto calculateDashboard(Filtros filters) {
        AlcanceConsulta.Alcance a = alcanceConsulta.resolver(filters);
        var start = a.desde().atStartOfDay();
        var end = a.hasta().plusDays(1).atStartOfDay();

        List<Gestion> managementList = gestiones.delPeriodo(start, end, a.asesores(), a.cartera(), a.cosecha(), NO_LIMIT);
        List<Promesa> promiseList = promesas.delPeriodo(start, end, a.asesores(), a.cartera(), a.cosecha(), NO_LIMIT);
        List<Object[]> paymentList = pagos.delPeriodo(a.desde(), a.hasta(), a.todos(), a.asesores(), a.cartera(), a.cosecha(), NO_LIMIT);

        long contactCount = managementList.stream().filter(g -> g.getTipificacionN1().isEsContacto()).count();
        BigDecimal totalPromiseAmount = sum(promiseList.stream().map(Promesa::getMonto));
        BigDecimal totalPaymentAmount = sum(paymentList.stream().map(f -> ((Pago) f[0]).getMonto()));

        return new DashboardDto(
                a.desde(),
                a.hasta(),
                managementList.size(),
                contactCount,
                calculatePercentage(contactCount, managementList.size()),
                promiseList.size(),
                totalPromiseAmount,
                paymentList.size(),
                totalPaymentAmount,
                byAdvisor(a.asesores(), managementList, promiseList, paymentList),
                byDay(a.desde(), a.hasta(), managementList),
                byTypology(managementList)
        );
    }

    @Transactional(readOnly = true)
    public DashboardDto resumen(Filtros filtros) {
        return calculateDashboard(filtros);
    }

    /**
     * Filter dropdown options available for the current user's role scope.
     */
    @Transactional(readOnly = true)
    public OpcionesFiltroDto getFilterOptions() {
        List<Long> visibleAdvisorIds = usuarioActual.asesoresVisibles(usuarioActual.obtener());
        List<OpcionesFiltroDto.Opcion> advisorOptions = usuarios.findAllById(visibleAdvisorIds).stream()
                .sorted(Comparator.comparing(Usuario::getNombre))
                .map(u -> new OpcionesFiltroDto.Opcion(u.getId(), u.getNombre() + (u.isActivo() ? "" : " (inactivo)")))
                .toList();
        return new OpcionesFiltroDto(cuentas.carteras(), cuentas.cosechas(), advisorOptions);
    }

    @Transactional(readOnly = true)
    public OpcionesFiltroDto opciones() {
        return getFilterOptions();
    }

    // ---------------------------------------------------------------- Calculation helpers

    private List<DashboardDto.FilaAsesor> byAdvisor(
            List<Long> ids,
            List<Gestion> gs,
            List<Promesa> ps,
            List<Object[]> paymentsWithAdvisor
    ) {
        Map<Long, List<Gestion>> gByAdvisor = gs.stream().collect(Collectors.groupingBy(g -> g.getAsesor().getId()));
        Map<Long, List<Promesa>> pByAdvisor = ps.stream().collect(Collectors.groupingBy(p -> p.getAsesor().getId()));
        Map<Long, List<Pago>> paymentByAdvisor = paymentsWithAdvisor.stream()
                .filter(f -> f[1] != null)
                .collect(Collectors.groupingBy(
                        f -> ((Usuario) f[1]).getId(),
                        Collectors.mapping(f -> (Pago) f[0], Collectors.toList())
                ));

        return usuarios.findAllById(ids).stream()
                .sorted(Comparator.comparing(Usuario::getNombre))
                .map(u -> {
                    List<Gestion> g = gByAdvisor.getOrDefault(u.getId(), List.of());
                    List<Promesa> p = pByAdvisor.getOrDefault(u.getId(), List.of());
                    List<Pago> pg = paymentByAdvisor.getOrDefault(u.getId(), List.of());
                    return new DashboardDto.FilaAsesor(
                            u.getId(),
                            u.getNombre(),
                            g.size(),
                            g.stream().filter(x -> x.getTipificacionN1().isEsContacto()).count(),
                            p.size(),
                            sum(p.stream().map(Promesa::getMonto)),
                            pg.size(),
                            sum(pg.stream().map(Pago::getMonto))
                    );
                })
                .toList();
    }

    private List<DashboardDto.Dia> byDay(LocalDate from, LocalDate to, List<Gestion> gs) {
        if (ChronoUnit.DAYS.between(from, to) > 62) {
            return List.of();
        }
        Map<LocalDate, List<Gestion>> grouped = gs.stream()
                .collect(Collectors.groupingBy(g -> g.getFechaHora().toLocalDate()));
        List<DashboardDto.Dia> days = new ArrayList<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            List<Gestion> dayManagements = grouped.getOrDefault(d, List.of());
            days.add(new DashboardDto.Dia(
                    d,
                    dayManagements.size(),
                    dayManagements.stream().filter(g -> g.getTipificacionN1().isEsContacto()).count(),
                    dayManagements.stream().filter(g -> g.getPromesa() != null).count()
            ));
        }
        return days;
    }

    private List<DashboardDto.Conteo> byTypology(List<Gestion> gs) {
        return gs.stream()
                .collect(Collectors.groupingBy(
                        g -> g.getTipificacionN1().getNombre() + " › " + g.getTipificacionN2().getNombre(),
                        Collectors.counting()
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(e -> new DashboardDto.Conteo(e.getKey(), e.getValue()))
                .toList();
    }

    private static BigDecimal sum(java.util.stream.Stream<BigDecimal> amounts) {
        return amounts.reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static double calculatePercentage(long part, long total) {
        return total == 0 ? 0 : BigDecimal.valueOf(part * 100.0 / total).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }
}
