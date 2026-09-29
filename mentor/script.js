/* =========================================================
   PERSONAL COURSE STUDIO
   STEP 3.6 — TELEPROMPTER + AUTO SCROLL + MIC VOICE TRACK
   File: mentor/script.js

   FEATURES
   ---------------------------------------------------------
   1. Main Image Upload
   2. Main Video Upload
   3. Main Video Play / Pause
   4. Mentor Video Upload
   5. Real Webcam
   6. Camera Switch
   7. AI Person Segmentation
   8. Original Background
   9. Remove Background
   10. Blur Background
   11. Custom Background Image
   12. Solid Background
   13. Mentor Drag
   14. Mentor Resize
   15. Students
   16. Settings
   17. Brand Name
   18. Composition Canvas
   19. Microphone Voice Track
   20. Main Video Audio
   21. Recording Timer
   22. Recording Pause / Resume
   23. Recording Preview
   24. Download Recording
   25. Record Again
   26. Teleprompter
   27. TXT Script Upload
   28. Auto Scroll
   29. Teleprompter Speed
   30. Font Size
   31. Opacity
   32. Manual Scroll
   33. Reset
   34. Start Teleprompter With Recording
   35. Teleprompter Recording Overlay Control

   ========================================================= */


/* =========================================================
   GLOBAL STATE
   ========================================================= */

const CourseStudio = {

  version: "3.6",

  recording: false,
  recordingPaused: false,

  mediaRecorder: null,
  recordedChunks: [],

  recordingStartTime: 0,
  recordingPausedAt: 0,
  recordingPausedTotal: 0,

  recordingTimerInterval: null,

  cameraStream: null,
  microphoneStream: null,

  currentCameraFacing: "user",

  segmentation: null,
  segmentationReady: false,
  segmentationBusy: false,

  backgroundMode: "original",
  customBackgroundImage: null,

  mentorSource: "placeholder",

  mentorX: null,
  mentorY: null,

  mentorWidth: null,
  mentorHeight: null,

  compositionCanvas: null,
  compositionCtx: null,

  audioContext: null,
  audioDestination: null,

  audioSources: new Map(),

  teleprompter: null,

  teleprompterAnimation: null,

  initialized: false
};


/* =========================================================
   DOM REFERENCES
   ========================================================= */

const $ = (id) => document.getElementById(id);


/* Main */

const stage = $("stage");

const mainImage = $("mainImage");
const mainVideo = $("mainVideo");

const welcomeContent = $("welcomeContent");


/* Mentor */

const mentorCard = $("mentorCard");

const mentorVideo = $("mentorVideo");
const mentorCameraVideo = $("mentorCameraVideo");
const mentorAICanvas = $("mentorAICanvas");

const mentorPlaceholder = $("mentorPlaceholder");
const mentorSourceLabel = $("mentorSourceLabel");

const mentorResize = $("mentorResize");


/* Brand */

const brandBadge = $("brandBadge");


/* Top / toolbar */

const uploadMainBtn = $("uploadMainBtn");
const uploadVideoBtn = $("uploadVideoBtn");

const mainPlayBtn = $("mainPlayBtn");
const mainPauseBtn = $("mainPauseBtn");

const uploadMentorBtn = $("uploadMentorBtn");

const startCameraBtn = $("startCameraBtn");
const stopCameraBtn = $("stopCameraBtn");
const switchCameraBtn = $("switchCameraBtn");

const recordBtn = $("recordBtn");

const settingsBtn = $("settingsBtn");


/* Side camera */

const startCameraSideBtn = $("startCameraSideBtn");
const stopCameraSideBtn = $("stopCameraSideBtn");
const switchCameraSideBtn = $("switchCameraSideBtn");

const cameraStatus = $("cameraStatus");


/* Background */

const bgOriginalBtn = $("bgOriginalBtn");
const bgRemoveBtn = $("bgRemoveBtn");
const bgBlurBtn = $("bgBlurBtn");
const bgImageBtn = $("bgImageBtn");
const bgColorBtn = $("bgColorBtn");

const backgroundColor = $("backgroundColor");
const backgroundImageUpload = $("backgroundImageUpload");


/* Teleprompter */

const openTeleprompterTopBtn = $("openTeleprompterTopBtn");
const openTeleprompterBtn = $("openTeleprompterBtn");


/* Audio */

const mainVideoAudioCheckbox = $("mainVideoAudioCheckbox");


/* Students */

const studentsList = $("studentsList");
const addStudentBtn = $("addStudentBtn");


/* Hidden files */

const mainFileInput = $("mainFileInput");
const mainVideoInput = $("mainVideoInput");
const mentorFileInput = $("mentorFileInput");


/* Settings */

const settingsModal = $("settingsModal");

const brandNameInput = $("brandNameInput");

const closeSettingsBtn = $("closeSettingsBtn");
const closeSettingsFooterBtn = $("closeSettingsFooterBtn");
const saveSettingsBtn = $("saveSettingsBtn");


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  initializeCourseStudio();

});


function initializeCourseStudio() {

  if (CourseStudio.initialized) {
    return;
  }

  CourseStudio.initialized = true;


  createCompositionCanvas();

  restoreSettings();

  restoreMentorSize();

  setupMainControls();

  setupMentorControls();

  setupCameraControls();

  setupBackgroundControls();

  setupStudentControls();

  setupSettingsControls();

  setupKeyboardShortcuts();

  setupStageResize();

  createTeleprompter();

  setupTeleprompterButtons();

  updateUI();

  renderCompositionLoop();

  console.log(
    "Personal Course Studio Step 3.6 initialized."
  );
}


/* =========================================================
   MAIN IMAGE
   ========================================================= */

function setupMainControls() {

  if (uploadMainBtn) {

    uploadMainBtn.addEventListener(
      "click",
      () => {
        if (mainFileInput) {
          mainFileInput.click();
        }
      }
    );

  }


  if (mainFileInput) {

    mainFileInput.addEventListener(
      "change",
      handleMainImageUpload
    );

  }


  if (uploadVideoBtn) {

    uploadVideoBtn.addEventListener(
      "click",
      () => {

        if (mainVideoInput) {
          mainVideoInput.click();
        }

      }
    );

  }


  if (mainVideoInput) {

    mainVideoInput.addEventListener(
      "change",
      handleMainVideoUpload
    );

  }


  if (mainPlayBtn) {

    mainPlayBtn.addEventListener(
      "click",
      playMainVideo
    );

  }


  if (mainPauseBtn) {

    mainPauseBtn.addEventListener(
      "click",
      pauseMainVideo
    );

  }


  if (mainVideo) {

    mainVideo.addEventListener(
      "play",
      () => {

        if (mainPlayBtn) {
          mainPlayBtn.disabled = true;
        }

        if (mainPauseBtn) {
          mainPauseBtn.disabled = false;
        }

        if (
          CourseStudio.teleprompter &&
          CourseStudio.teleprompter.startWithVideo
        ) {

          startTeleprompter();

        }

      }
    );


    mainVideo.addEventListener(
      "pause",
      () => {

        if (mainPlayBtn) {
          mainPlayBtn.disabled = false;
        }

        if (mainPauseBtn) {
          mainPauseBtn.disabled = true;
        }

      }
    );


    mainVideo.addEventListener(
      "ended",
      () => {

        if (mainPlayBtn) {
          mainPlayBtn.disabled = false;
        }

        if (mainPauseBtn) {
          mainPauseBtn.disabled = true;
        }

      }
    );

  }

}


/* =========================================================
   MAIN IMAGE UPLOAD
   ========================================================= */

function handleMainImageUpload(event) {

  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {

    showToast(
      "Please select an image file."
    );

    return;
  }


  const url = URL.createObjectURL(file);

  if (mainImage) {

    mainImage.src = url;

    mainImage.style.display = "block";

  }


  if (mainVideo) {

    mainVideo.pause();

    mainVideo.style.display = "none";

  }


  if (welcomeContent) {
    welcomeContent.style.display = "none";
  }


  showToast(
    "Main image loaded."
  );

}


/* =========================================================
   MAIN VIDEO UPLOAD
   ========================================================= */

function handleMainVideoUpload(event) {

  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("video/")) {

    showToast(
      "Please select a video file."
    );

    return;
  }


  const url = URL.createObjectURL(file);

  if (mainVideo) {

    mainVideo.src = url;

    mainVideo.style.display = "block";

    mainVideo.load();

  }


  if (mainImage) {

    mainImage.style.display = "none";

  }


  if (welcomeContent) {
    welcomeContent.style.display = "none";
  }


  showToast(
    "Main video loaded."
  );

}


/* =========================================================
   MAIN VIDEO PLAY
   ========================================================= */

function playMainVideo() {

  if (!mainVideo || !mainVideo.src) {

    showToast(
      "Upload a main video first."
    );

    return;
  }


  const promise = mainVideo.play();

  if (
    promise &&
    typeof promise.catch === "function"
  ) {

    promise.catch(
      (error) => {

        console.warn(
          "Main video play failed:",
          error
        );

        showToast(
          "Unable to play the video."
        );

      }
    );

  }

}


/* =========================================================
   MAIN VIDEO PAUSE
   ========================================================= */

function pauseMainVideo() {

  if (!mainVideo) {
    return;
  }

  mainVideo.pause();

}


/* =========================================================
   MENTOR CONTROLS
   ========================================================= */

function setupMentorControls() {

  if (uploadMentorBtn) {

    uploadMentorBtn.addEventListener(
      "click",
      () => {

        if (mentorFileInput) {
          mentorFileInput.click();
        }

      }
    );

  }


  if (mentorFileInput) {

    mentorFileInput.addEventListener(
      "change",
      handleMentorUpload
    );

  }


  if (mentorCard) {

    enableMentorDragging();

  }


  updateMentorVisual();

}


/* =========================================================
   MENTOR VIDEO UPLOAD
   ========================================================= */

function handleMentorUpload(event) {

  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("video/")) {

    showToast(
      "Please select a video file."
    );

    return;
  }


  stopCamera();


  const url = URL.createObjectURL(file);


  if (mentorVideo) {

    mentorVideo.src = url;

    mentorVideo.style.display = "block";

    mentorVideo.muted = true;

    mentorVideo.loop = true;

    mentorVideo.playsInline = true;

    mentorVideo.load();

  }


  if (mentorCameraVideo) {
    mentorCameraVideo.style.display = "none";
  }


  if (mentorAICanvas) {
    mentorAICanvas.style.display = "none";
  }


  if (mentorPlaceholder) {
    mentorPlaceholder.style.display = "none";
  }


  CourseStudio.mentorSource = "video";


  if (mentorSourceLabel) {

    mentorSourceLabel.textContent =
      "Mentor Video";

  }


  const promise =
    mentorVideo?.play();


  if (
    promise &&
    typeof promise.catch === "function"
  ) {

    promise.catch(
      () => {}
    );

  }


  showToast(
    "Mentor video loaded."
  );

}


