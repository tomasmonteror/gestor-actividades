import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.js'; 
import { getUsers, updateUserRole } from '../firebase/firestore.js'; 
import { useNavigate } from 'react-router-dom';

const UserManagementPage = () => {
    // Usamos 'currentUser' para la lógica de validación de auto-despromoción
    const { currentUser, currentRole, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState(null);
    const [savingRole, setSavingRole] = useState(null); // UID del usuario cuyo rol se está guardando

    const roles = ['student', 'teacher', 'admin'];

    // 1. Redirección si no es Administrador
    useEffect(() => {
        if (!authLoading && currentRole !== 'admin') {
            console.error("Acceso denegado. Esta página es solo para administradores.");
            navigate('/calendar', { replace: true });
        }
    }, [authLoading, currentRole, navigate]);

    // 2. Carga de Usuarios
    const fetchUsers = useCallback(async () => {
        if (currentRole !== 'admin') return; 
        
        setPageLoading(true);
        setError(null);
        try {
            // Llama a la función getUsers para obtener la lista de perfiles de usuario
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

    // 3. Manejo del Cambio de Rol
    const handleRoleChange = async (userId, newRole) => {
        if (currentRole !== 'admin') {
            console.error("Operación denegada. Solo administradores pueden cambiar roles.");
            return;
        }

        // Lógica de validación: prevenir auto-despromoción (si el usuario actual se cambia a no-admin)
        if (userId === currentUser.uid && newRole !== 'admin') {
            if (!window.confirm("¡Cuidado! Estás intentando quitarte el rol de administrador. Asegúrate de que haya al menos otro administrador activo antes de continuar. ¿Confirmas el cambio?")) {
                return;
            }
        }
        
        setSavingRole(userId);
        setError(null);
        try {
            // Llama a la función updateUserRole para actualizar Firestore
            await updateUserRole(userId, newRole);

            // Actualiza la lista de usuarios en el estado local para reflejar el cambio inmediatamente
            setUsers(prevUsers => 
                prevUsers.map(u => u.id === userId ? { ...u, role: newRole } : u)
            );

        } catch (err) {
            console.error("Error al actualizar el rol:", err);
            setError("Error al actualizar el rol. Revise la consola.");
        } finally {
            setSavingRole(null);
        }
    };

    if (authLoading || pageLoading) {
        return <div className="p-8 text-center text-xl font-semibold text-teal-600">Cargando gestión de usuarios...</div>;
    }

    if (error) {
        return <div className="p-8 text-red-600 border border-red-300 bg-red-50 rounded-lg">{error}</div>;
    }

    if (currentRole !== 'admin') {
        return null; // El useEffect ya redirigió si no es admin
    }
    
    // Función para obtener el email (asumiendo que viene en el documento 'user')
    const getUserDisplay = (user) => {
        return user.email || user.displayName || `UID: ${user.id}`;
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-2xl my-8 shadow-xl">
            <h1 className="text-4xl font-extrabold text-teal-700 mb-8 border-b-4 border-teal-200 pb-2">
                Gestión de Roles de Usuarios
            </h1>
            
            <p className="text-sm text-gray-600 mb-6">
                Como **Administrador**, puedes gestionar los roles de otros usuarios.
            </p>

            <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-teal-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-teal-800 uppercase tracking-wider">Email / Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-teal-800 uppercase tracking-wider">UID (Identificador)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-teal-800 uppercase tracking-wider">Rol Actual</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-teal-800 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {user.email || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                    {/* Muestra el UID completo para fines de administración */}
                                    {user.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                                          user.role === 'teacher' ? 'bg-indigo-100 text-indigo-800' : 
                                          'bg-green-100 text-green-800'}`
                                    }>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center">
                                    <select
                                        value={user.role || 'student'}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        disabled={savingRole === user.id}
                                        className="pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md shadow-sm"
                                    >
                                        {roles.map(role => (
                                            <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                                        ))}
                                    </select>
                                    {savingRole === user.id && (
                                        <span className="ml-3 text-xs text-teal-600">Guardando...</span>
                                    )}
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
