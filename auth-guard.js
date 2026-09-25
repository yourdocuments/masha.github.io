/* =========================================================
   PERSONAL COURSE STUDIO
   FIREBASE AUTH GUARD — FIXED VERSION

   Admin:
   admin@snkitinstitute.com

   Mentor:
   mentor@snkitinstitute.com
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
  "admin@snkitinstitute.com";

const MENTOR_EMAIL =
  "mentor@snkitinstitute.com";


/* =========================================================
   HELPERS
   ========================================================= */

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}


function getRoleFromUser(user) {

  if (!user || !user.email) {
    return null;
  }

  const email =
    normalizeEmail(user.email);

  if (email === ADMIN_EMAIL) {
    return "admin";
  }

  if (email === MENTOR_EMAIL) {
    return "mentor";
  }

  return null;
}


/* =========================================================
   SESSION
   ========================================================= */

function saveSession(role, user) {

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


  if (role === "admin") {

    sessionStorage.setItem(
      "personalCourseStudioAdminLoggedIn",
      "true"
    );

    sessionStorage.removeItem(
      "personalCourseStudioMentorLoggedIn"
    );

  } else if (role === "mentor") {

    sessionStorage.setItem(
      "personalCourseStudioMentorLoggedIn",
      "true"
    );

    sessionStorage.removeItem(
      "personalCourseStudioAdminLoggedIn"
    );
  }
}


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
   LOGIN REDIRECT
   ========================================================= */

function redirectToLogin() {

  clearSession();

  window.location.replace(
    "../login/"
  );
}


/* =========================================================
   WAIT FOR FIREBASE AUTH
   ========================================================= */

function waitForAuth() {

  return new Promise((resolve) => {

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

          resolve(user || null);
        }
      );


    /*
      Safety timeout.

      Firebase normally responds very quickly.
      If something blocks auth state, we stop
      the page from remaining stuck forever.
    */

    setTimeout(() => {

      if (finished) {
        return;
      }

      finished = true;

      unsubscribe();

      resolve(
        auth.currentUser || null
      );

    }, 10000);

  });
}


/* =========================================================
   ADMIN PROTECTION
   ========================================================= */

export async function protectAdmin() {

  const user =
    await waitForAuth();


  /* No Firebase user */

  if (!user) {

    redirectToLogin();

    throw new Error(
      "Authentication required."
    );
  }


  /* Check authorized role */

  const role =
    getRoleFromUser(user);


  if (role !== "admin") {

    console.warn(
      "Unauthorized Admin access:",
      user.email
    );


    clearSession();


    try {

      await signOut(auth);

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


  /* Save valid session */

  saveSession(
    "admin",
    user
  );


  return user;
}


/* =========================================================
   MENTOR PROTECTION
   ========================================================= */

export async function protectMentor() {

  const user =
    await waitForAuth();


  /* No Firebase user */

  if (!user) {

    redirectToLogin();

    throw new Error(
      "Authentication required."
    );
  }


  /* Check authorized role */

  const role =
    getRoleFromUser(user);


  if (role !== "mentor") {

    console.warn(
      "Unauthorized Mentor access:",
      user.email
    );


    clearSession();


    try {

      await signOut(auth);

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


  /* Save valid session */

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

    await signOut(auth);

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

export function getCurrentRole(user) {

  return getRoleFromUser(user);
}


export function getCurrentUser() {

  return auth.currentUser;
}
