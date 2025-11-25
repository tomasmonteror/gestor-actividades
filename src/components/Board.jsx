// src/components/Board.jsx
import React from "react";
import { Link } from 'react-router-dom';
import { Clock, UserCheck, ArrowBigRightDash, Users, Edit, Trash2 } from 'lucide-react';
import { useEffect } from "react";

const Board = ({
  actividades = [],
  currentUser = null,
  currentRole = null,
  startOfWeekDate,
  onEditActivity,
  onDeleteActivity,
  onViewDetails
}) => {
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  
  // Agrupar actividades por día
  const actividadesPorDia = dias.map(() => []);
  actividades.forEach(act => {
    if (!act.inicio_iso) return;
    const d = new Date(act.inicio_iso);
    const diaIndex = ((d.getDay() + 6) % 7); // lunes=0
    if (diaIndex >= 0 && diaIndex < 5) actividadesPorDia[diaIndex].push(act);
  });

  // Día actual
const todayIndex = (() => {
  const today = new Date();
  today.setHours(0,0,0,0); // ignorar horas
  for (let i = 0; i < 5; i++) {
    const colDate = new Date(startOfWeekDate);
    colDate.setDate(colDate.getDate() + i);
    colDate.setHours(0,0,0,0);
    if (colDate.getTime() === today.getTime()) return i;
  }
  return -1;
})();

useEffect(() => {
  window.scrollTo({
    top: 300,   // ← cambia este número a lo que necesites
    behavior: "smooth"
  });
}, [actividades]);

  const getActivityCardStyle = (act, idx) => {

    // Colores según tipo
    const typeColors = {
      complementaria: '#ffffffff', // blanco
      profesorado: '#dbeafe',    // azul
      academica: '#fee2e2',       // rojo
      otros: '#f4e3ffff' // morado
    };

    const fondoTipo = typeColors[act.tipo] || 'white';
    
    return { 
      backgroundColor: fondoTipo,
      transition: 'all 150ms ease-in-out', 
      borderRadius: '0.75rem', 
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.06)',
      cursor: 'pointer',
      padding: '6px',
      marginBottom: '0.25rem', // 🔹 separación entre actividades
      border: '1px solid #d1d5db',
      borderLeft: act.teacherId === currentUser?.uid && currentRole === 'teacher' ? '5px solid #10b981'
                 : currentRole === 'admin' ? '5px solid #ef4444'
                 : '5px solid #818cf8'
    };
  };

  const boardGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '1rem',
    width: '100%'
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen w-full mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div style={boardGridStyle}>
        {dias.map((dia, idx) => {
          const isToday = idx === todayIndex;
          return (
            <div 
              key={dia} 
              className="flex flex-col"
              style={{
                backgroundColor: '#f3f4f6',
                border: isToday ? '3px solid #f59e0b' : '1px solid #d1d5db',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                marginLeft: idx === 0 ? '0.5rem' : '0',       // separación izquierda en lunes
                marginRight: idx === dias.length - 1 ? '0.5rem' : '0', // separación derecha en viernes
                display: 'flex',
                flexDirection: 'column',
                boxShadow: isToday ? '0 0 10px rgba(0,0,0,0.1)' : '0 10px 15px -3px rgba(0,0,0,0.1)',
                minHeight: '500px',
                position: 'relative',
                transition: 'all 150ms ease-in-out'
              }}
            >

              {/* Encabezado día con símbolo + */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                {/* Encabezado día con símbolo + dentro del fondo */}
                <h4 style={{
                fontWeight: '700',
                fontSize: '1.25rem',
                color: 'white',
                backgroundColor: '#047857',
                borderRadius: '0.375rem',
                padding: '0.3rem 0.75rem',
                textAlign: 'center',
                margin: 0,
                marginBottom: '0.25rem',          // 🔹 reducir margen inferior
                display: 'flex',
                justifyContent: 'center',
                flexGrow: 1,
                alignItems: 'center',
                position: 'relative',
                width: '100%'                     // 🔹 ocupar todo el ancho de la columna
                }}>
                {(() => {
                    const base = startOfWeekDate ? new Date(startOfWeekDate) : (() => {
                    const d = new Date();
                    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
                    return d;
                    })();
                    const currentDate = new Date(base);
                    currentDate.setDate(base.getDate() + idx);
                    //const month = currentDate.toLocaleString('es-ES', { month: 'short' });
                    //return `${dia} ${currentDate.getDate()} ${month}`;
                    // Se muestra sólo el día
                    return `${dia} ${currentDate.getDate()}`;
                })()}

                {currentUser && currentRole !== 'student' && (
                    <Link
                    to="/add-activity"
                    state={{ preselectedDate: new Date(startOfWeekDate.getTime() + idx*24*60*60*1000) }}
                    style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: '#0d9488',
                        color: 'white',
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'all 150ms ease-in-out',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        marginLeft: '0.5rem'
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#0f766e'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#0d9488'}
                    title={`Añadir actividad para ${dia}`}
                    >
                    +
                    </Link>
                )}
                </h4>

              </div>

              {actividadesPorDia[idx].length === 0 ? (
                <p style={{ fontSize: '1.1rem', textAlign:'center'}}>Sin actividades previstas.</p>
              ) : (
                <div style={{
                    flexGrow: 1,
                    overflowY: "auto",
                    paddingRight: "4px",
                    minHeight: 0
                  }}
                  >
                  {actividadesPorDia[idx]
                    .sort((a,b) => new Date(a.inicio_iso).getTime() - new Date(b.inicio_iso).getTime())
                    .map(act => {
                      const style = getActivityCardStyle(act, idx);
                      const canEditOrDelete = currentUser && (
                        currentRole === 'admin' || 
                        (currentRole === 'teacher' && currentUser.uid === act.teacherId)
                      );
                      return (
                        <div key={act.id} style={style} onClick={() => onViewDetails(act)}>
                          <div style={{ fontWeight: '600', fontSize: '1.05rem', color: '#1f2937', 
                            paddingBottom:'0.2rem' }}>{act.titulo}</div>
                          <div style={{ fontSize: '1.05rem' }}>
                            <div >
                              <Clock style={{ width: '12px', height: '12px', marginRight: '4px', color: '#047857' }} />
                              {new Date(act.inicio_iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
                              {" - "}
                              {new Date(act.fin_iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
                            </div>

                            <div >
                              <Users style={{ width: '12px', height: '12px', marginRight: '4px', color: '#4f46e5' }} />
                              {/* Grupo: */}
                              {act.nombreGrupo || "N/A"}
                            </div>
                            {/*<div >
                              <Users style={{ width: '12px', height: '12px', marginRight: '4px', color: '#f50b3eff' }} />
                               Departamento: 
                              {act.departamento || act.teacherId || "N/A"}
                            </div>
                            */}
                            {act.profesorAcompanante && act.profesorAcompanante.trim() !== "" && (
                              <div >
                                <ArrowBigRightDash
                                  style={{
                                    width: '12px',
                                    height: '12px',
                                    marginRight: '4px',
                                    color: '#f59e0b'
                                  }}
                                />
                                {/* Profesorado: */}
                                {act.profesorAcompanante}
                              </div>
                            )}
                          </div>

                          {canEditOrDelete && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.2rem' }} onClick={e => e.stopPropagation()}>
                              <Link
                                to={`/edit-activity/${act.id}`}
                                style={{
                                  width: '22px',
                                  height: '22px',
                                  borderRadius: '50%',
                                  backgroundColor: '#22c55e',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 150ms ease-in-out',
                                  textDecoration: 'none'
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = '#16a34a'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = '#22c55e'}
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => onDeleteActivity(act.id)}
                                style={{
                                  width: '22px',
                                  height: '22px',
                                  borderRadius: '50%',
                                  backgroundColor: '#f87171',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  border: 'none',
                                  transition: 'all 150ms ease-in-out'
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = '#ef4444'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = '#f87171'}
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  }
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Board;
