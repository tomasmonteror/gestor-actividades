import React, { useState, useMemo } from "react";

const FiltersBar = ({
    grupos = [],
    profesores = [],
    lugares = [],
    onFiltroCambio
}) => {
    const [grupo, setGrupo] = useState("");
    const [profesor, setProfesor] = useState("");
    const [lugar, setLugar] = useState("");

    // Construir un filtro “limpio” para la próxima llamada
    const aplicaFiltro = () => {
        const f = { grupo, profesor, lugar };
        onFiltroCambio?.(f);
    };

    // Efecto para limpiar filtros
    const limpiar = () => {
        setGrupo("");
        setProfesor("");
        setLugar("");
        onFiltroCambio?.({ grupo: "", profesor: "", lugar: "" });
    };

    // Opcional: renderizar etiquetas con opciones
    return (
        <div className="filters-bar" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ minWidth: 180 }}>
                <label>Grupo</label>
                <select value={grupo} onChange={(e) => { setGrupo(e.target.value); }} style={{ width: "100%" }}>
                    <option value="">Todos los grupos</option>
                    {grupos.map((g) => (
                        <option key={g.id} value={g.id}>{g.nombre}</option>
                    ))}
                </select>
            </div>
            <div style={{ minWidth: 180 }}>
                <label>Profesor</label>
                <select value={profesor} onChange={(e) => { setProfesor(e.target.value); }} style={{ width: "100%" }}>
                    <option value="">Todos los profesores</option>
                    {profesores.map((p) => (
                        <option key={p.id} value={p.id}>{p.nombre || p.email}</option>
                    ))}
                </select>
            </div>

            <div style={{ minWidth: 180 }}>
                <label>Lugar</label>
                <select value={lugar} onChange={(e) => { setLugar(e.target.value); }} style={{ width: "100%" }}>
                    <option value="">Todos los lugares</option>
                    {lugares.map((l) => (
                        <option key={l.id} value={l.id}>{l.nombre}</option>
                    ))}
                </select>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <button type="button" onClick={aplicaFiltro}>Aplicar</button>
                <button type="button" onClick={limpiar}>Limpiar</button>
            </div>
        </div>
    );
};

export default FiltersBar;