import React from "react";
import { Link } from 'react-router-dom';
import { Clock, Users, MapPin, Edit, Trash2, Calendar } from 'lucide-react';

const Board = ({
  actividades = [],
  currentUser = null,         // Objeto de usuario autenticado
  currentRole = null,         // Rol del usuario autenticado
  startOfWeekDate,
  onEditActivity,             
  onDeleteActivity,           
  onViewDetails               
}) => {
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  // 1. Agrupar y ordenar actividades
  const actividadesPorDia = dias.map(() => []);

  actividades.forEach(act => {
    // Asegura que la actividad tenga una fecha ISO válida para evitar errores
    if (!act.inicio_iso) return;
    
    const d = new Date(act.inicio_iso);
    // 0=Lunes, 1=Martes, ..., 4=Viernes. Date.getDay() devuelve 0=Domingo, 1=Lunes, ...
    const diaIndex = ((d.getDay() + 6) % 7); 

    // Solo considera actividades de Lunes a Viernes (índices 0 a 4)
    if (diaIndex >= 0 && diaIndex < 5) {
      actividadesPorDia[diaIndex].push(act);
    }
  });

  // Función para renderizar el color de fondo basado en el rol del creador (teacherId)
  const getActivityCardStyle = (act) => {
    // Estilos de Tailwind (mantener por si se arregla la carga)
    let tailwindClasses = "border p-3 rounded-xl shadow-md transition duration-150 ease-in-out cursor-pointer ";
    let style = { 
        backgroundColor: 'white', 
        transition: 'all 150ms ease-in-out', 
        borderRadius: '0.75rem', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        cursor: 'pointer',
        paddingLeft: '6px',
        border: '1px solid #d1d5db' // gray-300
    };

    if (act.teacherId === currentUser?.uid && currentRole === 'teacher') {
        style.borderLeft = '5px solid #10b981'; // Teal
    } else if (currentRole === 'admin') {
        style.borderLeft = '5px solid #ef4444'; // Red
    } else {
        style.borderLeft = '5px solid #818cf8'; // Indigo
    }
    
    return { tailwindClasses, style };
  };

  // Estilos fijos para la cuadrícula del tablero
  const boardGridStyle = {
      display: 'grid',
      // Forzamos 5 columnas con 1 rem de gap
      gridTemplateColumns: 'repeat(5, 1fr)', 
      gap: '1rem', 
      width: '100%',
      // Añadimos media queries para la responsividad directamente en el JS/CSS.
      // Sin embargo, por simplicidad y dado que el entorno es React,
      // forzamos 5 columnas y asumimos que el contenedor será lo suficientemente grande.
      // Si el entorno no soporta el media query de Tailwind, este es el único camino.
      '@media (max-width: 768px)': { 
          gridTemplateColumns: 'repeat(1, 1fr)',
      }
  };

  return (
    // Aseguramos que el contenedor use todo el espacio
    <div className="p-4 sm:p-6 min-h-screen w-full mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}> 
        {/*<h2 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center">
            <Calendar className="w-8 h-8 mr-3 text-teal-600"/> 
            Tablero semanal
        </h2>
        */}
        
        {/* Contenedor del Tablero: Estilos de cuadrícula FORZADOS en línea */}
        <div style={boardGridStyle}>
            {dias.map((dia, idx) => (
                <div 
                    key={dia} 
                    // Inyectamos estilos básicos de columna
                    className="flex flex-col" 
                    style={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', minHeight: '500px' }}
                >
                    <h4
                    className="text-xl font-extrabold text-white"
                    style={{
                        fontWeight: '800',
                        fontSize: '1.25rem',
                        color: 'white',
                        backgroundColor: '#047857',
                        borderRadius: '0.375rem',
                        padding: '0.5rem 0.75rem',
                        marginBottom: '0.75rem',
                        textAlign: 'center',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    >
                    {(() => {
                        // Aseguramos crear una copia de la fecha base
                        const base = startOfWeekDate ? new Date(startOfWeekDate) : (() => {
                        // fallback: calcula el lunes de la semana actual
                        const d = new Date();
                        d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
                        return d;
                        })();

                        const currentDate = new Date(base);
                        currentDate.setDate(base.getDate() + idx);

                        const month = currentDate.toLocaleString('es-ES', { month: 'short' });
                        return `${dia} ${currentDate.getDate()} ${month}`;
                    })()}
                    </h4>
                    
                    {actividadesPorDia[idx].length === 0 ? (
                        <p className="text-gray-500 text-sm italic p-2 text-center flex-grow">Sin actividades previstas.</p>
                    ) : (
                        // Contenedor de actividades con scroll
                        <div 
                            className="flex flex-col space-y-3"
                            style={{
                                maxHeight: 'calc(100vh - 290px)', // ajusta 200px según encabezado/espacios superiores
                                overflowY: 'auto',
                                paddingRight: '4px',
                            }}
                        >
                             {actividadesPorDia[idx]
                                .sort((a,b) => new Date(a.inicio_iso).getTime() - new Date(b.inicio_iso).getTime())
                                .map(act => {
                                    const { tailwindClasses, style } = getActivityCardStyle(act);
                                    const canEditOrDelete = currentUser && (
                                        currentRole === 'admin' || 
                                        (currentRole === 'teacher' && currentUser.uid === act.teacherId)
                                    );
                                    
                                    return (
                                        <div
                                            key={act.id}
                                            className={tailwindClasses}
                                            style={style}
                                            onClick={() => onViewDetails(act)}
                                        >
                                            <div style={{ fontWeight: '600', fontSize: '1rem', color: '#1f2937' }}>{act.titulo}</div>
                                            
                                            <div className="text-xs text-gray-600 space-y-1 mt-2">
                                                {/* Hora y Duración */}
                                                <div className="flex items-center">
                                                    <Clock style={{ width: '12px', height: '12px', marginRight: '4px', color: '#047857' }} />
                                                    {new Date(act.inicio_iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} 
                                                    <span style={{ marginLeft: '8px', color: '#6b7280' }}>({act.duracion_min} min)</span>
                                                </div>

                                                {/* Grupo */}
                                                <div className="flex items-center">
                                                    <Users style={{ width: '12px', height: '12px', marginRight: '4px', color: '#4f46e5' }} />
                                                    Grupo: {act.nombreGrupo || "N/A"}
                                                </div>

                                                {/* Profesor */}
                                                <div className="flex items-center">
                                                    <Users style={{ width: '12px', height: '12px', marginRight: '4px', color: '#f59e0b' }} />
                                                    Profesorado: {act.profesorAcompanante || act.teacherId || "N/A"}
                                                </div>

                                                {/* Lugar 
                                                <div className="flex items-center">
                                                    <MapPin style={{ width: '12px', height: '12px', marginRight: '4px', color: '#dc2626' }} />
                                                    Lugar: {act.nombreLugar || "N/A"}
                                                </div>
                                                */}
                                            </div>

                                            {/* Botones de Acción (Editar/Eliminar) */}
                                            {canEditOrDelete && (
                                                <div className="flex justify-end space-x-2 mt-3 pt-2 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
                                                    <Link
                                                        to={`/edit-activity/${act.id}`}
                                                        className="p-1 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition duration-150"
                                                        title="Editar"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => onDeleteActivity(act.id)}
                                                        className="p-1 rounded-full bg-red-500 hover:bg-red-600 text-white transition duration-150"
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
            ))}
        </div>
    </div>
  );
};

export default Board;
