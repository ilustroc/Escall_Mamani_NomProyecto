package com.escall.crm.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * Operational Clock and Timezone Provider (Lima by default).
 * Provides consistent operational date and time independent of server host clock.
 */
@Component
public class Reloj {

    private final ZoneId zoneId;

    public Reloj(@Value("${app.zona-horaria}") String timeZone) {
        this.zoneId = ZoneId.of(timeZone);
    }

    public LocalDate today() {
        return LocalDate.now(zoneId);
    }

    public LocalDateTime now() {
        return LocalDateTime.now(zoneId);
    }

    public ZoneId getZoneId() {
        return zoneId;
    }

    /** Compatibility alias */
    public LocalDate hoy() {
        return today();
    }

    /** Compatibility alias */
    public LocalDateTime ahora() {
        return now();
    }
}
