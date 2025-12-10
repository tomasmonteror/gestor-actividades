// src/components/DailyCarousel.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Clock, ArrowBigRightDash, Users } from 'lucide-react';

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // lunes = 1
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function localDateKey(d) {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

function formatHeader(date, nombreDia) {
  return `${nombreDia} ${date.getDate()}`;
}

const diasNombres = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const DailyCarousel = ({
  activities,
  weekStartDate,
  currentUser = null,
  currentRole = null,
  onViewDetails,
}) => {
  // Semana base
  const baseWeekStart = weekStartDate || getStartOfWeek(new Date());

  // Índice del día actual dentro de la semana (0–4, o 0 si ya ha pasado toda la semana)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayIndex = (() => {
    for (let i = 0; i < 5; i++) {
      const d = new Date(baseWeekStart);
      d.setDate(d.getDate() + i);
      if (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      ) {
        return i;
      }
    }
    // Si hoy está fuera de esta semana, por ejemplo fin de semana,
    // puedes fijar 0 (lunes) o dejar 2 (miércoles); aquí elegimos 0.
    return 0;
  })();

  // Estado: empieza en el día actual
  const [activeIndex, setActiveIndex] = useState(todayIndex);

  const activitiesByDay = useMemo(() => {
    const map = {};
    activities.forEach((act) => {
      if (!act.inicio_iso) return;
      const d = new Date(act.inicio_iso);
      const key = localDateKey(d);
      if (!map[key]) map[key] = [];
      map[key].push(act);
    });
    Object.values(map).forEach((list) =>
      list.sort(
        (a, b) =>
          new Date(a.inicio_iso).getTime() - new Date(b.inicio_iso).getTime()
      )
    );
    return map;
  }, [activities]);

  const getDateForColumn = (index) => {
    const d = new Date(baseWeekStart);
    d.setDate(d.getDate() + index);
    return d;
  };

  const getActivitiesForColumn = (index) => {
    const d = getDateForColumn(index);
    const key = localDateKey(d);
    return activitiesByDay[key] || [];
  };

  // Rotación solo entre hoy y los días siguientes de la semana
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        // rango permitido: [todayIndex, 4]
        if (prev < todayIndex || prev > 4) {
          return todayIndex;
        }
        if (prev === 4) {
          // si estaba en viernes, vuelve al día de hoy
          return todayIndex;
        }
        // si está entre todayIndex y jueves, avanza uno
        const next = prev + 1;
        return next < todayIndex ? todayIndex : next;
      });
    }, 12000);

    return () => clearInterval(timer);
  }, [todayIndex, baseWeekStart]);


  const getActivityCardStyle = (act, isActive) => {
    const typeColors = {
      complementaria: "#ffffffff",
      profesorado: "#dbeafe",
      academica: "#fee2e2",
      otros: "#f4e3ffff",
    };
    const fondoTipo = typeColors[act.tipo] || "white";

    return {
      backgroundColor: fondoTipo,
      transition: "all 150ms ease-in-out",
      borderRadius: "0.75rem",
      boxShadow:
        "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.06)",
      cursor: "pointer",
      padding: isActive ? "8px" : "6px",
      marginBottom: "0.25rem",
      border: "1px solid #d1d5db",
      borderLeft:
        currentUser &&
        currentRole === "teacher" &&
        act.teacherId === currentUser.uid
          ? "5px solid #10b981"
          : currentRole === "admin"
          ? "5px solid #ef4444"
          : "5px solid #818cf8",
    };
  };

  return (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      gap: "1rem",
      width: "100%",
      alignItems: "stretch",
      overflow: "visible", // importante
    }}
  >
    {diasNombres.map((nombreDia, idx) => {
      const isActive = idx === activeIndex;
      const colDate = getDateForColumn(idx);
      const colActs = getActivitiesForColumn(idx);

      // si es lunes (0) o viernes (4), no aplicar scale para no cortar
      const applyScale = isActive && idx !== 0 && idx !== 4;

      return (
        <div
          key={nombreDia}
          style={{
            backgroundColor: "#f3f4f6",
            borderRadius: "0.5rem",
            padding: isActive ? "0.6rem" : "0.4rem",
            border: isActive ? "4px solid #f59e0b" : "1px solid #d1d5db",
            boxShadow: isActive
              ? "0 0 22px rgba(0,0,0,0.2)"
              : "0 8px 12px -4px rgba(0,0,0,0.1)",
            transform: applyScale ? "scale(1.1)" : isActive ? "scale(1.02)" : "scale(0.98)",   // ← sin reducción ni corte
            transformOrigin: "center",
            transition: "all 200ms ease-in-out",
            display: "flex",
            flexDirection: "column",
            minHeight: isActive ? "500px" : "250px",
            zIndex: isActive ? 2 : 1,
            marginLeft: idx === 0 ? "4px" : 0,
            marginRight: idx === 4 ? "4px" : 0,
          }}
        >
            <div
              style={{
                fontWeight: "700",
                fontSize: isActive ? "1.2rem" : "0.9rem",
                color: "white",
                backgroundColor: "#047857",
                borderRadius: "0.5rem",
                padding: isActive ? "0.4rem 0.9rem" : "0.2rem 0.5rem",
                textAlign: "center",
                marginBottom: isActive ? "0.7rem" : "0.3rem",
                textTransform: "capitalize",
              }}
            >
              {formatHeader(colDate, nombreDia)}
            </div>

            {colActs.length === 0 ? (
              <p
                style={{
                  fontSize: isActive ? "0.95rem" : "0.8rem",
                  textAlign: "center",
                  color: "#6b7280",
                  marginTop: "0.5rem",
                }}
              >
                Sin actividades previstas.
              </p>
            ) : (
              <div
                style={{
                  flexGrow: 1,
                  overflowY: "auto",
                  paddingRight: "4px",
                  minHeight: 0,
                }}
              >
                {colActs.map((act) => {
                  const start = new Date(act.inicio_iso);
                  const end = new Date(act.fin_iso);
                  const hora = `${start.toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })} – ${end.toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}`;
                  const style = getActivityCardStyle(act, isActive);

                  return (
                    <div
                      key={act.id}
                      style={style}
                      onClick={() =>
                        onViewDetails && onViewDetails(act)
                      }
                    >
                      <div
                        style={{
                          fontWeight: "600",
                          fontSize: isActive ? "1rem" : "0.9rem",
                          color: "#1f2937",
                          paddingBottom: "0.25rem",
                        }}
                      >
                        {act.titulo}
                      </div>

                      <div
                        style={{
                          fontSize: "0.9rem",
                          color: "#374151",
                        }}
                      >
                        <div>
                          <Clock style={{ width: '12px', height: '12px', marginRight: '4px', color: '#047857' }} />
                          {hora}
                        </div>
                        <div>
                          <Users style={{ width: '12px', height: '12px', marginRight: '4px', color: '#4f46e5' }} />
                          {act.nombreGrupo || "N/A"}
                        </div>
                        {!!(act.profesorAcompanante && act.profesorAcompanante.trim()) && (
                          <div>
                            <ArrowBigRightDash
                              style={{
                                width: "12px",
                                height: "12px",
                                marginRight: "4px",
                                color: "#f59e0b",
                              }}
                            />
                            {act.profesorAcompanante}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DailyCarousel;
