/* =========================================================
   PERSONAL COURSE STUDIO — MENTOR STUDIO
   STEP 3.9 — PROFESSIONAL RECORDING & PREVIEW
   File: mentor/script.js

   Includes:
   - Main image / video
   - Mentor video
   - Webcam
   - AI background removal
   - AI blur background
   - Custom background
   - Solid background
   - Drag / resize mentor
   - Students
   - Settings
   - Teleprompter
   - Screen capture
   - Audio mixing
   - Mic monitoring
   - Audio meters
   - Mic waveform
   - Recording quality
   - Recording FPS
   - Camera quality
   - Camera FPS
   - Camera device selection
   - Recording pause / resume / stop
   - Professional preview
   - Trim start / end
   - Recording rename
   - Recording history
   - Delete recording
   - Download recording
   - Fullscreen
   - Keyboard shortcuts
   ========================================================= */

"use strict";

/* =========================================================
   GLOBAL STATE
   ========================================================= */

const state = {
  mainImage: null,
  mainVideoUrl: "",
  mentorVideoUrl: "",

  cameraStream: null,
  screenStream: null,

  cameraFacingMode: "user",

  segmentation: null,
  segmentationReady: false,

  backgroundMode: "original",
  backgroundImage: null,
  backgroundColor: "#111827",

  mentorSource: "placeholder",

  compositionCanvas: null,
  compositionCtx: null,

  renderAnimationId: null,

  recording: {
    active: false,
    paused: false,
    mediaRecorder: null,
    chunks: [],
    blob: null,
    url: "",
    mimeType: "",
    startedAt: 0,
    pausedAt: 0,
    accumulatedPause: 0,
    elapsed: 0,

    width: 1280,
    height: 720,
    fps: 30,

    format: "webm-vp9",
    fileName: "course-recording",

    trimStart: 0,
    trimEnd: 0,

    historyId: null
  },

  recordings: [],

  audio: {
    context: null,

    destination: null,

    mainSource: null,
    mainGain: null,

    micSource: null,
    micGain: null,

    screenSource: null,
    screenGain: null,

    analyserMic: null,
    analyserMain: null,

    micData: null,
    mainData: null,

    micStream: null,

    micEnabled: true,
    micMonitor: false,
    micVolume: 1,
    mainVolume: 1
  },

  cameraSettings: {
    width: 1280,
    height: 720,
    fps: 30,
    deviceId: ""
  },

  teleprompter: {
    text: "",
    speed: 2,
    fontSize: 34,
    opacity: 0.9,
    playing: false,
    includeInRecording: false
  },

  students: [],

  settings: {
    brandName: "SNK Mentor Studio",
    recordingQuality: "1080",
    recordingFps: "30",
    autoStartTeleprompter: false,
    showTeleprompterRecording: false
  },

  preview: {
    playing: false,
    currentTime: 0,
    duration: 0
  }
};


/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (id) => document.getElementById(id);

const qs = (selector) => document.querySelector(selector);

const qsa = (selector) => [...document.querySelectorAll(selector)];


/* =========================================================
   BASIC ELEMENTS
   ========================================================= */

const stage = $("stage");

const mainImage = $("mainImage");
const mainVideo = $("mainVideo");
const screenCaptureVideo = $("screenCaptureVideo");

const mentorCard = $("mentorCard");
const mentorVideo = $("mentorVideo");
const mentorCameraVideo = $("mentorCameraVideo");
const mentorAICanvas = $("mentorAICanvas");
const mentorPlaceholder = $("mentorPlaceholder");
const mentorSourceLabel = $("mentorSourceLabel");

const brandBadge = $("brandBadge");

const aiCanvas = $("aiCanvas");
const aiSourceCanvas = $("aiSourceCanvas");
const aiMaskCanvas = $("aiMaskCanvas");

const toastContainer = $("toastContainer");


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message, type = "info") {
  if (!toastContainer) return;

  const toast = document.createElement("div");

  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2800);
}


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

const RECORDINGS_KEY = "personalCourseStudioRecordingsV39";
const STUDENTS_KEY = "personalCourseStudioStudentsV39";
const SETTINGS_KEY = "personalCourseStudioSettingsV39";


function saveStudents() {
  try {
    localStorage.setItem(
      STUDENTS_KEY,
      JSON.stringify(state.students)
    );
  } catch (error) {
    console.warn(error);
  }
}


function loadStudents() {
  try {
    const raw = localStorage.getItem(STUDENTS_KEY);

    if (raw) {
      state.students = JSON.parse(raw);
    }
  } catch (error) {
    console.warn(error);
    state.students = [];
  }
}


function saveSettings() {
  try {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(state.settings)
    );
  } catch (error) {
    console.warn(error);
  }
}


function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);

    if (raw) {
      state.settings = {
        ...state.settings,
        ...JSON.parse(raw)
      };
    }
  } catch (error) {
    console.warn(error);
  }
}


/* =========================================================
   RECORDING HISTORY
   ========================================================= */

/*
   Browser localStorage cannot reliably store large video blobs.

   Therefore history stores metadata and object URLs only
   during the current browser session.

   Metadata remains available across page reloads, but the
   actual Blob must be regenerated if the page is closed.
*/

function saveRecordingHistoryMetadata() {
  try {
    const metadata = state.recordings.map(item => ({
      id: item.id,
      name: item.name,
      createdAt: item.createdAt,
      duration: item.duration,
      size: item.size,
      mimeType: item.mimeType
    }));

    localStorage.setItem(
      RECORDINGS_KEY,
      JSON.stringify(metadata)
    );
  } catch (error) {
    console.warn(error);
  }
}


function loadRecordingHistoryMetadata() {
  try {
    const raw = localStorage.getItem(RECORDINGS_KEY);

    if (!raw) {
      state.recordings = [];
      return;
    }

    const metadata = JSON.parse(raw);

    state.recordings = metadata.map(item => ({
      ...item,
      blob: null,
      url: ""
    }));
  } catch (error) {
    console.warn(error);
    state.recordings = [];
  }
}


/* =========================================================
   FILE INPUTS
   ========================================================= */

function bindFileInput(inputId, callback) {
  const input = $(inputId);

  if (!input) return;

  input.addEventListener("change", event => {
    const file = event.target.files?.[0];

    if (!file) return;

    callback(file);

    input.value = "";
  });
}


/* =========================================================
   MAIN IMAGE
   ========================================================= */

function loadMainImage(file) {
  const url = URL.createObjectURL(file);

  state.mainImage = new Image();

  state.mainImage.onload = () => {
    mainImage.src = url;

    mainImage.style.display = "block";
    mainVideo.style.display = "none";
    screenCaptureVideo.style.display = "none";

    state.mainVideoUrl = "";

    renderCompositionFrame();

    showToast("Main image loaded.", "success");
  };

  state.mainImage.src = url;
}


/* =========================================================
   MAIN VIDEO
   ========================================================= */

function loadMainVideo(file) {
  const url = URL.createObjectURL(file);

  if (state.mainVideoUrl) {
    URL.revokeObjectURL(state.mainVideoUrl);
  }

  state.mainVideoUrl = url;

  mainVideo.src = url;
  mainVideo.style.display = "block";

  mainImage.style.display = "none";
  screenCaptureVideo.style.display = "none";

  mainVideo.load();

  setupMainVideoAudio();

  mainVideo.addEventListener(
    "loadedmetadata",
    () => {
      renderCompositionFrame();
    },
    { once: true }
  );

  showToast("Main video loaded.", "success");
}


/* =========================================================
   MENTOR VIDEO
   ========================================================= */

function loadMentorVideo(file) {
  const url = URL.createObjectURL(file);

  if (state.mentorVideoUrl) {
    URL.revokeObjectURL(state.mentorVideoUrl);
  }

  state.mentorVideoUrl = url;

  mentorVideo.src = url;

  mentorVideo.style.display = "block";
  mentorCameraVideo.style.display = "none";
  mentorAICanvas.style.display = "none";
  mentorPlaceholder.style.display = "none";

  state.mentorSource = "video";

  mentorVideo.loop = true;
  mentorVideo.muted = true;

  mentorVideo.play().catch(() => {});

  if (mentorSourceLabel) {
    mentorSourceLabel.textContent = "MENTOR VIDEO";
  }

  renderCompositionFrame();

  showToast("Mentor video loaded.", "success");
}


/* =========================================================
   FILE INPUT BINDINGS
   ========================================================= */

bindFileInput("mainFileInput", loadMainImage);

bindFileInput("mainVideoInput", loadMainVideo);

bindFileInput("mentorFileInput", loadMentorVideo);

bindFileInput("backgroundImageUpload", file => {
  const url = URL.createObjectURL(file);

  const img = new Image();

  img.onload = () => {
    state.backgroundImage = img;
    state.backgroundMode = "image";

    renderCompositionFrame();

    showToast("Custom background loaded.", "success");
  };

  img.src = url;
});


bindFileInput("teleprompterFileInput", file => {
  const reader = new FileReader();

  reader.onload = () => {
    state.teleprompter.text = String(reader.result || "");

    const textarea = $("teleprompterText");

    if (textarea) {
      textarea.value = state.teleprompter.text;
    }

    updateTeleprompterPreview();

    showToast("Teleprompter text loaded.", "success");
  };

  reader.readAsText(file);
});


/* =========================================================
   BUTTON HELPERS
   ========================================================= */

function bindClick(id, handler) {
  const element = $(id);

  if (!element) return;

  element.addEventListener("click", handler);
}


/* =========================================================
   MAIN BUTTONS
   ========================================================= */

bindClick("uploadMainBtn", () => {
  $("mainFileInput")?.click();
});

bindClick("uploadVideoBtn", () => {
  $("mainVideoInput")?.click();
});

bindClick("uploadMainSideBtn", () => {
  $("mainFileInput")?.click();
});

bindClick("uploadVideoSideBtn", () => {
  $("mainVideoInput")?.click();
});


bindClick("uploadMentorBtn", () => {
  $("mentorFileInput")?.click();
});

bindClick("uploadMentorSideBtn", () => {
  $("mentorFileInput")?.click();
});

bindClick("uploadMentorFileSideBtn", () => {
  $("mentorFileInput")?.click();
});


bindClick("uploadBackgroundSideBtn", () => {
  $("backgroundImageUpload")?.click();
});


bindClick("uploadBackgroundBtn", () => {
  $("backgroundImageUpload")?.click();
});


/* =========================================================
   MAIN VIDEO CONTROLS
   ========================================================= */

bindClick("mainPlayBtn", () => {
  if (!mainVideo.src) {
    showToast("Please upload a main video first.", "warning");
    return;
  }

  mainVideo.play().catch(() => {});
});


bindClick("mainPauseBtn", () => {
  mainVideo.pause();
});


mainVideo?.addEventListener("play", () => {
  startRenderLoop();
});


mainVideo?.addEventListener("pause", () => {
  renderCompositionFrame();
});


mainVideo?.addEventListener("timeupdate", () => {
  renderCompositionFrame();
});


mainVideo?.addEventListener("ended", () => {
  renderCompositionFrame();
});


/* =========================================================
   CAMERA SETTINGS
   ========================================================= */

function getCameraConstraints() {
  const settings = state.cameraSettings;

  const video = {
    width: {
      ideal: settings.width
    },

    height: {
      ideal: settings.height
    },

    frameRate: {
      ideal: settings.fps,
      max: settings.fps
    },

    facingMode: settings.deviceId
      ? undefined
      : settings.cameraFacingMode
  };

  if (settings.deviceId) {
    video.deviceId = {
      exact: settings.deviceId
    };
  }

  return {
    video,
    audio: true
  };
}


/* =========================================================
   CAMERA DEVICE LIST
   ========================================================= */

