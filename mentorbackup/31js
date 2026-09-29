/* =========================================================
   PERSONAL COURSE STUDIO
   MENTOR STUDIO — STEP 3.8
   File: mentor/script.js

   FEATURES
   ---------------------------------------------------------
   MAIN CONTENT
   - Image upload
   - Main video upload
   - Main video play / pause
   - Screen capture source

   MENTOR
   - Mentor video upload
   - Webcam
   - Camera switching
   - Drag
   - Resize

   AI BACKGROUND
   - Original
   - Remove
   - Blur
   - Custom image
   - Solid color
   - Person preserved over background

   AUDIO
   - Main video audio
   - Main volume
   - Microphone
   - Mic volume
   - Mic monitor
   - Web Audio mixing

   TELEPROMPTER
   - TXT upload
   - Auto scroll
   - Font size
   - Speed
   - Opacity
   - Play / pause
   - Start with recording
   - Show while recording

   RECORDING
   - 720p
   - 1080p
   - 1440p
   - 24 FPS
   - 30 FPS
   - 60 FPS
   - Bitrate
   - Start
   - Pause
   - Resume
   - Stop
   - Timer
   - Preview
   - Download
   - Record again
   - Delete

   SCREEN CAPTURE
   - Browser tab
   - Window
   - Screen
   - Capture ended detection

   FULLSCREEN
   - Stage fullscreen
   - Studio fullscreen
   - Browser Fullscreen API when available

   KEYBOARD
   - Ctrl + Enter  = Start recording
   - Ctrl + Shift + R = Start/Stop
   - Ctrl + Shift + S = Screen capture
   - Ctrl + Shift + F = Stage fullscreen
   - Space = Pause/Resume recording
   - Escape = close overlays/fullscreen

   ========================================================= */


