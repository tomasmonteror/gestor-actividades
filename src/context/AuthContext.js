// src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';

import { onAuthStateChanged } from 'firebase/auth';

import auth, { getUserRole } from '../firebase/auth';


// 1. Crear el Contexto

export const AuthContext = createContext({

  currentUser: null,

  currentRole: null,

  loading: true,

  // ¡ELIMINAMOS loginUser y logoutUser de aquí!

  // loginUser: () => {},

  // logoutUser: () => {}

});


export const useAuth = () => {

  return useContext(AuthContext);

};


export const AuthProvider = ({ children }) => {

  const [currentUser, setCurrentUser] = useState(null);

  const [currentRole, setCurrentRole] = useState(null);

  const [loading, setLoading] = useState(true);


  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (user) => {

      setCurrentUser(user);


      if (user) {

        const role = await getUserRole(user);

        setCurrentRole(role);

      } else {

        setCurrentRole(null);

      }

      setLoading(false);

    });

    return unsubscribe;

  }, []);


  // ¡ELIMINAMOS las funciones loginUser y logoutUser de aquí!

  // const loginUser = (user, role) => {

  //   setCurrentUser(user);

  //   setCurrentRole(role);

  // };

  // const logoutUser = () => {

  //   setCurrentUser(null);

  //   setCurrentRole(null);

  // };



  // Objeto con los valores que estarán disponibles para los componentes hijos

  const value = {

    currentUser,

    currentRole,

    loading,

    // ¡ELIMINAMOS loginUser y logoutUser de este objeto!

    // loginUser,

    // logoutUser

  };


  return (

    <AuthContext.Provider value={value}>

      {!loading && children}

      {loading && <div>Cargando autenticación...</div>}

    </AuthContext.Provider>

  );

};
