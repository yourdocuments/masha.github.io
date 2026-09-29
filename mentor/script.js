/* =========================================================
   SNK MENTOR STUDIO
   PERSONAL COURSE STUDIO
   STEP 3.3 — CAMERA + AI QUALITY UPDATE

   File:
   mentor/script.js

   Includes:
   ---------------------------------------------------------
   MAIN MEDIA
   - Image upload
   - Video upload
   - Play / pause
   - Clear
   - Fullscreen

   MENTOR
   - Mentor video upload
   - Live webcam
   - Camera switch
   - Front camera mirror
   - Rear camera normal
   - Drag / move
   - Resize compatibility

   AI BACKGROUND
   - Original
   - Remove
   - Blur
   - Custom image
   - Solid color
   - Soft segmentation edge
   - Hair / shoulder edge smoothing
   - Better custom background compositing

   RECORDING
   - Screen / stage recording
   - Microphone
   - WebM download

   STUDENTS
   - Add
   - Remove
   - Online / offline

   SETTINGS
   - Brand
   - Background
   - Mentor position
   - LocalStorage

   ========================================================= */

"use strict";


/* =========================================================
   DOM
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

const mentorCameraVideo =
  document.getElementById("mentorCameraVideo");

const mentorAICanvas =
  document.getElementById("mentorAICanvas");

const mentorPlaceholder =
  document.getElementById("mentorPlaceholder");

const mentorSourceLabel =
  document.getElementById("mentorSourceLabel");

const mentorCard =
  document.getElementById("mentorCard");

const mentorResize =
  document.getElementById("mentorResize");

const stage =
  document.getElementById("stage");

const welcomeContent =
  document.getElementById("welcomeContent");

const brandBadge =
  document.getElementById("brandBadge");

const brandInput =
  document.getElementById("brandInput");

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
   CAMERA CONTROLS
   ========================================================= */

const startCameraBtn =
  document.getElementById("startCameraBtn");

const stopCameraBtn =
  document.getElementById("stopCameraBtn");

const switchCameraBtn =
  document.getElementById("switchCameraBtn");

const cameraStatus =
  document.getElementById("cameraStatus");


/* =========================================================
   BACKGROUND CONTROLS
   ========================================================= */

const bgOriginalBtn =
  document.getElementById("bgOriginalBtn");

const bgRemoveBtn =
  document.getElementById("bgRemoveBtn");

const bgBlurBtn =
  document.getElementById("bgBlurBtn");

const bgImageBtn =
  document.getElementById("bgImageBtn");

const bgColorBtn =
  document.getElementById("bgColorBtn");

const backgroundColor =
  document.getElementById("backgroundColor");

const backgroundImageUpload =
  document.getElementById("backgroundImageUpload");


/* =========================================================
   AI CANVASES
   ========================================================= */

const aiCanvas =
  document.getElementById("aiCanvas");

const aiSourceCanvas =
  document.getElementById("aiSourceCanvas");

const aiMaskCanvas =
  document.getElementById("aiMaskCanvas");


/* =========================================================
   STUDENTS
   ========================================================= */

let students = [
  {
    name: "Student 01",
    online: true
  },
  {
    name: "Student 02",
    online: true
  },
  {
    name: "Student 03",
    online: true
  },
  {
    name: "Student 04",
    online: true
  },
  {
    name: "Student 05",
    online: false
  },
  {
    name: "Student 06",
    online: true
  },
  {
    name: "Student 07",
    online: false
  },
  {
    name: "Student 08",
    online: true
  }
];


/* =========================================================
   RECORDING
   ========================================================= */

let isRecording = false;

let mediaRecorder = null;

let recordedChunks = [];

let recordingStream = null;

let recordingAudioStream = null;


/* =========================================================
   CAMERA
   ========================================================= */

let cameraStream = null;

let cameraFacingMode = "user";

let cameraRunning = false;


/* =========================================================
   AI
   ========================================================= */

let selfieSegmentation = null;

let segmentationReady = false;

let segmentationBusy = false;

let aiAnimationFrame = null;

let aiInitialized = false;


/* =========================================================
   BACKGROUND
   ========================================================= */

let currentBackgroundMode =
  "original";

let customBackgroundImage =
  null;


/* =========================================================
   CANVAS
   ========================================================= */

let canvasWidth = 640;

let canvasHeight = 480;

let personCanvasCache = null;


/* =========================================================
   DRAG
   ========================================================= */

let mentorDragging = false;

let mentorDragPointerId = null;

let mentorStartPointerX = 0;

let mentorStartPointerY = 0;

let mentorStartLeft = 0;

let mentorStartTop = 0;


/* =========================================================
   AI QUALITY
   ========================================================= */

/*
   These values control the person edge.

   Lower edgeStart:
   More person included.

   Higher edgeEnd:
   More solid person area.
*/

const MASK_EDGE_START = 0.10;

const MASK_EDGE_END = 0.62;


/*
   Extra edge softness.
*/

const MASK_EDGE_POWER = 1.15;


/*
   Small alpha cleanup.
*/

const MIN_VISIBLE_ALPHA = 0.015;


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

  if (!toast) {
    return;
  }

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );

  clearTimeout(
    showToast.timer
  );

  showToast.timer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 2600);
}


/* =========================================================
   STATUS
   ========================================================= */

function setStatus(text) {

  if (statusText) {
    statusText.textContent =
      text;
  }

  if (!statusDot) {
    return;
  }

  statusDot.classList.remove(
    "online",
    "recording",
    "warning"
  );

  if (
    text
      .toLowerCase()
      .includes("record")
  ) {

    statusDot.classList.add(
      "recording"
    );

  } else {

    statusDot.classList.add(
      "online"
    );
  }
}


/* =========================================================
   CAMERA STATUS
   ========================================================= */

function setCameraStatus(text) {

  if (cameraStatus) {
    cameraStatus.textContent =
      text;
  }
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}


/* =========================================================
   FILE DATE
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
    "-" +
    month +
    "-" +
    day +
    "_" +
    hour +
    "-" +
    minute +
    "-" +
    second
  );
}


/* =========================================================
   STUDENTS
   ========================================================= */

