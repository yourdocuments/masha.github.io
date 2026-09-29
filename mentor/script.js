/* =========================================================
   PERSONAL COURSE STUDIO
   MENTOR STUDIO — STEP 3.5

   Features
   ---------------------------------------------------------
   1. Main image upload
   2. Main video upload
   3. Main video play / pause
   4. Mentor video upload
   5. Real webcam
   6. Front / rear camera switch
   7. AI person segmentation
   8. Original background
   9. Remove background
   10. Blur background
   11. Custom image background
   12. Solid color background
   13. Mentor drag / move
   14. Composition canvas
   15. Main video + mentor composition
   16. Audio mixing
   17. WebM recording
   18. Recording timer
   19. Pause / Resume recording
   20. Recording preview modal
   21. Download recording
   22. Record again
   23. Students management
   24. Settings
   25. Brand settings
   26. LocalStorage
   27. Keyboard shortcuts
   28. Performance optimized AI canvas
========================================================= */

"use strict";

/* =========================================================
   DOM REFERENCES
========================================================= */

const imageUpload = document.getElementById("imageUpload");
const videoUpload = document.getElementById("videoUpload");
const mentorUpload = document.getElementById("mentorUpload");

const mainImage = document.getElementById("mainImage");
const mainVideo = document.getElementById("mainVideo");

const mentorVideo = document.getElementById("mentorVideo");
const mentorCameraVideo = document.getElementById("mentorCameraVideo");
const mentorAICanvas = document.getElementById("mentorAICanvas");

const mentorPlaceholder = document.getElementById("mentorPlaceholder");
const mentorSourceLabel = document.getElementById("mentorSourceLabel");

const welcomeContent = document.getElementById("welcomeContent");

const stage = document.getElementById("stage");
const mentorCard = document.getElementById("mentorCard");
const mentorResize = document.getElementById("mentorResize");

const brandBadge = document.getElementById("brandBadge");
const brandInput = document.getElementById("brandInput");

const studentsList = document.getElementById("studentsList");
const studentCount = document.getElementById("studentCount");

const statusText = document.getElementById("statusText");
const statusDot = document.getElementById("statusDot");

const recordTopBtn = document.getElementById("recordTopBtn");

const settingsModal = document.getElementById("settingsModal");
const toast = document.getElementById("toast");

/* Camera controls */
const startCameraBtn = document.getElementById("startCameraBtn");
const stopCameraBtn = document.getElementById("stopCameraBtn");
const switchCameraBtn = document.getElementById("switchCameraBtn");
const cameraStatus = document.getElementById("cameraStatus");

/* Background controls */
const bgOriginalBtn = document.getElementById("bgOriginalBtn");
const bgRemoveBtn = document.getElementById("bgRemoveBtn");
const bgBlurBtn = document.getElementById("bgBlurBtn");
const bgImageBtn = document.getElementById("bgImageBtn");
const bgColorBtn = document.getElementById("bgColorBtn");

const backgroundColor = document.getElementById("backgroundColor");
const backgroundImageUpload = document.getElementById(
  "backgroundImageUpload"
);

/* AI canvases */
const aiCanvas = document.getElementById("aiCanvas");
const aiSourceCanvas = document.getElementById("aiSourceCanvas");
const aiMaskCanvas = document.getElementById("aiMaskCanvas");


/* =========================================================
   APPLICATION STATE
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
    online: true
  },
  {
    name: "Student 06",
    online: true
  },
  {
    name: "Student 07",
    online: true
  },
  {
    name: "Student 08",
    online: true
  }
];


/* =========================================================
   MEDIA / FILE STATE
========================================================= */

let mainImageURL = "";
let mainVideoURL = "";
let mentorVideoURL = "";
let backgroundImageURL = "";

let backgroundImage = null;


/* =========================================================
   CAMERA STATE
========================================================= */

let cameraStream = null;
let currentCameraFacing = "user";

let cameraRunning = false;


/* =========================================================
   MEDIAPIPE STATE
========================================================= */

let selfieSegmentation = null;
let segmentationInitialized = false;
let segmentationBusy = false;

let backgroundMode = "original";

/*
   Supported modes:

   original
   remove
   blur
   image
   color
*/


/* =========================================================
   AI CANVAS CACHE
========================================================= */

let personCanvas = null;
let personCtx = null;

let personCanvasWidth = 0;
let personCanvasHeight = 0;


/* =========================================================
   MENTOR DRAG STATE
========================================================= */

let mentorDragging = false;

let mentorDragPointerId = null;

let mentorStartPointerX = 0;
let mentorStartPointerY = 0;

let mentorStartLeft = 0;
let mentorStartTop = 0;


/* =========================================================
   COMPOSITION / RECORDING STATE
========================================================= */

let compositionCanvas = null;
let compositionCtx = null;

let compositionAnimationFrame = null;

let recordingStream = null;
let combinedRecordingStream = null;

let mediaRecorder = null;
let recordedChunks = [];

let isRecording = false;
let isRecordingPaused = false;

let recordingStartedAt = 0;
let recordingPausedAt = 0;
let recordingPausedTotal = 0;

let recordingTimerInterval = null;


/* =========================================================
   AUDIO STATE
========================================================= */

let audioContext = null;
let audioDestination = null;

let mainVideoAudioSource = null;
let mentorVideoAudioSource = null;

let microphoneStream = null;
let microphoneAudioSource = null;

let mainAudioConnected = false;
let mentorAudioConnected = false;
let microphoneConnected = false;


/* =========================================================
   PREVIEW STATE
========================================================= */

let previewModal = null;
let previewVideo = null;
let previewBlobURL = null;


/* =========================================================
   RECORDING SETTINGS
========================================================= */

const COMPOSITION_WIDTH = 1920;
const COMPOSITION_HEIGHT = 1080;

const RECORDING_FPS = 30;


/* =========================================================
   AI MASK SETTINGS
========================================================= */

const MASK_EDGE_START = 0.10;
const MASK_EDGE_END = 0.62;
const MASK_EDGE_POWER = 1.15;
const MIN_VISIBLE_ALPHA = 0.015;


/* =========================================================
   HELPER — ESCAPE HTML
========================================================= */

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   HELPER — DATE
========================================================= */

function createFileDate() {
  const now = new Date();

  const pad = (number) => String(number).padStart(2, "0");

  return (
    now.getFullYear() +
    "-" +
    pad(now.getMonth() + 1) +
    "-" +
    pad(now.getDate()) +
    "_" +
    pad(now.getHours()) +
    "-" +
    pad(now.getMinutes()) +
    "-" +
    pad(now.getSeconds())
  );
}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}


/* =========================================================
   STATUS
========================================================= */

function setStatus(text, type = "ready") {
  if (statusText) {
    statusText.textContent = text;
  }

  if (statusDot) {
    statusDot.classList.remove(
      "recording",
      "paused",
      "error"
    );

    if (type === "recording") {
      statusDot.classList.add("recording");
    }

    if (type === "paused") {
      statusDot.classList.add("paused");
    }

    if (type === "error") {
      statusDot.classList.add("error");
    }
  }
}


/* =========================================================
   STUDENTS
========================================================= */

function renderStudents() {
  if (!studentsList) return;

  studentsList.innerHTML = "";

  students.forEach((student, index) => {
    const item = document.createElement("div");

    item.className = "student-item";

    item.innerHTML = `
      <div class="student-avatar">
        ${escapeHTML(student.name.charAt(0).toUpperCase())}
      </div>

      <div class="student-info">
        <div class="student-name">
          ${escapeHTML(student.name)}
        </div>

        <div class="student-status">
          <span class="student-online-dot ${
            student.online ? "online" : ""
          }"></span>

          ${student.online ? "Online" : "Offline"}
        </div>
      </div>

      <button
        class="student-remove"
        type="button"
        data-index="${index}"
        title="Remove student"
      >
        ×
      </button>
    `;

    const removeButton = item.querySelector(
      ".student-remove"
    );

    if (removeButton) {
      removeButton.addEventListener("click", () => {
        removeStudent(index);
      });
    }

    studentsList.appendChild(item);
  });

  updateStudentCount();
}


