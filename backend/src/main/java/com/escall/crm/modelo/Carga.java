package com.escall.crm.modelo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "cargas")
@Getter
@Setter
public class Carga {

    public enum Tipo { ASIGNACION, PAGO }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Tipo tipo;

    @Column(nullable = false, length = 200)
    private String nombreArchivo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(nullable = false)
    private int total;

    @Column(nullable = false)
    private int aceptados;

    @Column(nullable = false)
    private int rechazados;

    @Column(length = 60000)
    private String detalleErrores;

    @Column(nullable = false, updatable = false)
    private Instant creadoEn = Instant.now();
}
