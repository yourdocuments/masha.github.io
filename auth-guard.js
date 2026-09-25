/* =========================================================
   MASHA LIVE
   AUTH GUARD
   =========================================================
   ADMIN  : sakhijahanusha@gmail.com
   MENTOR : thesnkgraphic@email.com
   ========================================================= */

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import { auth } from "./firebase.js";


/* =========================================================
   ROLE CONFIGURATION
   ========================================================= */

const ADMIN_EMAIL =
  "sakhijahanusha@gmail.com";

const MENTOR_EMAIL =
  "thesnkgraphic@email.com";


/* =========================================================
   SESSION KEYS
   ========================================================= */

const SESSION_KEYS = {

  adminLoggedIn:
    "personalCourseStudioAdminLoggedIn",

  mentorLoggedIn:
    "personalCourseStudioMentorLoggedIn",

  role:
    "personalCourseStudioRole",

  username:
    "personalCourseStudioUsername"

};


/* =========================================================
   NORMALIZE EMAIL
   ========================================================= */

function normalizeEmail(email) {

  return String(email || "")
    .trim()
    .toLowerCase();

}


/* =========================================================
   GET ROLE FROM EMAIL
   ========================================================= */

function getRoleFromEmail(email) {

  const normalizedEmail =
    normalizeEmail(email);

  if (
    normalizedEmail ===
    ADMIN_EMAIL
  ) {

    return "admin";

  }

  if (
    normalizedEmail ===
    MENTOR_EMAIL
  ) {

    return "mentor";

  }

  return null;

}


/* =========================================================
   SAVE SESSION
   ========================================================= */

function saveStudioSession(
  role,
  user
) {

  sessionStorage.setItem(
    SESSION_KEYS.role,
    role
  );

  sessionStorage.setItem(
    SESSION_KEYS.username,
    user?.email || ""
  );


  if (role === "admin") {

    sessionStorage.setItem(
      SESSION_KEYS.adminLoggedIn,
      "true"
    );

    sessionStorage.removeItem(
      SESSION_KEYS.mentorLoggedIn
    );

  }


  if (role === "mentor") {

    sessionStorage.setItem(
      SESSION_KEYS.mentorLoggedIn,
      "true"
    );

    sessionStorage.removeItem(
      SESSION_KEYS.adminLoggedIn
    );

  }

}


/* =========================================================
   CLEAR SESSION
   ========================================================= */

function clearStudioSession() {

  sessionStorage.removeItem(
    SESSION_KEYS.adminLoggedIn
  );

  sessionStorage.removeItem(
    SESSION_KEYS.mentorLoggedIn
  );

  sessionStorage.removeItem(
    SESSION_KEYS.role
  );

  sessionStorage.removeItem(
    SESSION_KEYS.username
  );

}


/* =========================================================
   REDIRECT TO LOGIN
   ========================================================= */

function redirectToLogin() {

  window.location.replace(
    "../login/"
  );

}


/* =========================================================
   WAIT FOR FIREBASE AUTH
   ========================================================= */

function waitForFirebaseUser() {

  return new Promise(
    (resolve, reject) => {

      let finished = false;


      const unsubscribe =
        onAuthStateChanged(
          auth,
          (user) => {

            if (finished) {
              return;
            }

            finished = true;

            unsubscribe();


            if (!user) {

              reject(
                new Error(
                  "Firebase user is not signed in."
                )
              );

              return;

            }


            resolve(user);

          }
        );

    }
  );

}


/* =========================================================
   PROTECT ADMIN PAGE
   ========================================================= */

async function protectAdmin() {

  try {

    const user =
      await waitForFirebaseUser();


    const email =
      normalizeEmail(
        user.email
      );


    console.log(
      "Admin authentication check:",
      email
    );


    if (
      email !==
      ADMIN_EMAIL
    ) {

      console.warn(
        "This Firebase account is not authorized as Admin:",
        email
      );


      clearStudioSession();


      await signOut(auth);


      redirectToLogin();


      throw new Error(
        "Unauthorized Admin account."
      );

    }


    saveStudioSession(
      "admin",
      user
    );


    console.log(
      "Admin authenticated:",
      email
    );


    return user;

  }

  catch (error) {

    console.error(
      "Admin authentication failed:",
      error
    );


    clearStudioSession();


    throw error;

  }

}


/* =========================================================
   PROTECT MENTOR PAGE
   ========================================================= */

async function protectMentor() {

  try {

    const user =
      await waitForFirebaseUser();


    const email =
      normalizeEmail(
        user.email
      );


    console.log(
      "Mentor authentication check:",
      email
    );


    if (
      email !==
      MENTOR_EMAIL
    ) {

      console.warn(
        "This Firebase account is not authorized as Mentor:",
        email
      );


      clearStudioSession();


      await signOut(auth);


      redirectToLogin();


      throw new Error(
        "Unauthorized Mentor account."
      );

    }


    saveStudioSession(
      "mentor",
      user
    );


    console.log(
      "Mentor authenticated:",
      email
    );


    return user;

  }

  catch (error) {

    console.error(
      "Mentor authentication failed:",
      error
    );


    clearStudioSession();


    throw error;

  }

}


/* =========================================================
   GET CURRENT ROLE
   ========================================================= */

function getCurrentRole() {

  return sessionStorage.getItem(
    SESSION_KEYS.role
  ) || null;

}


/* =========================================================
   GET CURRENT USER EMAIL
   ========================================================= */

function getCurrentUsername() {

  return sessionStorage.getItem(
    SESSION_KEYS.username
  ) || "";

}


/* =========================================================
   GET FIREBASE USER
   ========================================================= */

function getCurrentUser() {

  return auth.currentUser || null;

}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logoutStudio() {

  try {

    await signOut(auth);

  }

  catch (error) {

    console.error(
      "Firebase logout error:",
      error
    );

  }

  finally {

    clearStudioSession();

    window.location.replace(
      "../login/"
    );

  }

}


/* =========================================================
   CHECK ADMIN
   ========================================================= */

function isAdmin() {

  const user =
    auth.currentUser;


  if (!user) {
    return false;
  }


  return (
    normalizeEmail(
      user.email
    ) === ADMIN_EMAIL
  );

}


/* =========================================================
   CHECK MENTOR
   ========================================================= */

function isMentor() {

  const user =
    auth.currentUser;


  if (!user) {
    return false;
  }


  return (
    normalizeEmail(
      user.email
    ) === MENTOR_EMAIL
  );

}


/* =========================================================
   EXPORT
   ========================================================= */

export {

  ADMIN_EMAIL,

  MENTOR_EMAIL,

  protectAdmin,

  protectMentor,

  logoutStudio,

  getCurrentRole,

  getCurrentUsername,

  getCurrentUser,

  isAdmin,

  isMentor,

  saveStudioSession,

  clearStudioSession,

  getRoleFromEmail

};
