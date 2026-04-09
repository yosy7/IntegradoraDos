package utez.edu.mx.services.module.proyecto.dtos;



import utez.edu.mx.services.module.equipo.dto.EquipoDTO;
import utez.edu.mx.services.module.proyecto.Proyecto;
import utez.edu.mx.services.module.usuario.dtos.UsuarioResumenDTO;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ProyectoDTO {

    private Long idProyecto;
    private String nombre;
    private String descripcion;
    private String objetivo;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String estado;
    private BigDecimal presupuestoTotal;
    private String logo;

    // Solo datos básicos del equipo, sin exponer sus integrantes ni datos internos
    private EquipoDTO equipo;

    // Solo datos básicos del líder, sin datos sensibles
    private UsuarioResumenDTO lider;

    public ProyectoDTO() {}

    public ProyectoDTO(Proyecto proyecto) {
        this.idProyecto = proyecto.getIdProyecto();
        this.nombre = proyecto.getNombre();
        this.descripcion = proyecto.getDescripcion();
        this.objetivo = proyecto.getObjetivo();
        this.fechaInicio = proyecto.getFechaInicio();
        this.fechaFin = proyecto.getFechaFin();
        this.estado = proyecto.getEstado();
        this.presupuestoTotal = proyecto.getPresupuestoTotal();
        this.logo = proyecto.getLogo();

        if (proyecto.getEquipo() != null) {
            this.equipo = new EquipoDTO(proyecto.getEquipo());
        }

        if (proyecto.getLider() != null) {
            this.lider = new UsuarioResumenDTO(proyecto.getLider());
        }
    }

    public Long getIdProyecto() { return idProyecto; }
    public void setIdProyecto(Long idProyecto) { this.idProyecto = idProyecto; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getObjetivo() { return objetivo; }
    public void setObjetivo(String objetivo) { this.objetivo = objetivo; }

    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }

    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public BigDecimal getPresupuestoTotal() { return presupuestoTotal; }
    public void setPresupuestoTotal(BigDecimal presupuestoTotal) { this.presupuestoTotal = presupuestoTotal; }

    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }

    public EquipoDTO getEquipo() { return equipo; }
    public void setEquipo(EquipoDTO equipo) { this.equipo = equipo; }

    public UsuarioResumenDTO getLider() { return lider; }
    public void setLider(UsuarioResumenDTO lider) { this.lider = lider; }
}