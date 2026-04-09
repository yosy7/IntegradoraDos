package utez.edu.mx.services.module.usuario.dtos;

import utez.edu.mx.services.module.usuario.Usuario;

public class UsuarioResumenDTO {

    private Long idUsuario;
    private String nombre;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String rol;

    public UsuarioResumenDTO() {}

    public UsuarioResumenDTO(Usuario usuario) {
        this.idUsuario = usuario.getIdUsuario();
        this.nombre = usuario.getNombre();
        this.apellidoPaterno = usuario.getApellidoPaterno();
        this.apellidoMaterno = usuario.getApellidoMaterno();
        if (usuario.getRol() != null) {
            this.rol = usuario.getRol().getNombre();
        }
    }

    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellidoPaterno() { return apellidoPaterno; }
    public void setApellidoPaterno(String apellidoPaterno) { this.apellidoPaterno = apellidoPaterno; }

    public String getApellidoMaterno() { return apellidoMaterno; }
    public void setApellidoMaterno(String apellidoMaterno) { this.apellidoMaterno = apellidoMaterno; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
}