function updateStudentCount() {
  if (studentCount) {
    studentCount.textContent = students.length;
  }
}


function addStudent(name = "") {
  const studentNumber = students.length + 1;

  const finalName =
    name.trim() ||
    `Student ${String(studentNumber).padStart(2, "0")}`;

  students.push({
    name: finalName,
    online: true
  });

  renderStudents();

  showToast("Student added");
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

  showToast("Student removed");
}


/* =========================================================
   MAIN IMAGE UPLOAD
========================================================= */

if (imageUpload) {
  imageUpload.addEventListener(
    "change",
    (event) => {
      const file = event.target.files?.[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showToast("Please select an image");
        return;
      }

      if (mainImageURL) {
        URL.revokeObjectURL(mainImageURL);
      }

      mainImageURL = URL.createObjectURL(file);

      if (mainImage) {
        mainImage.src = mainImageURL;
        mainImage.style.display = "block";
      }

      if (mainVideo) {
        mainVideo.style.display = "none";
        mainVideo.pause();
      }

      if (welcomeContent) {
        welcomeContent.style.display = "none";
      }

      setStatus("Slide loaded");
      showToast("Slide image loaded");
    }
  );
}


/* =========================================================
   MAIN VIDEO UPLOAD
========================================================= */

if (videoUpload) {
  videoUpload.addEventListener(
    "change",
    (event) => {
      const file = event.target.files?.[0];

      if (!file) return;

      if (!file.type.startsWith("video/")) {
        showToast("Please select a video");
        return;
      }

      if (mainVideoURL) {
        URL.revokeObjectURL(mainVideoURL);
      }

      mainVideoURL = URL.createObjectURL(file);

      if (mainVideo) {
        mainVideo.src = mainVideoURL;
        mainVideo.style.display = "block";
        mainVideo.load();
      }

      if (mainImage) {
        mainImage.style.display = "none";
      }

      if (welcomeContent) {
        welcomeContent.style.display = "none";
      }

      setStatus("Main video loaded");
      showToast("Main video loaded");
    }
  );
}


/* =========================================================
   MENTOR VIDEO UPLOAD
========================================================= */

if (mentorUpload) {
  mentorUpload.addEventListener(
    "change",
    (event) => {
      const file = event.target.files?.[0];

      if (!file) return;

      if (!file.type.startsWith("video/")) {
        showToast("Please select a video");
        return;
      }

      stopCamera(false);

      if (mentorVideoURL) {
        URL.revokeObjectURL(mentorVideoURL);
      }

      mentorVideoURL = URL.createObjectURL(file);

      if (mentorVideo) {
        mentorVideo.src = mentorVideoURL;
        mentorVideo.style.display = "block";
        mentorVideo.load();
      }

      if (mentorCameraVideo) {
        mentorCameraVideo.style.display = "none";
      }

      if (mentorAICanvas) {
        mentorAICanvas.style.display = "none";
      }

      if (mentorPlaceholder) {
        mentorPlaceholder.style.display = "none";
      }

      if (mentorSourceLabel) {
        mentorSourceLabel.textContent = "Uploaded Mentor Video";
      }

      setStatus("Mentor video loaded");
      showToast("Mentor video loaded");
    }
  );
}


/* =========================================================
   MAIN VIDEO PLAY / PAUSE
========================================================= */

function toggleMainPlay() {
  if (!mainVideo || mainVideo.style.display === "none") {
    showToast("No main video loaded");
    return;
  }

  if (mainVideo.paused) {
    mainVideo
      .play()
      .catch(() => {
        showToast("Unable to play video");
      });
  } else {
    mainVideo.pause();
  }
}


if (mainVideo) {
  mainVideo.addEventListener(
    "play",
    () => {
      setStatus("Main video playing");
    }
  );

  mainVideo.addEventListener(
    "pause",
    () => {
      if (!isRecording) {
        setStatus("Main video paused");
      }
    }
  );

  mainVideo.addEventListener(
    "ended",
    () => {
      if (!isRecording) {
        setStatus("Main video ended");
      }
    }
  );
}


/* =========================================================
   CLEAR MAIN CONTENT
========================================================= */

function clearMainContent() {
  if (mainImage) {
    mainImage.removeAttribute("src");
    mainImage.style.display = "none";
  }

  if (mainVideo) {
    mainVideo.pause();
    mainVideo.removeAttribute("src");
    mainVideo.load();
    mainVideo.style.display = "none";
  }

  if (welcomeContent) {
    welcomeContent.style.display = "flex";
  }

  if (mainImageURL) {
    URL.revokeObjectURL(mainImageURL);
    mainImageURL = "";
  }

  if (mainVideoURL) {
    URL.revokeObjectURL(mainVideoURL);
    mainVideoURL = "";
  }

  setStatus("Ready");
}


/* =========================================================
   FULLSCREEN
========================================================= */

function fullscreenStage() {
  if (!stage) return;

  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
    return;
  }

  if (stage.requestFullscreen) {
    stage.requestFullscreen().catch(() => {});
  }
}


/* =========================================================
   CAMERA
========================================================= */

