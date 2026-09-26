/* =========================================================
   MASHA LIVE
   FIREBASE CONFIGURATION
   ========================================================= */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
  getStorage
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";


/* =========================================================
   FIREBASE CONFIG
   ========================================================= */

const firebaseConfig = {

  apiKey:
    "AIzaSyBUNXeCxRBk6b0_llJliCozY4h9birfEfk",

  authDomain:
    "mashalive-bd2ea.firebaseapp.com",

  projectId:
    "mashalive-bd2ea",

  storageBucket:
    "mashalive-bd2ea.firebasestorage.app",

  messagingSenderId:
    "941107536088",

  appId:
    "1:941107536088:web:e1c27f3c526c530eb577ad",

  measurementId:
    "G-QGYGD52L0Z"

};


/* =========================================================
   INITIALIZE FIREBASE
   ========================================================= */

const app =
  initializeApp(
    firebaseConfig
  );


/* =========================================================
   AUTH
   ========================================================= */

const auth =
  getAuth(
    app
  );


/* =========================================================
   FIRESTORE
   ========================================================= */

const db =
  getFirestore(
    app
  );


/* =========================================================
   STORAGE
   ========================================================= */

const storage =
  getStorage(
    app
  );


/* =========================================================
   EXPORT EVERYTHING
   ========================================================= */

export {

  app,

  auth,

  db,

  storage

};
