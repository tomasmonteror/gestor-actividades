// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom'; // Importamos Navigate y Outlet
import { useAuth } from '../context/AuthContext'; // Importamos el hook useAuth

const PrivateRoute = ({ children, requiredRoles }) => {
  const { currentUser, currentRole, loading } = useAuth();

  // 1. Manejar el estado de carga inicial del contexto
  if (loading) {
    // Puedes renderizar un spinner o un mensaje de carga mientras se verifica la autenticación
    return <div>Cargando...</div>;
  }

  // 2. Verificar si hay un usuario autenticado
  if (!currentUser) {
    // Si no hay usuario, redirigir a la página de login
    return <Navigate to="/login" replace />;
  }

  // 3. Verificar los roles requeridos (si se especifican)
  if (requiredRoles && requiredRoles.length > 0) {
    // Si el usuario no tiene un rol, o si su rol no está incluido en los roles requeridos
    if (!currentRole || !requiredRoles.includes(currentRole)) {
      // Redirigir a una página de "Acceso Denegado" o a la página principal
      // Depende de tu lógica. Aquí redirigimos al tablero principal y mostramos un mensaje.
      // Podrías tener una página específica como /unauthorized
      alert("No tienes permiso para crear actividades. Habla con Tomás para que te cambie a rol Profesor."); 
      // Podrías usar un Toast/Notification
      return <Navigate to="/tablero" replace />;
    }
  }

  // Si todas las verificaciones pasan, renderizar los componentes hijos de la ruta
  // `children` se usa cuando PrivateRoute es un componente que envuelve a otros
  // `Outlet` se usa cuando PrivateRoute es un elemento de una ruta anidada
  return children ? children : <Outlet />;
};

export default PrivateRoute;
