// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, register } from "../firebase/auth";
import { useAuth } from "../context/AuthContext";
import { LogIn, UserPlus, Mail, Lock, AlertTriangle, Loader } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Nuevo estado para deshabilitar el botón

  const navigate = useNavigate();
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader className="w-8 h-8 animate-spin text-teal-600" />
        <span className="ml-3 text-lg text-gray-700">Cargando estado de autenticación...</span>
      </div>
    );
  }

  const handleSubmit = async (e, isRegisterOperation) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isRegisterOperation) {
        await register(email, password);
      } else {
        await login(email, password);
      }

      // Si tiene éxito, AuthContext se actualizará y la redirección es suficiente
      navigate("/tablero"); 

    } catch (e) {
      console.error("Error en autenticación:", e.message);
      
      let newError = "";
      switch (e.code) {
        case "auth/invalid-email":
          newError = "El formato del email no es válido.";
          break;
        case "auth/user-disabled":
          newError = "Tu cuenta ha sido deshabilitada.";
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
          newError = "Email o contraseña incorrectos.";
          break;
        case "auth/email-already-in-use":
          newError = "Este email ya está registrado.";
          break;
        case "auth/weak-password":
          newError = "La contraseña debe tener al menos 6 caracteres.";
          break;
        default:
          newError = `Error: ${e.message}`;
      }
      setError(newError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-50 p-4">
      <div className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
        
        {/* Título */}
        <div className="flex items-center justify-center mb-6 border-b pb-4">
          {isRegistering ? (
            <UserPlus className="w-8 h-8 text-indigo-600 mr-3" />
          ) : (
            <LogIn className="w-8 h-8 text-teal-600 mr-3" />
          )}
          <h2 className="text-3xl font-bold text-gray-800">
            {isRegistering ? "Registro de Usuario" : "Iniciar Sesión"}
          </h2>
        </div>

        {/* Formulario */}
        <form onSubmit={(e) => handleSubmit(e, isRegistering)} className="space-y-6">
          
          {/* Campo Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Mail className="w-4 h-4 mr-1 text-teal-500" /> Email
            </label>
            <input
              id="email"
              placeholder="tu.email@instituto.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition duration-150"
              disabled={isSubmitting}
            />
          </div>

          {/* Campo Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Lock className="w-4 h-4 mr-1 text-indigo-500" /> Contraseña
            </label>
            <input
              id="password"
              placeholder="Contraseña (mínimo 6 caracteres)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 transition duration-150"
              disabled={isSubmitting}
            />
          </div>
          
          {/* Mensaje de Error */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center text-sm">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}
          
          {/* Botón Principal */}
          <button 
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-teal-600 hover:bg-teal-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader className="w-5 h-5 animate-spin mr-2" />
            ) : (
              isRegistering ? "Registrarse" : "Entrar"
            )}
          </button>
        </form>

        {/* Enlace para cambiar entre Login y Registro */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            {isRegistering ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(""); // Limpiar errores al cambiar de modo
                setPassword(""); // Limpiar contraseña al cambiar de modo
              }}
              className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150"
              disabled={isSubmitting}
            >
              {isRegistering ? "Inicia Sesión" : "Regístrate"}
            </button>
          </p>
          
          {/* Enlace de restablecimiento de contraseña (visible solo en Login) */}
          {!isRegistering && (
            <div className="mt-3">
              <Link
                to="/request-password-reset"
                className="text-xs font-medium text-gray-500 hover:text-gray-700 transition duration-150"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

