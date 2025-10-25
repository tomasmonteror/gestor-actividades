// src/pages/PasswordResetConfirmPage.jsx
import React, { useState, useEffect } from 'react';
import { confirmNewPassword } from '../firebase/auth';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PasswordResetConfirmPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get('oobCode');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidCode, setIsValidCode] = useState(false);

  useEffect(() => {
    if (oobCode) setIsValidCode(true);
    else {
      setError("No se encontró un código de restablecimiento válido en la URL.");
      setIsValidCode(false);
    }
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      if (!oobCode) throw new Error("Código de restablecimiento no encontrado.");
      await confirmNewPassword(oobCode, newPassword);
      setMessage('¡Contraseña restablecida con éxito! Serás redirigido al inicio de sesión.');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err) {
      console.error(err);
      switch (err.code) {
        case "auth/expired-action-code":
          setError("El código ha expirado o ya fue usado. Solicita uno nuevo.");
          break;
        case "auth/invalid-action-code":
          setError("El código de restablecimiento no es válido.");
          break;
        case "auth/user-disabled":
          setError("Tu cuenta ha sido deshabilitada.");
          break;
        case "auth/weak-password":
          setError("La contraseña es demasiado débil. Mínimo 6 caracteres.");
          break;
        default:
          setError(`Error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidCode) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#f3f4f6",
        padding: "1rem"
      }}>
        <div style={{
          maxWidth: "400px",
          width: "100%",
          backgroundColor: "white",
          borderRadius: "1rem",
          padding: "2rem",
          boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb",
          textAlign: "center"
        }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Error de Restablecimiento</h2>
          <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>
          <p style={{ marginBottom: "1.5rem" }}>Por favor, vuelve a solicitar un enlace de restablecimiento de contraseña.</p>
          <button
            onClick={() => navigate('/request-password-reset')}
            style={{
              padding: "0.75rem 1rem",
              backgroundColor: "#0d9488",
              color: "white",
              fontWeight: 600,
              fontSize: "1rem",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer"
            }}
          >
            Solicitar nuevo enlace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      paddingTop: "9vh",
      fontFamily: "Inter, sans-serif",
      backgroundColor: "#f3f4f6"
    }}>
      <div style={{
        maxWidth: "400px",
        width: "100%",
        backgroundColor: "white",
        borderRadius: "1rem",
        boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
        border: "1px solid #e5e7eb",
        padding: "2rem"
      }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Establecer Nueva Contraseña</h2>
        <p style={{ marginBottom: "1.5rem" }}>Introduce tu nueva contraseña.</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            type="password"
            placeholder="Nueva contraseña (mínimo 6 caracteres)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{ padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #d1d5db", outline: "none" }}
          />
          <input
            type="password"
            placeholder="Confirmar nueva contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #d1d5db", outline: "none" }}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "0.75rem",
              backgroundColor: "#0d9488",
              color: "white",
              fontWeight: 600,
              border: "none",
              borderRadius: "0.5rem",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
            }}
          >
            {isLoading ? "Procesando..." : "Restablecer contraseña"}
          </button>
        </form>

        {message && <p style={{ color: "green", marginTop: "1rem" }}>{message}</p>}
        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
      </div>
    </div>
  );
};

export default PasswordResetConfirmPage;
