// src/components/ActivityForm.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Tag,
  Type,
  Loader,
  AlertTriangle,
  Info,
} from "lucide-react";

function combineDateAndTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return "";
  const combined = new Date(`${dateStr}T${timeStr}`);
  return combined.toISOString();
}

function extractDateAndTime(iso) {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  return {
    date: d.toISOString().split("T")[0],
    time: d.toTimeString().slice(0, 5),
  };
}

const ActivityForm = ({ initial = {}, onSubmit, preselectedDate }) => {
  const { currentUser, loading } = useAuth();

  const [titulo, setTitulo] = useState(initial.titulo || "");
  const [descripcion, setDescripcion] = useState(initial.descripcion || "");
  const [nombreGrupo, setNombreGrupo] = useState(initial.nombreGrupo || "");
  const [departamento, setDepartamento] = useState(initial.departamento || "");
  const [profesorAcompanante, setProfesorAcompanante] = useState(
    initial.profesorAcompanante || ""
  );
  const [nombreLugar, setNombreLugar] = useState(initial.nombreLugar || "");
  const [fechaInicio, setFechaInicio] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [tipo, setTipo] = useState(initial.tipo || "complementaria");
  const [initialized, setInitialized] = useState(false);
  const [teacherId, setTeacherId] = useState(
    initial.teacherId || currentUser?.uid || ""
  );
  const [formError, setFormError] = useState("");
  const [horaFinManual, setHoraFinManual] = useState(false);

  useEffect(() => {
    if (initialized) return; // Así sólo pasamos por aquí una vez

    if (initial && Object.keys(initial).length) {
      setTitulo(initial.titulo || "");
      setDescripcion(initial.descripcion || "");
      setNombreGrupo(initial.nombreGrupo || "");
      setDepartamento(initial.departamento || "");
      setProfesorAcompanante(initial.profesorAcompanante || "");
      setNombreLugar(initial.nombreLugar || "");
      setTipo(initial.tipo || "complementaria");
      setTeacherId(initial.teacherId || currentUser?.uid || "");

      if (initial.inicio_iso) {
        const { date, time } = extractDateAndTime(initial.inicio_iso);
        setFechaInicio(date);
        setHoraInicio(time);
      }
      if (initial.fin_iso) {
        const { date, time } = extractDateAndTime(initial.fin_iso);
        setFechaFin(date);
        setHoraFin(time);
      }
    } else if (preselectedDate) {
      const d = new Date(preselectedDate);
      d.setHours(8, 30, 0, 0);
      setFechaInicio(d.toISOString().split("T")[0]);
      setHoraInicio("08:30");
      setFechaFin(d.toISOString().split("T")[0]);
      setHoraFin("14:30");
      setTeacherId(currentUser?.uid || "");
    }

    setInitialized(true);
  }, [initial, preselectedDate, currentUser, initialized]);


  // Cuando se cambia la hora de inicio, ajusta la hora de fin +1h (si no se tocó manualmente)
  useEffect(() => {
    if (!horaInicio || horaFinManual) return;
    const [h, m] = horaInicio.split(":").map(Number);
    const endH = (h + 1) % 24;
    const endM = m;
    setHoraFin(`${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`);
  }, [horaInicio, horaFinManual]);

  // Cuando cambia la fecha de inicio, si no ha tocado manualmente la fecha de fin, copiarla
  useEffect(() => {
    if (!fechaInicio) return;
    if (!fechaFin) {
      setFechaFin(fechaInicio);
      return;
    }
    // Si quieres que SIEMPRE copie automáticamente:
    // setFechaFin(fechaInicio);
  }, [fechaInicio, fechaFin]);


  const submit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!titulo.trim()) return setFormError("El título de la actividad es obligatorio.");
    if (!nombreGrupo.trim())
      return setFormError("El campo Grupo es obligatorio.");
    if (!departamento.trim()) 
      return setFormError("Debe indicar el departamento organizador.");
    //if (!profesorAcompanante.trim())
    //  return setFormError("Debe indicar el profesor o profesores acompañantes.");
    if (!nombreLugar.trim())
      return setFormError("El lugar de la actividad es obligatorio.");
    if (!fechaInicio) return setFormError("Debe especificar una fecha de inicio.");
    if (!horaInicio)
      return setFormError("Debe indicar una hora de inicio.");
    if (!horaFin)
      return setFormError("Debe indicar una hora de finalización.");
    if (!teacherId)
      return setFormError("Error de autenticación: No se pudo determinar el ID del profesor.");

    const inicio_iso = combineDateAndTime(fechaInicio, horaInicio);
    const fin_iso = combineDateAndTime(!fechaFin? fechaInicio: fechaFin, horaFin);

    const actividad = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      nombreGrupo: nombreGrupo.trim(),
      departamento: departamento.trim(),
      profesorAcompanante: profesorAcompanante.trim(),
      nombreLugar: nombreLugar.trim(),
      inicio_iso,
      fin_iso,
      tipo,
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
        <span
          style={{
            marginLeft: "0.75rem",
            color: "#374151",
            fontSize: "1.125rem",
          }}
        >
          Cargando formulario...
        </span>
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
        marginTop: "-0.2rem",
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

      <FormGroup label="Título" icon={Type} htmlFor="titulo">
        <input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Nombre de la actividad (Ej: Visita al Museo)"
          required
          maxLength={80}
          style={inputStyle}
        />
      </FormGroup>

      {/*<FormGroup label="Descripción" icon={ListChecks} htmlFor="descripcion">
        <textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Detalles de la actividad"
          maxLength={250}
          style={{ ...inputStyle, minHeight: "80px" }}
        />
      </FormGroup>
        */}
         <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            columnGap: "2rem",  // separación horizontal
            rowGap: "1.25rem",  // separación vertical
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
            placeholder="Ej: 1º Bach A"
            required
            style={inputStyle}
          />
        </FormGroup>

      <FormGroup label="Departamento Organizador" icon={Tag} htmlFor="departamento">
        <input
          id="departamento"
          type="text"
          value={departamento}
          onChange={(e) => setDepartamento(e.target.value)}
          placeholder="Ej: Inglés, Lengua, Tecnología..."
          maxLength={80}
          required
          style={inputStyle}
        />
      </FormGroup>


        <FormGroup
          label="Profesorado acompañante"
          icon={Tag}
          htmlFor="profesorAcompanante"
        >
          <input
            id="profesorAcompanante"
            type="text"
            value={profesorAcompanante}
            onChange={(e) => setProfesorAcompanante(e.target.value)}
            placeholder="Nombre del profesor"
            
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
            required
            style={inputStyle}
          />
        </FormGroup>

        <FormGroup label="Fecha de inicio" icon={Calendar} htmlFor="fechaInicio">
          <input
            id="fechaInicio"
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            required
            style={inputStyle}
          />
        </FormGroup>

        <FormGroup label="Hora de inicio" icon={Clock} htmlFor="horaInicio">
          <input
            id="horaInicio"
            type="time"
            value={horaInicio}
            onChange={(e) => {
              setHoraInicio(e.target.value);
              setHoraFinManual(false);
            }}
            required
            style={inputStyle}
          />
        </FormGroup>
        
        <FormGroup label="Fecha de finalización" icon={Calendar} htmlFor="fechaFin">
          <input
            id="fechaFin"
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            required
            style={inputStyle}
          />
        </FormGroup>

        <FormGroup label="Hora de finalización" icon={Clock} htmlFor="horaFin">
          <input
            id="horaFin"
            type="time"
            value={horaFin}
            onChange={(e) => {
              setHoraFin(e.target.value);
              setHoraFinManual(true);
            }}
            required
            style={inputStyle}
          />
        </FormGroup>

        <FormGroup label="Tipo" icon={Info} htmlFor="tipo">
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            style={{ ...inputStyle, appearance: "none" }}
          >
            <option value="complementaria">Complementaria</option>
            <option value="profesorado">Órganos colegiados</option>
            <option value="academica">Académico-administrativa</option>
            <option value="otros">Otros</option>
          </select>
        </FormGroup>
      </div>

