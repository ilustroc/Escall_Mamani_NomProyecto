package com.escall.crm.servicio;

import com.escall.crm.dto.LoginRequest;
import com.escall.crm.dto.LoginResponse;
import com.escall.crm.dto.UsuarioDto;
import com.escall.crm.excepcion.CredencialesInvalidasException;
import com.escall.crm.modelo.Usuario;
import com.escall.crm.repositorio.UsuarioRepository;
import com.escall.crm.seguridad.JwtService;
import com.escall.crm.seguridad.UsuarioActual;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication and Security Session Service (RF01 - RF02).
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarios;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UsuarioActual usuarioActual;
    private final AuditoriaService auditoria;

    /** RF01: Authenticate with username and password, with security audit trail. */
    @Transactional(noRollbackFor = CredencialesInvalidasException.class)
    public LoginResponse login(LoginRequest req) {
        Usuario u = usuarios.findByUsuarioIgnoreCase(req.usuario().trim())
                .filter(Usuario::isActivo)
                .filter(usuario -> passwordEncoder.matches(req.password(), usuario.getPasswordHash()))
                .orElseThrow(() -> {
                    auditoria.registrar(req.usuario().trim(), "LOGIN_FALLIDO", "Usuario", null, null);
                    return new CredencialesInvalidasException();
                });
        JwtService.TokenGenerado token = jwtService.generar(u);
        auditoria.registrar(u.getUsuario(), "LOGIN", "Usuario", u.getId(), null);
        return new LoginResponse(token.valor(), token.expiraEn(), UsuarioDto.desde(u));
    }

    /** RF02: Record user session logout event. */
    @Transactional
    public void logout() {
        Usuario u = usuarioActual.obtener();
        auditoria.registrar(u.getUsuario(), "LOGOUT", "Usuario", u.getId(), null);
    }

    @Transactional(readOnly = true)
    public UsuarioDto getCurrentUser() {
        return UsuarioDto.desde(usuarioActual.obtener());
    }

    @Transactional(readOnly = true)
    public UsuarioDto actual() {
        return getCurrentUser();
    }
}
