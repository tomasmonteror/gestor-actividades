// src/pages/PasswordResetRequestPage.jsx
import React, { useState } from "react";
import { sendPasswordReset } from "../firebase/auth";
import { useNavigate } from "react-router-dom";

const PasswordResetRequestPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      await sendPasswordReset(email);
      setMessage(
        "✅ Si tu email está registrado, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada (y spam)."
      );
      setEmail("");
    } catch (err) {
      console.error("Error al solicitar restablecimiento:", err);
      if (err.code === "auth/invalid-email") {
        setError("El formato del email no es válido.");
      } else if (err.code === "auth/user-not-found") {
        setMessage(
          "Si tu email está registrado, recibirás un enlace para restablecer tu contraseña."
        );
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
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
        paddingTop: "9vh", // igual que el Login.jsx
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
          textAlign: "center",
        }}
      >
        {/* Encabezado */}
        <div
          style={{
            marginBottom: "1.5rem",
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "1rem",
          }}
        >
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "#1f2937",
            }}
          >
            Restablecer contraseña
          </h1>
        </div>

        <p
          style={{
            color: "#6b7280",
            fontSize: "0.95rem",
            marginBottom: "1.5rem",
          }}
        >
          Introduce tu correo electrónico para recibir un enlace de restablecimiento.
        </p>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem", textAlign: "left" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#374151",
                marginBottom: "0.25rem",
              }}
            >
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={isLoading}
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

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              backgroundColor: "#0d9488",
              color: "white",
              fontWeight: 600,
              fontSize: "1rem",
              padding: "0.75rem",
              border: "none",
              borderRadius: "0.5rem",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              marginTop: "0.5rem",
            }}
          >
            {isLoading ? "Enviando..." : "Enviar enlace de restablecimiento"}
          </button>
        </form>

        {/* Mensajes */}
        {message && (
          <p
            style={{
              color: "#059669",
              fontSize: "0.9rem",
              marginTop: "1rem",
              textAlign: "left",
            }}
          >
            {message}
          </p>
        )}
        {error && (
          <p
            style={{
              color: "#dc2626",
              fontSize: "0.9rem",
              marginTop: "1rem",
              textAlign: "left",
            }}
          >
            {error}
          </p>
        )}

        {/* Enlace volver */}
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
          <button
            onClick={() => navigate("/login")}
            style={{
              background: "none",
              border: "none",
              color: "#4f46e5",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ← Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetRequestPage;
