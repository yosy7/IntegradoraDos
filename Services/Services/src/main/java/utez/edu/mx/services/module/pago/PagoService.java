package utez.edu.mx.services.module.pago;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utez.edu.mx.services.kernel.AppiResponse;
import utez.edu.mx.services.module.categoriagasto.CategoriaGasto;
import utez.edu.mx.services.module.categoriagasto.CategoriaGastoRepository;
import utez.edu.mx.services.module.equipousuario.EquipoUsuario;
import utez.edu.mx.services.module.equipousuario.EquipoUsuarioRepository;
import utez.edu.mx.services.module.pago.dto.PagoDTO;
import utez.edu.mx.services.module.pago.dto.RealizarPagoDTO;
import utez.edu.mx.services.module.presupuesto.Presupuesto;
import utez.edu.mx.services.module.presupuesto.PresupuestoRepository;
import utez.edu.mx.services.module.proyecto.Proyecto;
import utez.edu.mx.services.module.proyecto.ProyectoRepository;
import utez.edu.mx.services.module.usuario.Usuario;
import utez.edu.mx.services.module.usuario.UsuarioRepository;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;

@Service
public class PagoService {

    private final PagoRepository pagoRepository;
    private final PresupuestoRepository presupuestoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProyectoRepository proyectoRepository;
    private final EquipoUsuarioRepository equipoUsuarioRepository;
    private final CategoriaGastoRepository categoriaGastoRepository;

    public PagoService(
            PagoRepository pagoRepository,
            PresupuestoRepository presupuestoRepository,
            UsuarioRepository usuarioRepository,
            ProyectoRepository proyectoRepository,
            EquipoUsuarioRepository equipoUsuarioRepository,
            CategoriaGastoRepository categoriaGastoRepository
    ) {
        this.pagoRepository = pagoRepository;
        this.presupuestoRepository = presupuestoRepository;
        this.usuarioRepository = usuarioRepository;
        this.proyectoRepository = proyectoRepository;
        this.equipoUsuarioRepository = equipoUsuarioRepository;
        this.categoriaGastoRepository = categoriaGastoRepository;
    }

