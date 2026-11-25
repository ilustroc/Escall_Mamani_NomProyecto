package com.escall.crm.servicio;

import com.escall.crm.dto.AuditoriaDto;
import com.escall.crm.dto.Pagina;
import com.escall.crm.modelo.Auditoria;
import com.escall.crm.repositorio.AuditoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditoriaService {

    private final AuditoriaRepository repositorio;

    @Transactional
    public void recordAudit(String username, String action, String entityName, Object entityId, String details) {
        Auditoria a = new Auditoria();
        a.setUsuario(username);
        a.setAccion(action);
        a.setEntidad(entityName);
        a.setEntidadId(entityId != null ? entityId.toString() : null);
        a.setDetalle(details != null && details.length() > 1000 ? details.substring(0, 1000) : details);
        repositorio.save(a);
    }

    @Transactional
    public void registrar(String usuario, String accion, String entidad, Object entidadId, String detalle) {
        recordAudit(usuario, accion, entidad, entidadId, detalle);
    }

    @Transactional(readOnly = true)
    public Pagina<AuditoriaDto> listAudit(int page, int size) {
        return Pagina.desde(repositorio.findAllByOrderByFechaDesc(PageRequest.of(Math.max(page, 0),
                Math.min(Math.max(size, 1), 100))), AuditoriaDto::desde);
    }

    @Transactional(readOnly = true)
    public Pagina<AuditoriaDto> listar(int pagina, int tamano) {
        return listAudit(pagina, tamano);
    }
}
