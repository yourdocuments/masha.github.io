/* =========================================================
   SNK MENTOR STUDIO
   Personal Course Studio
   File: mentor/script.js

   STEP 3.9 — PROFESSIONAL RECORDING SYSTEM

   Features:
   - Main image upload
   - Main video upload
   - Mentor video upload
   - Live camera
   - Camera device selection
   - Camera quality
   - Camera FPS
   - AI background
   - Original / Remove / Blur / Image / Color
   - Person segmentation
   - Draggable mentor card
   - Resizable mentor card
   - Screen capture
   - Main video audio
   - Microphone
   - Audio meters
   - Microphone waveform
   - Teleprompter
   - Students
   - Recording
   - Pause / Resume / Stop
   - 720p / 1080p / 1440p
   - 24 / 30 / 60 FPS
   - WebM VP9 / VP8 / MP4 detection
   - Recording preview
   - Recording history
   - IndexedDB recording storage
   - Rename
   - Download
   - Keyboard shortcuts
   - Fullscreen
   - Continuous composition rendering

   IMPORTANT:
   Browser MediaRecorder support for MP4 varies.
   The code automatically detects supported formats.
========================================================= */

"use strict";


/* =========================================================
   GLOBAL STATE
========================================================= */

const state = {

  /* ---------------------------------------------
     Main media
  --------------------------------------------- */
  mainImageURL: "",
  mainVideoURL: "",
  mentorVideoURL: "",

  mainMode: "none",
  mentorMode: "none",

  /* ---------------------------------------------
     Camera
  --------------------------------------------- */
  cameraStream: null,
  cameraDeviceId: "",
  cameraFacingMode: "user",
  cameraWidth: 1280,
  cameraHeight: 720,
  cameraFps: 30,

  /* ---------------------------------------------
     AI
  --------------------------------------------- */
  aiEnabled: false,
  aiBackgroundMode: "original",
  backgroundImage: null,
  selfieSegmentation: null,
  aiProcessing: false,

  /* ---------------------------------------------
     Screen capture
  --------------------------------------------- */
  screenStream: null,
  screenCaptureActive: false,

  /* ---------------------------------------------
     Audio
  --------------------------------------------- */
  audioContext: null,
  audioDestination: null,

  micStream: null,
  micSourceNode: null,
  micGainNode: null,
  micAnalyser: null,

  mainSourceNode: null,
  mainGainNode: null,
  mainAnalyser: null,

  micEnabled: true,
  micVolume: 1,
  micMonitor: false,
  mainVolume: 1,
  mainAudioEnabled: true,

  /* ---------------------------------------------
     Recording
  --------------------------------------------- */
  mediaRecorder: null,
  recordingChunks: [],
  recordingStream: null,
  recordingCanvasStream: null,

  recordingActive: false,
  recordingPaused: false,

  recordingStartedAt: 0,
  recordingPausedAt: 0,
  recordingAccumulatedPause: 0,

  recordingTimerInterval: null,
  recordingAnimationFrame: null,

  recordingWidth: 1920,
  recordingHeight: 1080,
  recordingFps: 30,

  recordingMimeType: "",
  recordingExtension: "webm",
  recordingFileName: "SNK-Course-Recording",

  lastRecordingBlob: null,
  lastRecordingURL: "",
  lastRecordingMimeType: "",

  currentRecordingId: null,

  /* ---------------------------------------------
     Composition
  --------------------------------------------- */
  compositionCanvas: null,
  compositionContext: null,

  compositionRunning: false,

  /* ---------------------------------------------
     Mentor position
  --------------------------------------------- */
  mentorX: 0.73,
  mentorY: 0.70,
  mentorWidth: 0.22,
  mentorHeight: 0.12375,

  mentorDragging: false,
  mentorResizing: false,

  dragStartX: 0,
  dragStartY: 0,
  dragOriginX: 0,
  dragOriginY: 0,

  resizeStartX: 0,
  resizeStartY: 0,
  resizeOriginWidth: 0,
  resizeOriginHeight: 0,

  /* ---------------------------------------------
     Teleprompter
  --------------------------------------------- */
  teleprompterText: "",
  teleprompterSpeed: 4,
  teleprompterFontSize: 36,
  teleprompterOpacity: 90,
  teleprompterPlaying: false,
  teleprompterAnimationFrame: null,

  includeTeleprompterInRecording: false,

  /* ---------------------------------------------
     Settings
  --------------------------------------------- */
  brandName: "SNK Institute",
  autoStartTeleprompter: false,
  showTeleprompterRecording: true,

  /* ---------------------------------------------
     Students
  --------------------------------------------- */
  students: [],

  /* ---------------------------------------------
     Render
  --------------------------------------------- */
  lastRenderTime: 0,

  /* ---------------------------------------------
     Trim
  --------------------------------------------- */
  trimStart: 0,
  trimEnd: 0,

  /* ---------------------------------------------
     IndexedDB
  --------------------------------------------- */
  db: null

};


/* =========================================================
   DOM HELPER
========================================================= */

function $(id) {
  return document.getElementById(id);
}


function qs(selector) {
  return document.querySelector(selector);
}


function qsa(selector) {
  return [...document.querySelectorAll(selector)];
}


/* =========================================================
   DOM REFERENCES
========================================================= */

const mainImage = $("mainImage");
const mainVideo = $("mainVideo");
const screenCaptureVideo = $("screenCaptureVideo");

const welcomeContent = $("welcomeContent");

const mentorCard = $("mentorCard");
const mentorVideo = $("mentorVideo");
const mentorCameraVideo = $("mentorCameraVideo");
const mentorAICanvas = $("mentorAICanvas");
const mentorPlaceholder = $("mentorPlaceholder");
const mentorSourceLabel = $("mentorSourceLabel");
const mentorResize = $("mentorResize");

const brandBadgeText = $("brandBadgeText");

const recordingOverlay = $("recordingOverlay");
const recordingOverlayTimer = $("recordingOverlayTimer");

const stage = $("stage");
const stageShell = $("stageShell");

const toastContainer = $("toastContainer");


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

  initializeCompositionCanvas();

  initializeUI();

  initializeCameraControls();

  initializeAudioControls();

  initializeTeleprompter();

  initializeStudentSystem();

  initializeRecordingSystem();

  initializeFullscreen();

  initializeKeyboardShortcuts();

  initializeMentorInteraction();

  initializeMediaEvents();

  initializeSettings();

  initializeAI();

  initializeScreenCapture();

  initializeFileButtons();

  initializeAudioEngine();

  await initializeDatabase();

  await loadRecordingHistory();

  loadSavedSettings();

  loadStudents();

  enumerateCameras();

  updateStageBadges();

  renderCompositionFrame();

  showToast(
    "Mentor Studio is ready.",
    "success"
  );

});


/* =========================================================
   BASIC UI
========================================================= */

function initializeUI() {

  bindClick(
    "uploadMainBtn",
    () => $("mainFileInput")?.click()
  );

  bindClick(
    "uploadVideoBtn",
    () => $("mainVideoInput")?.click()
  );

  bindClick(
    "uploadMentorBtn",
    () => $("mentorFileInput")?.click()
  );

  bindClick(
    "uploadMainSideBtn",
    () => $("mainFileInput")?.click()
  );

  bindClick(
    "uploadVideoSideBtn",
    () => $("mainVideoInput")?.click()
  );

  bindClick(
    "uploadMentorFileSideBtn",
    () => $("mentorFileInput")?.click()
  );

  bindClick(
    "uploadBackgroundSideBtn",
    () => $("backgroundImageUpload")?.click()
  );

  bindClick(
    "backgroundUploadBox",
    () => $("backgroundImageUpload")?.click()
  );

  bindClick(
    "welcomeUploadBtn",
    () => $("mainFileInput")?.click()
  );

  bindClick(
    "welcomeCameraBtn",
    startCamera
  );


  /* Main controls */

  bindClick(
    "mainPlayBtn",
    playMainMedia
  );

  bindClick(
    "mainPauseBtn",
    pauseMainMedia
  );


  /* Camera */

  bindClick(
    "startCameraBtn",
    startCamera
  );

  bindClick(
    "startCameraSideBtn",
    startCamera
  );

  bindClick(
    "stopCameraBtn",
    stopCamera
  );

  bindClick(
    "stopCameraSideBtn",
    stopCamera
  );

  bindClick(
    "switchCameraSideBtn",
    switchCamera
  );


  /* Mentor */

  bindClick(
    "uploadMentorSideBtn",
    () => $("mentorFileInput")?.click()
  );


  /* Recording */

  bindClick(
    "recordBtn",
    handleRecordButton
  );

  bindClick(
    "recordToolbarBtn",
    handleRecordButton
  );


  /* Teleprompter */

  bindClick(
    "openTeleprompterTopBtn",
    openTeleprompter
  );

  bindClick(
    "openTeleprompterBtn",
    openTeleprompter
  );

  bindClick(
    "openTeleprompterSide",
    openTeleprompter
  );

  bindClick(
    "uploadTeleprompterBtn",
    () => $("teleprompterFileInput")?.click()
  );


  /* Settings */

  bindClick(
    "settingsBtn",
    openSettings
  );


  /* Shortcuts */

  bindClick(
    "openShortcutsBtn",
    openShortcuts
  );


  /* Screen */

  bindClick(
    "startScreenCaptureBtn",
    startScreenCapture
  );

  bindClick(
    "startScreenCaptureSideBtn",
    startScreenCapture
  );

  bindClick(
    "stopScreenCaptureBtn",
    stopScreenCapture
  );

}


/* =========================================================
   CLICK BINDER
========================================================= */

function bindClick(id, callback) {

  const element = $(id);

  if (!element) {
    return;
  }

  element.addEventListener("click", callback);

}


/* =========================================================
   FILE INPUTS
========================================================= */

function initializeFileButtons() {

  const mainFileInput = $("mainFileInput");
  const mainVideoInput = $("mainVideoInput");
  const mentorFileInput = $("mentorFileInput");
  const backgroundInput = $("backgroundImageUpload");
  const teleprompterInput = $("teleprompterFileInput");


  if (mainFileInput) {

    mainFileInput.addEventListener(
      "change",
      event => {

        const file = event.target.files?.[0];

        if (!file) {
          return;
        }

        loadMainImage(file);

        event.target.value = "";

      }
    );

  }


  if (mainVideoInput) {

    mainVideoInput.addEventListener(
      "change",
      event => {

        const file = event.target.files?.[0];

        if (!file) {
          return;
        }

        loadMainVideo(file);

        event.target.value = "";

      }
    );

  }


  if (mentorFileInput) {

    mentorFileInput.addEventListener(
      "change",
      event => {

        const file = event.target.files?.[0];

        if (!file) {
          return;
        }

        loadMentorVideo(file);

        event.target.value = "";

      }
    );

  }


  if (backgroundInput) {

    backgroundInput.addEventListener(
      "change",
      event => {

        const file = event.target.files?.[0];

        if (!file) {
          return;
        }

        loadBackgroundImage(file);

        event.target.value = "";

      }
    );

  }


  if (teleprompterInput) {

    teleprompterInput.addEventListener(
      "change",
      loadTeleprompterFile
    );

  }

}


/* =========================================================
   MAIN IMAGE
========================================================= */

function loadMainImage(file) {

  if (!file.type.startsWith("image/")) {

    showToast(
      "Please select an image file.",
      "error"
    );

    return;
  }


  const url = URL.createObjectURL(file);

  if (state.mainImageURL) {
    URL.revokeObjectURL(state.mainImageURL);
  }

  state.mainImageURL = url;

  mainImage.src = url;

  state.mainMode = "image";

  mainImage.style.display = "block";
  mainVideo.style.display = "none";
  screenCaptureVideo.style.display = "none";

  welcomeContent.style.display = "none";

  updateStageSource("Image");

  renderCompositionFrame();

  showToast(
    "Main image loaded.",
    "success"
  );

}


/* =========================================================
   MAIN VIDEO
========================================================= */

function loadMainVideo(file) {

  if (!file.type.startsWith("video/")) {

    showToast(
      "Please select a video file.",
      "error"
    );

    return;
  }


  const url = URL.createObjectURL(file);

  if (state.mainVideoURL) {
    URL.revokeObjectURL(state.mainVideoURL);
  }

  state.mainVideoURL = url;

  mainVideo.src = url;

  mainVideo.load();

  state.mainMode = "video";

  mainImage.style.display = "none";
  mainVideo.style.display = "block";
  screenCaptureVideo.style.display = "none";

  welcomeContent.style.display = "none";

  updateStageSource("Main Video");

  ensureMainAudioNode();

  renderCompositionFrame();

  showToast(
    "Main video loaded.",
    "success"
  );

}


/* =========================================================
   MAIN MEDIA PLAY
========================================================= */

async function playMainMedia() {

  if (state.mainMode !== "video") {

    showToast(
      "Load a main video first.",
      "info"
    );

    return;
  }


  try {

    await mainVideo.play();

    renderCompositionFrame();

  } catch (error) {

    console.error(error);

    showToast(
      "Unable to play the video.",
      "error"
    );

  }

}


/* =========================================================
   MAIN MEDIA PAUSE
========================================================= */

function pauseMainMedia() {

  if (state.mainMode === "video") {

    mainVideo.pause();

  }

}


/* =========================================================
   MENTOR VIDEO
========================================================= */