/* =========================================================
   CAMERA CONTROLS
   ========================================================= */

function setupCameraControls() {

  const startButtons = [
    startCameraBtn,
    startCameraSideBtn
  ].filter(Boolean);


  const stopButtons = [
    stopCameraBtn,
    stopCameraSideBtn
  ].filter(Boolean);


  const switchButtons = [
    switchCameraBtn,
    switchCameraSideBtn
  ].filter(Boolean);


  startButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        startCamera
      );

    }
  );


  stopButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        stopCamera
      );

    }
  );


  switchButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        switchCamera
      );

    }
  );

}


/* =========================================================
   START CAMERA
   ========================================================= */

async function startCamera() {

  try {

    stopCamera(false);


    setCameraStatus(
      "Requesting camera..."
    );


    const constraints = {

      video: {

        facingMode: {
          ideal:
            CourseStudio.currentCameraFacing
        },

        width: {
          ideal: 1280
        },

        height: {
          ideal: 720
        }

      },

      audio: false

    };


    const stream =
      await navigator.mediaDevices
        .getUserMedia(
          constraints
        );


    CourseStudio.cameraStream =
      stream;


    if (mentorCameraVideo) {

      mentorCameraVideo.srcObject =
        stream;

      mentorCameraVideo.muted = true;

      mentorCameraVideo.playsInline = true;

      mentorCameraVideo.style.display =
        "block";


      const promise =
        mentorCameraVideo.play();


      if (
        promise &&
        typeof promise.catch === "function"
      ) {

        promise.catch(
          () => {}
        );

      }

    }


    if (mentorVideo) {
      mentorVideo.style.display =
        "none";
    }


    if (mentorPlaceholder) {
      mentorPlaceholder.style.display =
        "none";
    }


    CourseStudio.mentorSource =
      "camera";


    if (mentorSourceLabel) {

      mentorSourceLabel.textContent =
        "Live Camera";

    }


    setCameraStatus(
      "Camera connected"
    );


    updateUI();


    await initializeSegmentation();


    showToast(
      "Camera started."
    );

  } catch (error) {

    console.error(
      "Camera error:",
      error
    );


    setCameraStatus(
      "Camera permission denied"
    );


    showToast(
      "Camera could not be started."
    );

  }

}


/* =========================================================
   STOP CAMERA
   ========================================================= */

function stopCamera(
  showMessage = true
) {

  if (CourseStudio.cameraStream) {

    CourseStudio.cameraStream
      .getTracks()
      .forEach(
        (track) => track.stop()
      );

  }


  CourseStudio.cameraStream = null;


  if (mentorCameraVideo) {

    mentorCameraVideo.pause();

    mentorCameraVideo.srcObject =
      null;

    mentorCameraVideo.style.display =
      "none";

  }


  if (
    CourseStudio.mentorSource ===
    "camera"
  ) {

    CourseStudio.mentorSource =
      "placeholder";

  }


  if (mentorAICanvas) {
    mentorAICanvas.style.display =
      "none";
  }


  if (
    CourseStudio.mentorSource ===
    "placeholder"
  ) {

    if (mentorPlaceholder) {

      mentorPlaceholder.style.display =
        "flex";

    }

    if (mentorSourceLabel) {

      mentorSourceLabel.textContent =
        "Mentor";

    }

  }


  setCameraStatus(
    "Camera stopped"
  );


  updateUI();


  if (showMessage) {

    showToast(
      "Camera stopped."
    );

  }

}


/* =========================================================
   SWITCH CAMERA
   ========================================================= */

async function switchCamera() {

  CourseStudio.currentCameraFacing =
    CourseStudio.currentCameraFacing ===
    "user"
      ? "environment"
      : "user";


  if (
    CourseStudio.cameraStream
  ) {

    await startCamera();

  } else {

    showToast(
      "Camera will use the selected side when started."
    );

  }

}


/* =========================================================
   CAMERA STATUS
   ========================================================= */

function setCameraStatus(message) {

  if (!cameraStatus) {
    return;
  }

  cameraStatus.textContent =
    message;

}


/* =========================================================
   MEDIA PIPE SELFIE SEGMENTATION
   ========================================================= */

async function initializeSegmentation() {

  if (
    CourseStudio.segmentationReady
  ) {

    return;

  }


  if (
    typeof SelfieSegmentation ===
    "undefined"
  ) {

    console.warn(
      "MediaPipe SelfieSegmentation not found."
    );

    showToast(
      "AI background library is not available."
    );

    return;

  }


  try {

    CourseStudio.segmentation =
      new SelfieSegmentation({

        locateFile: (
          file
        ) => {

          return (
            "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/" +
            file
          );

        }

      });


    CourseStudio.segmentation.setOptions({

      modelSelection: 1

    });


    CourseStudio.segmentation.onResults(
      handleSegmentationResults
    );


    CourseStudio.segmentationReady =
      true;


    startSegmentationLoop();


  } catch (error) {

    console.error(
      "Segmentation initialization failed:",
      error
    );

  }

}


/* =========================================================
   SEGMENTATION LOOP
   ========================================================= */

function startSegmentationLoop() {

  const loop = async () => {

    if (
      CourseStudio.cameraStream &&
      CourseStudio.segmentation &&
      mentorCameraVideo &&
      mentorCameraVideo.readyState >= 2 &&
      !CourseStudio.segmentationBusy
    ) {

      CourseStudio.segmentationBusy =
        true;


      try {

        await CourseStudio.segmentation.send({
          image: mentorCameraVideo
        });

      } catch (error) {

        console.warn(
          "Segmentation frame error:",
          error
        );

      }


      CourseStudio.segmentationBusy =
        false;

    }


    requestAnimationFrame(
      loop
    );

  };


  requestAnimationFrame(
    loop
  );

}


/* =========================================================
   AI SEGMENTATION RESULT
   ========================================================= */

function handleSegmentationResults(
  results
) {

  if (
    !mentorAICanvas ||
    !results
  ) {

    return;

  }


  if (
    CourseStudio.backgroundMode ===
    "original"
  ) {

    mentorAICanvas.style.display =
      "none";

    return;

  }


  if (
    !results.image ||
    !results.segmentationMask
  ) {

    return;

  }


  drawPersonWithBackground(
    results.image,
    results.segmentationMask
  );


  mentorAICanvas.style.display =
    "block";


  if (mentorCameraVideo) {

    mentorCameraVideo.style.display =
      "none";

  }

}


/* =========================================================
   AI CANVAS PREPARATION
   ========================================================= */

function prepareAICanvas(
  width,
  height
) {

  if (!mentorAICanvas) {
    return null;
  }


  if (
    mentorAICanvas.width !== width ||
    mentorAICanvas.height !== height
  ) {

    mentorAICanvas.width =
      width;

    mentorAICanvas.height =
      height;

  }


  return mentorAICanvas.getContext(
    "2d",
    {
      willReadFrequently: true
    }
  );

}


/* =========================================================
   PERSON CANVAS CACHE
   ========================================================= */

let personCanvas = null;
let personCtx = null;

let sourceCanvas = null;
let sourceCtx = null;

let maskCanvas = null;
let maskCtx = null;


function ensureSegmentationCanvases(
  width,
  height
) {

  if (!personCanvas) {

    personCanvas =
      document.createElement(
        "canvas"
      );

    personCtx =
      personCanvas.getContext(
        "2d"
      );

  }


  if (!sourceCanvas) {

    sourceCanvas =
      document.createElement(
        "canvas"
      );

    sourceCtx =
      sourceCanvas.getContext(
        "2d",
        {
          willReadFrequently: true
        }
      );

  }


  if (!maskCanvas) {

    maskCanvas =
      document.createElement(
        "canvas"
      );

    maskCtx =
      maskCanvas.getContext(
        "2d",
        {
          willReadFrequently: true
        }
      );

  }


  if (
    personCanvas.width !== width ||
    personCanvas.height !== height
  ) {

    personCanvas.width =
      width;

    personCanvas.height =
      height;

  }


  if (
    sourceCanvas.width !== width ||
    sourceCanvas.height !== height
  ) {

    sourceCanvas.width =
      width;

    sourceCanvas.height =
      height;

  }


  if (
    maskCanvas.width !== width ||
    maskCanvas.height !== height
  ) {

    maskCanvas.width =
      width;

    maskCanvas.height =
      height;

  }

}


/* =========================================================
   DRAW PERSON + BACKGROUND
   ========================================================= */

