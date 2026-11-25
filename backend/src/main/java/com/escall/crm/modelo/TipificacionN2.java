package com.escall.crm.modelo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "tipificaciones_n2")
@Getter
@Setter
public class TipificacionN2 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "n1_id")
    private TipificacionN1 n1;

    @Column(nullable = false, length = 80)
    private String nombre;

    @Column(nullable = false)
    private boolean requiereCompromiso;

    @Column(nullable = false)
    private int orden;

    @Column(nullable = false)
    private boolean activo = true;
}
