```javascript
/* =========================================================
   PERSONAL COURSE STUDIO
   MENTOR STUDIO — COMPLETE script.js

   File:
   mentor/script.js

   Includes:
   - Student management
   - Image upload
   - Main video upload
   - Mentor video upload
   - Mentor drag / move
   - Mentor position save
   - Main video play / pause
   - Recording
   - Settings
   - Brand settings
   - Mentor background
   - AI camera background
   - Original background
   - Remove background
   - Blur background
   - Custom background image
   - Solid color background
   - Proper person alpha masking
   ========================================================= */


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const imageUpload =
  document.getElementById("imageUpload");

const videoUpload =
  document.getElementById("videoUpload");

const mentorUpload =
  document.getElementById("mentorUpload");

const mainImage =
  document.getElementById("mainImage");

const mainVideo =
  document.getElementById("mainVideo");

const mentorVideo =
  document.getElementById("mentorVideo");

const mentorPlaceholder =
  document.getElementById("mentorPlaceholder");

const welcomeContent =
  document.getElementById("welcomeContent");

const brandBadge =
  document.getElementById("brandBadge");

const brandInput =
  document.getElementById("brandInput");

const mentorCard =
  document.getElementById("mentorCard");

const studentsList =
  document.getElementById("studentsList");

const studentCount =
  document.getElementById("studentCount");

const statusText =
  document.getElementById("statusText");

const statusDot =
  document.getElementById("statusDot");

const recordTopBtn =
  document.getElementById("recordTopBtn");

const settingsModal =
  document.getElementById("settingsModal");

const toast =
  document.getElementById("toast");

const stage =
  document.getElementById("stage");

const backgroundColor =
  document.getElementById("backgroundColor");

const backgroundImageUpload =
  document.getElementById("backgroundImageUpload");


/* =========================================================
   STUDENTS
   ========================================================= */

let students = [
  {
    name: "Student 01",
    status: "Online"
  },
  {
    name: "Student 02",
    status: "Online"
  },
  {
    name: "Student 03",
    status: "Online"
  },
  {
    name: "Student 04",
    status: "Online"
  },
  {
    name: "Student 05",
    status: "Online"
  },
  {
    name: "Student 06",
    status: "Online"
  },
  {
    name: "Student 07",
    status: "Online"
  },
  {
    name: "Student 08",
    status: "Online"
  }
];


function renderStudents() {

  if (!studentsList) {
    return;
  }

  studentsList.innerHTML = "";

  students.forEach(
    (student, index) => {

      const item =
        document.createElement("div");

      item.className =
        "student-item";

      item.innerHTML = `
        <div class="student-avatar">
          ${escapeHTML(
            getStudentInitials(student.name)
          )}
        </div>

        <div class="student-info">

          <div class="student-name">
            ${escapeHTML(student.name)}
          </div>

          <div class="student-status">
            ● ${escapeHTML(student.status)}
          </div>

        </div>

        <button
          class="student-remove"
          type="button"
          title="Remove student"
        >
          ✕
        </button>
      `;


      const removeButton =
        item.querySelector(
          ".student-remove"
        );


      if (removeButton) {

        removeButton.addEventListener(
          "click",
          function () {

            removeStudent(index);

          }
        );

      }


      studentsList.appendChild(item);

    }
  );


  updateStudentCount();

}


function updateStudentCount() {

  if (studentCount) {

    studentCount.textContent =
      students.length;

  }

}


function getStudentInitials(name) {

  if (!name) {
    return "ST";
  }

  const words =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);


  if (words.length === 1) {

    return words[0]
      .substring(0, 2)
      .toUpperCase();

  }


  return (
    words[0][0] +
    words[1][0]
  ).toUpperCase();

}


function addStudent() {

  const number =
    students.length + 1;

  students.push({
    name:
      `Student ${String(number).padStart(2, "0")}`,
    status: "Online"
  });


  renderStudents();

  showToast(
    "New student added."
  );

}


function removeStudent(index) {

  if (
    index < 0 ||
    index >= students.length
  ) {
    return;
  }


  students.splice(index, 1);

  renderStudents();

  showToast(
    "Student removed."
  );

}


/* =========================================================
   IMAGE UPLOAD
   ========================================================= */

if (imageUpload) {

  imageUpload.addEventListener(
    "change",
    function (event) {

      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }


      if (
        !file.type.startsWith("image/")
      ) {

        showToast(
          "Please select an image file."
        );

        return;
      }


      const objectURL =
        URL.createObjectURL(file);


      mainImage.onload =
        function () {

          URL.revokeObjectURL(
            objectURL
          );

        };


      mainImage.src =
```
