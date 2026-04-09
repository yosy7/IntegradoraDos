import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .recovery-root {
    font-family: 'Outfit', sans-serif;
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0d1f2d;
    position: relative;
    overflow: hidden;
  }

  .bg-canvas {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
  }

  .bg-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #0d1f2d 0%, #0f2d3a 40%, #0a2535 100%);
  }

  .bar {
    position: absolute;
    border-radius: 4px;
    transform-origin: left center;
    animation: barSlide linear infinite;
    opacity: 0;
  }

  @keyframes barSlide {
    0%   { opacity: 0; transform: translateX(-110vw) rotate(var(--rot)); }
    10%  { opacity: var(--max-opacity); }
    85%  { opacity: var(--max-opacity); }
    100% { opacity: 0; transform: translateX(110vw) rotate(var(--rot)); }
  }

  .bar-1  { width: 55vw; height: 6px;  top: 12%;  left: 0; background: #186466; --rot: -8deg;  --max-opacity: 0.9;  animation-duration: 6s;   animation-delay: 0s;   }
  .bar-2  { width: 70vw; height: 10px; top: 22%;  left: 0; background: #183C4F; --rot: -8deg;  --max-opacity: 0.8;  animation-duration: 8s;   animation-delay: 1s;   }
  .bar-3  { width: 40vw; height: 4px;  top: 35%;  left: 0; background: #e3e8ee; --rot: -8deg;  --max-opacity: 0.3;  animation-duration: 5s;   animation-delay: 2s;   }
  .bar-4  { width: 80vw; height: 14px; top: 48%;  left: 0; background: #184052; --rot: -8deg;  --max-opacity: 0.85; animation-duration: 9s;   animation-delay: 0.5s; }
  .bar-5  { width: 50vw; height: 6px;  top: 60%;  left: 0; background: #186466; --rot: -8deg;  --max-opacity: 0.7;  animation-duration: 7s;   animation-delay: 3s;   }
  .bar-6  { width: 65vw; height: 8px;  top: 72%;  left: 0; background: #183A4D; --rot: -8deg;  --max-opacity: 0.8;  animation-duration: 6.5s; animation-delay: 1.5s; }
  .bar-7  { width: 45vw; height: 5px;  top: 82%;  left: 0; background: #e3e8ee; --rot: -8deg;  --max-opacity: 0.25; animation-duration: 5.5s; animation-delay: 4s;   }
  .bar-8  { width: 75vw; height: 12px; top: 90%;  left: 0; background: #184052; --rot: -8deg;  --max-opacity: 0.8;  animation-duration: 8.5s; animation-delay: 2.5s; }
  .bar-9  { width: 60vw; height: 7px;  top: 6%;   left: 0; background: #186466; --rot: -8deg;  --max-opacity: 0.6;  animation-duration: 7.5s; animation-delay: 5s;   }
  .bar-10 { width: 35vw; height: 3px;  top: 42%;  left: 0; background: #e3e8ee; --rot: -8deg;  --max-opacity: 0.2;  animation-duration: 4.8s; animation-delay: 0.8s; }
  .bar-11 { width: 90vw; height: 16px; top: 55%;  left: 0; background: #0e2f3e; --rot: -8deg;  --max-opacity: 1;    animation-duration: 10s;  animation-delay: 3.5s; }
  .bar-12 { width: 42vw; height: 5px;  top: 18%;  left: 0; background: #186466; --rot: -8deg;  --max-opacity: 0.65; animation-duration: 5.8s; animation-delay: 6s;   }

  .bg-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(10,18,25,0.55) 100%);
  }

  /* ── Card ── */
  .recovery-card {
    position: relative;
    z-index: 10;
    width: 420px;
    animation: cardIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(28px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }

  .card-title {
    text-align: center;
    margin-bottom: 28px;
  }

  .card-title .brand {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #186466;
    margin-bottom: 6px;
  }

  .card-title h1 {
    font-size: 26px;
    font-weight: 700;
    color: #f0f4f8;
    letter-spacing: -0.3px;
  }

  .card-box {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 20px;
    padding: 36px 36px 32px;
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    box-shadow: 0 32px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04);
  }

  .card-box h2 {
    font-size: 18px;
    font-weight: 600;
    color: #f0f4f8;
    margin-bottom: 8px;
  }

  .card-box .subtitle {
    font-size: 13.5px;
    color: #627d8c;
    margin-bottom: 28px;
    line-height: 1.5;
  }

  /* ── Form ── */
  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: #8fa3b1;
    margin-bottom: 8px;
    letter-spacing: 0.02em;
  }

  .form-group input {
    width: 100%;
    padding: 12px 16px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 10px;
    color: #f0f4f8;
    font-family: 'Outfit', sans-serif;
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }

  .form-group input::placeholder {
    color: rgba(255,255,255,0.2);
  }

  .form-group input:focus {
    border-color: #186466;
    background: rgba(24,100,102,0.10);
    box-shadow: 0 0 0 3px rgba(24,100,102,0.18);
  }

  /* ── Botón ── */
  .btn-send {
    width: 100%;
    padding: 13px;
    margin-top: 8px;
    background: linear-gradient(135deg, #186466 0%, #184052 100%);
    color: #fff;
    font-family: 'Outfit', sans-serif;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.03em;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(24,100,102,0.35);
  }

  .btn-send::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
    pointer-events: none;
  }

  .btn-send:hover  { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(24,100,102,0.45); }
  .btn-send:active { transform: translateY(0);    box-shadow: 0 2px 10px rgba(24,100,102,0.3);  }

  /* ── Footer ── */
  .card-footer-text {
    text-align: center;
    margin-top: 20px;
    font-size: 13px;
    color: #627d8c;
  }

  .card-footer-text a {
    color: #186466;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }
  .card-footer-text a:hover { color: #20a0a4; }
`;
export default function PasswordRecovery() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!!sessionStorage.getItem("token")) {
      navigate("/auth/home");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/sgp-api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email })
      });

      const data = await response.json();
      setMessage(data.message); // aquí se muestra "Correo enviado" o "No existe un usuario con ese correo"
    } catch (error) {
      setMessage("Error al enviar la solicitud.");
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="recovery-root">

        {/* Fondo animado */}
        <div className="bg-canvas">
          <div className="bg-gradient" />
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className={`bar bar-${i + 1}`} />
          ))}
          <div className="bg-overlay" />
        </div>

        {/* Card principal */}
        <div className="recovery-card">
          <div className="card-title">
            <p className="brand">Sistema de Gestión</p>
            <h1>Recuperar contraseña</h1>
          </div>

          <div className="card-box">
            <h2>¿Olvidaste tu contraseña?</h2>
            <p className="subtitle">
              Ingresa tu correo y te enviaremos un enlace para restablecerla.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Correo electrónico</label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-send">
                Enviar correo
              </button>
            </form>

            {/* Mensaje dinámico */}
            {message && <p style={{ marginTop: "15px", color: "#f0f4f8" }}>{message}</p>}
          </div>

          <p className="card-footer-text">
            <Link to="/login">← Regresar al login</Link>
          </p>
        </div>
      </div>
    </>
  );
}