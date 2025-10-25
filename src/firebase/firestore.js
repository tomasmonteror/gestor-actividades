// src/firebase/firestore.js

import { getFirestore, collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

import app from "./config";


const db = getFirestore(app);


const mapSnapshotToData = (snapshot) => {

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

};



// Función para obtener todas las actividades en rango de fechas

export const getActividadesSemana = async (startISO, endISO) => {

  const q = query(

    collection(db, "actividades"),

    where("inicio_iso", ">=", startISO),

    where("inicio_iso", "<=", endISO)

  );

  const snapshot = await getDocs(q);

  return mapSnapshotToData(snapshot);

};



// --- LAS FUNCIONES getProfesores Y getLugares YA NO SON NECESARIAS ---

// Si en el futuro necesitas una lista predefinida de profesores, grupos o lugares,

// las puedes volver a añadir, pero ya no para las actividades.


// Funciones CRUD (sin cambios)

export const addActividad = async (actividad) => {

  return await addDoc(collection(db, "actividades"), actividad);

};

export const updateActividad = async (id, datos) => {

  const ref = doc(db, "actividades", id);

  return await updateDoc(ref, datos);

};

export const deleteActividad = async (id) => {

  const ref = doc(db, "actividades", id);

  return await deleteDoc(ref);

};

// --- FUNCIONES CRUD PARA USUARIOS (para gestión de admin) ---


export const getUsers = async () => {

  const q = query(collection(db, "usuarios")); // Colección donde se guardan los perfiles de usuario y roles

  const snapshot = await getDocs(q);

  return mapSnapshotToData(snapshot);

};


export const updateUserRole = async (uid, newRole) => {

  const userRef = doc(db, "usuarios", uid);

  return await updateDoc(userRef, { role: newRole });

};


export default db;
