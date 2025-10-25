// src/pages/PasswordResetRequestPage.jsx
import React, { useState } from 'react';
import { sendPasswordReset } from '../firebase/auth'; // Importamos la nueva función
import { useNavigate } from 'react-router-dom';

const PasswordResetRequestPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      await sendPasswordReset(email);
      setMessage('¡Éxito! Si tu email está registrado, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada (y la carpeta de spam).');
      setEmail(''); // Limpiar el campo
    } catch (err) {
      console.error("Error al solicitar restablecimiento:", err);
      if (err.code === "auth/invalid-email") {
        setError("El formato del email no es válido.");
      } else if (err.code === "auth/user-not-found") {
        // Por seguridad, Firebase dice que no se debe revelar si el email existe o no.
        // Por lo tanto, el mensaje de éxito es genérico, incluso si el email no existe.
        setMessage('Si tu email está registrado, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2>Restablecer Contraseña</h2>
      <p>Introduce tu dirección de correo electrónico para recibir un enlace de restablecimiento de contraseña.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}
        >
          {isLoading ? 'Enviando...' : 'Enviar Enlace de Restablecimiento'}
        </button>
      </form>
      {message && <p style={{ color: 'green', marginTop: '15px' }}>{message}</p>}
      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
      <p style={{ marginTop: '20px' }}>
        ¿Recordaste tu contraseña? <span onClick={() => navigate('/login')} style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>Iniciar Sesión</span>
      </p>
    </div>
  );
};

export default PasswordResetRequestPage;
