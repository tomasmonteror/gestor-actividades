import React, { useState } from 'react';
import { addActividad } from '../firebase/firestore';
import ActivityForm from '../components/ActivityForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AddActivity = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading: authLoading } = useAuth();

  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState(null);

  // Recibimos la fecha preseleccionada del estado del Link (+)
  const preselectedDate = location.state?.preselectedDate
    ? new Date(location.state.preselectedDate)
    : null;

  const handleAddSubmit = async (actividadData) => {
    try {
      console.log("Datos de la actividad que se intenta añadir:", actividadData);
      const docRef = await addActividad(actividadData);
      alert(`Actividad "${actividadData.titulo}" añadida con ID: ${docRef.id}`);
      navigate('/tablero');
    } catch (error) {
      console.error("Error al añadir actividad:", error);
      alert("Error al añadir la actividad.");
    }
  };

  if (authLoading || pageLoading) {
    return <div>Cargando formulario de actividad...</div>;
  }

  if (error) {
    return <div><p style={{ color: 'red' }}>{error}</p></div>;
  }

  return (
    <div>
      <h2>Crear Nueva Actividad</h2>
      <ActivityForm
        onSubmit={handleAddSubmit}
        preselectedDate={preselectedDate}  // ✅ aquí enviamos la fecha
      />
    </div>
  );
};

export default AddActivity;
