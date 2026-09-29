/* =========================================================
   SNK MENTOR STUDIO — STEP 3.9
   File: mentor/script.js

   PROFESSIONAL RECORDING + PREVIEW ENGINE

   Includes:
   - Main image / video
   - Mentor video
   - Camera
   - AI person segmentation
   - Original / Remove / Blur / Custom / Solid background
   - Drag + resize mentor overlay
   - Screen capture
   - Teleprompter
   - Students
   - Settings
   - Audio routing
   - Microphone level meter
   - Main audio level meter
   - Microphone waveform
   - Camera quality
   - Camera FPS
   - Camera device selection
   - Recording quality
   - Recording FPS
   - Recording format detection
   - Continuous composition rendering
   - Recording pause / resume / stop
   - Recording timer
   - Professional recording preview
   - Trim start / end UI
   - Rename recording
   - Recording history
   - IndexedDB recording storage
   - Download
   - Delete
   - Record Again
   - Fullscreen
   - Keyboard shortcuts
========================================================= */

"use strict";

/* =========================================================
   DOM HELPER
========================================================= */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) =>
  Array.from(root.querySelectorAll(selector));

/* =========================================================
   STATE
========================================================= */

const state = {
  /* ---------------- Main source ---------------- */
  mainType: null,
  mainObjectUrl: null,

  /* ---------------- Mentor ---------------- */
  mentorType: null,
  mentorObjectUrl: null,

  /* ---------------- Camera ---------------- */
  cameraStream: null,
  cameraEnabled: false,
  cameraFacingMode: "user",
  cameraDeviceId: "",
  cameraQuality: "720",
  cameraFps: 30,

  /* ---------------- AI ---------------- */
  segmentation: null,
  segmentationReady: false,
  segmentationRunning: false,
  aiMode: "original",
  customBackgroundImage: null,

  /* ---------------- Screen ---------------- */
  screenStream: null,
  screenCaptureEnabled: false,

  /* ---------------- Audio ---------------- */
  audioContext: null,
  mediaDestination: null,

  mainSourceNode: null,
  mainGainNode: null,

  micSourceNode: null,
  micGainNode: null,

  screenSourceNode: null,
  screenGainNode: null,

  mainAnalyser: null,
  micAnalyser: null,

  micDataArray: null,
  mainDataArray: null,

  /* ---------------- Composition ---------------- */
  compositionCanvas: null,
  compositionCtx: null,
  compositionWidth: 1280,
  compositionHeight: 720,

  renderAnimationId: null,
  renderRunning: false,

  /* ---------------- Recording ---------------- */
  mediaRecorder: null,
  recordingChunks: [],
  recordingBlob: null,
  recordingUrl: null,

  recordingActive: false,
  recordingPaused: false,
  recordingStartedAt: 0,
  recordingPausedAt: 0,
  recordingPausedTotal: 0,

  recordingTimerId: null,

  recordingQuality: "1080",
  recordingFps: 30,
  recordingFormat: "auto",
  recordingMimeType: "",

  recordingName: "Mentor Recording",

  /* ---------------- Preview ---------------- */
  previewBlob: null,
  previewUrl: null,
  previewDuration: 0,

  trimStart: 0,
  trimEnd: 0,

  /* ---------------- History ---------------- */
  recordings: [],

  /* ---------------- Teleprompter ---------------- */
  teleprompterText: "",
  teleprompterSpeed: 1,
  teleprompterFontSize: 34,
  teleprompterOpacity: 0.82,
  teleprompterPlaying: false,

  /* ---------------- Students ---------------- */
  students: [],

  /* ---------------- Settings ---------------- */
  brandName: "SNK Mentor Studio",
  autoStartTeleprompter: false,
  showTeleprompterRecording: false,

  /* ---------------- Audio settings ---------------- */
  micVolume: 1,
  micEnabled: true,
  micMonitor: false,
  mainVideoAudioEnabled: true,
  mainVideoVolume: 1,

  /* ---------------- Misc ---------------- */
  settingsKey: "snkMentorStudioSettingsV39",
  studentsKey: "snkMentorStudioStudentsV39",

  dbName: "SNKMentorStudioDB",
  dbVersion: 1,
  dbStore: "recordings",

  currentPreviewRecordId: null
};

/* =========================================================
   ELEMENTS
========================================================= */

const el = {
  stage: $("#stage"),
  stageShell: $("#stageShell"),

  mainImage: $("#mainImage"),
  mainVideo: $("#mainVideo"),
  screenCaptureVideo: $("#screenCaptureVideo"),
  welcomeContent: $("#welcomeContent"),

  mentorCard: $("#mentorCard"),
  mentorVideo: $("#mentorVideo"),
  mentorCameraVideo: $("#mentorCameraVideo"),
  mentorAICanvas: $("#mentorAICanvas"),
  mentorPlaceholder: $("#mentorPlaceholder"),
  mentorSourceLabel: $("#mentorSourceLabel"),
  mentorResize: $("#mentorResize"),

  brandBadge: $("#brandBadge"),

  recordingOverlay: $("#recordingOverlay"),
  recordingOverlayTimer: $("#recordingOverlayTimer"),

  stageResolutionBadge: $("#stageResolutionBadge"),
  stageFpsBadge: $("#stageFpsBadge"),
  stageSourceBadge: $("#stageSourceBadge"),

  /* top */
  recordBtn: $("#recordBtn"),
  startScreenCaptureBtn: $("#startScreenCaptureBtn"),
  fullscreenStageBtn: $("#fullscreenStageBtn"),
  fullscreenStudioBtn: $("#fullscreenStudioBtn"),
  settingsBtn: $("#settingsBtn"),
  openShortcutsBtn: $("#openShortcutsBtn"),
  openTeleprompterTopBtn: $("#openTeleprompterTopBtn"),

  /* recording bar */
  recordingStatusBar: $("#recordingStatusBar"),
  recordingStatusDot: $("#recordingStatusDot"),
  recordingStatusText: $("#recordingStatusText"),
  recordingTimer: $("#recordingTimer"),

  recordingQuality: $("#recordingQuality"),
  recordingFps: $("#recordingFps"),

  pauseRecordingBtn: $("#pauseRecordingBtn"),
  resumeRecordingBtn: $("#resumeRecordingBtn"),
  stopRecordingBtn: $("#stopRecordingBtn"),

  cameraIndicator: $("#cameraIndicator"),
  micIndicator: $("#micIndicator"),
  audioIndicator: $("#audioIndicator"),
  screenIndicator: $("#screenIndicator"),

  /* toolbar */
  uploadMainBtn: $("#uploadMainBtn"),
  uploadVideoBtn: $("#uploadVideoBtn"),
  mainPlayBtn: $("#mainPlayBtn"),
  mainPauseBtn: $("#mainPauseBtn"),
  uploadMentorBtn: $("#uploadMentorBtn"),
  startCameraBtn: $("#startCameraBtn"),
  stopCameraBtn: $("#stopCameraBtn"),
  recordToolbarBtn: $("#recordToolbarBtn"),
  openTeleprompterBtn: $("#openTeleprompterBtn"),

  /* side camera */
  startCameraSideBtn: $("#startCameraSideBtn"),
  stopCameraSideBtn: $("#stopCameraSideBtn"),
  switchCameraSideBtn: $("#switchCameraSideBtn"),
  uploadMentorSideBtn: $("#uploadMentorSideBtn"),
  cameraStatus: $("#cameraStatus"),

  cameraQuality: $("#cameraQuality"),
  cameraFps: $("#cameraFps"),
  cameraDeviceSelect: $("#cameraDeviceSelect"),

  /* background */
  bgOriginalBtn: $("#bgOriginalBtn"),
  bgRemoveBtn: $("#bgRemoveBtn"),
  bgBlurBtn: $("#bgBlurBtn"),
  bgImageBtn: $("#bgImageBtn"),
  bgColorBtn: $("#bgColorBtn"),
  backgroundColor: $("#backgroundColor"),
  backgroundUploadBox: $("#backgroundUploadBox"),

  /* screen */
  startScreenCaptureSideBtn: $("#startScreenCaptureSideBtn"),
  stopScreenCaptureBtn: $("#stopScreenCaptureBtn"),
  screenCaptureStatus: $("#screenCaptureStatus"),
  screenCaptureStatusLight: $("#screenCaptureStatusLight"),

  /* audio */
  mainVideoAudioCheckbox: $("#mainVideoAudioCheckbox"),
  mainVideoVolume: $("#mainVideoVolume"),
  mainVolumeValue: $("#mainVolumeValue"),

  micVolume: $("#micVolume"),
  micVolumeValue: $("#micVolumeValue"),
  micEnabled: $("#micEnabled"),
  micMonitor: $("#micMonitor"),

  micLevelBar: $("#micLevelBar"),
  mainAudioLevelBar: $("#mainAudioLevelBar"),
  micWaveformCanvas: $("#micWaveformCanvas"),

  /* teleprompter */
  teleprompterMiniPreview: $("#teleprompterMiniPreview"),
  openTeleprompterSide: $("#openTeleprompterSide"),
  uploadTeleprompterBtn: $("#uploadTeleprompterBtn"),

  /* students */
  studentsList: $("#studentsList"),
  addStudentBtn: $("#addStudentBtn"),

  /* recording settings */
  recordingQualitySide: $("#recordingQualitySide"),
  recordingFpsSide: $("#recordingFpsSide"),
  recordingFormat: $("#recordingFormat"),
  recordingFormatSide: $("#recordingFormatSide"),
  recordingFileName: $("#recordingFileName"),
  recordingFileNameSide: $("#recordingFileNameSide"),
  includeTeleprompterInRecording: $(
    "#includeTeleprompterInRecording"
  ),

  /* files */
  uploadMainSideBtn: $("#uploadMainSideBtn"),
  uploadVideoSideBtn: $("#uploadVideoSideBtn"),
  uploadMentorFileSideBtn: $("#uploadMentorFileSideBtn"),
  uploadBackgroundSideBtn: $("#uploadBackgroundSideBtn"),

  /* hidden inputs */
  mainFileInput: $("#mainFileInput"),
  mainVideoInput: $("#mainVideoInput"),
  mentorFileInput: $("#mentorFileInput"),
  backgroundImageUpload: $("#backgroundImageUpload"),
  teleprompterFileInput: $("#teleprompterFileInput"),

  /* AI canvases */
  aiCanvas: $("#aiCanvas"),
  aiSourceCanvas: $("#aiSourceCanvas"),
  aiMaskCanvas: $("#aiMaskCanvas"),

  /* settings */
  settingsModal: $("#settingsModal"),
  brandNameInput: $("#brandNameInput"),
  settingsRecordingQuality: $("#settingsRecordingQuality"),
  settingsRecordingFps: $("#settingsRecordingFps"),
  settingsAutoStartTeleprompter: $("#settingsAutoStartTeleprompter"),
  settingsShowTeleprompterRecording: $(
    "#settingsShowTeleprompterRecording"
  ),
  closeSettingsBtn: $("#closeSettingsBtn"),
  closeSettingsFooterBtn: $("#closeSettingsFooterBtn"),
  saveSettingsBtn: $("#saveSettingsBtn"),

  /* shortcuts */
  shortcutsModal: $("#shortcutsModal"),
  closeShortcutsBtn: $("#closeShortcutsBtn"),

  /* teleprompter */
  teleprompterModal: $("#teleprompterModal"),
  closeTeleprompterBtn: $("#closeTeleprompterBtn"),
  teleprompterText: $("#teleprompterText"),
  teleprompterSpeed: $("#teleprompterSpeed"),
  teleprompterFontSize: $("#teleprompterFontSize"),
  teleprompterOpacity: $("#teleprompterOpacity"),
  teleprompterPreview: $("#teleprompterPreview"),
  teleprompterResetBtn: $("#teleprompterResetBtn"),
  teleprompterPauseBtn: $("#teleprompterPauseBtn"),
  teleprompterPlayBtn: $("#teleprompterPlayBtn"),
  teleprompterSaveBtn: $("#teleprompterSaveBtn"),

  /* recording preview */
  recordingPreviewModal: $("#recordingPreviewModal"),
  recordingPreviewVideo: $("#recordingPreviewVideo"),
  recordingFileInfo: $("#recordingFileInfo"),

  closeRecordingPreviewBtn: $("#closeRecordingPreviewBtn"),
  deleteRecordingBtn: $("#deleteRecordingBtn"),
  recordAgainBtn: $("#recordAgainBtn"),
  downloadRecordingBtn: $("#downloadRecordingBtn"),

  recordingTrimStart: $("#recordingTrimStart"),
  recordingTrimEnd: $("#recordingTrimEnd"),
  recordingTrimStartTime: $("#recordingTrimStartTime"),
  recordingTrimEndTime: $("#recordingTrimEndTime"),
  recordingCurrentTime: $("#recordingCurrentTime"),
  recordingDuration: $("#recordingDuration"),

  recordingPreviewPlayBtn: $("#recordingPreviewPlayBtn"),
  recordingPreviewPauseBtn: $("#recordingPreviewPauseBtn"),

  applyTrimBtn: $("#applyTrimBtn"),
  resetTrimBtn: $("#resetTrimBtn"),

  renameRecordingBtn: $("#renameRecordingBtn"),
  recordingNameInput: $("#recordingNameInput"),

  recordingHistoryList: $("#recordingHistoryList"),
  clearRecordingHistoryBtn: $("#clearRecordingHistoryBtn"),

  /* student */
  studentModal: $("#studentModal"),
  studentNameInput: $("#studentNameInput"),
  closeStudentModalBtn: $("#closeStudentModalBtn"),
  cancelStudentBtn: $("#cancelStudentBtn"),
  saveStudentBtn: $("#saveStudentBtn"),

  toastContainer: $("#toastContainer")
};

/* =========================================================
   SAFE ELEMENT HELPERS
========================================================= */

function on(element, event, handler, options) {
  if (!element) return;
  element.addEventListener(event, handler, options);
}

function setText(element, value) {
  if (element) element.textContent = value;
}

function show(element, display = "") {
  if (!element) return;
  element.style.display = display;
}

function hide(element) {
  if (!element) return;
  element.style.display = "none";
}

function setDisabled(element, disabled) {
  if (element) element.disabled = disabled;
}

/* =========================================================
   TOAST
========================================================= */

function toast(message, type = "info") {
  if (!el.toastContainer) {
    console.log(`[${type}] ${message}`);
    return;
  }

  const item = document.createElement("div");
  item.className = `toast toast-${type}`;
  item.textContent = message;

  el.toastContainer.appendChild(item);

  requestAnimationFrame(() => {
    item.classList.add("show");
  });

  setTimeout(() => {
    item.classList.remove("show");

    setTimeout(() => {
      item.remove();
    }, 300);
  }, 3200);
}

/* =========================================================
   FORMAT HELPERS
========================================================= */

