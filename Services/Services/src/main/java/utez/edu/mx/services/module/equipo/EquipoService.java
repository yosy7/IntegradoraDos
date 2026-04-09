package utez.edu.mx.services.module.equipo;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utez.edu.mx.services.kernel.AppiResponse;
import utez.edu.mx.services.module.equipo.dto.CreateTeamRequestDTO;
import utez.edu.mx.services.module.equipousuario.EquipoUsuario;
import utez.edu.mx.services.module.equipousuario.EquipoUsuarioRepository;
import utez.edu.mx.services.module.proyecto.Proyecto;
import utez.edu.mx.services.module.proyecto.ProyectoRepository;
import utez.edu.mx.services.module.usuario.Usuario;
import utez.edu.mx.services.module.usuario.UsuarioRepository;

import java.time.LocalDate;
import java.util.*;

@Service
public class EquipoService {

    private final EquipoRepository equipoRepository;
    private final EquipoUsuarioRepository equipoUsuarioRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProyectoRepository proyectoRepository;

    // ✅ FIX: inyectar EntityManager para poder hacer flush+clear manualmente
    @PersistenceContext
    private EntityManager entityManager;

    public EquipoService(
            EquipoRepository equipoRepository,
            EquipoUsuarioRepository equipoUsuarioRepository,
            UsuarioRepository usuarioRepository,
            ProyectoRepository proyectoRepository
    ) {
        this.equipoRepository = equipoRepository;
        this.equipoUsuarioRepository = equipoUsuarioRepository;
        this.usuarioRepository = usuarioRepository;
        this.proyectoRepository = proyectoRepository;
    }