function renderStudents() {

  if (!studentsList) {
    return;
  }

  studentsList.innerHTML =
    "";

  students.forEach(
    (
      student,
      index
    ) => {

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "student-item";

      item.innerHTML = `
        <div class="student-avatar">
          ${escapeHTML(
            student.name
              .charAt(0)
              .toUpperCase()
          )}
        </div>

        <div class="student-info">

          <div class="student-name">
            ${escapeHTML(
              student.name
            )}
          </div>

          <div class="student-status">

            <span
              class="student-dot ${
                student.online
                  ? "online"
                  : ""
              }"
            ></span>

            ${
              student.online
                ? "Online"
                : "Offline"
            }

          </div>

        </div>

        <button
          type="button"
          class="student-remove"
          data-index="${index}"
          title="Remove student"
        >
          ×
        </button>
      `;

      studentsList.appendChild(
        item
      );
    }
  );


  studentsList
    .querySelectorAll(
      ".student-remove"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            removeStudent(
              Number(
                button.dataset.index
              )
            );

          }
        );

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


function addStudent() {

  const number =
    students.length + 1;

  students.push({
    name:
      "Student " +
      String(
        number
      ).padStart(
        2,
        "0"
      ),
    online: true
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

  students.splice(
    index,
    1
  );

  renderStudents();

  showToast(
    "Student removed."
  );
}


/* =========================================================
   MAIN IMAGE
   ========================================================= */

if (imageUpload) {

  imageUpload.addEventListener(
    "change",
    event => {

      const file =
        event.target.files &&
        event.target.files[0];

      if (!file) {
        return;
      }

      const url =
        URL.createObjectURL(
          file
        );

      if (mainImage) {

        mainImage.src =
          url;

        mainImage.classList.add(
          "active"
        );
      }

      if (mainVideo) {

        mainVideo.pause();

        mainVideo.classList.remove(
          "active"
        );
      }

      if (welcomeContent) {

        welcomeContent.classList.add(
          "hidden"
        );
      }

      setStatus(
        "Slide loaded"
      );

      showToast(
        "Slide uploaded successfully."
      );
    }
  );
}


/* =========================================================
   MAIN VIDEO
   ========================================================= */

if (videoUpload) {

  videoUpload.addEventListener(
    "change",
    event => {

      const file =
        event.target.files &&
        event.target.files[0];

      if (!file) {
        return;
      }

      const url =
        URL.createObjectURL(
          file
        );

      if (mainVideo) {

        mainVideo.src =
          url;

        mainVideo.classList.add(
          "active"
        );

        mainVideo.load();
      }

      if (mainImage) {

        mainImage.classList.remove(
          "active"
        );
      }

      if (welcomeContent) {

        welcomeContent.classList.add(
          "hidden"
        );
      }

      setStatus(
        "Main video loaded"
      );

      showToast(
        "Main video uploaded."
      );
    }
  );
}


/* =========================================================
   MENTOR VIDEO
   ========================================================= */

if (mentorUpload) {

  mentorUpload.addEventListener(
    "change",
    event => {

      const file =
        event.target.files &&
        event.target.files[0];

      if (!file) {
        return;
      }

      const url =
        URL.createObjectURL(
          file
        );

      stopCamera(
        false
      );

      if (mentorVideo) {

        mentorVideo.src =
          url;

        mentorVideo.classList.add(
          "active"
        );

        mentorVideo.muted =
          true;

        mentorVideo.loop =
          true;

        mentorVideo
          .play()
          .catch(
            () => {}
          );
      }

      if (mentorCameraVideo) {

        mentorCameraVideo.classList.remove(
          "active"
        );
      }

      if (mentorAICanvas) {

        mentorAICanvas.classList.remove(
          "active"
        );
      }

      if (mentorPlaceholder) {

        mentorPlaceholder.classList.add(
          "hidden"
        );
      }

      if (mentorSourceLabel) {

        mentorSourceLabel.textContent =
          "Uploaded Video";
      }

      setStatus(
        "Mentor video loaded"
      );

      showToast(
        "Mentor video uploaded."
      );
    }
  );
}


/* =========================================================
   MAIN VIDEO PLAY
   ========================================================= */

function toggleMainPlay() {

  if (!mainVideo) {
    return;
  }

  if (
    mainVideo.paused ||
    mainVideo.ended
  ) {

    mainVideo
      .play()
      .catch(
        () => {}
      );

    setStatus(
      "Playing class video"
    );

  } else {

    mainVideo.pause();

    setStatus(
      "Video paused"
    );
  }
}


if (mainVideo) {

  mainVideo.addEventListener(
    "play",
    () => {

      setStatus(
        "Playing class video"
      );

    }
  );


  mainVideo.addEventListener(
    "pause",
    () => {

      if (!isRecording) {

        setStatus(
          "Video paused"
        );
      }

    }
  );


  mainVideo.addEventListener(
    "ended",
    () => {

      setStatus(
        "Video finished"
      );

    }
  );
}


/* =========================================================
   CLEAR MAIN
   ========================================================= */

function clearMainContent() {

  if (mainImage) {

    mainImage.removeAttribute(
      "src"
    );

    mainImage.classList.remove(
      "active"
    );
  }


  if (mainVideo) {

    mainVideo.pause();

    mainVideo.removeAttribute(
      "src"
    );

    mainVideo.load();

    mainVideo.classList.remove(
      "active"
    );
  }


  if (welcomeContent) {

    welcomeContent.classList.remove(
      "hidden"
    );
  }


  setStatus(
    "Stage cleared"
  );

  showToast(
    "Main stage cleared."
  );
}


/* =========================================================
   FULLSCREEN
   ========================================================= */

function fullscreenStage() {

  if (!stage) {
    return;
  }

  if (
    document.fullscreenElement
  ) {

    document
      .exitFullscreen()
      .catch(
        () => {}
      );

    return;
  }

  stage
    .requestFullscreen()
    .catch(
      () => {

        showToast(
          "Fullscreen is not available."
        );

      }
    );
}


/* =========================================================
   CAMERA START
   ========================================================= */

async function startCamera() {

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices
      .getUserMedia
  ) {

    setCameraStatus(
      "Camera not supported"
    );

    showToast(
      "Camera is not supported."
    );

    return;
  }


  try {

    stopCamera(
      false
    );


    setCameraStatus(
      "Starting camera..."
    );


    const constraints = {

      audio: true,

      video: {

        facingMode:
          cameraFacingMode,

        width: {
          ideal: 1280
        },

        height: {
          ideal: 720
        },

        frameRate: {
          ideal: 30,
          max: 30
        }

      }

    };


    cameraStream =
      await navigator
        .mediaDevices
        .getUserMedia(
          constraints
        );


    cameraRunning =
      true;


    if (mentorCameraVideo) {

      mentorCameraVideo.srcObject =
        cameraStream;

      mentorCameraVideo.muted =
        true;

      mentorCameraVideo.playsInline =
        true;

      /*
        Mirror is controlled with CSS
        below.
      */

      applyCameraOrientation();


      await mentorCameraVideo
        .play()
        .catch(
          () => {}
        );
    }


    if (mentorVideo) {

      mentorVideo.pause();

      mentorVideo.classList.remove(
        "active"
      );
    }


    if (mentorPlaceholder) {

      mentorPlaceholder.classList.add(
        "hidden"
      );
    }


    if (mentorCameraVideo) {

      mentorCameraVideo.classList.add(
        "active"
      );
    }


    if (mentorSourceLabel) {

      mentorSourceLabel.textContent =
        cameraFacingMode ===
        "user"
          ? "Live Camera"
          : "Rear Camera";
    }


    setCameraStatus(
      "Camera is live"
    );


    setStatus(
      "Camera live"
    );


    await initializeAI();


    /*
      Original mode doesn't need
      segmentation rendering.

      Other modes do.
    */

    if (
      currentBackgroundMode ===
      "original"
    ) {

      showOriginalCamera();

    } else {

      startAIProcessing();
    }


    updateCameraButtons();


    showToast(
      "Camera started."
    );


  } catch (error) {

    console.error(
      "Camera start error:",
      error
    );


    cameraRunning =
      false;


    updateCameraButtons();


    if (
      error &&
      error.name ===
        "NotAllowedError"
    ) {

      setCameraStatus(
        "Permission denied"
      );

      showToast(
        "Please allow camera permission."
      );

    } else if (
      error &&
      error.name ===
        "NotFoundError"
    ) {

      setCameraStatus(
        "No camera found"
      );

      showToast(
        "No camera was found."
      );

    } else {

      setCameraStatus(
        "Camera failed"
      );

      showToast(
        "Unable to start camera."
      );
    }

  }
}


/* =========================================================
   CAMERA STOP
   ========================================================= */

function stopCamera(
  showMessage = true
) {

  stopAIProcessing();


  if (cameraStream) {

    cameraStream
      .getTracks()
      .forEach(
        track => {

          track.stop();

        }
      );

    cameraStream =
      null;
  }


  cameraRunning =
    false;


  if (mentorCameraVideo) {

    mentorCameraVideo.pause();

    mentorCameraVideo.srcObject =
      null;

    mentorCameraVideo.classList.remove(
      "active"
    );

    mentorCameraVideo.style.transform =
      "";
  }


  if (mentorAICanvas) {

    mentorAICanvas.classList.remove(
      "active"
    );
  }


  updateCameraButtons();


  if (showMessage) {

    setCameraStatus(
      "Camera stopped"
    );

    setStatus(
      "Camera stopped"
    );

    showToast(
      "Camera stopped."
    );
  }
}


/* =========================================================
   SWITCH CAMERA
   ========================================================= */

async function switchCamera() {

  cameraFacingMode =
    cameraFacingMode ===
    "user"
      ? "environment"
      : "user";


  /*
    If camera isn't running,
    just remember selected mode.
  */

  if (!cameraRunning) {

    showToast(
      cameraFacingMode ===
        "user"
        ? "Front camera selected."
        : "Rear camera selected."
    );

    applyCameraOrientation();

    return;
  }


  await startCamera();
}


/* =========================================================
   CAMERA ORIENTATION
   ========================================================= */

function applyCameraOrientation() {

  if (!mentorCameraVideo) {
    return;
  }


  /*
    Front camera:
    mirrored like normal selfie camera.

    Rear camera:
    normal orientation.
  */

  if (
    cameraFacingMode ===
    "user"
  ) {

    mentorCameraVideo.style.transform =
      "scaleX(-1)";

  } else {

    mentorCameraVideo.style.transform =
      "scaleX(1)";
  }


  /*
    AI canvas must use the same orientation.
  */

  if (mentorAICanvas) {

    if (
      cameraFacingMode ===
      "user"
    ) {

      mentorAICanvas.style.transform =
        "scaleX(-1)";

    } else {

      mentorAICanvas.style.transform =
        "scaleX(1)";
    }
  }
}


/* =========================================================
   CAMERA BUTTON UI
   ========================================================= */

function updateCameraButtons() {

  if (startCameraBtn) {

    startCameraBtn.disabled =
      cameraRunning;
  }


  if (stopCameraBtn) {

    stopCameraBtn.disabled =
      !cameraRunning;
  }
}


/* =========================================================
   ORIGINAL CAMERA
   ========================================================= */

function showOriginalCamera() {

  if (mentorCameraVideo) {

    mentorCameraVideo.classList.add(
      "active"
    );
  }


  if (mentorAICanvas) {

    mentorAICanvas.classList.remove(
      "active"
    );
  }


  applyCameraOrientation();
}


/* =========================================================
   AI INITIALIZATION
   ========================================================= */

async function initializeAI() {

  if (aiInitialized) {
    return;
  }


  if (
    typeof SelfieSegmentation ===
    "undefined"
  ) {

    console.warn(
      "SelfieSegmentation unavailable."
    );

    segmentationReady =
      false;

    setCameraStatus(
      "Camera live — AI unavailable"
    );

    return;
  }


  try {

    selfieSegmentation =
      new SelfieSegmentation({

        locateFile:
          file => {

            return (
              "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/" +
              file
            );

          }

      });


    selfieSegmentation.setOptions({

      modelSelection: 1

    });


    selfieSegmentation.onResults(
      handleSegmentationResults
    );


    segmentationReady =
      true;

    aiInitialized =
      true;


    prepareCanvases();


    console.log(
      "AI segmentation ready."
    );


  } catch (error) {

    console.error(
      "AI initialization error:",
      error
    );

    segmentationReady =
      false;
  }
}


/* =========================================================
   CANVAS SIZE
   ========================================================= */

function setCanvasSize(
  canvas,
  width,
  height
) {

  if (!canvas) {
    return;
  }


  if (
    canvas.width !==
    width
  ) {

    canvas.width =
      width;
  }


  if (
    canvas.height !==
    height
  ) {

    canvas.height =
      height;
  }
}


/* =========================================================
   PREPARE CANVASES
   ========================================================= */

function prepareCanvases() {

  if (!mentorCameraVideo) {
    return;
  }


  const width =
    mentorCameraVideo.videoWidth ||
    640;


  const height =
    mentorCameraVideo.videoHeight ||
    480;


  canvasWidth =
    width;

  canvasHeight =
    height;


  setCanvasSize(
    aiCanvas,
    width,
    height
  );


  setCanvasSize(
    aiSourceCanvas,
    width,
    height
  );


  setCanvasSize(
    aiMaskCanvas,
    width,
    height
  );


  setCanvasSize(
    mentorAICanvas,
    width,
    height
  );


  /*
    Keep person cache in correct size.
  */

  if (personCanvasCache) {

    setCanvasSize(
      personCanvasCache,
      width,
      height
    );
  }
}


/* =========================================================
   START AI
   ========================================================= */

function startAIProcessing() {

  stopAIProcessing();


  if (!cameraRunning) {
    return;
  }


  if (
    currentBackgroundMode ===
    "original"
  ) {

    showOriginalCamera();

    return;
  }


  if (
    !segmentationReady ||
    !selfieSegmentation
  ) {

    showOriginalCamera();

    setCameraStatus(
      "AI loading..."
    );

    return;
  }


  if (mentorAICanvas) {

    mentorAICanvas.classList.add(
      "active"
    );
  }


  if (mentorCameraVideo) {

    mentorCameraVideo.classList.remove(
      "active"
    );
  }


  applyCameraOrientation();


  processAIFrame();
}


/* =========================================================
   STOP AI
   ========================================================= */

function stopAIProcessing() {

  if (aiAnimationFrame) {

    cancelAnimationFrame(
      aiAnimationFrame
    );

    aiAnimationFrame =
      null;
  }


  segmentationBusy =
    false;
}


/* =========================================================
   AI FRAME LOOP
   ========================================================= */

async function processAIFrame() {

  if (!cameraRunning) {
    return;
  }


  if (
    !mentorCameraVideo ||
    mentorCameraVideo.readyState <
      2
  ) {

    aiAnimationFrame =
      requestAnimationFrame(
        processAIFrame
      );

    return;
  }


  if (
    !segmentationReady ||
    !selfieSegmentation
  ) {

    aiAnimationFrame =
      requestAnimationFrame(
        processAIFrame
      );

    return;
  }


  if (!segmentationBusy) {

    segmentationBusy =
      true;


    try {

      await selfieSegmentation.send({

        image:
          mentorCameraVideo

      });

    } catch (error) {

      console.error(
        "AI frame error:",
        error
      );

    } finally {

      segmentationBusy =
        false;
    }
  }


  aiAnimationFrame =
    requestAnimationFrame(
      processAIFrame
    );
}


/* =========================================================
   MEDIAPIPE RESULTS
   ========================================================= */

function handleSegmentationResults(
  results
) {

  if (
    !results ||
    !mentorAICanvas
  ) {
    return;
  }


  if (
    !mentorCameraVideo ||
    !cameraRunning
  ) {
    return;
  }


  if (
    currentBackgroundMode ===
    "original"
  ) {

    showOriginalCamera();

    return;
  }


  prepareCanvases();


  const sourceContext =
    aiSourceCanvas
      ? aiSourceCanvas.getContext(
          "2d",
          {
            willReadFrequently:
              true
          }
        )
      : null;


  const maskContext =
    aiMaskCanvas
      ? aiMaskCanvas.getContext(
          "2d",
          {
            willReadFrequently:
              true
          }
        )
      : null;


  const outputContext =
    mentorAICanvas.getContext(
      "2d"
    );


  if (
    !sourceContext ||
    !maskContext ||
    !outputContext
  ) {
    return;
  }


  const width =
    canvasWidth;


  const height =
    canvasHeight;


  /* -------------------------------------------------------
     SOURCE
     ------------------------------------------------------- */

  sourceContext.clearRect(
    0,
    0,
    width,
    height
  );


  sourceContext.drawImage(
    results.image,
    0,
    0,
    width,
    height
  );


  /* -------------------------------------------------------
     MASK
     ------------------------------------------------------- */

  maskContext.clearRect(
    0,
    0,
    width,
    height
  );


  if (
    results.segmentationMask
  ) {

    maskContext.drawImage(
      results.segmentationMask,
      0,
      0,
      width,
      height
    );
  }


  /* -------------------------------------------------------
     IMAGE DATA
     ------------------------------------------------------- */

  const sourceData =
    sourceContext.getImageData(
      0,
      0,
      width,
      height
    );


  const maskData =
    maskContext.getImageData(
      0,
      0,
      width,
      height
    );


  const sourcePixels =
    sourceData.data;


  const maskPixels =
    maskData.data;


  const personImage =
    new ImageData(
      width,
      height
    );


  const personPixels =
    personImage.data;


  /* -------------------------------------------------------
     CREATE SOFT PERSON MASK

     Important:
     We don't simply copy mask red channel
     into alpha.

     We create a soft alpha curve.
     ------------------------------------------------------- */

  for (
    let i = 0;
    i < sourcePixels.length;
    i += 4
  ) {

    let confidence =
      maskPixels[i] / 255;


    /*
      Smooth transition.
    */

    let alpha =
      smoothStep(
        MASK_EDGE_START,
        MASK_EDGE_END,
        confidence
      );


    /*
      Slight power adjustment.
    */

    alpha =
      Math.pow(
        alpha,
        MASK_EDGE_POWER
      );


    /*
      Very low values become
      completely transparent.
    */

    if (
      alpha <
      MIN_VISIBLE_ALPHA
    ) {

      alpha = 0;

    }


    personPixels[i] =
      sourcePixels[i];

    personPixels[i + 1] =
      sourcePixels[i + 1];

    personPixels[i + 2] =
      sourcePixels[i + 2];

    personPixels[i + 3] =
      Math.round(
        alpha * 255
      );
  }


  /* -------------------------------------------------------
     OUTPUT BACKGROUND
     ------------------------------------------------------- */

  outputContext.clearRect(
    0,
    0,
    width,
    height
  );


  drawSelectedBackground(
    outputContext,
    results.image,
    width,
    height
  );


  /* -------------------------------------------------------
     PERSON
     ------------------------------------------------------- */

  const personCanvas =
    getPersonCanvas();


  const personContext =
    personCanvas.getContext(
      "2d"
    );


  personContext.clearRect(
    0,
    0,
    width,
    height
  );


  personContext.putImageData(
    personImage,
    0,
    0
  );


  outputContext.drawImage(
    personCanvas,
    0,
    0,
    width,
    height
  );


  /* -------------------------------------------------------
     SHOW AI
     ------------------------------------------------------- */

  mentorAICanvas.classList.add(
    "active"
  );


  mentorCameraVideo.classList.remove(
    "active"
  );


  applyCameraOrientation();
}


/* =========================================================
   SMOOTH STEP
   ========================================================= */

function smoothStep(
  edge0,
  edge1,
  value
) {

  if (
    edge0 ===
    edge1
  ) {

    return value >=
      edge1
      ? 1
      : 0;
  }


  let x =
    (
      value -
      edge0
    ) /
    (
      edge1 -
      edge0
    );


  x =
    Math.max(
      0,
      Math.min(
        1,
        x
      )
    );


  return (
    x *
    x *
    (
      3 -
      2 * x
    )
  );
}


/* =========================================================
   PERSON CANVAS
   ========================================================= */

function getPersonCanvas() {

  if (
    !personCanvasCache
  ) {

    personCanvasCache =
      document.createElement(
        "canvas"
      );
  }


  setCanvasSize(
    personCanvasCache,
    canvasWidth,
    canvasHeight
  );


  return personCanvasCache;
}


/* =========================================================
   DRAW BACKGROUND
   ========================================================= */

function drawSelectedBackground(
  context,
  sourceImage,
  width,
  height
) {

  /* -------------------------------------------------------
     REMOVE
     ------------------------------------------------------- */

  if (
    currentBackgroundMode ===
    "remove"
  ) {

    /*
      Transparent.
    */

    return;
  }


  /* -------------------------------------------------------
     COLOR
     ------------------------------------------------------- */

  if (
    currentBackgroundMode ===
    "color"
  ) {

    const color =
      backgroundColor
        ? backgroundColor.value
        : "#101827";


    context.fillStyle =
      color;


    context.fillRect(
      0,
      0,
      width,
      height
    );


    return;
  }


  /* -------------------------------------------------------
     CUSTOM IMAGE
     ------------------------------------------------------- */

  if (
    currentBackgroundMode ===
    "image"
  ) {

    if (
      customBackgroundImage &&
      customBackgroundImage.complete
    ) {

      drawCoverImage(
        context,
        customBackgroundImage,
        width,
        height
      );


      return;
    }


    context.fillStyle =
      "#101827";


    context.fillRect(
      0,
      0,
      width,
      height
    );


    return;
  }


  /* -------------------------------------------------------
     BLUR
     ------------------------------------------------------- */

  if (
    currentBackgroundMode ===
    "blur"
  ) {

    context.save();


    /*
      Scale up slightly to avoid
      transparent blur edges.
    */

    const scale =
      1.10;


    const drawWidth =
      width *
      scale;


    const drawHeight =
      height *
      scale;


    const x =
      (
        width -
        drawWidth
      ) /
      2;


    const y =
      (
        height -
        drawHeight
      ) /
      2;


    context.filter =
      "blur(20px)";


    context.drawImage(
      sourceImage,
      x,
      y,
      drawWidth,
      drawHeight
    );


    context.restore();


    return;
  }


  /* -------------------------------------------------------
     DEFAULT
     ------------------------------------------------------- */

  context.drawImage(
    sourceImage,
    0,
    0,
    width,
    height
  );
}


/* =========================================================
   COVER IMAGE
   ========================================================= */

function drawCoverImage(
  context,
  image,
  width,
  height
) {

  const imageWidth =
    image.naturalWidth ||
    image.width;


  const imageHeight =
    image.naturalHeight ||
    image.height;


  if (
    !imageWidth ||
    !imageHeight
  ) {
    return;
  }


  const imageRatio =
    imageWidth /
    imageHeight;


  const canvasRatio =
    width /
    height;


  let drawWidth;

  let drawHeight;

  let x;

  let y;


  if (
    imageRatio >
    canvasRatio
  ) {

    drawHeight =
      height;

    drawWidth =
      height *
      imageRatio;

    x =
      (
        width -
        drawWidth
      ) /
      2;

    y = 0;

  } else {

    drawWidth =
      width;

    drawHeight =
      width /
      imageRatio;

    x = 0;

    y =
      (
        height -
        drawHeight
      ) /
      2;
  }


  context.drawImage(
    image,
    x,
    y,
    drawWidth,
    drawHeight
  );
}


/* =========================================================
   BACKGROUND MODE
   ========================================================= */

function setBackgroundMode(
  mode
) {

  currentBackgroundMode =
    mode;


  updateBackgroundButtons();


  if (
    mode ===
    "original"
  ) {

    showOriginalCamera();


    setStatus(
      "Original camera"
    );


    showToast(
      "Original background selected."
    );


    return;
  }


  if (!cameraRunning) {

    showToast(
      "Start the camera first."
    );


    return;
  }


  if (!segmentationReady) {

    showToast(
      "AI is still loading."
    );


    return;
  }


  startAIProcessing();


  const messages = {

    remove:
      "Background removed.",

    blur:
      "Background blur enabled.",

    image:
      "Custom background enabled.",

    color:
      "Solid color background enabled."

  };


  setStatus(
    messages[mode] ||
    "AI background enabled."
  );


  showToast(
    messages[mode] ||
    "Background changed."
  );
}


/* =========================================================
   BACKGROUND BUTTON UI
   ========================================================= */

function updateBackgroundButtons() {

  const buttons = [

    bgOriginalBtn,

    bgRemoveBtn,

    bgBlurBtn,

    bgImageBtn,

    bgColorBtn

  ];


  buttons.forEach(
    button => {

      if (!button) {
        return;
      }

      button.classList.remove(
        "active"
      );

    }
  );


  if (
    currentBackgroundMode ===
    "original"
  ) {

    bgOriginalBtn &&
      bgOriginalBtn.classList.add(
        "active"
      );
  }


  if (
    currentBackgroundMode ===
    "remove"
  ) {

    bgRemoveBtn &&
      bgRemoveBtn.classList.add(
        "active"
      );
  }


  if (
    currentBackgroundMode ===
    "blur"
  ) {

    bgBlurBtn &&
      bgBlurBtn.classList.add(
        "active"
      );
  }


  if (
    currentBackgroundMode ===
    "image"
  ) {

    bgImageBtn &&
      bgImageBtn.classList.add(
        "active"
      );
  }


  if (
    currentBackgroundMode ===
    "color"
  ) {

    bgColorBtn &&
      bgColorBtn.classList.add(
        "active"
      );
  }
}


/* =========================================================
   BACKGROUND EVENTS
   ========================================================= */

if (bgOriginalBtn) {

  bgOriginalBtn.addEventListener(
    "click",
    () => {

      setBackgroundMode(
        "original"
      );

    }
  );
}


if (bgRemoveBtn) {

  bgRemoveBtn.addEventListener(
    "click",
    () => {

      setBackgroundMode(
        "remove"
      );

    }
  );
}


if (bgBlurBtn) {

  bgBlurBtn.addEventListener(
    "click",
    () => {

      setBackgroundMode(
        "blur"
      );

    }
  );
}


if (bgImageBtn) {

  bgImageBtn.addEventListener(
    "click",
    () => {

      if (
        backgroundImageUpload
      ) {

        backgroundImageUpload.click();

      }

    }
  );
}


if (bgColorBtn) {

  bgColorBtn.addEventListener(
    "click",
    () => {

      setBackgroundMode(
        "color"
      );

    }
  );
}


/* =========================================================
   COLOR
   ========================================================= */

if (backgroundColor) {

  backgroundColor.addEventListener(
    "input",
    () => {

      currentBackgroundMode =
        "color";


      updateBackgroundButtons();


      if (
        cameraRunning
      ) {

        startAIProcessing();

      }

    }
  );
}


/* =========================================================
   CUSTOM IMAGE
   ========================================================= */

if (
  backgroundImageUpload
) {

  backgroundImageUpload.addEventListener(
    "change",
    event => {

      const file =
        event.target.files &&
        event.target.files[0];


      if (!file) {
        return;
      }


      const url =
        URL.createObjectURL(
          file
        );


      const image =
        new Image();


      image.onload =
        () => {

          customBackgroundImage =
            image;


          currentBackgroundMode =
            "image";


          updateBackgroundButtons();


          if (
            cameraRunning
          ) {

            startAIProcessing();

          }


          setStatus(
            "Custom background ready"
          );


          showToast(
            "Custom background applied."
          );


        };


      image.onerror =
        () => {

          showToast(
            "Unable to load background image."
          );

        };


      image.src =
        url;
    }
  );
}


/* =========================================================
   CAMERA EVENTS
   ========================================================= */

if (startCameraBtn) {

  startCameraBtn.addEventListener(
    "click",
    startCamera
  );
}


if (stopCameraBtn) {

  stopCameraBtn.addEventListener(
    "click",
    () => {

      stopCamera();

    }
  );
}


if (switchCameraBtn) {

  switchCameraBtn.addEventListener(
    "click",
    switchCamera
  );
}


/* =========================================================
   CAMERA VIDEO METADATA
   ========================================================= */

if (mentorCameraVideo) {

  mentorCameraVideo.addEventListener(
    "loadedmetadata",
    () => {

      prepareCanvases();

      applyCameraOrientation();


      if (
        cameraRunning &&
        currentBackgroundMode !==
          "original"
      ) {

        startAIProcessing();

      }

    }
  );
}


/* =========================================================
   MENTOR DRAG
   ========================================================= */

function initializeMentorDrag() {

  if (!mentorCard) {
    return;
  }


  mentorCard.addEventListener(
    "pointerdown",
    mentorPointerDown
  );


  mentorCard.addEventListener(
    "pointermove",
    mentorPointerMove
  );


  mentorCard.addEventListener(
    "pointerup",
    mentorPointerUp
  );


  mentorCard.addEventListener(
    "pointercancel",
    mentorPointerUp
  );


  mentorCard.addEventListener(
    "lostpointercapture",
    mentorPointerUp
  );
}


/* =========================================================
   INTERACTIVE ELEMENT CHECK
   ========================================================= */

function isInteractiveMentorElement(
  target
) {

  if (!target) {
    return false;
  }


  return Boolean(
    target.closest(
      "button, input, select, textarea, a, label, .mentor-resize, #mentorResize"
    )
  );
}


/* =========================================================
   POINTER DOWN
   ========================================================= */

function mentorPointerDown(
  event
) {

  if (!mentorCard) {
    return;
  }


  if (
    isInteractiveMentorElement(
      event.target
    )
  ) {

    return;
  }


  if (
    event.button !==
      undefined &&
    event.button !==
      0
  ) {

    return;
  }


  if (!stage) {
    return;
  }


  const stageRect =
    stage.getBoundingClientRect();


  const mentorRect =
    mentorCard.getBoundingClientRect();


  mentorDragging =
    true;


  mentorDragPointerId =
    event.pointerId;


  mentorStartPointerX =
    event.clientX;


  mentorStartPointerY =
    event.clientY;


  mentorStartLeft =
    mentorRect.left -
    stageRect.left;


  mentorStartTop =
    mentorRect.top -
    stageRect.top;


  mentorCard.classList.add(
    "dragging"
  );


  try {

    mentorCard.setPointerCapture(
      event.pointerId
    );

  } catch (error) {

    /* ignore */

  }


  event.preventDefault();
}


/* =========================================================
   POINTER MOVE
   ========================================================= */

function mentorPointerMove(
  event
) {

  if (
    !mentorDragging ||
    !stage ||
    !mentorCard
  ) {

    return;
  }


  if (
    event.pointerId !==
    mentorDragPointerId
  ) {

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


  const maxLeft =
    Math.max(
      0,
      stageRect.width -
        mentorRect.width
    );


  const maxTop =
    Math.max(
      0,
      stageRect.height -
        mentorRect.height
    );


  newLeft =
    Math.max(
      0,
      Math.min(
        newLeft,
        maxLeft
      )
    );


  newTop =
    Math.max(
      0,
      Math.min(
        newTop,
        maxTop
      )
    );


  mentorCard.style.left =
    newLeft + "px";


  mentorCard.style.top =
    newTop + "px";


  mentorCard.style.right =
    "auto";


  mentorCard.style.bottom =
    "auto";
}


/* =========================================================
   POINTER UP
   ========================================================= */

function mentorPointerUp(
  event
) {

  if (!mentorDragging) {
    return;
  }


  if (
    mentorDragPointerId !==
      null &&
    event.pointerId !==
      mentorDragPointerId
  ) {

    return;
  }


  mentorDragging =
    false;


  mentorCard.classList.remove(
    "dragging"
  );


  try {

    if (
      mentorDragPointerId !==
        null &&
      mentorCard.hasPointerCapture(
        mentorDragPointerId
      )
    ) {

      mentorCard.releasePointerCapture(
        mentorDragPointerId
      );

    }

  } catch (error) {

    /* ignore */

  }


  mentorDragPointerId =
    null;


  saveMentorPosition();
}


/* =========================================================
   SAVE MENTOR POSITION
   ========================================================= */

function saveMentorPosition() {

  if (!mentorCard) {
    return;
  }


  localStorage.setItem(
    "courseStudioMentorLeft",
    String(
      mentorCard.offsetLeft
    )
  );


  localStorage.setItem(
    "courseStudioMentorTop",
    String(
      mentorCard.offsetTop
    )
  );
}


/* =========================================================
   RESET MENTOR POSITION
   ========================================================= */

function resetMentorPosition() {

  if (!mentorCard) {
    return;
  }


  mentorCard.style.left =
    "";

  mentorCard.style.top =
    "";

  mentorCard.style.right =
    "";

  mentorCard.style.bottom =
    "";


  localStorage.removeItem(
    "courseStudioMentorLeft"
  );


  localStorage.removeItem(
    "courseStudioMentorTop"
  );


  showToast(
    "Mentor position reset."
  );
}


/* =========================================================
   RECORDING
   ========================================================= */

function toggleRecording() {

  if (isRecording) {

    stopRecording();

  } else {

    startRecording();

  }
}


/* =========================================================
   START RECORDING
   ========================================================= */

async function startRecording() {

  if (!stage) {

    showToast(
      "Recording stage not found."
    );

    return;
  }


  try {

    recordedChunks =
      [];


    /*
      Capture stage.
    */

    const canvasStream =
      stage.captureStream
        ? stage.captureStream(
            30
          )
        : null;


    if (!canvasStream) {

      if (
        navigator.mediaDevices &&
        navigator.mediaDevices
          .getDisplayMedia
      ) {

        recordingStream =
          await navigator
            .mediaDevices
            .getDisplayMedia({
              video: true,
              audio: true
            });

      } else {

        throw new Error(
          "Recording unsupported."
        );
      }

    } else {

      recordingStream =
        canvasStream;


      /*
        Microphone.
      */

      try {

        recordingAudioStream =
          await navigator
            .mediaDevices
            .getUserMedia({
              audio: true
            });


        recordingAudioStream
          .getAudioTracks()
          .forEach(
            track => {

              recordingStream.addTrack(
                track
              );

            }
          );

      } catch (audioError) {

        console.warn(
          "Microphone unavailable:",
          audioError
        );
      }
    }


    const mimeTypes = [

      "video/webm;codecs=vp9,opus",

      "video/webm;codecs=vp8,opus",

      "video/webm"

    ];


    let selectedMime =
      "";


    for (
      const mimeType
      of mimeTypes
    ) {

      if (
        typeof MediaRecorder !==
          "undefined" &&
        MediaRecorder.isTypeSupported(
          mimeType
        )
      ) {

        selectedMime =
          mimeType;

        break;
      }
    }


    if (
      typeof MediaRecorder ===
      "undefined"
    ) {

      throw new Error(
        "MediaRecorder unsupported."
      );
    }


    mediaRecorder =
      new MediaRecorder(
        recordingStream,
        selectedMime
          ? {
              mimeType:
                selectedMime
            }
          : undefined
      );


    mediaRecorder.ondataavailable =
      event => {

        if (
          event.data &&
          event.data.size >
            0
        ) {

          recordedChunks.push(
            event.data
          );
        }

      };


    mediaRecorder.onstop =
      () => {

        finishRecording();

      };


    mediaRecorder.onerror =
      event => {

        console.error(
          "Recording error:",
          event
        );


        showToast(
          "Recording error."
        );


        cleanupRecordingStream();
      };


    mediaRecorder.start(
      1000
    );


    isRecording =
      true;


    updateRecordingUI();


    setStatus(
      "Recording"
    );


    showToast(
      "Recording started."
    );


  } catch (error) {

    console.error(
      "Recording start error:",
      error
    );


    cleanupRecordingStream();


    showToast(
      "Unable to start recording."
    );
  }
}


/* =========================================================
   STOP RECORDING
   ========================================================= */

function stopRecording() {

  if (
    mediaRecorder &&
    mediaRecorder.state !==
      "inactive"
  ) {

    mediaRecorder.stop();


    isRecording =
      false;


    updateRecordingUI();


    setStatus(
      "Preparing recording..."
    );


    return;
  }


  isRecording =
    false;


  updateRecordingUI();
}


/* =========================================================
   FINISH RECORDING
   ========================================================= */

function finishRecording() {

  if (
    recordedChunks.length ===
    0
  ) {

    cleanupRecordingStream();

    setStatus(
      "Recording finished"
    );

    return;
  }


  const blob =
    new Blob(
      recordedChunks,
      {
        type:
          "video/webm"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;


  link.download =
    "mentor-studio-" +
    createFileDate() +
    ".webm";


  document.body.appendChild(
    link
  );


  link.click();


  link.remove();


  setTimeout(
    () => {

      URL.revokeObjectURL(
        url
      );

    },
    5000
  );


  cleanupRecordingStream();


  setStatus(
    "Recording saved"
  );


  showToast(
    "Recording saved successfully."
  );
}


/* =========================================================
   RECORDING CLEANUP
   ========================================================= */

function cleanupRecordingStream() {

  if (recordingStream) {

    recordingStream
      .getTracks()
      .forEach(
        track => {

          track.stop();

        }
      );

    recordingStream =
      null;
  }


  if (
    recordingAudioStream
  ) {

    recordingAudioStream
      .getTracks()
      .forEach(
        track => {

          track.stop();

        }
      );

    recordingAudioStream =
      null;
  }


  mediaRecorder =
    null;


  recordedChunks =
    [];
}


/* =========================================================
   RECORDING UI
   ========================================================= */

function updateRecordingUI() {

  if (!recordTopBtn) {
    return;
  }


  if (isRecording) {

    recordTopBtn.classList.add(
      "recording"
    );


    recordTopBtn.textContent =
      "■ Stop Recording";

  } else {

    recordTopBtn.classList.remove(
      "recording"
    );


    recordTopBtn.textContent =
      "● Record";
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
    "open"
  );
}


function closeSettings() {

  if (!settingsModal) {
    return;
  }


  settingsModal.classList.remove(
    "open"
  );
}


function openBrandSettings() {

  openSettings();


  if (brandInput) {

    setTimeout(
      () => {

        brandInput.focus();

        brandInput.select();

      },
      100
    );
  }
}


/* =========================================================
   SAVE SETTINGS
   ========================================================= */

function saveSettings() {

  const brand =
    brandInput
      ? brandInput.value.trim()
      : "";


  if (brand) {

    localStorage.setItem(
      "courseStudioBrand",
      brand
    );


    if (brandBadge) {

      brandBadge.textContent =
        brand;
    }
  }


  localStorage.setItem(
    "courseStudioMentorBg",
    currentBackgroundMode
  );


  if (backgroundColor) {

    localStorage.setItem(
      "courseStudioBackgroundColor",
      backgroundColor.value
    );
  }


  saveMentorPosition();


  closeSettings();


  showToast(
    "Settings saved."
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
    brandInput
  ) {

    brandInput.value =
      savedBrand;
  }


  if (
    savedBrand &&
    brandBadge
  ) {

    brandBadge.textContent =
      savedBrand;
  }


  const savedMode =
    localStorage.getItem(
      "courseStudioMentorBg"
    );


  if (savedMode) {

    currentBackgroundMode =
      savedMode;
  }


  const savedColor =
    localStorage.getItem(
      "courseStudioBackgroundColor"
    );


  if (
    savedColor &&
    backgroundColor
  ) {

    backgroundColor.value =
      savedColor;
  }


  const savedLeft =
    localStorage.getItem(
      "courseStudioMentorLeft"
    );


  const savedTop =
    localStorage.getItem(
      "courseStudioMentorTop"
    );


  if (
    mentorCard &&
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


  updateBackgroundButtons();
}


/* =========================================================
   MENTOR BACKGROUND COMPATIBILITY
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
    "courseStudioMentorCardBg",
    color
  );
}


/* =========================================================
   SETTINGS OUTSIDE CLICK
   ========================================================= */

if (settingsModal) {

  settingsModal.addEventListener(
    "click",
    event => {

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
   DATA ACTION BUTTONS
   ========================================================= */

document.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "[data-action]"
      );


    if (!button) {
      return;
    }


    const action =
      button.dataset.action;


    switch (action) {

      case "add-student":

        addStudent();

        break;


      case "remove-student":

        if (
          button.dataset.index !==
          undefined
        ) {

          removeStudent(
            Number(
              button.dataset.index
            )
          );
        }

        break;


      case "play-main":

        toggleMainPlay();

        break;


      case "clear-main":

        clearMainContent();

        break;


      case "fullscreen":

        fullscreenStage();

        break;


      case "record":

        toggleRecording();

        break;


      case "settings":

        openSettings();

        break;


      case "close-settings":

        closeSettings();

        break;


      case "save-settings":

        saveSettings();

        break;


      case "brand":

        openBrandSettings();

        break;


      case "reset-mentor":

        resetMentorPosition();

        break;


      case "camera-start":

        startCamera();

        break;


      case "camera-stop":

        stopCamera();

        break;


      case "camera-switch":

        switchCamera();

        break;


      default:

        break;
    }

  }
);


/* =========================================================
   KEYBOARD
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    /*
      ESC
    */

    if (
      event.key ===
      "Escape"
    ) {

      closeSettings();


      if (isRecording) {

        stopRecording();

      }


      return;
    }


    /*
      CTRL + ENTER
      Record
    */

    if (
      event.ctrlKey &&
      event.key ===
        "Enter"
    ) {

      event.preventDefault();


      toggleRecording();


      return;
    }


    /*
      R
      Reset mentor position
    */

    if (
      event.key.toLowerCase() ===
        "r" &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.shiftKey
    ) {

      const active =
        document.activeElement;


      const typing =
        active &&
        (
          active.tagName ===
            "INPUT" ||
          active.tagName ===
            "TEXTAREA" ||
          active.tagName ===
            "SELECT"
        );


      if (!typing) {

        resetMentorPosition();

      }

    }

  }
);


/* =========================================================
   WINDOW RESIZE
   ========================================================= */

window.addEventListener(
  "resize",
  () => {

    if (
      !stage ||
      !mentorCard
    ) {
      return;
    }


    const stageRect =
      stage.getBoundingClientRect();


    const mentorRect =
      mentorCard.getBoundingClientRect();


    let left =
      mentorCard.offsetLeft;


    let top =
      mentorCard.offsetTop;


    const maxLeft =
      Math.max(
        0,
        stageRect.width -
          mentorRect.width
      );


    const maxTop =
      Math.max(
        0,
        stageRect.height -
          mentorRect.height
      );


    if (
      left >
      maxLeft
    ) {

      left =
        maxLeft;
    }


    if (
      top >
      maxTop
    ) {

      top =
        maxTop;
    }


    if (
      left < 0
    ) {

      left =
        0;
    }


    if (
      top < 0
    ) {

      top =
        0;
    }


    mentorCard.style.left =
      left + "px";


    mentorCard.style.top =
      top + "px";


    mentorCard.style.right =
      "auto";


    mentorCard.style.bottom =
      "auto";
  }
);


/* =========================================================
   PAGE VISIBILITY
   ========================================================= */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.hidden
    ) {

      return;
    }


    if (
      cameraRunning &&
      currentBackgroundMode !==
        "original"
    ) {

      startAIProcessing();

    }

  }
);


