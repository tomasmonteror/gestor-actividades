// src/pages/PasswordResetConfirmPage.jsx
import React, { useState, useEffect } from 'react';
import { confirmNewPassword } from '../firebase/auth'; // Importamos la nueva función
import { useNavigate, useSearchParams } from 'react-router-dom'; // Para obtener el oobCode

const PasswordResetConfirmPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get('oobCode'); // Obtener el oobCode de la URL

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidCode, setIsValidCode] = useState(false); // Para verificar si el código es válido

  useEffect(() => {
    // Aquí puedes (opcionalmente) verificar la validez del oobCode con Firebase.
    // Firebase lo hace implícitamente en confirmPasswordReset, pero si quieres
    // mostrar un mensaje de "Código inválido" antes de que el usuario meta su contraseña,
    // podrías usar el método verifyPasswordResetCode(oobCode) de Firebase Auth.
    // Por simplicidad, lo omitimos y confiamos en confirmPasswordReset.
    if (oobCode) {
      setIsValidCode(true);
    } else {
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
    if (newPassword.length < 6) { // Validación de Firebase para contraseñas débiles
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      if (!oobCode) {
        throw new Error("Código de restablecimiento no encontrado.");
      }
      await confirmNewPassword(oobCode, newPassword);
      setMessage('¡Contraseña restablecida con éxito! Serás redirigido al inicio de sesión.');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000); // Redirigir después de 3 segundos
    } catch (err) {
      console.error("Error al confirmar nueva contraseña:", err);
      if (err.code === "auth/expired-action-code") {
        setError("El código de restablecimiento ha expirado o ya ha sido usado. Por favor, solicita uno nuevo.");
      } else if (err.code === "auth/invalid-action-code") {
        setError("El código de restablecimiento no es válido.");
      } else if (err.code === "auth/user-disabled") {
        setError("Tu cuenta ha sido deshabilitada.");
      } else if (err.code === "auth/weak-password") {
        setError("La contraseña es demasiado débil. Necesita al menos 6 caracteres.");
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidCode) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>Error de Restablecimiento</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <p>Por favor, vuelve a solicitar un enlace de restablecimiento de contraseña.</p>
        <button onClick={() => navigate('/request-password-reset')} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Solicitar nuevo enlace</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2>Establecer Nueva Contraseña</h2>
      <p>Introduce tu nueva contraseña.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="new-password" style={{ display: 'block', marginBottom: '5px' }}>Nueva Contraseña:</label>
          <input
            type="password"
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label htmlFor="confirm-password" style={{ display: 'block', marginBottom: '5px' }}>Confirmar Contraseña:</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite la nueva contraseña"
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}
        >
          {isLoading ? 'Estableciendo...' : 'Restablecer Contraseña'}
        </button>
      </form>
      {message && <p style={{ color: 'green', marginTop: '15px' }}>{message}</p>}
      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
    </div>
  );
};

export default PasswordResetConfirmPage;