async function populateCameraDevices() {
  const select = $("cameraDeviceSelect");

  if (!select) return;

  try {
    const devices =
      await navigator.mediaDevices.enumerateDevices();

    const cameras = devices.filter(
      device => device.kind === "videoinput"
    );

    select.innerHTML = "";

    const defaultOption = document.createElement("option");

    defaultOption.value = "";

    defaultOption.textContent = "Default Camera";

    select.appendChild(defaultOption);

    cameras.forEach((device, index) => {
      const option = document.createElement("option");

      option.value = device.deviceId;

      option.textContent =
        device.label ||
        `Camera ${index + 1}`;

      select.appendChild(option);
    });

    if (state.cameraSettings.deviceId) {
      select.value = state.cameraSettings.deviceId;
    }
  } catch (error) {
    console.warn(error);
  }
}


navigator.mediaDevices?.addEventListener?.(
  "devicechange",
  populateCameraDevices
);


/* =========================================================
   CAMERA QUALITY
   ========================================================= */

function setCameraQuality(value) {
  const presets = {
    "360": {
      width: 640,
      height: 360
    },

    "480": {
      width: 854,
      height: 480
    },

    "720": {
      width: 1280,
      height: 720
    },

    "1080": {
      width: 1920,
      height: 1080
    }
  };

  const preset = presets[value];

  if (!preset) return;

  state.cameraSettings.width = preset.width;
  state.cameraSettings.height = preset.height;

  if (state.cameraStream) {
    showToast(
      "Camera quality will apply after restarting camera.",
      "info"
    );
  }
}


const cameraQuality = $("cameraQuality");

cameraQuality?.addEventListener("change", event => {
  setCameraQuality(event.target.value);
});


const cameraQualitySide = $("cameraQualitySide");

cameraQualitySide?.addEventListener("change", event => {
  setCameraQuality(event.target.value);

  if (cameraQuality) {
    cameraQuality.value = event.target.value;
  }
});


/* =========================================================
   CAMERA FPS
   ========================================================= */

function setCameraFps(value) {
  const fps = Number(value);

  if (!fps) return;

  state.cameraSettings.fps = fps;

  if (state.cameraStream) {
    showToast(
      "Camera FPS will apply after restarting camera.",
      "info"
    );
  }
}


$("cameraFps")?.addEventListener(
  "change",
  event => {
    setCameraFps(event.target.value);
  }
);


/* =========================================================
   CAMERA DEVICE
   ========================================================= */

$("cameraDeviceSelect")?.addEventListener(
  "change",
  event => {
    state.cameraSettings.deviceId =
      event.target.value;

    if (state.cameraStream) {
      showToast(
        "Camera device changed. Restart camera to apply.",
        "info"
      );
    }
  }
);


/* =========================================================
   START CAMERA
   ========================================================= */

async function startCamera() {
  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        "Camera API is not supported."
      );
    }

    stopCamera(false);

    const stream =
      await navigator.mediaDevices.getUserMedia(
        getCameraConstraints()
      );

    state.cameraStream = stream;

    mentorCameraVideo.srcObject = stream;

    mentorCameraVideo.muted = true;
    mentorCameraVideo.playsInline = true;

    mentorCameraVideo.style.display = "block";

    mentorVideo.style.display = "none";
    mentorPlaceholder.style.display = "none";

    state.mentorSource = "camera";

    await mentorCameraVideo.play();

    await setupMicrophoneAudio(stream);

    updateCameraStatus(
      "Camera online",
      true
    );

    if (mentorSourceLabel) {
      mentorSourceLabel.textContent = "LIVE CAMERA";
    }

    await populateCameraDevices();

    startRenderLoop();

    showToast("Camera started.", "success");
  } catch (error) {
    console.error(error);

    updateCameraStatus(
      "Camera unavailable",
      false
    );

    showToast(
      error.message ||
      "Could not start camera.",
      "error"
    );
  }
}


/* =========================================================
   STOP CAMERA
   ========================================================= */

function stopCamera(showMessage = true) {
  if (state.cameraStream) {
    state.cameraStream
      .getTracks()
      .forEach(track => {
        track.stop();
      });

    state.cameraStream = null;
  }

  if (mentorCameraVideo) {
    mentorCameraVideo.srcObject = null;
  }

  if (state.audio.micStream) {
    state.audio.micStream = null;
  }

  if (state.mentorSource === "camera") {
    state.mentorSource = "placeholder";

    mentorCameraVideo.style.display = "none";
    mentorAICanvas.style.display = "none";

    mentorPlaceholder.style.display = "flex";

    if (mentorSourceLabel) {
      mentorSourceLabel.textContent = "MENTOR";
    }
  }

  updateCameraStatus(
    "Camera offline",
    false
  );

  updateRecordingIndicators();

  if (showMessage) {
    showToast("Camera stopped.", "info");
  }

  renderCompositionFrame();
}


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
  () => stopCamera(true)
);

bindClick(
  "stopCameraSideBtn",
  () => stopCamera(true)
);


/* =========================================================
   SWITCH CAMERA
   ========================================================= */

bindClick(
  "switchCameraSideBtn",
  async () => {
    if (!state.cameraStream) {
      showToast(
        "Start the camera first.",
        "warning"
      );

      return;
    }

    state.cameraFacingMode =
      state.cameraFacingMode === "user"
        ? "environment"
        : "user";

    await startCamera();
  }
);


/* =========================================================
   CAMERA STATUS
   ========================================================= */

function updateCameraStatus(
  text,
  online
) {
  const status = $("cameraStatus");

  if (!status) return;

  status.textContent = text;

  status.classList.toggle(
    "online",
    Boolean(online)
  );

  status.classList.toggle(
    "offline",
    !online
  );
}


/* =========================================================
   AI SEGMENTATION
   ========================================================= */

function initSegmentation() {
  if (
    typeof SelfieSegmentation ===
    "undefined"
  ) {
    console.warn(
      "MediaPipe SelfieSegmentation not available."
    );

    return;
  }

  try {
    state.segmentation =
      new SelfieSegmentation({
        locateFile: file =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
      });

    state.segmentation.setOptions({
      modelSelection: 1
    });

    state.segmentation.onResults(
      handleSegmentationResults
    );

    state.segmentationReady = true;
  } catch (error) {
    console.error(error);
  }
}


/* =========================================================
   AI CANVAS SETUP
   ========================================================= */

function ensureAICanvasSize(
  width,
  height
) {
  if (!aiCanvas || !aiSourceCanvas || !aiMaskCanvas) {
    return;
  }

  if (
    aiCanvas.width !== width ||
    aiCanvas.height !== height
  ) {
    aiCanvas.width = width;
    aiCanvas.height = height;
  }

  if (
    aiSourceCanvas.width !== width ||
    aiSourceCanvas.height !== height
  ) {
    aiSourceCanvas.width = width;
    aiSourceCanvas.height = height;
  }

  if (
    aiMaskCanvas.width !== width ||
    aiMaskCanvas.height !== height
  ) {
    aiMaskCanvas.width = width;
    aiMaskCanvas.height = height;
  }
}


/* =========================================================
   SEGMENTATION PROCESS
   ========================================================= */

let segmentationBusy = false;

async function processCameraSegmentation() {
  if (!state.segmentationReady) return;

  if (!state.cameraStream) return;

  if (
    mentorCameraVideo.readyState <
    HTMLMediaElement.HAVE_CURRENT_DATA
  ) {
    return;
  }

  if (segmentationBusy) return;

  segmentationBusy = true;

  try {
    const width =
      mentorCameraVideo.videoWidth || 1280;

    const height =
      mentorCameraVideo.videoHeight || 720;

    ensureAICanvasSize(
      width,
      height
    );

    await state.segmentation.send({
      image: mentorCameraVideo
    });
  } catch (error) {
    console.warn(
      "Segmentation error:",
      error
    );
  } finally {
    segmentationBusy = false;
  }
}


/* =========================================================
   SEGMENTATION RESULTS
   ========================================================= */

function handleSegmentationResults(results) {
  if (!results?.image || !results?.segmentationMask) {
    return;
  }

  const image = results.image;

  const width =
    image.videoWidth ||
    image.width;

  const height =
    image.videoHeight ||
    image.height;

  if (!width || !height) return;

  ensureAICanvasSize(
    width,
    height
  );

  const sourceCtx =
    aiSourceCanvas.getContext(
      "2d",
      {
        willReadFrequently: true
      }
    );

  const maskCtx =
    aiMaskCanvas.getContext(
      "2d",
      {
        willReadFrequently: true
      }
    );

  const outputCtx =
    aiCanvas.getContext("2d");

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

  outputCtx.clearRect(
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

  maskCtx.drawImage(
    results.segmentationMask,
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
      (confidence - 0.15) / 0.65;

    alpha =
      Math.max(
        0,
        Math.min(
          1,
          alpha
        )
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

  outputCtx.putImageData(
    personData,
    0,
    0
  );

  mentorAICanvas.style.display =
    "block";

  mentorCameraVideo.style.display =
    "none";

  mentorPlaceholder.style.display =
    "none";

  renderCompositionFrame();
}


/* =========================================================
   AI BACKGROUND MODE
   ========================================================= */

function setBackgroundMode(mode) {
  state.backgroundMode = mode;

  qsa(
    "[data-bg-mode]"
  ).forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.bgMode === mode
    );
  });

  renderCompositionFrame();

  showToast(
    `Background: ${mode}`,
    "success"
  );
}


bindClick(
  "bgOriginalBtn",
  () => setBackgroundMode("original")
);

bindClick(
  "bgRemoveBtn",
  () => setBackgroundMode("remove")
);

bindClick(
  "bgBlurBtn",
  () => setBackgroundMode("blur")
);

bindClick(
  "bgImageBtn",
  () => {
    if (!state.backgroundImage) {
      $("backgroundImageUpload")?.click();
      return;
    }

    setBackgroundMode("image");
  }
);

bindClick(
  "bgColorBtn",
  () => setBackgroundMode("color")
);


$("backgroundColor")?.addEventListener(
  "input",
  event => {
    state.backgroundColor =
      event.target.value;

    if (
      state.backgroundMode ===
      "color"
    ) {
      renderCompositionFrame();
    }
  }
);


/* =========================================================
   DRAW BACKGROUND
   ========================================================= */

function drawBackground(
  ctx,
  width,
  height
) {
  const mode =
    state.backgroundMode;

  if (
    mode === "color"
  ) {
    ctx.fillStyle =
      state.backgroundColor;

    ctx.fillRect(
      0,
      0,
      width,
      height
    );

    return;
  }

  if (
    mode === "image" &&
    state.backgroundImage
  ) {
    drawCoverImage(
      ctx,
      state.backgroundImage,
      0,
      0,
      width,
      height
    );

    return;
  }

  if (
    mode === "blur"
  ) {
    ctx.save();

    ctx.filter =
      "blur(22px)";

    drawMediaCover(
      ctx,
      mentorCameraVideo,
      0,
      0,
      width,
      height
    );

    ctx.restore();

    return;
  }

  if (
    mode === "remove"
  ) {
    ctx.fillStyle =
      "#111827";

    ctx.fillRect(
      0,
      0,
      width,
      height
    );

    return;
  }

  drawMediaCover(
    ctx,
    mentorCameraVideo,
    0,
    0,
    width,
    height
  );
}


/* =========================================================
   MEDIA DRAW HELPERS
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
    media.width;

  const mediaHeight =
    media.videoHeight ||
    media.height;

  if (!mediaWidth || !mediaHeight) {
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
    (width - drawWidth) / 2;

  const drawY =
    y +
    (height - drawHeight) / 2;

  ctx.drawImage(
    media,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );
}


function drawCoverImage(
  ctx,
  image,
  x,
  y,
  width,
  height
) {
  if (!image) return;

  const imageWidth =
    image.naturalWidth ||
    image.width;

  const imageHeight =
    image.naturalHeight ||
    image.height;

  const scale =
    Math.max(
      width / imageWidth,
      height / imageHeight
    );

  const drawWidth =
    imageWidth * scale;

  const drawHeight =
    imageHeight * scale;

  const drawX =
    x +
    (width - drawWidth) / 2;

  const drawY =
    y +
    (height - drawHeight) / 2;

  ctx.drawImage(
    image,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );
}


/* =========================================================
   MENTOR SOURCE
   ========================================================= */

