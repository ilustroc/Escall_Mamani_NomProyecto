package com.escall.crm.dto;

import java.math.BigDecimal;

public record ClienteResumenDto(Long id, String tipoDocumento, String documento, String nombres,
                                int cuentas, BigDecimal deudaTotal) {
}
