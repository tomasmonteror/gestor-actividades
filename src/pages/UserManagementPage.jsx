import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.js'; 
import { getUsers, updateUserRole, deleteUser } from '../firebase/firestore.js'; 
import { useNavigate } from 'react-router-dom';

const UserManagementPage = () => {
  const { currentUser, currentRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingRole, setSavingRole] = useState(null);

  const roles = ['student', 'teacher', 'admin'];

  const translateRole = (role) => {
    if (role === 'teacher') return 'Profesor';
    if (role === 'student') return 'Invitado';
    if (role === 'admin') return 'Administrador';
    return role;
  };

  useEffect(() => {
    if (!authLoading && currentRole !== 'admin') {
      console.error("Acceso denegado. Esta página es solo para administradores.");
      navigate('/calendar', { replace: true });
    }
  }, [authLoading, currentRole, navigate]);

  const fetchUsers = useCallback(async () => {
    if (currentRole !== 'admin') return;

    setPageLoading(true);
    setError(null);
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setError("Error al cargar la lista de usuarios.");
    } finally {
      setPageLoading(false);
    }
  }, [currentRole]);

  useEffect(() => {
    if (currentRole === 'admin') {
      fetchUsers();
    }
  }, [currentRole, fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    if (currentRole !== 'admin') {
      console.error("Operación denegada. Solo administradores pueden cambiar roles.");
      return;
    }

    const user = users.find((u) => u.id === userId);
    if (!user) return;
    if (!newRole || newRole === user.role) return;

    if (user.role === 'admin') {
      alert("⚠️ No se puede modificar el rol del administrador principal.");
      return;
    }

    if (userId === currentUser.uid && newRole !== 'admin') {
      if (
        !window.confirm(
          "¡Cuidado! Estás intentando quitarte el rol de administrador. Asegúrate de que haya al menos otro administrador activo antes de continuar. ¿Confirmas el cambio?"
        )
      ) {
        return;
      }
    }

    setSavingRole(userId);
    setError(null);
    try {
      await updateUserRole(userId, newRole);
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      alert(`✅ El rol del usuario "${user.email}" se ha actualizado correctamente a "${translateRole(newRole)}".`);
    } catch (err) {
      console.error("Error al actualizar el rol:", err);
      setError("Error al actualizar el rol. Revise la consola.");
    } finally {
      setSavingRole(null);
    }
  };

  const handleDeleteUser = async (userId, email) => {
  if (!window.confirm(`¿Seguro que deseas eliminar al usuario ${email}?`)) return;

  try {
    await deleteUser(userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    alert(`Usuario ${email} eliminado correctamente.`);
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    alert("Error al eliminar usuario.");
  }
};


  if (authLoading || pageLoading) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          fontSize: "1.25rem",
          fontWeight: "600",
          color: "#0d9488",
        }}
      >
        Cargando gestión de usuarios...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "1.5rem",
          backgroundColor: "#fee2e2",
          color: "#b91c1c",
          border: "1px solid #fca5a5",
          borderRadius: "0.75rem",
          maxWidth: "800px",
          margin: "2rem auto",
        }}
      >
        {error}
      </div>
    );
  }

  if (currentRole !== 'admin') return null;

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "2rem auto",
        padding: "2rem",
        backgroundColor: "white",
        borderRadius: "0.75rem",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "1.75rem",
          fontWeight: "800",
          color: "#0d9488",
          marginBottom: "1.5rem",
          borderBottom: "3px solid #99f6e4",
          paddingBottom: "0.5rem",
        }}
      >
        Gestión de Roles de Usuarios
      </h1>

      <p style={{ fontSize: "0.9rem", color: "#4b5563", marginBottom: "1.5rem" }}>
        Como <strong>Administrador</strong>, puedes gestionar los roles de otros usuarios.
      </p>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#ecfdf5", textAlign: "left" }}>
              <th style={{ padding: "0.6rem 0.5rem", fontSize: "0.75rem", color: "#047857", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Email / Nombre
              </th>
              <th style={{ padding: "0.6rem 0.5rem", fontSize: "0.75rem", color: "#047857", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Rol Actual
              </th>
              <th style={{ padding: "0.6rem 0.5rem", fontSize: "0.75rem", color: "#047857", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                style={{
                  backgroundColor: "white",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <td style={{ padding: "0.4rem 0.5rem", fontSize: "0.9rem", color: "#111827", width: "55%" }}>
                  {user.email || "N/A"}
                </td>
                <td style={{ padding: "0.4rem 0.5rem", fontSize: "0.9rem", color: "#374151", width: "20%" }}>
                  {translateRole(user.role)}
                </td>
                <td style={{ padding: "0.4rem 0.5rem", width: "25%" }}>
                  <select
                    value={user.role || "student"}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={savingRole === user.id}
                    style={{
                      padding: "0.3rem 0.5rem",
                      borderRadius: "0.5rem",
                      border: "1px solid #d1d5db",
                      outline: "none",
                      fontSize: "0.9rem",
                      color: "#374151",
                      backgroundColor: "white",
                      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
                      cursor: savingRole === user.id ? "not-allowed" : "pointer",
                    }}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {translateRole(role)}
                      </option>
                    ))}
                  </select>
                  {savingRole === user.id && (
                    <span style={{ marginLeft: "0.4rem", fontSize: "0.8rem", color: "#0f766e" }}>
                      Guardando...
                    </span>
                  )}

                  <button
                    onClick={() => handleDeleteUser(user.id, user.email)}
                    disabled={user.role === 'admin'}
                    style={{
                      padding: "0.3rem 0.6rem",
                      marginLeft: "0.6rem",
                      backgroundColor: user.role === "admin" ? "#9ca3af" : "#d64242",
                      color: "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      fontSize: "0.8rem",
                      cursor: user.role === "admin" ? "not-allowed" : "pointer",
                      opacity: user.role === "admin" ? 0.6 : 1,
                    }}
                  >
                    Eliminar
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementPage;