    // ─── Helper: calcular días hábiles L-V entre dos fechas (inclusive) ───────
    // Respeta la fecha de inicio del usuario: si el usuario se unió a mitad del
    // periodo, solo se cuentan los días desde su fecha de unión.
    private BigDecimal calcularHorasHabiles(LocalDate inicioEfectivo, LocalDate finPeriodo) {
        int diasHabiles = 0;
        LocalDate cursor = inicioEfectivo;
        while (!cursor.isAfter(finPeriodo)) {
            DayOfWeek dow = cursor.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                diasHabiles++;
            }
            cursor = cursor.plusDays(1);
        }
        // 8 horas por día hábil
        return BigDecimal.valueOf(diasHabiles * 8L);
    }

    // ─── Helper: obtener o crear presupuesto automáticamente ─────────────────
    private Optional<Presupuesto> obtenerOCrearPresupuesto(Proyecto proyecto) {
        Optional<Presupuesto> presOpt =
                presupuestoRepository.findByProyectoIdProyecto(proyecto.getIdProyecto());
        if (presOpt.isPresent()) return presOpt;

        if (proyecto.getPresupuestoTotal() == null ||
                proyecto.getPresupuestoTotal().compareTo(BigDecimal.ZERO) <= 0) {
            return Optional.empty();
        }

        BigDecimal yaUtilizado = pagoRepository
                .findByProyectoIdProyecto(proyecto.getIdProyecto())
                .stream()
                .filter(p -> "PAGADO".equalsIgnoreCase(p.getEstatus()))
                .map(Pago::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Presupuesto nuevo = new Presupuesto();
        nuevo.setProyecto(proyecto);
        nuevo.setMontoAsignado(proyecto.getPresupuestoTotal());
        nuevo.setMontoUtilizado(yaUtilizado);
        nuevo.setMontoDisponible(proyecto.getPresupuestoTotal().subtract(yaUtilizado));
        nuevo.setFechaRegistro(LocalDate.now());
        return Optional.of(presupuestoRepository.save(nuevo));
    }

    // ─── Generación automática programada ────────────────────────────────────
    // Corre a las 00:01 del día 15 y del último día de cada mes
    @Scheduled(cron = "0 1 0 15 * *")
    public void generarPagosDia15() {
        System.out.println(">>> [SCHEDULER] Generando pagos día 15: " + LocalDate.now());
        generarPagosAutomaticos(LocalDate.now());
    }

    @Scheduled(cron = "0 1 0 L * *")
    public void generarPagosUltimoDia() {
        System.out.println(">>> [SCHEDULER] Generando pagos último día: " + LocalDate.now());
        generarPagosAutomaticos(LocalDate.now());
    }

    // Lógica central de generación automática
    @Transactional
    public void generarPagosAutomaticos(LocalDate hoy) {
        Optional<CategoriaGasto> categoriaOpt = categoriaGastoRepository.findByNombreIgnoreCase("NOMINA");
        if (categoriaOpt.isEmpty()) {
            System.out.println(">>> [SCHEDULER] WARN: No existe categoría NOMINA, saltando generación.");
            return;
        }

        int dia = hoy.getDayOfMonth();
        int ultimoDia = hoy.lengthOfMonth();
        boolean esQuincena1 = (dia == 15);

        // Inicio del periodo: quincena 1 = día 1, quincena 2 = día 16
        LocalDate inicioPeriodo = esQuincena1
                ? hoy.withDayOfMonth(1)
                : hoy.withDayOfMonth(16);

        // Periodo como string identificador: "YYYY-MM-15" o "YYYY-MM-{ultimoDia}"
        String periodo = hoy.getYear() + "-"
                + String.format("%02d", hoy.getMonthValue()) + "-"
                + (esQuincena1 ? "15" : String.valueOf(ultimoDia));

        // Obtener un usuario sistema (admin) para registradoPor
        Optional<Usuario> adminOpt = usuarioRepository.findAll().stream()
                .filter(u -> u.getRol() != null &&
                        "SUPERADMIN".equalsIgnoreCase(u.getRol().getNombre()))
                .findFirst();

        if (adminOpt.isEmpty()) {
            System.out.println(">>> [SCHEDULER] WARN: No hay SUPERADMIN para registrar pagos.");
            return;
        }
        Usuario admin = adminOpt.get();

        // Procesar todos los proyectos activos con equipo asignado
        List<Proyecto> proyectos = proyectoRepository.findAll().stream()
                .filter(p -> !"CANCELADO".equalsIgnoreCase(p.getEstado()))
                .filter(p -> p.getEquipo() != null)
                .toList();

        int totalGenerados = 0;

        for (Proyecto proyecto : proyectos) {
            List<EquipoUsuario> integrantes =
                    equipoUsuarioRepository.findByEquipoIdEquipo(proyecto.getEquipo().getIdEquipo());

            for (EquipoUsuario relacion : integrantes) {
                Usuario usuario = relacion.getUsuario();
                if (usuario == null || !"ACTIVO".equalsIgnoreCase(usuario.getEstatus())) continue;
                if (usuario.getSalario() == null ||
                        usuario.getSalario().compareTo(BigDecimal.ZERO) <= 0) continue;

                // Evitar duplicados
                boolean yaExiste = pagoRepository.existsByProyectoIdProyectoAndUsuarioIdUsuarioAndPeriodo(
                        proyecto.getIdProyecto(), usuario.getIdUsuario(), periodo);
                if (yaExiste) continue;

                // Calcular inicio efectivo: si el usuario se unió después del inicio del periodo,
                // se usa su fecha de unión. Así no se le pagan días que no trabajó.
                LocalDate fechaUnion = relacion.getFechaUnion();
                LocalDate inicioEfectivo = (fechaUnion != null && fechaUnion.isAfter(inicioPeriodo))
                        ? fechaUnion : inicioPeriodo;

                // Si la fecha de unión es después del fin del periodo, no se genera pago
                if (inicioEfectivo.isAfter(hoy)) continue;

                BigDecimal horas = calcularHorasHabiles(inicioEfectivo, hoy);
                BigDecimal tarifa = usuario.getSalario();
                BigDecimal monto = horas.multiply(tarifa);

                Pago pago = new Pago();
                pago.setProyecto(proyecto);
                pago.setUsuario(usuario);
                pago.setRegistradoPor(admin);
                pago.setCategoria(categoriaOpt.get());
                pago.setConcepto("Pago quincenal");
                pago.setDescripcion("Periodo " + periodo + " — " + horas + "h × $" + tarifa + "/h");
                pago.setHoras(horas);
                pago.setTarifa(tarifa);
                pago.setMonto(monto);
                pago.setFormaPago("TRANSFERENCIA");
                pago.setPeriodo(periodo);
                pago.setFechaPago(null);
                pago.setEstatus("PENDIENTE");

                pagoRepository.save(pago);
                totalGenerados++;
            }
        }

        System.out.println(">>> [SCHEDULER] Pagos generados: " + totalGenerados + " para periodo " + periodo);
    }

    // ─── Endpoint manual para forzar generación (útil para pruebas) ──────────
    @Transactional
    public ResponseEntity<AppiResponse> forzarGeneracion() {
        generarPagosAutomaticos(LocalDate.now());
        return ResponseEntity.ok(
                new AppiResponse("Generación de pagos ejecutada correctamente", HttpStatus.OK)
        );
    }

    // ─── Consultas ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ResponseEntity<AppiResponse> findAll() {
        List<PagoDTO> pagos = pagoRepository.findAll()
                .stream().map(PagoDTO::new).toList();
        return ResponseEntity.ok(new AppiResponse("Operación exitosa", pagos, HttpStatus.OK));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<AppiResponse> findById(Long id) {
        Optional<Pago> pagoOpt = pagoRepository.findById(id);
        if (pagoOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new AppiResponse("Pago no encontrado", HttpStatus.BAD_REQUEST));
        }
        return ResponseEntity.ok(
                new AppiResponse("Operación exitosa", new PagoDTO(pagoOpt.get()), HttpStatus.OK)
        );
    }

    @Transactional(readOnly = true)
    public ResponseEntity<AppiResponse> findMisPagos(String username) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(username);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new AppiResponse("Usuario no encontrado", HttpStatus.NOT_FOUND));
        }
        Usuario usuario = usuarioOpt.get();
        String rol = usuario.getRol() != null ? usuario.getRol().getNombre().toUpperCase() : "";

        List<PagoDTO> data = ("SUPERADMIN".equals(rol)
                ? pagoRepository.findAll().stream()
                : pagoRepository.findByUsuarioIdUsuario(usuario.getIdUsuario()).stream())
                .map(PagoDTO::new).toList();

        return ResponseEntity.ok(new AppiResponse("Operación exitosa", data, HttpStatus.OK));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<AppiResponse> findByProyecto(Long idProyecto) {
        List<PagoDTO> pagos = pagoRepository.findByProyectoIdProyecto(idProyecto)
                .stream().map(PagoDTO::new).toList();
        return ResponseEntity.ok(new AppiResponse("Operación exitosa", pagos, HttpStatus.OK));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<AppiResponse> findByUsuario(Long idUsuario) {
        List<PagoDTO> pagos = pagoRepository.findByUsuarioIdUsuario(idUsuario)
                .stream().map(PagoDTO::new).toList();
        return ResponseEntity.ok(new AppiResponse("Operación exitosa", pagos, HttpStatus.OK));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<AppiResponse> resumenPorProyecto(Long idProyecto) {
        List<Pago> pagos = pagoRepository.findByProyectoIdProyecto(idProyecto);

        BigDecimal totalPagado = pagos.stream()
                .filter(p -> "PAGADO".equalsIgnoreCase(p.getEstatus()))
                .map(Pago::getMonto).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPendiente = pagos.stream()
                .filter(p -> "PENDIENTE".equalsIgnoreCase(p.getEstatus()))
                .map(Pago::getMonto).reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> data = new HashMap<>();
        data.put("totalPagado", totalPagado);
        data.put("totalPendiente", totalPendiente);
        data.put("pagosRealizados", pagos.stream().filter(p -> "PAGADO".equalsIgnoreCase(p.getEstatus())).count());
        data.put("pagosPendientes", pagos.stream().filter(p -> "PENDIENTE".equalsIgnoreCase(p.getEstatus())).count());

        return ResponseEntity.ok(
                new AppiResponse("Resumen de pagos obtenido correctamente", data, HttpStatus.OK)
        );
    }

    // ─── Realizar pago individual (admin puede ajustar horas) ─────────────────

    @Transactional
    public ResponseEntity<AppiResponse> realizarPago(Long id, RealizarPagoDTO dto, String username) {
        Optional<Pago> pagoOpt = pagoRepository.findById(id);
        if (pagoOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new AppiResponse("Pago no encontrado", HttpStatus.BAD_REQUEST));
        }

        Optional<Usuario> registradorOpt = usuarioRepository.findByUsername(username);
        if (registradorOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new AppiResponse("Usuario autenticado no encontrado", HttpStatus.NOT_FOUND));
        }

        Pago pago = pagoOpt.get();

        if (!"PENDIENTE".equalsIgnoreCase(pago.getEstatus())) {
            return ResponseEntity.badRequest()
                    .body(new AppiResponse("Solo se pueden realizar pagos con estatus PENDIENTE", HttpStatus.BAD_REQUEST));
        }
        if ("CANCELADO".equalsIgnoreCase(pago.getProyecto().getEstado())) {
            return ResponseEntity.badRequest()
                    .body(new AppiResponse("No se puede pagar en un proyecto cancelado", HttpStatus.BAD_REQUEST));
        }

        // Si el admin ajustó las horas, recalcular. Si no, usar las del pago.
        BigDecimal horas = (dto.getHoras() != null && dto.getHoras().compareTo(BigDecimal.ZERO) > 0)
                ? dto.getHoras() : pago.getHoras();
        BigDecimal tarifa = pago.getTarifa(); // Siempre del salario registrado
        BigDecimal monto = horas.multiply(tarifa);

        if (tarifa.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest()
                    .body(new AppiResponse("El usuario no tiene salario registrado", HttpStatus.BAD_REQUEST));
        }

        Optional<Presupuesto> presupuestoOpt = obtenerOCrearPresupuesto(pago.getProyecto());
        if (presupuestoOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new AppiResponse("El proyecto no tiene presupuesto asignado", HttpStatus.BAD_REQUEST));
        }

        Presupuesto presupuesto = presupuestoOpt.get();
        if (presupuesto.getMontoDisponible().compareTo(monto) < 0) {
            return ResponseEntity.badRequest()
                    .body(new AppiResponse("Presupuesto insuficiente. Disponible: $" + presupuesto.getMontoDisponible(),
                            HttpStatus.BAD_REQUEST));
        }

        presupuesto.setMontoUtilizado(presupuesto.getMontoUtilizado().add(monto));
        presupuesto.setMontoDisponible(presupuesto.getMontoDisponible().subtract(monto));
        presupuestoRepository.save(presupuesto);

        pago.setHoras(horas);
        pago.setTarifa(tarifa);
        pago.setMonto(monto);
        pago.setDescripcion(dto.getDescripcion() != null ? dto.getDescripcion() : pago.getDescripcion());
        pago.setFormaPago("TRANSFERENCIA");
        pago.setFechaPago(LocalDate.now());
        pago.setEstatus("PAGADO");
        pago.setRegistradoPor(registradorOpt.get());

        return ResponseEntity.ok(new AppiResponse(
                "Pago realizado correctamente", new PagoDTO(pagoRepository.save(pago)), HttpStatus.OK
        ));
    }

    // ─── Realizar TODOS los pendientes de un proyecto automáticamente ─────────

    @Transactional
    public ResponseEntity<AppiResponse> realizarTodosPendientes(Long idProyecto, String username) {
        Optional<Usuario> registradorOpt = usuarioRepository.findByUsername(username);
        if (registradorOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new AppiResponse("Usuario autenticado no encontrado", HttpStatus.NOT_FOUND));
        }

        Optional<Proyecto> proyectoOpt = proyectoRepository.findById(idProyecto);
        if (proyectoOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new AppiResponse("Proyecto no encontrado", HttpStatus.BAD_REQUEST));
        }

        Optional<Presupuesto> presupuestoOpt = obtenerOCrearPresupuesto(proyectoOpt.get());
        if (presupuestoOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new AppiResponse("El proyecto no tiene presupuesto asignado", HttpStatus.BAD_REQUEST));
        }

        Presupuesto presupuesto = presupuestoOpt.get();
        List<Pago> pendientes = pagoRepository.findByProyectoIdProyecto(idProyecto)
                .stream()
                .filter(p -> "PENDIENTE".equalsIgnoreCase(p.getEstatus()))
                .toList();

        List<PagoDTO> pagados = new ArrayList<>();
        List<String> errores = new ArrayList<>();

        for (Pago pago : pendientes) {
            BigDecimal tarifa = pago.getTarifa();
            BigDecimal horas = pago.getHoras();
            BigDecimal monto = pago.getMonto();

            if (tarifa == null || tarifa.compareTo(BigDecimal.ZERO) <= 0) {
                errores.add(pago.getUsuario().getNombre() + ": sin salario registrado");
                continue;
            }

            // Si por alguna razón el monto es 0 pero hay horas, recalcular
            if (monto.compareTo(BigDecimal.ZERO) == 0 && horas.compareTo(BigDecimal.ZERO) > 0) {
                monto = horas.multiply(tarifa);
            }

            if (presupuesto.getMontoDisponible().compareTo(monto) < 0) {
                errores.add("Presupuesto insuficiente para " + pago.getUsuario().getNombre()
                        + " (necesita $" + monto + ")");
                continue;
            }

            presupuesto.setMontoUtilizado(presupuesto.getMontoUtilizado().add(monto));
            presupuesto.setMontoDisponible(presupuesto.getMontoDisponible().subtract(monto));

            pago.setMonto(monto);
            pago.setFormaPago("TRANSFERENCIA");
            pago.setFechaPago(LocalDate.now());
            pago.setEstatus("PAGADO");
            pago.setRegistradoPor(registradorOpt.get());

            pagados.add(new PagoDTO(pagoRepository.save(pago)));
        }

        presupuestoRepository.save(presupuesto);

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("pagados", pagados);
        resultado.put("errores", errores);
        resultado.put("totalPagados", pagados.size());

        return ResponseEntity.ok(new AppiResponse("Proceso completado", resultado, HttpStatus.OK));
    }

    // ─── CRUD básico ──────────────────────────────────────────────────────────

    @Transactional
    public ResponseEntity<AppiResponse> update(Long id, Pago pago) {
        Optional<Pago> existing = pagoRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new AppiResponse("Pago no encontrado", HttpStatus.BAD_REQUEST));
        }
        Pago p = existing.get();
        p.setConcepto(pago.getConcepto());
        p.setDescripcion(pago.getDescripcion());
        p.setMonto(pago.getMonto());
        p.setHoras(pago.getHoras());
        p.setTarifa(pago.getTarifa());
        p.setFormaPago(pago.getFormaPago());
        p.setPeriodo(pago.getPeriodo());
        p.setCategoria(pago.getCategoria());
        return ResponseEntity.ok(
                new AppiResponse("Pago actualizado", new PagoDTO(pagoRepository.save(p)), HttpStatus.OK)
        );
    }

    @Transactional
    public ResponseEntity<AppiResponse> cambiarEstatus(Long id, String estatus) {
        Optional<Pago> existing = pagoRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new AppiResponse("Pago no encontrado", HttpStatus.BAD_REQUEST));
        }
        existing.get().setEstatus(estatus);
        pagoRepository.save(existing.get());
        return ResponseEntity.ok(new AppiResponse("Estatus actualizado", HttpStatus.OK));
    }

    @Transactional
    public ResponseEntity<AppiResponse> delete(Long id) {
        Optional<Pago> existing = pagoRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new AppiResponse("Pago no encontrado", HttpStatus.BAD_REQUEST));
        }
        pagoRepository.deleteById(id);
        return ResponseEntity.ok(new AppiResponse("Pago eliminado", HttpStatus.OK));
    }
}