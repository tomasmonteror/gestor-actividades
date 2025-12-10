// src/pages/DailyCarouselPage.jsx
import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "../context/AuthContext";
import { getActividadesSemana } from "../firebase/firestore";
import DailyCarousel from "../components/DailyCarousel";
import ActivityDetailModal from "../components/ActivityDetailModal";

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // lunes = 1
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfWeek(date) {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 4); // viernes
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
}

const DailyCarouselPage = () => {
  const [currentWeekDate, setCurrentWeekDate] = useState(
    getStartOfWeek(new Date())
  );
  const { currentUser, currentRole, loading: authLoading } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);
  const [actividades, setActividades] = useState([]);
  const [error, setError] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const {
    fechaInicioISO,
    fechaFinISO,
    currentWeekDisplay,
    weekStartDate,
  } = useMemo(() => {
    const startOfWeek = getStartOfWeek(new Date(currentWeekDate));
    const endOfWeek = getEndOfWeek(new Date(currentWeekDate));
    const startDay = startOfWeek.getDate();
    const startMonth = startOfWeek.toLocaleString("es-ES", {
      month: "long",
    });
    const endDay = endOfWeek.getDate();
    const endMonth = endOfWeek.toLocaleString("es-ES", {
      month: "long",
    });
    const year = endOfWeek.getFullYear();

    const center = new Date(startOfWeek);
    center.setDate(center.getDate() + 2); // miércoles

    return {
      fechaInicioISO: startOfWeek.toISOString(),
      fechaFinISO: endOfWeek.toISOString(),
      currentWeekDisplay: `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`,
      weekStartDate: startOfWeek,
    };
  }, [currentWeekDate]);

  const fetchAllData = useCallback(async () => {
    setPageLoading(true);
    setError(null);
    try {
      const fetchedActividades = await getActividadesSemana(
        fechaInicioISO,
        fechaFinISO
      );
      setActividades(fetchedActividades);
    } catch (err) {
      console.error("Error al cargar datos del carrusel:", err);
      setError("Error al cargar los datos. Intenta de nuevo.");
    } finally {
      setPageLoading(false);
    }
  }, [fechaInicioISO, fechaFinISO]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const goToPreviousWeek = () => {
    setCurrentWeekDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 7);
      return getStartOfWeek(newDate);
    });
  };

  const goToNextWeek = () => {
    setCurrentWeekDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 7);
      return getStartOfWeek(newDate);
    });
  };

  const handleViewDetails = (activity) => setSelectedActivity(activity);
  const handleCloseDetails = () => setSelectedActivity(null);

  if (authLoading || pageLoading) {
    return <div>Cargando actividades...</div>;
  }

  if (error) {
    return (
      <div>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={fetchAllData}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <button
          className="calendar-nav-button"
          onClick={goToPreviousWeek}
        >
          &lt; Semana Anterior
        </button>
        <h2>Semana: {currentWeekDisplay}</h2>
        <button
          className="calendar-nav-button"
          onClick={goToNextWeek}
        >
          Semana Siguiente &gt;
        </button>
      </div>

      <DailyCarousel
        activities={actividades}
        weekStartDate={weekStartDate}
        currentUser={currentUser}
        currentRole={currentRole}
        onViewDetails={handleViewDetails}
      />

      <ActivityDetailModal
        activity={selectedActivity}
        onClose={handleCloseDetails}
      />
    </div>
  );
};

export default DailyCarouselPage;
