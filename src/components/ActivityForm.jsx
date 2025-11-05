// src/components/ActivityForm.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Calendar, Clock, Users, MapPin, Tag, Type, Loader, AlertTriangle, ListChecks, Info } from "lucide-react";

function toLocalDateTimeLocalised(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day}T${hours}:${mins}`;
  } catch {
    return "";
  }
}

function formatToISO(local) {
  if (!local) return "";
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

const ActivityForm = ({ initial = {}, onSubmit, preselectedDate }) => {
  const { currentUser, loading } = useAuth();

  const [titulo, setTitulo] = useState(initial.titulo || "");
  const [descripcion, setDescripcion] = useState(initial.descripcion || "");
  const [nombreGrupo, setNombreGrupo] = useState(initial.nombreGrupo || "");
  const [profesorAcompanante, setProfesorAcompanante] = useState(initial.profesorAcompanante || "");
  const [nombreLugar, setNombreLugar] = useState(initial.nombreLugar || "");
  const [inicio_iso, setInicioIso] = useState("");
  const [duracion_min, setDuracionMin] = useState(initial.duracion_min ?? 60);
  const [estado, setEstado] = useState(initial.estado || "programada");
  const [teacherId, setTeacherId] = useState(initial.teacherId || currentUser?.uid || "");
  const [formError, setFormError] = useState("");

  // Cada vez que cambie initial o preselectedDate, actualizamos los estados
useEffect(() => {
  if (initial && Object.keys(initial).length) {
    setTitulo(initial.titulo || "");
    setDescripcion(initial.descripcion || "");
    setNombreGrupo(initial.nombreGrupo || "");
    setProfesorAcompanante(initial.profesorAcompanante || "");
    setNombreLugar(initial.nombreLugar || "");
    setInicioIso(initial.inicio_iso || "");
    setDuracionMin(initial.duracion_min ?? 60);
    setEstado(initial.estado || "programada");
    setTeacherId(initial.teacherId || currentUser?.uid || "");
  } else if (preselectedDate) {
    const d = new Date(preselectedDate);
    d.setHours(8, 30, 0, 0);
    setInicioIso(d.toISOString());
    setTeacherId(currentUser?.uid || "");
  }
}, [initial, preselectedDate, currentUser]);




  const submit = (e) => {
    e.preventDefault();
    setFormError("");
    if (!titulo.trim()) return setFormError("El título de la actividad es obligatorio.");
    if (!nombreGrupo.trim()) return setFormError("El campo Grupo es obligatorio.");
    if (!profesorAcompanante.trim()) return setFormError("Debe indicar el profesor o profesores acompañantes.");
    if (!nombreLugar.trim()) return setFormError("El lugar de la actividad es obligatorio.");
    if (!inicio_iso || Number.isNaN(new Date(inicio_iso).getTime())) return setFormError("Debe especificar una fecha y hora de inicio válidas.");
    if (Number(duracion_min) <= 0) return setFormError("La duración debe ser un número positivo.");
    if (!teacherId) return setFormError("Error de autenticación: No se pudo determinar el ID del profesor creador.");

    const actividad = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      nombreGrupo: nombreGrupo.trim(),
      profesorAcompanante: profesorAcompanante.trim(),
      nombreLugar: nombreLugar.trim(),
      inicio_iso: inicio_iso.trim(),
      duracion_min: Number(duracion_min) || 60,
      estado,
      teacherId,
    };
    onSubmit(actividad);
  };

  if (loading) {
    return (
      <div
        className="flex justify-center items-center h-64"
        style={{
          backgroundColor: "#f9fafb",
          borderRadius: "0.75rem",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <Loader className="w-8 h-8 animate-spin text-teal-600" />
        <span style={{ marginLeft: "0.75rem", color: "#374151", fontSize: "1.125rem" }}>Cargando formulario...</span>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div
        style={{
          padding: "1.5rem",
          backgroundColor: "#fee2e2",
          border: "1px solid #f87171",
          color: "#b91c1c",
          borderRadius: "0.75rem",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <p style={{ fontWeight: "700" }}>Acceso Denegado</p>
        <p>Por favor, inicia sesión para acceder a este formulario.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-6 max-w-4xl mx-auto"
      style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "0.75rem",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
        fontFamily: "Inter, sans-serif",
        marginTop: "0.2rem", // muy poco espacio superior
      }}
    >
      <h2
        className="text-2xl font-bold mb-4"
        style={{
          color: "#4338ca",
          borderBottom: "1px solid #d1d5db",
          paddingBottom: "0.75rem",
        }}
      >
        {initial.id ? "Editar Actividad" : "Crear Nueva Actividad"}
      </h2>

      {formError && (
        <div
          style={{
            padding: "0.75rem",
            backgroundColor: "#fee2e2",
            border: "1px solid #f87171",
            color: "#b91c1c",
            borderRadius: "0.5rem",
            display: "flex",
            alignItems: "center",
            fontSize: "0.875rem",
          }}
        >
          <AlertTriangle className="w-5 h-5 mr-2" />
          {formError}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <FormGroup label="Título" icon={Type} htmlFor="titulo">
          <input
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Nombre de la actividad (Ej: Visita al Museo de Ciencias)"
            required
            maxLength={80}
            style={inputStyle}
          />
        </FormGroup>

        <FormGroup label="Descripción" icon={ListChecks} htmlFor="descripcion">
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Detalles sobre el objetivo, materiales o planificación."
            maxLength={250}
            style={{ ...inputStyle, minHeight: "80px" }}
          />
        </FormGroup>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          borderTop: "1px solid #e5e7eb",
          paddingTop: "1.5rem",
        }}
      >
        <FormGroup label="Grupo(s)" icon={Users} htmlFor="nombreGrupo">
          <input
            id="nombreGrupo"
            type="text"
            value={nombreGrupo}
            onChange={(e) => setNombreGrupo(e.target.value)}
            placeholder="Ej: 1º Bach A, 3º ESO C"
            maxLength={50}
            required
            style={inputStyle}
          />
        </FormGroup>

        <FormGroup label="Profesor/es Acompañante/s" icon={Tag} htmlFor="profesorAcompanante">
          <input
            id="profesorAcompanante"
            type="text"
            value={profesorAcompanante}
            onChange={(e) => setProfesorAcompanante(e.target.value)}
            placeholder="Nombre del profesor acompañante"
            maxLength={80}
            required
            style={inputStyle}
          />
        </FormGroup>

        <FormGroup label="Lugar" icon={MapPin} htmlFor="nombreLugar">
          <input
            id="nombreLugar"
            type="text"
            value={nombreLugar}
            onChange={(e) => setNombreLugar(e.target.value)}
            placeholder="Ej: Aula 101, Salón de actos"
            maxLength={50}
            required
            style={inputStyle}
          />
        </FormGroup>

        <FormGroup label="Inicio (Fecha y Hora)" icon={Calendar} htmlFor="inicio_iso">
          <input
            id="inicio_iso"
            type="datetime-local"
            value={toLocalDateTimeLocalised(inicio_iso)}
            onChange={(e) => setInicioIso(formatToISO(e.target.value))}
            required
            style={inputStyle}
          />
        </FormGroup>

        <FormGroup label="Duración (minutos)" icon={Clock} htmlFor="duracion_min">
          <input
            id="duracion_min"
            type="number"
            min={1}
            value={duracion_min}
            onChange={(e) => setDuracionMin(e.target.value)}
            required
            style={inputStyle}
          />
        </FormGroup>

        <FormGroup label="Estado" icon={Info} htmlFor="estado">
          <select
            id="estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            style={{ ...inputStyle, appearance: "none" }}
          >
            <option value="programada">Programada</option>
            <option value="en_curso">En curso</option>
            <option value="finalizada">Finalizada</option>
          </select>
        </FormGroup>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          borderTop: "1px solid #e5e7eb",
          paddingTop: "1.5rem",
        }}
      >
        {/*
        {teacherId && (
          <p style={{ fontSize: "0.875rem", color: "#6b7280", fontStyle: "italic" }}>
            {initial.id ? "Creada por:" : "Asignada al UID:"}{" "}
            <span style={{ fontFamily: "monospace", color: "#4b5563", marginLeft: "0.5rem" }}>{teacherId}</span>
          </p>
        )}
          */}

        <button
          type="submit"
          className="flex items-center"
          style={{
            backgroundColor: "#0d9488",
            color: "white",
            fontWeight: "600",
            padding: "0.5rem 1.5rem",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            transition: "background-color 150ms ease-in-out",
            cursor: "pointer",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0f766e")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#0d9488")}
        >
          Guardar Actividad
        </button>
      </div>
    </form>
  );
};

const inputStyle = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid #d1d5db",
  outline: "none",
  transition: "border-color 150ms ease-in-out, box-shadow 150ms ease-in-out",
  fontSize: "0.95rem",
  color: "#374151",
  backgroundColor: "white",
  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
};

const FormGroup = ({ label, icon: Icon, children, htmlFor }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label
      htmlFor={htmlFor}
      style={{
        fontSize: "0.875rem",
        fontWeight: "500",
        color: "#374151",
        marginBottom: "0.25rem",
        display: "flex",
        alignItems: "center",
      }}
    >
      {Icon && <Icon className="w-4 h-4" style={{ marginRight: "0.5rem", color: "#14b8a6" }} />}
      {label}
    </label>
    {children}
  </div>
);

export default ActivityForm;
