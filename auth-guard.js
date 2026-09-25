/* =========================================================
   PERSONAL COURSE STUDIO
   FIREBASE AUTH GUARD
   =========================================================

   ADMIN
   sakhijahanusha@gmail.com

   MENTOR
   thesnkgraphic@email.com

   ---------------------------------------------------------
   IMPORTANT
   ---------------------------------------------------------
   Firebase Authentication handles login.

   This file only checks whether the logged-in Firebase
   account is authorized for the selected area.
   ========================================================= */


/* =========================================================
   FIREBASE AUTH
   ========================================================= */

import {
  auth
} from "./firebase.js";


import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


/* =========================================================
   ROLE EMAIL CONFIGURATION
   ========================================================= */

const ADMIN_EMAIL =
  "sakhijahanusha@gmail.com";


const MENTOR_EMAIL =
  "thesnkgraphic@email.com";


/* =========================================================
   SESSION KEYS
   ========================================================= */

const SESSION_KEYS = {

  role:
    "personalCourseStudioRole",

  username:
    "personalCourseStudioUsername",

  uid:
    "personalCourseStudioUid",

  adminLoggedIn:
    "personalCourseStudioAdminLoggedIn",

  mentorLoggedIn:
    "personalCourseStudioMentorLoggedIn"

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


  /* -------------------------------------------------------
     ADMIN
     ------------------------------------------------------- */

  if (
    normalizedEmail ===
    ADMIN_EMAIL
  ) {

    return "admin";

  }


  /* -------------------------------------------------------
     MENTOR
     ------------------------------------------------------- */

  if (
    normalizedEmail ===
    MENTOR_EMAIL
  ) {

    return "mentor";

  }


  /* -------------------------------------------------------
     UNKNOWN
     ------------------------------------------------------- */

  return null;

}


/* =========================================================
   CHECK ADMIN
   ========================================================= */

function isAdminUser(user) {

  if (!user) {

    return false;

  }


  return (
    normalizeEmail(user.email) ===
    ADMIN_EMAIL
  );

}


/* =========================================================
   CHECK MENTOR
   ========================================================= */

function isMentorUser(user) {

  if (!user) {

    return false;

  }


  return (
    normalizeEmail(user.email) ===
    MENTOR_EMAIL
  );

}


/* =========================================================
   SAVE SESSION
   ========================================================= */

function saveStudioSession(
  role,
  user
) {

  if (!user) {

    return;

  }


  /* -------------------------------------------------------
     COMMON SESSION
     ------------------------------------------------------- */

  sessionStorage.setItem(
    SESSION_KEYS.role,
    role
  );


  sessionStorage.setItem(
    SESSION_KEYS.username,
    user.email || ""
  );


  sessionStorage.setItem(
    SESSION_KEYS.uid,
    user.uid || ""
  );


  /* -------------------------------------------------------
     ADMIN SESSION
     ------------------------------------------------------- */

  if (
    role === "admin"
  ) {

    sessionStorage.setItem(
      SESSION_KEYS.adminLoggedIn,
      "true"
    );


    sessionStorage.removeItem(
      SESSION_KEYS.mentorLoggedIn
    );

  }


  /* -------------------------------------------------------
     MENTOR SESSION
     ------------------------------------------------------- */

  if (
    role === "mentor"
  ) {

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
    SESSION_KEYS.role
  );


  sessionStorage.removeItem(
    SESSION_KEYS.username
  );


  sessionStorage.removeItem(
    SESSION_KEYS.uid
  );


  sessionStorage.removeItem(
    SESSION_KEYS.adminLoggedIn
  );


  sessionStorage.removeItem(
    SESSION_KEYS.mentorLoggedIn
  );

}


/* =========================================================
   REDIRECT TO LOGIN
   ========================================================= */

function redirectToLogin() {

  clearStudioSession();


  window.location.replace(
    "../login/"
  );

}


/* =========================================================
   GET CURRENT FIREBASE USER
   ========================================================= */

function getCurrentUser() {

  try {

    return auth.currentUser || null;

  }

  catch (error) {

    console.error(
      "Firebase currentUser error:",
      error
    );


    return null;

  }

}


/* =========================================================
   WAIT FOR FIREBASE AUTH
   ========================================================= */

function waitForFirebaseUser() {

  return new Promise(
    (resolve) => {

      /* ---------------------------------------------------
         FIRST CHECK
         --------------------------------------------------- */

      const existingUser =
        getCurrentUser();


      if (existingUser) {

        resolve(
          existingUser
        );

        return;

      }


      /* ---------------------------------------------------
         LISTENER
         --------------------------------------------------- */

      let finished =
        false;


      let unsubscribe =
        null;


      let timeoutId =
        null;


      function finish(user) {

        if (finished) {

          return;

        }


        finished =
          true;


        /* -----------------------------------------------
           CLEAR TIMEOUT
           ----------------------------------------------- */

        if (timeoutId) {

          clearTimeout(
            timeoutId
          );

        }


        /* -----------------------------------------------
           REMOVE LISTENER
           ----------------------------------------------- */

        if (
          typeof unsubscribe ===
          "function"
        ) {

          try {

            unsubscribe();

          }

          catch (error) {

            console.warn(
              "Firebase unsubscribe error:",
              error
            );

          }

        }


        resolve(
          user || null
        );

      }


      /* ---------------------------------------------------
         AUTH LISTENER
         --------------------------------------------------- */

      try {

        unsubscribe =
          onAuthStateChanged(
            auth,

            (user) => {

              finish(
                user
              );

            },

            (error) => {

              console.error(
                "Firebase auth state error:",
                error
              );


              finish(
                getCurrentUser()
              );

            }

          );

      }

      catch (error) {

        console.error(
          "Firebase auth listener error:",
          error
        );


        finish(
          getCurrentUser()
        );


        return;

      }


      /* ---------------------------------------------------
         SAFETY TIMEOUT
         --------------------------------------------------- */

      timeoutId =
        setTimeout(
          () => {

            console.warn(
              "Firebase authentication timeout."
            );


            finish(
              getCurrentUser()
            );

          },

          8000

        );

    }
  );

}


