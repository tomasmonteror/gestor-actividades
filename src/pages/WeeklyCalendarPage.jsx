// src/pages/WeeklyCalendarPage.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Board from '../components/Board';
import { useAuth } from '../context/AuthContext';
import { getActividadesSemana, deleteActividad } from '../firebase/firestore';
import ActivityDetailModal from '../components/ActivityDetailModal';

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day); // lunes = 1
  d.setDate(d.getDate() + diff);
  d.setHours(0,0,0,0); // inicio del día
  return d;
}

function getEndOfWeek(date) {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 4); // viernes
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
}

const WeeklyCalendarPage = () => {
  const [currentWeekDate, setCurrentWeekDate] = useState(getStartOfWeek(new Date()));
  const { currentUser, currentRole, loading: authLoading } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);
  const [actividades, setActividades] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [selectedActivity, setSelectedActivity] = useState(null);

  const { fechaInicioISO, fechaFinISO, currentWeekDisplay } = useMemo(() => {
    const startOfWeek = getStartOfWeek(new Date(currentWeekDate));
    const endOfWeek = getEndOfWeek(new Date(currentWeekDate));
    const startDay = startOfWeek.getDate();
    const startMonth = startOfWeek.toLocaleString('es-ES', { month: 'long' });
    const endDay = endOfWeek.getDate();
    const endMonth = endOfWeek.toLocaleString('es-ES', { month: 'long' });
    const year = endOfWeek.getFullYear();

    return {
      fechaInicioISO: startOfWeek.toISOString(),
      fechaFinISO: endOfWeek.toISOString(),
      currentWeekDisplay: `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`
    };
  }, [currentWeekDate]);

  const fetchAllData = useCallback(async () => {
    setPageLoading(true);
    setError(null);
    try {
      const fetchedActividades = await getActividadesSemana(fechaInicioISO, fechaFinISO);
      setActividades(fetchedActividades);
    } catch (err) {
      console.error("Error al cargar datos del calendario:", err);
      setError("Error al cargar los datos. Intenta de nuevo.");
    } finally {
      setPageLoading(false);
    }
  }, [fechaInicioISO, fechaFinISO]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const goToPreviousWeek = () => {
    setCurrentWeekDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 7);
      return getStartOfWeek(newDate);
    });
  };

  const goToNextWeek = () => {
    setCurrentWeekDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 7);
      return getStartOfWeek(newDate);
    });
  };

  const handleEditActivity = (activityId) => {
    navigate(`/edit-activity/${activityId}`);
  };

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta actividad? Esta acción es irreversible.")) {
      try {
        await deleteActividad(activityId);
        alert("Actividad eliminada con éxito.");
        fetchAllData();
      } catch (err) {
        console.error("Error al eliminar actividad:", err);
        alert("No se pudo eliminar la actividad. Asegúrate de tener los permisos adecuados.");
      }
    }
  };

  const handleViewDetails = (activity) => setSelectedActivity(activity);
  const handleCloseDetails = () => setSelectedActivity(null);

  if (authLoading || pageLoading) {
    return <div>Cargando calendario...</div>;
  }

  if (error) {
    return <div><p style={{ color: 'red' }}>{error}</p><button onClick={fetchAllData}>Reintentar</button></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <button className="calendar-nav-button" onClick={goToPreviousWeek}>&lt; Semana Anterior</button>
        <h2>Semana: {currentWeekDisplay}</h2>
        <button className="calendar-nav-button" onClick={goToNextWeek}>Semana Siguiente &gt;</button>
      </div>

      <Board
        actividades={actividades}
        currentUser={currentUser}
        currentRole={currentRole}
        startOfWeekDate={currentWeekDate}
        onEditActivity={handleEditActivity}
        onDeleteActivity={handleDeleteActivity}
        onViewDetails={handleViewDetails}
      />

      <ActivityDetailModal
        activity={selectedActivity}
        onClose={handleCloseDetails}
      />
    </div>
  );
};

export default WeeklyCalendarPage;
