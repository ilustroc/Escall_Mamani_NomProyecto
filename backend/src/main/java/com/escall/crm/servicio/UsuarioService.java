package com.escall.crm.servicio;

import com.escall.crm.dto.UsuarioDto;
import com.escall.crm.dto.UsuarioRequest;
import com.escall.crm.excepcion.RecursoNoEncontradoException;
import com.escall.crm.excepcion.ReglaNegocioException;
import com.escall.crm.modelo.Rol;
import com.escall.crm.modelo.Usuario;
import com.escall.crm.repositorio.UsuarioRepository;
import com.escall.crm.seguridad.UsuarioActual;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

/**
 * User and Team Access Management Service.
 *  - RF16: SUPERVISOR manages advisors on their assigned team.
 *  - RF17: ADMIN manages supervisors and advisors system-wide.
 */
@Service
@RequiredArgsConstructor
public class UsuarioService {

    private static final int MIN_PASSWORD_LENGTH = 8;

    private final UsuarioRepository usuarios;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioActual usuarioActual;
    private final AuditoriaService auditoria;

    @Transactional(readOnly = true)
    public List<UsuarioDto> getAllUsers() {
        Usuario me = usuarioActual.obtener();
        List<Usuario> list = me.getRol() == Rol.ADMIN
                ? usuarios.findAllByOrderByRolAscNombreAsc()
                : usuarios.findBySupervisorIdOrderByNombreAsc(me.getId());
        return list.stream().map(UsuarioDto::desde).toList();
    }

    @Transactional(readOnly = true)
    public List<UsuarioDto> listar() {
        return getAllUsers();
    }

    @Transactional(readOnly = true)
    public List<UsuarioDto> getActiveSupervisors() {
        return usuarios.findByRolOrderByNombreAsc(Rol.SUPERVISOR).stream()
                .filter(Usuario::isActivo)
                .map(UsuarioDto::desde)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UsuarioDto> supervisores() {
        return getActiveSupervisors();
    }

    @Transactional
    public UsuarioDto createUser(UsuarioRequest req) {
        Usuario me = usuarioActual.obtener();
        String username = req.usuario().trim().toLowerCase(Locale.ROOT);
        String email = req.email().trim().toLowerCase(Locale.ROOT);

        if (usuarios.existsByUsuarioIgnoreCase(username)) {
            throw new ReglaNegocioException("Ya existe el usuario \"" + username + "\"");
        }
        if (usuarios.existsByEmailIgnoreCase(email)) {
            throw new ReglaNegocioException("Ya existe un usuario con ese correo");
        }
        validatePassword(req.password());

        Usuario u = new Usuario();
        u.setUsuario(username);
        u.setNombre(req.nombre().trim());
        u.setEmail(email);
        u.setPasswordHash(passwordEncoder.encode(req.password()));

        if (me.getRol() == Rol.SUPERVISOR) {
            u.setRol(Rol.ASESOR);
            u.setSupervisor(me);
        } else {
            u.setRol(req.rol());
            u.setSupervisor(resolveSupervisor(req));
        }

        usuarios.save(u);
        auditoria.registrar(me.getUsuario(), "CREAR", "Usuario", u.getId(), u.getUsuario() + " (" + u.getRol() + ")");
        return UsuarioDto.desde(u);
    }

    @Transactional
    public UsuarioDto crear(UsuarioRequest req) {
        return createUser(req);
    }

    @Transactional
    public UsuarioDto updateUser(Long id, UsuarioRequest req) {
        Usuario me = usuarioActual.obtener();
        Usuario u = findManageableUser(me, id);
        String username = req.usuario().trim().toLowerCase(Locale.ROOT);
        String email = req.email().trim().toLowerCase(Locale.ROOT);

        if (!u.getUsuario().equalsIgnoreCase(username) && usuarios.existsByUsuarioIgnoreCase(username)) {
            throw new ReglaNegocioException("Ya existe el usuario \"" + username + "\"");
        }
        if (!u.getEmail().equalsIgnoreCase(email) && usuarios.existsByEmailIgnoreCase(email)) {
            throw new ReglaNegocioException("Ya existe un usuario con ese correo");
        }

        u.setNombre(req.nombre().trim());
        u.setEmail(email);

        if (me.getRol() == Rol.ADMIN) {
            if (u.getId().equals(me.getId()) && req.rol() != Rol.ADMIN) {
                throw new ReglaNegocioException("No puedes quitarte el rol de administrador");
            }
            u.setUsuario(username);
            u.setRol(req.rol());
            u.setSupervisor(resolveSupervisor(req));
        }

        auditoria.registrar(me.getUsuario(), "EDITAR", "Usuario", u.getId(), u.getUsuario());
        return UsuarioDto.desde(u);
    }

    @Transactional
    public UsuarioDto actualizar(Long id, UsuarioRequest req) {
        return updateUser(id, req);
    }

    @Transactional
    public UsuarioDto updateUserStatus(Long id, boolean active) {
        Usuario me = usuarioActual.obtener();
        Usuario u = findManageableUser(me, id);
        if (u.getId().equals(me.getId())) {
            throw new ReglaNegocioException("No puedes desactivar tu propio usuario");
        }
        u.setActivo(active);
        auditoria.registrar(me.getUsuario(), active ? "ACTIVAR" : "DESACTIVAR", "Usuario", u.getId(), u.getUsuario());
        return UsuarioDto.desde(u);
    }

    @Transactional
    public UsuarioDto cambiarEstado(Long id, boolean activo) {
        return updateUserStatus(id, activo);
    }

    @Transactional
    public void updatePassword(Long id, String password) {
        Usuario me = usuarioActual.obtener();
        Usuario u = findManageableUser(me, id);
        validatePassword(password);
        u.setPasswordHash(passwordEncoder.encode(password));
        auditoria.registrar(me.getUsuario(), "CAMBIAR_PASSWORD", "Usuario", u.getId(), u.getUsuario());
    }

    @Transactional
    public void cambiarPassword(Long id, String password) {
        updatePassword(id, password);
    }

    // ---------------------------------------------------------------- Rules and helpers

    private Usuario findManageableUser(Usuario me, Long id) {
        Usuario u = usuarios.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        if (me.getRol() == Rol.ADMIN) {
            return u;
        }
        boolean isTeamAdvisor = u.getRol() == Rol.ASESOR && u.getSupervisor() != null
                && u.getSupervisor().getId().equals(me.getId());
        if (!isTeamAdvisor) {
            throw new RecursoNoEncontradoException("Usuario no encontrado");
        }
        return u;
    }

    private Usuario resolveSupervisor(UsuarioRequest req) {
        if (req.rol() != Rol.ASESOR) {
            return null;
        }
        if (req.supervisorId() == null) {
            throw new ReglaNegocioException("Todo asesor debe pertenecer al equipo de un supervisor");
        }
        return usuarios.findById(req.supervisorId())
                .filter(s -> s.getRol() == Rol.SUPERVISOR && s.isActivo())
                .orElseThrow(() -> new ReglaNegocioException("El supervisor elegido no existe o está inactivo"));
    }

    private static void validatePassword(String password) {
        if (password == null || password.length() < MIN_PASSWORD_LENGTH) {
            throw new ReglaNegocioException("La contraseña debe tener al menos " + MIN_PASSWORD_LENGTH + " caracteres");
        }
    }
}
