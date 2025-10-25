// src/pages/AddActivity.jsx
import React, { useEffect, useState } from 'react';
import { addActividad } from '../firebase/firestore'; // Ya no necesitamos getGrupos
import ActivityForm from '../components/ActivityForm';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AddActivity = () => {
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth();
  const [pageLoading, setPageLoading] = useState(false); // No necesitamos cargar grupos, así que puede ser false
  const [error, setError] = useState(null);

  // Eliminamos el estado `grupos` y la función `fetchAllDependencies`

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

  if (authLoading || pageLoading) { // pageLoading siempre será false ahora, pero se mantiene la estructura
    return <div>Cargando formulario de actividad...</div>;
  }

  if (error) {
    return <div><p style={{ color: 'red' }}>{error}</p></div>; // Ya no hay botón de reintentar si no hay carga
  }

  return (
    <div>
      <h2>Crear Nueva Actividad</h2>
      <ActivityForm
        onSubmit={handleAddSubmit}
        // Ya no pasamos la prop `grupos`
      />
    </div>
  );
};

export default AddActivity;
