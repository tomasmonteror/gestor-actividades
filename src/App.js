import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import WeeklyCalendarPage from './pages/WeeklyCalendarPage';
import AddActivity from './pages/AddActivity';
import EditActivityPage from './pages/EditActivityPage';
import UserManagementPage from './pages/UserManagementPage';
import PasswordResetRequestPage from './pages/PasswordResetRequestPage';
import PasswordResetConfirmPage from './pages/PasswordResetConfirmPage';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './context/AuthContext';
import { logout } from './firebase/auth';

function App() {
  const { currentUser, currentRole, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      console.log("Sesión cerrada correctamente."); 
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen font-sans">
        <p className="text-gray-700 text-lg">Cargando aplicación...</p>
      </div>
    );
  }

  const navStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: "1rem",
    borderRadius: "0.75rem",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
    fontFamily: "Inter, sans-serif",
    margin: "1rem",
  };

  const menuLinksStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "0.5rem",
    flex: 1,
  };

  const linkStyle = {
    fontWeight: "600",
    color: "#047857",
    textDecoration: "none",
    transition: "all 150ms ease-in-out",
    padding: "0.4rem 0.8rem",
    borderRadius: "0.5rem",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    cursor: "pointer",
  };

  const linkHover = (e) => {
    e.currentTarget.style.backgroundColor = "#f3f4f6";
    e.currentTarget.style.color = "#065f46";
  };

  const linkLeave = (e) => {
    e.currentTarget.style.backgroundColor = "white";
    e.currentTarget.style.color = "#047857";
  };

  const logoutBtnStyle = {
    fontWeight: "600",
    backgroundColor: "#0d9488",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    cursor: "pointer",
    transition: "background-color 150ms ease-in-out",
  };

  const logoutHover = (e) => (e.currentTarget.style.backgroundColor = "#0f766e");
  const logoutLeave = (e) => (e.currentTarget.style.backgroundColor = "#0d9488");

  const userContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  // 🔹 Estilos condicionales para NavLink activo
  const activeLinkStyle = {
    backgroundColor: "#d1fae5",
    color: "#065f46",
    boxShadow: "0 0 0 2px #10b981 inset",
  };

  return (
    <Router>
      <div className="font-sans min-h-screen bg-gray-50">
        <nav style={navStyle}>
          <div style={menuLinksStyle}>
            <NavLink
              to="/"
              style={({ isActive }) => ({
                ...linkStyle,
                ...(isActive ? activeLinkStyle : {}),
              })}
              onMouseOver={linkHover}
              onMouseOut={linkLeave}
            >
              Inicio
            </NavLink>

            {!currentUser && (
              <NavLink
                to="/login"
                style={({ isActive }) => ({
                  ...linkStyle,
                  ...(isActive ? activeLinkStyle : {}),
                })}
                onMouseOver={linkHover}
                onMouseOut={linkLeave}
              >
                Login
              </NavLink>
            )}

            {currentUser && currentRole && (
              <NavLink
                to="/tablero"
                style={({ isActive }) => ({
                  ...linkStyle,
                  ...(isActive ? activeLinkStyle : {}),
                })}
                onMouseOver={linkHover}
                onMouseOut={linkLeave}
              >
                Tablero
              </NavLink>
            )}

            {currentUser && (currentRole === "admin" || currentRole === "teacher") && (
              <NavLink
                to="/add-activity"
                style={({ isActive }) => ({
                  ...linkStyle,
                  ...(isActive ? activeLinkStyle : {}),
                })}
                onMouseOver={linkHover}
                onMouseOut={linkLeave}
              >
                Añadir Actividad
              </NavLink>
            )}

            {currentUser && currentRole === "admin" && (
              <NavLink
                to="/manage-users"
                style={({ isActive }) => ({
                  ...linkStyle,
                  ...(isActive ? activeLinkStyle : {}),
                })}
                onMouseOver={linkHover}
                onMouseOut={linkLeave}
              >
                Gestión de Usuarios
              </NavLink>
            )}
          </div>

          <div style={userContainerStyle}>
            {currentUser ? (
              <>
                <span className="text-gray-700">
                  Hola, {currentUser.email} ({currentRole})
                </span>
                <button
                  onClick={handleLogout}
                  style={logoutBtnStyle}
                  onMouseOver={logoutHover}
                  onMouseOut={logoutLeave}
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <span className="text-gray-500">No logueado</span>
            )}
          </div>
        </nav>

        <main className="p-4 sm:p-6">
          <Routes>
            <Route
              path="/"
              element={
                <h2 className="text-2xl font-bold text-gray-800 text-center mt-6">
                  Bienvenido a la gestión de actividades del instituto
                </h2>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route
              path="/tablero"
              element={
                <PrivateRoute>
                  <WeeklyCalendarPage currentUser={currentUser} currentRole={currentRole} />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-activity"
              element={
                <PrivateRoute requiredRoles={["admin", "teacher"]}>
                  <AddActivity />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-activity/:activityId"
              element={
                <PrivateRoute requiredRoles={["admin", "teacher"]}>
                  <EditActivityPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-users"
              element={
                <PrivateRoute requiredRoles={["admin"]}>
                  <UserManagementPage />
                </PrivateRoute>
              }
            />
            <Route path="/request-password-reset" element={<PasswordResetRequestPage />} />
            <Route path="/confirm-password-reset" element={<PasswordResetConfirmPage />} />
            <Route
              path="*"
              element={
                <h2 className="text-2xl font-bold text-red-600 text-center mt-6">
                  404 - Página no encontrada
                </h2>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