async function startCamera() {
  try {
    stopCamera(false);

    setCameraStatus("Starting camera...");

    const constraints = {
      audio: false,
      video: {
        facingMode: currentCameraFacing,
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
      await navigator.mediaDevices.getUserMedia(
        constraints
      );

    if (mentorCameraVideo) {
      mentorCameraVideo.srcObject = cameraStream;
      mentorCameraVideo.muted = true;
      mentorCameraVideo.playsInline = true;

      mentorCameraVideo.style.display = "block";

      await mentorCameraVideo.play().catch(() => {});
    }

    if (mentorVideo) {
      mentorVideo.pause();
      mentorVideo.style.display = "none";
    }

    if (mentorAICanvas) {
      mentorAICanvas.style.display = "none";
    }

    if (mentorPlaceholder) {
      mentorPlaceholder.style.display = "none";
    }

    cameraRunning = true;

    if (mentorSourceLabel) {
      mentorSourceLabel.textContent = "Live Camera";
    }

    setCameraStatus(
      currentCameraFacing === "user"
        ? "Front camera active"
        : "Rear camera active"
    );

    setStatus("Camera ready");

    await initializeSegmentation();

    if (backgroundMode !== "original") {
      await ensureSegmentationProcessing();
    }

    showToast("Camera started");
  } catch (error) {
    console.error(error);

    cameraRunning = false;

    setCameraStatus("Camera access failed");

    setStatus("Camera error", "error");

    showToast(
      "Camera permission or camera device unavailable"
    );
  }
}


function stopCamera(updateStatus = true) {
  if (cameraStream) {
    cameraStream
      .getTracks()
      .forEach((track) => track.stop());

    cameraStream = null;
  }

  cameraRunning = false;

  if (mentorCameraVideo) {
    mentorCameraVideo.pause();
    mentorCameraVideo.srcObject = null;
    mentorCameraVideo.style.display = "none";
  }

  if (mentorAICanvas) {
    mentorAICanvas.style.display = "none";
  }

  if (updateStatus) {
    setCameraStatus("Camera stopped");
    setStatus("Camera stopped");
  }
}


async function switchCamera() {
  if (!cameraRunning) {
    currentCameraFacing =
      currentCameraFacing === "user"
        ? "environment"
        : "user";

    showToast(
      currentCameraFacing === "user"
        ? "Front camera selected"
        : "Rear camera selected"
    );

    return;
  }

  currentCameraFacing =
    currentCameraFacing === "user"
      ? "environment"
      : "user";

  await startCamera();
}


function setCameraStatus(text) {
  if (cameraStatus) {
    cameraStatus.textContent = text;
  }
}


if (startCameraBtn) {
  startCameraBtn.addEventListener(
    "click",
    startCamera
  );
}


if (stopCameraBtn) {
  stopCameraBtn.addEventListener(
    "click",
    () => stopCamera(true)
  );
}


if (switchCameraBtn) {
  switchCameraBtn.addEventListener(
    "click",
    switchCamera
  );
}


/* =========================================================
   MEDIAPIPE INITIALIZATION
========================================================= */

async function initializeSegmentation() {
  if (segmentationInitialized) {
    return;
  }

  if (
    typeof SelfieSegmentation ===
    "undefined"
  ) {
    console.warn(
      "MediaPipe SelfieSegmentation is not available."
    );

    showToast(
      "AI background library is not loaded"
    );

    return;
  }

  try {
    selfieSegmentation =
      new SelfieSegmentation({
        locateFile: (file) => {
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

    segmentationInitialized = true;

    console.log(
      "Selfie segmentation initialized"
    );
  } catch (error) {
    console.error(error);

    showToast(
      "Unable to initialize AI background"
    );
  }
}


/* =========================================================
   AI CANVAS SIZE
========================================================= */

function ensureAICanvasSize(width, height) {
  width = Math.max(
    1,
    Math.floor(width || 640)
  );

  height = Math.max(
    1,
    Math.floor(height || 360)
  );

  if (aiCanvas) {
    if (
      aiCanvas.width !== width ||
      aiCanvas.height !== height
    ) {
      aiCanvas.width = width;
      aiCanvas.height = height;
    }
  }

  if (aiSourceCanvas) {
    if (
      aiSourceCanvas.width !== width ||
      aiSourceCanvas.height !== height
    ) {
      aiSourceCanvas.width = width;
      aiSourceCanvas.height = height;
    }
  }

  if (aiMaskCanvas) {
    if (
      aiMaskCanvas.width !== width ||
      aiMaskCanvas.height !== height
    ) {
      aiMaskCanvas.width = width;
      aiMaskCanvas.height = height;
    }
  }

  if (mentorAICanvas) {
    if (
      mentorAICanvas.width !== width ||
      mentorAICanvas.height !== height
    ) {
      mentorAICanvas.width = width;
      mentorAICanvas.height = height;
    }
  }
}


/* =========================================================
   PERSON CANVAS CACHE
========================================================= */

function ensurePersonCanvas(width, height) {
  width = Math.max(
    1,
    Math.floor(width)
  );

  height = Math.max(
    1,
    Math.floor(height)
  );

  if (
    !personCanvas ||
    personCanvasWidth !== width ||
    personCanvasHeight !== height
  ) {
    personCanvas = document.createElement(
      "canvas"
    );

    personCanvas.width = width;
    personCanvas.height = height;

    personCtx = personCanvas.getContext(
      "2d",
      {
        alpha: true,
        willReadFrequently: true
      }
    );

    personCanvasWidth = width;
    personCanvasHeight = height;
  }

  return {
    canvas: personCanvas,
    ctx: personCtx
  };
}


/* =========================================================
   SMOOTH STEP
========================================================= */

function smoothStep(
  edge0,
  edge1,
  value
) {
  if (edge0 === edge1) {
    return value < edge0 ? 0 : 1;
  }

  let t =
    (value - edge0) /
    (edge1 - edge0);

  t = Math.max(
    0,
    Math.min(1, t)
  );

  return (
    t *
    t *
    (3 - 2 * t)
  );
}


/* =========================================================
   PERSON ISOLATION
========================================================= */

function drawPersonWithBackground(
  sourceCanvas,
  maskCanvas,
  targetCanvas,
  mode
) {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const sourceCtx =
    sourceCanvas.getContext("2d", {
      willReadFrequently: true
    });

  const maskCtx =
    maskCanvas.getContext("2d", {
      willReadFrequently: true
    });

  const targetCtx =
    targetCanvas.getContext("2d");

  if (!sourceCtx || !maskCtx || !targetCtx) {
    return;
  }

  const sourceData =
    sourceCtx.getImageData(
      0,
      0,
      width,
      height
    );

  const maskData =
    maskCtx.getImageData(
      0,
      0,
      width,
      height
    );

  const sourcePixels =
    sourceData.data;

  const maskPixels =
    maskData.data;

  const cached =
    ensurePersonCanvas(
      width,
      height
    );

  const personImageData =
    cached.ctx.createImageData(
      width,
      height
    );

  const personPixels =
    personImageData.data;

  for (
    let i = 0;
    i < sourcePixels.length;
    i += 4
  ) {
    const confidence =
      maskPixels[i] / 255;

    let alpha =
      smoothStep(
        MASK_EDGE_START,
        MASK_EDGE_END,
        confidence
      );

    alpha =
      Math.pow(
        alpha,
        MASK_EDGE_POWER
      );

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

  cached.ctx.clearRect(
    0,
    0,
    width,
    height
  );

  cached.ctx.putImageData(
    personImageData,
    0,
    0
  );

  targetCtx.clearRect(
    0,
    0,
    width,
    height
  );

  if (mode === "blur") {
    targetCtx.save();

    targetCtx.filter =
      "blur(18px)";

    targetCtx.drawImage(
      sourceCanvas,
      -18,
      -18,
      width + 36,
      height + 36
    );

    targetCtx.restore();
  }

  if (mode === "remove") {
    targetCtx.fillStyle =
      "rgba(0,0,0,0)";

    targetCtx.clearRect(
      0,
      0,
      width,
      height
    );
  }

  if (mode === "color") {
    targetCtx.fillStyle =
      backgroundColor?.value ||
      "#dcecff";

    targetCtx.fillRect(
      0,
      0,
      width,
      height
    );
  }

  if (mode === "image") {
    if (backgroundImage) {
      drawImageCover(
        targetCtx,
        backgroundImage,
        width,
        height
      );
    } else {
      targetCtx.fillStyle =
        "#dcecff";

      targetCtx.fillRect(
        0,
        0,
        width,
        height
      );
    }
  }

  targetCtx.drawImage(
    cached.canvas,
    0,
    0
  );
}


/* =========================================================
   IMAGE COVER
========================================================= */

function drawImageCover(
  ctx,
  image,
  width,
  height
) {
  if (!image) return;

  const imageWidth =
    image.videoWidth ||
    image.naturalWidth ||
    image.width;

  const imageHeight =
    image.videoHeight ||
    image.naturalHeight ||
    image.height;

  if (
    !imageWidth ||
    !imageHeight
  ) {
    return;
  }

  const scale = Math.max(
    width / imageWidth,
    height / imageHeight
  );

  const drawWidth =
    imageWidth * scale;

  const drawHeight =
    imageHeight * scale;

  const x =
    (width - drawWidth) / 2;

  const y =
    (height - drawHeight) / 2;

  ctx.drawImage(
    image,
    x,
    y,
    drawWidth,
    drawHeight
  );
}


/* =========================================================
   SEGMENTATION RESULTS
========================================================= */

function handleSegmentationResults(
  results
) {
  segmentationBusy = false;

  if (
    !results ||
    !results.image
  ) {
    return;
  }

  const image =
    results.image;

  const width =
    image.videoWidth ||
    image.width ||
    640;

  const height =
    image.videoHeight ||
    image.height ||
    360;

  ensureAICanvasSize(
    width,
    height
  );

  if (
    !aiSourceCanvas ||
    !aiMaskCanvas ||
    !aiCanvas
  ) {
    return;
  }

  const sourceCtx =
    aiSourceCanvas.getContext(
      "2d"
    );

  const maskCtx =
    aiMaskCanvas.getContext(
      "2d"
    );

  const outputCtx =
    aiCanvas.getContext(
      "2d"
    );

  if (
    !sourceCtx ||
    !maskCtx ||
    !outputCtx
  ) {
    return;
  }

  sourceCtx.clearRect(
    0,
    0,
    width,
    height
  );

  sourceCtx.drawImage(
    image,
    0,
    0,
    width,
    height
  );

  maskCtx.clearRect(
    0,
    0,
    width,
    height
  );

  if (results.segmentationMask) {
    maskCtx.drawImage(
      results.segmentationMask,
      0,
      0,
      width,
      height
    );
  }

  if (
    backgroundMode ===
    "original"
  ) {
    outputCtx.clearRect(
      0,
      0,
      width,
      height
    );

    outputCtx.drawImage(
      sourceCanvas,
      0,
      0
    );
  } else {
    drawPersonWithBackground(
      aiSourceCanvas,
      aiMaskCanvas,
      aiCanvas,
      backgroundMode
    );
  }

  if (mentorAICanvas) {
    mentorAICanvas.width =
      width;

    mentorAICanvas.height =
      height;

    const mentorCtx =
      mentorAICanvas.getContext(
        "2d"
      );

    if (mentorCtx) {
      mentorCtx.clearRect(
        0,
        0,
        width,
        height
      );

      mentorCtx.drawImage(
        aiCanvas,
        0,
        0
      );
    }

    if (cameraRunning) {
      mentorAICanvas.style.display =
        backgroundMode === "original"
          ? "none"
          : "block";
    }
  }
}


/* =========================================================
   AI PROCESSING LOOP
========================================================= */

async function ensureSegmentationProcessing() {
  if (!cameraRunning) {
    return;
  }

  if (!selfieSegmentation) {
    await initializeSegmentation();
  }

  if (
    !selfieSegmentation ||
    !mentorCameraVideo
  ) {
    return;
  }

  if (
    mentorCameraVideo.readyState <
    2
  ) {
    return;
  }

  if (segmentationBusy) {
    return;
  }

  segmentationBusy = true;

  try {
    await selfieSegmentation.send({
      image: mentorCameraVideo
    });
  } catch (error) {
    segmentationBusy = false;

    console.error(
      "Segmentation error:",
      error
    );
  }
}


/* =========================================================
   AI BACKGROUND ANIMATION
========================================================= */

let aiProcessingAnimation =
  null;

function startAIProcessingLoop() {
  stopAIProcessingLoop();

  const loop = async () => {
    if (!cameraRunning) {
      aiProcessingAnimation = null;
      return;
    }

    if (
      backgroundMode !==
      "original"
    ) {
      await ensureSegmentationProcessing();
    }

    aiProcessingAnimation =
      requestAnimationFrame(loop);
  };

  aiProcessingAnimation =
    requestAnimationFrame(loop);
}


function stopAIProcessingLoop() {
  if (aiProcessingAnimation) {
    cancelAnimationFrame(
      aiProcessingAnimation
    );

    aiProcessingAnimation = null;
  }
}


/* =========================================================
   BACKGROUND IMAGE
========================================================= */

if (backgroundImageUpload) {
  backgroundImageUpload.addEventListener(
    "change",
    (event) => {
      const file =
        event.target.files?.[0];

      if (!file) return;

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        showToast(
          "Please select a background image"
        );

        return;
      }

      if (backgroundImageURL) {
        URL.revokeObjectURL(
          backgroundImageURL
        );
      }

      backgroundImageURL =
        URL.createObjectURL(file);

      backgroundImage =
        new Image();

      backgroundImage.onload =
        async () => {
          setBackgroundMode(
            "image"
          );

          showToast(
            "Custom background applied"
          );
        };

      backgroundImage.src =
        backgroundImageURL;
    }
  );
}


/* =========================================================
   BACKGROUND MODE
========================================================= */

function setBackgroundMode(mode) {
  backgroundMode = mode;

  const buttons = [
    bgOriginalBtn,
    bgRemoveBtn,
    bgBlurBtn,
    bgImageBtn,
    bgColorBtn
  ];

  buttons.forEach((button) => {
    if (button) {
      button.classList.remove(
        "active"
      );
    }
  });

  const activeMap = {
    original: bgOriginalBtn,
    remove: bgRemoveBtn,
    blur: bgBlurBtn,
    image: bgImageBtn,
    color: bgColorBtn
  };

  const activeButton =
    activeMap[mode];

  if (activeButton) {
    activeButton.classList.add(
      "active"
    );
  }

  if (
    mode === "image" &&
    !backgroundImage
  ) {
    if (backgroundImageUpload) {
      backgroundImageUpload.click();
    }

    return;
  }

  if (
    mode === "color" &&
    backgroundColor
  ) {
    backgroundColor.focus();
  }

  if (
    cameraRunning &&
    mode !== "original"
  ) {
    startAIProcessingLoop();
  }

  if (mode === "original") {
    if (mentorAICanvas) {
      mentorAICanvas.style.display =
        "none";
    }

    if (
      mentorCameraVideo &&
      cameraRunning
    ) {
      mentorCameraVideo.style.display =
        "block";
    }
  } else {
    if (mentorCameraVideo) {
      mentorCameraVideo.style.display =
        "none";
    }

    if (mentorAICanvas) {
      mentorAICanvas.style.display =
        cameraRunning
          ? "block"
          : "none";
    }
  }

  localStorage.setItem(
    "courseStudioMentorBg",
    mode
  );

  setStatus(
    `Background: ${mode}`
  );
}


if (bgOriginalBtn) {
  bgOriginalBtn.addEventListener(
    "click",
    () => setBackgroundMode(
      "original"
    )
  );
}


if (bgRemoveBtn) {
  bgRemoveBtn.addEventListener(
    "click",
    () => setBackgroundMode(
      "remove"
    )
  );
}


if (bgBlurBtn) {
  bgBlurBtn.addEventListener(
    "click",
    () => setBackgroundMode(
      "blur"
    )
  );
}


if (bgImageBtn) {
  bgImageBtn.addEventListener(
    "click",
    () => {
      if (backgroundImage) {
        setBackgroundMode(
          "image"
        );
      } else if (
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
    () => setBackgroundMode(
      "color"
    )
  );
}


if (backgroundColor) {
  backgroundColor.addEventListener(
    "input",
    () => {
      if (
        backgroundMode ===
        "color"
      ) {
        setBackgroundMode(
          "color"
        );
      }
    }
  );
}


/* =========================================================
   MENTOR DRAG
========================================================= */

function initializeMentorDrag() {
  if (!mentorCard || !stage) {
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
}


function mentorPointerDown(event) {
  if (!mentorCard || !stage) {
    return;
  }

  const target =
    event.target;

  if (
    target.closest(
      "button, input, select, textarea, a, label"
    )
  ) {
    return;
  }

  if (
    mentorResize &&
    (
      target === mentorResize ||
      mentorResize.contains(target)
    )
  ) {
    return;
  }

  const stageRect =
    stage.getBoundingClientRect();

  const mentorRect =
    mentorCard.getBoundingClientRect();

  mentorDragging = true;

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
  } catch (error) {}

  event.preventDefault();
}


function mentorPointerMove(event) {
  if (
    !mentorDragging ||
    event.pointerId !==
      mentorDragPointerId
  ) {
    return;
  }

  const dx =
    event.clientX -
    mentorStartPointerX;

  const dy =
    event.clientY -
    mentorStartPointerY;

  const stageWidth =
    stage.clientWidth;

  const stageHeight =
    stage.clientHeight;

  const mentorWidth =
    mentorCard.offsetWidth;

  const mentorHeight =
    mentorCard.offsetHeight;

  let left =
    mentorStartLeft + dx;

  let top =
    mentorStartTop + dy;

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

  left =
    Math.max(
      0,
      Math.min(
        maxLeft,
        left
      )
    );

  top =
    Math.max(
      0,
      Math.min(
        maxTop,
        top
      )
    );

  mentorCard.style.left =
    `${left}px`;

  mentorCard.style.top =
    `${top}px`;

  mentorCard.style.right =
    "auto";

  mentorCard.style.bottom =
    "auto";
}


function mentorPointerUp(event) {
  if (
    event.pointerId !==
    mentorDragPointerId
  ) {
    return;
  }

  mentorDragging = false;

  if (mentorCard) {
    mentorCard.classList.remove(
      "dragging"
    );
  }

  try {
    mentorCard.releasePointerCapture(
      event.pointerId
    );
  } catch (error) {}

  mentorDragPointerId = null;

  saveMentorPosition();
}


function saveMentorPosition() {
  if (!mentorCard) return;

  const left =
    parseFloat(
      mentorCard.style.left
    );

  const top =
    parseFloat(
      mentorCard.style.top
    );

  if (Number.isFinite(left)) {
    localStorage.setItem(
      "courseStudioMentorLeft",
      String(left)
    );
  }

  if (Number.isFinite(top)) {
    localStorage.setItem(
      "courseStudioMentorTop",
      String(top)
    );
  }
}


function resetMentorPosition() {
  if (!mentorCard) return;

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
    "Mentor position reset"
  );
}


/* =========================================================
   ACTIVE MENTOR MEDIA
========================================================= */

function getActiveMentorMedia() {
  if (
    cameraRunning &&
    backgroundMode !==
      "original" &&
    mentorAICanvas
  ) {
    return mentorAICanvas;
  }

  if (
    cameraRunning &&
    mentorCameraVideo
  ) {
    return mentorCameraVideo;
  }

  if (
    mentorVideo &&
    mentorVideo.src
  ) {
    return mentorVideo;
  }

  return null;
}


/* =========================================================
   COMPOSITION CANVAS
========================================================= */

function createCompositionCanvas() {
  if (compositionCanvas) {
    return;
  }

  compositionCanvas =
    document.createElement(
      "canvas"
    );

  compositionCanvas.width =
    COMPOSITION_WIDTH;

  compositionCanvas.height =
    COMPOSITION_HEIGHT;

  compositionCtx =
    compositionCanvas.getContext(
      "2d"
    );
}


/* =========================================================
   DRAW MEDIA COVER
========================================================= */

function drawMediaCover(
  ctx,
  media,
  x,
  y,
  width,
  height
) {
  if (!media) return;

  const mediaWidth =
    media.videoWidth ||
    media.naturalWidth ||
    media.width ||
    0;

  const mediaHeight =
    media.videoHeight ||
    media.naturalHeight ||
    media.height ||
    0;

  if (
    !mediaWidth ||
    !mediaHeight
  ) {
    return;
  }

  const scale =
    Math.max(
      width / mediaWidth,
      height / mediaHeight
    );

  const drawWidth =
    mediaWidth * scale;

  const drawHeight =
    mediaHeight * scale;

  const drawX =
    x +
    (width -
      drawWidth) /
      2;

  const drawY =
    y +
    (height -
      drawHeight) /
      2;

  ctx.drawImage(
    media,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );
}


/* =========================================================
   DRAW MAIN STAGE
========================================================= */

function drawMainStage() {
  if (
    !compositionCtx ||
    !stage
  ) {
    return;
  }

  const ctx =
    compositionCtx;

  const width =
    COMPOSITION_WIDTH;

  const height =
    COMPOSITION_HEIGHT;

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  ctx.fillStyle =
    "#0b0f16";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  let mainMedia = null;

  if (
    mainVideo &&
    mainVideo.style.display !==
      "none" &&
    mainVideo.readyState >= 2
  ) {
    mainMedia =
      mainVideo;
  } else if (
    mainImage &&
    mainImage.style.display !==
      "none" &&
    mainImage.complete
  ) {
    mainMedia =
      mainImage;
  }

  if (mainMedia) {
    drawMediaCover(
      ctx,
      mainMedia,
      0,
      0,
      width,
      height
    );
  }
}


/* =========================================================
   DRAW MENTOR OVERLAY
========================================================= */

function drawMentorOverlay() {
  if (
    !compositionCtx ||
    !stage ||
    !mentorCard
  ) {
    return;
  }

  const media =
    getActiveMentorMedia();

  if (!media) {
    return;
  }

  const stageRect =
    stage.getBoundingClientRect();

  const mentorRect =
    mentorCard.getBoundingClientRect();

  if (
    !stageRect.width ||
    !stageRect.height
  ) {
    return;
  }

  const scaleX =
    COMPOSITION_WIDTH /
    stageRect.width;

  const scaleY =
    COMPOSITION_HEIGHT /
    stageRect.height;

  const x =
    (mentorRect.left -
      stageRect.left) *
    scaleX;

  const y =
    (mentorRect.top -
      stageRect.top) *
    scaleY;

  const width =
    mentorRect.width *
    scaleX;

  const height =
    mentorRect.height *
    scaleY;

  const ctx =
    compositionCtx;

  ctx.save();

  /*
     Shadow around mentor window
  */
  ctx.shadowColor =
    "rgba(0,0,0,0.45)";

  ctx.shadowBlur = 30;

  ctx.shadowOffsetY = 8;

  /*
     Background
  */
  ctx.fillStyle =
    "#10151e";

  ctx.fillRect(
    x,
    y,
    width,
    height
  );

  ctx.shadowColor =
    "transparent";

  ctx.shadowBlur = 0;

  ctx.shadowOffsetY = 0;

  /*
     Clip mentor video
  */
  ctx.beginPath();

  const radius =
    Math.min(
      28,
      width * 0.08,
      height * 0.08
    );

  roundRectPath(
    ctx,
    x,
    y,
    width,
    height,
    radius
  );

  ctx.clip();

  drawMediaCover(
    ctx,
    media,
    x,
    y,
    width,
    height
  );

  ctx.restore();

  /*
     Mentor border
  */
  ctx.save();

  ctx.strokeStyle =
    "rgba(255,255,255,0.16)";

  ctx.lineWidth =
    Math.max(
      2,
      2 * scaleX
    );

  roundRectPath(
    ctx,
    x,
    y,
    width,
    height,
    radius
  );

  ctx.stroke();

  ctx.restore();
}


/* =========================================================
   ROUNDED RECT PATH
========================================================= */

function roundRectPath(
  ctx,
  x,
  y,
  width,
  height,
  radius
) {
  radius =
    Math.min(
      radius,
      width / 2,
      height / 2
    );

  ctx.beginPath();

  ctx.moveTo(
    x + radius,
    y
  );

  ctx.arcTo(
    x + width,
    y,
    x + width,
    y + height,
    radius
  );

  ctx.arcTo(
    x + width,
    y + height,
    x,
    y + height,
    radius
  );

  ctx.arcTo(
    x,
    y + height,
    x,
    y,
    radius
  );

  ctx.arcTo(
    x,
    y,
    x + width,
    y,
    radius
  );

  ctx.closePath();
}


/* =========================================================
   DRAW BRAND BADGE
========================================================= */

function drawBrandBadge() {
  if (
    !compositionCtx ||
    !brandBadge
  ) {
    return;
  }

  const brandText =
    brandBadge.textContent
      ?.trim();

  if (!brandText) {
    return;
  }

  const ctx =
    compositionCtx;

  const paddingX = 28;
  const paddingY = 15;

  const fontSize = 30;

  ctx.save();

  ctx.font =
    `600 ${fontSize}px Arial, sans-serif`;

  const textWidth =
    ctx.measureText(
      brandText
    ).width;

  const boxWidth =
    textWidth +
    paddingX * 2;

  const boxHeight =
    fontSize +
    paddingY * 2;

  const x = 35;

  const y =
    COMPOSITION_HEIGHT -
    boxHeight -
    35;

  ctx.fillStyle =
    "rgba(7,12,20,0.82)";

  ctx.strokeStyle =
    "rgba(255,255,255,0.14)";

  ctx.lineWidth = 2;

  roundRectPath(
    ctx,
    x,
    y,
    boxWidth,
    boxHeight,
    16
  );

  ctx.fill();
  ctx.stroke();

  ctx.fillStyle =
    "#ffffff";

  ctx.textBaseline =
    "middle";

  ctx.fillText(
    brandText,
    x + paddingX,
    y +
      boxHeight / 2
  );

  ctx.restore();
}


/* =========================================================
   RENDER COMPOSITION FRAME
========================================================= */

function renderCompositionFrame() {
  if (
    !compositionCanvas ||
    !compositionCtx
  ) {
    return;
  }

  drawMainStage();

  drawMentorOverlay();

  drawBrandBadge();
}


/* =========================================================
   COMPOSITION RENDER LOOP
========================================================= */

function startCompositionLoop() {
  stopCompositionLoop();

  const render = () => {
    if (!isRecording) {
      compositionAnimationFrame =
        null;

      return;
    }

    renderCompositionFrame();

    compositionAnimationFrame =
      requestAnimationFrame(
        render
      );
  };

  compositionAnimationFrame =
    requestAnimationFrame(
      render
    );
}


function stopCompositionLoop() {
  if (
    compositionAnimationFrame
  ) {
    cancelAnimationFrame(
      compositionAnimationFrame
    );

    compositionAnimationFrame =
      null;
  }
}


/* =========================================================
   AUDIO CONTEXT
========================================================= */

function ensureAudioContext() {
  if (!audioContext) {
    audioContext =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

    audioDestination =
      audioContext.createMediaStreamDestination();
  }

  if (
    audioContext.state ===
    "suspended"
  ) {
    audioContext
      .resume()
      .catch(() => {});
  }
}


/* =========================================================
   AUDIO MIX
========================================================= */

async function prepareAudioMix() {
  ensureAudioContext();

  /*
     MAIN VIDEO AUDIO
  */

  if (
    mainVideo &&
    mainVideo.src &&
    !mainVideoAudioSource
  ) {
    try {
      mainVideoAudioSource =
        audioContext.createMediaElementSource(
          mainVideo
        );
    } catch (error) {
      console.warn(
        "Main video audio source unavailable:",
        error
      );
    }
  }

  if (
    mainVideoAudioSource &&
    !mainAudioConnected
  ) {
    mainVideoAudioSource.connect(
      audioDestination
    );

    /*
       Keep normal browser playback audio
       while recording.
    */
    mainVideoAudioSource.connect(
      audioContext.destination
    );

    mainAudioConnected = true;
  }


  /*
     MENTOR VIDEO AUDIO

     Only relevant when using uploaded
     mentor video.
  */

  if (
    mentorVideo &&
    mentorVideo.src &&
    !mentorVideoAudioSource
  ) {
    try {
      mentorVideoAudioSource =
        audioContext.createMediaElementSource(
          mentorVideo
        );
    } catch (error) {
      console.warn(
        "Mentor video audio source unavailable:",
        error
      );
    }
  }

  if (
    mentorVideoAudioSource &&
    !mentorAudioConnected
  ) {
    mentorVideoAudioSource.connect(
      audioDestination
    );

    mentorVideoAudioSource.connect(
      audioContext.destination
    );

    mentorAudioConnected = true;
  }


  /*
     MICROPHONE
  */

  try {
    microphoneStream =
      await navigator.mediaDevices.getUserMedia(
        {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: false
        }
      );

    microphoneAudioSource =
      audioContext.createMediaStreamSource(
        microphoneStream
      );

    microphoneAudioSource.connect(
      audioDestination
    );

    microphoneConnected = true;
  } catch (error) {
    console.warn(
      "Microphone unavailable:",
      error
    );

    showToast(
      "Microphone unavailable — recording video only"
    );
  }
}


/* =========================================================
   CLEAN AUDIO RESOURCES
========================================================= */

function cleanupAudioResources() {
  if (microphoneStream) {
    microphoneStream
      .getTracks()
      .forEach((track) => {
        track.stop();
      });

    microphoneStream = null;
  }

  microphoneAudioSource = null;

  microphoneConnected = false;
}


/* =========================================================
   RECORDING MIME TYPE
========================================================= */

function getRecordingMimeType() {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm"
  ];

  for (const type of types) {
    if (
      MediaRecorder.isTypeSupported(
        type
      )
    ) {
      return type;
    }
  }

  return "";
}


/* =========================================================
   START RECORDING
========================================================= */

async function startRecording() {
  if (isRecording) {
    return;
  }

  /*
     Close old preview if present
  */

  closeRecordingPreview();


  /*
     Prepare composition
  */

  createCompositionCanvas();

  renderCompositionFrame();


  /*
     Prepare audio
  */

  await prepareAudioMix();


  /*
     Canvas video stream
  */

  recordingStream =
    compositionCanvas.captureStream(
      RECORDING_FPS
    );


  /*
     Add mixed audio tracks
  */

  combinedRecordingStream =
    new MediaStream();

  recordingStream
    .getVideoTracks()
    .forEach((track) => {
      combinedRecordingStream.addTrack(
        track
      );
    });

  if (audioDestination) {
    audioDestination.stream
      .getAudioTracks()
      .forEach((track) => {
        combinedRecordingStream.addTrack(
          track
        );
      });
  }


  /*
     MediaRecorder
  */

  const mimeType =
    getRecordingMimeType();

  try {
    mediaRecorder =
      mimeType
        ? new MediaRecorder(
            combinedRecordingStream,
            {
              mimeType,
              videoBitsPerSecond:
                8_000_000,
              audioBitsPerSecond:
                128_000
            }
          )
        : new MediaRecorder(
            combinedRecordingStream
          );
  } catch (error) {
    console.error(error);

    cleanupRecordingResources();

    showToast(
      "Your browser cannot record this format"
    );

    return;
  }


  recordedChunks = [];

  mediaRecorder.ondataavailable =
    (event) => {
      if (
        event.data &&
        event.data.size > 0
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
    (event) => {
      console.error(
        "MediaRecorder error:",
        event
      );

      setStatus(
        "Recording error",
        "error"
      );

      showToast(
        "Recording error"
      );
    };


  mediaRecorder.start(
    1000
  );

  isRecording = true;
  isRecordingPaused = false;

  recordingStartedAt =
    Date.now();

  recordingPausedAt = 0;
  recordingPausedTotal = 0;

  startCompositionLoop();
  startRecordingTimer();

  updateRecordingUI();

  setStatus(
    "Recording...",
    "recording"
  );

  showToast(
    "Recording started"
  );
}


/* =========================================================
   STOP RECORDING
========================================================= */

function stopRecording() {
  if (
    !mediaRecorder ||
    !isRecording
  ) {
    return;
  }

  isRecording = false;
  isRecordingPaused = false;

  stopCompositionLoop();

  stopRecordingTimer();

  try {
    if (
      mediaRecorder.state !==
      "inactive"
    ) {
      mediaRecorder.stop();
    }
  } catch (error) {
    console.error(error);
  }

  updateRecordingUI();

  setStatus(
    "Processing recording..."
  );
}


/* =========================================================
   PAUSE RECORDING
========================================================= */

function pauseRecording() {
  if (
    !mediaRecorder ||
    !isRecording ||
    isRecordingPaused
  ) {
    return;
  }

  if (
    mediaRecorder.state !==
    "recording"
  ) {
    return;
  }

  try {
    mediaRecorder.pause();

    isRecordingPaused = true;

    recordingPausedAt =
      Date.now();

    stopRecordingTimer();

    updateRecordingUI();

    setStatus(
      "Recording paused",
      "paused"
    );

    showToast(
      "Recording paused"
    );
  } catch (error) {
    console.error(error);
  }
}


/* =========================================================
   RESUME RECORDING
========================================================= */

function resumeRecording() {
  if (
    !mediaRecorder ||
    !isRecording ||
    !isRecordingPaused
  ) {
    return;
  }

  if (
    mediaRecorder.state !==
    "paused"
  ) {
    return;
  }

  try {
    const pauseDuration =
      Date.now() -
      recordingPausedAt;

    recordingPausedTotal +=
      pauseDuration;

    recordingPausedAt = 0;

    mediaRecorder.resume();

    isRecordingPaused = false;

    startRecordingTimer();

    updateRecordingUI();

    setStatus(
      "Recording...",
      "recording"
    );

    showToast(
      "Recording resumed"
    );
  } catch (error) {
    console.error(error);
  }
}


/* =========================================================
   TOGGLE RECORDING
========================================================= */

function toggleRecording() {
  if (!isRecording) {
    startRecording();
    return;
  }

  if (isRecordingPaused) {
    resumeRecording();
    return;
  }

  stopRecording();
}


/* =========================================================
   RECORDING TIMER
========================================================= */

function formatRecordingTime(
  milliseconds
) {
  let totalSeconds =
    Math.floor(
      milliseconds / 1000
    );

  totalSeconds =
    Math.max(
      0,
      totalSeconds
    );

  const hours =
    Math.floor(
      totalSeconds / 3600
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) /
        60
    );

  const seconds =
    totalSeconds % 60;

  const pad = (value) =>
    String(value).padStart(
      2,
      "0"
    );

  return (
    `${pad(hours)}:` +
    `${pad(minutes)}:` +
    `${pad(seconds)}`
  );
}


function getRecordingElapsed() {
  if (!recordingStartedAt) {
    return 0;
  }

  const now =
    isRecordingPaused &&
    recordingPausedAt
      ? recordingPausedAt
      : Date.now();

  return (
    now -
    recordingStartedAt -
    recordingPausedTotal
  );
}


function startRecordingTimer() {
  stopRecordingTimer();

  updateRecordingTimer();

  recordingTimerInterval =
    setInterval(
      updateRecordingTimer,
      250
    );
}


function stopRecordingTimer() {
  if (
    recordingTimerInterval
  ) {
    clearInterval(
      recordingTimerInterval
    );

    recordingTimerInterval =
      null;
  }
}


function updateRecordingTimer() {
  const elapsed =
    getRecordingElapsed();

  const timeText =
    formatRecordingTime(
      elapsed
    );

  if (recordTopBtn) {
    if (isRecording) {
      recordTopBtn.textContent =
        isRecordingPaused
          ? `▶ ${timeText}`
          : `● ${timeText}`;
    }
  }

  const recordingTimer =
    document.getElementById(
      "recordingTimer"
    );

  if (recordingTimer) {
    recordingTimer.textContent =
      timeText;
  }
}


/* =========================================================
   RECORDING UI
========================================================= */

function updateRecordingUI() {
  if (!recordTopBtn) {
    return;
  }

  recordTopBtn.classList.remove(
    "recording",
    "paused"
  );

  if (!isRecording) {
    recordTopBtn.textContent =
      "Record";

    return;
  }

  if (isRecordingPaused) {
    recordTopBtn.classList.add(
      "paused"
    );

    recordTopBtn.textContent =
      `▶ ${formatRecordingTime(
        getRecordingElapsed()
      )}`;

    return;
  }

  recordTopBtn.classList.add(
    "recording"
  );

  recordTopBtn.textContent =
    `● ${formatRecordingTime(
      getRecordingElapsed()
    )}`;
}


/* =========================================================
   RECORDING FINISHED
========================================================= */

function finishRecording() {
  stopCompositionLoop();
  stopRecordingTimer();

  const mimeType =
    mediaRecorder?.mimeType ||
    "video/webm";

  const blob =
    new Blob(
      recordedChunks,
      {
        type: mimeType
      }
    );

  /*
     Reset recorder state before
     opening preview.
  */

  isRecording = false;
  isRecordingPaused = false;

  mediaRecorder = null;

  cleanupRecordingStreams();

  cleanupAudioResources();

  updateRecordingUI();

  setStatus(
    "Recording ready"
  );

  if (!blob.size) {
    showToast(
      "Recording file is empty"
    );

    return;
  }

  openRecordingPreview(blob);
}


/* =========================================================
   CLEAN RECORDING STREAMS
========================================================= */

function cleanupRecordingStreams() {
  if (recordingStream) {
    recordingStream
      .getTracks()
      .forEach((track) => {
        track.stop();
      });

    recordingStream = null;
  }

  if (combinedRecordingStream) {
    combinedRecordingStream
      .getTracks()
      .forEach((track) => {
        track.stop();
      });

    combinedRecordingStream =
      null;
  }
}


/* =========================================================
   CLEANUP RECORDING RESOURCES
========================================================= */

function cleanupRecordingResources() {
  stopCompositionLoop();
  stopRecordingTimer();

  cleanupRecordingStreams();
  cleanupAudioResources();

  mediaRecorder = null;

  isRecording = false;
  isRecordingPaused = false;

  updateRecordingUI();
}


/* =========================================================
   RECORDING PREVIEW MODAL
========================================================= */

function injectPreviewStyles() {
  if (
    document.getElementById(
      "courseStudioPreviewStyles"
    )
  ) {
    return;
  }

  const style =
    document.createElement(
      "style"
    );

  style.id =
    "courseStudioPreviewStyles";

  style.textContent = `
    .course-studio-preview-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: rgba(3, 7, 13, 0.88);
      backdrop-filter: blur(18px);
    }

    .course-studio-preview-modal {
      width: min(1100px, 100%);
      max-height: 92vh;
      overflow: auto;
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 24px;
      background: #0c1119;
      box-shadow: 0 30px 100px rgba(0,0,0,0.55);
      padding: 22px;
    }

    .course-studio-preview-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 18px;
    }

    .course-studio-preview-title {
      color: #fff;
      font-size: 20px;
      font-weight: 700;
    }

    .course-studio-preview-subtitle {
      margin-top: 4px;
      color: rgba(255,255,255,0.55);
      font-size: 13px;
    }

    .course-studio-preview-close {
      width: 40px;
      height: 40px;
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 12px;
      background: rgba(255,255,255,0.06);
      color: #fff;
      cursor: pointer;
      font-size: 22px;
    }

    .course-studio-preview-video-wrap {
      width: 100%;
      overflow: hidden;
      border-radius: 18px;
      background: #000;
      border: 1px solid rgba(255,255,255,0.08);
    }

    .course-studio-preview-video {
      display: block;
      width: 100%;
      max-height: 65vh;
      background: #000;
    }

    .course-studio-preview-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 18px;
    }

    .course-studio-preview-btn {
      min-height: 44px;
      padding: 0 18px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.10);
      background: rgba(255,255,255,0.06);
      color: #fff;
      font-weight: 600;
      cursor: pointer;
    }

    .course-studio-preview-btn:hover {
      background: rgba(255,255,255,0.10);
    }

    .course-studio-preview-btn.primary {
      background: #3b82f6;
      border-color: #3b82f6;
    }

    .course-studio-preview-btn.danger {
      background: rgba(239,68,68,0.12);
      border-color: rgba(239,68,68,0.25);
      color: #fecaca;
    }

    @media (max-width: 640px) {
      .course-studio-preview-overlay {
        padding: 10px;
      }

      .course-studio-preview-modal {
        padding: 14px;
        border-radius: 18px;
      }

      .course-studio-preview-actions {
        display: grid;
        grid-template-columns: 1fr;
      }

      .course-studio-preview-btn {
        width: 100%;
      }
    }
  `;

  document.head.appendChild(
    style
  );
}


/* =========================================================
   OPEN PREVIEW
========================================================= */

function openRecordingPreview(blob) {
  injectPreviewStyles();

  closeRecordingPreview();

  previewBlobURL =
    URL.createObjectURL(blob);

  previewModal =
    document.createElement(
      "div"
    );

  previewModal.className =
    "course-studio-preview-overlay";

  previewModal.innerHTML = `
    <div
      class="course-studio-preview-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Recording Preview"
    >

      <div
        class="course-studio-preview-head"
      >
        <div>
          <div
            class="course-studio-preview-title"
          >
            Recording Preview
          </div>

          <div
            class="course-studio-preview-subtitle"
          >
            Your course recording is ready.
          </div>
        </div>

        <button
          type="button"
          class="course-studio-preview-close"
          id="courseStudioPreviewClose"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div
        class="course-studio-preview-video-wrap"
      >
        <video
          class="course-studio-preview-video"
          id="courseStudioPreviewVideo"
          controls
          playsinline
          preload="metadata"
        ></video>
      </div>

      <div
        class="course-studio-preview-actions"
      >

        <button
          type="button"
          class="course-studio-preview-btn primary"
          id="courseStudioDownloadBtn"
        >
          Download Recording
        </button>

        <button
          type="button"
          class="course-studio-preview-btn"
          id="courseStudioAgainBtn"
        >
          Record Again
        </button>

        <button
          type="button"
          class="course-studio-preview-btn danger"
          id="courseStudioDeleteBtn"
        >
          Delete
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(
    previewModal
  );

  previewVideo =
    previewModal.querySelector(
      "#courseStudioPreviewVideo"
    );

  if (previewVideo) {
    previewVideo.src =
      previewBlobURL;
  }

  const closeButton =
    previewModal.querySelector(
      "#courseStudioPreviewClose"
    );

  const downloadButton =
    previewModal.querySelector(
      "#courseStudioDownloadBtn"
    );

  const againButton =
    previewModal.querySelector(
      "#courseStudioAgainBtn"
    );

  const deleteButton =
    previewModal.querySelector(
      "#courseStudioDeleteBtn"
    );

  if (closeButton) {
    closeButton.addEventListener(
      "click",
      closeRecordingPreview
    );
  }

  if (downloadButton) {
    downloadButton.addEventListener(
      "click",
      downloadRecording
    );
  }

  if (againButton) {
    againButton.addEventListener(
      "click",
      () => {
        closeRecordingPreview();

        showToast(
          "Ready for a new recording"
        );

        setStatus(
          "Ready"
        );
      }
    );
  }

  if (deleteButton) {
    deleteButton.addEventListener(
      "click",
      () => {
        closeRecordingPreview();

        recordedChunks = [];

        showToast(
          "Recording deleted"
        );

        setStatus(
          "Ready"
        );
      }
    );
  }

  previewModal.addEventListener(
    "click",
    (event) => {
      if (
        event.target ===
        previewModal
      ) {
        closeRecordingPreview();
      }
    }
  );

  document.addEventListener(
    "keydown",
    handlePreviewEscape
  );
}


/* =========================================================
   DOWNLOAD RECORDING
========================================================= */

function downloadRecording() {
  if (
    !previewBlobURL
  ) {
    showToast(
      "No recording available"
    );

    return;
  }

  const link =
    document.createElement(
      "a"
    );

  link.href =
    previewBlobURL;

  link.download =
    `Personal-Course-Studio-${createFileDate()}.webm`;

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  showToast(
    "Recording download started"
  );
}


/* =========================================================
   CLOSE PREVIEW
========================================================= */

function closeRecordingPreview() {
  if (previewVideo) {
    previewVideo.pause();
    previewVideo.removeAttribute(
      "src"
    );
    previewVideo.load();
  }

  previewVideo = null;

  if (previewModal) {
    previewModal.remove();
    previewModal = null;
  }

  if (previewBlobURL) {
    URL.revokeObjectURL(
      previewBlobURL
    );

    previewBlobURL = null;
  }

  document.removeEventListener(
    "keydown",
    handlePreviewEscape
  );
}


function handlePreviewEscape(
  event
) {
  if (
    event.key === "Escape"
  ) {
    closeRecordingPreview();
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
    setTimeout(() => {
      brandInput.focus();
    }, 100);
  }
}


function saveSettings() {
  if (brandInput) {
    const brand =
      brandInput.value.trim();

    localStorage.setItem(
      "courseStudioBrand",
      brand
    );

    updateBrandDisplay();
  }

  saveMentorPosition();

  localStorage.setItem(
    "courseStudioMentorBg",
    backgroundMode
  );

  showToast(
    "Settings saved"
  );

  closeSettings();
}


function updateBrandDisplay() {
  const brand =
    localStorage.getItem(
      "courseStudioBrand"
    ) ||
    "Personal Course Studio";

  if (brandInput) {
    brandInput.value =
      brand;
  }

  if (brandBadge) {
    brandBadge.textContent =
      brand;
  }
}


function loadSettings() {
  const brand =
    localStorage.getItem(
      "courseStudioBrand"
    );

  if (
    brandInput &&
    brand
  ) {
    brandInput.value =
      brand;
  }

  updateBrandDisplay();


  /*
     Background
  */

  const savedBackground =
    localStorage.getItem(
      "courseStudioMentorBg"
    );

  if (
    savedBackground &&
    [
      "original",
      "remove",
      "blur",
      "image",
      "color"
    ].includes(
      savedBackground
    )
  ) {
    backgroundMode =
      savedBackground;
  }

  setBackgroundMode(
    backgroundMode
  );


  /*
     Mentor position
  */

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
      `${savedLeft}px`;

    mentorCard.style.top =
      `${savedTop}px`;

    mentorCard.style.right =
      "auto";

    mentorCard.style.bottom =
      "auto";
  }
}


/* =========================================================
   SETTINGS MODAL EVENTS
========================================================= */

if (settingsModal) {
  settingsModal.addEventListener(
    "click",
    (event) => {
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
   RECORD BUTTON
========================================================= */

if (recordTopBtn) {
  recordTopBtn.addEventListener(
    "click",
    () => {
      toggleRecording();
    }
  );
}


/* =========================================================
   GLOBAL BUTTON HELPERS
========================================================= */

window.toggleMainPlay =
  toggleMainPlay;

window.clearMainContent =
  clearMainContent;

window.fullscreenStage =
  fullscreenStage;

window.startCamera =
  startCamera;

window.stopCamera =
  stopCamera;

window.switchCamera =
  switchCamera;

window.setBackgroundMode =
  setBackgroundMode;

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

window.toggleRecording =
  toggleRecording;

window.startRecording =
  startRecording;

window.stopRecording =
  stopRecording;

window.pauseRecording =
  pauseRecording;

window.resumeRecording =
  resumeRecording;

window.downloadRecording =
  downloadRecording;

window.closeRecordingPreview =
  closeRecordingPreview;


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
  "keydown",
  (event) => {
    /*
       ESC
    */

    if (
      event.key === "Escape"
    ) {
      if (
        previewModal
      ) {
        closeRecordingPreview();
        return;
      }

      closeSettings();
    }


    /*
       CTRL + ENTER
       Save settings
    */

    if (
      event.ctrlKey &&
      event.key === "Enter"
    ) {
      if (
        settingsModal &&
        settingsModal.classList.contains(
          "open"
        )
      ) {
        saveSettings();
      }
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
      !event.metaKey
    ) {
      const activeTag =
        document.activeElement
          ?.tagName;

      if (
        activeTag !== "INPUT" &&
        activeTag !== "TEXTAREA" &&
        activeTag !== "SELECT"
      ) {
        resetMentorPosition();
      }
    }


    /*
       SPACE
       Main video play / pause

       Don't trigger while typing.
    */

    if (
      event.code ===
        "Space" &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      const activeTag =
        document.activeElement
          ?.tagName;

      if (
        activeTag !== "INPUT" &&
        activeTag !== "TEXTAREA" &&
        activeTag !== "SELECT" &&
        activeTag !== "BUTTON"
      ) {
        event.preventDefault();

        toggleMainPlay();
      }
    }
  }
);


/* =========================================================
   PAGE VISIBILITY
========================================================= */

document.addEventListener(
  "visibilitychange",
  () => {
    /*
       Do NOT stop recording when tab
       temporarily becomes hidden.
    */

    if (
      document.hidden &&
      isRecording
    ) {
      console.log(
        "Studio tab hidden while recording"
      );
    }
  }
);


/* =========================================================
   BEFORE UNLOAD
========================================================= */

window.addEventListener(
  "beforeunload",
  (event) => {
    if (isRecording) {
      event.preventDefault();

      event.returnValue =
        "Recording is currently active.";
    }
  }
);


/* =========================================================
   CLEANUP ON PAGE EXIT
========================================================= */

window.addEventListener(
  "pagehide",
  () => {
    stopCompositionLoop();
    stopAIProcessingLoop();
    stopRecordingTimer();

    if (cameraStream) {
      cameraStream
        .getTracks()
        .forEach((track) => {
          track.stop();
        });
    }

    cleanupRecordingStreams();
    cleanupAudioResources();
  }
);


/* =========================================================
   INITIALIZE
========================================================= */

function initializeStudio() {
  renderStudents();

  initializeMentorDrag();

  loadSettings();

  createCompositionCanvas();

  setStatus(
    "Ready"
  );

  updateRecordingUI();

  console.log(
    "Personal Course Studio — Step 3.5 initialized"
  );
}


/* =========================================================
   START APPLICATION
========================================================= */

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initializeStudio
  );
} else {
  initializeStudio();
}