function formatTime(seconds) {
  seconds = Number(seconds) || 0;

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return [
      String(hrs).padStart(2, "0"),
      String(mins).padStart(2, "0"),
      String(secs).padStart(2, "0")
    ].join(":");
  }

  return [
    String(mins).padStart(2, "0"),
    String(secs).padStart(2, "0")
  ].join(":");
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";

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
    return new Date(timestamp).toLocaleString();
  } catch {
    return "";
  }
}

function sanitizeFileName(name) {
  return String(name || "mentor-recording")
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, " ")
    .slice(0, 100);
}

/* =========================================================
   LOCAL SETTINGS
========================================================= */

function loadSettings() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(state.settingsKey) || "{}"
    );

    state.brandName =
      saved.brandName || "SNK Mentor Studio";

    state.recordingQuality =
      saved.recordingQuality || "1080";

    state.recordingFps =
      Number(saved.recordingFps) || 30;

    state.autoStartTeleprompter =
      Boolean(saved.autoStartTeleprompter);

    state.showTeleprompterRecording =
      Boolean(saved.showTeleprompterRecording);

    state.micVolume =
      Number.isFinite(saved.micVolume)
        ? Number(saved.micVolume)
        : 1;

    state.micEnabled =
      saved.micEnabled !== false;

    state.micMonitor =
      saved.micMonitor === true;

    state.mainVideoAudioEnabled =
      saved.mainVideoAudioEnabled !== false;

    state.mainVideoVolume =
      Number.isFinite(saved.mainVideoVolume)
        ? Number(saved.mainVideoVolume)
        : 1;

  } catch (error) {
    console.warn("Settings load failed:", error);
  }

  applySettingsToUI();
}

function saveSettings() {
  const settings = {
    brandName: state.brandName,
    recordingQuality: state.recordingQuality,
    recordingFps: state.recordingFps,
    autoStartTeleprompter:
      state.autoStartTeleprompter,
    showTeleprompterRecording:
      state.showTeleprompterRecording,

    micVolume: state.micVolume,
    micEnabled: state.micEnabled,
    micMonitor: state.micMonitor,

    mainVideoAudioEnabled:
      state.mainVideoAudioEnabled,

    mainVideoVolume:
      state.mainVideoVolume
  };

  localStorage.setItem(
    state.settingsKey,
    JSON.stringify(settings)
  );
}

function applySettingsToUI() {
  if (el.brandNameInput) {
    el.brandNameInput.value = state.brandName;
  }

  if (el.recordingQuality) {
    el.recordingQuality.value =
      state.recordingQuality;
  }

  if (el.recordingQualitySide) {
    el.recordingQualitySide.value =
      state.recordingQuality;
  }

  if (el.settingsRecordingQuality) {
    el.settingsRecordingQuality.value =
      state.recordingQuality;
  }

  if (el.recordingFps) {
    el.recordingFps.value =
      String(state.recordingFps);
  }

  if (el.recordingFpsSide) {
    el.recordingFpsSide.value =
      String(state.recordingFps);
  }

  if (el.settingsRecordingFps) {
    el.settingsRecordingFps.value =
      String(state.recordingFps);
  }

  if (el.mainVideoAudioCheckbox) {
    el.mainVideoAudioCheckbox.checked =
      state.mainVideoAudioEnabled;
  }

  if (el.mainVideoVolume) {
    el.mainVideoVolume.value =
      Math.round(state.mainVideoVolume * 100);
  }

  if (el.mainVolumeValue) {
    el.mainVolumeValue.textContent =
      `${Math.round(state.mainVideoVolume * 100)}%`;
  }

  if (el.micVolume) {
    el.micVolume.value =
      Math.round(state.micVolume * 100);
  }

  if (el.micVolumeValue) {
    el.micVolumeValue.textContent =
      `${Math.round(state.micVolume * 100)}%`;
  }

  if (el.micEnabled) {
    el.micEnabled.checked =
      state.micEnabled;
  }

  if (el.micMonitor) {
    el.micMonitor.checked =
      state.micMonitor;
  }

  if (el.settingsAutoStartTeleprompter) {
    el.settingsAutoStartTeleprompter.checked =
      state.autoStartTeleprompter;
  }

  if (el.settingsShowTeleprompterRecording) {
    el.settingsShowTeleprompterRecording.checked =
      state.showTeleprompterRecording;
  }

  updateBrandBadge();
}

/* =========================================================
   BRAND
========================================================= */

function updateBrandBadge() {
  if (!el.brandBadge) return;

  const name =
    state.brandName || "SNK Mentor Studio";

  const label =
    el.brandBadge.querySelector(
      "[data-brand-name]"
    );

  if (label) {
    label.textContent = name;
  } else {
    el.brandBadge.textContent = name;
  }
}

/* =========================================================
   MAIN FILE — IMAGE
========================================================= */

function handleMainImage(file) {
  if (!file) return;

  if (state.mainObjectUrl) {
    URL.revokeObjectURL(state.mainObjectUrl);
  }

  const url = URL.createObjectURL(file);

  state.mainObjectUrl = url;
  state.mainType = "image";

  if (el.mainImage) {
    el.mainImage.src = url;
    show(el.mainImage);
  }

  if (el.mainVideo) {
    el.mainVideo.pause();
    hide(el.mainVideo);
  }

  if (el.welcomeContent) {
    hide(el.welcomeContent);
  }

  updateStageSourceBadge("IMAGE");

  toast("Main image loaded.", "success");

  renderCompositionFrame();
}

/* =========================================================
   MAIN FILE — VIDEO
========================================================= */

function handleMainVideo(file) {
  if (!file) return;

  if (state.mainObjectUrl) {
    URL.revokeObjectURL(state.mainObjectUrl);
  }

  const url = URL.createObjectURL(file);

  state.mainObjectUrl = url;
  state.mainType = "video";

  if (el.mainVideo) {
    el.mainVideo.src = url;
    el.mainVideo.currentTime = 0;
    show(el.mainVideo);
  }

  if (el.mainImage) {
    hide(el.mainImage);
  }

  if (el.welcomeContent) {
    hide(el.welcomeContent);
  }

  ensureAudioEngine();

  connectMainVideoAudio();

  updateStageSourceBadge("VIDEO");

  toast("Main video loaded.", "success");

  renderCompositionFrame();
}

/* =========================================================
   MENTOR FILE
========================================================= */

function handleMentorFile(file) {
  if (!file) return;

  if (state.mentorObjectUrl) {
    URL.revokeObjectURL(state.mentorObjectUrl);
  }

  const url = URL.createObjectURL(file);

  state.mentorObjectUrl = url;
  state.mentorType = "video";

  if (el.mentorVideo) {
    el.mentorVideo.src = url;
    el.mentorVideo.muted = true;
    el.mentorVideo.playsInline = true;

    show(el.mentorVideo);

    el.mentorVideo
      .play()
      .catch(() => {});
  }

  if (el.mentorCameraVideo) {
    hide(el.mentorCameraVideo);
  }

  if (el.mentorAICanvas) {
    hide(el.mentorAICanvas);
  }

  if (el.mentorPlaceholder) {
    hide(el.mentorPlaceholder);
  }

  if (el.mentorSourceLabel) {
    el.mentorSourceLabel.textContent =
      "Mentor Video";
  }

  toast("Mentor video loaded.", "success");

  renderCompositionFrame();
}

/* =========================================================
   MAIN PLAY / PAUSE
========================================================= */

function playMainVideo() {
  if (!el.mainVideo || !el.mainVideo.src) {
    toast("Please upload a main video first.", "warning");
    return;
  }

  el.mainVideo
    .play()
    .then(() => {
      renderCompositionFrame();
    })
    .catch(error => {
      console.warn(error);
    });
}

function pauseMainVideo() {
  if (!el.mainVideo) return;

  el.mainVideo.pause();
  renderCompositionFrame();
}

/* =========================================================
   CAMERA CONSTRAINTS
========================================================= */

function getCameraDimensions() {
  const quality = String(
    state.cameraQuality || "720"
  );

  const map = {
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

  return map[quality] || map["720"];
}

/* =========================================================
   ENUMERATE CAMERA DEVICES
========================================================= */

async function enumerateCameraDevices() {
  if (!navigator.mediaDevices?.enumerateDevices) {
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

    if (!el.cameraDeviceSelect) {
      return;
    }

    const previous =
      state.cameraDeviceId ||
      el.cameraDeviceSelect.value;

    el.cameraDeviceSelect.innerHTML =
      `<option value="">Default Camera</option>`;

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
      previous &&
      cameras.some(
        camera =>
          camera.deviceId === previous
      )
    ) {
      el.cameraDeviceSelect.value =
        previous;
    }

  } catch (error) {
    console.warn(
      "Camera enumeration failed:",
      error
    );
  }
}

/* =========================================================
   START CAMERA
========================================================= */

async function startCamera(options = {}) {
  if (!navigator.mediaDevices?.getUserMedia) {
    toast(
      "Camera access is not supported in this browser.",
      "error"
    );
    return;
  }

  if (state.cameraStream) {
    stopCamera(false);
  }

  const dimensions =
    getCameraDimensions();

  const requestedDeviceId =
    options.deviceId ??
    state.cameraDeviceId;

  const videoConstraint = {
    width: {
      ideal: dimensions.width
    },

    height: {
      ideal: dimensions.height
    },

    frameRate: {
      ideal: Number(state.cameraFps) || 30,
      max: Number(state.cameraFps) || 30
    },

    facingMode:
      requestedDeviceId
        ? undefined
        : state.cameraFacingMode
  };

  if (requestedDeviceId) {
    videoConstraint.deviceId = {
      exact: requestedDeviceId
    };
  }

  try {
    const stream =
      await navigator.mediaDevices.getUserMedia({
        video: videoConstraint,
        audio: true
      });

    state.cameraStream = stream;
    state.cameraEnabled = true;

    const videoTrack =
      stream.getVideoTracks()[0];

    if (videoTrack) {
      const settings =
        videoTrack.getSettings();

      if (settings.deviceId) {
        state.cameraDeviceId =
          settings.deviceId;
      }
    }

    if (el.mentorCameraVideo) {
      el.mentorCameraVideo.srcObject =
        stream;

      el.mentorCameraVideo.muted = true;
      el.mentorCameraVideo.playsInline = true;

      show(el.mentorCameraVideo);

      await el.mentorCameraVideo
        .play()
        .catch(() => {});
    }

    if (el.mentorVideo) {
      hide(el.mentorVideo);
    }

    if (el.mentorPlaceholder) {
      hide(el.mentorPlaceholder);
    }

    if (el.mentorAICanvas) {
      hide(el.mentorAICanvas);
    }

    if (el.mentorSourceLabel) {
      el.mentorSourceLabel.textContent =
        "Live Camera";
    }

    ensureAudioEngine();

    connectMicrophoneAudio(stream);

    updateCameraStatus(true);

    updateIndicator(
      el.cameraIndicator,
      true,
      "CAM"
    );

    await enumerateCameraDevices();

    if (
      el.cameraDeviceSelect &&
      state.cameraDeviceId
    ) {
      el.cameraDeviceSelect.value =
        state.cameraDeviceId;
    }

    setupSegmentation();

    toast(
      `Camera started — ${state.cameraQuality}p / ${state.cameraFps} FPS`,
      "success"
    );

    startRenderLoop();

  } catch (error) {
    console.error(
      "Camera start failed:",
      error
    );

    state.cameraEnabled = false;

    updateCameraStatus(false);

    updateIndicator(
      el.cameraIndicator,
      false,
      "CAM"
    );

    toast(
      `Camera could not start: ${error.message || "Permission denied"}`,
      "error"
    );
  }
}

/* =========================================================
   STOP CAMERA
========================================================= */

function stopCamera(showToast = true) {
  if (state.cameraStream) {
    state.cameraStream
      .getTracks()
      .forEach(track => {
        try {
          track.stop();
        } catch {}
      });
  }

  state.cameraStream = null;
  state.cameraEnabled = false;

  if (el.mentorCameraVideo) {
    el.mentorCameraVideo.pause();
    el.mentorCameraVideo.srcObject = null;
    hide(el.mentorCameraVideo);
  }

  if (el.mentorAICanvas) {
    hide(el.mentorAICanvas);
  }

  if (
    state.mentorType === "video" &&
    el.mentorVideo
  ) {
    show(el.mentorVideo);
  } else if (el.mentorPlaceholder) {
    show(el.mentorPlaceholder);
  }

  updateCameraStatus(false);

  updateIndicator(
    el.cameraIndicator,
    false,
    "CAM"
  );

  if (showToast) {
    toast("Camera stopped.", "info");
  }

  renderCompositionFrame();
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

  await startCamera();

  toast(
    state.cameraFacingMode === "user"
      ? "Front camera selected."
      : "Rear camera selected.",
    "info"
  );
}

/* =========================================================
   CAMERA STATUS
========================================================= */

function updateCameraStatus(active) {
  if (!el.cameraStatus) return;

  el.cameraStatus.textContent =
    active ? "Camera Online" : "Camera Offline";

  el.cameraStatus.classList.toggle(
    "online",
    active
  );
}

/* =========================================================
   CAMERA SETTINGS
========================================================= */

function applyCameraSettingsFromUI() {
  if (el.cameraQuality) {
    state.cameraQuality =
      String(el.cameraQuality.value || "720");
  }

  if (el.cameraFps) {
    state.cameraFps =
      Number(el.cameraFps.value || 30);
  }

  if (el.cameraDeviceSelect) {
    state.cameraDeviceId =
      el.cameraDeviceSelect.value || "";
  }
}

async function changeCameraSettings() {
  applyCameraSettingsFromUI();

  if (state.cameraEnabled) {
    await startCamera();
  }

  toast(
    `Camera settings: ${state.cameraQuality}p / ${state.cameraFps} FPS`,
    "info"
  );
}

/* =========================================================
   MEDIAPIPE SEGMENTATION
========================================================= */

function setupSegmentation() {
  if (
    state.segmentation ||
    typeof SelfieSegmentation === "undefined"
  ) {
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
    console.error(
      "MediaPipe initialization failed:",
      error
    );
  }
}

/* =========================================================
   SEGMENTATION RESULT
========================================================= */