<div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            columnGap: "2rem",  // separación horizontal
            rowGap: "1.25rem",  // separación vertical
            borderTop: "1px solid #e5e7eb",
            paddingTop: "1.5rem",
          }}
          >
      <FormGroup label="Descripción" htmlFor="descripcion" icon={Info}>
        <textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Detalles, notas o información adicional"
          style={{
            ...inputStyle,
            minHeight: "70px",
            resize: "vertical"
          }}
        />
      </FormGroup>
</div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2.5rem",
          borderTop: "1px solid #e5e7eb",
          paddingTop: "1.5rem",
        }}
      >
        <button
          type="submit"
          style={{
            backgroundColor: "#0d9488",
            color: "white",
            fontWeight: "600",
            padding: "0.5rem 1.5rem",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            cursor: "pointer",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#0f766e")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#0d9488")
          }
        >
          Guardar Actividad
        </button>

        <button
          type="button"
          onClick={() => window.history.back()}
          style={{
            backgroundColor: "#e5e7eb",
            color: "#374151",
            fontWeight: "600",
            padding: "0.5rem 1.5rem",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            cursor: "pointer",
            transition: "background-color 150ms ease-in-out",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#d1d5db")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
        >
          Cancelar
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
      {Icon && (
        <Icon
          className="w-4 h-4"
          style={{ marginRight: "0.5rem", color: "#14b8a6" }}
        />
      )}
      {label}
    </label>
    {children}
  </div>
);

export default ActivityForm;