function loadMentorVideo(file) {

  if (!file.type.startsWith("video/")) {

    showToast(
      "Please select a video file.",
      "error"
    );

    return;
  }


  stopCamera(false);

  const url = URL.createObjectURL(file);

  if (state.mentorVideoURL) {
    URL.revokeObjectURL(state.mentorVideoURL);
  }

  state.mentorVideoURL = url;

  mentorVideo.src = url;

  mentorVideo.load();

  state.mentorMode = "video";

  mentorVideo.style.display = "block";
  mentorCameraVideo.style.display = "none";
  mentorAICanvas.style.display = "none";

  mentorPlaceholder.style.display = "none";

  mentorSourceLabel.textContent =
    "Mentor Video";


  mentorVideo.play().catch(() => {});

  renderCompositionFrame();

  showToast(
    "Mentor video loaded.",
    "success"
  );

}


/* =========================================================
   CAMERA CONTROLS
========================================================= */

function initializeCameraControls() {

  const deviceSelect = $("cameraDeviceSelect");
  const qualitySelect = $("cameraQuality");
  const fpsSelect = $("cameraFps");


  if (deviceSelect) {

    deviceSelect.addEventListener(
      "change",
      async event => {

        state.cameraDeviceId =
          event.target.value || "";

        if (state.cameraStream) {
          await startCamera();
        }

      }
    );

  }


  if (qualitySelect) {

    qualitySelect.addEventListener(
      "change",
      async event => {

        setCameraResolution(
          event.target.value
        );

        if (state.cameraStream) {
          await startCamera();
        }

      }
    );

  }


  if (fpsSelect) {

    fpsSelect.addEventListener(
      "change",
      async event => {

        state.cameraFps =
          Number(event.target.value) || 30;

        if (state.cameraStream) {
          await startCamera();
        }

      }
    );

  }

}


/* =========================================================
   CAMERA RESOLUTION
========================================================= */

function setCameraResolution(value) {

  const parts = value.split("x");

  state.cameraWidth =
    Number(parts[0]) || 1280;

  state.cameraHeight =
    Number(parts[1]) || 720;

}


/* =========================================================
   START CAMERA
========================================================= */

async function startCamera() {

  try {

    stopCamera(false);

    const quality =
      $("cameraQuality")?.value ||
      "1280x720";

    setCameraResolution(quality);

    state.cameraFps =
      Number(
        $("cameraFps")?.value || 30
      );


    const constraints = {

      video: {

        width: {
          ideal: state.cameraWidth
        },

        height: {
          ideal: state.cameraHeight
        },

        frameRate: {
          ideal: state.cameraFps
        },

        facingMode:
          state.cameraDeviceId
            ? undefined
            : state.cameraFacingMode

      },

      audio: false

    };


    if (state.cameraDeviceId) {

      constraints.video.deviceId = {
        exact: state.cameraDeviceId
      };

    }


    const stream =
      await navigator.mediaDevices.getUserMedia(
        constraints
      );


    state.cameraStream = stream;

    mentorCameraVideo.srcObject = stream;

    mentorCameraVideo.muted = true;

    mentorCameraVideo.playsInline = true;

    await mentorCameraVideo.play();


    state.mentorMode = "camera";


    mentorVideo.style.display = "none";
    mentorCameraVideo.style.display = "block";


    if (state.aiBackgroundMode === "original") {

      mentorAICanvas.style.display = "none";

    } else {

      mentorAICanvas.style.display = "block";

      initializeSegmentation();

    }


    mentorPlaceholder.style.display = "none";

    mentorSourceLabel.textContent =
      state.aiBackgroundMode === "original"
        ? "Live Camera"
        : "AI Camera";


    updateCameraStatus(true);

    await enumerateCameras();

    initializeMic();

    renderCompositionFrame();


    showToast(
      "Camera started.",
      "success"
    );

  } catch (error) {

    console.error(
      "Camera error:",
      error
    );

    updateCameraStatus(false);

    showToast(
      getCameraErrorMessage(error),
      "error"
    );

  }

}


/* =========================================================
   CAMERA ERROR MESSAGE
========================================================= */

function getCameraErrorMessage(error) {

  if (!error) {
    return "Camera could not be started.";
  }


  if (error.name === "NotAllowedError") {

    return "Camera permission was denied.";

  }


  if (error.name === "NotFoundError") {

    return "No camera device was found.";

  }


  if (error.name === "NotReadableError") {

    return "Camera is already being used by another app.";

  }


  if (error.name === "OverconstrainedError") {

    return "Selected camera settings are not supported.";

  }


  return "Unable to start camera.";

}


/* =========================================================
   STOP CAMERA
========================================================= */

function stopCamera(showMessage = true) {

  if (state.cameraStream) {

    state.cameraStream
      .getTracks()
      .forEach(track => track.stop());

  }


  state.cameraStream = null;

  mentorCameraVideo.srcObject = null;

  mentorCameraVideo.style.display = "none";


  if (state.mentorMode === "camera") {

    state.mentorMode = "none";

  }


  if (
    state.mentorMode === "none"
  ) {

    mentorPlaceholder.style.display =
      "flex";

    mentorSourceLabel.textContent =
      "Mentor";

  }


  updateCameraStatus(false);

  renderCompositionFrame();


  if (showMessage) {

    showToast(
      "Camera stopped.",
      "info"
    );

  }

}


/* =========================================================
   SWITCH CAMERA
========================================================= */

async function switchCamera() {

  state.cameraFacingMode =
    state.cameraFacingMode === "user"
      ? "environment"
      : "user";


  state.cameraDeviceId = "";

  const select = $("cameraDeviceSelect");

  if (select) {
    select.value = "";
  }


  await startCamera();

}


/* =========================================================
   CAMERA STATUS
========================================================= */

function updateCameraStatus(active) {

  const status = $("cameraStatus");
  const light = $("cameraStatusLight");
  const indicator = $("cameraIndicator");


  if (status) {

    status.textContent =
      active
        ? "Camera active"
        : "Camera inactive";

  }


  if (light) {

    light.classList.toggle(
      "active",
      active
    );

  }


  if (indicator) {

    indicator.classList.toggle(
      "active",
      active
    );

    indicator.textContent =
      active
        ? "Camera"
        : "Camera Off";

  }

}


/* =========================================================
   ENUMERATE CAMERAS
========================================================= */

async function enumerateCameras() {

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.enumerateDevices
  ) {

    return;

  }


  try {

    const devices =
      await navigator.mediaDevices.enumerateDevices();


    const cameras =
      devices.filter(
        device =>
          device.kind === "videoinput"
      );


    const select =
      $("cameraDeviceSelect");


    if (!select) {
      return;
    }


    const currentValue =
      state.cameraDeviceId;


    select.innerHTML = "";


    const defaultOption =
      document.createElement("option");

    defaultOption.value = "";

    defaultOption.textContent =
      "Default Camera";

    select.appendChild(
      defaultOption
    );


    cameras.forEach(
      (camera, index) => {

        const option =
          document.createElement("option");

        option.value =
          camera.deviceId;

        option.textContent =
          camera.label ||
          `Camera ${index + 1}`;

        select.appendChild(
          option
        );

      }
    );


    select.value =
      currentValue;

  } catch (error) {

    console.warn(
      "Could not enumerate cameras:",
      error
    );

  }

}


/* =========================================================
   AI INITIALIZATION
========================================================= */

function initializeAI() {

  const buttons = {

    bgOriginalBtn: "original",
    bgRemoveBtn: "remove",
    bgBlurBtn: "blur",
    bgImageBtn: "image",
    bgColorBtn: "color"

  };


  Object.entries(buttons)
    .forEach(
      ([id, mode]) => {

        const button = $(id);

        if (!button) {
          return;
        }


        button.addEventListener(
          "click",
          () => {

            setAIBackgroundMode(
              mode
            );

          }
        );

      }
    );


  const colorInput =
    $("backgroundColor");


  if (colorInput) {

    colorInput.addEventListener(
      "input",
      () => {

        if (
          state.aiBackgroundMode ===
          "color"
        ) {

          renderCompositionFrame();

        }

      }
    );

  }

}


/* =========================================================
   SET AI BACKGROUND MODE
========================================================= */

function setAIBackgroundMode(mode) {

  state.aiBackgroundMode = mode;


  qsa(".ai-btn")
    .forEach(
      button =>
        button.classList.remove(
          "active"
        )
    );


  const buttonMap = {

    original: "bgOriginalBtn",
    remove: "bgRemoveBtn",
    blur: "bgBlurBtn",
    image: "bgImageBtn",
    color: "bgColorBtn"

  };


  $(buttonMap[mode])
    ?.classList.add("active");


  if (mode === "image") {

    if (!state.backgroundImage) {

      $("backgroundImageUpload")?.click();

      return;

    }

  }


  if (mode !== "original") {

    initializeSegmentation();

    mentorAICanvas.style.display =
      "block";

  } else {

    mentorAICanvas.style.display =
      "none";

  }


  if (state.cameraStream) {

    mentorSourceLabel.textContent =
      mode === "original"
        ? "Live Camera"
        : "AI Camera";

  }


  renderCompositionFrame();

}


/* =========================================================
   MEDIAPIPE SEGMENTATION
========================================================= */

