// src/pages/EditActivityPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import db, { updateActividad } from '../firebase/firestore';
import ActivityForm from '../components/ActivityForm';
import { useAuth } from '../context/AuthContext';

const EditActivityPage = () => {
    const { activityId } = useParams();
    const navigate = useNavigate();
    const { currentUser, currentRole, loading: authLoading } = useAuth();

    const [activity, setActivity] = useState(null);
    // Eliminamos el estado `grupos`
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para cargar los datos de la actividad
    useEffect(() => {
        const fetchActivity = async () => {
            setPageLoading(true);
            setError(null);
            try {
                // Ya no necesitamos cargar grupos aquí

                // Cargar la actividad específica
                const docRef = doc(db, "actividades", activityId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const activityData = { id: docSnap.id, ...docSnap.data() };
                    setActivity(activityData);

                    const canEdit = currentUser && (
                      currentRole === 'admin' ||
                      (currentRole === 'teacher' && currentUser.uid === activityData.teacherId)
                    );

                    if (!canEdit) {
                        alert("No tienes permiso para editar esta actividad.");
                        navigate('/tablero', { replace: true });
                        return;
                    }

                } else {
                    setError("Actividad no encontrada.");
                    navigate('/tablero', { replace: true });
                }
            } catch (err) {
                console.error("Error al cargar datos de la actividad:", err);
                setError("Error al cargar la actividad. Intenta de nuevo.");
            } finally {
                setPageLoading(false);
            }
        };

        if (!authLoading && activityId) {
            fetchActivity();
        }
    }, [activityId, authLoading, currentUser, currentRole, navigate]);

    const handleUpdateSubmit = async (updatedActivityData) => {
        try {
            await updateActividad(activityId, updatedActivityData);
            alert("Actividad actualizada con éxito.");
            navigate('/tablero');
        } catch (err) {
            console.error("Error al actualizar actividad:", err);
            alert("No se pudo actualizar la actividad. Asegúrate de tener los permisos adecuados.");
        }
    };

    if (authLoading || pageLoading) {
        return <div>Cargando actividad para edición...</div>;
    }

    if (error) {
        return <div><p style={{ color: 'red' }}>{error}</p><button onClick={() => navigate('/tablero')}>Volver al Tablero</button></div>;
    }

    if (!activity) {
        return <div>No se ha encontrado la actividad o no tienes permisos.</div>;
    }

    return (
        <div>
            {/*<h2 style={{ marginLeft: '2rem' }}>Editar Actividad: {activity.titulo}</h2> */}
            <ActivityForm
                initial={activity}
                onSubmit={handleUpdateSubmit}
                // Ya no pasamos la prop `grupos`
            />
        </div>
    );
};

export default EditActivityPage;
