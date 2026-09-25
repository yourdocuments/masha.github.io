/* =========================================================
   PERSONAL COURSE STUDIO
   FIREBASE AUTH GUARD
   =========================================================

   Admin:
   admin@snkitinstitute.com

   Mentor:
   mentor@snkitinstitute.com

   Protects:
   /admin/
   /mentor/

   Firebase Auth + Firestore Role Check
   ========================================================= */

import {
  auth,
  db
} from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/* =========================================================
   CONFIG
   ========================================================= */

const LOGIN_PATH = "../login/";

const ADMIN_EMAIL =
  "admin@snkitinstitute.com";

const MENTOR_EMAIL =
  "mentor@snkitinstitute.com";


/* =========================================================
   NORMALIZE EMAIL
   ========================================================= */

function normalizeEmail(email) {

  return String(email || "")
    .trim()
    .toLowerCase();

}


/* =========================================================
   GET ROLE FROM FIRESTORE
   ========================================================= */

async function getFirestoreRole(user) {

  if (!user || !user.uid) {
    return null;
  }

  try {

    const userRef =
      doc(
        db,
        "users",
        user.uid
      );

    const userSnap =
      await getDoc(userRef);

    if (!userSnap.exists()) {

      console.warn(
        "No role document found for:",
        user.uid
      );

      return null;
    }

    const data =
      userSnap.data();

    const role =
      String(
        data.role || ""
      )
        .trim()
        .toLowerCase();

    if (
      role === "admin" ||
      role === "mentor"
    ) {

      return role;
    }

    return null;

  } catch (error) {

    console.error(
      "Firestore role check failed:",
      error
    );

    return null;
  }
}


/* =========================================================
   EMAIL FALLBACK
   =========================================================

   This is only a fallback during migration.

   Main role source:
   Firestore users/{uid}.role
   ========================================================= */

function getEmailRole(user) {

  if (!user || !user.email) {
    return null;
  }

  const email =
    normalizeEmail(
      user.email
    );

  if (
    email ===
    ADMIN_EMAIL
  ) {

    return "admin";
  }

  if (
    email ===
    MENTOR_EMAIL
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


  /* -------------------------------------------------------
     ADMIN
     ------------------------------------------------------- */

  if (role === "admin") {

    sessionStorage.setItem(
      "personalCourseStudioAdminLoggedIn",
      "true"
    );

    sessionStorage.removeItem(
      "personalCourseStudioMentorLoggedIn"
    );
  }


  /* -------------------------------------------------------
     MENTOR
     ------------------------------------------------------- */

  if (role === "mentor") {

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
   REDIRECT TO LOGIN
   ========================================================= */

function redirectToLogin() {

  clearSession();

  window.location.replace(
    LOGIN_PATH
  );
}


/* =========================================================
   CHECK USER
   ========================================================= */

async function checkUser() {

  return new Promise((resolve) => {

    onAuthStateChanged(
      auth,
      async (user) => {

        /* -------------------------------------------------
           NOT LOGGED IN
           ------------------------------------------------- */

        if (!user) {

          redirectToLogin();

          return;
        }


        console.log(
          "Firebase user:",
          user.email
        );


        /* -------------------------------------------------
           FIRESTORE ROLE
           ------------------------------------------------- */

        let role =
          await getFirestoreRole(
            user
          );


        /* -------------------------------------------------
           TEMPORARY EMAIL FALLBACK
           ------------------------------------------------- */

        if (!role) {

          role =
            getEmailRole(
              user
            );
        }


        /* -------------------------------------------------
           UNKNOWN USER
           ------------------------------------------------- */

        if (!role) {

          console.warn(
            "Unauthorized Firebase account:",
            user.email
          );

          try {

            await signOut(
              auth
            );

          } catch (error) {

            console.error(
              "Sign out error:",
              error
            );
          }

          clearSession();

          redirectToLogin();

          return;
        }


        /* -------------------------------------------------
           SAVE VALID SESSION
           ------------------------------------------------- */

        saveSession(
          role,
          user
        );


        console.log(
          "Authenticated role:",
          role
        );


        resolve({
          user,
          role
        });

      }
    );

  });
}


/* =========================================================
   PROTECT ADMIN
   ========================================================= */

export function protectAdmin() {

  return new Promise((resolve) => {

    checkUser()
      .then(
        ({
          user,
          role
        }) => {

          if (
            role !== "admin"
          ) {

            console.warn(
              "Admin access denied:",
              user.email
            );

            clearSession();

            signOut(
              auth
            ).finally(() => {

              redirectToLogin();

            });

            return;
          }


          console.log(
            "Admin access granted:",
            user.email
          );


          resolve(
            user
          );

        }
      )
      .catch(
        (error) => {

          console.error(
            "Admin authentication error:",
            error
          );

          redirectToLogin();

        }
      );

  });
}


/* =========================================================
   PROTECT MENTOR
   ========================================================= */

export function protectMentor() {

  return new Promise((resolve) => {

    checkUser()
      .then(
        ({
          user,
          role
        }) => {

          if (
            role !== "mentor"
          ) {

            console.warn(
              "Mentor access denied:",
              user.email
            );

            clearSession();

            signOut(
              auth
            ).finally(() => {

              redirectToLogin();

            });

            return;
          }


          console.log(
            "Mentor access granted:",
            user.email
          );


          resolve(
            user
          );

        }
      )
      .catch(
        (error) => {

          console.error(
            "Mentor authentication error:",
            error
          );

          redirectToLogin();

        }
      );

  });
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
    LOGIN_PATH
  );
}


/* =========================================================
   GET CURRENT ROLE
   ========================================================= */

export async function getCurrentRole() {

  const user =
    auth.currentUser;

  if (!user) {
    return null;
  }

  let role =
    await getFirestoreRole(
      user
    );

  if (!role) {

    role =
      getEmailRole(
        user
      );
  }

  return role;
}


/* =========================================================
   GET CURRENT USER
   ========================================================= */

export function getCurrentUser() {

  return auth.currentUser;

}


/* =========================================================
   EXPORT HELPERS
   ========================================================= */

export {
  getFirestoreRole,
  getEmailRole,
  clearSession
};
