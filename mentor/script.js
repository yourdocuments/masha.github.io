/* =========================================================
   PERSONAL COURSE STUDIO — MENTOR STUDIO
   STEP 3.10 — FINAL RECORDING ENGINE & STUDIO POLISH
   File: mentor/script.js

   Features
   ---------------------------------------------------------
   • Main image / video
   • Mentor video upload
   • Webcam
   • Camera device / quality / FPS
   • AI background:
       - Original
       - Remove
       - Blur
       - Custom image
       - Solid color
   • Mentor drag + resize
   • Screen / tab / window capture
   • Screen capture audio
   • Main video audio
   • Microphone audio
   • Mic monitoring
   • Audio meters
   • Mic waveform
   • Teleprompter
   • 16:9 composition
   • 1920×1080 / 1280×720 / 2560×1440
   • 24 / 30 / 60 FPS
   • Continuous recording render loop
   • Start / Pause / Resume / Stop
   • Recording timer
   • Fullscreen stage
   • Fullscreen studio
   • Keyboard shortcuts
   • Recording preview
   • Recording history
   • IndexedDB recording storage
   • Download / rename / delete
   • MP4/WebM feature detection
   • Proper cleanup
   • window.CourseStudio API
   ========================================================= */

(() => {
  "use strict";

  /* =========================================================
     HELPERS
     ========================================================= */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  const byId = (id) => document.getElementById(id);

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const safeNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return "00:00";

    seconds = Math.max(0, seconds);

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
      return `${String(h).padStart(2, "0")}:${String(m).padStart(
        2,
        "0"
      )}:${String(s).padStart(2, "0")}`;
    }

    return `${String(m).padStart(2, "0")}:${String(s).padStart(
      2,
      "0"
    )}`;
  };

  const formatBytes = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1
    );

    return `${(bytes / Math.pow(1024, index)).toFixed(
      index === 0 ? 0 : 2
    )} ${units[index]}`;
  };

  const escapeHTML = (value) => {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  };

  const nowId = () =>
    `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  const nextFrame = () =>
    new Promise((resolve) => requestAnimationFrame(resolve));

  /* =========================================================
     DOM REFERENCES
     ========================================================= */

  const mainImage = byId("mainImage");
  const mainVideo = byId("mainVideo");
  const screenCaptureVideo = byId("screenCaptureVideo");

  const mentorVideo = byId("mentorVideo");
  const mentorCameraVideo = byId("mentorCameraVideo");
  const mentorAICanvas = byId("mentorAICanvas");

  const mentorCard = byId("mentorCard");
  const mentorResize = byId("mentorResize");
  const mentorPlaceholder = byId("mentorPlaceholder");
  const mentorSourceLabel = byId("mentorSourceLabel");

  const stage = byId("stage");
  const stageShell = byId("stageShell");

  const brandBadge = byId("brandBadge");
  const brandBadgeText = byId("brandBadgeText");

  const recordingOverlay = byId("recordingOverlay");
  const recordingOverlayTimer = byId("recordingOverlayTimer");

  const stageResolutionBadge = byId("stageResolutionBadge");
  const stageFpsBadge = byId("stageFpsBadge");
  const stageSourceBadge = byId("stageSourceBadge");

  const compositionCanvas = document.createElement("canvas");
  compositionCanvas.id = "courseStudioCompositionCanvas";

  const compositionCtx = compositionCanvas.getContext("2d", {
    alpha: false,
    desynchronized: true
  });

  /* =========================================================
     BUTTONS
     ========================================================= */

  const uploadMainBtn = byId("uploadMainBtn");
  const uploadVideoBtn = byId("uploadVideoBtn");
  const mainPlayBtn = byId("mainPlayBtn");
  const mainPauseBtn = byId("mainPauseBtn");

  const uploadMentorBtn = byId("uploadMentorBtn");
  const startCameraBtn = byId("startCameraBtn");
  const stopCameraBtn = byId("stopCameraBtn");

  const recordToolbarBtn = byId("recordToolbarBtn");
  const recordBtn = byId("recordBtn");

  const openTeleprompterBtn = byId("openTeleprompterBtn");
  const openTeleprompterTopBtn = byId("openTeleprompterTopBtn");

  const openShortcutsBtn = byId("openShortcutsBtn");
  const fullscreenStageBtn = byId("fullscreenStageBtn");
  const fullscreenStudioBtn = byId("fullscreenStudioBtn");

  const settingsBtn = byId("settingsBtn");

  const startScreenCaptureBtn = byId("startScreenCaptureBtn");
  const startScreenCaptureSideBtn = byId(
    "startScreenCaptureSideBtn"
  );
  const stopScreenCaptureBtn = byId("stopScreenCaptureBtn");

  const pauseRecordingBtn = byId("pauseRecordingBtn");
  const resumeRecordingBtn = byId("resumeRecordingBtn");
  const stopRecordingBtn = byId("stopRecordingBtn");

  /* =========================================================
     FILE INPUTS
     ========================================================= */

  const mainFileInput = byId("mainFileInput");
  const mainVideoInput = byId("mainVideoInput");
  const mentorFileInput = byId("mentorFileInput");
  const backgroundImageUpload = byId("backgroundImageUpload");
  const teleprompterFileInput = byId(
    "teleprompterFileInput"
  );

  /* =========================================================
     CAMERA CONTROLS
     ========================================================= */

  const startCameraSideBtn = byId("startCameraSideBtn");
  const stopCameraSideBtn = byId("stopCameraSideBtn");
  const switchCameraSideBtn = byId(
    "switchCameraSideBtn"
  );
  const uploadMentorSideBtn = byId(
    "uploadMentorSideBtn"
  );

  const cameraStatus = byId("cameraStatus");

  const cameraDeviceSelect = byId(
    "cameraDeviceSelect"
  );
  const cameraQuality = byId("cameraQuality");
  const cameraFps = byId("cameraFps");

  /* =========================================================
     AI BACKGROUND
     ========================================================= */

  const bgOriginalBtn = byId("bgOriginalBtn");
  const bgRemoveBtn = byId("bgRemoveBtn");
  const bgBlurBtn = byId("bgBlurBtn");
  const bgImageBtn = byId("bgImageBtn");
  const bgColorBtn = byId("bgColorBtn");

  const backgroundColor = byId("backgroundColor");
  const backgroundUploadBox = byId(
    "backgroundUploadBox"
  );

  /* =========================================================
     SCREEN CAPTURE
     ========================================================= */

  const screenCaptureStatus = byId(
    "screenCaptureStatus"
  );
  const screenCaptureStatusLight = byId(
    "screenCaptureStatusLight"
  );

  /* =========================================================
     AUDIO
     ========================================================= */

  const mainVideoAudioCheckbox = byId(
    "mainVideoAudioCheckbox"
  );
  const mainVideoVolume = byId("mainVideoVolume");
  const mainVolumeValue = byId("mainVolumeValue");

  const micVolume = byId("micVolume");
  const micVolumeValue = byId("micVolumeValue");

  const micEnabled = byId("micEnabled");
  const micMonitor = byId("micMonitor");

  const micLevelValue = byId("micLevelValue");
  const micLevelBar = byId("micLevelBar");

  const mainAudioLevelValue = byId(
    "mainAudioLevelValue"
  );
  const mainAudioLevelBar = byId(
    "mainAudioLevelBar"
  );

  const micWaveformCanvas = byId(
    "micWaveformCanvas"
  );

  /* =========================================================
     TELEPROMPTER
     ========================================================= */

  const teleprompterMiniPreview = byId(
    "teleprompterMiniPreview"
  );

  const openTeleprompterSide = byId(
    "openTeleprompterSide"
  );

  const uploadTeleprompterBtn = byId(
    "uploadTeleprompterBtn"
  );

  const teleprompterModal = byId(
    "teleprompterModal"
  );

  const closeTeleprompterBtn = byId(
    "closeTeleprompterBtn"
  );

  const teleprompterText = byId("teleprompterText");
  const teleprompterSpeed = byId(
    "teleprompterSpeed"
  );
  const teleprompterFontSize = byId(
    "teleprompterFontSize"
  );
  const teleprompterOpacity = byId(
    "teleprompterOpacity"
  );

  const teleprompterPreview = byId(
    "teleprompterPreview"
  );

  const teleprompterResetBtn = byId(
    "teleprompterResetBtn"
  );
  const teleprompterPauseBtn = byId(
    "teleprompterPauseBtn"
  );
  const teleprompterPlayBtn = byId(
    "teleprompterPlayBtn"
  );
  const teleprompterSaveBtn = byId(
    "teleprompterSaveBtn"
  );

  /* =========================================================
     RECORDING SETTINGS
     ========================================================= */

  const recordingQuality = byId("recordingQuality");
  const recordingFps = byId("recordingFps");
  const recordingFormat = byId("recordingFormat");

  const recordingQualitySide = byId(
    "recordingQualitySide"
  );
  const recordingFpsSide = byId(
    "recordingFpsSide"
  );
  const recordingFormatSide = byId(
    "recordingFormatSide"
  );

  const recordingFileNameSide = byId(
    "recordingFileNameSide"
  );

  const includeTeleprompterInRecording = byId(
    "includeTeleprompterInRecording"
  );

  /* =========================================================
     RECORDING STATUS
     ========================================================= */

  const recordingStatusBar = byId(
    "recordingStatusBar"
  );
  const recordingStatusDot = byId(
    "recordingStatusDot"
  );
  const recordingStatusText = byId(
    "recordingStatusText"
  );
  const recordingTimer = byId("recordingTimer");

  const cameraIndicator = byId("cameraIndicator");
  const micIndicator = byId("micIndicator");
  const audioIndicator = byId("audioIndicator");
  const screenIndicator = byId(
    "screenIndicator"
  );

  /* =========================================================
     RECORDING PREVIEW
     ========================================================= */

  const recordingPreviewModal = byId(
    "recordingPreviewModal"
  );

  const recordingPreviewVideo = byId(
    "recordingPreviewVideo"
  );

  const recordingFileInfo = byId(
    "recordingFileInfo"
  );

  const closeRecordingPreviewBtn = byId(
    "closeRecordingPreviewBtn"
  );

  const recordingCurrentTime = byId(
    "recordingCurrentTime"
  );

  const recordingDuration = byId(
    "recordingDuration"
  );

  const recordingPreviewPlayBtn = byId(
    "recordingPreviewPlayBtn"
  );

  const recordingPreviewPauseBtn = byId(
    "recordingPreviewPauseBtn"
  );

  const recordingFileName = byId(
    "recordingFileName"
  );

  const recordingTrimStart = byId(
    "recordingTrimStart"
  );

  const recordingTrimEnd = byId(
    "recordingTrimEnd"
  );

  const recordingTrimStartTime = byId(
    "recordingTrimStartTime"
  );

  const recordingTrimEndTime = byId(
    "recordingTrimEndTime"
  );

  const applyTrimBtn = byId("applyTrimBtn");
  const resetTrimBtn = byId("resetTrimBtn");
  const renameRecordingBtn = byId(
    "renameRecordingBtn"
  );

  const deleteRecordingBtn = byId(
    "deleteRecordingBtn"
  );

  const recordAgainBtn = byId("recordAgainBtn");
  const downloadRecordingBtn = byId(
    "downloadRecordingBtn"
  );

  const recordingHistoryList = byId(
    "recordingHistoryList"
  );

  const clearRecordingHistoryBtn = byId(
    "clearRecordingHistoryBtn"
  );

  /* =========================================================
     STUDENTS
     ========================================================= */

  const studentsList = byId("studentsList");
  const addStudentBtn = byId("addStudentBtn");

  const studentModal = byId("studentModal");
  const studentNameInput = byId(
    "studentNameInput"
  );
  const closeStudentModalBtn = byId(
    "closeStudentModalBtn"
  );
  const cancelStudentBtn = byId(
    "cancelStudentBtn"
  );
  const saveStudentBtn = byId("saveStudentBtn");

  /* =========================================================
     SETTINGS
     ========================================================= */

  const settingsModal = byId("settingsModal");
  const brandNameInput = byId("brandNameInput");

  const settingsRecordingQuality = byId(
    "settingsRecordingQuality"
  );

  const settingsRecordingFps = byId(
    "settingsRecordingFps"
  );

  const settingsAutoStartTeleprompter = byId(
    "settingsAutoStartTeleprompter"
  );

  const settingsShowTeleprompterRecording = byId(
    "settingsShowTeleprompterRecording"
  );

  const closeSettingsBtn = byId(
    "closeSettingsBtn"
  );

  const closeSettingsFooterBtn = byId(
    "closeSettingsFooterBtn"
  );

  const saveSettingsBtn = byId("saveSettingsBtn");

  /* =========================================================
     SHORTCUTS
     ========================================================= */

  const shortcutsModal = byId("shortcutsModal");
  const closeShortcutsBtn = byId(
    "closeShortcutsBtn"
  );

  /* =========================================================
     TOAST
     ========================================================= */

  const toastContainer = byId("toastContainer");

  /* =========================================================
     STATE
     ========================================================= */

  const state = {
    mainType: null,
    mainObjectURL: null,

    mentorType: null,
    mentorObjectURL: null,

    backgroundMode: "original",
    backgroundImage: null,
    backgroundObjectURL: null,
    backgroundColor:
      backgroundColor?.value || "#101820",

    cameraStream: null,
    cameraFacingMode: "user",
    cameraDeviceId: "",

    screenStream: null,

    aiEnabled: false,
    selfieSegmentation: null,
    segmentationReady: false,

    aiSourceCanvas: byId("aiSourceCanvas"),
    aiSourceCtx: null,

    aiMaskCanvas: byId("aiMaskCanvas"),
    aiMaskCtx: null,

    aiCtx: mentorAICanvas
      ? mentorAICanvas.getContext("2d")
      : null,

    personCanvas: document.createElement("canvas"),
    personCtx: null,

    renderAnimationId: null,
    recordingRenderAnimationId: null,

    audioContext: null,
    audioDestination: null,

    mainMediaSource: null,
    mainGain: null,

    micSource: null,
    micGain: null,

    micAnalyser: null,
    mainAnalyser: null,

    micMonitorGain: null,

    cameraAudioSource: null,
    screenAudioSource: null,

    currentRecorder: null,
    recordingChunks: [],
    recordingBlob: null,
    recordingURL: null,

    recordingStartedAt: 0,
    recordingElapsedBeforePause: 0,
    recordingTimerInterval: null,

    recordingPaused: false,
    recordingActive: false,

    recordingMimeType: "",
    recordingExtension: "webm",

    recordingWidth: 1920,
    recordingHeight: 1080,
    recordingFps: 30,

    recordingQuality: "1080p",

    selectedRecordingName:
      "mentor-studio-recording",

    currentRecordingId: null,

    previewOriginalBlob: null,
    previewOriginalURL: null,

    previewTrimStart: 0,
    previewTrimEnd: 0,

    previewTrimmedBlob: null,
    previewTrimmedURL: null,

    teleprompterText: "",
    teleprompterScroll: 0,
    teleprompterPlaying: false,
    teleprompterRAF: null,

    teleprompterSpeed: 30,
    teleprompterFontSize: 34,
    teleprompterOpacity: 0.9,

    compositionSource:
      "STUDIO",

    students: [],

    mentorRect: {
      x: 0.72,
      y: 0.70,
      width: 0.22,
      height: 0.12375
    },

    drag: {
      active: false,
      offsetX: 0,
      offsetY: 0
    },

    resize: {
      active: false,
      startX: 0,
      startY: 0,
      startWidth: 0,
      startHeight: 0
    },

    cameraWidth: 1280,
    cameraHeight: 720,
    cameraFps: 30,

    settings: {
      brandName:
        "Personal Course Studio",

      autoStartTeleprompter: false,
      showTeleprompterRecording: true
    },

    history: [],

    renderBusy: false,

    db: null,
    dbReady: false
  };

  state.aiSourceCtx =
    state.aiSourceCanvas?.getContext("2d", {
      willReadFrequently: true
    }) || null;

  state.aiMaskCtx =
    state.aiMaskCanvas?.getContext("2d", {
      willReadFrequently: true
    }) || null;

  state.personCtx =
    state.personCanvas.getContext("2d", {
      willReadFrequently: false
    });

  /* =========================================================
     TOAST
     ========================================================= */

  function toast(message, type = "info") {
    if (!toastContainer) {
      console.log(`[${type}] ${message}`);
      return;
    }

    const item = document.createElement("div");

    item.className = `toast toast-${type}`;
    item.textContent = message;

    toastContainer.appendChild(item);

    requestAnimationFrame(() => {
      item.classList.add("show");
    });

    setTimeout(() => {
      item.classList.remove("show");

      setTimeout(() => {
        item.remove();
      }, 250);
    }, 2800);
  }

  /* =========================================================
     SETTINGS STORAGE
     ========================================================= */

  function loadSettings() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(
          "personalCourseStudioSettings"
        ) || "null"
      );

      if (saved && typeof saved === "object") {
        Object.assign(state.settings, saved);
      }
    } catch (error) {
      console.warn(
        "Settings load failed:",
        error
      );
    }

    if (brandNameInput) {
      brandNameInput.value =
        state.settings.brandName;
    }

    if (brandBadgeText) {
      brandBadgeText.textContent =
        state.settings.brandName;
    }

    if (settingsAutoStartTeleprompter) {
      settingsAutoStartTeleprompter.checked =
        !!state.settings.autoStartTeleprompter;
    }

    if (settingsShowTeleprompterRecording) {
      settingsShowTeleprompterRecording.checked =
        !!state.settings.showTeleprompterRecording;
    }
  }

  function saveSettings() {
    state.settings.brandName =
      brandNameInput?.value.trim() ||
      "Personal Course Studio";

    state.settings.autoStartTeleprompter =
      !!settingsAutoStartTeleprompter?.checked;

    state.settings.showTeleprompterRecording =
      !!settingsShowTeleprompterRecording?.checked;

    try {
      localStorage.setItem(
        "personalCourseStudioSettings",
        JSON.stringify(state.settings)
      );
    } catch (error) {
      console.warn(
        "Settings save failed:",
        error
      );
    }

    if (brandBadgeText) {
      brandBadgeText.textContent =
        state.settings.brandName;
    }

    closeModal(settingsModal);

    toast("Settings saved", "success");
  }

  /* =========================================================
     MODAL HELPERS
     ========================================================= */

  function openModal(modal) {
    if (!modal) return;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal(modal) {
    if (!modal) return;

    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  function bindModalClose(modal) {
    if (!modal) return;

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  }

  /* =========================================================
     MAIN MEDIA
     ========================================================= */

  function clearMainMedia() {
    if (mainImage) {
      mainImage.classList.remove("show");
      mainImage.removeAttribute("src");
    }

    if (mainVideo) {
      mainVideo.pause();
      mainVideo.classList.remove("show");
      mainVideo.removeAttribute("src");
      mainVideo.load();
    }

    if (screenCaptureVideo) {
      screenCaptureVideo.classList.remove(
        "show"
      );
    }

    if (state.mainObjectURL) {
      URL.revokeObjectURL(state.mainObjectURL);
      state.mainObjectURL = null;
    }

    state.mainType = null;
  }

  function loadMainFile(file) {
    if (!file) return;

    clearMainMedia();

    state.mainObjectURL =
      URL.createObjectURL(file);

    const type =
      file.type.startsWith("video/")
        ? "video"
        : "image";

    state.mainType = type;

    if (type === "video" && mainVideo) {
      mainVideo.src = state.mainObjectURL;
      mainVideo.muted =
        !mainVideoAudioCheckbox?.checked;

      mainVideo.volume =
        safeNumber(
          mainVideoVolume?.value,
          1
        );

      mainVideo.classList.add("show");

      mainVideo.addEventListener(
        "loadedmetadata",
        () => {
          renderCompositionFrame();
        },
        { once: true }
      );

      mainVideo.play().catch(() => {});

      if (stageSourceBadge) {
        stageSourceBadge.textContent =
          "VIDEO";
      }

      toast("Main video loaded", "success");
    } else if (mainImage) {
      mainImage.src =
        state.mainObjectURL;

      mainImage.classList.add("show");

      if (stageSourceBadge) {
        stageSourceBadge.textContent =
          "IMAGE";
      }

      mainImage.onload = () => {
        renderCompositionFrame();
      };

      toast("Main image loaded", "success");
    }

    renderCompositionFrame();
  }

  function playMain() {
    if (!mainVideo || state.mainType !== "video") {
      toast(
        "Please upload a main video first",
        "warning"
      );
      return;
    }

    mainVideo.play().catch(() => {});

    if (mainPlayBtn) {
      mainPlayBtn.disabled = true;
    }

    if (mainPauseBtn) {
      mainPauseBtn.disabled = false;
    }
  }

  function pauseMain() {
    if (!mainVideo) return;

    mainVideo.pause();

    if (mainPlayBtn) {
      mainPlayBtn.disabled = false;
    }

    if (mainPauseBtn) {
      mainPauseBtn.disabled = true;
    }

    renderCompositionFrame();
  }

  /* =========================================================
     MENTOR MEDIA
     ========================================================= */

  function clearMentorMedia() {
    if (mentorVideo) {
      mentorVideo.pause();
      mentorVideo.removeAttribute("src");
      mentorVideo.load();
      mentorVideo.classList.remove("show");
    }

    if (mentorCameraVideo) {
      mentorCameraVideo.srcObject = null;
      mentorCameraVideo.classList.remove("show");
    }

    if (mentorAICanvas) {
      mentorAICanvas.classList.remove("show");
    }

    if (state.mentorObjectURL) {
      URL.revokeObjectURL(
        state.mentorObjectURL
      );
      state.mentorObjectURL = null;
    }

    state.mentorType = null;

    if (mentorPlaceholder) {
      mentorPlaceholder.classList.remove(
        "hidden"
      );
    }

    if (mentorSourceLabel) {
      mentorSourceLabel.textContent =
        "MENTOR";
    }
  }

  function loadMentorFile(file) {
    if (!file) return;

    clearMentorMedia();

    state.mentorObjectURL =
      URL.createObjectURL(file);

    state.mentorType = "video";

    if (mentorVideo) {
      mentorVideo.src =
        state.mentorObjectURL;

      mentorVideo.classList.add("show");

      mentorVideo.onloadedmetadata = () => {
        mentorVideo
          .play()
          .catch(() => {});

        renderCompositionFrame();
      };
    }

    if (mentorPlaceholder) {
      mentorPlaceholder.classList.add(
        "hidden"
      );
    }

    if (mentorSourceLabel) {
      mentorSourceLabel.textContent =
        "VIDEO";
    }

    toast(
      "Mentor video loaded",
      "success"
    );

    renderCompositionFrame();
  }

  /* =========================================================
     CAMERA QUALITY
     ========================================================= */

  function getCameraResolution() {
    const value =
      cameraQuality?.value || "720p";

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

      case "1080p":
        return {
          width: 1920,
          height: 1080
        };

      case "720p":
      default:
        return {
          width: 1280,
          height: 720
        };
    }
  }

  function getCameraFps() {
    return clamp(
      safeNumber(
        cameraFps?.value,
        30
      ),
      1,
      60
    );
  }

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

      const cameras = devices.filter(
        (device) =>
          device.kind ===
          "videoinput"
      );

      if (!cameraDeviceSelect) return;

      const previous =
        state.cameraDeviceId ||
        cameraDeviceSelect.value;

      cameraDeviceSelect.innerHTML =
        "";

      const autoOption =
        document.createElement("option");

      autoOption.value = "";
      autoOption.textContent =
        "Default Camera";

      cameraDeviceSelect.appendChild(
        autoOption
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

          cameraDeviceSelect.appendChild(
            option
          );
        }
      );

      if (
        cameras.some(
          (camera) =>
            camera.deviceId === previous
        )
      ) {
        cameraDeviceSelect.value =
          previous;
      }
    } catch (error) {
      console.warn(
        "Camera enumeration failed:",
        error
      );
    }
  }

  async function startCamera() {
    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      toast(
        "Camera is not supported in this browser",
        "error"
      );
      return;
    }

    stopCamera(false);

    const resolution =
      getCameraResolution();

    const fps = getCameraFps();

    const selectedDevice =
      cameraDeviceSelect?.value ||
      state.cameraDeviceId ||
      "";

    state.cameraWidth =
      resolution.width;

    state.cameraHeight =
      resolution.height;

    state.cameraFps = fps;

    const videoConstraints = {
      width: {
        ideal: resolution.width
      },
      height: {
        ideal: resolution.height
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

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: videoConstraints,
            audio: false
          }
        );

      state.cameraStream = stream;

      state.cameraDeviceId =
        selectedDevice;

      if (mentorCameraVideo) {
        mentorCameraVideo.srcObject =
          stream;

        mentorCameraVideo.muted = true;

        mentorCameraVideo.playsInline =
          true;

        mentorCameraVideo.classList.add(
          "show"
        );

        mentorCameraVideo.play().catch(
          () => {}
        );
      }

      state.mentorType = "camera";

      if (mentorPlaceholder) {
        mentorPlaceholder.classList.add(
          "hidden"
        );
      }

      if (mentorSourceLabel) {
        mentorSourceLabel.textContent =
          "CAMERA";
      }

      if (cameraStatus) {
        cameraStatus.textContent =
          "Camera online";
      }

      setIndicator(
        cameraIndicator,
        true,
        "CAMERA"
      );

      if (
        state.backgroundMode !==
        "original"
      ) {
        enableAISegmentation();
      }

      await enumerateCameras();

      toast(
        `Camera started — ${resolution.width}×${resolution.height} @ ${fps} FPS`,
        "success"
      );

      renderCompositionFrame();
    } catch (error) {
      console.error(
        "Camera start failed:",
        error
      );

      toast(
        `Camera error: ${error.message || "Unable to access camera"}`,
        "error"
      );
    }
  }

  function stopCamera(showToast = true) {
    if (state.cameraStream) {
      state.cameraStream
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      state.cameraStream = null;
    }

    if (mentorCameraVideo) {
      mentorCameraVideo.pause();
      mentorCameraVideo.srcObject = null;
      mentorCameraVideo.classList.remove(
        "show"
      );
    }

    if (state.mentorType === "camera") {
      state.mentorType = null;

      if (mentorPlaceholder) {
        mentorPlaceholder.classList.remove(
          "hidden"
        );
      }
    }

    setIndicator(
      cameraIndicator,
      false,
      "CAMERA"
    );

    if (cameraStatus) {
      cameraStatus.textContent =
        "Camera stopped";
    }

    if (showToast) {
      toast("Camera stopped", "info");
    }

    renderCompositionFrame();
  }

  async function switchCamera() {
    state.cameraFacingMode =
      state.cameraFacingMode ===
      "user"
        ? "environment"
        : "user";

    await startCamera();
  }

  /* =========================================================
     INDICATORS
     ========================================================= */

  function setIndicator(
    element,
    active,
    label
  ) {
    if (!element) return;

    element.classList.toggle(
      "active",
      !!active
    );

    const textNode =
      element.querySelector(
        "[data-indicator-text]"
      );

    if (textNode) {
      textNode.textContent = label;
    }
  }

  /* =========================================================
     AI SEGMENTATION
     ========================================================= */

  function enableAISegmentation() {
    if (
      typeof SelfieSegmentation ===
      "undefined"
    ) {
      toast(
        "AI background engine is not available",
        "error"
      );
      return;
    }

    if (state.selfieSegmentation) {
      state.aiEnabled = true;
      return;
    }

    try {
      state.selfieSegmentation =
        new SelfieSegmentation({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
        });

      state.selfieSegmentation.setOptions(
        {
          modelSelection: 1
        }
      );

      state.selfieSegmentation.onResults(
        handleSegmentationResults
      );

      state.aiEnabled = true;
      state.segmentationReady = true;
    } catch (error) {
      console.error(
        "AI initialization failed:",
        error
      );

      toast(
        "Unable to initialize AI background",
        "error"
      );
    }
  }

  async function processSegmentation(
    sourceVideo
  ) {
    if (
      !state.aiEnabled ||
      !state.selfieSegmentation ||
      !sourceVideo ||
      sourceVideo.readyState <
        HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      return;
    }

    const width =
      sourceVideo.videoWidth ||
      640;

    const height =
      sourceVideo.videoHeight ||
      360;

    ensureAICanvasSize(
      width,
      height
    );

    try {
      await state.selfieSegmentation.send(
        {
          image: sourceVideo
        }
      );
    } catch (error) {
      console.warn(
        "Segmentation frame failed:",
        error
      );
    }
  }

  function ensureAICanvasSize(
    width,
    height
  ) {
    if (!state.aiSourceCanvas) return;

    if (
      state.aiSourceCanvas.width !==
        width ||
      state.aiSourceCanvas.height !==
        height
    ) {
      state.aiSourceCanvas.width =
        width;

      state.aiSourceCanvas.height =
        height;
    }

    if (
      state.aiMaskCanvas &&
      (state.aiMaskCanvas.width !==
        width ||
        state.aiMaskCanvas.height !==
          height)
    ) {
      state.aiMaskCanvas.width =
        width;

      state.aiMaskCanvas.height =
        height;
    }

    if (
      mentorAICanvas &&
      (mentorAICanvas.width !==
        width ||
        mentorAICanvas.height !==
          height)
    ) {
      mentorAICanvas.width =
        width;

      mentorAICanvas.height =
        height;
    }

    if (
      state.personCanvas.width !==
        width ||
      state.personCanvas.height !==
        height
    ) {
      state.personCanvas.width =
        width;

      state.personCanvas.height =
        height;
    }
  }

  function handleSegmentationResults(
    results
  ) {
    if (
      !results ||
      !results.image ||
      !results.segmentationMask
    ) {
      return;
    }

    const image =
      results.image;

    const mask =
      results.segmentationMask;

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
      !state.aiSourceCtx ||
      !state.aiMaskCtx ||
      !state.personCtx
    ) {
      return;
    }

    state.aiSourceCtx.drawImage(
      image,
      0,
      0,
      width,
      height
    );

    state.aiMaskCtx.drawImage(
      mask,
      0,
      0,
      width,
      height
    );

    const sourceData =
      state.aiSourceCtx.getImageData(
        0,
        0,
        width,
        height
      );

    const maskData =
      state.aiMaskCtx.getImageData(
        0,
        0,
        width,
        height
      );

    const personData =
      state.personCtx.createImageData(
        width,
        height
      );

    const source =
      sourceData.data;

    const maskPixels =
      maskData.data;

    const target =
      personData.data;

    for (
      let i = 0, p = 0;
      i < source.length;
      i += 4, p += 4
    ) {
      const confidence =
        maskPixels[p] / 255;

      const alpha = clamp(
        (confidence - 0.15) / 0.65,
        0,
        1
      );

      target[i] =
        source[i];

      target[i + 1] =
        source[i + 1];

      target[i + 2] =
        source[i + 2];

      target[i + 3] =
        Math.round(alpha * 255);
    }

    state.personCtx.putImageData(
      personData,
      0,
      0
    );

    if (mentorAICanvas) {
      const ctx =
        state.aiCtx;

      if (ctx) {
        ctx.clearRect(
          0,
          0,
          width,
          height
        );

        drawBackground(
          ctx,
          image,
          width,
          height
        );

        ctx.drawImage(
          state.personCanvas,
          0,
          0,
          width,
          height
        );
      }

      mentorAICanvas.classList.add(
        "show"
      );
    }

    renderCompositionFrame();
  }

  function drawBackground(
    ctx,
    source,
    width,
    height
  ) {
    switch (state.backgroundMode) {
      case "remove":
        ctx.clearRect(
          0,
          0,
          width,
          height
        );
        break;

      case "blur":
        ctx.save();

        ctx.filter =
          "blur(18px)";

        const blurScale =
          1.05;

        ctx.drawImage(
          source,
          -width *
            (blurScale - 1) /
            2,
          -height *
            (blurScale - 1) /
            2,
          width * blurScale,
          height * blurScale
        );

        ctx.restore();
        break;

      case "image":
        if (
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
        } else {
          ctx.fillStyle =
            state.backgroundColor;

          ctx.fillRect(
            0,
            0,
            width,
            height
          );
        }
        break;

      case "color":
        ctx.fillStyle =
          state.backgroundColor;

        ctx.fillRect(
          0,
          0,
          width,
          height
        );
        break;

      case "original":
      default:
        ctx.drawImage(
          source,
          0,
          0,
          width,
          height
        );
        break;
    }
  }

  function drawCoverImage(
    ctx,
    image,
    x,
    y,
    width,
    height
  ) {
    const iw =
      image.naturalWidth ||
      image.videoWidth ||
      image.width;

    const ih =
      image.naturalHeight ||
      image.videoHeight ||
      image.height;

    if (!iw || !ih) return;

    const scale =
      Math.max(
        width / iw,
        height / ih
      );

    const dw = iw * scale;
    const dh = ih * scale;

    const dx =
      x +
      (width - dw) / 2;

    const dy =
      y +
      (height - dh) / 2;

    ctx.drawImage(
      image,
      dx,
      dy,
      dw,
      dh
    );
  }

  function getCurrentMentorSource() {
    if (
      state.mentorType ===
      "camera" &&
      mentorCameraVideo &&
      mentorCameraVideo.readyState >=
        HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      return mentorCameraVideo;
    }

    if (
      state.mentorType ===
      "video" &&
      mentorVideo &&
      mentorVideo.readyState >=
        HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      return mentorVideo;
    }

    return null;
  }

  /* =========================================================
     BACKGROUND BUTTONS
     ========================================================= */

  function setBackgroundMode(mode) {
    state.backgroundMode = mode;

    if (
      mode !== "original"
    ) {
      enableAISegmentation();
    }

    const buttons = [
      bgOriginalBtn,
      bgRemoveBtn,
      bgBlurBtn,
      bgImageBtn,
      bgColorBtn
    ];

    buttons.forEach((button) => {
      if (!button) return;

      button.classList.remove(
        "active"
      );
    });

    const map = {
      original: bgOriginalBtn,
      remove: bgRemoveBtn,
      blur: bgBlurBtn,
      image: bgImageBtn,
      color: bgColorBtn
    };

    map[mode]?.classList.add(
      "active"
    );

    if (
      backgroundUploadBox
    ) {
      backgroundUploadBox.classList.toggle(
        "show",
        mode === "image"
      );
    }

    renderCompositionFrame();
  }

  function loadBackgroundImage(file) {
    if (!file) return;

    if (state.backgroundObjectURL) {
      URL.revokeObjectURL(
        state.backgroundObjectURL
      );
    }

    state.backgroundObjectURL =
      URL.createObjectURL(file);

    const image =
      new Image();

    image.onload = () => {
      state.backgroundImage =
        image;

      setBackgroundMode(
        "image"
      );

      toast(
        "Background image loaded",
        "success"
      );
    };

    image.src =
      state.backgroundObjectURL;
  }

  /* =========================================================
     STAGE / COMPOSITION
     ========================================================= */

  function getRecordingDimensions() {
    const value =
      recordingQuality?.value ||
      recordingQualitySide?.value ||
      state.recordingQuality ||
      "1080p";

    switch (value) {
      case "720p":
        return {
          width: 1280,
          height: 720
        };

      case "1440p":
        return {
          width: 2560,
          height: 1440
        };

      case "1080p":
      default:
        return {
          width: 1920,
          height: 1080
        };
    }
  }

  function getRecordingFps() {
    const value =
      recordingFps?.value ||
      recordingFpsSide?.value ||
      state.recordingFps ||
      30;

    return clamp(
      safeNumber(value, 30),
      1,
      60
    );
  }

  function updateRecordingDimensions() {
    const dimensions =
      getRecordingDimensions();

    state.recordingWidth =
      dimensions.width;

    state.recordingHeight =
      dimensions.height;

    state.recordingFps =
      getRecordingFps();

    state.recordingQuality =
      recordingQuality?.value ||
      recordingQualitySide?.value ||
      state.recordingQuality;

    if (
      compositionCanvas.width !==
        dimensions.width ||
      compositionCanvas.height !==
        dimensions.height
    ) {
      compositionCanvas.width =
        dimensions.width;

      compositionCanvas.height =
        dimensions.height;
    }

    if (stageResolutionBadge) {
      stageResolutionBadge.textContent =
        `${dimensions.width}×${dimensions.height}`;
    }

    if (stageFpsBadge) {
      stageFpsBadge.textContent =
        `${state.recordingFps} FPS`;
    }
  }

  function drawMainContent(
    ctx,
    width,
    height
  ) {
    ctx.fillStyle = "#080b10";

    ctx.fillRect(
      0,
      0,
      width,
      height
    );

    let source = null;

    if (
      screenCaptureVideo &&
      screenCaptureVideo.classList.contains(
        "show"
      ) &&
      screenCaptureVideo.readyState >=
        HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      source =
        screenCaptureVideo;

      state.compositionSource =
        "SCREEN";
    } else if (
      mainVideo &&
      state.mainType === "video" &&
      mainVideo.readyState >=
        HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      source = mainVideo;

      state.compositionSource =
        "VIDEO";
    } else if (
      mainImage &&
      state.mainType === "image" &&
      mainImage.complete &&
      mainImage.naturalWidth
    ) {
      source = mainImage;

      state.compositionSource =
        "IMAGE";
    }

    if (source) {
      drawContainImage(
        ctx,
        source,
        0,
        0,
        width,
        height
      );
    } else {
      drawWelcomeCanvas(
        ctx,
        width,
        height
      );
    }

    if (stageSourceBadge) {
      stageSourceBadge.textContent =
        state.compositionSource;
    }
  }

  function drawContainImage(
    ctx,
    source,
    x,
    y,
    width,
    height
  ) {
    const sw =
      source.videoWidth ||
      source.naturalWidth ||
      source.width;

    const sh =
      source.videoHeight ||
      source.naturalHeight ||
      source.height;

    if (!sw || !sh) return;

    const scale =
      Math.min(
        width / sw,
        height / sh
      );

    const dw =
      sw * scale;

    const dh =
      sh * scale;

    const dx =
      x +
      (width - dw) / 2;

    const dy =
      y +
      (height - dh) / 2;

    ctx.drawImage(
      source,
      dx,
      dy,
      dw,
      dh
    );
  }

  function drawWelcomeCanvas(
    ctx,
    width,
    height
  ) {
    ctx.fillStyle = "#0b1017";

    ctx.fillRect(
      0,
      0,
      width,
      height
    );

    ctx.save();

    ctx.fillStyle =
      "rgba(255,255,255,.8)";

    ctx.textAlign = "center";
    ctx.textBaseline =
      "middle";

    ctx.font =
      `${Math.round(width * 0.026)}px Arial`;

    ctx.fillText(
      "Personal Course Studio",
      width / 2,
      height / 2 - 20
    );

    ctx.fillStyle =
      "rgba(255,255,255,.42)";

    ctx.font =
      `${Math.round(width * 0.012)}px Arial`;

    ctx.fillText(
      "Upload a slide, image, or video to begin",
      width / 2,
      height / 2 + 35
    );

    ctx.restore();
  }

  function drawMentorOnComposition(
    ctx,
    width,
    height
  ) {
    const source =
      getCurrentMentorSource();

    if (!source) return;

    const mentorX =
      state.mentorRect.x *
      width;

    const mentorY =
      state.mentorRect.y *
      height;

    const mentorWidth =
      state.mentorRect.width *
      width;

    const mentorHeight =
      state.mentorRect.height *
      height;

    ctx.save();

    ctx.beginPath();

    ctx.roundRect(
      mentorX,
      mentorY,
      mentorWidth,
      mentorHeight,
      Math.min(
        mentorWidth,
        mentorHeight
      ) * 0.06
    );

    ctx.clip();

    if (
      state.mentorType ===
        "camera" &&
      state.backgroundMode !==
        "original" &&
      mentorAICanvas &&
      mentorAICanvas.classList.contains(
        "show"
      )
    ) {
      ctx.drawImage(
        mentorAICanvas,
        mentorX,
        mentorY,
        mentorWidth,
        mentorHeight
      );
    } else {
      drawCoverImage(
        ctx,
        source,
        mentorX,
        mentorY,
        mentorWidth,
        mentorHeight
      );
    }

    ctx.restore();

    ctx.save();

    ctx.strokeStyle =
      "rgba(255,255,255,.22)";

    ctx.lineWidth =
      Math.max(
        1,
        width * 0.001
      );

    ctx.strokeRect(
      mentorX,
      mentorY,
      mentorWidth,
      mentorHeight
    );

    ctx.restore();
  }

  function drawBrandOnComposition(
    ctx,
    width,
    height
  ) {
    if (
      !state.settings.brandName
    ) {
      return;
    }

    const padding =
      width * 0.015;

    const fontSize =
      Math.max(
        16,
        Math.round(width * 0.012)
      );

    ctx.save();

    ctx.font =
      `600 ${fontSize}px Arial`;

    const text =
      state.settings.brandName;

    const metrics =
      ctx.measureText(text);

    const boxWidth =
      metrics.width +
      padding * 2;

    const boxHeight =
      fontSize +
      padding;

    const x = padding;
    const y =
      height -
      boxHeight -
      padding;

    ctx.fillStyle =
      "rgba(7,10,15,.72)";

    ctx.beginPath();

    ctx.roundRect(
      x,
      y,
      boxWidth,
      boxHeight,
      boxHeight * 0.3
    );

    ctx.fill();

    ctx.fillStyle =
      "#ffffff";

    ctx.textBaseline =
      "middle";

    ctx.fillText(
      text,
      x + padding,
      y +
        boxHeight / 2
    );

    ctx.restore();
  }

  function drawRecordingOverlay(
    ctx,
    width,
    height
  ) {
    if (!state.recordingActive) {
      return;
    }

    const fontSize =
      Math.max(
        18,
        Math.round(width * 0.012)
      );

    ctx.save();

    ctx.fillStyle =
      "#ff3344";

    ctx.beginPath();

    ctx.arc(
      width * 0.025,
      height * 0.04,
      fontSize * 0.35,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
      "#ffffff";

    ctx.font =
      `700 ${fontSize}px Arial`;

    ctx.textBaseline =
      "middle";

    ctx.fillText(
      formatRecordingElapsed(),
      width * 0.04,
      height * 0.04
    );

    ctx.restore();
  }

  function drawTeleprompterOnComposition(
    ctx,
    width,
    height
  ) {
    if (
      !includeTeleprompterInRecording?.checked
    ) {
      return;
    }

    if (
      !state.settings
        .showTeleprompterRecording
    ) {
      return;
    }

    if (!state.teleprompterText) {
      return;
    }

    const padding =
      width * 0.02;

    const boxHeight =
      height * 0.25;

    const y =
      height -
      boxHeight -
      padding;

    ctx.save();

    ctx.fillStyle =
      `rgba(0,0,0,${clamp(
        state.teleprompterOpacity,
        0,
        1
      ) * 0.72})`;

    ctx.fillRect(
      padding,
      y,
      width -
        padding * 2,
      boxHeight
    );

    ctx.beginPath();

    ctx.rect(
      padding,
      y,
      width -
        padding * 2,
      boxHeight
    );

    ctx.clip();

    ctx.fillStyle =
      "#ffffff";

    ctx.textAlign = "left";
    ctx.textBaseline =
      "top";

    const fontSize =
      clamp(
        state.teleprompterFontSize *
          (width / 1920),
        18,
        90
      );

    ctx.font =
      `600 ${fontSize}px Arial`;

    const lines =
      wrapCanvasText(
        ctx,
        state.teleprompterText,
        width -
          padding * 4
      );

    const lineHeight =
      fontSize * 1.35;

    let startY =
      y +
      padding -
      state.teleprompterScroll;

    lines.forEach((line) => {
      ctx.fillText(
        line,
        padding * 2,
        startY
      );

      startY +=
        lineHeight;
    });

    ctx.restore();
  }

  function wrapCanvasText(
    ctx,
    text,
    maxWidth
  ) {
    const words =
      text.split(/\s+/);

    const lines = [];
    let line = "";

    words.forEach((word) => {
      const test =
        line
          ? `${line} ${word}`
          : word;

      if (
        ctx.measureText(test)
          .width >
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

  function renderCompositionFrame() {
    if (
      !compositionCtx ||
      !compositionCanvas.width ||
      !compositionCanvas.height
    ) {
      return;
    }

    updateRecordingDimensions();

    const width =
      compositionCanvas.width;

    const height =
      compositionCanvas.height;

    drawMainContent(
      compositionCtx,
      width,
      height
    );

    drawMentorOnComposition(
      compositionCtx,
      width,
      height
    );

    drawTeleprompterOnComposition(
      compositionCtx,
      width,
      height
    );

    drawBrandOnComposition(
      compositionCtx,
      width,
      height
    );

    drawRecordingOverlay(
      compositionCtx,
      width,
      height
    );
  }

  /* =========================================================
     CONTINUOUS RENDER LOOP
     ========================================================= */

  function startRenderLoop() {
    if (state.renderAnimationId) {
      return;
    }

    const loop = () => {
      state.renderAnimationId =
        requestAnimationFrame(loop);

      renderCompositionFrame();

      if (
        state.recordingActive
      ) {
        updateAudioMeters();
        updateWaveform();
        updateRecordingUI();
      }
    };

    loop();
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
     MENTOR DRAG
     ========================================================= */

  function getStageCoordinates(
    event
  ) {
    if (!stage) {
      return {
        x: 0,
        y: 0
      };
    }

    const rect =
      stage.getBoundingClientRect();

    const clientX =
      event.clientX ??
      event.touches?.[0]?.clientX ??
      0;

    const clientY =
      event.clientY ??
      event.touches?.[0]?.clientY ??
      0;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      width: rect.width,
      height: rect.height
    };
  }

  function beginMentorDrag(event) {
    if (
      event.target ===
        mentorResize ||
      !mentorCard
    ) {
      return;
    }

    if (
      !getCurrentMentorSource()
    ) {
      return;
    }

    const coords =
      getStageCoordinates(event);

    const cardRect =
      mentorCard.getBoundingClientRect();

    const stageRect =
      stage.getBoundingClientRect();

    state.drag.active =
      true;

    state.drag.offsetX =
      coords.x -
      (cardRect.left -
        stageRect.left);

    state.drag.offsetY =
      coords.y -
      (cardRect.top -
        stageRect.top);

    mentorCard.setPointerCapture?.(
      event.pointerId
    );

    event.preventDefault();
  }

  function moveMentorDrag(event) {
    if (
      !state.drag.active ||
      !stage
    ) {
      return;
    }

    const coords =
      getStageCoordinates(event);

    const cardWidth =
      mentorCard.offsetWidth;

    const cardHeight =
      mentorCard.offsetHeight;

    const x =
      clamp(
        coords.x -
          state.drag.offsetX,
        0,
        coords.width -
          cardWidth
      );

    const y =
      clamp(
        coords.y -
          state.drag.offsetY,
        0,
        coords.height -
          cardHeight
      );

    state.mentorRect.x =
      x / coords.width;

    state.mentorRect.y =
      y / coords.height;

    applyMentorRect();

    event.preventDefault();
  }

  function endMentorDrag() {
    state.drag.active =
      false;
  }

  function beginMentorResize(event) {
    if (
      !mentorResize ||
      !mentorCard ||
      !stage
    ) {
      return;
    }

    const rect =
      mentorCard.getBoundingClientRect();

    state.resize.active =
      true;

    state.resize.startX =
      event.clientX;

    state.resize.startY =
      event.clientY;

    state.resize.startWidth =
      rect.width;

    state.resize.startHeight =
      rect.height;

    mentorResize.setPointerCapture?.(
      event.pointerId
    );

    event.preventDefault();
  }

  function moveMentorResize(event) {
    if (
      !state.resize.active ||
      !stage
    ) {
      return;
    }

    const stageRect =
      stage.getBoundingClientRect();

    const dx =
      event.clientX -
      state.resize.startX;

    const dy =
      event.clientY -
      state.resize.startY;

    const delta =
      Math.abs(dx) >
      Math.abs(dy)
        ? dx
        : dy;

    const newWidth =
      clamp(
        state.resize.startWidth +
          delta,
        130,
        stageRect.width *
          0.45
      );

    const ratio =
      16 / 9;

    const newHeight =
      newWidth / ratio;

    state.mentorRect.width =
      newWidth /
      stageRect.width;

    state.mentorRect.height =
      newHeight /
      stageRect.height;

    state.mentorRect.x =
      clamp(
        state.mentorRect.x,
        0,
        1 -
          state.mentorRect.width
      );

    state.mentorRect.y =
      clamp(
        state.mentorRect.y,
        0,
        1 -
          state.mentorRect.height
      );

    applyMentorRect();

    event.preventDefault();
  }

  function endMentorResize() {
    state.resize.active =
      false;
  }

  function applyMentorRect() {
    if (!mentorCard || !stage) {
      return;
    }

    mentorCard.style.left =
      `${state.mentorRect.x * 100}%`;

    mentorCard.style.top =
      `${state.mentorRect.y * 100}%`;

    mentorCard.style.right =
      "auto";

    mentorCard.style.bottom =
      "auto";

    mentorCard.style.width =
      `${state.mentorRect.width * 100}%`;

    mentorCard.style.height =
      `${state.mentorRect.height * 100}%`;
  }

  /* =========================================================
     AUDIO ENGINE
     ========================================================= */

  async function ensureAudioContext() {
    if (
      state.audioContext
    ) {
      if (
        state.audioContext.state ===
        "suspended"
      ) {
        await state.audioContext.resume();
      }

      return state.audioContext;
    }

    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContextClass) {
      toast(
        "Web Audio is not supported",
        "error"
      );
      return null;
    }

    const context =
      new AudioContextClass();

    const destination =
      context.createMediaStreamDestination();

    state.audioContext =
      context;

    state.audioDestination =
      destination;

    return context;
  }

  async function setupMainAudio() {
    if (
      !mainVideo ||
      state.mainType !== "video"
    ) {
      return;
    }

    const context =
      await ensureAudioContext();

    if (!context) return;

    if (
      state.mainMediaSource
    ) {
      return;
    }

    try {
      state.mainMediaSource =
        context.createMediaElementSource(
          mainVideo
        );

      state.mainGain =
        context.createGain();

      state.mainAnalyser =
        context.createAnalyser();

      state.mainAnalyser.fftSize =
        1024;

      state.mainMediaSource.connect(
        state.mainGain
      );

      state.mainGain.connect(
        state.mainAnalyser
      );

      state.mainAnalyser.connect(
        state.audioDestination
      );

      state.mainGain.connect(
        context.destination
      );

      updateMainVolume();
    } catch (error) {
      console.warn(
        "Main audio setup failed:",
        error
      );
    }
  }

  async function setupMicrophone() {
    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      return;
    }

    const context =
      await ensureAudioContext();

    if (!context) return;

    if (
      state.micSource
    ) {
      return;
    }

    try {
      const stream =
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

      const source =
        context.createMediaStreamSource(
          stream
        );

      const gain =
        context.createGain();

      const analyser =
        context.createAnalyser();

      analyser.fftSize =
        1024;

      const monitorGain =
        context.createGain();

      source.connect(gain);

      gain.connect(analyser);

      analyser.connect(
        state.audioDestination
      );

      gain.connect(
        monitorGain
      );

      monitorGain.connect(
        context.destination
      );

      state.micSource =
        source;

      state.micGain =
        gain;

      state.micAnalyser =
        analyser;

      state.micMonitorGain =
        monitorGain;

      state.micStream =
        stream;

      updateMicVolume();
      updateMicMonitor();

      setIndicator(
        micIndicator,
        true,
        "MIC"
      );

      toast(
        "Microphone enabled",
        "success"
      );
    } catch (error) {
      console.error(
        "Microphone setup failed:",
        error
      );

      if (micEnabled) {
        micEnabled.checked =
          false;
      }

      setIndicator(
        micIndicator,
        false,
        "MIC"
      );

      toast(
        "Microphone permission was not granted",
        "error"
      );
    }
  }

  function updateMainVolume() {
    const volume =
      clamp(
        safeNumber(
          mainVideoVolume?.value,
          1
        ),
        0,
        1
      );

    if (mainVolumeValue) {
      mainVolumeValue.textContent =
        `${Math.round(
          volume * 100
        )}%`;
    }

    if (state.mainGain) {
      state.mainGain.gain.value =
        mainVideoAudioCheckbox?.checked
          ? volume
          : 0;
    }

    if (mainVideo) {
      mainVideo.volume =
        volume;

      mainVideo.muted =
        !mainVideoAudioCheckbox?.checked;
    }
  }

  function updateMicVolume() {
    const volume =
      clamp(
        safeNumber(
          micVolume?.value,
          1
        ),
        0,
        1
      );

    if (micVolumeValue) {
      micVolumeValue.textContent =
        `${Math.round(
          volume * 100
        )}%`;
    }

    if (state.micGain) {
      state.micGain.gain.value =
        micEnabled?.checked
          ? volume
          : 0;
    }
  }

  function updateMicMonitor() {
    if (!state.micMonitorGain) {
      return;
    }

    state.micMonitorGain.gain.value =
      micMonitor?.checked
        ? 1
        : 0;
  }

  function disconnectMicrophone() {
    if (state.micStream) {
      state.micStream
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      state.micStream =
        null;
    }

    try {
      state.micSource?.disconnect();
    } catch (_) {}

    try {
      state.micGain?.disconnect();
    } catch (_) {}

    try {
      state.micAnalyser?.disconnect();
    } catch (_) {}

    try {
      state.micMonitorGain?.disconnect();
    } catch (_) {}

    state.micSource = null;
    state.micGain = null;
    state.micAnalyser = null;
    state.micMonitorGain = null;

    setIndicator(
      micIndicator,
      false,
      "MIC"
    );
  }

  /* =========================================================
     AUDIO METERS
     ========================================================= */

  function getAnalyserLevel(analyser) {
    if (!analyser) return 0;

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
        state.mainAnalyser
      );

    if (micLevelBar) {
      micLevelBar.style.width =
        `${Math.round(
          micLevel * 100
        )}%`;
    }

    if (micLevelValue) {
      micLevelValue.textContent =
        `${Math.round(
          micLevel * 100
        )}%`;
    }

    if (mainAudioLevelBar) {
      mainAudioLevelBar.style.width =
        `${Math.round(
          mainLevel * 100
        )}%`;
    }

    if (mainAudioLevelValue) {
      mainAudioLevelValue.textContent =
        `${Math.round(
          mainLevel * 100
        )}%`;
    }
  }

  function updateWaveform() {
    if (!micWaveformCanvas) {
      return;
    }

    const ctx =
      micWaveformCanvas.getContext(
        "2d"
      );

    const width =
      micWaveformCanvas.width =
        micWaveformCanvas.clientWidth ||
        300;

    const height =
      micWaveformCanvas.height =
        micWaveformCanvas.clientHeight ||
        80;

    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    ctx.fillStyle =
      "rgba(0,0,0,.18)";

    ctx.fillRect(
      0,
      0,
      width,
      height
    );

    if (!state.micAnalyser) {
      return;
    }

    const bufferLength =
      state.micAnalyser.fftSize;

    const data =
      new Uint8Array(
        bufferLength
      );

    state.micAnalyser.getByteTimeDomainData(
      data
    );

    ctx.beginPath();

    ctx.lineWidth = 2;
    ctx.strokeStyle =
      "#6ee7ff";

    const sliceWidth =
      width / bufferLength;

    let x = 0;

    for (
      let i = 0;
      i < bufferLength;
      i++
    ) {
      const v =
        data[i] / 128;

      const y =
        (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.stroke();
  }

  /* =========================================================
     SCREEN CAPTURE
     ========================================================= */

  async function startScreenCapture() {
    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getDisplayMedia
    ) {
      toast(
        "Screen capture is not supported in this browser",
        "error"
      );
      return;
    }

    stopScreenCapture(false);

    try {
      const stream =
        await navigator.mediaDevices.getDisplayMedia(
          {
            video: {
              frameRate: {
                ideal:
                  state.recordingFps,
                max:
                  state.recordingFps
              }
            },
            audio: true
          }
        );

      state.screenStream =
        stream;

      if (screenCaptureVideo) {
        screenCaptureVideo.srcObject =
          stream;

        screenCaptureVideo.muted =
          true;

        screenCaptureVideo.classList.add(
          "show"
        );

        screenCaptureVideo.play().catch(
          () => {}
        );
      }

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

      const audioTrack =
        stream.getAudioTracks()[0];

      if (audioTrack) {
        await connectScreenAudio(
          stream
        );
      }

      setIndicator(
        screenIndicator,
        true,
        "SCREEN"
      );

      if (screenCaptureStatus) {
        screenCaptureStatus.textContent =
          "Screen capture active";
      }

      if (
        screenCaptureStatusLight
      ) {
        screenCaptureStatusLight.classList.add(
          "active"
        );
      }

      toast(
        "Screen capture started",
        "success"
      );

      renderCompositionFrame();
    } catch (error) {
      console.error(
        "Screen capture failed:",
        error
      );

      toast(
        "Screen capture cancelled or unavailable",
        "warning"
      );
    }
  }

  async function connectScreenAudio(
    stream
  ) {
    const context =
      await ensureAudioContext();

    if (!context) return;

    if (
      state.screenAudioSource
    ) {
      return;
    }

    const audioTracks =
      stream.getAudioTracks();

    if (!audioTracks.length) {
      return;
    }

    const audioOnlyStream =
      new MediaStream(
        audioTracks
      );

    try {
      const source =
        context.createMediaStreamSource(
          audioOnlyStream
        );

      const gain =
        context.createGain();

      source.connect(gain);

      gain.connect(
        state.audioDestination
      );

      state.screenAudioSource =
        source;

      state.screenAudioGain =
        gain;

      state.screenAudioGain.gain.value =
        1;

      setIndicator(
        audioIndicator,
        true,
        "AUDIO"
      );
    } catch (error) {
      console.warn(
        "Screen audio setup failed:",
        error
      );
    }
  }

  function stopScreenCapture(
    showToast = true
  ) {
    if (state.screenStream) {
      state.screenStream
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      state.screenStream =
        null;
    }

    try {
      state.screenAudioSource?.disconnect();
    } catch (_) {}

    try {
      state.screenAudioGain?.disconnect();
    } catch (_) {}

    state.screenAudioSource =
      null;

    state.screenAudioGain =
      null;

    if (screenCaptureVideo) {
      screenCaptureVideo.pause();
      screenCaptureVideo.srcObject =
        null;

      screenCaptureVideo.classList.remove(
        "show"
      );
    }

    setIndicator(
      screenIndicator,
      false,
      "SCREEN"
    );

    if (
      screenCaptureStatus
    ) {
      screenCaptureStatus.textContent =
        "Screen capture stopped";
    }

    if (
      screenCaptureStatusLight
    ) {
      screenCaptureStatusLight.classList.remove(
        "active"
      );
    }

    if (showToast) {
      toast(
        "Screen capture stopped",
        "info"
      );
    }

    renderCompositionFrame();
  }

  /* =========================================================
     RECORDING MIME TYPES
     ========================================================= */

  function getRequestedRecordingMime() {
    const value =
      recordingFormat?.value ||
      recordingFormatSide?.value ||
      "webm-vp9";

    switch (value) {
      case "mp4":
        return "video/mp4;codecs=\"avc1.42E01E,mp4a.40.2\"";

      case "webm-vp8":
        return "video/webm;codecs=vp8,opus";

      case "webm":
        return "video/webm";

      case "webm-vp9":
      default:
        return "video/webm;codecs=vp9,opus";
    }
  }

  function detectRecordingMimeType() {
    if (
      typeof MediaRecorder ===
      "undefined"
    ) {
      return null;
    }

    const requested =
      getRequestedRecordingMime();

    const candidates = [
      requested,

      "video/webm;codecs=vp9,opus",

      "video/webm;codecs=vp8,opus",

      "video/webm",

      "video/mp4;codecs=\"avc1.42E01E,mp4a.40.2\"",

      "video/mp4"
    ];

    for (
      const mime of candidates
    ) {
      try {
        if (
          MediaRecorder.isTypeSupported(
            mime
          )
        ) {
          return mime;
        }
      } catch (_) {}
    }

    return null;
  }

  function getExtensionFromMime(
    mime
  ) {
    if (
      mime?.toLowerCase().includes(
        "mp4"
      )
    ) {
      return "mp4";
    }

    return "webm";
  }

  /* =========================================================
     RECORDING AUDIO STREAM
     ========================================================= */

  async function prepareAudioForRecording() {
    const context =
      await ensureAudioContext();

    if (!context) {
      return null;
    }

    if (
      mainVideo &&
      state.mainType === "video"
    ) {
      await setupMainAudio();
    }

    if (
      micEnabled?.checked &&
      !state.micSource
    ) {
      await setupMicrophone();
    }

    if (
      context.state ===
      "suspended"
    ) {
      await context.resume();
    }

    const audioStream =
      state.audioDestination
        ?.stream || null;

    return audioStream;
  }

  /* =========================================================
     RECORDING START
     ========================================================= */

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
      toast(
        "MediaRecorder is not supported",
        "error"
      );
      return;
    }

    updateRecordingDimensions();

    const mime =
      detectRecordingMimeType();

    if (!mime) {
      toast(
        "No supported recording format found",
        "error"
      );
      return;
    }

    state.recordingMimeType =
      mime;

    state.recordingExtension =
      getExtensionFromMime(
        mime
      );

    const audioStream =
      await prepareAudioForRecording();

    const videoStream =
      compositionCanvas.captureStream(
        state.recordingFps
      );

    const tracks = [
      ...videoStream.getVideoTracks()
    ];

    if (audioStream) {
      tracks.push(
        ...audioStream.getAudioTracks()
      );
    }

    const recordingStream =
      new MediaStream(tracks);

    const options = {
      mimeType: mime,
      videoBitsPerSecond:
        calculateVideoBitrate(),
      audioBitsPerSecond:
        160000
    };

    let recorder;

    try {
      recorder =
        new MediaRecorder(
          recordingStream,
          options
        );
    } catch (error) {
      console.warn(
        "Preferred recorder failed:",
        error
      );

      try {
        recorder =
          new MediaRecorder(
            recordingStream
          );
      } catch (fallbackError) {
        toast(
          "Unable to start recorder",
          "error"
        );

        console.error(
          fallbackError
        );

        return;
      }
    }

    state.currentRecorder =
      recorder;

    state.recordingChunks =
      [];

    state.recordingActive =
      true;

    state.recordingPaused =
      false;

    state.recordingElapsedBeforePause =
      0;

    state.recordingStartedAt =
      performance.now();

    recorder.ondataavailable = (
      event
    ) => {
      if (
        event.data &&
        event.data.size > 0
      ) {
        state.recordingChunks.push(
          event.data
        );
      }
    };

    recorder.onerror = (event) => {
      console.error(
        "MediaRecorder error:",
        event.error
      );

      toast(
        "Recording error occurred",
        "error"
      );
    };

    recorder.onstop = async () => {
      await finishRecording();
    };

    recorder.onpause = () => {
      state.recordingPaused =
        true;

      updateRecordingUI();

      toast(
        "Recording paused",
        "info"
      );
    };

    recorder.onresume = () => {
      state.recordingPaused =
        false;

      state.recordingStartedAt =
        performance.now();

      updateRecordingUI();

      toast(
        "Recording resumed",
        "success"
      );
    };

    renderCompositionFrame();

    try {
      recorder.start(1000);
    } catch (error) {
      state.recordingActive =
        false;

      toast(
        "Unable to start recording",
        "error"
      );

      return;
    }

    startRecordingTimer();

    if (
      state.settings
        .autoStartTeleprompter &&
      state.teleprompterText
    ) {
      startTeleprompter();
    }

    setIndicator(
      audioIndicator,
      !!audioStream,
      "AUDIO"
    );

    updateRecordingUI();

    toast(
      `Recording started — ${state.recordingWidth}×${state.recordingHeight} @ ${state.recordingFps} FPS`,
      "success"
    );
  }

  function calculateVideoBitrate() {
    if (
      state.recordingWidth >=
      2560
    ) {
      return 18000000;
    }

    if (
      state.recordingWidth >=
      1920
    ) {
      return 12000000;
    }

    return 8000000;
  }

  /* =========================================================
     PAUSE / RESUME
     ========================================================= */

  function pauseRecording() {
    if (
      !state.currentRecorder ||
      !state.recordingActive
    ) {
      return;
    }

    if (
      state.currentRecorder.state ===
      "recording"
    ) {
      state.recordingElapsedBeforePause =
        getRecordingElapsed();

      state.currentRecorder.pause();
    }
  }

  function resumeRecording() {
    if (
      !state.currentRecorder ||
      !state.recordingActive
    ) {
      return;
    }

    if (
      state.currentRecorder.state ===
      "paused"
    ) {
      state.recordingStartedAt =
        performance.now();

      state.currentRecorder.resume();
    }
  }

  /* =========================================================
     STOP RECORDING
     ========================================================= */

  function stopRecording() {
    if (
      !state.currentRecorder ||
      !state.recordingActive
    ) {
      return;
    }

    try {
      if (
        state.currentRecorder.state !==
        "inactive"
      ) {
        state.currentRecorder.stop();
      }
    } catch (error) {
      console.error(
        "Stop recording failed:",
        error
      );

      finishRecording();
    }
  }

  async function finishRecording() {
    if (
      !state.recordingActive &&
      !state.recordingChunks.length
    ) {
      return;
    }

    stopRecordingTimer();

    const blob =
      new Blob(
        state.recordingChunks,
        {
          type:
            state.recordingMimeType ||
            "video/webm"
        }
      );

    state.recordingBlob =
      blob;

    state.recordingActive =
      false;

    state.recordingPaused =
      false;

    if (
      state.recordingURL
    ) {
      URL.revokeObjectURL(
        state.recordingURL
      );
    }

    state.recordingURL =
      URL.createObjectURL(blob);

    const name =
      getRecordingName();

    const historyItem = {
      id: nowId(),
      name,
      createdAt:
        new Date().toISOString(),
      duration:
        getRecordingElapsed(),
      size: blob.size,
      mimeType:
        blob.type ||
        state.recordingMimeType,
      width:
        state.recordingWidth,
      height:
        state.recordingHeight,
      fps:
        state.recordingFps,
      extension:
        getExtensionFromMime(
          blob.type
        )
    };

    state.currentRecordingId =
      historyItem.id;

    await saveRecordingToDB(
      historyItem,
      blob
    );

    state.history.unshift(
      historyItem
    );

    saveHistoryMetadata();

    state.previewOriginalBlob =
      blob;

    state.previewOriginalURL =
      state.recordingURL;

    state.previewTrimStart = 0;
    state.previewTrimEnd = 0;

    openRecordingPreview(
      historyItem
    );

    updateRecordingUI();

    renderCompositionFrame();

    toast(
      "Recording completed",
      "success"
    );
  }

  /* =========================================================
     RECORDING TIMER
     ========================================================= */

  function startRecordingTimer() {
    stopRecordingTimer();

    state.recordingTimerInterval =
      setInterval(() => {
        updateRecordingUI();
      }, 250);
  }

  function stopRecordingTimer() {
    if (
      state.recordingTimerInterval
    ) {
      clearInterval(
        state.recordingTimerInterval
      );

      state.recordingTimerInterval =
        null;
    }
  }

  function getRecordingElapsed() {
    if (
      !state.recordingStartedAt
    ) {
      return (
        state.recordingElapsedBeforePause /
        1000
      );
    }

    if (
      state.recordingPaused
    ) {
      return (
        state.recordingElapsedBeforePause /
        1000
      );
    }

    return (
      state.recordingElapsedBeforePause +
      (performance.now() -
        state.recordingStartedAt)
    ) / 1000;
  }

  function formatRecordingElapsed() {
    return formatTime(
      getRecordingElapsed()
    );
  }

  function updateRecordingUI() {
    const active =
      state.recordingActive;

    const paused =
      state.recordingPaused;

    if (recordingStatusBar) {
      recordingStatusBar.classList.toggle(
        "active",
        active
      );

      recordingStatusBar.classList.toggle(
        "paused",
        paused
      );
    }

    if (recordingStatusDot) {
      recordingStatusDot.classList.toggle(
        "active",
        active
      );

      recordingStatusDot.classList.toggle(
        "paused",
        paused
      );
    }

    if (recordingStatusText) {
      recordingStatusText.textContent =
        !active
          ? "Ready"
          : paused
          ? "Paused"
          : "Recording";
    }

    if (recordingTimer) {
      recordingTimer.textContent =
        active ||
        state.recordingElapsedBeforePause
          ? formatRecordingElapsed()
          : "00:00";
    }

    if (recordingOverlayTimer) {
      recordingOverlayTimer.textContent =
        formatRecordingElapsed();
    }

    if (pauseRecordingBtn) {
      pauseRecordingBtn.disabled =
        !active ||
        paused;
    }

    if (resumeRecordingBtn) {
      resumeRecordingBtn.disabled =
        !active ||
        !paused;
    }

    if (stopRecordingBtn) {
      stopRecordingBtn.disabled =
        !active;
    }

    if (recordBtn) {
      recordBtn.classList.toggle(
        "recording",
        active
      );
    }

    if (recordToolbarBtn) {
      recordToolbarBtn.classList.toggle(
        "recording",
        active
      );
    }

    if (recordingOverlay) {
      recordingOverlay.classList.toggle(
        "show",
        active
      );
    }

    if (stageFpsBadge) {
      stageFpsBadge.textContent =
        `${state.recordingFps} FPS`;
    }
  }

  /* =========================================================
     RECORDING NAME
     ========================================================= */

  function getRecordingName() {
    const input =
      recordingFileNameSide?.value ||
      recordingFileName?.value ||
      state.selectedRecordingName ||
      "mentor-studio-recording";

    const cleaned =
      input
        .trim()
        .replace(
          /[<>:"/\\|?*\x00-\x1F]/g,
          "-"
        );

    return (
      cleaned ||
      "mentor-studio-recording"
    );
  }

  function getDownloadFileName(
    item
  ) {
    const extension =
      getExtensionFromMime(
        item?.mimeType ||
          state.recordingMimeType
      );

    let name =
      item?.name ||
      getRecordingName();

    name =
      name.replace(
        /\.(webm|mp4)$/i,
        ""
      );

    return `${name}.${extension}`;
  }

  /* =========================================================
     RECORDING PREVIEW
     ========================================================= */

  function openRecordingPreview(
    historyItem
  ) {
    if (
      !recordingPreviewModal ||
      !recordingPreviewVideo
    ) {
      return;
    }

    const item =
      historyItem ||
      getCurrentHistoryItem();

    if (!state.recordingBlob) {
      return;
    }

    recordingPreviewVideo.src =
      state.recordingURL;

    recordingPreviewVideo.load();

    if (recordingFileName) {
      recordingFileName.value =
        item?.name ||
        getRecordingName();
    }

    if (recordingFileInfo) {
      recordingFileInfo.innerHTML = `
        <div class="recording-info-row">
          <span>Format</span>
          <strong>${escapeHTML(
            item?.mimeType ||
              state.recordingMimeType
          )}</strong>
        </div>
        <div class="recording-info-row">
          <span>Size</span>
          <strong>${formatBytes(
            item?.size ||
              state.recordingBlob.size
          )}</strong>
        </div>
        <div class="recording-info-row">
          <span>Resolution</span>
          <strong>${
            item?.width ||
            state.recordingWidth
          }×${
            item?.height ||
            state.recordingHeight
          }</strong>
        </div>
        <div class="recording-info-row">
          <span>FPS</span>
          <strong>${
            item?.fps ||
            state.recordingFps
          }</strong>
        </div>
      `;
    }

    recordingPreviewVideo.onloadedmetadata =
      () => {
        const duration =
          recordingPreviewVideo.duration ||
          item?.duration ||
          0;

        if (recordingDuration) {
          recordingDuration.textContent =
            formatTime(duration);
        }

        if (
          recordingCurrentTime
        ) {
          recordingCurrentTime.textContent =
            "00:00";
        }

        if (
          recordingTrimStart
        ) {
          recordingTrimStart.min = 0;
          recordingTrimStart.max =
            duration;
          recordingTrimStart.value =
            0;
        }

        if (
          recordingTrimEnd
        ) {
          recordingTrimEnd.min = 0;
          recordingTrimEnd.max =
            duration;
          recordingTrimEnd.value =
            duration;
        }

        if (
          recordingTrimStartTime
        ) {
          recordingTrimStartTime.textContent =
            "00:00";
        }

        if (
          recordingTrimEndTime
        ) {
          recordingTrimEndTime.textContent =
            formatTime(duration);
        }

        state.previewTrimStart =
          0;

        state.previewTrimEnd =
          duration;
      };

    openModal(
      recordingPreviewModal
    );

    renderRecordingHistory();
  }

  function getCurrentHistoryItem() {
    return state.history.find(
      (item) =>
        item.id ===
        state.currentRecordingId
    );
  }

  /* =========================================================
     PREVIEW CONTROLS
     ========================================================= */

  function previewPlay() {
    recordingPreviewVideo
      ?.play()
      .catch(() => {});
  }

  function previewPause() {
    recordingPreviewVideo?.pause();
  }

  function updatePreviewCurrentTime() {
    if (
      !recordingPreviewVideo
    ) {
      return;
    }

    if (recordingCurrentTime) {
      recordingCurrentTime.textContent =
        formatTime(
          recordingPreviewVideo.currentTime
        );
    }
  }

  function updateTrimStart(value) {
    const duration =
      recordingPreviewVideo?.duration ||
      0;

    const end =
      safeNumber(
        recordingTrimEnd?.value,
        duration
      );

    const start =
      clamp(
        safeNumber(value),
        0,
        Math.max(0, end - 0.1)
      );

    state.previewTrimStart =
      start;

    if (
      recordingTrimStart
    ) {
      recordingTrimStart.value =
        start;
    }

    if (
      recordingTrimStartTime
    ) {
      recordingTrimStartTime.textContent =
        formatTime(start);
    }

    if (
      recordingPreviewVideo
    ) {
      recordingPreviewVideo.currentTime =
        start;
    }
  }

  function updateTrimEnd(value) {
    const duration =
      recordingPreviewVideo?.duration ||
      0;

    const start =
      safeNumber(
        recordingTrimStart?.value,
        0
      );

    const end =
      clamp(
        safeNumber(value),
        Math.min(
          duration,
          start + 0.1
        ),
        duration
      );

    state.previewTrimEnd =
      end;

    if (
      recordingTrimEnd
    ) {
      recordingTrimEnd.value =
        end;
    }

    if (
      recordingTrimEndTime
    ) {
      recordingTrimEndTime.textContent =
        formatTime(end);
    }
  }

  /*
   * Important:
   * A native MediaRecorder Blob cannot be physically
   * trimmed just by changing the preview sliders.
   *
   * The function below creates a new recording from
   * the selected source video segment. This is a
   * browser-side re-record operation.
   */
  async function applyTrim() {
    if (
      !recordingPreviewVideo ||
      !state.previewOriginalBlob
    ) {
      return;
    }

    const start =
      state.previewTrimStart;

    const end =
      state.previewTrimEnd ||
      recordingPreviewVideo.duration;

    if (
      end <= start
    ) {
      toast(
        "Trim end must be after trim start",
        "warning"
      );
      return;
    }

    toast(
      "Preparing trimmed recording…",
      "info"
    );

    try {
      const trimmed =
        await reRecordPreviewSegment(
          state.previewOriginalBlob,
          start,
          end
        );

      if (!trimmed) {
        toast(
          "Trim is not supported for this recording",
          "warning"
        );
        return;
      }

      state.previewTrimmedBlob =
        trimmed;

      if (
        state.previewTrimmedURL
      ) {
        URL.revokeObjectURL(
          state.previewTrimmedURL
        );
      }

      state.previewTrimmedURL =
        URL.createObjectURL(
          trimmed
        );

      recordingPreviewVideo.src =
        state.previewTrimmedURL;

      recordingPreviewVideo.load();

      toast(
        "Trimmed preview created",
        "success"
      );
    } catch (error) {
      console.error(
        "Trim failed:",
        error
      );

      toast(
        "Trim could not be completed",
        "error"
      );
    }
  }

  async function reRecordPreviewSegment(
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

    const url =
      URL.createObjectURL(blob);

    const video =
      document.createElement(
        "video"
      );

    video.src = url;
    video.muted = true;
    video.playsInline = true;

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
      state.recordingWidth;

    canvas.height =
      state.recordingHeight;

    const ctx =
      canvas.getContext(
        "2d"
      );

    const fps =
      state.recordingFps ||
      30;

    const stream =
      canvas.captureStream(
        fps
      );

    const mime =
      detectRecordingMimeType();

    if (!mime) {
      URL.revokeObjectURL(url);
      return null;
    }

    const recorder =
      new MediaRecorder(
        stream,
        {
          mimeType: mime,
          videoBitsPerSecond:
            calculateVideoBitrate()
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

    const done =
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

    recorder.start();

    let running = true;

    const render = () => {
      if (!running) return;

      if (
        video.currentTime >=
        end
      ) {
        running = false;

        try {
          recorder.stop();
        } catch (_) {}

        return;
      }

      ctx.fillStyle =
        "#000";

      ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      drawContainImage(
        ctx,
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      requestAnimationFrame(
        render
      );
    };

    await video.play();

    render();

    await done;

    video.pause();

    URL.revokeObjectURL(url);

    return new Blob(
      chunks,
      {
        type: mime
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
          { once: true }
        );
      }
    );
  }

  function resetTrim() {
    const duration =
      recordingPreviewVideo?.duration ||
      0;

    state.previewTrimStart =
      0;

    state.previewTrimEnd =
      duration;

    if (
      recordingTrimStart
    ) {
      recordingTrimStart.value =
        0;
    }

    if (
      recordingTrimEnd
    ) {
      recordingTrimEnd.value =
        duration;
    }

    if (
      recordingTrimStartTime
    ) {
      recordingTrimStartTime.textContent =
        "00:00";
    }

    if (
      recordingTrimEndTime
    ) {
      recordingTrimEndTime.textContent =
        formatTime(duration);
    }

    if (
      state.previewOriginalURL &&
      recordingPreviewVideo
    ) {
      recordingPreviewVideo.src =
        state.previewOriginalURL;

      recordingPreviewVideo.load();
    }

    state.previewTrimmedBlob =
      null;

    if (
      state.previewTrimmedURL
    ) {
      URL.revokeObjectURL(
        state.previewTrimmedURL
      );

      state.previewTrimmedURL =
        null;
    }

    toast(
      "Trim reset",
      "info"
    );
  }

  /* =========================================================
     RENAME
     ========================================================= */

  async function renameCurrentRecording() {
    const item =
      getCurrentHistoryItem();

    if (!item) {
      return;
    }

    const newName =
      recordingFileName?.value
        .trim();

    if (!newName) {
      toast(
        "Enter a recording name",
        "warning"
      );
      return;
    }

    item.name =
      newName.replace(
        /\.(webm|mp4)$/i,
        ""
      );

    await updateHistoryItem(
      item
    );

    saveHistoryMetadata();

    renderRecordingHistory();

    toast(
      "Recording renamed",
      "success"
    );
  }

  /* =========================================================
     DOWNLOAD
     ========================================================= */

  function downloadBlob(
    blob,
    fileName
  ) {
    if (!blob) return;

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download =
      fileName;

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

  async function downloadCurrentRecording() {
    const item =
      getCurrentHistoryItem();

    const blob =
      state.previewTrimmedBlob ||
      state.recordingBlob;

    if (!blob) {
      toast(
        "No recording available",
        "warning"
      );
      return;
    }

    downloadBlob(
      blob,
      getDownloadFileName({
        ...item,
        mimeType:
          blob.type ||
          item?.mimeType
      })
    );
  }

  /* =========================================================
     INDEXEDDB
     ========================================================= */

  const DB_NAME =
    "PersonalCourseStudioDB";

  const DB_VERSION = 1;

  const DB_STORE =
    "recordings";

  function openDatabase() {
    return new Promise(
      (resolve) => {
        if (
          !window.indexedDB
        ) {
          resolve(null);
          return;
        }

        const request =
          indexedDB.open(
            DB_NAME,
            DB_VERSION
          );

        request.onupgradeneeded =
          (event) => {
            const db =
              event.target.result;

            if (
              !db.objectStoreNames.contains(
                DB_STORE
              )
            ) {
              db.createObjectStore(
                DB_STORE,
                {
                  keyPath: "id"
                }
              );
            }
          };

        request.onsuccess = () => {
          state.db =
            request.result;

          state.dbReady =
            true;

          resolve(
            state.db
          );
        };

        request.onerror = () => {
          console.warn(
            "IndexedDB unavailable"
          );

          resolve(null);
        };
      }
    );
  }

  async function saveRecordingToDB(
    item,
    blob
  ) {
    if (!state.dbReady) {
      return;
    }

    try {
      await idbPut({
        ...item,
        blob
      });
    } catch (error) {
      console.warn(
        "Recording DB save failed:",
        error
      );
    }
  }

  function idbPut(value) {
    return new Promise(
      (resolve, reject) => {
        if (!state.db) {
          reject(
            new Error(
              "Database unavailable"
            )
          );
          return;
        }

        const transaction =
          state.db.transaction(
            DB_STORE,
            "readwrite"
          );

        const store =
          transaction.objectStore(
            DB_STORE
          );

        const request =
          store.put(value);

        request.onsuccess =
          () => resolve();

        request.onerror =
          () =>
            reject(
              request.error
            );
      }
    );
  }

  function idbGetAll() {
    return new Promise(
      (resolve, reject) => {
        if (!state.db) {
          resolve([]);
          return;
        }

        const transaction =
          state.db.transaction(
            DB_STORE,
            "readonly"
          );

        const store =
          transaction.objectStore(
            DB_STORE
          );

        const request =
          store.getAll();

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
  }

  function idbGet(id) {
    return new Promise(
      (resolve, reject) => {
        if (!state.db) {
          resolve(null);
          return;
        }

        const transaction =
          state.db.transaction(
            DB_STORE,
            "readonly"
          );

        const request =
          transaction
            .objectStore(DB_STORE)
            .get(id);

        request.onsuccess =
          () =>
            resolve(
              request.result ||
                null
            );

        request.onerror =
          () =>
            reject(
              request.error
            );
      }
    );
  }

  function idbDelete(id) {
    return new Promise(
      (resolve, reject) => {
        if (!state.db) {
          resolve();
          return;
        }

        const transaction =
          state.db.transaction(
            DB_STORE,
            "readwrite"
          );

        const request =
          transaction
            .objectStore(DB_STORE)
            .delete(id);

        request.onsuccess =
          () => resolve();

        request.onerror =
          () =>
            reject(
              request.error
            );
      }
    );
  }

  /* =========================================================
     HISTORY METADATA
     ========================================================= */

  function saveHistoryMetadata() {
    try {
      localStorage.setItem(
        "personalCourseStudioRecordingHistory",
        JSON.stringify(
          state.history
        )
      );
    } catch (error) {
      console.warn(
        "History metadata save failed:",
        error
      );
    }
  }

  function loadHistoryMetadata() {
    try {
      const data =
        JSON.parse(
          localStorage.getItem(
            "personalCourseStudioRecordingHistory"
          ) || "[]"
        );

      if (
        Array.isArray(data)
      ) {
        state.history =
          data;
      }
    } catch (error) {
      state.history = [];
    }
  }

  async function restoreHistoryFromDB() {
    if (!state.dbReady) {
      return;
    }

    try {
      const records =
        await idbGetAll();

      if (!records.length) {
        renderRecordingHistory();
        return;
      }

      const metadata =
        records.map(
          ({
            blob,
            ...item
          }) => item
        );

      const byId =
        new Map(
          state.history.map(
            (item) => [
              item.id,
              item
            ]
          )
        );

      metadata.forEach(
        (item) => {
          byId.set(
            item.id,
            item
          );
        }
      );

      state.history =
        Array.from(
          byId.values()
        ).sort(
          (a, b) =>
            new Date(
              b.createdAt
            ) -
            new Date(
              a.createdAt
            )
        );

      saveHistoryMetadata();

      renderRecordingHistory();
    } catch (error) {
      console.warn(
        "History restore failed:",
        error
      );
    }
  }

  async function updateHistoryItem(
    item
  ) {
    if (!state.dbReady) {
      return;
    }

    try {
      const existing =
        await idbGet(item.id);

      if (existing) {
        await idbPut({
          ...existing,
          ...item
        });
      }
    } catch (error) {
      console.warn(
        "History update failed:",
        error
      );
    }
  }

  /* =========================================================
     RECORDING HISTORY UI
     ========================================================= */

  function renderRecordingHistory() {
    if (
      !recordingHistoryList
    ) {
      return;
    }

    if (!state.history.length) {
      recordingHistoryList.innerHTML = `
        <div class="empty-history">
          No recordings yet.
        </div>
      `;

      return;
    }

    recordingHistoryList.innerHTML =
      state.history
        .map(
          (item) => `
          <div
            class="recording-history-item"
            data-recording-id="${escapeHTML(
              item.id
            )}"
          >
            <div class="recording-history-main">
              <strong>
                ${escapeHTML(
                  item.name
                )}
              </strong>

              <span>
                ${formatTime(
                  item.duration || 0
                )}
                ·
                ${formatBytes(
                  item.size || 0
                )}
                ·
                ${item.width || 1920}×${
            item.height || 1080
          }
              </span>
            </div>

            <div class="recording-history-actions">
              <button
                type="button"
                data-history-action="preview"
                data-id="${escapeHTML(
                  item.id
                )}"
              >
                Preview
              </button>

              <button
                type="button"
                data-history-action="download"
                data-id="${escapeHTML(
                  item.id
                )}"
              >
                Download
              </button>

              <button
                type="button"
                data-history-action="rename"
                data-id="${escapeHTML(
                  item.id
                )}"
              >
                Rename
              </button>

              <button
                type="button"
                data-history-action="delete"
                data-id="${escapeHTML(
                  item.id
                )}"
              >
                Delete
              </button>
            </div>
          </div>
        `
        )
        .join("");
  }

  async function previewHistoryItem(
    id
  ) {
    try {
      const record =
        await idbGet(id);

      if (
        !record ||
        !record.blob
      ) {
        toast(
          "Recording file is unavailable",
          "error"
        );
        return;
      }

      state.currentRecordingId =
        id;

      state.recordingBlob =
        record.blob;

      if (
        state.recordingURL
      ) {
        URL.revokeObjectURL(
          state.recordingURL
        );
      }

      state.recordingURL =
        URL.createObjectURL(
          record.blob
        );

      state.previewOriginalBlob =
        record.blob;

      state.previewOriginalURL =
        state.recordingURL;

      openRecordingPreview(
        record
      );
    } catch (error) {
      console.error(
        error
      );

      toast(
        "Unable to open recording",
        "error"
      );
    }
  }

  async function downloadHistoryItem(
    id
  ) {
    const record =
      await idbGet(id);

    if (
      !record ||
      !record.blob
    ) {
      toast(
        "Recording file is unavailable",
        "error"
      );
      return;
    }

    downloadBlob(
      record.blob,
      getDownloadFileName(
        record
      )
    );
  }

  async function deleteHistoryItem(
    id
  ) {
    const record =
      state.history.find(
        (item) =>
          item.id === id
      );

    if (!record) return;

    const confirmed =
      window.confirm(
        `Delete "${record.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await idbDelete(id);
    } catch (_) {}

    state.history =
      state.history.filter(
        (item) =>
          item.id !== id
      );

    saveHistoryMetadata();

    if (
      state.currentRecordingId ===
      id
    ) {
      state.currentRecordingId =
        null;

      state.recordingBlob =
        null;
    }

    renderRecordingHistory();

    toast(
      "Recording deleted",
      "success"
    );
  }

  async function clearRecordingHistory() {
    const confirmed =
      window.confirm(
        "Delete all recording history?"
      );

    if (!confirmed) {
      return;
    }

    if (state.db) {
      try {
        const records =
          await idbGetAll();

        for (
          const record of records
        ) {
          await idbDelete(
            record.id
          );
        }
      } catch (_) {}
    }

    state.history = [];

    saveHistoryMetadata();

    renderRecordingHistory();

    toast(
      "Recording history cleared",
      "success"
    );
  }

  /* =========================================================
     TELEPROMPTER
     ========================================================= */

  function updateTeleprompterPreview() {
    if (
      !teleprompterPreview
    ) {
      return;
    }

    teleprompterPreview.textContent =
      state.teleprompterText ||
      "Your teleprompter text will appear here.";

    teleprompterPreview.style.fontSize =
      `${state.teleprompterFontSize}px`;

    teleprompterPreview.style.opacity =
      state.teleprompterOpacity;

    if (
      teleprompterMiniPreview
    ) {
      teleprompterMiniPreview.textContent =
        state.teleprompterText ||
        "No teleprompter text";
    }
  }

  function syncTeleprompterSettings() {
    state.teleprompterText =
      teleprompterText?.value ||
      "";

    state.teleprompterSpeed =
      safeNumber(
        teleprompterSpeed?.value,
        30
      );

    state.teleprompterFontSize =
      safeNumber(
        teleprompterFontSize?.value,
        34
      );

    state.teleprompterOpacity =
      clamp(
        safeNumber(
          teleprompterOpacity?.value,
          0.9
        ),
        0,
        1
      );

    updateTeleprompterPreview();
  }

  function startTeleprompter() {
    if (
      !state.teleprompterText
    ) {
      syncTeleprompterSettings();

      if (
        !state.teleprompterText
      ) {
        toast(
          "Add teleprompter text first",
          "warning"
        );
        return;
      }
    }

    state.teleprompterPlaying =
      true;

    stopTeleprompterRAF();

    const step = () => {
      if (
        !state.teleprompterPlaying
      ) {
        return;
      }

      state.teleprompterScroll +=
        state.teleprompterSpeed /
        60;

      const preview =
        teleprompterPreview;

      if (preview) {
        preview.scrollTop =
          state.teleprompterScroll;
      }

      state.teleprompterRAF =
        requestAnimationFrame(
          step
        );
    };

    step();

    if (
      teleprompterPlayBtn
    ) {
      teleprompterPlayBtn.disabled =
        true;
    }

    if (
      teleprompterPauseBtn
    ) {
      teleprompterPauseBtn.disabled =
        false;
    }
  }

  function pauseTeleprompter() {
    state.teleprompterPlaying =
      false;

    stopTeleprompterRAF();

    if (
      teleprompterPlayBtn
    ) {
      teleprompterPlayBtn.disabled =
        false;
    }

    if (
      teleprompterPauseBtn
    ) {
      teleprompterPauseBtn.disabled =
        true;
    }
  }

  function stopTeleprompterRAF() {
    if (
      state.teleprompterRAF
    ) {
      cancelAnimationFrame(
        state.teleprompterRAF
      );

      state.teleprompterRAF =
        null;
    }
  }

  function resetTeleprompter() {
    pauseTeleprompter();

    state.teleprompterScroll =
      0;

    if (
      teleprompterText
    ) {
      teleprompterText.value =
        "";
    }

    if (
      teleprompterSpeed
    ) {
      teleprompterSpeed.value =
        30;
    }

    if (
      teleprompterFontSize
    ) {
      teleprompterFontSize.value =
        34;
    }

    if (
      teleprompterOpacity
    ) {
      teleprompterOpacity.value =
        0.9;
    }

    syncTeleprompterSettings();

    if (
      teleprompterPreview
    ) {
      teleprompterPreview.scrollTop =
        0;
    }
  }

  function saveTeleprompter() {
    syncTeleprompterSettings();

    try {
      localStorage.setItem(
        "personalCourseStudioTeleprompter",
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

      toast(
        "Teleprompter saved",
        "success"
      );
    } catch (error) {
      toast(
        "Unable to save teleprompter",
        "error"
      );
    }
  }

  function loadTeleprompter() {
    try {
      const saved =
        JSON.parse(
          localStorage.getItem(
            "personalCourseStudioTeleprompter"
          ) || "null"
        );

      if (
        saved &&
        typeof saved ===
          "object"
      ) {
        state.teleprompterText =
          saved.text || "";

        state.teleprompterSpeed =
          safeNumber(
            saved.speed,
            30
          );

        state.teleprompterFontSize =
          safeNumber(
            saved.fontSize,
            34
          );

        state.teleprompterOpacity =
          safeNumber(
            saved.opacity,
            0.9
          );
      }
    } catch (_) {}

    if (teleprompterText) {
      teleprompterText.value =
        state.teleprompterText;
    }

    if (teleprompterSpeed) {
      teleprompterSpeed.value =
        state.teleprompterSpeed;
    }

    if (teleprompterFontSize) {
      teleprompterFontSize.value =
        state.teleprompterFontSize;
    }

    if (teleprompterOpacity) {
      teleprompterOpacity.value =
        state.teleprompterOpacity;
    }

    updateTeleprompterPreview();
  }

  function loadTeleprompterFile(
    file
  ) {
    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = () => {
      const text =
        String(
          reader.result || ""
        );

      state.teleprompterText =
        text;

      if (
        teleprompterText
      ) {
        teleprompterText.value =
          text;
      }

      updateTeleprompterPreview();

      toast(
        "Teleprompter text loaded",
        "success"
      );
    };

    reader.onerror = () => {
      toast(
        "Unable to read text file",
        "error"
      );
    };

    reader.readAsText(file);
  }

  /* =========================================================
     STUDENTS
     ========================================================= */

  function loadStudents() {
    try {
      const saved =
        JSON.parse(
          localStorage.getItem(
            "personalCourseStudioStudents"
          ) || "[]"
        );

      if (
        Array.isArray(saved)
      ) {
        state.students =
          saved;
      }
    } catch (_) {
      state.students = [];
    }

    renderStudents();
  }

  function saveStudents() {
    try {
      localStorage.setItem(
        "personalCourseStudioStudents",
        JSON.stringify(
          state.students
        )
      );
    } catch (_) {}
  }

  function renderStudents() {
    if (!studentsList) {
      return;
    }

    if (!state.students.length) {
      studentsList.innerHTML = `
        <div class="empty-students">
          No students added.
        </div>
      `;

      return;
    }

    studentsList.innerHTML =
      state.students
        .map(
          (student) => `
          <div
            class="student-item"
            data-student-id="${escapeHTML(
              student.id
            )}"
          >
            <span class="student-online-dot"></span>

            <span class="student-name">
              ${escapeHTML(
                student.name
              )}
            </span>

            <button
              type="button"
              data-remove-student="${escapeHTML(
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
  }

  function addStudent(name) {
    const clean =
      name.trim();

    if (!clean) {
      toast(
        "Enter student name",
        "warning"
      );
      return;
    }

    state.students.push({
      id: nowId(),
      name: clean
    });

    saveStudents();
    renderStudents();

    toast(
      "Student added",
      "success"
    );
  }

  /* =========================================================
     FULLSCREEN
     ========================================================= */

  async function fullscreenStage() {
    if (!stageShell) return;

    try {
      if (
        document.fullscreenElement
      ) {
        await document.exitFullscreen();
        return;
      }

      await stageShell.requestFullscreen();
    } catch (error) {
      console.warn(
        "Stage fullscreen failed:",
        error
      );

      toast(
        "Fullscreen is unavailable",
        "warning"
      );
    }
  }

  async function fullscreenStudio() {
    const element =
      document.documentElement;

    try {
      if (
        document.fullscreenElement
      ) {
        await document.exitFullscreen();
        return;
      }

      await element.requestFullscreen();
    } catch (error) {
      console.warn(
        "Studio fullscreen failed:",
        error
      );

      toast(
        "Fullscreen is unavailable",
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

    const key =
      event.key.toLowerCase();

    if (key === "escape") {
      closeModal(
        settingsModal
      );

      closeModal(
        shortcutsModal
      );

      closeModal(
        teleprompterModal
      );

      closeModal(
        recordingPreviewModal
      );

      closeModal(
        studentModal
      );

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

        return;
      }

      if (
        state.mainType === "video"
      ) {
        if (
          mainVideo?.paused
        ) {
          playMain();
        } else {
          pauseMain();
        }
      }

      return;
    }

    if (
      key === "r" &&
      !event.ctrlKey &&
      !event.metaKey
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
        state.recordingPaused
      ) {
        resumeRecording();
      } else {
        pauseRecording();
      }

      return;
    }

    if (
      key === "s"
    ) {
      event.preventDefault();

      stopRecording();
      return;
    }

    if (
      key === "f"
    ) {
      event.preventDefault();

      fullscreenStage();
    }
  }

  /* =========================================================
     EVENT BINDINGS
     ========================================================= */

  function bindEvents() {
    uploadMainBtn?.addEventListener(
      "click",
      () =>
        mainFileInput?.click()
    );

    uploadMainSideBtn?.addEventListener(
      "click",
      () =>
        mainFileInput?.click()
    );

    uploadVideoBtn?.addEventListener(
      "click",
      () =>
        mainVideoInput?.click()
    );

    uploadVideoSideBtn?.addEventListener(
      "click",
      () =>
        mainVideoInput?.click()
    );

    mainFileInput?.addEventListener(
      "change",
      (event) => {
        loadMainFile(
          event.target.files?.[0]
        );

        event.target.value = "";
      }
    );

    mainVideoInput?.addEventListener(
      "change",
      (event) => {
        loadMainFile(
          event.target.files?.[0]
        );

        event.target.value = "";
      }
    );

    mainPlayBtn?.addEventListener(
      "click",
      playMain
    );

    mainPauseBtn?.addEventListener(
      "click",
      pauseMain
    );

    uploadMentorBtn?.addEventListener(
      "click",
      () =>
        mentorFileInput?.click()
    );

    uploadMentorSideBtn?.addEventListener(
      "click",
      () =>
        mentorFileInput?.click()
    );

    mentorFileInput?.addEventListener(
      "change",
      (event) => {
        loadMentorFile(
          event.target.files?.[0]
        );

        event.target.value = "";
      }
    );

    startCameraBtn?.addEventListener(
      "click",
      startCamera
    );

    startCameraSideBtn?.addEventListener(
      "click",
      startCamera
    );

    stopCameraBtn?.addEventListener(
      "click",
      () =>
        stopCamera(true)
    );

    stopCameraSideBtn?.addEventListener(
      "click",
      () =>
        stopCamera(true)
    );

    switchCameraSideBtn?.addEventListener(
      "click",
      switchCamera
    );

    cameraDeviceSelect?.addEventListener(
      "change",
      async () => {
        state.cameraDeviceId =
          cameraDeviceSelect.value;

        if (
          state.cameraStream
        ) {
          await startCamera();
        }
      }
    );

    cameraQuality?.addEventListener(
      "change",
      async () => {
        if (
          state.cameraStream
        ) {
          await startCamera();
        }
      }
    );

    cameraFps?.addEventListener(
      "change",
      async () => {
        if (
          state.cameraStream
        ) {
          await startCamera();
        }
      }
    );

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

    backgroundColor?.addEventListener(
      "input",
      () => {
        state.backgroundColor =
          backgroundColor.value;

        renderCompositionFrame();
      }
    );

    backgroundImageUpload?.addEventListener(
      "change",
      (event) => {
        loadBackgroundImage(
          event.target.files?.[0]
        );

        event.target.value = "";
      }
    );

    startScreenCaptureBtn?.addEventListener(
      "click",
      startScreenCapture
    );

    startScreenCaptureSideBtn?.addEventListener(
      "click",
      startScreenCapture
    );

    stopScreenCaptureBtn?.addEventListener(
      "click",
      () =>
        stopScreenCapture(true)
    );

    mainVideoAudioCheckbox?.addEventListener(
      "change",
      async () => {
        if (
          mainVideoAudioCheckbox.checked
        ) {
          await setupMainAudio();
        }

        updateMainVolume();
      }
    );

    mainVideoVolume?.addEventListener(
      "input",
      updateMainVolume
    );

    micVolume?.addEventListener(
      "input",
      updateMicVolume
    );

    micEnabled?.addEventListener(
      "change",
      async () => {
        if (
          micEnabled.checked
        ) {
          await setupMicrophone();
        }

        updateMicVolume();
      }
    );

    micMonitor?.addEventListener(
      "change",
      async () => {
        if (
          micMonitor.checked
        ) {
          await setupMicrophone();
        }

        updateMicMonitor();
      }
    );

    recordingQuality?.addEventListener(
      "change",
      () => {
        if (
          recordingQualitySide
        ) {
          recordingQualitySide.value =
            recordingQuality.value;
        }

        updateRecordingDimensions();
      }
    );

    recordingQualitySide?.addEventListener(
      "change",
      () => {
        if (
          recordingQuality
        ) {
          recordingQuality.value =
            recordingQualitySide.value;
        }

        updateRecordingDimensions();
      }
    );

    recordingFps?.addEventListener(
      "change",
      () => {
        if (
          recordingFpsSide
        ) {
          recordingFpsSide.value =
            recordingFps.value;
        }

        updateRecordingDimensions();
      }
    );

    recordingFpsSide?.addEventListener(
      "change",
      () => {
        if (
          recordingFps
        ) {
          recordingFps.value =
            recordingFpsSide.value;
        }

        updateRecordingDimensions();
      }
    );

    recordingFormat?.addEventListener(
      "change",
      () => {
        if (
          recordingFormatSide
        ) {
          recordingFormatSide.value =
            recordingFormat.value;
        }
      }
    );

    recordingFormatSide?.addEventListener(
      "change",
      () => {
        if (
          recordingFormat
        ) {
          recordingFormat.value =
            recordingFormatSide.value;
        }
      }
    );

    recordBtn?.addEventListener(
      "click",
      () => {
        if (
          !state.recordingActive
        ) {
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

    recordToolbarBtn?.addEventListener(
      "click",
      () => {
        if (
          !state.recordingActive
        ) {
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

    pauseRecordingBtn?.addEventListener(
      "click",
      pauseRecording
    );

    resumeRecordingBtn?.addEventListener(
      "click",
      resumeRecording
    );

    stopRecordingBtn?.addEventListener(
      "click",
      stopRecording
    );

    openTeleprompterBtn?.addEventListener(
      "click",
      () =>
        openModal(
          teleprompterModal
        )
    );

    openTeleprompterTopBtn?.addEventListener(
      "click",
      () =>
        openModal(
          teleprompterModal
        )
    );

    openTeleprompterSide?.addEventListener(
      "click",
      () =>
        openModal(
          teleprompterModal
        )
    );

    uploadTeleprompterBtn?.addEventListener(
      "click",
      () =>
        teleprompterFileInput?.click()
    );

    teleprompterFileInput?.addEventListener(
      "change",
      (event) => {
        loadTeleprompterFile(
          event.target.files?.[0]
        );

        event.target.value = "";
      }
    );

    teleprompterText?.addEventListener(
      "input",
      syncTeleprompterSettings
    );

    teleprompterSpeed?.addEventListener(
      "input",
      syncTeleprompterSettings
    );

    teleprompterFontSize?.addEventListener(
      "input",
      syncTeleprompterSettings
    );

    teleprompterOpacity?.addEventListener(
      "input",
      syncTeleprompterSettings
    );

    teleprompterPlayBtn?.addEventListener(
      "click",
      startTeleprompter
    );

    teleprompterPauseBtn?.addEventListener(
      "click",
      pauseTeleprompter
    );

    teleprompterResetBtn?.addEventListener(
      "click",
      resetTeleprompter
    );

    teleprompterSaveBtn?.addEventListener(
      "click",
      saveTeleprompter
    );

    closeTeleprompterBtn?.addEventListener(
      "click",
      () =>
        closeModal(
          teleprompterModal
        )
    );

    settingsBtn?.addEventListener(
      "click",
      () =>
        openModal(
          settingsModal
        )
    );

    closeSettingsBtn?.addEventListener(
      "click",
      () =>
        closeModal(
          settingsModal
        )
    );

    closeSettingsFooterBtn?.addEventListener(
      "click",
      () =>
        closeModal(
          settingsModal
        )
    );

    saveSettingsBtn?.addEventListener(
      "click",
      saveSettings
    );

    openShortcutsBtn?.addEventListener(
      "click",
      () =>
        openModal(
          shortcutsModal
        )
    );

    closeShortcutsBtn?.addEventListener(
      "click",
      () =>
        closeModal(
          shortcutsModal
        )
    );

    fullscreenStageBtn?.addEventListener(
      "click",
      fullscreenStage
    );

    fullscreenStudioBtn?.addEventListener(
      "click",
      fullscreenStudio
    );

    closeRecordingPreviewBtn?.addEventListener(
      "click",
      () =>
        closeModal(
          recordingPreviewModal
        )
    );

    recordingPreviewPlayBtn?.addEventListener(
      "click",
      previewPlay
    );

    recordingPreviewPauseBtn?.addEventListener(
      "click",
      previewPause
    );

    recordingPreviewVideo?.addEventListener(
      "timeupdate",
      updatePreviewCurrentTime
    );

    recordingTrimStart?.addEventListener(
      "input",
      (event) =>
        updateTrimStart(
          event.target.value
        )
    );

    recordingTrimEnd?.addEventListener(
      "input",
      (event) =>
        updateTrimEnd(
          event.target.value
        )
    );

    applyTrimBtn?.addEventListener(
      "click",
      applyTrim
    );

    resetTrimBtn?.addEventListener(
      "click",
      resetTrim
    );

    renameRecordingBtn?.addEventListener(
      "click",
      renameCurrentRecording
    );

    deleteRecordingBtn?.addEventListener(
      "click",
      async () => {
        if (
          state.currentRecordingId
        ) {
          await deleteHistoryItem(
            state.currentRecordingId
          );

          closeModal(
            recordingPreviewModal
          );
        }
      }
    );

    recordAgainBtn?.addEventListener(
      "click",
      () => {
        closeModal(
          recordingPreviewModal
        );

        startRecording();
      }
    );

    downloadRecordingBtn?.addEventListener(
      "click",
      downloadCurrentRecording
    );

    clearRecordingHistoryBtn?.addEventListener(
      "click",
      clearRecordingHistory
    );

    recordingHistoryList?.addEventListener(
      "click",
      async (event) => {
        const button =
          event.target.closest(
            "[data-history-action]"
          );

        if (!button) return;

        const action =
          button.dataset
            .historyAction;

        const id =
          button.dataset.id;

        if (
          action ===
          "preview"
        ) {
          await previewHistoryItem(
            id
          );
        }

        if (
          action ===
          "download"
        ) {
          await downloadHistoryItem(
            id
          );
        }

        if (
          action ===
          "rename"
        ) {
          await previewHistoryItem(
            id
          );
        }

        if (
          action ===
          "delete"
        ) {
          await deleteHistoryItem(
            id
          );
        }
      }
    );

    addStudentBtn?.addEventListener(
      "click",
      () => {
        if (
          studentNameInput
        ) {
          studentNameInput.value =
            "";
        }

        openModal(
          studentModal
        );
      }
    );

    closeStudentModalBtn?.addEventListener(
      "click",
      () =>
        closeModal(
          studentModal
        )
    );

    cancelStudentBtn?.addEventListener(
      "click",
      () =>
        closeModal(
          studentModal
        )
    );

    saveStudentBtn?.addEventListener(
      "click",
      () => {
        addStudent(
          studentNameInput?.value ||
            ""
        );

        closeModal(
          studentModal
        );
      }
    );

    studentsList?.addEventListener(
      "click",
      (event) => {
        const button =
          event.target.closest(
            "[data-remove-student]"
          );

        if (!button) return;

        const id =
          button.dataset
            .removeStudent;

        state.students =
          state.students.filter(
            (student) =>
              student.id !== id
          );

        saveStudents();
        renderStudents();
      }
    );

    mentorCard?.addEventListener(
      "pointerdown",
      beginMentorDrag
    );

    mentorCard?.addEventListener(
      "pointermove",
      moveMentorDrag
    );

    mentorCard?.addEventListener(
      "pointerup",
      endMentorDrag
    );

    mentorCard?.addEventListener(
      "pointercancel",
      endMentorDrag
    );

    mentorResize?.addEventListener(
      "pointerdown",
      beginMentorResize
    );

    mentorResize?.addEventListener(
      "pointermove",
      moveMentorResize
    );

    mentorResize?.addEventListener(
      "pointerup",
      endMentorResize
    );

    mentorResize?.addEventListener(
      "pointercancel",
      endMentorResize
    );

    document.addEventListener(
      "keydown",
      handleKeyboardShortcut
    );

    bindModalClose(
      settingsModal
    );

    bindModalClose(
      shortcutsModal
    );

    bindModalClose(
      teleprompterModal
    );

    bindModalClose(
      recordingPreviewModal
    );

    bindModalClose(
      studentModal
    );

    mainVideo?.addEventListener(
      "timeupdate",
      renderCompositionFrame
    );

    mainVideo?.addEventListener(
      "play",
      () => {
        if (mainPlayBtn) {
          mainPlayBtn.disabled =
            true;
        }

        if (mainPauseBtn) {
          mainPauseBtn.disabled =
            false;
        }
      }
    );

    mainVideo?.addEventListener(
      "pause",
      () => {
        if (mainPlayBtn) {
          mainPlayBtn.disabled =
            false;
        }

        if (mainPauseBtn) {
          mainPauseBtn.disabled =
            true;
        }
      }
    );

    mentorVideo?.addEventListener(
      "play",
      renderCompositionFrame
    );

    mentorVideo?.addEventListener(
      "timeupdate",
      renderCompositionFrame
    );

    mentorCameraVideo?.addEventListener(
      "loadedmetadata",
      renderCompositionFrame
    );

    window.addEventListener(
      "resize",
      () => {
        applyMentorRect();
        renderCompositionFrame();
      }
    );

    document.addEventListener(
      "fullscreenchange",
      () => {
        setTimeout(() => {
          applyMentorRect();
          renderCompositionFrame();
        }, 100);
      }
    );
  }

  /* =========================================================
     OPTIONAL SIDEBAR BUTTON REFERENCES
     ========================================================= */

  const uploadMainSideBtn =
    byId("uploadMainSideBtn");

  const uploadVideoSideBtn =
    byId("uploadVideoSideBtn");

  const uploadMentorFileSideBtn =
    byId("uploadMentorFileSideBtn");

  const uploadBackgroundSideBtn =
    byId("uploadBackgroundSideBtn");

  /* =========================================================
     MEDIA PERMISSION PREPARATION
     ========================================================= */

  async function prepareStudio() {
    if (
      navigator.mediaDevices
        ?.getUserMedia
    ) {
      try {
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
            video: true
          }
        ).then((stream) => {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop()
            );
        });

        await enumerateCameras();
      } catch (_) {
        /*
         * Permission is requested only when user
         * explicitly starts camera/mic.
         */
      }
    }
  }

  /* =========================================================
     SAFE STARTUP
     ========================================================= */

  async function initialize() {
    loadSettings();

    loadHistoryMetadata();

    loadTeleprompter();

    loadStudents();

    updateRecordingDimensions();

    state.backgroundColor =
      backgroundColor?.value ||
      "#101820";

    setBackgroundMode(
      "original"
    );

    applyMentorRect();

    renderRecordingHistory();

    bindEvents();

    startRenderLoop();

    await openDatabase();

    await restoreHistoryFromDB();

    await prepareStudio();

    updateMainVolume();

    updateMicVolume();

    updateMicMonitor();

    updateRecordingUI();

    syncTeleprompterSettings();

    if (
      settingsRecordingQuality
    ) {
      settingsRecordingQuality.value =
        state.recordingQuality;
    }

    if (
      settingsRecordingFps
    ) {
      settingsRecordingFps.value =
        String(
          state.recordingFps
        );
    }

    toast(
      "Mentor Studio ready",
      "success"
    );
  }

  /* =========================================================
     CLEANUP
     ========================================================= */

  function cleanup() {
    stopRecordingTimer();

    stopTeleprompterRAF();

    stopCamera(false);

    stopScreenCapture(false);

    disconnectMicrophone();

    if (
      state.audioContext
    ) {
      state.audioContext
        .close()
        .catch(() => {});
    }

    if (
      state.mainMediaSource
    ) {
      try {
        state.mainMediaSource.disconnect();
      } catch (_) {}
    }

    if (
      state.mainGain
    ) {
      try {
        state.mainGain.disconnect();
      } catch (_) {}
    }

    if (
      state.recordingURL
    ) {
      URL.revokeObjectURL(
        state.recordingURL
      );
    }

    if (
      state.backgroundObjectURL
    ) {
      URL.revokeObjectURL(
        state.backgroundObjectURL
      );
    }

    if (
      state.mainObjectURL
    ) {
      URL.revokeObjectURL(
        state.mainObjectURL
      );
    }

    if (
      state.mentorObjectURL
    ) {
      URL.revokeObjectURL(
        state.mentorObjectURL
      );
    }

    if (
      state.previewTrimmedURL
    ) {
      URL.revokeObjectURL(
        state.previewTrimmedURL
      );
    }
  }

  window.addEventListener(
    "beforeunload",
    cleanup
  );

  /* =========================================================
     GLOBAL COURSE STUDIO API
     ========================================================= */

  window.CourseStudio = {
    state,

    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,

    startCamera,
    stopCamera,
    switchCamera,

    startScreenCapture,
    stopScreenCapture,

    playMain,
    pauseMain,

    fullscreenStage,
    fullscreenStudio,

    openTeleprompter: () =>
      openModal(
        teleprompterModal
      ),

    startTeleprompter,
    pauseTeleprompter,

    setBackgroundMode,

    renderCompositionFrame,

    downloadCurrentRecording,

    getRecordingElapsed,

    toast
  };

  /* =========================================================
     START
     ========================================================= */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      {
        once: true
      }
    );
  } else {
    initialize();
  }
})();
