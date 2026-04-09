import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!!sessionStorage.getItem('token')){
            navigate("/auth/home");
          }
    })
// 
    return(<main className="d-flex align-items-center justify-content-center">
        <div className="card border-0 rounded-4 shadow" style={{width: 400}}>
            <div className="card-body">
                <p className="fw-bold">Inicio de sesión</p>
                <form action="" className="mt-4 row g-3">
                    <div className="col-12">
                        <label htmlFor="">Usuario</label>
                        <input type="text" className="form-control" />
                    </div>
                    <div className="col-12">
                        <label htmlFor="">Correo electrónico</label>
                        <input type="text" className="form-control" />
                    </div>
                    <div className="col-12">
                        <label htmlFor="">Contraseña</label>
                        <input type="password" className="form-control" />
                    </div>
                    <div className="col-12">
                        <label htmlFor="">Confirmar contraseña</label>
                        <input type="password" className="form-control" />
                    </div>
                    <div className="col-12 text-center">
                        <button className="btn btn-primary col-12">Registrarme</button>
                        <p className="mb-0 mt-3">
                            <Link to={"/login"}>¿Ya tienes cuenta? Inicia sesión aquí</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    </main>);
}