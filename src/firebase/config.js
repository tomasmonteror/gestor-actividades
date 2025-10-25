// src/firebase/config.js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyBLTByYoyBG67yIIwiDU5H9b6zFWpHFkAc",
    authDomain: "actividades-ies.firebaseapp.com",
    projectId: "actividades-ies",
    storageBucket: "actividades-ies.firebasestorage.app",
    messagingSenderId: "17602087465",
    appId: "1:17602087465:web:cbb6a388126c5ce2fcaa38",
    measurementId: "G-HVG5HEN5LT"
};

const app = initializeApp(firebaseConfig);

export default app;