    @Transactional(readOnly = true)
    public ResponseEntity<AppiResponse> findAll() {
        try {
            List<Equipo> equipos = equipoRepository.findAll();

            List<Map<String, Object>> equiposConDatos = equipos.stream().map(equipo -> {
                List<EquipoUsuario> relaciones = equipoUsuarioRepository.findByEquipoIdEquipo(equipo.getIdEquipo());

                Usuario lider = null;
                List<Map<String, Object>> miembros = new ArrayList<>();

                for (EquipoUsuario relacion : relaciones) {
                    Usuario usuario = relacion.getUsuario();

                    if ("LIDER".equalsIgnoreCase(relacion.getRolEnEquipo())) {
                        lider = usuario;
                    } else if ("INTEGRANTE".equalsIgnoreCase(relacion.getRolEnEquipo())) {
                        Map<String, Object> miembroMap = new HashMap<>();
                        miembroMap.put("idUsuario", usuario.getIdUsuario());
                        miembroMap.put("nombre", usuario.getNombre());
                        miembroMap.put("apellidoPaterno", usuario.getApellidoPaterno());
                        miembroMap.put("apellidoMaterno", usuario.getApellidoMaterno());
                        miembroMap.put("username", usuario.getUsername());
                        miembros.add(miembroMap);
                    }
                }

                Proyecto proyecto = proyectoRepository.findAll().stream()
                        .filter(p -> p.getEquipo() != null)
                        .filter(p -> Objects.equals(p.getEquipo().getIdEquipo(), equipo.getIdEquipo()))
                        .findFirst()
                        .orElse(null);

                Map<String, Object> equipoMap = new HashMap<>();
                equipoMap.put("idEquipo", equipo.getIdEquipo());
                equipoMap.put("nombreEquipo", equipo.getNombreEquipo());
                equipoMap.put("descripcion", equipo.getDescripcion());
                equipoMap.put("logo", equipo.getLogo());
                equipoMap.put("fechaCreacion", equipo.getFechaCreacion());
                equipoMap.put("estatus", equipo.getEstatus());

                if (lider != null) {
                    Map<String, Object> liderMap = new HashMap<>();
                    liderMap.put("idUsuario", lider.getIdUsuario());
                    liderMap.put("nombre", lider.getNombre());
                    liderMap.put("apellidoPaterno", lider.getApellidoPaterno());
                    liderMap.put("apellidoMaterno", lider.getApellidoMaterno());
                    liderMap.put("username", lider.getUsername());
                    equipoMap.put("lider", liderMap);
                } else {
                    equipoMap.put("lider", null);
                }

                equipoMap.put("miembros", miembros);

                if (proyecto != null) {
                    Map<String, Object> proyectoMap = new HashMap<>();
                    proyectoMap.put("idProyecto", proyecto.getIdProyecto());
                    proyectoMap.put("nombre", proyecto.getNombre());
                    proyectoMap.put("descripcion", proyecto.getDescripcion());
                    proyectoMap.put("estado", proyecto.getEstado());
                    equipoMap.put("proyecto", proyectoMap);
                } else {
                    equipoMap.put("proyecto", null);
                }

                return equipoMap;
            }).toList();

            return ResponseEntity.ok(
                    new AppiResponse("Equipos obtenidos correctamente", equiposConDatos, HttpStatus.OK)
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AppiResponse("Error al obtener equipos: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }
    @Transactional(readOnly = true)
    public ResponseEntity<AppiResponse> findById(Long id) {
        try {
            Optional<Equipo> equipoOpt = equipoRepository.findById(id);

            if (equipoOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new AppiResponse("Equipo no encontrado", HttpStatus.NOT_FOUND));
            }

            Equipo equipo = equipoOpt.get();

            List<EquipoUsuario> relaciones = equipoUsuarioRepository.findByEquipoIdEquipo(id);

            Usuario lider = null;
            List<Map<String, Object>> miembros = new ArrayList<>();

            for (EquipoUsuario relacion : relaciones) {
                Usuario usuario = relacion.getUsuario();

                if ("LIDER".equalsIgnoreCase(relacion.getRolEnEquipo())) {
                    lider = usuario;
                } else if ("INTEGRANTE".equalsIgnoreCase(relacion.getRolEnEquipo())) {
                    Map<String, Object> miembroMap = new HashMap<>();
                    miembroMap.put("idUsuario", usuario.getIdUsuario());
                    miembroMap.put("nombre", usuario.getNombre());
                    miembroMap.put("apellidoPaterno", usuario.getApellidoPaterno());
                    miembroMap.put("apellidoMaterno", usuario.getApellidoMaterno());
                    miembroMap.put("username", usuario.getUsername());
                    miembros.add(miembroMap);
                }
            }

            Proyecto proyecto = proyectoRepository.findAll().stream()
                    .filter(p -> p.getEquipo() != null)
                    .filter(p -> Objects.equals(p.getEquipo().getIdEquipo(), equipo.getIdEquipo()))
                    .findFirst()
                    .orElse(null);

            Map<String, Object> equipoMap = new HashMap<>();
            equipoMap.put("idEquipo", equipo.getIdEquipo());
            equipoMap.put("nombreEquipo", equipo.getNombreEquipo());
            equipoMap.put("descripcion", equipo.getDescripcion());
            equipoMap.put("logo", equipo.getLogo());
            equipoMap.put("fechaCreacion", equipo.getFechaCreacion());
            equipoMap.put("estatus", equipo.getEstatus());

            if (lider != null) {
                Map<String, Object> liderMap = new HashMap<>();
                liderMap.put("idUsuario", lider.getIdUsuario());
                liderMap.put("nombre", lider.getNombre());
                liderMap.put("apellidoPaterno", lider.getApellidoPaterno());
                liderMap.put("apellidoMaterno", lider.getApellidoMaterno());
                liderMap.put("username", lider.getUsername());
                equipoMap.put("lider", liderMap);
            } else {
                equipoMap.put("lider", null);
            }

            equipoMap.put("miembros", miembros);

            if (proyecto != null) {
                Map<String, Object> proyectoMap = new HashMap<>();
                proyectoMap.put("idProyecto", proyecto.getIdProyecto());
                proyectoMap.put("nombre", proyecto.getNombre());
                proyectoMap.put("descripcion", proyecto.getDescripcion());
                proyectoMap.put("estado", proyecto.getEstado());
                equipoMap.put("proyecto", proyectoMap);
            } else {
                equipoMap.put("proyecto", null);
            }

            return ResponseEntity.ok(
                    new AppiResponse("Equipo obtenido correctamente", equipoMap, HttpStatus.OK)
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AppiResponse("Error al obtener equipo: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }
    @Transactional(readOnly = true)
    public ResponseEntity<AppiResponse> findMiEquipo(String username) {
        try {
            Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(username);

            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new AppiResponse("Usuario no encontrado", HttpStatus.NOT_FOUND));
            }

            List<EquipoUsuario> relaciones = equipoUsuarioRepository.findByUsuarioIdUsuario(usuarioOpt.get().getIdUsuario());

            if (relaciones.isEmpty()) {
                return ResponseEntity.ok(
                        new AppiResponse("El usuario no pertenece a ningún equipo", null, HttpStatus.OK)
                );
            }

            Long idEquipo = relaciones.get(0).getEquipo().getIdEquipo();
            return findById(idEquipo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AppiResponse("Error al obtener mi equipo: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Transactional(readOnly = true)
    public ResponseEntity<AppiResponse> findIntegrantesByEquipo(Long idEquipo) {
        try {
            List<Usuario> integrantes = equipoUsuarioRepository.findByEquipoIdEquipo(idEquipo)
                    .stream()
                    .map(EquipoUsuario::getUsuario)
                    .toList();

            return ResponseEntity.ok(
                    new AppiResponse("Integrantes obtenidos correctamente", integrantes, HttpStatus.OK)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AppiResponse("Error al obtener integrantes: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Transactional(readOnly = true)
    public ResponseEntity<AppiResponse> findMisIntegrantes(String username) {
        try {
            Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(username);

            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new AppiResponse("Usuario no encontrado", HttpStatus.NOT_FOUND));
            }

            List<EquipoUsuario> misRelaciones = equipoUsuarioRepository.findByUsuarioIdUsuario(usuarioOpt.get().getIdUsuario());

            if (misRelaciones.isEmpty()) {
                return ResponseEntity.ok(
                        new AppiResponse("El usuario no pertenece a ningún equipo", List.of(), HttpStatus.OK)
                );
            }

            Long idEquipo = misRelaciones.get(0).getEquipo().getIdEquipo();

            List<Usuario> integrantes = equipoUsuarioRepository.findByEquipoIdEquipo(idEquipo)
                    .stream()
                    .map(EquipoUsuario::getUsuario)
                    .toList();

            return ResponseEntity.ok(
                    new AppiResponse("Integrantes obtenidos correctamente", integrantes, HttpStatus.OK)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AppiResponse("Error al obtener integrantes: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Transactional
    public ResponseEntity<AppiResponse> save(Equipo equipo) {
        try {
            if (equipo.getNombreEquipo() == null || equipo.getNombreEquipo().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(new AppiResponse("El nombre del equipo es obligatorio", HttpStatus.BAD_REQUEST));
            }

            if (equipoRepository.existsByNombreEquipo(equipo.getNombreEquipo().trim())) {
                return ResponseEntity.badRequest()
                        .body(new AppiResponse("Ya existe un equipo con ese nombre", HttpStatus.BAD_REQUEST));
            }

            equipo.setNombreEquipo(equipo.getNombreEquipo().trim());
            equipo.setFechaCreacion(LocalDate.now());

            if (equipo.getEstatus() == null || equipo.getEstatus().isBlank()) {
                equipo.setEstatus("ACTIVO");
            }

            Equipo saved = equipoRepository.save(equipo);

            return ResponseEntity.ok(
                    new AppiResponse("Equipo registrado correctamente", saved, HttpStatus.OK)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AppiResponse("Error al registrar equipo: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Transactional
    public ResponseEntity<AppiResponse> crearEquipoConMiembros(CreateTeamRequestDTO dto) {
        try {
            if (dto.getNombreEquipo() == null || dto.getNombreEquipo().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(new AppiResponse("El nombre del equipo es obligatorio", HttpStatus.BAD_REQUEST));
            }

            if (dto.getIdLider() == null) {
                return ResponseEntity.badRequest()
                        .body(new AppiResponse("Debes seleccionar un líder", HttpStatus.BAD_REQUEST));
            }

            if (dto.getIntegrantesIds() == null) {
                dto.setIntegrantesIds(new ArrayList<>());
            }

            String nombreEquipo = dto.getNombreEquipo().trim();

            if (equipoRepository.existsByNombreEquipo(nombreEquipo)) {
                return ResponseEntity.badRequest()
                        .body(new AppiResponse("Ya existe un equipo con ese nombre", HttpStatus.BAD_REQUEST));
            }

            Set<Long> idsUnicos = new HashSet<>(dto.getIntegrantesIds());

            if (idsUnicos.size() != dto.getIntegrantesIds().size()) {
                return ResponseEntity.badRequest()
                        .body(new AppiResponse("No puedes repetir integrantes", HttpStatus.BAD_REQUEST));
            }

            if (idsUnicos.contains(dto.getIdLider())) {
                return ResponseEntity.badRequest()
                        .body(new AppiResponse("El líder no debe ir también en integrantes", HttpStatus.BAD_REQUEST));
            }

            Optional<Usuario> liderOpt = usuarioRepository.findById(dto.getIdLider());
            if (liderOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new AppiResponse("El líder seleccionado no existe", HttpStatus.BAD_REQUEST));
            }

            Usuario lider = liderOpt.get();

            if (equipoUsuarioRepository.existsByUsuarioIdUsuario(lider.getIdUsuario())) {
                return ResponseEntity.badRequest()
                        .body(new AppiResponse(
                                "El líder " + lider.getUsername() + " ya pertenece a un equipo",
                                HttpStatus.BAD_REQUEST
                        ));
            }

            Map<Long, Usuario> usuariosValidados = new HashMap<>();
            for (Long idUsuario : idsUnicos) {
                Optional<Usuario> usuarioOpt = usuarioRepository.findById(idUsuario);

                if (usuarioOpt.isEmpty()) {
                    return ResponseEntity.badRequest()
                            .body(new AppiResponse("Uno de los integrantes seleccionados no existe", HttpStatus.BAD_REQUEST));
                }

                if (equipoUsuarioRepository.existsByUsuarioIdUsuario(idUsuario)) {
                    return ResponseEntity.badRequest()
                            .body(new AppiResponse(
                                    "El usuario " + usuarioOpt.get().getUsername() + " ya pertenece a un equipo",
                                    HttpStatus.BAD_REQUEST
                            ));
                }

                usuariosValidados.put(idUsuario, usuarioOpt.get());
            }

            Proyecto proyecto = null;
            if (dto.getIdProyecto() != null) {
                Optional<Proyecto> proyectoOpt = proyectoRepository.findById(dto.getIdProyecto());

                if (proyectoOpt.isEmpty()) {
                    return ResponseEntity.badRequest()
                            .body(new AppiResponse("El proyecto seleccionado no existe", HttpStatus.BAD_REQUEST));
                }

                proyecto = proyectoOpt.get();

                if (proyecto.getEquipo() != null) {
                    return ResponseEntity.badRequest()
                            .body(new AppiResponse("El proyecto ya está asignado a un equipo", HttpStatus.BAD_REQUEST));
                }
            }

            Equipo equipo = new Equipo();
            equipo.setNombreEquipo(nombreEquipo);
            equipo.setDescripcion(dto.getDescripcion());
            equipo.setLogo(dto.getLogo());
            equipo.setFechaCreacion(LocalDate.now());
            equipo.setEstatus("ACTIVO");

            equipo = equipoRepository.saveAndFlush(equipo);

            // Usar directamente el objeto equipo que ya tiene el ID confirmado
            // No usar entityManager.clear() ni getReference() ya que Oracle
            // puede no encontrar la FK si se limpia el contexto
            Equipo equipoRef = equipo;

            EquipoUsuario relacionLider = new EquipoUsuario();
            relacionLider.setEquipo(equipoRef);
            relacionLider.setUsuario(lider);
            relacionLider.setRolEnEquipo("LIDER");
            relacionLider.setFechaUnion(LocalDate.now());
            equipoUsuarioRepository.save(relacionLider);

            for (Long idUsuario : idsUnicos) {
                Usuario usuario = usuariosValidados.get(idUsuario);

                EquipoUsuario relacion = new EquipoUsuario();
                relacion.setEquipo(equipoRef);
                relacion.setUsuario(usuario);
                relacion.setRolEnEquipo("INTEGRANTE");
                relacion.setFechaUnion(LocalDate.now());
                equipoUsuarioRepository.save(relacion);
            }

            if (proyecto != null) {
                proyecto.setEquipo(equipoRef);
                proyecto.setLider(lider);
                proyectoRepository.save(proyecto);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("idEquipo", equipo.getIdEquipo());
            response.put("nombreEquipo", nombreEquipo);
            response.put("descripcion", dto.getDescripcion());
            response.put("logo", dto.getLogo());
            response.put("estatus", "ACTIVO");
            response.put("idLider", lider.getIdUsuario());
            response.put("integrantesIds", new ArrayList<>(idsUnicos));
            response.put("idProyecto", proyecto != null ? proyecto.getIdProyecto() : null);

            return ResponseEntity.ok(
                    new AppiResponse("Equipo creado correctamente con integrantes y líder", response, HttpStatus.OK)
            );

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AppiResponse("Error al crear equipo: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }
    @Transactional
    public ResponseEntity<AppiResponse> update(Long id, Equipo equipoRequest) {
        try {
            Optional<Equipo> equipoOpt = equipoRepository.findById(id);

            if (equipoOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new AppiResponse("Equipo no encontrado", HttpStatus.BAD_REQUEST));
            }

            Equipo equipoExistente = equipoOpt.get();

            if (equipoRequest.getNombreEquipo() == null || equipoRequest.getNombreEquipo().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(new AppiResponse("El nombre del equipo es obligatorio", HttpStatus.BAD_REQUEST));
            }

            String nuevoNombre = equipoRequest.getNombreEquipo().trim();

            Optional<Equipo> equipoMismoNombre = equipoRepository.findAll().stream()
                    .filter(e -> e.getNombreEquipo() != null)
                    .filter(e -> e.getNombreEquipo().equalsIgnoreCase(nuevoNombre))
                    .filter(e -> !Objects.equals(e.getIdEquipo(), id))
                    .findFirst();

            if (equipoMismoNombre.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new AppiResponse("Ya existe un equipo con ese nombre", HttpStatus.BAD_REQUEST));
            }

            Long nuevoProyectoId = extraerProyectoId(equipoRequest);
            Long nuevoLiderId = extraerLiderId(equipoRequest);
            Set<Long> nuevosMiembrosIds = extraerMiembrosIds(equipoRequest);

            if (nuevoLiderId == null) {
                return ResponseEntity.badRequest()
                        .body(new AppiResponse("Debes seleccionar un líder", HttpStatus.BAD_REQUEST));
            }

            if (nuevosMiembrosIds.contains(nuevoLiderId)) {
                return ResponseEntity.badRequest()
                        .body(new AppiResponse("El líder no debe ir también en integrantes", HttpStatus.BAD_REQUEST));
            }

            Optional<Usuario> nuevoLiderOpt = usuarioRepository.findById(nuevoLiderId);
            if (nuevoLiderOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new AppiResponse("El líder seleccionado no existe", HttpStatus.BAD_REQUEST));
            }

            Usuario nuevoLider = nuevoLiderOpt.get();
            Proyecto nuevoProyecto = null;

            if (nuevoProyectoId != null) {
                Optional<Proyecto> nuevoProyectoOpt = proyectoRepository.findById(nuevoProyectoId);
                if (nuevoProyectoOpt.isEmpty()) {
                    return ResponseEntity.badRequest()
                            .body(new AppiResponse("El proyecto seleccionado no existe", HttpStatus.BAD_REQUEST));
                }
                nuevoProyecto = nuevoProyectoOpt.get();
            }

            for (Long miembroId : nuevosMiembrosIds) {
                if (usuarioRepository.findById(miembroId).isEmpty()) {
                    return ResponseEntity.badRequest()
                            .body(new AppiResponse("Uno de los integrantes seleccionados no existe", HttpStatus.BAD_REQUEST));
                }
            }

            List<EquipoUsuario> relacionesActuales = equipoUsuarioRepository.findByEquipoIdEquipo(id);

            Set<Long> usuariosNuevosDelEquipo = new HashSet<>(nuevosMiembrosIds);
            usuariosNuevosDelEquipo.add(nuevoLiderId);

            for (Long usuarioId : usuariosNuevosDelEquipo) {
                List<EquipoUsuario> relacionesUsuario = equipoUsuarioRepository.findByUsuarioIdUsuario(usuarioId);

                boolean perteneceAOtroEquipo = relacionesUsuario.stream()
                        .anyMatch(rel -> !Objects.equals(rel.getEquipo().getIdEquipo(), id));

                if (perteneceAOtroEquipo) {
                    Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);
                    String username = usuarioOpt.map(Usuario::getUsername).orElse("usuario");
                    return ResponseEntity.badRequest()
                            .body(new AppiResponse(
                                    "El usuario " + username + " ya pertenece a otro equipo",
                                    HttpStatus.BAD_REQUEST
                            ));
                }
            }

            if (nuevoProyecto != null &&
                    nuevoProyecto.getEquipo() != null &&
                    !Objects.equals(nuevoProyecto.getEquipo().getIdEquipo(), id)) {
                return ResponseEntity.badRequest()
                        .body(new AppiResponse("El proyecto ya está asignado a otro equipo", HttpStatus.BAD_REQUEST));
            }

            List<Proyecto> proyectosConEquipoActual = proyectoRepository.findAll().stream()
                    .filter(p -> p.getEquipo() != null)
                    .filter(p -> Objects.equals(p.getEquipo().getIdEquipo(), id))
                    .toList();

            equipoExistente.setNombreEquipo(nuevoNombre);
            equipoExistente.setDescripcion(equipoRequest.getDescripcion());
            equipoExistente.setLogo(equipoRequest.getLogo());

            if (equipoRequest.getEstatus() != null && !equipoRequest.getEstatus().isBlank()) {
                equipoExistente.setEstatus(equipoRequest.getEstatus());
            } else if (equipoExistente.getEstatus() == null || equipoExistente.getEstatus().isBlank()) {
                equipoExistente.setEstatus("ACTIVO");
            }

            equipoRepository.save(equipoExistente);

            for (Proyecto p : proyectosConEquipoActual) {
                if (nuevoProyectoId == null || !Objects.equals(p.getIdProyecto(), nuevoProyectoId)) {
                    p.setEquipo(null);
                    if (p.getLider() != null && Objects.equals(p.getLider().getIdUsuario(), nuevoLiderId)) {
                        p.setLider(null);
                    }
                    proyectoRepository.save(p);
                }
            }

            if (nuevoProyecto != null) {
                nuevoProyecto.setEquipo(equipoExistente);
                nuevoProyecto.setLider(nuevoLider);
                proyectoRepository.save(nuevoProyecto);
            }

            equipoUsuarioRepository.deleteAll(relacionesActuales);

            EquipoUsuario relacionLider = new EquipoUsuario();
            relacionLider.setEquipo(equipoExistente);
            relacionLider.setUsuario(nuevoLider);
            relacionLider.setRolEnEquipo("LIDER");
            relacionLider.setFechaUnion(LocalDate.now());
            equipoUsuarioRepository.save(relacionLider);

            for (Long miembroId : nuevosMiembrosIds) {
                Usuario miembro = usuarioRepository.findById(miembroId).get();

                EquipoUsuario relacion = new EquipoUsuario();
                relacion.setEquipo(equipoExistente);
                relacion.setUsuario(miembro);
                relacion.setRolEnEquipo("INTEGRANTE");
                relacion.setFechaUnion(LocalDate.now());
                equipoUsuarioRepository.save(relacion);
            }

            return ResponseEntity.ok(
                    new AppiResponse("Equipo actualizado correctamente", equipoExistente, HttpStatus.OK)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AppiResponse("Error al actualizar equipo: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Transactional
    public ResponseEntity<AppiResponse> delete(Long id) {
        try {
            Optional<Equipo> equipoOpt = equipoRepository.findById(id);

            if (equipoOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new AppiResponse("Equipo no encontrado", HttpStatus.BAD_REQUEST));
            }

            Equipo equipo = equipoOpt.get();
            equipo.setEstatus("INACTIVO");
            equipoRepository.save(equipo);

            return ResponseEntity.ok(
                    new AppiResponse("Equipo desactivado correctamente", HttpStatus.OK)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AppiResponse("Error al eliminar equipo: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Transactional(readOnly = true)
    public ResponseEntity<AppiResponse> findDisponiblesParaProyecto() {
        try {
            List<Equipo> equiposDisponibles = equipoRepository.findAll()
                    .stream()
                    .filter(equipo -> "ACTIVO".equalsIgnoreCase(equipo.getEstatus()))
                    .filter(equipo ->
                            !proyectoRepository.existsByEquipoIdEquipoAndEstadoNotIgnoreCase(
                                    equipo.getIdEquipo(),
                                    "CANCELADO"
                            )
                    )
                    .toList();

            return ResponseEntity.ok(
                    new AppiResponse(
                            "Equipos disponibles para proyecto obtenidos correctamente",
                            equiposDisponibles,
                            HttpStatus.OK
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AppiResponse("Error al obtener equipos disponibles: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    private Long extraerProyectoId(Equipo equipoRequest) {
        try {
            Object proyectoObj = equipoRequest.getClass().getMethod("getProyecto").invoke(equipoRequest);
            if (proyectoObj == null) return null;
            Object idProyecto = proyectoObj.getClass().getMethod("getIdProyecto").invoke(proyectoObj);
            return idProyecto != null ? Long.valueOf(String.valueOf(idProyecto)) : null;
        } catch (Exception e) {
            return null;
        }
    }

    private Long extraerLiderId(Equipo equipoRequest) {
        try {
            Object liderObj = equipoRequest.getClass().getMethod("getLider").invoke(equipoRequest);
            if (liderObj == null) return null;
            Object idUsuario = liderObj.getClass().getMethod("getIdUsuario").invoke(liderObj);
            return idUsuario != null ? Long.valueOf(String.valueOf(idUsuario)) : null;
        } catch (Exception e) {
            return null;
        }
    }

    private Set<Long> extraerMiembrosIds(Equipo equipoRequest) {
        Set<Long> ids = new HashSet<>();

        try {
            Object miembrosObj = equipoRequest.getClass().getMethod("getMiembros").invoke(equipoRequest);
            if (miembrosObj instanceof List<?> lista) {
                for (Object item : lista) {
                    try {
                        Object idUsuario = item.getClass().getMethod("getIdUsuario").invoke(item);
                        if (idUsuario != null) {
                            ids.add(Long.valueOf(String.valueOf(idUsuario)));
                        }
                    } catch (Exception ignored) {
                    }
                }
            }
        } catch (Exception ignored) {
        }

        return ids;
    }
}