function drawPersonWithBackground(
  image,
  mask
) {

  const width =
    image.videoWidth ||
    image.naturalWidth ||
    image.width ||
    640;


  const height =
    image.videoHeight ||
    image.naturalHeight ||
    image.height ||
    360;


  const ctx =
    prepareAICanvas(
      width,
      height
    );


  if (!ctx) {
    return;
  }


  ensureSegmentationCanvases(
    width,
    height
  );


  /* -----------------------------------------
     SOURCE
     ----------------------------------------- */

  sourceCtx.clearRect(
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


  /* -----------------------------------------
     MASK
     ----------------------------------------- */

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


  const personData =
    personCtx.createImageData(
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
      Soft edge.

      Low confidence:
      transparent.

      High confidence:
      visible.

      This avoids harsh cut-out edges.
    */

    let alpha =
      (confidence - 0.15) /
      0.65;


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


  /* -----------------------------------------
     BACKGROUND
     ----------------------------------------- */

  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  switch (
    CourseStudio.backgroundMode
  ) {

    case "remove":

      /*
        Transparent background.
      */

      break;


    case "blur":

      drawBlurredBackground(
        ctx,
        image,
        width,
        height
      );

      break;


    case "image":

      drawCustomBackground(
        ctx,
        width,
        height
      );

      break;


    case "color":

      ctx.fillStyle =
        backgroundColor?.value ||
        "#182235";

      ctx.fillRect(
        0,
        0,
        width,
        height
      );

      break;


    default:

      /*
        Fallback.
      */

      ctx.drawImage(
        image,
        0,
        0,
        width,
        height
      );

      break;

  }


  /* -----------------------------------------
     PERSON
     ----------------------------------------- */

  ctx.drawImage(
    personCanvas,
    0,
    0,
    width,
    height
  );

}


/* =========================================================
   BLURRED BACKGROUND
   ========================================================= */

function drawBlurredBackground(
  ctx,
  image,
  width,
  height
) {

  ctx.save();

  ctx.filter =
    "blur(18px)";


  const bleed =
    30;


  ctx.drawImage(
    image,
    -bleed,
    -bleed,
    width + bleed * 2,
    height + bleed * 2
  );


  ctx.restore();

}


/* =========================================================
   CUSTOM BACKGROUND
   ========================================================= */

function drawCustomBackground(
  ctx,
  width,
  height
) {

  if (
    !CourseStudio.customBackgroundImage
  ) {

    ctx.fillStyle =
      "#162033";

    ctx.fillRect(
      0,
      0,
      width,
      height
    );

    return;

  }


  drawImageCover(
    ctx,
    CourseStudio.customBackgroundImage,
    0,
    0,
    width,
    height
  );

}


/* =========================================================
   BACKGROUND CONTROLS
   ========================================================= */

function setupBackgroundControls() {

  if (bgOriginalBtn) {

    bgOriginalBtn.addEventListener(
      "click",
      () => setBackgroundMode(
        "original"
      )
    );

  }


  if (bgRemoveBtn) {

    bgRemoveBtn.addEventListener(
      "click",
      () => setBackgroundMode(
        "remove"
      )
    );

  }


  if (bgBlurBtn) {

    bgBlurBtn.addEventListener(
      "click",
      () => setBackgroundMode(
        "blur"
      )
    );

  }


  if (bgImageBtn) {

    bgImageBtn.addEventListener(
      "click",
      () => {

        if (backgroundImageUpload) {

          backgroundImageUpload.click();

        }

      }
    );

  }


  if (bgColorBtn) {

    bgColorBtn.addEventListener(
      "click",
      () => setBackgroundMode(
        "color"
      )
    );

  }


  if (backgroundColor) {

    backgroundColor.addEventListener(
      "input",
      () => {

        if (
          CourseStudio.backgroundMode ===
          "color"
        ) {

          renderCompositionFrame();

        }

      }
    );

  }


  if (backgroundImageUpload) {

    backgroundImageUpload.addEventListener(
      "change",
      handleBackgroundImageUpload
    );

  }

}


/* =========================================================
   SET BACKGROUND MODE
   ========================================================= */

function setBackgroundMode(
  mode
) {

  CourseStudio.backgroundMode =
    mode;


  setActiveButton(
    [
      bgOriginalBtn,
      bgRemoveBtn,
      bgBlurBtn,
      bgImageBtn,
      bgColorBtn
    ],
    mode
  );


  if (
    mode === "original"
  ) {

    if (
      CourseStudio.cameraStream
    ) {

      if (mentorCameraVideo) {

        mentorCameraVideo.style.display =
          "block";

      }

    }


    if (mentorAICanvas) {

      mentorAICanvas.style.display =
        "none";

    }

  } else {

    if (
      CourseStudio.cameraStream
    ) {

      if (mentorCameraVideo) {

        mentorCameraVideo.style.display =
          "none";

      }

      if (mentorAICanvas) {

        mentorAICanvas.style.display =
          "block";

      }

    }

  }


  renderCompositionFrame();

}


/* =========================================================
   ACTIVE BUTTON
   ========================================================= */

function setActiveButton(
  buttons,
  mode
) {

  const mapping = {

    original: bgOriginalBtn,
    remove: bgRemoveBtn,
    blur: bgBlurBtn,
    image: bgImageBtn,
    color: bgColorBtn

  };


  buttons.forEach(
    (button) => {

      if (!button) {
        return;
      }

      button.classList.remove(
        "active"
      );

    }
  );


  const active =
    mapping[mode];


  if (active) {

    active.classList.add(
      "active"
    );

  }

}


/* =========================================================
   BACKGROUND IMAGE UPLOAD
   ========================================================= */

function handleBackgroundImageUpload(
  event
) {

  const file =
    event.target.files?.[0];


  if (!file) {
    return;
  }


  if (
    !file.type.startsWith(
      "image/"
    )
  ) {

    showToast(
      "Please select an image."
    );

    return;

  }


  const image =
    new Image();


  image.onload = () => {

    CourseStudio.customBackgroundImage =
      image;


    setBackgroundMode(
      "image"
    );


    showToast(
      "Custom background applied."
    );

  };


  image.src =
    URL.createObjectURL(
      file
    );

}


/* =========================================================
   MENTOR DRAGGING
   ========================================================= */

function enableMentorDragging() {

  if (!mentorCard) {
    return;
  }


  let dragging = false;

  let startX = 0;
  let startY = 0;

  let initialX = 0;
  let initialY = 0;


  mentorCard.addEventListener(
    "pointerdown",
    (event) => {

      if (
        event.target === mentorResize
      ) {

        return;

      }


      if (
        event.target.closest(
          "button,input,select,textarea"
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


      startX =
        event.clientX;

      startY =
        event.clientY;


      initialX =
        rect.left;

      initialY =
        rect.top;


      mentorCard.style.transition =
        "none";


      event.preventDefault();

    }
  );


  mentorCard.addEventListener(
    "pointermove",
    (event) => {

      if (!dragging) {
        return;
      }


      const dx =
        event.clientX -
        startX;


      const dy =
        event.clientY -
        startY;


      const stageRect =
        stage?.getBoundingClientRect();


      if (!stageRect) {
        return;
      }


      let newLeft =
        initialX -
        stageRect.left +
        dx;


      let newTop =
        initialY -
        stageRect.top +
        dy;


      const cardRect =
        mentorCard.getBoundingClientRect();


      const maxLeft =
        stageRect.width -
        cardRect.width;


      const maxTop =
        stageRect.height -
        cardRect.height;


      newLeft =
        Math.max(
          0,
          Math.min(
            newLeft,
            maxLeft
          )
        );


      newTop =
        Math.max(
          0,
          Math.min(
            newTop,
            maxTop
          )
        );


      mentorCard.style.left =
        `${newLeft}px`;


      mentorCard.style.top =
        `${newTop}px`;


      mentorCard.style.right =
        "auto";


      mentorCard.style.bottom =
        "auto";


      CourseStudio.mentorX =
        newLeft;


      CourseStudio.mentorY =
        newTop;


      saveMentorPosition();

    }
  );


  const stopDragging =
    (event) => {

      if (!dragging) {
        return;
      }


      dragging = false;


      try {

        mentorCard.releasePointerCapture(
          event.pointerId
        );

      } catch (_) {}


      mentorCard.style.transition =
        "";


      saveMentorPosition();

    };


  mentorCard.addEventListener(
    "pointerup",
    stopDragging
  );


  mentorCard.addEventListener(
    "pointercancel",
    stopDragging
  );

}


/* =========================================================
   MENTOR SIZE
   ========================================================= */

function restoreMentorSize() {

  if (!mentorCard) {
    return;
  }


  const width =
    parseInt(
      localStorage.getItem(
        "courseStudioMentorWidth"
      ),
      10
    );


  const height =
    parseInt(
      localStorage.getItem(
        "courseStudioMentorHeight"
      ),
      10
    );


  if (
    Number.isFinite(width)
  ) {

    mentorCard.style.width =
      `${width}px`;

    CourseStudio.mentorWidth =
      width;

  }


  if (
    Number.isFinite(height)
  ) {

    mentorCard.style.height =
      `${height}px`;

    CourseStudio.mentorHeight =
      height;

  }


  const x =
    parseFloat(
      localStorage.getItem(
        "courseStudioMentorX"
      )
    );


  const y =
    parseFloat(
      localStorage.getItem(
        "courseStudioMentorY"
      )
    );


  if (
    Number.isFinite(x)
  ) {

    mentorCard.style.left =
      `${x}px`;

    mentorCard.style.right =
      "auto";

    CourseStudio.mentorX =
      x;

  }


  if (
    Number.isFinite(y)
  ) {

    mentorCard.style.top =
      `${y}px`;

    mentorCard.style.bottom =
      "auto";

    CourseStudio.mentorY =
      y;

  }

}


/* =========================================================
   SAVE MENTOR POSITION
   ========================================================= */

function saveMentorPosition() {

  if (!mentorCard) {
    return;
  }


  const rect =
    mentorCard.getBoundingClientRect();


  const stageRect =
    stage?.getBoundingClientRect();


  if (!stageRect) {
    return;
  }


  const x =
    rect.left -
    stageRect.left;


  const y =
    rect.top -
    stageRect.top;


  localStorage.setItem(
    "courseStudioMentorX",
    String(x)
  );


  localStorage.setItem(
    "courseStudioMentorY",
    String(y)
  );

}


/* =========================================================
   UPDATE MENTOR VISUAL
   ========================================================= */

function updateMentorVisual() {

  if (!mentorCard) {
    return;
  }


  if (
    CourseStudio.mentorSource ===
    "placeholder"
  ) {

    if (mentorPlaceholder) {

      mentorPlaceholder.style.display =
        "flex";

    }

    if (mentorVideo) {

      mentorVideo.style.display =
        "none";

    }

    if (mentorCameraVideo) {

      mentorCameraVideo.style.display =
        "none";

    }

    if (mentorAICanvas) {

      mentorAICanvas.style.display =
        "none";

    }

  }

}


/* =========================================================
   COMPOSITION CANVAS
   ========================================================= */

function createCompositionCanvas() {

  CourseStudio.compositionCanvas =
    document.createElement(
      "canvas"
    );


  CourseStudio.compositionCanvas.width =
    1920;


  CourseStudio.compositionCanvas.height =
    1080;


  CourseStudio.compositionCtx =
    CourseStudio.compositionCanvas.getContext(
      "2d"
    );

}


/* =========================================================
   RENDER COMPOSITION LOOP
   ========================================================= */

function renderCompositionLoop() {

  renderCompositionFrame();


  setTimeout(
    () => {

      requestAnimationFrame(
        renderCompositionLoop
      );

    },
    30
  );

}


/* =========================================================
   RENDER COMPOSITION FRAME
   ========================================================= */

function renderCompositionFrame() {

  const canvas =
    CourseStudio.compositionCanvas;


  const ctx =
    CourseStudio.compositionCtx;


  if (!canvas || !ctx) {
    return;
  }


  const width =
    canvas.width;


  const height =
    canvas.height;


  /* -----------------------------------------
     BACKGROUND
     ----------------------------------------- */

  ctx.fillStyle =
    "#10131b";


  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  /* -----------------------------------------
     MAIN MEDIA
     ----------------------------------------- */

  drawMainStage(
    ctx,
    width,
    height
  );


  /* -----------------------------------------
     MENTOR
     ----------------------------------------- */

  drawMentorOverlay(
    ctx,
    width,
    height
  );


  /* -----------------------------------------
     BRAND
     ----------------------------------------- */

  drawBrandBadge(
    ctx,
    width,
    height
  );

}


/* =========================================================
   DRAW MAIN STAGE
   ========================================================= */

function drawMainStage(
  ctx,
  width,
  height
) {

  if (
    mainVideo &&
    mainVideo.style.display !== "none" &&
    mainVideo.readyState >= 2
  ) {

    drawMediaCover(
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
    mainImage &&
    mainImage.style.display !== "none" &&
    mainImage.complete &&
    mainImage.naturalWidth > 0
  ) {

    drawImageCover(
      ctx,
      mainImage,
      0,
      0,
      width,
      height
    );


    return;

  }


  drawStudioWelcome(
    ctx,
    width,
    height
  );

}


/* =========================================================
   DRAW WELCOME
   ========================================================= */

function drawStudioWelcome(
  ctx,
  width,
  height
) {

  ctx.fillStyle =
    "#10151f";


  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  ctx.fillStyle =
    "#ffffff";


  ctx.textAlign =
    "center";


  ctx.font =
    "700 54px Arial";


  ctx.fillText(
    "Personal Course Studio",
    width / 2,
    height / 2 - 20
  );


  ctx.fillStyle =
    "rgba(255,255,255,.55)";


  ctx.font =
    "400 24px Arial";


  ctx.fillText(
    "Upload a slide, image or video to begin",
    width / 2,
    height / 2 + 30
  );


  ctx.textAlign =
    "left";

}


/* =========================================================
   DRAW MENTOR OVERLAY
   ========================================================= */

function drawMentorOverlay(
  ctx,
  width,
  height
) {

  if (!mentorCard) {
    return;
  }


  if (
    CourseStudio.mentorSource ===
    "placeholder"
  ) {

    return;

  }


  const stageRect =
    stage?.getBoundingClientRect();


  if (!stageRect) {
    return;
  }


  const cardRect =
    mentorCard.getBoundingClientRect();


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
    ) *
    scaleX;


  const y =
    (
      cardRect.top -
      stageRect.top
    ) *
    scaleY;


  const w =
    cardRect.width *
    scaleX;


  const h =
    cardRect.height *
    scaleY;


  ctx.save();


  ctx.shadowColor =
    "rgba(0,0,0,.45)";


  ctx.shadowBlur =
    35;


  ctx.shadowOffsetY =
    12;


  ctx.fillStyle =
    "rgba(0,0,0,.25)";


  roundedRect(
    ctx,
    x,
    y,
    w,
    h,
    24
  );


  ctx.fill();


  ctx.shadowColor =
    "transparent";


  /* -----------------------------------------
     Mentor media
     ----------------------------------------- */

  let media =
    null;


  if (
    CourseStudio.mentorSource ===
    "camera"
  ) {

    if (
      CourseStudio.backgroundMode !==
      "original" &&
      mentorAICanvas &&
      mentorAICanvas.style.display !==
        "none"
    ) {

      media =
        mentorAICanvas;

    } else {

      media =
        mentorCameraVideo;

    }

  } else if (
    CourseStudio.mentorSource ===
    "video"
  ) {

    media =
      mentorVideo;

  }


  if (media) {

    const hasSize =
      (
        media.videoWidth ||
        media.naturalWidth ||
        media.width
      ) > 0;


    if (hasSize) {

      drawMediaCover(
        ctx,
        media,
        x,
        y,
        w,
        h,
        true
      );

    }

  }


  ctx.restore();

}


/* =========================================================
   DRAW BRAND BADGE
   ========================================================= */

function drawBrandBadge(
  ctx,
  width,
  height
) {

  if (!brandBadge) {
    return;
  }


  const text =
    brandBadge.textContent ||
    localStorage.getItem(
      "courseStudioBrandName"
    ) ||
    "Personal Course Studio";


  if (!text.trim()) {
    return;
  }


  const paddingX =
    22;


  const paddingY =
    12;


  ctx.save();


  ctx.font =
    "600 22px Arial";


  const metrics =
    ctx.measureText(
      text
    );


  const badgeWidth =
    metrics.width +
    paddingX * 2;


  const badgeHeight =
    52;


  const x =
    32;


  const y =
    height -
    badgeHeight -
    32;


  ctx.fillStyle =
    "rgba(0,0,0,.58)";


  roundedRect(
    ctx,
    x,
    y,
    badgeWidth,
    badgeHeight,
    14
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
    x + paddingX,
    y + badgeHeight / 2
  );


  ctx.restore();

}


/* =========================================================
   MEDIA COVER
   ========================================================= */

function drawMediaCover(
  ctx,
  media,
  x,
  y,
  width,
  height,
  rounded = false
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


  const drawWidth =
    mediaWidth *
    scale;


  const drawHeight =
    mediaHeight *
    scale;


  const drawX =
    x +
    (
      width -
      drawWidth
    ) / 2;


  const drawY =
    y +
    (
      height -
      drawHeight
    ) / 2;


  ctx.save();


  if (rounded) {

    roundedRect(
      ctx,
      x,
      y,
      width,
      height,
      24
    );

    ctx.clip();

  }


  ctx.drawImage(
    media,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );


  ctx.restore();

}


/* =========================================================
   IMAGE COVER
   ========================================================= */

function drawImageCover(
  ctx,
  image,
  x,
  y,
  width,
  height
) {

  const imageWidth =
    image.naturalWidth ||
    image.width;


  const imageHeight =
    image.naturalHeight ||
    image.height;


  if (
    !imageWidth ||
    !imageHeight
  ) {

    return;

  }


  const scale =
    Math.max(
      width / imageWidth,
      height / imageHeight
    );


  const drawWidth =
    imageWidth *
    scale;


  const drawHeight =
    imageHeight *
    scale;


  const drawX =
    x +
    (
      width -
      drawWidth
    ) / 2;


  const drawY =
    y +
    (
      height -
      drawHeight
    ) / 2;


  ctx.drawImage(
    image,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );

}


/* =========================================================
   ROUNDED RECT
   ========================================================= */

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


/* =========================================================
   AUDIO MIX
   ========================================================= */

async function prepareAudioMix() {

  if (
    !CourseStudio.audioContext
  ) {

    CourseStudio.audioContext =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

  }


  const audioContext =
    CourseStudio.audioContext;


  if (
    audioContext.state ===
    "suspended"
  ) {

    await audioContext.resume();

  }


  if (
    !CourseStudio.audioDestination
  ) {

    CourseStudio.audioDestination =
      audioContext.createMediaStreamDestination();

  }


  /* -----------------------------------------
     Main video audio
     ----------------------------------------- */

  if (
    mainVideo &&
    mainVideo.src &&
    mainVideoAudioCheckbox?.checked
  ) {

    const source =
      getOrCreateAudioSource(
        mainVideo
      );


    if (source) {

      try {

        source.connect(
          CourseStudio.audioDestination
        );

      } catch (_) {}

    }

  }


  /* -----------------------------------------
     Mentor video audio
     ----------------------------------------- */

  if (
    mentorVideo &&
    mentorVideo.src &&
    CourseStudio.mentorSource ===
      "video"
  ) {

    const source =
      getOrCreateAudioSource(
        mentorVideo
      );


    if (source) {

      try {

        source.connect(
          CourseStudio.audioDestination
        );

      } catch (_) {}

    }

  }


  /* -----------------------------------------
     Microphone
     ----------------------------------------- */

  try {

    CourseStudio.microphoneStream =
      await navigator.mediaDevices
        .getUserMedia({

          audio: {

            echoCancellation: true,

            noiseSuppression: true,

            autoGainControl: true

          },

          video: false

        });


    const micSource =
      audioContext.createMediaStreamSource(
        CourseStudio.microphoneStream
      );


    micSource.connect(
      CourseStudio.audioDestination
    );


    CourseStudio.microphoneAudioSource =
      micSource;


    updateMicStatus(
      "Microphone connected"
    );


  } catch (error) {

    console.warn(
      "Microphone unavailable:",
      error
    );


    CourseStudio.microphoneStream =
      null;


    updateMicStatus(
      "Microphone unavailable — recording video only"
    );

  }


  return CourseStudio.audioDestination.stream;

}


/* =========================================================
   AUDIO SOURCE CACHE
   ========================================================= */

function getOrCreateAudioSource(
  media
) {

  if (
    CourseStudio.audioSources.has(
      media
    )
  ) {

    return CourseStudio.audioSources.get(
      media
    );

  }


  try {

    const source =
      CourseStudio.audioContext
        .createMediaElementSource(
          media
        );


    CourseStudio.audioSources.set(
      media,
      source
    );


    return source;

  } catch (error) {

    console.warn(
      "Could not create audio source:",
      error
    );


    return null;

  }

}


/* =========================================================
   MICROPHONE STATUS
   ========================================================= */

function updateMicStatus(
  message
) {

  const element =
    document.querySelector(
      "[data-mic-status]"
    );


  if (element) {

    element.textContent =
      message;

  }

}


/* =========================================================
   RECORDING UI
   ========================================================= */

let recordingControls =
  null;


let recordingTimerElement =
  null;


let recordingPauseButton =
  null;


function createRecordingControls() {

  if (recordingControls) {
    return;
  }


  recordingControls =
    document.createElement(
      "div"
    );


  recordingControls.id =
    "courseStudioRecordingControls";


  recordingControls.innerHTML = `

    <div
      class="cstudio-recording-bar"
      style="
        position:fixed;
        left:50%;
        bottom:22px;
        transform:translateX(-50%);
        z-index:99990;
        display:flex;
        align-items:center;
        gap:12px;
        padding:10px 14px;
        border:1px solid rgba(255,255,255,.12);
        border-radius:16px;
        background:rgba(10,13,20,.92);
        backdrop-filter:blur(18px);
        box-shadow:0 18px 50px rgba(0,0,0,.45);
        color:#fff;
        font-family:Arial,sans-serif;
      "
    >

      <span
        style="
          width:10px;
          height:10px;
          border-radius:50%;
          background:#ff3b5c;
          box-shadow:0 0 14px rgba(255,59,92,.8);
        "
      ></span>

      <strong
        data-recording-time
        style="
          min-width:65px;
          text-align:center;
          font-size:14px;
        "
      >
        00:00
      </strong>

      <button
        type="button"
        data-recording-pause
        style="
          border:0;
          border-radius:10px;
          padding:9px 13px;
          cursor:pointer;
          background:#fff;
          color:#111;
          font-weight:700;
        "
      >
        Pause
      </button>

      <button
        type="button"
        data-recording-stop
        style="
          border:0;
          border-radius:10px;
          padding:9px 13px;
          cursor:pointer;
          background:#ff3b5c;
          color:#fff;
          font-weight:700;
        "
      >
        Stop
      </button>

    </div>

  `;


  document.body.appendChild(
    recordingControls
  );


  recordingTimerElement =
    recordingControls.querySelector(
      "[data-recording-time]"
    );


  recordingPauseButton =
    recordingControls.querySelector(
      "[data-recording-pause]"
    );


  const stopButton =
    recordingControls.querySelector(
      "[data-recording-stop]"
    );


  recordingPauseButton?.addEventListener(
    "click",
    toggleRecordingPause
  );


  stopButton?.addEventListener(
    "click",
    stopRecording
  );

}


/* =========================================================
   REMOVE RECORDING CONTROLS
   ========================================================= */

function removeRecordingControls() {

  if (
    recordingControls
  ) {

    recordingControls.remove();

  }


  recordingControls =
    null;


  recordingTimerElement =
    null;


  recordingPauseButton =
    null;

}


/* =========================================================
   START RECORDING
   ========================================================= */

async function startRecording() {

  if (
    CourseStudio.recording
  ) {

    return;

  }


  try {

    createRecordingControls();


    CourseStudio.recordedChunks =
      [];


    const audioStream =
      await prepareAudioMix();


    const videoStream =
      CourseStudio.compositionCanvas
        .captureStream(
          30
        );


    const combinedStream =
      new MediaStream();


    videoStream
      .getVideoTracks()
      .forEach(
        (track) => {

          combinedStream.addTrack(
            track
          );

        }
      );


    if (audioStream) {

      audioStream
        .getAudioTracks()
        .forEach(
          (track) => {

            combinedStream.addTrack(
              track
            );

          }
        );

    }


    CourseStudio.recordingStream =
      combinedStream;


    const mimeType =
      getSupportedRecordingMimeType();


    const options = {};


    if (mimeType) {

      options.mimeType =
        mimeType;

    }


    options.videoBitsPerSecond =
      6000000;


    options.audioBitsPerSecond =
      192000;


    CourseStudio.mediaRecorder =
      new MediaRecorder(
        combinedStream,
        options
      );


    CourseStudio.mediaRecorder.ondataavailable =
      (event) => {

        if (
          event.data &&
          event.data.size > 0
        ) {

          CourseStudio.recordedChunks
            .push(
              event.data
            );

        }

      };


    CourseStudio.mediaRecorder.onerror =
      (event) => {

        console.error(
          "MediaRecorder error:",
          event
        );


        showToast(
          "Recording error occurred."
        );

      };


    CourseStudio.mediaRecorder.onstop =
      handleRecordingStopped;


    CourseStudio.mediaRecorder.onpause =
      () => {

        CourseStudio.recordingPaused =
          true;

        updateRecordingPauseButton();

      };


    CourseStudio.mediaRecorder.onresume =
      () => {

        CourseStudio.recordingPaused =
          false;

        updateRecordingPauseButton();

      };


    CourseStudio.mediaRecorder.start(
      1000
    );


    CourseStudio.recording =
      true;


    CourseStudio.recordingPaused =
      false;


    CourseStudio.recordingStartTime =
      performance.now();


    CourseStudio.recordingPausedAt =
      0;


    CourseStudio.recordingPausedTotal =
      0;


    startRecordingTimer();


    updateRecordingButton();


    if (
      CourseStudio.teleprompter &&
      CourseStudio.teleprompter.startWithRecord
    ) {

      startTeleprompter();

    }


    showToast(
      "Recording started."
    );

  } catch (error) {

    console.error(
      "Recording failed:",
      error
    );


    CourseStudio.recording =
      false;


    removeRecordingControls();


    cleanupRecordingResources();


    showToast(
      "Could not start recording."
    );

  }

}


/* =========================================================
   RECORDING MIME
   ========================================================= */

function getSupportedRecordingMimeType() {

  const types = [

    "video/webm;codecs=vp9,opus",

    "video/webm;codecs=vp8,opus",

    "video/webm"

  ];


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


  return "";

}


/* =========================================================
   RECORDING TIMER
   ========================================================= */

function startRecordingTimer() {

  clearInterval(
    CourseStudio.recordingTimerInterval
  );


  CourseStudio.recordingTimerInterval =
    setInterval(
      updateRecordingTimer,
      250
    );


  updateRecordingTimer();

}


/* =========================================================
   UPDATE TIMER
   ========================================================= */

function updateRecordingTimer() {

  if (
    !CourseStudio.recording
  ) {

    return;

  }


  if (
    CourseStudio.recordingPaused
  ) {

    return;

  }


  const now =
    performance.now();


  const elapsed =
    now -
    CourseStudio.recordingStartTime -
    CourseStudio.recordingPausedTotal;


  const seconds =
    Math.max(
      0,
      Math.floor(
        elapsed / 1000
      )
    );


  if (
    recordingTimerElement
  ) {

    recordingTimerElement.textContent =
      formatTime(
        seconds
      );

  }

}


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatTime(
  seconds
) {

  const total =
    Math.max(
      0,
      Math.floor(
        seconds
      )
    );


  const hours =
    Math.floor(
      total / 3600
    );


  const minutes =
    Math.floor(
      (
        total % 3600
      ) / 60
    );


  const secs =
    total % 60;


  if (hours > 0) {

    return [

      String(hours)
        .padStart(2, "0"),

      String(minutes)
        .padStart(2, "0"),

      String(secs)
        .padStart(2, "0")

    ].join(":");

  }


  return [

    String(minutes)
      .padStart(2, "0"),

    String(secs)
      .padStart(2, "0")

  ].join(":");

}


/* =========================================================
   TOGGLE RECORDING PAUSE
   ========================================================= */

function toggleRecordingPause() {

  if (
    !CourseStudio.mediaRecorder
  ) {

    return;

  }


  if (
    CourseStudio.mediaRecorder.state ===
    "recording"
  ) {

    CourseStudio.recordingPausedAt =
      performance.now();


    CourseStudio.mediaRecorder.pause();


    if (
      CourseStudio.teleprompter
    ) {

      pauseTeleprompter();

    }


    return;

  }


  if (
    CourseStudio.mediaRecorder.state ===
    "paused"
  ) {

    if (
      CourseStudio.recordingPausedAt
    ) {

      CourseStudio.recordingPausedTotal +=
        performance.now() -
        CourseStudio.recordingPausedAt;

    }


    CourseStudio.recordingPausedAt =
      0;


    CourseStudio.mediaRecorder.resume();


    if (
      CourseStudio.teleprompter &&
      CourseStudio.teleprompter.autoResumeAfterRecordingPause
    ) {

      startTeleprompter();

    }

  }

}


/* =========================================================
   UPDATE PAUSE BUTTON
   ========================================================= */

function updateRecordingPauseButton() {

  if (
    !recordingPauseButton
  ) {

    return;

  }


  if (
    CourseStudio.recordingPaused
  ) {

    recordingPauseButton.textContent =
      "Resume";

  } else {

    recordingPauseButton.textContent =
      "Pause";

  }

}


/* =========================================================
   STOP RECORDING
   ========================================================= */

function stopRecording() {

  if (
    !CourseStudio.mediaRecorder
  ) {

    return;

  }


  if (
    CourseStudio.mediaRecorder.state ===
      "inactive"
  ) {

    return;

  }


  try {

    CourseStudio.mediaRecorder.stop();

  } catch (error) {

    console.warn(
      "Stop recording error:",
      error
    );

  }

}


/* =========================================================
   RECORDING STOPPED
   ========================================================= */

function handleRecordingStopped() {

  CourseStudio.recording =
    false;


  CourseStudio.recordingPaused =
    false;


  clearInterval(
    CourseStudio.recordingTimerInterval
  );


  CourseStudio.recordingTimerInterval =
    null;


  if (
    CourseStudio.teleprompter
  ) {

    stopTeleprompter();

  }


  const chunks =
    CourseStudio.recordedChunks;


  if (
    !chunks ||
    chunks.length === 0
  ) {

    cleanupRecordingResources();

    removeRecordingControls();


    showToast(
      "No recording data was created."
    );


    return;

  }


  const mimeType =
    CourseStudio.mediaRecorder?.mimeType ||
    "video/webm";


  const blob =
    new Blob(
      chunks,
      {
        type: mimeType
      }
    );


  showRecordingPreview(
    blob
  );


  cleanupRecordingResources();

  removeRecordingControls();


  updateRecordingButton();

}


/* =========================================================
   CLEAN RECORDING RESOURCES
   ========================================================= */

function cleanupRecordingResources() {

  if (
    CourseStudio.microphoneStream
  ) {

    CourseStudio.microphoneStream
      .getTracks()
      .forEach(
        (track) => track.stop()
      );

  }


  CourseStudio.microphoneStream =
    null;


  CourseStudio.microphoneAudioSource =
    null;


  if (
    CourseStudio.recordingStream
  ) {

    CourseStudio.recordingStream
      .getTracks()
      .forEach(
        (track) => {

          try {
            track.stop();
          } catch (_) {}

        }
      );

  }


  CourseStudio.recordingStream =
    null;


  CourseStudio.mediaRecorder =
    null;

}


/* =========================================================
   RECORDING BUTTON UI
   ========================================================= */

function updateRecordingButton() {

  if (!recordBtn) {
    return;
  }


  if (
    CourseStudio.recording
  ) {

    recordBtn.classList.add(
      "recording"
    );


    recordBtn.setAttribute(
      "aria-label",
      "Stop recording"
    );


  } else {

    recordBtn.classList.remove(
      "recording"
    );


    recordBtn.setAttribute(
      "aria-label",
      "Start recording"
    );

  }

}


/* =========================================================
   RECORDING PREVIEW MODAL
   ========================================================= */

let previewModal =
  null;


let previewVideo =
  null;


let previewBlob =
  null;


let previewUrl =
  null;


function createPreviewModal() {

  if (previewModal) {
    return;
  }


  previewModal =
    document.createElement(
      "div"
    );


  previewModal.id =
    "courseStudioRecordingPreview";


  previewModal.innerHTML = `

    <div
      style="
        position:fixed;
        inset:0;
        z-index:999999;
        background:rgba(0,0,0,.82);
        backdrop-filter:blur(14px);
        display:flex;
        align-items:center;
        justify-content:center;
        padding:24px;
      "
      data-preview-backdrop
    >

      <div
        style="
          width:min(1100px,100%);
          max-height:92vh;
          overflow:auto;
          background:#111722;
          border:1px solid rgba(255,255,255,.1);
          border-radius:22px;
          box-shadow:0 30px 100px rgba(0,0,0,.55);
          color:#fff;
          padding:20px;
          font-family:Arial,sans-serif;
        "
      >

        <div
          style="
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:15px;
            margin-bottom:16px;
          "
        >

          <div>

            <div
              style="
                font-size:20px;
                font-weight:800;
              "
            >
              Recording Preview
            </div>

            <div
              style="
                color:rgba(255,255,255,.55);
                font-size:13px;
                margin-top:4px;
              "
            >
              Review your course recording before saving.
            </div>

          </div>

          <button
            type="button"
            data-preview-close
            style="
              width:40px;
              height:40px;
              border:0;
              border-radius:12px;
              cursor:pointer;
              background:rgba(255,255,255,.08);
              color:#fff;
              font-size:20px;
            "
          >
            ×
          </button>

        </div>


        <video
          data-preview-video
          controls
          playsinline
          style="
            display:block;
            width:100%;
            max-height:65vh;
            border-radius:16px;
            background:#000;
          "
        ></video>


        <div
          style="
            display:flex;
            flex-wrap:wrap;
            gap:10px;
            margin-top:16px;
          "
        >

          <button
            type="button"
            data-preview-download
            style="
              border:0;
              border-radius:12px;
              padding:12px 16px;
              cursor:pointer;
              background:#fff;
              color:#111;
              font-weight:800;
            "
          >
            Download Recording
          </button>


          <button
            type="button"
            data-preview-again
            style="
              border:1px solid rgba(255,255,255,.12);
              border-radius:12px;
              padding:12px 16px;
              cursor:pointer;
              background:rgba(255,255,255,.06);
              color:#fff;
              font-weight:700;
            "
          >
            Record Again
          </button>


          <button
            type="button"
            data-preview-delete
            style="
              border:1px solid rgba(255,80,100,.25);
              border-radius:12px;
              padding:12px 16px;
              cursor:pointer;
              background:rgba(255,80,100,.08);
              color:#ff9bab;
              font-weight:700;
            "
          >
            Delete
          </button>

        </div>

      </div>

    </div>

  `;


  document.body.appendChild(
    previewModal
  );


  previewVideo =
    previewModal.querySelector(
      "[data-preview-video]"
    );


  previewModal.querySelector(
    "[data-preview-close]"
  )?.addEventListener(
    "click",
    closePreview
  );


  previewModal.querySelector(
    "[data-preview-download]"
  )?.addEventListener(
    "click",
    downloadPreview
  );


  previewModal.querySelector(
    "[data-preview-again]"
  )?.addEventListener(
    "click",
    () => {

      closePreview();

      startRecording();

    }
  );


  previewModal.querySelector(
    "[data-preview-delete]"
  )?.addEventListener(
    "click",
    () => {

      closePreview();

      previewBlob =
        null;

      showToast(
        "Recording deleted."
      );

    }
  );


  previewModal.querySelector(
    "[data-preview-backdrop]"
  )?.addEventListener(
    "click",
    (event) => {

      if (
        event.target ===
        event.currentTarget
      ) {

        closePreview();

      }

    }
  );

}


/* =========================================================
   SHOW PREVIEW
   ========================================================= */

function showRecordingPreview(
  blob
) {

  createPreviewModal();


  if (previewUrl) {

    URL.revokeObjectURL(
      previewUrl
    );

  }


  previewBlob =
    blob;


  previewUrl =
    URL.createObjectURL(
      blob
    );


  if (previewVideo) {

    previewVideo.src =
      previewUrl;

    previewVideo.load();

  }


  if (previewModal) {

    previewModal.style.display =
      "block";

  }

}


/* =========================================================
   CLOSE PREVIEW
   ========================================================= */

function closePreview() {

  if (!previewModal) {
    return;
  }


  previewModal.style.display =
    "none";


  if (previewVideo) {

    previewVideo.pause();

  }

}


/* =========================================================
   DOWNLOAD PREVIEW
   ========================================================= */

function downloadPreview() {

  if (!previewBlob) {

    showToast(
      "No recording available."
    );

    return;

  }


  const url =
    URL.createObjectURL(
      previewBlob
    );


  const link =
    document.createElement(
      "a"
    );


  const now =
    new Date();


  const date =
    now.toISOString()
      .slice(0, 10);


  const time =
    now.toTimeString()
      .slice(0, 8)
      .replace(
        /:/g,
        "-"
      );


  link.href =
    url;


  link.download =
    `Personal-Course-Studio-${date}_${time}.webm`;


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
    1000
  );


  showToast(
    "Recording download started."
  );

}


/* =========================================================
   RECORD BUTTON
   ========================================================= */

if (recordBtn) {

  recordBtn.addEventListener(
    "click",
    () => {

      if (
        CourseStudio.recording
      ) {

        stopRecording();

      } else {

        startRecording();

      }

    }
  );

}


/* =========================================================
   STUDENTS
   ========================================================= */

function setupStudentControls() {

  if (addStudentBtn) {

    addStudentBtn.addEventListener(
      "click",
      addStudent
    );

  }


  renderStudents();

}


/* =========================================================
   DEFAULT STUDENTS
   ========================================================= */

function getStudents() {

  try {

    const data =
      JSON.parse(
        localStorage.getItem(
          "courseStudioStudents"
        ) || "[]"
      );


    if (
      Array.isArray(data)
    ) {

      return data;

    }

  } catch (_) {}


  return [];

}


/* =========================================================
   SAVE STUDENTS
   ========================================================= */

function saveStudents(
  students
) {

  localStorage.setItem(
    "courseStudioStudents",
    JSON.stringify(
      students
    )
  );

}


/* =========================================================
   ADD STUDENT
   ========================================================= */

function addStudent() {

  const name =
    prompt(
      "Enter student name:"
    );


  if (
    !name ||
    !name.trim()
  ) {

    return;

  }


  const students =
    getStudents();


  students.push({
    id: Date.now(),
    name: name.trim()
  });


  saveStudents(
    students
  );


  renderStudents();

}


/* =========================================================
   REMOVE STUDENT
   ========================================================= */

function removeStudent(
  id
) {

  const students =
    getStudents()
      .filter(
        (student) =>
          student.id !== id
      );


  saveStudents(
    students
  );


  renderStudents();

}


/* =========================================================
   RENDER STUDENTS
   ========================================================= */

function renderStudents() {

  if (!studentsList) {
    return;
  }


  const students =
    getStudents();


  studentsList.innerHTML =
    "";


  if (
    students.length === 0
  ) {

    studentsList.innerHTML = `

      <div
        style="
          padding:12px;
          color:rgba(255,255,255,.45);
          font-size:13px;
        "
      >
        No students added yet.
      </div>

    `;

    return;

  }


  students.forEach(
    (student) => {

      const item =
        document.createElement(
          "div"
        );


      item.style.cssText = `

        display:flex;
        align-items:center;
        gap:10px;
        padding:9px;
        border-radius:12px;
        background:rgba(255,255,255,.04);
        margin-bottom:7px;

      `;


      item.innerHTML = `

        <span
          style="
            width:9px;
            height:9px;
            border-radius:50%;
            background:#35d07f;
            box-shadow:0 0 10px rgba(53,208,127,.5);
          "
        ></span>

        <span
          style="
            flex:1;
            min-width:0;
            overflow:hidden;
            text-overflow:ellipsis;
            white-space:nowrap;
          "
        >
          ${escapeHTML(
            student.name
          )}
        </span>

        <button
          type="button"
          data-remove-student
          style="
            border:0;
            background:transparent;
            color:rgba(255,255,255,.45);
            cursor:pointer;
          "
          aria-label="Remove student"
        >
          ×
        </button>

      `;


      item.querySelector(
        "[data-remove-student]"
      )?.addEventListener(
        "click",
        () => {

          removeStudent(
            student.id
          );

        }
      );


      studentsList.appendChild(
        item
      );

    }
  );

}


/* =========================================================
   SETTINGS
   ========================================================= */

function setupSettingsControls() {

  if (settingsBtn) {

    settingsBtn.addEventListener(
      "click",
      openSettings
    );

  }


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

}


/* =========================================================
   OPEN SETTINGS
   ========================================================= */

function openSettings() {

  if (!settingsModal) {
    return;
  }


  if (brandNameInput) {

    brandNameInput.value =
      localStorage.getItem(
        "courseStudioBrandName"
      ) ||
      "Personal Course Studio";

  }


  settingsModal.style.display =
    "flex";

}


/* =========================================================
   CLOSE SETTINGS
   ========================================================= */

function closeSettings() {

  if (!settingsModal) {
    return;
  }


  settingsModal.style.display =
    "none";

}


/* =========================================================
   SAVE SETTINGS
   ========================================================= */

function saveSettings() {

  const brand =
    brandNameInput?.value.trim() ||
    "Personal Course Studio";


  localStorage.setItem(
    "courseStudioBrandName",
    brand
  );


  if (brandBadge) {

    brandBadge.textContent =
      brand;

  }


  closeSettings();


  showToast(
    "Settings saved."
  );

}


/* =========================================================
   RESTORE SETTINGS
   ========================================================= */

function restoreSettings() {

  const brand =
    localStorage.getItem(
      "courseStudioBrandName"
    ) ||
    "Personal Course Studio";


  if (brandBadge) {

    brandBadge.textContent =
      brand;

  }

}


/* =========================================================
   TELEPROMPTER
   ========================================================= */

function createTeleprompter() {

  if (
    CourseStudio.teleprompter
  ) {

    return CourseStudio.teleprompter;

  }


  const state = {

    panel: null,

    textarea: null,

    fileInput: null,

    playButton: null,

    resetButton: null,

    speedInput: null,

    fontInput: null,

    opacityInput: null,

    startRecordCheckbox: null,

    startVideoCheckbox: null,

    showWhileRecordingCheckbox: null,

    progress: null,

    speedValue: null,

    fontValue: null,

    opacityValue: null,

    isPlaying: false,

    scrollSpeed: 0.55,

    fontSize: 34,

    opacity: 0.88,

    startWithRecord: true,

    startWithVideo: false,

    showWhileRecording: true,

    autoResumeAfterRecordingPause: true

  };


  const panel =
    document.createElement(
      "div"
    );


  panel.id =
    "courseStudioTeleprompter";


  panel.innerHTML = `

    <div
      data-teleprompter-window
      style="
        position:fixed;
        top:80px;
        right:24px;
        width:min(520px,calc(100vw - 32px));
        height:min(680px,calc(100vh - 120px));
        z-index:99980;
        display:none;
        flex-direction:column;
        overflow:hidden;
        border:1px solid rgba(255,255,255,.12);
        border-radius:22px;
        background:rgba(9,12,18,.96);
        backdrop-filter:blur(20px);
        box-shadow:0 30px 100px rgba(0,0,0,.5);
        color:#fff;
        font-family:Arial,sans-serif;
      "
    >

      <div
        style="
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
          padding:14px 16px;
          border-bottom:1px solid rgba(255,255,255,.08);
        "
      >

        <div>

          <div
            style="
              font-size:15px;
              font-weight:800;
            "
          >
            Teleprompter
          </div>

          <div
            style="
              font-size:11px;
              color:rgba(255,255,255,.45);
              margin-top:3px;
            "
          >
            Script guide — not included in final video
          </div>

        </div>


        <div
          style="
            display:flex;
            gap:6px;
          "
        >

          <button
            type="button"
            data-tele-minimize
            style="
              width:34px;
              height:34px;
              border:0;
              border-radius:9px;
              background:rgba(255,255,255,.07);
              color:#fff;
              cursor:pointer;
            "
          >
            −
          </button>


          <button
            type="button"
            data-tele-close
            style="
              width:34px;
              height:34px;
              border:0;
              border-radius:9px;
              background:rgba(255,255,255,.07);
              color:#fff;
              cursor:pointer;
            "
          >
            ×
          </button>

        </div>

      </div>


      <div
        data-teleprompter-content
        style="
          position:relative;
          flex:1;
          min-height:0;
          overflow:hidden;
          background:
            radial-gradient(
              circle at 50% 20%,
              rgba(80,140,255,.08),
              transparent 55%
            );
        "
      >

        <div
          style="
            position:absolute;
            left:14px;
            right:14px;
            top:50%;
            height:1px;
            background:rgba(90,180,255,.35);
            pointer-events:none;
            z-index:4;
          "
        ></div>


        <div
          data-teleprompter-scroll
          style="
            position:absolute;
            inset:0;
            overflow-y:auto;
            padding:220px 32px 360px;
            scrollbar-width:thin;
          "
        >

          <div
            data-teleprompter-text
            style="
              white-space:pre-wrap;
              line-height:1.6;
              text-align:center;
              font-size:34px;
              font-weight:650;
              color:#fff;
              opacity:.88;
              word-break:break-word;
              text-shadow:0 2px 12px rgba(0,0,0,.45);
            "
          >
            Paste your class script here...
          </div>

        </div>


        <div
          style="
            position:absolute;
            left:0;
            right:0;
            bottom:0;
            height:90px;
            pointer-events:none;
            background:linear-gradient(
              to bottom,
              transparent,
              rgba(9,12,18,.96)
            );
            z-index:3;
          "
        ></div>

      </div>


      <div
        data-tele-settings
        style="
          border-top:1px solid rgba(255,255,255,.08);
          padding:12px;
          background:rgba(255,255,255,.025);
        "
      >

        <div
          style="
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:10px;
          "
        >

          <label
            style="
              font-size:11px;
              color:rgba(255,255,255,.6);
            "
          >
            Speed

            <input
              type="range"
              data-tele-speed
              min="0.05"
              max="3"
              step="0.05"
              value="0.55"
              style="width:100%;"
            />

            <span data-speed-value>
              0.55
            </span>
          </label>


          <label
            style="
              font-size:11px;
              color:rgba(255,255,255,.6);
            "
          >
            Font

            <input
              type="range"
              data-tele-font
              min="18"
              max="72"
              step="1"
              value="34"
              style="width:100%;"
            />

            <span data-font-value>
              34px
            </span>
          </label>


          <label
            style="
              font-size:11px;
              color:rgba(255,255,255,.6);
            "
          >
            Opacity

            <input
              type="range"
              data-tele-opacity
              min="0.25"
              max="1"
              step="0.01"
              value="0.88"
              style="width:100%;"
            />

            <span data-opacity-value>
              88%
            </span>
          </label>


          <label
            style="
              font-size:11px;
              color:rgba(255,255,255,.6);
            "
          >
            Script File

            <button
              type="button"
              data-tele-upload
              style="
                width:100%;
                margin-top:6px;
                padding:8px;
                border:1px solid rgba(255,255,255,.1);
                border-radius:9px;
                background:rgba(255,255,255,.06);
                color:#fff;
                cursor:pointer;
              "
            >
              Upload .txt
            </button>
          </label>

        </div>


        <div
          style="
            display:flex;
            flex-wrap:wrap;
            gap:8px;
            margin-top:10px;
          "
        >

          <button
            type="button"
            data-tele-play
            style="
              border:0;
              border-radius:10px;
              padding:9px 13px;
              cursor:pointer;
              background:#fff;
              color:#111;
              font-weight:800;
            "
          >
            Play
          </button>


          <button
            type="button"
            data-tele-reset
            style="
              border:1px solid rgba(255,255,255,.1);
              border-radius:10px;
              padding:9px 13px;
              cursor:pointer;
              background:rgba(255,255,255,.06);
              color:#fff;
              font-weight:700;
            "
          >
            Reset
          </button>

        </div>


        <div
          style="
            display:grid;
            gap:6px;
            margin-top:10px;
          "
        >

          <label
            style="
              display:flex;
              gap:8px;
              align-items:center;
              font-size:11px;
              color:rgba(255,255,255,.7);
            "
          >

            <input
              type="checkbox"
              data-tele-start-record
              checked
            />

            Start teleprompter with recording

          </label>


          <label
            style="
              display:flex;
              gap:8px;
              align-items:center;
              font-size:11px;
              color:rgba(255,255,255,.7);
            "
          >

            <input
              type="checkbox"
              data-tele-start-video
            />

            Start when main video plays

          </label>


          <label
            style="
              display:flex;
              gap:8px;
              align-items:center;
              font-size:11px;
              color:rgba(255,255,255,.7);
            "
          >

            <input
              type="checkbox"
              data-tele-show-recording
              checked
            />

            Keep visible while recording

          </label>

        </div>


        <div
          data-tele-progress
          style="
            margin-top:9px;
            font-size:10px;
            color:rgba(255,255,255,.38);
            text-align:right;
          "
        >
          0%
        </div>

      </div>


      <input
        type="file"
        data-tele-file
        accept=".txt,text/plain"
        hidden
      />

      <textarea
        data-tele-textarea
        hidden
      ></textarea>

    </div>

  `;


  document.body.appendChild(
    panel
  );


  state.panel =
    panel;


  state.textarea =
    panel.querySelector(
      "[data-tele-textarea]"
    );


  state.fileInput =
    panel.querySelector(
      "[data-tele-file]"
    );


  state.playButton =
    panel.querySelector(
      "[data-tele-play]"
    );


  state.resetButton =
    panel.querySelector(
      "[data-tele-reset]"
    );


  state.speedInput =
    panel.querySelector(
      "[data-tele-speed]"
    );


  state.fontInput =
    panel.querySelector(
      "[data-tele-font]"
    );


  state.opacityInput =
    panel.querySelector(
      "[data-tele-opacity]"
    );


  state.startRecordCheckbox =
    panel.querySelector(
      "[data-tele-start-record]"
    );


  state.startVideoCheckbox =
    panel.querySelector(
      "[data-tele-start-video]"
    );


  state.showWhileRecordingCheckbox =
    panel.querySelector(
      "[data-tele-show-recording]"
    );


  state.speedValue =
    panel.querySelector(
      "[data-speed-value]"
    );


  state.fontValue =
    panel.querySelector(
      "[data-font-value]"
    );


  state.opacityValue =
    panel.querySelector(
      "[data-opacity-value]"
    );


  state.progress =
    panel.querySelector(
      "[data-tele-progress]"
    );


  state.scrollContainer =
    panel.querySelector(
      "[data-teleprompter-scroll]"
    );


  state.textElement =
    panel.querySelector(
      "[data-teleprompter-text]"
    );


  /* -----------------------------------------
     Load saved script
     ----------------------------------------- */

  const savedScript =
    localStorage.getItem(
      "courseStudioTeleprompterScript"
    );


  if (
    savedScript &&
    state.textElement
  ) {

    state.textElement.textContent =
      savedScript;

  }


  /* -----------------------------------------
     Speed
     ----------------------------------------- */

  state.speedInput?.addEventListener(
    "input",
    () => {

      state.scrollSpeed =
        Number(
          state.speedInput.value
        );


      if (state.speedValue) {

        state.speedValue.textContent =
          state.scrollSpeed.toFixed(
            2
          );

      }

    }
  );


  /* -----------------------------------------
     Font
     ----------------------------------------- */

  state.fontInput?.addEventListener(
    "input",
    () => {

      state.fontSize =
        Number(
          state.fontInput.value
        );


      if (state.textElement) {

        state.textElement.style.fontSize =
          `${state.fontSize}px`;

      }


      if (state.fontValue) {

        state.fontValue.textContent =
          `${state.fontSize}px`;

      }

    }
  );


  /* -----------------------------------------
     Opacity
     ----------------------------------------- */

  state.opacityInput?.addEventListener(
    "input",
    () => {

      state.opacity =
        Number(
          state.opacityInput.value
        );


      if (state.textElement) {

        state.textElement.style.opacity =
          state.opacity;

      }


      if (state.opacityValue) {

        state.opacityValue.textContent =
          `${Math.round(
            state.opacity * 100
          )}%`;

      }

    }
  );


  /* -----------------------------------------
     Play
     ----------------------------------------- */

  state.playButton?.addEventListener(
    "click",
    () => {

      if (
        state.isPlaying
      ) {

        pauseTeleprompter();

      } else {

        startTeleprompter();

      }

    }
  );


  /* -----------------------------------------
     Reset
     ----------------------------------------- */

  state.resetButton?.addEventListener(
    "click",
    resetTeleprompter
  );


  /* -----------------------------------------
     Upload
     ----------------------------------------- */

  panel.querySelector(
    "[data-tele-upload]"
  )?.addEventListener(
    "click",
    () => {

      state.fileInput?.click();

    }
  );


  state.fileInput?.addEventListener(
    "change",
    handleTeleprompterFile
  );


  /* -----------------------------------------
     Checkboxes
     ----------------------------------------- */

  state.startRecordCheckbox?.addEventListener(
    "change",
    () => {

      state.startWithRecord =
        state.startRecordCheckbox.checked;

    }
  );


  state.startVideoCheckbox?.addEventListener(
    "change",
    () => {

      state.startWithVideo =
        state.startVideoCheckbox.checked;

    }
  );


  state.showWhileRecordingCheckbox?.addEventListener(
    "change",
    () => {

      state.showWhileRecording =
        state.showWhileRecordingCheckbox.checked;

    }
  );


  /* -----------------------------------------
     Close
     ----------------------------------------- */

  panel.querySelector(
    "[data-tele-close]"
  )?.addEventListener(
    "click",
    closeTeleprompter
  );


  /* -----------------------------------------
     Minimize
     ----------------------------------------- */

  panel.querySelector(
    "[data-tele-minimize]"
  )?.addEventListener(
    "click",
    () => {

      const settings =
        panel.querySelector(
          "[data-tele-settings]"
        );


      if (!settings) {
        return;
      }


      if (
        settings.style.display ===
        "none"
      ) {

        settings.style.display =
          "block";

      } else {

        settings.style.display =
          "none";

      }

    }
  );


  /* -----------------------------------------
     Initial UI
     ----------------------------------------- */

  state.textElement.style.fontSize =
    `${state.fontSize}px`;


  state.textElement.style.opacity =
    state.opacity;


  state.speedValue.textContent =
    state.scrollSpeed.toFixed(
      2
    );


  state.fontValue.textContent =
    `${state.fontSize}px`;


  state.opacityValue.textContent =
    `${Math.round(
      state.opacity * 100
    )}%`;


  updateTeleprompterProgress();


  CourseStudio.teleprompter =
    state;


  return state;

}


/* =========================================================
   TELEPROMPTER BUTTONS
   ========================================================= */

function setupTeleprompterButtons() {

  const buttons = [
    openTeleprompterTopBtn,
    openTeleprompterBtn
  ].filter(Boolean);


  buttons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        openTeleprompter
      );

    }
  );

}


