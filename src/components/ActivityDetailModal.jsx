// src/components/ActivityDetailModal.jsx
import React from "react";
import { X, Clock, Users, MapPin, ArrowBigRightDash, Tag, Info } from "lucide-react";

const ActivityDetailModal = ({ activity, onClose }) => {
  if (!activity) return null;

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "1rem",
  };

  const modalStyle = {
    backgroundColor: "white",
    borderRadius: "0.75rem",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "600px",
    fontFamily: "Inter, sans-serif",
    padding: "1.5rem",
    position: "relative",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "0.75rem",
    marginBottom: "1rem",
  };

  const titleStyle = {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#047857",
  };

  const closeBtnStyle = {
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "9999px",
    padding: "0.25rem",
    cursor: "pointer",
    transition: "background-color 150ms ease-in-out",
  };

  const detailRowStyle = {
    display: "flex",
    alignItems: "center",
    marginBottom: "0.5rem",
    fontSize: "0.95rem",
    color: "#374151",
  };

  const iconStyle = {
    width: "16px",
    height: "16px",
    marginRight: "8px",
  };

  const footerStyle = {
    borderTop: "1px solid #e5e7eb",
    marginTop: "1rem",
    paddingTop: "0.75rem",
    textAlign: "right",
  };

  // Opcional: calcula duración en minutos, para mostrarla como referencia adicional
  const getDuration = () => {
    if (!activity.inicio_iso || !activity.fin_iso) return "";
    const start = new Date(activity.inicio_iso);
    const end = new Date(activity.fin_iso);
    const diffHoras = Math.round((end - start) / (1000 * 60 * 60));
    return diffHoras > 0 ? `${diffHoras.toFixed(1)} horas` : "";
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>{activity.titulo}</h3>
          <button
            onClick={onClose}
            style={closeBtnStyle}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div>
          <div style={detailRowStyle}>
            <Clock style={{ ...iconStyle, color: "#047857" }} />
            <span>
              <strong>
                Inicio:&nbsp;
                {activity.inicio_iso
                  ? new Date(activity.inicio_iso).toLocaleString("es-ES", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "N/A"}
                {"  |  Fin: "}
                {activity.fin_iso
                  ? new Date(activity.fin_iso).toLocaleString("es-ES", {
                      dateStyle: "short",
                      timeStyle: "short",  
                    //hour: "2-digit",
                      //minute: "2-digit",
                    })
                  : "N/A"}
                {activity.inicio_iso && activity.fin_iso && (
                  <span
                    style={{
                      marginLeft: "1rem",
                      fontStyle: "italic",
                      color: "#64748b",
                    }}
                  >
                    ({getDuration()})
                  </span>
                )}
              </strong>
            </span>
          </div>

          <div style={detailRowStyle}>
            <Users style={{ ...iconStyle, color: "#4f46e5" }} />
            <span>Grupo: {activity.nombreGrupo || "N/A"}</span>
          </div>

          <div style={detailRowStyle}>
            <Tag style={{ ...iconStyle, color: "#0d9488" }} />
            <span>
              Departamento organizador: {activity.departamento || "N/A"}
            </span>
          </div>

          {!!(activity.profesorAcompanante && activity.profesorAcompanante.trim()) && (                   
            <div style={detailRowStyle}>
              <ArrowBigRightDash style={{ ...iconStyle, color: "#f1b253ff" }} />
              <span>
                Profesorado acompañante: {activity.profesorAcompanante || "N/A"}
              </span>
            </div>
          )}

          <div style={detailRowStyle}>
            <MapPin style={{ ...iconStyle, color: "#dc2626" }} />
            <span>Lugar: {activity.nombreLugar || "N/A"}</span>
          </div>

          {/* Tipo */}
          <div style={detailRowStyle}>
            <Info style={{ ...iconStyle, color: "#6366f1" }} />
            <span>Tipo: {activity.tipo || "Desconocido"}</span>
          </div>

          {/* Sólo muestra la descripción si existe */}
          {activity.descripcion && (
            <div
              style={{
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                padding: "0.75rem",
                marginTop: "1rem",
                color: "#374151",
                lineHeight: "1.5",
              }}
            >
              {activity.descripcion}
            </div>
          )}

          
        </div>

        <div style={footerStyle}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#0d9488",
              color: "white",
              fontWeight: "600",
              padding: "0.5rem 1.25rem",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              transition: "background-color 150ms ease-in-out",
              cursor: "pointer",
            }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = "#0f766e")}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = "#0d9488")}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailModal;
