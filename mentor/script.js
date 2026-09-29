/* =========================================================
   SNK MENTOR STUDIO
   PERSONAL COURSE STUDIO
   STEP 3.8 — PROFESSIONAL RECORDING CONTROL

   File:
   mentor/script.js

   Includes:
   - Main image
   - Main video
   - Main video audio
   - Mentor video
   - Webcam
   - Camera switching
   - AI person segmentation
   - Original background
   - Remove background
   - Blur background
   - Custom background
   - Solid background
   - Mentor drag
   - Mentor resize
   - Students
   - Settings
   - Teleprompter
   - Microphone
   - Mic monitor
   - Screen capture
   - 720p / 1080p / 1440p
   - 24 / 30 / 60 FPS
   - Continuous recording render loop
   - Pause / Resume
   - Stop recording
   - Recording timer
   - Recording preview
   - Download
   - Delete
   - Record again
   - Stage fullscreen
   - Studio fullscreen
   - Keyboard shortcuts
   - Status indicators
   ========================================================= */

(() => {
  "use strict";

  /* =========================================================
     HELPERS
     ========================================================= */

  const $ = (selector) =>
    document.querySelector(selector);

  const $$ = (selector) =>
    Array.from(document.querySelectorAll(selector));

  const byId = (id) =>
    document.getElementById(id);

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const safeNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const isVideoReady = (video) =>
    video &&
    video.readyState >= 2 &&
    video.videoWidth > 0 &&
    video.videoHeight > 0;

  const wait = (ms) =>
    new Promise(resolve => setTimeout(resolve, ms));


  /* =========================================================
     ELEMENTS
     ========================================================= */

  const app =
    byId("app");

  const stage =
    byId("stage");

  const stageShell =
    byId("stageShell");

  const mainImage =
    byId("mainImage");

  const mainVideo =
    byId("mainVideo");

  const screenCaptureVideo =
    byId("screenCaptureVideo");

  const welcomeContent =
    byId("welcomeContent");

  const mentorCard =
    byId("mentorCard");

  const mentorVideo =
    byId("mentorVideo");

  const mentorCameraVideo =
    byId("mentorCameraVideo");

  const mentorAICanvas =
    byId("mentorAICanvas");

  const mentorPlaceholder =
    byId("mentorPlaceholder");

  const mentorSourceLabel =
    byId("mentorSourceLabel");

  const mentorResize =
    byId("mentorResize");

  const brandBadge =
    byId("brandBadge");

  const recordingOverlay =
    byId("recordingOverlay");

  const recordingOverlayTimer =
    byId("recordingOverlayTimer");

  const recordingStatusDot =
    byId("recordingStatusDot");

  const recordingStatusText =
    byId("recordingStatusText");

  const recordingTimer =
    byId("recordingTimer");

  const recordBtn =
    byId("recordBtn");

  const recordToolbarBtn =
    byId("recordToolbarBtn");

  const pauseRecordingBtn =
    byId("pauseRecordingBtn");

  const resumeRecordingBtn =
    byId("resumeRecordingBtn");

  const stopRecordingBtn =
    byId("stopRecordingBtn");

  const recordingQuality =
    byId("recordingQuality");

  const recordingFps =
    byId("recordingFps");

  const recordingQualitySide =
    byId("recordingQualitySide");

  const recordingFpsSide =
    byId("recordingFpsSide");

  const stageResolutionBadge =
    byId("stageResolutionBadge");

  const stageFpsBadge =
    byId("stageFpsBadge");

  const stageSourceBadge =
    byId("stageSourceBadge");

  const cameraIndicator =
    byId("cameraIndicator");

  const micIndicator =
    byId("micIndicator");

  const audioIndicator =
    byId("audioIndicator");

  const screenIndicator =
    byId("screenIndicator");

  const cameraStatus =
    byId("cameraStatus");

  const screenCaptureStatus =
    byId("screenCaptureStatus");

  const screenCaptureStatusLight =
    byId("screenCaptureStatusLight");

  const cameraStartButtons = [
    byId("startCameraBtn"),
    byId("startCameraSideBtn")
  ].filter(Boolean);

  const cameraStopButtons = [
    byId("stopCameraBtn"),
    byId("stopCameraSideBtn")
  ].filter(Boolean);

  const switchCameraButton =
    byId("switchCameraSideBtn");

  const uploadMainBtn =
    byId("uploadMainBtn");

  const uploadVideoBtn =
    byId("uploadVideoBtn");

  const uploadMentorBtn =
    byId("uploadMentorBtn");

  const uploadMainSideBtn =
    byId("uploadMainSideBtn");

  const uploadVideoSideBtn =
    byId("uploadVideoSideBtn");

  const uploadMentorSideBtn =
    byId("uploadMentorSideBtn");

  const uploadMentorFileSideBtn =
    byId("uploadMentorFileSideBtn");

  const uploadBackgroundSideBtn =
    byId("uploadBackgroundSideBtn");

  const startScreenCaptureBtn =
    byId("startScreenCaptureBtn");

  const startScreenCaptureSideBtn =
    byId("startScreenCaptureSideBtn");

  const stopScreenCaptureBtn =
    byId("stopScreenCaptureBtn");

  const mainPlayBtn =
    byId("mainPlayBtn");

  const mainPauseBtn =
    byId("mainPauseBtn");

  const mainFileInput =
    byId("mainFileInput");

  const mainVideoInput =
    byId("mainVideoInput");

  const mentorFileInput =
    byId("mentorFileInput");

  const backgroundImageUpload =
    byId("backgroundImageUpload");

  const teleprompterFileInput =
    byId("teleprompterFileInput");

  const bgOriginalBtn =
    byId("bgOriginalBtn");

  const bgRemoveBtn =
    byId("bgRemoveBtn");

  const bgBlurBtn =
    byId("bgBlurBtn");

  const bgImageBtn =
    byId("bgImageBtn");

  const bgColorBtn =
    byId("bgColorBtn");

  const backgroundColor =
    byId("backgroundColor");

  const mainVideoAudioCheckbox =
    byId("mainVideoAudioCheckbox");

  const mainVideoVolume =
    byId("mainVideoVolume");

  const mainVolumeValue =
    byId("mainVolumeValue");

  const micVolume =
    byId("micVolume");

  const micVolumeValue =
    byId("micVolumeValue");

  const micEnabled =
    byId("micEnabled");

  const micMonitor =
    byId("micMonitor");

  const micStatus =
    document.querySelector("[data-mic-status]");

  const studentsList =
    byId("studentsList");

  const addStudentBtn =
    byId("addStudentBtn");

  const settingsBtn =
    byId("settingsBtn");

  const settingsModal =
    byId("settingsModal");

  const brandNameInput =
    byId("brandNameInput");

  const settingsRecordingQuality =
    byId("settingsRecordingQuality");

  const settingsRecordingFps =
    byId("settingsRecordingFps");

  const settingsAutoStartTeleprompter =
    byId("settingsAutoStartTeleprompter");

  const settingsShowTeleprompterRecording =
    byId("settingsShowTeleprompterRecording");

  const closeSettingsBtn =
    byId("closeSettingsBtn");

  const closeSettingsFooterBtn =
    byId("closeSettingsFooterBtn");

  const saveSettingsBtn =
    byId("saveSettingsBtn");

  const openShortcutsBtn =
    byId("openShortcutsBtn");

  const shortcutsModal =
    byId("shortcutsModal");

  const closeShortcutsBtn =
    byId("closeShortcutsBtn");

  const fullscreenStudioBtn =
    byId("fullscreenStudioBtn");

  const fullscreenStageBtn =
    byId("fullscreenStageBtn");

  const openTeleprompterTopBtn =
    byId("openTeleprompterTopBtn");

  const openTeleprompterBtn =
    byId("openTeleprompterBtn");

  const openTeleprompterSide =
    byId("openTeleprompterSide");

  const uploadTeleprompterBtn =
    byId("uploadTeleprompterBtn");

  const uploadBackgroundBox =
    byId("backgroundUploadBox");

  const teleprompterModal =
    byId("teleprompterModal");

  const closeTeleprompterBtn =
    byId("closeTeleprompterBtn");

  const teleprompterText =
    byId("teleprompterText");

  const teleprompterSpeed =
    byId("teleprompterSpeed");

  const teleprompterFontSize =
    byId("teleprompterFontSize");

  const teleprompterOpacity =
    byId("teleprompterOpacity");

  const teleprompterPreview =
    byId("teleprompterPreview");

  const teleprompterPlayBtn =
    byId("teleprompterPlayBtn");

  const teleprompterPauseBtn =
    byId("teleprompterPauseBtn");

  const teleprompterResetBtn =
    byId("teleprompterResetBtn");

  const teleprompterSaveBtn =
    byId("teleprompterSaveBtn");

  const teleprompterMiniPreview =
    byId("teleprompterMiniPreview");

  const recordingPreviewModal =
    byId("recordingPreviewModal");

  const recordingPreviewVideo =
    byId("recordingPreviewVideo");

  const recordingFileInfo =
    byId("recordingFileInfo");

  const downloadRecordingBtn =
    byId("downloadRecordingBtn");

  const deleteRecordingBtn =
    byId("deleteRecordingBtn");

  const recordAgainBtn =
    byId("recordAgainBtn");

  const closeRecordingPreviewBtn =
    byId("closeRecordingPreviewBtn");

  const studentModal =
    byId("studentModal");

  const studentNameInput =
    byId("studentNameInput");

  const closeStudentModalBtn =
    byId("closeStudentModalBtn");

  const cancelStudentBtn =
    byId("cancelStudentBtn");

  const saveStudentBtn =
    byId("saveStudentBtn");

  const toastContainer =
    byId("toastContainer");

  const aiCanvas =
    byId("aiCanvas");

  const aiSourceCanvas =
    byId("aiSourceCanvas");

  const aiMaskCanvas =
    byId("aiMaskCanvas");


  /* =========================================================
     STATE
     ========================================================= */

  const state = {

    main: {
      type: "none",
      objectUrl: null,
      image: null
    },

    mentor: {
      type: "none",
      stream: null,
      facingMode: "user"
    },

    camera: {
      stream: null,
      devices: [],
      currentIndex: 0,
      started: false
    },

    screen: {
      active: false,
      stream: null,
      videoReady: false
    },

    background: {
      mode: "original",
      image: null,
      imageUrl: null,
      color: "#142238",
      blurAmount: 18
    },

    ai: {
      enabled: false,
      initialized: false,
      processing: false,
      selfieSegmentation: null
    },

    audio: {
      context: null,
      destination: null,

      mainSource: null,
      mainGain: null,

      micStream: null,
      micSource: null,
      micGain: null,

      screenSource: null,
      screenGain: null,

      monitorGain: null,

      initialized: false
    },

    recording: {
      active: false,
      paused: false,

      recorder: null,
      chunks: [],

      blob: null,
      url: null,

      canvas: null,
      context: null,
      captureStream: null,
      combinedStream: null,

      startedAt: 0,
      elapsedBeforePause: 0,
      timerInterval: null,

      renderLoop: false,
      renderFrame: 0,

      quality: Number(
        localStorage.getItem(
          "mentorStudioRecordingQuality"
        )
      ) || 1080,

      fps: Number(
        localStorage.getItem(
          "mentorStudioRecordingFps"
        )
      ) || 30,

      mimeType: "video/webm;codecs=vp9,opus"
    },

    students: [],

    settings: {
      brandName:
        localStorage.getItem(
          "mentorStudioBrandName"
        ) ||
        "Personal Course Studio",

      autoStartTeleprompter:
        localStorage.getItem(
          "mentorStudioAutoStartTeleprompter"
        ) === "true",

      showTeleprompterRecording:
        localStorage.getItem(
          "mentorStudioShowTeleprompterRecording"
        ) !== "false"
    },

    teleprompter: {
      text:
        localStorage.getItem(
          "mentorStudioTeleprompterText"
        ) || "",

      playing: false,
      animationFrame: null,
      lastTime: 0,
      scrollPosition: 0,

      speed:
        Number(
          localStorage.getItem(
            "mentorStudioTeleprompterSpeed"
          )
        ) || 60,

      fontSize:
        Number(
          localStorage.getItem(
            "mentorStudioTeleprompterFontSize"
          )
        ) || 30,

      opacity:
        Number(
          localStorage.getItem(
            "mentorStudioTeleprompterOpacity"
          )
        ) || 92
    },

    drag: {
      active: false,
      startX: 0,
      startY: 0,
      startLeft: 0,
      startTop: 0
    },

    toastTimeout: null
  };


  /* =========================================================
     RECORDING RESOLUTION
     ========================================================= */

  function getRecordingDimensions() {

    switch (
      Number(state.recording.quality)
    ) {

      case 720:
        return {
          width: 1280,
          height: 720
        };

      case 1440:
        return {
          width: 2560,
          height: 1440
        };

      case 1080:
      default:
        return {
          width: 1920,
          height: 1080
        };
    }
  }


  /* =========================================================
     TOAST
     ========================================================= */

  function showToast(
    message,
    duration = 3000
  ) {

    if (!toastContainer) return;

    const toast =
      document.createElement("div");

    toast.className = "toast";
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {

      toast.style.opacity = "0";
      toast.style.transform =
        "translateY(8px)";

      setTimeout(() => {
        toast.remove();
      }, 220);

    }, duration);
  }


  /* =========================================================
     RECORDING STATUS
     ========================================================= */

  function setRecordingStatus(
    status,
    live = false
  ) {

    if (recordingStatusText) {
      recordingStatusText.textContent =
        status;
    }

    if (recordingStatusDot) {

      recordingStatusDot.classList.toggle(
        "live",
        live
      );
    }

    if (recordingOverlay) {

      recordingOverlay.classList.toggle(
        "active",
        live
      );
    }
  }


  function updateRecordingButtons() {

    const active =
      state.recording.active;

    const paused =
      state.recording.paused;

    if (pauseRecordingBtn) {

      pauseRecordingBtn.classList.toggle(
        "hidden",
        !active || paused
      );
    }

    if (resumeRecordingBtn) {

      resumeRecordingBtn.classList.toggle(
        "hidden",
        !active || !paused
      );
    }

    if (recordBtn) {

      recordBtn.classList.toggle(
        "active",
        active
      );

      recordBtn.textContent =
        active
          ? paused
            ? "▶ Resume"
            : "⏸ Pause"
          : "● Record";
    }

    if (recordToolbarBtn) {

      recordToolbarBtn.textContent =
        active
          ? paused
            ? "▶ Resume"
            : "⏸ Pause"
          : "● Record";
    }
  }


  /* =========================================================
     TIMER
     ========================================================= */

  function formatTime(milliseconds) {

    const totalSeconds =
      Math.max(
        0,
        Math.floor(milliseconds / 1000)
      );

    const hours =
      Math.floor(totalSeconds / 3600);

    const minutes =
      Math.floor(
        (totalSeconds % 3600) / 60
      );

    const seconds =
      totalSeconds % 60;

    return [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0")
    ].join(":");
  }


  function getRecordingElapsed() {

    if (!state.recording.active) {
      return state.recording.elapsedBeforePause;
    }

    if (state.recording.paused) {
      return state.recording.elapsedBeforePause;
    }

    return (
      state.recording.elapsedBeforePause +
      (
        performance.now() -
        state.recording.startedAt
      )
    );
  }


  function updateRecordingTimer() {

    const time =
      formatTime(
        getRecordingElapsed()
      );

    if (recordingTimer) {
      recordingTimer.textContent =
        time;
    }

    if (recordingOverlayTimer) {
      recordingOverlayTimer.textContent =
        time;
    }
  }


  function startTimer() {

    stopTimer();

    state.recording.timerInterval =
      setInterval(
        updateRecordingTimer,
        250
      );
  }


  function stopTimer() {

    if (
      state.recording.timerInterval
    ) {

      clearInterval(
        state.recording.timerInterval
      );

      state.recording.timerInterval =
        null;
    }
  }


  /* =========================================================
     RECORDING QUALITY
     ========================================================= */

  function updateQualityUI() {

    const quality =
      String(state.recording.quality);

    const fps =
      String(state.recording.fps);

    if (recordingQuality) {
      recordingQuality.value =
        quality;
    }

    if (recordingQualitySide) {
      recordingQualitySide.value =
        quality;
    }

    if (recordingFps) {
      recordingFps.value =
        fps;
    }

    if (recordingFpsSide) {
      recordingFpsSide.value =
        fps;
    }

    const dimensions =
      getRecordingDimensions();

    if (stageResolutionBadge) {

      stageResolutionBadge.textContent =
        `${dimensions.width} × ${dimensions.height}`;
    }

    if (stageFpsBadge) {
      stageFpsBadge.textContent =
        `${state.recording.fps} FPS`;
    }
  }


  function setQuality(value) {

    if (state.recording.active) {

      showToast(
        "Stop the current recording before changing resolution."
      );

      updateQualityUI();

      return;
    }

    const allowed =
      [720, 1080, 1440];

    const next =
      Number(value);

    if (!allowed.includes(next)) {
      return;
    }

    state.recording.quality =
      next;

    localStorage.setItem(
      "mentorStudioRecordingQuality",
      String(next)
    );

    updateQualityUI();

    showToast(
      `Recording quality set to ${next}p.`
    );
  }


  function setFPS(value) {

    if (state.recording.active) {

      showToast(
        "Stop the current recording before changing FPS."
      );

      updateQualityUI();

      return;
    }

    const allowed =
      [24, 30, 60];

    const next =
      Number(value);

    if (!allowed.includes(next)) {
      return;
    }

    state.recording.fps =
      next;

    localStorage.setItem(
      "mentorStudioRecordingFps",
      String(next)
    );

    updateQualityUI();

    showToast(
      `Recording FPS set to ${next}.`
    );
  }


  /* =========================================================
     MAIN MEDIA
     ========================================================= */

  function clearMainObjectUrl() {

    if (state.main.objectUrl) {

      URL.revokeObjectURL(
        state.main.objectUrl
      );

      state.main.objectUrl =
        null;
    }
  }


  function hideAllMainSources() {

    mainImage?.classList.remove("active");
    mainVideo?.classList.remove("active");
    screenCaptureVideo?.classList.remove("active");

    if (welcomeContent) {
      welcomeContent.style.display =
        "none";
    }
  }


  function showWelcome() {

    hideAllMainSources();

    if (welcomeContent) {
      welcomeContent.style.display =
        "block";
    }

    state.main.type =
      "none";

    updateStageSource();
  }


  function updateStageSource() {

    if (!stageSourceBadge) return;

    let text = "Ready";

    if (state.main.type === "image") {
      text = "Slide";
    }

    if (state.main.type === "video") {
      text = "Video";
    }

    if (state.main.type === "screen") {
      text = "Screen";
    }

    stageSourceBadge.textContent =
      text;
  }


  async function loadMainImage(file) {

    if (!file) return;

    if (!file.type.startsWith("image/")) {

      showToast(
        "Please select an image file."
      );

      return;
    }

    clearMainObjectUrl();

    const url =
      URL.createObjectURL(file);

    state.main.objectUrl =
      url;

    const image =
      new Image();

    image.onload = () => {

      state.main.image =
        image;

      mainImage.src =
        url;

      hideAllMainSources();

      mainImage.classList.add(
        "active"
      );

      state.main.type =
        "image";

      if (welcomeContent) {
        welcomeContent.style.display =
          "none";
      }

      updateStageSource();

      renderCompositionFrame();

      showToast(
        "Slide loaded successfully."
      );
    };

    image.onerror = () => {

      showToast(
        "Could not load the image."
      );
    };

    image.src =
      url;
  }


  async function loadMainVideo(file) {

    if (!file) return;

    if (!file.type.startsWith("video/")) {

      showToast(
        "Please select a video file."
      );

      return;
    }

    clearMainObjectUrl();

    const url =
      URL.createObjectURL(file);

    state.main.objectUrl =
      url;

    mainVideo.src =
      url;

    mainVideo.load();

    mainVideo.classList.add(
      "active"
    );

    mainImage.classList.remove(
      "active"
    );

    screenCaptureVideo.classList.remove(
      "active"
    );

    if (welcomeContent) {
      welcomeContent.style.display =
        "none";
    }

    state.main.type =
      "video";

    mainVideo.volume =
      Number(
        mainVideoVolume?.value || 100
      ) / 100;

    mainVideo.muted =
      !(
        mainVideoAudioCheckbox?.checked
      );

    updateStageSource();

    await ensureAudioEngine();

    connectMainVideoAudio();

    renderCompositionFrame();

    showToast(
      "Main video loaded."
    );
  }


  function playMainVideo() {

    if (
      state.main.type !== "video" ||
      !mainVideo
    ) {
      showToast(
        "Load a main video first."
      );

      return;
    }

    mainVideo
      .play()
      .catch(() => {
        showToast(
          "Browser blocked autoplay. Press Play again."
        );
      });
  }


  function pauseMainVideo() {

    if (!mainVideo) return;

    mainVideo.pause();

    renderCompositionFrame();
  }


  /* =========================================================
     CAMERA
     ========================================================= */

  async function getCameraDevices() {

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.enumerateDevices
    ) {
      return [];
    }

    try {

      const devices =
        await navigator.mediaDevices
          .enumerateDevices();

      return devices.filter(
        device =>
          device.kind ===
          "videoinput"
      );

    } catch (error) {

      console.error(
        "enumerateDevices:",
        error
      );

      return [];
    }
  }


  async function startCamera() {

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {

      showToast(
        "Camera API is not available in this browser."
      );

      return;
    }

    stopCamera(false);

    try {

      const devices =
        await getCameraDevices();

      state.camera.devices =
        devices;

      let constraints;

      if (
        devices.length > 0 &&
        state.camera.currentIndex <
          devices.length
      ) {

        constraints = {
          video: {
            deviceId: {
              exact:
                devices[
                  state.camera.currentIndex
                ].deviceId
            },
            width: {
              ideal: 1280
            },
            height: {
              ideal: 720
            },
            frameRate: {
              ideal: 30
            }
          },
          audio: true
        };

      } else {

        constraints = {
          video: {
            facingMode:
              state.mentor.facingMode,

            width: {
              ideal: 1280
            },

            height: {
              ideal: 720
            },

            frameRate: {
              ideal: 30
            }
          },

          audio: true
        };
      }

      const stream =
        await navigator.mediaDevices
          .getUserMedia(
            constraints
          );

      state.camera.stream =
        stream;

      state.mentor.stream =
        stream;

      state.camera.started =
        true;

      mentorCameraVideo.srcObject =
        stream;

      mentorCameraVideo.muted =
        true;

      mentorCameraVideo.playsInline =
        true;

      await mentorCameraVideo.play()
        .catch(() => {});

      showMentorSource(
        "camera"
      );

      await ensureAudioEngine();

      connectMicrophoneStream(
        stream
      );

      setCameraStatus(true);

      showToast(
        "Camera started."
      );

      startAIIfNeeded();

      renderCompositionFrame();

    } catch (error) {

      console.error(
        "Camera error:",
        error
      );

      setCameraStatus(false);

      if (
        error.name ===
        "NotAllowedError"
      ) {

        showToast(
          "Camera permission was denied."
        );

      } else {

        showToast(
          "Could not start camera."
        );
      }
    }
  }


  function stopCamera(
    showMessage = true
  ) {

    if (state.camera.stream) {

      state.camera.stream
        .getTracks()
        .forEach(track => {
          try {
            track.stop();
          } catch (_) {}
        });
    }

    state.camera.stream =
      null;

    state.mentor.stream =
      null;

    state.camera.started =
      false;

    if (mentorCameraVideo) {

      mentorCameraVideo.pause();

      mentorCameraVideo.srcObject =
        null;
    }

    disconnectMicrophone();

    if (
      state.mentor.type ===
      "camera"
    ) {

      state.mentor.type =
        "none";

      mentorCameraVideo.classList.remove(
        "active"
      );

      mentorAICanvas.classList.remove(
        "active"
      );

      mentorPlaceholder.style.display =
        "grid";

      mentorSourceLabel.textContent =
        "Mentor";
    }

    setCameraStatus(false);

    if (showMessage) {
      showToast(
        "Camera stopped."
      );
    }

    renderCompositionFrame();
  }


  async function switchCamera() {

    const devices =
      await getCameraDevices();

    if (devices.length < 2) {

      showToast(
        "No second camera was found."
      );

      return;
    }

    state.camera.devices =
      devices;

    state.camera.currentIndex =
      (
        state.camera.currentIndex + 1
      ) %
      devices.length;

    await startCamera();
  }


  function setCameraStatus(active) {

    if (cameraIndicator) {

      cameraIndicator.classList.toggle(
        "online",
        active
      );
    }

    if (cameraStatus) {

      cameraStatus.textContent =
        active
          ? "Camera On"
          : "Camera Off";
    }
  }


  /* =========================================================
     MENTOR VIDEO
     ========================================================= */

  function loadMentorVideo(file) {

    if (!file) return;

    if (!file.type.startsWith("video/")) {

      showToast(
        "Please select a mentor video."
      );

      return;
    }

    if (state.camera.started) {
      stopCamera(false);
    }

    const url =
      URL.createObjectURL(file);

    mentorVideo.src =
      url;

    mentorVideo.load();

    mentorVideo.loop =
      true;

    mentorVideo.muted =
      true;

    mentorVideo.classList.add(
      "active"
    );

    mentorCameraVideo.classList.remove(
      "active"
    );

    mentorAICanvas.classList.remove(
      "active"
    );

    mentorPlaceholder.style.display =
      "none";

    mentorSourceLabel.textContent =
      "Mentor Video";

    state.mentor.type =
      "video";

    mentorVideo.play()
      .catch(() => {});

    showToast(
      "Mentor video loaded."
    );

    renderCompositionFrame();
  }


  function showMentorSource(type) {

    mentorVideo.classList.remove(
      "active"
    );

    mentorCameraVideo.classList.remove(
      "active"
    );

    mentorAICanvas.classList.remove(
      "active"
    );

    if (type === "video") {

      mentorVideo.classList.add(
        "active"
      );

      mentorPlaceholder.style.display =
        "none";

      mentorSourceLabel.textContent =
        "Mentor Video";

      return;
    }

    if (type === "camera") {

      if (
        state.background.mode ===
          "original"
      ) {

        mentorCameraVideo.classList.add(
          "active"
        );

      } else {

        mentorAICanvas.classList.add(
          "active"
        );
      }

      mentorPlaceholder.style.display =
        "none";

      mentorSourceLabel.textContent =
        "Live Camera";

      return;
    }

    mentorPlaceholder.style.display =
      "grid";

    mentorSourceLabel.textContent =
      "Mentor";
  }


  /* =========================================================
     MENTOR DRAG
     ========================================================= */

  function initializeMentorDrag() {

    if (!mentorCard) return;

    mentorCard.addEventListener(
      "mousedown",
      startMentorDrag
    );

    mentorCard.addEventListener(
      "touchstart",
      startMentorDrag,
      {
        passive: false
      }
    );

    window.addEventListener(
      "mousemove",
      moveMentorDrag
    );

    window.addEventListener(
      "touchmove",
      moveMentorDrag,
      {
        passive: false
      }
    );

    window.addEventListener(
      "mouseup",
      stopMentorDrag
    );

    window.addEventListener(
      "touchend",
      stopMentorDrag
    );
  }


  function startMentorDrag(event) {

    if (
      event.target ===
      mentorResize
    ) {
      return;
    }

    if (
      event.target.closest(
        ".mentor-resize"
      )
    ) {
      return;
    }

    event.preventDefault();

    const point =
      event.touches?.[0] ||
      event;

    const rect =
      mentorCard.getBoundingClientRect();

    const stageRect =
      stage.getBoundingClientRect();

    state.drag.active =
      true;

    state.drag.startX =
      point.clientX;

    state.drag.startY =
      point.clientY;

    state.drag.startLeft =
      rect.left -
      stageRect.left;

    state.drag.startTop =
      rect.top -
      stageRect.top;

    mentorCard.style.right =
      "auto";

    mentorCard.style.bottom =
      "auto";

    mentorCard.style.left =
      `${state.drag.startLeft}px`;

    mentorCard.style.top =
      `${state.drag.startTop}px`;

    document.body.style.userSelect =
      "none";
  }


  function moveMentorDrag(event) {

    if (!state.drag.active) {
      return;
    }

    event.preventDefault();

    const point =
      event.touches?.[0] ||
      event;

    const stageRect =
      stage.getBoundingClientRect();

    const cardRect =
      mentorCard.getBoundingClientRect();

    const deltaX =
      point.clientX -
      state.drag.startX;

    const deltaY =
      point.clientY -
      state.drag.startY;

    const maxLeft =
      Math.max(
        0,
        stageRect.width -
        cardRect.width
      );

    const maxTop =
      Math.max(
        0,
        stageRect.height -
        cardRect.height
      );

    const left =
      clamp(
        state.drag.startLeft +
        deltaX,
        0,
        maxLeft
      );

    const top =
      clamp(
        state.drag.startTop +
        deltaY,
        0,
        maxTop
      );

    mentorCard.style.left =
      `${left}px`;

    mentorCard.style.top =
      `${top}px`;
  }


  function stopMentorDrag() {

    if (!state.drag.active) {
      return;
    }

    state.drag.active =
      false;

    document.body.style.userSelect =
      "";
  }


  /* =========================================================
     BACKGROUND
     ========================================================= */

  function setBackgroundMode(mode) {

    const modes = [
      "original",
      "remove",
      "blur",
      "image",
      "color"
    ];

    if (!modes.includes(mode)) {
      return;
    }

    state.background.mode =
      mode;

    [
      bgOriginalBtn,
      bgRemoveBtn,
      bgBlurBtn,
      bgImageBtn,
      bgColorBtn
    ]
      .filter(Boolean)
      .forEach(button => {

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
      mode === "image" &&
      !state.background.image
    ) {

      showToast(
        "Upload a background image first."
      );

      backgroundImageUpload?.click();

      return;
    }

    if (
      state.camera.started &&
      mode !== "original"
    ) {

      startAIIfNeeded();

    } else {

      showMentorSource(
        state.mentor.type
      );
    }

    renderCompositionFrame();
  }


  function loadBackgroundImage(file) {

    if (!file) return;

    if (!file.type.startsWith("image/")) {

      showToast(
        "Please select an image file."
      );

      return;
    }

    if (state.background.imageUrl) {

      URL.revokeObjectURL(
        state.background.imageUrl
      );
    }

    const url =
      URL.createObjectURL(file);

    const image =
      new Image();

    image.onload = () => {

      state.background.image =
        image;

      state.background.imageUrl =
        url;

      if (uploadBackgroundSideBtn) {
        uploadBackgroundSideBtn
          .classList.add("active");
      }

      if (uploadBackgroundBox) {

        uploadBackgroundBox.textContent =
          `Background loaded: ${file.name}`;
      }

      setBackgroundMode(
        "image"
      );

      showToast(
        "Custom background loaded."
      );
    };

    image.onerror = () => {

      URL.revokeObjectURL(url);

      showToast(
        "Could not load background image."
      );
    };

    image.src =
      url;
  }


  /* =========================================================
     MEDIAPIPE AI
     ========================================================= */

  async function initializeAI() {

    if (state.ai.initialized) {
      return;
    }

    if (
      typeof SelfieSegmentation ===
      "undefined"
    ) {

      console.warn(
        "MediaPipe SelfieSegmentation unavailable."
      );

      return;
    }

    try {

      const segmentation =
        new SelfieSegmentation({
          locateFile: file =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
        });

      segmentation.setOptions({
        modelSelection: 1
      });

      segmentation.onResults(
        handleSegmentationResults
      );

      state.ai.selfieSegmentation =
        segmentation;

      state.ai.initialized =
        true;

      console.log(
        "MediaPipe segmentation initialized."
      );

    } catch (error) {

      console.error(
        "AI initialization failed:",
        error
      );
    }
  }


  async function startAIIfNeeded() {

    if (!state.camera.started) {
      return;
    }

    if (
      state.background.mode ===
      "original"
    ) {

      showMentorSource(
        "camera"
      );

      return;
    }

    await initializeAI();

    if (
      !state.ai.selfieSegmentation
    ) {

      showToast(
        "AI background is unavailable."
      );

      setBackgroundMode(
        "original"
      );

      return;
    }

    processCameraFrame();
  }


  async function processCameraFrame() {

    if (
      !state.camera.started ||
      !mentorCameraVideo ||
      !isVideoReady(
        mentorCameraVideo
      )
    ) {
      return;
    }

    if (state.ai.processing) {
      return;
    }

    state.ai.processing =
      true;

    try {

      await state.ai.selfieSegmentation.send({
        image:
          mentorCameraVideo
      });

    } catch (error) {

      console.error(
        "Segmentation error:",
        error
      );

    } finally {

      state.ai.processing =
        false;
    }
  }


  function handleSegmentationResults(
    results
  ) {

    if (
      !mentorAICanvas ||
      !results?.image ||
      !results?.segmentationMask
    ) {
      return;
    }

    const source =
      results.image;

    const width =
      source.videoWidth ||
      source.width ||
      640;

    const height =
      source.videoHeight ||
      source.height ||
      480;

    if (
      mentorAICanvas.width !== width ||
      mentorAICanvas.height !== height
    ) {

      mentorAICanvas.width =
        width;

      mentorAICanvas.height =
        height;

      aiCanvas.width =
        width;

      aiCanvas.height =
        height;

      aiSourceCanvas.width =
        width;

      aiSourceCanvas.height =
        height;

      aiMaskCanvas.width =
        width;

      aiMaskCanvas.height =
        height;
    }

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
      mentorAICanvas.getContext(
        "2d"
      );

    sourceCtx.clearRect(
      0,
      0,
      width,
      height
    );

    sourceCtx.save();

    sourceCtx.translate(
      width,
      0
    );

    sourceCtx.scale(
      -1,
      1
    );

    sourceCtx.drawImage(
      source,
      0,
      0,
      width,
      height
    );

    sourceCtx.restore();


    maskCtx.clearRect(
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

      /*
       * Soft edge:
       * 0.15 = start
       * 0.65 = fully visible
       */

      let alpha =
        (confidence - 0.15) /
        0.65;

      alpha =
        clamp(
          alpha,
          0,
          1
        );

      /*
       * Smoothstep
       */

      alpha =
        alpha *
        alpha *
        (3 - 2 * alpha);

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


    outputCtx.clearRect(
      0,
      0,
      width,
      height
    );

    drawAIBackground(
      outputCtx,
      width,
      height
    );


    const personCanvas =
      aiCanvas;

    const personCtx =
      personCanvas.getContext(
        "2d"
      );

    personCtx.clearRect(
      0,
      0,
      width,
      height
    );

    personCtx.putImageData(
      personData,
      0,
      0
    );

    outputCtx.drawImage(
      personCanvas,
      0,
      0
    );


    showMentorSource(
      "camera"
    );

    renderCompositionFrame();
  }


  function drawAIBackground(
    ctx,
    width,
    height
  ) {

    const mode =
      state.background.mode;

    if (mode === "remove") {

      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      return;
    }


    if (mode === "color") {

      ctx.fillStyle =
        state.background.color;

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
      state.background.image
    ) {

      drawImageCover(
        ctx,
        state.background.image,
        0,
        0,
        width,
        height
      );

      return;
    }


    if (mode === "blur") {

      ctx.save();

      ctx.filter =
        `blur(${state.background.blurAmount}px)`;

      ctx.drawImage(
        mentorCameraVideo,
        0,
        0,
        width,
        height
      );

      ctx.restore();

      return;
    }


    /*
     * Fallback background
     */

    ctx.clearRect(
      0,
      0,
      width,
      height
    );
  }


  /* =========================================================
     IMAGE COVER
     ========================================================= */

  function drawImageCover(
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

    let sx = 0;
    let sy = 0;
    let sw = sourceWidth;
    let sh = sourceHeight;

    if (
      sourceRatio >
      targetRatio
    ) {

      sw =
        sourceHeight *
        targetRatio;

      sx =
        (sourceWidth - sw) / 2;

    } else {

      sh =
        sourceWidth /
        targetRatio;

      sy =
        (sourceHeight - sh) / 2;
    }

    ctx.drawImage(
      source,
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
     AUDIO ENGINE
     ========================================================= */

  async function ensureAudioEngine() {

    if (state.audio.initialized) {

      if (
        state.audio.context &&
        state.audio.context.state ===
        "suspended"
      ) {

        await state.audio.context.resume()
          .catch(() => {});
      }

      return;
    }

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) {

      showToast(
        "Web Audio is not supported."
      );

      return;
    }

    const context =
      new AudioContext();

    const destination =
      context.createMediaStreamDestination();

    state.audio.context =
      context;

    state.audio.destination =
      destination;

    state.audio.initialized =
      true;

    await context.resume()
      .catch(() => {});

    updateAudioStatus();
  }


  function connectMainVideoAudio() {

    if (
      !state.audio.context ||
      !mainVideo
    ) {
      return;
    }

    if (
      state.audio.mainSource
    ) {
      return;
    }

    try {

      const context =
        state.audio.context;

      const source =
        context.createMediaElementSource(
          mainVideo
        );

      const gain =
        context.createGain();

      source.connect(gain);

      gain.connect(
        context.destination
      );

      gain.connect(
        state.audio.destination
      );

      state.audio.mainSource =
        source;

      state.audio.mainGain =
        gain;

      updateMainAudioSettings();

    } catch (error) {

      console.warn(
        "Main video audio connection:",
        error
      );
    }
  }


  function updateMainAudioSettings() {

    const enabled =
      !!mainVideoAudioCheckbox?.checked;

    const volume =
      Number(
        mainVideoVolume?.value || 100
      ) / 100;

    if (mainVideo) {

      mainVideo.volume =
        volume;

      /*
       * Do not mute if Web Audio is active.
       */

      mainVideo.muted =
        false;
    }

    if (state.audio.mainGain) {

      state.audio.mainGain.gain.value =
        enabled
          ? volume
          : 0;
    }

    if (mainVolumeValue) {

      mainVolumeValue.textContent =
        `${Math.round(volume * 100)}%`;
    }

    updateAudioStatus();
  }


  function connectMicrophoneStream(
    stream
  ) {

    if (
      !state.audio.context ||
      !stream
    ) {
      return;
    }

    disconnectMicrophone();

    const context =
      state.audio.context;

    try {

      const source =
        context.createMediaStreamSource(
          stream
        );

      const gain =
        context.createGain();

      const monitorGain =
        context.createGain();

      source.connect(gain);

      gain.connect(
        state.audio.destination
      );

      gain.connect(
        monitorGain
      );

      monitorGain.connect(
        context.destination
      );

      state.audio.micStream =
        stream;

      state.audio.micSource =
        source;

      state.audio.micGain =
        gain;

      state.audio.monitorGain =
        monitorGain;

      updateMicSettings();

    } catch (error) {

      console.error(
        "Microphone connection:",
        error
      );
    }
  }


  function disconnectMicrophone() {

    try {
      state.audio.micSource?.disconnect();
    } catch (_) {}

    try {
      state.audio.micGain?.disconnect();
    } catch (_) {}

    try {
      state.audio.monitorGain?.disconnect();
    } catch (_) {}

    state.audio.micSource =
      null;

    state.audio.micGain =
      null;

    state.audio.monitorGain =
      null;

    state.audio.micStream =
      null;

    updateMicStatus(false);
  }


  function updateMicSettings() {

    const enabled =
      !!micEnabled?.checked;

    const monitor =
      !!micMonitor?.checked;

    const volume =
      Number(
        micVolume?.value || 100
      ) / 100;

    if (state.audio.micGain) {

      state.audio.micGain.gain.value =
        enabled
          ? volume
          : 0;
    }

    if (state.audio.monitorGain) {

      state.audio.monitorGain.gain.value =
        enabled && monitor
          ? volume
          : 0;
    }

    if (micVolumeValue) {

      micVolumeValue.textContent =
        `${Math.round(volume * 100)}%`;
    }

    updateMicStatus(
      !!state.audio.micStream
    );

    updateAudioStatus();
  }


  function updateMicStatus(active) {

    if (micIndicator) {

      micIndicator.classList.toggle(
        "online",
        active
      );
    }

    if (micStatus) {

      micStatus.textContent =
        active
          ? "Microphone connected"
          : "Microphone not connected";
    }
  }


  function updateAudioStatus() {

    const active =
      !!(
        state.audio.destination &&
        (
          state.audio.mainSource ||
          state.audio.micSource
        )
      );

    if (audioIndicator) {

      audioIndicator.classList.toggle(
        "online",
        active
      );
    }
  }


  /* =========================================================
     SCREEN CAPTURE
     ========================================================= */

  async function startScreenCapture() {

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getDisplayMedia
    ) {

      showToast(
        "Screen capture is not supported by this browser."
      );

      return;
    }

    if (state.screen.active) {

      showToast(
        "Screen capture is already active."
      );

      return;
    }

    try {

      const stream =
        await navigator.mediaDevices
          .getDisplayMedia({
            video: {
              frameRate: {
                ideal:
                  state.recording.fps
              }
            },

            audio: true,

            preferCurrentTab:
              false,

            selfBrowserSurface:
              "exclude",

            systemAudio:
              "include",

            surfaceSwitching:
              "include"
          });

      state.screen.stream =
        stream;

      state.screen.active =
        true;

      state.screen.videoReady =
        false;

      screenCaptureVideo.srcObject =
        stream;

      screenCaptureVideo.muted =
        true;

      screenCaptureVideo.playsInline =
        true;

      await screenCaptureVideo.play()
        .catch(() => {});

      state.screen.videoReady =
        true;

      hideAllMainSources();

      screenCaptureVideo.classList.add(
        "active"
      );

      if (welcomeContent) {
        welcomeContent.style.display =
          "none";
      }

      state.main.type =
        "screen";

      updateStageSource();

      updateScreenStatus(
        true
      );

      connectScreenAudio(
        stream
      );

      const videoTrack =
        stream.getVideoTracks()[0];

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

      showToast(
        "Screen capture started."
      );

      renderCompositionFrame();

    } catch (error) {

      console.error(
        "Screen capture:",
        error
      );

      if (
        error.name ===
        "NotAllowedError"
      ) {

        showToast(
          "Screen sharing was cancelled or permission was denied."
        );

      } else {

        showToast(
          "Could not start screen capture."
        );
      }
    }
  }


  function stopScreenCapture(
    silent = false
  ) {

    if (state.screen.stream) {

      state.screen.stream
        .getTracks()
        .forEach(track => {

          try {
            track.stop();
          } catch (_) {}

        });
    }

    disconnectScreenAudio();

    state.screen.stream =
      null;

    state.screen.active =
      false;

    state.screen.videoReady =
      false;

    if (screenCaptureVideo) {

      screenCaptureVideo.pause();

      screenCaptureVideo.srcObject =
        null;

      screenCaptureVideo.classList.remove(
        "active"
      );
    }

    if (
      state.main.type ===
      "screen"
    ) {

      showWelcome();
    }

    updateScreenStatus(
      false
    );

    if (!silent) {

      showToast(
        "Screen capture stopped."
      );
    }
  }


  function updateScreenStatus(
    active
  ) {

    if (screenIndicator) {

      screenIndicator.classList.toggle(
        "online",
        active
      );
    }

    if (
      screenCaptureStatusLight
    ) {

      screenCaptureStatusLight.classList.toggle(
        "online",
        active
      );
    }

    if (screenCaptureStatus) {

      const text =
        active
          ? "Screen capture is active"
          : "Screen capture is off";

      const span =
        screenCaptureStatus.querySelector(
          "span:last-child"
        );

      if (span) {
        span.textContent =
          text;
      } else {
        screenCaptureStatus.textContent =
          text;
      }
    }
  }


  function connectScreenAudio(
    stream
  ) {

    if (
      !state.audio.context ||
      !stream
    ) {
      return;
    }

    disconnectScreenAudio();

    const tracks =
      stream.getAudioTracks();

    if (!tracks.length) {
      return;
    }

    try {

      const audioOnlyStream =
        new MediaStream(
          tracks
        );

      const source =
        state.audio.context
          .createMediaStreamSource(
            audioOnlyStream
          );

      const gain =
        state.audio.context
          .createGain();

      gain.gain.value =
        1;

      source.connect(
        gain
      );

      gain.connect(
        state.audio.destination
      );

      state.audio.screenSource =
        source;

      state.audio.screenGain =
        gain;

      updateAudioStatus();

    } catch (error) {

      console.warn(
        "Screen audio:",
        error
      );
    }
  }


  function disconnectScreenAudio() {

    try {
      state.audio.screenSource?.disconnect();
    } catch (_) {}

    try {
      state.audio.screenGain?.disconnect();
    } catch (_) {}

    state.audio.screenSource =
      null;

    state.audio.screenGain =
      null;

    updateAudioStatus();
  }


  /* =========================================================
     COMPOSITION CANVAS
     ========================================================= */

  function ensureCompositionCanvas() {

    const dimensions =
      getRecordingDimensions();

    if (!state.recording.canvas) {

      state.recording.canvas =
        document.createElement(
          "canvas"
        );
    }

    const canvas =
      state.recording.canvas;

    if (
      canvas.width !==
        dimensions.width ||
      canvas.height !==
        dimensions.height
    ) {

      canvas.width =
        dimensions.width;

      canvas.height =
        dimensions.height;
    }

    if (!state.recording.context) {

      state.recording.context =
        canvas.getContext(
          "2d"
        );
    }

    return canvas;
  }


  function renderCompositionFrame() {

    const canvas =
      ensureCompositionCanvas();

    const ctx =
      state.recording.context;

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

    /*
     * Background
     */

    ctx.fillStyle =
      "#000";

    ctx.fillRect(
      0,
      0,
      width,
      height
    );


    /*
     * Main source
     */

    if (
      state.main.type ===
      "image" &&
      state.main.image
    ) {

      drawImageCover(
        ctx,
        state.main.image,
        0,
        0,
        width,
        height
      );

    } else if (
      state.main.type ===
      "video" &&
      isVideoReady(mainVideo)
    ) {

      drawVideoContain(
        ctx,
        mainVideo,
        0,
        0,
        width,
        height
      );

    } else if (
      state.main.type ===
      "screen" &&
      state.screen.videoReady &&
      isVideoReady(
        screenCaptureVideo
      )
    ) {

      drawVideoContain(
        ctx,
        screenCaptureVideo,
        0,
        0,
        width,
        height
      );

    } else {

      drawStudioWelcome(
        ctx,
        width,
        height
      );
    }


    /*
     * Mentor overlay
     */

    if (
      mentorCard &&
      mentorCard.offsetParent !==
        null
    ) {

      drawMentorOverlay(
        ctx,
        width,
        height
      );
    }


    /*
     * Brand badge
     */

    drawBrandBadge(
      ctx,
      width,
      height
    );
  }


  function drawVideoContain(
    ctx,
    video,
    x,
    y,
    width,
    height
  ) {

    const sourceWidth =
      video.videoWidth;

    const sourceHeight =
      video.videoHeight;

    if (
      !sourceWidth ||
      !sourceHeight
    ) {
      return;
    }

    const ratio =
      Math.min(
        width / sourceWidth,
        height / sourceHeight
      );

    const drawWidth =
      sourceWidth * ratio;

    const drawHeight =
      sourceHeight * ratio;

    const drawX =
      x +
      (width - drawWidth) / 2;

    const drawY =
      y +
      (height - drawHeight) / 2;

    ctx.drawImage(
      video,
      drawX,
      drawY,
      drawWidth,
      drawHeight
    );
  }


  function drawStudioWelcome(
    ctx,
    width,
    height
  ) {

    ctx.fillStyle =
      "#07111d";

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
      "#8fa4bd";

    ctx.font =
      `${Math.round(height * 0.035)}px system-ui`;

    ctx.fillText(
      "Personal Course Studio",
      width / 2,
      height / 2 - 25
    );

    ctx.fillStyle =
      "#4da3ff";

    ctx.font =
      `${Math.round(height * 0.018)}px system-ui`;

    ctx.fillText(
      "Upload a slide or video to begin",
      width / 2,
      height / 2 + 30
    );
  }


  function drawMentorOverlay(
    ctx,
    canvasWidth,
    canvasHeight
  ) {

    const stageRect =
      stage.getBoundingClientRect();

    const cardRect =
      mentorCard.getBoundingClientRect();

    if (
      !stageRect.width ||
      !stageRect.height
    ) {
      return;
    }

    const scaleX =
      canvasWidth /
      stageRect.width;

    const scaleY =
      canvasHeight /
      stageRect.height;

    const x =
      (
        cardRect.left -
        stageRect.left
      ) *
      scaleX;

    const y =
      (
        cardRect.top -
        stageRect.top
      ) *
      scaleY;

    const width =
      cardRect.width *
      scaleX;

    const height =
      cardRect.height *
      scaleY;

    ctx.save();

    /*
     * Rounded clipping
     */

    const radius =
      Math.min(
        24,
        width * 0.08
      );

    roundedRect(
      ctx,
      x,
      y,
      width,
      height,
      radius
    );

    ctx.clip();


    /*
     * Mentor source
     */

    if (
      state.mentor.type ===
      "video" &&
      isVideoReady(
        mentorVideo
      )
    ) {

      drawMirroredCover(
        ctx,
        mentorVideo,
        x,
        y,
        width,
        height
      );

    } else if (
      state.mentor.type ===
      "camera"
    ) {

      if (
        state.background.mode ===
        "original"
      ) {

        drawMirroredCover(
          ctx,
          mentorCameraVideo,
          x,
          y,
          width,
          height
        );

      } else if (
        mentorAICanvas &&
        mentorAICanvas.width
      ) {

        drawCanvasCover(
          ctx,
          mentorAICanvas,
          x,
          y,
          width,
          height
        );
      }
    }

    ctx.restore();


    /*
     * Mentor border
     */

    ctx.save();

    ctx.strokeStyle =
      "rgba(255,255,255,.16)";

    ctx.lineWidth =
      Math.max(
        1,
        canvasWidth / 1600
      );

    roundedRect(
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


  function drawMirroredCover(
    ctx,
    video,
    x,
    y,
    width,
    height
  ) {

    const sourceWidth =
      video.videoWidth;

    const sourceHeight =
      video.videoHeight;

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

    let sx = 0;
    let sy = 0;
    let sw = sourceWidth;
    let sh = sourceHeight;

    if (
      sourceRatio >
      targetRatio
    ) {

      sw =
        sourceHeight *
        targetRatio;

      sx =
        (sourceWidth - sw) / 2;

    } else {

      sh =
        sourceWidth /
        targetRatio;

      sy =
        (sourceHeight - sh) / 2;
    }

    ctx.save();

    ctx.translate(
      x + width,
      y
    );

    ctx.scale(
      -1,
      1
    );

    ctx.drawImage(
      video,
      sx,
      sy,
      sw,
      sh,
      0,
      0,
      width,
      height
    );

    ctx.restore();
  }


  function drawCanvasCover(
    ctx,
    source,
    x,
    y,
    width,
    height
  ) {

    const sourceWidth =
      source.width;

    const sourceHeight =
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

    let sx = 0;
    let sy = 0;
    let sw = sourceWidth;
    let sh = sourceHeight;

    if (
      sourceRatio >
      targetRatio
    ) {

      sw =
        sourceHeight *
        targetRatio;

      sx =
        (sourceWidth - sw) / 2;

    } else {

      sh =
        sourceWidth /
        targetRatio;

      sy =
        (sourceHeight - sh) / 2;
    }

    ctx.drawImage(
      source,
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


  function roundedRect(
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


  function drawBrandBadge(
    ctx,
    width,
    height
  ) {

    const text =
      state.settings.brandName ||
      "Personal Course Studio";

    ctx.save();

    const fontSize =
      Math.max(
        15,
        Math.round(
          width * 0.009
        )
      );

    ctx.font =
      `800 ${fontSize}px system-ui`;

    const paddingX =
      fontSize * .75;

    const paddingY =
      fontSize * .45;

    const metrics =
      ctx.measureText(text);

    const boxWidth =
      metrics.width +
      paddingX * 2;

    const boxHeight =
      fontSize +
      paddingY * 2;

    const x =
      width * 0.018;

    const y =
      height -
      height * 0.018 -
      boxHeight;

    ctx.fillStyle =
      "rgba(4,10,17,.78)";

    roundedRect(
      ctx,
      x,
      y,
      boxWidth,
      boxHeight,
      fontSize * .35
    );

    ctx.fill();

    ctx.fillStyle =
      "#ffffff";

    ctx.textBaseline =
      "middle";

    ctx.textAlign =
      "left";

    ctx.fillText(
      text,
      x + paddingX,
      y +
      boxHeight / 2
    );

    ctx.restore();
  }


  /* =========================================================
     CONTINUOUS RENDER LOOP
     ========================================================= */

  function startRenderLoop() {

    if (state.recording.renderLoop) {
      return;
    }

    state.recording.renderLoop =
      true;

    const loop = () => {

      if (
        !state.recording.renderLoop
      ) {
        return;
      }

      renderCompositionFrame();

      if (
        state.camera.started &&
        state.background.mode !==
          "original"
      ) {

        processCameraFrame();
      }

      state.recording.renderFrame =
        requestAnimationFrame(
          loop
        );
    };

    state.recording.renderFrame =
      requestAnimationFrame(
        loop
      );
  }


  function stopRenderLoop() {

    state.recording.renderLoop =
      false;

    if (
      state.recording.renderFrame
    ) {

      cancelAnimationFrame(
        state.recording.renderFrame
      );

      state.recording.renderFrame =
        0;
    }
  }


  /* =========================================================
     MEDIARECORDER MIME
     ========================================================= */

  function getSupportedMimeType() {

    const types = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4"
    ];

    if (
      typeof MediaRecorder ===
      "undefined"
    ) {
      return "";
    }

    for (const type of types) {

      try {

        if (
          MediaRecorder.isTypeSupported(
            type
          )
        ) {
          return type;
        }

      } catch (_) {}
    }

    return "";
  }


  /* =========================================================
     RECORDING
     ========================================================= */

  async function startRecording() {

    if (
      state.recording.active
    ) {

      if (state.recording.paused) {
        resumeRecording();
      } else {
        pauseRecording();
      }

      return;
    }

    if (
      typeof MediaRecorder ===
      "undefined"
    ) {

      showToast(
        "MediaRecorder is not supported."
      );

      return;
    }


    await ensureAudioEngine();


    /*
     * Create composition canvas
     */

    const canvas =
      ensureCompositionCanvas();

    renderCompositionFrame();


    /*
     * Canvas stream
     */

    let canvasStream;

    try {

      canvasStream =
        canvas.captureStream(
          state.recording.fps
        );

    } catch (error) {

      console.error(
        "captureStream:",
        error
      );

      showToast(
        "Canvas recording is not supported."
      );

      return;
    }


    /*
     * Audio tracks
     */

    const audioTracks =
      state.audio.destination
        ? state.audio.destination
            .stream
            .getAudioTracks()
        : [];


    /*
     * Combined stream
     */

    const combinedStream =
      new MediaStream();

    canvasStream
      .getVideoTracks()
      .forEach(track => {

        combinedStream.addTrack(
          track
        );

      });

    audioTracks.forEach(track => {

      combinedStream.addTrack(
        track
      );

    });


    if (
      !combinedStream
        .getVideoTracks()
        .length
    ) {

      showToast(
        "No video track is available for recording."
      );

      return;
    }


    const mimeType =
      getSupportedMimeType();

    const dimensions =
      getRecordingDimensions();


    /*
     * Bitrate
     */

    let videoBitsPerSecond =
      8_000_000;

    if (
      state.recording.quality ===
      720
    ) {

      videoBitsPerSecond =
        4_500_000;

    } else if (
      state.recording.quality ===
      1440
    ) {

      videoBitsPerSecond =
        12_000_000;
    }


    const options = {
      videoBitsPerSecond,

      audioBitsPerSecond:
        160_000
    };

    if (mimeType) {
      options.mimeType =
        mimeType;
    }


    let recorder;

    try {

      recorder =
        new MediaRecorder(
          combinedStream,
          options
        );

    } catch (error) {

      console.error(
        "MediaRecorder:",
        error
      );

      showToast(
        "Could not create recorder."
      );

      return;
    }


    state.recording.recorder =
      recorder;

    state.recording.chunks =
      [];

    state.recording.captureStream =
      canvasStream;

    state.recording.combinedStream =
      combinedStream;

    state.recording.mimeType =
      recorder.mimeType ||
      mimeType ||
      "video/webm";


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
          "Recorder error:",
          event.error
        );

        showToast(
          "Recording error occurred."
        );
      };


    recorder.onstop =
      handleRecorderStop;


    state.recording.active =
      true;

    state.recording.paused =
      false;

    state.recording.startedAt =
      performance.now();

    state.recording.elapsedBeforePause =
      0;


    updateRecordingButtons();

    updateRecordingTimer();

    startTimer();

    setRecordingStatus(
      `Recording ${dimensions.width}×${dimensions.height}`,
      true
    );


    /*
     * Start render loop BEFORE recording
     */

    startRenderLoop();


    /*
     * Start recorder
     */

    try {

      recorder.start(1000);

    } catch (error) {

      console.error(
        "recorder.start:",
        error
      );

      cleanupRecordingStream();

      state.recording.active =
        false;

      stopTimer();
      stopRenderLoop();

      showToast(
        "Could not start recording."
      );

      return;
    }


    /*
     * Teleprompter
     */

    if (
      state.settings
        .autoStartTeleprompter
    ) {

      startTeleprompter();
    }


    showToast(
      `Recording started — ${dimensions.width}×${dimensions.height} @ ${state.recording.fps} FPS`
    );
  }


  function pauseRecording() {

    if (
      !state.recording.active ||
      state.recording.paused
    ) {
      return;
    }

    const recorder =
      state.recording.recorder;

    if (
      !recorder ||
      recorder.state !==
        "recording"
    ) {
      return;
    }

    try {

      recorder.pause();

      state.recording.elapsedBeforePause =
        getRecordingElapsed();

      state.recording.paused =
        true;

      stopTimer();

      setRecordingStatus(
        "Paused",
        false
      );

      updateRecordingButtons();

      showToast(
        "Recording paused."
      );

    } catch (error) {

      console.error(
        "pause:",
        error
      );
    }
  }


  function resumeRecording() {

    if (
      !state.recording.active ||
      !state.recording.paused
    ) {
      return;
    }

    const recorder =
      state.recording.recorder;

    if (
      !recorder ||
      recorder.state !==
        "paused"
    ) {
      return;
    }

    try {

      recorder.resume();

      state.recording.startedAt =
        performance.now();

      state.recording.paused =
        false;

      startTimer();

      setRecordingStatus(
        "Recording",
        true
      );

      updateRecordingButtons();

      showToast(
        "Recording resumed."
      );

    } catch (error) {

      console.error(
        "resume:",
        error
      );
    }
  }


  function stopRecording() {

    if (
      !state.recording.active
    ) {
      return;
    }

    const recorder =
      state.recording.recorder;

    if (!recorder) {
      return;
    }

    try {

      if (
        recorder.state ===
        "recording" ||
        recorder.state ===
        "paused"
      ) {

        recorder.stop();
      }

    } catch (error) {

      console.error(
        "stop:",
        error
      );
    }
  }


  function handleRecorderStop() {

    stopTimer();

    state.recording.active =
      false;

    state.recording.paused =
      false;

    state.recording.elapsedBeforePause =
      getRecordingElapsed();

    stopRenderLoop();

    updateRecordingButtons();

    setRecordingStatus(
      "Processing recording...",
      false
    );


    const blob =
      new Blob(
        state.recording.chunks,
        {
          type:
            state.recording.mimeType ||
            "video/webm"
        }
      );

    state.recording.blob =
      blob;

    if (state.recording.url) {

      URL.revokeObjectURL(
        state.recording.url
      );
    }

    state.recording.url =
      URL.createObjectURL(
        blob
      );


    cleanupRecordingStream();


    /*
     * Preview
     */

    if (recordingPreviewVideo) {

      recordingPreviewVideo.src =
        state.recording.url;

      recordingPreviewVideo.load();
    }


    if (downloadRecordingBtn) {

      downloadRecordingBtn.href =
        state.recording.url;

      downloadRecordingBtn.download =
        `mentor-studio-${getDateFileName()}.webm`;
    }


    if (recordingFileInfo) {

      const mb =
        (
          blob.size /
          1024 /
          1024
        ).toFixed(2);

      recordingFileInfo.innerHTML =
        `
          <strong>Recording ready</strong><br>
          Size: ${mb} MB<br>
          Quality: ${state.recording.quality}p<br>
          FPS: ${state.recording.fps}<br>
          Duration: ${formatTime(
            state.recording.elapsedBeforePause
          )}
        `;
    }


    setRecordingStatus(
      "Recording ready",
      false
    );


    if (recordingPreviewModal) {

      recordingPreviewModal.classList.add(
        "show"
      );
    }


    showToast(
      "Recording completed successfully."
    );
  }


  function cleanupRecordingStream() {

    if (
      state.recording.captureStream
    ) {

      state.recording.captureStream
        .getTracks()
        .forEach(track => {

          try {
            track.stop();
          } catch (_) {}

        });
    }

    state.recording.captureStream =
      null;

    state.recording.combinedStream =
      null;

    state.recording.recorder =
      null;
  }


  function getDateFileName() {

    const now =
      new Date();

    const parts = [
      now.getFullYear(),
      String(
        now.getMonth() + 1
      ).padStart(2, "0"),
      String(
        now.getDate()
      ).padStart(2, "0"),
      "-",
      String(
        now.getHours()
      ).padStart(2, "0"),
      String(
        now.getMinutes()
      ).padStart(2, "0"),
      String(
        now.getSeconds()
      ).padStart(2, "0")
    ];

    return parts.join("");
  }


  function deleteRecording() {

    if (state.recording.url) {

      URL.revokeObjectURL(
        state.recording.url
      );
    }

    state.recording.url =
      null;

    state.recording.blob =
      null;

    state.recording.chunks =
      [];

    if (recordingPreviewVideo) {

      recordingPreviewVideo.pause();

      recordingPreviewVideo.removeAttribute(
        "src"
      );

      recordingPreviewVideo.load();
    }

    if (downloadRecordingBtn) {

      downloadRecordingBtn.removeAttribute(
        "href"
      );
    }

    recordingPreviewModal?.classList.remove(
      "show"
    );

    setRecordingStatus(
      "Ready",
      false
    );

    showToast(
      "Recording deleted."
    );
  }


  function recordAgain() {

    recordingPreviewModal?.classList.remove(
      "show"
    );

    if (state.recording.blob) {

      if (recordingPreviewVideo) {
        recordingPreviewVideo.pause();
      }
    }

    state.recording.elapsedBeforePause =
      0;

    updateRecordingTimer();

    startRecording();
  }


  /* =========================================================
     FULLSCREEN
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

      } else {

        showToast(
          "Fullscreen is not supported."
        );
      }

    } catch (error) {

      console.error(
        "Stage fullscreen:",
        error
      );

      showToast(
        "Could not enter fullscreen."
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

      if (
        app?.requestFullscreen
      ) {

        await app.requestFullscreen();

      } else {

        showToast(
          "Fullscreen is not supported."
        );
      }

    } catch (error) {

      console.error(
        "Studio fullscreen:",
        error
      );

      showToast(
        "Could not enter fullscreen."
      );
    }
  }


  function handleFullscreenChange() {

    document.body.classList.toggle(
      "fullscreen-active",
      !!document.fullscreenElement
    );
  }


  /* =========================================================
     SETTINGS
     ========================================================= */

  function openSettings() {

    if (!settingsModal) return;

    if (brandNameInput) {

      brandNameInput.value =
        state.settings.brandName;
    }

    if (
      settingsRecordingQuality
    ) {

      settingsRecordingQuality.value =
        String(
          state.recording.quality
        );
    }

    if (settingsRecordingFps) {

      settingsRecordingFps.value =
        String(
          state.recording.fps
        );
    }

    if (
      settingsAutoStartTeleprompter
    ) {

      settingsAutoStartTeleprompter.checked =
        state.settings
          .autoStartTeleprompter;
    }

    if (
      settingsShowTeleprompterRecording
    ) {

      settingsShowTeleprompterRecording.checked =
        state.settings
          .showTeleprompterRecording;
    }

    settingsModal.classList.add(
      "show"
    );
  }


  function closeSettings() {

    settingsModal?.classList.remove(
      "show"
    );
  }


  function saveSettings() {

    state.settings.brandName =
      (
        brandNameInput?.value ||
        "Personal Course Studio"
      ).trim();

    state.settings
      .autoStartTeleprompter =
      !!settingsAutoStartTeleprompter?.checked;

    state.settings
      .showTeleprompterRecording =
      !!settingsShowTeleprompterRecording?.checked;


    const quality =
      Number(
        settingsRecordingQuality?.value ||
        state.recording.quality
      );

    const fps =
      Number(
        settingsRecordingFps?.value ||
        state.recording.fps
      );


    localStorage.setItem(
      "mentorStudioBrandName",
      state.settings.brandName
    );

    localStorage.setItem(
      "mentorStudioAutoStartTeleprompter",
      String(
        state.settings
          .autoStartTeleprompter
      )
    );

    localStorage.setItem(
      "mentorStudioShowTeleprompterRecording",
      String(
        state.settings
          .showTeleprompterRecording
      )
    );


    if (brandBadge) {

      brandBadge.textContent =
        state.settings.brandName;
    }

    const title =
      byId("studioTitle");

    if (title) {

      title.textContent =
        state.settings.brandName
          .replace(
            "Personal Course Studio",
            "Mentor Studio"
          );
    }


    setQuality(
      quality
    );

    setFPS(
      fps
    );


    closeSettings();

    showToast(
      "Studio settings saved."
    );
  }


  /* =========================================================
     STUDENTS
     ========================================================= */

  function loadStudents() {

    try {

      const saved =
        JSON.parse(
          localStorage.getItem(
            "mentorStudioStudents"
          ) || "[]"
        );

      if (Array.isArray(saved)) {
        state.students =
          saved;
      }

    } catch (_) {

      state.students =
        [];
    }

    renderStudents();
  }


  function saveStudents() {

    localStorage.setItem(
      "mentorStudioStudents",
      JSON.stringify(
        state.students
      )
    );
  }


  function renderStudents() {

    if (!studentsList) {
      return;
    }

    studentsList.innerHTML =
      "";

    if (!state.students.length) {

      const empty =
        document.createElement(
          "div"
        );

      empty.className =
        "upload-box";

      empty.textContent =
        "No students added yet.";

      studentsList.appendChild(
        empty
      );

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
          "● Online";

        info.appendChild(
          name
        );

        info.appendChild(
          status
        );


        const remove =
          document.createElement(
            "button"
          );

        remove.type =
          "button";

        remove.className =
          "student-remove";

        remove.textContent =
          "×";

        remove.title =
          "Remove student";

        remove.addEventListener(
          "click",
          () => {

            state.students.splice(
              index,
              1
            );

            saveStudents();

            renderStudents();

            showToast(
              "Student removed."
            );
          }
        );


        item.appendChild(
          avatar
        );

        item.appendChild(
          info
        );

        item.appendChild(
          remove
        );

        studentsList.appendChild(
          item
        );
      }
    );
  }


  function getInitials(name) {

    return String(name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(
        part =>
          part
            .charAt(0)
            .toUpperCase()
      )
      .join("") ||
      "ST";
  }


  function openStudentModal() {

    studentNameInput.value =
      "";

    studentModal.classList.add(
      "show"
    );

    setTimeout(() => {

      studentNameInput.focus();

    }, 100);
  }


  function closeStudentModal() {

    studentModal?.classList.remove(
      "show"
    );
  }


  function saveStudent() {

    const name =
      (
        studentNameInput?.value ||
        ""
      ).trim();

    if (!name) {

      showToast(
        "Enter a student name."
      );

      return;
    }

    state.students.push({
      name,
      createdAt:
        Date.now()
    });

    saveStudents();

    renderStudents();

    closeStudentModal();

    showToast(
      `${name} added.`
    );
  }


  /* =========================================================
     TELEPROMPTER
     ========================================================= */

  function loadTeleprompterSettings() {

    if (teleprompterText) {
      teleprompterText.value =
        state.teleprompter.text;
    }

    if (teleprompterSpeed) {
      teleprompterSpeed.value =
        state.teleprompter.speed;
    }

    if (teleprompterFontSize) {
      teleprompterFontSize.value =
        state.teleprompter.fontSize;
    }

    if (teleprompterOpacity) {
      teleprompterOpacity.value =
        state.teleprompter.opacity;
    }

    updateTeleprompterPreview();
    updateMiniTeleprompter();
  }


  function openTeleprompter() {

    updateTeleprompterPreview();

    teleprompterModal?.classList.add(
      "show"
    );
  }


  function closeTeleprompter() {

    teleprompterModal?.classList.remove(
      "show"
    );
  }


  function updateTeleprompterPreview() {

    if (!teleprompterPreview) {
      return;
    }

    const text =
      teleprompterText?.value ||
      state.teleprompter.text ||
      "Your teleprompter text will appear here.";

    teleprompterPreview.textContent =
      text;

    teleprompterPreview.style.fontSize =
      `${safeNumber(
        teleprompterFontSize?.value,
        state.teleprompter.fontSize
      )}px`;

    teleprompterPreview.style.opacity =
      String(
        safeNumber(
          teleprompterOpacity?.value,
          state.teleprompter.opacity
        ) / 100
      );
  }


  function updateMiniTeleprompter() {

    if (!teleprompterMiniPreview) {
      return;
    }

    const text =
      state.teleprompter.text
        .trim();

    if (!text) {

      teleprompterMiniPreview.innerHTML =
        `
          <div class="teleprompter-mini-empty">
            No script loaded.
          </div>
        `;

      return;
    }

    const preview =
      text.length > 380
        ? `${text.slice(0, 380)}…`
        : text;

    teleprompterMiniPreview.textContent =
      preview;
  }


  function saveTeleprompter() {

    state.teleprompter.text =
      teleprompterText?.value ||
      "";

    state.teleprompter.speed =
      safeNumber(
        teleprompterSpeed?.value,
        60
      );

    state.teleprompter.fontSize =
      safeNumber(
        teleprompterFontSize?.value,
        30
      );

    state.teleprompter.opacity =
      safeNumber(
        teleprompterOpacity?.value,
        92
      );


    localStorage.setItem(
      "mentorStudioTeleprompterText",
      state.teleprompter.text
    );

    localStorage.setItem(
      "mentorStudioTeleprompterSpeed",
      String(
        state.teleprompter.speed
      )
    );

    localStorage.setItem(
      "mentorStudioTeleprompterFontSize",
      String(
        state.teleprompter.fontSize
      )
    );

    localStorage.setItem(
      "mentorStudioTeleprompterOpacity",
      String(
        state.teleprompter.opacity
      )
    );


    updateMiniTeleprompter();

    showToast(
      "Teleprompter saved."
    );
  }


  function resetTeleprompter() {

    stopTeleprompter();

    state.teleprompter.text =
      "";

    state.teleprompter.scrollPosition =
      0;

    teleprompterText.value =
      "";

    if (teleprompterPreview) {

      teleprompterPreview.scrollTop =
        0;
    }

    updateTeleprompterPreview();
    updateMiniTeleprompter();

    localStorage.removeItem(
      "mentorStudioTeleprompterText"
    );

    showToast(
      "Teleprompter reset."
    );
  }


  function startTeleprompter() {

    if (
      state.teleprompter.playing
    ) {
      return;
    }

    if (
      !state.teleprompter.text.trim()
    ) {

      state.teleprompter.text =
        teleprompterText?.value ||
        "";

      if (
        !state.teleprompter.text.trim()
      ) {

        showToast(
          "Add a teleprompter script first."
        );

        return;
      }
    }

    state.teleprompter.playing =
      true;

    state.teleprompter.lastTime =
      performance.now();

    const animate =
      now => {

        if (
          !state.teleprompter.playing
        ) {
          return;
        }

        const delta =
          now -
          state.teleprompter.lastTime;

        state.teleprompter.lastTime =
          now;

        if (teleprompterPreview) {

          const speed =
            state.teleprompter.speed /
            100;

          teleprompterPreview.scrollTop +=
            (
              delta *
              speed *
              0.08
            );

          state.teleprompter.scrollPosition =
            teleprompterPreview.scrollTop;
        }

        state.teleprompter.animationFrame =
          requestAnimationFrame(
            animate
          );
      };

    state.teleprompter.animationFrame =
      requestAnimationFrame(
        animate
      );
  }


  function stopTeleprompter() {

    state.teleprompter.playing =
      false;

    if (
      state.teleprompter.animationFrame
    ) {

      cancelAnimationFrame(
        state.teleprompter.animationFrame
      );

      state.teleprompter.animationFrame =
        null;
    }
  }


  function loadTeleprompterFile(
    file
  ) {

    if (!file) return;

    if (
      file.type !== "text/plain" &&
      !file.name.toLowerCase().endsWith(".txt")
    ) {

      showToast(
        "Please select a TXT file."
      );

      return;
    }

    const reader =
      new FileReader();

    reader.onload =
      event => {

        state.teleprompter.text =
          String(
            event.target.result ||
            ""
          );

        teleprompterText.value =
          state.teleprompter.text;

        updateTeleprompterPreview();
        updateMiniTeleprompter();

        saveTeleprompter();

        showToast(
          "Teleprompter file loaded."
        );
      };

    reader.onerror =
      () => {

        showToast(
          "Could not read TXT file."
        );
      };

    reader.readAsText(
      file,
      "UTF-8"
    );
  }


  /* =========================================================
     KEYBOARD SHORTCUTS
     ========================================================= */

  function handleKeyboard(
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
        target.tagName ===
        "SELECT" ||
        target.isContentEditable
      );


    /*
     * Escape
     */

    if (
      event.key ===
      "Escape"
    ) {

      if (
        document.fullscreenElement
      ) {

        document.exitFullscreen()
          .catch(() => {});

        return;
      }

      closeAllModals();

      return;
    }


    /*
     * Don't trigger shortcuts while typing.
     */

    if (isTyping) {
      return;
    }


    /*
     * Space
     */

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

        return;
      }

      if (
        state.main.type ===
        "video"
      ) {

        if (
          mainVideo.paused
        ) {

          playMainVideo();

        } else {

          pauseMainVideo();
        }
      }

      return;
    }


    /*
     * Ctrl + Enter
     */

    if (
      event.ctrlKey &&
      event.key === "Enter"
    ) {

      event.preventDefault();

      if (
        state.recording.active
      ) {

        stopRecording();

      } else {

        startRecording();
      }

      return;
    }


    /*
     * Ctrl + Shift + S
     */

    if (
      event.ctrlKey &&
      event.shiftKey &&
      event.key.toLowerCase() === "s"
    ) {

      event.preventDefault();

      if (
        state.screen.active
      ) {

        stopScreenCapture();

      } else {

        startScreenCapture();
      }

      return;
    }


    /*
     * Ctrl + Shift + F
     */

    if (
      event.ctrlKey &&
      event.shiftKey &&
      event.key.toLowerCase() === "f"
    ) {

      event.preventDefault();

      toggleStageFullscreen();

      return;
    }


    /*
     * Ctrl + Shift + G
     */

    if (
      event.ctrlKey &&
      event.shiftKey &&
      event.key.toLowerCase() === "g"
    ) {

      event.preventDefault();

      toggleStudioFullscreen();

      return;
    }


    /*
     * Ctrl + Shift + R
     */

    if (
      event.ctrlKey &&
      event.shiftKey &&
      event.key.toLowerCase() === "r"
    ) {

      event.preventDefault();

      if (
        state.recording.active
      ) {

        stopRecording();

      } else {

        startRecording();
      }
    }
  }


  function closeAllModals() {

    $$(".modal-backdrop.show")
      .forEach(modal => {

        modal.classList.remove(
          "show"
        );
      });
  }


  /* =========================================================
     EVENTS
     ========================================================= */

  function initializeEvents() {

    /*
     * Main files
     */

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

    mainFileInput?.addEventListener(
      "change",
      event =>
        loadMainImage(
          event.target.files?.[0]
        )
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

    mainVideoInput?.addEventListener(
      "change",
      event =>
        loadMainVideo(
          event.target.files?.[0]
        )
    );


    /*
     * Main video controls
     */

    mainPlayBtn?.addEventListener(
      "click",
      playMainVideo
    );

    mainPauseBtn?.addEventListener(
      "click",
      pauseMainVideo
    );


    /*
     * Mentor
     */

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

    mentorFileInput?.addEventListener(
      "change",
      event =>
        loadMentorVideo(
          event.target.files?.[0]
        )
    );


    /*
     * Camera
     */

    cameraStartButtons.forEach(
      button =>
        button.addEventListener(
          "click",
          startCamera
        )
    );

    cameraStopButtons.forEach(
      button =>
        button.addEventListener(
          "click",
          () => stopCamera()
        )
    );

    switchCameraButton?.addEventListener(
      "click",
      switchCamera
    );


    /*
     * Background
     */

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
      () =>
        setBackgroundMode(
          "image"
        )
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
      event => {

        state.background.color =
          event.target.value;

        if (
          state.background.mode ===
          "color"
        ) {

          renderCompositionFrame();
        }
      }
    );


    /*
     * Background file
     */

    backgroundImageUpload?.addEventListener(
      "change",
      event =>
        loadBackgroundImage(
          event.target.files?.[0]
        )
    );

    uploadBackgroundSideBtn?.addEventListener(
      "click",
      () =>
        backgroundImageUpload?.click()
    );


    /*
     * Screen capture
     */

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
        stopScreenCapture()
    );


    /*
     * Recording
     */

    recordBtn?.addEventListener(
      "click",
      startRecording
    );

    recordToolbarBtn?.addEventListener(
      "click",
      startRecording
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


    /*
     * Quality
     */

    recordingQuality?.addEventListener(
      "change",
      event =>
        setQuality(
          event.target.value
        )
    );

    recordingQualitySide?.addEventListener(
      "change",
      event =>
        setQuality(
          event.target.value
        )
    );


    /*
     * FPS
     */

    recordingFps?.addEventListener(
      "change",
      event =>
        setFPS(
          event.target.value
        )
    );

    recordingFpsSide?.addEventListener(
      "change",
      event =>
        setFPS(
          event.target.value
        )
    );


    /*
     * Audio
     */

    mainVideoAudioCheckbox?.addEventListener(
      "change",
      async () => {

        await ensureAudioEngine();

        connectMainVideoAudio();

        updateMainAudioSettings();
      }
    );

    mainVideoVolume?.addEventListener(
      "input",
      updateMainAudioSettings
    );

    micVolume?.addEventListener(
      "input",
      updateMicSettings
    );

    micEnabled?.addEventListener(
      "change",
      updateMicSettings
    );

    micMonitor?.addEventListener(
      "change",
      updateMicSettings
    );


    /*
     * Settings
     */

    settingsBtn?.addEventListener(
      "click",
      openSettings
    );

    closeSettingsBtn?.addEventListener(
      "click",
      closeSettings
    );

    closeSettingsFooterBtn?.addEventListener(
      "click",
      closeSettings
    );

    saveSettingsBtn?.addEventListener(
      "click",
      saveSettings
    );


    /*
     * Fullscreen
     */

    fullscreenStageBtn?.addEventListener(
      "click",
      toggleStageFullscreen
    );

    fullscreenStudioBtn?.addEventListener(
      "click",
      toggleStudioFullscreen
    );

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );


    /*
     * Shortcuts
     */

    openShortcutsBtn?.addEventListener(
      "click",
      () =>
        shortcutsModal?.classList.add(
          "show"
        )
    );

    closeShortcutsBtn?.addEventListener(
      "click",
      () =>
        shortcutsModal?.classList.remove(
          "show"
        )
    );


    /*
     * Teleprompter
     */

    [
      openTeleprompterTopBtn,
      openTeleprompterBtn,
      openTeleprompterSide
    ]
      .filter(Boolean)
      .forEach(button => {

        button.addEventListener(
          "click",
          openTeleprompter
        );

      });

    closeTeleprompterBtn?.addEventListener(
      "click",
      closeTeleprompter
    );

    uploadTeleprompterBtn?.addEventListener(
      "click",
      () =>
        teleprompterFileInput?.click()
    );

    teleprompterFileInput?.addEventListener(
      "change",
      event =>
        loadTeleprompterFile(
          event.target.files?.[0]
        )
    );

    teleprompterText?.addEventListener(
      "input",
      updateTeleprompterPreview
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

    teleprompterPlayBtn?.addEventListener(
      "click",
      startTeleprompter
    );

    teleprompterPauseBtn?.addEventListener(
      "click",
      stopTeleprompter
    );

    teleprompterResetBtn?.addEventListener(
      "click",
      resetTeleprompter
    );

    teleprompterSaveBtn?.addEventListener(
      "click",
      () => {

        saveTeleprompter();

        closeTeleprompter();
      }
    );


    /*
     * Students
     */

    addStudentBtn?.addEventListener(
      "click",
      openStudentModal
    );

    closeStudentModalBtn?.addEventListener(
      "click",
      closeStudentModal
    );

    cancelStudentBtn?.addEventListener(
      "click",
      closeStudentModal
    );

    saveStudentBtn?.addEventListener(
      "click",
      saveStudent
    );


    /*
     * Recording preview
     */

    closeRecordingPreviewBtn?.addEventListener(
      "click",
      () =>
        recordingPreviewModal?.classList.remove(
          "show"
        )
    );

    deleteRecordingBtn?.addEventListener(
      "click",
      deleteRecording
    );

    recordAgainBtn?.addEventListener(
      "click",
      recordAgain
    );


    /*
     * Keyboard
     */

    document.addEventListener(
      "keydown",
      handleKeyboard
    );


    /*
     * Main video events
     */

    mainVideo?.addEventListener(
      "play",
      () => {

        renderCompositionFrame();

        startRenderLoop();
      }
    );

    mainVideo?.addEventListener(
      "pause",
      renderCompositionFrame
    );

    mainVideo?.addEventListener(
      "timeupdate",
      () => {

        if (
          !state.recording.active
        ) {
          renderCompositionFrame();
        }
      }
    );


    /*
     * Camera track ended
     */

    window.addEventListener(
      "beforeunload",
      cleanup
    );


    /*
     * Close modal by clicking backdrop
     */

    $$(".modal-backdrop")
      .forEach(backdrop => {

        backdrop.addEventListener(
          "click",
          event => {

            if (
              event.target ===
              backdrop
            ) {

              backdrop.classList.remove(
                "show"
              );
            }
          }
        );
      });


    /*
     * Prevent mentor resize from starting drag
     */

    mentorResize?.addEventListener(
      "mousedown",
      event =>
        event.stopPropagation()
    );

    mentorResize?.addEventListener(
      "touchstart",
      event =>
        event.stopPropagation(),
      {
        passive: false
      }
    );
  }


  /* =========================================================
     INITIALIZE
     ========================================================= */

  async function initialize() {

    /*
     * Settings
     */

    if (brandBadge) {

      brandBadge.textContent =
        state.settings.brandName;
    }

    if (brandNameInput) {

      brandNameInput.value =
        state.settings.brandName;
    }


    /*
     * Initial quality
     */

    updateQualityUI();


    /*
     * Initial background
     */

    state.background.color =
      backgroundColor?.value ||
      "#142238";


    /*
     * Initial audio bridge
     */

    if (
      typeof window.CourseStudioMicVolume !==
      "undefined"
    ) {

      if (micVolume) {

        micVolume.value =
          Math.round(
            window.CourseStudioMicVolume *
            100
          );
      }
    }

    if (
      typeof window.CourseStudioMicEnabled !==
      "undefined"
    ) {

      if (micEnabled) {

        micEnabled.checked =
          window.CourseStudioMicEnabled;
      }
    }

    if (
      typeof window.CourseStudioMicMonitor !==
      "undefined"
    ) {

      if (micMonitor) {

        micMonitor.checked =
          window.CourseStudioMicMonitor;
      }
    }


    /*
     * Initial UI
     */

    updateRecordingButtons();

    updateRecordingTimer();

    updateMicStatus(false);

    updateScreenStatus(false);

    setCameraStatus(false);

    updateAudioStatus();

    showWelcome();


    /*
     * Students
     */

    loadStudents();


    /*
     * Teleprompter
     */

    loadTeleprompterSettings();


    /*
     * Events
     */

    initializeEvents();

    initializeMentorDrag();


    /*
     * AI
     */

    initializeAI();


    /*
     * Device changes
     */

    if (
      navigator.mediaDevices &&
      navigator.mediaDevices.addEventListener
    ) {

      navigator.mediaDevices.addEventListener(
        "devicechange",
        async () => {

          state.camera.devices =
            await getCameraDevices();
        }
      );
    }


    /*
     * Initial render
     */

    renderCompositionFrame();


    console.log(
      "SNK Mentor Studio Step 3.8 initialized."
    );
  }


  /* =========================================================
     CLEANUP
     ========================================================= */

  function cleanup() {

    stopTimer();

    stopRenderLoop();

    stopTeleprompter();

    try {
      state.recording.recorder?.stop();
    } catch (_) {}

    stopCamera(false);

    stopScreenCapture(true);

    cleanupRecordingStream();

    if (state.main.objectUrl) {

      try {
        URL.revokeObjectURL(
          state.main.objectUrl
        );
      } catch (_) {}
    }

    if (state.background.imageUrl) {

      try {
        URL.revokeObjectURL(
          state.background.imageUrl
        );
      } catch (_) {}
    }

    if (state.recording.url) {

      try {
        URL.revokeObjectURL(
          state.recording.url
        );
      } catch (_) {}
    }

    try {
      state.audio.context?.close();
    } catch (_) {}
  }


  /* =========================================================
     PUBLIC API
     ========================================================= */

  window.CourseStudio = {

    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,

    startCamera,
    stopCamera,
    switchCamera,

    startScreenCapture,
    stopScreenCapture,

    startTeleprompter,
    stopTeleprompter,

    openSettings,
    openTeleprompter,

    toggleStageFullscreen,
    toggleStudioFullscreen,

    renderCompositionFrame,

    getState: () => state
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
