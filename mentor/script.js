/* =========================================================
   SNK MENTOR STUDIO
   PERSONAL COURSE STUDIO
   STEP 3.10 — FINAL RECORDING ENGINE

   File:
   mentor/script.js

   Main features:
   - Main image / video
   - Mentor video
   - Webcam
   - MediaPipe person segmentation
   - Original / Remove / Blur / Image / Solid background
   - Drag + resize mentor overlay
   - Camera quality: 360p / 480p / 720p / 1080p
   - Camera FPS: 24 / 30 / 60
   - Camera device selection
   - Microphone
   - Main video audio
   - Audio meters
   - Microphone waveform
   - Screen / tab capture
   - Screen capture audio
   - Fixed recording canvas
   - 720p / 1080p / 1440p recording
   - 24 / 30 / 60 FPS
   - WebM VP9 / VP8 / MP4 detection
   - Continuous rendering
   - Recording timer
   - Pause / Resume / Stop
   - Recording preview
   - Rename
   - Download
   - Delete
   - Recording history
   - IndexedDB recording storage
   - Teleprompter
   - Fullscreen stage
   - Fullscreen Studio
   - Keyboard shortcuts
   - Settings
   - Students
   - Toast notifications

   ========================================================= */

"use strict";

/* =========================================================
   GLOBAL COURSE STUDIO
   ========================================================= */

window.CourseStudio = window.CourseStudio || {};


/* =========================================================
   DOM HELPER
   ========================================================= */

const $ = (id) => document.getElementById(id);

const qs = (selector, parent = document) =>
  parent.querySelector(selector);

const qsa = (selector, parent = document) =>
  Array.from(parent.querySelectorAll(selector));


/* =========================================================
   ELEMENTS
   ========================================================= */

const el = {
  /* ---------- Topbar ---------- */
  openShortcutsBtn: $("openShortcutsBtn"),
  startScreenCaptureBtn: $("startScreenCaptureBtn"),
  fullscreenStageBtn: $("fullscreenStageBtn"),
  fullscreenStudioBtn: $("fullscreenStudioBtn"),
  settingsBtn: $("settingsBtn"),
  openTeleprompterTopBtn: $("openTeleprompterTopBtn"),
  recordBtn: $("recordBtn"),

  /* ---------- Recording status ---------- */
  recordingStatusBar: $("recordingStatusBar"),
  recordingStatusDot: $("recordingStatusDot"),
  recordingStatusText: $("recordingStatusText"),
  recordingTimer: $("recordingTimer"),
  recordingQuality: $("recordingQuality"),
  recordingFps: $("recordingFps"),
  recordingFormat: $("recordingFormat"),

  pauseRecordingBtn: $("pauseRecordingBtn"),
  resumeRecordingBtn: $("resumeRecordingBtn"),
  stopRecordingBtn: $("stopRecordingBtn"),

  cameraIndicator: $("cameraIndicator"),
  micIndicator: $("micIndicator"),
  audioIndicator: $("audioIndicator"),
  screenIndicator: $("screenIndicator"),

  /* ---------- Stage ---------- */
  stageShell: $("stageShell"),
  stage: $("stage"),

  mainImage: $("mainImage"),
  mainVideo: $("mainVideo"),
  screenCaptureVideo: $("screenCaptureVideo"),

  welcomeContent: $("welcomeContent"),

  mentorCard: $("mentorCard"),
  mentorVideo: $("mentorVideo"),
  mentorCameraVideo: $("mentorCameraVideo"),
  mentorAICanvas: $("mentorAICanvas"),
  mentorPlaceholder: $("mentorPlaceholder"),
  mentorSourceLabel: $("mentorSourceLabel"),
  mentorResize: $("mentorResize"),

  brandBadge: $("brandBadge"),
  brandBadgeText: $("brandBadgeText"),

  recordingOverlay: $("recordingOverlay"),
  recordingOverlayTimer: $("recordingOverlayTimer"),

  stageBadges: $("stageBadges"),
  stageResolutionBadge: $("stageResolutionBadge"),
  stageFpsBadge: $("stageFpsBadge"),
  stageSourceBadge: $("stageSourceBadge"),

  /* ---------- Toolbar ---------- */
  uploadMainBtn: $("uploadMainBtn"),
  uploadVideoBtn: $("uploadVideoBtn"),
  mainPlayBtn: $("mainPlayBtn"),
  mainPauseBtn: $("mainPauseBtn"),
  uploadMentorBtn: $("uploadMentorBtn"),
  startCameraBtn: $("startCameraBtn"),
  stopCameraBtn: $("stopCameraBtn"),
  recordToolbarBtn: $("recordToolbarBtn"),
  openTeleprompterBtn: $("openTeleprompterBtn"),

  /* ---------- Camera ---------- */
  startCameraSideBtn: $("startCameraSideBtn"),
  stopCameraSideBtn: $("stopCameraSideBtn"),
  switchCameraSideBtn: $("switchCameraSideBtn"),
  uploadMentorSideBtn: $("uploadMentorSideBtn"),
  cameraStatus: $("cameraStatus"),

  cameraDeviceSelect: $("cameraDeviceSelect"),
  cameraQuality: $("cameraQuality"),
  cameraFps: $("cameraFps"),

  /* ---------- AI Background ---------- */
  bgOriginalBtn: $("bgOriginalBtn"),
  bgRemoveBtn: $("bgRemoveBtn"),
  bgBlurBtn: $("bgBlurBtn"),
  bgImageBtn: $("bgImageBtn"),
  bgColorBtn: $("bgColorBtn"),
  backgroundColor: $("backgroundColor"),
  backgroundUploadBox: $("backgroundUploadBox"),

  /* ---------- Screen capture ---------- */
  startScreenCaptureSideBtn: $("startScreenCaptureSideBtn"),
  stopScreenCaptureBtn: $("stopScreenCaptureBtn"),
  screenCaptureStatus: $("screenCaptureStatus"),
  screenCaptureStatusLight: $("screenCaptureStatusLight"),

  /* ---------- Audio ---------- */
  mainVideoAudioCheckbox: $("mainVideoAudioCheckbox"),
  mainVideoVolume: $("mainVideoVolume"),
  mainVolumeValue: $("mainVolumeValue"),

  micVolume: $("micVolume"),
  micVolumeValue: $("micVolumeValue"),
  micEnabled: $("micEnabled"),
  micMonitor: $("micMonitor"),

  micLevelValue: $("micLevelValue"),
  micLevelBar: $("micLevelBar"),

  mainAudioLevelValue: $("mainAudioLevelValue"),
  mainAudioLevelBar: $("mainAudioLevelBar"),

  micWaveformCanvas: $("micWaveformCanvas"),

  /* ---------- Teleprompter ---------- */
  teleprompterMiniPreview: $("teleprompterMiniPreview"),
  openTeleprompterSide: $("openTeleprompterSide"),
  uploadTeleprompterBtn: $("uploadTeleprompterBtn"),

  /* ---------- Students ---------- */
  studentsList: $("studentsList"),
  addStudentBtn: $("addStudentBtn"),

  /* ---------- Recording settings ---------- */
  recordingQualitySide: $("recordingQualitySide"),
  recordingFpsSide: $("recordingFpsSide"),
  recordingFormatSide: $("recordingFormatSide"),
  recordingFileNameSide: $("recordingFileNameSide"),
  includeTeleprompterInRecording: $("includeTeleprompterInRecording"),

  /* ---------- Files ---------- */
  uploadMainSideBtn: $("uploadMainSideBtn"),
  uploadVideoSideBtn: $("uploadVideoSideBtn"),
  uploadMentorFileSideBtn: $("uploadMentorFileSideBtn"),
  uploadBackgroundSideBtn: $("uploadBackgroundSideBtn"),

  /* ---------- Hidden inputs ---------- */
  mainFileInput: $("mainFileInput"),
  mainVideoInput: $("mainVideoInput"),
  mentorFileInput: $("mentorFileInput"),
  backgroundImageUpload: $("backgroundImageUpload"),
  teleprompterFileInput: $("teleprompterFileInput"),

  /* ---------- Settings modal ---------- */
  settingsModal: $("settingsModal"),
  brandNameInput: $("brandNameInput"),
  settingsRecordingQuality: $("settingsRecordingQuality"),
  settingsRecordingFps: $("settingsRecordingFps"),
  settingsAutoStartTeleprompter: $("settingsAutoStartTeleprompter"),
  settingsShowTeleprompterRecording: $("settingsShowTeleprompterRecording"),
  closeSettingsBtn: $("closeSettingsBtn"),
  closeSettingsFooterBtn: $("closeSettingsFooterBtn"),
  saveSettingsBtn: $("saveSettingsBtn"),

  /* ---------- Shortcuts ---------- */
  shortcutsModal: $("shortcutsModal"),
  closeShortcutsBtn: $("closeShortcutsBtn"),

  /* ---------- Teleprompter modal ---------- */
  teleprompterModal: $("teleprompterModal"),
  closeTeleprompterBtn: $("closeTeleprompterBtn"),
  teleprompterText: $("teleprompterText"),
  teleprompterSpeed: $("teleprompterSpeed"),
  teleprompterFontSize: $("teleprompterFontSize"),
  teleprompterOpacity: $("teleprompterOpacity"),
  teleprompterPreview: $("teleprompterPreview"),
  teleprompterResetBtn: $("teleprompterResetBtn"),
  teleprompterPauseBtn: $("teleprompterPauseBtn"),
  teleprompterPlayBtn: $("teleprompterPlayBtn"),
  teleprompterSaveBtn: $("teleprompterSaveBtn"),

  /* ---------- Recording preview ---------- */
  recordingPreviewModal: $("recordingPreviewModal"),
  recordingPreviewVideo: $("recordingPreviewVideo"),
  recordingFileInfo: $("recordingFileInfo"),
  closeRecordingPreviewBtn: $("closeRecordingPreviewBtn"),

  recordingCurrentTime: $("recordingCurrentTime"),
  recordingDuration: $("recordingDuration"),

  recordingPreviewPlayBtn: $("recordingPreviewPlayBtn"),
  recordingPreviewPauseBtn: $("recordingPreviewPauseBtn"),

  recordingFileName: $("recordingFileName"),

  recordingTrimStart: $("recordingTrimStart"),
  recordingTrimEnd: $("recordingTrimEnd"),
  recordingTrimStartTime: $("recordingTrimStartTime"),
  recordingTrimEndTime: $("recordingTrimEndTime"),

  applyTrimBtn: $("applyTrimBtn"),
  resetTrimBtn: $("resetTrimBtn"),

  renameRecordingBtn: $("renameRecordingBtn"),
  deleteRecordingBtn: $("deleteRecordingBtn"),
  recordAgainBtn: $("recordAgainBtn"),
  downloadRecordingBtn: $("downloadRecordingBtn"),

  recordingHistoryList: $("recordingHistoryList"),
  clearRecordingHistoryBtn: $("clearRecordingHistoryBtn"),

  /* ---------- Student modal ---------- */
  studentModal: $("studentModal"),
  studentNameInput: $("studentNameInput"),
  closeStudentModalBtn: $("closeStudentModalBtn"),
  cancelStudentBtn: $("cancelStudentBtn"),
  saveStudentBtn: $("saveStudentBtn"),

  /* ---------- Toast ---------- */
  toastContainer: $("toastContainer")
};


/* =========================================================
   APPLICATION STATE
   ========================================================= */

const state = {
  /* ---------- Main media ---------- */
  mainImageObjectUrl: null,
  mainVideoObjectUrl: null,

  mainSourceType: "none",
  mainMediaReady: false,

  /* ---------- Mentor ---------- */
  mentorSourceType: "none",
  mentorVideoObjectUrl: null,

  /* ---------- Camera ---------- */
  cameraStream: null,
  cameraRunning: false,
  cameraFacingMode: "user",
  cameraDeviceId: "",
  cameraQuality: "720p",
  cameraFps: 30,

  /* ---------- Segmentation ---------- */
  selfieSegmentation: null,
  segmentationReady: false,
  segmentationBusy: false,
  segmentationEnabled: false,

  backgroundMode: "original",
  backgroundImage: null,

  sourceCanvas: document.createElement("canvas"),
  sourceCtx: null,

  maskCanvas: document.createElement("canvas"),
  maskCtx: null,

  isolatedCanvas: document.createElement("canvas"),
  isolatedCtx: null,

  backgroundCanvas: document.createElement("canvas"),
  backgroundCtx: null,

  /* ---------- Composition ---------- */
  compositionCanvas: document.createElement("canvas"),
  compositionCtx: null,

  outputWidth: 1920,
  outputHeight: 1080,
  outputFps: 30,

  renderAnimationId: null,
  renderRunning: false,
  lastRenderTime: 0,

  /* ---------- Audio ---------- */
  audioContext: null,

  mainVideoSourceNode: null,
  mainVideoGainNode: null,

  micSourceNode: null,
  micGainNode: null,

  screenAudioSourceNode: null,
  screenAudioGainNode: null,

  mediaDestination: null,

  micStream: null,
  micEnabled: true,
  micMonitor: false,

  mainAudioEnabled: true,

  micAnalyser: null,
  mainAnalyser: null,

  micWaveformData: null,
  micLevel: 0,
  mainAudioLevel: 0,

  /* ---------- Screen ---------- */
  screenStream: null,
  screenCaptureRunning: false,
  screenAudioTrack: null,

  /* ---------- Recording ---------- */
  mediaRecorder: null,
  recordingChunks: [],

  recordingState: "idle",
  recordingStartedAt: 0,
  recordingElapsed: 0,
  recordingPausedAt: 0,
  recordingTimerId: null,

  recordingBlob: null,
  recordingObjectUrl: null,
  recordingMimeType: "",
  recordingFileName: "",

  selectedRecordingQuality: "1080p",
  selectedRecordingFps: 30,
  selectedRecordingFormat: "webm-vp9",

  recordingWidth: 1920,
  recordingHeight: 1080,

  /* ---------- Preview ---------- */
  previewRecordingId: null,
  previewOriginalBlob: null,
  previewTrimStart: 0,
  previewTrimEnd: 0,
  previewTrimmedBlob: null,
  previewTrimmedObjectUrl: null,

  /* ---------- Teleprompter ---------- */
  teleprompterText: "",
  teleprompterSpeed: 1,
  teleprompterFontSize: 42,
  teleprompterOpacity: 0.85,
  teleprompterPlaying: false,
  teleprompterOffset: 0,
  teleprompterLastTime: 0,

  /* ---------- Settings ---------- */
  brandName: "SNK Mentor Studio",
  autoStartTeleprompter: false,
  showTeleprompterRecording: true,

  /* ---------- Students ---------- */
  students: [],

  /* ---------- Files ---------- */
  files: [],

  /* ---------- DB ---------- */
  db: null,
  dbReady: false,

  /* ---------- UI ---------- */
  toastTimer: null,

  /* ---------- Drag / resize ---------- */
  mentorDrag: {
    active: false,
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0
  },

  mentorResizeState: {
    active: false,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0
  },

  /* ---------- Fullscreen ---------- */
  fullscreenTarget: null,

  /* ---------- Misc ---------- */
  initialized: false,
  destroying: false
};


/* =========================================================
   INITIAL CANVAS CONTEXTS
   ========================================================= */

state.sourceCtx = state.sourceCanvas.getContext("2d", {
  willReadFrequently: true
});

state.maskCtx = state.maskCanvas.getContext("2d", {
  willReadFrequently: true
});

state.isolatedCtx = state.isolatedCanvas.getContext("2d");

state.backgroundCtx = state.backgroundCanvas.getContext("2d");

state.compositionCtx = state.compositionCanvas.getContext("2d");


/* =========================================================
   STORAGE KEYS
   ========================================================= */

const STORAGE = {
  settings: "snkMentorStudioSettings",
  students: "snkMentorStudioStudents",
  teleprompter: "snkMentorStudioTeleprompter",
  recordingMeta: "snkMentorStudioRecordingMeta"
};


/* =========================================================
   INDEXED DB
   ========================================================= */

const DB_CONFIG = {
  name: "SNKMentorStudioDB",
  version: 1,
  store: "recordings"
};


/* =========================================================
   UTILITY FUNCTIONS
   ========================================================= */

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}


function numberOr(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}


function safeText(value) {
  return String(value ?? "");
}


function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "00:00";
  }

  seconds = Math.max(0, seconds);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

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