(() => {
  "use strict";


  /* =======================================================
     DOM HELPER
     ======================================================= */

  const $ = (selector) =>
    document.querySelector(selector);

  const $$ = (selector) =>
    Array.from(document.querySelectorAll(selector));


  /* =======================================================
     ELEMENTS
     ======================================================= */

  const stage =
    $("#stage");

  const mainImage =
    $("#mainImage");

  const mainVideo =
    $("#mainVideo");

  const welcomeContent =
    $("#welcomeContent");

  const mentorCard =
    $("#mentorCard");

  const mentorVideo =
    $("#mentorVideo");

  const mentorCameraVideo =
    $("#mentorCameraVideo");

  const mentorAICanvas =
    $("#mentorAICanvas");

  const mentorPlaceholder =
    $("#mentorPlaceholder");

  const mentorSourceLabel =
    $("#mentorSourceLabel");

  const brandBadge =
    $("#brandBadge");

  const recordingOverlay =
    $("#recordingOverlay");

  const recordingOverlayTime =
    $("#recordingOverlayTime");

  const recordingOverlayText =
    $("#recordingOverlayText");

  const screenShareBadge =
    $("#screenShareBadge");


  /* =======================================================
     FILE INPUTS
     ======================================================= */

  const mainFileInput =
    $("#mainFileInput");

  const mainVideoInput =
    $("#mainVideoInput");

  const mentorFileInput =
    $("#mentorFileInput");

  const backgroundImageUpload =
    $("#backgroundImageUpload");


  /* =======================================================
     AI CANVASES
     ======================================================= */

  const aiCanvas =
    $("#aiCanvas");

  const aiSourceCanvas =
    $("#aiSourceCanvas");

  const aiMaskCanvas =
    $("#aiMaskCanvas");


  /* =======================================================
     STATE
     ======================================================= */

  const state = {

    main: {
      type: "none",
      objectUrl: null
    },

    mentor: {
      type: "none",
      objectUrl: null
    },

    camera: {
      stream: null,
      deviceIndex: 0,
      devices: []
    },

    screen: {
      stream: null,
      video: null,
      active: false
    },

    ai: {
      enabled: false,
      mode: "original",
      backgroundImage: null,
      segmentation: null,
      processing: false,
      ready: false,
      sourceWidth: 640,
      sourceHeight: 360,
      personCanvas: null,
      personContext: null,
      sourceContext: null,
      maskContext: null
    },

    audio: {
      context: null,
      destination: null,

      mainSource: null,
      mainGain: null,

      micSource: null,
      micGain: null,

      micStream: null,

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

      timerStart: 0,
      pausedAt: 0,
      elapsedBeforePause: 0,

      timerId: null,

      canvasStream: null,
      finalStream: null,

      fps: 30,

      width: 1920,
      height: 1080,

      bitrate: 8000000,

      mimeType:
        "video/webm;codecs=vp9",

      renderLoop: false,

      preview: null
    },

    teleprompter: {
      initialized: false,
      open: false,
      playing: false,
      startWithRecording: false,
      showWhileRecording: true,
      speed: 2,
      fontSize: 32,
      opacity: 0.88,
      text: ""
    },

    settings: {
      brandName:
        "Personal Course Studio"
    },

    composition: {
      canvas: null,
      context: null
    },

    render: {
      raf: null,
      running: false
    }

  };


  /* =======================================================
     INITIALIZE
     ======================================================= */

  function init() {

    setupCompositionCanvas();

    setupAI();

    setupButtons();

    setupFiles();

    setupAudioControls();

    setupTeleprompter();

    setupSettings();

    setupRecordingSettings();

    setupScreenCapture();

    setupFullscreen();

    setupKeyboard();

    setupMentorDragResize();

    restoreSettings();

    restoreRecordingSettings();

    renderMentorState();

    updateStatus();

    startRenderLoop();

    console.log(
      "Personal Course Studio Step 3.8 ready."
    );

  }


  /* =======================================================
     COMPOSITION CANVAS
     ======================================================= */

  function setupCompositionCanvas() {

    const canvas =
      document.createElement("canvas");

    canvas.width = 1920;
    canvas.height = 1080;

    state.composition.canvas =
      canvas;

    state.composition.context =
      canvas.getContext(
        "2d",
        {
          alpha: false,
          desynchronized: true
        }
      );

    applyRecordingResolution();

  }


  function getSelectedResolution() {

    const value =
      $("#recordingResolution")?.value ||
      $("#advancedResolution")?.value ||
      "1920x1080";

    const parts =
      value.split("x").map(Number);

    return {
      width:
        parts[0] || 1920,

      height:
        parts[1] || 1080
    };

  }


  function applyRecordingResolution() {

    const resolution =
      getSelectedResolution();

    state.recording.width =
      resolution.width;

    state.recording.height =
      resolution.height;

    const canvas =
      state.composition.canvas;

    if (!canvas) {
      return;
    }

    canvas.width =
      resolution.width;

    canvas.height =
      resolution.height;

  }


  function getSelectedFPS() {

    const value =
      $("#recordingFPS")?.value ||
      $("#advancedFPS")?.value ||
      "30";

    const fps =
      Number(value);

    return (
      fps === 24 ||
      fps === 60
    )
      ? fps
      : 30;

  }


  function getSelectedBitrate() {

    const value =
      $("#recordingBitrate")?.value ||
      "8000000";

    const bitrate =
      Number(value);

    if (!Number.isFinite(bitrate)) {
      return 8000000;
    }

    return bitrate;

  }


  /* =======================================================
     MAIN CONTENT
     ======================================================= */

  function showMainImage(file) {

    if (!file) {
      return;
    }

    cleanupUrl(
      state.main.objectUrl
    );

    const url =
      URL.createObjectURL(file);

    state.main.objectUrl =
      url;

    mainImage.src =
      url;

    mainImage.style.display =
      "block";

    mainVideo.style.display =
      "none";

    if (
      mainVideo.src
    ) {

      try {
        mainVideo.pause();
      } catch {}

    }

    state.main.type =
      "image";

    hideWelcome();

    renderCompositionFrame();

  }


  function showMainVideo(file) {

    if (!file) {
      return;
    }

    cleanupUrl(
      state.main.objectUrl
    );

    const url =
      URL.createObjectURL(file);

    state.main.objectUrl =
      url;

    mainVideo.src =
      url;

    mainVideo.style.display =
      "block";

    mainImage.style.display =
      "none";

    state.main.type =
      "video";

    hideWelcome();

    initializeMainAudio();

    renderCompositionFrame();

  }


  function hideWelcome() {

    if (!welcomeContent) {
      return;
    }

    welcomeContent.style.display =
      "none";

  }


  /* =======================================================
     SCREEN CAPTURE
     ======================================================= */

  function setupScreenCapture() {

    const button =
      $("#screenCaptureBtn");

    if (!button) {
      return;
    }

    button.addEventListener(
      "click",
      async () => {

        if (
          state.screen.active
        ) {

          stopScreenCapture();

          return;

        }

        await startScreenCapture();

      }
    );

  }


  async function startScreenCapture() {

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getDisplayMedia
    ) {

      showToast(
        "Screen capture is not supported in this browser."
      );

      return;

    }


    try {

      const stream =
        await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,

          preferCurrentTab: false,

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


      const video =
        document.createElement("video");

      video.autoplay =
        true;

      video.muted =
        true;

      video.playsInline =
        true;

      video.srcObject =
        stream;

      state.screen.video =
        video;


      try {
        await video.play();
      } catch {}


      const track =
        stream.getVideoTracks()[0];


      if (track) {

        track.addEventListener(
          "ended",
          () => {

            stopScreenCapture();

          }
        );

      }


      if (screenShareBadge) {

        screenShareBadge.classList.add(
          "show"
        );

      }


      const button =
        $("#screenCaptureBtn");

      if (button) {

        button.textContent =
          "Stop Screen";

        button.classList.add(
          "active"
        );

      }


      /*
       * Screen becomes main composition source.
       */
      state.main.type =
        "screen";

      hideWelcome();

      renderCompositionFrame();

      updateStatus();

      showToast(
        "Screen capture started."
      );

    } catch (error) {

      console.warn(
        "Screen capture failed:",
        error
      );

      showToast(
        "Screen capture cancelled."
      );

    }

  }


  function stopScreenCapture() {

    const stream =
      state.screen.stream;

    if (stream) {

      stream
        .getTracks()
        .forEach(
          track => {

            try {
              track.stop();
            } catch {}

          }
        );

    }


    state.screen.stream =
      null;

    state.screen.video =
      null;

    state.screen.active =
      false;


    if (screenShareBadge) {

      screenShareBadge.classList.remove(
        "show"
      );

    }


    const button =
      $("#screenCaptureBtn");

    if (button) {

      button.textContent =
        "Screen Capture";

      button.classList.remove(
        "active"
      );

    }


    if (
      state.main.type ===
      "screen"
    ) {

      state.main.type =
        mainVideo.src
          ? "video"
          : mainImage.src
            ? "image"
            : "none";

    }


    renderCompositionFrame();

    updateStatus();

  }


  /* =======================================================
     MENTOR VIDEO
     ======================================================= */

  function showMentorVideo(file) {

    if (!file) {
      return;
    }

    cleanupUrl(
      state.mentor.objectUrl
    );

    const url =
      URL.createObjectURL(file);

    state.mentor.objectUrl =
      url;

    mentorVideo.src =
      url;

    mentorVideo.style.display =
      "block";

    mentorCameraVideo.style.display =
      "none";

    mentorAICanvas.style.display =
      "none";

    mentorPlaceholder.style.display =
      "none";

    state.mentor.type =
      "video";

    mentorSourceLabel.textContent =
      "Mentor Video";

    mentorVideo.play().catch(
      () => {}
    );

    renderCompositionFrame();

  }


  /* =======================================================
     CAMERA
     ======================================================= */

  async function loadCameraDevices() {

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

      state.camera.devices =
        devices.filter(
          device =>
            device.kind ===
            "videoinput"
        );

      return state.camera.devices;

    } catch (error) {

      console.warn(
        "Camera device enumeration failed:",
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
        "Camera access is not supported."
      );

      return;

    }


    try {

      stopCamera(false);


      await loadCameraDevices();


      const devices =
        state.camera.devices;


      let deviceId =
        devices[
          state.camera.deviceIndex
        ]?.deviceId;


      const constraints = {

        audio: false,

        video: deviceId
          ? {
              deviceId: {
                exact:
                  deviceId
              },

              width: {
                ideal: 1280
              },

              height: {
                ideal: 720
              }
            }

          : {
              width: {
                ideal: 1280
              },

              height: {
                ideal: 720
              }
            }

      };


      const stream =
        await navigator.mediaDevices
          .getUserMedia(
            constraints
          );


      state.camera.stream =
        stream;


      mentorCameraVideo.srcObject =
        stream;

      mentorCameraVideo.style.display =
        "block";

      mentorVideo.style.display =
        "none";

      mentorAICanvas.style.display =
        "none";

      mentorPlaceholder.style.display =
        "none";


      state.mentor.type =
        "camera";


      mentorSourceLabel.textContent =
        "Camera";


      try {

        await mentorCameraVideo.play();

      } catch {}


      /*
       * Reinitialize segmentation.
       */
      setupAI();

      updateCameraStatus(
        true,
        "Camera live"
      );


      showToast(
        "Camera started."
      );


      renderCompositionFrame();

    } catch (error) {

      console.error(
        "Camera start error:",
        error
      );

      updateCameraStatus(
        false,
        "Camera unavailable"
      );

      showToast(
        "Camera permission was not granted."
      );

    }

  }


  function stopCamera(showMessage = true) {

    if (state.camera.stream) {

      state.camera.stream
        .getTracks()
        .forEach(
          track => {

            try {
              track.stop();
            } catch {}

          }
        );

    }


    state.camera.stream =
      null;


    try {

      mentorCameraVideo.pause();

    } catch {}


    mentorCameraVideo.srcObject =
      null;


    if (
      state.mentor.type ===
      "camera"
    ) {

      state.mentor.type =
        "none";

      mentorCameraVideo.style.display =
        "none";

      mentorAICanvas.style.display =
        "none";

      mentorPlaceholder.style.display =
        "flex";

      mentorSourceLabel.textContent =
        "Mentor";

    }


    updateCameraStatus(
      false,
      "Camera stopped"
    );


    if (showMessage) {

      showToast(
        "Camera stopped."
      );

    }


    renderCompositionFrame();

  }


  async function switchCamera() {

    await loadCameraDevices();

    const count =
      state.camera.devices.length;

    if (count < 2) {

      showToast(
        "Only one camera is available."
      );

      return;

    }


    state.camera.deviceIndex =
      (
        state.camera.deviceIndex +
        1
      ) % count;


    await startCamera();

  }


  function updateCameraStatus(
    online,
    text
  ) {

    const status =
      $("#cameraStatus");

    const dot =
      $("#cameraStatusDot");

    const bottomDot =
      $("#bottomCameraDot");


    if (status) {

      status.textContent =
        text;

    }


    dot?.classList.toggle(
      "online",
      online
    );

    bottomDot?.classList.toggle(
      "green",
      online
    );

  }


  /* =======================================================
     AI SEGMENTATION
     ======================================================= */

  function setupAI() {

    if (
      typeof SelfieSegmentation ===
      "undefined"
    ) {

      console.warn(
        "MediaPipe Selfie Segmentation not loaded."
      );

      return;

    }


    if (
      state.ai.segmentation
    ) {

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
        results => {

          processSegmentation(
            results
          );

        }
      );


      state.ai.segmentation =
        segmentation;

      state.ai.ready =
        true;

    } catch (error) {

      console.error(
        "AI initialization failed:",
        error
      );

    }

  }


  async function processCameraAI() {

    if (
      !state.ai.ready ||
      !state.ai.segmentation ||
      !state.camera.stream
    ) {

      return;

    }


    if (
      state.ai.processing
    ) {

      return;

    }


    if (
      mentorCameraVideo.readyState <
      2
    ) {

      return;

    }


    state.ai.processing =
      true;


    try {

      await state.ai.segmentation.send({
        image:
          mentorCameraVideo
      });

    } catch (error) {

      console.warn(
        "Segmentation frame failed:",
        error
      );

    } finally {

      state.ai.processing =
        false;

    }

  }


  function processSegmentation(
    results
  ) {

    if (
      !results ||
      !results.image ||
      !results.segmentationMask
    ) {

      return;

    }


    const source =
      results.image;

    const mask =
      results.segmentationMask;


    const width =
      source.videoWidth ||
      source.width ||
      640;

    const height =
      source.videoHeight ||
      source.height ||
      360;


    ensureAICanvases(
      width,
      height
    );


    const sourceContext =
      state.ai.sourceContext;

    const maskContext =
      state.ai.maskContext;

    const personCanvas =
      state.ai.personCanvas;

    const personContext =
      state.ai.personContext;


    sourceContext.clearRect(
      0,
      0,
      width,
      height
    );


    maskContext.clearRect(
      0,
      0,
      width,
      height
    );


    sourceContext.drawImage(
      source,
      0,
      0,
      width,
      height
    );


    maskContext.drawImage(
      mask,
      0,
      0,
      width,
      height
    );


    const sourceData =
      sourceContext.getImageData(
        0,
        0,
        width,
        height
      );


    const maskData =
      maskContext.getImageData(
        0,
        0,
        width,
        height
      );


    const personData =
      personContext.createImageData(
        width,
        height
      );


    const src =
      sourceData.data;

    const maskPixels =
      maskData.data;

    const dst =
      personData.data;


    /*
     * MediaPipe foreground confidence.
     *
     * The mask's red channel is used.
     *
     * Alpha is softened around the edge
     * to reduce harsh cutouts.
     */

    for (
      let i = 0;
      i < src.length;
      i += 4
    ) {

      const confidence =
        maskPixels[i] / 255;


      const alpha =
        Math.max(
          0,
          Math.min(
            1,
            (
              confidence -
              0.15
            ) / 0.65
          )
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


    personContext.putImageData(
      personData,
      0,
      0
    );


    state.ai.lastResults =
      results;


    if (
      state.ai.mode !==
      "original"
    ) {

      drawAIResult();

    }

  }


  function ensureAICanvases(
    width,
    height
  ) {

    if (
      !state.ai.personCanvas
    ) {

      state.ai.personCanvas =
        document.createElement(
          "canvas"
        );

      state.ai.personContext =
        state.ai.personCanvas
          .getContext(
            "2d"
          );

    }


    if (
      !aiSourceCanvas ||
      !aiMaskCanvas
    ) {

      return;

    }


    if (
      state.ai.personCanvas.width !==
      width ||
      state.ai.personCanvas.height !==
      height
    ) {

      state.ai.personCanvas.width =
        width;

      state.ai.personCanvas.height =
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


    state.ai.sourceContext =
      aiSourceCanvas.getContext(
        "2d"
      );

    state.ai.maskContext =
      aiMaskCanvas.getContext(
        "2d"
      );

  }


  function drawAIResult() {

    if (
      !state.ai.personCanvas ||
      !mentorAICanvas
    ) {

      return;

    }


    const canvas =
      mentorAICanvas;

    const context =
      canvas.getContext(
        "2d"
      );


    const width =
      state.ai.personCanvas.width;

    const height =
      state.ai.personCanvas.height;


    if (
      width <= 0 ||
      height <= 0
    ) {

      return;

    }


    if (
      canvas.width !== width ||
      canvas.height !== height
    ) {

      canvas.width =
        width;

      canvas.height =
        height;

    }


    /*
     * Background first.
     */

    if (
      state.ai.mode ===
      "blur"
    ) {

      drawBlurredCameraBackground(
        context,
        width,
        height
      );

    }

    else if (
      state.ai.mode ===
      "image"
    ) {

      if (
        state.ai.backgroundImage
      ) {

        drawCoverImage(
          context,
          state.ai.backgroundImage,
          0,
          0,
          width,
          height
        );

      } else {

        context.fillStyle =
          "#d9eafa";

        context.fillRect(
          0,
          0,
          width,
          height
        );

      }

    }

    else if (
      state.ai.mode ===
      "color"
    ) {

      const color =
        $("#backgroundColor")
          ?.value ||
        "#d9eafa";

      context.fillStyle =
        color;

      context.fillRect(
        0,
        0,
        width,
        height
      );

    }

    else if (
      state.ai.mode ===
      "remove"
    ) {

      /*
       * Transparent background.
       */

      context.clearRect(
        0,
        0,
        width,
        height
      );

    }

    else {

      /*
       * Original.
       */

      context.drawImage(
        mentorCameraVideo,
        0,
        0,
        width,
        height
      );

    }


    /*
     * Person on top.
     */

    if (
      state.ai.mode !==
      "original"
    ) {

      context.drawImage(
        state.ai.personCanvas,
        0,
        0,
        width,
        height
      );

    }


    mentorAICanvas.style.display =
      "block";

    mentorCameraVideo.style.display =
      "none";

  }


  function drawBlurredCameraBackground(
    context,
    width,
    height
  ) {

    context.save();

    context.filter =
      "blur(18px)";

    context.drawImage(
      mentorCameraVideo,
      -15,
      -15,
      width + 30,
      height + 30
    );

    context.restore();

  }


  function drawCoverImage(
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


    if (
      !iw ||
      !ih
    ) {

      return;

    }


    const scale =
      Math.max(
        width / iw,
        height / ih
      );


    const sw =
      iw * scale;

    const sh =
      ih * scale;


    context.drawImage(
      image,
      x +
        (
          width -
          sw
        ) / 2,
      y +
        (
          height -
          sh
        ) / 2,
      sw,
      sh
    );

  }


  function setBackgroundMode(
    mode
  ) {

    state.ai.mode =
      mode;


    const buttons = [
      ["#bgOriginalBtn", "original"],
      ["#bgRemoveBtn", "remove"],
      ["#bgBlurBtn", "blur"],
      ["#bgImageBtn", "image"],
      ["#bgColorBtn", "color"]
    ];


    buttons.forEach(
      ([selector, value]) => {

        $(selector)?.classList.toggle(
          "active",
          value === mode
        );

      }
    );


    state.ai.enabled =
      mode !==
      "original";


    if (
      state.ai.enabled &&
      state.camera.stream
    ) {

      setupAI();

    }


    if (
      mode === "image" &&
      !state.ai.backgroundImage
    ) {

      backgroundImageUpload?.click();

      return;

    }


    renderCompositionFrame();

  }


  /* =======================================================
     AUDIO ENGINE
     ======================================================= */

  async function initializeAudioContext() {

    if (
      state.audio.context
    ) {

      if (
        state.audio.context.state ===
        "suspended"
      ) {

        await state.audio.context.resume();

      }

      return;

    }


    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;


    if (!AudioContextClass) {

      showToast(
        "Web Audio is not supported."
      );

      return;

    }


    const context =
      new AudioContextClass();


    const destination =
      context.createMediaStreamDestination();


    state.audio.context =
      context;

    state.audio.destination =
      destination;


    state.audio.initialized =
      true;


    /*
     * Main video source
     */

    if (
      mainVideo
    ) {

      try {

        const source =
          context.createMediaElementSource(
            mainVideo
          );


        const gain =
          context.createGain();


        source.connect(
          gain
        );


        gain.connect(
          destination
        );


        /*
         * Also connect to speakers.
         * Main volume controls playback.
         */

        gain.connect(
          context.destination
        );


        state.audio.mainSource =
          source;

        state.audio.mainGain =
          gain;


      } catch (error) {

        /*
         * createMediaElementSource can only
         * be created once for an element.
         */

        console.warn(
          "Main audio source setup:",
          error
        );

      }

    }


    await initializeMicrophone();

  }


  async function initializeMainAudio() {

    await initializeAudioContext();

    updateMainAudio();

  }


  async function initializeMicrophone() {

    if (
      state.audio.micStream
    ) {

      return;

    }


    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {

      updateMicStatus(
        false,
        "Microphone unavailable"
      );

      return;

    }


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


      state.audio.micStream =
        stream;


      const context =
        state.audio.context;


      if (!context) {
        return;
      }


      const source =
        context.createMediaStreamSource(
          stream
        );


      const gain =
        context.createGain();


      const monitorGain =
        context.createGain();


      source.connect(
        gain
      );


      gain.connect(
        state.audio.destination
      );


      /*
       * Monitoring path.
       */

      gain.connect(
        monitorGain
      );


      monitorGain.connect(
        context.destination
      );


      state.audio.micSource =
        source;

      state.audio.micGain =
        gain;

      state.audio.monitorGain =
        monitorGain;


      /*
       * Default monitor off.
       */

      monitorGain.gain.value =
        0;


      updateMicStatus(
        true,
        "Microphone ready"
      );


      updateMicControls();

    } catch (error) {

      console.warn(
        "Microphone access failed:",
        error
      );

      updateMicStatus(
        false,
        "Microphone permission denied"
      );

    }

  }


  function updateMainAudio() {

    if (
      !state.audio.mainGain
    ) {

      return;

    }


    const enabled =
      $("#mainVideoAudioCheckbox")
        ?.checked !== false;


    const volume =
      Number(
        $("#mainVideoVolume")
          ?.value || 100
      ) / 100;


    state.audio.mainGain.gain.value =
      enabled
        ? volume
        : 0;


    if (mainVideo) {

      mainVideo.muted =
        false;

    }

  }


  function updateMicControls() {

    if (
      !state.audio.micGain
    ) {

      return;

    }


    const enabled =
      $("#micEnabled")
        ?.checked !== false;


    const volume =
      Number(
        $("#micVolume")
          ?.value || 100
      ) / 100;


    state.audio.micGain.gain.value =
      enabled
        ? volume
        : 0;


    const monitor =
      $("#micMonitor")
        ?.checked === true;


    if (
      state.audio.monitorGain
    ) {

      state.audio.monitorGain.gain.value =
        monitor
          ? volume
          : 0;

    }

  }


  function updateMicStatus(
    online,
    text
  ) {

    const status =
      document.querySelector(
        "[data-mic-status]"
      );

    const dot =
      $("#micStatusDot");

    const bottomDot =
      $("#bottomMicDot");


    if (status) {

      status.textContent =
        text;

    }


    dot?.classList.toggle(
      "online",
      online
    );

    bottomDot?.classList.toggle(
      "green",
      online
    );

  }


  function setupAudioControls() {

    const mainAudio =
      $("#mainVideoAudioCheckbox");

    const mainVolume =
      $("#mainVideoVolume");

    const mainVolumeValue =
      $("#mainVolumeValue");

    const micVolume =
      $("#micVolume");

    const micVolumeValue =
      $("#micVolumeValue");

    const micEnabled =
      $("#micEnabled");

    const micMonitor =
      $("#micMonitor");


    mainAudio?.addEventListener(
      "change",
      updateMainAudio
    );


    mainVolume?.addEventListener(
      "input",
      () => {

        if (mainVolumeValue) {

          mainVolumeValue.textContent =
            `${mainVolume.value}%`;

        }

        updateMainAudio();

      }
    );


    micVolume?.addEventListener(
      "input",
      () => {

        if (micVolumeValue) {

          micVolumeValue.textContent =
            `${micVolume.value}%`;

        }

        updateMicControls();

      }
    );


    micEnabled?.addEventListener(
      "change",
      async () => {

        await initializeAudioContext();

        updateMicControls();

      }
    );


    micMonitor?.addEventListener(
      "change",
      async () => {

        await initializeAudioContext();

        updateMicControls();

      }
    );


    /*
     * Browser usually requires user interaction
     * before AudioContext starts.
     */

    document.addEventListener(
      "pointerdown",
      () => {

        initializeAudioContext()
          .catch(
            () => {}
          );

      },
      {
        once: true
      }
    );

  }


  /* =======================================================
     RECORDING
     ======================================================= */

  function setupRecordingSettings() {

    const resolution =
      $("#recordingResolution");

    const fps =
      $("#recordingFPS");


    resolution?.addEventListener(
      "change",
      () => {

        if (
          $("#advancedResolution")
        ) {

          $("#advancedResolution")
            .value =
            resolution.value;

        }


        if (
          !state.recording.active
        ) {

          applyRecordingResolution();

          renderCompositionFrame();

        }

      }
    );


    fps?.addEventListener(
      "change",
      () => {

        if (
          $("#advancedFPS")
        ) {

          $("#advancedFPS")
            .value =
            fps.value;

        }


        state.recording.fps =
          getSelectedFPS();

      }
    );


    $("#recordingBitrate")
      ?.addEventListener(
        "change",
        () => {

          state.recording.bitrate =
            getSelectedBitrate();

        }
      );


    $("#advancedResolution")
      ?.addEventListener(
        "change",
        event => {

          if (
            resolution
          ) {

            resolution.value =
              event.target.value;

          }

          if (
            !state.recording.active
          ) {

            applyRecordingResolution();

            renderCompositionFrame();

          }

        }
      );


    $("#advancedFPS")
      ?.addEventListener(
        "change",
        event => {

          if (fps) {

            fps.value =
              event.target.value;

          }

          state.recording.fps =
            getSelectedFPS();

        }
      );

  }


  async function startRecording() {

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


    try {

      applyRecordingResolution();

      state.recording.fps =
        getSelectedFPS();

      state.recording.bitrate =
        getSelectedBitrate();


      await initializeAudioContext();


      /*
       * Ensure microphone exists.
       */

      if (
        $("#micEnabled")
          ?.checked !== false &&
        !state.audio.micStream
      ) {

        await initializeMicrophone();

      }


      renderCompositionFrame();


      const canvas =
        state.composition.canvas;


      /*
       * captureStream creates the video track.
       */

      const canvasStream =
        canvas.captureStream(
          state.recording.fps
        );


      state.recording.canvasStream =
        canvasStream;


      const finalStream =
        new MediaStream();


      /*
       * Canvas video.
       */

      canvasStream
        .getVideoTracks()
        .forEach(
          track =>
            finalStream.addTrack(
              track
            )
        );


      /*
       * Mixed Web Audio.
       */

      if (
        state.audio.destination
      ) {

        state.audio.destination
          .stream
          .getAudioTracks()
          .forEach(
            track =>
              finalStream.addTrack(
                track
              )
          );

      }


      state.recording.finalStream =
        finalStream;


      const mimeType =
        chooseMimeType();


      state.recording.mimeType =
        mimeType;


      const options = {
        mimeType,

        videoBitsPerSecond:
          state.recording.bitrate
      };


      let recorder;


      try {

        recorder =
          new MediaRecorder(
            finalStream,
            options
          );

      } catch (error) {

        console.warn(
          "Preferred MediaRecorder failed:",
          error
        );


        recorder =
          new MediaRecorder(
            finalStream
          );

      }


      state.recording.recorder =
        recorder;


      state.recording.chunks =
        [];

      state.recording.blob =
        null;


      recorder.ondataavailable =
        event => {

          if (
            event.data &&
            event.data.size > 0
          ) {

            state.recording.chunks
              .push(
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
            "Recording error occurred."
          );

        };


      recorder.onstop =
        () => {

          finalizeRecording();

        };


      recorder.onstart =
        () => {

          state.recording.active =
            true;

          state.recording.paused =
            false;

          state.recording.timerStart =
            performance.now();

          state.recording.elapsedBeforePause =
            0;

          startRecordingTimer();

          updateRecordingUI();

          updateStatus();

          /*
           * Start teleprompter if requested.
           */

          if (
            state.teleprompter
              .startWithRecording
          ) {

            playTeleprompter();

          }

          showToast(
            `Recording started — ${state.recording.width}×${state.recording.height} @ ${state.recording.fps} FPS`
          );

        };


      recorder.start(
        1000
      );


      /*
       * Make sure rendering is continuous.
       */

      state.recording.renderLoop =
        true;

      startRenderLoop();

    } catch (error) {

      console.error(
        "Start recording failed:",
        error
      );

      cleanupRecordingStream();

      showToast(
        "Could not start recording."
      );

    }

  }


  function pauseRecording() {

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

      state.recording.paused =
        true;

      state.recording.pausedAt =
        performance.now();


      stopRecordingTimer();

      updateRecordingUI();

      showToast(
        "Recording paused."
      );

    } catch (error) {

      console.warn(
        "Pause failed:",
        error
      );

    }

  }


  function resumeRecording() {

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

      const pausedDuration =
        performance.now() -
        state.recording.pausedAt;


      state.recording.elapsedBeforePause +=
        pausedDuration;


      recorder.resume();

      state.recording.paused =
        false;

      startRecordingTimer();

      updateRecordingUI();

      showToast(
        "Recording resumed."
      );

    } catch (error) {

      console.warn(
        "Resume failed:",
        error
      );

    }

  }


  function stopRecording() {

    const recorder =
      state.recording.recorder;


    if (
      !recorder
    ) {

      return;

    }


    if (
      recorder.state ===
        "recording" ||
      recorder.state ===
        "paused"
    ) {

      try {

        recorder.stop();

      } catch (error) {

        console.warn(
          "Stop recording failed:",
          error
        );

      }

    }

  }


  function finalizeRecording() {

    stopRecordingTimer();


    state.recording.active =
      false;

    state.recording.paused =
      false;


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


    cleanupRecordingStream();


    state.recording.renderLoop =
      false;


    updateRecordingUI();

    updateStatus();


    if (
      state.teleprompter.playing
    ) {

      pauseTeleprompter();

    }


    showRecordingPreview(
      blob
    );


    showToast(
      "Recording finished."
    );

  }


  function cleanupRecordingStream() {

    if (
      state.recording.canvasStream
    ) {

      state.recording.canvasStream
        .getTracks()
        .forEach(
          track => {

            try {
              track.stop();
            } catch {}

          }
        );

    }


    state.recording.canvasStream =
      null;


    /*
     * Do not stop microphone/camera.
     * They belong to the studio.
     */

    state.recording.finalStream =
      null;

  }


  function chooseMimeType() {

    const candidates = [

      "video/webm;codecs=vp9,opus",

      "video/webm;codecs=vp8,opus",

      "video/webm"

    ];


    for (
      const type of candidates
    ) {

      if (
        window.MediaRecorder &&
        MediaRecorder.isTypeSupported(
          type
        )
      ) {

        return type;

      }

    }


    return "";

  }


  /* =======================================================
     RECORDING TIMER
     ======================================================= */

  function startRecordingTimer() {

    stopRecordingTimer();


    state.recording.timerId =
      setInterval(
        updateRecordingTimer,
        250
      );


    updateRecordingTimer();

  }


  function stopRecordingTimer() {

    if (
      state.recording.timerId
    ) {

      clearInterval(
        state.recording.timerId
      );

      state.recording.timerId =
        null;

    }

  }


  function getRecordingElapsed() {

    if (
      !state.recording.timerStart
    ) {

      return 0;

    }


    const now =
      performance.now();


    let elapsed =
      now -
      state.recording.timerStart;


    elapsed -=
      state.recording.elapsedBeforePause;


    if (
      state.recording.paused
    ) {

      elapsed =
        state.recording.pausedAt -
        state.recording.timerStart -
        state.recording.elapsedBeforePause;

    }


    return Math.max(
      0,
      elapsed
    );

  }


  function updateRecordingTimer() {

    const elapsed =
      getRecordingElapsed();


    const seconds =
      Math.floor(
        elapsed / 1000
      );


    const text =
      formatTime(
        seconds
      );


    if (
      recordingOverlayTime
    ) {

      recordingOverlayTime.textContent =
        text;

    }


    $$(
      "[data-recording-time]"
    ).forEach(
      element => {

        element.textContent =
          text;

      }
    );

  }


  function formatTime(
    totalSeconds
  ) {

    const hours =
      Math.floor(
        totalSeconds / 3600
      );

    const minutes =
      Math.floor(
        (
          totalSeconds % 3600
        ) / 60
      );

    const seconds =
      totalSeconds % 60;


    return [
      hours,
      minutes,
      seconds
    ]
      .map(
        value =>
          String(
            value
          ).padStart(
            2,
            "0"
          )
      )
      .join(":");

  }


  /* =======================================================
     RECORDING UI
     ======================================================= */

  function updateRecordingUI() {

    const recordBtn =
      $("#recordBtn");

    const toolbarRecord =
      $("#toolbarRecordBtn");


    if (
      state.recording.active
    ) {

      recordingOverlay?.classList.add(
        "show"
      );


      if (
        state.recording.paused
      ) {

        recordingOverlayText.textContent =
          "PAUSED";

        recordingOverlayText.style.color =
          "#ffcf78";

        recordBtn?.classList.remove(
          "recording"
        );

        if (recordBtn) {

          recordBtn.innerHTML =
            "▶ Resume";

        }

        if (toolbarRecord) {

          toolbarRecord.innerHTML =
            "▶ Resume";

        }

      } else {

        recordingOverlayText.textContent =
          "RECORDING";

        recordingOverlayText.style.color =
          "#ff9aa7";

        recordBtn?.classList.add(
          "recording"
        );

        if (recordBtn) {

          recordBtn.innerHTML =
            "❚❚ Pause";

        }

        if (toolbarRecord) {

          toolbarRecord.innerHTML =
            "❚❚ Pause";

        }

      }

    } else {

      recordingOverlay?.classList.remove(
        "show"
      );


      recordBtn?.classList.remove(
        "recording"
      );


      if (recordBtn) {

        recordBtn.innerHTML =
          "● Record";

      }


      if (toolbarRecord) {

        toolbarRecord.innerHTML =
          "● Record";

      }

    }

  }


  /* =======================================================
     RECORDING PREVIEW
     ======================================================= */

  function showRecordingPreview(
    blob
  ) {

    closeRecordingPreview();


    const url =
      URL.createObjectURL(
        blob
      );


    state.recording.url =
      url;


    const overlay =
      document.createElement(
        "div"
      );


    overlay.id =
      "recordingPreviewModal";


    overlay.style.cssText = `
      position:fixed;
      inset:0;
      z-index:100000;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
      background:rgba(0,0,0,.84);
      backdrop-filter:blur(15px);
    `;


    const card =
      document.createElement(
        "div"
      );


    card.style.cssText = `
      width:min(950px,96vw);
      max-height:92vh;
      overflow:auto;
      background:#0d1520;
      border:1px solid rgba(255,255,255,.12);
      border-radius:18px;
      box-shadow:0 30px 100px rgba(0,0,0,.6);
      padding:16px;
    `;


    const header =
      document.createElement(
        "div"
      );


    header.style.cssText = `
      display:flex;
      align-items:center;
      justify-content:space-between;
      margin-bottom:12px;
      gap:10px;
    `;


    const title =
      document.createElement(
        "strong"
      );


    title.textContent =
      "Recording Preview";


    title.style.cssText = `
      font-size:15px;
    `;


    const info =
      document.createElement(
        "span"
      );


    info.textContent =
      `${state.recording.width}×${state.recording.height} • ${state.recording.fps} FPS`;


    info.style.cssText = `
      color:#7f8ea2;
      font-size:9px;
    `;


    header.appendChild(
      title
    );

    header.appendChild(
      info
    );


    const video =
      document.createElement(
        "video"
      );


    video.src =
      url;

    video.controls =
      true;

    video.playsInline =
      true;

    video.style.cssText = `
      display:block;
      width:100%;
      max-height:65vh;
      object-fit:contain;
      background:#05080e;
      border-radius:12px;
    `;


    const actions =
      document.createElement(
        "div"
      );


    actions.style.cssText = `
      display:flex;
      justify-content:flex-end;
      gap:8px;
      margin-top:12px;
      flex-wrap:wrap;
    `;


    const download =
      document.createElement(
        "a"
      );


    download.href =
      url;

    download.download =
      `personal-course-studio-${Date.now()}.webm`;

    download.textContent =
      "⬇ Download";

    download.style.cssText = `
      height:38px;
      display:inline-flex;
      align-items:center;
      padding:0 14px;
      border-radius:9px;
      background:#3da4ff;
      color:white;
      text-decoration:none;
      font-size:10px;
      font-weight:700;
    `;


    const again =
      document.createElement(
        "button"
      );


    again.textContent =
      "● Record Again";

    stylePreviewButton(
      again
    );


    again.addEventListener(
      "click",
      () => {

        closeRecordingPreview();

        startRecording();

      }
    );


    const deleteButton =
      document.createElement(
        "button"
      );


    deleteButton.textContent =
      "Delete";

    stylePreviewButton(
      deleteButton,
      true
    );


    deleteButton.addEventListener(
      "click",
      () => {

        state.recording.blob =
          null;

        state.recording.chunks =
          [];

        closeRecordingPreview();

        showToast(
          "Recording deleted."
        );

      }
    );


    const close =
      document.createElement(
        "button"
      );


    close.textContent =
      "Close";

    stylePreviewButton(
      close
    );


    close.addEventListener(
      "click",
      closeRecordingPreview
    );


    actions.appendChild(
      download
    );

    actions.appendChild(
      again
    );

    actions.appendChild(
      deleteButton
    );

    actions.appendChild(
      close
    );


    card.appendChild(
      header
    );

    card.appendChild(
      video
    );

    card.appendChild(
      actions
    );


    overlay.appendChild(
      card
    );


    document.body.appendChild(
      overlay
    );


    state.recording.preview =
      overlay;

  }


  function stylePreviewButton(
    button,
    danger = false
  ) {

    button.style.cssText = `
      height:38px;
      padding:0 13px;
      border-radius:9px;
      border:1px solid rgba(255,255,255,.08);
      background:${
        danger
          ? "rgba(255,79,100,.1)"
          : "rgba(255,255,255,.06)"
      };
      color:${
        danger
          ? "#ff7182"
          : "#cbd6e3"
      };
      cursor:pointer;
      font-size:10px;
    `;

  }


  function closeRecordingPreview() {

    if (
      state.recording.preview
    ) {

      state.recording.preview.remove();

      state.recording.preview =
        null;

    }


    if (
      state.recording.url
    ) {

      cleanupUrl(
        state.recording.url
      );

      state.recording.url =
        null;

    }

  }


  /* =======================================================
     CONTINUOUS RENDER LOOP
     ======================================================= */

  function startRenderLoop() {

    if (
      state.render.running
    ) {

      return;

    }


    state.render.running =
      true;


    const frame =
      () => {

        renderFrame();


        state.render.raf =
          requestAnimationFrame(
            frame
          );

      };


    state.render.raf =
      requestAnimationFrame(
        frame
      );

  }


  function renderFrame() {

    /*
     * AI camera processing.
     */

    if (
      state.camera.stream &&
      state.ai.enabled
    ) {

      processCameraAI();

    }


    /*
     * Update AI composition.
     */

    if (
      state.camera.stream &&
      state.ai.enabled &&
      state.ai.lastResults
    ) {

      drawAIResult();

    }


    /*
     * Draw final composition.
     */

    renderCompositionFrame();


    /*
     * Keep canvas capture stream alive.
     */

    if (
      state.recording.active &&
      state.recording.canvasStream
    ) {

      const track =
        state.recording.canvasStream
          .getVideoTracks()[0];


      if (
        track &&
        typeof track.requestFrame ===
        "function"
      ) {

        /*
         * captureStream(fps) already captures
         * automatically. requestFrame is used
         * when supported as an extra guarantee.
         */

        try {
          track.requestFrame();
        } catch {}

      }

    }

  }


  /* =======================================================
     COMPOSITION RENDER
     ======================================================= */

  function renderCompositionFrame() {

    const canvas =
      state.composition.canvas;

    const context =
      state.composition.context;


    if (
      !canvas ||
      !context
    ) {

      return;

    }


    const width =
      canvas.width;

    const height =
      canvas.height;


    context.save();

    context.fillStyle =
      "#10141d";

    context.fillRect(
      0,
      0,
      width,
      height
    );


    /*
     * Main stage.
     */

    drawMainStage(
      context,
      width,
      height
    );


    /*
     * Mentor overlay.
     */

    drawMentorOverlay(
      context,
      width,
      height
    );


    /*
     * Brand.
     */

    drawBrand(
      context,
      width,
      height
    );


    context.restore();

  }


  function drawMainStage(
    context,
    width,
    height
  ) {

    if (
      state.main.type ===
      "screen"
    ) {

      const video =
        state.screen.video;


      if (
        video &&
        video.readyState >= 2
      ) {

        drawCoverVideo(
          context,
          video,
          0,
          0,
          width,
          height
        );

        return;

      }

    }


    if (
      state.main.type ===
      "video"
    ) {

      if (
        mainVideo.readyState >= 2
      ) {

        drawCoverVideo(
          context,
          mainVideo,
          0,
          0,
          width,
          height
        );

        return;

      }

    }


    if (
      state.main.type ===
      "image"
    ) {

      if (
        mainImage.complete &&
        mainImage.naturalWidth
      ) {

        drawCoverImage(
          context,
          mainImage,
          0,
          0,
          width,
          height
        );

        return;

      }

    }


    /*
     * Empty stage.
     */

    const gradient =
      context.createLinearGradient(
        0,
        0,
        width,
        height
      );


    gradient.addColorStop(
      0,
      "#111c2a"
    );

    gradient.addColorStop(
      1,
      "#080d15"
    );


    context.fillStyle =
      gradient;

    context.fillRect(
      0,
      0,
      width,
      height
    );


    context.fillStyle =
      "rgba(255,255,255,.55)";

    context.font =
      `${Math.max(
        22,
        width * .025
      )}px Inter, Arial`;


    context.textAlign =
      "center";

    context.textBaseline =
      "middle";


    context.fillText(
      "Personal Course Studio",
      width / 2,
      height / 2
    );

  }


  function drawCoverVideo(
    context,
    video,
    x,
    y,
    width,
    height
  ) {

    const vw =
      video.videoWidth ||
      width;

    const vh =
      video.videoHeight ||
      height;


    const scale =
      Math.max(
        width / vw,
        height / vh
      );


    const dw =
      vw * scale;

    const dh =
      vh * scale;


    context.drawImage(
      video,
      x +
        (
          width -
          dw
        ) / 2,
      y +
        (
          height -
          dh
        ) / 2,
      dw,
      dh
    );

  }


  /* =======================================================
     MENTOR COMPOSITION
     ======================================================= */

  function drawMentorOverlay(
    context,
    width,
    height
  ) {

    if (
      !mentorCard
    ) {

      return;

    }


    const stageRect =
      stage?.getBoundingClientRect();


    const cardRect =
      mentorCard.getBoundingClientRect();


    if (
      !stageRect ||
      !cardRect ||
      stageRect.width <= 0
    ) {

      return;

    }


    const x =
      (
        cardRect.left -
        stageRect.left
      ) /
      stageRect.width *
      width;


    const y =
      (
        cardRect.top -
        stageRect.top
      ) /
      stageRect.height *
      height;


    const cardWidth =
      cardRect.width /
      stageRect.width *
      width;


    const cardHeight =
      cardRect.height /
      stageRect.height *
      height;


    context.save();


    /*
     * Shadow.
     */

    context.shadowColor =
      "rgba(0,0,0,.45)";

    context.shadowBlur =
      25;

    context.shadowOffsetY =
      10;


    /*
     * Rounded clipping.
     */

    roundedRectPath(
      context,
      x,
      y,
      cardWidth,
      cardHeight,
      Math.min(
        22,
        cardWidth * .08
      )
    );


    context.clip();


    /*
     * Camera with AI.
     */

    if (
      state.mentor.type ===
      "camera"
    ) {

      if (
        state.ai.enabled &&
        mentorAICanvas.style.display !==
        "none"
      ) {

        context.drawImage(
          mentorAICanvas,
          x,
          y,
          cardWidth,
          cardHeight
        );

      } else if (
        mentorCameraVideo.readyState >= 2
      ) {

        context.drawImage(
          mentorCameraVideo,
          x,
          y,
          cardWidth,
          cardHeight
        );

      }

    }

    /*
     * Uploaded mentor video.
     */

    else if (
      state.mentor.type ===
      "video"
    ) {

      if (
        mentorVideo.readyState >= 2
      ) {

        context.drawImage(
          mentorVideo,
          x,
          y,
          cardWidth,
          cardHeight
        );

      }

    }

    /*
     * Empty mentor.
     */

    else {

      context.fillStyle =
        "#111923";

      context.fillRect(
        x,
        y,
        cardWidth,
        cardHeight
      );

      context.fillStyle =
        "rgba(255,255,255,.55)";

      context.font =
        `${Math.max(
          11,
          cardWidth * .06
        )}px Inter, Arial`;

      context.textAlign =
        "center";

      context.textBaseline =
        "middle";

      context.fillText(
        "Mentor",
        x +
          cardWidth / 2,
        y +
          cardHeight / 2
      );

    }


    context.restore();

  }


  function roundedRectPath(
    context,
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


    context.beginPath();

    context.moveTo(
      x + r,
      y
    );

    context.arcTo(
      x + width,
      y,
      x + width,
      y + height,
      r
    );

    context.arcTo(
      x + width,
      y + height,
      x,
      y + height,
      r
    );

    context.arcTo(
      x,
      y + height,
      x,
      y,
      r
    );

    context.arcTo(
      x,
      y,
      x + width,
      y,
      r
    );

    context.closePath();

  }


  function drawBrand(
    context,
    width,
    height
  ) {

    const name =
      state.settings.brandName ||
      "Personal Course Studio";


    const fontSize =
      Math.max(
        14,
        width * .009
      );


    context.font =
      `700 ${fontSize}px Inter, Arial`;


    const textWidth =
      context.measureText(
        name
      ).width;


    const paddingX =
      fontSize * .8;

    const paddingY =
      fontSize * .6;


    const boxWidth =
      textWidth +
      paddingX * 2;

    const boxHeight =
      fontSize +
      paddingY * 2;


    const x =
      width * .02;

    const y =
      height -
      boxHeight -
      height * .025;


    context.fillStyle =
      "rgba(4,7,12,.72)";


    roundedRectPath(
      context,
      x,
      y,
      boxWidth,
      boxHeight,
      12
    );


    context.fill();


    context.fillStyle =
      "#ffffff";


    context.textAlign =
      "left";

    context.textBaseline =
      "middle";


    context.fillText(
      name,
      x + paddingX,
      y + boxHeight / 2
    );

  }


  /* =======================================================
     PLAYBACK CONTROLS
     ======================================================= */

  function playMain() {

    if (
      state.main.type ===
      "video"
    ) {

      mainVideo.play().catch(
        () => {}
      );

      return;

    }


    if (
      state.main.type ===
      "screen" &&
      state.screen.video
    ) {

      state.screen.video.play()
        .catch(
          () => {}
        );

    }

  }


  function pauseMain() {

    if (
      state.main.type ===
      "video"
    ) {

      mainVideo.pause();

    }


    if (
      state.main.type ===
      "screen" &&
      state.screen.video
    ) {

      state.screen.video.pause();

    }

  }


  /* =======================================================
     TELEPROMPTER
     ======================================================= */

  function setupTeleprompter() {

    createTeleprompterUI();

  }


  function createTeleprompterUI() {

    if (
      $("#teleprompterModal")
    ) {

      return;

    }


    const modal =
      document.createElement(
        "div"
      );


    modal.id =
      "teleprompterModal";


    modal.style.cssText = `
      position:fixed;
      inset:0;
      z-index:99998;
      display:none;
      background:rgba(0,0,0,.76);
      backdrop-filter:blur(12px);
      align-items:center;
      justify-content:center;
      padding:18px;
    `;


    const card =
      document.createElement(
        "div"
      );


    card.style.cssText = `
      width:min(1100px,96vw);
      height:min(760px,92vh);
      display:flex;
      flex-direction:column;
      background:#0d1520;
      border:1px solid rgba(255,255,255,.1);
      border-radius:18px;
      overflow:hidden;
      box-shadow:0 30px 100px rgba(0,0,0,.6);
    `;


    const header =
      document.createElement(
        "div"
      );


    header.style.cssText = `
      padding:12px;
      border-bottom:1px solid rgba(255,255,255,.08);
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
      flex-wrap:wrap;
    `;


    const title =
      document.createElement(
        "strong"
      );


    title.textContent =
      "Teleprompter";


    title.style.cssText =
      "font-size:14px;";


    const controls =
      document.createElement(
        "div"
      );


    controls.style.cssText = `
      display:flex;
      align-items:center;
      gap:6px;
      flex-wrap:wrap;
    `;


    const upload =
      document.createElement(
        "input"
      );


    upload.type =
      "file";

    upload.accept =
      ".txt,text/plain";

    upload.hidden =
      true;


    const uploadButton =
      makeTeleButton(
        "Upload TXT"
      );


    const playButton =
      makeTeleButton(
        "▶ Play"
      );


    const pauseButton =
      makeTeleButton(
        "❚❚ Pause"
      );


    const resetButton =
      makeTeleButton(
        "Reset"
      );


    const closeButton =
      makeTeleButton(
        "Close"
      );


    const speed =
      document.createElement(
        "select"
      );


    speed.innerHTML = `
      <option value="1">Slow</option>
      <option value="2" selected>Normal</option>
      <option value="3">Fast</option>
      <option value="5">Very Fast</option>
    `;


    styleTeleControl(
      speed
    );


    const fontSize =
      document.createElement(
        "input"
      );


    fontSize.type =
      "range";

    fontSize.min =
      "18";

    fontSize.max =
      "64";

    fontSize.value =
      String(
        state.teleprompter.fontSize
      );


    styleTeleControl(
      fontSize
    );


    const opacity =
      document.createElement(
        "input"
      );


    opacity.type =
      "range";

    opacity.min =
      "30";

    opacity.max =
      "100";

    opacity.value =
      String(
        state.teleprompter.opacity *
        100
      );


    styleTeleControl(
      opacity
    );


    const startWithRecording =
      document.createElement(
        "label"
      );


    startWithRecording.style.cssText = `
      display:inline-flex;
      align-items:center;
      gap:4px;
      color:#9ba9bb;
      font-size:9px;
    `;


    const startCheckbox =
      document.createElement(
        "input"
      );


    startCheckbox.type =
      "checkbox";


    startWithRecording.appendChild(
      startCheckbox
    );


    startWithRecording.append(
      "Start with recording"
    );


    const showRecording =
      document.createElement(
        "label"
      );


    showRecording.style.cssText = `
      display:inline-flex;
      align-items:center;
      gap:4px;
      color:#9ba9bb;
      font-size:9px;
    `;


    const showCheckbox =
      document.createElement(
        "input"
      );


    showCheckbox.type =
      "checkbox";

    showCheckbox.checked =
      true;


    showRecording.appendChild(
      showCheckbox
    );


    showRecording.append(
      "Show while recording"
    );


    controls.append(
      uploadButton,
      playButton,
      pauseButton,
      resetButton,
      speed,
      fontSize,
      opacity,
      startWithRecording,
      showRecording,
      closeButton
    );


    const viewport =
      document.createElement(
        "div"
      );


    viewport.style.cssText = `
      flex:1;
      overflow:hidden;
      position:relative;
      background:#05080e;
    `;


    const content =
      document.createElement(
        "div"
      );


    content.style.cssText = `
      position:absolute;
      inset:0;
      overflow-y:auto;
      padding:70px 8%;
      color:white;
      font-size:${state.teleprompter.fontSize}px;
      line-height:1.65;
      text-align:center;
      white-space:pre-wrap;
      opacity:${state.teleprompter.opacity};
      scroll-behavior:auto;
    `;


    content.textContent =
      "Upload a TXT file or enter your script here.";


    content.contentEditable =
      "true";


    viewport.appendChild(
      content
    );


    card.appendChild(
      header
    );

    card.appendChild(
      viewport
    );


    modal.appendChild(
      card
    );

    document.body.appendChild(
      modal
    );


    modal.appendChild(
      upload
    );


    uploadButton.addEventListener(
      "click",
      () =>
        upload.click()
    );


    upload.addEventListener(
      "change",
      async event => {

        const file =
          event.target.files?.[0];

        if (!file) {
          return;
        }


        try {

          const text =
            await file.text();

          content.textContent =
            text;

          state.teleprompter.text =
            text;

        } catch {}

      }
    );


    playButton.addEventListener(
      "click",
      playTeleprompter
    );


    pauseButton.addEventListener(
      "click",
      pauseTeleprompter
    );


    resetButton.addEventListener(
      "click",
      () => {

        content.scrollTop =
          0;

      }
    );


    closeButton.addEventListener(
      "click",
      closeTeleprompter
    );


    speed.addEventListener(
      "change",
      () => {

        state.teleprompter.speed =
          Number(
            speed.value
          );

      }
    );


    fontSize.addEventListener(
      "input",
      () => {

        state.teleprompter.fontSize =
          Number(
            fontSize.value
          );

        content.style.fontSize =
          `${fontSize.value}px`;

      }
    );


    opacity.addEventListener(
      "input",
      () => {

        state.teleprompter.opacity =
          Number(
            opacity.value
          ) / 100;

        content.style.opacity =
          String(
            state.teleprompter.opacity
          );

      }
    );


    startCheckbox.addEventListener(
      "change",
      () => {

        state.teleprompter
          .startWithRecording =
          startCheckbox.checked;

      }
    );


    showCheckbox.addEventListener(
      "change",
      () => {

        state.teleprompter
          .showWhileRecording =
          showCheckbox.checked;

      }
    );


    content.addEventListener(
      "input",
      () => {

        state.teleprompter.text =
          content.innerText;

      }
    );


    state.teleprompter.elements = {
      modal,
      content,
      upload,
      speed,
      fontSize,
      opacity,
      startCheckbox,
      showCheckbox
    };

  }


  function makeTeleButton(
    text
  ) {

    const button =
      document.createElement(
        "button"
      );

    button.type =
      "button";

    button.textContent =
      text;

    styleTeleControl(
      button
    );

    return button;

  }


  function styleTeleControl(
    element
  ) {

    element.style.cssText += `
      height:32px;
      padding:0 8px;
      border-radius:8px;
      border:1px solid rgba(255,255,255,.08);
      background:#111b28;
      color:#bfcbd9;
      font-size:9px;
      cursor:pointer;
    `;

  }


  function openTeleprompter() {

    const modal =
      state.teleprompter
        .elements?.modal;


    if (!modal) {
      return;
    }


    modal.style.display =
      "flex";


    state.teleprompter.open =
      true;

  }


  function closeTeleprompter() {

    const modal =
      state.teleprompter
        .elements?.modal;


    if (!modal) {
      return;
    }


    modal.style.display =
      "none";


    state.teleprompter.open =
      false;

  }


  function playTeleprompter() {

    const content =
      state.teleprompter
        .elements?.content;


    if (!content) {
      return;
    }


    openTeleprompter();


    state.teleprompter.playing =
      true;


    let last =
      performance.now();


    const loop =
      now => {

        if (
          !state.teleprompter.playing
        ) {

          return;

        }


        const delta =
          now -
          last;


        last =
          now;


        const pixels =
          (
            state.teleprompter.speed *
            delta
          ) / 1000;


        content.scrollTop +=
          pixels;


        requestAnimationFrame(
          loop
        );

      };


    requestAnimationFrame(
      loop
    );

  }


  function pauseTeleprompter() {

    state.teleprompter.playing =
      false;

  }


  /* =======================================================
     SETTINGS
     ======================================================= */

  function setupSettings() {

    const modal =
      $("#settingsModal");

    const open =
      $("#settingsBtn");

    const close =
      $("#closeSettingsBtn");

    const closeFooter =
      $("#closeSettingsFooterBtn");

    const save =
      $("#saveSettingsBtn");

    open?.addEventListener(
      "click",
      () => {

        modal?.classList.add(
          "show"
        );

        modal?.removeAttribute(
          "hidden"
        );

      }
    );


    close?.addEventListener(
      "click",
      closeSettings
    );


    closeFooter?.addEventListener(
      "click",
      closeSettings
    );


    save?.addEventListener(
      "click",
      saveSettings
    );

  }


  function closeSettings() {

    const modal =
      $("#settingsModal");

    modal?.classList.remove(
      "show"
    );

    modal?.setAttribute(
      "hidden",
      ""
    );

  }


  function saveSettings() {

    const input =
      $("#brandNameInput");


    const name =
      input?.value.trim() ||
      "Personal Course Studio";


    state.settings.brandName =
      name;


    $$(
      "[data-brand-name]"
    ).forEach(
      element => {

        element.textContent =
          name;

      }
    );


    try {

      localStorage.setItem(
        "courseStudioSettings",
        JSON.stringify(
          state.settings
        )
      );

    } catch {}


    closeSettings();

    renderCompositionFrame();

    showToast(
      "Settings saved."
    );

  }


  function restoreSettings() {

    try {

      const raw =
        localStorage.getItem(
          "courseStudioSettings"
        );


      if (raw) {

        const saved =
          JSON.parse(raw);


        if (
          saved.brandName
        ) {

          state.settings.brandName =
            saved.brandName;

        }

      }

    } catch {}


    const input =
      $("#brandNameInput");


    if (input) {

      input.value =
        state.settings.brandName;

    }


    $$(
      "[data-brand-name]"
    ).forEach(
      element => {

        element.textContent =
          state.settings.brandName;

      }
    );

  }


  function restoreRecordingSettings() {

    try {

      const raw =
        localStorage.getItem(
          "courseStudioRecordingSettings"
        );


      if (!raw) {
        return;
      }


      const saved =
        JSON.parse(raw);


      if (
        saved.resolution
      ) {

        if (
          $("#recordingResolution")
        ) {

          $("#recordingResolution")
            .value =
            saved.resolution;

        }

        if (
          $("#advancedResolution")
        ) {

          $("#advancedResolution")
            .value =
            saved.resolution;

        }

      }


      if (
        saved.fps
      ) {

        if (
          $("#recordingFPS")
        ) {

          $("#recordingFPS")
            .value =
            saved.fps;

        }

        if (
          $("#advancedFPS")
        ) {

          $("#advancedFPS")
            .value =
            saved.fps;

        }

      }


      if (
        saved.bitrate &&
        $("#recordingBitrate")
      ) {

        $("#recordingBitrate")
          .value =
          saved.bitrate;

      }


      applyRecordingResolution();

    } catch (error) {

      console.warn(
        "Could not restore recording settings:",
        error
      );

    }

  }


  /* =======================================================
     FILE HANDLERS
     ======================================================= */

  function setupFiles() {

    $("#uploadMainBtn")
      ?.addEventListener(
        "click",
        () =>
          mainFileInput?.click()
      );


    $("#uploadVideoBtn")
      ?.addEventListener(
        "click",
        () =>
          mainVideoInput?.click()
      );


    $("#uploadMentorBtn")
      ?.addEventListener(
        "click",
        () =>
          mentorFileInput?.click()
      );


    mainFileInput?.addEventListener(
      "change",
      event => {

        const file =
          event.target.files?.[0];

        showMainImage(
          file
        );

      }
    );


    mainVideoInput?.addEventListener(
      "change",
      event => {

        const file =
          event.target.files?.[0];

        showMainVideo(
          file
        );

      }
    );


    mentorFileInput?.addEventListener(
      "change",
      event => {

        const file =
          event.target.files?.[0];

        showMentorVideo(
          file
        );

      }
    );


    backgroundImageUpload?.addEventListener(
      "change",
      event => {

        const file =
          event.target.files?.[0];

        if (!file) {
          return;
        }


        const image =
          new Image();


        image.onload =
          () => {

            state.ai.backgroundImage =
              image;

            state.ai.mode =
              "image";

            updateBackgroundButtons();

            renderCompositionFrame();

            showToast(
              "Custom background applied."
            );

          };


        image.src =
          URL.createObjectURL(
            file
          );

      }
    );

  }


  /* =======================================================
     BUTTONS
     ======================================================= */

  function setupButtons() {

    $("#mainPlayBtn")
      ?.addEventListener(
        "click",
        playMain
      );


    $("#mainPauseBtn")
      ?.addEventListener(
        "click",
        pauseMain
      );


    $("#startCameraBtn")
      ?.addEventListener(
        "click",
        startCamera
      );


    $("#stopCameraBtn")
      ?.addEventListener(
        "click",
        () =>
          stopCamera()
      );


    $("#startCameraSideBtn")
      ?.addEventListener(
        "click",
        startCamera
      );


    $("#stopCameraSideBtn")
      ?.addEventListener(
        "click",
        () =>
          stopCamera()
      );


    $("#switchCameraSideBtn")
      ?.addEventListener(
        "click",
        switchCamera
      );


    $("#recordBtn")
      ?.addEventListener(
        "click",
        startRecording
      );


    $("#toolbarRecordBtn")
      ?.addEventListener(
        "click",
        startRecording
      );


    /*
     * AI buttons
     */

    $("#bgOriginalBtn")
      ?.addEventListener(
        "click",
        () =>
          setBackgroundMode(
            "original"
          )
      );


    $("#bgRemoveBtn")
      ?.addEventListener(
        "click",
        () =>
          setBackgroundMode(
            "remove"
          )
      );


    $("#bgBlurBtn")
      ?.addEventListener(
        "click",
        () =>
          setBackgroundMode(
            "blur"
          )
      );


    $("#bgImageBtn")
      ?.addEventListener(
        "click",
        () =>
          setBackgroundMode(
            "image"
          )
      );


    $("#bgColorBtn")
      ?.addEventListener(
        "click",
        () =>
          setBackgroundMode(
            "color"
          )
      );


    $("#backgroundColor")
      ?.addEventListener(
        "input",
        () => {

          if (
            state.ai.mode ===
            "color"
          ) {

            renderCompositionFrame();

          }

        }
      );


    $("#backgroundColorPicker")
      ?.addEventListener(
        "input",
        event => {

          const input =
            $("#backgroundColor");

          if (input) {

            input.value =
              event.target.value;

          }

          if (
            state.ai.mode ===
            "color"
          ) {

            renderCompositionFrame();

          }

        }
      );


    /*
     * Teleprompter
     */

    $("#openTeleprompterTopBtn")
      ?.addEventListener(
        "click",
        openTeleprompter
      );


    $("#openTeleprompterBtn")
      ?.addEventListener(
        "click",
        openTeleprompter
      );


    $("#openTeleprompterSide")
      ?.addEventListener(
        "click",
        openTeleprompter
      );

  }


  function updateBackgroundButtons() {

    const buttons = [
      ["#bgOriginalBtn", "original"],
      ["#bgRemoveBtn", "remove"],
      ["#bgBlurBtn", "blur"],
      ["#bgImageBtn", "image"],
      ["#bgColorBtn", "color"]
    ];


    buttons.forEach(
      ([selector, mode]) => {

        $(selector)?.classList.toggle(
          "active",
          state.ai.mode ===
          mode
        );

      }
    );

  }


  /* =======================================================
     MENTOR DRAG + RESIZE
     ======================================================= */

  function setupMentorDragResize() {

    if (
      !mentorCard
    ) {

      return;

    }


    let dragging =
      false;

    let resizing =
      false;

    let startX =
      0;

    let startY =
      0;

    let startLeft =
      0;

    let startTop =
      0;

    let startWidth =
      0;

    let startHeight =
      0;


    mentorCard.addEventListener(
      "pointerdown",
      event => {

        if (
          event.target ===
          $("#mentorResize")
        ) {

          resizing =
            true;

        } else {

          dragging =
            true;

        }


        mentorCard.setPointerCapture(
          event.pointerId
        );


        const rect =
          mentorCard.getBoundingClientRect();


        const stageRect =
          stage.getBoundingClientRect();


        startX =
          event.clientX;

        startY =
          event.clientY;


        startLeft =
          rect.left -
          stageRect.left;

        startTop =
          rect.top -
          stageRect.top;


        startWidth =
          rect.width;

        startHeight =
          rect.height;


        mentorCard.classList.add(
          "dragging"
        );

        event.preventDefault();

      }
    );


    mentorCard.addEventListener(
      "pointermove",
      event => {

        if (
          !dragging &&
          !resizing
        ) {

          return;

        }


        const stageRect =
          stage.getBoundingClientRect();


        const dx =
          event.clientX -
          startX;

        const dy =
          event.clientY -
          startY;


        if (
          dragging
        ) {

          let left =
            startLeft +
            dx;

          let top =
            startTop +
            dy;


          const maxLeft =
            stageRect.width -
            mentorCard.offsetWidth;

          const maxTop =
            stageRect.height -
            mentorCard.offsetHeight;


          left =
            Math.max(
              0,
              Math.min(
                left,
                maxLeft
              )
            );


          top =
            Math.max(
              0,
              Math.min(
                top,
                maxTop
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


        if (
          resizing
        ) {

          let width =
            startWidth +
            dx;

          let height =
            startHeight +
            dy;


          const minWidth =
            130;

          const minHeight =
            90;


          const maxWidth =
            stageRect.width *
            .45;


          const maxHeight =
            stageRect.height *
            .70;


          width =
            Math.max(
              minWidth,
              Math.min(
                width,
                maxWidth
              )
            );


          height =
            Math.max(
              minHeight,
              Math.min(
                height,
                maxHeight
              )
            );


          mentorCard.style.width =
            `${width}px`;

          mentorCard.style.height =
            `${height}px`;

        }


        renderCompositionFrame();

      }
    );


    mentorCard.addEventListener(
      "pointerup",
      event => {

        dragging =
          false;

        resizing =
          false;


        mentorCard.classList.remove(
          "dragging"
        );


        try {

          mentorCard.releasePointerCapture(
            event.pointerId
          );

        } catch {}


        saveMentorPosition();

      }
    );


    mentorCard.addEventListener(
      "pointercancel",
      () => {

        dragging =
          false;

        resizing =
          false;

        mentorCard.classList.remove(
          "dragging"
        );

      }
    );

  }


  function saveMentorPosition() {

    try {

      localStorage.setItem(
        "courseStudioMentorPosition",
        JSON.stringify({
          left:
            mentorCard.style.left,

          top:
            mentorCard.style.top,

          right:
            mentorCard.style.right,

          bottom:
            mentorCard.style.bottom,

          width:
            mentorCard.style.width,

          height:
            mentorCard.style.height
        })
      );

    } catch {}

  }


  function restoreMentorPosition() {

    try {

      const raw =
        localStorage.getItem(
          "courseStudioMentorPosition"
        );


      if (!raw) {
        return;
      }


      const saved =
        JSON.parse(raw);


      if (
        saved.left
      ) {

        mentorCard.style.left =
          saved.left;

      }

      if (
        saved.top
      ) {

        mentorCard.style.top =
          saved.top;

      }

      if (
        saved.right
      ) {

        mentorCard.style.right =
          saved.right;

      }

      if (
        saved.bottom
      ) {

        mentorCard.style.bottom =
          saved.bottom;

      }

      if (
        saved.width
      ) {

        mentorCard.style.width =
          saved.width;

      }

      if (
        saved.height
      ) {

        mentorCard.style.height =
          saved.height;

      }

    } catch {}

  }


  function renderMentorState() {

    restoreMentorPosition();

    mentorPlaceholder.style.display =
      state.mentor.type ===
      "none"
        ? "flex"
        : "none";

  }


  /* =======================================================
     FULLSCREEN
     ======================================================= */

  function setupFullscreen() {

    $("#fullscreenStageBtn")
      ?.addEventListener(
        "click",
        toggleStageFullscreen
      );


    $("#fullscreenStageSideBtn")
      ?.addEventListener(
        "click",
        toggleStageFullscreen
      );


    $("#fullscreenStudioBtn")
      ?.addEventListener(
        "click",
        toggleStudioFullscreen
      );


    $("#fullscreenStudioSideBtn")
      ?.addEventListener(
        "click",
        toggleStudioFullscreen
      );


    document.addEventListener(
      "fullscreenchange",
      updateFullscreenStatus
    );

  }


  async function toggleStageFullscreen() {

    /*
     * Prefer native fullscreen.
     */

    if (
      document.fullscreenElement
    ) {

      try {
        await document.exitFullscreen();
      } catch {}

      return;

    }


    if (
      stage?.requestFullscreen
    ) {

      try {

        await stage.requestFullscreen();

        return;

      } catch (error) {

        console.warn(
          "Native stage fullscreen failed:",
          error
        );

      }

    }


    /*
     * CSS fallback.
     */

    document.body.classList.toggle(
      "stage-only-fullscreen"
    );

    document.body.classList.remove(
      "studio-fullscreen"
    );

  }


  async function toggleStudioFullscreen() {

    if (
      document.fullscreenElement
    ) {

      try {
        await document.exitFullscreen();
      } catch {}

      return;

    }


    const app =
      document.querySelector(
        ".studio-app"
      );


    if (
      app?.requestFullscreen
    ) {

      try {

        await app.requestFullscreen();

        return;

      } catch (error) {

        console.warn(
          "Native studio fullscreen failed:",
          error
        );

      }

    }


    document.body.classList.toggle(
      "studio-fullscreen"
    );

    document.body.classList.remove(
      "stage-only-fullscreen"
    );

  }


  function updateFullscreenStatus() {

    const fullscreen =
      Boolean(
        document.fullscreenElement
      );


    if (
      !fullscreen
    ) {

      document.body.classList.remove(
        "stage-only-fullscreen"
      );

      document.body.classList.remove(
        "studio-fullscreen"
      );

    }

  }


  /* =======================================================
     KEYBOARD SHORTCUTS
     ======================================================= */

  function setupKeyboard() {

    document.addEventListener(
      "keydown",
      event => {

        /*
         * Do not trigger shortcuts while
         * typing into fields.
         */

        const target =
          event.target;

        const typing =
          target instanceof
            HTMLInputElement ||
          target instanceof
            HTMLTextAreaElement ||
          target instanceof
            HTMLSelectElement ||
          target?.isContentEditable;


        /*
         * Escape
         */

        if (
          event.key ===
          "Escape"
        ) {

          closeTeleprompter();

          closeRecordingPreview();

          closeSettings();

          return;

        }


        if (
          typing
        ) {

          return;

        }


        /*
         * Ctrl + Enter
         * Start recording
         */

        if (
          event.ctrlKey &&
          event.key ===
            "Enter"
        ) {

          event.preventDefault();

          if (
            !state.recording.active
          ) {

            startRecording();

          }

          return;

        }


        /*
         * Ctrl + Shift + R
         */

        if (
          event.ctrlKey &&
          event.shiftKey &&
          event.key.toLowerCase() ===
            "r"
        ) {

          event.preventDefault();

          if (
            !state.recording.active
          ) {

            startRecording();

          } else {

            stopRecording();

          }

          return;

        }


        /*
         * Ctrl + Shift + S
         */

        if (
          event.ctrlKey &&
          event.shiftKey &&
          event.key.toLowerCase() ===
            "s"
        ) {

          event.preventDefault();

          if (
            !state.screen.active
          ) {

            startScreenCapture();

          } else {

            stopScreenCapture();

          }

          return;

        }


        /*
         * Ctrl + Shift + F
         */

        if (
          event.ctrlKey &&
          event.shiftKey &&
          event.key.toLowerCase() ===
            "f"
        ) {

          event.preventDefault();

          toggleStageFullscreen();

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

          } else {

            if (
              state.main.type ===
              "video"
            ) {

              if (
                mainVideo.paused
              ) {

                playMain();

              } else {

                pauseMain();

              }

            }

          }

        }

      }
    );

  }


  /* =======================================================
     STUDENTS
     ======================================================= */

  function setupStudents() {

    const add =
      $("#addStudentBtn");


    add?.addEventListener(
      "click",
      () => {

        const name =
          prompt(
            "Student name:"
          );


        if (
          !name ||
          !name.trim()
        ) {

          return;

        }


        addStudent(
          name.trim()
        );

      }
    );


    restoreStudents();

  }


  function getStudents() {

    try {

      return JSON.parse(
        localStorage.getItem(
          "courseStudioStudents"
        ) || "[]"
      );

    } catch {

      return [];

    }

  }


  function saveStudents(
    students
  ) {

    try {

      localStorage.setItem(
        "courseStudioStudents",
        JSON.stringify(
          students
        )
      );

    } catch {}

  }


  function addStudent(
    name
  ) {

    const students =
      getStudents();


    students.push({
      id:
        Date.now(),
      name
    });


    saveStudents(
      students
    );


    renderStudents();

  }


  function removeStudent(
    id
  ) {

    const students =
      getStudents()
        .filter(
          student =>
            student.id !==
            id
        );


    saveStudents(
      students
    );


    renderStudents();

  }


  function restoreStudents() {

    renderStudents();

  }


  function renderStudents() {

    const container =
      $("#studentsList");


    if (!container) {
      return;
    }


    const students =
      getStudents();


    container.innerHTML =
      "";


    if (
      students.length ===
      0
    ) {

      container.innerHTML = `
        <div
          style="
            padding:18px;
            text-align:center;
            opacity:.55;
            font-size:12px;
          "
        >
          No students added
        </div>
      `;

      return;

    }


    students.forEach(
      student => {

        const row =
          document.createElement(
            "div"
          );


        row.className =
          "student-row";


        row.innerHTML = `
          <span style="flex:1;">
            ${escapeHtml(
              student.name
            )}
          </span>

          <button
            type="button"
            style="
              background:transparent;
              color:#ff7182;
              cursor:pointer;
              border:0;
              font-size:12px;
            "
          >
            ×
          </button>
        `;


        row
          .querySelector(
            "button"
          )
          .addEventListener(
            "click",
            () =>
              removeStudent(
                student.id
              )
          );


        container.appendChild(
          row
        );

      }
    );

  }


  /* =======================================================
     STATUS
     ======================================================= */

  function updateStatus() {

    const system =
      $("#systemStatus");

    const dot =
      $("#systemStatusDot");


    if (
      state.recording.active
    ) {

      if (
        state.recording.paused
      ) {

        if (system) {
          system.textContent =
            "Recording Paused";
        }

        dot?.classList.remove(
          "green"
        );

      } else {

        if (system) {
          system.textContent =
            "Recording";
        }

        dot?.classList.add(
          "red"
        );

      }

      return;

    }


    if (
      state.screen.active
    ) {

      if (system) {
        system.textContent =
          "Screen Capture Active";
      }

      dot?.classList.add(
        "green"
      );

      dot?.classList.remove(
        "red"
      );

      return;

    }


    if (system) {
      system.textContent =
        "Studio Ready";
    }


    dot?.classList.add(
      "green"
    );

    dot?.classList.remove(
      "red"
    );

  }


  /* =======================================================
     TOAST
     ======================================================= */

  function showToast(
    message
  ) {

    let toast =
      $("#studioToast");


    if (!toast) {

      toast =
        document.createElement(
          "div"
        );


      toast.id =
        "studioToast";


      toast.style.cssText = `
        position:fixed;
        left:50%;
        bottom:75px;
        transform:translateX(-50%);
        z-index:100010;
        max-width:90vw;
        padding:10px 14px;
        border-radius:10px;
        background:rgba(10,16,25,.94);
        border:1px solid rgba(255,255,255,.1);
        box-shadow:0 12px 40px rgba(0,0,0,.4);
        color:#e7eef7;
        font-size:10px;
        pointer-events:none;
        opacity:0;
        transition:.2s ease;
      `;


      document.body.appendChild(
        toast
      );

    }


    toast.textContent =
      message;


    toast.style.opacity =
      "1";


    clearTimeout(
      toast._timer
    );


    toast._timer =
      setTimeout(
        () => {

          toast.style.opacity =
            "0";

        },
        2600
      );

  }


  /* =======================================================
     UTILITIES
     ======================================================= */

  function cleanupUrl(
    url
  ) {

    if (!url) {
      return;
    }


    try {

      URL.revokeObjectURL(
        url
      );

    } catch {}

  }


  function escapeHtml(
    value
  ) {

    return String(
      value
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


  /* =======================================================
     VIDEO EVENTS
     ======================================================= */

  if (mainVideo) {

    mainVideo.addEventListener(
      "loadedmetadata",
      () => {

        hideWelcome();

        renderCompositionFrame();

      }
    );


    mainVideo.addEventListener(
      "play",
      () => {

        hideWelcome();

      }
    );


    mainVideo.addEventListener(
      "ended",
      () => {

        renderCompositionFrame();

      }
    );

  }


  if (mentorVideo) {

    mentorVideo.addEventListener(
      "play",
      () =>
        renderCompositionFrame()
    );

    mentorVideo.addEventListener(
      "timeupdate",
      () =>
        renderCompositionFrame()
    );

  }


  /* =======================================================
     PAGE VISIBILITY
     ======================================================= */

  document.addEventListener(
    "visibilitychange",
    () => {

      /*
       * Don't stop recording when tab becomes
       * hidden. The render loop continues where
       * the browser allows it.
       */

      if (
        !document.hidden &&
        state.audio.context
      ) {

        if (
          state.audio.context.state ===
          "suspended"
        ) {

          state.audio.context
            .resume()
            .catch(
              () => {}
            );

        }

      }

    }
  );


  /* =======================================================
     CLEANUP
     ======================================================= */

  window.addEventListener(
    "beforeunload",
    () => {

      stopRecordingTimer();

      stopScreenCapture();

      stopCamera(false);


      if (
        state.audio.micStream
      ) {

        state.audio.micStream
          .getTracks()
          .forEach(
            track => {

              try {
                track.stop();
              } catch {}

            }
          );

      }


      cleanupUrl(
        state.main.objectUrl
      );

      cleanupUrl(
        state.mentor.objectUrl
      );

      cleanupUrl(
        state.recording.url
      );

    }
  );


  /* =======================================================
     GLOBAL API
     ======================================================= */

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

    openTeleprompter,

    closeTeleprompter,

    playTeleprompter,

    pauseTeleprompter,

    toggleStageFullscreen,

    toggleStudioFullscreen,

    renderCompositionFrame,

    isRecording:
      () =>
        state.recording.active,

    getState:
      () =>
        state

  };


  /* =======================================================
     GLOBAL AUDIO BRIDGE
     ======================================================= */

  window.CourseStudioMicVolume =
    () =>
      Number(
        $("#micVolume")
          ?.value || 100
      ) / 100;


  window.CourseStudioMicEnabled =
    () =>
      $("#micEnabled")
        ?.checked !== false;


  window.CourseStudioMicMonitor =
    () =>
      $("#micMonitor")
        ?.checked === true;


  /* =======================================================
     INIT
     ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      () => {

        setupStudents();

        init();

      },
      {
        once: true
      }
    );

  } else {

    setupStudents();

    init();

  }


})();
