package com.escall.crm.modelo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "cuentas")
@Getter
@Setter
public class Cuenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @Column(nullable = false, unique = true, length = 30)
    private String numeroOperacion;

    @Column(nullable = false, length = 100)
    private String entidad;

    @Column(nullable = false, length = 100)
    private String producto;

    @Column(nullable = false, length = 100)
    private String cartera;

    @Column(nullable = false, length = 20)
    private String cosecha;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal deudaTotal;

    @Column(nullable = false)
    private int diasMora;

    @Column(nullable = false, updatable = false)
    private Instant creadoEn = Instant.now();

    @Column(nullable = false)
    private Instant actualizadoEn = Instant.now();

    @PreUpdate
    void alActualizar() {
        actualizadoEn = Instant.now();
    }
}
