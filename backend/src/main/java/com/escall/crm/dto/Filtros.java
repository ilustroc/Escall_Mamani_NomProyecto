package com.escall.crm.dto;

import java.time.LocalDate;

public record Filtros(String periodo, LocalDate desde, LocalDate hasta, Long asesorId, String cartera,
                      String cosecha) {
}
