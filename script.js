```javascript
/* =========================================================
   PERSONAL COURSE STUDIO
   SCRIPT.JS
   =========================================================
   Includes:
   - Student management
   - Image upload
   - Main video upload
   - Mentor video upload
   - Main video play / pause
   - Fullscreen
   - Screen recording
   - Settings
   - Brand settings
   - Mentor background
   - Mentor camera/window drag & move
   - Mouse + Touch + Pointer support
   ========================================================= */


/* =========================================================
   ELEMENTS
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


/* =========================================================
   STUDENT DATA
   ========================================================= */

let students = [
  "Student 01",
  "Student 02",
  "Student 03",
  "Student 04",
  "Student 05",
  "Student 06",
  "Student 07",
  "Student 08"
];


/* =========================================================
   RECORDING VARIABLES
   ========================================================= */

let isRecording = false;

let mediaRecorder = null;

let recordedChunks = [];

let recordingStream = null;


/* =========================================================
   MENTOR DRAG VARIABLES
   ========================================================= */

let mentorDragging = false;

let mentorDragPointerId = null;

let mentorStartPointerX = 0;

let mentorStartPointerY = 0;

let mentorStartLeft = 0;

let mentorStartTop = 0;


/* =========================================================
   RENDER STUDENTS
   ========================================================= */

function renderStudents() {

  if (!studentsList) {
    return;
  }

  studentsList.innerHTML = "";

  students.forEach(function (name, index) {

    const student =
      document.createElement("div");

    student.className =
      "student";

    const initials =
      name
        .split(" ")
        .map(function (word) {
          return word.charAt(0);
        })
        .join("")
        .substring(0, 2)
        .toUpperCase();

    student.innerHTML = `

      <div class="avatar">
        ${escapeHTML(initials)}
      </div>

      <div class="student-info">

        <div class="student-name">
          ${escapeHTML(name)}
        </div>

        <div class="student-status">

          <span class="online-dot"></span>

          Online

        </div>

      </div>

      <button
        class="student-menu"
        type="button"
        title="Remove student"
        data-index="${index}"
      >
        ×
      </button>

    `;

    const removeButton =
      student.querySelector(
        ".student-menu"
      );

    if (removeButton) {

      removeButton.addEventListener(
        "click",
        function () {

          removeStudent(index);

        }
      );

    }

    studentsList.appendChild(
      student
    );

  });

  updateStudentCount();

}


/* =========================================================
   UPDATE STUDENT COUNT
   ========================================================= */

function updateStudentCount() {

  if (!studentCount) {
    return;
  }

  studentCount.textContent =
    students.length +
    (
      students.length === 1
        ? " Student"
        : " Students"
    );

}


/* =========================================================
   ADD STUDENT
   ========================================================= */

function addStudent() {

  const nextNumber =
    students.length + 1;

  const defaultName =
    "Student " +
    String(nextNumber).padStart(2, "0");

  const name =
    prompt(
      "Student name লিখুন:",
      defaultName
    );

  if (name === null) {
    return;
  }

  const cleanName =
    name.trim();

  if (!cleanName) {

    showToast(
      "Student name লিখুন"
    );

    return;

  }

  students.push(
    cleanName
  );

  renderStudents();

  showToast(
    "Student added"
  );

}


/* =========================================================
   REMOVE STUDENT
   ========================================================= */

function removeStudent(index) {

  if (
    index < 0 ||
    index >= students.length
  ) {

    return;

  }

  if (students.length === 1) {

    showToast(
      "কমপক্ষে একজন Student রাখুন"
    );

    return;

  }

  const removedName =
    students[index];

  students.splice(
    index,
    1
  );

  renderStudents();

  showToast(
    removedName +
    " removed"
  );

}


/* =========================================================
   IMAGE UPLOAD
   ========================================================= */

if (imageUpload) {

  imageUpload.addEventListener(
    "change",
    function () {

      const file =
        this.files &&
        this.files[0];

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        showToast(
          "শুধু Image file দিন"
        );

        this.value = "";

        return;

      }

      const url =
        URL.createObjectURL(
          file
        );

      if (mainImage) {

        mainImage.src =
          url;

        mainImage.style.display =
          "block";

      }

      if (mainVideo) {

        mainVideo.style.display =
          "none";

      }

      if (welcomeContent) {

        welcomeContent.style.display =
          "none";

      }

      setStatus(
        "Slide ready"
      );

      showToast(
        "Slide / Image loaded"
      );

    }
  );

}


/* =========================================================
   MAIN VIDEO UPLOAD
   ========================================================= */

if (videoUpload) {

  videoUpload.addEventListener(
    "change",
    function () {

      const file =
        this.files &&
        this.files[0];

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith(
          "video/"
        )
      ) {

        showToast(
          "শুধু Video file দিন"
        );

        this.value = "";

        return;

      }

      const url =
        URL.createObjectURL(
          file
        );

      if (mainVideo) {

        mainVideo.src =
          url;

        mainVideo.style.display =
          "block";

        mainVideo.load();

      }

      if (mainImage) {

        mainImage.style.display =
          "none";

      }

      if (welcomeContent) {

        welcomeContent.style.display =
          "none";

      }

      setStatus(
        "Video ready"
      );

      showToast(
        "Main video loaded"
      );

    }
  );

}


/* =========================================================
   MENTOR VIDEO UPLOAD
   ========================================================= */

if (mentorUpload) {

  mentorUpload.addEventListener(
    "change",
    function () {

      const file =
        this.files &&
        this.files[0];

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith(
          "video/"
        )
      ) {

        showToast(
          "শুধু Video file দিন"
        );

        this.value = "";

        return;

      }

      const url =
        URL.createObjectURL(
          file
        );

      if (mentorVideo) {

        mentorVideo.src =
          url;

        mentorVideo.style.display =
          "block";

        mentorVideo.muted =
          true;

        mentorVideo.loop =
          true;

        mentorVideo.playsInline =
          true;

        mentorVideo
          .play()
          .catch(function () {});

      }

      if (mentorPlaceholder) {

        mentorPlaceholder.style.display =
          "none";

      }

      showToast(
        "Mentor video loaded"
      );

    }
  );

}


/* =========================================================
   MAIN VIDEO PLAY / PAUSE
   ========================================================= */

function toggleMainPlay() {

  const hasVideo =
    mainVideo &&
    mainVideo.style.display ===
      "block" &&
    mainVideo.src;

  if (!hasVideo) {

    showToast(
      "প্রথমে Main Video upload করুন"
    );

    return;

  }

  if (mainVideo.paused) {

    mainVideo
      .play()
      .catch(function () {

        showToast(
          "Video play করা যাচ্ছে না"
        );

      });

    setStatus(
      "Playing"
    );

  } else {

    mainVideo.pause();

    setStatus(
      "Paused"
    );

  }

}


/* =========================================================
   MAIN VIDEO EVENTS
   ========================================================= */

if (mainVideo) {

  mainVideo.addEventListener(
    "play",
    function () {

      setStatus(
        "Playing"
      );

    }
  );


  mainVideo.addEventListener(
    "pause",
    function () {

      if (!isRecording) {

        setStatus(
          "Paused"
        );

      }

    }
  );


  mainVideo.addEventListener(
    "ended",
    function () {

      if (!isRecording) {

        setStatus(
          "Video ended"
        );

      }

    }
  );

}


/* =========================================================
   CLEAR MAIN CONTENT
   ========================================================= */

function clearMainContent() {

  if (mainImage) {

    mainImage.removeAttribute(
      "src"
    );

    mainImage.style.display =
      "none";

  }

  if (mainVideo) {

    mainVideo.pause();

    mainVideo.removeAttribute(
      "src"
    );

    mainVideo.load();

    mainVideo.style.display =
      "none";

  }

  if (welcomeContent) {

    welcomeContent.style.display =
      "block";

  }

  if (imageUpload) {

    imageUpload.value =
      "";

  }

  if (videoUpload) {

    videoUpload.value =
      "";

  }

  setStatus(
    "Ready"
  );

  showToast(
    "Main content cleared"
  );

}


/* =========================================================
   FULLSCREEN
   ========================================================= */

function fullscreenStage() {

  const stage =
    document.getElementById(
      "stage"
    );

  if (!stage) {
    return;
  }

  if (!document.fullscreenElement) {

    const request =
      stage.requestFullscreen ||
      stage.webkitRequestFullscreen ||
      stage.msRequestFullscreen;

    if (request) {

      Promise.resolve(
        request.call(stage)
      )
      .catch(function () {

        showToast(
          "Fullscreen unavailable"
        );

      });

    } else {

      showToast(
        "Browser fullscreen support নেই"
      );

    }

  } else {

    const exit =
      document.exitFullscreen ||
      document.webkitExitFullscreen;

    if (exit) {

      exit.call(
        document
      );

    }

  }

}


/* =========================================================
   RECORDING
   ========================================================= */

async function toggleRecording() {

  if (isRecording) {

    stopRecording();

    return;

  }

  await startRecording();

}


/* =========================================================
   START RECORDING
   ========================================================= */

async function startRecording() {

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getDisplayMedia
  ) {

    showToast(
      "এই browser-এ screen recording support নেই"
    );

    return;

  }

  try {

    recordingStream =
      await navigator.mediaDevices
        .getDisplayMedia({

          video: {
            frameRate: 30
          },

          audio: true

        });


    recordedChunks = [];


    const options = {

      videoBitsPerSecond:
        6000000

    };


    if (
      MediaRecorder.isTypeSupported(
        "video/webm;codecs=vp9,opus"
      )
    ) {

      options.mimeType =
        "video/webm;codecs=vp9,opus";

    } else if (
      MediaRecorder.isTypeSupported(
        "video/webm;codecs=vp8,opus"
      )
    ) {

      options.mimeType =
        "video/webm;codecs=vp8,opus";

    }


    mediaRecorder =
      new MediaRecorder(
        recordingStream,
        options
      );


    mediaRecorder.addEventListener(
      "dataavailable",
      function (event) {

        if (
          event.data &&
          event.data.size > 0
        ) {

          recordedChunks.push(
            event.data
          );

        }

      }
    );


    mediaRecorder.addEventListener(
      "stop",
      finishRecording
    );


    mediaRecorder.start(
      1000
    );


    isRecording =
      true;


    updateRecordingUI(
      true
    );


    setStatus(
      "Recording..."
    );


    showToast(
      "Recording started"
    );


    const videoTrack =
      recordingStream
        .getVideoTracks()[0];


    if (videoTrack) {

      videoTrack.addEventListener(
        "ended",
        function () {

          if (isRecording) {

            stopRecording();

          }

        }
      );

    }

  } catch (error) {

    console.error(
      "Recording error:",
      error
    );


    if (recordingStream) {

      recordingStream
        .getTracks()
        .forEach(
          function (track) {

            track.stop();

          }
        );

    }


    showToast(
      "Screen recording permission দেওয়া হয়নি"
    );


    setStatus(
      "Ready"
    );

  }

}


/* =========================================================
   STOP RECORDING
   ========================================================= */

function stopRecording() {

  if (!mediaRecorder) {
    return;
  }

  if (
    mediaRecorder.state !==
    "inactive"
  ) {

    mediaRecorder.stop();

  }

  if (recordingStream) {

    recordingStream
      .getTracks()
      .forEach(
        function (track) {

          track.stop();

        }
      );

  }

  isRecording =
    false;

  updateRecordingUI(
    false
  );

  setStatus(
    "Processing recording..."
  );

}


/* =========================================================
   FINISH RECORDING
   ========================================================= */

function finishRecording() {

  if (
    !recordedChunks.length
  ) {

    setStatus(
      "No recording data"
    );

    return;

  }


  const blob =
    new Blob(
      recordedChunks,
      {
        type: "video/webm"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const downloadLink =
    document.createElement(
      "a"
    );


  downloadLink.href =
    url;


  downloadLink.download =
    "course-recording-" +
    createFileDate() +
    ".webm";


  document.body.appendChild(
    downloadLink
  );


  downloadLink.click();


  downloadLink.remove();


  setTimeout(
    function () {

      URL.revokeObjectURL(
        url
      );

    },
    1000
  );


  setStatus(
    "Recording saved"
  );


  showToast(
    "Recording তৈরি হয়েছে"
  );


  recordedChunks =
    [];

  mediaRecorder =
    null;

  recordingStream =
    null;

}


/* =========================================================
   RECORDING UI
   ========================================================= */

function updateRecordingUI(
  recording
) {

  if (!recordTopBtn) {
    return;
  }

  if (recording) {

    recordTopBtn.textContent =
      "■ Stop Recording";

    recordTopBtn.classList.add(
      "active"
    );


    if (statusDot) {

      statusDot.classList.add(
        "recording"
      );

    }

  } else {

    recordTopBtn.textContent =
      "● Record";

    recordTopBtn.classList.remove(
      "active"
    );


    if (statusDot) {

      statusDot.classList.remove(
        "recording"
      );

    }

  }

}


/* =========================================================
   SETTINGS
   ========================================================= */

function openSettings() {

  if (!settingsModal) {
    return;
  }

  settingsModal.classList.add(
    "show"
  );

}


function closeSettings() {

  if (!settingsModal) {
    return;
  }

  settingsModal.classList.remove(
    "show"
  );

}


function openBrandSettings() {

  openSettings();


  setTimeout(
    function () {

      if (brandInput) {

        brandInput.focus();

        brandInput.select();

      }

    },
    100
  );

}


/* =========================================================
   SAVE SETTINGS
   ========================================================= */

function saveSettings() {

  if (!brandInput) {
    return;
  }


  const name =
    brandInput.value.trim();


  if (!name) {

    showToast(
      "Brand name লিখুন"
    );

    return;

  }


  if (brandBadge) {

    brandBadge.textContent =
      name;

  }


  localStorage.setItem(
    "courseStudioBrand",
    name
  );


  closeSettings();


  showToast(
    "Settings saved"
  );

}


/* =========================================================
   LOAD SETTINGS
   ========================================================= */

function loadSettings() {

  const savedBrand =
    localStorage.getItem(
      "courseStudioBrand"
    );


  if (
    savedBrand &&
    brandInput &&
    brandBadge
  ) {

    brandInput.value =
      savedBrand;

    brandBadge.textContent =
      savedBrand;

  }


  const savedBackground =
    localStorage.getItem(
      "courseStudioMentorBg"
    );


  if (
    savedBackground &&
    mentorCard
  ) {

    mentorCard.style.background =
      savedBackground;

  }


  /* Restore Mentor Position */

  if (mentorCard) {

    const savedLeft =
      localStorage.getItem(
        "courseStudioMentorLeft"
      );

    const savedTop =
      localStorage.getItem(
        "courseStudioMentorTop"
      );

    if (
      savedLeft !== null &&
      savedTop !== null
    ) {

      mentorCard.style.left =
        savedLeft + "px";

      mentorCard.style.top =
        savedTop + "px";

      mentorCard.style.right =
        "auto";

      mentorCard.style.bottom =
        "auto";

    }

  }

}


/* =========================================================
   MENTOR BACKGROUND
   ========================================================= */

function changeMentorBackground(
  color
) {

  if (!mentorCard) {
    return;
  }


  mentorCard.style.background =
    color;


  localStorage.setItem(
    "courseStudioMentorBg",
    color
  );


  showToast(
    "Mentor background changed"
  );

}


/* =========================================================
   MENTOR DRAG / MOVE
   =========================================================
   Mouse + Touch + Pointer Events
   ========================================================= */

function initializeMentorDrag() {

  if (!mentorCard) {
    return;
  }


  /*
   * Important:
   * We use pointer events so the same system
   * works with mouse, touch and pen.
   */

  mentorCard.addEventListener(
    "pointerdown",
    mentorPointerDown
  );


  document.addEventListener(
    "pointermove",
    mentorPointerMove
  );


  document.addEventListener(
    "pointerup",
    mentorPointerUp
  );


  document.addEventListener(
    "pointercancel",
    mentorPointerUp
  );


  /*
   * Prevent browser native drag behavior.
   */

  mentorCard.addEventListener(
    "dragstart",
    function (event) {

      event.preventDefault();

    }
  );

}


/* =========================================================
   MENTOR POINTER DOWN
   ========================================================= */

function mentorPointerDown(
  event
) {

  if (!mentorCard) {
    return;
  }


  /*
   * Do not start dragging when clicking
   * buttons, inputs or interactive controls.
   */

  const interactive =
    event.target.closest(
      "button, input, select, textarea, a, label"
    );


  if (interactive) {
    return;
  }


  /*
   * Only primary mouse button.
   * Touch and pen are allowed.
   */

  if (
    event.pointerType === "mouse" &&
    event.button !== 0
  ) {

    return;

  }


  const stage =
    document.getElementById(
      "stage"
    );


  if (!stage) {
    return;
  }


  const mentorRect =
    mentorCard.getBoundingClientRect();


  const stageRect =
    stage.getBoundingClientRect();


  /*
   * Convert current screen position
   * into stage-relative position.
   */

  const currentLeft =
    mentorRect.left -
    stageRect.left +
    stage.scrollLeft;


  const currentTop =
    mentorRect.top -
    stageRect.top +
    stage.scrollTop;


  mentorStartPointerX =
    event.clientX;

  mentorStartPointerY =
    event.clientY;


  mentorStartLeft =
    currentLeft;

  mentorStartTop =
    currentTop;


  mentorDragging =
    true;


  mentorDragPointerId =
    event.pointerId;


  try {

    mentorCard.setPointerCapture(
      event.pointerId
    );

  } catch (error) {
    /* Pointer capture may not be available */
  }


  mentorCard.classList.add(
    "dragging"
  );


  /*
   * Switch from right/bottom positioning
   * to left/top positioning.
   */

  mentorCard.style.left =
    currentLeft + "px";

  mentorCard.style.top =
    currentTop + "px";

  mentorCard.style.right =
    "auto";

  mentorCard.style.bottom =
    "auto";


  /*
   * Prevent text selection / page scrolling.
   */

  event.preventDefault();

}


/* =========================================================
   MENTOR POINTER MOVE
   ========================================================= */

function mentorPointerMove(
  event
) {

  if (!mentorDragging) {
    return;
  }


  if (
    mentorDragPointerId !== null &&
    event.pointerId !== mentorDragPointerId
  ) {

    return;

  }


  const stage =
    document.getElementById(
      "stage"
    );


  if (!stage) {
    return;
  }


  const stageRect =
    stage.getBoundingClientRect();


  const mentorRect =
    mentorCard.getBoundingClientRect();


  const deltaX =
    event.clientX -
    mentorStartPointerX;


  const deltaY =
    event.clientY -
    mentorStartPointerY;


  let newLeft =
    mentorStartLeft +
    deltaX;


  let newTop =
    mentorStartTop +
    deltaY;


  /*
   * Keep Mentor window inside stage.
   */

  const stageWidth =
    stage.clientWidth;

  const stageHeight =
    stage.clientHeight;


  const mentorWidth =
    mentorRect.width;

  const mentorHeight =
    mentorRect.height;


  const minLeft =
    0;

  const minTop =
    0;


  const maxLeft =
    Math.max(
      0,
      stageWidth -
      mentorWidth
    );


  const maxTop =
    Math.max(
      0,
      stageHeight -
      mentorHeight
    );


  newLeft =
    Math.max(
      minLeft,
      Math.min(
        newLeft,
        maxLeft
      )
    );


  newTop =
    Math.max(
      minTop,
      Math.min(
        newTop,
        maxTop
      )
    );


  mentorCard.style.left =
    newLeft + "px";

  mentorCard.style.top =
    newTop + "px";


  event.preventDefault();

}


/* =========================================================
   MENTOR POINTER UP
   ========================================================= */

function mentorPointerUp(
  event
) {

  if (!mentorDragging) {
    return;
  }


  if (
    mentorDragPointerId !== null &&
    event.pointerId !== mentorDragPointerId
  ) {

    return;

  }


  mentorDragging =
    false;


  mentorDragPointerId =
    null;


  if (mentorCard) {

    mentorCard.classList.remove(
      "dragging"
    );


    /*
     * Save current position.
     */

    const left =
      parseFloat(
        mentorCard.style.left
      );

    const top =
      parseFloat(
        mentorCard.style.top
      );


    if (!Number.isNaN(left)) {

      localStorage.setItem(
        "courseStudioMentorLeft",
        String(left)
      );

    }


    if (!Number.isNaN(top)) {

      localStorage.setItem(
        "courseStudioMentorTop",
        String(top)
      );

    }

  }

}


/* =========================================================
   RESET MENTOR POSITION
   ========================================================= */

function resetMentorPosition() {

  if (!mentorCard) {
    return;
  }


  const stage =
    document.getElementById(
      "stage"
    );


  if (!stage) {
    return;
  }


  /*
   * Put Mentor back to the default
   * top-right position.
   */

  mentorCard.style.left =
    "auto";

  mentorCard.style.top =
    "20px";

  mentorCard.style.right =
    "20px";

  mentorCard.style.bottom =
    "auto";


  localStorage.removeItem(
    "courseStudioMentorLeft"
  );

  localStorage.removeItem(
    "courseStudioMentorTop"
  );


  showToast(
    "Mentor position reset"
  );

}


/* =========================================================
   STATUS
   ========================================================= */

function setStatus(
  text
) {

  if (!statusText) {
    return;
  }

  statusText.textContent =
    text;

}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer =
  null;


function showToast(
  message
) {

  if (!toast) {
    return;
  }


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      function () {

        toast.classList.remove(
          "show"
        );

      },
      2200
    );

}


/* =========================================================
   CREATE FILE DATE
   ========================================================= */

function createFileDate() {

  const now =
    new Date();


  const year =
    now.getFullYear();


  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );


  const hour =
    String(
      now.getHours()
    ).padStart(
      2,
      "0"
    );


  const minute =
    String(
      now.getMinutes()
    ).padStart(
      2,
      "0"
    );


  const second =
    String(
      now.getSeconds()
    ).padStart(
      2,
      "0"
    );


  return (
    year +
    month +
    day +
    "-" +
    hour +
    minute +
    second
  );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
  text
) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    text;


  return div.innerHTML;

}


/* =========================================================
   SETTINGS MODAL — OUTSIDE CLICK
   ========================================================= */

if (settingsModal) {

  settingsModal.addEventListener(
    "click",
    function (event) {

      if (
        event.target ===
        settingsModal
      ) {

        closeSettings();

      }

    }
  );

}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

document.addEventListener(
  "keydown",
  function (event) {

    /*
     * ESC = Close settings
     */

    if (
      event.key ===
      "Escape"
    ) {

      closeSettings();

    }


    /*
     * CTRL + ENTER = Recording
     */

    if (
      event.ctrlKey &&
      event.key ===
        "Enter"
    ) {

      event.preventDefault();

      toggleRecording();

    }


    /*
     * R = Reset Mentor position
     *
     * Only when not typing in an input.
     */

    const tag =
      document.activeElement
        ? document.activeElement.tagName
        : "";


    const typing =
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT";


    if (
      !typing &&
      event.key.toLowerCase() ===
        "r"
    ) {

      resetMentorPosition();

    }

  }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

renderStudents();

loadSettings();

initializeMentorDrag();

setStatus(
  "Ready"
);


/* =========================================================
   PAGE LOAD
   ========================================================= */

window.addEventListener(
  "load",
  function () {

    console.log(
      "Personal Course Studio ready."
    );

  }
);
```
