/* =========================================================
   SNK MENTOR STUDIO
   PERSONAL COURSE STUDIO
   Step 3.9 — Professional Recording & Preview
   File: mentor/script.js

   FEATURES
   ---------------------------------------------------------
   01. Main image upload
   02. Main video upload
   03. Main video controls
   04. Mentor video upload
   05. Real webcam
   06. Camera device selection
   07. Camera quality 360/480/720/1080
   08. Camera FPS 24/30/60
   09. MediaPipe person segmentation
   10. Original background
   11. Remove background
   12. Blur background
   13. Custom background image
   14. Solid background
   15. Mentor drag
   16. Mentor resize
   17. Screen/window/tab capture
   18. Teleprompter
   19. Microphone
   20. Main-video audio
   21. Audio level meters
   22. Microphone waveform
   23. Recording 720/1080/1440
   24. Recording FPS
   25. WebM VP9 / VP8 / MP4 detection
   26. Pause / Resume / Stop
   27. Recording timer
   28. Recording status
   29. Continuous composition rendering
   30. Recording preview
   31. Rename recording
   32. Download recording
   33. Delete recording
   34. Recording history
   35. IndexedDB Blob storage
   36. Keyboard shortcuts
   37. Stage fullscreen
   38. Studio fullscreen
   39. Screen-share stop detection
   40. Student management
   41. Settings
   42. Toast notifications
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     HELPERS
     ======================================================= */

  const $ = (selector, root = document) => root.querySelector(selector);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const safeNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const formatTime = (seconds) => {
    seconds = Math.max(0, Number(seconds) || 0);

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
  };

  const formatBytes = (bytes) => {
    bytes = Number(bytes) || 0;

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const timestampName = () => {
    const now = new Date();

    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const h = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");

    return `mentor-recording-${y}${m}${d}-${h}${min}${s}`;
  };

  const sanitizeFilename = (name) => {
    return String(name || "mentor-recording")
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100) || "mentor-recording";
  };

  /* =======================================================
     DOM
     ======================================================= */

  const mainImage = $("#mainImage");
  const mainVideo = $("#mainVideo");
  const screenCaptureVideo = $("#screenCaptureVideo");

  const mentorCard = $("#mentorCard");
  const mentorVideo = $("#mentorVideo");
  const mentorCameraVideo = $("#mentorCameraVideo");
  const mentorAICanvas = $("#mentorAICanvas");
  const mentorPlaceholder = $("#mentorPlaceholder");
  const mentorSourceLabel = $("#mentorSourceLabel");
  const mentorResize = $("#mentorResize");

  const stage = $("#stage");
  const stageShell = $("#stageShell");

  const recordingOverlay = $("#recordingOverlay");
  const recordingOverlayTimer = $("#recordingOverlayTimer");

  const stageResolutionBadge = $("#stageResolutionBadge");
  const stageFpsBadge = $("#stageFpsBadge");
  const stageSourceBadge = $("#stageSourceBadge");

  /* Buttons */

  const uploadMainBtn = $("#uploadMainBtn");
  const uploadVideoBtn = $("#uploadVideoBtn");
  const mainPlayBtn = $("#mainPlayBtn");
  const mainPauseBtn = $("#mainPauseBtn");

  const uploadMentorBtn = $("#uploadMentorBtn");
  const startCameraBtn = $("#startCameraBtn");
  const stopCameraBtn = $("#stopCameraBtn");

  const recordToolbarBtn = $("#recordToolbarBtn");

  const openTeleprompterBtn = $("#openTeleprompterBtn");
  const openTeleprompterTopBtn = $("#openTeleprompterTopBtn");

  const openShortcutsBtn = $("#openShortcutsBtn");
  const startScreenCaptureBtn = $("#startScreenCaptureBtn");

  const fullscreenStageBtn = $("#fullscreenStageBtn");
  const fullscreenStudioBtn = $("#fullscreenStudioBtn");

  const settingsBtn = $("#settingsBtn");
  const recordBtn = $("#recordBtn");

  /* Recording controls */

  const recordingStatusBar = $("#recordingStatusBar");
  const recordingStatusDot = $("#recordingStatusDot");
  const recordingStatusText = $("#recordingStatusText");
  const recordingTimer = $("#recordingTimer");

  const recordingQuality = $("#recordingQuality");
  const recordingFps = $("#recordingFps");
  const recordingFormat = $("#recordingFormat");

  const pauseRecordingBtn = $("#pauseRecordingBtn");
  const resumeRecordingBtn = $("#resumeRecordingBtn");
  const stopRecordingBtn = $("#stopRecordingBtn");

  const cameraIndicator = $("#cameraIndicator");
  const micIndicator = $("#micIndicator");
  const audioIndicator = $("#audioIndicator");
  const screenIndicator = $("#screenIndicator");

  /* Camera */

  const startCameraSideBtn = $("#startCameraSideBtn");
  const stopCameraSideBtn = $("#stopCameraSideBtn");
  const switchCameraSideBtn = $("#switchCameraSideBtn");
  const uploadMentorSideBtn = $("#uploadMentorSideBtn");
  const cameraStatus = $("#cameraStatus");

  const cameraDeviceSelect = $("#cameraDeviceSelect");
  const cameraQuality = $("#cameraQuality");
  const cameraFps = $("#cameraFps");

  /* AI background */

  const bgOriginalBtn = $("#bgOriginalBtn");
  const bgRemoveBtn = $("#bgRemoveBtn");
  const bgBlurBtn = $("#bgBlurBtn");
  const bgImageBtn = $("#bgImageBtn");
  const bgColorBtn = $("#bgColorBtn");

  const backgroundColor = $("#backgroundColor");
  const backgroundUploadBox = $("#backgroundUploadBox");

  /* Screen */

  const startScreenCaptureSideBtn = $("#startScreenCaptureSideBtn");
  const stopScreenCaptureBtn = $("#stopScreenCaptureBtn");
  const screenCaptureStatus = $("#screenCaptureStatus");
  const screenCaptureStatusLight = $("#screenCaptureStatusLight");

  /* Audio */

  const mainVideoAudioCheckbox = $("#mainVideoAudioCheckbox");
  const mainVideoVolume = $("#mainVideoVolume");
  const mainVolumeValue = $("#mainVolumeValue");

  const micVolume = $("#micVolume");
  const micVolumeValue = $("#micVolumeValue");

  const micEnabled = $("#micEnabled");
  const micMonitor = $("#micMonitor");

  const micLevelValue = $("#micLevelValue");
  const micLevelBar = $("#micLevelBar");

  const mainAudioLevelValue = $("#mainAudioLevelValue");
  const mainAudioLevelBar = $("#mainAudioLevelBar");

  const micWaveformCanvas = $("#micWaveformCanvas");

  /* Teleprompter */

  const teleprompterMiniPreview = $("#teleprompterMiniPreview");
  const openTeleprompterSide = $("#openTeleprompterSide");
  const uploadTeleprompterBtn = $("#uploadTeleprompterBtn");
  const teleprompterFileInput = $("#teleprompterFileInput");

  /* Students */

  const studentsList = $("#studentsList");
  const addStudentBtn = $("#addStudentBtn");

  /* Recording settings */

  const recordingQualitySide = $("#recordingQualitySide");
  const recordingFpsSide = $("#recordingFpsSide");
  const recordingFormatSide = $("#recordingFormatSide");
  const recordingFileNameSide = $("#recordingFileNameSide");
  const includeTeleprompterInRecording =
    $("#includeTeleprompterInRecording");

  /* Files */

  const uploadMainSideBtn = $("#uploadMainSideBtn");
  const uploadVideoSideBtn = $("#uploadVideoSideBtn");
  const uploadMentorFileSideBtn = $("#uploadMentorFileSideBtn");
  const uploadBackgroundSideBtn = $("#uploadBackgroundSideBtn");

  /* Hidden inputs */

  const mainFileInput = $("#mainFileInput");
  const mainVideoInput = $("#mainVideoInput");
  const mentorFileInput = $("#mentorFileInput");
  const backgroundImageUpload = $("#backgroundImageUpload");

  /* AI canvases */

  const aiCanvas = $("#aiCanvas");
  const aiSourceCanvas = $("#aiSourceCanvas");
  const aiMaskCanvas = $("#aiMaskCanvas");

  /* Settings */

  const settingsModal = $("#settingsModal");
  const brandNameInput = $("#brandNameInput");
  const settingsRecordingQuality = $("#settingsRecordingQuality");
  const settingsRecordingFps = $("#settingsRecordingFps");
  const settingsAutoStartTeleprompter =
    $("#settingsAutoStartTeleprompter");
  const settingsShowTeleprompterRecording =
    $("#settingsShowTeleprompterRecording");

  const closeSettingsBtn = $("#closeSettingsBtn");
  const closeSettingsFooterBtn = $("#closeSettingsFooterBtn");
  const saveSettingsBtn = $("#saveSettingsBtn");

  const brandBadgeText = $("#brandBadgeText");

  /* Shortcuts */

  const shortcutsModal = $("#shortcutsModal");
  const closeShortcutsModalBtn = $("#closeShortcutsBtn");

  /* Teleprompter */

  const teleprompterModal = $("#teleprompterModal");
  const closeTeleprompterBtn = $("#closeTeleprompterBtn");

  const teleprompterText = $("#teleprompterText");
  const teleprompterSpeed = $("#teleprompterSpeed");
  const teleprompterFontSize = $("#teleprompterFontSize");
  const teleprompterOpacity = $("#teleprompterOpacity");

  const teleprompterPreview = $("#teleprompterPreview");

  const teleprompterResetBtn = $("#teleprompterResetBtn");
  const teleprompterPauseBtn = $("#teleprompterPauseBtn");
  const teleprompterPlayBtn = $("#teleprompterPlayBtn");
  const teleprompterSaveBtn = $("#teleprompterSaveBtn");

  /* Recording preview */

  const recordingPreviewModal = $("#recordingPreviewModal");
  const recordingPreviewVideo = $("#recordingPreviewVideo");

  const recordingFileInfo = $("#recordingFileInfo");

  const closeRecordingPreviewBtn =
    $("#closeRecordingPreviewBtn");

  const recordingCurrentTime = $("#recordingCurrentTime");
  const recordingDuration = $("#recordingDuration");

  const recordingPreviewPlayBtn =
    $("#recordingPreviewPlayBtn");

  const recordingPreviewPauseBtn =
    $("#recordingPreviewPauseBtn");

  const recordingFileName = $("#recordingFileName");

  const recordingTrimStart = $("#recordingTrimStart");
  const recordingTrimEnd = $("#recordingTrimEnd");

  const recordingTrimStartTime =
    $("#recordingTrimStartTime");

  const recordingTrimEndTime =
    $("#recordingTrimEndTime");

  const applyTrimBtn = $("#applyTrimBtn");
  const resetTrimBtn = $("#resetTrimBtn");
  const renameRecordingBtn = $("#renameRecordingBtn");

  const deleteRecordingBtn = $("#deleteRecordingBtn");
  const recordAgainBtn = $("#recordAgainBtn");
  const downloadRecordingBtn = $("#downloadRecordingBtn");

  const recordingHistoryList = $("#recordingHistoryList");
  const clearRecordingHistoryBtn =
    $("#clearRecordingHistoryBtn");

  /* Student modal */

  const studentModal = $("#studentModal");
  const studentNameInput = $("#studentNameInput");

  const closeStudentModalBtn = $("#closeStudentModalBtn");
  const cancelStudentBtn = $("#cancelStudentBtn");
  const saveStudentBtn = $("#saveStudentBtn");

  const toastContainer = $("#toastContainer");

  /* =======================================================
     STATE
     ======================================================= */

  const state = {
    /* Main */
    mainSource: "welcome",
    mainImageUrl: "",
    mainVideoUrl: "",

    /* Mentor */
    mentorSource: "placeholder",
    mentorVideoUrl: "",
    mentorCameraStream: null,
    mentorCameraWidth: 1280,
    mentorCameraHeight: 720,

    /* AI */
    segmentation: null,
    segmentationReady: false,
    segmentationBusy: false,
    backgroundMode: "original",
    backgroundImage: null,
    backgroundImageUrl: "",

    /* Camera */
    cameraDeviceId: "",
    cameraFacingMode: "user",

    /* Screen */
    screenStream: null,
    screenCaptureActive: false,

    /* Audio */
    audioContext: null,
    mediaDestination: null,

    mainSourceNode: null,
    mainGainNode: null,

    micSourceNode: null,
    micGainNode: null,

    micAnalyser: null,
    mainAnalyser: null,

    micStream: null,

    audioReady: false,
    micReady: false,

    /* Recording */
    recording: false,
    paused: false,
    mediaRecorder: null,
    recordingChunks: [],
    recordingBlob: null,
    recordingUrl: "",
    recordingMimeType: "",
    recordingStartedAt: 0,
    recordingElapsedBeforePause: 0,
    recordingTimerInterval: null,

    recordingCanvas: null,
    recordingCanvasContext: null,
    recordingRenderFrame: 0,
    recordingRenderActive: false,

    recordingWidth: 1920,
    recordingHeight: 1080,
    recordingFps: 30,

    /* Preview */
    previewRecordingId: null,
    previewObjectUrl: "",
    previewDuration: 0,
    previewTrimStart: 0,
    previewTrimEnd: 0,

    /* History */
    history: [],

    /* Teleprompter */
    teleprompterPlaying: false,
    teleprompterOffset: 0,
    teleprompterLastTime: 0,

    /* Students */
    students: [],

    /* Settings */
    brandName: "SNK Mentor Studio",
    autoStartTeleprompter: false,
    showTeleprompterRecording: true,

    /* Mentor position */
    mentorPosition: {
      left: null,
      top: null,
      right: 0.03,
      bottom: 0.04,
      width: 0.22,
      height: 0.12375
    },

    mentorDragging: false,
    mentorDragStartX: 0,
    mentorDragStartY: 0,
    mentorDragStartLeft: 0,
    mentorDragStartTop: 0,

    /* Resize */
    resizingMentor: false,
    resizeStartX: 0,
    resizeStartY: 0,
    resizeStartWidth: 0,
    resizeStartHeight: 0,

    /* UI */
    toastTimer: null,
    studentEditingId: null
  };

  /* =======================================================
     CONFIG
     ======================================================= */

  const DB_NAME = "SNKMentorStudioDB";
  const DB_VERSION = 1;
  const STORE_NAME = "recordings";

  const HISTORY_STORAGE_KEY =
    "snkMentorStudioRecordingHistory";

  const SETTINGS_STORAGE_KEY =
    "snkMentorStudioSettings";

  const STUDENTS_STORAGE_KEY =
    "snkMentorStudioStudents";

  /* =======================================================
     TOAST
     ======================================================= */

  function toast(message, type = "info", duration = 2800) {
    if (!toastContainer) {
      return;
    }

    const item = document.createElement("div");

    item.className = `toast toast-${type}`;

    item.innerHTML = `
      <div class="toast-dot"></div>
      <div class="toast-message"></div>
    `;

    const textNode = $(".toast-message", item);

    if (textNode) {
      textNode.textContent = message;
    }

    toastContainer.appendChild(item);

    requestAnimationFrame(() => {
      item.classList.add("show");
    });

    setTimeout(() => {
      item.classList.remove("show");

      setTimeout(() => {
        item.remove();
      }, 250);
    }, duration);
  }

  /* =======================================================
     LOCAL STORAGE
     ======================================================= */

  function saveSettings() {
    try {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({
          brandName: state.brandName,
          autoStartTeleprompter:
            state.autoStartTeleprompter,
          showTeleprompterRecording:
            state.showTeleprompterRecording,

          recordingQuality:
            recordingQualitySide?.value ||
            recordingQuality?.value ||
            "1080",

          recordingFps:
            recordingFpsSide?.value ||
            recordingFps?.value ||
            "30"
        })
      );
    } catch (error) {
      console.warn("Settings save failed:", error);
    }
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(
        SETTINGS_STORAGE_KEY
      );

      if (!raw) {
        return;
      }

      const settings = JSON.parse(raw);

      if (settings.brandName) {
        state.brandName = settings.brandName;
      }

      state.autoStartTeleprompter =
        Boolean(settings.autoStartTeleprompter);

      state.showTeleprompterRecording =
        settings.showTeleprompterRecording !== false;

      if (
        recordingQualitySide &&
        settings.recordingQuality
      ) {
        recordingQualitySide.value =
          String(settings.recordingQuality);
      }

      if (
        recordingQuality &&
        settings.recordingQuality
      ) {
        recordingQuality.value =
          String(settings.recordingQuality);
      }

      if (
        recordingFpsSide &&
        settings.recordingFps
      ) {
        recordingFpsSide.value =
          String(settings.recordingFps);
      }

      if (
        recordingFps &&
        settings.recordingFps
      ) {
        recordingFps.value =
          String(settings.recordingFps);
      }
    } catch (error) {
      console.warn("Settings load failed:", error);
    }
  }

  function saveStudents() {
    try {
      localStorage.setItem(
        STUDENTS_STORAGE_KEY,
        JSON.stringify(state.students)
      );
    } catch (error) {
      console.warn("Student save failed:", error);
    }
  }

  function loadStudents() {
    try {
      const raw = localStorage.getItem(
        STUDENTS_STORAGE_KEY
      );

      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        state.students = parsed;
      }
    } catch (error) {
      console.warn("Student load failed:", error);
    }
  }

  function applySettingsToUI() {
    if (brandNameInput) {
      brandNameInput.value = state.brandName;
    }

    if (settingsRecordingQuality) {
      settingsRecordingQuality.value =
        recordingQualitySide?.value ||
        recordingQuality?.value ||
        "1080";
    }

    if (settingsRecordingFps) {
      settingsRecordingFps.value =
        recordingFpsSide?.value ||
        recordingFps?.value ||
        "30";
    }

    if (settingsAutoStartTeleprompter) {
      settingsAutoStartTeleprompter.checked =
        state.autoStartTeleprompter;
    }

    if (settingsShowTeleprompterRecording) {
      settingsShowTeleprompterRecording.checked =
        state.showTeleprompterRecording;
    }

    if (brandBadgeText) {
      brandBadgeText.textContent =
        state.brandName;
    }
  }

  /* =======================================================
     MODALS
     ======================================================= */

  function openModal(modal) {
    if (!modal) {
      return;
    }

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal(modal) {
    if (!modal) {
      return;
    }

    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  /* =======================================================
     MAIN SOURCE
     ======================================================= */

  function hideMainSources() {
    if (mainImage) {
      mainImage.classList.remove("active");
      mainImage.style.display = "none";
    }

    if (mainVideo) {
      mainVideo.classList.remove("active");
      mainVideo.style.display = "none";
    }

    if (screenCaptureVideo) {
      screenCaptureVideo.classList.remove("active");
      screenCaptureVideo.style.display = "none";
    }
  }

  function showMainImage(url) {
    if (!mainImage) {
      return;
    }

    hideMainSources();

    mainImage.src = url;
    mainImage.style.display = "block";
    mainImage.classList.add("active");

    state.mainSource = "image";

    updateStageSourceBadge("IMAGE");
    renderCompositionFrame();
  }

  function showMainVideo(url) {
    if (!mainVideo) {
      return;
    }

    hideMainSources();

    mainVideo.src = url;
    mainVideo.style.display = "block";
    mainVideo.classList.add("active");

    mainVideo.controls = false;
    mainVideo.volume = 1;

    state.mainSource = "video";

    updateStageSourceBadge("VIDEO");

    mainVideo.load();

    renderCompositionFrame();
  }

  function showWelcome() {
    hideMainSources();

    state.mainSource = "welcome";

    updateStageSourceBadge("WELCOME");

    renderCompositionFrame();
  }

  function loadImageFile(file) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast("Please select an image file.", "error");
      return;
    }

    if (state.mainImageUrl) {
      URL.revokeObjectURL(state.mainImageUrl);
    }

    state.mainImageUrl = URL.createObjectURL(file);

    showMainImage(state.mainImageUrl);

    toast("Main image loaded.", "success");
  }

  function loadMainVideoFile(file) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("video/")) {
      toast("Please select a video file.", "error");
      return;
    }

    if (state.mainVideoUrl) {
      URL.revokeObjectURL(state.mainVideoUrl);
    }

    state.mainVideoUrl = URL.createObjectURL(file);

    showMainVideo(state.mainVideoUrl);

    toast("Main video loaded.", "success");
  }

  /* =======================================================
     MAIN VIDEO CONTROLS
     ======================================================= */

  function playMainVideo() {
    if (!mainVideo) {
      return;
    }

    if (state.mainSource !== "video") {
      toast("Upload a main video first.", "info");
      return;
    }

    mainVideo
      .play()
      .then(() => {
        renderCompositionFrame();
      })
      .catch((error) => {
        console.warn("Video play failed:", error);
      });
  }

  function pauseMainVideo() {
    if (!mainVideo) {
      return;
    }

    mainVideo.pause();
    renderCompositionFrame();
  }

  function updateMainAudioUI() {
    const enabled =
      mainVideoAudioCheckbox?.checked !== false;

    const volume = clamp(
      safeNumber(mainVideoVolume?.value, 100),
      0,
      100
    );

    if (mainVideo) {
      mainVideo.muted = !enabled;
      mainVideo.volume = volume / 100;
    }

    if (mainVolumeValue) {
      mainVolumeValue.textContent =
        `${Math.round(volume)}%`;
    }
  }

  /* =======================================================
     MENTOR VIDEO
     ======================================================= */

  function hideMentorSources() {
    if (mentorVideo) {
      mentorVideo.style.display = "none";
      mentorVideo.classList.remove("active");
    }

    if (mentorCameraVideo) {
      mentorCameraVideo.style.display = "none";
      mentorCameraVideo.classList.remove("active");
    }

    if (mentorAICanvas) {
      mentorAICanvas.style.display = "none";
      mentorAICanvas.classList.remove("active");
    }
  }

  function showMentorPlaceholder() {
    hideMentorSources();

    if (mentorPlaceholder) {
      mentorPlaceholder.style.display = "flex";
    }

    if (mentorSourceLabel) {
      mentorSourceLabel.textContent = "MENTOR";
    }

    state.mentorSource = "placeholder";

    updateCameraIndicator(false);

    renderCompositionFrame();
  }

  function showMentorVideo(url) {
    if (!mentorVideo) {
      return;
    }

    hideMentorSources();

    mentorVideo.src = url;
    mentorVideo.style.display = "block";
    mentorVideo.classList.add("active");

    mentorVideo.muted = true;
    mentorVideo.loop = true;

    state.mentorSource = "video";

    if (mentorPlaceholder) {
      mentorPlaceholder.style.display = "none";
    }

    if (mentorSourceLabel) {
      mentorSourceLabel.textContent = "VIDEO";
    }

    mentorVideo
      .play()
      .catch(() => {});

    updateCameraIndicator(false);

    renderCompositionFrame();
  }

  function loadMentorFile(file) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("video/")) {
      toast("Mentor file must be a video.", "error");
      return;
    }

    if (state.mentorVideoUrl) {
      URL.revokeObjectURL(state.mentorVideoUrl);
    }

    state.mentorVideoUrl =
      URL.createObjectURL(file);

    stopCamera(false);

    showMentorVideo(state.mentorVideoUrl);

    toast("Mentor video loaded.", "success");
  }

  /* =======================================================
     CAMERA
     ======================================================= */

  function getSelectedCameraConstraints() {
    const quality =
      String(cameraQuality?.value || "720");

    const fps =
      clamp(
        safeNumber(cameraFps?.value, 30),
        24,
        60
      );

    const qualityMap = {
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

    const selected =
      qualityMap[quality] ||
      qualityMap["720"];

    const video = {
      width: {
        ideal: selected.width
      },
      height: {
        ideal: selected.height
      },
      frameRate: {
        ideal: fps,
        max: fps
      },
      facingMode:
        state.cameraFacingMode
    };

    if (state.cameraDeviceId) {
      video.deviceId = {
        exact: state.cameraDeviceId
      };

      delete video.facingMode;
    }

    return {
      video,
      audio: false
    };
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

      const cameras =
        devices.filter(
          (device) =>
            device.kind === "videoinput"
        );

      if (!cameraDeviceSelect) {
        return;
      }

      const current =
        cameraDeviceSelect.value;

      cameraDeviceSelect.innerHTML =
        `<option value="">Default camera</option>`;

      cameras.forEach((camera, index) => {
        const option =
          document.createElement("option");

        option.value =
          camera.deviceId;

        option.textContent =
          camera.label ||
          `Camera ${index + 1}`;

        cameraDeviceSelect.appendChild(option);
      });

      if (
        current &&
        cameras.some(
          (camera) =>
            camera.deviceId === current
        )
      ) {
        cameraDeviceSelect.value =
          current;
      } else if (
        state.cameraDeviceId &&
        cameras.some(
          (camera) =>
            camera.deviceId ===
            state.cameraDeviceId
        )
      ) {
        cameraDeviceSelect.value =
          state.cameraDeviceId;
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
        "Camera API is not available in this browser.",
        "error"
      );
      return;
    }

    try {
      stopCamera(false);

      const constraints =
        getSelectedCameraConstraints();

      const stream =
        await navigator.mediaDevices.getUserMedia(
          constraints
        );

      state.mentorCameraStream =
        stream;

      if (mentorCameraVideo) {
        mentorCameraVideo.srcObject =
          stream;

        mentorCameraVideo.muted = true;
        mentorCameraVideo.playsInline = true;

        hideMentorSources();

        mentorCameraVideo.style.display =
          "block";

        mentorCameraVideo.classList.add(
          "active"
        );

        if (mentorPlaceholder) {
          mentorPlaceholder.style.display =
            "none";
        }

        await mentorCameraVideo.play();

        const track =
          stream.getVideoTracks()[0];

        if (track) {
          const settings =
            track.getSettings();

          state.mentorCameraWidth =
            settings.width ||
            1280;

          state.mentorCameraHeight =
            settings.height ||
            720;
        }
      }

      state.mentorSource = "camera";

      if (mentorSourceLabel) {
        mentorSourceLabel.textContent =
          "CAMERA";
      }

      updateCameraIndicator(true);

      if (cameraStatus) {
        cameraStatus.textContent =
          "Camera connected";
      }

      await enumerateCameras();

      toast(
        "Camera started.",
        "success"
      );

      initializeSegmentation();

      renderCompositionFrame();
    } catch (error) {
      console.error(
        "Camera start failed:",
        error
      );

      if (cameraStatus) {
        cameraStatus.textContent =
          "Camera unavailable";
      }

      updateCameraIndicator(false);

      toast(
        `Camera error: ${error.message || "Unable to access camera."}`,
        "error",
        4500
      );
    }
  }

  function stopCamera(showToast = true) {
    if (state.mentorCameraStream) {
      state.mentorCameraStream
        .getTracks()
        .forEach((track) => {
          try {
            track.stop();
          } catch (_) {}
        });
    }

    state.mentorCameraStream = null;

    if (mentorCameraVideo) {
      mentorCameraVideo.pause();
      mentorCameraVideo.srcObject = null;
      mentorCameraVideo.style.display =
        "none";
      mentorCameraVideo.classList.remove(
        "active"
      );
    }

    if (
      state.mentorSource === "camera"
    ) {
      showMentorPlaceholder();
    }

    updateCameraIndicator(false);

    if (cameraStatus) {
      cameraStatus.textContent =
        "Camera stopped";
    }

    if (showToast) {
      toast(
        "Camera stopped.",
        "info"
      );
    }
  }

  async function switchCamera() {
    state.cameraFacingMode =
      state.cameraFacingMode === "user"
        ? "environment"
        : "user";

    await startCamera();
  }

  function updateCameraIndicator(active) {
    if (!cameraIndicator) {
      return;
    }

    cameraIndicator.classList.toggle(
      "active",
      Boolean(active)
    );

    const text =
      $(".indicator-text", cameraIndicator);

    if (text) {
      text.textContent = active
        ? "Camera"
        : "Camera Off";
    }
  }

  /* =======================================================
     MEDIA PIPE SELFIE SEGMENTATION
     ======================================================= */

  function initializeSegmentation() {
    if (
      state.segmentation ||
      typeof SelfieSegmentation ===
        "undefined"
    ) {
      return;
    }

    try {
      state.segmentation =
        new SelfieSegmentation({
          locateFile: (file) =>
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

      state.segmentation = null;
      state.segmentationReady = false;
    }
  }

  async function processCameraSegmentation() {
    if (
      !state.segmentation ||
      !state.segmentationReady ||
      state.segmentationBusy ||
      !mentorCameraVideo ||
      mentorCameraVideo.readyState <
        2 ||
      state.mentorSource !== "camera"
    ) {
      return;
    }

    state.segmentationBusy = true;

    try {
      await state.segmentation.send({
        image: mentorCameraVideo
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

  function ensureCanvasSize(
    canvas,
    width,
    height
  ) {
    if (!canvas) {
      return;
    }

    if (
      canvas.width !== width ||
      canvas.height !== height
    ) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function handleSegmentationResults(results) {
    if (
      !results ||
      !results.image ||
      !results.segmentationMask
    ) {
      return;
    }

    if (!mentorAICanvas) {
      return;
    }

    const sourceWidth =
      results.image.videoWidth ||
      results.image.width ||
      1280;

    const sourceHeight =
      results.image.videoHeight ||
      results.image.height ||
      720;

    ensureCanvasSize(
      mentorAICanvas,
      sourceWidth,
      sourceHeight
    );

    ensureCanvasSize(
      aiSourceCanvas,
      sourceWidth,
      sourceHeight
    );

    ensureCanvasSize(
      aiMaskCanvas,
      sourceWidth,
      sourceHeight
    );

    const sourceCtx =
      aiSourceCanvas?.getContext(
        "2d",
        { willReadFrequently: true }
      );

    const maskCtx =
      aiMaskCanvas?.getContext(
        "2d",
        { willReadFrequently: true }
      );

    const outputCtx =
      mentorAICanvas?.getContext(
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
      sourceWidth,
      sourceHeight
    );

    sourceCtx.drawImage(
      results.image,
      0,
      0,
      sourceWidth,
      sourceHeight
    );

    maskCtx.clearRect(
      0,
      0,
      sourceWidth,
      sourceHeight
    );

    maskCtx.drawImage(
      results.segmentationMask,
      0,
      0,
      sourceWidth,
      sourceHeight
    );

    const sourceData =
      sourceCtx.getImageData(
        0,
        0,
        sourceWidth,
        sourceHeight
      );

    const maskData =
      maskCtx.getImageData(
        0,
        0,
        sourceWidth,
        sourceHeight
      );

    const outputData =
      outputCtx.createImageData(
        sourceWidth,
        sourceHeight
      );

    const src =
      sourceData.data;

    const mask =
      maskData.data;

    const out =
      outputData.data;

    /*
      MediaPipe foreground confidence
      is normally available in mask red.

      We use a soft alpha edge:
      confidence 0.15 -> alpha 0
      confidence 0.80 -> alpha 255
    */

    for (
      let i = 0;
      i < src.length;
      i += 4
    ) {
      const confidence =
        mask[i] / 255;

      const alpha =
        clamp(
          (confidence - 0.15) /
            0.65,
          0,
          1
        );

      out[i] =
        src[i];

      out[i + 1] =
        src[i + 1];

      out[i + 2] =
        src[i + 2];

      out[i + 3] =
        Math.round(
          alpha * 255
        );
    }

    outputCtx.putImageData(
      outputData,
      0,
      0
    );

    drawMentorAIBackground(
      outputCtx,
      sourceWidth,
      sourceHeight
    );

    if (mentorAICanvas) {
      mentorAICanvas.style.display =
        "block";

      mentorAICanvas.classList.add(
        "active"
      );
    }

    if (mentorPlaceholder) {
      mentorPlaceholder.style.display =
        "none";
    }

    renderCompositionFrame();
  }

  function drawMentorAIBackground(
    ctx,
    width,
    height
  ) {
    /*
      Important:
      The background is drawn BEFORE
      the isolated person.
    */

    if (
      state.backgroundMode ===
      "original"
    ) {
      ctx.globalCompositeOperation =
        "destination-over";

      ctx.drawImage(
        mentorCameraVideo,
        0,
        0,
        width,
        height
      );

      ctx.globalCompositeOperation =
        "source-over";

      return;
    }

    if (
      state.backgroundMode ===
      "blur"
    ) {
      ctx.save();

      ctx.globalCompositeOperation =
        "destination-over";

      ctx.filter = "blur(18px)";

      ctx.drawImage(
        mentorCameraVideo,
        0,
        0,
        width,
        height
      );

      ctx.filter = "none";

      ctx.restore();

      return;
    }

    if (
      state.backgroundMode ===
      "custom" &&
      state.backgroundImage
    ) {
      ctx.save();

      ctx.globalCompositeOperation =
        "destination-over";

      drawCoverImage(
        ctx,
        state.backgroundImage,
        0,
        0,
        width,
        height
      );

      ctx.restore();

      return;
    }

    if (
      state.backgroundMode ===
      "solid"
    ) {
      ctx.save();

      ctx.globalCompositeOperation =
        "destination-over";

      ctx.fillStyle =
        backgroundColor?.value ||
        "#101827";

      ctx.fillRect(
        0,
        0,
        width,
        height
      );

      ctx.restore();

      return;
    }

    if (
      state.backgroundMode ===
      "remove"
    ) {
      /*
        Transparent background.
        No destination-over background.
      */

      return;
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

    if (!iw || !ih) {
      return;
    }

    const imageRatio =
      iw / ih;

    const targetRatio =
      width / height;

    let drawWidth = width;
    let drawHeight = height;
    let dx = x;
    let dy = y;

    if (imageRatio > targetRatio) {
      drawHeight = height;
      drawWidth =
        height * imageRatio;
      dx =
        x +
        (width - drawWidth) / 2;
    } else {
      drawWidth = width;
      drawHeight =
        width / imageRatio;
      dy =
        y +
        (height - drawHeight) / 2;
    }

    ctx.drawImage(
      image,
      dx,
      dy,
      drawWidth,
      drawHeight
    );
  }

  /* =======================================================
     BACKGROUND MODE
     ======================================================= */

  function setBackgroundMode(mode) {
    state.backgroundMode = mode;

    [
      bgOriginalBtn,
      bgRemoveBtn,
      bgBlurBtn,
      bgImageBtn,
      bgColorBtn
    ].forEach((button) => {
      if (button) {
        button.classList.remove(
          "active"
        );
      }
    });

    const map = {
      original: bgOriginalBtn,
      remove: bgRemoveBtn,
      blur: bgBlurBtn,
      custom: bgImageBtn,
      solid: bgColorBtn
    };

    if (map[mode]) {
      map[mode].classList.add(
        "active"
      );
    }

    if (
      backgroundUploadBox
    ) {
      backgroundUploadBox.style.display =
        mode === "custom"
          ? ""
          : "none";
    }

    if (
      backgroundColor
    ) {
      backgroundColor.style.display =
        mode === "solid"
          ? ""
          : "";
    }

    renderCompositionFrame();
  }

  function loadBackgroundImage(file) {
    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      toast(
        "Background must be an image.",
        "error"
      );
      return;
    }

    if (state.backgroundImageUrl) {
      URL.revokeObjectURL(
        state.backgroundImageUrl
      );
    }

    state.backgroundImageUrl =
      URL.createObjectURL(file);

    const image =
      new Image();

    image.onload = () => {
      state.backgroundImage =
        image;

      setBackgroundMode(
        "custom"
      );

      toast(
        "Custom background loaded.",
        "success"
      );

      renderCompositionFrame();
    };

    image.src =
      state.backgroundImageUrl;
  }

  /* =======================================================
     MENTOR DRAG
     ======================================================= */

  function initializeMentorPosition() {
    if (!mentorCard) {
      return;
    }

    mentorCard.style.right =
      "3%";

    mentorCard.style.bottom =
      "4%";

    mentorCard.style.left =
      "auto";

    mentorCard.style.top =
      "auto";

    state.mentorPosition.left =
      null;

    state.mentorPosition.top =
      null;
  }

  function startMentorDrag(event) {
    if (
      event.target ===
      mentorResize
    ) {
      return;
    }

    if (!mentorCard) {
      return;
    }

    const point =
      getPointerPosition(event);

    const rect =
      mentorCard.getBoundingClientRect();

    state.mentorDragging = true;

    state.mentorDragStartX =
      point.x;

    state.mentorDragStartY =
      point.y;

    state.mentorDragStartLeft =
      rect.left;

    state.mentorDragStartTop =
      rect.top;

    mentorCard.classList.add(
      "dragging"
    );

    event.preventDefault();
  }

  function moveMentorDrag(event) {
    if (
      !state.mentorDragging ||
      !mentorCard ||
      !stage
    ) {
      return;
    }

    const point =
      getPointerPosition(event);

    const stageRect =
      stage.getBoundingClientRect();

    const cardRect =
      mentorCard.getBoundingClientRect();

    let newLeft =
      state.mentorDragStartLeft +
      (point.x -
        state.mentorDragStartX);

    let newTop =
      state.mentorDragStartTop +
      (point.y -
        state.mentorDragStartY);

    const minLeft =
      stageRect.left;

    const minTop =
      stageRect.top;

    const maxLeft =
      stageRect.right -
      cardRect.width;

    const maxTop =
      stageRect.bottom -
      cardRect.height;

    newLeft =
      clamp(
        newLeft,
        minLeft,
        maxLeft
      );

    newTop =
      clamp(
        newTop,
        minTop,
        maxTop
      );

    const relativeLeft =
      newLeft -
      stageRect.left;

    const relativeTop =
      newTop -
      stageRect.top;

    mentorCard.style.left =
      `${relativeLeft}px`;

    mentorCard.style.top =
      `${relativeTop}px`;

    mentorCard.style.right =
      "auto";

    mentorCard.style.bottom =
      "auto";

    state.mentorPosition.left =
      relativeLeft /
      stageRect.width;

    state.mentorPosition.top =
      relativeTop /
      stageRect.height;

    renderCompositionFrame();
  }

  function stopMentorDrag() {
    if (!state.mentorDragging) {
      return;
    }

    state.mentorDragging = false;

    if (mentorCard) {
      mentorCard.classList.remove(
        "dragging"
      );
    }
  }

  function getPointerPosition(event) {
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

  /* =======================================================
     MENTOR RESIZE
     ======================================================= */

  function startMentorResize(event) {
    if (
      !mentorCard ||
      !stage
    ) {
      return;
    }

    state.resizingMentor = true;

    const point =
      getPointerPosition(event);

    const rect =
      mentorCard.getBoundingClientRect();

    state.resizeStartX =
      point.x;

    state.resizeStartY =
      point.y;

    state.resizeStartWidth =
      rect.width;

    state.resizeStartHeight =
      rect.height;

    event.preventDefault();
    event.stopPropagation();
  }

  function moveMentorResize(event) {
    if (
      !state.resizingMentor ||
      !mentorCard ||
      !stage
    ) {
      return;
    }

    const point =
      getPointerPosition(event);

    const dx =
      point.x -
      state.resizeStartX;

    const stageRect =
      stage.getBoundingClientRect();

    let newWidth =
      state.resizeStartWidth +
      dx;

    const minWidth =
      130;

    const maxWidth =
      stageRect.width *
      0.45;

    newWidth =
      clamp(
        newWidth,
        minWidth,
        maxWidth
      );

    const ratio =
      16 / 9;

    const newHeight =
      newWidth / ratio;

    mentorCard.style.width =
      `${newWidth}px`;

    mentorCard.style.height =
      `${newHeight}px`;

    state.mentorPosition.width =
      newWidth /
      stageRect.width;

    state.mentorPosition.height =
      newHeight /
      stageRect.height;

    renderCompositionFrame();
  }

  function stopMentorResize() {
    state.resizingMentor =
      false;
  }

  /* =======================================================
     SCREEN CAPTURE
     ======================================================= */

  async function startScreenCapture() {
    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getDisplayMedia
    ) {
      toast(
        "Screen capture is not supported here.",
        "error"
      );
      return;
    }

    try {
      stopScreenCapture(false);

      const stream =
        await navigator.mediaDevices.getDisplayMedia(
          {
            video: {
              frameRate: {
                ideal: 30,
                max: 60
              }
            },
            audio: true
          }
        );

      state.screenStream =
        stream;

      state.screenCaptureActive =
        true;

      if (screenCaptureVideo) {
        screenCaptureVideo.srcObject =
          stream;

        screenCaptureVideo.muted =
          true;

        screenCaptureVideo.playsInline =
          true;

        await screenCaptureVideo.play();
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

      updateScreenIndicator(true);

      if (screenCaptureStatus) {
        screenCaptureStatus.textContent =
          "Screen capture active";
      }

      if (screenCaptureStatusLight) {
        screenCaptureStatusLight.classList.add(
          "active"
        );
      }

      if (stageSourceBadge) {
        updateStageSourceBadge(
          "SCREEN"
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

      state.screenStream = null;
      state.screenCaptureActive =
        false;

      updateScreenIndicator(false);

      toast(
        "Screen capture cancelled.",
        "info"
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
          try {
            track.stop();
          } catch (_) {}
        });
    }

    state.screenStream = null;
    state.screenCaptureActive =
      false;

    if (screenCaptureVideo) {
      screenCaptureVideo.pause();
      screenCaptureVideo.srcObject =
        null;
    }

    updateScreenIndicator(false);

    if (screenCaptureStatus) {
      screenCaptureStatus.textContent =
        "Screen capture stopped";
    }

    if (screenCaptureStatusLight) {
      screenCaptureStatusLight.classList.remove(
        "active"
      );
    }

    if (showToast) {
      toast(
        "Screen capture stopped.",
        "info"
      );
    }

    updateStageSourceBadge(
      state.mainSource === "video"
        ? "VIDEO"
        : state.mainSource === "image"
          ? "IMAGE"
          : "WELCOME"
    );

    renderCompositionFrame();
  }

  function updateScreenIndicator(
    active
  ) {
    if (!screenIndicator) {
      return;
    }

    screenIndicator.classList.toggle(
      "active",
      Boolean(active)
    );

    const text =
      $(".indicator-text", screenIndicator);

    if (text) {
      text.textContent = active
        ? "Screen"
        : "Screen Off";
    }
  }

  /* =======================================================
     AUDIO ENGINE
     ======================================================= */

  async function ensureAudioContext() {
    if (
      state.audioContext &&
      state.audioContext.state !==
        "closed"
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
        "Web Audio is not supported.",
        "error"
      );
      return null;
    }

    state.audioContext =
      new AudioContextClass();

    state.mediaDestination =
      state.audioContext.createMediaStreamDestination();

    return state.audioContext;
  }

  async function setupMainVideoAudio() {
    if (!mainVideo) {
      return;
    }

    const ctx =
      await ensureAudioContext();

    if (!ctx) {
      return;
    }

    if (!state.mainSourceNode) {
      try {
        state.mainSourceNode =
          ctx.createMediaElementSource(
            mainVideo
          );

        state.mainGainNode =
          ctx.createGain();

        state.mainAnalyser =
          ctx.createAnalyser();

        state.mainAnalyser.fftSize =
          256;

        state.mainSourceNode.connect(
          state.mainGainNode
        );

        state.mainGainNode.connect(
          state.mainAnalyser
        );

        state.mainAnalyser.connect(
          ctx.destination
        );

        state.mainGainNode.connect(
          state.mediaDestination
        );
      } catch (error) {
        console.warn(
          "Main audio setup failed:",
          error
        );
      }
    }

    updateMainAudioGraph();
  }

  function updateMainAudioGraph() {
    if (!state.mainGainNode) {
      return;
    }

    const enabled =
      mainVideoAudioCheckbox?.checked !==
      false;

    const volume =
      clamp(
        safeNumber(
          mainVideoVolume?.value,
          100
        ),
        0,
        100
      );

    state.mainGainNode.gain.value =
      enabled
        ? volume / 100
        : 0;

    if (mainVideo) {
      /*
        Once routed through Web Audio,
        mute the HTML element to avoid
        duplicate direct playback.
      */
      mainVideo.muted = true;
    }

    if (mainVolumeValue) {
      mainVolumeValue.textContent =
        `${Math.round(volume)}%`;
    }
  }

  async function enableMicrophone() {
    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      toast(
        "Microphone API unavailable.",
        "error"
      );
      return;
    }

    try {
      const ctx =
        await ensureAudioContext();

      if (!ctx) {
        return;
      }

      if (state.micStream) {
        stopMicrophone(false);
      }

      state.micStream =
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

      state.micSourceNode =
        ctx.createMediaStreamSource(
          state.micStream
        );

      state.micGainNode =
        ctx.createGain();

      state.micAnalyser =
        ctx.createAnalyser();

      state.micAnalyser.fftSize =
        2048;

      state.micSourceNode.connect(
        state.micGainNode
      );

      state.micGainNode.connect(
        state.micAnalyser
      );

      state.micAnalyser.connect(
        state.mediaDestination
      );

      state.micReady = true;

      updateMicGraph();

      updateMicIndicator(true);

      if (micEnabled) {
        micEnabled.checked = true;
      }

      toast(
        "Microphone enabled.",
        "success"
      );

      startAudioMeterLoop();
    } catch (error) {
      console.error(
        "Microphone error:",
        error
      );

      state.micReady = false;

      updateMicIndicator(false);

      toast(
        `Microphone error: ${error.message || "Unable to access microphone."}`,
        "error",
        4500
      );
    }
  }

  function stopMicrophone(
    showToast = true
  ) {
    if (state.micStream) {
      state.micStream
        .getTracks()
        .forEach((track) => {
          try {
            track.stop();
          } catch (_) {}
        });
    }

    state.micStream = null;

    if (state.micSourceNode) {
      try {
        state.micSourceNode.disconnect();
      } catch (_) {}
    }

    if (state.micGainNode) {
      try {
        state.micGainNode.disconnect();
      } catch (_) {}
    }

    state.micSourceNode = null;
    state.micGainNode = null;
    state.micReady = false;

    updateMicIndicator(false);

    if (micEnabled) {
      micEnabled.checked = false;
    }

    if (showToast) {
      toast(
        "Microphone disabled.",
        "info"
      );
    }
  }

  function updateMicGraph() {
    if (!state.micGainNode) {
      return;
    }

    const enabled =
      micEnabled?.checked !== false;

    const volume =
      clamp(
        safeNumber(
          micVolume?.value,
          100
        ),
        0,
        100
      );

    state.micGainNode.gain.value =
      enabled
        ? volume / 100
        : 0;

    if (micVolumeValue) {
      micVolumeValue.textContent =
        `${Math.round(volume)}%`;
    }

    if (state.micSourceNode) {
      /*
        Optional monitoring to local speakers.
        We deliberately do NOT connect the
        mic directly unless monitor is enabled.
      */

      updateMicMonitoring();
    }
  }

  function updateMicMonitoring() {
    if (
      !state.micGainNode ||
      !state.audioContext
    ) {
      return;
    }

    const enabled =
      micMonitor?.checked === true;

    /*
      Disconnecting/reconnecting a gain
      node is safe here.
    */

    try {
      state.micGainNode.disconnect(
        state.audioContext.destination
      );
    } catch (_) {}

    if (enabled) {
      try {
        state.micGainNode.connect(
          state.audioContext.destination
        );
      } catch (_) {}
    }
  }

  function updateMicIndicator(active) {
    if (!micIndicator) {
      return;
    }

    micIndicator.classList.toggle(
      "active",
      Boolean(active)
    );

    const text =
      $(".indicator-text", micIndicator);

    if (text) {
      text.textContent = active
        ? "Mic"
        : "Mic Off";
    }
  }

  function updateAudioIndicator() {
    if (!audioIndicator) {
      return;
    }

    const active =
      Boolean(
        state.mainSourceNode ||
        state.micReady
      );

    audioIndicator.classList.toggle(
      "active",
      active
    );

    const text =
      $(".indicator-text", audioIndicator);

    if (text) {
      text.textContent = active
        ? "Audio"
        : "Audio Off";
    }
  }

  /* =======================================================
     AUDIO METERS
     ======================================================= */

  let audioMeterAnimation =
    null;

  function startAudioMeterLoop() {
    if (audioMeterAnimation) {
      return;
    }

    const draw = () => {
      audioMeterAnimation =
        requestAnimationFrame(draw);

      updateAudioMeters();
    };

    draw();
  }

  function stopAudioMeterLoop() {
    if (audioMeterAnimation) {
      cancelAnimationFrame(
        audioMeterAnimation
      );

      audioMeterAnimation = null;
    }
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

    for (let i = 0; i < buffer.length; i++) {
      const normalized =
        (buffer[i] - 128) / 128;

      sum +=
        normalized *
        normalized;
    }

    const rms =
      Math.sqrt(
        sum / buffer.length
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

    const micPercent =
      Math.round(
        micLevel * 100
      );

    const mainPercent =
      Math.round(
        mainLevel * 100
      );

    if (micLevelBar) {
      micLevelBar.style.width =
        `${micPercent}%`;
    }

    if (micLevelValue) {
      micLevelValue.textContent =
        `${micPercent}%`;
    }

    if (mainAudioLevelBar) {
      mainAudioLevelBar.style.width =
        `${mainPercent}%`;
    }

    if (mainAudioLevelValue) {
      mainAudioLevelValue.textContent =
        `${mainPercent}%`;
    }

    drawMicWaveform();
  }

  function drawMicWaveform() {
    if (!micWaveformCanvas) {
      return;
    }

    const ctx =
      micWaveformCanvas.getContext(
        "2d"
      );

    if (!ctx) {
      return;
    }

    const rect =
      micWaveformCanvas.getBoundingClientRect();

    const width =
      Math.max(
        1,
        Math.floor(rect.width)
      );

    const height =
      Math.max(
        1,
        Math.floor(rect.height)
      );

    if (
      micWaveformCanvas.width !==
        width ||
      micWaveformCanvas.height !==
        height
    ) {
      micWaveformCanvas.width =
        width;

      micWaveformCanvas.height =
        height;
    }

    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    if (!state.micAnalyser) {
      return;
    }

    const buffer =
      new Uint8Array(
        state.micAnalyser.fftSize
      );

    state.micAnalyser.getByteTimeDomainData(
      buffer
    );

    ctx.beginPath();

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
        (value * height) / 2;

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

    ctx.lineWidth = 2;
    ctx.strokeStyle =
      getComputedStyle(
        document.documentElement
      ).getPropertyValue(
        "--blue-strong"
      ) ||
      "#8cc7ff";

    ctx.stroke();
  }

  /* =======================================================
     RECORDING QUALITY
     ======================================================= */

  function getRecordingSettings() {
    let quality =
      recordingQualitySide?.value ||
      recordingQuality?.value ||
      "1080";

    let fps =
      recordingFpsSide?.value ||
      recordingFps?.value ||
      "30";

    const qualityMap = {
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

    const resolution =
      qualityMap[String(quality)] ||
      qualityMap["1080"];

    return {
      width: resolution.width,
      height: resolution.height,
      fps: clamp(
        safeNumber(fps, 30),
        24,
        60
      )
    };
  }

  function syncRecordingSettings() {
    const settings =
      getRecordingSettings();

    state.recordingWidth =
      settings.width;

    state.recordingHeight =
      settings.height;

    state.recordingFps =
      settings.fps;

    if (recordingQuality) {
      recordingQuality.value =
        String(
          settings.width === 1280
            ? "720"
            : settings.width === 2560
              ? "1440"
              : "1080"
        );
    }

    if (recordingFps) {
      recordingFps.value =
        String(settings.fps);
    }

    if (recordingQualitySide) {
      recordingQualitySide.value =
        String(
          settings.width === 1280
            ? "720"
            : settings.width === 2560
              ? "1440"
              : "1080"
        );
    }

    if (recordingFpsSide) {
      recordingFpsSide.value =
        String(settings.fps);
    }

    updateStageBadges();
  }

  function updateStageBadges() {
    if (stageResolutionBadge) {
      stageResolutionBadge.textContent =
        `${state.recordingWidth} × ${state.recordingHeight}`;
    }

    if (stageFpsBadge) {
      stageFpsBadge.textContent =
        `${state.recordingFps} FPS`;
    }
  }

  /* =======================================================
     MEDIA RECORDER MIME
     ======================================================= */

  function getSelectedRecordingMime() {
    const requested =
      recordingFormatSide?.value ||
      recordingFormat?.value ||
      "webm-vp9";

    const candidates = [];

    if (requested === "mp4") {
      candidates.push(
        'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
        "video/mp4"
      );
    }

    if (
      requested === "webm-vp8"
    ) {
      candidates.push(
        "video/webm;codecs=vp8,opus",
        "video/webm"
      );
    }

    if (
      requested === "webm-vp9" ||
      requested === "webm"
    ) {
      candidates.push(
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm"
      );
    }

    candidates.push(
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4"
    );

    if (
      typeof MediaRecorder ===
      "undefined"
    ) {
      return "";
    }

    for (const mime of candidates) {
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

    return "";
  }

  function getExtensionFromMime(
    mime
  ) {
    return mime.includes(
      "mp4"
    )
      ? "mp4"
      : "webm";
  }

  /* =======================================================
     COMPOSITION CANVAS
     ======================================================= */

  function createRecordingCanvas() {
    if (!state.recordingCanvas) {
      state.recordingCanvas =
        document.createElement(
          "canvas"
        );

      state.recordingCanvasContext =
        state.recordingCanvas.getContext(
          "2d"
        );
    }

    state.recordingCanvas.width =
      state.recordingWidth;

    state.recordingCanvas.height =
      state.recordingHeight;

    return state.recordingCanvas;
  }

  function drawMainComposition(
    ctx,
    width,
    height
  ) {
    ctx.save();

    ctx.fillStyle = "#05070a";

    ctx.fillRect(
      0,
      0,
      width,
      height
    );

    if (
      state.screenCaptureActive &&
      screenCaptureVideo &&
      screenCaptureVideo.readyState >=
        2
    ) {
      drawCoverImage(
        ctx,
        screenCaptureVideo,
        0,
        0,
        width,
        height
      );

      ctx.restore();
      return;
    }

    if (
      state.mainSource ===
        "image" &&
      mainImage &&
      mainImage.complete &&
      mainImage.naturalWidth
    ) {
      drawContainImage(
        ctx,
        mainImage,
        0,
        0,
        width,
        height
      );
    } else if (
      state.mainSource ===
        "video" &&
      mainVideo &&
      mainVideo.readyState >=
        2
    ) {
      drawContainImage(
        ctx,
        mainVideo,
        0,
        0,
        width,
        height
      );
    } else {
      drawWelcomeComposition(
        ctx,
        width,
        height
      );
    }

    ctx.restore();
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

    if (!sw || !sh) {
      return;
    }

    const sourceRatio =
      sw / sh;

    const targetRatio =
      width / height;

    let drawWidth;
    let drawHeight;
    let dx;
    let dy;

    if (
      sourceRatio >
      targetRatio
    ) {
      drawWidth = width;
      drawHeight =
        width / sourceRatio;
      dx = x;
      dy =
        y +
        (height -
          drawHeight) /
          2;
    } else {
      drawHeight = height;
      drawWidth =
        height *
        sourceRatio;
      dx =
        x +
        (width -
          drawWidth) /
          2;
      dy = y;
    }

    ctx.drawImage(
      source,
      dx,
      dy,
      drawWidth,
      drawHeight
    );
  }

  function drawWelcomeComposition(
    ctx,
    width,
    height
  ) {
    ctx.save();

    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        width,
        height
      );

    gradient.addColorStop(
      0,
      "#0b111a"
    );

    gradient.addColorStop(
      1,
      "#101c2a"
    );

    ctx.fillStyle =
      gradient;

    ctx.fillRect(
      0,
      0,
      width,
      height
    );

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.fillStyle =
      "rgba(255,255,255,.94)";

    ctx.font =
      "700 64px Arial";

    ctx.fillText(
      "SNK Mentor Studio",
      width / 2,
      height / 2 - 35
    );

    ctx.fillStyle =
      "rgba(190,215,240,.72)";

    ctx.font =
      "400 28px Arial";

    ctx.fillText(
      "Upload a slide, image or video to begin",
      width / 2,
      height / 2 + 45
    );

    ctx.restore();
  }

  function getMentorDrawRect(
    width,
    height
  ) {
    if (!mentorCard) {
      return null;
    }

    const stageRect =
      stage?.getBoundingClientRect();

    const cardRect =
      mentorCard.getBoundingClientRect();

    if (
      !stageRect ||
      !cardRect
    ) {
      return null;
    }

    const left =
      ((cardRect.left -
        stageRect.left) /
        stageRect.width) *
      width;

    const top =
      ((cardRect.top -
        stageRect.top) /
        stageRect.height) *
      height;

    const drawWidth =
      (cardRect.width /
        stageRect.width) *
      width;

    const drawHeight =
      (cardRect.height /
        stageRect.height) *
      height;

    return {
      x: left,
      y: top,
      width: drawWidth,
      height: drawHeight
    };
  }

  function drawMentorComposition(
    ctx,
    width,
    height
  ) {
    const rect =
      getMentorDrawRect(
        width,
        height
      );

    if (!rect) {
      return;
    }

    if (
      state.mentorSource ===
        "camera" &&
      mentorAICanvas &&
      mentorAICanvas.style.display !==
        "none" &&
      mentorAICanvas.width
    ) {
      ctx.drawImage(
        mentorAICanvas,
        rect.x,
        rect.y,
        rect.width,
        rect.height
      );

      return;
    }

    if (
      state.mentorSource ===
        "camera" &&
      mentorCameraVideo &&
      mentorCameraVideo.readyState >=
        2
    ) {
      ctx.drawImage(
        mentorCameraVideo,
        rect.x,
        rect.y,
        rect.width,
        rect.height
      );

      return;
    }

    if (
      state.mentorSource ===
        "video" &&
      mentorVideo &&
      mentorVideo.readyState >=
        2
    ) {
      ctx.drawImage(
        mentorVideo,
        rect.x,
        rect.y,
        rect.width,
        rect.height
      );

      return;
    }

    /*
      Placeholder.
    */

    ctx.save();

    ctx.fillStyle =
      "rgba(16,24,36,.94)";

    ctx.fillRect(
      rect.x,
      rect.y,
      rect.width,
      rect.height
    );

    ctx.strokeStyle =
      "rgba(255,255,255,.12)";

    ctx.lineWidth = 3;

    ctx.strokeRect(
      rect.x,
      rect.y,
      rect.width,
      rect.height
    );

    ctx.fillStyle =
      "rgba(255,255,255,.72)";

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.font =
      `${Math.max(
        20,
        rect.width * 0.08
      )}px Arial`;

    ctx.fillText(
      "MENTOR",
      rect.x +
        rect.width / 2,
      rect.y +
        rect.height / 2
    );

    ctx.restore();
  }

  function drawBrandBadgeComposition(
    ctx,
    width,
    height
  ) {
    ctx.save();

    const padding =
      Math.max(
        20,
        width * 0.018
      );

    const text =
      state.brandName ||
      "SNK Mentor Studio";

    ctx.font =
      `600 ${Math.max(
        18,
        width * 0.013
      )}px Arial`;

    const textWidth =
      ctx.measureText(
        text
      ).width;

    const boxWidth =
      textWidth +
      padding * 2;

    const boxHeight =
      Math.max(
        46,
        width * 0.032
      );

    const x = padding;
    const y =
      height -
      boxHeight -
      padding;

    ctx.fillStyle =
      "rgba(4,8,13,.72)";

    roundRect(
      ctx,
      x,
      y,
      boxWidth,
      boxHeight,
      boxHeight / 2
    );

    ctx.fill();

    ctx.fillStyle =
      "#ffffff";

    ctx.textAlign =
      "left";

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

  function drawRecordingOverlayComposition(
    ctx,
    width,
    height
  ) {
    if (!state.recording) {
      return;
    }

    ctx.save();

    const x =
      width * 0.025;

    const y =
      height * 0.035;

    const radius =
      Math.max(
        6,
        width * 0.004
      );

    ctx.fillStyle =
      "rgba(0,0,0,.65)";

    roundRect(
      ctx,
      x,
      y,
      width * 0.16,
      height * 0.055,
      height * 0.027
    );

    ctx.fill();

    ctx.fillStyle =
      "#ff4d67";

    ctx.beginPath();

    ctx.arc(
      x + height * 0.027,
      y +
        height * 0.027,
      radius,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
      "#ffffff";

    ctx.font =
      `700 ${Math.max(
        18,
        width * 0.014
      )}px Arial`;

    ctx.textBaseline =
      "middle";

    ctx.textAlign =
      "left";

    ctx.fillText(
      formatTime(
        getCurrentRecordingElapsed()
      ),
      x +
        height * 0.055,
      y +
        height * 0.027
    );

    ctx.restore();
  }

  function drawTeleprompterComposition(
    ctx,
    width,
    height
  ) {
    if (
      !includeTeleprompterInRecording ||
      !includeTeleprompterInRecording.checked
    ) {
      return;
    }

    if (
      !state.showTeleprompterRecording
    ) {
      return;
    }

    const text =
      teleprompterText?.value ||
      "";

    if (!text.trim()) {
      return;
    }

    const boxWidth =
      width * 0.88;

    const boxHeight =
      height * 0.17;

    const x =
      (width -
        boxWidth) /
      2;

    const y =
      height -
      boxHeight -
      height * 0.045;

    ctx.save();

    ctx.fillStyle =
      "rgba(0,0,0,.62)";

    roundRect(
      ctx,
      x,
      y,
      boxWidth,
      boxHeight,
      22
    );

    ctx.fill();

    ctx.beginPath();

    ctx.rect(
      x,
      y,
      boxWidth,
      boxHeight
    );

    ctx.clip();

    const fontSize =
      clamp(
        safeNumber(
          teleprompterFontSize?.value,
          38
        ),
        20,
        90
      );

    ctx.font =
      `600 ${fontSize}px Arial`;

    ctx.fillStyle =
      "rgba(255,255,255,.96)";

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "top";

    const words =
      text.trim().split(/\s+/);

    const lines = [];

    let line = "";

    const maxWidth =
      boxWidth -
      50;

    words.forEach((word) => {
      const test =
        line
          ? `${line} ${word}`
          : word;

      if (
        ctx.measureText(test)
          .width >
        maxWidth
      ) {
        if (line) {
          lines.push(line);
        }

        line = word;
      } else {
        line = test;
      }
    });

    if (line) {
      lines.push(line);
    }

    const lineHeight =
      fontSize * 1.3;

    let startY =
      y +
      boxHeight / 2 -
      (lines.length *
        lineHeight) /
        2;

    for (
      let i = 0;
      i < lines.length;
      i++
    ) {
      ctx.fillText(
        lines[i],
        width / 2,
        startY
      );

      startY += lineHeight;

      if (
        startY >
        y + boxHeight
      ) {
        break;
      }
    }

    ctx.restore();
  }

  function renderCompositionFrame() {
    if (
      !state.recordingCanvasContext
    ) {
      createRecordingCanvas();
    }

    const canvas =
      state.recordingCanvas;

    const ctx =
      state.recordingCanvasContext;

    if (!canvas || !ctx) {
      return;
    }

    const width =
      state.recordingWidth;

    const height =
      state.recordingHeight;

    drawMainComposition(
      ctx,
      width,
      height
    );

    drawMentorComposition(
      ctx,
      width,
      height
    );

    drawBrandBadgeComposition(
      ctx,
      width,
      height
    );

    drawTeleprompterComposition(
      ctx,
      width,
      height
    );

    drawRecordingOverlayComposition(
      ctx,
      width,
      height
    );
  }

  /* =======================================================
     CONTINUOUS RECORDING RENDER LOOP
     ======================================================= */

  function startRecordingRenderLoop() {
    if (
      state.recordingRenderActive
    ) {
      return;
    }

    state.recordingRenderActive =
      true;

    const loop = () => {
      if (
        !state.recordingRenderActive
      ) {
        return;
      }

      renderCompositionFrame();

      if (
        state.mentorSource ===
        "camera"
      ) {
        processCameraSegmentation();
      }

      state.recordingRenderFrame =
        requestAnimationFrame(
          loop
        );
    };

    loop();
  }

  function stopRecordingRenderLoop() {
    state.recordingRenderActive =
      false;

    if (state.recordingRenderFrame) {
      cancelAnimationFrame(
        state.recordingRenderFrame
      );

      state.recordingRenderFrame =
        0;
    }
  }

  /* =======================================================
     RECORDING TIMER
     ======================================================= */

  function getCurrentRecordingElapsed() {
    if (!state.recording) {
      return 0;
    }

    if (state.paused) {
      return (
        state.recordingElapsedBeforePause
      );
    }

    return (
      state.recordingElapsedBeforePause +
      (
        performance.now() -
        state.recordingStartedAt
      ) /
        1000
    );
  }

  function startRecordingTimer() {
    stopRecordingTimer();

    state.recordingTimerInterval =
      setInterval(() => {
        const elapsed =
          getCurrentRecordingElapsed();

        const formatted =
          formatTime(elapsed);

        if (recordingTimer) {
          recordingTimer.textContent =
            formatted;
        }

        if (
          recordingOverlayTimer
        ) {
          recordingOverlayTimer.textContent =
            formatted;
        }

        if (
          recordingCurrentTime &&
          recordingPreviewVideo
        ) {
          recordingCurrentTime.textContent =
            formatTime(
              recordingPreviewVideo.currentTime
            );
        }
      }, 200);
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

  /* =======================================================
     RECORDING UI
     ======================================================= */

  function updateRecordingUI() {
    const active =
      state.recording;

    if (recordingStatusBar) {
      recordingStatusBar.classList.toggle(
        "active",
        active
      );
    }

    if (recordingStatusDot) {
      recordingStatusDot.classList.toggle(
        "active",
        active
      );
    }

    if (recordingOverlay) {
      recordingOverlay.style.display =
        active
          ? ""
          : "none";
    }

    if (recordingStatusText) {
      if (!active) {
        recordingStatusText.textContent =
          "Ready";
      } else if (
        state.paused
      ) {
        recordingStatusText.textContent =
          "Paused";
      } else {
        recordingStatusText.textContent =
          "Recording";
      }
    }

    if (pauseRecordingBtn) {
      pauseRecordingBtn.disabled =
        !active ||
        state.paused;
    }

    if (resumeRecordingBtn) {
      resumeRecordingBtn.disabled =
        !active ||
        !state.paused;
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
  }

  /* =======================================================
     START RECORDING
     ======================================================= */

  async function startRecording() {
    if (state.recording) {
      return;
    }

    if (
      typeof MediaRecorder ===
      "undefined"
    ) {
      toast(
        "MediaRecorder is not supported.",
        "error"
      );
      return;
    }

    try {
      syncRecordingSettings();

      const ctx =
        await ensureAudioContext();

      if (!ctx) {
        return;
      }

      /*
        Main audio setup.
      */

      if (
        state.mainSource ===
        "video"
      ) {
        await setupMainVideoAudio();
      }

      /*
        Microphone setup if enabled.
      */

      if (
        micEnabled?.checked &&
        !state.micReady
      ) {
        await enableMicrophone();
      }

      const canvas =
        createRecordingCanvas();

      renderCompositionFrame();

      const canvasStream =
        canvas.captureStream(
          state.recordingFps
        );

      const finalStream =
        new MediaStream();

      canvasStream
        .getVideoTracks()
        .forEach((track) => {
          finalStream.addTrack(track);
        });

      if (
        state.mediaDestination
      ) {
        state.mediaDestination.stream
          .getAudioTracks()
          .forEach((track) => {
            finalStream.addTrack(track);
          });
      }

      /*
        Screen capture audio:
        add display audio only when
        available and not already routed.
      */

      if (
        state.screenStream
      ) {
        const screenAudioTracks =
          state.screenStream.getAudioTracks();

        screenAudioTracks.forEach(
          (track) => {
            if (
              !finalStream
                .getAudioTracks()
                .some(
                  (existing) =>
                    existing.id ===
                    track.id
                )
            ) {
              finalStream.addTrack(
                track
              );
            }
          }
        );
      }

      const mime =
        getSelectedRecordingMime();

      if (!mime) {
        toast(
          "No supported recording format found.",
          "error"
        );
        return;
      }

      const recorderOptions = {
        mimeType: mime,
        videoBitsPerSecond:
          getVideoBitrate(
            state.recordingWidth,
            state.recordingHeight,
            state.recordingFps
          )
      };

      let recorder;

      try {
        recorder =
          new MediaRecorder(
            finalStream,
            recorderOptions
          );
      } catch (error) {
        console.warn(
          "MediaRecorder options failed:",
          error
        );

        recorder =
          new MediaRecorder(
            finalStream,
            {
              mimeType: mime
            }
          );
      }

      state.mediaRecorder =
        recorder;

      state.recordingChunks =
        [];

      state.recordingMimeType =
        mime;

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

          toast(
            "Recording error occurred.",
            "error"
          );
        };

      recorder.onstop =
        async () => {
          await finishRecording();
        };

      recorder.onpause =
        () => {
          updateRecordingUI();
        };

      recorder.onresume =
        () => {
          updateRecordingUI();
        };

      recorder.start(1000);

      state.recording = true;
      state.paused = false;

      state.recordingStartedAt =
        performance.now();

      state.recordingElapsedBeforePause =
        0;

      state.audioReady = true;

      updateRecordingUI();
      updateAudioIndicator();

      startRecordingTimer();
      startRecordingRenderLoop();

      if (
        state.autoStartTeleprompter
      ) {
        startTeleprompter();
      }

      toast(
        `Recording started — ${state.recordingWidth}×${state.recordingHeight} @ ${state.recordingFps} FPS`,
        "success"
      );
    } catch (error) {
      console.error(
        "Start recording failed:",
        error
      );

      state.recording = false;

      updateRecordingUI();

      toast(
        `Could not start recording: ${error.message || "Unknown error"}`,
        "error",
        5000
      );
    }
  }

  function getVideoBitrate(
    width,
    height,
    fps
  ) {
    const pixels =
      width * height;

    if (pixels >= 2560 * 1440) {
      return 18_000_000;
    }

    if (pixels >= 1920 * 1080) {
      return 12_000_000;
    }

    return 7_000_000;
  }

  /* =======================================================
     PAUSE / RESUME
     ======================================================= */

  function pauseRecording() {
    if (
      !state.recording ||
      !state.mediaRecorder ||
      state.paused
    ) {
      return;
    }

    if (
      state.mediaRecorder.state !==
      "recording"
    ) {
      return;
    }

    state.recordingElapsedBeforePause =
      getCurrentRecordingElapsed();

    state.mediaRecorder.pause();

    state.paused = true;

    updateRecordingUI();

    toast(
      "Recording paused.",
      "info"
    );
  }

  function resumeRecording() {
    if (
      !state.recording ||
      !state.mediaRecorder ||
      !state.paused
    ) {
      return;
    }

    if (
      state.mediaRecorder.state !==
      "paused"
    ) {
      return;
    }

    state.recordingStartedAt =
      performance.now();

    state.mediaRecorder.resume();

    state.paused = false;

    updateRecordingUI();

    toast(
      "Recording resumed.",
      "success"
    );
  }

  /* =======================================================
     STOP RECORDING
     ======================================================= */

  function stopRecording() {
    if (
      !state.recording ||
      !state.mediaRecorder
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

      finishRecording();
    }
  }

  async function finishRecording() {
    stopRecordingTimer();
    stopRecordingRenderLoop();

    state.recording = false;
    state.paused = false;

    updateRecordingUI();

    const mime =
      state.recordingMimeType ||
      "video/webm";

    const blob =
      new Blob(
        state.recordingChunks,
        {
          type: mime
        }
      );

    state.recordingBlob =
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

    const duration =
      getRecordedDurationEstimate();

    const filename =
      sanitizeFilename(
        recordingFileNameSide?.value ||
          recordingFileName?.value ||
          timestampName()
      );

    const extension =
      getExtensionFromMime(
        mime
      );

    const finalName =
      filename.endsWith(
        `.${extension}`
      )
        ? filename
        : `${filename}.${extension}`;

    const id =
      `rec-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

    const metadata = {
      id,
      name: finalName,
      createdAt:
        new Date().toISOString(),
      duration,
      size: blob.size,
      mimeType: mime,
      width:
        state.recordingWidth,
      height:
        state.recordingHeight,
      fps:
        state.recordingFps
    };

    await saveRecordingBlob(
      id,
      blob
    );

    state.history.unshift(
      metadata
    );

    saveHistoryMetadata();

    state.previewRecordingId =
      id;

    await openRecordingPreview(
      metadata,
      blob
    );

    toast(
      "Recording completed.",
      "success"
    );
  }

  function getRecordedDurationEstimate() {
    const elapsed =
      state.recordingElapsedBeforePause +
      (
        state.recordingStartedAt
          ? (
              performance.now() -
              state.recordingStartedAt
            ) /
            1000
          : 0
      );

    return Math.max(
      0,
      elapsed
    );
  }

  /* =======================================================
     RECORDING PREVIEW
     ======================================================= */

  async function openRecordingPreview(
    metadata,
    blob
  ) {
    if (!recordingPreviewModal) {
      return;
    }

    state.previewRecordingId =
      metadata.id;

    state.recordingBlob =
      blob;

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

    if (recordingPreviewVideo) {
      recordingPreviewVideo.src =
        state.previewObjectUrl;

      recordingPreviewVideo.load();
    }

    if (recordingFileName) {
      recordingFileName.value =
        metadata.name;
    }

    if (recordingFileInfo) {
      recordingFileInfo.textContent =
        `${metadata.name} • ${formatBytes(
          metadata.size
        )} • ${metadata.width}×${metadata.height} • ${metadata.fps} FPS`;
    }

    state.previewDuration =
      metadata.duration || 0;

    state.previewTrimStart = 0;
    state.previewTrimEnd =
      state.previewDuration;

    if (recordingTrimStart) {
      recordingTrimStart.min =
        "0";

      recordingTrimStart.max =
        String(
          state.previewDuration
        );

      recordingTrimStart.value =
        "0";
    }

    if (recordingTrimEnd) {
      recordingTrimEnd.min =
        "0";

      recordingTrimEnd.max =
        String(
          state.previewDuration
        );

      recordingTrimEnd.value =
        String(
          state.previewDuration
        );
    }

    updateTrimLabels();

    if (recordingDuration) {
      recordingDuration.textContent =
        formatTime(
          state.previewDuration
        );
    }

    if (recordingCurrentTime) {
      recordingCurrentTime.textContent =
        "00:00";
    }

    openModal(
      recordingPreviewModal
    );

    setTimeout(() => {
      if (
        recordingPreviewVideo
      ) {
        recordingPreviewVideo
          .play()
          .catch(() => {});
      }
    }, 150);
  }

  function updateTrimLabels() {
    if (
      recordingTrimStartTime
    ) {
      recordingTrimStartTime.textContent =
        formatTime(
          safeNumber(
            recordingTrimStart?.value,
            0
          )
        );
    }

    if (
      recordingTrimEndTime
    ) {
      recordingTrimEndTime.textContent =
        formatTime(
          safeNumber(
            recordingTrimEnd?.value,
            state.previewDuration
          )
        );
    }
  }

  function previewPlay() {
    recordingPreviewVideo
      ?.play()
      .catch(() => {});
  }

  function previewPause() {
    recordingPreviewVideo?.pause();
  }

  function resetTrim() {
    state.previewTrimStart =
      0;

    state.previewTrimEnd =
      state.previewDuration;

    if (recordingTrimStart) {
      recordingTrimStart.value =
        "0";
    }

    if (recordingTrimEnd) {
      recordingTrimEnd.value =
        String(
          state.previewDuration
        );
    }

    updateTrimLabels();

    if (
      recordingPreviewVideo
    ) {
      recordingPreviewVideo.currentTime =
        0;
    }

    toast(
      "Trim selection reset.",
      "info"
    );
  }

  /*
    Important:
    MediaRecorder cannot physically cut an
    existing WebM/MP4 Blob without re-encoding.

    Therefore this function validates the
    trim range and prepares the selected range.
    The actual physical trim uses a new
    MediaRecorder pass where supported.
  */

  async function applyTrim() {
    if (
      !state.recordingBlob ||
      !recordingPreviewVideo
    ) {
      return;
    }

    const start =
      safeNumber(
        recordingTrimStart?.value,
        0
      );

    const end =
      safeNumber(
        recordingTrimEnd?.value,
        state.previewDuration
      );

    if (
      start < 0 ||
      end <= start ||
      end > state.previewDuration
    ) {
      toast(
        "Please select a valid trim range.",
        "error"
      );
      return;
    }

    /*
      For a professional editor, actual
      trimming requires re-encoding.

      We implement a browser-side
      re-recording pipeline for the video
      canvas. Audio preservation is not
      guaranteed across all browsers.
    */

    toast(
      "Preparing trimmed recording…",
      "info",
      4000
    );

    try {
      const trimmedBlob =
        await reencodeTrimmedRecording(
          state.recordingBlob,
          start,
          end
        );

      if (!trimmedBlob) {
        throw new Error(
          "Trim re-encoding unavailable."
        );
      }

      state.recordingBlob =
        trimmedBlob;

      if (
        state.previewObjectUrl
      ) {
        URL.revokeObjectURL(
          state.previewObjectUrl
        );
      }

      state.previewObjectUrl =
        URL.createObjectURL(
          trimmedBlob
        );

      if (
        recordingPreviewVideo
      ) {
        recordingPreviewVideo.src =
          state.previewObjectUrl;

        recordingPreviewVideo.load();
      }

      const metadata =
        state.history.find(
          (item) =>
            item.id ===
            state.previewRecordingId
        );

      if (metadata) {
        metadata.duration =
          end - start;

        metadata.size =
          trimmedBlob.size;

        await saveRecordingBlob(
          metadata.id,
          trimmedBlob
        );

        saveHistoryMetadata();

        if (recordingFileInfo) {
          recordingFileInfo.textContent =
            `${metadata.name} • ${formatBytes(
              metadata.size
            )} • ${metadata.width}×${metadata.height} • ${metadata.fps} FPS`;
        }
      }

      state.previewDuration =
        end - start;

      state.previewTrimStart = 0;
      state.previewTrimEnd =
        state.previewDuration;

      if (recordingTrimStart) {
        recordingTrimStart.value =
          "0";
      }

      if (recordingTrimEnd) {
        recordingTrimEnd.value =
          String(
            state.previewDuration
          );
      }

      updateTrimLabels();

      if (recordingDuration) {
        recordingDuration.textContent =
          formatTime(
            state.previewDuration
          );
      }

      toast(
        "Trim applied.",
        "success"
      );
    } catch (error) {
      console.warn(
        "Trim failed:",
        error
      );

      toast(
        "Browser could not re-encode this recording. The original recording is still safe.",
        "error",
        5000
      );
    }
  }

  async function reencodeTrimmedRecording(
    blob,
    start,
    end
  ) {
    /*
      Browser-only fallback.

      We use an offscreen video element,
      canvas captureStream and MediaRecorder.

      Audio support varies by browser.
      The original file remains untouched
      if the operation fails.
    */

    const url =
      URL.createObjectURL(
        blob
      );

    const video =
      document.createElement(
        "video"
      );

    video.src =
      url;

    video.muted = true;
    video.playsInline = true;

    await new Promise(
      (resolve, reject) => {
        video.onloadedmetadata =
          resolve;

        video.onerror =
          () =>
            reject(
              new Error(
                "Video metadata failed."
              )
            );

        video.load();
      }
    );

    const width =
      video.videoWidth ||
      state.recordingWidth;

    const height =
      video.videoHeight ||
      state.recordingHeight;

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      width;

    canvas.height =
      height;

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
      getSelectedRecordingMime();

    if (!mime) {
      URL.revokeObjectURL(
        url
      );

      return null;
    }

    let recorder;

    try {
      recorder =
        new MediaRecorder(
          stream,
          {
            mimeType: mime,
            videoBitsPerSecond:
              getVideoBitrate(
                width,
                height,
                fps
              )
          }
        );
    } catch (_) {
      recorder =
        new MediaRecorder(
          stream
        );
    }

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

    recorder.start(1000);

    video.currentTime =
      start;

    await video.play();

    await new Promise(
      (resolve) => {
        let raf = 0;

        const draw = () => {
          if (
            video.currentTime >=
            end
          ) {
            cancelAnimationFrame(
              raf
            );

            video.pause();

            try {
              recorder.stop();
            } catch (_) {}

            resolve();

            return;
          }

          ctx.drawImage(
            video,
            0,
            0,
            width,
            height
          );

          raf =
            requestAnimationFrame(
              draw
            );
        };

        draw();
      }
    );

    await stopped;

    URL.revokeObjectURL(
      url
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

  /* =======================================================
     DOWNLOAD
     ======================================================= */

  async function downloadCurrentRecording() {
    if (
      !state.recordingBlob
    ) {
      toast(
        "No recording available.",
        "error"
      );
      return;
    }

    const metadata =
      state.history.find(
        (item) =>
          item.id ===
          state.previewRecordingId
      );

    const fallbackName =
      timestampName();

    let filename =
      metadata?.name ||
      recordingFileName?.value ||
      fallbackName;

    const extension =
      getExtensionFromMime(
        state.recordingBlob.type
      );

    filename =
      sanitizeFilename(
        filename
      );

    if (
      !filename.toLowerCase().endsWith(
        `.${extension}`
      )
    ) {
      filename +=
        `.${extension}`;
    }

    const url =
      URL.createObjectURL(
        state.recordingBlob
      );

    const a =
      document.createElement(
        "a"
      );

    a.href = url;
    a.download =
      filename;

    document.body.appendChild(
      a
    );

    a.click();

    a.remove();

    setTimeout(() => {
      URL.revokeObjectURL(
        url
      );
    }, 1000);

    toast(
      "Download started.",
      "success"
    );
  }

  /* =======================================================
     RENAME
     ======================================================= */

  async function renameCurrentRecording() {
    if (
      !state.previewRecordingId
    ) {
      return;
    }

    const metadata =
      state.history.find(
        (item) =>
          item.id ===
          state.previewRecordingId
      );

    if (!metadata) {
      return;
    }

    let newName =
      recordingFileName?.value ||
      metadata.name;

    newName =
      sanitizeFilename(
        newName
      );

    const extension =
      getExtensionFromMime(
        metadata.mimeType
      );

    if (
      !newName.toLowerCase().endsWith(
        `.${extension}`
      )
    ) {
      newName +=
        `.${extension}`;
    }

    metadata.name =
      newName;

    if (recordingFileName) {
      recordingFileName.value =
        newName;
    }

    saveHistoryMetadata();

    renderRecordingHistory();

    if (recordingFileInfo) {
      recordingFileInfo.textContent =
        `${metadata.name} • ${formatBytes(
          metadata.size
        )} • ${metadata.width}×${metadata.height} • ${metadata.fps} FPS`;
    }

    toast(
      "Recording renamed.",
      "success"
    );
  }

  /* =======================================================
     DELETE RECORDING
     ======================================================= */

  async function deleteCurrentRecording() {
    if (
      !state.previewRecordingId
    ) {
      return;
    }

    const id =
      state.previewRecordingId;

    try {
      await deleteRecordingBlob(
        id
      );
    } catch (error) {
      console.warn(
        "Blob delete failed:",
        error
      );
    }

    state.history =
      state.history.filter(
        (item) =>
          item.id !== id
      );

    saveHistoryMetadata();

    state.previewRecordingId =
      null;

    state.recordingBlob =
      null;

    if (
      state.previewObjectUrl
    ) {
      URL.revokeObjectURL(
        state.previewObjectUrl
      );

      state.previewObjectUrl =
        "";
    }

    if (recordingPreviewVideo) {
      recordingPreviewVideo.removeAttribute(
        "src"
      );

      recordingPreviewVideo.load();
    }

    closeModal(
      recordingPreviewModal
    );

    renderRecordingHistory();

    toast(
      "Recording deleted.",
      "success"
    );
  }

  /* =======================================================
     RECORD AGAIN
     ======================================================= */

  function recordAgain() {
    closeModal(
      recordingPreviewModal
    );

    setTimeout(() => {
      startRecording();
    }, 200);
  }

  /* =======================================================
     INDEXED DB
     ======================================================= */

  let dbPromise = null;

  function openDatabase() {
    if (dbPromise) {
      return dbPromise;
    }

    dbPromise =
      new Promise(
        (resolve, reject) => {
          if (
            !window.indexedDB
          ) {
            reject(
              new Error(
                "IndexedDB unavailable."
              )
            );

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
                  STORE_NAME
                )
              ) {
                db.createObjectStore(
                  STORE_NAME
                );
              }
            };

          request.onsuccess =
            () =>
              resolve(
                request.result
              );

          request.onerror =
            () =>
              reject(
                request.error
              );
        }
      );

    return dbPromise;
  }

  async function saveRecordingBlob(
    id,
    blob
  ) {
    try {
      const db =
        await openDatabase();

      await new Promise(
        (resolve, reject) => {
          const tx =
            db.transaction(
              STORE_NAME,
              "readwrite"
            );

          tx.objectStore(
            STORE_NAME
          ).put(
            blob,
            id
          );

          tx.oncomplete =
            resolve;

          tx.onerror =
            () =>
              reject(
                tx.error
              );
        }
      );
    } catch (error) {
      console.warn(
        "IndexedDB save failed:",
        error
      );
    }
  }

  async function getRecordingBlob(
    id
  ) {
    try {
      const db =
        await openDatabase();

      return await new Promise(
        (resolve, reject) => {
          const tx =
            db.transaction(
              STORE_NAME,
              "readonly"
            );

          const request =
            tx.objectStore(
              STORE_NAME
            ).get(id);

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
    } catch (error) {
      console.warn(
        "IndexedDB read failed:",
        error
      );

      return null;
    }
  }

  async function deleteRecordingBlob(
    id
  ) {
    try {
      const db =
        await openDatabase();

      await new Promise(
        (resolve, reject) => {
          const tx =
            db.transaction(
              STORE_NAME,
              "readwrite"
            );

          tx.objectStore(
            STORE_NAME
          ).delete(id);

          tx.oncomplete =
            resolve;

          tx.onerror =
            () =>
              reject(
                tx.error
              );
        }
      );
    } catch (error) {
      console.warn(
        "IndexedDB delete failed:",
        error
      );
    }
  }

  async function clearRecordingBlobs() {
    try {
      const db =
        await openDatabase();

      await new Promise(
        (resolve, reject) => {
          const tx =
            db.transaction(
              STORE_NAME,
              "readwrite"
            );

          tx.objectStore(
            STORE_NAME
          ).clear();

          tx.oncomplete =
            resolve;

          tx.onerror =
            () =>
              reject(
                tx.error
              );
        }
      );
    } catch (error) {
      console.warn(
        "IndexedDB clear failed:",
        error
      );
    }
  }

  /* =======================================================
     HISTORY
     ======================================================= */

  function saveHistoryMetadata() {
    try {
      localStorage.setItem(
        HISTORY_STORAGE_KEY,
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

  async function loadHistoryMetadata() {
    try {
      const raw =
        localStorage.getItem(
          HISTORY_STORAGE_KEY
        );

      if (!raw) {
        state.history = [];
        return;
      }

      const parsed =
        JSON.parse(raw);

      if (
        Array.isArray(parsed)
      ) {
        state.history =
          parsed;
      }
    } catch (error) {
      console.warn(
        "History load failed:",
        error
      );

      state.history = [];
    }
  }

  function renderRecordingHistory() {
    if (!recordingHistoryList) {
      return;
    }

    recordingHistoryList.innerHTML =
      "";

    if (!state.history.length) {
      recordingHistoryList.innerHTML = `
        <div class="empty-history">
          No recordings yet.
        </div>
      `;

      return;
    }

    state.history.forEach(
      (recording) => {
        const item =
          document.createElement(
            "div"
          );

        item.className =
          "recording-history-item";

        item.dataset.id =
          recording.id;

        const date =
          new Date(
            recording.createdAt
          );

        item.innerHTML = `
          <div class="recording-history-main">
            <div class="recording-history-title"></div>

            <div class="recording-history-meta">
              <span>${formatTime(
                recording.duration || 0
              )}</span>
              <span>${formatBytes(
                recording.size || 0
              )}</span>
              <span>${recording.width || 0}×${recording.height || 0}</span>
              <span>${recording.fps || 0} FPS</span>
            </div>

            <div class="recording-history-date">
              ${date.toLocaleString()}
            </div>
          </div>

          <div class="recording-history-actions">
            <button
              type="button"
              class="history-preview"
              data-action="preview"
            >
              Preview
            </button>

            <button
              type="button"
              class="history-download"
              data-action="download"
            >
              Download
            </button>

            <button
              type="button"
              class="history-delete"
              data-action="delete"
            >
              Delete
            </button>
          </div>
        `;

        const title =
          $(".recording-history-title", item);

        if (title) {
          title.textContent =
            recording.name;
        }

        recordingHistoryList.appendChild(
          item
        );
      }
    );
  }

  async function previewHistoryRecording(
    id
  ) {
    const metadata =
      state.history.find(
        (item) =>
          item.id === id
      );

    if (!metadata) {
      return;
    }

    const blob =
      await getRecordingBlob(
        id
      );

    if (!blob) {
      toast(
        "Recording file is not available.",
        "error"
      );
      return;
    }

    await openRecordingPreview(
      metadata,
      blob
    );
  }

  async function downloadHistoryRecording(
    id
  ) {
    const metadata =
      state.history.find(
        (item) =>
          item.id === id
      );

    if (!metadata) {
      return;
    }

    const blob =
      await getRecordingBlob(
        id
      );

    if (!blob) {
      toast(
        "Recording file is not available.",
        "error"
      );
      return;
    }

    const url =
      URL.createObjectURL(
        blob
      );

    const a =
      document.createElement(
        "a"
      );

    a.href = url;

    a.download =
      metadata.name ||
      `recording.${getExtensionFromMime(
        metadata.mimeType
      )}`;

    document.body.appendChild(
      a
    );

    a.click();

    a.remove();

    setTimeout(() => {
      URL.revokeObjectURL(
        url
      );
    }, 1000);
  }

  async function deleteHistoryRecording(
    id
  ) {
    await deleteRecordingBlob(
      id
    );

    state.history =
      state.history.filter(
        (item) =>
          item.id !== id
      );

    saveHistoryMetadata();

    if (
      state.previewRecordingId ===
      id
    ) {
      state.previewRecordingId =
        null;

      closeModal(
        recordingPreviewModal
      );
    }

    renderRecordingHistory();

    toast(
      "Recording deleted.",
      "success"
    );
  }

  async function clearRecordingHistory() {
    if (!state.history.length) {
      return;
    }

    const confirmed =
      window.confirm(
        "Delete all recording history?"
      );

    if (!confirmed) {
      return;
    }

    await clearRecordingBlobs();

    state.history = [];

    saveHistoryMetadata();

    renderRecordingHistory();

    toast(
      "Recording history cleared.",
      "success"
    );
  }

  /* =======================================================
     TELEPROMPTER
     ======================================================= */

  function updateTeleprompterPreview() {
    if (!teleprompterPreview) {
      return;
    }

    teleprompterPreview.textContent =
      teleprompterText?.value ||
      "Your teleprompter text will appear here.";

    const fontSize =
      clamp(
        safeNumber(
          teleprompterFontSize?.value,
          36
        ),
        18,
        100
      );

    const opacity =
      clamp(
        safeNumber(
          teleprompterOpacity?.value,
          90
        ),
        0,
        100
      );

    teleprompterPreview.style.fontSize =
      `${fontSize}px`;

    teleprompterPreview.style.opacity =
      String(
        opacity / 100
      );
  }

  function updateTeleprompterMiniPreview() {
    if (!teleprompterMiniPreview) {
      return;
    }

    const text =
      teleprompterText?.value ||
      "";

    teleprompterMiniPreview.textContent =
      text.trim()
        ? text.slice(0, 220)
        : "No teleprompter text.";
  }

  function openTeleprompter() {
    updateTeleprompterPreview();
    updateTeleprompterMiniPreview();

    openModal(
      teleprompterModal
    );
  }

  function startTeleprompter() {
    if (
      !teleprompterText?.value.trim()
    ) {
      return;
    }

    state.teleprompterPlaying =
      true;

    state.teleprompterLastTime =
      performance.now();

    teleprompterPlayBtn?.classList.add(
      "active"
    );

    teleprompterPauseBtn?.classList.remove(
      "active"
    );

    requestTeleprompterLoop();
  }

  function pauseTeleprompter() {
    state.teleprompterPlaying =
      false;

    teleprompterPauseBtn?.classList.add(
      "active"
    );

    teleprompterPlayBtn?.classList.remove(
      "active"
    );
  }

  function requestTeleprompterLoop() {
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
      clamp(
        safeNumber(
          teleprompterSpeed?.value,
          20
        ),
        1,
        100
      );

    state.teleprompterOffset +=
      (speed / 1000) *
      delta;

    if (
      teleprompterPreview
    ) {
      teleprompterPreview.scrollTop =
        state.teleprompterOffset;
    }

    requestAnimationFrame(
      requestTeleprompterLoop
    );
  }

  function resetTeleprompter() {
    state.teleprompterPlaying =
      false;

    state.teleprompterOffset =
      0;

    if (
      teleprompterPreview
    ) {
      teleprompterPreview.scrollTop =
        0;
    }

    if (teleprompterPauseBtn) {
      teleprompterPauseBtn.classList.add(
        "active"
      );
    }

    if (teleprompterPlayBtn) {
      teleprompterPlayBtn.classList.remove(
        "active"
      );
    }
  }

  function saveTeleprompter() {
    try {
      localStorage.setItem(
        "snkMentorStudioTeleprompter",
        teleprompterText?.value ||
          ""
      );

      localStorage.setItem(
        "snkMentorStudioTeleprompterSpeed",
        teleprompterSpeed?.value ||
          "20"
      );

      localStorage.setItem(
        "snkMentorStudioTeleprompterFont",
        teleprompterFontSize?.value ||
          "36"
      );

      localStorage.setItem(
        "snkMentorStudioTeleprompterOpacity",
        teleprompterOpacity?.value ||
          "90"
      );

      updateTeleprompterPreview();
      updateTeleprompterMiniPreview();

      toast(
        "Teleprompter saved.",
        "success"
      );
    } catch (error) {
      console.warn(
        "Teleprompter save failed:",
        error
      );
    }
  }

  function loadTeleprompter() {
    try {
      const text =
        localStorage.getItem(
          "snkMentorStudioTeleprompter"
        );

      const speed =
        localStorage.getItem(
          "snkMentorStudioTeleprompterSpeed"
        );

      const font =
        localStorage.getItem(
          "snkMentorStudioTeleprompterFont"
        );

      const opacity =
        localStorage.getItem(
          "snkMentorStudioTeleprompterOpacity"
        );

      if (
        teleprompterText &&
        text !== null
      ) {
        teleprompterText.value =
          text;
      }

      if (
        teleprompterSpeed &&
        speed !== null
      ) {
        teleprompterSpeed.value =
          speed;
      }

      if (
        teleprompterFontSize &&
        font !== null
      ) {
        teleprompterFontSize.value =
          font;
      }

      if (
        teleprompterOpacity &&
        opacity !== null
      ) {
        teleprompterOpacity.value =
          opacity;
      }
    } catch (error) {
      console.warn(
        "Teleprompter load failed:",
        error
      );
    }

    updateTeleprompterPreview();
    updateTeleprompterMiniPreview();
  }

  function uploadTeleprompterFile(
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
      toast(
        "Please select a TXT file.",
        "error"
      );
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      if (teleprompterText) {
        teleprompterText.value =
          String(
            reader.result || ""
          );
      }

      updateTeleprompterPreview();
      updateTeleprompterMiniPreview();

      toast(
        "Teleprompter text loaded.",
        "success"
      );
    };

    reader.readAsText(
      file,
      "UTF-8"
    );
  }

  /* =======================================================
     STUDENTS
     ======================================================= */

  function renderStudents() {
    if (!studentsList) {
      return;
    }

    studentsList.innerHTML =
      "";

    if (!state.students.length) {
      studentsList.innerHTML = `
        <div class="empty-students">
          No students added.
        </div>
      `;

      return;
    }

    state.students.forEach(
      (student) => {
        const item =
          document.createElement(
            "div"
          );

        item.className =
          "student-item";

        item.dataset.id =
          student.id;

        item.innerHTML = `
          <div class="student-avatar"></div>

          <div class="student-info">
            <div class="student-name"></div>
            <div class="student-status">
              Online
            </div>
          </div>

          <button
            type="button"
            class="student-remove"
            aria-label="Remove student"
          >
            ×
          </button>
        `;

        const avatar =
          $(".student-avatar", item);

        if (avatar) {
          avatar.textContent =
            String(
              student.name ||
                "S"
            )
              .trim()
              .charAt(0)
              .toUpperCase();
        }

        const name =
          $(".student-name", item);

        if (name) {
          name.textContent =
            student.name;
        }

        studentsList.appendChild(
          item
        );
      }
    );
  }

  function openStudentModal() {
    state.studentEditingId =
      null;

    if (studentNameInput) {
      studentNameInput.value =
        "";
    }

    openModal(
      studentModal
    );

    setTimeout(() => {
      studentNameInput?.focus();
    }, 100);
  }

  function saveStudent() {
    const name =
      studentNameInput?.value.trim();

    if (!name) {
      toast(
        "Enter student name.",
        "error"
      );
      return;
    }

    const student = {
      id:
        `student-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 6)}`,
      name
    };

    state.students.push(
      student
    );

    saveStudents();
    renderStudents();

    closeModal(
      studentModal
    );

    toast(
      "Student added.",
      "success"
    );
  }

  function removeStudent(id) {
    state.students =
      state.students.filter(
        (student) =>
          student.id !== id
      );

    saveStudents();
    renderStudents();

    toast(
      "Student removed.",
      "success"
    );
  }

  /* =======================================================
     FULLSCREEN
     ======================================================= */

  async function fullscreenStage() {
    if (!stageShell) {
      return;
    }

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
        "Fullscreen is not available.",
        "error"
      );
    }
  }

  async function fullscreenStudio() {
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

      toast(
        "Fullscreen is not available.",
        "error"
      );
    }
  }

  /* =======================================================
     STAGE BADGE
     ======================================================= */

  function updateStageSourceBadge(
    source
  ) {
    if (stageSourceBadge) {
      stageSourceBadge.textContent =
        source;
    }
  }

  /* =======================================================
     SETTINGS
     ======================================================= */

  function openSettings() {
    applySettingsToUI();
    openModal(
      settingsModal
    );
  }

  function saveSettingsFromModal() {
    if (brandNameInput) {
      state.brandName =
        brandNameInput.value.trim() ||
        "SNK Mentor Studio";
    }

    if (
      settingsAutoStartTeleprompter
    ) {
      state.autoStartTeleprompter =
        settingsAutoStartTeleprompter.checked;
    }

    if (
      settingsShowTeleprompterRecording
    ) {
      state.showTeleprompterRecording =
        settingsShowTeleprompterRecording.checked;
    }

    if (
      settingsRecordingQuality
    ) {
      const value =
        settingsRecordingQuality.value;

      if (recordingQualitySide) {
        recordingQualitySide.value =
          value;
      }

      if (recordingQuality) {
        recordingQuality.value =
          value;
      }
    }

    if (
      settingsRecordingFps
    ) {
      const value =
        settingsRecordingFps.value;

      if (recordingFpsSide) {
        recordingFpsSide.value =
          value;
      }

      if (recordingFps) {
        recordingFps.value =
          value;
      }
    }

    saveSettings();

    syncRecordingSettings();
    applySettingsToUI();

    closeModal(
      settingsModal
    );

    toast(
      "Settings saved.",
      "success"
    );
  }

  /* =======================================================
     KEYBOARD SHORTCUTS
     ======================================================= */

  function handleKeyboardShortcuts(
    event
  ) {
    const target =
      event.target;

    const isTyping =
      target &&
      (
        target.tagName ===
          "INPUT" ||
        target.tagName ===
          "TEXTAREA" ||
        target.isContentEditable
      );

    if (
      isTyping &&
      event.key !== "Escape"
    ) {
      return;
    }

    if (
      event.key === "Escape"
    ) {
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

      if (
        document.fullscreenElement
      ) {
        document.exitFullscreen()
          .catch(() => {});
      }

      return;
    }

    if (
      event.code === "Space"
    ) {
      event.preventDefault();

      if (
        state.recording
      ) {
        if (state.paused) {
          resumeRecording();
        } else {
          pauseRecording();
        }
      } else if (
        state.mainSource ===
        "video"
      ) {
        if (
          mainVideo?.paused
        ) {
          playMainVideo();
        } else {
          pauseMainVideo();
        }
      }

      return;
    }

    const key =
      String(
        event.key
      ).toLowerCase();

    if (key === "r") {
      event.preventDefault();

      if (!state.recording) {
        startRecording();
      }

      return;
    }

    if (key === "p") {
      event.preventDefault();

      if (state.recording) {
        if (state.paused) {
          resumeRecording();
        } else {
          pauseRecording();
        }
      }

      return;
    }

    if (key === "s") {
      event.preventDefault();

      if (state.recording) {
        stopRecording();
      }

      return;
    }

    if (key === "f") {
      event.preventDefault();

      fullscreenStage();

      return;
    }
  }

  /* =======================================================
     FILE INPUTS
     ======================================================= */

  function bindFileInput(
    input,
    handler
  ) {
    if (!input) {
      return;
    }

    input.addEventListener(
      "change",
      () => {
        const file =
          input.files?.[0];

        if (file) {
          handler(file);
        }

        input.value = "";
      }
    );
  }

  /* =======================================================
     EVENTS
     ======================================================= */

  function bindEvents() {
    /* Main */

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

    mainPlayBtn?.addEventListener(
      "click",
      playMainVideo
    );

    mainPauseBtn?.addEventListener(
      "click",
      pauseMainVideo
    );

    /* Mentor */

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

    uploadMentorFileSideBtn?.addEventListener(
      "click",
      () =>
        mentorFileInput?.click()
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
          cameraDeviceSelect.value ||
          "";

        if (
          state.mentorSource ===
          "camera"
        ) {
          await startCamera();
        }
      }
    );

    cameraQuality?.addEventListener(
      "change",
      async () => {
        if (
          state.mentorSource ===
          "camera"
        ) {
          await startCamera();
        }
      }
    );

    cameraFps?.addEventListener(
      "change",
      async () => {
        if (
          state.mentorSource ===
          "camera"
        ) {
          await startCamera();
        }
      }
    );

    /* Background */

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
          "custom"
        );

        backgroundImageUpload?.click();
      }
    );

    bgColorBtn?.addEventListener(
      "click",
      () =>
        setBackgroundMode(
          "solid"
        )
    );

    backgroundColor?.addEventListener(
      "input",
      renderCompositionFrame
    );

    uploadBackgroundSideBtn?.addEventListener(
      "click",
      () => {
        setBackgroundMode(
          "custom"
        );

        backgroundImageUpload?.click();
      }
    );

    /* Screen */

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

    /* Audio */

    mainVideoAudioCheckbox?.addEventListener(
      "change",
      async () => {
        await setupMainVideoAudio();
        updateMainAudioGraph();
      }
    );

    mainVideoVolume?.addEventListener(
      "input",
      async () => {
        await setupMainVideoAudio();
        updateMainAudioGraph();
      }
    );

    micEnabled?.addEventListener(
      "change",
      async () => {
        if (
          micEnabled.checked
        ) {
          if (!state.micReady) {
            await enableMicrophone();
          }

          updateMicGraph();
        } else {
          stopMicrophone(true);
        }

        updateAudioIndicator();
      }
    );

    micVolume?.addEventListener(
      "input",
      () =>
        updateMicGraph()
    );

    micMonitor?.addEventListener(
      "change",
      () =>
        updateMicMonitoring()
    );

    /* Teleprompter */

    openTeleprompterBtn?.addEventListener(
      "click",
      openTeleprompter
    );

    openTeleprompterTopBtn?.addEventListener(
      "click",
      openTeleprompter
    );

    openTeleprompterSide?.addEventListener(
      "click",
      openTeleprompter
    );

    uploadTeleprompterBtn?.addEventListener(
      "click",
      () =>
        teleprompterFileInput?.click()
    );

    teleprompterText?.addEventListener(
      "input",
      () => {
        updateTeleprompterPreview();
        updateTeleprompterMiniPreview();
      }
    );

    teleprompterSpeed?.addEventListener(
      "input",
      updateTeleprompterPreview
    );

    teleprompterFontSize?.addEventListener(
      "input",
      updateTeleprompterPreview
    );

    teleprompterOpacity?.addEventListener(
      "input",
      updateTeleprompterPreview
    );

    teleprompterResetBtn?.addEventListener(
      "click",
      resetTeleprompter
    );

    teleprompterPauseBtn?.addEventListener(
      "click",
      pauseTeleprompter
    );

    teleprompterPlayBtn?.addEventListener(
      "click",
      startTeleprompter
    );

    teleprompterSaveBtn?.addEventListener(
      "click",
      saveTeleprompter
    );

    /* Recording */

    recordBtn?.addEventListener(
      "click",
      () => {
        if (!state.recording) {
          startRecording();
        } else if (
          state.paused
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
        if (!state.recording) {
          startRecording();
        } else if (
          state.paused
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

    recordingQuality?.addEventListener(
      "change",
      syncRecordingSettings
    );

    recordingFps?.addEventListener(
      "change",
      syncRecordingSettings
    );

    recordingFormat?.addEventListener(
      "change",
      () => {
        const mime =
          getSelectedRecordingMime();

        if (
          recordingFormat.value ===
            "mp4" &&
          !mime.includes("mp4")
        ) {
          toast(
            "MP4 is not supported by this browser. WebM will be used.",
            "error",
            4500
          );
        }
      }
    );

    recordingQualitySide?.addEventListener(
      "change",
      () => {
        if (recordingQuality) {
          recordingQuality.value =
            recordingQualitySide.value;
        }

        syncRecordingSettings();
      }
    );

    recordingFpsSide?.addEventListener(
      "change",
      () => {
        if (recordingFps) {
          recordingFps.value =
            recordingFpsSide.value;
        }

        syncRecordingSettings();
      }
    );

    recordingFormatSide?.addEventListener(
      "change",
      () => {
        if (recordingFormat) {
          recordingFormat.value =
            recordingFormatSide.value;
        }
      }
    );

    recordingFileNameSide?.addEventListener(
      "input",
      () => {
        if (
          recordingFileName
        ) {
          recordingFileName.value =
            recordingFileNameSide.value;
        }
      }
    );

    /* Fullscreen */

    fullscreenStageBtn?.addEventListener(
      "click",
      fullscreenStage
    );

    fullscreenStudioBtn?.addEventListener(
      "click",
      fullscreenStudio
    );

    /* Settings */

    settingsBtn?.addEventListener(
      "click",
      openSettings
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
      saveSettingsFromModal
    );

    /* Shortcuts */

    openShortcutsBtn?.addEventListener(
      "click",
      () =>
        openModal(
          shortcutsModal
        )
    );

    closeShortcutsModalBtn?.addEventListener(
      "click",
      () =>
        closeModal(
          shortcutsModal
        )
    );

    /* Recording Preview */

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
      "loadedmetadata",
      () => {
        state.previewDuration =
          recordingPreviewVideo.duration ||
          state.previewDuration;

        if (recordingDuration) {
          recordingDuration.textContent =
            formatTime(
              state.previewDuration
            );
        }

        if (recordingTrimEnd) {
          recordingTrimEnd.max =
            String(
              state.previewDuration
            );

          recordingTrimEnd.value =
            String(
              state.previewDuration
            );
        }

        updateTrimLabels();
      }
    );

    recordingPreviewVideo?.addEventListener(
      "timeupdate",
      () => {
        if (
          recordingCurrentTime
        ) {
          recordingCurrentTime.textContent =
            formatTime(
              recordingPreviewVideo.currentTime
            );
        }
      }
    );

    recordingTrimStart?.addEventListener(
      "input",
      () => {
        let value =
          safeNumber(
            recordingTrimStart.value,
            0
          );

        const end =
          safeNumber(
            recordingTrimEnd?.value,
            state.previewDuration
          );

        value =
          clamp(
            value,
            0,
            Math.max(
              0,
              end - 0.1
            )
          );

        recordingTrimStart.value =
          String(value);

        state.previewTrimStart =
          value;

        updateTrimLabels();

        if (
          recordingPreviewVideo
        ) {
          recordingPreviewVideo.currentTime =
            value;
        }
      }
    );

    recordingTrimEnd?.addEventListener(
      "input",
      () => {
        let value =
          safeNumber(
            recordingTrimEnd.value,
            state.previewDuration
          );

        const start =
          safeNumber(
            recordingTrimStart?.value,
            0
          );

        value =
          clamp(
            value,
            Math.min(
              state.previewDuration,
              start + 0.1
            ),
            state.previewDuration
          );

        recordingTrimEnd.value =
          String(value);

        state.previewTrimEnd =
          value;

        updateTrimLabels();

        if (
          recordingPreviewVideo
        ) {
          recordingPreviewVideo.currentTime =
            value;
        }
      }
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
      deleteCurrentRecording
    );

    recordAgainBtn?.addEventListener(
      "click",
      recordAgain
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
            "[data-action]"
          );

        if (!button) {
          return;
        }

        const item =
          button.closest(
            ".recording-history-item"
          );

        if (!item) {
          return;
        }

        const id =
          item.dataset.id;

        const action =
          button.dataset.action;

        if (
          action ===
          "preview"
        ) {
          await previewHistoryRecording(
            id
          );
        }

        if (
          action ===
          "download"
        ) {
          await downloadHistoryRecording(
            id
          );
        }

        if (
          action ===
          "delete"
        ) {
          await deleteHistoryRecording(
            id
          );
        }
      }
    );

    /* Students */

    addStudentBtn?.addEventListener(
      "click",
      openStudentModal
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
      saveStudent
    );

    studentsList?.addEventListener(
      "click",
      (event) => {
        const button =
          event.target.closest(
            ".student-remove"
          );

        if (!button) {
          return;
        }

        const item =
          button.closest(
            ".student-item"
          );

        if (!item) {
          return;
        }

        removeStudent(
          item.dataset.id
        );
      }
    );

    /* Modal backdrop */

    $$(".modal").forEach(
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

    /* Keyboard */

    document.addEventListener(
      "keydown",
      handleKeyboardShortcuts
    );

    /* Mentor drag */

    mentorCard?.addEventListener(
      "mousedown",
      startMentorDrag
    );

    mentorCard?.addEventListener(
      "touchstart",
      startMentorDrag,
      {
        passive: false
      }
    );

    mentorResize?.addEventListener(
      "mousedown",
      startMentorResize
    );

    mentorResize?.addEventListener(
      "touchstart",
      startMentorResize,
      {
        passive: false
      }
    );

    document.addEventListener(
      "mousemove",
      moveMentorDrag
    );

    document.addEventListener(
      "touchmove",
      moveMentorDrag,
      {
        passive: false
      }
    );

    document.addEventListener(
      "mouseup",
      stopMentorDrag
    );

    document.addEventListener(
      "touchend",
      stopMentorDrag
    );

    document.addEventListener(
      "mousemove",
      moveMentorResize
    );

    document.addEventListener(
      "touchmove",
      moveMentorResize,
      {
        passive: false
      }
    );

    document.addEventListener(
      "mouseup",
      stopMentorResize
    );

    document.addEventListener(
      "touchend",
      stopMentorResize
    );

    /* Main media events */

    mainVideo?.addEventListener(
      "play",
      async () => {
        await setupMainVideoAudio();
        updateMainAudioGraph();
        renderCompositionFrame();
      }
    );

    mainVideo?.addEventListener(
      "pause",
      renderCompositionFrame
    );

    mainVideo?.addEventListener(
      "timeupdate",
      () => {
        renderCompositionFrame();
      }
    );

    mainVideo?.addEventListener(
      "loadedmetadata",
      () => {
        renderCompositionFrame();
      }
    );

    mainImage?.addEventListener(
      "load",
      renderCompositionFrame
    );

    mentorVideo?.addEventListener(
      "timeupdate",
      renderCompositionFrame
    );

    mentorCameraVideo?.addEventListener(
      "loadedmetadata",
      () => {
        initializeSegmentation();
        renderCompositionFrame();
      }
    );

    /* File inputs */

    bindFileInput(
      mainFileInput,
      loadImageFile
    );

    bindFileInput(
      mainVideoInput,
      loadMainVideoFile
    );

    bindFileInput(
      mentorFileInput,
      loadMentorFile
    );

    bindFileInput(
      backgroundImageUpload,
      loadBackgroundImage
    );

    bindFileInput(
      teleprompterFileInput,
      uploadTeleprompterFile
    );

    /* Window */

    window.addEventListener(
      "resize",
      () => {
        renderCompositionFrame();
        drawMicWaveform();
      }
    );

    document.addEventListener(
      "fullscreenchange",
      () => {
        setTimeout(
          renderCompositionFrame,
          100
        );
      }
    );

    window.addEventListener(
      "beforeunload",
      cleanup
    );
  }

  /* =======================================================
     INIT
     ======================================================= */

  async function init() {
    loadSettings();
    loadStudents();
    loadTeleprompter();

    await loadHistoryMetadata();

    applySettingsToUI();

    syncRecordingSettings();

    renderStudents();
    renderRecordingHistory();

    initializeMentorPosition();

    showWelcome();

    setBackgroundMode(
      "original"
    );

    updateMainAudioUI();

    updateRecordingUI();

    updateCameraIndicator(false);
    updateMicIndicator(false);
    updateScreenIndicator(false);

    updateAudioIndicator();

    await enumerateCameras();

    /*
      Do not automatically request
      camera/microphone permission.
      User starts them manually.
    */

    startAudioMeterLoop();

    /*
      Prepare composition canvas.
    */

    createRecordingCanvas();
    renderCompositionFrame();

    /*
      Global API.
    */

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

      playMainVideo,
      pauseMainVideo,

      openTeleprompter,
      startTeleprompter,
      pauseTeleprompter,

      fullscreenStage,
      fullscreenStudio,

      setBackgroundMode,

      renderCompositionFrame,

      toast
    };

    /*
      Compatibility bridge for existing
      UI code.
    */

    window.CourseStudioMicVolume = () =>
      safeNumber(
        micVolume?.value,
        100
      );

    window.CourseStudioMicEnabled = () =>
      Boolean(
        micEnabled?.checked
      );

    window.CourseStudioMicMonitor = () =>
      Boolean(
        micMonitor?.checked
      );

    console.log(
      "%c SNK Mentor Studio loaded ",
      "background:#0c8; color:#fff; padding:5px 10px; border-radius:5px;"
    );
  }

  /* =======================================================
     CLEANUP
     ======================================================= */

  function cleanup() {
    stopRecordingTimer();
    stopRecordingRenderLoop();
    stopAudioMeterLoop();

    stopCamera(false);
    stopScreenCapture(false);
    stopMicrophone(false);

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

    if (
      state.backgroundImageUrl
    ) {
      URL.revokeObjectURL(
        state.backgroundImageUrl
      );
    }

    if (
      state.recordingUrl
    ) {
      URL.revokeObjectURL(
        state.recordingUrl
      );
    }

    if (
      state.previewObjectUrl
    ) {
      URL.revokeObjectURL(
        state.previewObjectUrl
      );
    }

    if (
      state.audioContext &&
      state.audioContext.state !==
        "closed"
    ) {
      state.audioContext
        .close()
        .catch(() => {});
    }
  }

  /* =======================================================
     START
     ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true
      }
    );
  } else {
    init();
  }

})();