/* =========================================================
   OPEN TELEPROMPTER
   ========================================================= */

function openTeleprompter() {

  const tele =
    CourseStudio.teleprompter ||
    createTeleprompter();


  if (!tele?.panel) {
    return;
  }


  const windowElement =
    tele.panel.querySelector(
      "[data-teleprompter-window]"
    );


  if (!windowElement) {
    return;
  }


  windowElement.style.display =
    "flex";


  updateTeleprompterProgress();

}


/* =========================================================
   CLOSE TELEPROMPTER
   ========================================================= */

function closeTeleprompter() {

  const tele =
    CourseStudio.teleprompter;


  if (!tele?.panel) {
    return;
  }


  const windowElement =
    tele.panel.querySelector(
      "[data-teleprompter-window]"
    );


  if (windowElement) {

    windowElement.style.display =
      "none";

  }


  pauseTeleprompter();

}


/* =========================================================
   START TELEPROMPTER
   ========================================================= */

function startTeleprompter() {

  const tele =
    CourseStudio.teleprompter;


  if (!tele) {
    return;
  }


  openTeleprompter();


  tele.isPlaying =
    true;


  if (tele.playButton) {

    tele.playButton.textContent =
      "Pause";

  }


  cancelAnimationFrame(
    CourseStudio.teleprompterAnimation
  );


  const step =
    () => {

      if (
        !tele.isPlaying
      ) {

        return;

      }


      if (
        tele.scrollContainer
      ) {

        tele.scrollContainer.scrollTop +=
          tele.scrollSpeed;

      }


      updateTeleprompterProgress();


      CourseStudio.teleprompterAnimation =
        requestAnimationFrame(
          step
        );

    };


  CourseStudio.teleprompterAnimation =
    requestAnimationFrame(
      step
    );

}


