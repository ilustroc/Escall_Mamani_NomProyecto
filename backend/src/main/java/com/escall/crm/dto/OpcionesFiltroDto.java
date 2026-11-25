package com.escall.crm.dto;

import java.util.List;

public record OpcionesFiltroDto(List<String> carteras, List<String> cosechas, List<Opcion> asesores) {

    public record Opcion(Long id, String nombre) {
    }
}