function initializeSegmentation() {

  if (state.selfieSegmentation) {
    return;
  }


  if (
    typeof SelfieSegmentation ===
    "undefined"
  ) {

    showToast(
      "AI background engine is unavailable.",
      "error"
    );

    return;

  }


  try {

    state.selfieSegmentation =
      new SelfieSegmentation({

        locateFile: file =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`

      });


    state.selfieSegmentation.setOptions({

      modelSelection: 1

    });


    state.selfieSegmentation.onResults(
      handleSegmentationResults
    );

  } catch (error) {

    console.error(error);

    showToast(
      "Could not initialize AI background.",
      "error"
    );

  }

}


/* =========================================================
   SEGMENTATION LOOP
========================================================= */

async function processSegmentation() {

  if (
    !state.selfieSegmentation ||
    state.aiProcessing ||
    !state.cameraStream ||
    mentorCameraVideo.readyState < 2
  ) {

    return;

  }


  state.aiProcessing = true;


  try {

    await state.selfieSegmentation.send({
      image: mentorCameraVideo
    });

  } catch (error) {

    console.warn(
      "Segmentation error:",
      error
    );

  }


  state.aiProcessing = false;

}


/* =========================================================
   SEGMENTATION RESULTS
========================================================= */

function handleSegmentationResults(results) {

  if (
    !results ||
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
    360;


  if (
    mentorAICanvas.width !== width ||
    mentorAICanvas.height !== height
  ) {

    mentorAICanvas.width = width;
    mentorAICanvas.height = height;

  }


  const ctx =
    mentorAICanvas.getContext(
      "2d",
      {
        willReadFrequently: true
      }
    );


  if (!ctx) {
    return;
  }


  const mode =
    state.aiBackgroundMode;


  /* ---------------------------------------------
     ORIGINAL
  --------------------------------------------- */

  if (mode === "original") {

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

    return;

  }


  /* ---------------------------------------------
     Temporary source canvas
  --------------------------------------------- */

  const sourceCanvas =
    $("aiSourceCanvas");

  const maskCanvas =
    $("aiMaskCanvas");


  sourceCanvas.width = width;
  sourceCanvas.height = height;

  maskCanvas.width = width;
  maskCanvas.height = height;


  const sourceCtx =
    sourceCanvas.getContext(
      "2d",
      {
        willReadFrequently: true
      }
    );

  const maskCtx =
    maskCanvas.getContext(
      "2d",
      {
        willReadFrequently: true
      }
    );


  sourceCtx.clearRect(
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


  sourceCtx.drawImage(
    results.image,
    0,
    0,
    width,
    height
  );


  maskCtx.drawImage(
    results.segmentationMask,
    0,
    0,
    width,
    height
  );


  /* ---------------------------------------------
     Background first
  --------------------------------------------- */

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
      sourceCanvas,
      -14,
      -14,
      width + 28,
      height + 28
    );

    ctx.restore();

  }


  if (mode === "image") {

    if (state.backgroundImage) {

      ctx.drawImage(
        state.backgroundImage,
        0,
        0,
        width,
        height
      );

    } else {

      ctx.fillStyle =
        "#111827";

      ctx.fillRect(
        0,
        0,
        width,
        height
      );

    }

  }


  if (mode === "color") {

    ctx.fillStyle =
      $("backgroundColor")?.value ||
      "#111827";

    ctx.fillRect(
      0,
      0,
      width,
      height
    );

  }


  if (mode === "remove") {

    /*
      Transparent background.
      Canvas is already clear.
    */

  }


  /* ---------------------------------------------
     Isolate person using mask
  --------------------------------------------- */

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


  const isolated =
    new ImageData(
      width,
      height
    );


  for (
    let i = 0;
    i < sourceData.data.length;
    i += 4
  ) {

    const maskValue =
      maskData.data[i] / 255;


    /*
      Soft threshold.

      This prevents hard jagged edges
      and keeps the person visible.
    */

    let alpha =
      (maskValue - 0.15) / 0.65;


    alpha =
      Math.max(
        0,
        Math.min(
          1,
          alpha
        )
      );


    isolated.data[i] =
      sourceData.data[i];

    isolated.data[i + 1] =
      sourceData.data[i + 1];

    isolated.data[i + 2] =
      sourceData.data[i + 2];

    isolated.data[i + 3] =
      Math.round(
        alpha * 255
      );

  }


  /*
    Draw isolated person over background.
  */

  ctx.putImageData(
    isolated,
    0,
    0
  );

}


/* =========================================================
   BACKGROUND IMAGE
========================================================= */

function loadBackgroundImage(file) {

  if (!file.type.startsWith("image/")) {

    showToast(
      "Please select an image.",
      "error"
    );

    return;
  }


  const url =
    URL.createObjectURL(file);


  const image =
    new Image();


  image.onload = () => {

    state.backgroundImage =
      image;

    setAIBackgroundMode(
      "image"
    );

    URL.revokeObjectURL(url);

    showToast(
      "Background image loaded.",
      "success"
    );

  };


  image.onerror = () => {

    URL.revokeObjectURL(url);

    showToast(
      "Could not load background image.",
      "error"
    );

  };


  image.src = url;

}


/* =========================================================
   CONTINUOUS AI LOOP
========================================================= */

function aiLoop() {

  if (
    state.cameraStream &&
    state.aiBackgroundMode !== "original"
  ) {

    processSegmentation();

  }


  requestAnimationFrame(
    aiLoop
  );

}


aiLoop();


/* =========================================================
   MEDIA EVENTS
========================================================= */

function initializeMediaEvents() {

  mainVideo.addEventListener(
    "play",
    () => {

      renderCompositionFrame();

    }
  );


  mainVideo.addEventListener(
    "pause",
    () => {

      renderCompositionFrame();

    }
  );


  mainVideo.addEventListener(
    "timeupdate",
    () => {

      renderCompositionFrame();

    }
  );


  mainVideo.addEventListener(
    "loadedmetadata",
    () => {

      renderCompositionFrame();

    }
  );


  mentorVideo.addEventListener(
    "play",
    () => {

      renderCompositionFrame();

    }
  );


  mentorVideo.addEventListener(
    "timeupdate",
    () => {

      renderCompositionFrame();

    }
  );


  mentorCameraVideo.addEventListener(
    "loadedmetadata",
    () => {

      renderCompositionFrame();

    }
  );


  screenCaptureVideo.addEventListener(
    "play",
    () => {

      renderCompositionFrame();

    }
  );


  screenCaptureVideo.addEventListener(
    "timeupdate",
    () => {

      renderCompositionFrame();

    }
  );

}


/* =========================================================
   COMPOSITION CANVAS
========================================================= */

function initializeCompositionCanvas() {

  state.compositionCanvas =
    document.createElement(
      "canvas"
    );


  state.compositionCanvas.width =
    1920;

  state.compositionCanvas.height =
    1080;


  state.compositionContext =
    state.compositionCanvas.getContext(
      "2d"
    );

}


/* =========================================================
   RESIZE COMPOSITION
========================================================= */

function setCompositionResolution(
  width,
  height
) {

  state.compositionCanvas.width =
    width;

  state.compositionCanvas.height =
    height;

}


/* =========================================================
   DRAW MAIN MEDIA
========================================================= */

function drawMainMedia(
  ctx,
  width,
  height
) {

  ctx.fillStyle =
    "#05080d";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  let source = null;


  if (
    state.screenCaptureActive &&
    screenCaptureVideo.readyState >= 2
  ) {

    source =
      screenCaptureVideo;

  } else if (
    state.mainMode === "video" &&
    mainVideo.readyState >= 2
  ) {

    source =
      mainVideo;

  } else if (
    state.mainMode === "image" &&
    mainImage.complete &&
    mainImage.naturalWidth
  ) {

    source =
      mainImage;

  }


  if (!source) {
    return;
  }


  drawContain(
    ctx,
    source,
    0,
    0,
    width,
    height
  );

}


/* =========================================================
   DRAW CONTAIN
========================================================= */

function drawContain(
  ctx,
  source,
  x,
  y,
  width,
  height
) {

  const sourceWidth =
    source.videoWidth ||
    source.naturalWidth ||
    source.width;

  const sourceHeight =
    source.videoHeight ||
    source.naturalHeight ||
    source.height;


  if (
    !sourceWidth ||
    !sourceHeight
  ) {

    return;

  }


  const sourceRatio =
    sourceWidth /
    sourceHeight;


  const targetRatio =
    width /
    height;


  let drawWidth;
  let drawHeight;
  let drawX;
  let drawY;


  if (
    sourceRatio >
    targetRatio
  ) {

    drawWidth =
      width;

    drawHeight =
      width /
      sourceRatio;

    drawX =
      x;

    drawY =
      y +
      (
        height -
        drawHeight
      ) / 2;

  } else {

    drawHeight =
      height;

    drawWidth =
      height *
      sourceRatio;

    drawX =
      x +
      (
        width -
        drawWidth
      ) / 2;

    drawY =
      y;

  }


  ctx.drawImage(
    source,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );

}


/* =========================================================
   DRAW MENTOR
========================================================= */

function drawMentorOverlay(
  ctx,
  width,
  height
) {

  if (
    state.mentorMode ===
    "none"
  ) {

    return;

  }


  let source = null;


  if (
    state.mentorMode === "camera"
  ) {

    if (
      state.aiBackgroundMode ===
      "original"
    ) {

      source =
        mentorCameraVideo;

    } else {

      source =
        mentorAICanvas;

    }

  }


  if (
    state.mentorMode === "video"
  ) {

    source =
      mentorVideo;

  }


  if (!source) {
    return;
  }


  const x =
    state.mentorX *
    width;

  const y =
    state.mentorY *
    height;

  const w =
    state.mentorWidth *
    width;

  const h =
    state.mentorHeight *
    height;


  ctx.save();

  ctx.beginPath();

  roundRectPath(
    ctx,
    x,
    y,
    w,
    h,
    18
  );

  ctx.clip();


  ctx.fillStyle =
    "#000";

  ctx.fillRect(
    x,
    y,
    w,
    h
  );


  drawCover(
    ctx,
    source,
    x,
    y,
    w,
    h
  );


  ctx.restore();


  /* Border */

  ctx.save();

  ctx.strokeStyle =
    "rgba(255,255,255,.22)";

  ctx.lineWidth =
    Math.max(
      2,
      width / 960
    );


  roundRectPath(
    ctx,
    x,
    y,
    w,
    h,
    18
  );


  ctx.stroke();

  ctx.restore();

}


/* =========================================================
   DRAW COVER
========================================================= */

function drawCover(
  ctx,
  source,
  x,
  y,
  width,
  height
) {

  const sourceWidth =
    source.videoWidth ||
    source.naturalWidth ||
    source.width;

  const sourceHeight =
    source.videoHeight ||
    source.naturalHeight ||
    source.height;


  if (
    !sourceWidth ||
    !sourceHeight
  ) {

    return;

  }


  const sourceRatio =
    sourceWidth /
    sourceHeight;

  const targetRatio =
    width /
    height;


  let drawWidth;
  let drawHeight;
  let drawX;
  let drawY;


  if (
    sourceRatio >
    targetRatio
  ) {

    drawHeight =
      height;

    drawWidth =
      height *
      sourceRatio;

    drawX =
      x +
      (
        width -
        drawWidth
      ) / 2;

    drawY =
      y;

  } else {

    drawWidth =
      width;

    drawHeight =
      width /
      sourceRatio;

    drawX =
      x;

    drawY =
      y +
      (
        height -
        drawHeight
      ) / 2;

  }


  ctx.drawImage(
    source,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );

}


/* =========================================================
   ROUND RECT
========================================================= */

function roundRectPath(
  ctx,
  x,
  y,
  width,
  height,
  radius
) {

  const r =
    Math.min(
      radius,
      width / 2,
      height / 2
    );


  ctx.beginPath();

  ctx.moveTo(
    x + r,
    y
  );

  ctx.arcTo(
    x + width,
    y,
    x + width,
    y + height,
    r
  );

  ctx.arcTo(
    x + width,
    y + height,
    x,
    y + height,
    r
  );

  ctx.arcTo(
    x,
    y + height,
    x,
    y,
    r
  );

  ctx.arcTo(
    x,
    y,
    x + width,
    y,
    r
  );

  ctx.closePath();

}


/* =========================================================
   RECORDING TELEPROMPTER
========================================================= */

function drawRecordingTeleprompter(
  ctx,
  width,
  height
) {

  if (
    !state.includeTeleprompterInRecording
  ) {

    return;

  }


  if (
    !state.showTeleprompterRecording
  ) {

    return;

  }


  if (
    !state.teleprompterText.trim()
  ) {

    return;

  }


  const padding =
    width * 0.035;

  const boxHeight =
    height * 0.20;


  ctx.save();


  ctx.fillStyle =
    `rgba(0,0,0,${
      state.teleprompterOpacity /
      100
    })`;


  roundRectPath(
    ctx,
    padding,
    height -
      boxHeight -
      padding,
    width -
      padding * 2,
    boxHeight,
    18
  );


  ctx.fill();


  ctx.clip();


  ctx.fillStyle =
    "#ffffff";


  ctx.font =
    `${state.teleprompterFontSize *
      (width / 1920)}px Arial`;


  ctx.textAlign =
    "center";


  ctx.textBaseline =
    "middle";


  const text =
    state.teleprompterText;


  const maxWidth =
    width -
    padding * 3;


  const lines =
    wrapText(
      ctx,
      text,
      maxWidth
    );


  const lineHeight =
    state.teleprompterFontSize *
    (width / 1920) *
    1.4;


  let startY =
    height -
    boxHeight -
    padding +
    35;


  lines
    .slice(0, 6)
    .forEach(
      line => {

        ctx.fillText(
          line,
          width / 2,
          startY
        );

        startY +=
          lineHeight;

      }
    );


  ctx.restore();

}


/* =========================================================
   WRAP TEXT
========================================================= */

function wrapText(
  ctx,
  text,
  maxWidth
) {

  const words =
    text.split(/\s+/);

  const lines = [];

  let current =
    "";


  words.forEach(
    word => {

      const test =
        current
          ? `${current} ${word}`
          : word;


      const measurement =
        ctx.measureText(test);


      if (
        measurement.width >
        maxWidth &&
        current
      ) {

        lines.push(
          current
        );

        current =
          word;

      } else {

        current =
          test;

      }

    }
  );


  if (current) {
    lines.push(current);
  }


  return lines;

}


/* =========================================================
   RECORDING OVERLAY
========================================================= */

function drawRecordingOverlay(
  ctx,
  width,
  height
) {

  if (
    !state.recordingActive
  ) {

    return;

  }


  const x =
    width * 0.03;

  const y =
    height * 0.035;


  ctx.save();


  ctx.fillStyle =
    "rgba(0,0,0,.68)";


  roundRectPath(
    ctx,
    x,
    y,
    width * 0.15,
    height * 0.05,
    12
  );


  ctx.fill();


  ctx.fillStyle =
    "#ff3b30";


  ctx.beginPath();

  ctx.arc(
    x + width * 0.02,
    y + height * 0.025,
    width * 0.006,
    0,
    Math.PI * 2
  );

  ctx.fill();


  ctx.fillStyle =
    "#ffffff";


  ctx.font =
    `600 ${width * 0.013}px Arial`;

  ctx.textBaseline =
    "middle";


  ctx.fillText(
    "REC",
    x + width * 0.035,
    y + height * 0.025
  );


  ctx.fillText(
    formatRecordingTime(
      getRecordingElapsed()
    ),
    x + width * 0.085,
    y + height * 0.025
  );


  ctx.restore();

}


/* =========================================================
   RENDER COMPOSITION FRAME
========================================================= */

function renderCompositionFrame() {

  const canvas =
    state.compositionCanvas;

  const ctx =
    state.compositionContext;


  if (!canvas || !ctx) {
    return;
  }


  const width =
    canvas.width;

  const height =
    canvas.height;


  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  drawMainMedia(
    ctx,
    width,
    height
  );


  drawMentorOverlay(
    ctx,
    width,
    height
  );


  drawRecordingTeleprompter(
    ctx,
    width,
    height
  );


  drawRecordingOverlay(
    ctx,
    width,
    height
  );


  state.lastRenderTime =
    performance.now();

}


/* =========================================================
   CONTINUOUS COMPOSITION LOOP
========================================================= */

function startCompositionLoop() {

  if (state.compositionRunning) {
    return;
  }


  state.compositionRunning =
    true;


  function loop() {

    if (
      !state.compositionRunning
    ) {

      return;

    }


    renderCompositionFrame();


    state.recordingAnimationFrame =
      requestAnimationFrame(
        loop
      );

  }


  loop();

}


/* =========================================================
   STOP COMPOSITION LOOP
========================================================= */

function stopCompositionLoop() {

  state.compositionRunning =
    false;


  if (
    state.recordingAnimationFrame
  ) {

    cancelAnimationFrame(
      state.recordingAnimationFrame
    );

  }

}


/* =========================================================
   MENTOR DRAG + RESIZE
========================================================= */

function initializeMentorInteraction() {

  if (!mentorCard) {
    return;
  }


  mentorCard.addEventListener(
    "pointerdown",
    handleMentorPointerDown
  );


  mentorResize?.addEventListener(
    "pointerdown",
    handleMentorResizeDown
  );


  window.addEventListener(
    "pointermove",
    handleMentorPointerMove
  );


  window.addEventListener(
    "pointerup",
    handleMentorPointerUp
  );

}


/* =========================================================
   MENTOR DRAG START
========================================================= */

function handleMentorPointerDown(event) {

  if (
    event.target ===
    mentorResize
  ) {

    return;

  }


  state.mentorDragging =
    true;


  mentorCard.setPointerCapture?.(
    event.pointerId
  );


  state.dragStartX =
    event.clientX;

  state.dragStartY =
    event.clientY;

  state.dragOriginX =
    state.mentorX;

  state.dragOriginY =
    state.mentorY;


  mentorCard.classList.add(
    "dragging"
  );

}


/* =========================================================
   MENTOR RESIZE START
========================================================= */

function handleMentorResizeDown(event) {

  event.preventDefault();

  event.stopPropagation();


  state.mentorResizing =
    true;


  state.resizeStartX =
    event.clientX;

  state.resizeStartY =
    event.clientY;


  state.resizeOriginWidth =
    state.mentorWidth;

  state.resizeOriginHeight =
    state.mentorHeight;


  mentorCard.classList.add(
    "resizing"
  );

}


/* =========================================================
   MENTOR POINTER MOVE
========================================================= */

function handleMentorPointerMove(event) {

  if (
    state.mentorDragging
  ) {

    const stageRect =
      stage.getBoundingClientRect();


    if (
      !stageRect.width ||
      !stageRect.height
    ) {

      return;

    }


    const deltaX =
      (
        event.clientX -
        state.dragStartX
      ) /
      stageRect.width;


    const deltaY =
      (
        event.clientY -
        state.dragStartY
      ) /
      stageRect.height;


    state.mentorX =
      clamp(
        state.dragOriginX +
        deltaX,
        0,
        1 -
        state.mentorWidth
      );


    state.mentorY =
      clamp(
        state.dragOriginY +
        deltaY,
        0,
        1 -
        state.mentorHeight
      );


    applyMentorDOMPosition();

    renderCompositionFrame();

  }


  if (
    state.mentorResizing
  ) {

    const stageRect =
      stage.getBoundingClientRect();


    if (
      !stageRect.width ||
      !stageRect.height
    ) {

      return;

    }


    const deltaX =
      (
        event.clientX -
        state.resizeStartX
      ) /
      stageRect.width;


    let newWidth =
      state.resizeOriginWidth +
      deltaX;


    newWidth =
      clamp(
        newWidth,
        0.10,
        0.45
      );


    state.mentorWidth =
      newWidth;


    state.mentorHeight =
      newWidth *
      (9 / 16);


    state.mentorX =
      clamp(
        state.mentorX,
        0,
        1 -
        state.mentorWidth
      );


    state.mentorY =
      clamp(
        state.mentorY,
        0,
        1 -
        state.mentorHeight
      );


    applyMentorDOMPosition();

    renderCompositionFrame();

  }

}


/* =========================================================
   MENTOR POINTER UP
========================================================= */

function handleMentorPointerUp() {

  state.mentorDragging =
    false;

  state.mentorResizing =
    false;


  mentorCard.classList.remove(
    "dragging",
    "resizing"
  );

}


/* =========================================================
   APPLY MENTOR DOM POSITION
========================================================= */

function applyMentorDOMPosition() {

  if (!stage) {
    return;
  }


  mentorCard.style.left =
    `${state.mentorX * 100}%`;

  mentorCard.style.top =
    `${state.mentorY * 100}%`;

  mentorCard.style.right =
    "auto";

  mentorCard.style.bottom =
    "auto";

  mentorCard.style.width =
    `${state.mentorWidth * 100}%`;

  mentorCard.style.height =
    `${state.mentorHeight * 100}%`;

}


/* =========================================================
   AUDIO ENGINE
========================================================= */

function initializeAudioEngine() {

  const AudioContextClass =
    window.AudioContext ||
    window.webkitAudioContext;


  if (!AudioContextClass) {

    console.warn(
      "Web Audio API unavailable."
    );

    return;

  }


  try {

    state.audioContext =
      new AudioContextClass();


    state.audioDestination =
      state.audioContext.createMediaStreamDestination();


  } catch (error) {

    console.error(error);

  }

}


/* =========================================================
   ENSURE AUDIO CONTEXT
========================================================= */

async function ensureAudioContext() {

  if (!state.audioContext) {

    initializeAudioEngine();

  }


  if (
    state.audioContext &&
    state.audioContext.state ===
    "suspended"
  ) {

    try {

      await state.audioContext.resume();

    } catch (error) {

      console.warn(
        error
      );

    }

  }

}


/* =========================================================
   AUDIO CONTROLS
========================================================= */

function initializeAudioControls() {

  const mainCheckbox =
    $("mainVideoAudioCheckbox");

  const mainVolume =
    $("mainVideoVolume");

  const micVolume =
    $("micVolume");

  const micEnabled =
    $("micEnabled");

  const micMonitor =
    $("micMonitor");


  if (mainCheckbox) {

    mainCheckbox.addEventListener(
      "change",
      async event => {

        state.mainAudioEnabled =
          event.target.checked;

        await ensureMainAudioNode();

      }
    );

  }


  if (mainVolume) {

    mainVolume.addEventListener(
      "input",
      async event => {

        state.mainVolume =
          Number(
            event.target.value
          ) / 100;


        $("mainVolumeValue").textContent =
          `${Math.round(
            state.mainVolume * 100
          )}%`;


        if (
          state.mainGainNode
        ) {

          state.mainGainNode.gain.value =
            state.mainAudioEnabled
              ? state.mainVolume
              : 0;

        }

      }
    );

  }


  if (micVolume) {

    micVolume.addEventListener(
      "input",
      event => {

        state.micVolume =
          Number(
            event.target.value
          ) / 100;


        $("micVolumeValue").textContent =
          `${Math.round(
            state.micVolume * 100
          )}%`;


        if (
          state.micGainNode
        ) {

          state.micGainNode.gain.value =
            state.micEnabled
              ? state.micVolume
              : 0;

        }

      }
    );

  }


  if (micEnabled) {

    micEnabled.addEventListener(
      "change",
      event => {

        state.micEnabled =
          event.target.checked;


        window.CourseStudioMicEnabled =
          state.micEnabled;


        if (
          state.micGainNode
        ) {

          state.micGainNode.gain.value =
            state.micEnabled
              ? state.micVolume
              : 0;

        }

      }
    );

  }


  if (micMonitor) {

    micMonitor.addEventListener(
      "change",
      event => {

        state.micMonitor =
          event.target.checked;


        window.CourseStudioMicMonitor =
          state.micMonitor;


        updateMicMonitoring();

      }
    );

  }


  window.CourseStudioMicVolume =
    state.micVolume;

}


/* =========================================================
   MAIN VIDEO AUDIO NODE
========================================================= */

async function ensureMainAudioNode() {

  if (
    !mainVideo.src
  ) {

    return;

  }


  await ensureAudioContext();


  if (
    !state.audioContext ||
    !state.audioDestination
  ) {

    return;

  }


  if (
    state.mainSourceNode
  ) {

    if (
      state.mainGainNode
    ) {

      state.mainGainNode.gain.value =
        state.mainAudioEnabled
          ? state.mainVolume
          : 0;

    }

    return;

  }


  try {

    state.mainSourceNode =
      state.audioContext.createMediaElementSource(
        mainVideo
      );


    state.mainGainNode =
      state.audioContext.createGain();


    state.mainAnalyser =
      state.audioContext.createAnalyser();


    state.mainAnalyser.fftSize =
      2048;


    state.mainGainNode.gain.value =
      state.mainAudioEnabled
        ? state.mainVolume
        : 0;


    state.mainSourceNode.connect(
      state.mainGainNode
    );


    state.mainGainNode.connect(
      state.audioContext.destination
    );


    state.mainGainNode.connect(
      state.mainAnalyser
    );


    state.mainAnalyser.connect(
      state.audioDestination
    );

  } catch (error) {

    console.warn(
      "Main audio node error:",
      error
    );

  }

}


/* =========================================================
   MICROPHONE
========================================================= */

async function initializeMic() {

  if (
    state.micStream
  ) {

    return state.micStream;

  }


  try {

    await ensureAudioContext();


    state.micStream =
      await navigator.mediaDevices.getUserMedia({

        audio: {

          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true

        },

        video: false

      });


    state.micSourceNode =
      state.audioContext.createMediaStreamSource(
        state.micStream
      );


    state.micGainNode =
      state.audioContext.createGain();


    state.micAnalyser =
      state.audioContext.createAnalyser();


    state.micAnalyser.fftSize =
      2048;


    state.micGainNode.gain.value =
      state.micEnabled
        ? state.micVolume
        : 0;


    state.micSourceNode.connect(
      state.micGainNode
    );


    state.micGainNode.connect(
      state.audioDestination
    );


    state.micGainNode.connect(
      state.micAnalyser
    );


    updateMicMonitoring();

    updateMicStatus(
      "Microphone ready"
    );


    return state.micStream;

  } catch (error) {

    console.warn(
      "Microphone error:",
      error
    );


    updateMicStatus(
      "Mic unavailable"
    );


    return null;

  }

}


/* =========================================================
   MIC MONITOR
========================================================= */

function updateMicMonitoring() {

  if (
    !state.audioContext ||
    !state.micGainNode
  ) {

    return;

  }


  try {

    state.micGainNode.disconnect();

  } catch (_) {}


  state.micGainNode.connect(
    state.audioDestination
  );


  if (
    state.micMonitor
  ) {

    state.micGainNode.connect(
      state.audioContext.destination
    );

  }

}


/* =========================================================
   MIC STATUS
========================================================= */

function updateMicStatus(text) {

  qsa("[data-mic-status]")
    .forEach(
      element => {

        element.textContent =
          text;

      }
    );


  const indicator =
    $("micIndicator");


  if (indicator) {

    indicator.textContent =
      text === "Microphone ready"
        ? "Mic"
        : "Mic Off";


    indicator.classList.toggle(
      "active",
      text === "Microphone ready"
    );

  }

}


/* =========================================================
   AUDIO METERS
========================================================= */

function updateAudioMeters() {

  updateAnalyserMeter(
    state.micAnalyser,
    $("micLevelBar"),
    $("micLevelValue")
  );


  updateAnalyserMeter(
    state.mainAnalyser,
    $("mainAudioLevelBar"),
    $("mainAudioLevelValue")
  );


  drawMicWaveform();

  requestAnimationFrame(
    updateAudioMeters
  );

}


function updateAnalyserMeter(
  analyser,
  bar,
  valueElement
) {

  if (
    !analyser ||
    !bar
  ) {

    if (bar) {
      bar.style.width = "0%";
    }

    if (valueElement) {
      valueElement.textContent =
        "0%";
    }

    return;

  }


  const data =
    new Uint8Array(
      analyser.fftSize
    );


  analyser.getByteTimeDomainData(
    data
  );


  let sum = 0;


  for (
    let i = 0;
    i < data.length;
    i++
  ) {

    const normalized =
      (
        data[i] -
        128
      ) / 128;


    sum +=
      normalized *
      normalized;

  }


  const rms =
    Math.sqrt(
      sum /
      data.length
    );


  const level =
    clamp(
      rms * 220,
      0,
      100
    );


  bar.style.width =
    `${level}%`;


  if (valueElement) {

    valueElement.textContent =
      `${Math.round(level)}%`;

  }

}


updateAudioMeters();


/* =========================================================
   MICROPHONE WAVEFORM
========================================================= */

function drawMicWaveform() {

  const canvas =
    $("micWaveformCanvas");


  if (!canvas) {
    return;
  }


  const ctx =
    canvas.getContext("2d");


  const width =
    canvas.width;

  const height =
    canvas.height;


  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  ctx.fillStyle =
    "rgba(255,255,255,.025)";


  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  if (
    !state.micAnalyser
  ) {

    return;

  }


  const data =
    new Uint8Array(
      state.micAnalyser.fftSize
    );


  state.micAnalyser.getByteTimeDomainData(
    data
  );


  ctx.beginPath();


  const sliceWidth =
    width /
    data.length;


  let x = 0;


  for (
    let i = 0;
    i < data.length;
    i++
  ) {

    const v =
      data[i] / 128;


    const y =
      v *
      height /
      2;


    if (i === 0) {

      ctx.moveTo(
        x,
        y
      );

    } else {

      ctx.lineTo(
        x,
        y
      );

    }


    x += sliceWidth;

  }


  ctx.strokeStyle =
    "rgba(93,173,255,.9)";

  ctx.lineWidth =
    2;


  ctx.stroke();

}


/* =========================================================
   RECORDING SYSTEM
========================================================= */

function initializeRecordingSystem() {

  bindClick(
    "pauseRecordingBtn",
    pauseRecording
  );

  bindClick(
    "resumeRecordingBtn",
    resumeRecording
  );

  bindClick(
    "stopRecordingBtn",
    stopRecording
  );


  const quality =
    $("recordingQualitySide");

  const fps =
    $("recordingFpsSide");

  const format =
    $("recordingFormatSide");

  const filename =
    $("recordingFileNameSide");

  const teleprompter =
    $("includeTeleprompterInRecording");


  if (quality) {

    quality.addEventListener(
      "change",
      () => {

        updateRecordingSettings();

      }
    );

  }


  if (fps) {

    fps.addEventListener(
      "change",
      () => {

        updateRecordingSettings();

      }
    );

  }


  if (format) {

    format.addEventListener(
      "change",
      () => {

        updateRecordingSettings();

      }
    );

  }


  if (filename) {

    filename.addEventListener(
      "input",
      () => {

        state.recordingFileName =
          sanitizeFileName(
            filename.value
          );

      }
    );

  }


  if (teleprompter) {

    teleprompter.addEventListener(
      "change",
      event => {

        state.includeTeleprompterInRecording =
          event.target.checked;

      }
    );

  }


  bindClick(
    "recordingPreviewPlayBtn",
    () => {
      $("recordingPreviewVideo")?.play();
    }
  );


  bindClick(
    "recordingPreviewPauseBtn",
    () => {
      $("recordingPreviewVideo")?.pause();
    }
  );


  bindClick(
    "applyTrimBtn",
    applyTrimPreview
  );


  bindClick(
    "resetTrimBtn",
    resetTrim
  );


  bindClick(
    "renameRecordingBtn",
    renameCurrentRecording
  );


  bindClick(
    "deleteRecordingBtn",
    deleteCurrentRecording
  );


  bindClick(
    "recordAgainBtn",
    recordAgain
  );


  bindClick(
    "downloadRecordingBtn",
    downloadCurrentRecording
  );


  bindClick(
    "clearRecordingHistoryBtn",
    clearRecordingHistory
  );


  const preview =
    $("recordingPreviewVideo");


  if (preview) {

    preview.addEventListener(
      "loadedmetadata",
      setupTrimControls
    );


    preview.addEventListener(
      "timeupdate",
      updatePreviewTime
    );

  }

}


/* =========================================================
   UPDATE RECORDING SETTINGS
========================================================= */

function updateRecordingSettings() {

  const quality =
    $("recordingQualitySide")?.value ||
    "1920x1080";


  const parts =
    quality.split("x");


  state.recordingWidth =
    Number(parts[0]) || 1920;


  state.recordingHeight =
    Number(parts[1]) || 1080;


  state.recordingFps =
    Number(
      $("recordingFpsSide")?.value ||
      30
    );


  state.recordingFileName =
    sanitizeFileName(
      $("recordingFileNameSide")?.value ||
      "SNK-Course-Recording"
    );


  updateStageBadges();

}


/* =========================================================
   HANDLE RECORD BUTTON
========================================================= */

function handleRecordButton() {

  if (
    state.recordingActive
  ) {

    if (
      state.recordingPaused
    ) {

      resumeRecording();

    } else {

      pauseRecording();

    }


    return;

  }


  startRecording();

}


/* =========================================================
   START RECORDING
========================================================= */

async function startRecording() {

  if (
    state.recordingActive
  ) {

    return;

  }


  try {

    updateRecordingSettings();

    await ensureAudioContext();

    await initializeMic();


    if (
      state.mainMode === "video"
    ) {

      await ensureMainAudioNode();

    }


    if (
      state.autoStartTeleprompter
    ) {

      startTeleprompter();

    }


    setCompositionResolution(
      state.recordingWidth,
      state.recordingHeight
    );


    renderCompositionFrame();


    const canvasStream =
      state.compositionCanvas.captureStream(
        state.recordingFps
      );


    state.recordingCanvasStream =
      canvasStream;


    const combinedTracks = [];


    canvasStream
      .getVideoTracks()
      .forEach(
        track =>
          combinedTracks.push(track)
      );


    if (
      state.audioDestination
    ) {

      state.audioDestination
        .stream
        .getAudioTracks()
        .forEach(
          track =>
            combinedTracks.push(track)
        );

    }


    /*
      Screen capture audio can be added
      when browser provides it.
    */

    if (
      state.screenStream
    ) {

      state.screenStream
        .getAudioTracks()
        .forEach(
          track => {

            /*
              Avoid duplicate audio tracks.
              The normal audio engine remains primary.
            */

          }
        );

    }


    state.recordingStream =
      new MediaStream(
        combinedTracks
      );


    const mimeInfo =
      getSupportedRecordingMime();


    if (!mimeInfo.mimeType) {

      throw new Error(
        "No supported recording format found."
      );

    }


    state.recordingMimeType =
      mimeInfo.mimeType;

    state.recordingExtension =
      mimeInfo.extension;


    state.recordingChunks =
      [];


    state.mediaRecorder =
      new MediaRecorder(
        state.recordingStream,
        {
          mimeType:
            mimeInfo.mimeType,

          videoBitsPerSecond:
            getVideoBitrate(
              state.recordingWidth,
              state.recordingHeight,
              state.recordingFps
            ),

          audioBitsPerSecond:
            128000

        }
      );


    state.mediaRecorder.ondataavailable =
      event => {

        if (
          event.data &&
          event.data.size > 0
        ) {

          state.recordingChunks.push(
            event.data
          );

        }

      };


    state.mediaRecorder.onerror =
      event => {

        console.error(
          "MediaRecorder error:",
          event.error
        );


        showToast(
          "Recording error occurred.",
          "error"
        );

      };


    state.mediaRecorder.onstop =
      handleRecordingStopped;


    state.mediaRecorder.onpause =
      () => {

        state.recordingPaused =
          true;

        updateRecordingUI();

      };


    state.mediaRecorder.onresume =
      () => {

        state.recordingPaused =
          false;

        updateRecordingUI();

      };


    state.mediaRecorder.start(
      1000
    );


    state.recordingActive =
      true;

    state.recordingPaused =
      false;

    state.recordingStartedAt =
      performance.now();

    state.recordingPausedAt =
      0;

    state.recordingAccumulatedPause =
      0;


    startCompositionLoop();

    startRecordingTimer();

    updateRecordingUI();

    showToast(
      "Recording started.",
      "success"
    );

  } catch (error) {

    console.error(
      "Start recording error:",
      error
    );


    cleanupRecordingResources();


    showToast(
      error.message ||
      "Could not start recording.",
      "error"
    );

  }

}


/* =========================================================
   VIDEO BITRATE
========================================================= */

function getVideoBitrate(
  width,
  height,
  fps
) {

  const pixels =
    width *
    height;


  let bitrate;


  if (
    pixels >=
    2560 * 1440
  ) {

    bitrate =
      16000000;

  } else if (
    pixels >=
    1920 * 1080
  ) {

    bitrate =
      10000000;

  } else {

    bitrate =
      6000000;

  }


  if (fps >= 60) {

    bitrate *= 1.25;

  }


  return Math.round(
    bitrate
  );

}


/* =========================================================
   MIME DETECTION
========================================================= */

function getSupportedRecordingMime() {

  const selected =
    $("recordingFormatSide")?.value ||
    "webm-vp9";


  const mp4Types = [

    "video/mp4;codecs=\"avc1.42E01E,mp4a.40.2\"",

    "video/mp4;codecs=\"avc1.4d401f,mp4a.40.2\"",

    "video/mp4"

  ];


  const vp9Types = [

    "video/webm;codecs=vp9,opus",

    "video/webm;codecs=\"vp9,opus\"",

    "video/webm"

  ];


  const vp8Types = [

    "video/webm;codecs=vp8,opus",

    "video/webm;codecs=\"vp8,opus\"",

    "video/webm"

  ];


  let candidates = [];


  if (
    selected === "mp4"
  ) {

    candidates =
      mp4Types.concat(
        vp9Types
      );

  } else if (
    selected === "webm-vp8"
  ) {

    candidates =
      vp8Types.concat(
        vp9Types
      );

  } else {

    candidates =
      vp9Types.concat(
        vp8Types
      );

  }


  for (
    const mimeType of candidates
  ) {

    if (
      MediaRecorder.isTypeSupported(
        mimeType
      )
    ) {

      return {

        mimeType,

        extension:
          mimeType.startsWith(
            "video/mp4"
          )
            ? "mp4"
            : "webm"

      };

    }

  }


  return {

    mimeType: "",
    extension: "webm"

  };

}


/* =========================================================
   PAUSE RECORDING
========================================================= */

function pauseRecording() {

  if (
    !state.mediaRecorder ||
    !state.recordingActive ||
    state.recordingPaused
  ) {

    return;

  }


  try {

    state.mediaRecorder.pause();

    state.recordingPausedAt =
      performance.now();

  } catch (error) {

    console.error(error);

  }

}


/* =========================================================
   RESUME RECORDING
========================================================= */

function resumeRecording() {

  if (
    !state.mediaRecorder ||
    !state.recordingActive ||
    !state.recordingPaused
  ) {

    return;

  }


  try {

    if (
      state.recordingPausedAt
    ) {

      state.recordingAccumulatedPause +=
        performance.now() -
        state.recordingPausedAt;

    }


    state.mediaRecorder.resume();

    state.recordingPausedAt =
      0;

  } catch (error) {

    console.error(error);

  }

}


/* =========================================================
   STOP RECORDING
========================================================= */

function stopRecording() {

  if (
    !state.mediaRecorder ||
    !state.recordingActive
  ) {

    return;

  }


  try {

    state.mediaRecorder.stop();

  } catch (error) {

    console.error(
      "Stop recording error:",
      error
    );

    cleanupRecordingResources();

  }

}


/* =========================================================
   RECORDING STOPPED
========================================================= */

async function handleRecordingStopped() {

  const mimeType =
    state.recordingMimeType ||
    "video/webm";


  const blob =
    new Blob(
      state.recordingChunks,
      {
        type: mimeType
      }
    );


  state.lastRecordingBlob =
    blob;


  if (
    state.lastRecordingURL
  ) {

    URL.revokeObjectURL(
      state.lastRecordingURL
    );

  }


  state.lastRecordingURL =
    URL.createObjectURL(
      blob
    );


  state.lastRecordingMimeType =
    mimeType;


  const duration =
    getRecordingElapsed();


  const name =
    sanitizeFileName(
      state.recordingFileName ||
      "SNK-Course-Recording"
    );


  const record = {

    id:
      createId(),

    name,

    createdAt:
      Date.now(),

    duration,

    size:
      blob.size,

    mimeType,

    width:
      state.recordingWidth,

    height:
      state.recordingHeight,

    fps:
      state.recordingFps

  };


  state.currentRecordingId =
    record.id;


  await saveRecordingToDatabase(
    record,
    blob
  );


  addRecordingToHistoryUI(
    record
  );


  state.recordingActive =
    false;

  state.recordingPaused =
    false;


  stopRecordingTimer();

  stopCompositionLoop();

  updateRecordingUI();


  openRecordingPreview(
    blob,
    record
  );


  cleanupRecordingResources(
    false
  );


  showToast(
    "Recording completed.",
    "success"
  );

}


/* =========================================================
   CLEAN RECORDING RESOURCES
========================================================= */

function cleanupRecordingResources(
  resetBlob = true
) {

  if (
    state.recordingCanvasStream
  ) {

    state.recordingCanvasStream
      .getTracks()
      .forEach(
        track =>
          track.stop()
      );

  }


  if (
    resetBlob
  ) {

    state.recordingChunks =
      [];

  }


  state.recordingCanvasStream =
    null;

  state.recordingStream =
    null;

  state.mediaRecorder =
    null;


  if (
    resetBlob
  ) {

    state.recordingActive =
      false;

    state.recordingPaused =
      false;

  }

}


/* =========================================================
   RECORDING TIMER
========================================================= */

function startRecordingTimer() {

  stopRecordingTimer();


  state.recordingTimerInterval =
    setInterval(
      () => {

        const elapsed =
          getRecordingElapsed();


        const formatted =
          formatRecordingTime(
            elapsed
          );


        const timer =
          $("recordingTimer");


        const overlay =
          $("recordingOverlayTimer");


        if (timer) {
          timer.textContent =
            formatted;
        }


        if (overlay) {
          overlay.textContent =
            formatted;
        }

      },
      250
    );

}


function stopRecordingTimer() {

  if (
    state.recordingTimerInterval
  ) {

    clearInterval(
      state.recordingTimerInterval
    );

  }


  state.recordingTimerInterval =
    null;

}


/* =========================================================
   GET RECORDING ELAPSED
========================================================= */

function getRecordingElapsed() {

  if (
    !state.recordingStartedAt
  ) {

    return 0;

  }


  const now =
    performance.now();


  let elapsed =
    now -
    state.recordingStartedAt -
    state.recordingAccumulatedPause;


  if (
    state.recordingPaused &&
    state.recordingPausedAt
  ) {

    elapsed -=
      now -
      state.recordingPausedAt;

  }


  return Math.max(
    0,
    elapsed / 1000
  );

}


/* =========================================================
   RECORDING UI
========================================================= */

function updateRecordingUI() {

  const statusBar =
    $("recordingStatusBar");

  const statusText =
    $("recordingStatusText");

  const statusDot =
    $("recordingStatusDot");

  const pauseBtn =
    $("pauseRecordingBtn");

  const resumeBtn =
    $("resumeRecordingBtn");

  const stopBtn =
    $("stopRecordingBtn");


  if (
    state.recordingActive
  ) {

    statusBar?.classList.add(
      "recording"
    );


    recordingOverlay?.classList.add(
      "active"
    );


    if (
      state.recordingPaused
    ) {

      statusText.textContent =
        "Paused";


      statusDot?.classList.add(
        "paused"
      );


      pauseBtn?.classList.add(
        "hidden"
      );


      resumeBtn?.classList.remove(
        "hidden"
      );

    } else {

      statusText.textContent =
        "Recording";


      statusDot?.classList.remove(
        "paused"
      );


      pauseBtn?.classList.remove(
        "hidden"
      );


      resumeBtn?.classList.add(
        "hidden"
      );

    }


    stopBtn?.classList.remove(
      "hidden"
    );

  } else {

    statusBar?.classList.remove(
      "recording"
    );


    recordingOverlay?.classList.remove(
      "active"
    );


    statusText.textContent =
      "Ready";


    statusDot?.classList.remove(
      "paused"
    );


    pauseBtn?.classList.add(
      "hidden"
    );


    resumeBtn?.classList.add(
      "hidden"
    );


    stopBtn?.classList.add(
      "hidden"
    );

  }


  const indicator =
    $("audioIndicator");


  if (indicator) {

    indicator.classList.toggle(
      "active",
      !!state.audioDestination
    );

  }

}


/* =========================================================
   RECORDING PREVIEW
========================================================= */

function openRecordingPreview(
  blob,
  record
) {

  const modal =
    $("recordingPreviewModal");

  const video =
    $("recordingPreviewVideo");


  if (!modal || !video) {
    return;
  }


  if (
    video.src
  ) {

    video.pause();

  }


  video.src =
    state.lastRecordingURL;


  video.load();


  $("recordingFileName").value =
    record.name;


  $("recordingNameInput").value =
    record.name;


  $("recordingFileInfo").textContent =
    `${formatBytes(record.size)} • ` +
    `${record.width}×${record.height} • ` +
    `${record.fps} FPS • ` +
    formatRecordingTime(record.duration);


  modal.classList.add(
    "active"
  );


  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  state.trimStart =
    0;

  state.trimEnd =
    record.duration;


  setTimeout(
    setupTrimControls,
    100
  );

}


/* =========================================================
   PREVIEW TIME
========================================================= */

function updatePreviewTime() {

  const video =
    $("recordingPreviewVideo");


  if (!video) {
    return;
  }


  const current =
    video.currentTime || 0;


  $("recordingCurrentTime").textContent =
    formatRecordingTime(
      current
    );


  if (
    state.trimEnd > 0 &&
    current >
    state.trimEnd
  ) {

    video.currentTime =
      state.trimEnd;

  }

}


/* =========================================================
   SETUP TRIM
========================================================= */

function setupTrimControls() {

  const video =
    $("recordingPreviewVideo");


  if (!video) {
    return;
  }


  const duration =
    Number(
      video.duration
    );


  if (
    !Number.isFinite(duration)
  ) {

    return;

  }


  state.trimEnd =
    duration;


  const start =
    $("recordingTrimStart");

  const end =
    $("recordingTrimEnd");


  if (start) {

    start.min =
      "0";

    start.max =
      String(duration);

    start.value =
      String(
        Math.min(
          state.trimStart,
          duration
        )
      );

  }


  if (end) {

    end.min =
      "0";

    end.max =
      String(duration);

    end.value =
      String(
        duration
      );

  }


  updateTrimLabels();

}


/* =========================================================
   TRIM SLIDERS
========================================================= */

function initializeTrimEvents() {

  const start =
    $("recordingTrimStart");

  const end =
    $("recordingTrimEnd");


  if (start) {

    start.addEventListener(
      "input",
      () => {

        let value =
          Number(
            start.value
          );


        if (
          value >=
          state.trimEnd
        ) {

          value =
            Math.max(
              0,
              state.trimEnd -
              0.1
            );

          start.value =
            String(value);

        }


        state.trimStart =
          value;


        updateTrimLabels();

      }
    );

  }


  if (end) {

    end.addEventListener(
      "input",
      () => {

        let value =
          Number(
            end.value
          );


        if (
          value <=
          state.trimStart
        ) {

          value =
            Math.min(
              Number(
                end.max
              ),
              state.trimStart +
              0.1
            );

          end.value =
            String(value);

        }


        state.trimEnd =
          value;


        updateTrimLabels();

      }
    );

  }

}


initializeTrimEvents();


/* =========================================================
   UPDATE TRIM LABELS
========================================================= */

function updateTrimLabels() {

  $("recordingTrimStartTime").textContent =
    formatRecordingTime(
      state.trimStart
    );


  $("recordingTrimEndTime").textContent =
    formatRecordingTime(
      state.trimEnd
    );

}


/* =========================================================
   APPLY TRIM PREVIEW
========================================================= */

function applyTrimPreview() {

  const video =
    $("recordingPreviewVideo");


  if (!video) {
    return;
  }


  const start =
    Number(
      $("recordingTrimStart")?.value ||
      0
    );


  const end =
    Number(
      $("recordingTrimEnd")?.value ||
      video.duration
    );


  if (
    end <= start
  ) {

    showToast(
      "Trim end must be after trim start.",
      "error"
    );

    return;

  }


  state.trimStart =
    start;

  state.trimEnd =
    end;


  video.currentTime =
    start;


  video.play().catch(
    () => {}
  );


  showToast(
    "Trim preview applied.",
    "success"
  );


  /*
    Important:
    Native MediaRecorder does not physically
    cut the existing Blob.

    This applies the trim range to preview.
    True exported trimming requires re-encoding.
  */

}


/* =========================================================
   RESET TRIM
========================================================= */

function resetTrim() {

  const video =
    $("recordingPreviewVideo");


  if (!video) {
    return;
  }


  state.trimStart =
    0;


  state.trimEnd =
    Number(
      video.duration || 0
    );


  setupTrimControls();


  video.currentTime =
    0;


  showToast(
    "Trim reset.",
    "info"
  );

}


/* =========================================================
   RENAME CURRENT RECORDING
========================================================= */

async function renameCurrentRecording() {

  const input =
    $("recordingNameInput");


  const newName =
    sanitizeFileName(
      input?.value ||
      $("recordingFileName")?.value ||
      ""
    );


  if (!newName) {

    showToast(
      "Enter a recording name.",
      "error"
    );

    return;

  }


  $("recordingFileName").value =
    newName;


  $("recordingFileNameSide").value =
    newName;


  state.recordingFileName =
    newName;


  if (
    state.currentRecordingId
  ) {

    await updateRecordingName(
      state.currentRecordingId,
      newName
    );

  }


  showToast(
    "Recording renamed.",
    "success"
  );


  await loadRecordingHistory();

}


/* =========================================================
   DELETE CURRENT RECORDING
========================================================= */

async function deleteCurrentRecording() {

  if (
    !state.currentRecordingId
  ) {

    closeRecordingPreview();

    return;

  }


  const confirmed =
    window.confirm(
      "Delete this recording?"
    );


  if (!confirmed) {
    return;
  }


  await deleteRecordingFromDatabase(
    state.currentRecordingId
  );


  state.currentRecordingId =
    null;


  closeRecordingPreview();

  await loadRecordingHistory();


  showToast(
    "Recording deleted.",
    "success"
  );

}


/* =========================================================
   RECORD AGAIN
========================================================= */

function recordAgain() {

  closeRecordingPreview();

  startRecording();

}


/* =========================================================
   DOWNLOAD CURRENT RECORDING
========================================================= */

function downloadCurrentRecording() {

  if (
    !state.lastRecordingBlob
  ) {

    showToast(
      "No recording available.",
      "error"
    );

    return;

  }


  const filename =
    sanitizeFileName(
      $("recordingFileName")?.value ||
      state.recordingFileName ||
      "SNK-Course-Recording"
    );


  downloadBlob(
    state.lastRecordingBlob,
    `${filename}.${state.recordingExtension}`
  );


  showToast(
    "Recording download started.",
    "success"
  );

}


/* =========================================================
   CLOSE RECORDING PREVIEW
========================================================= */

function closeRecordingPreview() {

  const modal =
    $("recordingPreviewModal");

  const video =
    $("recordingPreviewVideo");


  if (video) {

    video.pause();

  }


  if (modal) {

    modal.classList.remove(
      "active"
    );

    modal.setAttribute(
      "aria-hidden",
      "true"
    );

  }

}


bindClick(
  "closeRecordingPreviewBtn",
  closeRecordingPreview
);


/* =========================================================
   RECORDING HISTORY — INDEXED DB
========================================================= */

async function initializeDatabase() {

  if (
    !window.indexedDB
  ) {

    console.warn(
      "IndexedDB unavailable."
    );

    return;

  }


  return new Promise(
    (resolve, reject) => {

      const request =
        indexedDB.open(
          "SNKMentorStudioDB",
          1
        );


      request.onupgradeneeded =
        event => {

          const db =
            event.target.result;


          if (
            !db.objectStoreNames.contains(
              "recordings"
            )
          ) {

            const store =
              db.createObjectStore(
                "recordings",
                {
                  keyPath: "id"
                }
              );


            store.createIndex(
              "createdAt",
              "createdAt",
              {
                unique: false
              }
            );

          }

        };


      request.onsuccess =
        event => {

          state.db =
            event.target.result;

          resolve(
            state.db
          );

        };


      request.onerror =
        event => {

          reject(
            event.target.error
          );

        };

    }
  );

}


/* =========================================================
   SAVE RECORDING
========================================================= */

async function saveRecordingToDatabase(
  record,
  blob
) {

  if (!state.db) {
    return;
  }


  return new Promise(
    (resolve, reject) => {

      const transaction =
        state.db.transaction(
          "recordings",
          "readwrite"
        );


      const store =
        transaction.objectStore(
          "recordings"
        );


      store.put({

        ...record,

        blob

      });


      transaction.oncomplete =
        () => resolve();


      transaction.onerror =
        event =>
          reject(
            event.target.error
          );

    }
  );

}


/* =========================================================
   LOAD RECORDING HISTORY
========================================================= */

async function loadRecordingHistory() {

  const list =
    $("recordingHistoryList");


  if (!list) {
    return;
  }


  if (!state.db) {

    list.innerHTML =
      `
        <div class="empty-history">
          No recording history.
        </div>
      `;

    return;

  }


  const records =
    await getAllRecordingRecords();


  records.sort(
    (a, b) =>
      b.createdAt -
      a.createdAt
  );


  list.innerHTML = "";


  if (!records.length) {

    list.innerHTML =
      `
        <div class="empty-history">
          No recording history yet.
        </div>
      `;

    return;

  }


  records.forEach(
    record => {

      list.appendChild(
        createHistoryItem(
          record
        )
      );

    }
  );

}


/* =========================================================
   GET ALL RECORDS
========================================================= */

function getAllRecordingRecords() {

  if (!state.db) {
    return Promise.resolve([]);
  }


  return new Promise(
    (resolve, reject) => {

      const transaction =
        state.db.transaction(
          "recordings",
          "readonly"
        );


      const store =
        transaction.objectStore(
          "recordings"
        );


      const request =
        store.getAll();


      request.onsuccess =
        () => {

          resolve(
            request.result || []
          );

        };


      request.onerror =
        event => {

          reject(
            event.target.error
          );

        };

    }
  );

}


/* =========================================================
   HISTORY ITEM
========================================================= */

function createHistoryItem(
  record
) {

  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.className =
    "history-item";


  wrapper.innerHTML =
    `
      <div class="history-item-main">

        <strong>
          ${escapeHTML(record.name)}
        </strong>

        <small>
          ${formatRecordingTime(record.duration)}
          •
          ${formatBytes(record.size)}
          •
          ${record.width}×${record.height}
        </small>

      </div>

      <div class="history-item-actions">

        <button
          type="button"
          data-action="preview"
        >
          Preview
        </button>

        <button
          type="button"
          data-action="download"
        >
          Download
        </button>

        <button
          type="button"
          data-action="delete"
          class="danger"
        >
          Delete
        </button>

      </div>
    `;


  wrapper
    .querySelector(
      '[data-action="preview"]'
    )
    ?.addEventListener(
      "click",
      async () => {

        const full =
          await getRecording(
            record.id
          );


        if (!full?.blob) {

          showToast(
            "Recording file not found.",
            "error"
          );

          return;

        }


        state.currentRecordingId =
          record.id;

        state.lastRecordingBlob =
          full.blob;

        state.lastRecordingMimeType =
          full.mimeType;

        state.lastRecordingURL =
          URL.createObjectURL(
            full.blob
          );


        openRecordingPreview(
          full.blob,
          record
        );

      }
    );


  wrapper
    .querySelector(
      '[data-action="download"]'
    )
    ?.addEventListener(
      "click",
      async () => {

        const full =
          await getRecording(
            record.id
          );


        if (!full?.blob) {

          showToast(
            "Recording file not found.",
            "error"
          );

          return;

        }


        const extension =
          full.mimeType?.includes(
            "mp4"
          )
            ? "mp4"
            : "webm";


        downloadBlob(
          full.blob,
          `${sanitizeFileName(record.name)}.${extension}`
        );

      }
    );


  wrapper
    .querySelector(
      '[data-action="delete"]'
    )
    ?.addEventListener(
      "click",
      async () => {

        const confirmed =
          window.confirm(
            `Delete "${record.name}"?`
          );


        if (!confirmed) {
          return;
        }


        await deleteRecordingFromDatabase(
          record.id
        );


        await loadRecordingHistory();


        showToast(
          "Recording deleted.",
          "success"
        );

      }
    );


  return wrapper;

}


/* =========================================================
   ADD HISTORY UI
========================================================= */

function addRecordingToHistoryUI(
  record
) {

  loadRecordingHistory();

}


/* =========================================================
   GET RECORDING
========================================================= */

function getRecording(id) {

  if (!state.db) {
    return Promise.resolve(null);
  }


  return new Promise(
    (resolve, reject) => {

      const transaction =
        state.db.transaction(
          "recordings",
          "readonly"
        );


      const store =
        transaction.objectStore(
          "recordings"
        );


      const request =
        store.get(id);


      request.onsuccess =
        () => {

          resolve(
            request.result ||
            null
          );

        };


      request.onerror =
        event =>
          reject(
            event.target.error
          );

    }
  );

}


/* =========================================================
   UPDATE RECORDING NAME
========================================================= */

function updateRecordingName(
  id,
  name
) {

  if (!state.db) {
    return Promise.resolve();
  }


  return new Promise(
    async (resolve, reject) => {

      const existing =
        await getRecording(id);


      if (!existing) {

        resolve();

        return;

      }


      existing.name =
        name;


      const transaction =
        state.db.transaction(
          "recordings",
          "readwrite"
        );


      transaction.objectStore(
        "recordings"
      ).put(existing);


      transaction.oncomplete =
        () => resolve();


      transaction.onerror =
        event =>
          reject(
            event.target.error
          );

    }
  );

}


/* =========================================================
   DELETE RECORDING
========================================================= */

function deleteRecordingFromDatabase(
  id
) {

  if (!state.db) {
    return Promise.resolve();
  }


  return new Promise(
    (resolve, reject) => {

      const transaction =
        state.db.transaction(
          "recordings",
          "readwrite"
        );


      transaction
        .objectStore(
          "recordings"
        )
        .delete(id);


      transaction.oncomplete =
        () => resolve();


      transaction.onerror =
        event =>
          reject(
            event.target.error
          );

    }
  );

}


/* =========================================================
   CLEAR RECORDING HISTORY
========================================================= */

async function clearRecordingHistory() {

  const confirmed =
    window.confirm(
      "Delete all recording history?"
    );


  if (!confirmed) {
    return;
  }


  if (!state.db) {
    return;
  }


  await new Promise(
    (resolve, reject) => {

      const transaction =
        state.db.transaction(
          "recordings",
          "readwrite"
        );


      transaction
        .objectStore(
          "recordings"
        )
        .clear();


      transaction.oncomplete =
        () => resolve();


      transaction.onerror =
        event =>
          reject(
            event.target.error
          );

    }
  );


  state.currentRecordingId =
    null;


  await loadRecordingHistory();


  showToast(
    "Recording history cleared.",
    "success"
  );

}


/* =========================================================
   DOWNLOAD BLOB
========================================================= */

function downloadBlob(
  blob,
  filename
) {

  const url =
    URL.createObjectURL(
      blob
    );


  const anchor =
    document.createElement(
      "a"
    );


  anchor.href =
    url;

  anchor.download =
    filename;

  document.body.appendChild(
    anchor
  );


  anchor.click();


  anchor.remove();


  setTimeout(
    () => {

      URL.revokeObjectURL(
        url
      );

    },
    1000
  );

}


/* =========================================================
   SCREEN CAPTURE
========================================================= */

function initializeScreenCapture() {

  /*
    Stop automatically when browser ends
    screen sharing.
  */

}


async function startScreenCapture() {

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getDisplayMedia
  ) {

    showToast(
      "Screen capture is not supported in this browser.",
      "error"
    );

    return;

  }


  try {

    stopScreenCapture();


    state.screenStream =
      await navigator.mediaDevices.getDisplayMedia({

        video: {
          frameRate: {
            ideal:
              state.recordingFps
          }
        },

        audio: true

      });


    screenCaptureVideo.srcObject =
      state.screenStream;


    screenCaptureVideo.muted =
      true;


    await screenCaptureVideo.play();


    state.screenCaptureActive =
      true;


    screenCaptureVideo.style.display =
      "block";


    mainImage.style.display =
      "none";

    mainVideo.style.display =
      "none";


    welcomeContent.style.display =
      "none";


    updateScreenCaptureStatus(
      true
    );


    const videoTrack =
      state.screenStream.getVideoTracks()[0];


    if (videoTrack) {

      videoTrack.addEventListener(
        "ended",
        () => {

          stopScreenCapture();

        }
      );

    }


    updateStageSource(
      "Screen"
    );


    renderCompositionFrame();


    showToast(
      "Screen sharing started.",
      "success"
    );

  } catch (error) {

    console.error(
      error
    );


    showToast(
      "Screen sharing was cancelled.",
      "info"
    );

  }

}


/* =========================================================
   STOP SCREEN CAPTURE
========================================================= */

function stopScreenCapture() {

  if (
    state.screenStream
  ) {

    state.screenStream
      .getTracks()
      .forEach(
        track =>
          track.stop()
      );

  }


  state.screenStream =
    null;

  state.screenCaptureActive =
    false;


  screenCaptureVideo.srcObject =
    null;


  screenCaptureVideo.style.display =
    "none";


  if (
    state.mainMode ===
    "video"
  ) {

    mainVideo.style.display =
      "block";

  } else if (
    state.mainMode ===
    "image"
  ) {

    mainImage.style.display =
      "block";

  } else {

    welcomeContent.style.display =
      "flex";

  }


  updateScreenCaptureStatus(
    false
  );


  updateStageSource(
    state.mainMode === "video"
      ? "Main Video"
      : state.mainMode === "image"
        ? "Image"
        : "Studio"
  );


  renderCompositionFrame();

}


/* =========================================================
   SCREEN STATUS
========================================================= */

function updateScreenCaptureStatus(
  active
) {

  const status =
    $("screenCaptureStatus");

  const light =
    $("screenCaptureStatusLight");

  const indicator =
    $("screenIndicator");


  if (status) {

    status.textContent =
      active
        ? "Screen sharing active"
        : "Not sharing";

  }


  if (light) {

    light.classList.toggle(
      "active",
      active
    );

  }


  if (indicator) {

    indicator.textContent =
      active
        ? "Screen"
        : "Screen Off";


    indicator.classList.toggle(
      "active",
      active
    );

  }

}


/* =========================================================
   TELEPROMPTER
========================================================= */

function initializeTeleprompter() {

  const text =
    $("teleprompterText");

  const speed =
    $("teleprompterSpeed");

  const fontSize =
    $("teleprompterFontSize");

  const opacity =
    $("teleprompterOpacity");


  if (text) {

    text.addEventListener(
      "input",
      () => {

        state.teleprompterText =
          text.value;

        updateTeleprompterPreview();

      }
    );

  }


  if (speed) {

    speed.addEventListener(
      "input",
      () => {

        state.teleprompterSpeed =
          Number(
            speed.value
          );

        updateTeleprompterPreview();

      }
    );

  }


  if (fontSize) {

    fontSize.addEventListener(
      "input",
      () => {

        state.teleprompterFontSize =
          Number(
            fontSize.value
          );

        updateTeleprompterPreview();

      }
    );

  }


  if (opacity) {

    opacity.addEventListener(
      "input",
      () => {

        state.teleprompterOpacity =
          Number(
            opacity.value
          );

        updateTeleprompterPreview();

      }
    );

  }


  bindClick(
    "teleprompterPlayBtn",
    startTeleprompter
  );


  bindClick(
    "teleprompterPauseBtn",
    pauseTeleprompter
  );


  bindClick(
    "teleprompterResetBtn",
    resetTeleprompter
  );


  bindClick(
    "teleprompterSaveBtn",
    saveTeleprompter
  );


  updateTeleprompterPreview();

}


/* =========================================================
   OPEN TELEPROMPTER
========================================================= */

function openTeleprompter() {

  const modal =
    $("teleprompterModal");


  if (!modal) {
    return;
  }


  modal.classList.add(
    "active"
  );


  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  updateTeleprompterPreview();

}


/* =========================================================
   CLOSE TELEPROMPTER
========================================================= */

function closeTeleprompter() {

  const modal =
    $("teleprompterModal");


  modal?.classList.remove(
    "active"
  );


  modal?.setAttribute(
    "aria-hidden",
    "true"
  );

}


bindClick(
  "closeTeleprompterBtn",
  closeTeleprompter
);


/* =========================================================
   TELEPROMPTER PREVIEW
========================================================= */

function updateTeleprompterPreview() {

  const preview =
    $("teleprompterPreview");

  const mini =
    $("teleprompterMiniPreview");


  if (!preview) {
    return;
  }


  preview.textContent =
    state.teleprompterText ||
    "Your teleprompter preview will appear here.";


  preview.style.fontSize =
    `${state.teleprompterFontSize}px`;


  preview.style.opacity =
    String(
      state.teleprompterOpacity /
      100
    );


  if (mini) {

    mini.textContent =
      state.teleprompterText ||
      "Upload or write your script.";

  }

}


/* =========================================================
   TELEPROMPTER PLAY
========================================================= */

function startTeleprompter() {

  if (
    state.teleprompterPlaying
  ) {

    return;

  }


  state.teleprompterPlaying =
    true;


  const preview =
    $("teleprompterPreview");


  let scrollPosition =
    preview?.scrollTop || 0;


  function animate() {

    if (
      !state.teleprompterPlaying ||
      !preview
    ) {

      return;

    }


    scrollPosition +=
      state.teleprompterSpeed *
      0.12;


    preview.scrollTop =
      scrollPosition;


    state.teleprompterAnimationFrame =
      requestAnimationFrame(
        animate
      );

  }


  animate();

}


/* =========================================================
   TELEPROMPTER PAUSE
========================================================= */

function pauseTeleprompter() {

  state.teleprompterPlaying =
    false;


  if (
    state.teleprompterAnimationFrame
  ) {

    cancelAnimationFrame(
      state.teleprompterAnimationFrame
    );

  }


  state.teleprompterAnimationFrame =
    null;

}


/* =========================================================
   TELEPROMPTER RESET
========================================================= */

function resetTeleprompter() {

  pauseTeleprompter();


  const preview =
    $("teleprompterPreview");


  if (preview) {

    preview.scrollTop =
      0;

  }


  $("teleprompterText").value =
    "";


  state.teleprompterText =
    "";


  updateTeleprompterPreview();

}


/* =========================================================
   SAVE TELEPROMPTER
========================================================= */

function saveTeleprompter() {

  state.teleprompterText =
    $("teleprompterText")?.value ||
    "";


  localStorage.setItem(
    "snkMentorTeleprompter",
    state.teleprompterText
  );


  updateTeleprompterPreview();


  showToast(
    "Teleprompter script saved.",
    "success"
  );

}


/* =========================================================
   LOAD TELEPROMPTER FILE
========================================================= */

async function loadTeleprompterFile(
  event
) {

  const file =
    event.target.files?.[0];


  if (!file) {
    return;
  }


  try {

    const text =
      await file.text();


    state.teleprompterText =
      text;


    $("teleprompterText").value =
      text;


    updateTeleprompterPreview();


    openTeleprompter();


    showToast(
      "Teleprompter script loaded.",
      "success"
    );

  } catch (error) {

    console.error(error);

    showToast(
      "Could not read the text file.",
      "error"
    );

  }


  event.target.value =
    "";

}


/* =========================================================
   SETTINGS
========================================================= */

function initializeSettings() {

  bindClick(
    "closeSettingsBtn",
    closeSettings
  );

  bindClick(
    "closeSettingsFooterBtn",
    closeSettings
  );

  bindClick(
    "saveSettingsBtn",
    saveSettings
  );


  const brand =
    $("brandNameInput");


  if (brand) {

    brand.addEventListener(
      "input",
      () => {

        brandBadgeText.textContent =
          brand.value ||
          "SNK Institute";

      }
    );

  }

}


/* =========================================================
   OPEN SETTINGS
========================================================= */

function openSettings() {

  const modal =
    $("settingsModal");


  if (!modal) {
    return;
  }


  $("brandNameInput").value =
    state.brandName;


  $("settingsRecordingQuality").value =
    `${state.recordingWidth}x${state.recordingHeight}`;


  $("settingsRecordingFps").value =
    String(
      state.recordingFps
    );


  $("settingsAutoStartTeleprompter").checked =
    state.autoStartTeleprompter;


  $("settingsShowTeleprompterRecording").checked =
    state.showTeleprompterRecording;


  modal.classList.add(
    "active"
  );


  modal.setAttribute(
    "aria-hidden",
    "false"
  );

}


/* =========================================================
   CLOSE SETTINGS
========================================================= */

function closeSettings() {

  const modal =
    $("settingsModal");


  modal?.classList.remove(
    "active"
  );


  modal?.setAttribute(
    "aria-hidden",
    "true"
  );

}


/* =========================================================
   SAVE SETTINGS
========================================================= */

function saveSettings() {

  state.brandName =
    $("brandNameInput")?.value ||
    "SNK Institute";


  brandBadgeText.textContent =
    state.brandName;


  state.autoStartTeleprompter =
    $("settingsAutoStartTeleprompter")
      ?.checked ||
    false;


  state.showTeleprompterRecording =
    $("settingsShowTeleprompterRecording")
      ?.checked !== false;


  const quality =
    $("settingsRecordingQuality")
      ?.value ||
    "1920x1080";


  const parts =
    quality.split("x");


  state.recordingWidth =
    Number(parts[0]);


  state.recordingHeight =
    Number(parts[1]);


  state.recordingFps =
    Number(
      $("settingsRecordingFps")
        ?.value ||
      30
    );


  $("recordingQualitySide").value =
    quality;


  $("recordingFpsSide").value =
    String(
      state.recordingFps
    );


  localStorage.setItem(
    "snkMentorSettings",
    JSON.stringify({

      brandName:
        state.brandName,

      recordingWidth:
        state.recordingWidth,

      recordingHeight:
        state.recordingHeight,

      recordingFps:
        state.recordingFps,

      autoStartTeleprompter:
        state.autoStartTeleprompter,

      showTeleprompterRecording:
        state.showTeleprompterRecording

    })
  );


  updateStageBadges();

  closeSettings();


  showToast(
    "Settings saved.",
    "success"
  );

}


/* =========================================================
   LOAD SETTINGS
========================================================= */

function loadSavedSettings() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          "snkMentorSettings"
        ) ||
        "null"
      );


    if (saved) {

      state.brandName =
        saved.brandName ||
        "SNK Institute";


      state.recordingWidth =
        saved.recordingWidth ||
        1920;


      state.recordingHeight =
        saved.recordingHeight ||
        1080;


      state.recordingFps =
        saved.recordingFps ||
        30;


      state.autoStartTeleprompter =
        !!saved.autoStartTeleprompter;


      state.showTeleprompterRecording =
        saved.showTeleprompterRecording !==
        false;

    }

  } catch (error) {

    console.warn(
      "Settings load failed:",
      error
    );

  }


  brandBadgeText.textContent =
    state.brandName;


  $("recordingQualitySide").value =
    `${state.recordingWidth}x${state.recordingHeight}`;


  $("recordingFpsSide").value =
    String(
      state.recordingFps
    );


  $("settingsRecordingQuality").value =
    `${state.recordingWidth}x${state.recordingHeight}`;


  $("settingsRecordingFps").value =
    String(
      state.recordingFps
    );


  $("settingsAutoStartTeleprompter").checked =
    state.autoStartTeleprompter;


  $("settingsShowTeleprompterRecording").checked =
    state.showTeleprompterRecording;


  const savedScript =
    localStorage.getItem(
      "snkMentorTeleprompter"
    );


  if (savedScript) {

    state.teleprompterText =
      savedScript;


    $("teleprompterText").value =
      savedScript;

  }


  updateTeleprompterPreview();

}


/* =========================================================
   STUDENTS
========================================================= */

function initializeStudentSystem() {

  bindClick(
    "addStudentBtn",
    openStudentModal
  );

  bindClick(
    "closeStudentModalBtn",
    closeStudentModal
  );

  bindClick(
    "cancelStudentBtn",
    closeStudentModal
  );

  bindClick(
    "saveStudentBtn",
    saveStudent
  );


  renderStudents();

}


/* =========================================================
   OPEN STUDENT MODAL
========================================================= */

function openStudentModal() {

  $("studentNameInput").value =
    "";


  const modal =
    $("studentModal");


  modal?.classList.add(
    "active"
  );


  modal?.setAttribute(
    "aria-hidden",
    "false"
  );


  setTimeout(
    () =>
      $("studentNameInput")?.focus(),
    100
  );

}


/* =========================================================
   CLOSE STUDENT MODAL
========================================================= */

function closeStudentModal() {

  const modal =
    $("studentModal");


  modal?.classList.remove(
    "active"
  );


  modal?.setAttribute(
    "aria-hidden",
    "true"
  );

}


/* =========================================================
   SAVE STUDENT
========================================================= */

function saveStudent() {

  const input =
    $("studentNameInput");


  const name =
    input?.value.trim();


  if (!name) {

    showToast(
      "Enter a student name.",
      "error"
    );

    return;

  }


  state.students.push({

    id:
      createId(),

    name

  });


  saveStudents();

  renderStudents();

  closeStudentModal();


  showToast(
    "Student added.",
    "success"
  );

}


/* =========================================================
   RENDER STUDENTS
========================================================= */

function renderStudents() {

  const list =
    $("studentsList");


  if (!list) {
    return;
  }


  list.innerHTML = "";


  if (!state.students.length) {

    list.innerHTML =
      `
        <div class="empty-students">
          No students added.
        </div>
      `;

    return;

  }


  state.students.forEach(
    student => {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "student-row";


      row.innerHTML =
        `
          <div class="student-avatar">
            ${escapeHTML(
              student.name
                .charAt(0)
                .toUpperCase()
            )}
          </div>

          <div class="student-info">

            <strong>
              ${escapeHTML(
                student.name
              )}
            </strong>

            <small>
              Online
            </small>

          </div>

          <button
            type="button"
            class="student-remove"
          >
            ×
          </button>
        `;


      row
        .querySelector(
          ".student-remove"
        )
        .addEventListener(
          "click",
          () => {

            state.students =
              state.students.filter(
                item =>
                  item.id !==
                  student.id
              );


            saveStudents();

            renderStudents();

          }
        );


      list.appendChild(
        row
      );

    }
  );

}


/* =========================================================
   SAVE STUDENTS
========================================================= */

function saveStudents() {

  localStorage.setItem(
    "snkMentorStudents",
    JSON.stringify(
      state.students
    )
  );

}


/* =========================================================
   LOAD STUDENTS
========================================================= */

function loadStudents() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          "snkMentorStudents"
        ) ||
        "[]"
      );


    if (
      Array.isArray(saved)
    ) {

      state.students =
        saved;

    }

  } catch (error) {

    console.warn(
      error
    );

  }


  renderStudents();

}


/* =========================================================
   FULLSCREEN
========================================================= */

function initializeFullscreen() {

  bindClick(
    "fullscreenStageBtn",
    toggleStageFullscreen
  );


  bindClick(
    "fullscreenStudioBtn",
    toggleStudioFullscreen
  );

}


/* =========================================================
   STAGE FULLSCREEN
========================================================= */

async function toggleStageFullscreen() {

  try {

    if (
      document.fullscreenElement
    ) {

      await document.exitFullscreen();

      return;

    }


    if (
      stageShell?.requestFullscreen
    ) {

      await stageShell.requestFullscreen();

    }

  } catch (error) {

    console.warn(
      "Stage fullscreen failed:",
      error
    );

  }

}


/* =========================================================
   STUDIO FULLSCREEN
========================================================= */

async function toggleStudioFullscreen() {

  try {

    if (
      document.fullscreenElement
    ) {

      await document.exitFullscreen();

      return;

    }


    if (
      document.documentElement
        .requestFullscreen
    ) {

      await document.documentElement
        .requestFullscreen();

    }

  } catch (error) {

    console.warn(
      "Studio fullscreen failed:",
      error
    );

  }

}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

function initializeKeyboardShortcuts() {

  document.addEventListener(
    "keydown",
    event => {

      const tag =
        event.target?.tagName;


      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT"
      ) {

        if (
          event.key !== "Escape"
        ) {

          return;

        }

      }


      if (
        event.key === "Escape"
      ) {

        closeAllModals();

        return;

      }


      if (
        event.code === "Space"
      ) {

        event.preventDefault();

        if (
          state.recordingActive
        ) {

          if (
            state.recordingPaused
          ) {

            resumeRecording();

          } else {

            pauseRecording();

          }

        } else {

          if (
            mainVideo.paused
          ) {

            playMainMedia();

          } else {

            pauseMainMedia();

          }

        }

        return;

      }


      const key =
        event.key.toLowerCase();


      if (
        key === "r"
      ) {

        if (
          !state.recordingActive
        ) {

          startRecording();

        }

      }


      if (
        key === "p"
      ) {

        if (
          state.recordingActive
        ) {

          if (
            state.recordingPaused
          ) {

            resumeRecording();

          } else {

            pauseRecording();

          }

        }

      }


      if (
        key === "s"
      ) {

        if (
          state.recordingActive
        ) {

          stopRecording();

        }

      }


      if (
        key === "f"
      ) {

        toggleStageFullscreen();

      }

    }
  );

}


/* =========================================================
   SHORTCUTS
========================================================= */

function openShortcuts() {

  const modal =
    $("shortcutsModal");


  modal?.classList.add(
    "active"
  );


  modal?.setAttribute(
    "aria-hidden",
    "false"
  );

}


function closeShortcuts() {

  const modal =
    $("shortcutsModal");


  modal?.classList.remove(
    "active"
  );


  modal?.setAttribute(
    "aria-hidden",
    "true"
  );

}


bindClick(
  "closeShortcutsBtn",
  closeShortcuts
);


/* =========================================================
   CLOSE ALL MODALS
========================================================= */

function closeAllModals() {

  qsa(".modal.active")
    .forEach(
      modal => {

        modal.classList.remove(
          "active"
        );

        modal.setAttribute(
          "aria-hidden",
          "true"
        );

      }
    );

}


/* =========================================================
   STAGE BADGES
========================================================= */

function updateStageBadges() {

  const resolution =
    `${state.recordingWidth}×${state.recordingHeight}`;


  const fps =
    `${state.recordingFps} FPS`;


  $("stageResolutionBadge").textContent =
    resolution;


  $("stageFpsBadge").textContent =
    fps;


  $("recordingQuality").textContent =
    resolution;


  $("recordingFps").textContent =
    fps;


  const mime =
    $("recordingFormatSide")?.value ||
    "webm-vp9";


  $("recordingFormat").textContent =
    mime === "mp4"
      ? "MP4"
      : "WebM";

}


/* =========================================================
   STAGE SOURCE
========================================================= */

function updateStageSource(
  source
) {

  $("stageSourceBadge").textContent =
    source;

}


/* =========================================================
   UTILITY — CLAMP
========================================================= */

function clamp(
  value,
  min,
  max
) {

  return Math.min(
    Math.max(
      value,
      min
    ),
    max
  );

}


/* =========================================================
   UTILITY — ID
========================================================= */

function createId() {

  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .slice(2)
  );

}


/* =========================================================
   UTILITY — FILE NAME
========================================================= */

function sanitizeFileName(
  value
) {

  return String(
    value || ""
  )
    .trim()
    .replace(
      /[<>:"/\\|?*\x00-\x1F]/g,
      "-"
    )
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    )
    .slice(
      0,
      120
    ) ||
    "SNK-Course-Recording";

}


/* =========================================================
   UTILITY — FORMAT BYTES
========================================================= */

function formatBytes(
  bytes
) {

  if (
    !Number.isFinite(bytes) ||
    bytes <= 0
  ) {

    return "0 B";

  }


  const units =
    [
      "B",
      "KB",
      "MB",
      "GB"
    ];


  const index =
    Math.floor(
      Math.log(bytes) /
      Math.log(1024)
    );


  return (
    `${(
      bytes /
      Math.pow(
        1024,
        index
      )
    ).toFixed(
      index === 0
        ? 0
        : 2
    )} ${units[index]}`
  );

}


/* =========================================================
   UTILITY — TIME
========================================================= */

function formatRecordingTime(
  seconds
) {

  seconds =
    Math.max(
      0,
      Math.floor(
        Number(seconds) || 0
      )
    );


  const hours =
    Math.floor(
      seconds / 3600
    );


  const minutes =
    Math.floor(
      (
        seconds % 3600
      ) / 60
    );


  const secs =
    seconds % 60;


  return [
    String(hours)
      .padStart(2, "0"),

    String(minutes)
      .padStart(2, "0"),

    String(secs)
      .padStart(2, "0")

  ].join(":");

}


/* =========================================================
   UTILITY — ESCAPE HTML
========================================================= */

function escapeHTML(
  value
) {

  return String(
    value ?? ""
  )
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
   TOAST
========================================================= */

function showToast(
  message,
  type = "info"
) {

  if (!toastContainer) {
    return;
  }


  const toast =
    document.createElement(
      "div"
    );


  toast.className =
    `toast ${type}`;


  toast.innerHTML =
    `
      <span class="toast-icon">
        ${
          type === "success"
            ? "✓"
            : type === "error"
              ? "!"
              : "i"
        }
      </span>

      <span>
        ${escapeHTML(message)}
      </span>
    `;


  toastContainer.appendChild(
    toast
  );


  requestAnimationFrame(
    () => {

      toast.classList.add(
        "show"
      );

    }
  );


  setTimeout(
    () => {

      toast.classList.remove(
        "show"
      );


      setTimeout(
        () =>
          toast.remove(),
        300
      );

    },
    3500
  );

}


/* =========================================================
   GLOBAL API
========================================================= */

window.CourseStudio = {

  state,

  startCamera,
  stopCamera,

  startRecording,
  pauseRecording,
  resumeRecording,
  stopRecording,

  startScreenCapture,
  stopScreenCapture,

  openTeleprompter,
  startTeleprompter,
  pauseTeleprompter,

  renderCompositionFrame,

  setAIBackgroundMode,

  loadMainImage,
  loadMainVideo,
  loadMentorVideo,

  downloadCurrentRecording,

  openSettings,
  closeSettings

};


/* =========================================================
   INITIAL MENTOR POSITION
========================================================= */

applyMentorDOMPosition();


/* =========================================================
   INITIAL RECORDING SETTINGS
========================================================= */

updateRecordingSettings();


/* =========================================================
   INITIAL BADGES
========================================================= */

updateStageBadges();


/* =========================================================
   FINAL INITIAL RENDER
========================================================= */

renderCompositionFrame();


/* =========================================================
   END
========================================================= */