/* =========================================================
   BEFORE UNLOAD
   ========================================================= */

window.addEventListener(
  "beforeunload",
  () => {

    stopAIProcessing();


    if (cameraStream) {

      cameraStream
        .getTracks()
        .forEach(
          track => {

            track.stop();

          }
        );
    }


    if (recordingStream) {

      recordingStream
        .getTracks()
        .forEach(
          track => {

            track.stop();

          }
        );
    }


    if (
      recordingAudioStream
    ) {

      recordingAudioStream
        .getTracks()
        .forEach(
          track => {

            track.stop();

          }
        );
    }

  }
);


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initializeMentorStudio() {

  renderStudents();


  loadSettings();


  initializeMentorDrag();


  updateCameraButtons();


  updateBackgroundButtons();


  setCameraStatus(
    "Camera offline"
  );


  setStatus(
    "Ready"
  );


  console.log(
    "SNK Mentor Studio — Step 3.3 ready."
  );
}


initializeMentorStudio();


/* =========================================================
   GLOBAL API
   ========================================================= */

window.startCamera =
  startCamera;

window.stopCamera =
  stopCamera;

window.switchCamera =
  switchCamera;

window.toggleRecording =
  toggleRecording;

window.startRecording =
  startRecording;

window.stopRecording =
  stopRecording;

window.toggleMainPlay =
  toggleMainPlay;

window.clearMainContent =
  clearMainContent;

window.fullscreenStage =
  fullscreenStage;

window.openSettings =
  openSettings;

window.closeSettings =
  closeSettings;

window.openBrandSettings =
  openBrandSettings;

window.saveSettings =
  saveSettings;

window.addStudent =
  addStudent;

window.removeStudent =
  removeStudent;

window.resetMentorPosition =
  resetMentorPosition;

window.setBackgroundMode =
  setBackgroundMode;

window.changeMentorBackground =
  changeMentorBackground;
