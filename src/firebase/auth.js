// src/firebase/auth.js
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore"; // <-- Importa getDoc y setDoc
import app from "./config";
import db from "./firestore"; // Importa la instancia de Firestore

const auth = getAuth(app);

// Función auxiliar para obtener el rol del usuario desde Firestore
// Ahora esta función NO ASUME que request.auth.uid ya es el usuario.
// Recibe el 'user' directamente de los resultados de Auth.
export const getUserRole = async (user) => { // <-- Cambiado para recibir el objeto 'user'
  if (!user || !user.uid) return null;

  const userRef = doc(db, "usuarios", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data().role;
  } else {
    // Si el documento NO existe (posiblemente un usuario nuevo que acaba de registrarse),
    // lo crea con un rol por defecto 'teacher'.
    console.warn(`No se encontró el documento de usuario para UID: ${user.uid}. Creando con rol por defecto 'student' 
      (Invitado).`);
    // Asegurarse de que el email esté disponible.
    await setDoc(userRef, { role: 'student', email: user.email || 'unknown' });
    return 'estudiante';
  }
};

// Modificamos la función de registro
export const register = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // AQUI ES CRÍTICO: Creamos el documento en Firestore si no existe.
    // La función getUserRole ya se encarga de esto, así que podemos simplificar.
    // Opcional: Podrías llamar a setDoc directamente aquí para asegurar que el documento se crea
    // ANTES de que cualquier otra lectura intente acceder a él.
    await setDoc(doc(db, "usuarios", user.uid), {
        email: user.email,
        role: "student", // ROL POR DEFECTO al registrarse
        createdAt: new Date()
    }, { merge: true }); // Usamos merge:true por si ya existiera el documento con algun dato.

    // Ahora, obtenemos el rol (que acabamos de guardar o que ya existía)
    const role = await getUserRole(user); // <-- Pasamos el objeto 'user' completo
    return { user, role };
  } catch (error) {
    throw error;
  }
};

// Modificamos la función de login
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Una vez autenticado, obtenemos su rol desde Firestore
    // Aseguramos que el documento del rol exista, si no, lo crea con 'student'.
    const role = await getUserRole(user); // <-- Pasamos el objeto 'user' completo
    return { user, role };
  } catch (error) {
    throw error;
  }
};

// --- CAMBIOS AQUÍ: EXPORTAR LAS FUNCIONES ---

export const logout = () => signOut(auth); // <--- Añade 'export const'


/**

 * Envía un email de restablecimiento de contraseña al email proporcionado.

 * @param {string} email - El email del usuario.

 */

export const sendPasswordReset = async (email) => { // <--- Añade 'export const'

  return await sendPasswordResetEmail(auth, email);

};


/**

 * Confirma el restablecimiento de contraseña con el código recibido en el email y la nueva contraseña.

 * @param {string} code - El código de acción de Firebase del enlace del email.

 * @param {string} newPassword - La nueva contraseña para el usuario.

 */

export const confirmNewPassword = async (code, newPassword) => { // <--- Añade 'export const'

  return await confirmPasswordReset(auth, code, newPassword);

};

// --- FIN CAMBIOS ---


export default auth;
