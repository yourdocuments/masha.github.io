/* =========================================================
   PERSONAL COURSE STUDIO
   FIREBASE AUTH GUARD

   Separate accounts:

   Admin:
   sakhijahanusha@gmail.com

   Mentor:
   thesnkgraphic@email.com
   ========================================================= */

import {
  auth
} from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


/* =========================================================
   AUTHORIZED ACCOUNTS
   ========================================================= */

const ADMIN_EMAIL =
  "sakhijahanusha@gmail.com";

const MENTOR_EMAIL =
  "thesnkgraphic@email.com";


/* =========================================================
   NORMALIZE EMAIL
   ========================================================= */

function normalizeEmail(email) {

  return String(email || "")
    .trim()
    .toLowerCase();

}


/* =========================================================
   GET ROLE FROM USER
   ========================================================= */

function getRoleFromUser(user) {

  if (!user) {
    return null;
  }

  const email =
    normalizeEmail(user.email);


  if (
    email === ADMIN_EMAIL
  ) {

    return "admin";

  }


  if (
    email === MENTOR_EMAIL
  ) {

    return "mentor";

  }


  return null;

}


/* =========================================================
   SAVE SESSION
   ========================================================= */

function saveSession(
  role,
  user
) {

  sessionStorage.setItem(
    "personalCourseStudioRole",
    role
  );


  sessionStorage.setItem(
    "personalCourseStudioUsername",
    role
  );


  sessionStorage.setItem(
    "personalCourseStudioUid",
    user.uid
  );


  if (
    role === "admin"
  ) {

    sessionStorage.setItem(
      "personalCourseStudioAdminLoggedIn",
      "true"
    );


    sessionStorage.removeItem(
      "personalCourseStudioMentorLoggedIn"
    );

  }


  if (
    role === "mentor"
  ) {

    sessionStorage.setItem(
      "personalCourseStudioMentorLoggedIn",
      "true"
    );


    sessionStorage.removeItem(
      "personalCourseStudioAdminLoggedIn"
    );

  }

}


/* =========================================================
   CLEAR SESSION
   ========================================================= */

function clearSession() {

  sessionStorage.removeItem(
    "personalCourseStudioRole"
  );


  sessionStorage.removeItem(
    "personalCourseStudioUsername"
  );


  sessionStorage.removeItem(
    "personalCourseStudioUid"
  );


  sessionStorage.removeItem(
    "personalCourseStudioAdminLoggedIn"
  );


  sessionStorage.removeItem(
    "personalCourseStudioMentorLoggedIn"
  );

}


/* =========================================================
   REDIRECT LOGIN
   ========================================================= */

function redirectToLogin() {

  clearSession();


  window.location.replace(
    "../login/"
  );

}


/* =========================================================
   GET CURRENT AUTH USER
   ========================================================= */

function getExistingUser() {

  try {

    if (
      auth &&
      auth.currentUser
    ) {

      return auth.currentUser;

    }

  } catch (error) {

    console.error(
      "Firebase currentUser error:",
      error
    );

  }


  return null;

}


/* =========================================================
   WAIT FOR FIREBASE AUTH
   ========================================================= */

function waitForAuth() {

  return new Promise(
    (resolve) => {

      /* ---------------------------------------------
         FIRST CHECK
         --------------------------------------------- */

      const existingUser =
        getExistingUser();


      if (existingUser) {

        resolve(
          existingUser
        );

        return;

      }


      /* ---------------------------------------------
         LISTENER
         --------------------------------------------- */

      let finished = false;

      let unsubscribe = null;

      let timeoutId = null;


      const finish = (
        user
      ) => {

        if (finished) {
          return;
        }


        finished = true;


        if (timeoutId) {

          clearTimeout(
            timeoutId
          );

        }


        if (
          typeof unsubscribe ===
          "function"
        ) {

          try {

            unsubscribe();

          } catch {}

        }


        resolve(
          user || null
        );

      };


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
                "onAuthStateChanged error:",
                error
              );

              finish(
                getExistingUser()
              );

            }
          );

      } catch (error) {

        console.error(
          "Firebase auth listener error:",
          error
        );


        finish(
          getExistingUser()
        );


        return;

      }


      /* ---------------------------------------------
         SAFETY TIMEOUT
         --------------------------------------------- */

      timeoutId =
        setTimeout(
          () => {

            console.warn(
              "Firebase authentication timeout."
            );


            finish(
              getExistingUser()
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

  const user =
    await waitForAuth();


  if (!user) {

    redirectToLogin();

    throw new Error(
      "Authentication required."
    );

  }


  const role =
    getRoleFromUser(
      user
    );


  if (
    role !== "admin"
  ) {

    console.warn(
      "Unauthorized Admin access:",
      user.email
    );


    clearSession();


    try {

      await signOut(
        auth
      );

    } catch (error) {

      console.error(
        "Firebase sign out error:",
        error
      );

    }


    redirectToLogin();


    throw new Error(
      "Admin authorization required."
    );

  }


  saveSession(
    "admin",
    user
  );


  return user;

}


/* =========================================================
   PROTECT MENTOR
   ========================================================= */

export async function protectMentor() {

  const user =
    await waitForAuth();


  if (!user) {

    console.warn(
      "No Firebase user found for Mentor."
    );


    redirectToLogin();


    throw new Error(
      "Mentor authentication required."
    );

  }


  const role =
    getRoleFromUser(
      user
    );


  if (
    role !== "mentor"
  ) {

    console.warn(
      "Unauthorized Mentor access:",
      user.email
    );


    clearSession();


    try {

      await signOut(
        auth
      );

    } catch (error) {

      console.error(
        "Firebase sign out error:",
        error
      );

    }


    redirectToLogin();


    throw new Error(
      "Mentor authorization required."
    );

  }


  saveSession(
    "mentor",
    user
  );


  return user;

}


/* =========================================================
   LOGOUT
   ========================================================= */

export async function logoutStudio() {

  try {

    await signOut(
      auth
    );

  } catch (error) {

    console.error(
      "Firebase logout error:",
      error
    );

  }


  clearSession();


  window.location.replace(
    "../login/"
  );

}


/* =========================================================
   PUBLIC HELPERS
   ========================================================= */

export function getCurrentRole(
  user
) {

  return getRoleFromUser(
    user
  );

}


export function getCurrentUser() {

  return getExistingUser();

}
