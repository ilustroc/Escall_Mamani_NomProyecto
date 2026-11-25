package com.escall.crm.controlador;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PublicController {
    @GetMapping(value = "/api/publico/saludo", produces = MediaType.TEXT_PLAIN_VALUE)
    public String saludo() {
        return "ESCALL Perú: conexión Angular–Spring Boot establecida";
    }
}