/* =========================================================
   PAUSE TELEPROMPTER
   ========================================================= */

function pauseTeleprompter() {

  const tele =
    CourseStudio.teleprompter;


  if (!tele) {
    return;
  }


  tele.isPlaying =
    false;


  cancelAnimationFrame(
    CourseStudio.teleprompterAnimation
  );


  CourseStudio.teleprompterAnimation =
    null;


  if (tele.playButton) {

    tele.playButton.textContent =
      "Play";

  }

}


/* =========================================================
   STOP TELEPROMPTER
   ========================================================= */

function stopTeleprompter() {

  pauseTeleprompter();

}


/* =========================================================
   RESET TELEPROMPTER
   ========================================================= */

function resetTeleprompter() {

  const tele =
    CourseStudio.teleprompter;


  if (!tele) {
    return;
  }


  pauseTeleprompter();


  if (
    tele.scrollContainer
  ) {

    tele.scrollContainer.scrollTop =
      0;

  }


  updateTeleprompterProgress();


  showToast(
    "Teleprompter reset."
  );

}


/* =========================================================
   TELEPROMPTER TXT FILE
   ========================================================= */

async function handleTeleprompterFile(
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


    setTeleprompterText(
      text
    );


    showToast(
      "Script loaded."
    );

  } catch (error) {

    console.error(
      "Script file error:",
      error
    );


    showToast(
      "Could not read script file."
    );

  }


  event.target.value =
    "";

}