function handleSegmentationResults(results) {
  if (!el.mentorAICanvas) {
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
    640;

  const height =
    source.videoHeight ||
    source.height ||
    360;

  const sourceCanvas =
    el.aiSourceCanvas ||
    createHiddenCanvas();

  const maskCanvas =
    el.aiMaskCanvas ||
    createHiddenCanvas();

  const outputCanvas =
    el.mentorAICanvas;

  ensureCanvasSize(
    sourceCanvas,
    width,
    height
  );

  ensureCanvasSize(
    maskCanvas,
    width,
    height
  );

  ensureCanvasSize(
    outputCanvas,
    width,
    height
  );

  const sourceCtx =
    sourceCanvas.getContext("2d");

  const maskCtx =
    maskCanvas.getContext("2d");

  const outputCtx =
    outputCanvas.getContext("2d");

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
    source,
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

  const isolated =
    outputCtx.createImageData(
      width,
      height
    );

  const src =
    sourceData.data;

  const msk =
    maskData.data;

  const out =
    isolated.data;

  for (
    let i = 0;
    i < src.length;
    i += 4
  ) {
    const confidence =
      msk[i] / 255;

    const alpha =
      Math.max(
        0,
        Math.min(
          1,
          (confidence - 0.15) / 0.65
        )
      );

    out[i] = src[i];
    out[i + 1] = src[i + 1];
    out[i + 2] = src[i + 2];
    out[i + 3] =
      Math.round(alpha * 255);
  }

  outputCtx.clearRect(
    0,
    0,
    width,
    height
  );

  outputCtx.putImageData(
    isolated,
    0,
    0
  );

  drawAIBackground(
    outputCtx,
    source,
    width,
    height
  );

  /* redraw isolated person above background */
  outputCtx.globalCompositeOperation =
    "destination-over";

  /* The isolated pixels are already in canvas.
     Background is prepared separately below. */

  drawBackgroundThenPerson(
    sourceCanvas,
    outputCanvas,
    width,
    height
  );

  show(outputCanvas);
  hide(el.mentorCameraVideo);
  hide(el.mentorVideo);

  state.segmentationRunning = false;
}

/* =========================================================
   CANVAS HELPERS
========================================================= */

function createHiddenCanvas() {
  const canvas =
    document.createElement("canvas");

  canvas.width = 640;
  canvas.height = 360;

  return canvas;
}

function ensureCanvasSize(
  canvas,
  width,
  height
) {
  if (!canvas) return;

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

function drawAIBackground(
  ctx,
  source,
  width,
  height
) {
  const mode =
    state.aiMode;

  if (mode === "original") {
    return;
  }

  ctx.save();

  if (mode === "blur") {
    ctx.filter = "blur(16px)";

    ctx.drawImage(
      source,
      -20,
      -20,
      width + 40,
      height + 40
    );

    ctx.filter = "none";
  }

  if (mode === "remove") {
    ctx.fillStyle = "#111827";
    ctx.fillRect(
      0,
      0,
      width,
      height
    );
  }

  if (mode === "color") {
    const color =
      el.backgroundColor?.value ||
      "#172033";

    ctx.fillStyle = color;

    ctx.fillRect(
      0,
      0,
      width,
      height
    );
  }

  if (
    mode === "image" &&
    state.customBackgroundImage
  ) {
    drawCoverImage(
      ctx,
      state.customBackgroundImage,
      width,
      height
    );
  }

  ctx.restore();
}

/* =========================================================
   BACKGROUND + PERSON COMPOSITE
========================================================= */

function drawBackgroundThenPerson(
  sourceCanvas,
  outputCanvas,
  width,
  height
) {
  const outputCtx =
    outputCanvas.getContext("2d");

  const personCanvas =
    document.createElement("canvas");

  personCanvas.width =
    width;

  personCanvas.height =
    height;

  const personCtx =
    personCanvas.getContext("2d");

  personCtx.drawImage(
    outputCanvas,
    0,
    0
  );

  outputCtx.clearRect(
    0,
    0,
    width,
    height
  );

  /* Background */
  if (state.aiMode === "original") {
    outputCtx.drawImage(
      sourceCanvas,
      0,
      0,
      width,
      height
    );
  }

  if (state.aiMode === "blur") {
    outputCtx.save();

    outputCtx.filter =
      "blur(18px)";

    outputCtx.drawImage(
      sourceCanvas,
      -20,
      -20,
      width + 40,
      height + 40
    );

    outputCtx.restore();
  }

  if (state.aiMode === "remove") {
    outputCtx.fillStyle =
      "#111827";

    outputCtx.fillRect(
      0,
      0,
      width,
      height
    );
  }

  if (state.aiMode === "color") {
    outputCtx.fillStyle =
      el.backgroundColor?.value ||
      "#172033";

    outputCtx.fillRect(
      0,
      0,
      width,
      height
    );
  }

  if (
    state.aiMode === "image" &&
    state.customBackgroundImage
  ) {
    drawCoverImage(
      outputCtx,
      state.customBackgroundImage,
      width,
      height
    );
  }

  /* Person */
  if (state.aiMode !== "original") {
    outputCtx.drawImage(
      personCanvas,
      0,
      0,
      width,
      height
    );
  }
}

/* =========================================================
   DRAW COVER IMAGE
========================================================= */

function drawCoverImage(
  ctx,
  image,
  width,
  height
) {
  const iw =
    image.videoWidth ||
    image.naturalWidth ||
    image.width;

  const ih =
    image.videoHeight ||
    image.naturalHeight ||
    image.height;

  if (!iw || !ih) return;

  const scale =
    Math.max(
      width / iw,
      height / ih
    );

  const dw =
    iw * scale;

  const dh =
    ih * scale;

  const dx =
    (width - dw) / 2;

  const dy =
    (height - dh) / 2;

  ctx.drawImage(
    image,
    dx,
    dy,
    dw,
    dh
  );
}

/* =========================================================
   REQUEST SEGMENTATION FRAME
========================================================= */

async function processCameraAI() {
  if (
    !state.cameraEnabled ||
    !el.mentorCameraVideo
  ) {
    return;
  }

  if (
    state.aiMode === "original"
  ) {
    show(el.mentorCameraVideo);
    hide(el.mentorAICanvas);
    return;
  }

  if (
    !state.segmentation ||
    state.segmentationRunning
  ) {
    return;
  }

  if (
    el.mentorCameraVideo.readyState <
    2
  ) {
    return;
  }

  state.segmentationRunning = true;

  try {
    await state.segmentation.send({
      image: el.mentorCameraVideo
    });
  } catch (error) {
    state.segmentationRunning = false;

    console.warn(
      "Segmentation frame failed:",
      error
    );
  }
}

/* =========================================================
   SET AI MODE
========================================================= */

function setAIMode(mode) {
  state.aiMode = mode;

  $$(".background-btn").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.background === mode
    );
  });

  if (mode === "image") {
    if (!state.customBackgroundImage) {
      toast(
        "Please upload a background image.",
        "warning"
      );

      el.backgroundImageUpload?.click();
      return;
    }
  }

  if (
    mode === "original" &&
    state.cameraEnabled
  ) {
    show(el.mentorCameraVideo);
    hide(el.mentorAICanvas);
  }

  toast(
    `Background mode: ${mode}`,
    "info"
  );

  renderCompositionFrame();
}

/* =========================================================
   CUSTOM BACKGROUND
========================================================= */

function loadCustomBackground(file) {
  if (!file) return;

  const image =
    new Image();

  image.onload = () => {
    state.customBackgroundImage =
      image;

    state.aiMode = "image";

    $$(".background-btn").forEach(
      button => {
        button.classList.toggle(
          "active",
          button.dataset.background ===
            "image"
        );
      }
    );

    toast(
      "Custom AI background loaded.",
      "success"
    );

    processCameraAI();
    renderCompositionFrame();
  };

  image.src =
    URL.createObjectURL(file);
}

/* =========================================================
   AUDIO ENGINE
========================================================= */

function ensureAudioEngine() {
  if (state.audioContext) {
    return;
  }

  const AudioCtx =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioCtx) {
    toast(
      "Web Audio is not supported.",
      "warning"
    );

    return;
  }

  state.audioContext =
    new AudioCtx();

  state.mediaDestination =
    state.audioContext.createMediaStreamDestination();

  state.mainGainNode =
    state.audioContext.createGain();

  state.micGainNode =
    state.audioContext.createGain();

  state.screenGainNode =
    state.audioContext.createGain();

  state.mainAnalyser =
    state.audioContext.createAnalyser();

  state.micAnalyser =
    state.audioContext.createAnalyser();

  state.mainAnalyser.fftSize = 256;
  state.micAnalyser.fftSize = 1024;

  state.mainDataArray =
    new Uint8Array(
      state.mainAnalyser.frequencyBinCount
    );

  state.micDataArray =
    new Uint8Array(
      state.micAnalyser.frequencyBinCount
    );

  state.mainGainNode.gain.value =
    state.mainVideoVolume;

  state.micGainNode.gain.value =
    state.micVolume;

  state.screenGainNode.gain.value =
    1;

  state.mainGainNode.connect(
    state.mainAnalyser
  );

  state.mainAnalyser.connect(
    state.audioContext.destination
  );

  state.mainGainNode.connect(
    state.mediaDestination
  );

  state.micGainNode.connect(
    state.micAnalyser
  );

  state.micAnalyser.connect(
    state.mediaDestination
  );

  state.screenGainNode.connect(
    state.mediaDestination
  );

  state.screenGainNode.connect(
    state.audioContext.destination
  );

  updateAudioIndicators();
}

/* =========================================================
   RESUME AUDIO CONTEXT
========================================================= */

async function resumeAudioContext() {
  if (
    state.audioContext &&
    state.audioContext.state ===
      "suspended"
  ) {
    try {
      await state.audioContext.resume();
    } catch {}
  }
}

/* =========================================================
   MAIN VIDEO AUDIO
========================================================= */

function connectMainVideoAudio() {
  if (
    !el.mainVideo ||
    !state.audioContext
  ) {
    return;
  }

  if (state.mainSourceNode) {
    return;
  }

  try {
    state.mainSourceNode =
      state.audioContext.createMediaElementSource(
        el.mainVideo
      );

    state.mainSourceNode.connect(
      state.mainGainNode
    );

    el.mainVideo.muted = true;

  } catch (error) {
    console.warn(
      "Main audio connection failed:",
      error
    );
  }
}

function updateMainAudioGain() {
  if (!state.mainGainNode) return;

  const enabled =
    state.mainVideoAudioEnabled;

  state.mainGainNode.gain.value =
    enabled
      ? state.mainVideoVolume
      : 0;

  updateAudioIndicators();
}

/* =========================================================
   MICROPHONE AUDIO
========================================================= */

function connectMicrophoneAudio(stream) {
  ensureAudioEngine();

  if (!stream || !state.audioContext) {
    return;
  }

  if (state.micSourceNode) {
    try {
      state.micSourceNode.disconnect();
    } catch {}
  }

  const audioTracks =
    stream.getAudioTracks();

  if (!audioTracks.length) {
    return;
  }

  try {
    state.micSourceNode =
      state.audioContext.createMediaStreamSource(
        stream
      );

    state.micSourceNode.connect(
      state.micGainNode
    );

    updateMicrophoneGain();

  } catch (error) {
    console.warn(
      "Microphone audio connection failed:",
      error
    );
  }
}

function updateMicrophoneGain() {
  if (!state.micGainNode) return;

  state.micGainNode.gain.value =
    state.micEnabled
      ? state.micVolume
      : 0;

  if (state.micMonitor) {
    connectMicMonitor();
  } else {
    disconnectMicMonitor();
  }

  updateAudioIndicators();
}

let micMonitorNode = null;

function connectMicMonitor() {
  if (
    !state.micAnalyser ||
    !state.audioContext
  ) {
    return;
  }

  if (micMonitorNode) {
    return;
  }

  try {
    micMonitorNode =
      state.audioContext.createGain();

    micMonitorNode.gain.value =
      0.85;

    state.micAnalyser.connect(
      micMonitorNode
    );

    micMonitorNode.connect(
      state.audioContext.destination
    );

  } catch (error) {
    console.warn(
      "Mic monitor failed:",
      error
    );
  }
}

function disconnectMicMonitor() {
  if (!micMonitorNode) {
    return;
  }

  try {
    micMonitorNode.disconnect();
  } catch {}

  micMonitorNode = null;
}

/* =========================================================
   SCREEN AUDIO
========================================================= */

function connectScreenAudio(stream) {
  ensureAudioEngine();

  if (!stream || !state.audioContext) {
    return;
  }

  const tracks =
    stream.getAudioTracks();

  if (!tracks.length) {
    return;
  }

  if (state.screenSourceNode) {
    try {
      state.screenSourceNode.disconnect();
    } catch {}
  }

  try {
    state.screenSourceNode =
      state.audioContext.createMediaStreamSource(
        stream
      );

    state.screenSourceNode.connect(
      state.screenGainNode
    );

  } catch (error) {
    console.warn(
      "Screen audio connection failed:",
      error
    );
  }
}

/* =========================================================
   AUDIO UI
========================================================= */

function updateAudioIndicators() {
  const micOn =
    state.micEnabled &&
    Boolean(state.micSourceNode);

  const mainOn =
    state.mainVideoAudioEnabled &&
    Boolean(state.mainSourceNode);

  updateIndicator(
    el.micIndicator,
    micOn,
    "MIC"
  );

  updateIndicator(
    el.audioIndicator,
    mainOn,
    "AUD"
  );
}

function updateIndicator(
  element,
  active,
  label
) {
  if (!element) return;

  element.classList.toggle(
    "active",
    active
  );

  element.classList.toggle(
    "inactive",
    !active
  );

  const text =
    element.querySelector(
      ".indicator-label"
    );

  if (text && label) {
    text.textContent =
      active ? label : label;
  }
}

/* =========================================================
   AUDIO METERS
========================================================= */

function calculateAnalyserLevel(
  analyser,
  dataArray
) {
  if (!analyser || !dataArray) {
    return 0;
  }

  analyser.getByteTimeDomainData(
    dataArray
  );

  let sum = 0;

  for (let i = 0; i < dataArray.length; i++) {
    const normalized =
      (dataArray[i] - 128) / 128;

    sum +=
      normalized * normalized;
  }

  const rms =
    Math.sqrt(
      sum / dataArray.length
    );

  return Math.min(
    1,
    rms * 3.5
  );
}

