/* =========================================================
   PERSONAL COURSE STUDIO
   MENTOR STUDIO — MAIN JAVASCRIPT
   File: mentor/script.js

   Features:
   - Main image / video
   - Mentor video
   - Camera
   - Camera device selection
   - Camera quality / FPS
   - MediaPipe AI person segmentation
   - Original / Remove / Blur / Custom Image / Solid Color
   - Draggable mentor overlay
   - Resizable mentor overlay
   - Screen capture
   - Microphone
   - Main video audio
   - Audio meters
   - Microphone waveform
   - Teleprompter
   - Continuous 16:9 composition
   - 1920x1080 recording
   - 1280x720 / 1920x1080 / 2560x1440
   - WebM VP9 / VP8 / MP4 detection
   - Recording pause / resume / stop
   - Recording preview
   - Recording history
   - IndexedDB Blob storage
   - Download
   - Rename
   - Delete
   - Keyboard shortcuts
   - Fullscreen
   ========================================================= */

/* =========================================================
   GLOBAL STATE
   ========================================================= */

const state = {

  /* -------------------------------------------------------
     Main media
     ------------------------------------------------------- */

  mainImageUrl: null,

  mainVideoUrl: null,

  mainType: "none",

  mainVideoSourceNode: null,

  mainVideoGainNode: null,

  mainVideoAnalyser: null,


  /* -------------------------------------------------------
     Mentor
     ------------------------------------------------------- */

  mentorVideoUrl: null,

  mentorSource: "none",

  mentorStream: null,

  mentorCameraTrack: null,

  currentCameraDeviceId: "",

  cameraRunning: false,

  cameraWidth: 1280,

  cameraHeight: 720,

  cameraFps: 30,


  /* -------------------------------------------------------
     AI
     ------------------------------------------------------- */

  segmentation: null,

  segmentationReady: false,

  segmentationBusy: false,

  backgroundMode: "original",

  customBackgroundImage: null,

  sourceCanvas: null,

  sourceCtx: null,

  maskCanvas: null,

  maskCtx: null,

  personCanvas: null,

  personCtx: null,

  aiFrameWidth: 640,

  aiFrameHeight: 360,


  /* -------------------------------------------------------
     Screen capture
     ------------------------------------------------------- */

  screenStream: null,

  screenCaptureRunning: false,

  screenVideoTrack: null,


  /* -------------------------------------------------------
     Audio
     ------------------------------------------------------- */

  audioContext: null,

  masterDestination: null,

  micStream: null,

  micSourceNode: null,

  micGainNode: null,

  micAnalyser: null,

  micMonitorGain: null,

  mainAudioAnalyser: null,

  micEnabled: true,

  micMonitor: false,

  micVolume: 1,

  mainVolume: 1,


  /* -------------------------------------------------------
     Composition
     ------------------------------------------------------- */

  compositionCanvas: null,

  compositionCtx: null,

  compositionWidth: 1920,

  compositionHeight: 1080,

  compositionFps: 30,

  renderAnimationId: null,

  rendering: false,


  /* -------------------------------------------------------
     Recording
     ------------------------------------------------------- */

  mediaRecorder: null,

  recordingChunks: [],

  recordingStream: null,

  recordingStartedAt: 0,

  recordingPausedAt: 0,

  recordingAccumulatedPause: 0,

  recordingTimerId: null,

  recordingElapsed: 0,

  recordingActive: false,

  recordingPaused: false,

  currentRecordingBlob: null,

  currentRecordingMimeType: "",

  currentRecordingId: null,

  currentRecordingName: "mentor-course-recording",

  currentRecordingUrl: null,

  currentRecordingTrimStart: 0,

  currentRecordingTrimEnd: 0,


  /* -------------------------------------------------------
     Preview
     ------------------------------------------------------- */

  previewObjectUrl: null,

  previewDuration: 0,

  previewTrimStart: 0,

  previewTrimEnd: 0,


  /* -------------------------------------------------------
     Teleprompter
     ------------------------------------------------------- */

  teleprompterText: "",

  teleprompterSpeed: 5,

  teleprompterFontSize: 38,

  teleprompterOpacity: 0.9,

  teleprompterPlaying: false,

  teleprompterOffset: 0,

  teleprompterLastTime: 0,

  teleprompterAutoStart: false,

  teleprompterShowDuringRecording: true,


  /* -------------------------------------------------------
     Settings
     ------------------------------------------------------- */

  brandName: "Personal Course Studio",

  recordingWidth: 1920,

  recordingHeight: 1080,

  recordingFps: 30,

  recordingFormat: "webm-vp9",

  recordingFileName: "mentor-course-recording",


  /* -------------------------------------------------------
     Students
     ------------------------------------------------------- */

  students: [],


  /* -------------------------------------------------------
     IndexedDB
     ------------------------------------------------------- */

  db: null,


  /* -------------------------------------------------------
     Camera switch
     ------------------------------------------------------- */

  cameraFacingMode: "user",


  /* -------------------------------------------------------
     Temporary recording history
     ------------------------------------------------------- */

  history: []

};


/* =========================================================
   DOM HELPERS
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}


function $all(selector) {
  return Array.from(document.querySelectorAll(selector));
}


function exists(id) {
  return !!$(id);
}


/* =========================================================
   SAFE EVENT LISTENER
   ========================================================= */

function on(id, event, handler, options) {

  const element = $(id);

  if (!element) {
    return;
  }

  element.addEventListener(
    event,
    handler,
    options
  );
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
  message,
  type = "info",
  duration = 3000
) {

  const container = $("toastContainer");

  if (!container) {
    return;
  }

  const toast = document.createElement("div");

  toast.className =
    `toast ${type}`;

  toast.textContent = message;

  container.appendChild(toast);

  window.setTimeout(() => {

    toast.style.opacity = "0";
    toast.style.transform = "translateY(6px)";

    window.setTimeout(() => {

      toast.remove();

    }, 180);

  }, duration);
}


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatTime(seconds) {

  if (!Number.isFinite(seconds)) {
    return "00:00";
  }

  seconds = Math.max(
    0,
    Math.floor(seconds)
  );

  const hours =
    Math.floor(seconds / 3600);

  const minutes =
    Math.floor((seconds % 3600) / 60);

  const secs =
    seconds % 60;

  if (hours > 0) {

    return [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(secs).padStart(2, "0")
    ].join(":");

  }

  return [
    String(minutes).padStart(2, "0"),
    String(secs).padStart(2, "0")
  ].join(":");
}


function formatRecordingTime(seconds) {

  if (!Number.isFinite(seconds)) {
    return "00:00:00";
  }

  seconds = Math.max(
    0,
    Math.floor(seconds)
  );

  const hours =
    Math.floor(seconds / 3600);

  const minutes =
    Math.floor((seconds % 3600) / 60);

  const secs =
    seconds % 60;

  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(secs).padStart(2, "0")
  ].join(":");
}


function formatBytes(bytes) {

  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB"
  ];

  const index =
    Math.min(
      Math.floor(
        Math.log(bytes) /
        Math.log(1024)
      ),
      units.length - 1
    );

  const value =
    bytes /
    Math.pow(1024, index);

  return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}


/* =========================================================
   CLAMP
   ========================================================= */

function clamp(
  value,
  min,
  max
) {

  return Math.min(
    max,
    Math.max(min, value)
  );
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  init
);


async function init() {

  initializeCompositionCanvas();

  initializeAI();

  initializeAudio();

  initializeTeleprompter();

  initializeSettings();

  initializeStudents();

  initializeMediaControls();

  initializeCameraControls();

  initializeBackgroundControls();

  initializeScreenCapture();

  initializeRecordingControls();

  initializePreviewControls();

  initializeFullscreen();

  initializeShortcuts();

  initializeFileInputs();

  initializeDragMentor();

  initializeAudioUI();

  initializeHistoryUI();

  await initializeDatabase();

  loadSavedSettings();

  loadStudents();

  await loadRecordingHistory();

  updateAllUI();

  startRenderLoop();

  requestAnimationFrame(
    audioVisualizationLoop
  );

}


/* =========================================================
   COMPOSITION CANVAS
   ========================================================= */

function initializeCompositionCanvas() {

  const canvas =
    document.createElement("canvas");

  canvas.width =
    state.compositionWidth;

  canvas.height =
    state.compositionHeight;

  state.compositionCanvas =
    canvas;

  state.compositionCtx =
    canvas.getContext(
      "2d",
      {
        alpha: false,
        desynchronized: true
      }
    );

  fillCompositionBackground();

}


function fillCompositionBackground() {

  const ctx =
    state.compositionCtx;

  if (!ctx) {
    return;
  }

  ctx.fillStyle = "#000";

  ctx.fillRect(
    0,
    0,
    state.compositionWidth,
    state.compositionHeight
  );
}


/* =========================================================
   RESOLUTION
   ========================================================= */

function parseResolution(value) {

  const match =
    String(value).match(
      /^(\d+)x(\d+)$/
    );

  if (!match) {

    return {
      width: 1920,
      height: 1080
    };

  }

  return {
    width: Number(match[1]),
    height: Number(match[2])
  };
}


function setCompositionResolution(
  width,
  height
) {

  state.compositionWidth =
    width;

  state.compositionHeight =
    height;

  if (!state.compositionCanvas) {
    return;
  }

  state.compositionCanvas.width =
    width;

  state.compositionCanvas.height =
    height;

  updateResolutionUI();
}


/* =========================================================
   RESOLUTION UI
   ========================================================= */

function updateResolutionUI() {

  const text =
    `${state.compositionWidth}×${state.compositionHeight}`;

  const elements = [

    $("recordingQuality"),

    $("stageResolutionBadge")

  ];

  elements.forEach(
    element => {

      if (element) {
        element.textContent =
          text;
      }

    }
  );

}


/* =========================================================
   FPS UI
   ========================================================= */

function updateFpsUI() {

  const text =
    `${state.compositionFps}`;

  const recordingFps =
    $("recordingFps");

  const stageFps =
    $("stageFpsBadge");

  if (recordingFps) {
    recordingFps.textContent =
      text;
  }

  if (stageFps) {
    stageFps.textContent =
      `${text} FPS`;
  }

}


/* =========================================================
   CONTINUOUS RENDER LOOP
   ========================================================= */

function startRenderLoop() {

  if (state.rendering) {
    return;
  }

  state.rendering = true;

  const loop = () => {

    renderCompositionFrame();

    state.renderAnimationId =
      requestAnimationFrame(loop);

  };

  requestAnimationFrame(loop);
}


function stopRenderLoop() {

  if (
    state.renderAnimationId
  ) {

    cancelAnimationFrame(
      state.renderAnimationId
    );

  }

  state.renderAnimationId =
    null;

  state.rendering = false;
}


/* =========================================================
   RENDER COMPOSITION
   ========================================================= */

function renderCompositionFrame() {

  const canvas =
    state.compositionCanvas;

  const ctx =
    state.compositionCtx;

  if (!canvas || !ctx) {
    return;
  }

  const width =
    canvas.width;

  const height =
    canvas.height;


  /* -------------------------------------------------------
     Background
     ------------------------------------------------------- */

  ctx.fillStyle =
    "#000";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  /* -------------------------------------------------------
     Main content
     ------------------------------------------------------- */

  drawMainContent(
    ctx,
    width,
    height
  );


  /* -------------------------------------------------------
     Screen capture
     ------------------------------------------------------- */

  if (
    state.screenCaptureRunning &&
    $("screenCaptureVideo") &&
    $("screenCaptureVideo").readyState >= 2
  ) {

    drawContain(
      ctx,
      $("screenCaptureVideo"),
      0,
      0,
      width,
      height
    );

  }


  /* -------------------------------------------------------
     Mentor
     ------------------------------------------------------- */

  drawMentorComposition(
    ctx,
    width,
    height
  );


  /* -------------------------------------------------------
     Teleprompter
     ------------------------------------------------------- */

  if (
    state.recordingActive &&
    state.teleprompterShowDuringRecording &&
    $("includeTeleprompterInRecording") &&
    $("includeTeleprompterInRecording").checked
  ) {

    drawTeleprompterOverlay(
      ctx,
      width,
      height
    );

  }


  /* -------------------------------------------------------
     Recording indicator
     ------------------------------------------------------- */

  if (state.recordingActive) {

    drawRecordingIndicator(
      ctx,
      width,
      height
    );

  }

}


/* =========================================================
   MAIN CONTENT
   ========================================================= */

function drawMainContent(
  ctx,
  width,
  height
) {

  const image =
    $("mainImage");

  const video =
    $("mainVideo");


  if (
    state.mainType === "image" &&
    image &&
    image.complete &&
    image.naturalWidth > 0
  ) {

    drawContain(
      ctx,
      image,
      0,
      0,
      width,
      height
    );

    return;
  }


  if (
    state.mainType === "video" &&
    video &&
    video.readyState >= 2
  ) {

    drawContain(
      ctx,
      video,
      0,
      0,
      width,
      height
    );

    return;
  }


  drawStagePlaceholder(
    ctx,
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

  const scale =
    Math.min(
      width / sourceWidth,
      height / sourceHeight
    );

  const drawWidth =
    sourceWidth * scale;

  const drawHeight =
    sourceHeight * scale;

  const drawX =
    x +
    (width - drawWidth) / 2;

  const drawY =
    y +
    (height - drawHeight) / 2;

  ctx.drawImage(
    source,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );
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

  const scale =
    Math.max(
      width / sourceWidth,
      height / sourceHeight
    );

  const drawWidth =
    sourceWidth * scale;

  const drawHeight =
    sourceHeight * scale;

  const drawX =
    x +
    (width - drawWidth) / 2;

  const drawY =
    y +
    (height - drawHeight) / 2;

  ctx.drawImage(
    source,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );
}


/* =========================================================
   PLACEHOLDER
   ========================================================= */

function drawStagePlaceholder(
  ctx,
  width,
  height
) {

  const gradient =
    ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.7
    );

  gradient.addColorStop(
    0,
    "#10243d"
  );

  gradient.addColorStop(
    1,
    "#02050a"
  );

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  ctx.fillStyle =
    "rgba(255,255,255,.75)";

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "middle";

  ctx.font =
    "700 46px Arial";

  ctx.fillText(
    "Mentor Studio",
    width / 2,
    height / 2 - 25
  );


  ctx.fillStyle =
    "rgba(255,255,255,.45)";

  ctx.font =
    "24px Arial";

  ctx.fillText(
    "Upload your main content to begin",
    width / 2,
    height / 2 + 30
  );

}