/* =========================================================
   SET TELEPROMPTER TEXT
   ========================================================= */

function setTeleprompterText(
  text
) {

  const tele =
    CourseStudio.teleprompter;


  if (!tele) {
    return;
  }


  const clean =
    String(
      text || ""
    ).trim();


  if (tele.textElement) {

    tele.textElement.textContent =
      clean ||
      "Paste your class script here...";

  }


  localStorage.setItem(
    "courseStudioTeleprompterScript",
    clean
  );


  resetTeleprompter();

}


/* =========================================================
   TELEPROMPTER PROGRESS
   ========================================================= */

function updateTeleprompterProgress() {

  const tele =
    CourseStudio.teleprompter;


  if (
    !tele ||
    !tele.scrollContainer ||
    !tele.progress
  ) {

    return;

  }


  const container =
    tele.scrollContainer;


  const max =
    container.scrollHeight -
    container.clientHeight;


  let percent =
    0;


  if (max > 0) {

    percent =
      (
        container.scrollTop /
        max
      ) *
      100;

  }


  percent =
    Math.max(
      0,
      Math.min(
        100,
        percent
      )
    );


  tele.progress.textContent =
    `${Math.round(percent)}%`;

}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

function setupKeyboardShortcuts() {

  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.target.matches(
          "input,textarea,select"
        )
      ) {

        return;

      }


      /* R = recording */

      if (
        event.key.toLowerCase() ===
        "r"
      ) {

        event.preventDefault();


        if (
          CourseStudio.recording
        ) {

          stopRecording();

        } else {

          startRecording();

        }

      }


      /* T = teleprompter */

      if (
        event.key.toLowerCase() ===
        "t"
      ) {

        event.preventDefault();


        const tele =
          CourseStudio.teleprompter;


        if (!tele) {
          return;
        }


        const windowElement =
          tele.panel.querySelector(
            "[data-teleprompter-window]"
          );


        const visible =
          windowElement &&
          windowElement.style.display !==
            "none";


        if (visible) {

          closeTeleprompter();

        } else {

          openTeleprompter();

        }

      }


      /* Space = pause main video */

      if (
        event.code ===
        "Space"
      ) {

        if (
          mainVideo &&
          mainVideo.style.display !==
            "none"
        ) {

          event.preventDefault();


          if (
            mainVideo.paused
          ) {

            playMainVideo();

          } else {

            pauseMainVideo();

          }

        }

      }

    }
  );

}


