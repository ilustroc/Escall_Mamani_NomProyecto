package com.escall.crm.controlador;

import com.escall.crm.dto.CambioPasswordRequest;
import com.escall.crm.dto.EstadoRequest;
import com.escall.crm.dto.UsuarioDto;
import com.escall.crm.dto.UsuarioRequest;
import com.escall.crm.servicio.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
public class UsuarioController {

    private final UsuarioService usuarios;

    @GetMapping
    public List<UsuarioDto> listar() {
        return usuarios.listar();
    }

    @GetMapping("/supervisores")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UsuarioDto> supervisores() {
        return usuarios.supervisores();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioDto crear(@Valid @RequestBody UsuarioRequest req) {
        return usuarios.crear(req);
    }

    @PutMapping("/{id}")
    public UsuarioDto actualizar(@PathVariable Long id, @Valid @RequestBody UsuarioRequest req) {
        return usuarios.actualizar(id, req);
    }

    @PatchMapping("/{id}/estado")
    public UsuarioDto cambiarEstado(@PathVariable Long id, @RequestBody EstadoRequest req) {
        return usuarios.cambiarEstado(id, req.activo());
    }

    @PatchMapping("/{id}/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cambiarPassword(@PathVariable Long id, @Valid @RequestBody CambioPasswordRequest req) {
        usuarios.cambiarPassword(id, req.password());
    }
}
