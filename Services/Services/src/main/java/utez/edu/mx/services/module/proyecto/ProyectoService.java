package utez.edu.mx.services.module.proyecto;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utez.edu.mx.services.kernel.AppiResponse;
import utez.edu.mx.services.module.equipo.Equipo;
import utez.edu.mx.services.module.equipo.EquipoRepository;
import utez.edu.mx.services.module.equipousuario.EquipoUsuario;
import utez.edu.mx.services.module.equipousuario.EquipoUsuarioRepository;
import utez.edu.mx.services.module.presupuesto.Presupuesto;
import utez.edu.mx.services.module.presupuesto.PresupuestoRepository;
import utez.edu.mx.services.module.proyecto.dtos.CreateProyectoRequestDTO;
import utez.edu.mx.services.module.proyecto.dtos.ProyectoDTO;
import utez.edu.mx.services.module.tarea.Tarea;
import utez.edu.mx.services.module.tarea.TareaRepository;
import utez.edu.mx.services.module.usuario.Usuario;
import utez.edu.mx.services.module.usuario.UsuarioRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProyectoService {

    private final ProyectoRepository proyectoRepository;
    private final TareaRepository tareaRepository;
    private final UsuarioRepository usuarioRepository;
    private final EquipoUsuarioRepository equipoUsuarioRepository;
    private final PresupuestoRepository presupuestoRepository;
    private final EquipoRepository equipoRepository;

    public ProyectoService(
            ProyectoRepository proyectoRepository,
            TareaRepository tareaRepository,
            UsuarioRepository usuarioRepository,
            EquipoUsuarioRepository equipoUsuarioRepository,
            PresupuestoRepository presupuestoRepository,
            EquipoRepository equipoRepository
    ) {
        this.proyectoRepository = proyectoRepository;
        this.tareaRepository = tareaRepository;
        this.usuarioRepository = usuarioRepository;
        this.equipoUsuarioRepository = equipoUsuarioRepository;
        this.presupuestoRepository = presupuestoRepository;
        this.equipoRepository = equipoRepository;
    }

    @Transactional(readOnly = true)
    public ResponseEntity<AppiResponse> findAll() {
        List<ProyectoDTO> proyectos = proyectoRepository.findAll()
                .stream()
                .map(ProyectoDTO::new)
                .toList();

        return ResponseEntity.ok(
                new AppiResponse("Operación exitosa", proyectos, HttpStatus.OK)
        );
    }

    @Transactional(readOnly = true)
    public ResponseEntity<AppiResponse> findById(Long id) {
        Optional<Proyecto> proyecto = proyectoRepository.findById(id);

        if (proyecto.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new AppiResponse("Proyecto no encontrado", HttpStatus.BAD_REQUEST));
        }

        return ResponseEntity.ok(
                new AppiResponse("Operación exitosa", new ProyectoDTO(proyecto.get()), HttpStatus.OK)
        );
    }

    @Transactional(readOnly = true)
    public ResponseEntity<AppiResponse> findMisProyectos(String username) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(username);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new AppiResponse("Usuario no encontrado", HttpStatus.NOT_FOUND));
        }

        Usuario usuario = usuarioOpt.get();
        String rol = usuario.getRol() != null ? usuario.getRol().getNombre().toUpperCase() : "";
        List<Proyecto> proyectos;

        if ("SUPERADMIN".equals(rol)) {
            proyectos = proyectoRepository.findAll();
        } else if ("LIDER".equals(rol)) {
            proyectos = proyectoRepository.findByLiderIdUsuarioAndEstadoNotIgnoreCase(
                    usuario.getIdUsuario(), "CANCELADO"
            );
        } else {
            List<EquipoUsuario> membresias = equipoUsuarioRepository.findByUsuarioIdUsuario(usuario.getIdUsuario());

            Set<Long> idsEquipo = membresias.stream()
                    .map(eu -> eu.getEquipo().getIdEquipo())
                    .collect(Collectors.toSet());

            proyectos = idsEquipo.stream()
                    .flatMap(idEquipo ->
                            proyectoRepository.findByEquipoIdEquipoAndEstadoNotIgnoreCase(idEquipo, "CANCELADO").stream()
                    )
                    .collect(Collectors.collectingAndThen(
                            Collectors.toMap(Proyecto::getIdProyecto, p -> p, (a, b) -> a, LinkedHashMap::new),
                            m -> new ArrayList<>(m.values())
                    ));
        }

        return ResponseEntity.ok(
                new AppiResponse(
                        "Operación exitosa",
                        proyectos.stream().map(ProyectoDTO::new).toList(),
                        HttpStatus.OK
                )
        );
    }

    @Transactional(readOnly = true)
    public ResponseEntity<AppiResponse> findByEquipo(Long idEquipo) {
        return ResponseEntity.ok(
                new AppiResponse(
                        "Operación exitosa",
                        proyectoRepository.findByEquipoIdEquipo(idEquipo).stream().map(ProyectoDTO::new).toList(),
                        HttpStatus.OK
                )
        );
    }

    @Transactional(readOnly = true)
    public ResponseEntity<AppiResponse> findByLider(Long idUsuario) {
        return ResponseEntity.ok(
                new AppiResponse(
                        "Operación exitosa",
                        proyectoRepository.findByLiderIdUsuario(idUsuario).stream().map(ProyectoDTO::new).toList(),
                        HttpStatus.OK
                )
        );
    }

    @Transactional
    public ResponseEntity<AppiResponse> save(CreateProyectoRequestDTO request) {
        System.out.println("=== ENTRÓ AL SERVICE SAVE DE PROYECTOS ===");

        try {
            if (request.getName() == null || request.getName().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(new AppiResponse("El nombre del proyecto es obligatorio", HttpStatus.BAD_REQUEST));
            }

            if (proyectoRepository.existsByNombre(request.getName().trim())) {
                return ResponseEntity.badRequest()
                        .body(new AppiResponse("El nombre del proyecto ya está en uso", HttpStatus.BAD_REQUEST));
            }

            if (request.getBudget() == null || request.getBudget().compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest()
                        .body(new AppiResponse("El presupuesto debe ser mayor a 0", HttpStatus.BAD_REQUEST));
            }

            if (request.getEndDate() == null) {
                return ResponseEntity.badRequest()
                        .body(new AppiResponse("La fecha de fin es obligatoria", HttpStatus.BAD_REQUEST));
            }

            if (request.getStartDate() != null && request.getStartDate().isAfter(request.getEndDate())) {
                return ResponseEntity.badRequest()
                        .body(new AppiResponse("La fecha de inicio no puede ser mayor que la fecha de fin", HttpStatus.BAD_REQUEST));
            }

            Proyecto nuevo = new Proyecto();
            nuevo.setNombre(request.getName().trim());
            nuevo.setDescripcion(request.getDescription() != null ? request.getDescription().trim() : null);
            nuevo.setObjetivo(null);
            nuevo.setFechaInicio(request.getStartDate() != null ? request.getStartDate() : LocalDate.now());
            nuevo.setFechaFin(request.getEndDate());
            nuevo.setPresupuestoTotal(request.getBudget());
            nuevo.setLogo(null);
            nuevo.setEstado("PENDIENTE");
            nuevo.setEquipo(null);
            nuevo.setLider(null);

            if (request.getTeamId() != null) {
                Optional<Equipo> equipoOpt = equipoRepository.findById(request.getTeamId());

                if (equipoOpt.isEmpty()) {
                    return ResponseEntity.badRequest()
                            .body(new AppiResponse("El equipo seleccionado no existe", HttpStatus.BAD_REQUEST));
                }

                boolean equipoOcupado = proyectoRepository
                        .existsByEquipoIdEquipoAndEstadoNotIgnoreCase(request.getTeamId(), "CANCELADO");

                if (equipoOcupado) {
                    return ResponseEntity.badRequest()
                            .body(new AppiResponse(
                                    "Ese equipo ya tiene un proyecto activo o pendiente asignado",
                                    HttpStatus.BAD_REQUEST
                            ));
                }

                Equipo equipo = equipoOpt.get();
                nuevo.setEquipo(equipo);

                if (equipo.getLider() != null) {
                    nuevo.setLider(equipo.getLider());
                }
            }

            Proyecto saved = proyectoRepository.saveAndFlush(nuevo);

            return ResponseEntity.ok(
                    new AppiResponse("Proyecto registrado exitosamente", new ProyectoDTO(saved), HttpStatus.OK)
            );

        } catch (DataIntegrityViolationException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new AppiResponse(
                            "No se pudo registrar el proyecto por una restricción de integridad en la base de datos.",
                            HttpStatus.BAD_REQUEST
                    ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AppiResponse(
                            "Ocurrió un error al registrar el proyecto.",
                            HttpStatus.INTERNAL_SERVER_ERROR
                    ));
        }
    }
    @Transactional
    public ResponseEntity<AppiResponse> update(Long id, Proyecto proyecto) {
        Optional<Proyecto> existing = proyectoRepository.findById(id);

        if (existing.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new AppiResponse("Proyecto no encontrado", HttpStatus.BAD_REQUEST));
        }

        if (proyecto.getNombre() == null || proyecto.getNombre().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new AppiResponse("El nombre del proyecto es obligatorio", HttpStatus.BAD_REQUEST));
        }

        if (proyectoRepository.existsByNombreAndIdProyectoNot(proyecto.getNombre().trim(), id)) {
            return ResponseEntity.badRequest()
                    .body(new AppiResponse("El nombre del proyecto ya está en uso", HttpStatus.BAD_REQUEST));
        }

        if (proyecto.getPresupuestoTotal() != null &&
                proyecto.getPresupuestoTotal().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest()
                    .body(new AppiResponse("El presupuesto debe ser mayor a 0", HttpStatus.BAD_REQUEST));
        }

        Proyecto p = existing.get();
        p.setNombre(proyecto.getNombre().trim());
        p.setDescripcion(proyecto.getDescripcion());
        p.setObjetivo(proyecto.getObjetivo());
        p.setFechaFin(proyecto.getFechaFin());
        p.setPresupuestoTotal(proyecto.getPresupuestoTotal());
        p.setLogo(proyecto.getLogo());

        if (proyecto.getEstado() != null && !proyecto.getEstado().isBlank()) {
            p.setEstado(proyecto.getEstado());
        } else if (p.getEstado() == null || p.getEstado().isBlank()) {
            p.setEstado("PENDIENTE");
        }

        if (proyecto.getEquipo() != null && proyecto.getEquipo().getIdEquipo() != null) {
            boolean equipoOcupado = proyectoRepository
                    .existsByEquipoIdEquipoAndEstadoNotIgnoreCaseAndIdProyectoNot(
                            proyecto.getEquipo().getIdEquipo(), "CANCELADO", id
                    );

            if (equipoOcupado) {
                return ResponseEntity.badRequest()
                        .body(new AppiResponse(
                                "Ese equipo ya tiene otro proyecto activo o pendiente asignado",
                                HttpStatus.BAD_REQUEST
                        ));
            }

            p.setEquipo(proyecto.getEquipo());
        } else {
            p.setEquipo(null);
        }

        p.setLider(proyecto.getLider());
        Proyecto updated = proyectoRepository.save(p);

        if (updated.getPresupuestoTotal() != null &&
                updated.getPresupuestoTotal().compareTo(BigDecimal.ZERO) > 0) {

            Optional<Presupuesto> presOpt = presupuestoRepository.findByProyectoIdProyecto(id);

            if (presOpt.isPresent()) {
                Presupuesto pres = presOpt.get();
                BigDecimal diferencia = updated.getPresupuestoTotal().subtract(pres.getMontoAsignado());
                pres.setMontoAsignado(updated.getPresupuestoTotal());
                pres.setMontoDisponible(pres.getMontoDisponible().add(diferencia));
                presupuestoRepository.save(pres);
            } else {
                Presupuesto nuevoPres = new Presupuesto();
                nuevoPres.setProyecto(updated);
                nuevoPres.setMontoAsignado(updated.getPresupuestoTotal());
                nuevoPres.setMontoUtilizado(BigDecimal.ZERO);
                nuevoPres.setMontoDisponible(updated.getPresupuestoTotal());
                nuevoPres.setFechaRegistro(LocalDate.now());
                presupuestoRepository.save(nuevoPres);
            }
        }

        return ResponseEntity.ok(
                new AppiResponse("Proyecto actualizado exitosamente", new ProyectoDTO(updated), HttpStatus.OK)
        );
    }

    @Transactional
    public ResponseEntity<AppiResponse> cambiarEstado(Long id, String estado) {
        Optional<Proyecto> existing = proyectoRepository.findById(id);

        if (existing.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new AppiResponse("Proyecto no encontrado", HttpStatus.BAD_REQUEST));
        }

        Proyecto p = existing.get();
        p.setEstado(estado);
        proyectoRepository.save(p);

        return ResponseEntity.ok(new AppiResponse("Estado actualizado exitosamente", HttpStatus.OK));
    }

    @Transactional
    public ResponseEntity<AppiResponse> delete(Long id) {
        Optional<Proyecto> existing = proyectoRepository.findById(id);

        if (existing.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new AppiResponse("Proyecto no encontrado", HttpStatus.BAD_REQUEST));
        }

        Proyecto p = existing.get();
        p.setEstado("CANCELADO");
        proyectoRepository.save(p);

        return ResponseEntity.ok(new AppiResponse("Proyecto cancelado exitosamente", HttpStatus.OK));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<AppiResponse> getProgreso(Long idProyecto) {
        Optional<Proyecto> proyecto = proyectoRepository.findById(idProyecto);

        if (proyecto.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new AppiResponse("Proyecto no encontrado", HttpStatus.BAD_REQUEST));
        }

        List<Tarea> tareas = tareaRepository.findByProyectoIdProyecto(idProyecto);

        if (tareas.isEmpty()) {
            return ResponseEntity.ok(new AppiResponse("Operación exitosa", 0, HttpStatus.OK));
        }

        long completadas = tareas.stream()
                .filter(t -> "COMPLETADA".equalsIgnoreCase(t.getEstado()))
                .count();

        int progreso = (int) Math.round((completadas * 100.0) / tareas.size());

        return ResponseEntity.ok(
                new AppiResponse("Operación exitosa", progreso, HttpStatus.OK)
        );
    }
}