/* =========================================================
   PROTECT ADMIN
   ========================================================= */

export async function protectAdmin() {

  console.log(
    "Checking Admin authentication..."
  );


  const user =
    await waitForFirebaseUser();


  /* -------------------------------------------------------
     NO USER
     ------------------------------------------------------- */

  if (!user) {

    console.warn(
      "No Firebase user found for Admin."
    );


    redirectToLogin();


    throw new Error(
      "Admin authentication required."
    );

  }


  /* -------------------------------------------------------
     CHECK ADMIN EMAIL
     ------------------------------------------------------- */

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
      "Unauthorized Admin account:",
      email
    );


    clearStudioSession();


    try {

      await signOut(
        auth
      );

    }

    catch (error) {

      console.error(
        "Firebase Admin sign-out error:",
        error
      );

    }


    redirectToLogin();


    throw new Error(
      "Unauthorized Admin account."
    );

  }


  /* -------------------------------------------------------
     SAVE ADMIN SESSION
     ------------------------------------------------------- */

  saveStudioSession(
    "admin",
    user
  );


  console.log(
    "Admin authenticated successfully:",
    email
  );


  return user;

}


/* =========================================================
   PROTECT MENTOR
   ========================================================= */

export async function protectMentor() {

  console.log(
    "Checking Mentor authentication..."
  );


  const user =
    await waitForFirebaseUser();


  /* -------------------------------------------------------
     NO USER
     ------------------------------------------------------- */

  if (!user) {

    console.warn(
      "No Firebase user found for Mentor."
    );


    redirectToLogin();


    throw new Error(
      "Mentor authentication required."
    );

  }


  /* -------------------------------------------------------
     CHECK MENTOR EMAIL
     ------------------------------------------------------- */

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
      "Unauthorized Mentor account:",
      email
    );


    clearStudioSession();


    try {

      await signOut(
        auth
      );

    }

    catch (error) {

      console.error(
        "Firebase Mentor sign-out error:",
        error
      );

    }


    redirectToLogin();


    throw new Error(
      "Unauthorized Mentor account."
    );

  }


  /* -------------------------------------------------------
     SAVE MENTOR SESSION
     ------------------------------------------------------- */

  saveStudioSession(
    "mentor",
    user
  );


  console.log(
    "Mentor authenticated successfully:",
    email
  );


  return user;

}


/* =========================================================
   LOGOUT
   ========================================================= */

export async function logoutStudio() {

  console.log(
    "Logging out from Personal Course Studio..."
  );


  try {

    await signOut(
      auth
    );

  }

  catch (error) {

    console.error(
      "Firebase logout error:",
      error
    );

  }


  /* -------------------------------------------------------
     CLEAR LOCAL SESSION
     ------------------------------------------------------- */

  clearStudioSession();


  /* -------------------------------------------------------
     GO TO LOGIN
     ------------------------------------------------------- */

  window.location.replace(
    "../login/"
  );

}


/* =========================================================
   GET CURRENT ROLE
   ========================================================= */

export function getCurrentRole() {

  const user =
    getCurrentUser();


  if (!user) {

    return null;

  }


  return getRoleFromEmail(
    user.email
  );

}


/* =========================================================
   GET CURRENT USERNAME / EMAIL
   ========================================================= */

export function getCurrentUsername() {

  const user =
    getCurrentUser();


  if (!user) {

    return "";

  }


  return user.email || "";

}


/* =========================================================
   GET CURRENT UID
   ========================================================= */

export function getCurrentUid() {

  const user =
    getCurrentUser();


  if (!user) {

    return "";

  }


  return user.uid || "";

}


/* =========================================================
   IS CURRENT USER ADMIN
   ========================================================= */

export function isAdmin() {

  const user =
    getCurrentUser();


  return isAdminUser(
    user
  );

}


/* =========================================================
   IS CURRENT USER MENTOR
   ========================================================= */

export function isMentor() {

  const user =
    getCurrentUser();


  return isMentorUser(
    user
  );

}


/* =========================================================
   SAVE SESSION — PUBLIC
   ========================================================= */

export {
  saveStudioSession
};


/* =========================================================
   CLEAR SESSION — PUBLIC
   ========================================================= */

export {
  clearStudioSession
};


/* =========================================================
   ROLE HELPERS — PUBLIC
   ========================================================= */

export {
  getRoleFromEmail
};


/* =========================================================
   EMAIL CONSTANTS — PUBLIC
   ========================================================= */

export {
  ADMIN_EMAIL,
  MENTOR_EMAIL
};


/* =========================================================
   END OF AUTH GUARD
   ========================================================= */