function getMentorSource() {
  if (
    state.mentorSource ===
    "video" &&
    mentorVideo.readyState >=
      HTMLMediaElement.HAVE_CURRENT_DATA
  ) {
    return mentorVideo;
  }

  if (
    state.mentorSource ===
    "camera"
  ) {
    if (
      state.backgroundMode ===
      "original"
    ) {
      return mentorCameraVideo;
    }

    if (
      state.backgroundMode ===
        "remove" ||
      state.backgroundMode ===
        "blur" ||
      state.backgroundMode ===
        "image" ||
      state.backgroundMode ===
        "color"
    ) {
      return aiCanvas;
    }
  }

  return null;
}


/* =========================================================
   COMPOSITION CANVAS
   ========================================================= */

function ensureCompositionCanvas() {
  let width = 1280;
  let height = 720;

  const quality =
    String(
      state.recording.width
    );

  if (
    quality === "1920"
  ) {
    width = 1920;
    height = 1080;
  }

  if (
    quality === "2560"
  ) {
    width = 2560;
    height = 1440;
  }

  if (
    !state.compositionCanvas
  ) {
    state.compositionCanvas =
      document.createElement(
        "canvas"
      );

    state.compositionCtx =
      state.compositionCanvas.getContext(
        "2d"
      );
  }

  if (
    state.compositionCanvas.width !==
      width ||
    state.compositionCanvas.height !==
      height
  ) {
    state.compositionCanvas.width =
      width;

    state.compositionCanvas.height =
      height;
  }

  return state.compositionCanvas;
}


/* =========================================================
   DRAW MAIN SOURCE
   ========================================================= */

function drawMainSource(
  ctx,
  width,
  height
) {
  if (
    mainVideo &&
    mainVideo.style.display !==
      "none" &&
    mainVideo.readyState >=
      HTMLMediaElement.HAVE_CURRENT_DATA
  ) {
    drawMediaContain(
      ctx,
      mainVideo,
      0,
      0,
      width,
      height
    );

    return;
  }

  if (
    screenCaptureVideo &&
    screenCaptureVideo.style.display !==
      "none" &&
    screenCaptureVideo.readyState >=
      HTMLMediaElement.HAVE_CURRENT_DATA
  ) {
    drawMediaContain(
      ctx,
      screenCaptureVideo,
      0,
      0,
      width,
      height
    );

    return;
  }

  if (
    state.mainImage
  ) {
    drawCoverImage(
      ctx,
      state.mainImage,
      0,
      0,
      width,
      height
    );

    return;
  }

  ctx.fillStyle =
    "#0b0f17";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );
}


function drawMediaContain(
  ctx,
  media,
  x,
  y,
  width,
  height
) {
  const mediaWidth =
    media.videoWidth ||
    media.width;

  const mediaHeight =
    media.videoHeight ||
    media.height;

  if (
    !mediaWidth ||
    !mediaHeight
  ) {
    return;
  }

  const scale =
    Math.min(
      width / mediaWidth,
      height / mediaHeight
    );

  const drawWidth =
    mediaWidth * scale;

  const drawHeight =
    mediaHeight * scale;

  const drawX =
    x +
    (width - drawWidth) / 2;

  const drawY =
    y +
    (height - drawHeight) / 2;

  ctx.drawImage(
    media,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );
}


/* =========================================================
   MENTOR OVERLAY
   ========================================================= */

function drawMentorOverlay(
  ctx,
  width,
  height
) {
  if (!mentorCard) return;

  const source =
    getMentorSource();

  if (!source) return;

  const stageRect =
    stage?.getBoundingClientRect();

  const cardRect =
    mentorCard.getBoundingClientRect();

  if (
    !stageRect ||
    !cardRect
  ) {
    return;
  }

  const scaleX =
    width /
    stageRect.width;

  const scaleY =
    height /
    stageRect.height;

  let x =
    (cardRect.left -
      stageRect.left) *
    scaleX;

  let y =
    (cardRect.top -
      stageRect.top) *
    scaleY;

  let w =
    cardRect.width *
    scaleX;

  let h =
    cardRect.height *
    scaleY;

  x =
    Math.max(
      0,
      Math.min(
        width - w,
        x
      )
    );

  y =
    Math.max(
      0,
      Math.min(
        height - h,
        y
      )
    );

  w =
    Math.max(
      80,
      Math.min(
        width,
        w
      )
    );

  h =
    Math.max(
      60,
      Math.min(
        height,
        h
      )
    );

  ctx.save();

  const radius =
    Math.min(
      26,
      w * 0.08
    );

  roundedRectPath(
    ctx,
    x,
    y,
    w,
    h,
    radius
  );

  ctx.clip();

  if (
    source === aiCanvas &&
    state.mentorSource ===
      "camera"
  ) {
    ctx.drawImage(
      aiCanvas,
      x,
      y,
      w,
      h
    );
  } else {
    drawMediaCover(
      ctx,
      source,
      x,
      y,
      w,
      h
    );
  }

  ctx.restore();

  ctx.save();

  ctx.strokeStyle =
    "rgba(255,255,255,.16)";

  ctx.lineWidth =
    Math.max(
      1,
      width / 1000
    );

  roundedRectPath(
    ctx,
    x,
    y,
    w,
    h,
    radius
  );

  ctx.stroke();

  ctx.restore();
}


function roundedRectPath(
  ctx,
  x,
  y,
  width,
  height,
  radius
) {
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
   BRAND BADGE
   ========================================================= */

function drawBrandBadge(
  ctx,
  width,
  height
) {
  const brand =
    state.settings.brandName ||
    "SNK Mentor Studio";

  const padding =
    Math.max(
      12,
      width * 0.012
    );

  const fontSize =
    Math.max(
      14,
      width * 0.014
    );

  ctx.save();

  ctx.font =
    `600 ${fontSize}px Inter, Arial, sans-serif`;

  const textWidth =
    ctx.measureText(brand).width;

  const boxWidth =
    textWidth +
    padding * 2;

  const boxHeight =
    fontSize +
    padding;

  const x =
    padding;

  const y =
    height -
    boxHeight -
    padding;

  ctx.fillStyle =
    "rgba(5,10,18,.78)";

  roundedRectPath(
    ctx,
    x,
    y,
    boxWidth,
    boxHeight,
    12
  );

  ctx.fill();

  ctx.fillStyle =
    "#ffffff";

  ctx.fillText(
    brand,
    x + padding,
    y +
      boxHeight / 2 +
      fontSize * 0.35
  );

  ctx.restore();
}


/* =========================================================
   TELEPROMPTER IN RECORDING
   ========================================================= */

function drawTeleprompterRecording(
  ctx,
  width,
  height
) {
  if (
    !state.teleprompter.includeInRecording
  ) {
    return;
  }

  if (
    !state.teleprompter.text.trim()
  ) {
    return;
  }

  const fontSize =
    Math.max(
      20,
      Number(
        state.teleprompter.fontSize
      )
    );

  ctx.save();

  ctx.fillStyle =
    `rgba(0,0,0,${
      Math.max(
        0.15,
        1 -
          Number(
            state.teleprompter.opacity
          )
      )
    })`;

  ctx.fillRect(
    0,
    height * 0.72,
    width,
    height * 0.28
  );

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    `600 ${fontSize}px Inter, Arial, sans-serif`;

  ctx.textAlign =
    "center";

  const lines =
    state.teleprompter.text
      .split(/\r?\n/)
      .slice(0, 4);

  lines.forEach(
    (line, index) => {
      ctx.fillText(
        line,
        width / 2,
        height *
            0.79 +
          index *
            (fontSize + 10)
      );
    }
  );

  ctx.restore();
}


/* =========================================================
   RECORDING OVERLAY IN CANVAS
   ========================================================= */

function drawRecordingIndicator(
  ctx,
  width,
  height
) {
  if (
    !state.recording.active
  ) {
    return;
  }

  const elapsed =
    getRecordingElapsed();

  const text =
    formatTime(elapsed);

  ctx.save();

  ctx.fillStyle =
    "rgba(10,10,10,.7)";

  roundedRectPath(
    ctx,
    20,
    20,
    140,
    48,
    12
  );

  ctx.fill();

  ctx.fillStyle =
    "#ff4d5f";

  ctx.beginPath();

  ctx.arc(
    44,
    44,
    7,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    "700 18px Inter, Arial, sans-serif";

  ctx.fillText(
    state.recording.paused
      ? "PAUSED"
      : text,
    62,
    50
  );

  ctx.restore();
}


/* =========================================================
   COMPOSITION RENDER
   ========================================================= */

function renderCompositionFrame() {
  const canvas =
    ensureCompositionCanvas();

  const ctx =
    state.compositionCtx;

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

  drawMainSource(
    ctx,
    width,
    height
  );

  drawMentorOverlay(
    ctx,
    width,
    height
  );

  drawTeleprompterRecording(
    ctx,
    width,
    height
  );

  drawBrandBadge(
    ctx,
    width,
    height
  );

  drawRecordingIndicator(
    ctx,
    width,
    height
  );

  return canvas;
}


/* =========================================================
   CONTINUOUS RENDER LOOP
   ========================================================= */

function renderLoop() {
  renderCompositionFrame();

  processCameraSegmentation();

  state.renderAnimationId =
    requestAnimationFrame(
      renderLoop
    );
}


function startRenderLoop() {
  if (
    state.renderAnimationId
  ) {
    return;
  }

  state.renderAnimationId =
    requestAnimationFrame(
      renderLoop
    );
}


function stopRenderLoop() {
  if (
    state.renderAnimationId
  ) {
    cancelAnimationFrame(
      state.renderAnimationId
    );

    state.renderAnimationId =
      null;
  }
}


/* =========================================================
   AUDIO ENGINE
   ========================================================= */

function ensureAudioContext() {
  if (
    state.audio.context
  ) {
    return state.audio.context;
  }

  const AudioContextClass =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error(
      "Web Audio API is not supported."
    );
  }

  const context =
    new AudioContextClass();

  state.audio.context =
    context;

  state.audio.destination =
    context.createMediaStreamDestination();

  return context;
}


/* =========================================================
   MAIN VIDEO AUDIO
   ========================================================= */

function setupMainVideoAudio() {
  if (!mainVideo) return;

  try {
    const context =
      ensureAudioContext();

    if (
      state.audio.mainSource
    ) {
      try {
        state.audio.mainSource.disconnect();
      } catch (_) {}
    }

    state.audio.mainSource =
      context.createMediaElementSource(
        mainVideo
      );

    state.audio.mainGain =
      context.createGain();

    state.audio.mainGain.gain.value =
      state.audio.mainVolume;

    state.audio.analyserMain =
      context.createAnalyser();

    state.audio.analyserMain.fftSize =
      256;

    state.audio.mainSource.connect(
      state.audio.mainGain
    );

    state.audio.mainGain.connect(
      state.audio.analyserMain
    );

    state.audio.analyserMain.connect(
      context.destination
    );

    state.audio.mainGain.connect(
      state.audio.destination
    );
  } catch (error) {
    console.warn(
      "Main audio setup:",
      error
    );
  }
}


/* =========================================================
   MICROPHONE AUDIO
   ========================================================= */

async function setupMicrophoneAudio(
  cameraStream
) {
  if (!cameraStream) return;

  try {
    const context =
      ensureAudioContext();

    state.audio.micStream =
      cameraStream;

    if (
      state.audio.micSource
    ) {
      try {
        state.audio.micSource.disconnect();
      } catch (_) {}
    }

    state.audio.micSource =
      context.createMediaStreamSource(
        cameraStream
      );

    state.audio.micGain =
      context.createGain();

    state.audio.micGain.gain.value =
      state.audio.micEnabled
        ? state.audio.micVolume
        : 0;

    state.audio.analyserMic =
      context.createAnalyser();

    state.audio.analyserMic.fftSize =
      256;

    state.audio.micSource.connect(
      state.audio.micGain
    );

    state.audio.micGain.connect(
      state.audio.analyserMic
    );

    state.audio.analyserMic.connect(
      state.audio.destination
    );

    if (
      state.audio.micMonitor
    ) {
      state.audio.micGain.connect(
        context.destination
      );
    }

    if (
      context.state === "suspended"
    ) {
      await context.resume();
    }

    updateMicStatus();
  } catch (error) {
    console.error(error);

    showToast(
      "Microphone audio could not be initialized.",
      "error"
    );
  }
}


/* =========================================================
   AUDIO SETTINGS
   ========================================================= */

function updateMainVolume(value) {
  const volume =
    Math.max(
      0,
      Math.min(
        1,
        Number(value)
      )
    );

  state.audio.mainVolume =
    volume;

  if (
    state.audio.mainGain
  ) {
    state.audio.mainGain.gain.value =
      volume;
  }

  const label =
    $("mainVolumeValue");

  if (label) {
    label.textContent =
      `${Math.round(
        volume * 100
      )}%`;
  }
}


$("mainVideoVolume")?.addEventListener(
  "input",
  event => {
    updateMainVolume(
      event.target.value
    );
  }
);


$("mainVideoAudioCheckbox")?.addEventListener(
  "change",
  event => {
    updateMainVolume(
      event.target.checked
        ? $("mainVideoVolume")?.value ||
            1
        : 0
    );
  }
);


function updateMicVolume(value) {
  const volume =
    Math.max(
      0,
      Math.min(
        1,
        Number(value)
      )
    );

  state.audio.micVolume =
    volume;

  if (
    state.audio.micGain
  ) {
    state.audio.micGain.gain.value =
      state.audio.micEnabled
        ? volume
        : 0;
  }

  const label =
    $("micVolumeValue");

  if (label) {
    label.textContent =
      `${Math.round(
        volume * 100
      )}%`;
  }
}


$("micVolume")?.addEventListener(
  "input",
  event => {
    updateMicVolume(
      event.target.value
    );
  }
);


$("micEnabled")?.addEventListener(
  "change",
  event => {
    state.audio.micEnabled =
      event.target.checked;

    if (
      state.audio.micGain
    ) {
      state.audio.micGain.gain.value =
        state.audio.micEnabled
          ? state.audio.micVolume
          : 0;
    }

    updateMicStatus();
  }
);


$("micMonitor")?.addEventListener(
  "change",
  event => {
    state.audio.micMonitor =
      event.target.checked;

    updateMicMonitorRouting();
  }
);


function updateMicMonitorRouting() {
  const context =
    state.audio.context;

  const gain =
    state.audio.micGain;

  if (
    !context ||
    !gain
  ) {
    return;
  }

  try {
    gain.disconnect();
  } catch (_) {}

  if (
    state.audio.analyserMic
  ) {
    gain.connect(
      state.audio.analyserMic
    );
  }

  if (
    state.audio.analyserMic
  ) {
    try {
      state.audio.analyserMic.disconnect();
    } catch (_) {}

    state.audio.analyserMic.connect(
      state.audio.destination
    );

    if (
      state.audio.micMonitor
    ) {
      state.audio.analyserMic.connect(
        context.destination
      );
    }
  }
}


function updateMicStatus() {
  const status =
    qs("[data-mic-status]");

  if (!status) return;

  if (
    !state.audio.micEnabled
  ) {
    status.textContent =
      "Microphone muted";
    return;
  }

  if (
    state.cameraStream
  ) {
    status.textContent =
      "Microphone ready";
  } else {
    status.textContent =
      "Microphone unavailable";
  }
}


/* =========================================================
   AUDIO METERS
   ========================================================= */

function getAnalyserLevel(
  analyser
) {
  if (!analyser) return 0;

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
      sum / buffer.length
    );

  return Math.min(
    1,
    rms * 3
  );
}


