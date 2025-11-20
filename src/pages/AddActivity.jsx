import React, { useState } from 'react';
import { addActividad } from '../firebase/firestore';
import ActivityForm from '../components/ActivityForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AddActivity = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading: authLoading } = useAuth();

  const [pageLoading] = useState(false);
  const [error] = useState(null);

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
    <div
      style={{
        marginLeft: '2rem',
        marginRight: '2rem',
        marginTop: '1rem',
        marginBottom: '2rem',
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        padding: '1.5rem',
      }}
    >
      <ActivityForm
        onSubmit={handleAddSubmit}
        preselectedDate={preselectedDate}
      />
    </div>
  );
};

export default AddActivity;
