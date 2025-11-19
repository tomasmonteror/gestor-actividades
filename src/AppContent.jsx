import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
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
import logo from './assets/Logo.png'; // ← logo del centro

function AppContent() {
  const { currentUser, currentRole, loading } = useAuth();
  const location = useLocation();

  const isAddPage = location.pathname.includes('/add-activity');
  const isEditPage = location.pathname.includes('/edit-activity');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const navStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: "0.75rem 1.5rem",
    borderRadius: "0.75rem",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
    fontFamily: "Inter, sans-serif"
  };

  const leftSectionStyle = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  };

  const logoStyle = {
    height: "60px",
    width: "auto",
  };

  const titleStyle = {
    fontWeight: "700",
    fontSize: "1.1rem",
    color: "#047857",
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

  const activeLinkStyle = {
    backgroundColor: "#d1fae5",
    color: "#065f46",
    boxShadow: "0 0 0 2px #10b981 inset",
  };

  const linkHover = (e) => (e.currentTarget.style.backgroundColor = "#f3f4f6");
  const linkLeave = (e) => (e.currentTarget.style.backgroundColor = "white");

  if (loading) return <p>Cargando aplicación...</p>;

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      <nav style={navStyle}>
        {/* Logo + título */}
        <div style={leftSectionStyle}>
          <img src={logo} alt="Logo IES Augustóbriga" style={logoStyle} />
          <span style={titleStyle}>GESTOR DE ACTIVIDADES</span>
        </div>

        {/* Menú */}
        <div style={menuLinksStyle}>
          {location.pathname !== "/login" && (
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
              to={isEditPage ? location.pathname : "/add-activity"}
              style={() => ({
                ...linkStyle,
                ...(isAddPage || isEditPage ? activeLinkStyle : {}),
              })}
              onMouseOver={linkHover}
              onMouseOut={linkLeave}
            >
              {isEditPage ? "Editar Actividad" : "Añadir Actividad"}
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

      {/* Usuario logueado o botón de login */}
      {location.pathname !== "/login" && (
        currentUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontWeight: "600", color: "#047857" }}>
                {currentUser.displayName || currentUser.email}
              </span>
              <br />
              <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                {currentRole === "admin"
                  ? "Administrador"
                  : currentRole === "teacher"
                  ? "Profesor"
                  : "Invitado"}
              </span>
            </div>

            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "#0d9488",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                fontWeight: "600",
                boxShadow: "0 4px 6px rgba(0,0,0,0.08)",
                cursor: "pointer",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0f766e")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#0d9488")}
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            style={{
              backgroundColor: "#047857",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              fontWeight: "600",
              textDecoration: "none",
              boxShadow: "0 4px 6px rgba(0,0,0,0.08)",
              cursor: "pointer",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#065f46")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#047857")}
          >
            Iniciar sesión
          </NavLink>
        )
      )}


      </nav>

      <main className="p-4 sm:p-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/tablero"
            element={
              
                <WeeklyCalendarPage />
              
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
            path="/"
            element={
              currentUser ? (
                <WeeklyCalendarPage />
              ) : (
                <Login />
              )
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default AppContent;
