package com.escall.crm.dto;

import java.util.List;

public record ClienteDetalleDto(Long id, String tipoDocumento, String documento, String nombres, String email,
                                String direccion, List<TelefonoDto> telefonos, List<CuentaDto> cuentas,
                                List<GestionDto> gestiones, List<PagoDto> pagos, List<PromesaDto> promesas) {
}
