package utez.edu.mx.services.module.pago.dto;

import utez.edu.mx.services.module.categoriagasto.CategoriaGasto;
import utez.edu.mx.services.module.equipo.dto.EquipoDTO;
import utez.edu.mx.services.module.pago.Pago;
import utez.edu.mx.services.module.usuario.dtos.UsuarioResumenDTO;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PagoDTO {

    private Long idPago;
    private String concepto;
    private String descripcion;
    private BigDecimal monto;
    private BigDecimal horas;
    private BigDecimal tarifa;
    private String formaPago;
    private String periodo;
    private LocalDate fechaPago;
    private String estatus;

    // Del proyecto solo se necesita id y nombre para mostrarlo en tabla/modal
    private Long idProyecto;
    private String nombreProyecto;

    // Del equipo del proyecto, solo id y nombre
    private EquipoDTO equipo;

    // De la categoría solo id y nombre
    private Long idCategoria;
    private String nombreCategoria;

    // Del usuario que recibe el pago: solo datos básicos, sin datos sensibles
    private UsuarioResumenDTO usuario;

    // Del admin que registró el pago: solo datos básicos
    private UsuarioResumenDTO registradoPor;

    public PagoDTO() {}

    public PagoDTO(Pago pago) {
        this.idPago = pago.getIdPago();
        this.concepto = pago.getConcepto();
        this.descripcion = pago.getDescripcion();
        this.monto = pago.getMonto();
        this.horas = pago.getHoras();
        this.tarifa = pago.getTarifa();
        this.formaPago = pago.getFormaPago();
        this.periodo = pago.getPeriodo();
        this.fechaPago = pago.getFechaPago();
        this.estatus = pago.getEstatus();

        if (pago.getProyecto() != null) {
            this.idProyecto = pago.getProyecto().getIdProyecto();
            this.nombreProyecto = pago.getProyecto().getNombre();
            if (pago.getProyecto().getEquipo() != null) {
                this.equipo = new EquipoDTO(pago.getProyecto().getEquipo());
            }
        }

        if (pago.getCategoria() != null) {
            this.idCategoria = pago.getCategoria().getIdCategoria();
            this.nombreCategoria = pago.getCategoria().getNombre();
        }

        if (pago.getUsuario() != null) {
            this.usuario = new UsuarioResumenDTO(pago.getUsuario());
        }

        if (pago.getRegistradoPor() != null) {
            this.registradoPor = new UsuarioResumenDTO(pago.getRegistradoPor());
        }
    }

    public Long getIdPago() { return idPago; }
    public void setIdPago(Long idPago) { this.idPago = idPago; }

    public String getConcepto() { return concepto; }
    public void setConcepto(String concepto) { this.concepto = concepto; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }

    public BigDecimal getHoras() { return horas; }
    public void setHoras(BigDecimal horas) { this.horas = horas; }

    public BigDecimal getTarifa() { return tarifa; }
    public void setTarifa(BigDecimal tarifa) { this.tarifa = tarifa; }

    public String getFormaPago() { return formaPago; }
    public void setFormaPago(String formaPago) { this.formaPago = formaPago; }

    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }

    public LocalDate getFechaPago() { return fechaPago; }
    public void setFechaPago(LocalDate fechaPago) { this.fechaPago = fechaPago; }

    public String getEstatus() { return estatus; }
    public void setEstatus(String estatus) { this.estatus = estatus; }

    public Long getIdProyecto() { return idProyecto; }
    public void setIdProyecto(Long idProyecto) { this.idProyecto = idProyecto; }

    public String getNombreProyecto() { return nombreProyecto; }
    public void setNombreProyecto(String nombreProyecto) { this.nombreProyecto = nombreProyecto; }

    public EquipoDTO getEquipo() { return equipo; }
    public void setEquipo(EquipoDTO equipo) { this.equipo = equipo; }

    public Long getIdCategoria() { return idCategoria; }
    public void setIdCategoria(Long idCategoria) { this.idCategoria = idCategoria; }

    public String getNombreCategoria() { return nombreCategoria; }
    public void setNombreCategoria(String nombreCategoria) { this.nombreCategoria = nombreCategoria; }

    public UsuarioResumenDTO getUsuario() { return usuario; }
    public void setUsuario(UsuarioResumenDTO usuario) { this.usuario = usuario; }

    public UsuarioResumenDTO getRegistradoPor() { return registradoPor; }
    public void setRegistradoPor(UsuarioResumenDTO registradoPor) { this.registradoPor = registradoPor; }
}