/* =========================================================
   MENTOR COMPOSITION
   ========================================================= */

function drawMentorComposition(
  ctx,
  width,
  height
) {

  const card =
    $("mentorCard");

  if (!card) {
    return;
  }

  const stage =
    $("stage");

  if (!stage) {
    return;
  }

  const stageRect =
    stage.getBoundingClientRect();

  const cardRect =
    card.getBoundingClientRect();

  if (
    !stageRect.width ||
    !stageRect.height
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
    (cardRect.left -
      stageRect.left) *
    scaleX;

  const y =
    (cardRect.top -
      stageRect.top) *
    scaleY;

  const cardWidth =
    cardRect.width *
    scaleX;

  const cardHeight =
    cardRect.height *
    scaleY;


  /* -------------------------------------------------------
     Clip rounded mentor frame
     ------------------------------------------------------- */

  ctx.save();

  roundedRectPath(
    ctx,
    x,
    y,
    cardWidth,
    cardHeight,
    18 * scaleX
  );

  ctx.clip();


  /* -------------------------------------------------------
     AI Canvas
     ------------------------------------------------------- */

  const aiCanvas =
    $("mentorAICanvas");

  if (
    state.backgroundMode !== "original" &&
    aiCanvas &&
    aiCanvas.width > 0 &&
    aiCanvas.height > 0
  ) {

    ctx.drawImage(
      aiCanvas,
      x,
      y,
      cardWidth,
      cardHeight
    );

    ctx.restore();

    drawMentorBorder(
      ctx,
      x,
      y,
      cardWidth,
      cardHeight
    );

    return;
  }


  /* -------------------------------------------------------
     Mentor video
     ------------------------------------------------------- */

  const mentorVideo =
    $("mentorVideo");

  const cameraVideo =
    $("mentorCameraVideo");


  if (
    state.mentorSource === "video" &&
    mentorVideo &&
    mentorVideo.readyState >= 2
  ) {

    drawCover(
      ctx,
      mentorVideo,
      x,
      y,
      cardWidth,
      cardHeight
    );

  }
  else if (
    state.mentorSource === "camera" &&
    cameraVideo &&
    cameraVideo.readyState >= 2
  ) {

    ctx.save();

    ctx.translate(
      x + cardWidth,
      y
    );

    ctx.scale(
      -1,
      1
    );

    drawCover(
      ctx,
      cameraVideo,
      0,
      0,
      cardWidth,
      cardHeight
    );

    ctx.restore();

  }
  else {

    ctx.fillStyle =
      "#0a111d";

    ctx.fillRect(
      x,
      y,
      cardWidth,
      cardHeight
    );

    ctx.fillStyle =
      "rgba(255,255,255,.55)";

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.font =
      `${Math.max(18, cardWidth * 0.07)}px Arial`;

    ctx.fillText(
      "Mentor",
      x + cardWidth / 2,
      y + cardHeight / 2
    );

  }


  ctx.restore();


  drawMentorBorder(
    ctx,
    x,
    y,
    cardWidth,
    cardHeight
  );

}


/* =========================================================
   MENTOR BORDER
   ========================================================= */

function drawMentorBorder(
  ctx,
  x,
  y,
  width,
  height
) {

  ctx.save();

  roundedRectPath(
    ctx,
    x,
    y,
    width,
    height,
    18
  );

  ctx.strokeStyle =
    "rgba(255,255,255,.18)";

  ctx.lineWidth =
    3;

  ctx.stroke();

  ctx.restore();

}


/* =========================================================
   ROUNDED RECT PATH
   ========================================================= */

function roundedRectPath(
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
   RECORDING INDICATOR
   ========================================================= */

function drawRecordingIndicator(
  ctx,
  width,
  height
) {

  const padding =
    width * 0.025;

  const boxWidth =
    width * 0.16;

  const boxHeight =
    height * 0.045;

  const x =
    padding;

  const y =
    padding;


  ctx.save();

  roundedRectPath(
    ctx,
    x,
    y,
    boxWidth,
    boxHeight,
    10
  );

  ctx.fillStyle =
    "rgba(180,15,35,.84)";

  ctx.fill();


  ctx.fillStyle =
    "#fff";

  ctx.beginPath();

  ctx.arc(
    x + boxHeight * 0.5,
    y + boxHeight * 0.5,
    boxHeight * 0.13,
    0,
    Math.PI * 2
  );

  ctx.fill();


  ctx.textAlign =
    "left";

  ctx.textBaseline =
    "middle";

  ctx.font =
    `800 ${Math.max(12, width * 0.006)}px Arial`;

  ctx.fillText(
    "REC",
    x + boxHeight,
    y + boxHeight / 2
  );


  ctx.font =
    `700 ${Math.max(12, width * 0.006)}px monospace`;

  ctx.fillText(
    formatRecordingTime(
      state.recordingElapsed
    ),
    x + boxHeight * 2.6,
    y + boxHeight / 2
  );

  ctx.restore();

}


/* =========================================================
   INITIALIZE MEDIA CONTROLS
   ========================================================= */

function initializeMediaControls() {

  on(
    "uploadMainBtn",
    "click",
    () => $("mainFileInput")?.click()
  );

  on(
    "uploadMainBtnToolbar",
    "click",
    () => $("mainFileInput")?.click()
  );

  on(
    "uploadMainSideBtn",
    "click",
    () => $("mainFileInput")?.click()
  );

  on(
    "uploadVideoBtn",
    "click",
    () => $("mainVideoInput")?.click()
  );

  on(
    "uploadVideoSideBtn",
    "click",
    () => $("mainVideoInput")?.click()
  );

  on(
    "uploadMentorBtn",
    "click",
    () => $("mentorFileInput")?.click()
  );

  on(
    "uploadMentorSideBtn",
    "click",
    () => $("mentorFileInput")?.click()
  );

  on(
    "uploadMentorFileSideBtn",
    "click",
    () => $("mentorFileInput")?.click()
  );


  on(
    "mainPlayBtn",
    "click",
    playMainVideo
  );

  on(
    "mainPauseBtn",
    "click",
    pauseMainVideo
  );


  const mainVideo =
    $("mainVideo");

  if (mainVideo) {

    mainVideo.addEventListener(
      "play",
      () => {

        updateStageSource(
          "PLAYING"
        );

      }
    );

    mainVideo.addEventListener(
      "pause",
      () => {

        if (!state.recordingActive) {

          updateStageSource(
            "PAUSED"
          );

        }

      }
    );

    mainVideo.addEventListener(
      "ended",
      () => {

        if (!state.recordingActive) {

          updateStageSource(
            "ENDED"
          );

        }

      }
    );

  }

}


function playMainVideo() {

  const video =
    $("mainVideo");

  if (
    !video ||
    state.mainType !== "video"
  ) {

    showToast(
      "Please upload a main video first.",
      "info"
    );

    return;
  }

  ensureAudioContext();

  video.play()
    .catch(
      error => {

        console.warn(
          "Main video play failed:",
          error
        );

      }
    );

}


function pauseMainVideo() {

  const video =
    $("mainVideo");

  if (!video) {
    return;
  }

  video.pause();

}


/* =========================================================
   FILE INPUTS
   ========================================================= */

function initializeFileInputs() {

  on(
    "mainFileInput",
    "change",
    handleMainImageUpload
  );

  on(
    "mainVideoInput",
    "change",
    handleMainVideoUpload
  );

  on(
    "mentorFileInput",
    "change",
    handleMentorVideoUpload
  );

  on(
    "backgroundImageUpload",
    "change",
    handleBackgroundUpload
  );

  on(
    "teleprompterFileInput",
    "change",
    handleTeleprompterFile
  );

}


function handleMainImageUpload(event) {

  const file =
    event.target.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {

    showToast(
      "Please select an image file.",
      "error"
    );

    return;
  }

  if (state.mainImageUrl) {

    URL.revokeObjectURL(
      state.mainImageUrl
    );

  }

  const url =
    URL.createObjectURL(file);

  state.mainImageUrl =
    url;

  state.mainType =
    "image";


  const image =
    $("mainImage");

  const video =
    $("mainVideo");

  if (image) {

    image.src =
      url;

    image.style.display =
      "block";

  }

  if (video) {

    video.pause();

    video.style.display =
      "none";

  }

  $("welcomeContent") &&
    ($("welcomeContent").style.display =
      "none");

  updateStageSource(
    "IMAGE"
  );

  showToast(
    "Main image loaded.",
    "success"
  );

  event.target.value = "";

}


function handleMainVideoUpload(event) {

  const file =
    event.target.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("video/")) {

    showToast(
      "Please select a video file.",
      "error"
    );

    return;
  }

  if (state.mainVideoUrl) {

    URL.revokeObjectURL(
      state.mainVideoUrl
    );

  }

  const url =
    URL.createObjectURL(file);

  state.mainVideoUrl =
    url;

  state.mainType =
    "video";


  const image =
    $("mainImage");

  const video =
    $("mainVideo");


  if (image) {

    image.style.display =
      "none";

  }

  if (video) {

    video.src =
      url;

    video.style.display =
      "block";

    video.load();

  }


  $("welcomeContent") &&
    ($("welcomeContent").style.display =
      "none");


  connectMainVideoAudio();

  updateStageSource(
    "VIDEO"
  );

  showToast(
    "Main video loaded.",
    "success"
  );

  event.target.value = "";

}


/* =========================================================
   MENTOR VIDEO
   ========================================================= */

function handleMentorVideoUpload(event) {

  const file =
    event.target.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("video/")) {

    showToast(
      "Please select a mentor video.",
      "error"
    );

    return;
  }

  stopCamera();

  if (state.mentorVideoUrl) {

    URL.revokeObjectURL(
      state.mentorVideoUrl
    );

  }

  const url =
    URL.createObjectURL(file);

  state.mentorVideoUrl =
    url;

  state.mentorSource =
    "video";


  const video =
    $("mentorVideo");

  const camera =
    $("mentorCameraVideo");

  const canvas =
    $("mentorAICanvas");

  const placeholder =
    $("mentorPlaceholder");


  if (video) {

    video.src =
      url;

    video.style.display =
      "block";

    video.loop =
      true;

    video.muted =
      true;

    video.play()
      .catch(
        () => {}
      );

  }

  if (camera) {

    camera.style.display =
      "none";

  }

  if (canvas) {

    canvas.style.display =
      "none";

  }

  if (placeholder) {

    placeholder.style.display =
      "none";

  }

  updateMentorSourceLabel(
    "VIDEO"
  );

  updateStageSource(
    "MENTOR VIDEO"
  );

  showToast(
    "Mentor video loaded.",
    "success"
  );

  event.target.value = "";

}


/* =========================================================
   MENTOR DRAG
   ========================================================= */

function initializeDragMentor() {

  const card =
    $("mentorCard");

  if (!card) {
    return;
  }

  let dragging = false;

  let pointerStartX = 0;
  let pointerStartY = 0;

  let cardStartLeft = 0;
  let cardStartTop = 0;


  const resize =
    $("mentorResize");


  function isResizeTarget(target) {

    return (
      resize &&
      (
        target === resize ||
        resize.contains(target)
      )
    );

  }


  function getPoint(event) {

    if (
      event.touches &&
      event.touches.length
    ) {

      return {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };

    }

    return {
      x: event.clientX,
      y: event.clientY
    };

  }


  function start(event) {

    if (
      isResizeTarget(
        event.target
      )
    ) {
      return;
    }

    const point =
      getPoint(event);

    const parent =
      card.parentElement;

    if (!parent) {
      return;
    }

    const parentRect =
      parent.getBoundingClientRect();

    const cardRect =
      card.getBoundingClientRect();

    dragging =
      true;

    pointerStartX =
      point.x;

    pointerStartY =
      point.y;

    cardStartLeft =
      cardRect.left -
      parentRect.left;

    cardStartTop =
      cardRect.top -
      parentRect.top;

    card.style.right =
      "auto";

    card.style.bottom =
      "auto";

    card.style.left =
      `${cardStartLeft}px`;

    card.style.top =
      `${cardStartTop}px`;

    card.setPointerCapture?.(
      event.pointerId
    );

    event.preventDefault();

  }


  function move(event) {

    if (!dragging) {
      return;
    }

    const point =
      getPoint(event);

    const parent =
      card.parentElement;

    if (!parent) {
      return;
    }

    const parentRect =
      parent.getBoundingClientRect();

    const cardRect =
      card.getBoundingClientRect();

    const deltaX =
      point.x -
      pointerStartX;

    const deltaY =
      point.y -
      pointerStartY;

    let left =
      cardStartLeft +
      deltaX;

    let top =
      cardStartTop +
      deltaY;


    left =
      clamp(
        left,
        0,
        parentRect.width -
        cardRect.width
      );

    top =
      clamp(
        top,
        0,
        parentRect.height -
        cardRect.height
      );


    card.style.left =
      `${left}px`;

    card.style.top =
      `${top}px`;

    event.preventDefault();

  }


  function end() {

    dragging =
      false;

  }


  card.addEventListener(
    "pointerdown",
    start
  );

  window.addEventListener(
    "pointermove",
    move
  );

  window.addEventListener(
    "pointerup",
    end
  );

}


/* =========================================================
   MENTOR LABEL
   ========================================================= */

function updateMentorSourceLabel(
  text
) {

  const element =
    $("mentorSourceLabel");

  if (element) {
    element.textContent =
      text;
  }

}


/* =========================================================
   CAMERA CONTROLS
   ========================================================= */

function initializeCameraControls() {

  on(
    "startCameraBtn",
    "click",
    startCamera
  );

  on(
    "startCameraSideBtn",
    "click",
    startCamera
  );

  on(
    "stopCameraBtn",
    "click",
    stopCamera
  );

  on(
    "stopCameraSideBtn",
    "click",
    stopCamera
  );

  on(
    "switchCameraSideBtn",
    "click",
    switchCamera
  );


  on(
    "cameraQuality",
    "change",
    async event => {

      await updateCameraSettings(
        event.target.value,
        $("cameraFps")?.value
      );

    }
  );


  on(
    "cameraFps",
    "change",
    async event => {

      await updateCameraSettings(
        $("cameraQuality")?.value,
        event.target.value
      );

    }
  );


  on(
    "cameraDeviceSelect",
    "change",
    async event => {

      state.currentCameraDeviceId =
        event.target.value;

      if (state.cameraRunning) {

        await startCamera();

      }

    }
  );


  enumerateCameras();

}