function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];

  let size = bytes;
  let index = 0;

  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index++;
  }

  return `${size.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}


function formatDate(timestamp) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(timestamp));
  } catch {
    return new Date(timestamp).toLocaleString();
  }
}


function sanitizeFileName(name) {
  return safeText(name)
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}


function defaultRecordingName() {
  const d = new Date();

  const stamp =
    d.getFullYear() +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0") +
    "-" +
    String(d.getHours()).padStart(2, "0") +
    String(d.getMinutes()).padStart(2, "0") +
    String(d.getSeconds()).padStart(2, "0");

  return `SNK-Mentor-Recording-${stamp}`;
}


function getSelectedValue(element, fallback) {
  return element?.value || fallback;
}


function isVideoElementReady(video) {
  return !!(
    video &&
    video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
    video.videoWidth > 0 &&
    video.videoHeight > 0
  );
}


function isMediaPlaying(video) {
  return !!(
    video &&
    !video.paused &&
    !video.ended
  );
}


function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}


function showElement(element) {
  if (!element) return;

  element.hidden = false;
  element.style.display = "";
}


function hideElement(element) {
  if (!element) return;

  element.hidden = true;
}


function setElementVisible(element, visible) {
  if (!element) return;

  element.hidden = !visible;
}


function revokeObjectUrl(url) {
  if (!url) return;

  try {
    URL.revokeObjectURL(url);
  } catch {
    /* Ignore */
  }
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message, type = "info", duration = 3000) {
  if (!el.toastContainer) {
    return;
  }

  const toast = document.createElement("div");

  toast.className = `toast toast-${type}`;

  toast.innerHTML = `
    <div class="toast-content">
      <strong>${escapeHtml(
        type === "success"
          ? "Done"
          : type === "error"
            ? "Error"
            : type === "warning"
              ? "Notice"
              : "Info"
      )}</strong>
      <span>${escapeHtml(message)}</span>
    </div>
    <button type="button" class="toast-close" aria-label="Close">×</button>
  `;

  el.toastContainer.appendChild(toast);

  const close = () => {
    toast.classList.add("toast-hide");

    setTimeout(() => {
      toast.remove();
    }, 220);
  };

  toast.querySelector(".toast-close")?.addEventListener("click", close);

  setTimeout(close, duration);
}


function escapeHtml(value) {
  return safeText(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Storage save failed:", error);
  }
}


function loadJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value);
  } catch (error) {
    console.warn("Storage load failed:", error);
    return fallback;
  }
}


/* =========================================================
   SETTINGS
   ========================================================= */

function loadSettings() {
  const saved = loadJson(STORAGE.settings, {});

  state.brandName =
    saved.brandName ||
    "SNK Mentor Studio";

  state.selectedRecordingQuality =
    saved.recordingQuality ||
    "1080p";

  state.selectedRecordingFps =
    numberOr(saved.recordingFps, 30);

  state.autoStartTeleprompter =
    !!saved.autoStartTeleprompter;

  state.showTeleprompterRecording =
    saved.showTeleprompterRecording !== false;

  if (el.brandNameInput) {
    el.brandNameInput.value = state.brandName;
  }

  if (el.settingsRecordingQuality) {
    el.settingsRecordingQuality.value =
      state.selectedRecordingQuality;
  }

  if (el.settingsRecordingFps) {
    el.settingsRecordingFps.value =
      String(state.selectedRecordingFps);
  }

  if (el.settingsAutoStartTeleprompter) {
    el.settingsAutoStartTeleprompter.checked =
      state.autoStartTeleprompter;
  }

  if (el.settingsShowTeleprompterRecording) {
    el.settingsShowTeleprompterRecording.checked =
      state.showTeleprompterRecording;
  }

  if (el.brandBadgeText) {
    el.brandBadgeText.textContent = state.brandName;
  }
}


function saveSettings() {
  state.brandName =
    el.brandNameInput?.value?.trim() ||
    "SNK Mentor Studio";

  state.selectedRecordingQuality =
    el.settingsRecordingQuality?.value ||
    "1080p";

  state.selectedRecordingFps =
    numberOr(
      el.settingsRecordingFps?.value,
      30
    );

  state.autoStartTeleprompter =
    !!el.settingsAutoStartTeleprompter?.checked;

  state.showTeleprompterRecording =
    el.settingsShowTeleprompterRecording
      ? !!el.settingsShowTeleprompterRecording.checked
      : true;

  saveJson(STORAGE.settings, {
    brandName: state.brandName,
    recordingQuality: state.selectedRecordingQuality,
    recordingFps: state.selectedRecordingFps,
    autoStartTeleprompter:
      state.autoStartTeleprompter,
    showTeleprompterRecording:
      state.showTeleprompterRecording
  });

  if (el.brandBadgeText) {
    el.brandBadgeText.textContent =
      state.brandName;
  }

  applyRecordingSettingsToUI();

  closeModal(el.settingsModal);

  showToast(
    "Settings saved successfully.",
    "success"
  );
}


function openSettings() {
  loadSettings();

  openModal(el.settingsModal);
}


/* =========================================================
   MODALS
   ========================================================= */

function openModal(modal) {
  if (!modal) return;

  modal.hidden = false;
  modal.classList.add("is-open");

  document.body.classList.add("modal-open");
}


function closeModal(modal) {
  if (!modal) return;

  modal.classList.remove("is-open");
  modal.hidden = true;

  if (!qsa(".modal.is-open").length) {
    document.body.classList.remove("modal-open");
  }
}


function closeAllModals() {
  qsa(".modal.is-open").forEach((modal) => {
    closeModal(modal);
  });
}


/* =========================================================
   OUTPUT RESOLUTION
   ========================================================= */

function getResolutionDimensions(value) {
  switch (value) {
    case "360p":
      return {
        width: 640,
        height: 360
      };

    case "480p":
      return {
        width: 854,
        height: 480
      };

    case "720p":
      return {
        width: 1280,
        height: 720
      };

    case "1080p":
      return {
        width: 1920,
        height: 1080
      };

    case "1440p":
      return {
        width: 2560,
        height: 1440
      };

    default:
      return {
        width: 1920,
        height: 1080
      };
  }
}


function applyRecordingSettingsToUI() {
  const quality =
    el.recordingQualitySide?.value ||
    state.selectedRecordingQuality ||
    "1080p";

  const fps =
    numberOr(
      el.recordingFpsSide?.value,
      state.selectedRecordingFps || 30
    );

  const format =
    el.recordingFormatSide?.value ||
    state.selectedRecordingFormat ||
    "webm-vp9";

  state.selectedRecordingQuality = quality;
  state.selectedRecordingFps = fps;
  state.selectedRecordingFormat = format;

  const dimensions =
    getResolutionDimensions(quality);

  state.outputWidth = dimensions.width;
  state.outputHeight = dimensions.height;
  state.outputFps = fps;

  state.recordingWidth = dimensions.width;
  state.recordingHeight = dimensions.height;

  if (el.recordingQuality) {
    el.recordingQuality.textContent = quality;
  }

  if (el.recordingFps) {
    el.recordingFps.textContent = `${fps} FPS`;
  }

  if (el.recordingFormat) {
    el.recordingFormat.textContent =
      formatLabel(format);
  }

  updateStageBadges();
}


function formatLabel(format) {
  switch (format) {
    case "webm-vp9":
      return "WebM VP9";

    case "webm-vp8":
      return "WebM VP8";

    case "mp4":
      return "MP4";

    case "webm":
      return "WebM";

    default:
      return format || "WebM";
  }
}


/* =========================================================
   STAGE BADGES
   ========================================================= */

function updateStageBadges() {
  if (el.stageResolutionBadge) {
    el.stageResolutionBadge.textContent =
      `${state.outputWidth} × ${state.outputHeight}`;
  }

  if (el.stageFpsBadge) {
    el.stageFpsBadge.textContent =
      `${state.outputFps} FPS`;
  }

  let source = "No Source";

  if (state.screenCaptureRunning) {
    source = "Screen";
  } else if (state.mainSourceType === "video") {
    source = "Video";
  } else if (state.mainSourceType === "image") {
    source = "Image";
  }

  if (el.stageSourceBadge) {
    el.stageSourceBadge.textContent = source;
  }
}


/* =========================================================
   MAIN IMAGE
   ========================================================= */

function handleMainImageFile(file) {
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast(
      "Please select an image file.",
      "warning"
    );
    return;
  }

  revokeObjectUrl(state.mainImageObjectUrl);

  const url = URL.createObjectURL(file);

  state.mainImageObjectUrl = url;
  state.mainSourceType = "image";
  state.mainMediaReady = false;

  if (el.mainImage) {
    el.mainImage.src = url;

    el.mainImage.onload = () => {
      state.mainMediaReady = true;

      showElement(el.mainImage);
      hideElement(el.mainVideo);
      hideElement(el.screenCaptureVideo);

      hideElement(el.welcomeContent);

      updateStageBadges();
      renderCompositionFrame();
    };
  }

  showToast(
    "Main image loaded.",
    "success"
  );
}


/* =========================================================
   MAIN VIDEO
   ========================================================= */

function handleMainVideoFile(file) {
  if (!file) return;

  if (!file.type.startsWith("video/")) {
    showToast(
      "Please select a video file.",
      "warning"
    );
    return;
  }

  revokeObjectUrl(state.mainVideoObjectUrl);

  const url = URL.createObjectURL(file);

  state.mainVideoObjectUrl = url;
  state.mainSourceType = "video";
  state.mainMediaReady = false;

  if (!el.mainVideo) {
    return;
  }

  el.mainVideo.src = url;
  el.mainVideo.load();

  el.mainVideo.onloadedmetadata = () => {
    state.mainMediaReady = true;

    showElement(el.mainVideo);
    hideElement(el.mainImage);
    hideElement(el.screenCaptureVideo);

    hideElement(el.welcomeContent);

    setupMainVideoAudio();

    updateStageBadges();
    renderCompositionFrame();
  };

  el.mainVideo.onloadeddata = () => {
    renderCompositionFrame();
  };

  showToast(
    "Main video loaded.",
    "success"
  );
}


function playMainVideo() {
  if (!el.mainVideo || !el.mainVideo.src) {
    showToast(
      "Please upload a main video first.",
      "warning"
    );
    return;
  }

  el.mainVideo
    .play()
    .then(() => {
      startRenderLoop();
    })
    .catch((error) => {
      console.warn("Main video play failed:", error);

      showToast(
        "Browser blocked video playback. Click play again.",
        "warning"
      );
    });
}


function pauseMainVideo() {
  if (!el.mainVideo) return;

  el.mainVideo.pause();

  renderCompositionFrame();
}


/* =========================================================
   MAIN VIDEO AUDIO
   ========================================================= */

async function ensureAudioContext() {
  if (!state.audioContext) {
    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContextClass) {
      throw new Error(
        "Web Audio API is not supported."
      );
    }

    state.audioContext =
      new AudioContextClass();

    state.mediaDestination =
      state.audioContext.createMediaStreamDestination();
  }

  if (state.audioContext.state === "suspended") {
    await state.audioContext.resume();
  }

  return state.audioContext;
}


async function setupMainVideoAudio() {
  if (!el.mainVideo) return;

  try {
    const context =
      await ensureAudioContext();

    if (!state.mainVideoSourceNode) {
      state.mainVideoSourceNode =
        context.createMediaElementSource(
          el.mainVideo
        );

      state.mainVideoGainNode =
        context.createGain();

      state.mainAnalyser =
        context.createAnalyser();

      state.mainAnalyser.fftSize = 2048;

      state.mainVideoSourceNode.connect(
        state.mainVideoGainNode
      );

      state.mainVideoGainNode.connect(
        state.mainAnalyser
      );

      state.mainAnalyser.connect(
        context.destination
      );

      state.mainVideoGainNode.connect(
        state.mediaDestination
      );
    }

    updateMainVideoAudio();

  } catch (error) {
    console.warn(
      "Main video audio setup failed:",
      error
    );
  }
}


function updateMainVideoAudio() {
  if (!state.mainVideoGainNode) {
    return;
  }

  const volume =
    numberOr(
      el.mainVideoVolume?.value,
      1
    );

  const enabled =
    el.mainVideoAudioCheckbox
      ? el.mainVideoAudioCheckbox.checked
      : true;

  state.mainAudioEnabled = enabled;

  state.mainVideoGainNode.gain.value =
    enabled ? clamp(volume, 0, 1) : 0;

  if (el.mainVolumeValue) {
    el.mainVolumeValue.textContent =
      `${Math.round(volume * 100)}%`;
  }
}


/* =========================================================
   MENTOR VIDEO
   ========================================================= */

function handleMentorVideoFile(file) {
  if (!file) return;

  if (!file.type.startsWith("video/")) {
    showToast(
      "Please select a video file.",
      "warning"
    );
    return;
  }

  stopCamera(false);

  revokeObjectUrl(state.mentorVideoObjectUrl);

  const url = URL.createObjectURL(file);

  state.mentorVideoObjectUrl = url;
  state.mentorSourceType = "video";

  if (!el.mentorVideo) {
    return;
  }

  el.mentorVideo.src = url;
  el.mentorVideo.loop = true;
  el.mentorVideo.muted = true;
  el.mentorVideo.playsInline = true;

  el.mentorVideo.onloadedmetadata = () => {
    showElement(el.mentorVideo);
    hideElement(el.mentorCameraVideo);
    hideElement(el.mentorAICanvas);
    hideElement(el.mentorPlaceholder);

    if (el.mentorSourceLabel) {
      el.mentorSourceLabel.textContent =
        "Mentor Video";
    }

    el.mentorVideo
      .play()
      .catch(() => {});

    renderCompositionFrame();

    showToast(
      "Mentor video loaded.",
      "success"
    );
  };
}


/* =========================================================
   CAMERA QUALITY
   ========================================================= */

function getCameraQualityDimensions() {
  const value =
    el.cameraQuality?.value ||
    state.cameraQuality ||
    "720p";

  state.cameraQuality = value;

  switch (value) {
    case "360p":
      return {
        width: 640,
        height: 360
      };

    case "480p":
      return {
        width: 854,
        height: 480
      };

    case "720p":
      return {
        width: 1280,
        height: 720
      };

    case "1080p":
      return {
        width: 1920,
        height: 1080
      };

    default:
      return {
        width: 1280,
        height: 720
      };
  }
}


async function enumerateCameraDevices() {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return;
  }

  try {
    const devices =
      await navigator.mediaDevices.enumerateDevices();

    const cameras =
      devices.filter(
        (device) =>
          device.kind === "videoinput"
      );

    if (!el.cameraDeviceSelect) {
      return;
    }

    const current =
      el.cameraDeviceSelect.value;

    el.cameraDeviceSelect.innerHTML = "";

    if (!cameras.length) {
      const option =
        document.createElement("option");

      option.value = "";
      option.textContent =
        "Default camera";

      el.cameraDeviceSelect.appendChild(
        option
      );

      return;
    }

    cameras.forEach((camera, index) => {
      const option =
        document.createElement("option");

      option.value =
        camera.deviceId;

      option.textContent =
        camera.label ||
        `Camera ${index + 1}`;

      el.cameraDeviceSelect.appendChild(
        option
      );
    });

    if (
      current &&
      cameras.some(
        (camera) =>
          camera.deviceId === current
      )
    ) {
      el.cameraDeviceSelect.value =
        current;
    }

  } catch (error) {
    console.warn(
      "Camera device enumeration failed:",
      error
    );
  }
}


/* =========================================================
   CAMERA START
   ========================================================= */

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    showToast(
      "Camera is not supported by this browser.",
      "error"
    );
    return;
  }

  try {
    stopCamera(false);

    const dimensions =
      getCameraQualityDimensions();

    const fps =
      numberOr(
        el.cameraFps?.value,
        state.cameraFps || 30
      );

    state.cameraFps = fps;

    const constraints = {
      audio: false,
      video: {
        width: {
          ideal: dimensions.width
        },
        height: {
          ideal: dimensions.height
        },
        frameRate: {
          ideal: fps,
          max: fps
        },
        facingMode:
          state.cameraDeviceId
            ? undefined
            : state.cameraFacingMode
      }
    };

    if (state.cameraDeviceId) {
      constraints.video.deviceId = {
        exact: state.cameraDeviceId
      };
    }

    let stream;

    try {
      stream =
        await navigator.mediaDevices.getUserMedia(
          constraints
        );
    } catch (firstError) {
      console.warn(
        "Preferred camera constraints failed:",
        firstError
      );

      stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
    }

    state.cameraStream = stream;
    state.cameraRunning = true;

    if (el.mentorCameraVideo) {
      el.mentorCameraVideo.srcObject =
        stream;

      el.mentorCameraVideo.muted = true;
      el.mentorCameraVideo.playsInline = true;

      await el.mentorCameraVideo.play()
        .catch(() => {});
    }

    state.mentorSourceType = "camera";

    showElement(el.mentorCameraVideo);
    hideElement(el.mentorVideo);

    if (
      state.backgroundMode === "original"
    ) {
      hideElement(el.mentorAICanvas);
    } else {
      showElement(el.mentorAICanvas);
      await initializeSegmentation();
    }

    hideElement(el.mentorPlaceholder);

    if (el.mentorSourceLabel) {
      el.mentorSourceLabel.textContent =
        "Live Camera";
    }

    if (el.cameraStatus) {
      el.cameraStatus.textContent =
        "Camera is live";
    }

    setIndicator(
      el.cameraIndicator,
      true
    );

    await enumerateCameraDevices();

    if (el.cameraDeviceSelect && state.cameraDeviceId) {
      el.cameraDeviceSelect.value =
        state.cameraDeviceId;
    }

    startRenderLoop();

    showToast(
      "Camera started.",
      "success"
    );

  } catch (error) {
    console.error(
      "Camera start failed:",
      error
    );

    state.cameraRunning = false;

    if (el.cameraStatus) {
      el.cameraStatus.textContent =
        "Camera unavailable";
    }

    setIndicator(
      el.cameraIndicator,
      false
    );

    showToast(
      getMediaErrorMessage(error),
      "error",
      4500
    );
  }
}


function getMediaErrorMessage(error) {
  if (!error) {
    return "Unable to access the camera.";
  }

  switch (error.name) {
    case "NotAllowedError":
      return "Camera permission was denied. Please allow camera access.";

    case "NotFoundError":
      return "No camera was found.";

    case "NotReadableError":
      return "Camera is already being used by another application.";

    case "OverconstrainedError":
      return "The selected camera settings are not available.";

    case "SecurityError":
      return "Camera access requires a secure HTTPS page.";

    default:
      return "Unable to access the camera.";
  }
}


/* =========================================================
   CAMERA STOP
   ========================================================= */

function stopCamera(showMessage = true) {
  if (state.cameraStream) {
    state.cameraStream
      .getTracks()
      .forEach((track) => {
        try {
          track.stop();
        } catch {
          /* Ignore */
        }
      });
  }

  state.cameraStream = null;
  state.cameraRunning = false;

  if (el.mentorCameraVideo) {
    try {
      el.mentorCameraVideo.pause();
    } catch {
      /* Ignore */
    }

    el.mentorCameraVideo.srcObject =
      null;
  }

  setIndicator(
    el.cameraIndicator,
    false
  );

  if (el.cameraStatus) {
    el.cameraStatus.textContent =
      "Camera is off";
  }

  if (state.mentorSourceType === "camera") {
    state.mentorSourceType = "none";

    hideElement(el.mentorCameraVideo);
    hideElement(el.mentorAICanvas);
    showElement(el.mentorPlaceholder);

    if (el.mentorSourceLabel) {
      el.mentorSourceLabel.textContent =
        "Mentor";
    }
  }

  if (showMessage) {
    showToast(
      "Camera stopped.",
      "info"
    );
  }

  renderCompositionFrame();
}


/* =========================================================
   SWITCH CAMERA
   ========================================================= */

async function switchCamera() {
  if (!state.cameraRunning) {
    await startCamera();
    return;
  }

  if (state.cameraDeviceId) {
    const devices =
      await getVideoInputDevices();

    if (devices.length > 1) {
      const index =
        devices.findIndex(
          (device) =>
            device.deviceId ===
            state.cameraDeviceId
        );

      const next =
        devices[
          (index + 1) % devices.length
        ];

      state.cameraDeviceId =
        next?.deviceId || "";

      if (el.cameraDeviceSelect) {
        el.cameraDeviceSelect.value =
          state.cameraDeviceId;
      }
    } else {
      state.cameraFacingMode =
        state.cameraFacingMode === "user"
          ? "environment"
          : "user";

      state.cameraDeviceId = "";
    }
  } else {
    state.cameraFacingMode =
      state.cameraFacingMode === "user"
        ? "environment"
        : "user";
  }

  await startCamera();
}


async function getVideoInputDevices() {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return [];
  }

  try {
    const devices =
      await navigator.mediaDevices.enumerateDevices();

    return devices.filter(
      (device) =>
        device.kind === "videoinput"
    );
  } catch {
    return [];
  }
}


/* =========================================================
   MEDIA PIPE SEGMENTATION
   ========================================================= */

async function initializeSegmentation() {
  if (state.segmentationReady) {
    return true;
  }

  if (
    typeof SelfieSegmentation ===
    "undefined"
  ) {
    console.warn(
      "MediaPipe SelfieSegmentation is unavailable."
    );

    showToast(
      "AI background engine is unavailable. Original camera will be used.",
      "warning",
      4000
    );

    state.segmentationEnabled = false;

    return false;
  }

  try {
    state.selfieSegmentation =
      new SelfieSegmentation({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
        }
      });

    state.selfieSegmentation.setOptions({
      modelSelection: 1
    });

    state.selfieSegmentation.onResults(
      handleSegmentationResults
    );

    state.segmentationReady = true;
    state.segmentationEnabled = true;

    return true;

  } catch (error) {
    console.error(
      "Segmentation initialization failed:",
      error
    );

    state.segmentationReady = false;
    state.segmentationEnabled = false;

    return false;
  }
}


async function processSegmentationFrame() {
  if (
    !state.cameraRunning ||
    !el.mentorCameraVideo ||
    !isVideoElementReady(
      el.mentorCameraVideo
    )
  ) {
    return;
  }

  if (
    state.backgroundMode === "original"
  ) {
    return;
  }

  if (!state.segmentationReady) {
    const ready =
      await initializeSegmentation();

    if (!ready) {
      return;
    }
  }

  if (state.segmentationBusy) {
    return;
  }

  state.segmentationBusy = true;

  try {
    await state.selfieSegmentation.send({
      image: el.mentorCameraVideo
    });
  } catch (error) {
    console.warn(
      "Segmentation frame failed:",
      error
    );
  } finally {
    state.segmentationBusy = false;
  }
}


/* =========================================================
   SEGMENTATION RESULT
   ========================================================= */

function handleSegmentationResults(results) {
  if (!results) {
    return;
  }

  const source =
    results.image;

  const mask =
    results.segmentationMask;

  if (!source || !mask) {
    return;
  }

  const width =
    source.videoWidth ||
    source.width ||
    1280;

  const height =
    source.videoHeight ||
    source.height ||
    720;

  prepareCanvas(
    state.sourceCanvas,
    width,
    height
  );

  prepareCanvas(
    state.maskCanvas,
    width,
    height
  );

  prepareCanvas(
    state.isolatedCanvas,
    width,
    height
  );

  state.sourceCtx.clearRect(
    0,
    0,
    width,
    height
  );

  state.maskCtx.clearRect(
    0,
    0,
    width,
    height
  );

  state.isolatedCtx.clearRect(
    0,
    0,
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

  state.maskCtx.drawImage(
    mask,
    0,
    0,
    width,
    height
  );

  const sourceData =
    state.sourceCtx.getImageData(
      0,
      0,
      width,
      height
    );

  const maskData =
    state.maskCtx.getImageData(
      0,
      0,
      width,
      height
    );

  const isolatedData =
    state.isolatedCtx.createImageData(
      width,
      height
    );

  const sourcePixels =
    sourceData.data;

  const maskPixels =
    maskData.data;

  const isolatedPixels =
    isolatedData.data;

  for (
    let i = 0;
    i < sourcePixels.length;
    i += 4
  ) {
    const confidence =
      maskPixels[i] / 255;

    /*
      MediaPipe Selfie Segmentation:
      higher mask value = person.

      A small soft threshold is used so the
      person remains visible and edges are
      less harsh.
    */

    let alpha =
      (confidence - 0.15) /
      0.65;

    alpha =
      clamp(alpha, 0, 1);

    alpha =
      alpha * 255;

    isolatedPixels[i] =
      sourcePixels[i];

    isolatedPixels[i + 1] =
      sourcePixels[i + 1];

    isolatedPixels[i + 2] =
      sourcePixels[i + 2];

    isolatedPixels[i + 3] =
      alpha;
  }

  state.isolatedCtx.putImageData(
    isolatedData,
    0,
    0
  );

  renderMentorAIBackground(
    width,
    height
  );
}


/* =========================================================
   CANVAS PREPARE
   ========================================================= */

function prepareCanvas(
  canvas,
  width,
  height
) {
  if (
    canvas.width !== width ||
    canvas.height !== height
  ) {
    canvas.width = width;
    canvas.height = height;
  }
}


/* =========================================================
   AI BACKGROUND
   ========================================================= */

function setBackgroundMode(mode) {
  const allowed = [
    "original",
    "remove",
    "blur",
    "image",
    "color"
  ];

  if (!allowed.includes(mode)) {
    mode = "original";
  }

  state.backgroundMode = mode;

  if (
    mode !== "original" &&
    state.cameraRunning
  ) {
    initializeSegmentation();
  }

  if (mode === "original") {
    hideElement(el.mentorAICanvas);

    if (state.cameraRunning) {
      showElement(el.mentorCameraVideo);
    }
  } else {
    if (state.cameraRunning) {
      hideElement(el.mentorCameraVideo);
      showElement(el.mentorAICanvas);
    }
  }

  if (mode === "image" && !state.backgroundImage) {
    showToast(
      "Please upload a background image first.",
      "warning"
    );
  }

  renderCompositionFrame();
}


async function renderMentorAIBackground(
  width,
  height
) {
  if (!el.mentorAICanvas) {
    return;
  }

  prepareCanvas(
    el.mentorAICanvas,
    width,
    height
  );

  const ctx =
    el.mentorAICanvas.getContext("2d");

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  const mode =
    state.backgroundMode;

  /*
    Original mode is handled by the normal
    camera video element.
  */

  if (mode === "original") {
    return;
  }

  /*
    Background first.
  */

  if (mode === "remove") {
    /*
      Transparent background.
      Only isolated person is drawn.
    */

  } else if (mode === "blur") {
    ctx.save();

    ctx.filter =
      "blur(14px)";

    ctx.drawImage(
      el.mentorCameraVideo,
      -20,
      -20,
      width + 40,
      height + 40
    );

    ctx.restore();

  } else if (
    mode === "image" &&
    state.backgroundImage
  ) {
    drawCoverImage(
      ctx,
      state.backgroundImage,
      width,
      height
    );

  } else if (mode === "color") {
    const color =
      el.backgroundColor?.value ||
      "#111827";

    ctx.fillStyle = color;

    ctx.fillRect(
      0,
      0,
      width,
      height
    );
  }

  /*
    Person always comes on top.
    This fixes the common problem where
    custom background hides the person.
  */

  ctx.drawImage(
    state.isolatedCanvas,
    0,
    0,
    width,
    height
  );
}


function drawCoverImage(
  ctx,
  image,
  width,
  height
) {
  if (!image) return;

  const iw =
    image.naturalWidth ||
    image.videoWidth ||
    image.width;

  const ih =
    image.naturalHeight ||
    image.videoHeight ||
    image.height;

  if (!iw || !ih) {
    return;
  }

  const imageRatio =
    iw / ih;

  const targetRatio =
    width / height;

  let drawWidth;
  let drawHeight;
  let x;
  let y;

  if (imageRatio > targetRatio) {
    drawHeight = height;
    drawWidth =
      height * imageRatio;

    x =
      (width - drawWidth) / 2;

    y = 0;
  } else {
    drawWidth = width;
    drawHeight =
      width / imageRatio;

    x = 0;

    y =
      (height - drawHeight) / 2;
  }

  ctx.drawImage(
    image,
    x,
    y,
    drawWidth,
    drawHeight
  );
}


/* =========================================================
   BACKGROUND IMAGE UPLOAD
   ========================================================= */

function handleBackgroundImage(file) {
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast(
      "Please select an image file.",
      "warning"
    );
    return;
  }

  const reader =
    new FileReader();

  reader.onload = () => {
    const image =
      new Image();

    image.onload = () => {
      state.backgroundImage =
        image;

      state.backgroundMode =
        "image";

      showElement(
        el.mentorAICanvas
      );

      hideElement(
        el.mentorCameraVideo
      );

      showToast(
        "Custom background loaded.",
        "success"
      );

      renderCompositionFrame();
    };

    image.src =
      reader.result;
  };

  reader.readAsDataURL(file);
}


/* =========================================================
   MENTOR SOURCE DRAWING
   ========================================================= */

function getMentorSourceElement() {
  if (
    state.mentorSourceType ===
    "camera"
  ) {
    if (
      state.backgroundMode !==
      "original" &&
      el.mentorAICanvas
    ) {
      return el.mentorAICanvas;
    }

    return el.mentorCameraVideo;
  }

  if (
    state.mentorSourceType ===
    "video"
  ) {
    return el.mentorVideo;
  }

  return null;
}


/* =========================================================
   STAGE DRAWING
   ========================================================= */

function drawMainSource(
  ctx,
  width,
  height
) {
  if (
    state.screenCaptureRunning &&
    isVideoElementReady(
      el.screenCaptureVideo
    )
  ) {
    drawContain(
      ctx,
      el.screenCaptureVideo,
      width,
      height
    );

    return;
  }

  if (
    state.mainSourceType ===
    "video" &&
    isVideoElementReady(
      el.mainVideo
    )
  ) {
    drawContain(
      ctx,
      el.mainVideo,
      width,
      height
    );

    return;
  }

  if (
    state.mainSourceType ===
    "image" &&
    el.mainImage?.complete &&
    el.mainImage.naturalWidth
  ) {
    drawContain(
      ctx,
      el.mainImage,
      width,
      height
    );

    return;
  }

  /*
    Empty stage.
  */

  ctx.fillStyle =
    "#05070b";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  drawWelcomeScreen(
    ctx,
    width,
    height
  );
}


function drawContain(
  ctx,
  source,
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

  const x =
    (width - drawWidth) / 2;

  const y =
    (height - drawHeight) / 2;

  ctx.drawImage(
    source,
    x,
    y,
    drawWidth,
    drawHeight
  );
}


function drawWelcomeScreen(
  ctx,
  width,
  height
) {
  const centerX =
    width / 2;

  const centerY =
    height / 2;

  ctx.save();

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "middle";

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    `700 ${Math.max(
      34,
      width * 0.026
    )}px Arial`;

  ctx.fillText(
    "SNK Mentor Studio",
    centerX,
    centerY - 35
  );

  ctx.fillStyle =
    "rgba(255,255,255,.65)";

  ctx.font =
    `400 ${Math.max(
      18,
      width * 0.012
    )}px Arial`;

  ctx.fillText(
    "Upload a slide, image or video to begin",
    centerX,
    centerY + 20
  );

  ctx.restore();
}


/* =========================================================
   MENTOR DOM RECT TO OUTPUT RECT
   ========================================================= */

function getMentorCompositionRect() {
  if (!el.mentorCard || !el.stage) {
    return null;
  }

  const stageRect =
    el.stage.getBoundingClientRect();

  const mentorRect =
    el.mentorCard.getBoundingClientRect();

  if (
    stageRect.width <= 0 ||
    stageRect.height <= 0
  ) {
    return null;
  }

  const scaleX =
    state.outputWidth /
    stageRect.width;

  const scaleY =
    state.outputHeight /
    stageRect.height;

  return {
    x:
      (mentorRect.left -
        stageRect.left) *
      scaleX,

    y:
      (mentorRect.top -
        stageRect.top) *
      scaleY,

    width:
      mentorRect.width *
      scaleX,

    height:
      mentorRect.height *
      scaleY
  };
}


/* =========================================================
   DRAW MENTOR OVERLAY
   ========================================================= */

function drawMentorOverlay(
  ctx,
  width,
  height
) {
  const source =
    getMentorSourceElement();

  if (!source) {
    return;
  }

  const rect =
    getMentorCompositionRect();

  if (!rect) {
    return;
  }

  const x =
    clamp(
      rect.x,
      -width,
      width
    );

  const y =
    clamp(
      rect.y,
      -height,
      height
    );

  const w =
    Math.max(
      1,
      rect.width
    );

  const h =
    Math.max(
      1,
      rect.height
    );

  if (
    source instanceof HTMLVideoElement
  ) {
    if (
      !isVideoElementReady(source)
    ) {
      return;
    }
  }

  ctx.save();

  /*
    Mirror live camera.
    Uploaded mentor video remains normal.
  */

  if (
    state.mentorSourceType ===
    "camera"
  ) {
    ctx.translate(
      x + w,
      y
    );

    ctx.scale(
      -1,
      1
    );

    ctx.drawImage(
      source,
      0,
      0,
      w,
      h
    );
  } else {
    ctx.drawImage(
      source,
      x,
      y,
      w,
      h
    );
  }

  ctx.restore();
}


/* =========================================================
   BRAND BADGE
   ========================================================= */

function drawBrandBadge(
  ctx,
  width,
  height
) {
  if (
    !el.brandBadge ||
    el.brandBadge.hidden
  ) {
    return;
  }

  const badgeRect =
    el.brandBadge.getBoundingClientRect();

  const stageRect =
    el.stage.getBoundingClientRect();

  if (
    badgeRect.width <= 0 ||
    stageRect.width <= 0
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
    (badgeRect.left -
      stageRect.left) *
    scaleX;

  const y =
    (badgeRect.top -
      stageRect.top) *
    scaleY;

  const w =
    badgeRect.width *
    scaleX;

  const h =
    badgeRect.height *
    scaleY;

  const radius =
    Math.min(
      h * 0.25,
      24
    );

  ctx.save();

  ctx.fillStyle =
    "rgba(0,0,0,.55)";

  roundRect(
    ctx,
    x,
    y,
    w,
    h,
    radius
  );

  ctx.fill();

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    `600 ${Math.max(
      16,
      h * 0.36
    )}px Arial`;

  ctx.textBaseline =
    "middle";

  ctx.fillText(
    state.brandName,
    x + h * 0.45,
    y + h / 2
  );

  ctx.restore();
}


function roundRect(
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
   RECORDING OVERLAY
   ========================================================= */

function drawRecordingOverlay(
  ctx,
  width,
  height
) {
  if (
    state.recordingState !==
    "recording"
  ) {
    return;
  }

  const x =
    width * 0.03;

  const y =
    height * 0.035;

  const dotRadius =
    Math.max(
      8,
      width * 0.004
    );

  ctx.save();

  ctx.fillStyle =
    "rgba(0,0,0,.62)";

  roundRect(
    ctx,
    x - 18,
    y - 18,
    width * 0.16,
    height * 0.055,
    16
  );

  ctx.fill();

  ctx.beginPath();

  ctx.arc(
    x + 2,
    y + height * 0.009,
    dotRadius,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    "#ff3344";

  ctx.fill();

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    `700 ${Math.max(
      18,
      width * 0.011
    )}px Arial`;

  ctx.textBaseline =
    "middle";

  ctx.fillText(
    formatTime(
      state.recordingElapsed
    ),
    x + 25,
    y + height * 0.009
  );

  ctx.restore();
}


/* =========================================================
   TELEPROMPTER DRAWING
   ========================================================= */

function drawTeleprompter(
  ctx,
  width,
  height
) {
  if (
    !state.showTeleprompterRecording
  ) {
    return;
  }

  if (
    !el.includeTeleprompterInRecording
      ?.checked
  ) {
    return;
  }

  if (
    !state.teleprompterText.trim()
  ) {
    return;
  }

  const text =
    state.teleprompterText;

  const fontSize =
    clamp(
      state.teleprompterFontSize *
        (width / 1920),
      18,
      100
    );

  const padding =
    width * 0.035;

  const boxWidth =
    width * 0.88;

  const lineHeight =
    fontSize * 1.35;

  const lines =
    wrapText(
      ctx,
      text,
      boxWidth - padding * 2,
      fontSize
    );

  const totalHeight =
    lines.length *
    lineHeight;

  const baseY =
    height -
    padding -
    state.teleprompterOffset;

  ctx.save();

  ctx.globalAlpha =
    state.teleprompterOpacity;

  ctx.fillStyle =
    "rgba(0,0,0,.55)";

  roundRect(
    ctx,
    padding,
    height * 0.60,
    boxWidth,
    height * 0.33,
    24
  );

  ctx.fill();

  ctx.beginPath();

  ctx.rect(
    padding,
    height * 0.60,
    boxWidth,
    height * 0.33
  );

  ctx.clip();

  ctx.textAlign =
    "left";

  ctx.textBaseline =
    "top";

  ctx.font =
    `600 ${fontSize}px Arial`;

  ctx.fillStyle =
    "#ffffff";

  lines.forEach(
    (line, index) => {
      ctx.fillText(
        line,
        padding * 1.5,
        baseY -
          totalHeight +
          index *
            lineHeight
      );
    }
  );

  ctx.restore();
}


function wrapText(
  ctx,
  text,
  maxWidth,
  fontSize
) {
  ctx.font =
    `600 ${fontSize}px Arial`;

  const paragraphs =
    text.split(/\r?\n/);

  const lines = [];

  paragraphs.forEach(
    (paragraph) => {
      if (!paragraph.trim()) {
        lines.push("");
        return;
      }

      const words =
        paragraph.split(/\s+/);

      let line = "";

      words.forEach(
        (word) => {
          const test =
            line
              ? `${line} ${word}`
              : word;

          const width =
            ctx.measureText(
              test
            ).width;

          if (
            width > maxWidth &&
            line
          ) {
            lines.push(line);
            line = word;
          } else {
            line = test;
          }
        }
      );

      if (line) {
        lines.push(line);
      }
    }
  );

  return lines;
}


/* =========================================================
   COMPOSITION FRAME
   ========================================================= */

function renderCompositionFrame() {
  if (
    !state.compositionCtx ||
    state.outputWidth <= 0 ||
    state.outputHeight <= 0
  ) {
    return;
  }

  const canvas =
    state.compositionCanvas;

  if (
    canvas.width !==
      state.outputWidth ||
    canvas.height !==
      state.outputHeight
  ) {
    canvas.width =
      state.outputWidth;

    canvas.height =
      state.outputHeight;
  }

  const ctx =
    state.compositionCtx;

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.fillStyle =
    "#000000";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  drawMainSource(
    ctx,
    canvas.width,
    canvas.height
  );

  drawMentorOverlay(
    ctx,
    canvas.width,
    canvas.height
  );

  drawBrandBadge(
    ctx,
    canvas.width,
    canvas.height
  );

  drawTeleprompter(
    ctx,
    canvas.width,
    canvas.height
  );

  drawRecordingOverlay(
    ctx,
    canvas.width,
    canvas.height
  );
}


/* =========================================================
   CONTINUOUS RENDER LOOP
   ========================================================= */

function startRenderLoop() {
  if (state.renderRunning) {
    return;
  }

  state.renderRunning = true;

  const loop = (timestamp) => {
    if (!state.renderRunning) {
      return;
    }

    /*
      Always render while recording.
      Outside recording, rendering remains active
      when media/camera is playing.
    */

    const targetInterval =
      1000 /
      Math.max(
        1,
        state.outputFps || 30
      );

    if (
      timestamp -
        state.lastRenderTime >=
      targetInterval
    ) {
      state.lastRenderTime =
        timestamp;

      renderCompositionFrame();

      updateAudioMeters();

      if (
        state.cameraRunning &&
        state.backgroundMode !==
          "original"
      ) {
        processSegmentationFrame();
      }

      updateTeleprompter();
    }

    state.renderAnimationId =
      requestAnimationFrame(
        loop
      );
  };

  state.renderAnimationId =
    requestAnimationFrame(
      loop
    );
}


function stopRenderLoop() {
  state.renderRunning = false;

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
   AUDIO METER
   ========================================================= */

function updateAudioMeters() {
  updateMicMeter();
  updateMainAudioMeter();
  drawMicWaveform();
}


function getRmsFromAnalyser(
  analyser
) {
  if (!analyser) {
    return 0;
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
      (data[i] - 128) / 128;

    sum +=
      normalized *
      normalized;
  }

  const rms =
    Math.sqrt(
      sum / data.length
    );

  return clamp(
    rms * 3.2,
    0,
    1
  );
}


function updateMicMeter() {
  state.micLevel =
    getRmsFromAnalyser(
      state.micAnalyser
    );

  const percent =
    Math.round(
      state.micLevel * 100
    );

  if (el.micLevelBar) {
    el.micLevelBar.style.width =
      `${percent}%`;
  }

  if (el.micLevelValue) {
    el.micLevelValue.textContent =
      `${percent}%`;
  }
}


function updateMainAudioMeter() {
  state.mainAudioLevel =
    getRmsFromAnalyser(
      state.mainAnalyser
    );

  const percent =
    Math.round(
      state.mainAudioLevel * 100
    );

  if (el.mainAudioLevelBar) {
    el.mainAudioLevelBar.style.width =
      `${percent}%`;
  }

  if (el.mainAudioLevelValue) {
    el.mainAudioLevelValue.textContent =
      `${percent}%`;
  }
}


/* =========================================================
   MICROPHONE
   ========================================================= */

async function startMicrophone() {
  if (
    !navigator.mediaDevices?.getUserMedia
  ) {
    showToast(
      "Microphone is not supported by this browser.",
      "error"
    );
    return;
  }

  try {
    await ensureAudioContext();

    if (state.micStream) {
      stopMicrophone(false);
    }

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

    state.micSourceNode.connect(
      state.micGainNode
    );

    state.micGainNode.connect(
      state.micAnalyser
    );

    state.micAnalyser.connect(
      state.audioContext.destination
    );

    state.micGainNode.connect(
      state.mediaDestination
    );

    updateMicrophoneSettings();

    state.micEnabled = true;

    if (el.micEnabled) {
      el.micEnabled.checked = true;
    }

    updateMicStatusUI();

    showToast(
      "Microphone connected.",
      "success"
    );

  } catch (error) {
    console.error(
      "Microphone start failed:",
      error
    );

    state.micStream = null;

    showToast(
      getMicrophoneErrorMessage(error),
      "error",
      4500
    );
  }
}


function getMicrophoneErrorMessage(
  error
) {
  if (!error) {
    return "Unable to access microphone.";
  }

  switch (error.name) {
    case "NotAllowedError":
      return "Microphone permission was denied.";

    case "NotFoundError":
      return "No microphone was found.";

    case "NotReadableError":
      return "Microphone is already being used.";

    case "SecurityError":
      return "Microphone access requires HTTPS.";

    default:
      return "Unable to access microphone.";
  }
}


function updateMicrophoneSettings() {
  if (!state.micGainNode) {
    return;
  }

  const volume =
    numberOr(
      el.micVolume?.value,
      1
    );

  const enabled =
    el.micEnabled
      ? el.micEnabled.checked
      : true;

  const monitor =
    el.micMonitor
      ? el.micMonitor.checked
      : false;

  state.micEnabled =
    enabled;

  state.micMonitor =
    monitor;

  state.micGainNode.gain.value =
    enabled
      ? clamp(volume, 0, 1)
      : 0;

  if (el.micVolumeValue) {
    el.micVolumeValue.textContent =
      `${Math.round(volume * 100)}%`;
  }

  /*
    The analyser already receives the
    microphone signal before the gain node,
    so level remains visible even when
    mic is muted.
  */

  if (
    state.micMonitor &&
    state.micEnabled
  ) {
    /*
      Monitoring is connected through
      AudioContext destination by the
      analyser path.
    */
    if (
      state.micAnalyser &&
      state.micGainNode
    ) {
      /*
        Avoid adding duplicate connections.
        The micGainNode is already connected
        to the analyser and analyser to
        destination.
      */
    }
  }

  updateMicStatusUI();

  if (
    window.CourseStudioMicVolume
  ) {
    window.CourseStudioMicVolume =
      volume;
  }

  window.CourseStudioMicEnabled =
    enabled;

  window.CourseStudioMicMonitor =
    monitor;
}


function stopMicrophone(
  showMessage = true
) {
  if (state.micStream) {
    state.micStream
      .getTracks()
      .forEach((track) => {
        try {
          track.stop();
        } catch {
          /* Ignore */
        }
      });
  }

  state.micStream = null;

  if (state.micSourceNode) {
    try {
      state.micSourceNode.disconnect();
    } catch {
      /* Ignore */
    }
  }

  state.micSourceNode = null;
  state.micGainNode = null;
  state.micAnalyser = null;

  setIndicator(
    el.micIndicator,
    false
  );

  if (showMessage) {
    showToast(
      "Microphone stopped.",
      "info"
    );
  }

  updateMicStatusUI();
}


function updateMicStatusUI() {
  const active =
    !!(
      state.micStream &&
      state.micEnabled
    );

  setIndicator(
    el.micIndicator,
    active
  );

  qsa("[data-mic-status]")
    .forEach((node) => {
      node.textContent =
        active
          ? "Microphone On"
          : "Microphone Off";
    });
}


/* =========================================================
   MICROPHONE WAVEFORM
   ========================================================= */

function drawMicWaveform() {
  const canvas =
    el.micWaveformCanvas;

  if (!canvas) {
    return;
  }

  const rect =
    canvas.getBoundingClientRect();

  const width =
    Math.max(
      1,
      Math.floor(
        rect.width || 320
      )
    );

  const height =
    Math.max(
      1,
      Math.floor(
        rect.height || 80
      )
    );

  if (
    canvas.width !== width ||
    canvas.height !== height
  ) {
    canvas.width =
      width;

    canvas.height =
      height;
  }

  const ctx =
    canvas.getContext("2d");

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  ctx.fillStyle =
    "rgba(255,255,255,.035)";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  if (!state.micAnalyser) {
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

  const slice =
    width / data.length;

  for (
    let i = 0;
    i < data.length;
    i++
  ) {
    const x =
      i * slice;

    const normalized =
      data[i] / 255;

    const y =
      normalized * height;

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
  }

  ctx.lineWidth = 2;
  ctx.strokeStyle =
    "rgba(255,255,255,.9)";

  ctx.stroke();
}


/* =========================================================
   INDICATORS
   ========================================================= */

function setIndicator(
  element,
  active
) {
  if (!element) {
    return;
  }

  element.classList.toggle(
    "is-active",
    !!active
  );

  element.classList.toggle(
    "active",
    !!active
  );

  element.dataset.active =
    active ? "true" : "false";
}


/* =========================================================
   SCREEN CAPTURE
   ========================================================= */

async function startScreenCapture() {
  if (
    !navigator.mediaDevices?.getDisplayMedia
  ) {
    showToast(
      "Screen capture is not supported by this browser.",
      "error"
    );
    return;
  }

  try {
    stopScreenCapture(false);

    state.screenStream =
      await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: {
            ideal:
              state.outputFps || 30,
            max:
              state.outputFps || 30
          }
        },
        audio: true
      });

    state.screenCaptureRunning =
      true;

    if (el.screenCaptureVideo) {
      el.screenCaptureVideo.srcObject =
        state.screenStream;

      el.screenCaptureVideo.muted =
        true;

      el.screenCaptureVideo.playsInline =
        true;

      await el.screenCaptureVideo
        .play()
        .catch(() => {});
    }

    showElement(
      el.screenCaptureVideo
    );

    hideElement(
      el.mainVideo
    );

    hideElement(
      el.mainImage
    );

    hideElement(
      el.welcomeContent
    );

    state.screenAudioTrack =
      state.screenStream.getAudioTracks()[0] ||
      null;

    if (state.screenAudioTrack) {
      await setupScreenAudio(
        state.screenStream
      );
    }

    const videoTrack =
      state.screenStream.getVideoTracks()[0];

    if (videoTrack) {
      videoTrack.addEventListener(
        "ended",
        () => {
          stopScreenCapture(
            true
          );
        }
      );
    }

    setIndicator(
      el.screenIndicator,
      true
    );

    updateScreenStatusUI();

    updateStageBadges();

    startRenderLoop();

    showToast(
      "Screen capture started.",
      "success"
    );

  } catch (error) {
    console.error(
      "Screen capture failed:",
      error
    );

    if (
      error.name ===
      "NotAllowedError"
    ) {
      showToast(
        "Screen sharing was cancelled.",
        "info"
      );
    } else {
      showToast(
        "Unable to start screen capture.",
        "error"
      );
    }
  }
}


async function setupScreenAudio(
  stream
) {
  if (!stream?.getAudioTracks().length) {
    return;
  }

  try {
    await ensureAudioContext();

    if (
      state.screenAudioSourceNode
    ) {
      try {
        state.screenAudioSourceNode.disconnect();
      } catch {
        /* Ignore */
      }
    }

    state.screenAudioSourceNode =
      state.audioContext.createMediaStreamSource(
        new MediaStream(
          stream.getAudioTracks()
        )
      );

    state.screenAudioGainNode =
      state.audioContext.createGain();

    state.screenAudioGainNode.gain.value =
      1;

    state.screenAudioSourceNode.connect(
      state.screenAudioGainNode
    );

    state.screenAudioGainNode.connect(
      state.mediaDestination
    );

    setIndicator(
      el.audioIndicator,
      true
    );

  } catch (error) {
    console.warn(
      "Screen audio setup failed:",
      error
    );
  }
}


function stopScreenCapture(
  showMessage = true
) {
  if (state.screenStream) {
    state.screenStream
      .getTracks()
      .forEach((track) => {
        try {
          track.stop();
        } catch {
          /* Ignore */
        }
      });
  }

  state.screenStream = null;
  state.screenCaptureRunning = false;
  state.screenAudioTrack = null;

  if (el.screenCaptureVideo) {
    try {
      el.screenCaptureVideo.pause();
    } catch {
      /* Ignore */
    }

    el.screenCaptureVideo.srcObject =
      null;
  }

  if (state.screenAudioSourceNode) {
    try {
      state.screenAudioSourceNode.disconnect();
    } catch {
      /* Ignore */
    }
  }

  state.screenAudioSourceNode = null;
  state.screenAudioGainNode = null;

  setIndicator(
    el.screenIndicator,
    false
  );

  updateScreenStatusUI();
  updateStageBadges();

  if (showMessage) {
    showToast(
      "Screen capture stopped.",
      "info"
    );
  }

  renderCompositionFrame();
}


function updateScreenStatusUI() {
  const active =
    state.screenCaptureRunning;

  if (el.screenCaptureStatus) {
    el.screenCaptureStatus.textContent =
      active
        ? "Screen sharing active"
        : "Screen sharing off";
  }

  if (el.screenCaptureStatusLight) {
    el.screenCaptureStatusLight.classList.toggle(
      "active",
      active
    );
  }
}


/* =========================================================
   RECORDING MIME TYPES
   ========================================================= */

function getMimeCandidates(
  requestedFormat
) {
  switch (requestedFormat) {
    case "mp4":
      return [
        'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
        "video/mp4"
      ];

    case "webm-vp8":
      return [
        "video/webm;codecs=vp8,opus",
        "video/webm"
      ];

    case "webm":
      return [
        "video/webm"
      ];

    case "webm-vp9":
    default:
      return [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm"
      ];
  }
}


function getSupportedMimeType(
  requestedFormat
) {
  if (
    typeof MediaRecorder ===
    "undefined"
  ) {
    return "";
  }

  const candidates =
    getMimeCandidates(
      requestedFormat
    );

  for (
    const mimeType of candidates
  ) {
    try {
      if (
        MediaRecorder.isTypeSupported(
          mimeType
        )
      ) {
        return mimeType;
      }
    } catch {
      /* Continue */
    }
  }

  return "";
}


/* =========================================================
   RECORDING AUDIO PREPARATION
   ========================================================= */

async function prepareRecordingAudio() {
  try {
    await ensureAudioContext();

    /*
      Make sure main video audio is connected.
    */

    if (
      el.mainVideo?.src &&
      !state.mainVideoSourceNode
    ) {
      await setupMainVideoAudio();
    }

    /*
      Start microphone automatically if enabled
      and no stream exists.
    */

    if (
      el.micEnabled?.checked &&
      !state.micStream
    ) {
      await startMicrophone();
    }

    /*
      If mic is disabled, no mic track is added.
    */

  } catch (error) {
    console.warn(
      "Recording audio preparation failed:",
      error
    );
  }
}


/* =========================================================
   RECORDING START
   ========================================================= */

async function startRecording() {
  if (
    state.recordingState ===
    "recording"
  ) {
    return;
  }

  if (
    state.recordingState ===
    "paused"
  ) {
    resumeRecording();
    return;
  }

  if (
    typeof MediaRecorder ===
    "undefined"
  ) {
    showToast(
      "MediaRecorder is not supported by this browser.",
      "error"
    );
    return;
  }

  try {
    closeModal(
      el.recordingPreviewModal
    );

    applyRecordingSettingsFromUI();

    await prepareRecordingAudio();

    /*
      Camera is optional.
      Main source is also optional.
      The studio can record an empty stage.
    */

    renderCompositionFrame();

    const canvasStream =
      state.compositionCanvas.captureStream(
        state.outputFps
      );

    const tracks = [
      ...canvasStream.getVideoTracks()
    ];

    /*
      Audio comes from Web Audio destination.
    */

    if (
      state.mediaDestination
    ) {
      state.mediaDestination
        .stream
        .getAudioTracks()
        .forEach(
          (track) => {
            tracks.push(track);
          }
        );
    }

    const recordingStream =
      new MediaStream(
        tracks
      );

    const requestedFormat =
      el.recordingFormatSide?.value ||
      state.selectedRecordingFormat;

    const mimeType =
      getSupportedMimeType(
        requestedFormat
      );

    if (!mimeType) {
      if (
        requestedFormat ===
        "mp4"
      ) {
        showToast(
          "MP4 recording is not supported by this browser. Please select WebM.",
          "warning",
          5000
        );
      } else {
        showToast(
          "No supported recording format was found.",
          "error"
        );
      }

      tracks.forEach(
        (track) => {
          try {
            track.stop();
          } catch {
            /* Ignore */
          }
        }
      );

      return;
    }

    state.recordingMimeType =
      mimeType;

    const options = {
      mimeType,
      videoBitsPerSecond:
        getVideoBitrate(
          state.recordingWidth,
          state.recordingHeight,
          state.outputFps
        )
    };

    /*
      Some browsers reject videoBitsPerSecond.
      Retry with mimeType only if necessary.
    */

    let recorder;

    try {
      recorder =
        new MediaRecorder(
          recordingStream,
          options
        );
    } catch (firstError) {
      console.warn(
        "MediaRecorder options failed:",
        firstError
      );

      recorder =
        new MediaRecorder(
          recordingStream,
          {
            mimeType
          }
        );
    }

    state.mediaRecorder =
      recorder;

    state.recordingChunks = [];

    recorder.ondataavailable =
      (event) => {
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
      (event) => {
        console.error(
          "MediaRecorder error:",
          event
        );

        showToast(
          "Recording error occurred.",
          "error"
        );
      };

    recorder.onstart = () => {
      state.recordingState =
        "recording";

      state.recordingStartedAt =
        performance.now();

      state.recordingElapsed =
        0;

      state.recordingPausedAt =
        0;

      startRecordingTimer();
      updateRecordingUI();

      if (
        state.autoStartTeleprompter &&
        state.teleprompterText.trim()
      ) {
        playTeleprompter();
      }

      startRenderLoop();
    };

    recorder.onpause = () => {
      state.recordingState =
        "paused";

      state.recordingPausedAt =
        performance.now();

      updateRecordingUI();
    };

    recorder.onresume = () => {
      state.recordingState =
        "recording";

      if (
        state.recordingPausedAt
      ) {
        const pausedDuration =
          performance.now() -
          state.recordingPausedAt;

        state.recordingStartedAt +=
          pausedDuration;
      }

      state.recordingPausedAt =
        0;

      updateRecordingUI();
    };

    recorder.onstop = async () => {
      await finalizeRecording();

      recordingStream
        .getTracks()
        .forEach(
          (track) => {
            try {
              track.stop();
            } catch {
              /* Ignore */
            }
          }
        );
    };

    /*
      timeslice keeps memory manageable and
      provides chunks periodically.
    */

    recorder.start(1000);

    showToast(
      `Recording started — ${state.recordingWidth}×${state.recordingHeight} @ ${state.outputFps} FPS`,
      "success"
    );

  } catch (error) {
    console.error(
      "Recording start failed:",
      error
    );

    state.recordingState =
      "idle";

    updateRecordingUI();

    showToast(
      `Unable to start recording: ${error.message || error}`,
      "error",
      5000
    );
  }
}


function applyRecordingSettingsFromUI() {
  state.selectedRecordingQuality =
    el.recordingQualitySide?.value ||
    state.selectedRecordingQuality ||
    "1080p";

  state.selectedRecordingFps =
    numberOr(
      el.recordingFpsSide?.value,
      state.selectedRecordingFps || 30
    );

  state.selectedRecordingFormat =
    el.recordingFormatSide?.value ||
    state.selectedRecordingFormat ||
    "webm-vp9";

  const dimensions =
    getResolutionDimensions(
      state.selectedRecordingQuality
    );

  state.outputWidth =
    dimensions.width;

  state.outputHeight =
    dimensions.height;

  state.outputFps =
    state.selectedRecordingFps;

  state.recordingWidth =
    dimensions.width;

  state.recordingHeight =
    dimensions.height;

  if (
    state.compositionCanvas.width !==
      state.outputWidth ||
    state.compositionCanvas.height !==
      state.outputHeight
  ) {
    state.compositionCanvas.width =
      state.outputWidth;

    state.compositionCanvas.height =
      state.outputHeight;
  }

  updateStageBadges();
}


function getVideoBitrate(
  width,
  height,
  fps
) {
  const pixels =
    width * height;

  if (pixels >= 2560 * 1440) {
    return 24_000_000;
  }

  if (pixels >= 1920 * 1080) {
    return fps >= 60
      ? 20_000_000
      : 14_000_000;
  }

  if (pixels >= 1280 * 720) {
    return fps >= 60
      ? 10_000_000
      : 8_000_000;
  }

  return 5_000_000;
}


/* =========================================================
   RECORDING PAUSE
   ========================================================= */

function pauseRecording() {
  if (
    !state.mediaRecorder ||
    state.mediaRecorder.state !==
      "recording"
  ) {
    return;
  }

  try {
    state.mediaRecorder.pause();

    if (
      el.mainVideo &&
      isMediaPlaying(el.mainVideo)
    ) {
      el.mainVideo.pause();
    }

    if (
      state.mentorSourceType ===
        "video" &&
      el.mentorVideo &&
      isMediaPlaying(el.mentorVideo)
    ) {
      el.mentorVideo.pause();
    }

    pauseTeleprompter();

  } catch (error) {
    console.error(
      "Pause recording failed:",
      error
    );
  }
}


/* =========================================================
   RECORDING RESUME
   ========================================================= */

function resumeRecording() {
  if (
    !state.mediaRecorder ||
    state.mediaRecorder.state !==
      "paused"
  ) {
    return;
  }

  try {
    state.mediaRecorder.resume();

    if (
      el.mainVideo &&
      state.mainSourceType ===
        "video"
    ) {
      el.mainVideo
        .play()
        .catch(() => {});
    }

    if (
      state.mentorSourceType ===
        "video" &&
      el.mentorVideo
    ) {
      el.mentorVideo
        .play()
        .catch(() => {});
    }

    if (
      state.teleprompterText.trim()
    ) {
      playTeleprompter();
    }

  } catch (error) {
    console.error(
      "Resume recording failed:",
      error
    );
  }
}


/* =========================================================
   RECORDING STOP
   ========================================================= */

function stopRecording() {
  if (!state.mediaRecorder) {
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
  } catch (error) {
    console.error(
      "Stop recording failed:",
      error
    );
  }
}


/* =========================================================
   RECORDING TIMER
   ========================================================= */

function startRecordingTimer() {
  stopRecordingTimer();

  state.recordingTimerId =
    setInterval(() => {
      if (
        state.recordingState !==
        "recording"
      ) {
        return;
      }

      state.recordingElapsed =
        (
          performance.now() -
          state.recordingStartedAt
        ) / 1000;

      updateRecordingTimerUI();
    }, 100);
}


function stopRecordingTimer() {
  if (
    state.recordingTimerId
  ) {
    clearInterval(
      state.recordingTimerId
    );

    state.recordingTimerId =
      null;
  }
}


function updateRecordingTimerUI() {
  const value =
    formatTime(
      state.recordingElapsed
    );

  if (el.recordingTimer) {
    el.recordingTimer.textContent =
      value;
  }

  if (el.recordingOverlayTimer) {
    el.recordingOverlayTimer.textContent =
      value;
  }
}


/* =========================================================
   RECORDING UI
   ========================================================= */

function updateRecordingUI() {
  const recording =
    state.recordingState ===
    "recording";

  const paused =
    state.recordingState ===
    "paused";

  const active =
    recording ||
    paused;

  if (el.recordingStatusBar) {
    el.recordingStatusBar.classList.toggle(
      "is-recording",
      recording
    );

    el.recordingStatusBar.classList.toggle(
      "is-paused",
      paused
    );
  }

  if (el.recordingStatusDot) {
    el.recordingStatusDot.classList.toggle(
      "active",
      recording
    );

    el.recordingStatusDot.classList.toggle(
      "paused",
      paused
    );
  }

  if (el.recordingStatusText) {
    el.recordingStatusText.textContent =
      recording
        ? "Recording"
        : paused
          ? "Paused"
          : "Ready";
  }

  if (el.pauseRecordingBtn) {
    el.pauseRecordingBtn.disabled =
      !recording;
  }

  if (el.resumeRecordingBtn) {
    el.resumeRecordingBtn.disabled =
      !paused;
  }

  if (el.stopRecordingBtn) {
    el.stopRecordingBtn.disabled =
      !active;
  }

  if (el.recordBtn) {
    el.recordBtn.classList.toggle(
      "is-recording",
      active
    );

    if (recording) {
      el.recordBtn.setAttribute(
        "aria-label",
        "Pause recording"
      );
    } else if (paused) {
      el.recordBtn.setAttribute(
        "aria-label",
        "Resume recording"
      );
    } else {
      el.recordBtn.setAttribute(
        "aria-label",
        "Start recording"
      );
    }
  }

  if (el.recordToolbarBtn) {
    el.recordToolbarBtn.classList.toggle(
      "is-recording",
      active
    );
  }

  if (el.recordingOverlay) {
    el.recordingOverlay.hidden =
      !recording;
  }

  updateRecordingTimerUI();
}


/* =========================================================
   FINALIZE RECORDING
   ========================================================= */

async function finalizeRecording() {
  stopRecordingTimer();

  state.recordingState =
    "idle";

  updateRecordingUI();

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

  state.recordingChunks = [];

  if (!blob.size) {
    showToast(
      "Recording produced an empty file.",
      "error"
    );

    return;
  }

  state.recordingBlob =
    blob;

  revokeObjectUrl(
    state.recordingObjectUrl
  );

  state.recordingObjectUrl =
    URL.createObjectURL(
      blob
    );

  const baseName =
    sanitizeFileName(
      el.recordingFileNameSide?.value ||
      el.recordingFileName?.value ||
      defaultRecordingName()
    ) ||
    defaultRecordingName();

  state.recordingFileName =
    baseName;

  if (el.recordingFileName) {
    el.recordingFileName.value =
      baseName;
  }

  /*
    Save metadata and actual Blob
    into IndexedDB.
  */

  const recording = {
    id:
      createId(),

    name:
      baseName,

    createdAt:
      Date.now(),

    duration:
      state.recordingElapsed,

    size:
      blob.size,

    mimeType:
      blob.type,

    width:
      state.recordingWidth,

    height:
      state.recordingHeight,

    fps:
      state.outputFps
  };

  try {
    await saveRecordingToDB(
      recording,
      blob
    );

    state.previewRecordingId =
      recording.id;

  } catch (error) {
    console.warn(
      "IndexedDB save failed:",
      error
    );
  }

  resetPreviewTrim();

  await openRecordingPreview(
    blob,
    recording
  );

  showToast(
    `Recording saved — ${formatFileSize(blob.size)}`,
    "success",
    4500
  );

  updateRecordingHistory();
}


/* =========================================================
   CREATE ID
   ========================================================= */

function createId() {
  if (
    crypto?.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .slice(2)
  );
}


/* =========================================================
   RECORDING PREVIEW
   ========================================================= */

async function openRecordingPreview(
  blob,
  metadata = null
) {
  if (!blob) {
    return;
  }

  state.previewOriginalBlob =
    blob;

  state.previewTrimmedBlob =
    null;

  revokeObjectUrl(
    state.previewTrimmedObjectUrl
  );

  state.previewTrimmedObjectUrl =
    null;

  const url =
    URL.createObjectURL(
      blob
    );

  if (
    el.recordingPreviewVideo
  ) {
    revokeObjectUrl(
      state.previewObjectUrl
    );

    state.previewObjectUrl =
      url;

    el.recordingPreviewVideo.src =
      url;

    el.recordingPreviewVideo.load();

    el.recordingPreviewVideo.onloadedmetadata =
      () => {
        const duration =
          el.recordingPreviewVideo.duration;

        state.previewTrimStart =
          0;

        state.previewTrimEnd =
          Number.isFinite(duration)
            ? duration
            : 0;

        updatePreviewDurationUI();

        updateTrimUI();

        updatePreviewInfo(
          blob,
          metadata
        );
      };

    el.recordingPreviewVideo.ontimeupdate =
      () => {
        updatePreviewCurrentTimeUI();
      };
  }

  if (
    el.recordingFileName
  ) {
    el.recordingFileName.value =
      metadata?.name ||
      state.recordingFileName ||
      defaultRecordingName();
  }

  openModal(
    el.recordingPreviewModal
  );

  updateRecordingHistory();
}


function updatePreviewInfo(
  blob,
  metadata
) {
  if (!el.recordingFileInfo) {
    return;
  }

  const width =
    metadata?.width ||
    state.recordingWidth;

  const height =
    metadata?.height ||
    state.recordingHeight;

  const fps =
    metadata?.fps ||
    state.outputFps;

  const mime =
    metadata?.mimeType ||
    blob.type ||
    "video/webm";

  el.recordingFileInfo.innerHTML = `
    <div class="recording-info-row">
      <span>File</span>
      <strong>${escapeHtml(
        metadata?.name ||
        state.recordingFileName ||
        "Recording"
      )}</strong>
    </div>

    <div class="recording-info-row">
      <span>Size</span>
      <strong>${escapeHtml(
        formatFileSize(blob.size)
      )}</strong>
    </div>

    <div class="recording-info-row">
      <span>Resolution</span>
      <strong>${width} × ${height}</strong>
    </div>

    <div class="recording-info-row">
      <span>FPS</span>
      <strong>${fps}</strong>
    </div>

    <div class="recording-info-row">
      <span>Format</span>
      <strong>${escapeHtml(
        mime
      )}</strong>
    </div>
  `;
}


function updatePreviewDurationUI() {
  if (
    !el.recordingPreviewVideo
  ) {
    return;
  }

  const duration =
    Number.isFinite(
      el.recordingPreviewVideo.duration
    )
      ? el.recordingPreviewVideo.duration
      : 0;

  if (el.recordingDuration) {
    el.recordingDuration.textContent =
      formatTime(duration);
  }
}


function updatePreviewCurrentTimeUI() {
  if (
    !el.recordingPreviewVideo
  ) {
    return;
  }

  const current =
    el.recordingPreviewVideo.currentTime ||
    0;

  if (el.recordingCurrentTime) {
    el.recordingCurrentTime.textContent =
      formatTime(current);
  }
}


/* =========================================================
   PREVIEW PLAY / PAUSE
   ========================================================= */

function playRecordingPreview() {
  if (!el.recordingPreviewVideo) {
    return;
  }

  el.recordingPreviewVideo
    .play()
    .catch(() => {});
}


function pauseRecordingPreview() {
  if (!el.recordingPreviewVideo) {
    return;
  }

  el.recordingPreviewVideo.pause();
}


/* =========================================================
   TRIM UI
   ========================================================= */

function resetPreviewTrim() {
  const duration =
    el.recordingPreviewVideo &&
    Number.isFinite(
      el.recordingPreviewVideo.duration
    )
      ? el.recordingPreviewVideo.duration
      : state.recordingElapsed;

  state.previewTrimStart =
    0;

  state.previewTrimEnd =
    Math.max(
      0,
      duration
    );

  updateTrimUI();
}


function updateTrimUI() {
  const duration =
    Number.isFinite(
      el.recordingPreviewVideo?.duration
    )
      ? el.recordingPreviewVideo.duration
      : state.previewTrimEnd;

  if (
    el.recordingTrimStart
  ) {
    el.recordingTrimStart.min =
      "0";

    el.recordingTrimStart.max =
      String(duration);

    el.recordingTrimStart.step =
      "0.1";

    el.recordingTrimStart.value =
      String(
        clamp(
          state.previewTrimStart,
          0,
          duration
        )
      );
  }

  if (
    el.recordingTrimEnd
  ) {
    el.recordingTrimEnd.min =
      "0";

    el.recordingTrimEnd.max =
      String(duration);

    el.recordingTrimEnd.step =
      "0.1";

    el.recordingTrimEnd.value =
      String(
        clamp(
          state.previewTrimEnd,
          0,
          duration
        )
      );
  }

  if (
    el.recordingTrimStartTime
  ) {
    el.recordingTrimStartTime.textContent =
      formatTime(
        state.previewTrimStart
      );
  }

  if (
    el.recordingTrimEndTime
  ) {
    el.recordingTrimEndTime.textContent =
      formatTime(
        state.previewTrimEnd
      );
  }
}


function updateTrimFromInputs() {
  let start =
    numberOr(
      el.recordingTrimStart?.value,
      0
    );

  let end =
    numberOr(
      el.recordingTrimEnd?.value,
      state.previewTrimEnd
    );

  const duration =
    Number.isFinite(
      el.recordingPreviewVideo?.duration
    )
      ? el.recordingPreviewVideo.duration
      : state.previewTrimEnd;

  start =
    clamp(
      start,
      0,
      Math.max(
        0,
        duration - 0.1
      )
    );

  end =
    clamp(
      end,
      start + 0.1,
      duration
    );

  state.previewTrimStart =
    start;

  state.previewTrimEnd =
    end;

  updateTrimUI();

  if (
    el.recordingPreviewVideo
  ) {
    el.recordingPreviewVideo.currentTime =
      start;
  }
}


/* =========================================================
   APPLY TRIM
   ========================================================= */

async function applyTrim() {
  if (
    !state.previewOriginalBlob ||
    !el.recordingPreviewVideo
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
      "warning"
    );
    return;
  }

  /*
    Important:
    A MediaRecorder Blob cannot be physically
    trimmed by changing currentTime.

    To create a real trimmed file we need to
    decode/re-encode the media.

    Browser support for direct WebCodecs/
    MP4 re-encoding varies.

    Therefore this implementation uses a
    browser-safe canvas re-recording for
    video frames. Audio preservation is not
    guaranteed in every browser.

    The original recording remains untouched.
  */

  showToast(
    "Creating trimmed copy. This may take a moment.",
    "info",
    4000
  );

  try {
    const trimmed =
      await createTrimmedRecording(
        state.previewOriginalBlob,
        start,
        end
      );

    if (!trimmed) {
      throw new Error(
        "Trim operation failed."
      );
    }

    state.previewTrimmedBlob =
      trimmed;

    revokeObjectUrl(
      state.previewTrimmedObjectUrl
    );

    state.previewTrimmedObjectUrl =
      URL.createObjectURL(
        trimmed
      );

    el.recordingPreviewVideo.src =
      state.previewTrimmedObjectUrl;

    el.recordingPreviewVideo.load();

    el.recordingPreviewVideo.onloadedmetadata =
      () => {
        updatePreviewDurationUI();

        state.previewTrimStart =
          0;

        state.previewTrimEnd =
          el.recordingPreviewVideo.duration;

        updateTrimUI();
      };

    showToast(
      "Trimmed copy created.",
      "success"
    );

  } catch (error) {
    console.error(
      "Trim failed:",
      error
    );

    /*
      Restore original preview.
    */

    if (
      state.previewObjectUrl
    ) {
      el.recordingPreviewVideo.src =
        state.previewObjectUrl;

      el.recordingPreviewVideo.load();
    }

    showToast(
      "This browser could not create a trimmed copy. The original recording is still safe.",
      "warning",
      5000
    );
  }
}


/* =========================================================
   CANVAS TRIM RECORDER
   ========================================================= */

async function createTrimmedRecording(
  blob,
  start,
  end
) {
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

  video.preload =
    "auto";

  await waitForMetadata(
    video
  );

  const width =
    video.videoWidth ||
    state.recordingWidth ||
    1920;

  const height =
    video.videoHeight ||
    state.recordingHeight ||
    1080;

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    width;

  canvas.height =
    height;

  const ctx =
    canvas.getContext("2d");

  const fps =
    state.outputFps ||
    30;

  const stream =
    canvas.captureStream(
      fps
    );

  const mime =
    getSupportedMimeType(
      "webm-vp9"
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
    (event) => {
      if (
        event.data &&
        event.data.size
      ) {
        chunks.push(
          event.data
        );
      }
    };

  const stopped =
    new Promise(
      (resolve) => {
        recorder.onstop =
          resolve;
      }
    );

  video.currentTime =
    start;

  await waitForVideoSeek(
    video
  );

  recorder.start(250);

  await video.play();

  while (
    video.currentTime <
    end
  ) {
    ctx.drawImage(
      video,
      0,
      0,
      width,
      height
    );

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          1000 / fps
        )
    );
  }

  video.pause();

  recorder.stop();

  await stopped;

  stream
    .getTracks()
    .forEach(
      (track) => {
        try {
          track.stop();
        } catch {
          /* Ignore */
        }
      }
    );

  URL.revokeObjectURL(
    sourceUrl
  );

  return new Blob(
    chunks,
    {
      type: mime
    }
  );
}


function waitForMetadata(
  video
) {
  return new Promise(
    (resolve, reject) => {
      if (
        video.readyState >=
        HTMLMediaElement.HAVE_METADATA
      ) {
        resolve();
        return;
      }

      const onLoaded = () => {
        cleanup();
        resolve();
      };

      const onError = () => {
        cleanup();
        reject(
          new Error(
            "Unable to load video."
          )
        );
      };

      const cleanup = () => {
        video.removeEventListener(
          "loadedmetadata",
          onLoaded
        );

        video.removeEventListener(
          "error",
          onError
        );
      };

      video.addEventListener(
        "loadedmetadata",
        onLoaded
      );

      video.addEventListener(
        "error",
        onError
      );
    }
  );
}


function waitForVideoSeek(
  video
) {
  return new Promise(
    (resolve) => {
      const done = () => {
        video.removeEventListener(
          "seeked",
          done
        );

        resolve();
      };

      video.addEventListener(
        "seeked",
        done,
        {
          once: true
        }
      );
    }
  );
}


/* =========================================================
   RENAME RECORDING
   ========================================================= */

async function renameCurrentRecording() {
  if (
    !state.previewRecordingId
  ) {
    return;
  }

  const input =
    el.recordingFileName;

  if (!input) {
    return;
  }

  const newName =
    sanitizeFileName(
      input.value
    );

  if (!newName) {
    showToast(
      "Please enter a valid file name.",
      "warning"
    );
    return;
  }

  try {
    const record =
      await getRecordingFromDB(
        state.previewRecordingId
      );

    if (!record) {
      showToast(
        "Recording metadata was not found.",
        "error"
      );
      return;
    }

    record.name =
      newName;

    await saveRecordingMetadata(
      record
    );

    state.recordingFileName =
      newName;

    if (
      el.recordingFileNameSide
    ) {
      el.recordingFileNameSide.value =
        newName;
    }

    showToast(
      "Recording renamed.",
      "success"
    );

    await updateRecordingHistory();

  } catch (error) {
    console.error(
      "Rename failed:",
      error
    );

    showToast(
      "Unable to rename recording.",
      "error"
    );
  }
}


/* =========================================================
   DOWNLOAD RECORDING
   ========================================================= */

function getDownloadBlob() {
  return (
    state.previewTrimmedBlob ||
    state.recordingBlob ||
    state.previewOriginalBlob
  );
}


async function downloadCurrentRecording() {
  let blob =
    getDownloadBlob();

  if (
    !blob &&
    state.previewRecordingId
  ) {
    const record =
      await getRecordingFromDB(
        state.previewRecordingId
      );

    if (record?.blob) {
      blob =
        record.blob;
    }
  }

  if (!blob) {
    showToast(
      "No recording is available.",
      "warning"
    );
    return;
  }

  const name =
    sanitizeFileName(
      el.recordingFileName?.value ||
      state.recordingFileName ||
      defaultRecordingName()
    ) ||
    defaultRecordingName();

  const extension =
    getFileExtension(
      blob.type
    );

  const filename =
    `${name}.${extension}`;

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

  showToast(
    "Download started.",
    "success"
  );
}


function getFileExtension(
  mimeType
) {
  const mime =
    safeText(
      mimeType
    ).toLowerCase();

  if (
    mime.includes("mp4")
  ) {
    return "mp4";
  }

  if (
    mime.includes("webm")
  ) {
    return "webm";
  }

  return "webm";
}


/* =========================================================
   DELETE CURRENT RECORDING
   ========================================================= */

async function deleteCurrentRecording() {
  if (
    !state.previewRecordingId
  ) {
    showToast(
      "No recording selected.",
      "warning"
    );
    return;
  }

  const confirmed =
    window.confirm(
      "Delete this recording permanently?"
    );

  if (!confirmed) {
    return;
  }

  try {
    await deleteRecordingFromDB(
      state.previewRecordingId
    );

    state.previewRecordingId =
      null;

    state.previewOriginalBlob =
      null;

    state.previewTrimmedBlob =
      null;

    state.recordingBlob =
      null;

    revokeObjectUrl(
      state.recordingObjectUrl
    );

    state.recordingObjectUrl =
      null;

    closeModal(
      el.recordingPreviewModal
    );

    await updateRecordingHistory();

    showToast(
      "Recording deleted.",
      "success"
    );

  } catch (error) {
    console.error(
      "Delete recording failed:",
      error
    );

    showToast(
      "Unable to delete recording.",
      "error"
    );
  }
}


/* =========================================================
   RECORD AGAIN
   ========================================================= */

function recordAgain() {
  closeModal(
    el.recordingPreviewModal
  );

  resetPreviewTrim();

  startRecording();
}


/* =========================================================
   INDEXED DB OPEN
   ========================================================= */

function openDatabase() {
  return new Promise(
    (resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(
          new Error(
            "IndexedDB is not supported."
          )
        );
        return;
      }

      const request =
        indexedDB.open(
          DB_CONFIG.name,
          DB_CONFIG.version
        );

      request.onupgradeneeded =
        () => {
          const db =
            request.result;

          if (
            !db.objectStoreNames.contains(
              DB_CONFIG.store
            )
          ) {
            const store =
              db.createObjectStore(
                DB_CONFIG.store,
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
        () => {
          resolve(
            request.result
          );
        };

      request.onerror =
        () => {
          reject(
            request.error ||
            new Error(
              "IndexedDB failed."
            )
          );
        };
    }
  );
}


async function initDatabase() {
  try {
    state.db =
      await openDatabase();

    state.dbReady =
      true;

    await updateRecordingHistory();

  } catch (error) {
    console.warn(
      "IndexedDB unavailable:",
      error
    );

    state.dbReady =
      false;
  }
}


/* =========================================================
   INDEXED DB SAVE
   ========================================================= */

function saveRecordingToDB(
  metadata,
  blob
) {
  return new Promise(
    async (resolve, reject) => {
      try {
        if (!state.dbReady) {
          await initDatabase();
        }

        if (!state.db) {
          reject(
            new Error(
              "Database unavailable."
            )
          );
          return;
        }

        const transaction =
          state.db.transaction(
            DB_CONFIG.store,
            "readwrite"
          );

        const store =
          transaction.objectStore(
            DB_CONFIG.store
          );

        store.put({
          ...metadata,
          blob
        });

        transaction.oncomplete =
          () => {
            resolve();
          };

        transaction.onerror =
          () => {
            reject(
              transaction.error
            );
          };

      } catch (error) {
        reject(error);
      }
    }
  );
}


function saveRecordingMetadata(
  metadata
) {
  return new Promise(
    async (resolve, reject) => {
      try {
        if (!state.dbReady) {
          await initDatabase();
        }

        const existing =
          await getRecordingFromDB(
            metadata.id
          );

        if (!existing) {
          reject(
            new Error(
              "Recording not found."
            )
          );
          return;
        }

        const updated = {
          ...existing,
          ...metadata
        };

        const transaction =
          state.db.transaction(
            DB_CONFIG.store,
            "readwrite"
          );

        transaction
          .objectStore(
            DB_CONFIG.store
          )
          .put(updated);

        transaction.oncomplete =
          () => resolve();

        transaction.onerror =
          () =>
            reject(
              transaction.error
            );

      } catch (error) {
        reject(error);
      }
    }
  );
}


/* =========================================================
   INDEXED DB GET
   ========================================================= */

function getRecordingFromDB(
  id
) {
  return new Promise(
    async (resolve, reject) => {
      try {
        if (!state.dbReady) {
          await initDatabase();
        }

        if (!state.db) {
          resolve(null);
          return;
        }

        const transaction =
          state.db.transaction(
            DB_CONFIG.store,
            "readonly"
          );

        const request =
          transaction
            .objectStore(
              DB_CONFIG.store
            )
            .get(id);

        request.onsuccess =
          () => {
            resolve(
              request.result ||
              null
            );
          };

        request.onerror =
          () => {
            reject(
              request.error
            );
          };

      } catch (error) {
        reject(error);
      }
    }
  );
}


/* =========================================================
   INDEXED DB LIST
   ========================================================= */

function getAllRecordingsFromDB() {
  return new Promise(
    async (resolve, reject) => {
      try {
        if (!state.dbReady) {
          await initDatabase();
        }

        if (!state.db) {
          resolve([]);
          return;
        }

        const transaction =
          state.db.transaction(
            DB_CONFIG.store,
            "readonly"
          );

        const request =
          transaction
            .objectStore(
              DB_CONFIG.store
            )
            .getAll();

        request.onsuccess =
          () => {
            const records =
              request.result || [];

            records.sort(
              (a, b) =>
                b.createdAt -
                a.createdAt
            );

            resolve(
              records
            );
          };

        request.onerror =
          () => {
            reject(
              request.error
            );
          };

      } catch (error) {
        reject(error);
      }
    }
  );
}


/* =========================================================
   INDEXED DB DELETE
   ========================================================= */

function deleteRecordingFromDB(
  id
) {
  return new Promise(
    async (resolve, reject) => {
      try {
        if (!state.dbReady) {
          await initDatabase();
        }

        if (!state.db) {
          reject(
            new Error(
              "Database unavailable."
            )
          );
          return;
        }

        const transaction =
          state.db.transaction(
            DB_CONFIG.store,
            "readwrite"
          );

        transaction
          .objectStore(
            DB_CONFIG.store
          )
          .delete(id);

        transaction.oncomplete =
          () => resolve();

        transaction.onerror =
          () =>
            reject(
              transaction.error
            );

      } catch (error) {
        reject(error);
      }
    }
  );
}


/* =========================================================
   CLEAR RECORDING HISTORY
   ========================================================= */

async function clearRecordingHistory() {
  const confirmed =
    window.confirm(
      "Delete all saved recordings?"
    );

  if (!confirmed) {
    return;
  }

  try {
    if (!state.dbReady) {
      await initDatabase();
    }

    if (!state.db) {
      return;
    }

    await new Promise(
      (resolve, reject) => {
        const transaction =
          state.db.transaction(
            DB_CONFIG.store,
            "readwrite"
          );

        transaction
          .objectStore(
            DB_CONFIG.store
          )
          .clear();

        transaction.oncomplete =
          resolve;

        transaction.onerror =
          () =>
            reject(
              transaction.error
            );
      }
    );

    closeModal(
      el.recordingPreviewModal
    );

    state.previewRecordingId =
      null;

    showToast(
      "Recording history cleared.",
      "success"
    );

    await updateRecordingHistory();

  } catch (error) {
    console.error(
      "Clear history failed:",
      error
    );

    showToast(
      "Unable to clear recording history.",
      "error"
    );
  }
}


/* =========================================================
   RECORDING HISTORY UI
   ========================================================= */

async function updateRecordingHistory() {
  if (!el.recordingHistoryList) {
    return;
  }

  let recordings = [];

  try {
    recordings =
      await getAllRecordingsFromDB();
  } catch (error) {
    console.warn(
      "Unable to load recording history:",
      error
    );
  }

  if (!recordings.length) {
    el.recordingHistoryList.innerHTML = `
      <div class="history-empty">
        <strong>No recordings yet</strong>
        <span>Your saved recordings will appear here.</span>
      </div>
    `;

    return;
  }

  el.recordingHistoryList.innerHTML =
    recordings
      .map(
        (recording) =>
          createRecordingHistoryItem(
            recording
          )
      )
      .join("");

  qsa(
    "[data-history-preview]",
    el.recordingHistoryList
  ).forEach((button) => {
    button.addEventListener(
      "click",
      async () => {
        const id =
          button.dataset.historyPreview;

        const record =
          await getRecordingFromDB(
            id
          );

        if (
          record?.blob
        ) {
          state.previewRecordingId =
            id;

          state.recordingBlob =
            record.blob;

          state.recordingFileName =
            record.name;

          await openRecordingPreview(
            record.blob,
            record
          );
        }
      }
    );
  });

  qsa(
    "[data-history-download]",
    el.recordingHistoryList
  ).forEach((button) => {
    button.addEventListener(
      "click",
      async () => {
        const id =
          button.dataset.historyDownload;

        const record =
          await getRecordingFromDB(
            id
          );

        if (
          record?.blob
        ) {
          downloadBlob(
            record.blob,
            record.name
          );
        }
      }
    );
  });

  qsa(
    "[data-history-delete]",
    el.recordingHistoryList
  ).forEach((button) => {
    button.addEventListener(
      "click",
      async () => {
        const id =
          button.dataset.historyDelete;

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

        if (
          state.previewRecordingId ===
          id
        ) {
          state.previewRecordingId =
            null;
        }

        await updateRecordingHistory();

        showToast(
          "Recording deleted.",
          "success"
        );
      }
    );
  });

  qsa(
    "[data-history-rename]",
    el.recordingHistoryList
  ).forEach((button) => {
    button.addEventListener(
      "click",
      async () => {
        const id =
          button.dataset.historyRename;

        const record =
          await getRecordingFromDB(
            id
          );

        if (!record) {
          return;
        }

        const name =
          window.prompt(
            "Enter new recording name:",
            record.name
          );

        if (
          name === null
        ) {
          return;
        }

        const cleanName =
          sanitizeFileName(
            name
          );

        if (!cleanName) {
          showToast(
            "Invalid file name.",
            "warning"
          );
          return;
        }

        record.name =
          cleanName;

        await saveRecordingMetadata(
          record
        );

        await updateRecordingHistory();

        showToast(
          "Recording renamed.",
          "success"
        );
      }
    );
  });
}


function createRecordingHistoryItem(
  recording
) {
  return `
    <div class="recording-history-item">

      <div class="recording-history-main">

        <div class="recording-history-icon">
          <span>▶</span>
        </div>

        <div class="recording-history-details">

          <strong>
            ${escapeHtml(
              recording.name ||
              "Untitled Recording"
            )}
          </strong>

          <span>
            ${formatDate(
              recording.createdAt
            )}
          </span>

          <span>
            ${formatTime(
              recording.duration || 0
            )}
            ·
            ${formatFileSize(
              recording.size || 0
            )}
            ·
            ${recording.width || 0}
            ×
            ${recording.height || 0}
          </span>

        </div>

      </div>

      <div class="recording-history-actions">

        <button
          type="button"
          class="btn btn-small"
          data-history-preview="${escapeHtml(
            recording.id
          )}"
        >
          Preview
        </button>

        <button
          type="button"
          class="btn btn-small"
          data-history-download="${escapeHtml(
            recording.id
          )}"
        >
          Download
        </button>

        <button
          type="button"
          class="btn btn-small"
          data-history-rename="${escapeHtml(
            recording.id
          )}"
        >
          Rename
        </button>

        <button
          type="button"
          class="btn btn-small danger"
          data-history-delete="${escapeHtml(
            recording.id
          )}"
        >
          Delete
        </button>

      </div>

    </div>
  `;
}


function downloadBlob(
  blob,
  name
) {
  const extension =
    getFileExtension(
      blob.type
    );

  const filename =
    `${sanitizeFileName(
      name || defaultRecordingName()
    )}.${extension}`;

  const url =
    URL.createObjectURL(
      blob
    );

  const a =
    document.createElement(
      "a"
    );

  a.href =
    url;

  a.download =
    filename;

  document.body.appendChild(
    a
  );

  a.click();

  a.remove();

  setTimeout(
    () =>
      URL.revokeObjectURL(
        url
      ),
    1000
  );
}


/* =========================================================
   TELEPROMPTER
   ========================================================= */

function loadTeleprompter() {
  const saved =
    loadJson(
      STORAGE.teleprompter,
      {}
    );

  state.teleprompterText =
    saved.text ||
    "";

  state.teleprompterSpeed =
    numberOr(
      saved.speed,
      1
    );

  state.teleprompterFontSize =
    numberOr(
      saved.fontSize,
      42
    );

  state.teleprompterOpacity =
    numberOr(
      saved.opacity,
      0.85
    );

  if (el.teleprompterText) {
    el.teleprompterText.value =
      state.teleprompterText;
  }

  if (el.teleprompterSpeed) {
    el.teleprompterSpeed.value =
      String(
        state.teleprompterSpeed
      );
  }

  if (el.teleprompterFontSize) {
    el.teleprompterFontSize.value =
      String(
        state.teleprompterFontSize
      );
  }

  if (el.teleprompterOpacity) {
    el.teleprompterOpacity.value =
      String(
        state.teleprompterOpacity
      );
  }

  updateTeleprompterPreview();
}


function saveTeleprompter() {
  state.teleprompterText =
    el.teleprompterText?.value ||
    "";

  state.teleprompterSpeed =
    numberOr(
      el.teleprompterSpeed?.value,
      1
    );

  state.teleprompterFontSize =
    numberOr(
      el.teleprompterFontSize?.value,
      42
    );

  state.teleprompterOpacity =
    numberOr(
      el.teleprompterOpacity?.value,
      0.85
    );

  saveJson(
    STORAGE.teleprompter,
    {
      text:
        state.teleprompterText,

      speed:
        state.teleprompterSpeed,

      fontSize:
        state.teleprompterFontSize,

      opacity:
        state.teleprompterOpacity
    }
  );

  updateTeleprompterPreview();

  showToast(
    "Teleprompter saved.",
    "success"
  );
}


function resetTeleprompter() {
  state.teleprompterText =
    "";

  state.teleprompterSpeed =
    1;

  state.teleprompterFontSize =
    42;

  state.teleprompterOpacity =
    0.85;

  state.teleprompterOffset =
    0;

  state.teleprompterPlaying =
    false;

  if (el.teleprompterText) {
    el.teleprompterText.value =
      "";
  }

  if (el.teleprompterSpeed) {
    el.teleprompterSpeed.value =
      "1";
  }

  if (el.teleprompterFontSize) {
    el.teleprompterFontSize.value =
      "42";
  }

  if (el.teleprompterOpacity) {
    el.teleprompterOpacity.value =
      "0.85";
  }

  saveJson(
    STORAGE.teleprompter,
    {}
  );

  updateTeleprompterPreview();

  showToast(
    "Teleprompter reset.",
    "info"
  );
}


function openTeleprompter() {
  loadTeleprompter();

  openModal(
    el.teleprompterModal
  );
}


function updateTeleprompterPreview() {
  if (
    !el.teleprompterPreview
  ) {
    return;
  }

  const text =
    el.teleprompterText?.value ||
    state.teleprompterText ||
    "Teleprompter preview";

  const speed =
    numberOr(
      el.teleprompterSpeed?.value,
      state.teleprompterSpeed
    );

  const fontSize =
    numberOr(
      el.teleprompterFontSize?.value,
      state.teleprompterFontSize
    );

  const opacity =
    numberOr(
      el.teleprompterOpacity?.value,
      state.teleprompterOpacity
    );

  el.teleprompterPreview.textContent =
    text;

  el.teleprompterPreview.style.fontSize =
    `${fontSize}px`;

  el.teleprompterPreview.style.opacity =
    String(opacity);

  el.teleprompterPreview.dataset.speed =
    String(speed);

  if (
    el.teleprompterMiniPreview
  ) {
    el.teleprompterMiniPreview.textContent =
      text ||
      "Teleprompter";
  }
}


function playTeleprompter() {
  state.teleprompterPlaying =
    true;

  state.teleprompterLastTime =
    performance.now();

  if (
    el.teleprompterPlayBtn
  ) {
    el.teleprompterPlayBtn.disabled =
      true;
  }

  if (
    el.teleprompterPauseBtn
  ) {
    el.teleprompterPauseBtn.disabled =
      false;
  }
}


function pauseTeleprompter() {
  state.teleprompterPlaying =
    false;

  if (
    el.teleprompterPlayBtn
  ) {
    el.teleprompterPlayBtn.disabled =
      false;
  }

  if (
    el.teleprompterPauseBtn
  ) {
    el.teleprompterPauseBtn.disabled =
      true;
  }
}


function updateTeleprompter() {
  if (
    !state.teleprompterPlaying
  ) {
    return;
  }

  const now =
    performance.now();

  const delta =
    Math.min(
      100,
      now -
        state.teleprompterLastTime
    );

  state.teleprompterLastTime =
    now;

  const speed =
    numberOr(
      el.teleprompterSpeed?.value,
      state.teleprompterSpeed
    );

  /*
    Slow smooth scrolling.
  */

  state.teleprompterOffset +=
    (delta / 1000) *
    speed *
    30;
}


/* =========================================================
   TELEPROMPTER TEXT FILE
   ========================================================= */

function handleTeleprompterFile(
  file
) {
  if (!file) {
    return;
  }

  if (
    !file.name
      .toLowerCase()
      .endsWith(".txt")
  ) {
    showToast(
      "Please select a TXT file.",
      "warning"
    );
    return;
  }

  const reader =
    new FileReader();

  reader.onload = () => {
    state.teleprompterText =
      String(
        reader.result || ""
      );

    if (
      el.teleprompterText
    ) {
      el.teleprompterText.value =
        state.teleprompterText;
    }

    updateTeleprompterPreview();

    showToast(
      "Teleprompter text loaded.",
      "success"
    );
  };

  reader.onerror = () => {
    showToast(
      "Unable to read text file.",
      "error"
    );
  };

  reader.readAsText(
    file,
    "UTF-8"
  );
}


/* =========================================================
   STUDENTS
   ========================================================= */

function loadStudents() {
  state.students =
    loadJson(
      STORAGE.students,
      []
    );

  if (
    !Array.isArray(
      state.students
    )
  ) {
    state.students = [];
  }

  renderStudents();
}


function saveStudents() {
  saveJson(
    STORAGE.students,
    state.students
  );
}


function renderStudents() {
  if (!el.studentsList) {
    return;
  }

  if (!state.students.length) {
    el.studentsList.innerHTML = `
      <div class="students-empty">
        <strong>No students added</strong>
        <span>Add students to your class workspace.</span>
      </div>
    `;

    return;
  }

  el.studentsList.innerHTML =
    state.students
      .map(
        (student) => `
          <div class="student-item">

            <div class="student-avatar">
              ${escapeHtml(
                (
                  student.name ||
                  "S"
                )
                  .trim()
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
              data-student-remove="${escapeHtml(
                student.id
              )}"
              aria-label="Remove student"
            >
              ×
            </button>

          </div>
        `
      )
      .join("");

  qsa(
    "[data-student-remove]",
    el.studentsList
  ).forEach(
    (button) => {
      button.addEventListener(
        "click",
        () => {
          removeStudent(
            button.dataset.studentRemove
          );
        }
      );
    }
  );
}


function addStudent(
  name
) {
  const cleanName =
    safeText(
      name
    ).trim();

  if (!cleanName) {
    return;
  }

  state.students.push({
    id: createId(),
    name: cleanName
  });

  saveStudents();
  renderStudents();
}


function removeStudent(
  id
) {
  state.students =
    state.students.filter(
      (student) =>
        student.id !== id
    );

  saveStudents();
  renderStudents();
}


function openStudentModal() {
  if (
    el.studentNameInput
  ) {
    el.studentNameInput.value =
      "";
  }

  openModal(
    el.studentModal
  );
}


/* =========================================================
   FILE INPUT HELPERS
   ========================================================= */

function clickInput(
  input
) {
  input?.click();
}


/* =========================================================
   FULLSCREEN
   ========================================================= */

async function toggleStageFullscreen() {
  if (
    !el.stageShell
  ) {
    return;
  }

  try {
    if (
      document.fullscreenElement
    ) {
      await document.exitFullscreen();
      return;
    }

    await el.stageShell.requestFullscreen();

  } catch (error) {
    console.warn(
      "Stage fullscreen failed:",
      error
    );

    showToast(
      "Fullscreen could not be opened.",
      "warning"
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

    await document.documentElement.requestFullscreen();

  } catch (error) {
    console.warn(
      "Studio fullscreen failed:",
      error
    );

    showToast(
      "Fullscreen could not be opened.",
      "warning"
    );
  }
}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

function handleKeyboardShortcut(
  event
) {
  if (
    event.target instanceof
      HTMLInputElement ||
    event.target instanceof
      HTMLTextAreaElement ||
    event.target instanceof
      HTMLSelectElement
  ) {
    return;
  }

  if (
    event.ctrlKey ||
    event.metaKey ||
    event.altKey
  ) {
    return;
  }

  const key =
    event.key.toLowerCase();

  switch (key) {
    case " ":
      event.preventDefault();

      if (
        state.recordingState ===
        "recording"
      ) {
        pauseRecording();
      } else if (
        state.recordingState ===
        "paused"
      ) {
        resumeRecording();
      } else if (
        el.mainVideo &&
        state.mainSourceType ===
          "video"
      ) {
        if (
          isMediaPlaying(
            el.mainVideo
          )
        ) {
          pauseMainVideo();
        } else {
          playMainVideo();
        }
      }

      break;

    case "r":
      event.preventDefault();

      if (
        state.recordingState ===
        "idle"
      ) {
        startRecording();
      }

      break;

    case "p":
      event.preventDefault();

      if (
        state.recordingState ===
        "recording"
      ) {
        pauseRecording();
      } else if (
        state.recordingState ===
        "paused"
      ) {
        resumeRecording();
      }

      break;

    case "s":
      event.preventDefault();

      if (
        state.recordingState ===
          "recording" ||
        state.recordingState ===
          "paused"
      ) {
        stopRecording();
      }

      break;

    case "f":
      event.preventDefault();

      toggleStageFullscreen();

      break;

    case "escape":
      closeAllModals();

      break;

    default:
      break;
  }
}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function bindEvents() {
  /* ---------- Main files ---------- */

  el.uploadMainBtn?.addEventListener(
    "click",
    () =>
      clickInput(
        el.mainFileInput
      )
  );

  el.uploadMainSideBtn?.addEventListener(
    "click",
    () =>
      clickInput(
        el.mainFileInput
      )
  );

  el.mainFileInput?.addEventListener(
    "change",
    () => {
      const file =
        el.mainFileInput.files?.[0];

      if (file) {
        handleMainImageFile(
          file
        );
      }

      el.mainFileInput.value =
        "";
    }
  );


  /* ---------- Main video ---------- */

  el.uploadVideoBtn?.addEventListener(
    "click",
    () =>
      clickInput(
        el.mainVideoInput
      )
  );

  el.uploadVideoSideBtn?.addEventListener(
    "click",
    () =>
      clickInput(
        el.mainVideoInput
      )
  );

  el.mainVideoInput?.addEventListener(
    "change",
    () => {
      const file =
        el.mainVideoInput.files?.[0];

      if (file) {
        handleMainVideoFile(
          file
        );
      }

      el.mainVideoInput.value =
        "";
    }
  );

  el.mainPlayBtn?.addEventListener(
    "click",
    playMainVideo
  );

  el.mainPauseBtn?.addEventListener(
    "click",
    pauseMainVideo
  );


  /* ---------- Mentor ---------- */

  el.uploadMentorBtn?.addEventListener(
    "click",
    () =>
      clickInput(
        el.mentorFileInput
      )
  );

  el.uploadMentorSideBtn?.addEventListener(
    "click",
    () =>
      clickInput(
        el.mentorFileInput
      )
  );

  el.uploadMentorFileSideBtn?.addEventListener(
    "click",
    () =>
      clickInput(
        el.mentorFileInput
      )
  );

  el.mentorFileInput?.addEventListener(
    "change",
    () => {
      const file =
        el.mentorFileInput.files?.[0];

      if (file) {
        handleMentorVideoFile(
          file
        );
      }

      el.mentorFileInput.value =
        "";
    }
  );


  /* ---------- Camera ---------- */

  el.startCameraBtn?.addEventListener(
    "click",
    startCamera
  );

  el.startCameraSideBtn?.addEventListener(
    "click",
    startCamera
  );

  el.stopCameraBtn?.addEventListener(
    "click",
    () =>
      stopCamera(true)
  );

  el.stopCameraSideBtn?.addEventListener(
    "click",
    () =>
      stopCamera(true)
  );

  el.switchCameraSideBtn?.addEventListener(
    "click",
    switchCamera
  );

  el.cameraQuality?.addEventListener(
    "change",
    async () => {
      state.cameraQuality =
        el.cameraQuality.value;

      if (
        state.cameraRunning
      ) {
        await startCamera();
      }
    }
  );

  el.cameraFps?.addEventListener(
    "change",
    async () => {
      state.cameraFps =
        numberOr(
          el.cameraFps.value,
          30
        );

      if (
        state.cameraRunning
      ) {
        await startCamera();
      }
    }
  );

  el.cameraDeviceSelect?.addEventListener(
    "change",
    async () => {
      state.cameraDeviceId =
        el.cameraDeviceSelect.value;

      if (
        state.cameraRunning
      ) {
        await startCamera();
      }
    }
  );


  /* ---------- AI backgrounds ---------- */

  el.bgOriginalBtn?.addEventListener(
    "click",
    () =>
      setBackgroundMode(
        "original"
      )
  );

  el.bgRemoveBtn?.addEventListener(
    "click",
    () =>
      setBackgroundMode(
        "remove"
      )
  );

  el.bgBlurBtn?.addEventListener(
    "click",
    () =>
      setBackgroundMode(
        "blur"
      )
  );

  el.bgImageBtn?.addEventListener(
    "click",
    () => {
      if (
        state.backgroundImage
      ) {
        setBackgroundMode(
          "image"
        );
      } else {
        clickInput(
          el.backgroundImageUpload
        );
      }
    }
  );

  el.bgColorBtn?.addEventListener(
    "click",
    () =>
      setBackgroundMode(
        "color"
      )
  );

  el.backgroundColor?.addEventListener(
    "input",
    () => {
      if (
        state.backgroundMode ===
        "color"
      ) {
        renderCompositionFrame();
      }
    }
  );

  el.backgroundUploadBox?.addEventListener(
    "click",
    () =>
      clickInput(
        el.backgroundImageUpload
      )
  );

  el.uploadBackgroundSideBtn?.addEventListener(
    "click",
    () =>
      clickInput(
        el.backgroundImageUpload
      )
  );

  el.backgroundImageUpload?.addEventListener(
    "change",
    () => {
      const file =
        el.backgroundImageUpload.files?.[0];

      if (file) {
        handleBackgroundImage(
          file
        );
      }

      el.backgroundImageUpload.value =
        "";
    }
  );


  /* ---------- Screen capture ---------- */

  el.startScreenCaptureBtn?.addEventListener(
    "click",
    startScreenCapture
  );

  el.startScreenCaptureSideBtn?.addEventListener(
    "click",
    startScreenCapture
  );

  el.stopScreenCaptureBtn?.addEventListener(
    "click",
    () =>
      stopScreenCapture(true)
  );


  /* ---------- Audio ---------- */

  el.mainVideoAudioCheckbox?.addEventListener(
    "change",
    async () => {
      if (
        !state.mainVideoSourceNode
      ) {
        await setupMainVideoAudio();
      }

      updateMainVideoAudio();
    }
  );

  el.mainVideoVolume?.addEventListener(
    "input",
    updateMainVideoAudio
  );

  el.micVolume?.addEventListener(
    "input",
    updateMicrophoneSettings
  );

  el.micEnabled?.addEventListener(
    "change",
    async () => {
      if (
        el.micEnabled.checked &&
        !state.micStream
      ) {
        await startMicrophone();
      } else {
        updateMicrophoneSettings();
      }
    }
  );

  el.micMonitor?.addEventListener(
    "change",
    updateMicrophoneSettings
  );


  /* ---------- Teleprompter ---------- */

  el.openTeleprompterTopBtn?.addEventListener(
    "click",
    openTeleprompter
  );

  el.openTeleprompterBtn?.addEventListener(
    "click",
    openTeleprompter
  );

  el.openTeleprompterSide?.addEventListener(
    "click",
    openTeleprompter
  );

  el.uploadTeleprompterBtn?.addEventListener(
    "click",
    () =>
      clickInput(
        el.teleprompterFileInput
      )
  );

  el.teleprompterFileInput?.addEventListener(
    "change",
    () => {
      const file =
        el.teleprompterFileInput.files?.[0];

      if (file) {
        handleTeleprompterFile(
          file
        );
      }

      el.teleprompterFileInput.value =
        "";
    }
  );

  el.teleprompterText?.addEventListener(
    "input",
    updateTeleprompterPreview
  );

  el.teleprompterSpeed?.addEventListener(
    "input",
    updateTeleprompterPreview
  );

  el.teleprompterFontSize?.addEventListener(
    "input",
    updateTeleprompterPreview
  );

  el.teleprompterOpacity?.addEventListener(
    "input",
    updateTeleprompterPreview
  );

  el.teleprompterResetBtn?.addEventListener(
    "click",
    resetTeleprompter
  );

  el.teleprompterPauseBtn?.addEventListener(
    "click",
    pauseTeleprompter
  );

  el.teleprompterPlayBtn?.addEventListener(
    "click",
    playTeleprompter
  );

  el.teleprompterSaveBtn?.addEventListener(
    "click",
    saveTeleprompter
  );


  /* ---------- Settings ---------- */

  el.settingsBtn?.addEventListener(
    "click",
    openSettings
  );

  el.closeSettingsBtn?.addEventListener(
    "click",
    () =>
      closeModal(
        el.settingsModal
      )
  );

  el.closeSettingsFooterBtn?.addEventListener(
    "click",
    () =>
      closeModal(
        el.settingsModal
      )
  );

  el.saveSettingsBtn?.addEventListener(
    "click",
    saveSettings
  );


  /* ---------- Shortcuts ---------- */

  el.openShortcutsBtn?.addEventListener(
    "click",
    () =>
      openModal(
        el.shortcutsModal
      )
  );

  el.closeShortcutsBtn?.addEventListener(
    "click",
    () =>
      closeModal(
        el.shortcutsModal
      )
  );


  /* ---------- Fullscreen ---------- */

  el.fullscreenStageBtn?.addEventListener(
    "click",
    toggleStageFullscreen
  );

  el.fullscreenStudioBtn?.addEventListener(
    "click",
    toggleStudioFullscreen
  );


  /* ---------- Recording ---------- */

  el.recordBtn?.addEventListener(
    "click",
    () => {
      if (
        state.recordingState ===
        "recording"
      ) {
        pauseRecording();
      } else if (
        state.recordingState ===
        "paused"
      ) {
        resumeRecording();
      } else {
        startRecording();
      }
    }
  );

  el.recordToolbarBtn?.addEventListener(
    "click",
    () => {
      if (
        state.recordingState ===
        "recording"
      ) {
        pauseRecording();
      } else if (
        state.recordingState ===
        "paused"
      ) {
        resumeRecording();
      } else {
        startRecording();
      }
    }
  );

  el.pauseRecordingBtn?.addEventListener(
    "click",
    pauseRecording
  );

  el.resumeRecordingBtn?.addEventListener(
    "click",
    resumeRecording
  );

  el.stopRecordingBtn?.addEventListener(
    "click",
    stopRecording
  );


  /* ---------- Recording settings ---------- */

  [
    el.recordingQualitySide,
    el.recordingFpsSide,
    el.recordingFormatSide
  ].forEach(
    (input) => {
      input?.addEventListener(
        "change",
        () => {
          applyRecordingSettingsToUI();
        }
      );
    }
  );


  /* ---------- Preview ---------- */

  el.closeRecordingPreviewBtn?.addEventListener(
    "click",
    () =>
      closeModal(
        el.recordingPreviewModal
      )
  );

  el.recordingPreviewPlayBtn?.addEventListener(
    "click",
    playRecordingPreview
  );

  el.recordingPreviewPauseBtn?.addEventListener(
    "click",
    pauseRecordingPreview
  );

  el.recordingTrimStart?.addEventListener(
    "input",
    updateTrimFromInputs
  );

  el.recordingTrimEnd?.addEventListener(
    "input",
    updateTrimFromInputs
  );

  el.applyTrimBtn?.addEventListener(
    "click",
    applyTrim
  );

  el.resetTrimBtn?.addEventListener(
    "click",
    () => {
      resetPreviewTrim();

      if (
        el.recordingPreviewVideo
      ) {
        el.recordingPreviewVideo.currentTime =
          0;
      }
    }
  );

  el.renameRecordingBtn?.addEventListener(
    "click",
    renameCurrentRecording
  );

  el.deleteRecordingBtn?.addEventListener(
    "click",
    deleteCurrentRecording
  );

  el.recordAgainBtn?.addEventListener(
    "click",
    recordAgain
  );

  el.downloadRecordingBtn?.addEventListener(
    "click",
    downloadCurrentRecording
  );

  el.clearRecordingHistoryBtn?.addEventListener(
    "click",
    clearRecordingHistory
  );


  /* ---------- Students ---------- */

  el.addStudentBtn?.addEventListener(
    "click",
    openStudentModal
  );

  el.closeStudentModalBtn?.addEventListener(
    "click",
    () =>
      closeModal(
        el.studentModal
      )
  );

  el.cancelStudentBtn?.addEventListener(
    "click",
    () =>
      closeModal(
        el.studentModal
      )
  );

  el.saveStudentBtn?.addEventListener(
    "click",
    () => {
      const name =
        el.studentNameInput?.value ||
        "";

      if (!name.trim()) {
        showToast(
          "Enter student name.",
          "warning"
        );
        return;
      }

      addStudent(
        name
      );

      closeModal(
        el.studentModal
      );
    }
  );


  /* ---------- Global keyboard ---------- */

  document.addEventListener(
    "keydown",
    handleKeyboardShortcut
  );


  /* ---------- Modal backdrop ---------- */

  qsa(".modal").forEach(
    (modal) => {
      modal.addEventListener(
        "click",
        (event) => {
          if (
            event.target ===
            modal
          ) {
            closeModal(
              modal
            );
          }
        }
      );
    }
  );


  /* ---------- Fullscreen change ---------- */

  document.addEventListener(
    "fullscreenchange",
    () => {
      state.fullscreenTarget =
        document.fullscreenElement;

      document.body.classList.toggle(
        "is-fullscreen",
        !!document.fullscreenElement
      );

      renderCompositionFrame();
    }
  );


  /* ---------- Main video events ---------- */

  el.mainVideo?.addEventListener(
    "play",
    startRenderLoop
  );

  el.mainVideo?.addEventListener(
    "pause",
    renderCompositionFrame
  );

  el.mainVideo?.addEventListener(
    "ended",
    renderCompositionFrame
  );

  el.mainVideo?.addEventListener(
    "loadedmetadata",
    () => {
      setupMainVideoAudio();
      renderCompositionFrame();
    }
  );


  /* ---------- Window resize ---------- */

  window.addEventListener(
    "resize",
    () => {
      renderCompositionFrame();
    }
  );


  /* ---------- Visibility ---------- */

  document.addEventListener(
    "visibilitychange",
    () => {
      /*
        Do not stop recording if the tab
        temporarily becomes hidden.
      */

      if (
        !document.hidden
      ) {
        startRenderLoop();
      }
    }
  );


  /* ---------- Before unload ---------- */

  window.addEventListener(
    "beforeunload",
    (event) => {
      if (
        state.recordingState ===
          "recording" ||
        state.recordingState ===
          "paused"
      ) {
        event.preventDefault();

        event.returnValue =
          "A recording is currently active.";
      }
    }
  );
}


/* =========================================================
   MENTOR OVERLAY DRAG
   ========================================================= */

function initializeMentorDrag() {
  if (!el.mentorCard) {
    return;
  }

  el.mentorCard.addEventListener(
    "pointerdown",
    (event) => {
      if (
        event.target ===
        el.mentorResize
      ) {
        return;
      }

      /*
        Do not drag from buttons or controls
        inside the card.
      */

      if (
        event.target.closest(
          "button,input,select"
        )
      ) {
        return;
      }

      state.mentorDrag.active =
        true;

      state.mentorDrag.startX =
        event.clientX;

      state.mentorDrag.startY =
        event.clientY;

      const style =
        getComputedStyle(
          el.mentorCard
        );

      state.mentorDrag.startLeft =
        parseFloat(
          style.left
        ) || 0;

      state.mentorDrag.startTop =
        parseFloat(
          style.top
        ) || 0;

      el.mentorCard.setPointerCapture(
        event.pointerId
      );

      el.mentorCard.classList.add(
        "is-dragging"
      );
    }
  );

  el.mentorCard.addEventListener(
    "pointermove",
    (event) => {
      if (
        !state.mentorDrag.active
      ) {
        return;
      }

      const stageRect =
        el.stage.getBoundingClientRect();

      const deltaX =
        event.clientX -
        state.mentorDrag.startX;

      const deltaY =
        event.clientY -
        state.mentorDrag.startY;

      let newLeft =
        state.mentorDrag.startLeft +
        deltaX;

      let newTop =
        state.mentorDrag.startTop +
        deltaY;

      const cardRect =
        el.mentorCard.getBoundingClientRect();

      const maxLeft =
        stageRect.width -
        cardRect.width;

      const maxTop =
        stageRect.height -
        cardRect.height;

      newLeft =
        clamp(
          newLeft,
          0,
          Math.max(
            0,
            maxLeft
          )
        );

      newTop =
        clamp(
          newTop,
          0,
          Math.max(
            0,
            maxTop
          )
        );

      el.mentorCard.style.left =
        `${newLeft}px`;

      el.mentorCard.style.top =
        `${newTop}px`;

      el.mentorCard.style.right =
        "auto";

      el.mentorCard.style.bottom =
        "auto";

      renderCompositionFrame();
    }
  );

  const stopDrag =
    (event) => {
      if (
        !state.mentorDrag.active
      ) {
        return;
      }

      state.mentorDrag.active =
        false;

      el.mentorCard.classList.remove(
        "is-dragging"
      );

      try {
        el.mentorCard.releasePointerCapture(
          event.pointerId
        );
      } catch {
        /* Ignore */
      }

      renderCompositionFrame();
    };

  el.mentorCard.addEventListener(
    "pointerup",
    stopDrag
  );

  el.mentorCard.addEventListener(
    "pointercancel",
    stopDrag
  );
}


/* =========================================================
   MENTOR RESIZE
   ========================================================= */

function initializeMentorResize() {
  if (
    !el.mentorResize ||
    !el.mentorCard
  ) {
    return;
  }

  el.mentorResize.addEventListener(
    "pointerdown",
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      state.mentorResizeState.active =
        true;

      state.mentorResizeState.startX =
        event.clientX;

      state.mentorResizeState.startY =
        event.clientY;

      const rect =
        el.mentorCard.getBoundingClientRect();

      state.mentorResizeState.startWidth =
        rect.width;

      state.mentorResizeState.startHeight =
        rect.height;

      el.mentorResize.setPointerCapture(
        event.pointerId
      );
    }
  );

  el.mentorResize.addEventListener(
    "pointermove",
    (event) => {
      if (
        !state.mentorResizeState.active
      ) {
        return;
      }

      const deltaX =
        event.clientX -
        state.mentorResizeState.startX;

      const deltaY =
        event.clientY -
        state.mentorResizeState.startY;

      const delta =
        Math.max(
          deltaX,
          deltaY
        );

      const aspect =
        16 / 9;

      let width =
        state.mentorResizeState.startWidth +
        delta;

      width =
        clamp(
          width,
          130,
          el.stage.getBoundingClientRect()
            .width *
            0.45
        );

      const height =
        width /
        aspect;

      el.mentorCard.style.width =
        `${width}px`;

      el.mentorCard.style.height =
        `${height}px`;

      renderCompositionFrame();
    }
  );

  const stopResize =
    (event) => {
      state.mentorResizeState.active =
        false;

      try {
        el.mentorResize.releasePointerCapture(
          event.pointerId
        );
      } catch {
        /* Ignore */
      }
    };

  el.mentorResize.addEventListener(
    "pointerup",
    stopResize
  );

  el.mentorResize.addEventListener(
    "pointercancel",
    stopResize
  );
}


/* =========================================================
   DEVICE PERMISSIONS REFRESH
   ========================================================= */

async function refreshDevices() {
  await enumerateCameraDevices();
}


/* =========================================================
   INITIAL DEFAULT UI
   ========================================================= */

function initializeDefaultUI() {
  applyRecordingSettingsToUI();

  updateRecordingUI();

  updateScreenStatusUI();

  updateMicStatusUI();

  updateStageBadges();

  setIndicator(
    el.cameraIndicator,
    false
  );

  setIndicator(
    el.screenIndicator,
    false
  );

  setIndicator(
    el.audioIndicator,
    false
  );

  if (el.micVolumeValue) {
    const volume =
      numberOr(
        el.micVolume?.value,
        1
      );

    el.micVolumeValue.textContent =
      `${Math.round(
        volume * 100
      )}%`;
  }

  if (el.mainVolumeValue) {
    const volume =
      numberOr(
        el.mainVideoVolume?.value,
        1
      );

    el.mainVolumeValue.textContent =
      `${Math.round(
        volume * 100
      )}%`;
  }

  hideElement(
    el.mainImage
  );

  hideElement(
    el.mainVideo
  );

  hideElement(
    el.screenCaptureVideo
  );

  showElement(
    el.welcomeContent
  );

  hideElement(
    el.mentorVideo
  );

  hideElement(
    el.mentorCameraVideo
  );

  hideElement(
    el.mentorAICanvas
  );

  showElement(
    el.mentorPlaceholder
  );

  if (el.brandBadgeText) {
    el.brandBadgeText.textContent =
      state.brandName;
  }
}


/* =========================================================
   MEDIA DEVICE PERMISSION REFRESH
   ========================================================= */

function setupDeviceChangeListener() {
  if (
    navigator.mediaDevices
      ?.addEventListener
  ) {
    navigator.mediaDevices.addEventListener(
      "devicechange",
      refreshDevices
    );
  }
}


/* =========================================================
   AUDIO CONTEXT RESUME
   ========================================================= */

function setupAudioResume() {
  const resume = async () => {
    if (
      state.audioContext &&
      state.audioContext.state ===
        "suspended"
    ) {
      try {
        await state.audioContext.resume();
      } catch {
        /* Ignore */
      }
    }
  };

  [
    "pointerdown",
    "keydown",
    "touchstart"
  ].forEach(
    (eventName) => {
      document.addEventListener(
        eventName,
        resume,
        {
          passive: true
        }
      );
    }
  );
}


/* =========================================================
   RECORDING PREVIEW OBJECT URL
   ========================================================= */

state.previewObjectUrl = null;


/* =========================================================
   CLEANUP
   ========================================================= */

function cleanup() {
  if (
    state.destroying
  ) {
    return;
  }

  state.destroying =
    true;

  stopRecordingTimer();

  if (
    state.mediaRecorder &&
    state.mediaRecorder.state !==
      "inactive"
  ) {
    try {
      state.mediaRecorder.stop();
    } catch {
      /* Ignore */
    }
  }

  stopCamera(false);
  stopScreenCapture(false);
  stopMicrophone(false);

  stopRenderLoop();

  revokeObjectUrl(
    state.mainImageObjectUrl
  );

  revokeObjectUrl(
    state.mainVideoObjectUrl
  );

  revokeObjectUrl(
    state.mentorVideoObjectUrl
  );

  revokeObjectUrl(
    state.recordingObjectUrl
  );

  revokeObjectUrl(
    state.previewObjectUrl
  );

  revokeObjectUrl(
    state.previewTrimmedObjectUrl
  );

  if (
    state.audioContext
  ) {
    try {
      state.audioContext.close();
    } catch {
      /* Ignore */
    }
  }
}


/* =========================================================
   PUBLIC API
   ========================================================= */

window.CourseStudio.startCamera =
  startCamera;

window.CourseStudio.stopCamera =
  stopCamera;

window.CourseStudio.switchCamera =
  switchCamera;

window.CourseStudio.startScreenCapture =
  startScreenCapture;

window.CourseStudio.stopScreenCapture =
  stopScreenCapture;

window.CourseStudio.startRecording =
  startRecording;

window.CourseStudio.pauseRecording =
  pauseRecording;

window.CourseStudio.resumeRecording =
  resumeRecording;

window.CourseStudio.stopRecording =
  stopRecording;

window.CourseStudio.playMainVideo =
  playMainVideo;

window.CourseStudio.pauseMainVideo =
  pauseMainVideo;

window.CourseStudio.openTeleprompter =
  openTeleprompter;

window.CourseStudio.openSettings =
  openSettings;

window.CourseStudio.render =
  renderCompositionFrame;

window.CourseStudio.setBackground =
  setBackgroundMode;

window.CourseStudio.downloadRecording =
  downloadCurrentRecording;


/* =========================================================
   INITIALIZE APPLICATION
   ========================================================= */

async function initializeCourseStudio() {
  if (
    state.initialized
  ) {
    return;
  }

  state.initialized =
    true;

  initializeDefaultUI();

  loadSettings();

  loadTeleprompter();

  loadStudents();

  bindEvents();

  initializeMentorDrag();

  initializeMentorResize();

  setupDeviceChangeListener();

  setupAudioResume();

  await initDatabase();

  await enumerateCameraDevices();

  applyRecordingSettingsToUI();

  updateRecordingUI();

  updateStageBadges();

  renderCompositionFrame();

  startRenderLoop();

  /*
    Give browser a moment to expose
    media devices after page load.
  */

  setTimeout(
    () => {
      enumerateCameraDevices();
    },
    1000
  );

  console.log(
    "SNK Mentor Studio Step 3.10 initialized."
  );
}


/* =========================================================
   DOM READY
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initializeCourseStudio,
    {
      once: true
    }
  );
} else {
  initializeCourseStudio();
}


/* =========================================================
   WINDOW CLEANUP
   ========================================================= */

window.addEventListener(
  "pagehide",
  cleanup
);


/* =========================================================
   END OF FILE
   ========================================================= */
