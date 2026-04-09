package utez.edu.mx.services.module.pago.dto;

import java.math.BigDecimal;

public class RealizarPagoDTO {

    private Long idPago;

    // Horas opcionales: si el admin las ajusta se recalcula, si no se usan las del pago
    private BigDecimal horas;

    private String descripcion;

    public RealizarPagoDTO() {}

    public Long getIdPago() { return idPago; }
    public void setIdPago(Long idPago) { this.idPago = idPago; }

    public BigDecimal getHoras() { return horas; }
    public void setHoras(BigDecimal horas) { this.horas = horas; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}