/* =========================================================
   STAGE RESIZE
   ========================================================= */

function setupStageResize() {

  window.addEventListener(
    "resize",
    () => {

      saveMentorPosition();

      renderCompositionFrame();

    }
  );

}


/* =========================================================
   UI UPDATE
   ========================================================= */

function updateUI() {

  const cameraActive =
    Boolean(
      CourseStudio.cameraStream
    );


  if (stopCameraBtn) {

    stopCameraBtn.disabled =
      !cameraActive;

  }


  if (stopCameraSideBtn) {

    stopCameraSideBtn.disabled =
      !cameraActive;

  }


  if (switchCameraBtn) {

    switchCameraBtn.disabled =
      !cameraActive;

  }


  if (switchCameraSideBtn) {

    switchCameraSideBtn.disabled =
      !cameraActive;

  }


  updateRecordingButton();

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
  message
) {

  let toast =
    document.getElementById(
      "courseStudioToast"
    );


  if (!toast) {

    toast =
      document.createElement(
        "div"
      );


    toast.id =
      "courseStudioToast";


    toast.style.cssText = `

      position:fixed;
      left:50%;
      bottom:24px;
      transform:translateX(-50%) translateY(20px);
      z-index:1000000;
      padding:11px 15px;
      border-radius:12px;
      background:rgba(15,19,28,.95);
      border:1px solid rgba(255,255,255,.1);
      box-shadow:0 15px 50px rgba(0,0,0,.4);
      color:#fff;
      font-family:Arial,sans-serif;
      font-size:13px;
      opacity:0;
      pointer-events:none;
      transition:.25s ease;

    `;


    document.body.appendChild(
      toast
    );

  }


  toast.textContent =
    message;


  toast.style.opacity =
    "1";


  toast.style.transform =
    "translateX(-50%) translateY(0)";


  clearTimeout(
    toast._timer
  );


  toast._timer =
    setTimeout(
      () => {

        toast.style.opacity =
          "0";


        toast.style.transform =
          "translateX(-50%) translateY(20px)";

      },
      2500
    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
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


/* =========================================================
   GLOBAL API
   ========================================================= */

window.CourseStudio = {

  ...CourseStudio,

  createTeleprompter,

  openTeleprompter,

  closeTeleprompter,

  startTeleprompter,

  pauseTeleprompter,

  resetTeleprompter,

  setTeleprompterText,

  startCamera,

  stopCamera,

  switchCamera,

  startRecording,

  stopRecording,

  toggleRecordingPause,

  setBackgroundMode,

  addStudent,

  renderStudents,

  openSettings,

  closeSettings

};


/* =========================================================
   INITIAL FALLBACK
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {

  /*
    DOMContentLoaded will initialize.
  */

} else {

  initializeCourseStudio();

}


/* =========================================================
   END — STEP 3.6
   ========================================================= */