function getCameraResolution(
  quality
) {

  switch (String(quality)) {

    case "360":
      return {
        width: 640,
        height: 360
      };

    case "480":
      return {
        width: 854,
        height: 480
      };

    case "1080":
      return {
        width: 1920,
        height: 1080
      };

    case "720":
    default:
      return {
        width: 1280,
        height: 720
      };

  }

}


async function updateCameraSettings(
  quality,
  fps
) {

  const resolution =
    getCameraResolution(
      quality
    );

  state.cameraWidth =
    resolution.width;

  state.cameraHeight =
    resolution.height;

  state.cameraFps =
    Number(fps) || 30;

  if (state.cameraRunning) {

    await startCamera();

  }

}


async function startCamera() {

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {

    showToast(
      "Camera is not supported in this browser.",
      "error"
    );

    return;

  }


  ensureAudioContext();


  stopCurrentMentorStream();


  const quality =
    $("cameraQuality")?.value ||
    "720";

  const fps =
    Number(
      $("cameraFps")?.value
    ) || 30;


  const resolution =
    getCameraResolution(
      quality
    );


  state.cameraWidth =
    resolution.width;

  state.cameraHeight =
    resolution.height;

  state.cameraFps =
    fps;


  const selectedDevice =
    $("cameraDeviceSelect")?.value ||
    state.currentCameraDeviceId ||
    "";


  const videoConstraints = {

    width: {
      ideal:
        resolution.width
    },

    height: {
      ideal:
        resolution.height
    },

    frameRate: {
      ideal: fps,
      max: fps
    },

    facingMode:
      selectedDevice
        ? undefined
        : state.cameraFacingMode

  };


  if (selectedDevice) {

    videoConstraints.deviceId = {
      exact: selectedDevice
    };

  }


  let stream;


  try {

    stream =
      await navigator.mediaDevices
        .getUserMedia({

          video:
            videoConstraints,

          audio:
            false

        });

  }
  catch (error) {

    console.error(
      "Camera error:",
      error
    );

    showToast(
      getCameraErrorMessage(error),
      "error"
    );

    return;

  }


  state.mentorStream =
    stream;

  state.mentorCameraTrack =
    stream.getVideoTracks()[0] ||
    null;

  state.cameraRunning =
    true;

  state.mentorSource =
    "camera";


  const video =
    $("mentorCameraVideo");

  const mentorVideo =
    $("mentorVideo");

  const canvas =
    $("mentorAICanvas");

  const placeholder =
    $("mentorPlaceholder");


  if (mentorVideo) {

    mentorVideo.pause();

    mentorVideo.style.display =
      "none";

  }


  if (video) {

    video.srcObject =
      stream;

    video.muted =
      true;

    video.playsInline =
      true;

    video.style.display =
      "block";

    await video.play()
      .catch(
        () => {}
      );

  }


  if (canvas) {

    canvas.style.display =
      "none";

  }


  if (placeholder) {

    placeholder.style.display =
      "none";

  }


  updateMentorSourceLabel(
    "CAMERA"
  );

  updateCameraStatus(
    "Live"
  );

  document.body.classList.add(
    "camera-active"
  );

  updateStageSource(
    "CAMERA"
  );


  await enumerateCameras();

  if (
    selectedDevice &&
    $("cameraDeviceSelect")
  ) {

    $("cameraDeviceSelect").value =
      selectedDevice;

  }


  if (
    state.backgroundMode !== "original"
  ) {

    await initializeSegmentation();

  }


  showToast(
    "Camera started.",
    "success"
  );

}


function stopCurrentMentorStream() {

  if (!state.mentorStream) {
    return;
  }

  state.mentorStream
    .getTracks()
    .forEach(
      track => track.stop()
    );

  state.mentorStream =
    null;

  state.mentorCameraTrack =
    null;

}


function stopCamera() {

  stopCurrentMentorStream();

  state.cameraRunning =
    false;

  if ($("mentorCameraVideo")) {

    $("mentorCameraVideo").pause();

    $("mentorCameraVideo").srcObject =
      null;

    $("mentorCameraVideo").style.display =
      "none";

  }


  if (
    state.mentorSource === "camera"
  ) {

    state.mentorSource =
      "none";

  }


  updateCameraStatus(
    "Offline"
  );

  document.body.classList.remove(
    "camera-active"
  );


  if (
    state.mentorSource === "none"
  ) {

    const placeholder =
      $("mentorPlaceholder");

    if (placeholder) {

      placeholder.style.display =
        "flex";

    }

    updateMentorSourceLabel(
      "CAMERA"
    );

  }


  showToast(
    "Camera stopped.",
    "info"
  );

}


async function switchCamera() {

  state.cameraFacingMode =
    state.cameraFacingMode === "user"
      ? "environment"
      : "user";


  state.currentCameraDeviceId =
    "";


  if (state.cameraRunning) {

    await startCamera();

  }

}


function updateCameraStatus(
  text
) {

  const status =
    $("cameraStatus");

  if (status) {
    status.textContent =
      text;
  }

}


function getCameraErrorMessage(
  error
) {

  if (!error) {
    return "Unable to start camera.";
  }

  if (
    error.name ===
    "NotAllowedError"
  ) {

    return "Camera permission was denied.";

  }

  if (
    error.name ===
    "NotFoundError"
  ) {

    return "No camera device was found.";

  }

  if (
    error.name ===
    "NotReadableError"
  ) {

    return "Camera is already being used by another application.";

  }

  if (
    error.name ===
    "OverconstrainedError"
  ) {

    return "Selected camera quality is not available.";

  }

  return (
    error.message ||
    "Unable to start camera."
  );

}


/* =========================================================
   CAMERA DEVICE ENUMERATION
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
      await navigator.mediaDevices
        .enumerateDevices();

    const cameras =
      devices.filter(
        device =>
          device.kind ===
          "videoinput"
      );


    const select =
      $("cameraDeviceSelect");

    if (!select) {
      return;
    }


    const current =
      state.currentCameraDeviceId ||
      select.value;


    select.innerHTML = "";


    const defaultOption =
      document.createElement("option");

    defaultOption.value =
      "";

    defaultOption.textContent =
      cameras.length
        ? "Default Camera"
        : "No Camera Found";

    select.appendChild(
      defaultOption
    );


    cameras.forEach(
      (camera, index) => {

        const option =
          document.createElement(
            "option"
          );

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


    if (current) {

      select.value =
        current;

    }

  }
  catch (error) {

    console.warn(
      "Unable to enumerate cameras:",
      error
    );

  }

}


/* =========================================================
   AI INITIALIZATION
   ========================================================= */

function initializeAI() {

  state.sourceCanvas =
    document.createElement(
      "canvas"
    );

  state.sourceCtx =
    state.sourceCanvas.getContext(
      "2d",
      {
        willReadFrequently: true
      }
    );


  state.maskCanvas =
    document.createElement(
      "canvas"
    );

  state.maskCtx =
    state.maskCanvas.getContext(
      "2d",
      {
        willReadFrequently: true
      }
    );


  state.personCanvas =
    document.createElement(
      "canvas"
    );

  state.personCtx =
    state.personCanvas.getContext(
      "2d",
      {
        willReadFrequently: false
      }
    );

}


