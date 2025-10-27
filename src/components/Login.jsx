// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, register } from "../firebase/auth";
import { useAuth } from "../context/AuthContext";
import { LogIn, UserPlus, Mail, Lock, AlertTriangle, Loader } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        fontFamily: "Inter, sans-serif"
      }}>
        <Loader className="w-8 h-8 animate-spin" color="#0d9488" />
        <span style={{ marginLeft: "12px", fontSize: "1rem", color: "#374151" }}>
          Cargando autenticación...
        </span>
      </div>
    );
  }

  const handleSubmit = async (e, isRegisterOperation) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isRegisterOperation) await register(email, password);
      else await login(email, password);
      navigate("/tablero");
    } catch (e) {
        let newError = "";
        switch (e.code) {
          case "auth/invalid-email":
            newError = "El formato del email no es válido.";
            break;
          case "auth/user-disabled":
            newError = "Tu cuenta ha sido deshabilitada.";
            break;
          case "auth/user-not-found":
            newError = "El email no está registrado.";
            break;
          case "auth/wrong-password":
            newError = "Contraseña incorrecta.";
            break;
          case "auth/email-already-in-use":
            newError = "Este email ya está registrado.";
            break;
          case "auth/weak-password":
            newError = "La contraseña debe tener al menos 6 caracteres.";
            break;
          case "auth/invalid-credential":
            newError = "Email o contraseña incorrectos.";
            break;
          default:
            newError = "Error al iniciar sesión. Revisa tus credenciales.";
        }
        setError(newError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        backgroundColor: "#f3f4f6",
        fontFamily: "Inter, sans-serif",
        paddingTop: "9vh", // mueve el formulario un poco hacia arriba
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "1rem",
          boxShadow:
            "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
          width: "100%",
          maxWidth: "400px",
          padding: "2rem",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Encabezado */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.5rem",
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "1rem",
          }}
        >
          {isRegistering ? (
            <UserPlus size={32} color="#4f46e5" style={{ marginRight: "0.75rem" }} />
          ) : (
            <LogIn size={32} color="#0d9488" style={{ marginRight: "0.75rem" }} />
          )}
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1f2937" }}>
            {isRegistering ? "Registro de usuario" : "Iniciar sesión"}
          </h1>
        </div>

        {/* Formulario */}
        <form onSubmit={(e) => handleSubmit(e, isRegistering)}>
          {/* Email */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="email"
              style={{
                display: "flex",
                alignItems: "center",
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#374151",
                marginBottom: "0.25rem",
              }}
            >
              <Mail size={16} color="#0d9488" style={{ marginRight: "0.5rem" }} /> Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="tu.email@instituto.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>

          {/* Contraseña */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="password"
              style={{
                display: "flex",
                alignItems: "center",
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#374151",
                marginBottom: "0.25rem",
              }}
            >
              <Lock size={16} color="#4f46e5" style={{ marginRight: "0.5rem" }} /> Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="Contraseña (mínimo 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                backgroundColor: "#fee2e2",
                border: "1px solid #f87171",
                color: "#b91c1c",
                borderRadius: "0.5rem",
                padding: "0.75rem",
                display: "flex",
                alignItems: "center",
                fontSize: "0.875rem",
                marginBottom: "1rem",
              }}
            >
              <AlertTriangle size={18} style={{ marginRight: "0.5rem" }} />
              {error}
            </div>
          )}

          {/* Botón principal */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              backgroundColor: "#0d9488",
              color: "white",
              fontWeight: 600,
              fontSize: "1rem",
              padding: "0.75rem",
              border: "none",
              borderRadius: "0.5rem",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.7 : 1,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            {isSubmitting ? "Procesando..." : isRegistering ? "Registrarse" : "Entrar"}
          </button>
        </form>

        {/* Enlaces */}
        <div
          style={{
            textAlign: "center",
            fontSize: "0.9rem",
            color: "#6b7280",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "1rem",
            marginTop: "1.5rem",
          }}
        >
          {isRegistering ? (
            <p>
              ¿Ya tienes cuenta?{" "}
              <button
                onClick={() => {
                  setIsRegistering(false);
                  setError("");
                  setPassword("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#4f46e5",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Inicia sesión
              </button>
            </p>
          ) : (
            <>
              <p>
                ¿No tienes cuenta?{" "}
                <button
                  onClick={() => {
                    setIsRegistering(true);
                    setError("");
                    setPassword("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#4f46e5",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Regístrate
                </button>
              </p>
              <div style={{ marginTop: "0.75rem" }}>
                <Link
                  to="/request-password-reset"
                  style={{
                    fontSize: "0.8rem",
                    color: "#6b7280",
                    textDecoration: "none",
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