function updateAudioMeters() {
  const micLevel =
    getAnalyserLevel(
      state.audio.analyserMic
    );

  const mainLevel =
    getAnalyserLevel(
      state.audio.analyserMain
    );

  const micBar =
    $("micLevelBar");

  const mainBar =
    $("mainAudioLevelBar");

  if (micBar) {
    micBar.style.width =
      `${Math.round(
        micLevel * 100
      )}%`;
  }

  if (mainBar) {
    mainBar.style.width =
      `${Math.round(
        mainLevel * 100
      )}%`;
  }

  drawMicWaveform();

  requestAnimationFrame(
    updateAudioMeters
  );
}


/* =========================================================
   MIC WAVEFORM
   ========================================================= */

function drawMicWaveform() {
  const canvas =
    $("micWaveformCanvas");

  const analyser =
    state.audio.analyserMic;

  if (
    !canvas ||
    !analyser
  ) {
    return;
  }

  const ctx =
    canvas.getContext("2d");

  const width =
    canvas.width =
      canvas.clientWidth ||
      500;

  const height =
    canvas.height =
      canvas.clientHeight ||
      90;

  const data =
    new Uint8Array(
      analyser.fftSize
    );

  analyser.getByteTimeDomainData(
    data
  );

  ctx.clearRect(
    0,
    0,
    width,
    height
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
    const value =
      data[i] / 128;

    const y =
      value *
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
    "rgba(92,170,255,.95)";

  ctx.lineWidth = 2;

  ctx.stroke();
}


/* =========================================================
   SCREEN CAPTURE
   ========================================================= */

async function startScreenCapture() {
  try {
    if (
      !navigator.mediaDevices?.getDisplayMedia
    ) {
      throw new Error(
        "Screen capture is not supported."
      );
    }

    stopScreenCapture(false);

    const stream =
      await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: 30
        },

        audio: true
      });

    state.screenStream =
      stream;

    screenCaptureVideo.srcObject =
      stream;

    screenCaptureVideo.muted =
      true;

    screenCaptureVideo.style.display =
      "block";

    mainVideo.style.display =
      "none";

    mainImage.style.display =
      "none";

    await screenCaptureVideo.play();

    setupScreenAudio(stream);

    const videoTrack =
      stream.getVideoTracks()[0];

    if (videoTrack) {
      videoTrack.addEventListener(
        "ended",
        () => {
          stopScreenCapture(true);
        }
      );
    }

    updateScreenCaptureStatus(
      "Screen sharing active",
      true
    );

    startRenderLoop();

    showToast(
      "Screen capture started.",
      "success"
    );
  } catch (error) {
    console.error(error);

    showToast(
      error.message ||
        "Screen capture cancelled.",
      "warning"
    );
  }
}


function stopScreenCapture(
  showMessage = true
) {
  if (
    state.screenStream
  ) {
    state.screenStream
      .getTracks()
      .forEach(track => {
        track.stop();
      });

    state.screenStream =
      null;
  }

  if (
    screenCaptureVideo
  ) {
    screenCaptureVideo.srcObject =
      null;

    screenCaptureVideo.style.display =
      "none";
  }

  updateScreenCaptureStatus(
    "Screen capture inactive",
    false
  );

  if (showMessage) {
    showToast(
      "Screen capture stopped.",
      "info"
    );
  }

  renderCompositionFrame();
}


/* =========================================================
   SCREEN AUDIO
   ========================================================= */

function setupScreenAudio(stream) {
  if (
    !stream.getAudioTracks().length
  ) {
    return;
  }

  try {
    const context =
      ensureAudioContext();

    state.audio.screenSource =
      context.createMediaStreamSource(
        stream
      );

    state.audio.screenGain =
      context.createGain();

    state.audio.screenGain.gain.value =
      1;

    state.audio.screenSource.connect(
      state.audio.screenGain
    );

    state.audio.screenGain.connect(
      state.audio.destination
    );
  } catch (error) {
    console.warn(
      "Screen audio:",
      error
    );
  }
}


function updateScreenCaptureStatus(
  text,
  active
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
      active
    );
  }
}


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
  () => stopScreenCapture(true)
);


/* =========================================================
   RECORDING QUALITY
   ========================================================= */

function applyRecordingQuality(
  value
) {
  const presets = {
    "720": {
      width: 1280,
      height: 720
    },

    "1080": {
      width: 1920,
      height: 1080
    },

    "1440": {
      width: 2560,
      height: 1440
    }
  };

  const preset =
    presets[value] ||
    presets["1080"];

  state.recording.width =
    preset.width;

  state.recording.height =
    preset.height;

  state.settings.recordingQuality =
    value;

  saveSettings();
}


$("recordingQuality")?.addEventListener(
  "change",
  event => {
    applyRecordingQuality(
      event.target.value
    );

    renderCompositionFrame();
  }
);


$("recordingQualitySide")?.addEventListener(
  "change",
  event => {
    applyRecordingQuality(
      event.target.value
    );

    if (
      $("recordingQuality")
    ) {
      $("recordingQuality").value =
        event.target.value;
    }

    renderCompositionFrame();
  }
);


$("settingsRecordingQuality")?.addEventListener(
  "change",
  event => {
    applyRecordingQuality(
      event.target.value
    );
  }
);


/* =========================================================
   RECORDING FPS
   ========================================================= */

function applyRecordingFps(value) {
  state.recording.fps =
    Number(value) || 30;

  state.settings.recordingFps =
    String(
      state.recording.fps
    );

  saveSettings();
}


$("recordingFps")?.addEventListener(
  "change",
  event => {
    applyRecordingFps(
      event.target.value
    );
  }
);


$("recordingFpsSide")?.addEventListener(
  "change",
  event => {
    applyRecordingFps(
      event.target.value
    );

    if (
      $("recordingFps")
    ) {
      $("recordingFps").value =
        event.target.value;
    }
  }
);


$("settingsRecordingFps")?.addEventListener(
  "change",
  event => {
    applyRecordingFps(
      event.target.value
    );
  }
);


/* =========================================================
   RECORDING FORMAT
   ========================================================= */

function getSupportedMimeType(
  requested
) {
  const types = [];

  if (
    requested ===
    "webm-vp9"
  ) {
    types.push(
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm"
    );
  }

  if (
    requested ===
    "webm-vp8"
  ) {
    types.push(
      "video/webm;codecs=vp8,opus",
      "video/webm"
    );
  }

  if (
    requested ===
    "mp4"
  ) {
    types.push(
      "video/mp4;codecs=h264,aac",
      "video/mp4"
    );
  }

  types.push(
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm"
  );

  if (
    typeof MediaRecorder !==
    "undefined" &&
    MediaRecorder.isTypeSupported
  ) {
    for (
      const type of types
    ) {
      if (
        MediaRecorder.isTypeSupported(
          type
        )
      ) {
        return type;
      }
    }
  }

  return "";
}


function updateFormatSupportUI() {
  const select =
    $("recordingFormat");

  if (!select) return;

  const mp4Option =
    [...select.options].find(
      option =>
        option.value ===
        "mp4"
    );

  if (mp4Option) {
    mp4Option.disabled =
      !getSupportedMimeType(
        "mp4"
      );
  }
}


$("recordingFormat")?.addEventListener(
  "change",
  event => {
    state.recording.format =
      event.target.value;
  }
);


$("recordingFormatSide")?.addEventListener(
  "change",
  event => {
    state.recording.format =
      event.target.value;

    if (
      $("recordingFormat")
    ) {
      $("recordingFormat").value =
        event.target.value;
    }
  }
);


