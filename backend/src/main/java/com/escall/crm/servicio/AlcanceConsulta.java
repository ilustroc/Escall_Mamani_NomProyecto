package com.escall.crm.servicio;

import com.escall.crm.config.Reloj;
import com.escall.crm.dto.Filtros;
import com.escall.crm.excepcion.ReglaNegocioException;
import com.escall.crm.modelo.Rol;
import com.escall.crm.modelo.Usuario;
import com.escall.crm.seguridad.UsuarioActual;
import com.escall.crm.util.TextUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

/**
 * Filter Scope Resolution Service (RF11, RF14, RF15).
 * Translates query filters (period, advisor, portfolio, cohort) into date ranges and visible advisor IDs based on roles.
 */
@Component
@RequiredArgsConstructor
public class AlcanceConsulta {

    private static final int MAX_DAYS = 366;

    private final UsuarioActual usuarioActual;
    private final Reloj reloj;

    public record Alcance(LocalDate desde, LocalDate hasta, List<Long> asesores, boolean todos,
                          String cartera, String cosecha) {
    }

    public Alcance resolveScope(Filtros f) {
        LocalDate today = reloj.today();
        LocalDate from;
        LocalDate to;

        if (f.desde() != null || f.hasta() != null) {
            from = f.desde() != null ? f.desde() : f.hasta();
            to = f.hasta() != null ? f.hasta() : today;
        } else {
            to = today;
            from = switch (f.periodo() == null ? "MES" : f.periodo().toUpperCase()) {
                case "HOY" -> today;
                case "SEMANA" -> today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                default -> today.withDayOfMonth(1);
            };
        }

        if (from.isAfter(to)) {
            throw new ReglaNegocioException("La fecha inicial no puede ser mayor que la final");
        }
        if (ChronoUnit.DAYS.between(from, to) > MAX_DAYS) {
            throw new ReglaNegocioException("El rango máximo de consulta es de un año");
        }

        Usuario user = usuarioActual.getCurrentUser();
        List<Long> visibleAdvisors = usuarioActual.getVisibleAdvisorIds(user);
        List<Long> targetAdvisors = visibleAdvisors;

        if (f.asesorId() != null) {
            if (!visibleAdvisors.contains(f.asesorId())) {
                throw new ReglaNegocioException("Ese asesor no pertenece a tu equipo");
            }
            targetAdvisors = List.of(f.asesorId());
        }

        boolean allAdvisors = user.getRol() == Rol.ADMIN && f.asesorId() == null;
        return new Alcance(
                from,
                to,
                UsuarioActual.nonEmptyList(targetAdvisors),
                allAdvisors,
                TextUtils.clean(f.cartera()),
                TextUtils.clean(f.cosecha())
        );
    }

    public Alcance resolver(Filtros f) {
        return resolveScope(f);
    }
}
