package com.escall.crm.seguridad;

import com.escall.crm.excepcion.CredencialesInvalidasException;
import com.escall.crm.modelo.Rol;
import com.escall.crm.modelo.Usuario;
import com.escall.crm.repositorio.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Security Context Provider that resolves the authenticated user and their scoped visibility:
 *  - ADMIN      -> all advisors
 *  - SUPERVISOR -> only advisors belonging to their team (RF14)
 *  - ASESOR     -> only self (individual portfolio)
 */
@Component
@RequiredArgsConstructor
public class UsuarioActual {

    private final UsuarioRepository usuarios;

    public Usuario getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new CredencialesInvalidasException();
        }
        return usuarios.findByUsuarioIgnoreCase(auth.getName())
                .filter(Usuario::isActivo)
                .orElseThrow(CredencialesInvalidasException::new);
    }

    public Usuario obtener() {
        return getCurrentUser();
    }

    public List<Long> getVisibleAdvisorIds(Usuario user) {
        return switch (user.getRol()) {
            case ADMIN -> usuarios.idsPorRol(Rol.ASESOR);
            case SUPERVISOR -> usuarios.idsDelEquipo(user.getId());
            case ASESOR -> List.of(user.getId());
        };
    }

    public List<Long> asesoresVisibles(Usuario u) {
        return getVisibleAdvisorIds(u);
    }

    /**
     * Prevents empty list errors in SQL 'IN (:list)' clauses by supplying a fallback impossible ID.
     */
    public static List<Long> nonEmptyList(List<Long> ids) {
        return ids.isEmpty() ? List.of(-1L) : ids;
    }

    public static List<Long> noVacia(List<Long> ids) {
        return nonEmptyList(ids);
    }
}