function updateAudioMeters() {
  const micLevel =
    calculateAnalyserLevel(
      state.micAnalyser,
      state.micDataArray
    );

  const mainLevel =
    calculateAnalyserLevel(
      state.mainAnalyser,
      state.mainDataArray
    );

  if (el.micLevelBar) {
    el.micLevelBar.style.width =
      `${Math.round(micLevel * 100)}%`;
  }

  if (el.mainAudioLevelBar) {
    el.mainAudioLevelBar.style.width =
      `${Math.round(mainLevel * 100)}%`;
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
    el.micWaveformCanvas;

  if (!canvas) return;

  const rect =
    canvas.getBoundingClientRect();

  const width =
    Math.max(
      300,
      Math.floor(rect.width || 300)
    );

  const height =
    Math.max(
      70,
      Math.floor(rect.height || 70)
    );

  if (
    canvas.width !== width ||
    canvas.height !== height
  ) {
    canvas.width = width;
    canvas.height = height;
  }

  const ctx =
    canvas.getContext("2d");

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  if (
    !state.micAnalyser ||
    !state.micDataArray
  ) {
    return;
  }

  state.micAnalyser.getByteTimeDomainData(
    state.micDataArray
  );

  ctx.beginPath();

  const sliceWidth =
    width /
    state.micDataArray.length;

  let x = 0;

  for (
    let i = 0;
    i < state.micDataArray.length;
    i++
  ) {
    const v =
      state.micDataArray[i] /
      128;

    const y =
      (v * height) / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.lineWidth = 2;
  ctx.strokeStyle =
    "rgba(96,165,250,0.95)";

  ctx.stroke();
}

/* =========================================================
   SCREEN CAPTURE
========================================================= */

async function startScreenCapture() {
  if (
    !navigator.mediaDevices?.getDisplayMedia
  ) {
    toast(
      "Screen capture is not supported.",
      "error"
    );
    return;
  }

  try {
    const stream =
      await navigator.mediaDevices.getDisplayMedia(
        {
          video: {
            frameRate: {
              ideal: state.recordingFps
            }
          },

          audio: true
        }
      );

    state.screenStream = stream;
    state.screenCaptureEnabled = true;

    if (el.screenCaptureVideo) {
      el.screenCaptureVideo.srcObject =
        stream;

      el.screenCaptureVideo.muted =
        true;

      await el.screenCaptureVideo
        .play()
        .catch(() => {});
    }

    connectScreenAudio(stream);

    updateIndicator(
      el.screenIndicator,
      true,
      "SCREEN"
    );

    updateScreenStatus(true);

    const videoTrack =
      stream.getVideoTracks()[0];

    if (videoTrack) {
      videoTrack.addEventListener(
        "ended",
        () => {
          stopScreenCapture();
        }
      );
    }

    toast(
      "Screen capture started.",
      "success"
    );

    renderCompositionFrame();

  } catch (error) {
    console.warn(
      "Screen capture cancelled:",
      error
    );

    toast(
      "Screen capture was cancelled.",
      "info"
    );
  }
}

/* =========================================================
   STOP SCREEN CAPTURE
========================================================= */

function stopScreenCapture(showToast = true) {
  if (state.screenStream) {
    state.screenStream
      .getTracks()
      .forEach(track => {
        try {
          track.stop();
        } catch {}
      });
  }

  state.screenStream = null;
  state.screenCaptureEnabled = false;

  if (el.screenCaptureVideo) {
    el.screenCaptureVideo.pause();
    el.screenCaptureVideo.srcObject =
      null;
  }

  if (state.screenSourceNode) {
    try {
      state.screenSourceNode.disconnect();
    } catch {}

    state.screenSourceNode = null;
  }

  updateIndicator(
    el.screenIndicator,
    false,
    "SCREEN"
  );

  updateScreenStatus(false);

  if (showToast) {
    toast(
      "Screen capture stopped.",
      "info"
    );
  }

  renderCompositionFrame();
}

function updateScreenStatus(active) {
  if (el.screenCaptureStatus) {
    el.screenCaptureStatus.textContent =
      active
        ? "Screen Capture Active"
        : "Screen Capture Off";
  }

  if (el.screenCaptureStatusLight) {
    el.screenCaptureStatusLight.classList.toggle(
      "active",
      active
    );
  }
}

/* =========================================================
   COMPOSITION CANVAS
========================================================= */

function ensureCompositionCanvas() {
  const quality =
    String(state.recordingQuality);

  const map = {
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

  const dimensions =
    map[quality] || map["1080"];

  state.compositionWidth =
    dimensions.width;

  state.compositionHeight =
    dimensions.height;

  if (!state.compositionCanvas) {
    state.compositionCanvas =
      document.createElement("canvas");
  }

  if (
    state.compositionCanvas.width !==
      dimensions.width ||
    state.compositionCanvas.height !==
      dimensions.height
  ) {
    state.compositionCanvas.width =
      dimensions.width;

    state.compositionCanvas.height =
      dimensions.height;
  }

  state.compositionCtx =
    state.compositionCanvas.getContext(
      "2d"
    );

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
    state.screenCaptureEnabled &&
    el.screenCaptureVideo &&
    el.screenCaptureVideo.readyState >= 2
  ) {
    drawContainVideo(
      ctx,
      el.screenCaptureVideo,
      width,
      height
    );

    return;
  }

  if (
    state.mainType === "video" &&
    el.mainVideo &&
    el.mainVideo.readyState >= 2
  ) {
    drawCoverMedia(
      ctx,
      el.mainVideo,
      width,
      height
    );

    return;
  }

  if (
    state.mainType === "image" &&
    el.mainImage &&
    el.mainImage.complete
  ) {
    drawCoverMedia(
      ctx,
      el.mainImage,
      width,
      height
    );

    return;
  }

  ctx.fillStyle =
    "#090d16";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );
}

/* =========================================================
   MEDIA DRAW HELPERS
========================================================= */

function getMediaSize(media) {
  return {
    width:
      media.videoWidth ||
      media.naturalWidth ||
      media.width ||
      1,

    height:
      media.videoHeight ||
      media.naturalHeight ||
      media.height ||
      1
  };
}

function drawCoverMedia(
  ctx,
  media,
  width,
  height
) {
  const size =
    getMediaSize(media);

  const scale =
    Math.max(
      width / size.width,
      height / size.height
    );

  const dw =
    size.width * scale;

  const dh =
    size.height * scale;

  const dx =
    (width - dw) / 2;

  const dy =
    (height - dh) / 2;

  ctx.drawImage(
    media,
    dx,
    dy,
    dw,
    dh
  );
}

function drawContainVideo(
  ctx,
  media,
  width,
  height
) {
  const size =
    getMediaSize(media);

  const scale =
    Math.min(
      width / size.width,
      height / size.height
    );

  const dw =
    size.width * scale;

  const dh =
    size.height * scale;

  const dx =
    (width - dw) / 2;

  const dy =
    (height - dh) / 2;

  ctx.fillStyle =
    "#000";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  ctx.drawImage(
    media,
    dx,
    dy,
    dw,
    dh
  );
}

/* =========================================================
   MENTOR OVERLAY GEOMETRY
========================================================= */

function getMentorGeometry() {
  if (
    !el.mentorCard ||
    !el.stage
  ) {
    return null;
  }

  const stageRect =
    el.stage.getBoundingClientRect();

  const cardRect =
    el.mentorCard.getBoundingClientRect();

  if (
    !stageRect.width ||
    !stageRect.height
  ) {
    return null;
  }

  const x =
    (cardRect.left -
      stageRect.left) /
    stageRect.width;

  const y =
    (cardRect.top -
      stageRect.top) /
    stageRect.height;

  const width =
    cardRect.width /
    stageRect.width;

  const height =
    cardRect.height /
    stageRect.height;

  return {
    x,
    y,
    width,
    height
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
  const geometry =
    getMentorGeometry();

  if (!geometry) {
    return;
  }

  const x =
    geometry.x * width;

  const y =
    geometry.y * height;

  const w =
    geometry.width * width;

  const h =
    geometry.height * height;

  ctx.save();

  ctx.beginPath();

  const radius =
    Math.min(
      24,
      w * 0.06
    );

  roundRect(
    ctx,
    x,
    y,
    w,
    h,
    radius
  );

  ctx.clip();

  let source = null;

  if (
    state.cameraEnabled &&
    state.aiMode !== "original" &&
    el.mentorAICanvas &&
    el.mentorAICanvas.width
  ) {
    source =
      el.mentorAICanvas;
  } else if (
    state.cameraEnabled &&
    el.mentorCameraVideo &&
    el.mentorCameraVideo.readyState >= 2
  ) {
    source =
      el.mentorCameraVideo;
  } else if (
    state.mentorType === "video" &&
    el.mentorVideo &&
    el.mentorVideo.readyState >= 2
  ) {
    source =
      el.mentorVideo;
  }

  if (source) {
    drawCoverMedia(
      ctx,
      source,
      w,
      h
    );
  } else {
    ctx.fillStyle =
      "#111827";

    ctx.fillRect(
      x,
      y,
      w,
      h
    );
  }

  ctx.restore();

  ctx.save();

  ctx.strokeStyle =
    "rgba(255,255,255,0.15)";

  ctx.lineWidth =
    Math.max(
      1,
      width / 1000
    );

  roundRect(
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

/* =========================================================
   ROUND RECT
========================================================= */

function roundRect(
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
  const text =
    state.brandName ||
    "SNK Mentor Studio";

  ctx.save();

  const paddingX =
    Math.max(18, width * 0.012);

  const paddingY =
    Math.max(10, height * 0.012);

  const fontSize =
    Math.max(18, width * 0.018);

  ctx.font =
    `600 ${fontSize}px Inter, Arial, sans-serif`;

  const metrics =
    ctx.measureText(text);

  const boxWidth =
    metrics.width +
    paddingX * 2;

  const boxHeight =
    fontSize +
    paddingY * 2;

  const x =
    width * 0.025;

  const y =
    height -
    boxHeight -
    height * 0.025;

  ctx.fillStyle =
    "rgba(8,12,20,0.76)";

  roundRect(
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
    text,
    x + paddingX,
    y +
      boxHeight / 2 +
      fontSize * 0.35
  );

  ctx.restore();
}

/* =========================================================
   RECORDING OVERLAY IN CANVAS
========================================================= */

function drawRecordingCanvasOverlay(
  ctx,
  width,
  height
) {
  if (!state.recordingActive) {
    return;
  }

  const timer =
    getRecordingElapsed();

  const x =
    width * 0.025;

  const y =
    height * 0.035;

  ctx.save();

  ctx.fillStyle =
    "rgba(5,8,14,0.72)";

  roundRect(
    ctx,
    x,
    y,
    width * 0.16,
    height * 0.055,
    12
  );

  ctx.fill();

  ctx.fillStyle =
    "#ef4444";

  ctx.beginPath();

  ctx.arc(
    x + width * 0.018,
    y + height * 0.027,
    Math.max(5, width * 0.004),
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.fillStyle =
    "#fff";

  ctx.font =
    `700 ${Math.max(
      16,
      width * 0.014
    )}px Inter, Arial`;

  ctx.fillText(
    state.recordingPaused
      ? `PAUSED ${timer}`
      : `REC ${timer}`,
    x + width * 0.032,
    y + height * 0.038
  );

  ctx.restore();
}

/* =========================================================
   TELEPROMPTER ON CANVAS
========================================================= */

function drawTeleprompterOnCanvas(
  ctx,
  width,
  height
) {
  if (!state.recordingActive) {
    return;
  }

  const include =
    el.includeTeleprompterInRecording
      ?.checked;

  if (
    !include &&
    !state.showTeleprompterRecording
  ) {
    return;
  }

  const text =
    state.teleprompterText
      ?.trim();

  if (!text) {
    return;
  }

  const boxWidth =
    width * 0.72;

  const boxHeight =
    height * 0.18;

  const x =
    (width - boxWidth) / 2;

  const y =
    height * 0.08;

  ctx.save();

  ctx.fillStyle =
    `rgba(0,0,0,${Math.min(
      0.92,
      Math.max(
        0.15,
        state.teleprompterOpacity
      )
    )})`;

  roundRect(
    ctx,
    x,
    y,
    boxWidth,
    boxHeight,
    18
  );

  ctx.fill();

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    `600 ${Math.max(
      20,
      state.teleprompterFontSize
    )}px Inter, Arial, sans-serif`;

  const lines =
    wrapText(
      ctx,
      text,
      boxWidth - 50
    );

  const lineHeight =
    Math.max(
      28,
      state.teleprompterFontSize * 1.35
    );

  const visibleLines =
    lines.slice(0, 4);

  visibleLines.forEach(
    (line, index) => {
      ctx.fillText(
        line,
        x + 25,
        y +
          45 +
          index * lineHeight
      );
    }
  );

  ctx.restore();
}

/* =========================================================
   TEXT WRAP
========================================================= */

function wrapText(
  ctx,
  text,
  maxWidth
) {
  const words =
    text.split(/\s+/);

  const lines = [];

  let line = "";

  words.forEach(word => {
    const test =
      line
        ? `${line} ${word}`
        : word;

    if (
      ctx.measureText(test).width >
        maxWidth &&
      line
    ) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });

  if (line) {
    lines.push(line);
  }

  return lines;
}

/* =========================================================
   RENDER FRAME
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

  drawTeleprompterOnCanvas(
    ctx,
    width,
    height
  );

  drawBrandBadge(
    ctx,
    width,
    height
  );

  drawRecordingCanvasOverlay(
    ctx,
    width,
    height
  );

  updateStageBadges();

  return canvas;
}

/* =========================================================
   CONTINUOUS RENDER LOOP
========================================================= */

function startRenderLoop() {
  if (state.renderRunning) {
    return;
  }

  state.renderRunning = true;

  const loop = () => {
    if (!state.renderRunning) {
      return;
    }

    processCameraAI();

    renderCompositionFrame();

    state.renderAnimationId =
      requestAnimationFrame(loop);
  };

  loop();
}

function stopRenderLoop() {
  state.renderRunning = false;

  if (state.renderAnimationId) {
    cancelAnimationFrame(
      state.renderAnimationId
    );

    state.renderAnimationId = null;
  }
}

/* =========================================================
   STAGE BADGES
========================================================= */

function updateStageBadges() {
  setText(
    el.stageResolutionBadge,
    `${state.recordingQuality}p`
  );

  setText(
    el.stageFpsBadge,
    `${state.recordingFps} FPS`
  );

  setText(
    el.stageSourceBadge,
    state.screenCaptureEnabled
      ? "SCREEN"
      : state.mainType === "video"
      ? "VIDEO"
      : state.mainType === "image"
      ? "IMAGE"
      : "STUDIO"
  );
}

function updateStageSourceBadge(text) {
  setText(
    el.stageSourceBadge,
    text
  );
}

/* =========================================================
   RECORDING MIME TYPES
========================================================= */

function getSupportedMimeTypes(
  requestedFormat = "auto"
) {
  const candidates = [];

  if (
    requestedFormat === "mp4" ||
    requestedFormat === "auto"
  ) {
    candidates.push(
      "video/mp4;codecs=\"avc1.42E01E,mp4a.40.2\"",
      "video/mp4"
    );
  }

  if (
    requestedFormat === "webm-vp9" ||
    requestedFormat === "auto"
  ) {
    candidates.push(
      "video/webm;codecs=vp9,opus"
    );
  }

  if (
    requestedFormat === "webm-vp8" ||
    requestedFormat === "auto"
  ) {
    candidates.push(
      "video/webm;codecs=vp8,opus"
    );
  }

  candidates.push(
    "video/webm"
  );

  if (
    typeof MediaRecorder ===
      "undefined" ||
    typeof MediaRecorder.isTypeSupported !==
      "function"
  ) {
    return [];
  }

  return candidates.filter(
    mime =>
      MediaRecorder.isTypeSupported(
        mime
      )
  );
}

function chooseRecordingMimeType() {
  const requested =
    state.recordingFormat ||
    "auto";

  const supported =
    getSupportedMimeTypes(
      requested
    );

  if (!supported.length) {
    return "";
  }

  return supported[0];
}

/* =========================================================
   RECORDING RESOLUTION
========================================================= */

function getRecordingDimensions() {
  const quality =
    String(
      state.recordingQuality
    );

  if (quality === "720") {
    return {
      width: 1280,
      height: 720
    };
  }

  if (quality === "1440") {
    return {
      width: 2560,
      height: 1440
    };
  }

  return {
    width: 1920,
    height: 1080
  };
}

/* =========================================================
   RECORDING START
========================================================= */

async function startRecording() {
  if (state.recordingActive) {
    return;
  }

  if (
    typeof MediaRecorder ===
    "undefined"
  ) {
    toast(
      "MediaRecorder is not supported in this browser.",
      "error"
    );
    return;
  }

  await resumeAudioContext();

  readRecordingSettings();

  const canvas =
    ensureCompositionCanvas();

  renderCompositionFrame();

  const fps =
    Number(state.recordingFps) || 30;

  let stream;

  try {
    stream =
      canvas.captureStream(fps);
  } catch (error) {
    toast(
      "Canvas recording is not supported.",
      "error"
    );
    return;
  }

  ensureAudioEngine();

  if (
    state.mediaDestination &&
    state.mediaDestination.stream
  ) {
    state.mediaDestination.stream
      .getAudioTracks()
      .forEach(track => {
        stream.addTrack(track);
      });
  }

  const mimeType =
    chooseRecordingMimeType();

  if (!mimeType) {
    toast(
      "No supported recording format was found in this browser.",
      "error"
    );
    return;
  }

  state.recordingMimeType =
    mimeType;

  state.recordingChunks = [];

  try {
    state.mediaRecorder =
      new MediaRecorder(
        stream,
        {
          mimeType,
          videoBitsPerSecond:
            getVideoBitrate()
        }
      );
  } catch (error) {
    console.error(error);

    toast(
      "Recorder could not be created.",
      "error"
    );

    return;
  }

  state.recordingActive = true;
  state.recordingPaused = false;

  state.recordingStartedAt =
    performance.now();

  state.recordingPausedAt = 0;
  state.recordingPausedTotal = 0;

  state.recordingName =
    getRecordingName();

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

  state.mediaRecorder.onstop =
    async () => {
      await finalizeRecording();
    };

  state.mediaRecorder.onerror =
    event => {
      console.error(
        "MediaRecorder error:",
        event.error
      );

      toast(
        "Recording error occurred.",
        "error"
      );
    };

  state.mediaRecorder.onpause =
    () => {
      state.recordingPaused = true;
      updateRecordingUI();
    };

  state.mediaRecorder.onresume =
    () => {
      state.recordingPaused = false;
      updateRecordingUI();
    };

  state.mediaRecorder.start(250);

  startRecordingTimer();

  showRecordingStatusBar();

  updateRecordingUI();

  updateRecordingIndicators();

  if (
    state.autoStartTeleprompter
  ) {
    playTeleprompter();
  }

  toast(
    `Recording started — ${mimeType}`,
    "success"
  );
}

/* =========================================================
   BITRATE
========================================================= */

function getVideoBitrate() {
  const quality =
    String(
      state.recordingQuality
    );

  const fps =
    Number(state.recordingFps) || 30;

  if (quality === "1440") {
    return fps >= 60
      ? 18000000
      : 14000000;
  }

  if (quality === "720") {
    return fps >= 60
      ? 8000000
      : 6000000;
  }

  return fps >= 60
    ? 14000000
    : 10000000;
}

/* =========================================================
   RECORDING SETTINGS
========================================================= */

function readRecordingSettings() {
  const quality =
    el.recordingQuality?.value ||
    el.recordingQualitySide?.value ||
    el.settingsRecordingQuality?.value;

  if (quality) {
    state.recordingQuality =
      String(quality);
  }

  const fps =
    el.recordingFps?.value ||
    el.recordingFpsSide?.value ||
    el.settingsRecordingFps?.value;

  if (fps) {
    state.recordingFps =
      Number(fps);
  }

  const format =
    el.recordingFormat?.value ||
    el.recordingFormatSide?.value;

  if (format) {
    state.recordingFormat =
      format;
  }

  const filename =
    el.recordingFileName?.value ||
    el.recordingFileNameSide?.value;

  if (filename?.trim()) {
    state.recordingName =
      filename.trim();
  }

  saveSettings();
  updateStageBadges();
}

function getRecordingName() {
  const name =
    el.recordingFileName?.value ||
    el.recordingFileNameSide?.value ||
    state.recordingName ||
    "Mentor Recording";

  return sanitizeFileName(
    name
  );
}

/* =========================================================
   RECORDING TIMER
========================================================= */

function getRecordingElapsed() {
  if (!state.recordingStartedAt) {
    return "00:00";
  }

  let elapsed =
    performance.now() -
    state.recordingStartedAt;

  elapsed -=
    state.recordingPausedTotal || 0;

  if (
    state.recordingPaused &&
    state.recordingPausedAt
  ) {
    elapsed -=
      performance.now() -
      state.recordingPausedAt;
  }

  return formatTime(
    Math.max(
      0,
      elapsed / 1000
    )
  );
}

function getRecordingElapsedSeconds() {
  if (!state.recordingStartedAt) {
    return 0;
  }

  let elapsed =
    performance.now() -
    state.recordingStartedAt;

  elapsed -=
    state.recordingPausedTotal || 0;

  if (
    state.recordingPaused &&
    state.recordingPausedAt
  ) {
    elapsed -=
      performance.now() -
      state.recordingPausedAt;
  }

  return Math.max(
    0,
    elapsed / 1000
  );
}

function startRecordingTimer() {
  stopRecordingTimer();

  state.recordingTimerId =
    setInterval(() => {
      const value =
        getRecordingElapsed();

      setText(
        el.recordingTimer,
        value
      );

      setText(
        el.recordingOverlayTimer,
        value
      );
    }, 100);

  setText(
    el.recordingTimer,
    "00:00"
  );
}

function stopRecordingTimer() {
  if (state.recordingTimerId) {
    clearInterval(
      state.recordingTimerId
    );

    state.recordingTimerId =
      null;
  }
}

/* =========================================================
   RECORDING PAUSE
========================================================= */

function pauseRecording() {
  if (
    !state.mediaRecorder ||
    !state.recordingActive
  ) {
    return;
  }

  if (
    state.mediaRecorder.state !==
    "recording"
  ) {
    return;
  }

  state.recordingPausedAt =
    performance.now();

  state.mediaRecorder.pause();

  updateRecordingUI();

  toast(
    "Recording paused.",
    "info"
  );
}

/* =========================================================
   RECORDING RESUME
========================================================= */

function resumeRecording() {
  if (
    !state.mediaRecorder ||
    !state.recordingActive
  ) {
    return;
  }

  if (
    state.mediaRecorder.state !==
    "paused"
  ) {
    return;
  }

  if (state.recordingPausedAt) {
    state.recordingPausedTotal +=
      performance.now() -
      state.recordingPausedAt;

    state.recordingPausedAt = 0;
  }

  state.mediaRecorder.resume();

  updateRecordingUI();

  toast(
    "Recording resumed.",
    "success"
  );
}

/* =========================================================
   RECORDING STOP
========================================================= */

function stopRecording() {
  if (
    !state.mediaRecorder ||
    !state.recordingActive
  ) {
    return;
  }

  try {
    if (
      state.mediaRecorder.state !==
      "inactive"
    ) {
      state.mediaRecorder.stop();
    }
  } catch (error) {
    console.warn(
      "Stop recording failed:",
      error
    );

    finalizeRecording();
  }

  toast(
    "Finalizing recording...",
    "info"
  );
}

/* =========================================================
   FINALIZE RECORDING
========================================================= */

async function finalizeRecording() {
  stopRecordingTimer();

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

  state.recordingBlob =
    blob;

  state.previewBlob =
    blob;

  if (state.recordingUrl) {
    URL.revokeObjectURL(
      state.recordingUrl
    );
  }

  state.recordingUrl =
    URL.createObjectURL(
      blob
    );

  state.previewUrl =
    state.recordingUrl;

  state.recordingActive = false;
  state.recordingPaused = false;

  state.recordingChunks = [];

  hideRecordingStatusBar();

  updateRecordingUI();

  await createRecordingHistoryItem(
    blob,
    state.recordingName,
    mimeType
  );

  await openRecordingPreview(
    blob,
    state.currentPreviewRecordId
  );

  toast(
    "Recording completed.",
    "success"
  );
}

/* =========================================================
   RECORDING UI
========================================================= */

function showRecordingStatusBar() {
  if (!el.recordingStatusBar) {
    return;
  }

  el.recordingStatusBar.classList.add(
    "visible"
  );
}

function hideRecordingStatusBar() {
  if (!el.recordingStatusBar) {
    return;
  }

  el.recordingStatusBar.classList.remove(
    "visible"
  );
}

function updateRecordingUI() {
  const active =
    state.recordingActive;

  const paused =
    state.recordingPaused;

  if (el.pauseRecordingBtn) {
    show(
      el.pauseRecordingBtn,
      active && !paused
        ? "inline-flex"
        : "none"
    );
  }

  if (el.resumeRecordingBtn) {
    show(
      el.resumeRecordingBtn,
      active && paused
        ? "inline-flex"
        : "none"
    );
  }

  if (el.stopRecordingBtn) {
    show(
      el.stopRecordingBtn,
      active
        ? "inline-flex"
        : "none"
    );
  }

  if (el.recordBtn) {
    el.recordBtn.classList.toggle(
      "recording",
      active
    );

    el.recordBtn.textContent =
      active
        ? paused
          ? "Resume"
          : "Recording"
        : "Record";
  }

  if (el.recordToolbarBtn) {
    el.recordToolbarBtn.textContent =
      active
        ? paused
          ? "Resume"
          : "Recording"
        : "Record";
  }

  if (el.recordingStatusDot) {
    el.recordingStatusDot.classList.toggle(
      "paused",
      paused
    );

    el.recordingStatusDot.classList.toggle(
      "active",
      active
    );
  }

  setText(
    el.recordingStatusText,
    active
      ? paused
        ? "Recording Paused"
        : "Recording"
      : "Ready"
  );

  if (el.recordingOverlay) {
    show(
      el.recordingOverlay,
      active
        ? "flex"
        : "none"
    );
  }
}

function updateRecordingIndicators() {
  updateIndicator(
    el.audioIndicator,
    Boolean(
      state.mediaDestination
    ),
    "AUD"
  );
}

/* =========================================================
   RECORDING FORMAT LABEL
========================================================= */

function getFileExtension(mimeType) {
  if (
    mimeType
      ?.toLowerCase()
      .includes("mp4")
  ) {
    return "mp4";
  }

  return "webm";
}

/* =========================================================
   INDEXED DB
========================================================= */

let databasePromise = null;

function openDatabase() {
  if (databasePromise) {
    return databasePromise;
  }

  databasePromise =
    new Promise(
      (resolve, reject) => {
        if (!window.indexedDB) {
          reject(
            new Error(
              "IndexedDB not supported."
            )
          );
          return;
        }

        const request =
          indexedDB.open(
            state.dbName,
            state.dbVersion
          );

        request.onupgradeneeded =
          event => {
            const db =
              event.target.result;

            if (
              !db.objectStoreNames.contains(
                state.dbStore
              )
            ) {
              const store =
                db.createObjectStore(
                  state.dbStore,
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
            resolve(
              event.target.result
            );
          };

        request.onerror =
          () => {
            reject(
              request.error
            );
          };
      }
    );

  return databasePromise;
}

/* =========================================================
   SAVE RECORDING TO DB
========================================================= */

async function saveRecordingToDB(record) {
  try {
    const db =
      await openDatabase();

    await new Promise(
      (resolve, reject) => {
        const tx =
          db.transaction(
            state.dbStore,
            "readwrite"
          );

        tx.objectStore(
          state.dbStore
        ).put(record);

        tx.oncomplete =
          () => resolve();

        tx.onerror =
          () => reject(
            tx.error
          );
      }
    );

    return true;

  } catch (error) {
    console.warn(
      "IndexedDB save failed:",
      error
    );

    return false;
  }
}

/* =========================================================
   LOAD RECORDINGS
========================================================= */

async function loadRecordingsFromDB() {
  try {
    const db =
      await openDatabase();

    const records =
      await new Promise(
        (resolve, reject) => {
          const tx =
            db.transaction(
              state.dbStore,
              "readonly"
            );

          const request =
            tx.objectStore(
              state.dbStore
            ).getAll();

          request.onsuccess =
            () =>
              resolve(
                request.result || []
              );

          request.onerror =
            () =>
              reject(
                request.error
              );
        }
      );

    state.recordings =
      records.sort(
        (a, b) =>
          b.createdAt -
          a.createdAt
      );

    renderRecordingHistory();

  } catch (error) {
    console.warn(
      "Recording history load failed:",
      error
    );

    state.recordings = [];

    renderRecordingHistory();
  }
}

/* =========================================================
   DELETE DB RECORDING
========================================================= */

async function deleteRecordingFromDB(
  id
) {
  try {
    const db =
      await openDatabase();

    await new Promise(
      (resolve, reject) => {
        const tx =
          db.transaction(
            state.dbStore,
            "readwrite"
          );

        tx.objectStore(
          state.dbStore
        ).delete(id);

        tx.oncomplete =
          () => resolve();

        tx.onerror =
          () => reject(
            tx.error
          );
      }
    );

    state.recordings =
      state.recordings.filter(
        record =>
          record.id !== id
      );

    renderRecordingHistory();

    return true;

  } catch (error) {
    console.warn(
      "Recording delete failed:",
      error
    );

    return false;
  }
}

/* =========================================================
   CREATE HISTORY ITEM
========================================================= */

async function createRecordingHistoryItem(
  blob,
  name,
  mimeType
) {
  const id =
    `rec_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;

  const dimensions =
    getRecordingDimensions();

  const duration =
    await getBlobDuration(
      blob
    );

  const record = {
    id,
    name:
      sanitizeFileName(
        name ||
          "Mentor Recording"
      ),

    createdAt:
      Date.now(),

    duration,
    size:
      blob.size,

    mimeType,

    width:
      dimensions.width,

    height:
      dimensions.height,

    fps:
      state.recordingFps,

    quality:
      state.recordingQuality,

    blob
  };

  state.recordings.unshift(
    record
  );

  state.currentPreviewRecordId =
    id;

  await saveRecordingToDB(
    record
  );

  renderRecordingHistory();

  return record;
}

/* =========================================================
   BLOB DURATION
========================================================= */

function getBlobDuration(blob) {
  return new Promise(resolve => {
    const url =
      URL.createObjectURL(blob);

    const video =
      document.createElement(
        "video"
      );

    video.preload = "metadata";

    video.onloadedmetadata =
      () => {
        const duration =
          Number.isFinite(
            video.duration
          )
            ? video.duration
            : 0;

        URL.revokeObjectURL(
          url
        );

        resolve(duration);
      };

    video.onerror = () => {
      URL.revokeObjectURL(
        url
      );

      resolve(0);
    };

    video.src = url;
  });
}

/* =========================================================
   RECORDING HISTORY UI
========================================================= */

function renderRecordingHistory() {
  if (!el.recordingHistoryList) {
    return;
  }

  el.recordingHistoryList.innerHTML =
    "";

  if (!state.recordings.length) {
    const empty =
      document.createElement("div");

    empty.className =
      "recording-history-empty";

    empty.textContent =
      "No recordings yet.";

    el.recordingHistoryList.appendChild(
      empty
    );

    return;
  }

  state.recordings.forEach(
    record => {
      const item =
        document.createElement(
          "div"
        );

      item.className =
        "history-item";

      item.dataset.id =
        record.id;

      const info =
        document.createElement(
          "div"
        );

      info.className =
        "history-info";

      const name =
        document.createElement(
          "div"
        );

      name.className =
        "history-name";

      name.textContent =
        record.name;

      const meta =
        document.createElement(
          "div"
        );

      meta.className =
        "history-meta";

      meta.textContent =
        `${formatTime(
          record.duration
        )} • ${formatFileSize(
          record.size
        )} • ${record.quality}p`;

      const actions =
        document.createElement(
          "div"
        );

      actions.className =
        "history-actions";

      const previewBtn =
        createHistoryButton(
          "Preview",
          "preview"
        );

      const downloadBtn =
        createHistoryButton(
          "Download",
          "download"
        );

      const renameBtn =
        createHistoryButton(
          "Rename",
          "rename"
        );

      const deleteBtn =
        createHistoryButton(
          "Delete",
          "delete"
        );

      previewBtn.addEventListener(
        "click",
        () =>
          openHistoryPreview(
            record.id
          )
      );

      downloadBtn.addEventListener(
        "click",
        () =>
          downloadHistoryRecord(
            record.id
          )
      );

      renameBtn.addEventListener(
        "click",
        () =>
          renameHistoryRecord(
            record.id
          )
      );

      deleteBtn.addEventListener(
        "click",
        () =>
          deleteHistoryRecord(
            record.id
          )
      );

      actions.append(
        previewBtn,
        downloadBtn,
        renameBtn,
        deleteBtn
      );

      info.append(
        name,
        meta
      );

      item.append(
        info,
        actions
      );

      el.recordingHistoryList.appendChild(
        item
      );
    }
  );
}

function createHistoryButton(
  text,
  type
) {
  const button =
    document.createElement("button");

  button.type = "button";
  button.className =
    `history-action ${type}`;

  button.textContent =
    text;

  return button;
}

/* =========================================================
   OPEN RECORDING PREVIEW
========================================================= */

async function openRecordingPreview(
  blob,
  recordId = null
) {
  if (!blob) return;

  if (state.previewUrl) {
    try {
      URL.revokeObjectURL(
        state.previewUrl
      );
    } catch {}
  }

  state.previewBlob =
    blob;

  state.previewUrl =
    URL.createObjectURL(
      blob
    );

  state.currentPreviewRecordId =
    recordId ||
    state.currentPreviewRecordId;

  if (
    el.recordingPreviewVideo
  ) {
    el.recordingPreviewVideo.src =
      state.previewUrl;

    el.recordingPreviewVideo.load();

    el.recordingPreviewVideo.currentTime =
      0;
  }

  if (el.recordingNameInput) {
    const record =
      state.recordings.find(
        item =>
          item.id ===
          state.currentPreviewRecordId
      );

    el.recordingNameInput.value =
      record?.name ||
      state.recordingName ||
      "Mentor Recording";
  }

  resetTrimControls();

  updateRecordingFileInfo(
    blob
  );

  showModal(
    el.recordingPreviewModal
  );
}

/* =========================================================
   OPEN HISTORY PREVIEW
========================================================= */

async function openHistoryPreview(
  id
) {
  const record =
    state.recordings.find(
      item =>
        item.id === id
    );

  if (!record) {
    toast(
      "Recording not found.",
      "error"
    );
    return;
  }

  state.currentPreviewRecordId =
    id;

  await openRecordingPreview(
    record.blob,
    id
  );
}

/* =========================================================
   FILE INFO
========================================================= */

function updateRecordingFileInfo(
  blob
) {
  if (!el.recordingFileInfo) {
    return;
  }

  const mime =
    blob.type ||
    "video/webm";

  const dimensions =
    getRecordingDimensions();

  el.recordingFileInfo.innerHTML =
    `
      <div class="recording-meta-grid">
        <div class="recording-meta">
          <span class="recording-meta-label">Size</span>
          <span class="recording-meta-value">
            ${formatFileSize(blob.size)}
          </span>
        </div>

        <div class="recording-meta">
          <span class="recording-meta-label">Format</span>
          <span class="recording-meta-value">
            ${mime}
          </span>
        </div>

        <div class="recording-meta">
          <span class="recording-meta-label">Resolution</span>
          <span class="recording-meta-value">
            ${dimensions.width} × ${dimensions.height}
          </span>
        </div>

        <div class="recording-meta">
          <span class="recording-meta-label">FPS</span>
          <span class="recording-meta-value">
            ${state.recordingFps}
          </span>
        </div>
      </div>
    `;
}

/* =========================================================
   PREVIEW VIDEO METADATA
========================================================= */

function handlePreviewMetadata() {
  if (!el.recordingPreviewVideo) {
    return;
  }

  const duration =
    Number.isFinite(
      el.recordingPreviewVideo.duration
    )
      ? el.recordingPreviewVideo.duration
      : 0;

  state.previewDuration =
    duration;

  state.trimStart = 0;
  state.trimEnd = duration;

  if (el.recordingTrimStart) {
    el.recordingTrimStart.min =
      "0";

    el.recordingTrimStart.max =
      String(duration);

    el.recordingTrimStart.step =
      "0.01";

    el.recordingTrimStart.value =
      "0";
  }

  if (el.recordingTrimEnd) {
    el.recordingTrimEnd.min =
      "0";

    el.recordingTrimEnd.max =
      String(duration);

    el.recordingTrimEnd.step =
      "0.01";

    el.recordingTrimEnd.value =
      String(duration);
  }

  updateTrimUI();

  setText(
    el.recordingDuration,
    formatTime(duration)
  );
}

/* =========================================================
   PREVIEW CURRENT TIME
========================================================= */

function handlePreviewTimeUpdate() {
  if (!el.recordingPreviewVideo) {
    return;
  }

  setText(
    el.recordingCurrentTime,
    formatTime(
      el.recordingPreviewVideo.currentTime
    )
  );
}

/* =========================================================
   PREVIEW PLAY
========================================================= */

function playPreview() {
  if (!el.recordingPreviewVideo) {
    return;
  }

  el.recordingPreviewVideo
    .play()
    .catch(() => {});
}

function pausePreview() {
  if (!el.recordingPreviewVideo) {
    return;
  }

  el.recordingPreviewVideo.pause();
}

/* =========================================================
   TRIM CONTROLS
========================================================= */

function updateTrimFromStart(value) {
  let start =
    Number(value) || 0;

  const end =
    state.trimEnd ||
    state.previewDuration;

  if (start >= end) {
    start =
      Math.max(
        0,
        end - 0.1
      );
  }

  state.trimStart =
    start;

  if (el.recordingTrimStart) {
    el.recordingTrimStart.value =
      String(start);
  }

  updateTrimUI();
}

function updateTrimFromEnd(value) {
  let end =
    Number(value) || 0;

  const start =
    state.trimStart || 0;

  if (end <= start) {
    end =
      Math.min(
        state.previewDuration,
        start + 0.1
      );
  }

  state.trimEnd =
    end;

  if (el.recordingTrimEnd) {
    el.recordingTrimEnd.value =
      String(end);
  }

  updateTrimUI();
}

function updateTrimUI() {
  setText(
    el.recordingTrimStartTime,
    formatTime(
      state.trimStart
    )
  );

  setText(
    el.recordingTrimEndTime,
    formatTime(
      state.trimEnd
    )
  );
}

/* =========================================================
   RESET TRIM
========================================================= */

function resetTrimControls() {
  state.trimStart = 0;
  state.trimEnd =
    state.previewDuration || 0;

  if (el.recordingTrimStart) {
    el.recordingTrimStart.value =
      "0";
  }

  if (el.recordingTrimEnd) {
    el.recordingTrimEnd.value =
      String(
        state.previewDuration || 0
      );
  }

  updateTrimUI();
}

/* =========================================================
   APPLY TRIM
========================================================= */

async function applyTrim() {
  if (!state.previewBlob) {
    toast(
      "No recording selected.",
      "warning"
    );
    return;
  }

  const start =
    Number(state.trimStart) || 0;

  const end =
    Number(state.trimEnd) ||
    state.previewDuration;

  if (
    end <= start ||
    end - start < 0.1
  ) {
    toast(
      "Invalid trim range.",
      "error"
    );
    return;
  }

  if (
    start === 0 &&
    end >=
      state.previewDuration - 0.05
  ) {
    toast(
      "No trim is needed.",
      "info"
    );
    return;
  }

  toast(
    "Creating trimmed recording...",
    "info"
  );

  try {
    const trimmed =
      await trimVideoBlob(
        state.previewBlob,
        start,
        end
      );

    if (!trimmed) {
      throw new Error(
        "Trim operation failed."
      );
    }

    state.previewBlob =
      trimmed;

    if (state.previewUrl) {
      try {
        URL.revokeObjectURL(
          state.previewUrl
        );
      } catch {}
    }

    state.previewUrl =
      URL.createObjectURL(
        trimmed
      );

    if (
      el.recordingPreviewVideo
    ) {
      el.recordingPreviewVideo.src =
        state.previewUrl;

      el.recordingPreviewVideo.load();
    }

    const record =
      state.recordings.find(
        item =>
          item.id ===
          state.currentPreviewRecordId
      );

    if (record) {
      record.blob =
        trimmed;

      record.size =
        trimmed.size;

      record.duration =
        Math.max(
          0,
          end - start
        );

      record.mimeType =
        trimmed.type ||
        record.mimeType;

      await saveRecordingToDB(
        record
      );

      renderRecordingHistory();
    }

    toast(
      "Trim applied successfully.",
      "success"
    );

  } catch (error) {
    console.error(
      "Trim failed:",
      error
    );

    toast(
      "Trim could not be completed in this browser.",
      "error"
    );
  }
}

/* =========================================================
   TRIM VIDEO USING CANVAS + MEDIARECORDER
========================================================= */

async function trimVideoBlob(
  blob,
  start,
  end
) {
  if (
    typeof MediaRecorder ===
    "undefined"
  ) {
    return null;
  }

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

  video.preload =
    "auto";

  video.playsInline =
    true;

  video.muted =
    true;

  await waitForVideoMetadata(
    video
  );

  const width =
    video.videoWidth ||
    1280;

  const height =
    video.videoHeight ||
    720;

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
    Number(state.recordingFps) ||
    30;

  const stream =
    canvas.captureStream(
      fps
    );

  const mime =
    getSupportedMimeTypes(
      blob.type?.includes("mp4")
        ? "mp4"
        : "auto"
    )[0] ||
    "video/webm";

  let recorder;

  try {
    recorder =
      new MediaRecorder(
        stream,
        {
          mimeType,
          videoBitsPerSecond:
            getVideoBitrate()
        }
      );
  } catch {
    URL.revokeObjectURL(
      sourceUrl
    );

    return null;
  }

  const chunks = [];

  recorder.ondataavailable =
    event => {
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
    new Promise(resolve => {
      recorder.onstop =
        resolve;
    });

  recorder.start(100);

  video.currentTime =
    start;

  await waitForSeek(video);

  const renderTrim =
    () => {
      if (
        video.currentTime >=
        end
      ) {
        try {
          recorder.stop();
        } catch {}

        return;
      }

      ctx.drawImage(
        video,
        0,
        0,
        width,
        height
      );

      requestAnimationFrame(
        renderTrim
      );
    };

  video.play().catch(() => {});

  renderTrim();

  await stopped;

  try {
    video.pause();
  } catch {}

  URL.revokeObjectURL(
    sourceUrl
  );

  if (!chunks.length) {
    return null;
  }

  return new Blob(
    chunks,
    {
      type: mime
    }
  );
}

/* =========================================================
   VIDEO WAIT HELPERS
========================================================= */

function waitForVideoMetadata(
  video
) {
  return new Promise(
    (resolve, reject) => {
      if (
        video.readyState >= 1
      ) {
        resolve();
        return;
      }

      video.onloadedmetadata =
        () => resolve();

      video.onerror =
        () =>
          reject(
            new Error(
              "Video metadata failed."
            )
          );
    }
  );
}

function waitForSeek(video) {
  return new Promise(resolve => {
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
  });
}

/* =========================================================
   RENAME CURRENT RECORDING
========================================================= */

async function renameCurrentRecording() {
  const id =
    state.currentPreviewRecordId;

  if (!id) {
    toast(
      "No recording selected.",
      "warning"
    );
    return;
  }

  const record =
    state.recordings.find(
      item =>
        item.id === id
    );

  if (!record) {
    return;
  }

  const name =
    sanitizeFileName(
      el.recordingNameInput?.value ||
        ""
    );

  if (!name) {
    toast(
      "Please enter a recording name.",
      "warning"
    );
    return;
  }

  record.name =
    name;

  await saveRecordingToDB(
    record
  );

  state.recordingName =
    name;

  renderRecordingHistory();

  toast(
    "Recording renamed.",
    "success"
  );
}

/* =========================================================
   RENAME HISTORY RECORD
========================================================= */

async function renameHistoryRecord(
  id
) {
  const record =
    state.recordings.find(
      item =>
        item.id === id
    );

  if (!record) return;

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

  const clean =
    sanitizeFileName(
      name
    );

  if (!clean) {
    toast(
      "Invalid recording name.",
      "warning"
    );
    return;
  }

  record.name =
    clean;

  await saveRecordingToDB(
    record
  );

  renderRecordingHistory();

  toast(
    "Recording renamed.",
    "success"
  );
}

/* =========================================================
   DOWNLOAD CURRENT
========================================================= */

function downloadCurrentRecording() {
  if (!state.previewBlob) {
    toast(
      "No recording available.",
      "warning"
    );
    return;
  }

  const name =
    sanitizeFileName(
      el.recordingNameInput?.value ||
        state.recordingName ||
        "Mentor Recording"
    );

  downloadBlob(
    state.previewBlob,
    name
  );
}

/* =========================================================
   DOWNLOAD HISTORY
========================================================= */

function downloadHistoryRecord(
  id
) {
  const record =
    state.recordings.find(
      item =>
        item.id === id
    );

  if (!record) {
    toast(
      "Recording not found.",
      "error"
    );
    return;
  }

  downloadBlob(
    record.blob,
    record.name,
    record.mimeType
  );
}

/* =========================================================
   DOWNLOAD BLOB
========================================================= */

function downloadBlob(
  blob,
  filename,
  mimeType
) {
  if (!blob) return;

  const extension =
    getFileExtension(
      mimeType ||
        blob.type
    );

  let clean =
    sanitizeFileName(
      filename
    );

  if (
    !clean
      .toLowerCase()
      .endsWith(
        `.${extension}`
      )
  ) {
    clean +=
      `.${extension}`;
  }

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
    clean;

  document.body.appendChild(
    anchor
  );

  anchor.click();

  anchor.remove();

  setTimeout(() => {
    URL.revokeObjectURL(
      url
    );
  }, 1000);
}

/* =========================================================
   DELETE CURRENT RECORDING
========================================================= */

async function deleteCurrentRecording() {
  const id =
    state.currentPreviewRecordId;

  if (!id) {
    toast(
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

  await deleteHistoryRecord(
    id,
    false
  );

  closeModal(
    el.recordingPreviewModal
  );
}

/* =========================================================
   DELETE HISTORY RECORD
========================================================= */

async function deleteHistoryRecord(
  id,
  ask = true
) {
  if (ask) {
    const confirmed =
      window.confirm(
        "Delete this recording permanently?"
      );

    if (!confirmed) {
      return;
    }
  }

  await deleteRecordingFromDB(
    id
  );

  if (
    state.currentPreviewRecordId ===
    id
  ) {
    state.currentPreviewRecordId =
      null;
  }

  toast(
    "Recording deleted.",
    "success"
  );
}

/* =========================================================
   CLEAR HISTORY
========================================================= */

async function clearRecordingHistory() {
  if (!state.recordings.length) {
    toast(
      "Recording history is already empty.",
      "info"
    );
    return;
  }

  const confirmed =
    window.confirm(
      "Delete ALL recordings from history?"
    );

  if (!confirmed) {
    return;
  }

  try {
    const db =
      await openDatabase();

    await new Promise(
      (resolve, reject) => {
        const tx =
          db.transaction(
            state.dbStore,
            "readwrite"
          );

        tx.objectStore(
          state.dbStore
        ).clear();

        tx.oncomplete =
          () => resolve();

        tx.onerror =
          () => reject(
            tx.error
          );
      }
    );

    state.recordings = [];

    state.currentPreviewRecordId =
      null;

    renderRecordingHistory();

    toast(
      "Recording history cleared.",
      "success"
    );

  } catch (error) {
    console.error(error);

    toast(
      "Could not clear recording history.",
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

  resetTrimControls();

  state.recordingBlob = null;
  state.previewBlob = null;

  if (state.previewUrl) {
    try {
      URL.revokeObjectURL(
        state.previewUrl
      );
    } catch {}

    state.previewUrl = null;
  }

  toast(
    "Studio is ready for another recording.",
    "info"
  );
}

/* =========================================================
   TELEPROMPTER
========================================================= */

function loadTeleprompterState() {
  state.teleprompterText =
    localStorage.getItem(
      "snkMentorTeleprompterTextV39"
    ) || "";

  state.teleprompterSpeed =
    Number(
      localStorage.getItem(
        "snkMentorTeleprompterSpeedV39"
      )
    ) || 1;

  state.teleprompterFontSize =
    Number(
      localStorage.getItem(
        "snkMentorTeleprompterFontV39"
      )
    ) || 34;

  state.teleprompterOpacity =
    Number(
      localStorage.getItem(
        "snkMentorTeleprompterOpacityV39"
      )
    ) || 0.82;

  updateTeleprompterUI();
}

function saveTeleprompter() {
  if (el.teleprompterText) {
    state.teleprompterText =
      el.teleprompterText.value;
  }

  if (el.teleprompterSpeed) {
    state.teleprompterSpeed =
      Number(
        el.teleprompterSpeed.value
      ) || 1;
  }

  if (el.teleprompterFontSize) {
    state.teleprompterFontSize =
      Number(
        el.teleprompterFontSize.value
      ) || 34;
  }

  if (el.teleprompterOpacity) {
    state.teleprompterOpacity =
      Number(
        el.teleprompterOpacity.value
      ) || 0.82;
  }

  localStorage.setItem(
    "snkMentorTeleprompterTextV39",
    state.teleprompterText
  );

  localStorage.setItem(
    "snkMentorTeleprompterSpeedV39",
    String(
      state.teleprompterSpeed
    )
  );

  localStorage.setItem(
    "snkMentorTeleprompterFontV39",
    String(
      state.teleprompterFontSize
    )
  );

  localStorage.setItem(
    "snkMentorTeleprompterOpacityV39",
    String(
      state.teleprompterOpacity
    )
  );

  updateTeleprompterUI();

  toast(
    "Teleprompter saved.",
    "success"
  );
}

function updateTeleprompterUI() {
  if (el.teleprompterText) {
    el.teleprompterText.value =
      state.teleprompterText;
  }

  if (el.teleprompterSpeed) {
    el.teleprompterSpeed.value =
      state.teleprompterSpeed;
  }

  if (el.teleprompterFontSize) {
    el.teleprompterFontSize.value =
      state.teleprompterFontSize;
  }

  if (el.teleprompterOpacity) {
    el.teleprompterOpacity.value =
      state.teleprompterOpacity;
  }

  if (el.teleprompterPreview) {
    el.teleprompterPreview.textContent =
      state.teleprompterText ||
      "Teleprompter preview...";
  }

  if (el.teleprompterMiniPreview) {
    el.teleprompterMiniPreview.textContent =
      state.teleprompterText ||
      "No teleprompter text.";
  }
}

function resetTeleprompter() {
  state.teleprompterText = "";
  state.teleprompterSpeed = 1;
  state.teleprompterFontSize = 34;
  state.teleprompterOpacity = 0.82;

  saveTeleprompter();

  toast(
    "Teleprompter reset.",
    "info"
  );
}

function playTeleprompter() {
  state.teleprompterPlaying = true;

  if (el.teleprompterPlayBtn) {
    el.teleprompterPlayBtn.disabled =
      true;
  }

  if (el.teleprompterPauseBtn) {
    el.teleprompterPauseBtn.disabled =
      false;
  }

  if (
    el.teleprompterPreview
  ) {
    el.teleprompterPreview.classList.add(
      "playing"
    );
  }
}

function pauseTeleprompter() {
  state.teleprompterPlaying = false;

  if (el.teleprompterPlayBtn) {
    el.teleprompterPlayBtn.disabled =
      false;
  }

  if (el.teleprompterPauseBtn) {
    el.teleprompterPauseBtn.disabled =
      true;
  }

  if (
    el.teleprompterPreview
  ) {
    el.teleprompterPreview.classList.remove(
      "playing"
    );
  }
}

/* =========================================================
   TELEPROMPTER FILE
========================================================= */

async function handleTeleprompterFile(
  file
) {
  if (!file) return;

  try {
    const text =
      await file.text();

    state.teleprompterText =
      text;

    updateTeleprompterUI();

    toast(
      "Teleprompter text imported.",
      "success"
    );

  } catch (error) {
    console.error(error);

    toast(
      "Could not read teleprompter file.",
      "error"
    );
  }
}

/* =========================================================
   STUDENTS
========================================================= */

function loadStudents() {
  try {
    state.students =
      JSON.parse(
        localStorage.getItem(
          state.studentsKey
        ) || "[]"
      );
  } catch {
    state.students = [];
  }

  renderStudents();
}

function saveStudents() {
  localStorage.setItem(
    state.studentsKey,
    JSON.stringify(
      state.students
    )
  );
}

function renderStudents() {
  if (!el.studentsList) {
    return;
  }

  el.studentsList.innerHTML =
    "";

  if (!state.students.length) {
    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "students-empty";

    empty.textContent =
      "No students added.";

    el.studentsList.appendChild(
      empty
    );

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

      const avatar =
        document.createElement(
          "div"
        );

      avatar.className =
        "student-avatar";

      avatar.textContent =
        getInitials(
          student.name
        );

      const info =
        document.createElement(
          "div"
        );

      info.className =
        "student-info";

      const name =
        document.createElement(
          "div"
        );

      name.className =
        "student-name";

      name.textContent =
        student.name;

      const status =
        document.createElement(
          "div"
        );

      status.className =
        "student-status";

      status.textContent =
        "Online";

      const remove =
        document.createElement(
          "button"
        );

      remove.type = "button";
      remove.className =
        "student-remove";

      remove.textContent =
        "×";

      remove.addEventListener(
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

      info.append(
        name,
        status
      );

      item.append(
        avatar,
        info,
        remove
      );

      el.studentsList.appendChild(
        item
      );
    }
  );
}

function getInitials(name) {
  return String(name || "S")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(
      word =>
        word.charAt(0)
          .toUpperCase()
    )
    .join("");
}

function saveStudentFromModal() {
  const name =
    el.studentNameInput?.value
      ?.trim();

  if (!name) {
    toast(
      "Please enter student name.",
      "warning"
    );
    return;
  }

  state.students.push({
    id:
      `student_${Date.now()}`,
    name
  });

  saveStudents();
  renderStudents();

  if (el.studentNameInput) {
    el.studentNameInput.value =
      "";
  }

  closeModal(
    el.studentModal
  );

  toast(
    "Student added.",
    "success"
  );
}

/* =========================================================
   SETTINGS MODAL
========================================================= */

function openSettings() {
  applySettingsToUI();

  showModal(
    el.settingsModal
  );
}

function saveSettingsFromModal() {
  if (el.brandNameInput) {
    state.brandName =
      el.brandNameInput.value.trim() ||
      "SNK Mentor Studio";
  }

  if (el.settingsRecordingQuality) {
    state.recordingQuality =
      el.settingsRecordingQuality.value;
  }

  if (el.settingsRecordingFps) {
    state.recordingFps =
      Number(
        el.settingsRecordingFps.value
      );
  }

  if (el.settingsAutoStartTeleprompter) {
    state.autoStartTeleprompter =
      el.settingsAutoStartTeleprompter.checked;
  }

  if (
    el.settingsShowTeleprompterRecording
  ) {
    state.showTeleprompterRecording =
      el.settingsShowTeleprompterRecording.checked;
  }

  saveSettings();
  applySettingsToUI();

  closeModal(
    el.settingsModal
  );

  toast(
    "Settings saved.",
    "success"
  );
}

/* =========================================================
   MODALS
========================================================= */

function showModal(modal) {
  if (!modal) return;

  modal.classList.add(
    "open"
  );

  modal.setAttribute(
    "aria-hidden",
    "false"
  );
}

function closeModal(modal) {
  if (!modal) return;

  modal.classList.remove(
    "open"
  );

  modal.setAttribute(
    "aria-hidden",
    "true"
  );
}

function closeAllModals() {
  $$(".modal.open").forEach(
    modal => {
      closeModal(modal);
    }
  );
}

/* =========================================================
   FULLSCREEN
========================================================= */

async function fullscreenStage() {
  const target =
    el.stageShell ||
    el.stage;

  if (!target) return;

  try {
    if (
      document.fullscreenElement
    ) {
      await document.exitFullscreen();
    } else {
      await target.requestFullscreen();
    }
  } catch (error) {
    console.warn(
      "Stage fullscreen failed:",
      error
    );
  }
}

async function fullscreenStudio() {
  const target =
    document.documentElement;

  try {
    if (
      document.fullscreenElement
    ) {
      await document.exitFullscreen();
    } else {
      await target.requestFullscreen();
    }
  } catch (error) {
    console.warn(
      "Studio fullscreen failed:",
      error
    );
  }
}

/* =========================================================
   INPUT SYNC
========================================================= */

function syncRecordingQuality(value) {
  state.recordingQuality =
    String(value);

  if (el.recordingQuality) {
    el.recordingQuality.value =
      state.recordingQuality;
  }

  if (el.recordingQualitySide) {
    el.recordingQualitySide.value =
      state.recordingQuality;
  }

  if (el.settingsRecordingQuality) {
    el.settingsRecordingQuality.value =
      state.recordingQuality;
  }

  saveSettings();

  updateStageBadges();

  renderCompositionFrame();
}

function syncRecordingFps(value) {
  state.recordingFps =
    Number(value) || 30;

  if (el.recordingFps) {
    el.recordingFps.value =
      String(state.recordingFps);
  }

  if (el.recordingFpsSide) {
    el.recordingFpsSide.value =
      String(state.recordingFps);
  }

  if (el.settingsRecordingFps) {
    el.settingsRecordingFps.value =
      String(state.recordingFps);
  }

  saveSettings();

  updateStageBadges();
}

/* =========================================================
   MICROPHONE CONTROLS
========================================================= */

function updateMicVolumeFromUI() {
  if (!el.micVolume) return;

  state.micVolume =
    Number(
      el.micVolume.value
    ) / 100;

  if (el.micVolumeValue) {
    el.micVolumeValue.textContent =
      `${Math.round(
        state.micVolume * 100
      )}%`;
  }

  updateMicrophoneGain();
  saveSettings();
}

function updateMicEnabledFromUI() {
  state.micEnabled =
    Boolean(
      el.micEnabled?.checked
    );

  updateMicrophoneGain();
  saveSettings();
}

function updateMicMonitorFromUI() {
  state.micMonitor =
    Boolean(
      el.micMonitor?.checked
    );

  updateMicrophoneGain();
  saveSettings();
}

function updateMainVolumeFromUI() {
  if (!el.mainVideoVolume) return;

  state.mainVideoVolume =
    Number(
      el.mainVideoVolume.value
    ) / 100;

  if (el.mainVolumeValue) {
    el.mainVolumeValue.textContent =
      `${Math.round(
        state.mainVideoVolume * 100
      )}%`;
  }

  updateMainAudioGain();
  saveSettings();
}

function updateMainAudioEnabledFromUI() {
  state.mainVideoAudioEnabled =
    Boolean(
      el.mainVideoAudioCheckbox
        ?.checked
    );

  updateMainAudioGain();
  saveSettings();
}

/* =========================================================
   EVENT LISTENERS
========================================================= */

/* Main files */

on(
  el.uploadMainBtn,
  "click",
  () =>
    el.mainFileInput?.click()
);

on(
  el.uploadMainSideBtn,
  "click",
  () =>
    el.mainFileInput?.click()
);

on(
  el.mainFileInput,
  "change",
  event => {
    const file =
      event.target.files?.[0];

    handleMainImage(file);

    event.target.value = "";
  }
);

on(
  el.uploadVideoBtn,
  "click",
  () =>
    el.mainVideoInput?.click()
);

on(
  el.uploadVideoSideBtn,
  "click",
  () =>
    el.mainVideoInput?.click()
);

on(
  el.mainVideoInput,
  "change",
  event => {
    const file =
      event.target.files?.[0];

    handleMainVideo(file);

    event.target.value = "";
  }
);

/* Main video */

on(
  el.mainPlayBtn,
  "click",
  playMainVideo
);

on(
  el.mainPauseBtn,
  "click",
  pauseMainVideo
);

on(
  el.mainVideo,
  "play",
  () => {
    startRenderLoop();
  }
);

on(
  el.mainVideo,
  "pause",
  renderCompositionFrame
);

on(
  el.mainVideo,
  "seeked",
  renderCompositionFrame
);

on(
  el.mainVideo,
  "loadedmetadata",
  () => {
    connectMainVideoAudio();
    renderCompositionFrame();
  }
);

/* Mentor */

on(
  el.uploadMentorBtn,
  "click",
  () =>
    el.mentorFileInput?.click()
);

on(
  el.uploadMentorSideBtn,
  "click",
  () =>
    el.mentorFileInput?.click()
);

on(
  el.uploadMentorFileSideBtn,
  "click",
  () =>
    el.mentorFileInput?.click()
);

on(
  el.mentorFileInput,
  "change",
  event => {
    const file =
      event.target.files?.[0];

    handleMentorFile(file);

    event.target.value = "";
  }
);

/* Camera */

on(
  el.startCameraBtn,
  "click",
  () =>
    startCamera()
);

on(
  el.startCameraSideBtn,
  "click",
  () =>
    startCamera()
);

on(
  el.stopCameraBtn,
  "click",
  () =>
    stopCamera()
);

on(
  el.stopCameraSideBtn,
  "click",
  () =>
    stopCamera()
);

on(
  el.switchCameraSideBtn,
  "click",
  switchCamera
);

on(
  el.cameraQuality,
  "change",
  changeCameraSettings
);

on(
  el.cameraFps,
  "change",
  changeCameraSettings
);

on(
  el.cameraDeviceSelect,
  "change",
  changeCameraSettings
);

/* AI background */

on(
  el.bgOriginalBtn,
  "click",
  () =>
    setAIMode("original")
);

on(
  el.bgRemoveBtn,
  "click",
  () =>
    setAIMode("remove")
);

on(
  el.bgBlurBtn,
  "click",
  () =>
    setAIMode("blur")
);

on(
  el.bgImageBtn,
  "click",
  () =>
    setAIMode("image")
);

on(
  el.bgColorBtn,
  "click",
  () =>
    setAIMode("color")
);

on(
  el.backgroundImageUpload,
  "change",
  event => {
    const file =
      event.target.files?.[0];

    loadCustomBackground(file);

    event.target.value = "";
  }
);

on(
  el.uploadBackgroundSideBtn,
  "click",
  () =>
    el.backgroundImageUpload?.click()
);

on(
  el.backgroundColor,
  "input",
  () => {
    if (
      state.aiMode ===
      "color"
    ) {
      renderCompositionFrame();
    }
  }
);

/* Screen */

on(
  el.startScreenCaptureBtn,
  "click",
  startScreenCapture
);

on(
  el.startScreenCaptureSideBtn,
  "click",
  startScreenCapture
);

on(
  el.stopScreenCaptureBtn,
  "click",
  () =>
    stopScreenCapture()
);

/* Audio */

on(
  el.mainVideoAudioCheckbox,
  "change",
  updateMainAudioEnabledFromUI
);

on(
  el.mainVideoVolume,
  "input",
  updateMainVolumeFromUI
);

on(
  el.micVolume,
  "input",
  updateMicVolumeFromUI
);

on(
  el.micEnabled,
  "change",
  updateMicEnabledFromUI
);

on(
  el.micMonitor,
  "change",
  updateMicMonitorFromUI
);

/* Recording */

on(
  el.recordBtn,
  "click",
  () => {
    if (!state.recordingActive) {
      startRecording();
    } else if (
      state.recordingPaused
    ) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  }
);

on(
  el.recordToolbarBtn,
  "click",
  () => {
    if (!state.recordingActive) {
      startRecording();
    } else if (
      state.recordingPaused
    ) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  }
);

on(
  el.pauseRecordingBtn,
  "click",
  pauseRecording
);

on(
  el.resumeRecordingBtn,
  "click",
  resumeRecording
);

on(
  el.stopRecordingBtn,
  "click",
  stopRecording
);

on(
  el.recordingQuality,
  "change",
  event =>
    syncRecordingQuality(
      event.target.value
    )
);

on(
  el.recordingQualitySide,
  "change",
  event =>
    syncRecordingQuality(
      event.target.value
    )
);

on(
  el.recordingFps,
  "change",
  event =>
    syncRecordingFps(
      event.target.value
    )
);

on(
  el.recordingFpsSide,
  "change",
  event =>
    syncRecordingFps(
      event.target.value
    )
);

on(
  el.recordingFormat,
  "change",
  event => {
    state.recordingFormat =
      event.target.value;

    if (
      el.recordingFormatSide
    ) {
      el.recordingFormatSide.value =
        state.recordingFormat;
    }
  }
);

on(
  el.recordingFormatSide,
  "change",
  event => {
    state.recordingFormat =
      event.target.value;

    if (el.recordingFormat) {
      el.recordingFormat.value =
        state.recordingFormat;
    }
  }
);

/* Preview */

on(
  el.closeRecordingPreviewBtn,
  "click",
  () =>
    closeModal(
      el.recordingPreviewModal
    )
);

on(
  el.recordingPreviewPlayBtn,
  "click",
  playPreview
);

on(
  el.recordingPreviewPauseBtn,
  "click",
  pausePreview
);

on(
  el.recordingPreviewVideo,
  "loadedmetadata",
  handlePreviewMetadata
);

on(
  el.recordingPreviewVideo,
  "timeupdate",
  handlePreviewTimeUpdate
);

on(
  el.recordingTrimStart,
  "input",
  event =>
    updateTrimFromStart(
      event.target.value
    )
);

on(
  el.recordingTrimEnd,
  "input",
  event =>
    updateTrimFromEnd(
      event.target.value
    )
);

on(
  el.applyTrimBtn,
  "click",
  applyTrim
);

on(
  el.resetTrimBtn,
  "click",
  resetTrimControls
);

on(
  el.renameRecordingBtn,
  "click",
  renameCurrentRecording
);

on(
  el.deleteRecordingBtn,
  "click",
  deleteCurrentRecording
);

on(
  el.downloadRecordingBtn,
  "click",
  downloadCurrentRecording
);

on(
  el.recordAgainBtn,
  "click",
  recordAgain
);

on(
  el.clearRecordingHistoryBtn,
  "click",
  clearRecordingHistory
);

/* Settings */

on(
  el.settingsBtn,
  "click",
  openSettings
);

on(
  el.closeSettingsBtn,
  "click",
  () =>
    closeModal(
      el.settingsModal
    )
);

on(
  el.closeSettingsFooterBtn,
  "click",
  () =>
    closeModal(
      el.settingsModal
    )
);

on(
  el.saveSettingsBtn,
  "click",
  saveSettingsFromModal
);

/* Shortcuts */

on(
  el.openShortcutsBtn,
  "click",
  () =>
    showModal(
      el.shortcutsModal
    )
);

on(
  el.closeShortcutsBtn,
  "click",
  () =>
    closeModal(
      el.shortcutsModal
    )
);

/* Fullscreen */

on(
  el.fullscreenStageBtn,
  "click",
  fullscreenStage
);

on(
  el.fullscreenStudioBtn,
  "click",
  fullscreenStudio
);

/* Teleprompter */

on(
  el.openTeleprompterTopBtn,
  "click",
  () =>
    showModal(
      el.teleprompterModal
    )
);

on(
  el.openTeleprompterBtn,
  "click",
  () =>
    showModal(
      el.teleprompterModal
    )
);

on(
  el.openTeleprompterSide,
  "click",
  () =>
    showModal(
      el.teleprompterModal
    )
);

on(
  el.closeTeleprompterBtn,
  "click",
  () =>
    closeModal(
      el.teleprompterModal
    )
);

on(
  el.teleprompterResetBtn,
  "click",
  resetTeleprompter
);

on(
  el.teleprompterPauseBtn,
  "click",
  pauseTeleprompter
);

on(
  el.teleprompterPlayBtn,
  "click",
  playTeleprompter
);

on(
  el.teleprompterSaveBtn,
  "click",
  saveTeleprompter
);

on(
  el.teleprompterText,
  "input",
  () => {
    state.teleprompterText =
      el.teleprompterText.value;

    updateTeleprompterUI();
  }
);

on(
  el.teleprompterSpeed,
  "input",
  () => {
    state.teleprompterSpeed =
      Number(
        el.teleprompterSpeed.value
      ) || 1;
  }
);

on(
  el.teleprompterFontSize,
  "input",
  () => {
    state.teleprompterFontSize =
      Number(
        el.teleprompterFontSize.value
      ) || 34;

    updateTeleprompterUI();
  }
);

on(
  el.teleprompterOpacity,
  "input",
  () => {
    state.teleprompterOpacity =
      Number(
        el.teleprompterOpacity.value
      ) || 0.82;
  }
);

on(
  el.uploadTeleprompterBtn,
  "click",
  () =>
    el.teleprompterFileInput?.click()
);

on(
  el.teleprompterFileInput,
  "change",
  async event => {
    const file =
      event.target.files?.[0];

    await handleTeleprompterFile(
      file
    );

    event.target.value = "";
  }
);

/* Students */

on(
  el.addStudentBtn,
  "click",
  () => {
    if (el.studentNameInput) {
      el.studentNameInput.value =
        "";
    }

    showModal(
      el.studentModal
    );
  }
);

on(
  el.closeStudentModalBtn,
  "click",
  () =>
    closeModal(
      el.studentModal
    )
);

on(
  el.cancelStudentBtn,
  "click",
  () =>
    closeModal(
      el.studentModal
    )
);

on(
  el.saveStudentBtn,
  "click",
  saveStudentFromModal
);

/* =========================================================
   MODAL BACKDROP
========================================================= */

$$(".modal").forEach(modal => {
  modal.addEventListener(
    "click",
    event => {
      if (
        event.target === modal
      ) {
        closeModal(modal);
      }
    }
  );
});

/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
  "keydown",
  event => {
    const target =
      event.target;

    const isTyping =
      target instanceof
        HTMLInputElement ||
      target instanceof
        HTMLTextAreaElement ||
      target instanceof
        HTMLSelectElement ||
      target?.isContentEditable;

    if (
      event.key === "Escape"
    ) {
      closeAllModals();
      return;
    }

    if (isTyping) {
      return;
    }

    const key =
      event.key.toLowerCase();

    if (
      key === " " ||
      event.code ===
        "Space"
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
      } else if (
        state.mainType ===
        "video"
      ) {
        if (
          el.mainVideo?.paused
        ) {
          playMainVideo();
        } else {
          pauseMainVideo();
        }
      }

      return;
    }

    if (
      key === "r"
    ) {
      event.preventDefault();

      if (
        state.recordingActive
      ) {
        return;
      }

      startRecording();

      return;
    }

    if (
      key === "p"
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
      }

      return;
    }

    if (
      key === "s"
    ) {
      event.preventDefault();

      if (
        state.recordingActive
      ) {
        stopRecording();
      }

      return;
    }

    if (
      key === "f"
    ) {
      event.preventDefault();

      fullscreenStage();

      return;
    }
  }
);

/* =========================================================
   CAMERA STREAM TRACK END
========================================================= */

function monitorCameraTracks() {
  if (!state.cameraStream) {
    return;
  }

  const tracks =
    state.cameraStream.getVideoTracks();

  tracks.forEach(track => {
    track.addEventListener(
      "ended",
      () => {
        state.cameraEnabled =
          false;

        updateCameraStatus(
          false
        );

        updateIndicator(
          el.cameraIndicator,
          false,
          "CAM"
        );

        toast(
          "Camera stream ended.",
          "warning"
        );
      },
      {
        once: true
      }
    );
  });
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
      !document.hidden
    ) {
      renderCompositionFrame();
    }
  }
);

/* =========================================================
   CLEANUP
========================================================= */

window.addEventListener(
  "beforeunload",
  () => {
    stopRenderLoop();
    stopRecordingTimer();

    if (state.cameraStream) {
      state.cameraStream
        .getTracks()
        .forEach(track => {
          try {
            track.stop();
          } catch {}
        });
    }

    if (state.screenStream) {
      state.screenStream
        .getTracks()
        .forEach(track => {
          try {
            track.stop();
          } catch {}
        });
    }

    if (state.mainObjectUrl) {
      try {
        URL.revokeObjectURL(
          state.mainObjectUrl
        );
      } catch {}
    }

    if (state.mentorObjectUrl) {
      try {
        URL.revokeObjectURL(
          state.mentorObjectUrl
        );
      } catch {}
    }

    if (state.previewUrl) {
      try {
        URL.revokeObjectURL(
          state.previewUrl
        );
      } catch {}
    }
  }
);

/* =========================================================
   GLOBAL BRIDGE
========================================================= */

window.CourseStudio = {
  state,

  startCamera,
  stopCamera,
  switchCamera,

  startScreenCapture,
  stopScreenCapture,

  startRecording,
  pauseRecording,
  resumeRecording,
  stopRecording,

  openRecordingPreview,

  playMainVideo,
  pauseMainVideo,

  setAIMode,

  openSettings,
  saveSettingsFromModal,

  playTeleprompter,
  pauseTeleprompter,

  fullscreenStage,
  fullscreenStudio,

  renderCompositionFrame,

  downloadCurrentRecording,

  deleteCurrentRecording,

  recordAgain
};

/* =========================================================
   INITIALIZE
========================================================= */

async function initializeStudio() {
  loadSettings();
  loadTeleprompterState();
  loadStudents();

  applySettingsToUI();

  if (el.recordingFormat) {
    const supported =
      getSupportedMimeTypes(
        "auto"
      );

    if (!supported.some(
      mime =>
        mime.includes("mp4")
    )) {
      const mp4Options =
        $$(
          'option[value="mp4"]',
          el.recordingFormat
        );

      mp4Options.forEach(
        option => {
          option.disabled =
            true;

          option.textContent =
            "MP4 — Not supported";
        }
      );
    }
  }

  if (el.recordingFormatSide) {
    const supported =
      getSupportedMimeTypes(
        "auto"
      );

    if (!supported.some(
      mime =>
        mime.includes("mp4")
    )) {
      const mp4Options =
        $$(
          'option[value="mp4"]',
          el.recordingFormatSide
        );

      mp4Options.forEach(
        option => {
          option.disabled =
            true;

          option.textContent =
            "MP4 — Not supported";
        }
      );
    }
  }

  await loadRecordingsFromDB();

  ensureCompositionCanvas();

  ensureAudioEngine();

  await enumerateCameraDevices();

  setupSegmentation();

  updateRecordingUI();

  updateCameraStatus(false);
  updateScreenStatus(false);

  updateAudioIndicators();

  startRenderLoop();

  updateAudioMeters();

  renderCompositionFrame();

  console.log(
    "SNK Mentor Studio Step 3.9 initialized."
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
    initializeStudio,
    {
      once: true
    }
  );
} else {
  initializeStudio();
}