/* =========================================================
   FILE NAME
   ========================================================= */

function sanitizeFileName(
  name
) {
  return String(name)
    .trim()
    .replace(
      /[<>:"/\\|?*\x00-\x1F]/g,
      "-"
    )
    .replace(
      /\s+/g,
      "-"
    )
    .slice(
      0,
      100
    );
}


function getRecordingFileName() {
  const input =
    $("recordingFileName");

  const sideInput =
    $("recordingFileNameSide");

  const name =
    input?.value ||
    sideInput?.value ||
    state.recording.fileName ||
    "course-recording";

  return (
    sanitizeFileName(name) ||
    "course-recording"
  );
}


/* =========================================================
   RECORDING ELAPSED TIME
   ========================================================= */

function getRecordingElapsed() {
  if (
    !state.recording.startedAt
  ) {
    return 0;
  }

  if (
    state.recording.paused
  ) {
    return (
      state.recording.pausedAt -
      state.recording.startedAt -
      state.recording.accumulatedPause
    );
  }

  return (
    performance.now() -
    state.recording.startedAt -
    state.recording.accumulatedPause
  );
}


function formatTime(
  milliseconds
) {
  const totalSeconds =
    Math.max(
      0,
      Math.floor(
        milliseconds / 1000
      )
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

  if (hours > 0) {
    return [
      String(hours).padStart(
        2,
        "0"
      ),
      String(minutes).padStart(
        2,
        "0"
      ),
      String(seconds).padStart(
        2,
        "0"
      )
    ].join(":");
  }

  return [
    String(minutes).padStart(
      2,
      "0"
    ),
    String(seconds).padStart(
      2,
      "0"
    )
  ].join(":");
}


/* =========================================================
   RECORDING UI TIMER
   ========================================================= */

let recordingTimerAnimation = null;

function updateRecordingTimerUI() {
  const elapsed =
    getRecordingElapsed();

  const text =
    formatTime(elapsed);

  const timer =
    $("recordingTimer");

  const overlayTimer =
    $("recordingOverlayTimer");

  if (timer) {
    timer.textContent =
      text;
  }

  if (overlayTimer) {
    overlayTimer.textContent =
      text;
  }

  renderCompositionFrame();

  recordingTimerAnimation =
    requestAnimationFrame(
      updateRecordingTimerUI
    );
}


function stopRecordingTimerUI() {
  if (
    recordingTimerAnimation
  ) {
    cancelAnimationFrame(
      recordingTimerAnimation
    );

    recordingTimerAnimation =
      null;
  }
}


/* =========================================================
   RECORDING STATUS
   ========================================================= */

function updateRecordingIndicators() {
  const cameraIndicator =
    $("cameraIndicator");

  const micIndicator =
    $("micIndicator");

  const audioIndicator =
    $("audioIndicator");

  const screenIndicator =
    $("screenIndicator");

  const dot =
    $("recordingStatusDot");

  const text =
    $("recordingStatusText");

  const bar =
    $("recordingStatusBar");

  if (cameraIndicator) {
    cameraIndicator.classList.toggle(
      "active",
      Boolean(
        state.cameraStream
      )
    );
  }

  if (micIndicator) {
    micIndicator.classList.toggle(
      "active",
      Boolean(
        state.audio.micEnabled &&
        state.cameraStream
      )
    );
  }

  if (audioIndicator) {
    audioIndicator.classList.toggle(
      "active",
      Boolean(
        state.audio.destination
      )
    );
  }

  if (screenIndicator) {
    screenIndicator.classList.toggle(
      "active",
      Boolean(
        state.screenStream
      )
    );
  }

  if (dot) {
    dot.classList.toggle(
      "active",
      state.recording.active
    );
  }

  if (text) {
    if (
      state.recording.active &&
      state.recording.paused
    ) {
      text.textContent =
        "Recording paused";
    } else if (
      state.recording.active
    ) {
      text.textContent =
        "Recording";
    } else {
      text.textContent =
        "Ready";
    }
  }

  if (bar) {
    bar.classList.toggle(
      "recording",
      state.recording.active
    );
  }
}


/* =========================================================
   BUILD RECORDING STREAM
   ========================================================= */

function buildRecordingStream() {
  const canvas =
    ensureCompositionCanvas();

  const fps =
    state.recording.fps ||
    30;

  const canvasStream =
    canvas.captureStream(
      fps
    );

  const stream =
    new MediaStream();

  canvasStream
    .getVideoTracks()
    .forEach(track => {
      stream.addTrack(track);
    });

  const audioDestination =
    state.audio.destination;

  if (
    audioDestination
  ) {
    audioDestination.stream
      .getAudioTracks()
      .forEach(track => {
        stream.addTrack(track);
      });
  }

  return stream;
}


/* =========================================================
   START RECORDING
   ========================================================= */

async function startRecording() {
  if (
    state.recording.active
  ) {
    return;
  }

  try {
    ensureCompositionCanvas();

    const context =
      state.audio.context;

    if (
      context &&
      context.state ===
        "suspended"
    ) {
      await context.resume();
    }

    const mimeType =
      getSupportedMimeType(
        state.recording.format
      );

    if (!mimeType) {
      throw new Error(
        "No supported recording format was found."
      );
    }

    const stream =
      buildRecordingStream();

    const recorder =
      new MediaRecorder(
        stream,
        {
          mimeType,
          videoBitsPerSecond:
            getVideoBitrate()
        }
      );

    state.recording.mediaRecorder =
      recorder;

    state.recording.mimeType =
      mimeType;

    state.recording.chunks =
      [];

    state.recording.startedAt =
      performance.now();

    state.recording.pausedAt =
      0;

    state.recording.accumulatedPause =
      0;

    state.recording.elapsed =
      0;

    state.recording.paused =
      false;

    state.recording.active =
      true;

    state.recording.fileName =
      getRecordingFileName();

    state.recording.trimStart =
      0;

    state.recording.trimEnd =
      0;

    recorder.ondataavailable =
      event => {
        if (
          event.data &&
          event.data.size > 0
        ) {
          state.recording.chunks.push(
            event.data
          );
        }
      };

    recorder.onerror =
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

    recorder.onstop =
      finalizeRecording;

    recorder.start(1000);

    updateRecordingIndicators();

    showRecordingOverlay(true);

    updateRecordingTimerUI();

    startRenderLoop();

    if (
      state.settings
        .autoStartTeleprompter
    ) {
      playTeleprompter();
    }

    showToast(
      "Recording started.",
      "success"
    );
  } catch (error) {
    console.error(error);

    state.recording.active =
      false;

    updateRecordingIndicators();

    showToast(
      error.message ||
        "Could not start recording.",
      "error"
    );
  }
}


/* =========================================================
   BITRATE
   ========================================================= */

function getVideoBitrate() {
  const width =
    state.recording.width;

  if (width >= 2560) {
    return 18000000;
  }

  if (width >= 1920) {
    return 12000000;
  }

  return 7000000;
}


/* =========================================================
   PAUSE RECORDING
   ========================================================= */

function pauseRecording() {
  const recorder =
    state.recording.mediaRecorder;

  if (
    !state.recording.active ||
    state.recording.paused ||
    !recorder
  ) {
    return;
  }

  if (
    recorder.state ===
    "recording"
  ) {
    recorder.pause();

    state.recording.paused =
      true;

    state.recording.pausedAt =
      performance.now();

    updateRecordingIndicators();

    showToast(
      "Recording paused.",
      "info"
    );
  }
}


/* =========================================================
   RESUME RECORDING
   ========================================================= */

function resumeRecording() {
  const recorder =
    state.recording.mediaRecorder;

  if (
    !state.recording.active ||
    !state.recording.paused ||
    !recorder
  ) {
    return;
  }

  if (
    recorder.state ===
    "paused"
  ) {
    recorder.resume();

    state.recording.accumulatedPause +=
      performance.now() -
      state.recording.pausedAt;

    state.recording.pausedAt =
      0;

    state.recording.paused =
      false;

    updateRecordingIndicators();

    showToast(
      "Recording resumed.",
      "success"
    );
  }
}


/* =========================================================
   STOP RECORDING
   ========================================================= */

function stopRecording() {
  const recorder =
    state.recording.mediaRecorder;

  if (
    !state.recording.active ||
    !recorder
  ) {
    return;
  }

  try {
    if (
      recorder.state ===
      "paused"
    ) {
      recorder.resume();
    }

    if (
      recorder.state !==
      "inactive"
    ) {
      recorder.stop();
    }
  } catch (error) {
    console.error(error);
  }
}


bindClick(
  "recordBtn",
  () => {
    if (
      state.recording.active
    ) {
      if (
        state.recording.paused
      ) {
        resumeRecording();
      } else {
        pauseRecording();
      }

      return;
    }

    startRecording();
  }
);


bindClick(
  "recordToolbarBtn",
  () => {
    if (
      state.recording.active
    ) {
      if (
        state.recording.paused
      ) {
        resumeRecording();
      } else {
        pauseRecording();
      }

      return;
    }

    startRecording();
  }
);


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


/* =========================================================
   SHOW / HIDE RECORDING OVERLAY
   ========================================================= */

function showRecordingOverlay(
  visible
) {
  const overlay =
    $("recordingOverlay");

  if (!overlay) return;

  overlay.style.display =
    visible
      ? "flex"
      : "none";
}


/* =========================================================
   FINALIZE RECORDING
   ========================================================= */

function finalizeRecording() {
  stopRecordingTimerUI();

  state.recording.active =
    false;

  state.recording.paused =
    false;

  showRecordingOverlay(false);

  updateRecordingIndicators();

  if (
    !state.recording.chunks.length
  ) {
    showToast(
      "No recording data was captured.",
      "error"
    );

    return;
  }

  const blob =
    new Blob(
      state.recording.chunks,
      {
        type:
          state.recording.mimeType ||
          "video/webm"
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  state.recording.blob =
    blob;

  state.recording.url =
    url;

  const duration =
    Math.max(
      0.1,
      getBlobDurationEstimate()
    );

  const recordingItem = {
    id:
      `rec-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    name:
      state.recording.fileName ||
      "course-recording",

    createdAt:
      new Date().toISOString(),

    duration,

    size:
      blob.size,

    mimeType:
      blob.type,

    blob,

    url
  };

  state.recording.historyId =
    recordingItem.id;

  state.recordings.unshift(
    recordingItem
  );

  saveRecordingHistoryMetadata();

  renderRecordingHistory();

  openRecordingPreview(
    recordingItem
  );

  showToast(
    "Recording completed.",
    "success"
  );
}


/* =========================================================
   DURATION ESTIMATE
   ========================================================= */

function getBlobDurationEstimate() {
  const elapsed =
    state.recording.pausedAt
      ? state.recording.pausedAt -
        state.recording.startedAt -
        state.recording.accumulatedPause
      : performance.now() -
        state.recording.startedAt -
        state.recording.accumulatedPause;

  return Math.max(
    0.1,
    elapsed / 1000
  );
}


/* =========================================================
   RECORDING PREVIEW
   ========================================================= */

let activePreviewItem = null;

function openRecordingPreview(
  item
) {
  activePreviewItem =
    item;

  const modal =
    $("recordingPreviewModal");

  const video =
    $("recordingPreviewVideo");

  if (!modal || !video) {
    return;
  }

  if (
    item.url
  ) {
    video.src =
      item.url;
  } else if (
    item.blob
  ) {
    item.url =
      URL.createObjectURL(
        item.blob
      );

    video.src =
      item.url;
  } else {
    showToast(
      "This recording is no longer available in this session.",
      "warning"
    );

    return;
  }

  video.load();

  modal.classList.add(
    "open"
  );

  updatePreviewMetadata(
    item
  );

  setupPreviewTimeControls();

  setTrimFields(
    0,
    item.duration || 0
  );
}


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
      "open"
    );
  }

  activePreviewItem =
    null;
}


bindClick(
  "closeRecordingPreviewBtn",
  closeRecordingPreview
);


/* =========================================================
   PREVIEW METADATA
   ========================================================= */

function updatePreviewMetadata(
  item
) {
  const info =
    $("recordingFileInfo");

  if (!info) return;

  info.innerHTML = `
    <div>
      <strong>${escapeHtml(
        item.name
      )}</strong>
    </div>

    <div>
      Duration:
      ${formatSeconds(
        item.duration || 0
      )}
    </div>

    <div>
      Size:
      ${formatBytes(
        item.size || 0
      )}
    </div>

    <div>
      Format:
      ${escapeHtml(
        item.mimeType || "video/webm"
      )}
    </div>
  `;
}


/* =========================================================
   PREVIEW VIDEO CONTROLS
   ========================================================= */

function setupPreviewTimeControls() {
  const video =
    $("recordingPreviewVideo");

  if (!video) return;

  video.ontimeupdate =
    () => {
      const current =
        video.currentTime || 0;

      const duration =
        video.duration || 0;

      state.preview.currentTime =
        current;

      state.preview.duration =
        duration;

      const currentTime =
        $("recordingCurrentTime");

      const durationElement =
        $("recordingDuration");

      if (currentTime) {
        currentTime.textContent =
          formatSeconds(
            current
          );
      }

      if (durationElement) {
        durationElement.textContent =
          formatSeconds(
            duration
          );
      }
    };

  video.onloadedmetadata =
    () => {
      const duration =
        video.duration || 0;

      state.preview.duration =
        duration;

      setTrimFields(
        0,
        duration
      );
    };
}


bindClick(
  "recordingPreviewPlayBtn",
  () => {
    $("recordingPreviewVideo")
      ?.play()
      .catch(() => {});
  }
);


bindClick(
  "recordingPreviewPauseBtn",
  () => {
    $("recordingPreviewVideo")
      ?.pause();
  }
);


/* =========================================================
   TRIM CONTROLS
   ========================================================= */

function setTrimFields(
  start,
  end
) {
  const startInput =
    $("recordingTrimStart");

  const endInput =
    $("recordingTrimEnd");

  const startTime =
    $("recordingTrimStartTime");

  const endTime =
    $("recordingTrimEndTime");

  const duration =
    state.preview.duration ||
    activePreviewItem?.duration ||
    0;

  start =
    Math.max(
      0,
      Math.min(
        start,
        duration
      )
    );

  end =
    Math.max(
      start,
      Math.min(
        end,
        duration
      )
    );

  if (startInput) {
    startInput.value =
      start;
  }

  if (endInput) {
    endInput.value =
      end;
  }

  if (startTime) {
    startTime.textContent =
      formatSeconds(
        start
      );
  }

  if (endTime) {
    endTime.textContent =
      formatSeconds(
        end
      );
  }

  if (
    activePreviewItem
  ) {
    state.recording.trimStart =
      start;

    state.recording.trimEnd =
      end;
  }
}


$("recordingTrimStart")?.addEventListener(
  "input",
  event => {
    const start =
      Number(
        event.target.value
      );

    const end =
      Number(
        $("recordingTrimEnd")
          ?.value || 0
      );

    setTrimFields(
      start,
      Math.max(
        start,
        end
      )
    );
  }
);


$("recordingTrimEnd")?.addEventListener(
  "input",
  event => {
    const end =
      Number(
        event.target.value
      );

    const start =
      Number(
        $("recordingTrimStart")
          ?.value || 0
      );

    setTrimFields(
      start,
      Math.max(
        start,
        end
      )
    );
  }
);


bindClick(
  "resetTrimBtn",
  () => {
    const duration =
      activePreviewItem?.duration ||
      state.preview.duration ||
      0;

    setTrimFields(
      0,
      duration
    );
  }
);


/* =========================================================
   APPLY TRIM
   ========================================================= */

async function applyTrim() {
  if (
    !activePreviewItem
  ) {
    return;
  }

  if (
    !activePreviewItem.blob
  ) {
    showToast(
      "This recording is not available for trimming.",
      "warning"
    );

    return;
  }

  const start =
    Number(
      $("recordingTrimStart")
        ?.value || 0
    );

  const end =
    Number(
      $("recordingTrimEnd")
        ?.value ||
      activePreviewItem.duration ||
      0
    );

  if (
    end <= start
  ) {
    showToast(
      "Trim end must be after trim start.",
      "warning"
    );

    return;
  }

  showToast(
    "Applying trim...",
    "info"
  );

  try {
    const trimmedBlob =
      await trimVideoBlob(
        activePreviewItem.blob,
        start,
        end
      );

    if (!trimmedBlob) {
      throw new Error(
        "Trim operation failed."
      );
    }

    if (
      activePreviewItem.url
    ) {
      try {
        URL.revokeObjectURL(
          activePreviewItem.url
        );
      } catch (_) {}
    }

    activePreviewItem.blob =
      trimmedBlob;

    activePreviewItem.url =
      URL.createObjectURL(
        trimmedBlob
      );

    activePreviewItem.duration =
      end - start;

    activePreviewItem.size =
      trimmedBlob.size;

    activePreviewItem.mimeType =
      trimmedBlob.type;

    state.recording.trimStart =
      0;

    state.recording.trimEnd =
      end - start;

    const video =
      $("recordingPreviewVideo");

    if (video) {
      video.src =
        activePreviewItem.url;

      video.load();
    }

    updatePreviewMetadata(
      activePreviewItem
    );

    setTrimFields(
      0,
      activePreviewItem.duration
    );

    updateRecordingHistoryItem(
      activePreviewItem
    );

    showToast(
      "Trim applied.",
      "success"
    );
  } catch (error) {
    console.error(error);

    showToast(
      "Trim is not supported in this browser version. Original recording kept.",
      "warning"
    );
  }
}


bindClick(
  "applyTrimBtn",
  applyTrim
);


/* =========================================================
   CLIENT-SIDE VIDEO TRIM
   ========================================================= */

async function trimVideoBlob(
  blob,
  start,
  end
) {
  /*
     MediaRecorder cannot directly cut an existing WebM
     file frame-perfectly.

     This implementation uses the browser video element
     and MediaRecorder to create a new trimmed recording.
  */

  const sourceUrl =
    URL.createObjectURL(
      blob
    );

  const video =
    document.createElement(
      "video"
    );

  video.src =
    sourceUrl;

  video.muted =
    true;

  video.playsInline =
    true;

  await new Promise(
    (resolve, reject) => {
      video.onloadedmetadata =
        resolve;

      video.onerror =
        reject;
    }
  );

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    state.recording.width ||
    1280;

  canvas.height =
    state.recording.height ||
    720;

  const ctx =
    canvas.getContext(
      "2d"
    );

  const stream =
    canvas.captureStream(
      state.recording.fps || 30
    );

  const mimeType =
    getSupportedMimeType(
      state.recording.format
    ) ||
    "video/webm";

  const recorder =
    new MediaRecorder(
      stream,
      {
        mimeType
      }
    );

  const chunks = [];

  recorder.ondataavailable =
    event => {
      if (
        event.data.size
      ) {
        chunks.push(
          event.data
        );
      }
    };

  const stopped =
    new Promise(
      resolve => {
        recorder.onstop =
          resolve;
      }
    );

  recorder.start();

  video.currentTime =
    start;

  await new Promise(
    resolve => {
      video.onseeked =
        resolve;
    }
  );

  video.play().catch(() => {});

  let animationId;

  const draw =
    () => {
      if (
        video.currentTime >=
        end
      ) {
        cancelAnimationFrame(
          animationId
        );

        video.pause();

        recorder.stop();

        return;
      }

      ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      animationId =
        requestAnimationFrame(
          draw
        );
    };

  draw();

  await stopped;

  URL.revokeObjectURL(
    sourceUrl
  );

  return new Blob(
    chunks,
    {
      type: mimeType
    }
  );
}


/* =========================================================
   RENAME RECORDING
   ========================================================= */

bindClick(
  "renameRecordingBtn",
  () => {
    if (
      !activePreviewItem
    ) {
      return;
    }

    const input =
      $("recordingNameInput");

    const newName =
      input?.value?.trim();

    if (!newName) {
      showToast(
        "Enter a recording name.",
        "warning"
      );

      return;
    }

    activePreviewItem.name =
      sanitizeFileName(
        newName
      );

    updateRecordingHistoryItem(
      activePreviewItem
    );

    updatePreviewMetadata(
      activePreviewItem
    );

    showToast(
      "Recording renamed.",
      "success"
    );
  }
);


/* =========================================================
   UPDATE HISTORY ITEM
   ========================================================= */

function updateRecordingHistoryItem(
  item
) {
  const index =
    state.recordings.findIndex(
      record =>
        record.id ===
        item.id
    );

  if (
    index !== -1
  ) {
    state.recordings[index] =
      item;
  }

  saveRecordingHistoryMetadata();

  renderRecordingHistory();
}


/* =========================================================
   DELETE RECORDING
   ========================================================= */

async function deleteActiveRecording() {
  if (
    !activePreviewItem
  ) {
    return;
  }

  const item =
    activePreviewItem;

  if (
    item.url
  ) {
    try {
      URL.revokeObjectURL(
        item.url
      );
    } catch (_) {}
  }

  state.recordings =
    state.recordings.filter(
      record =>
        record.id !==
        item.id
    );

  saveRecordingHistoryMetadata();

  renderRecordingHistory();

  closeRecordingPreview();

  showToast(
    "Recording deleted.",
    "success"
  );
}


bindClick(
  "deleteRecordingBtn",
  deleteActiveRecording
);


/* =========================================================
   RECORD AGAIN
   ========================================================= */

bindClick(
  "recordAgainBtn",
  () => {
    closeRecordingPreview();

    state.recording.trimStart =
      0;

    state.recording.trimEnd =
      0;

    startRecording();
  }
);


/* =========================================================
   DOWNLOAD RECORDING
   ========================================================= */

function downloadRecording(
  item
) {
  if (
    !item
  ) {
    return;
  }

  if (
    !item.blob
  ) {
    showToast(
      "This recording is no longer available in this browser session.",
      "warning"
    );

    return;
  }

  const extension =
    item.mimeType?.includes(
      "mp4"
    )
      ? "mp4"
      : "webm";

  const filename =
    `${sanitizeFileName(
      item.name
    )}.${extension}`;

  const link =
    document.createElement(
      "a"
    );

  link.href =
    item.url ||
    URL.createObjectURL(
      item.blob
    );

  link.download =
    filename;

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  showToast(
    "Download started.",
    "success"
  );
}


bindClick(
  "downloadRecordingBtn",
  () => {
    downloadRecording(
      activePreviewItem
    );
  }
);


/* =========================================================
   RECORDING HISTORY UI
   ========================================================= */

function renderRecordingHistory() {
  const list =
    $("recordingHistoryList");

  if (!list) return;

  list.innerHTML = "";

  if (
    !state.recordings.length
  ) {
    list.innerHTML = `
      <div class="empty-history">
        <div class="empty-history-icon">🎬</div>
        <div>No recordings yet</div>
        <small>Your recordings will appear here.</small>
      </div>
    `;

    return;
  }

  state.recordings.forEach(
    item => {
      const card =
        document.createElement(
          "div"
        );

      card.className =
        "recording-history-item";

      card.innerHTML = `
        <div class="recording-history-main">

          <div class="recording-history-icon">
            ▶
          </div>

          <div class="recording-history-info">

            <strong>
              ${escapeHtml(
                item.name
              )}
            </strong>

            <span>
              ${formatSeconds(
                item.duration || 0
              )}
              ·
              ${formatBytes(
                item.size || 0
              )}
            </span>

            <small>
              ${formatDate(
                item.createdAt
              )}
            </small>

          </div>

        </div>

        <div class="recording-history-actions">

          <button
            type="button"
            class="history-open-btn"
          >
            Open
          </button>

          <button
            type="button"
            class="history-download-btn"
          >
            Download
          </button>

          <button
            type="button"
            class="history-delete-btn danger"
          >
            Delete
          </button>

        </div>
      `;

      card
        .querySelector(
          ".history-open-btn"
        )
        ?.addEventListener(
          "click",
          () => {
            if (!item.blob) {
              showToast(
                "This recording is not available after page reload.",
                "warning"
              );

              return;
            }

            openRecordingPreview(
              item
            );
          }
        );

      card
        .querySelector(
          ".history-download-btn"
        )
        ?.addEventListener(
          "click",
          () => {
            downloadRecording(
              item
            );
          }
        );

      card
        .querySelector(
          ".history-delete-btn"
        )
        ?.addEventListener(
          "click",
          () => {
            deleteHistoryItem(
              item.id
            );
          }
        );

      list.appendChild(
        card
      );
    }
  );
}


/* =========================================================
   DELETE HISTORY ITEM
   ========================================================= */

function deleteHistoryItem(
  id
) {
  const item =
    state.recordings.find(
      record =>
        record.id === id
    );

  if (!item) return;

  if (
    item.url
  ) {
    try {
      URL.revokeObjectURL(
        item.url
      );
    } catch (_) {}
  }

  state.recordings =
    state.recordings.filter(
      record =>
        record.id !== id
    );

  saveRecordingHistoryMetadata();

  renderRecordingHistory();

  showToast(
    "Recording removed from history.",
    "success"
  );
}


/* =========================================================
   CLEAR HISTORY
   ========================================================= */

bindClick(
  "clearRecordingHistoryBtn",
  () => {
    if (
      !state.recordings.length
    ) {
      return;
    }

    state.recordings.forEach(
      item => {
        if (item.url) {
          try {
            URL.revokeObjectURL(
              item.url
            );
          } catch (_) {}
        }
      }
    );

    state.recordings = [];

    localStorage.removeItem(
      RECORDINGS_KEY
    );

    renderRecordingHistory();

    showToast(
      "Recording history cleared.",
      "success"
    );
  }
);


/* =========================================================
   FORMAT HELPERS
   ========================================================= */

function formatSeconds(
  seconds
) {
  if (
    !Number.isFinite(
      Number(seconds)
    )
  ) {
    return "00:00";
  }

  const total =
    Math.max(
      0,
      Math.floor(
        Number(seconds)
      )
    );

  const hours =
    Math.floor(
      total / 3600
    );

  const minutes =
    Math.floor(
      (total % 3600) /
        60
    );

  const secs =
    total % 60;

  if (hours > 0) {
    return [
      String(hours).padStart(
        2,
        "0"
      ),
      String(minutes).padStart(
        2,
        "0"
      ),
      String(secs).padStart(
        2,
        "0"
      )
    ].join(":");
  }

  return [
    String(minutes).padStart(
      2,
      "0"
    ),
    String(secs).padStart(
      2,
      "0"
    )
  ].join(":");
}


function formatBytes(
  bytes
) {
  if (
    !bytes
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
    (
      bytes /
      Math.pow(
        1024,
        index
      )
    ).toFixed(
      index === 0
        ? 0
        : 1
    ) +
    " " +
    units[
      Math.min(
        index,
        units.length - 1
      )
    ]
  );
}


function formatDate(
  value
) {
  try {
    return new Date(
      value
    ).toLocaleString();
  } catch (_) {
    return "";
  }
}


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
   TELEPROMPTER
   ========================================================= */

let teleprompterAnimation =
  null;


function openTeleprompter() {
  const modal =
    $("teleprompterModal");

  if (!modal) return;

  modal.classList.add(
    "open"
  );

  updateTeleprompterPreview();
}


function closeTeleprompter() {
  const modal =
    $("teleprompterModal");

  if (!modal) return;

  modal.classList.remove(
    "open"
  );
}


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
  "closeTeleprompterBtn",
  closeTeleprompter
);


$("teleprompterText")?.addEventListener(
  "input",
  event => {
    state.teleprompter.text =
      event.target.value;

    updateTeleprompterPreview();
  }
);


$("teleprompterSpeed")?.addEventListener(
  "input",
  event => {
    state.teleprompter.speed =
      Number(
        event.target.value
      );
  }
);


$("teleprompterFontSize")?.addEventListener(
  "input",
  event => {
    state.teleprompter.fontSize =
      Number(
        event.target.value
      );

    updateTeleprompterPreview();
  }
);


$("teleprompterOpacity")?.addEventListener(
  "input",
  event => {
    state.teleprompter.opacity =
      Number(
        event.target.value
      );

    updateTeleprompterPreview();
  }
);


$("includeTeleprompterInRecording")
  ?.addEventListener(
    "change",
    event => {
      state.teleprompter
        .includeInRecording =
        event.target.checked;

      state.settings
        .showTeleprompterRecording =
        event.target.checked;

      saveSettings();

      renderCompositionFrame();
    }
  );


function updateTeleprompterPreview() {
  const preview =
    $("teleprompterPreview");

  if (!preview) return;

  preview.textContent =
    state.teleprompter.text ||
    "Teleprompter preview";

  preview.style.fontSize =
    `${state.teleprompter.fontSize}px`;

  preview.style.opacity =
    state.teleprompter.opacity;
}


function playTeleprompter() {
  state.teleprompter.playing =
    true;

  runTeleprompterLoop();
}


function pauseTeleprompter() {
  state.teleprompter.playing =
    false;

  if (
    teleprompterAnimation
  ) {
    cancelAnimationFrame(
      teleprompterAnimation
    );

    teleprompterAnimation =
      null;
  }
}


function runTeleprompterLoop() {
  if (
    !state.teleprompter.playing
  ) {
    return;
  }

  const preview =
    $("teleprompterPreview");

  if (preview) {
    preview.scrollTop +=
      Math.max(
        0.2,
        state.teleprompter.speed /
          10
      );
  }

  teleprompterAnimation =
    requestAnimationFrame(
      runTeleprompterLoop
    );
}


bindClick(
  "teleprompterPlayBtn",
  playTeleprompter
);

bindClick(
  "teleprompterPauseBtn",
  pauseTeleprompter
);


bindClick(
  "teleprompterResetBtn",
  () => {
    const preview =
      $("teleprompterPreview");

    if (preview) {
      preview.scrollTop = 0;
    }
  }
);


bindClick(
  "teleprompterSaveBtn",
  () => {
    localStorage.setItem(
      "personalCourseStudioTeleprompterV39",
      JSON.stringify(
        state.teleprompter
      )
    );

    showToast(
      "Teleprompter saved.",
      "success"
    );
  }
);


/* =========================================================
   STUDENTS
   ========================================================= */

function renderStudents() {
  const list =
    $("studentsList");

  if (!list) return;

  list.innerHTML = "";

  if (
    !state.students.length
  ) {
    list.innerHTML = `
      <div class="empty-students">
        No students added.
      </div>
    `;

    return;
  }

  state.students.forEach(
    (student, index) => {
      const item =
        document.createElement(
          "div"
        );

      item.className =
        "student-item";

      item.innerHTML = `
        <div class="student-avatar">
          ${escapeHtml(
            student.name
              .charAt(0)
              .toUpperCase()
          )}
        </div>

        <div class="student-info">
          <strong>
            ${escapeHtml(
              student.name
            )}
          </strong>

          <span>
            Online
          </span>
        </div>

        <button
          type="button"
          class="student-remove"
          aria-label="Remove student"
        >
          ×
        </button>
      `;

      item
        .querySelector(
          ".student-remove"
        )
        ?.addEventListener(
          "click",
          () => {
            state.students.splice(
              index,
              1
            );

            saveStudents();

            renderStudents();
          }
        );

      list.appendChild(
        item
      );
    }
  );
}


bindClick(
  "addStudentBtn",
  () => {
    const modal =
      $("studentModal");

    if (!modal) return;

    modal.classList.add(
      "open"
    );
  }
);


bindClick(
  "closeStudentModalBtn",
  () => {
    $("studentModal")
      ?.classList.remove(
        "open"
      );
  }
);


bindClick(
  "cancelStudentBtn",
  () => {
    $("studentModal")
      ?.classList.remove(
        "open"
      );
  }
);


bindClick(
  "saveStudentBtn",
  () => {
    const input =
      $("studentNameInput");

    const name =
      input?.value?.trim();

    if (!name) {
      showToast(
        "Enter student name.",
        "warning"
      );

      return;
    }

    state.students.push({
      id:
        `student-${Date.now()}`,

      name,

      online: true
    });

    saveStudents();

    renderStudents();

    if (input) {
      input.value = "";
    }

    $("studentModal")
      ?.classList.remove(
        "open"
      );

    showToast(
      "Student added.",
      "success"
    );
  }
);


/* =========================================================
   SETTINGS
   ========================================================= */

function openSettings() {
  const modal =
    $("settingsModal");

  if (!modal) return;

  const brandInput =
    $("brandNameInput");

  if (brandInput) {
    brandInput.value =
      state.settings.brandName;
  }

  if (
    $("settingsRecordingQuality")
  ) {
    $("settingsRecordingQuality")
      .value =
      state.settings.recordingQuality;
  }

  if (
    $("settingsRecordingFps")
  ) {
    $("settingsRecordingFps")
      .value =
      state.settings.recordingFps;
  }

  if (
    $("settingsAutoStartTeleprompter")
  ) {
    $("settingsAutoStartTeleprompter")
      .checked =
      Boolean(
        state.settings
          .autoStartTeleprompter
      );
  }

  if (
    $("settingsShowTeleprompterRecording")
  ) {
    $("settingsShowTeleprompterRecording")
      .checked =
      Boolean(
        state.settings
          .showTeleprompterRecording
      );
  }

  modal.classList.add(
    "open"
  );
}


function closeSettings() {
  $("settingsModal")
    ?.classList.remove(
      "open"
    );
}


bindClick(
  "settingsBtn",
  openSettings
);

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
  () => {
    const brandInput =
      $("brandNameInput");

    if (brandInput) {
      state.settings.brandName =
        brandInput.value.trim() ||
        "SNK Mentor Studio";
    }

    state.settings
      .autoStartTeleprompter =
      Boolean(
        $("settingsAutoStartTeleprompter")
          ?.checked
      );

    state.settings
      .showTeleprompterRecording =
      Boolean(
        $("settingsShowTeleprompterRecording")
          ?.checked
      );

    state.teleprompter
      .includeInRecording =
      state.settings
        .showTeleprompterRecording;

    if (
      $("includeTeleprompterInRecording")
    ) {
      $("includeTeleprompterInRecording")
        .checked =
        state.teleprompter
          .includeInRecording;
    }

    saveSettings();

    updateBrandUI();

    closeSettings();

    showToast(
      "Settings saved.",
      "success"
    );
  }
);


function updateBrandUI() {
  if (!brandBadge) return;

  const name =
    state.settings.brandName ||
    "SNK Mentor Studio";

  brandBadge.textContent =
    name;
}


/* =========================================================
   FULLSCREEN
   ========================================================= */

async function requestFullscreen(
  element
) {
  if (!element) return;

  try {
    if (
      document.fullscreenElement
    ) {
      await document.exitFullscreen();

      return;
    }

    await element.requestFullscreen();
  } catch (error) {
    console.warn(error);

    showToast(
      "Fullscreen is not available.",
      "warning"
    );
  }
}


bindClick(
  "fullscreenStageBtn",
  () => {
    requestFullscreen(
      $("stageShell") ||
        stage
    );
  }
);


bindClick(
  "fullscreenStudioBtn",
  () => {
    requestFullscreen(
      document.documentElement
    );
  }
);


/* =========================================================
   SHORTCUTS
   ========================================================= */

function openShortcuts() {
  $("shortcutsModal")
    ?.classList.add(
      "open"
    );
}


function closeShortcuts() {
  $("shortcutsModal")
    ?.classList.remove(
      "open"
    );
}


bindClick(
  "openShortcutsBtn",
  openShortcuts
);

bindClick(
  "closeShortcutsBtn",
  closeShortcuts
);


document.addEventListener(
  "keydown",
  event => {
    if (
      event.target.matches(
        "input, textarea, select"
      )
    ) {
      return;
    }

    if (
      event.code ===
      "Space"
    ) {
      event.preventDefault();

      if (
        state.recording.active
      ) {
        if (
          state.recording.paused
        ) {
          resumeRecording();
        } else {
          pauseRecording();
        }
      } else {
        mainVideo?.paused
          ? mainVideo.play()
          : mainVideo.pause();
      }
    }

    if (
      event.key.toLowerCase() ===
      "r"
    ) {
      if (
        state.recording.active
      ) {
        stopRecording();
      } else {
        startRecording();
      }
    }

    if (
      event.key.toLowerCase() ===
      "f"
    ) {
      requestFullscreen(
        stage
      );
    }

    if (
      event.key ===
      "Escape"
    ) {
      closeSettings();
      closeShortcuts();
      closeTeleprompter();
      closeRecordingPreview();
    }
  }
);


/* =========================================================
   MENTOR CARD DRAG
   ========================================================= */

(function setupMentorDrag() {
  if (
    !mentorCard ||
    !stage
  ) {
    return;
  }

  let dragging = false;

  let offsetX = 0;
  let offsetY = 0;

  mentorCard.addEventListener(
    "pointerdown",
    event => {
      if (
        event.target.closest(
          "#mentorResize"
        )
      ) {
        return;
      }

      dragging = true;

      mentorCard.setPointerCapture(
        event.pointerId
      );

      const rect =
        mentorCard.getBoundingClientRect();

      offsetX =
        event.clientX -
        rect.left;

      offsetY =
        event.clientY -
        rect.top;
    }
  );


  mentorCard.addEventListener(
    "pointermove",
    event => {
      if (!dragging) return;

      const stageRect =
        stage.getBoundingClientRect();

      let left =
        event.clientX -
        stageRect.left -
        offsetX;

      let top =
        event.clientY -
        stageRect.top -
        offsetY;

      left =
        Math.max(
          0,
          Math.min(
            stageRect.width -
              mentorCard.offsetWidth,
            left
          )
        );

      top =
        Math.max(
          0,
          Math.min(
            stageRect.height -
              mentorCard.offsetHeight,
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
  );


  const stopDrag =
    event => {
      dragging = false;

      try {
        mentorCard.releasePointerCapture(
          event.pointerId
        );
      } catch (_) {}

      renderCompositionFrame();
    };

  mentorCard.addEventListener(
    "pointerup",
    stopDrag
  );

  mentorCard.addEventListener(
    "pointercancel",
    stopDrag
  );
})();


/* =========================================================
   TELEPROMPTER MINI PREVIEW
   ========================================================= */

function updateTeleprompterMiniPreview() {
  const preview =
    $("teleprompterMiniPreview");

  if (!preview) return;

  const text =
    state.teleprompter.text ||
    "No teleprompter text yet.";

  preview.textContent =
    text.slice(
      0,
      180
    );
}


/* =========================================================
   RECORDING SOURCE BADGES
   ========================================================= */

function updateStageBadges() {
  const resolution =
    $("stageResolutionBadge");

  const fps =
    $("stageFpsBadge");

  const source =
    $("stageSourceBadge");

  if (resolution) {
    resolution.textContent =
      `${Math.round(
        state.recording.width
      )}×${Math.round(
        state.recording.height
      )}`;
  }

  if (fps) {
    fps.textContent =
      `${state.recording.fps} FPS`;
  }

  if (source) {
    if (
      state.screenStream
    ) {
      source.textContent =
        "SCREEN";
    } else if (
      mainVideo?.style.display !==
      "none" &&
      mainVideo?.src
    ) {
      source.textContent =
        "VIDEO";
    } else if (
      state.mainImage
    ) {
      source.textContent =
        "IMAGE";
    } else {
      source.textContent =
        "STUDIO";
    }
  }
}


/* =========================================================
   INIT RECORDING SETTINGS
   ========================================================= */

function initializeRecordingSettings() {
  applyRecordingQuality(
    state.settings.recordingQuality ||
      "1080"
  );

  applyRecordingFps(
    state.settings.recordingFps ||
      "30"
  );

  state.recording.format =
    $("recordingFormat")
      ?.value ||
    "webm-vp9";

  if (
    $("recordingQuality")
  ) {
    $("recordingQuality").value =
      state.settings.recordingQuality;
  }

  if (
    $("recordingQualitySide")
  ) {
    $("recordingQualitySide").value =
      state.settings.recordingQuality;
  }

  if (
    $("recordingFps")
  ) {
    $("recordingFps").value =
      state.settings.recordingFps;
  }

  if (
    $("recordingFpsSide")
  ) {
    $("recordingFpsSide").value =
      state.settings.recordingFps;
  }
}


/* =========================================================
   LOAD TELEPROMPTER
   ========================================================= */

function loadTeleprompterState() {
  try {
    const raw =
      localStorage.getItem(
        "personalCourseStudioTeleprompterV39"
      );

    if (raw) {
      state.teleprompter =
        {
          ...state.teleprompter,
          ...JSON.parse(raw)
        };
    }
  } catch (error) {
    console.warn(error);
  }

  const textarea =
    $("teleprompterText");

  if (textarea) {
    textarea.value =
      state.teleprompter.text;
  }

  if (
    $("teleprompterSpeed")
  ) {
    $("teleprompterSpeed").value =
      state.teleprompter.speed;
  }

  if (
    $("teleprompterFontSize")
  ) {
    $("teleprompterFontSize").value =
      state.teleprompter.fontSize;
  }

  if (
    $("teleprompterOpacity")
  ) {
    $("teleprompterOpacity").value =
      state.teleprompter.opacity;
  }

  if (
    $("includeTeleprompterInRecording")
  ) {
    $("includeTeleprompterInRecording")
      .checked =
      Boolean(
        state.teleprompter
          .includeInRecording
      );
  }

  updateTeleprompterPreview();
  updateTeleprompterMiniPreview();
}


/* =========================================================
   MAIN AUDIO CHECKBOX INITIALIZATION
   ========================================================= */

function initializeAudioControls() {
  const mainVolume =
    $("mainVideoVolume");

  const micVolume =
    $("micVolume");

  if (mainVolume) {
    updateMainVolume(
      mainVolume.value
    );
  }

  if (micVolume) {
    updateMicVolume(
      micVolume.value
    );
  }

  state.audio.micEnabled =
    $("micEnabled")
      ? $("micEnabled").checked
      : true;

  state.audio.micMonitor =
    $("micMonitor")
      ? $("micMonitor").checked
      : false;
}


/* =========================================================
   WINDOW RESIZE
   ========================================================= */

window.addEventListener(
  "resize",
  () => {
    renderCompositionFrame();
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

    renderCompositionFrame();
  }
);


/* =========================================================
   RECORDING PREVIEW MODAL CLICK OUTSIDE
   ========================================================= */

$("recordingPreviewModal")
  ?.addEventListener(
    "click",
    event => {
      if (
        event.target ===
        event.currentTarget
      ) {
        closeRecordingPreview();
      }
    }
  );


$("settingsModal")
  ?.addEventListener(
    "click",
    event => {
      if (
        event.target ===
        event.currentTarget
      ) {
        closeSettings();
      }
    }
  );


$("teleprompterModal")
  ?.addEventListener(
    "click",
    event => {
      if (
        event.target ===
        event.currentTarget
      ) {
        closeTeleprompter();
      }
    }
  );


$("studentModal")
  ?.addEventListener(
    "click",
    event => {
      if (
        event.target ===
        event.currentTarget
      ) {
        event.currentTarget.classList.remove(
          "open"
        );
      }
    }
  );


/* =========================================================
   RECORDING PREVIEW NAME INPUT
   ========================================================= */

$("recordingNameInput")
  ?.addEventListener(
    "keydown",
    event => {
      if (
        event.key ===
        "Enter"
      ) {
        event.preventDefault();

        $("renameRecordingBtn")
          ?.click();
      }
    }
  );


/* =========================================================
   UPDATE RECORDING PREVIEW FILENAME
   ========================================================= */

function syncRecordingNameInputs() {
  const main =
    $("recordingFileName");

  const side =
    $("recordingFileNameSide");

  if (main && side) {
    main.addEventListener(
      "input",
      () => {
        side.value =
          main.value;
      }
    );

    side.addEventListener(
      "input",
      () => {
        main.value =
          side.value;
      }
    );
  }
}


/* =========================================================
   RECORDING FORMAT SYNC
   ========================================================= */

function syncRecordingFormatInputs() {
  const main =
    $("recordingFormat");

  const side =
    $("recordingFormatSide");

  if (!main || !side) return;

  main.addEventListener(
    "change",
    () => {
      side.value =
        main.value;
    }
  );

  side.addEventListener(
    "change",
    () => {
      main.value =
        side.value;
    }
  );
}


/* =========================================================
   RECORDING QUALITY/FPS SYNC
   ========================================================= */

function syncRecordingControls() {
  const quality =
    $("recordingQuality");

  const qualitySide =
    $("recordingQualitySide");

  const fps =
    $("recordingFps");

  const fpsSide =
    $("recordingFpsSide");

  quality?.addEventListener(
    "change",
    () => {
      if (qualitySide) {
        qualitySide.value =
          quality.value;
      }
    }
  );

  qualitySide?.addEventListener(
    "change",
    () => {
      if (quality) {
        quality.value =
          qualitySide.value;
      }
    }
  );

  fps?.addEventListener(
    "change",
    () => {
      if (fpsSide) {
        fpsSide.value =
          fps.value;
      }
    }
  );

  fpsSide?.addEventListener(
    "change",
    () => {
      if (fps) {
        fps.value =
          fpsSide.value;
      }
    }
  );
}


/* =========================================================
   STAGE SOURCE EVENTS
   ========================================================= */

mainVideo?.addEventListener(
  "loadeddata",
  () => {
    updateStageBadges();
    renderCompositionFrame();
  }
);


screenCaptureVideo?.addEventListener(
  "loadeddata",
  () => {
    updateStageBadges();
    renderCompositionFrame();
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

  openSettings,
  closeSettings,

  renderCompositionFrame,

  setBackgroundMode,

  openRecordingPreview,

  closeRecordingPreview,

  downloadRecording,

  renderRecordingHistory
};


/* =========================================================
   INIT
   ========================================================= */

function initializeStudio() {
  loadSettings();

  loadStudents();

  loadRecordingHistoryMetadata();

  loadTeleprompterState();

  initializeRecordingSettings();

  initializeAudioControls();

  syncRecordingNameInputs();

  syncRecordingFormatInputs();

  syncRecordingControls();

  updateFormatSupportUI();

  updateBrandUI();

  renderStudents();

  renderRecordingHistory();

  updateCameraStatus(
    "Camera offline",
    false
  );

  updateScreenCaptureStatus(
    "Screen capture inactive",
    false
  );

  updateMicStatus();

  updateStageBadges();

  initSegmentation();

  populateCameraDevices();

  startRenderLoop();

  updateAudioMeters();

  showToast(
    "Mentor Studio Step 3.9 ready.",
    "success"
  );
}


/* =========================================================
   START
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
