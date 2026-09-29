/* =========================================================
   PERSONAL COURSE STUDIO — STEP 3.5
   File: mentor/script.js

   STEP 3.5 FEATURES
   ---------------------------------------------------------
   - Main image / video
   - Mentor video upload
   - Webcam start / stop / switch
   - AI background:
       Original
       Remove Background
       Blur Background
       Custom Image
       Solid Color
   - Mentor overlay drag
   - Mentor overlay resize compatibility
   - Students panel
   - Settings + localStorage
   - Final composition recording canvas
   - Main video audio
   - Microphone audio
   - Pause / Resume recording
   - Recording timer
   - Recording preview
   - Download recording
   - Discard recording
   - Recording status
========================================================= */

"use strict";

/* =========================================================
   DOM
========================================================= */

const $ = (id) => document.getElementById(id);

const stage = $("stage");

const imageUpload = $("imageUpload");
const videoUpload = $("videoUpload");
const mentorUpload = $("mentorUpload");

const mainImage = $("mainImage");
const mainVideo = $("mainVideo");
const mentorVideo = $("mentorVideo");
const mentorCameraVideo = $("mentorCameraVideo");
const mentorAICanvas = $("mentorAICanvas");

const mentorPlaceholder = $("mentorPlaceholder");
const mentorCard = $("mentorCard");
const mentorResize = $("mentorResize");
const mentorSourceLabel = $("mentorSourceLabel");

const welcomeContent = $("welcomeContent");
const brandBadge = $("brandBadge");
const brandInput = $("brandInput");

const studentsList = $("studentsList");
const studentCount = $("studentCount");

const statusText = $("statusText");
const statusDot = $("statusDot");
const recordTopBtn = $("recordTopBtn");

const settingsModal = $("settingsModal");
const toast = $("toast");

const startCameraBtn = $("startCameraBtn");
const stopCameraBtn = $("stopCameraBtn");
const switchCameraBtn = $("switchCameraBtn");
const cameraStatus = $("cameraStatus");

const bgOriginalBtn = $("bgOriginalBtn");
const bgRemoveBtn = $("bgRemoveBtn");
const bgBlurBtn = $("bgBlurBtn");
const bgImageBtn = $("bgImageBtn");
const bgColorBtn = $("bgColorBtn");

const backgroundColor = $("backgroundColor");
const backgroundImageUpload = $("backgroundImageUpload");

const aiCanvas = $("aiCanvas");
const aiSourceCanvas = $("aiSourceCanvas");
const aiMaskCanvas = $("aiMaskCanvas");

const ctx = aiCanvas?.getContext("2d", {
  willReadFrequently: true
});

const sourceCtx = aiSourceCanvas?.getContext("2d", {
  willReadFrequently: true
});

const maskCtx = aiMaskCanvas?.getContext("2d", {
  willReadFrequently: true
});


/* =========================================================
   STATE
========================================================= */

let students = Array.from(
  { length: 8 },
  (_, i) => ({
    name: `Student ${String(i + 1).padStart(2, "0")}`,
    online: true
  })
);


/* ---------------------------------------------------------
   CAMERA
--------------------------------------------------------- */

let cameraStream = null;
let cameraFacingMode = "user";
let cameraActive = false;


/* ---------------------------------------------------------
   AI
--------------------------------------------------------- */

let segmentation = null;
let segmentationReady = false;
let segmentationBusy = false;

let backgroundMode = "original";
let customBackgroundImage = null;


/* ---------------------------------------------------------
   RECORDING
--------------------------------------------------------- */

let isRecording = false;
let isRecordingPaused = false;

let mediaRecorder = null;
let recordedChunks = [];

let recordingStream = null;
let recordingVideoTrack = null;

let recordingMimeType = "video/webm";

let compositionCanvas = null;
let compositionCtx = null;

let compositionAnimationId = null;
let compositionLastFrame = 0;


/* ---------------------------------------------------------
   RECORDING TIMER
--------------------------------------------------------- */

let recordingStartTime = 0;
let recordingElapsedBeforePause = 0;
let recordingTimerId = null;


/* ---------------------------------------------------------
   PREVIEW
--------------------------------------------------------- */

let lastRecordingBlob = null;
let lastRecordingUrl = null;

let previewModal = null;
let previewVideo = null;
let previewTimerText = null;


/* ---------------------------------------------------------
   AUDIO
--------------------------------------------------------- */

let audioContext = null;
let audioDestination = null;

let microphoneStream = null;
let microphoneSource = null;

let mainVideoAudioSource = null;
let mentorVideoAudioSource = null;


/* ---------------------------------------------------------
   MENTOR DRAG
--------------------------------------------------------- */

let mentorDragging = false;

let dragPointerId = null;

let dragStartX = 0;
let dragStartY = 0;

let dragStartLeft = 0;
let dragStartTop = 0;


/* ---------------------------------------------------------
   AI MASK
--------------------------------------------------------- */

const MASK_EDGE_START = 0.10;
const MASK_EDGE_END = 0.62;
const MASK_EDGE_POWER = 1.15;


/* =========================================================
   HELPERS
========================================================= */

function showToast(message) {
  if (!toast) {
    console.log(message);
    return;
  }

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}


function setStatus(message, online = true) {
  if (statusText) {
    statusText.textContent = message;
  }

  if (statusDot) {
    statusDot.style.background = online
      ? "#22c55e"
      : "#f59e0b";
  }
}


function escapeHTML(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]
  );
}


function createFileDate() {
  const d = new Date();

  const pad = (n) =>
    String(n).padStart(2, "0");

  return (
    `${d.getFullYear()}-` +
    `${pad(d.getMonth() + 1)}-` +
    `${pad(d.getDate())}_` +
    `${pad(d.getHours())}-` +
    `${pad(d.getMinutes())}-` +
    `${pad(d.getSeconds())}`
  );
}


function clamp(value, min, max) {
  return Math.min(
    Math.max(value, min),
    max
  );
}


function smoothStep(edge0, edge1, value) {
  const t = clamp(
    (value - edge0) /
    (edge1 - edge0),
    0,
    1
  );

  return t * t * (3 - 2 * t);
}


function getStageRect() {
  return stage?.getBoundingClientRect() || null;
}


function isVisible(element) {
  if (!element) return false;

  const style = getComputedStyle(element);

  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    Number(style.opacity) !== 0 &&
    element.getBoundingClientRect().width > 0
  );
}


function setElementVisible(element, visible) {
  if (!element) return;

  element.style.display = visible
    ? ""
    : "none";
}