async function initializeSegmentation() {

  if (
    state.segmentationReady &&
    state.segmentation
  ) {
    return;
  }


  if (
    typeof SelfieSegmentation ===
    "undefined"
  ) {

    showToast(
      "AI background library could not load.",
      "error"
    );

    return;

  }


  try {

    state.segmentation =
      new SelfieSegmentation({

        locateFile:
          file =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`

      });


    state.segmentation.setOptions({

      modelSelection: 1

    });


    state.segmentation.onResults(
      handleSegmentationResults
    );


    state.segmentationReady =
      true;


    showToast(
      "AI background ready.",
      "success"
    );

  }
  catch (error) {

    console.error(
      "Segmentation initialization failed:",
      error
    );

    state.segmentation =
      null;

    state.segmentationReady =
      false;

    showToast(
      "AI background initialization failed.",
      "error"
    );

  }

}


/* =========================================================
   SEGMENTATION FRAME
   ========================================================= */

async function processSegmentationFrame() {

  if (
    !state.segmentationReady ||
    !state.segmentation ||
    state.segmentationBusy
  ) {
    return;
  }


  const source =
    getMentorSourceVideo();


  if (
    !source ||
    source.readyState < 2 ||
    !source.videoWidth
  ) {
    return;
  }


  state.segmentationBusy =
    true;


  try {

    const maxWidth =
      640;

    const scale =
      Math.min(
        1,
        maxWidth /
        source.videoWidth
      );


    const width =
      Math.max(
        1,
        Math.floor(
          source.videoWidth *
          scale
        )
      );

    const height =
      Math.max(
        1,
        Math.floor(
          source.videoHeight *
          scale
        )
      );


    prepareAICanvases(
      width,
      height
    );


    state.sourceCtx.drawImage(
      source,
      0,
      0,
      width,
      height
    );


    await state.segmentation.send({
      image:
        state.sourceCanvas
    });

  }
  catch (error) {

    console.warn(
      "Segmentation frame failed:",
      error
    );

  }
  finally {

    state.segmentationBusy =
      false;

  }

}


function prepareAICanvases(
  width,
  height
) {

  state.aiFrameWidth =
    width;

  state.aiFrameHeight =
    height;


  const canvases = [
    state.sourceCanvas,
    state.maskCanvas,
    state.personCanvas
  ];


  canvases.forEach(
    canvas => {

      if (
        canvas.width !== width ||
        canvas.height !== height
      ) {

        canvas.width =
          width;

        canvas.height =
          height;

      }

    }
  );

}


/* =========================================================
   SEGMENTATION RESULTS
   ========================================================= */

function handleSegmentationResults(
  results
) {

  const mask =
    results?.segmentationMask;


  if (!mask) {
    return;
  }


  const width =
    state.aiFrameWidth;

  const height =
    state.aiFrameHeight;


  if (
    !width ||
    !height
  ) {
    return;
  }


  const maskCtx =
    state.maskCtx;

  const sourceCtx =
    state.sourceCtx;

  const personCtx =
    state.personCtx;


  maskCtx.clearRect(
    0,
    0,
    width,
    height
  );


  maskCtx.drawImage(
    mask,
    0,
    0,
    width,
    height
  );


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


  const output =
    personCtx.createImageData(
      width,
      height
    );


  const src =
    sourceData.data;

  const maskPixels =
    maskData.data;

  const dst =
    output.data;


  for (
    let i = 0;
    i < src.length;
    i += 4
  ) {

    const confidence =
      maskPixels[i] / 255;


    /*
     * Smooth confidence edge.
     */

    const alpha =
      clamp(
        (confidence - 0.15) /
        0.65,
        0,
        1
      );


    dst[i] =
      src[i];

    dst[i + 1] =
      src[i + 1];

    dst[i + 2] =
      src[i + 2];

    dst[i + 3] =
      Math.round(
        alpha * 255
      );

  }


  personCtx.putImageData(
    output,
    0,
    0
  );


  drawAIComposite(
    width,
    height
  );


}


/* =========================================================
   AI COMPOSITE
   ========================================================= */

function drawAIComposite(
  width,
  height
) {

  const output =
    $("mentorAICanvas");

  if (!output) {
    return;
  }


  if (
    output.width !== width ||
    output.height !== height
  ) {

    output.width =
      width;

    output.height =
      height;

  }


  const ctx =
    output.getContext(
      "2d"
    );


  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  /* -------------------------------------------------------
     Background
     ------------------------------------------------------- */

  if (
    state.backgroundMode ===
    "blur"
  ) {

    ctx.save();

    ctx.filter =
      "blur(18px)";

    ctx.drawImage(
      state.sourceCanvas,
      0,
      0,
      width,
      height
    );

    ctx.restore();

  }
  else if (
    state.backgroundMode ===
    "custom"
  ) {

    if (
      state.customBackgroundImage
    ) {

      drawCover(
        ctx,
        state.customBackgroundImage,
        0,
        0,
        width,
        height
      );

    }
    else {

      ctx.fillStyle =
        "#101827";

      ctx.fillRect(
        0,
        0,
        width,
        height
      );

    }

  }
  else if (
    state.backgroundMode ===
    "color"
  ) {

    const color =
      $("backgroundColor")?.value ||
      "#101827";

    ctx.fillStyle =
      color;

    ctx.fillRect(
      0,
      0,
      width,
      height
    );

  }
  else if (
    state.backgroundMode ===
    "remove"
  ) {

    ctx.fillStyle =
      "transparent";

  }
  else {

    /*
     * Original mode.
     */

    ctx.drawImage(
      state.sourceCanvas,
      0,
      0,
      width,
      height
    );

    output.style.display =
      "block";

    return;

  }


  /* -------------------------------------------------------
     Person layer
     ------------------------------------------------------- */

  ctx.drawImage(
    state.personCanvas,
    0,
    0,
    width,
    height
  );


  output.style.display =
    "block";

}


/* =========================================================
   AI SOURCE VIDEO
   ========================================================= */

function getMentorSourceVideo() {

  if (
    state.mentorSource ===
    "camera"
  ) {

    return $("mentorCameraVideo");

  }

  if (
    state.mentorSource ===
    "video"
  ) {

    return $("mentorVideo");

  }

  return null;

}


/* =========================================================
   BACKGROUND CONTROLS
   ========================================================= */

function initializeBackgroundControls() {

  on(
    "bgOriginalBtn",
    "click",
    () => setBackgroundMode("original")
  );

  on(
    "bgRemoveBtn",
    "click",
    () => setBackgroundMode("remove")
  );

  on(
    "bgBlurBtn",
    "click",
    () => setBackgroundMode("blur")
  );

  on(
    "bgImageBtn",
    "click",
    () => setBackgroundMode("custom")
  );

  on(
    "bgColorBtn",
    "click",
    () => setBackgroundMode("color")
  );


  on(
    "backgroundColor",
    "input",
    () => {

      if (
        state.backgroundMode ===
        "color"
      ) {

        updateAIBackground();

      }

    }
  );


  on(
    "uploadBackgroundSideBtn",
    "click",
    () => $("backgroundImageUpload")?.click()
  );


  on(
    "backgroundUploadBox",
    "click",
    event => {

      if (
        event.target.closest("button")
      ) {
        return;
      }

      $("backgroundImageUpload")?.click();

    }
  );

}


async function setBackgroundMode(
  mode
) {

  state.backgroundMode =
    mode;


  updateBackgroundButtons();


  if (
    mode !== "original"
  ) {

    await initializeSegmentation();

  }


  updateAIBackground();

}


function updateBackgroundButtons() {

  const map = {

    original:
      $("bgOriginalBtn"),

    remove:
      $("bgRemoveBtn"),

    blur:
      $("bgBlurBtn"),

    custom:
      $("bgImageBtn"),

    color:
      $("bgColorBtn")

  };


  Object.entries(map)
    .forEach(
      ([mode, button]) => {

        if (!button) {
          return;
        }

        button.classList.toggle(
          "active",
          mode ===
          state.backgroundMode
        );

      }
    );

}


function updateAIBackground() {

  const canvas =
    $("mentorAICanvas");

  const source =
    getMentorSourceVideo();


  if (
    state.backgroundMode ===
    "original"
  ) {

    if (canvas) {

      canvas.style.display =
        "none";

    }

    return;

  }


  if (
    !source ||
    source.readyState < 2
  ) {

    showToast(
      "Start the mentor camera or upload a mentor video first.",
      "info"
    );

    return;

  }


  if (canvas) {

    canvas.style.display =
      "block";

  }


  processSegmentationFrame();

}


function handleBackgroundUpload(
  event
) {

  const file =
    event.target.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {

    showToast(
      "Please select an image background.",
      "error"
    );

    return;

  }


  const url =
    URL.createObjectURL(file);


  const image =
    new Image();

  image.onload = () => {

    state.customBackgroundImage =
      image;

    setBackgroundMode(
      "custom"
    );

    showToast(
      "Custom background loaded.",
      "success"
    );

    URL.revokeObjectURL(
      url
    );

  };


  image.onerror = () => {

    URL.revokeObjectURL(
      url
    );

    showToast(
      "Unable to load background image.",
      "error"
    );

  };


  image.src =
    url;


  event.target.value = "";

}


/* =========================================================
   AI FRAME LOOP
   ========================================================= */

setInterval(
  () => {

    if (
      state.backgroundMode !==
      "original"
    ) {

      processSegmentationFrame();

    }

  },
  80
);


/* =========================================================
   SCREEN CAPTURE
   ========================================================= */

function initializeScreenCapture() {

  on(
    "startScreenCaptureBtn",
    "click",
    startScreenCapture
  );

  on(
    "startScreenCaptureSideBtn",
    "click",
    startScreenCapture
  );

  on(
    "stopScreenCaptureBtn",
    "click",
    stopScreenCapture
  );

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


  ensureAudioContext();


  try {

    const stream =
      await navigator.mediaDevices
        .getDisplayMedia({

          video: {
            frameRate: {
              ideal:
                state.recordingFps
            }
          },

          audio: true

        });


    state.screenStream =
      stream;

    state.screenVideoTrack =
      stream.getVideoTracks()[0] ||
      null;

    state.screenCaptureRunning =
      true;


    const video =
      $("screenCaptureVideo");


    if (video) {

      video.srcObject =
        stream;

      video.muted =
        true;

      video.style.display =
        "block";

      await video.play()
        .catch(
          () => {}
        );

    }


    updateScreenStatus(
      "Live"
    );

    document.body.classList.add(
      "screen-active"
    );


    const track =
      stream.getVideoTracks()[0];

    if (track) {

      track.addEventListener(
        "ended",
        stopScreenCapture
      );

    }


    showToast(
      "Screen capture started.",
      "success"
    );

  }
  catch (error) {

    console.warn(
      "Screen capture cancelled:",
      error
    );

    showToast(
      "Screen capture was cancelled.",
      "info"
    );

  }

}


function stopScreenCapture() {

  if (state.screenStream) {

    state.screenStream
      .getTracks()
      .forEach(
        track =>
          track.stop()
      );

  }


  state.screenStream =
    null;

  state.screenVideoTrack =
    null;

  state.screenCaptureRunning =
    false;


  const video =
    $("screenCaptureVideo");


  if (video) {

    video.pause();

    video.srcObject =
      null;

    video.style.display =
      "none";

  }


  updateScreenStatus(
    "Ready"
  );

  document.body.classList.remove(
    "screen-active"
  );

}


function updateScreenStatus(
  text
) {

  const status =
    $("screenCaptureStatus");

  const light =
    $("screenCaptureStatusLight");

  if (status) {
    status.textContent =
      text;
  }

  if (light) {

    light.classList.toggle(
      "active",
      state.screenCaptureRunning
    );

  }

}


/* =========================================================
   AUDIO ENGINE
   ========================================================= */

function initializeAudio() {

  on(
    "mainVideoAudioCheckbox",
    "change",
    event => {

      const enabled =
        event.target.checked;

      if (
        state.mainVideoGainNode
      ) {

        state.mainVideoGainNode.gain.value =
          enabled
            ? state.mainVolume
            : 0;

      }

      updateAudioIndicator();

    }
  );


  on(
    "mainVideoVolume",
    "input",
    event => {

      state.mainVolume =
        Number(event.target.value) /
        100;

      updateMainVolumeLabel();

      if (
        state.mainVideoGainNode
      ) {

        const enabled =
          $("mainVideoAudioCheckbox")?.checked !== false;

        state.mainVideoGainNode.gain.value =
          enabled
            ? state.mainVolume
            : 0;

      }

    }
  );


  on(
    "micVolume",
    "input",
    event => {

      state.micVolume =
        Number(event.target.value) /
        100;

      updateMicVolumeLabel();

      if (
        state.micGainNode
      ) {

        state.micGainNode.gain.value =
          state.micEnabled
            ? state.micVolume
            : 0;

      }

      window.CourseStudioMicVolume =
        state.micVolume;

    }
  );


  on(
    "micEnabled",
    "change",
    event => {

      state.micEnabled =
        event.target.checked;

      if (
        state.micGainNode
      ) {

        state.micGainNode.gain.value =
          state.micEnabled
            ? state.micVolume
            : 0;

      }

      window.CourseStudioMicEnabled =
        state.micEnabled;

      updateMicIndicator();

    }
  );


  on(
    "micMonitor",
    "change",
    event => {

      state.micMonitor =
        event.target.checked;

      updateMicMonitor();

      window.CourseStudioMicMonitor =
        state.micMonitor;

    }
  );


  setupMicrophoneCapture();

}


function ensureAudioContext() {

  if (
    state.audioContext
  ) {

    if (
      state.audioContext.state ===
      "suspended"
    ) {

      state.audioContext.resume()
        .catch(
          () => {}
        );

    }

    return state.audioContext;

  }


  try {

    state.audioContext =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

    state.masterDestination =
      state.audioContext
        .createMediaStreamDestination();


    return state.audioContext;

  }
  catch (error) {

    console.error(
      "AudioContext error:",
      error
    );

    return null;

  }

}


/* =========================================================
   MAIN VIDEO AUDIO
   ========================================================= */

function connectMainVideoAudio() {

  const video =
    $("mainVideo");

  if (
    !video ||
    !state.audioContext
  ) {
    return;
  }


  if (
    state.mainVideoSourceNode
  ) {
    return;
  }


  try {

    state.mainVideoSourceNode =
      state.audioContext
        .createMediaElementSource(
          video
        );


    state.mainVideoGainNode =
      state.audioContext
        .createGain();


    state.mainAudioAnalyser =
      state.audioContext
        .createAnalyser();


    state.mainAudioAnalyser.fftSize =
      256;


    state.mainVideoSourceNode
      .connect(
        state.mainVideoGainNode
      );


    state.mainVideoGainNode
      .connect(
        state.mainAudioAnalyser
      );


    state.mainAudioAnalyser
      .connect(
        state.audioContext.destination
      );


    state.mainVideoGainNode
      .connect(
        state.masterDestination
      );


    const enabled =
      $("mainVideoAudioCheckbox")?.checked !== false;


    state.mainVideoGainNode.gain.value =
      enabled
        ? state.mainVolume
        : 0;

  }
  catch (error) {

    console.warn(
      "Main video audio setup failed:",
      error
    );

  }

}


/* =========================================================
   MICROPHONE
   ========================================================= */

async function setupMicrophoneCapture() {

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    return;
  }


  ensureAudioContext();


  try {

    const stream =
      await navigator.mediaDevices
        .getUserMedia({

          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },

          video: false

        });


    state.micStream =
      stream;


    state.micSourceNode =
      state.audioContext
        .createMediaStreamSource(
          stream
        );


    state.micGainNode =
      state.audioContext
        .createGain();


    state.micAnalyser =
      state.audioContext
        .createAnalyser();


    state.micAnalyser.fftSize =
      1024;


    state.micSourceNode
      .connect(
        state.micGainNode
      );


    state.micGainNode
      .connect(
        state.micAnalyser
      );


    state.micGainNode
      .connect(
        state.masterDestination
      );


    state.micMonitorGain =
      state.audioContext
        .createGain();


    state.micAnalyser
      .connect(
        state.micMonitorGain
      );


    state.micMonitorGain
      .connect(
        state.audioContext.destination
      );


    state.micGainNode.gain.value =
      state.micEnabled
        ? state.micVolume
        : 0;


    updateMicMonitor();


    updateMicIndicator();


  }
  catch (error) {

    console.warn(
      "Microphone unavailable:",
      error
    );

    state.micStream =
      null;

    updateMicStatusText(
      "Mic unavailable"
    );

  }

}


function updateMicMonitor() {

  if (
    !state.micMonitorGain
  ) {
    return;
  }

  state.micMonitorGain.gain.value =
    state.micMonitor
      ? 1
      : 0;

}


function updateMainVolumeLabel() {

  const element =
    $("mainVolumeValue");

  if (element) {

    element.textContent =
      `${Math.round(
        state.mainVolume * 100
      )}%`;

  }

}


function updateMicVolumeLabel() {

  const element =
    $("micVolumeValue");

  if (element) {

    element.textContent =
      `${Math.round(
        state.micVolume * 100
      )}%`;

  }

}


function updateMicStatusText(
  text
) {

  const elements =
    document.querySelectorAll(
      "[data-mic-status]"
    );

  elements.forEach(
    element => {

      element.textContent =
        text;

    }
  );

}


function updateMicIndicator() {

  if (
    state.micEnabled &&
    state.micStream
  ) {

    document.body.classList.add(
      "mic-active"
    );

    updateMicStatusText(
      "Mic On"
    );

  }
  else {

    document.body.classList.remove(
      "mic-active"
    );

    updateMicStatusText(
      "Mic Off"
    );

  }

}


function updateAudioIndicator() {

  const enabled =
    $("mainVideoAudioCheckbox")?.checked !== false;

  const indicator =
    $("audioIndicator");

  if (!indicator) {
    return;
  }

  indicator.style.color =
    enabled
      ? ""
      : "var(--text-muted)";

}


/* =========================================================
   AUDIO VISUALIZATION
   ========================================================= */

function audioVisualizationLoop(
  timestamp
) {

  updateAudioMeters();

  drawMicWaveform();

  requestAnimationFrame(
    audioVisualizationLoop
  );

}


function getAnalyserLevel(
  analyser
) {

  if (!analyser) {
    return 0;
  }

  const buffer =
    new Uint8Array(
      analyser.fftSize
    );

  analyser.getByteTimeDomainData(
    buffer
  );


  let sum = 0;

  for (
    let i = 0;
    i < buffer.length;
    i++
  ) {

    const value =
      (buffer[i] - 128) /
      128;

    sum +=
      value * value;

  }


  const rms =
    Math.sqrt(
      sum /
      buffer.length
    );


  return clamp(
    rms * 4,
    0,
    1
  );

}


function updateAudioMeters() {

  const micLevel =
    getAnalyserLevel(
      state.micAnalyser
    );

  const mainLevel =
    getAnalyserLevel(
      state.mainAudioAnalyser
    );


  const micPercent =
    Math.round(
      micLevel * 100
    );

  const mainPercent =
    Math.round(
      mainLevel * 100
    );


  const micValue =
    $("micLevelValue");

  const micBar =
    $("micLevelBar");

  const mainValue =
    $("mainAudioLevelValue");

  const mainBar =
    $("mainAudioLevelBar");


  if (micValue) {
    micValue.textContent =
      `${micPercent}%`;
  }

  if (micBar) {
    micBar.style.width =
      `${micPercent}%`;
  }


  if (mainValue) {
    mainValue.textContent =
      `${mainPercent}%`;
  }

  if (mainBar) {
    mainBar.style.width =
      `${mainPercent}%`;
  }

}


function drawMicWaveform() {

  const canvas =
    $("micWaveformCanvas");

  if (
    !canvas ||
    !state.micAnalyser
  ) {
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
    "#05080d";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  const buffer =
    new Uint8Array(
      state.micAnalyser.fftSize
    );


  state.micAnalyser
    .getByteTimeDomainData(
      buffer
    );


  ctx.beginPath();

  ctx.lineWidth =
    2;

  ctx.strokeStyle =
    "#4da3ff";


  const sliceWidth =
    width /
    buffer.length;


  let x = 0;


  for (
    let i = 0;
    i < buffer.length;
    i++
  ) {

    const value =
      buffer[i] / 128;

    const y =
      value *
      height /
      2;


    if (i === 0) {

      ctx.moveTo(
        x,
        y
      );

    }
    else {

      ctx.lineTo(
        x,
        y
      );

    }


    x +=
      sliceWidth;

  }


  ctx.stroke();

}


/* =========================================================
   TELEPROMPTER
   ========================================================= */

function initializeTeleprompter() {

  on(
    "openTeleprompterTopBtn",
    "click",
    openTeleprompter
  );

  on(
    "openTeleprompterBtn",
    "click",
    openTeleprompter
  );

  on(
    "openTeleprompterSide",
    "click",
    openTeleprompter
  );


  on(
    "uploadTeleprompterBtn",
    "click",
    () => $("teleprompterFileInput")?.click()
  );


  on(
    "teleprompterText",
    "input",
    event => {

      state.teleprompterText =
        event.target.value;

      updateTeleprompterPreview();

    }
  );


  on(
    "teleprompterSpeed",
    "input",
    event => {

      state.teleprompterSpeed =
        Number(event.target.value) || 5;

    }
  );


  on(
    "teleprompterFontSize",
    "input",
    event => {

      state.teleprompterFontSize =
        Number(event.target.value) || 38;

      updateTeleprompterPreview();

    }
  );


  on(
    "teleprompterOpacity",
    "input",
    event => {

      state.teleprompterOpacity =
        Number(event.target.value) /
        100;

      updateTeleprompterPreview();

    }
  );


  on(
    "teleprompterResetBtn",
    "click",
    resetTeleprompter
  );


  on(
    "teleprompterPauseBtn",
    "click",
    pauseTeleprompter
  );


  on(
    "teleprompterPlayBtn",
    "click",
    playTeleprompter
  );


  on(
    "teleprompterSaveBtn",
    "click",
    saveTeleprompter
  );


  on(
    "closeTeleprompterBtn",
    "click",
    closeTeleprompter
  );


  const modal =
    $("teleprompterModal");

  if (modal) {

    const backdrop =
      modal.querySelector(
        ".modal-backdrop"
      );

    backdrop?.addEventListener(
      "click",
      closeTeleprompter
    );

  }


  setInterval(
    updateTeleprompterScroll,
    40
  );

}


function openTeleprompter() {

  const modal =
    $("teleprompterModal");

  if (!modal) {
    return;
  }

  modal.classList.add(
    "open"
  );

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  updateTeleprompterPreview();

}


function closeTeleprompter() {

  const modal =
    $("teleprompterModal");

  if (!modal) {
    return;
  }

  modal.classList.remove(
    "open"
  );

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

}


function updateTeleprompterPreview() {

  const preview =
    $("teleprompterPreview");

  const mini =
    $("teleprompterMiniPreview");


  const text =
    state.teleprompterText ||
    "Your teleprompter preview will appear here.";


  if (preview) {

    const content =
      preview.querySelector(
        ".teleprompter-preview-text"
      );

    if (content) {

      content.textContent =
        text;

      content.style.fontSize =
        `${state.teleprompterFontSize}px`;

      content.style.opacity =
        state.teleprompterOpacity;

    }

  }


  if (mini) {

    const content =
      mini.querySelector(
        ".teleprompter-mini-content"
      );

    if (content) {

      content.textContent =
        text;

    }

  }

}


function updateTeleprompterScroll() {

  if (
    !state.teleprompterPlaying
  ) {
    return;
  }


  const preview =
    $("teleprompterPreview");

  if (!preview) {
    return;
  }


  const now =
    performance.now();


  if (!state.teleprompterLastTime) {

    state.teleprompterLastTime =
      now;

    return;

  }


  const delta =
    now -
    state.teleprompterLastTime;


  state.teleprompterLastTime =
    now;


  state.teleprompterOffset +=
    delta *
    (0.015 +
      state.teleprompterSpeed *
      0.008);


  preview.scrollTop =
    state.teleprompterOffset;

}


function playTeleprompter() {

  state.teleprompterPlaying =
    true;

  state.teleprompterLastTime =
    performance.now();

}


function pauseTeleprompter() {

  state.teleprompterPlaying =
    false;

  state.teleprompterLastTime =
    0;

}


function resetTeleprompter() {

  state.teleprompterOffset =
    0;

  state.teleprompterPlaying =
    false;

  state.teleprompterLastTime =
    0;


  const preview =
    $("teleprompterPreview");

  if (preview) {

    preview.scrollTop =
      0;

  }


  const textarea =
    $("teleprompterText");

  if (textarea) {

    textarea.value =
      "";

  }


  state.teleprompterText =
    "";

  updateTeleprompterPreview();

}


function saveTeleprompter() {

  try {

    localStorage.setItem(
      "pcsMentorTeleprompter",
      JSON.stringify({

        text:
          state.teleprompterText,

        speed:
          state.teleprompterSpeed,

        fontSize:
          state.teleprompterFontSize,

        opacity:
          state.teleprompterOpacity

      })
    );


    showToast(
      "Teleprompter saved.",
      "success"
    );

  }
  catch (error) {

    console.warn(
      "Teleprompter save failed:",
      error
    );

  }

}


function loadTeleprompter() {

  try {

    const raw =
      localStorage.getItem(
        "pcsMentorTeleprompter"
      );

    if (!raw) {
      return;
    }


    const data =
      JSON.parse(raw);


    state.teleprompterText =
      data.text || "";

    state.teleprompterSpeed =
      Number(data.speed) || 5;

    state.teleprompterFontSize =
      Number(data.fontSize) || 38;

    state.teleprompterOpacity =
      Number(data.opacity) || 0.9;


    if ($("teleprompterText")) {

      $("teleprompterText").value =
        state.teleprompterText;

    }

    if ($("teleprompterSpeed")) {

      $("teleprompterSpeed").value =
        state.teleprompterSpeed;

    }

    if ($("teleprompterFontSize")) {

      $("teleprompterFontSize").value =
        state.teleprompterFontSize;

    }

    if ($("teleprompterOpacity")) {

      $("teleprompterOpacity").value =
        Math.round(
          state.teleprompterOpacity *
          100
        );

    }


    updateTeleprompterPreview();

  }
  catch (error) {

    console.warn(
      "Teleprompter load failed:",
      error
    );

  }

}


function handleTeleprompterFile(
  event
) {

  const file =
    event.target.files?.[0];

  if (!file) {
    return;
  }


  const reader =
    new FileReader();


  reader.onload = () => {

    state.teleprompterText =
      String(
        reader.result || ""
      );


    if ($("teleprompterText")) {

      $("teleprompterText").value =
        state.teleprompterText;

    }


    updateTeleprompterPreview();

    openTeleprompter();


    showToast(
      "Teleprompter script loaded.",
      "success"
    );

  };


  reader.onerror = () => {

    showToast(
      "Unable to read teleprompter file.",
      "error"
    );

  };


  reader.readAsText(
    file
  );


  event.target.value =
    "";

}


/* =========================================================
   TELEPROMPTER DRAW
   ========================================================= */

function drawTeleprompterOverlay(
  ctx,
  width,
  height
) {

  if (
    !state.teleprompterText
  ) {
    return;
  }


  const boxWidth =
    width * 0.72;

  const boxHeight =
    height * 0.19;

  const x =
    (width -
      boxWidth) /
    2;

  const y =
    height -
    boxHeight -
    height * 0.08;


  ctx.save();


  roundedRectPath(
    ctx,
    x,
    y,
    boxWidth,
    boxHeight,
    18
  );


  ctx.fillStyle =
    "rgba(0,0,0,.68)";

  ctx.fill();


  ctx.clip();


  ctx.fillStyle =
    `rgba(255,255,255,${state.teleprompterOpacity})`;

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "middle";

  ctx.font =
    `700 ${Math.max(
      22,
      width *
      state.teleprompterFontSize /
      1600
    )}px Arial`;


  const text =
    state.teleprompterText
      .replace(
        /\s+/g,
        " "
      )
      .trim();


  const maxWidth =
    boxWidth -
    70;


  const words =
    text.split(" ");


  const lines = [];

  let line = "";


  for (
    let i = 0;
    i < words.length;
    i++
  ) {

    const test =
      line
        ? `${line} ${words[i]}`
        : words[i];


    if (
      ctx.measureText(test).width >
        maxWidth &&
      line
    ) {

      lines.push(
        line
      );

      line =
        words[i];

    }
    else {

      line =
        test;

    }

  }


  if (line) {
    lines.push(line);
  }


  const maxLines =
    4;


  const visibleLines =
    lines.slice(
      0,
      maxLines
    );


  const lineHeight =
    Math.max(
      30,
      width * 0.018
    );


  const startY =
    y +
    boxHeight / 2 -
    ((visibleLines.length - 1) *
      lineHeight) /
      2;


  visibleLines.forEach(
    (item, index) => {

      ctx.fillText(
        item,
        width / 2,
        startY +
          index *
          lineHeight
      );

    }
  );


  ctx.restore();

}


/* =========================================================
   SETTINGS
   ========================================================= */

function initializeSettings() {

  on(
    "settingsBtn",
    "click",
    openSettings
  );

  on(
    "closeSettingsBtn",
    "click",
    closeSettings
  );

  on(
    "closeSettingsFooterBtn",
    "click",
    closeSettings
  );

  on(
    "saveSettingsBtn",
    "click",
    saveSettings
  );


  const modal =
    $("settingsModal");

  modal?.querySelector(
    ".modal-backdrop"
  )?.addEventListener(
    "click",
    closeSettings
  );


  on(
    "recordingQualitySide",
    "change",
    event => {

      const resolution =
        parseResolution(
          event.target.value
        );

      setCompositionResolution(
        resolution.width,
        resolution.height
      );

    }
  );


  on(
    "recordingFpsSide",
    "change",
    event => {

      state.recordingFps =
        Number(event.target.value) ||
        30;

      state.compositionFps =
        state.recordingFps;

      updateFpsUI();

    }
  );


  on(
    "recordingFormatSide",
    "change",
    event => {

      state.recordingFormat =
        event.target.value;

      updateRecordingFormatUI();

    }
  );


  on(
    "recordingFileNameSide",
    "input",
    event => {

      state.recordingFileName =
        sanitizeFileName(
          event.target.value
        ) ||
        "mentor-course-recording";

      if ($("recordingFileName")) {

        $("recordingFileName").value =
          state.recordingFileName;

      }

    }
  );


  on(
    "includeTeleprompterInRecording",
    "change",
    event => {

      state.teleprompterShowDuringRecording =
        event.target.checked;

    }
  );


  loadTeleprompter();

}


function openSettings() {

  const modal =
    $("settingsModal");

  if (!modal) {
    return;
  }

  syncSettingsInputs();

  modal.classList.add(
    "open"
  );

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

}


function closeSettings() {

  const modal =
    $("settingsModal");

  if (!modal) {
    return;
  }

  modal.classList.remove(
    "open"
  );

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

}


function syncSettingsInputs() {

  if ($("brandNameInput")) {

    $("brandNameInput").value =
      state.brandName;

  }

  if ($("settingsRecordingQuality")) {

    $("settingsRecordingQuality").value =
      `${state.recordingWidth}x${state.recordingHeight}`;

  }

  if ($("settingsRecordingFps")) {

    $("settingsRecordingFps").value =
      String(state.recordingFps);

  }

  if ($("settingsAutoStartTeleprompter")) {

    $("settingsAutoStartTeleprompter").checked =
      state.teleprompterAutoStart;

  }

  if ($("settingsShowTeleprompterRecording")) {

    $("settingsShowTeleprompterRecording").checked =
      state.teleprompterShowDuringRecording;

  }

}


function saveSettings() {

  state.brandName =
    $("brandNameInput")?.value.trim() ||
    "Personal Course Studio";


  const resolutionValue =
    $("settingsRecordingQuality")?.value ||
    "1920x1080";


  const resolution =
    parseResolution(
      resolutionValue
    );


  state.recordingWidth =
    resolution.width;

  state.recordingHeight =
    resolution.height;


  state.recordingFps =
    Number(
      $("settingsRecordingFps")?.value
    ) || 30;


  state.compositionFps =
    state.recordingFps;


  state.teleprompterAutoStart =
    !!$(
      "settingsAutoStartTeleprompter"
    )?.checked;


  state.teleprompterShowDuringRecording =
    !!$(
      "settingsShowTeleprompterRecording"
    )?.checked;


  setCompositionResolution(
    state.recordingWidth,
    state.recordingHeight
  );


  updateFpsUI();


  if ($("recordingQualitySide")) {

    $("recordingQualitySide").value =
      resolutionValue;

  }

  if ($("recordingFpsSide")) {

    $("recordingFpsSide").value =
      String(state.recordingFps);

  }


  if ($("includeTeleprompterInRecording")) {

    $("includeTeleprompterInRecording").checked =
      state.teleprompterShowDuringRecording;

  }


  updateBrandName();

  saveSettingsToStorage();

  closeSettings();


  showToast(
    "Settings saved.",
    "success"
  );

}


function updateBrandName() {

  const element =
    $("brandBadgeText");

  if (element) {

    element.textContent =
      state.brandName;

  }

}


function saveSettingsToStorage() {

  try {

    localStorage.setItem(
      "pcsMentorSettings",
      JSON.stringify({

        brandName:
          state.brandName,

        recordingWidth:
          state.recordingWidth,

        recordingHeight:
          state.recordingHeight,

        recordingFps:
          state.recordingFps,

        recordingFormat:
          state.recordingFormat,

        recordingFileName:
          state.recordingFileName,

        teleprompterAutoStart:
          state.teleprompterAutoStart,

        teleprompterShowDuringRecording:
          state.teleprompterShowDuringRecording

      })
    );

  }
  catch (error) {

    console.warn(
      "Settings save failed:",
      error
    );

  }

}


function loadSavedSettings() {

  try {

    const raw =
      localStorage.getItem(
        "pcsMentorSettings"
      );


    if (!raw) {

      updateBrandName();

      updateResolutionUI();

      updateFpsUI();

      updateRecordingFormatUI();

      updateMainVolumeLabel();

      updateMicVolumeLabel();

      return;

    }


    const data =
      JSON.parse(raw);


    state.brandName =
      data.brandName ||
      state.brandName;


    state.recordingWidth =
      Number(data.recordingWidth) ||
      1920;

    state.recordingHeight =
      Number(data.recordingHeight) ||
      1080;

    state.recordingFps =
      Number(data.recordingFps) ||
      30;

    state.compositionFps =
      state.recordingFps;


    state.recordingFormat =
      data.recordingFormat ||
      "webm-vp9";


    state.recordingFileName =
      data.recordingFileName ||
      "mentor-course-recording";


    state.teleprompterAutoStart =
      !!data.teleprompterAutoStart;


    state.teleprompterShowDuringRecording =
      data.teleprompterShowDuringRecording !== false;


    setCompositionResolution(
      state.recordingWidth,
      state.recordingHeight
    );


    updateBrandName();

    updateFpsUI();

    updateRecordingFormatUI();

    updateMainVolumeLabel();

    updateMicVolumeLabel();


    syncSettingsInputs();


  }
  catch (error) {

    console.warn(
      "Settings load failed:",
      error
    );

  }

}


/* =========================================================
   RECORDING FORMAT
   ========================================================= */

function getRecordingMimeType() {

  const format =
    state.recordingFormat;


  const candidates = [];


  if (format === "mp4") {

    candidates.push(
      'video/mp4;codecs="avc1.42E01E,mp4a.40.2"'
    );

    candidates.push(
      "video/mp4"
    );

  }


  if (
    format === "webm-vp9" ||
    !candidates.length
  ) {

    candidates.push(
      "video/webm;codecs=vp9,opus"
    );

    candidates.push(
      "video/webm"
    );

  }


  if (format === "webm-vp8") {

    candidates.push(
      "video/webm;codecs=vp8,opus"
    );

    candidates.push(
      "video/webm"
    );

  }


  if (
    typeof MediaRecorder ===
    "undefined"
  ) {

    return "";

  }


  for (
    const mime of candidates
  ) {

    if (
      MediaRecorder.isTypeSupported(
        mime
      )
    ) {

      return mime;

    }

  }


  return "";

}


function updateRecordingFormatUI() {

  const textMap = {

    "webm-vp9":
      "WebM VP9",

    "webm-vp8":
      "WebM VP8",

    "mp4":
      "MP4"

  };


  const text =
    textMap[
      state.recordingFormat
    ] ||
    "WebM";


  if ($("recordingFormat")) {

    $("recordingFormat").textContent =
      text;

  }


  if ($("recordingFormatSide")) {

    $("recordingFormatSide").value =
      state.recordingFormat;

  }

}


/* =========================================================
   RECORDING CONTROLS
   ========================================================= */

function initializeRecordingControls() {

  on(
    "recordBtn",
    "click",
    handleRecordButton
  );

  on(
    "recordToolbarBtn",
    "click",
    handleRecordButton
  );

  on(
    "pauseRecordingBtn",
    "click",
    pauseRecording
  );

  on(
    "resumeRecordingBtn",
    "click",
    resumeRecording
  );

  on(
    "stopRecordingBtn",
    "click",
    stopRecording
  );


  updateRecordingButtons();

}


async function handleRecordButton() {

  if (!state.recordingActive) {

    await startRecording();

    return;

  }


  if (
    state.recordingPaused
  ) {

    resumeRecording();

  }
  else {

    pauseRecording();

  }

}


async function startRecording() {

  if (
    state.recordingActive
  ) {
    return;
  }


  if (
    typeof MediaRecorder ===
    "undefined"
  ) {

    showToast(
      "MediaRecorder is not supported in this browser.",
      "error"
    );

    return;

  }


  ensureAudioContext();


  if (
    state.audioContext?.state ===
    "suspended"
  ) {

    await state.audioContext
      .resume()
      .catch(
        () => {}
      );

  }


  const quality =
    $("recordingQualitySide")?.value ||
    `${state.recordingWidth}x${state.recordingHeight}`;


  const resolution =
    parseResolution(
      quality
    );


  state.recordingWidth =
    resolution.width;

  state.recordingHeight =
    resolution.height;


  state.recordingFps =
    Number(
      $("recordingFpsSide")?.value
    ) ||
    state.recordingFps ||
    30;


  state.compositionFps =
    state.recordingFps;


  state.recordingFormat =
    $("recordingFormatSide")?.value ||
    state.recordingFormat;


  state.recordingFileName =
    sanitizeFileName(
      $("recordingFileNameSide")?.value ||
      state.recordingFileName
    ) ||
    "mentor-course-recording";


  setCompositionResolution(
    state.recordingWidth,
    state.recordingHeight
  );


  updateFpsUI();

  updateRecordingFormatUI();


  const mimeType =
    getRecordingMimeType();


  if (!mimeType) {

    if (
      state.recordingFormat ===
      "mp4"
    ) {

      showToast(
        "MP4 recording is not supported by this browser. Please use WebM.",
        "error",
        5000
      );

    }
    else {

      showToast(
        "No supported recording format was found.",
        "error"
      );

    }

    return;

  }


  if (
    state.recordingFormat ===
    "mp4" &&
    !mimeType.startsWith(
      "video/mp4"
    )
  ) {

    showToast(
      "MP4 is not supported here. WebM will be used instead.",
      "info",
      5000
    );

  }


  /*
   * Make sure microphone exists.
   */

  if (
    state.micEnabled &&
    !state.micStream
  ) {

    await setupMicrophoneCapture();

  }


  /*
   * Connect main video audio once.
   */

  if (
    state.mainType ===
    "video"
  ) {

    connectMainVideoAudio();

  }


  /*
   * Create canvas stream.
   */

  const canvasStream =
    state.compositionCanvas
      .captureStream(
        state.recordingFps
      );


  /*
   * Build recording stream.
   */

  const tracks = [
    ...canvasStream.getVideoTracks()
  ];


  if (
    state.masterDestination &&
    state.masterDestination
      .stream
      .getAudioTracks()
      .length
  ) {

    tracks.push(
      ...state.masterDestination
        .stream
        .getAudioTracks()
    );

  }


  /*
   * Optional screen capture audio.
   *
   * The current audio engine is intentionally kept
   * independent from display capture audio to avoid
   * accidental feedback. Screen audio is added if
   * available and supported.
   */

  if (
    state.screenStream
  ) {

    const screenAudioTracks =
      state.screenStream
        .getAudioTracks();

    if (
      screenAudioTracks.length
    ) {

      tracks.push(
        ...screenAudioTracks
      );

    }

  }


  state.recordingStream =
    new MediaStream(
      tracks
    );


  let recorderOptions = {

    mimeType,

    videoBitsPerSecond:
      getVideoBitrate(
        state.recordingWidth,
        state.recordingHeight,
        state.recordingFps
      ),

    audioBitsPerSecond:
      128000

  };


  let recorder;


  try {

    recorder =
      new MediaRecorder(
        state.recordingStream,
        recorderOptions
      );

  }
  catch (error) {

    console.warn(
      "Recorder with bitrate options failed:",
      error
    );


    try {

      recorder =
        new MediaRecorder(
          state.recordingStream,
          {
            mimeType
          }
        );

    }
    catch (secondError) {

      console.error(
        "MediaRecorder creation failed:",
        secondError
      );

      cleanupRecordingStream();

      showToast(
        "Unable to start recording.",
        "error"
      );

      return;

    }

  }


  state.mediaRecorder =
    recorder;

  state.recordingChunks =
    [];

  state.currentRecordingMimeType =
    mimeType;


  recorder.ondataavailable =
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


  recorder.onerror =
    event => {

      console.error(
        "MediaRecorder error:",
        event
      );

      showToast(
        "Recording error occurred.",
        "error"
      );

    };


  recorder.onstop =
    handleRecorderStop;


  state.recordingStartedAt =
    performance.now();

  state.recordingPausedAt =
    0;

  state.recordingAccumulatedPause =
    0;

  state.recordingElapsed =
    0;

  state.recordingActive =
    true;

  state.recordingPaused =
    false;


  document.body.classList.add(
    "is-recording"
  );


  updateRecordingStatus(
    "Recording"
  );


  updateRecordingButtons();


  state.mediaRecorder.start(
    1000
  );


  startRecordingTimer();


  if (
    state.teleprompterAutoStart
  ) {

    playTeleprompter();

  }


  if (
    state.mainType ===
    "video"
  ) {

    const video =
      $("mainVideo");

    if (
      video &&
      video.paused
    ) {

      video.play()
        .catch(
          () => {}
        );

    }

  }


  showToast(
    `Recording started at ${state.recordingWidth}×${state.recordingHeight}.`,
    "success"
  );

}


function getVideoBitrate(
  width,
  height,
  fps
) {

  const pixels =
    width * height;


  if (pixels >= 2560 * 1440) {

    return fps >= 60
      ? 18000000
      : 14000000;

  }


  if (pixels >= 1920 * 1080) {

    return fps >= 60
      ? 12000000
      : 9000000;

  }


  return fps >= 60
    ? 8000000
    : 6000000;

}


function pauseRecording() {

  if (
    !state.mediaRecorder ||
    state.mediaRecorder.state !==
    "recording"
  ) {
    return;
  }


  state.mediaRecorder.pause();

  state.recordingPaused =
    true;

  state.recordingPausedAt =
    performance.now();


  updateRecordingStatus(
    "Paused"
  );


  updateRecordingButtons();


  showToast(
    "Recording paused.",
    "info"
  );

}


function resumeRecording() {

  if (
    !state.mediaRecorder ||
    state.mediaRecorder.state !==
    "paused"
  ) {
    return;
  }


  state.mediaRecorder.resume();


  if (
    state.recordingPausedAt
  ) {

    state.recordingAccumulatedPause +=
      performance.now() -
      state.recordingPausedAt;

  }


  state.recordingPausedAt =
    0;

  state.recordingPaused =
    false;


  updateRecordingStatus(
    "Recording"
  );


  updateRecordingButtons();


  showToast(
    "Recording resumed.",
    "success"
  );

}


function stopRecording() {

  if (
    !state.mediaRecorder
  ) {
    return;
  }


  if (
    state.mediaRecorder.state ===
    "inactive"
  ) {
    return;
  }


  try {

    state.mediaRecorder.stop();

  }
  catch (error) {

    console.error(
      "Stop recording failed:",
      error
    );

  }


  stopRecordingTimer();

}


/* =========================================================
   RECORDING TIMER
   ========================================================= */

function startRecordingTimer() {

  stopRecordingTimer();


  state.recordingTimerId =
    window.setInterval(
      updateRecordingTimer,
      200
    );


  updateRecordingTimer();

}


function stopRecordingTimer() {

  if (
    state.recordingTimerId
  ) {

    clearInterval(
      state.recordingTimerId
    );

  }

  state.recordingTimerId =
    null;

}


function updateRecordingTimer() {

  if (
    !state.recordingActive
  ) {
    return;
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

    elapsed =
      state.recordingPausedAt -
      state.recordingStartedAt -
      state.recordingAccumulatedPause;

  }


  state.recordingElapsed =
    Math.max(
      0,
      elapsed / 1000
    );


  const formatted =
    formatRecordingTime(
      state.recordingElapsed
    );


  if ($("recordingTimer")) {

    $("recordingTimer").textContent =
      formatted;

  }


  if ($("recordingOverlayTimer")) {

    $("recordingOverlayTimer").textContent =
      formatted;

  }

}


/* =========================================================
   RECORDING STOP
   ========================================================= */

async function handleRecorderStop() {

  stopRecordingTimer();


  const actualElapsed =
    state.recordingElapsed;


  const blob =
    new Blob(
      state.recordingChunks,
      {
        type:
          state.currentRecordingMimeType ||
          "video/webm"
      }
    );


  state.currentRecordingBlob =
    blob;


  state.currentRecordingId =
    createId();


  state.currentRecordingName =
    sanitizeFileName(
      $("recordingFileNameSide")?.value ||
      state.recordingFileName
    ) ||
    "mentor-course-recording";


  state.previewTrimStart =
    0;

  state.previewTrimEnd =
    actualElapsed;


  state.currentRecordingTrimStart =
    0;

  state.currentRecordingTrimEnd =
    actualElapsed;


  state.recordingActive =
    false;

  state.recordingPaused =
    false;


  document.body.classList.remove(
    "is-recording"
  );


  updateRecordingStatus(
    "Processing"
  );


  updateRecordingButtons();


  const record = {

    id:
      state.currentRecordingId,

    name:
      state.currentRecordingName,

    createdAt:
      Date.now(),

    duration:
      actualElapsed,

    size:
      blob.size,

    mimeType:
      blob.type,

    width:
      state.recordingWidth,

    height:
      state.recordingHeight,

    fps:
      state.recordingFps,

    trimStart:
      0,

    trimEnd:
      actualElapsed

  };


  state.history.unshift(
    record
  );


  /*
   * Keep history reasonably sized.
   */

  if (
    state.history.length >
    100
  ) {

    state.history =
      state.history.slice(
        0,
        100
      );

  }


  await saveRecordingBlob(
    record,
    blob
  );


  await saveHistoryMetadata();


  cleanupRecordingStream();


  updateRecordingStatus(
    "Ready"
  );


  openRecordingPreview(
    record,
    blob
  );


  renderRecordingHistory();


  showToast(
    "Recording completed.",
    "success"
  );

}


/* =========================================================
   CLEANUP RECORDING STREAM
   ========================================================= */

function cleanupRecordingStream() {

  if (
    state.recordingStream
  ) {

    state.recordingStream
      .getTracks()
      .forEach(
        track => {

          try {
            track.stop();
          }
          catch (_) {}

        }
      );

  }


  state.recordingStream =
    null;

  state.mediaRecorder =
    null;

  state.recordingChunks =
    [];

}


/* =========================================================
   RECORDING STATUS
   ========================================================= */

function updateRecordingStatus(
  text
) {

  const element =
    $("recordingStatusText");

  if (element) {

    element.textContent =
      text;

  }

  const sourceBadge =
    $("stageSourceBadge");

  if (
    sourceBadge &&
    !state.recordingActive
  ) {

    sourceBadge.textContent =
      state.mainType === "video"
        ? "VIDEO"
        : state.mainType === "image"
          ? "IMAGE"
          : "READY";

  }

}


function updateStageSource(
  text
) {

  const badge =
    $("stageSourceBadge");

  if (badge) {

    badge.textContent =
      text;

  }

}


/* =========================================================
   RECORDING BUTTONS
   ========================================================= */

function updateRecordingButtons() {

  const pause =
    $("pauseRecordingBtn");

  const resume =
    $("resumeRecordingBtn");

  const stop =
    $("stopRecordingBtn");


  if (pause) {

    pause.disabled =
      !(
        state.recordingActive &&
        !state.recordingPaused
      );

  }


  if (resume) {

    resume.disabled =
      !(
        state.recordingActive &&
        state.recordingPaused
      );

  }


  if (stop) {

    stop.disabled =
      !state.recordingActive;

  }

}


/* =========================================================
   PREVIEW CONTROLS
   ========================================================= */

function initializePreviewControls() {

  on(
    "closeRecordingPreviewBtn",
    "click",
    closeRecordingPreview
  );


  on(
    "recordingPreviewPlayBtn",
    "click",
    () => {

      $("recordingPreviewVideo")
        ?.play()
        .catch(
          () => {}
        );

    }
  );


  on(
    "recordingPreviewPauseBtn",
    "click",
    () => {

      $("recordingPreviewVideo")
        ?.pause();

    }
  );


  on(
    "recordingPreviewVideo",
    "loadedmetadata",
    handlePreviewMetadata
  );


  on(
    "recordingPreviewVideo",
    "timeupdate",
    updatePreviewTime
  );


  on(
    "recordingTrimStart",
    "input",
    updateTrimStart
  );


  on(
    "recordingTrimEnd",
    "input",
    updateTrimEnd
  );


  on(
    "applyTrimBtn",
    "click",
    applyTrim
  );


  on(
    "resetTrimBtn",
    "click",
    resetTrim
  );


  on(
    "renameRecordingBtn",
    "click",
    renameCurrentRecording
  );


  on(
    "deleteRecordingBtn",
    "click",
    deleteCurrentRecording
  );


  on(
    "recordAgainBtn",
    "click",
    recordAgain
  );


  on(
    "downloadRecordingBtn",
    "click",
    downloadCurrentRecording
  );


  const modal =
    $("recordingPreviewModal");

  modal?.querySelector(
    ".modal-backdrop"
  )?.addEventListener(
    "click",
    closeRecordingPreview
  );

}


function openRecordingPreview(
  record,
  blob
) {

  const modal =
    $("recordingPreviewModal");

  const video =
    $("recordingPreviewVideo");

  if (!modal || !video) {
    return;
  }


  if (
    state.previewObjectUrl
  ) {

    URL.revokeObjectURL(
      state.previewObjectUrl
    );

  }


  state.previewObjectUrl =
    URL.createObjectURL(
      blob
    );


  video.src =
    state.previewObjectUrl;


  video.load();


  state.currentRecordingBlob =
    blob;

  state.currentRecordingId =
    record.id;

  state.currentRecordingName =
    record.name;

  state.previewDuration =
    record.duration || 0;

  state.previewTrimStart =
    record.trimStart || 0;

  state.previewTrimEnd =
    record.trimEnd ||
    record.duration ||
    0;


  if ($("recordingFileName")) {

    $("recordingFileName").value =
      record.name;

  }


  if ($("recordingFileInfo")) {

    $("recordingFileInfo").innerHTML =
      `
        <strong>${escapeHtml(record.name)}</strong><br>
        ${formatBytes(record.size)}
        · ${formatTime(record.duration)}
        · ${record.width}×${record.height}
        · ${record.fps} FPS
        · ${escapeHtml(record.mimeType)}
      `;

  }


  modal.classList.add(
    "open"
  );

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

}


function closeRecordingPreview() {

  const modal =
    $("recordingPreviewModal");

  if (!modal) {
    return;
  }

  modal.classList.remove(
    "open"
  );

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

}


function handlePreviewMetadata() {

  const video =
    $("recordingPreviewVideo");

  if (!video) {
    return;
  }


  state.previewDuration =
    Number.isFinite(
      video.duration
    )
      ? video.duration
      : state.previewDuration;


  state.previewTrimStart =
    clamp(
      state.previewTrimStart,
      0,
      state.previewDuration
    );


  state.previewTrimEnd =
    state.previewTrimEnd > 0
      ? clamp(
          state.previewTrimEnd,
          state.previewTrimStart,
          state.previewDuration
        )
      : state.previewDuration;


  setupTrimControls();


  updatePreviewTime();

}


function setupTrimControls() {

  const start =
    $("recordingTrimStart");

  const end =
    $("recordingTrimEnd");


  if (start) {

    start.min =
      "0";

    start.max =
      String(
        state.previewDuration
      );

    start.value =
      String(
        state.previewTrimStart
      );

  }


  if (end) {

    end.min =
      "0";

    end.max =
      String(
        state.previewDuration
      );

    end.value =
      String(
        state.previewTrimEnd
      );

  }


  updateTrimLabels();

}


function updatePreviewTime() {

  const video =
    $("recordingPreviewVideo");

  if (!video) {
    return;
  }


  if ($("recordingCurrentTime")) {

    $("recordingCurrentTime").textContent =
      formatTime(
        video.currentTime
      );

  }


  if ($("recordingDuration")) {

    $("recordingDuration").textContent =
      formatTime(
        video.duration ||
        state.previewDuration
      );

  }

}


function updateTrimStart(
  event
) {

  const value =
    Number(event.target.value);


  state.previewTrimStart =
    clamp(
      value,
      0,
      state.previewTrimEnd - 0.01
    );


  if (
    state.previewTrimStart <
    0
  ) {

    state.previewTrimStart =
      0;

  }


  const video =
    $("recordingPreviewVideo");


  if (video) {

    video.currentTime =
      state.previewTrimStart;

  }


  updateTrimLabels();

}


function updateTrimEnd(
  event
) {

  const value =
    Number(event.target.value);


  state.previewTrimEnd =
    clamp(
      value,
      state.previewTrimStart + 0.01,
      state.previewDuration
    );


  const video =
    $("recordingPreviewVideo");


  if (video) {

    video.currentTime =
      state.previewTrimEnd;

  }


  updateTrimLabels();

}


function updateTrimLabels() {

  if ($("recordingTrimStartTime")) {

    $("recordingTrimStartTime").textContent =
      formatTime(
        state.previewTrimStart
      );

  }

  if ($("recordingTrimEndTime")) {

    $("recordingTrimEndTime").textContent =
      formatTime(
        state.previewTrimEnd
      );

  }

}


/* =========================================================
   TRIM
   ========================================================= */

async function applyTrim() {

  if (
    !state.currentRecordingId
  ) {
    return;
  }


  const start =
    state.previewTrimStart;

  const end =
    state.previewTrimEnd;


  if (
    end <= start
  ) {

    showToast(
      "Trim end must be after trim start.",
      "error"
    );

    return;

  }


  /*
   * Important:
   * MediaRecorder does not natively edit an existing
   * Blob. This implementation stores the selected
   * trim range as preview metadata.
   *
   * A real exported trimmed file requires a separate
   * re-encoding step.
   */


  const record =
    state.history.find(
      item =>
        item.id ===
        state.currentRecordingId
    );


  if (!record) {
    return;
  }


  record.trimStart =
    start;

  record.trimEnd =
    end;


  state.currentRecordingTrimStart =
    start;

  state.currentRecordingTrimEnd =
    end;


  await saveHistoryMetadata();


  showToast(
    "Trim range saved for preview. Export trimming requires re-encoding.",
    "info",
    4500
  );

}


/* =========================================================
   RESET TRIM
   ========================================================= */

function resetTrim() {

  state.previewTrimStart =
    0;

  state.previewTrimEnd =
    state.previewDuration;


  setupTrimControls();


  const video =
    $("recordingPreviewVideo");

  if (video) {

    video.currentTime =
      0;

  }


  showToast(
    "Trim range reset.",
    "info"
  );

}


/* =========================================================
   RENAME RECORDING
   ========================================================= */

async function renameCurrentRecording() {

  if (
    !state.currentRecordingId
  ) {
    return;
  }


  const input =
    $("recordingFileName");


  const newName =
    sanitizeFileName(
      input?.value ||
      ""
    );


  if (!newName) {

    showToast(
      "Please enter a valid recording name.",
      "error"
    );

    return;

  }


  const record =
    state.history.find(
      item =>
        item.id ===
        state.currentRecordingId
    );


  if (!record) {
    return;
  }


  record.name =
    newName;


  state.currentRecordingName =
    newName;


  await saveHistoryMetadata();


  if ($("recordingFileInfo")) {

    $("recordingFileInfo").innerHTML =
      `
        <strong>${escapeHtml(record.name)}</strong><br>
        ${formatBytes(record.size)}
        · ${formatTime(record.duration)}
        · ${record.width}×${record.height}
        · ${record.fps} FPS
        · ${escapeHtml(record.mimeType)}
      `;

  }


  renderRecordingHistory();


  showToast(
    "Recording renamed.",
    "success"
  );

}


/* =========================================================
   DELETE CURRENT RECORDING
   ========================================================= */

async function deleteCurrentRecording() {

  if (
    !state.currentRecordingId
  ) {
    return;
  }


  const id =
    state.currentRecordingId;


  const confirmed =
    window.confirm(
      "Delete this recording permanently?"
    );


  if (!confirmed) {
    return;
  }


  await deleteRecordingFromDB(
    id
  );


  state.history =
    state.history.filter(
      item =>
        item.id !== id
    );


  await saveHistoryMetadata();


  state.currentRecordingBlob =
    null;

  state.currentRecordingId =
    null;


  closeRecordingPreview();


  renderRecordingHistory();


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
   DOWNLOAD
   ========================================================= */

function downloadCurrentRecording() {

  if (
    !state.currentRecordingBlob
  ) {

    showToast(
      "No recording is available.",
      "error"
    );

    return;

  }


  const record =
    state.history.find(
      item =>
        item.id ===
        state.currentRecordingId
    );


  const name =
    sanitizeFileName(
      record?.name ||
      state.currentRecordingName ||
      "mentor-course-recording"
    );


  const extension =
    getFileExtension(
      state.currentRecordingBlob.type
    );


  const url =
    URL.createObjectURL(
      state.currentRecordingBlob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;

  link.download =
    `${name}.${extension}`;

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();


  window.setTimeout(
    () => {

      URL.revokeObjectURL(
        url
      );

    },
    1000
  );


  showToast(
    "Download started.",
    "success"
  );

}


function getFileExtension(
  mime
) {

  if (
    String(mime)
      .toLowerCase()
      .includes("mp4")
  ) {

    return "mp4";

  }

  return "webm";

}


/* =========================================================
   INDEXEDDB
   ========================================================= */

const DB_NAME =
  "PersonalCourseStudioDB";

const DB_VERSION =
  1;

const STORE_RECORDINGS =
  "recordings";


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
    (
      resolve
    ) => {

      const request =
        indexedDB.open(
          DB_NAME,
          DB_VERSION
        );


      request.onupgradeneeded =
        event => {

          const db =
            event.target.result;


          if (
            !db.objectStoreNames
              .contains(
                STORE_RECORDINGS
              )
          ) {

            db.createObjectStore(
              STORE_RECORDINGS,
              {
                keyPath:
                  "id"
              }
            );

          }

        };


      request.onsuccess =
        event => {

          state.db =
            event.target.result;

          resolve();

        };


      request.onerror =
        event => {

          console.warn(
            "IndexedDB error:",
            event.target.error
          );

          resolve();

        };

    }
  );

}


/* =========================================================
   SAVE BLOB
   ========================================================= */

async function saveRecordingBlob(
  record,
  blob
) {

  if (!state.db) {
    return;
  }


  return new Promise(
    resolve => {

      try {

        const transaction =
          state.db.transaction(
            STORE_RECORDINGS,
            "readwrite"
          );


        const store =
          transaction.objectStore(
            STORE_RECORDINGS
          );


        store.put({
          ...record,
          blob
        });


        transaction.oncomplete =
          () => resolve();


        transaction.onerror =
          () => resolve();

      }
      catch (error) {

        console.warn(
          "Recording save failed:",
          error
        );

        resolve();

      }

    }
  );

}


/* =========================================================
   GET BLOB
   ========================================================= */

async function getRecordingBlob(
  id
) {

  if (!state.db) {
    return null;
  }


  return new Promise(
    resolve => {

      try {

        const transaction =
          state.db.transaction(
            STORE_RECORDINGS,
            "readonly"
          );


        const store =
          transaction.objectStore(
            STORE_RECORDINGS
          );


        const request =
          store.get(id);


        request.onsuccess =
          () => {

            resolve(
              request.result?.blob ||
              null
            );

          };


        request.onerror =
          () => resolve(null);

      }
      catch (error) {

        console.warn(
          "Blob read failed:",
          error
        );

        resolve(null);

      }

    }
  );

}


/* =========================================================
   DELETE DB RECORDING
   ========================================================= */

async function deleteRecordingFromDB(
  id
) {

  if (!state.db) {
    return;
  }


  return new Promise(
    resolve => {

      try {

        const transaction =
          state.db.transaction(
            STORE_RECORDINGS,
            "readwrite"
          );


        transaction.objectStore(
          STORE_RECORDINGS
        ).delete(id);


        transaction.oncomplete =
          () => resolve();


        transaction.onerror =
          () => resolve();

      }
      catch (error) {

        console.warn(
          "DB delete failed:",
          error
        );

        resolve();

      }

    }
  );

}


/* =========================================================
   HISTORY METADATA
   ========================================================= */

async function saveHistoryMetadata() {

  try {

    localStorage.setItem(
      "pcsMentorRecordingHistory",
      JSON.stringify(
        state.history
      )
    );

  }
  catch (error) {

    console.warn(
      "History metadata save failed:",
      error
    );

  }

}


async function loadRecordingHistory() {

  try {

    const raw =
      localStorage.getItem(
        "pcsMentorRecordingHistory"
      );


    if (raw) {

      const data =
        JSON.parse(raw);


      if (
        Array.isArray(data)
      ) {

        state.history =
          data;

      }

    }

  }
  catch (error) {

    console.warn(
      "History load failed:",
      error
    );

  }


  renderRecordingHistory();

}


/* =========================================================
   HISTORY UI
   ========================================================= */

function initializeHistoryUI() {

  on(
    "clearRecordingHistoryBtn",
    "click",
    clearRecordingHistory
  );

}


async function renderRecordingHistory() {

  const list =
    $("recordingHistoryList");

  if (!list) {
    return;
  }


  list.innerHTML =
    "";


  if (
    !state.history.length
  ) {

    list.innerHTML =
      `
        <div class="empty-state">
          No recordings yet.
        </div>
      `;

    return;

  }


  state.history.forEach(
    record => {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "history-item";


      item.innerHTML =
        `
          <div class="history-main">

            <div class="history-name">
              ${escapeHtml(record.name)}
            </div>

            <div class="history-meta">
              ${formatTime(record.duration)}
              · ${formatBytes(record.size)}
              · ${record.width}×${record.height}
              · ${record.fps} FPS
              · ${formatDate(record.createdAt)}
            </div>

          </div>

          <div class="history-actions">

            <button
              type="button"
              class="history-action"
              data-history-preview="${record.id}"
            >
              Preview
            </button>

            <button
              type="button"
              class="history-action"
              data-history-download="${record.id}"
            >
              Download
            </button>

            <button
              type="button"
              class="history-action"
              data-history-delete="${record.id}"
            >
              Delete
            </button>

          </div>
        `;


      list.appendChild(
        item
      );

    }
  );


  list.querySelectorAll(
    "[data-history-preview]"
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        async () => {

          await previewHistoryRecord(
            button.dataset.historyPreview
          );

        }
      );

    }
  );


  list.querySelectorAll(
    "[data-history-download]"
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        async () => {

          await downloadHistoryRecord(
            button.dataset.historyDownload
          );

        }
      );

    }
  );


  list.querySelectorAll(
    "[data-history-delete]"
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        async () => {

          await deleteHistoryRecord(
            button.dataset.historyDelete
          );

        }
      );

    }
  );

}


async function previewHistoryRecord(
  id
) {

  const record =
    state.history.find(
      item =>
        item.id === id
    );


  if (!record) {
    return;
  }


  let blob =
    await getRecordingBlob(
      id
    );


  /*
   * If the requested record is currently loaded,
   * use the in-memory Blob.
   */

  if (
    !blob &&
    state.currentRecordingId === id
  ) {

    blob =
      state.currentRecordingBlob;

  }


  if (!blob) {

    showToast(
      "The recording file is no longer available in this browser.",
      "error",
      5000
    );

    return;

  }


  state.currentRecordingId =
    id;

  state.currentRecordingBlob =
    blob;


  openRecordingPreview(
    record,
    blob
  );

}


async function downloadHistoryRecord(
  id
) {

  const record =
    state.history.find(
      item =>
        item.id === id
    );


  if (!record) {
    return;
  }


  let blob =
    await getRecordingBlob(
      id
    );


  if (
    !blob &&
    state.currentRecordingId === id
  ) {

    blob =
      state.currentRecordingBlob;

  }


  if (!blob) {

    showToast(
      "Recording file is not available.",
      "error"
    );

    return;

  }


  const extension =
    getFileExtension(
      blob.type
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
    `${sanitizeFileName(record.name)}.${extension}`;


  document.body.appendChild(
    link
  );

  link.click();

  link.remove();


  setTimeout(
    () => URL.revokeObjectURL(url),
    1000
  );

}


async function deleteHistoryRecord(
  id
) {

  const confirmed =
    window.confirm(
      "Delete this recording?"
    );


  if (!confirmed) {
    return;
  }


  await deleteRecordingFromDB(
    id
  );


  state.history =
    state.history.filter(
      item =>
        item.id !== id
    );


  if (
    state.currentRecordingId === id
  ) {

    state.currentRecordingId =
      null;

    state.currentRecordingBlob =
      null;

    closeRecordingPreview();

  }


  await saveHistoryMetadata();

  renderRecordingHistory();


  showToast(
    "Recording deleted.",
    "success"
  );

}


async function clearRecordingHistory() {

  if (
    !state.history.length
  ) {

    showToast(
      "Recording history is already empty.",
      "info"
    );

    return;

  }


  const confirmed =
    window.confirm(
      "Delete all recording history and saved recordings?"
    );


  if (!confirmed) {
    return;
  }


  const ids =
    state.history.map(
      item => item.id
    );


  for (
    const id of ids
  ) {

    await deleteRecordingFromDB(
      id
    );

  }


  state.history =
    [];


  state.currentRecordingId =
    null;

  state.currentRecordingBlob =
    null;


  await saveHistoryMetadata();

  renderRecordingHistory();

  closeRecordingPreview();


  showToast(
    "Recording history cleared.",
    "success"
  );

}


/* =========================================================
   STUDENTS
   ========================================================= */

function initializeStudents() {

  on(
    "addStudentBtn",
    "click",
    openStudentModal
  );

  on(
    "closeStudentModalBtn",
    "click",
    closeStudentModal
  );

  on(
    "cancelStudentBtn",
    "click",
    closeStudentModal
  );

  on(
    "saveStudentBtn",
    "click",
    saveStudent
  );


  const modal =
    $("studentModal");

  modal?.querySelector(
    ".modal-backdrop"
  )?.addEventListener(
    "click",
    closeStudentModal
  );

}


function openStudentModal() {

  const modal =
    $("studentModal");

  if (!modal) {
    return;
  }


  modal.classList.add(
    "open"
  );

  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  const input =
    $("studentNameInput");

  input?.focus();

}


function closeStudentModal() {

  const modal =
    $("studentModal");

  if (!modal) {
    return;
  }


  modal.classList.remove(
    "open"
  );

  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  if ($("studentNameInput")) {

    $("studentNameInput").value =
      "";

  }

}


function saveStudent() {

  const input =
    $("studentNameInput");

  if (!input) {
    return;
  }


  const name =
    input.value.trim();


  if (!name) {

    showToast(
      "Please enter student name.",
      "error"
    );

    input.focus();

    return;

  }


  const student = {

    id:
      createId(),

    name

  };


  state.students.push(
    student
  );


  saveStudents();

  renderStudents();

  closeStudentModal();


  showToast(
    "Student added.",
    "success"
  );

}


function renderStudents() {

  const list =
    $("studentsList");

  if (!list) {
    return;
  }


  list.innerHTML =
    "";


  if (!state.students.length) {

    list.innerHTML =
      `
        <div class="empty-state">
          No students added.
        </div>
      `;

    return;

  }


  state.students.forEach(
    student => {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "student-item";


      const firstLetter =
        student.name
          .trim()
          .charAt(0)
          .toUpperCase();


      item.innerHTML =
        `
          <div class="student-info">

            <div class="student-avatar">
              ${escapeHtml(firstLetter)}
            </div>

            <div class="student-name">
              ${escapeHtml(student.name)}
            </div>

          </div>

          <button
            type="button"
            class="student-remove"
            data-remove-student="${student.id}"
            title="Remove student"
          >
            ×
          </button>
        `;


      list.appendChild(
        item
      );

    }
  );


  list.querySelectorAll(
    "[data-remove-student]"
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          removeStudent(
            button.dataset.removeStudent
          );

        }
      );

    }
  );

}


function removeStudent(
  id
) {

  state.students =
    state.students.filter(
      student =>
        student.id !== id
    );


  saveStudents();

  renderStudents();


  showToast(
    "Student removed.",
    "info"
  );

}


function saveStudents() {

  try {

    localStorage.setItem(
      "pcsMentorStudents",
      JSON.stringify(
        state.students
      )
    );

  }
  catch (error) {

    console.warn(
      "Student save failed:",
      error
    );

  }

}


function loadStudents() {

  try {

    const raw =
      localStorage.getItem(
        "pcsMentorStudents"
      );


    if (raw) {

      const data =
        JSON.parse(raw);


      if (
        Array.isArray(data)
      ) {

        state.students =
          data;

      }

    }

  }
  catch (error) {

    console.warn(
      "Student load failed:",
      error
    );

  }


  renderStudents();

}


/* =========================================================
   FULLSCREEN
   ========================================================= */

function initializeFullscreen() {

  on(
    "fullscreenStageBtn",
    "click",
    toggleStageFullscreen
  );

  on(
    "fullscreenStudioBtn",
    "click",
    toggleStudioFullscreen
  );

}


async function toggleStageFullscreen() {

  const element =
    $("stageShell");

  if (!element) {
    return;
  }


  try {

    if (
      document.fullscreenElement
    ) {

      await document.exitFullscreen();

    }
    else {

      await element.requestFullscreen();

    }

  }
  catch (error) {

    console.warn(
      "Stage fullscreen failed:",
      error
    );

    showToast(
      "Fullscreen could not be opened.",
      "error"
    );

  }

}


async function toggleStudioFullscreen() {

  try {

    if (
      document.fullscreenElement
    ) {

      await document.exitFullscreen();

      return;

    }


    const element =
      document.documentElement;


    await element.requestFullscreen();

  }
  catch (error) {

    console.warn(
      "Studio fullscreen failed:",
      error
    );

    showToast(
      "Fullscreen could not be opened.",
      "error"
    );

  }

}


/* =========================================================
   SHORTCUTS
   ========================================================= */

function initializeShortcuts() {

  on(
    "openShortcutsBtn",
    "click",
    openShortcuts
  );

  on(
    "closeShortcutsBtn",
    "click",
    closeShortcuts
  );


  const modal =
    $("shortcutsModal");

  modal?.querySelector(
    ".modal-backdrop"
  )?.addEventListener(
    "click",
    closeShortcuts
  );


  document.addEventListener(
    "keydown",
    handleKeyboardShortcut
  );

}


function openShortcuts() {

  const modal =
    $("shortcutsModal");

  if (!modal) {
    return;
  }


  modal.classList.add(
    "open"
  );

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

}


function closeShortcuts() {

  const modal =
    $("shortcutsModal");

  if (!modal) {
    return;
  }


  modal.classList.remove(
    "open"
  );

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

}


function handleKeyboardShortcut(
  event
) {

  const tag =
    document.activeElement?.tagName;


  if (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT"
  ) {

    if (
      event.key !==
      "Escape"
    ) {

      return;

    }

  }


  if (
    event.key ===
    "Escape"
  ) {

    closeAllModals();

    return;

  }


  const key =
    event.key.toLowerCase();


  if (
    key === " " ||
    event.code === "Space"
  ) {

    event.preventDefault();

    toggleMainPlayPause();

    return;

  }


  if (key === "r") {

    event.preventDefault();

    handleRecordButton();

    return;

  }


  if (key === "p") {

    event.preventDefault();

    if (
      state.recordingPaused
    ) {

      resumeRecording();

    }
    else if (
      state.recordingActive
    ) {

      pauseRecording();

    }

    return;

  }


  if (key === "s") {

    event.preventDefault();

    if (
      state.recordingActive
    ) {

      stopRecording();

    }

    return;

  }


  if (key === "f") {

    event.preventDefault();

    toggleStageFullscreen();

  }

}


function toggleMainPlayPause() {

  const video =
    $("mainVideo");


  if (
    state.mainType !==
    "video" ||
    !video
  ) {

    return;

  }


  if (video.paused) {

    playMainVideo();

  }
  else {

    pauseMainVideo();

  }

}


function closeAllModals() {

  [
    "settingsModal",
    "shortcutsModal",
    "teleprompterModal",
    "recordingPreviewModal",
    "studentModal"
  ]
  .forEach(
    id => {

      const modal =
        $(id);

      if (modal) {

        modal.classList.remove(
          "open"
        );

        modal.setAttribute(
          "aria-hidden",
          "true"
        );

      }

    }
  );

}


/* =========================================================
   UPDATE ALL UI
   ========================================================= */

function updateAllUI() {

  updateResolutionUI();

  updateFpsUI();

  updateRecordingFormatUI();

  updateBrandName();

  updateMainVolumeLabel();

  updateMicVolumeLabel();

  updateBackgroundButtons();

  updateRecordingButtons();

  updateMicIndicator();

  updateAudioIndicator();

  updateScreenStatus(
    state.screenCaptureRunning
      ? "Live"
      : "Ready"
  );

  updateCameraStatus(
    state.cameraRunning
      ? "Live"
      : "Offline"
  );

  renderStudents();

  updateTeleprompterPreview();

}


/* =========================================================
   SANITIZE FILE NAME
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
    .replace(
      /^[-.]+|[-.]+$/g,
      ""
    )
    .slice(
      0,
      120
    );

}


/* =========================================================
   ID
   ========================================================= */

function createId() {

  if (
    window.crypto &&
    typeof crypto.randomUUID ===
    "function"
  ) {

    return crypto.randomUUID();

  }


  return [
    Date.now().toString(36),

    Math.random()
      .toString(36)
      .slice(2)

  ].join("-");

}


/* =========================================================
   DATE
   ========================================================= */

function formatDate(
  timestamp
) {

  if (!timestamp) {
    return "";
  }


  try {

    return new Date(
      timestamp
    ).toLocaleString(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short"
      }
    );

  }
  catch (_) {

    return "";

  }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(
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
   UPDATE BRAND / SOURCE
   ========================================================= */

function updateBrandNameSafe() {

  const element =
    $("brandBadgeText");

  if (element) {

    element.textContent =
      state.brandName;

  }

}


/* =========================================================
   AUDIO + VIDEO CLEANUP
   ========================================================= */

window.addEventListener(
  "beforeunload",
  () => {

    stopCamera();

    stopScreenCapture();

    stopRecordingTimer();

    cleanupRecordingStream();


    if (state.mainImageUrl) {

      URL.revokeObjectURL(
        state.mainImageUrl
      );

    }


    if (state.mainVideoUrl) {

      URL.revokeObjectURL(
        state.mainVideoUrl
      );

    }


    if (state.mentorVideoUrl) {

      URL.revokeObjectURL(
        state.mentorVideoUrl
      );

    }


    if (state.previewObjectUrl) {

      URL.revokeObjectURL(
        state.previewObjectUrl
      );

    }


    if (
      state.micStream
    ) {

      state.micStream
        .getTracks()
        .forEach(
          track =>
            track.stop()
        );

    }


    if (
      state.audioContext
    ) {

      state.audioContext
        .close()
        .catch(
          () => {}
        );

    }

  }
);


/* =========================================================
   GLOBAL API
   ========================================================= */

window.CourseStudio = {

  state,

  startCamera,

  stopCamera,

  startScreenCapture,

  stopScreenCapture,

  startRecording,

  pauseRecording,

  resumeRecording,

  stopRecording,

  openTeleprompter,

  closeTeleprompter,

  setBackgroundMode,

  playMainVideo,

  pauseMainVideo,

  toggleStageFullscreen,

  toggleStudioFullscreen,

  openSettings,

  closeSettings

};


/* =========================================================
   FINAL INITIAL STATE
   ========================================================= */

updateResolutionUI();

updateFpsUI();

updateRecordingFormatUI();

updateMainVolumeLabel();

updateMicVolumeLabel();