function formatTime(totalSeconds) {
  totalSeconds = Math.max(
    0,
    Math.floor(totalSeconds)
  );

  const hours = Math.floor(
    totalSeconds / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds = totalSeconds % 60;

  return (
    `${String(hours).padStart(2, "0")}:` +
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}`
  );
}


/* =========================================================
   STUDENTS
========================================================= */

function renderStudents() {
  if (!studentsList) return;

  studentsList.innerHTML = students
    .map(
      (student, index) => `
        <div class="student-item">

          <div class="student-avatar">
            ${escapeHTML(
              student.name
                .charAt(0)
                .toUpperCase()
            )}
          </div>

          <div class="student-info">

            <strong>
              ${escapeHTML(student.name)}
            </strong>

            <small>
              <span class="student-online-dot"></span>
              ${student.online ? "Online" : "Offline"}
            </small>

          </div>

          <button
            class="student-remove"
            type="button"
            data-remove-student="${index}"
            aria-label="Remove student"
          >
            ×
          </button>

        </div>
      `
    )
    .join("");

  updateStudentCount();
}


function updateStudentCount() {
  if (studentCount) {
    studentCount.textContent =
      students.length;
  }
}


function addStudent(name = "") {
  const studentName =
    name.trim() ||
    `Student ${String(
      students.length + 1
    ).padStart(2, "0")}`;

  students.push({
    name: studentName,
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
}


studentsList?.addEventListener(
  "click",
  (event) => {

    const button =
      event.target.closest(
        "[data-remove-student]"
      );

    if (!button) return;

    removeStudent(
      Number(
        button.dataset.removeStudent
      )
    );
  }
);


/* =========================================================
   MAIN IMAGE / VIDEO
========================================================= */

imageUpload?.addEventListener(
  "change",
  (event) => {

    const file =
      event.target.files?.[0];

    if (!file) return;

    const url =
      URL.createObjectURL(file);

    mainImage.src = url;
    mainImage.style.display = "block";

    if (mainVideo) {

      mainVideo.pause();

      mainVideo.removeAttribute("src");

      mainVideo.load();

      mainVideo.style.display =
        "none";
    }

    if (welcomeContent) {
      welcomeContent.style.display =
        "none";
    }

    setStatus("Slide loaded");

    showToast(
      "Image added to class stage"
    );
  }
);


videoUpload?.addEventListener(
  "change",
  (event) => {

    const file =
      event.target.files?.[0];

    if (!file) return;

    const url =
      URL.createObjectURL(file);

    if (mainImage) {

      mainImage.removeAttribute(
        "src"
      );

      mainImage.style.display =
        "none";
    }

    mainVideo.src = url;

    mainVideo.style.display =
      "block";

    mainVideo.load();

    if (welcomeContent) {
      welcomeContent.style.display =
        "none";
    }

    setStatus(
      "Class video loaded"
    );

    showToast(
      "Video added to class stage"
    );
  }
);


mentorUpload?.addEventListener(
  "change",
  (event) => {

    const file =
      event.target.files?.[0];

    if (!file) return;

    const url =
      URL.createObjectURL(file);

    stopCamera();

    if (mentorVideo) {

      mentorVideo.src = url;

      mentorVideo.style.display =
        "block";

      mentorVideo.controls = true;

      mentorVideo.play().catch(
        () => {}
      );
    }

    setElementVisible(
      mentorCameraVideo,
      false
    );

    setElementVisible(
      mentorAICanvas,
      false
    );

    setElementVisible(
      mentorPlaceholder,
      false
    );

    if (mentorSourceLabel) {
      mentorSourceLabel.textContent =
        "Uploaded Mentor Video";
    }

    showToast(
      "Mentor video loaded"
    );
  }
);


function toggleMainPlay() {

  if (
    !mainVideo ||
    !mainVideo.src
  ) {
    showToast(
      "Upload a class video first"
    );

    return;
  }

  if (mainVideo.paused) {

    mainVideo.play().catch(
      () => {
        showToast(
          "Could not play video"
        );
      }
    );

  } else {

    mainVideo.pause();

  }
}


mainVideo?.addEventListener(
  "ended",
  () => {
    showToast(
      "Class video finished"
    );
  }
);


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
      "";
  }

  showToast("Stage cleared");
}


function fullscreenStage() {

  if (!stage) return;

  if (document.fullscreenElement) {

    document.exitFullscreen?.();

  } else {

    stage
      .requestFullscreen?.()
      .catch(() => {});

  }
}


/* =========================================================
   CAMERA
========================================================= */

async function startCamera() {

  if (
    !navigator.mediaDevices?.getUserMedia
  ) {
    showToast(
      "Camera requires HTTPS or localhost"
    );

    return;
  }

  stopCamera();

  try {

    cameraStream =
      await navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode:
              cameraFacingMode,

            width: {
              ideal: 1280
            },

            height: {
              ideal: 720
            }
          },

          audio: false
        });

    if (mentorCameraVideo) {

      mentorCameraVideo.srcObject =
        cameraStream;

      mentorCameraVideo.muted =
        true;

      mentorCameraVideo.playsInline =
        true;

      mentorCameraVideo.style.display =
        "block";

      await mentorCameraVideo.play();
    }

    cameraActive = true;

    setElementVisible(
      mentorVideo,
      false
    );

    setElementVisible(
      mentorPlaceholder,
      false
    );

    if (mentorSourceLabel) {

      mentorSourceLabel.textContent =
        cameraFacingMode === "user"
          ? "Mentor Camera"
          : "External Camera";
    }

    if (cameraStatus) {
      cameraStatus.textContent =
        "Camera connected";
    }

    if (startCameraBtn) {
      startCameraBtn.disabled =
        true;
    }

    if (stopCameraBtn) {
      stopCameraBtn.disabled =
        false;
    }

    await initializeSegmentation();

    setStatus("Camera active");

    showToast(
      "Camera started"
    );

  } catch (error) {

    console.error(error);

    setStatus(
      "Camera unavailable",
      false
    );

    if (cameraStatus) {
      cameraStatus.textContent =
        "Camera permission or device error";
    }

    showToast(
      "Could not start camera. Check permission."
    );
  }
}


function stopCamera() {

  if (cameraStream) {

    cameraStream
      .getTracks()
      .forEach(
        (track) => track.stop()
      );

    cameraStream = null;
  }

  cameraActive = false;

  if (mentorCameraVideo) {

    mentorCameraVideo.pause();

    mentorCameraVideo.srcObject =
      null;

    mentorCameraVideo.style.display =
      "none";
  }

  if (mentorAICanvas) {
    mentorAICanvas.style.display =
      "none";
  }

  if (startCameraBtn) {
    startCameraBtn.disabled =
      false;
  }

  if (stopCameraBtn) {
    stopCameraBtn.disabled =
      true;
  }

  if (cameraStatus) {
    cameraStatus.textContent =
      "Camera stopped";
  }

  setStatus(
    "Camera stopped"
  );
}


async function switchCamera() {

  cameraFacingMode =
    cameraFacingMode === "user"
      ? "environment"
      : "user";

  if (cameraActive) {
    await startCamera();
  }

  if (mentorCameraVideo) {

    mentorCameraVideo.style.transform =
      cameraFacingMode === "user"
        ? "scaleX(-1)"
        : "none";
  }

  showToast(
    cameraFacingMode === "user"
      ? "Front camera"
      : "Rear camera"
  );
}


startCameraBtn?.addEventListener(
  "click",
  startCamera
);

stopCameraBtn?.addEventListener(
  "click",
  stopCamera
);

switchCameraBtn?.addEventListener(
  "click",
  switchCamera
);


/* =========================================================
   AI SEGMENTATION
========================================================= */

async function initializeSegmentation() {

  if (
    segmentationReady ||
    !window.SelfieSegmentation
  ) {
    return;
  }

  try {

    segmentation =
      new SelfieSegmentation({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
      });

    segmentation.setOptions({
      modelSelection: 1,
      selfieMode: false
    });

    segmentation.onResults(
      handleSegmentationResults
    );

    await segmentation.initialize();

    segmentationReady = true;

    if (cameraActive) {
      requestSegmentationFrame();
    }

  } catch (error) {

    console.error(
      "Segmentation initialization failed:",
      error
    );

    showToast(
      "AI background could not initialize"
    );
  }
}


async function requestSegmentationFrame() {

  if (
    !cameraActive ||
    !segmentationReady ||
    segmentationBusy
  ) {
    return;
  }

  if (
    !mentorCameraVideo ||
    mentorCameraVideo.readyState < 2
  ) {

    requestAnimationFrame(
      requestSegmentationFrame
    );

    return;
  }

  segmentationBusy = true;

  try {

    await segmentation.send({
      image: mentorCameraVideo
    });

  } catch (error) {

    console.error(
      "Segmentation frame error:",
      error
    );

  } finally {

    segmentationBusy = false;

    if (cameraActive) {

      requestAnimationFrame(
        requestSegmentationFrame
      );
    }
  }
}


function handleSegmentationResults(
  results
) {

  if (
    !mentorAICanvas ||
    !ctx ||
    !results.image
  ) {
    return;
  }

  const width =
    results.image.videoWidth ||
    results.image.width ||
    640;

  const height =
    results.image.videoHeight ||
    results.image.height ||
    480;

  if (
    mentorAICanvas.width !== width ||
    mentorAICanvas.height !== height
  ) {

    mentorAICanvas.width =
      width;

    mentorAICanvas.height =
      height;
  }

  if (
    aiSourceCanvas &&
    (
      aiSourceCanvas.width !== width ||
      aiSourceCanvas.height !== height
    )
  ) {

    aiSourceCanvas.width =
      width;

    aiSourceCanvas.height =
      height;
  }

  if (
    aiMaskCanvas &&
    (
      aiMaskCanvas.width !== width ||
      aiMaskCanvas.height !== height
    )
  ) {

    aiMaskCanvas.width =
      width;

    aiMaskCanvas.height =
      height;
  }

  if (
    backgroundMode ===
    "original"
  ) {

    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    ctx.drawImage(
      results.image,
      0,
      0,
      width,
      height
    );

    mentorAICanvas.style.display =
      "block";

    mentorCameraVideo.style.display =
      "none";

    return;
  }

  if (
    backgroundMode ===
    "remove"
  ) {

    drawPersonWithBackground(
      results,
      width,
      height,
      "transparent"
    );

  } else if (
    backgroundMode ===
    "blur"
  ) {

    drawPersonWithBackground(
      results,
      width,
      height,
      "blur"
    );

  } else if (
    backgroundMode ===
    "image"
  ) {

    drawPersonWithBackground(
      results,
      width,
      height,
      "image"
    );

  } else if (
    backgroundMode ===
    "color"
  ) {

    drawPersonWithBackground(
      results,
      width,
      height,
      "color"
    );
  }

  mentorAICanvas.style.display =
    "block";

  mentorCameraVideo.style.display =
    "none";
}


function drawPersonWithBackground(
  results,
  width,
  height,
  mode
) {

  if (
    !sourceCtx ||
    !maskCtx ||
    !aiSourceCanvas ||
    !aiMaskCanvas ||
    !ctx
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
    results.image,
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

  const personData =
    new ImageData(
      width,
      height
    );

  for (
    let i = 0;
    i < sourceData.data.length;
    i += 4
  ) {

    const confidence =
      maskData.data[i] / 255;

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

    personData.data[i] =
      sourceData.data[i];

    personData.data[i + 1] =
      sourceData.data[i + 1];

    personData.data[i + 2] =
      sourceData.data[i + 2];

    personData.data[i + 3] =
      Math.round(
        alpha * 255
      );
  }

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  if (mode === "blur") {

    ctx.save();

    ctx.filter =
      "blur(14px)";

    ctx.drawImage(
      results.image,
      -20,
      -20,
      width + 40,
      height + 40
    );

    ctx.restore();

  } else if (mode === "image") {

    if (
      customBackgroundImage &&
      customBackgroundImage.complete
    ) {

      drawImageCover(
        ctx,
        customBackgroundImage,
        0,
        0,
        width,
        height
      );

    } else {

      ctx.fillStyle =
        "#253247";

      ctx.fillRect(
        0,
        0,
        width,
        height
      );
    }

  } else if (mode === "color") {

    ctx.fillStyle =
      backgroundColor?.value ||
      "#263548";

    ctx.fillRect(
      0,
      0,
      width,
      height
    );
  }

  const personCanvas =
    document.createElement(
      "canvas"
    );

  personCanvas.width =
    width;

  personCanvas.height =
    height;

  const personCtx =
    personCanvas.getContext(
      "2d"
    );

  personCtx.putImageData(
    personData,
    0,
    0
  );

  ctx.drawImage(
    personCanvas,
    0,
    0
  );
}


function drawImageCover(
  context,
  image,
  x,
  y,
  width,
  height
) {

  const iw =
    image.naturalWidth ||
    image.width;

  const ih =
    image.naturalHeight ||
    image.height;

  if (!iw || !ih) return;

  const scale =
    Math.max(
      width / iw,
      height / ih
    );

  const sw =
    width / scale;

  const sh =
    height / scale;

  const sx =
    (iw - sw) / 2;

  const sy =
    (ih - sh) / 2;

  context.drawImage(
    image,
    sx,
    sy,
    sw,
    sh,
    x,
    y,
    width,
    height
  );
}


/* =========================================================
   BACKGROUND CONTROLS
========================================================= */

function setBackgroundMode(
  mode
) {

  backgroundMode = mode;

  if (
    cameraActive &&
    mode === "original"
  ) {

    if (mentorAICanvas) {
      mentorAICanvas.style.display =
        "none";
    }

    if (mentorCameraVideo) {
      mentorCameraVideo.style.display =
        "block";
    }

  } else if (cameraActive) {

    if (mentorCameraVideo) {
      mentorCameraVideo.style.display =
        "none";
    }

    if (mentorAICanvas) {
      mentorAICanvas.style.display =
        "block";
    }
  }

  document
    .querySelectorAll(
      "[data-bg-mode]"
    )
    .forEach(
      (button) => {

        button.classList.toggle(
          "active",
          button.dataset.bgMode ===
            mode
        );
      }
    );

  showToast(
    `Background: ${mode}`
  );
}


bgOriginalBtn?.addEventListener(
  "click",
  () =>
    setBackgroundMode(
      "original"
    )
);


bgRemoveBtn?.addEventListener(
  "click",
  () =>
    setBackgroundMode(
      "remove"
    )
);


bgBlurBtn?.addEventListener(
  "click",
  () =>
    setBackgroundMode(
      "blur"
    )
);


bgImageBtn?.addEventListener(
  "click",
  () => {

    setBackgroundMode(
      "image"
    );

    backgroundImageUpload?.click();
  }
);


bgColorBtn?.addEventListener(
  "click",
  () =>
    setBackgroundMode(
      "color"
    )
);


backgroundImageUpload?.addEventListener(
  "change",
  (event) => {

    const file =
      event.target.files?.[0];

    if (!file) return;

    const image =
      new Image();

    image.onload = () => {

      customBackgroundImage =
        image;

      setBackgroundMode(
        "image"
      );

      showToast(
        "Custom background applied"
      );
    };

    image.src =
      URL.createObjectURL(file);
  }
);


backgroundColor?.addEventListener(
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


/* =========================================================
   MENTOR DRAG
========================================================= */

function initializeMentorDrag() {

  if (
    !mentorCard ||
    !stage
  ) {
    return;
  }

  mentorCard.style.touchAction =
    "none";

  mentorCard.addEventListener(
    "pointerdown",
    mentorPointerDown
  );

  window.addEventListener(
    "pointermove",
    mentorPointerMove
  );

  window.addEventListener(
    "pointerup",
    mentorPointerUp
  );

  window.addEventListener(
    "pointercancel",
    mentorPointerUp
  );
}


function mentorPointerDown(
  event
) {

  if (
    event.target.closest(
      "button, input, select, textarea, a, label, video"
    )
  ) {
    return;
  }

  if (
    event.target ===
    mentorResize
  ) {
    return;
  }

  const stageRect =
    getStageRect();

  if (!stageRect) return;

  const cardRect =
    mentorCard.getBoundingClientRect();

  mentorDragging = true;

  dragPointerId =
    event.pointerId;

  dragStartX =
    event.clientX;

  dragStartY =
    event.clientY;

  dragStartLeft =
    cardRect.left -
    stageRect.left;

  dragStartTop =
    cardRect.top -
    stageRect.top;

  mentorCard
    .setPointerCapture?.(
      event.pointerId
    );

  event.preventDefault();
}


function mentorPointerMove(
  event
) {

  if (
    !mentorDragging ||
    event.pointerId !==
      dragPointerId
  ) {
    return;
  }

  const stageRect =
    getStageRect();

  if (!stageRect) return;

  const nextLeft =
    dragStartLeft +
    (
      event.clientX -
      dragStartX
    );

  const nextTop =
    dragStartTop +
    (
      event.clientY -
      dragStartY
    );

  const maxLeft =
    stageRect.width -
    mentorCard.offsetWidth;

  const maxTop =
    stageRect.height -
    mentorCard.offsetHeight;

  mentorCard.style.left =
    `${clamp(
      nextLeft,
      0,
      maxLeft
    )}px`;

  mentorCard.style.top =
    `${clamp(
      nextTop,
      0,
      maxTop
    )}px`;

  mentorCard.style.right =
    "auto";

  mentorCard.style.bottom =
    "auto";
}


function mentorPointerUp(
  event
) {

  if (
    !mentorDragging ||
    (
      event.pointerId !==
      undefined &&
      event.pointerId !==
        dragPointerId
    )
  ) {
    return;
  }

  mentorDragging = false;

  dragPointerId = null;

  localStorage.setItem(
    "courseStudioMentorLeft",
    mentorCard.style.left ||
      "auto"
  );

  localStorage.setItem(
    "courseStudioMentorTop",
    mentorCard.style.top ||
      "auto"
  );
}


function resetMentorPosition() {

  if (!mentorCard) return;

  mentorCard.style.left =
    "auto";

  mentorCard.style.top =
    "auto";

  mentorCard.style.right =
    "18px";

  mentorCard.style.bottom =
    "18px";

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
    1920;

  compositionCanvas.height =
    1080;

  compositionCanvas.id =
    "courseStudioRecordCanvas";

  compositionCtx =
    compositionCanvas.getContext(
      "2d",
      {
        alpha: false
      }
    );
}


function drawMediaCover(
  context,
  media,
  x,
  y,
  width,
  height
) {

  const mediaWidth =
    media.videoWidth ||
    media.naturalWidth ||
    media.width;

  const mediaHeight =
    media.videoHeight ||
    media.naturalHeight ||
    media.height;

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

  const sourceWidth =
    width / scale;

  const sourceHeight =
    height / scale;

  const sourceX =
    (mediaWidth -
      sourceWidth) / 2;

  const sourceY =
    (mediaHeight -
      sourceHeight) / 2;

  try {

    context.drawImage(
      media,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      x,
      y,
      width,
      height
    );

  } catch (error) {

    console.warn(
      "drawMediaCover:",
      error
    );
  }
}


function drawRoundedMedia(
  context,
  media,
  x,
  y,
  width,
  height,
  radius = 24
) {

  context.save();

  context.beginPath();

  context.roundRect(
    x,
    y,
    width,
    height,
    radius
  );

  context.clip();

  drawMediaCover(
    context,
    media,
    x,
    y,
    width,
    height
  );

  context.restore();
}


function getActiveMentorMedia() {

  if (
    cameraActive &&
    backgroundMode !==
      "original" &&
    mentorAICanvas
  ) {

    return mentorAICanvas;
  }

  if (
    cameraActive &&
    mentorCameraVideo
  ) {

    return mentorCameraVideo;
  }

  if (
    mentorVideo &&
    mentorVideo.src &&
    !mentorVideo.paused
  ) {

    return mentorVideo;
  }

  if (
    mentorVideo &&
    mentorVideo.src
  ) {

    return mentorVideo;
  }

  return null;
}


function drawMainStage(
  context,
  width,
  height
) {

  context.fillStyle =
    "#101827";

  context.fillRect(
    0,
    0,
    width,
    height
  );

  if (
    mainVideo &&
    mainVideo.src &&
    isVisible(mainVideo) &&
    mainVideo.readyState >= 2
  ) {

    drawMediaCover(
      context,
      mainVideo,
      0,
      0,
      width,
      height
    );

    return;
  }

  if (
    mainImage &&
    mainImage.src &&
    isVisible(mainImage) &&
    mainImage.complete
  ) {

    drawMediaCover(
      context,
      mainImage,
      0,
      0,
      width,
      height
    );

    return;
  }

  context.fillStyle =
    "#eaf2fb";

  context.fillRect(
    0,
    0,
    width,
    height
  );

  context.fillStyle =
    "#64748b";

  context.font =
    "600 44px Arial";

  context.textAlign =
    "center";

  context.fillText(
    "Personal Course Studio",
    width / 2,
    height / 2
  );
}


function drawMentorOverlay(
  context,
  width,
  height
) {

  if (
    !mentorCard ||
    !stage
  ) {
    return;
  }

  const stageRect =
    stage.getBoundingClientRect();

  const cardRect =
    mentorCard.getBoundingClientRect();

  if (
    !cardRect.width ||
    !cardRect.height
  ) {
    return;
  }

  const scaleX =
    width /
    stageRect.width;

  const scaleY =
    height /
    stageRect.height;

  const x =
    (
      cardRect.left -
      stageRect.left
    ) * scaleX;

  const y =
    (
      cardRect.top -
      stageRect.top
    ) * scaleY;

  const w =
    cardRect.width *
    scaleX;

  const h =
    cardRect.height *
    scaleY;

  context.save();

  context.shadowColor =
    "rgba(0,0,0,0.35)";

  context.shadowBlur = 28;

  context.fillStyle =
    "#111827";

  context.beginPath();

  context.roundRect(
    x,
    y,
    w,
    h,
    24
  );

  context.fill();

  context.shadowBlur = 0;

  const media =
    getActiveMentorMedia();

  if (media) {

    drawRoundedMedia(
      context,
      media,
      x,
      y,
      w,
      h,
      24
    );

  } else {

    context.fillStyle =
      "#1e293b";

    context.beginPath();

    context.roundRect(
      x,
      y,
      w,
      h,
      24
    );

    context.fill();

    context.fillStyle =
      "#e2e8f0";

    context.font =
      `600 ${Math.max(
        18,
        w * 0.055
      )}px Arial`;

    context.textAlign =
      "center";

    context.fillText(
      "Mentor Camera",
      x + w / 2,
      y + h / 2
    );
  }

  context.fillStyle =
    "rgba(15,23,42,0.72)";

  context.beginPath();

  context.roundRect(
    x + 14,
    y + 14,
    Math.min(
      230,
      w - 28
    ),
    42,
    12
  );

  context.fill();

  context.fillStyle =
    "#ffffff";

  context.font =
    `600 ${Math.max(
      14,
      w * 0.035
    )}px Arial`;

  context.textAlign =
    "left";

  context.fillText(
    "MENTOR",
    x + 28,
    y + 41
  );

  context.restore();
}


function drawBrandBadge(
  context,
  width,
  height
) {

  if (
    !brandBadge ||
    !isVisible(brandBadge)
  ) {
    return;
  }

  const stageRect =
    stage.getBoundingClientRect();

  const badgeRect =
    brandBadge.getBoundingClientRect();

  const scaleX =
    width /
    stageRect.width;

  const scaleY =
    height /
    stageRect.height;

  const x =
    (
      badgeRect.left -
      stageRect.left
    ) * scaleX;

  const y =
    (
      badgeRect.top -
      stageRect.top
    ) * scaleY;

  const w =
    badgeRect.width *
    scaleX;

  const h =
    badgeRect.height *
    scaleY;

  const brandName =
    brandBadge.textContent?.trim() ||
    "Personal Course Studio";

  context.save();

  context.fillStyle =
    "rgba(15,23,42,0.76)";

  context.beginPath();

  context.roundRect(
    x,
    y,
    w,
    h,
    12
  );

  context.fill();

  context.fillStyle =
    "#ffffff";

  context.font =
    `600 ${Math.max(
      14,
      h * 0.42
    )}px Arial`;

  context.textAlign =
    "left";

  context.textBaseline =
    "middle";

  context.fillText(
    brandName,
    x + 14,
    y + h / 2,
    w - 28
  );

  context.restore();
}


function renderCompositionFrame(
  timestamp = 0
) {

  if (
    !compositionCtx ||
    !compositionCanvas ||
    !isRecording ||
    isRecordingPaused
  ) {
    return;
  }

  if (
    timestamp -
      compositionLastFrame >=
    30
  ) {

    compositionLastFrame =
      timestamp;

    const width =
      compositionCanvas.width;

    const height =
      compositionCanvas.height;

    drawMainStage(
      compositionCtx,
      width,
      height
    );

    drawMentorOverlay(
      compositionCtx,
      width,
      height
    );

    drawBrandBadge(
      compositionCtx,
      width,
      height
    );
  }

  compositionAnimationId =
    requestAnimationFrame(
      renderCompositionFrame
    );
}


/* =========================================================
   AUDIO MIXING
========================================================= */

async function prepareAudioMix() {

  audioContext =
    audioContext ||
    new (
      window.AudioContext ||
      window.webkitAudioContext
    )();

  if (
    audioContext.state ===
    "suspended"
  ) {

    await audioContext.resume();
  }

  audioDestination =
    audioContext
      .createMediaStreamDestination();


  /* -------------------------------------------------------
     MAIN VIDEO AUDIO
  ------------------------------------------------------- */

  if (
    mainVideo &&
    mainVideo.src
  ) {

    try {

      if (!mainVideoAudioSource) {

        mainVideoAudioSource =
          audioContext
            .createMediaElementSource(
              mainVideo
            );

        mainVideoAudioSource.connect(
          audioContext.destination
        );
      }

      mainVideoAudioSource.connect(
        audioDestination
      );

    } catch (error) {

      console.warn(
        "Main video audio routing:",
        error
      );
    }
  }


  /* -------------------------------------------------------
     MENTOR VIDEO AUDIO
  ------------------------------------------------------- */

  if (
    !cameraActive &&
    mentorVideo &&
    mentorVideo.src
  ) {

    try {

      if (!mentorVideoAudioSource) {

        mentorVideoAudioSource =
          audioContext
            .createMediaElementSource(
              mentorVideo
            );

        mentorVideoAudioSource.connect(
          audioContext.destination
        );
      }

      mentorVideoAudioSource.connect(
        audioDestination
      );

    } catch (error) {

      console.warn(
        "Mentor video audio routing:",
        error
      );
    }
  }


  /* -------------------------------------------------------
     MICROPHONE
  ------------------------------------------------------- */

  try {

    microphoneStream =
      await navigator.mediaDevices
        .getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },

          video: false
        });

    microphoneSource =
      audioContext
        .createMediaStreamSource(
          microphoneStream
        );

    microphoneSource.connect(
      audioDestination
    );

  } catch (error) {

    console.warn(
      "Microphone unavailable:",
      error
    );

    showToast(
      "Microphone unavailable — recording without mic"
    );
  }

  return audioDestination.stream;
}


/* =========================================================
   RECORDING TIMER
========================================================= */

function startRecordingTimer() {

  stopRecordingTimer();

  recordingTimerId =
    setInterval(
      updateRecordingTimer,
      250
    );

  updateRecordingTimer();
}


function stopRecordingTimer() {

  if (recordingTimerId) {

    clearInterval(
      recordingTimerId
    );

    recordingTimerId = null;
  }
}


function getRecordingElapsedSeconds() {

  if (!isRecording) {
    return (
      recordingElapsedBeforePause /
      1000
    );
  }

  if (isRecordingPaused) {
    return (
      recordingElapsedBeforePause /
      1000
    );
  }

  return (
    (
      Date.now() -
      recordingStartTime +
      recordingElapsedBeforePause
    ) / 1000
  );
}


function updateRecordingTimer() {

  const seconds =
    getRecordingElapsedSeconds();

  const text =
    formatTime(seconds);

  if (
    window.CourseStudioRecordingUI &&
    typeof window.CourseStudioRecordingUI
      .updateTimer ===
      "function"
  ) {

    window.CourseStudioRecordingUI
      .updateTimer(text);
  }

  const timer =
    document.getElementById(
      "courseStudioRecordingTimer"
    );

  if (timer) {
    timer.textContent =
      text;
  }
}


function resetRecordingTimer() {

  stopRecordingTimer();

  recordingStartTime = 0;

  recordingElapsedBeforePause =
    0;

  updateRecordingTimer();
}


/* =========================================================
   RECORDING UI
========================================================= */

function createRecordingControls() {

  let bar =
    document.getElementById(
      "courseStudioRecordingControls"
    );

  if (bar) {
    return bar;
  }

  bar =
    document.createElement(
      "div"
    );

  bar.id =
    "courseStudioRecordingControls";

  bar.innerHTML = `
    <div
      id="courseStudioRecordingTimer"
      class="cs-recording-timer"
    >
      00:00:00
    </div>

    <div
      id="courseStudioRecordingState"
      class="cs-recording-state"
    >
      Ready
    </div>

    <button
      type="button"
      id="courseStudioPauseBtn"
      class="cs-recording-btn"
    >
      ⏸ Pause
    </button>

    <button
      type="button"
      id="courseStudioResumeBtn"
      class="cs-recording-btn"
      style="display:none;"
    >
      ▶ Resume
    </button>

    <button
      type="button"
      id="courseStudioStopBtn"
      class="cs-recording-btn cs-stop-btn"
    >
      ■ Stop
    </button>
  `;

  document.body.appendChild(
    bar
  );

  const style =
    document.createElement(
      "style"
    );

  style.id =
    "courseStudioRecordingControlsStyle";

  style.textContent = `
    #courseStudioRecordingControls {
      position: fixed;
      left: 50%;
      bottom: 22px;
      transform: translateX(-50%);
      z-index: 99998;

      display: flex;
      align-items: center;
      gap: 10px;

      padding: 10px 14px;

      border: 1px solid rgba(255,255,255,.12);
      border-radius: 18px;

      background: rgba(10,15,25,.94);
      backdrop-filter: blur(18px);

      box-shadow:
        0 18px 50px rgba(0,0,0,.42);

      color: #fff;

      font-family:
        Inter,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
    }

    #courseStudioRecordingControls
    .cs-recording-timer {
      min-width: 92px;
      padding: 8px 12px;

      border-radius: 12px;

      background: rgba(255,255,255,.07);

      font-size: 15px;
      font-weight: 800;
      letter-spacing: .06em;
      text-align: center;
      font-variant-numeric: tabular-nums;
    }

    #courseStudioRecordingControls
    .cs-recording-state {
      min-width: 82px;

      color: #fb7185;

      font-size: 13px;
      font-weight: 700;

      text-align: center;
    }

    #courseStudioRecordingControls
    .cs-recording-btn {
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 11px;

      padding: 9px 13px;

      color: #fff;
      background: rgba(255,255,255,.08);

      cursor: pointer;

      font-size: 13px;
      font-weight: 700;

      transition:
        transform .18s ease,
        background .18s ease;
    }

    #courseStudioRecordingControls
    .cs-recording-btn:hover {
      transform: translateY(-1px);
      background: rgba(255,255,255,.14);
    }

    #courseStudioRecordingControls
    .cs-stop-btn {
      background: rgba(239,68,68,.18);
      border-color: rgba(239,68,68,.35);
    }

    @media (max-width: 700px) {
      #courseStudioRecordingControls {
        width: calc(100% - 24px);
        bottom: 12px;
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  `;

  document.head.appendChild(
    style
  );


  const pauseBtn =
    document.getElementById(
      "courseStudioPauseBtn"
    );

  const resumeBtn =
    document.getElementById(
      "courseStudioResumeBtn"
    );

  const stopBtn =
    document.getElementById(
      "courseStudioStopBtn"
    );


  pauseBtn?.addEventListener(
    "click",
    pauseRecording
  );

  resumeBtn?.addEventListener(
    "click",
    resumeRecording
  );

  stopBtn?.addEventListener(
    "click",
    stopRecording
  );


  return bar;
}


function updateRecordingControls() {

  const bar =
    document.getElementById(
      "courseStudioRecordingControls"
    );

  if (!bar) return;

  const timer =
    document.getElementById(
      "courseStudioRecordingTimer"
    );

  const state =
    document.getElementById(
      "courseStudioRecordingState"
    );

  const pauseBtn =
    document.getElementById(
      "courseStudioPauseBtn"
    );

  const resumeBtn =
    document.getElementById(
      "courseStudioResumeBtn"
    );

  const stopBtn =
    document.getElementById(
      "courseStudioStopBtn"
    );


  if (timer) {
    timer.textContent =
      formatTime(
        getRecordingElapsedSeconds()
      );
  }


  if (isRecording) {

    bar.style.display =
      "flex";

    if (isRecordingPaused) {

      if (state) {
        state.textContent =
          "Paused";
        state.style.color =
          "#fbbf24";
      }

      if (pauseBtn) {
        pauseBtn.style.display =
          "none";
      }

      if (resumeBtn) {
        resumeBtn.style.display =
          "";
      }

    } else {

      if (state) {
        state.textContent =
          "● Recording";
        state.style.color =
          "#fb7185";
      }

      if (pauseBtn) {
        pauseBtn.style.display =
          "";
      }

      if (resumeBtn) {
        resumeBtn.style.display =
          "none";
      }
    }

    if (stopBtn) {
      stopBtn.style.display =
        "";
    }

  } else {

    bar.style.display =
      "none";
  }
}


window.CourseStudioRecordingUI = {
  updateTimer: (text) => {

    const timer =
      document.getElementById(
        "courseStudioRecordingTimer"
      );

    if (timer) {
      timer.textContent =
        text;
    }
  }
};


/* =========================================================
   START RECORDING
========================================================= */

async function startRecording() {

  if (!stage) {

    showToast(
      "Stage not found"
    );

    return;
  }

  if (
    !window.MediaRecorder ||
    !HTMLCanvasElement.prototype
      .captureStream
  ) {

    showToast(
      "This browser does not support canvas recording"
    );

    return;
  }


  if (isRecording) {
    return;
  }


  try {

    createCompositionCanvas();

    createRecordingControls();


    /* -----------------------------------------------------
       AUDIO
    ----------------------------------------------------- */

    const audioStream =
      await prepareAudioMix();


    /* -----------------------------------------------------
       VIDEO
    ----------------------------------------------------- */

    const videoStream =
      compositionCanvas.captureStream(
        30
      );

    recordingVideoTrack =
      videoStream.getVideoTracks()[0];


    recordingStream =
      new MediaStream([
        ...videoStream.getVideoTracks(),
        ...audioStream.getAudioTracks()
      ]);


    /* -----------------------------------------------------
       CLEAN OLD DATA
    ----------------------------------------------------- */

    recordedChunks = [];

    lastRecordingBlob = null;

    if (lastRecordingUrl) {

      URL.revokeObjectURL(
        lastRecordingUrl
      );

      lastRecordingUrl = null;
    }


    /* -----------------------------------------------------
       MIME TYPE
    ----------------------------------------------------- */

    const mimeTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm"
    ];

    const supportedMimeType =
      mimeTypes.find(
        (type) =>
          MediaRecorder.isTypeSupported(
            type
          )
      );

    recordingMimeType =
      supportedMimeType ||
      "video/webm";


    /* -----------------------------------------------------
       MEDIA RECORDER
    ----------------------------------------------------- */

    mediaRecorder =
      new MediaRecorder(
        recordingStream,
        supportedMimeType
          ? {
              mimeType:
                supportedMimeType
            }
          : undefined
      );


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
      finishRecording;


    mediaRecorder.onerror =
      (event) => {

        console.error(
          "Recorder error:",
          event.error
        );

        showToast(
          "Recording error"
        );
      };


    /* -----------------------------------------------------
       STATE
    ----------------------------------------------------- */

    isRecording = true;

    isRecordingPaused = false;

    recordingStartTime =
      Date.now();

    recordingElapsedBeforePause =
      0;

    compositionLastFrame = 0;


    /* -----------------------------------------------------
       START RENDER
    ----------------------------------------------------- */

    compositionAnimationId =
      requestAnimationFrame(
        renderCompositionFrame
      );


    /* -----------------------------------------------------
       START MEDIA RECORDER
    ----------------------------------------------------- */

    mediaRecorder.start(1000);


    startRecordingTimer();

    updateRecordingUI();

    updateRecordingControls();

    setStatus(
      "Recording"
    );

    showToast(
      "Recording started"
    );

  } catch (error) {

    console.error(
      "Start recording error:",
      error
    );

    isRecording = false;

    isRecordingPaused = false;

    updateRecordingUI();

    updateRecordingControls();

    setStatus(
      "Recording failed",
      false
    );

    showToast(
      "Could not start recording"
    );

    cleanupRecordingResources();
  }
}


/* =========================================================
   PAUSE RECORDING
========================================================= */

function pauseRecording() {

  if (
    !isRecording ||
    !mediaRecorder
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

    recordingElapsedBeforePause +=
      Date.now() -
      recordingStartTime;

    isRecordingPaused = true;

    stopRecordingTimer();


    if (compositionAnimationId) {

      cancelAnimationFrame(
        compositionAnimationId
      );

      compositionAnimationId =
        null;
    }


    updateRecordingUI();

    updateRecordingControls();

    setStatus(
      "Recording paused"
    );

    showToast(
      "Recording paused"
    );

  } catch (error) {

    console.error(
      "Pause error:",
      error
    );

    showToast(
      "Could not pause recording"
    );
  }
}


/* =========================================================
   RESUME RECORDING
========================================================= */

function resumeRecording() {

  if (
    !isRecording ||
    !mediaRecorder
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

    mediaRecorder.resume();

    recordingStartTime =
      Date.now();

    isRecordingPaused = false;


    compositionLastFrame = 0;

    compositionAnimationId =
      requestAnimationFrame(
        renderCompositionFrame
      );


    startRecordingTimer();

    updateRecordingUI();

    updateRecordingControls();

    setStatus(
      "Recording"
    );

    showToast(
      "Recording resumed"
    );

  } catch (error) {

    console.error(
      "Resume error:",
      error
    );

    showToast(
      "Could not resume recording"
    );
  }
}


/* =========================================================
   STOP RECORDING
========================================================= */

function stopRecording() {

  if (
    !mediaRecorder ||
    mediaRecorder.state ===
      "inactive"
  ) {
    return;
  }


  /* -------------------------------------------------------
     SAVE TIMER VALUE
  ------------------------------------------------------- */

  if (
    isRecording &&
    !isRecordingPaused
  ) {

    recordingElapsedBeforePause +=
      Date.now() -
      recordingStartTime;
  }


  stopRecordingTimer();


  isRecording = false;

  isRecordingPaused = false;


  if (compositionAnimationId) {

    cancelAnimationFrame(
      compositionAnimationId
    );

    compositionAnimationId =
      null;
  }


  try {

    if (
      mediaRecorder.state ===
      "paused"
    ) {

      mediaRecorder.resume();
    }

    mediaRecorder.stop();

  } catch (error) {

    console.error(
      "Stop recording error:",
      error
    );

    finishRecording();
  }


  updateRecordingUI();

  setStatus(
    "Processing recording"
  );

  updateRecordingControls();
}


/* =========================================================
   FINISH RECORDING
========================================================= */

function finishRecording() {

  if (
    !recordedChunks.length
  ) {

    showToast(
      "No recording data was created"
    );

    cleanupRecordingResources();

    resetRecordingTimer();

    return;
  }


  const blob =
    new Blob(
      recordedChunks,
      {
        type:
          recordingMimeType ||
          "video/webm"
      }
    );


  lastRecordingBlob =
    blob;


  if (lastRecordingUrl) {

    URL.revokeObjectURL(
      lastRecordingUrl
    );
  }


  lastRecordingUrl =
    URL.createObjectURL(
      blob
    );


  recordedChunks = [];


  cleanupRecordingResources();

  resetRecordingTimer();

  updateRecordingControls();

  setStatus(
    "Recording ready"
  );


  showRecordingPreview();
}


/* =========================================================
   CLEANUP RECORDING RESOURCES
========================================================= */

function cleanupRecordingResources() {

  if (recordingStream) {

    recordingStream
      .getTracks()
      .forEach(
        (track) => {
          try {
            track.stop();
          } catch (error) {}
        }
      );

    recordingStream = null;
  }


  recordingVideoTrack =
    null;


  if (microphoneStream) {

    microphoneStream
      .getTracks()
      .forEach(
        (track) => {
          try {
            track.stop();
          } catch (error) {}
        }
      );

    microphoneStream = null;
  }


  microphoneSource =
    null;

  audioDestination =
    null;

  mediaRecorder =
    null;
}


/* =========================================================
   RECORDING UI — TOP BUTTON
========================================================= */

function updateRecordingUI() {

  if (!recordTopBtn) {
    return;
  }


  if (isRecording) {

    if (isRecordingPaused) {

      recordTopBtn.classList.add(
        "recording"
      );

      recordTopBtn.textContent =
        "▶ Resume";

    } else {

      recordTopBtn.classList.add(
        "recording"
      );

      recordTopBtn.textContent =
        "■ Stop Recording";
    }

  } else {

    recordTopBtn.classList.remove(
      "recording"
    );

    recordTopBtn.textContent =
      "● Record";
  }


  recordTopBtn.setAttribute(
    "aria-pressed",
    String(isRecording)
  );
}


/* =========================================================
   PREVIEW MODAL
========================================================= */

function createPreviewModal() {

  if (previewModal) {
    return;
  }


  previewModal =
    document.createElement(
      "div"
    );

  previewModal.id =
    "courseStudioPreviewModal";

  previewModal.innerHTML = `
    <div
      class="cs-preview-backdrop"
      data-preview-close="true"
    ></div>

    <div
      class="cs-preview-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Recording preview"
    >

      <div class="cs-preview-header">

        <div>
          <div class="cs-preview-title">
            Recording Preview
          </div>

          <div
            id="courseStudioPreviewDuration"
            class="cs-preview-subtitle"
          >
            Ready to review
          </div>
        </div>

        <button
          type="button"
          class="cs-preview-close"
          id="courseStudioPreviewClose"
        >
          ×
        </button>

      </div>


      <div class="cs-preview-video-wrap">

        <video
          id="courseStudioPreviewVideo"
          controls
          playsinline
          preload="metadata"
        ></video>

      </div>


      <div class="cs-preview-actions">

        <button
          type="button"
          id="courseStudioPreviewPlay"
          class="cs-preview-btn"
        >
          ▶ Play Preview
        </button>

        <button
          type="button"
          id="courseStudioDownload"
          class="cs-preview-btn cs-preview-download"
        >
          ↓ Download
        </button>

        <button
          type="button"
          id="courseStudioDiscard"
          class="cs-preview-btn cs-preview-discard"
        >
          🗑 Discard
        </button>

      </div>

    </div>
  `;


  document.body.appendChild(
    previewModal
  );


  const style =
    document.createElement(
      "style"
    );

  style.id =
    "courseStudioPreviewStyle";

  style.textContent = `
    #courseStudioPreviewModal {
      position: fixed;
      inset: 0;
      z-index: 100000;

      display: none;

      align-items: center;
      justify-content: center;

      padding: 24px;

      font-family:
        Inter,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
    }

    #courseStudioPreviewModal.is-open {
      display: flex;
    }

    .cs-preview-backdrop {
      position: absolute;
      inset: 0;

      background:
        rgba(2,6,23,.78);

      backdrop-filter:
        blur(14px);
    }

    .cs-preview-panel {
      position: relative;

      width: min(
        1050px,
        100%
      );

      max-height:
        calc(100vh - 48px);

      overflow: auto;

      border:
        1px solid
        rgba(255,255,255,.12);

      border-radius: 24px;

      background:
        #0b1220;

      box-shadow:
        0 30px 100px
        rgba(0,0,0,.55);

      color: #fff;

      padding: 20px;
    }

    .cs-preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      gap: 20px;

      margin-bottom: 16px;
    }

    .cs-preview-title {
      font-size: 20px;
      font-weight: 800;
    }

    .cs-preview-subtitle {
      margin-top: 4px;

      color:
        rgba(255,255,255,.55);

      font-size: 13px;
    }

    .cs-preview-close {
      width: 42px;
      height: 42px;

      border:
        1px solid
        rgba(255,255,255,.12);

      border-radius: 12px;

      color: #fff;
      background:
        rgba(255,255,255,.06);

      font-size: 26px;

      cursor: pointer;
    }

    .cs-preview-video-wrap {
      width: 100%;

      overflow: hidden;

      border-radius: 18px;

      background:
        #020617;

      border:
        1px solid
        rgba(255,255,255,.1);
    }

    #courseStudioPreviewVideo {
      display: block;

      width: 100%;
      max-height: 68vh;

      background:
        #000;
    }

    .cs-preview-actions {
      display: flex;
      flex-wrap: wrap;

      gap: 10px;

      margin-top: 16px;
    }

    .cs-preview-btn {
      min-height: 44px;

      padding:
        0 17px;

      border:
        1px solid
        rgba(255,255,255,.12);

      border-radius: 12px;

      color: #fff;

      background:
        rgba(255,255,255,.07);

      font-size: 14px;
      font-weight: 750;

      cursor: pointer;

      transition:
        transform .18s ease,
        background .18s ease;
    }

    .cs-preview-btn:hover {
      transform:
        translateY(-1px);

      background:
        rgba(255,255,255,.13);
    }

    .cs-preview-download {
      background:
        rgba(34,197,94,.16);

      border-color:
        rgba(34,197,94,.32);
    }

    .cs-preview-discard {
      background:
        rgba(239,68,68,.14);

      border-color:
        rgba(239,68,68,.3);
    }

    @media (max-width: 700px) {

      #courseStudioPreviewModal {
        padding: 10px;
      }

      .cs-preview-panel {
        padding: 14px;
        border-radius: 18px;
      }

      .cs-preview-actions {
        display: grid;
        grid-template-columns:
          1fr;
      }

      .cs-preview-btn {
        width: 100%;
      }
    }
  `;

  document.head.appendChild(
    style
  );


  previewVideo =
    document.getElementById(
      "courseStudioPreviewVideo"
    );

  previewTimerText =
    document.getElementById(
      "courseStudioPreviewDuration"
    );


  document
    .getElementById(
      "courseStudioPreviewClose"
    )
    ?.addEventListener(
      "click",
      closeRecordingPreview
    );


  document
    .getElementById(
      "courseStudioPreviewPlay"
    )
    ?.addEventListener(
      "click",
      togglePreviewPlayback
    );


  document
    .getElementById(
      "courseStudioDownload"
    )
    ?.addEventListener(
      "click",
      downloadRecording
    );


  document
    .getElementById(
      "courseStudioDiscard"
    )
    ?.addEventListener(
      "click",
      discardRecording
    );


  previewModal.addEventListener(
    "click",
    (event) => {

      if (
        event.target.dataset
          ?.previewClose ===
        "true"
      ) {

        closeRecordingPreview();
      }
    }
  );


  previewVideo?.addEventListener(
    "play",
    updatePreviewPlayButton
  );

  previewVideo?.addEventListener(
    "pause",
    updatePreviewPlayButton
  );

  previewVideo?.addEventListener(
    "ended",
    updatePreviewPlayButton
  );
}


function showRecordingPreview() {

  createPreviewModal();

  if (
    !previewModal ||
    !previewVideo ||
    !lastRecordingUrl
  ) {
    return;
  }


  previewVideo.pause();

  previewVideo.src =
    lastRecordingUrl;

  previewVideo.load();


  if (previewTimerText) {

    previewTimerText.textContent =
      `Recording: ${formatTime(
        recordingElapsedBeforePause /
          1000
      )}`;
  }


  previewModal.classList.add(
    "is-open"
  );


  updatePreviewPlayButton();

  showToast(
    "Recording ready for preview"
  );
}


function closeRecordingPreview() {

  if (!previewModal) {
    return;
  }

  previewVideo?.pause();

  previewModal.classList.remove(
    "is-open"
  );
}


function togglePreviewPlayback() {

  if (!previewVideo) {
    return;
  }


  if (previewVideo.paused) {

    previewVideo
      .play()
      .catch(
        () => {
          showToast(
            "Could not play preview"
          );
        }
      );

  } else {

    previewVideo.pause();
  }
}


function updatePreviewPlayButton() {

  const button =
    document.getElementById(
      "courseStudioPreviewPlay"
    );

  if (!button) return;

  button.textContent =
    previewVideo &&
    !previewVideo.paused
      ? "⏸ Pause Preview"
      : "▶ Play Preview";
}


/* =========================================================
   DOWNLOAD RECORDING
========================================================= */

function downloadRecording() {

  if (!lastRecordingBlob) {

    showToast(
      "No recording available"
    );

    return;
  }


  const url =
    URL.createObjectURL(
      lastRecordingBlob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href = url;

  link.download =
    `Personal-Course-Studio-${createFileDate()}.webm`;

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
    10000
  );


  setStatus(
    "Recording saved"
  );

  showToast(
    "Recording downloaded"
  );
}


/* =========================================================
   DISCARD RECORDING
========================================================= */

function discardRecording() {

  if (!lastRecordingBlob) {

    closeRecordingPreview();

    return;
  }


  const confirmed =
    window.confirm(
      "Discard this recording? This cannot be undone."
    );

  if (!confirmed) {
    return;
  }


  previewVideo?.pause();

  if (previewVideo) {
    previewVideo.removeAttribute(
      "src"
    );

    previewVideo.load();
  }


  closeRecordingPreview();


  lastRecordingBlob =
    null;


  if (lastRecordingUrl) {

    URL.revokeObjectURL(
      lastRecordingUrl
    );

    lastRecordingUrl =
      null;
  }


  setStatus(
    "Ready"
  );

  showToast(
    "Recording discarded"
  );
}


/* =========================================================
   TOP RECORD BUTTON
========================================================= */

async function toggleRecording() {

  if (!isRecording) {

    await startRecording();

    return;
  }


  if (isRecordingPaused) {

    resumeRecording();

    return;
  }


  stopRecording();
}


recordTopBtn?.addEventListener(
  "click",
  toggleRecording
);


/* =========================================================
   SETTINGS
========================================================= */

function openSettings() {

  if (settingsModal) {
    settingsModal.classList.add(
      "open"
    );
  }
}


function closeSettings() {

  if (settingsModal) {
    settingsModal.classList.remove(
      "open"
    );
  }
}


function openBrandSettings() {

  openSettings();

  brandInput?.focus();
}


function saveSettings() {

  const brandName =
    brandInput?.value.trim() ||
    "Personal Course Studio";

  localStorage.setItem(
    "courseStudioBrand",
    brandName
  );

  if (brandBadge) {
    brandBadge.textContent =
      brandName;
  }

  closeSettings();

  showToast(
    "Settings saved"
  );
}


function loadSettings() {

  const savedBrand =
    localStorage.getItem(
      "courseStudioBrand"
    );

  if (savedBrand) {

    if (brandBadge) {
      brandBadge.textContent =
        savedBrand;
    }

    if (brandInput) {
      brandInput.value =
        savedBrand;
    }
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
    savedLeft &&
    savedTop
  ) {

    mentorCard.style.left =
      savedLeft;

    mentorCard.style.top =
      savedTop;

    mentorCard.style.right =
      "auto";

    mentorCard.style.bottom =
      "auto";
  }


  const savedWidth =
    localStorage.getItem(
      "courseStudioMentorWidth"
    );

  const savedHeight =
    localStorage.getItem(
      "courseStudioMentorHeight"
    );


  if (
    mentorCard &&
    savedWidth
  ) {

    mentorCard.style.width =
      savedWidth;
  }


  if (
    mentorCard &&
    savedHeight
  ) {

    mentorCard.style.height =
      savedHeight;
  }
}


settingsModal?.addEventListener(
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


/* =========================================================
   BUTTON COMPATIBILITY
========================================================= */

document
  .querySelectorAll(
    "[data-action]"
  )
  .forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const action =
            button.dataset.action;


          switch (action) {

            case "play":
              toggleMainPlay();
              break;


            case "clear":
              clearMainContent();
              break;


            case "fullscreen":
              fullscreenStage();
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


            case "brand-settings":
              openBrandSettings();
              break;


            case "reset-mentor":
              resetMentorPosition();
              break;


            case "record":
              toggleRecording();
              break;


            case "pause-recording":
              pauseRecording();
              break;


            case "resume-recording":
              resumeRecording();
              break;


            case "stop-recording":
              stopRecording();
              break;


            case "add-student":
              addStudent();
              break;
          }
        }
      );
    }
  );


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key ===
      "Escape"
    ) {

      if (
        previewModal?.classList.contains(
          "is-open"
        )
      ) {

        closeRecordingPreview();

        return;
      }

      closeSettings();
    }


    /* -----------------------------------------------------
       CTRL + ENTER
       Start / Stop / Resume
    ----------------------------------------------------- */

    if (
      event.ctrlKey &&
      event.key ===
        "Enter"
    ) {

      event.preventDefault();

      toggleRecording();
    }


    /* -----------------------------------------------------
       R
       Reset mentor
    ----------------------------------------------------- */

    if (
      event.key.toLowerCase() ===
        "r" &&
      ![
        "INPUT",
        "TEXTAREA",
        "SELECT"
      ].includes(
        document.activeElement?.tagName
      )
    ) {

      resetMentorPosition();
    }


    /* -----------------------------------------------------
       SPACE
       Pause / Resume recording
       Only when not typing.
    ----------------------------------------------------- */

    if (
      event.code ===
        "Space" &&
      isRecording &&
      ![
        "INPUT",
        "TEXTAREA",
        "SELECT",
        "BUTTON"
      ].includes(
        document.activeElement?.tagName
      )
    ) {

      event.preventDefault();

      if (isRecordingPaused) {

        resumeRecording();

      } else {

        pauseRecording();
      }
    }
  }
);


/* =========================================================
   GLOBAL API
========================================================= */

window.CourseStudio = {

  addStudent,

  removeStudent,

  toggleRecording,

  startRecording,

  stopRecording,

  pauseRecording,

  resumeRecording,

  startCamera,

  stopCamera,

  switchCamera,

  setBackgroundMode,

  resetMentorPosition,

  clearMainContent,

  fullscreenStage,

  openSettings,

  closeSettings,

  saveSettings,

  showRecordingPreview,

  closeRecordingPreview,

  downloadRecording,

  discardRecording
};


/* =========================================================
   INITIALIZE
========================================================= */

renderStudents();

loadSettings();

initializeMentorDrag();

createRecordingControls();


if (
  mentorResize &&
  mentorCard
) {

  mentorResize.style.touchAction =
    "none";
}


if (stopCameraBtn) {
  stopCameraBtn.disabled =
    true;
}


/* Recording control hidden initially */
const initialRecordingControls =
  document.getElementById(
    "courseStudioRecordingControls"
  );

if (initialRecordingControls) {
  initialRecordingControls.style.display =
    "none";
}


resetRecordingTimer();

setStatus("Ready");
