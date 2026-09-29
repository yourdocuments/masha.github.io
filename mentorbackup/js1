/* =========================================================
   PERSONAL COURSE STUDIO
   STEP 3.6
   ---------------------------------------------------------
   Features:
   - Main image upload
   - Main video upload
   - Mentor video upload
   - Real webcam
   - Front / rear camera
   - AI person segmentation
   - Original background
   - Remove background
   - Blur background
   - Custom background image
   - Solid background color
   - Mentor drag
   - Mentor resize compatibility
   - Students management
   - Settings
   - Teleprompter
   - Script paste
   - TXT script upload
   - Auto scroll
   - Scroll speed
   - Font size
   - Opacity
   - Play / Pause / Reset
   - Microphone voice recording
   - Main video audio ON/OFF
   - Recording timer
   - Recording pause / resume
   - Recording preview
   - Download final video
   ========================================================= */

"use strict";

/* =========================================================
   DOM
   ========================================================= */

const $ = (id) => document.getElementById(id);

/* Main media */
const mainImage = $("mainImage");
const mainVideo = $("mainVideo");
const welcomeContent = $("welcomeContent");
const stage = $("stage");

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

/* Main controls */
const uploadMainBtn = $("uploadMainBtn");
const mainFileInput = $("mainFileInput");
const mainPlayBtn = $("mainPlayBtn");
const mainPauseBtn = $("mainPauseBtn");

/* Mentor controls */
const uploadMentorBtn = $("uploadMentorBtn");
const mentorFileInput = $("mentorFileInput");

/* Camera */
const startCameraBtn = $("startCameraBtn");
const stopCameraBtn = $("stopCameraBtn");
const switchCameraBtn = $("switchCameraBtn");
const cameraStatus = $("cameraStatus");

/* Background */
const bgOriginalBtn = $("bgOriginalBtn");
const bgRemoveBtn = $("bgRemoveBtn");
const bgBlurBtn = $("bgBlurBtn");
const bgImageBtn = $("bgImageBtn");
const bgColorBtn = $("bgColorBtn");

const backgroundColor = $("backgroundColor");
const backgroundImageUpload = $("backgroundImageUpload");

/* AI canvases */
const aiCanvas = $("aiCanvas");
const aiSourceCanvas = $("aiSourceCanvas");
const aiMaskCanvas = $("aiMaskCanvas");

/* Students */
const studentsList = $("studentsList");
const addStudentBtn = $("addStudentBtn");

/* Settings */
const settingsBtn = $("settingsBtn");
const settingsModal = $("settingsModal");
const closeSettingsBtn = $("closeSettingsBtn");
const saveSettingsBtn = $("saveSettingsBtn");

/* Toolbar */
const recordBtn = $("recordBtn");

/* =========================================================
   STATE
   ========================================================= */

let currentMainType = "none";
let currentMentorSource = "placeholder";

let currentCameraFacingMode = "user";
let cameraStream = null;

let segmentation = null;
let segmentationReady = false;
let segmentationBusy = false;

let backgroundMode = "original";
let customBackgroundImage = null;

let personCanvas = null;
let personCtx = null;

let mentorDrag = {
    active: false,
    startX: 0,
    startY: 0,
    originalLeft: 0,
    originalTop: 0
};

/* =========================================================
   TELEPROMPTER STATE
   ========================================================= */

let teleprompterPanel = null;
let teleprompterText = null;
let teleprompterEditor = null;

let teleprompterPlayBtn = null;
let teleprompterPauseBtn = null;
let teleprompterResetBtn = null;

let teleprompterSpeed = null;
let teleprompterFontSize = null;
let teleprompterOpacity = null;

let teleprompterSpeedValue = null;
let teleprompterFontValue = null;
let teleprompterOpacityValue = null;

let teleprompterAnimation = null;
let teleprompterPlaying = false;

let teleprompterSpeedValueNumber = 1.2;
let teleprompterFontSizeValue = 28;
let teleprompterOpacityValueNumber = 0.92;

/* =========================================================
   AUDIO / RECORDING
   ========================================================= */

let audioContext = null;
let recordingAudioDestination = null;

let mainVideoAudioSource = null;
let mentorVideoAudioSource = null;

let microphoneStream = null;
let microphoneSource = null;

let mediaRecorder = null;
let recordedChunks = [];

let recordingStream = null;

let isRecording = false;
let isRecordingPaused = false;

let recordingStartedAt = 0;
let recordingPausedAt = 0;
let totalPausedTime = 0;

let recordingTimerInterval = null;

let recordingControls = null;
let recordingTimerElement = null;
let recordingPauseButton = null;
let recordingStopButton = null;

let previewModal = null;
let previewVideo = null;
let downloadRecordingBtn = null;
let recordAgainBtn = null;
let deleteRecordingBtn = null;

let lastRecordingBlob = null;
let lastRecordingUrl = null;

let mainVideoAudioEnabled = true;

/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_KEYS = {
    students: "courseStudioStudents",
    brandName: "courseStudioBrandName",
    mentorWidth: "courseStudioMentorWidth",
    mentorHeight: "courseStudioMentorHeight",
    teleprompterSpeed: "courseStudioTeleprompterSpeed",
    teleprompterFontSize: "courseStudioTeleprompterFontSize",
    teleprompterOpacity: "courseStudioTeleprompterOpacity"
};

/* =========================================================
   UTILITY
   ========================================================= */

function showToast(message) {
    let toast = document.getElementById("courseStudioToast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "courseStudioToast";

        Object.assign(toast.style, {
            position: "fixed",
            left: "50%",
            bottom: "30px",
            transform: "translateX(-50%)",
            background: "rgba(20, 25, 35, 0.96)",
            color: "#fff",
            padding: "12px 18px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
            zIndex: "999999",
            boxShadow: "0 12px 35px rgba(0,0,0,.35)",
            pointerEvents: "none",
            opacity: "0",
            transition: "opacity .25s ease"
        });

        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = "1";

    clearTimeout(toast._timer);

    toast._timer = setTimeout(() => {
        toast.style.opacity = "0";
    }, 2200);
}

function formatTime(seconds) {
    seconds = Math.max(0, Math.floor(seconds));

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const h = String(hrs).padStart(2, "0");
    const m = String(mins).padStart(2, "0");
    const s = String(secs).padStart(2, "0");

    return `${h}:${m}:${s}`;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/* =========================================================
   MAIN IMAGE UPLOAD
   ========================================================= */

if (uploadMainBtn && mainFileInput) {
    uploadMainBtn.addEventListener("click", () => {
        mainFileInput.click();
    });
}

if (mainFileInput) {
    mainFileInput.addEventListener("change", (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showToast("Please select an image.");
            return;
        }

        const url = URL.createObjectURL(file);

        if (mainImage) {
            mainImage.src = url;
            mainImage.style.display = "block";
        }

        if (mainVideo) {
            mainVideo.pause();
            mainVideo.removeAttribute("src");
            mainVideo.load();
            mainVideo.style.display = "none";
        }

        if (welcomeContent) {
            welcomeContent.style.display = "none";
        }

        currentMainType = "image";

        showToast("Main image loaded.");
    });
}

/* =========================================================
   MAIN VIDEO UPLOAD
   ========================================================= */

const mainVideoInput =
    $("mainVideoInput") ||
    (() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "video/*";
        input.style.display = "none";
        input.id = "dynamicMainVideoInput";
        document.body.appendChild(input);
        return input;
    })();

if (mainVideoInput) {
    mainVideoInput.addEventListener("change", (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("video/")) {
            showToast("Please select a video.");
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

        currentMainType = "video";

        showToast("Main video loaded.");
    });
}

/* =========================================================
   MAIN VIDEO CONTROLS
   ========================================================= */

if (mainPlayBtn) {
    mainPlayBtn.addEventListener("click", async () => {
        if (!mainVideo || !mainVideo.src) {
            showToast("No main video loaded.");
            return;
        }

        try {
            await mainVideo.play();
        } catch (error) {
            console.warn(error);
        }
    });
}

if (mainPauseBtn) {
    mainPauseBtn.addEventListener("click", () => {
        if (mainVideo) {
            mainVideo.pause();
        }
    });
}

/* =========================================================
   DYNAMIC MAIN VIDEO BUTTON
   ========================================================= */

const dynamicMainUploadButton = $("uploadVideoBtn");

if (dynamicMainUploadButton) {
    dynamicMainUploadButton.addEventListener("click", () => {
        mainVideoInput.click();
    });
}

/* =========================================================
   MENTOR VIDEO UPLOAD
   ========================================================= */

if (uploadMentorBtn && mentorFileInput) {
    uploadMentorBtn.addEventListener("click", () => {
        mentorFileInput.click();
    });
}

if (mentorFileInput) {
    mentorFileInput.addEventListener("change", (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("video/")) {
            showToast("Please select a mentor video.");
            return;
        }

        stopCamera();

        const url = URL.createObjectURL(file);

        if (mentorVideo) {
            mentorVideo.src = url;
            mentorVideo.loop = true;
            mentorVideo.muted = false;
            mentorVideo.playsInline = true;
            mentorVideo.style.display = "block";
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

        currentMentorSource = "video";

        if (mentorSourceLabel) {
            mentorSourceLabel.textContent = "MENTOR VIDEO";
        }

        showToast("Mentor video loaded.");
    });
}

/* =========================================================
   CAMERA
   ========================================================= */

async function startCamera() {
    try {
        stopCamera();

        if (!navigator.mediaDevices?.getUserMedia) {
            showToast("Camera is not supported by this browser.");
            return;
        }

        if (cameraStatus) {
            cameraStatus.textContent = "Starting camera...";
        }

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: currentCameraFacingMode,
                width: {
                    ideal: 1280
                },
                height: {
                    ideal: 720
                }
            },
            audio: false
        });

        if (mentorCameraVideo) {
            mentorCameraVideo.srcObject = cameraStream;
            mentorCameraVideo.muted = true;
            mentorCameraVideo.playsInline = true;
            mentorCameraVideo.style.display = "block";

            await mentorCameraVideo.play().catch(() => {});
        }

        if (mentorVideo) {
            mentorVideo.pause();
            mentorVideo.style.display = "none";
        }

        if (mentorPlaceholder) {
            mentorPlaceholder.style.display = "none";
        }

        currentMentorSource = "camera";

        if (mentorSourceLabel) {
            mentorSourceLabel.textContent = "LIVE CAMERA";
        }

        if (cameraStatus) {
            cameraStatus.textContent = "Camera is live";
        }

        await initializeSegmentation();

        showToast("Camera started.");
    } catch (error) {
        console.error("Camera error:", error);

        if (cameraStatus) {
            cameraStatus.textContent = "Camera error";
        }

        showToast("Could not access camera.");
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach((track) => {
            try {
                track.stop();
            } catch (_) {}
        });

        cameraStream = null;
    }

    if (mentorCameraVideo) {
        try {
            mentorCameraVideo.pause();
        } catch (_) {}

        mentorCameraVideo.srcObject = null;
    }

    if (currentMentorSource === "camera") {
        currentMentorSource = "placeholder";

        if (mentorPlaceholder) {
            mentorPlaceholder.style.display = "flex";
        }

        if (mentorSourceLabel) {
            mentorSourceLabel.textContent = "MENTOR";
        }
    }

    if (cameraStatus) {
        cameraStatus.textContent = "Camera stopped";
    }

    segmentationBusy = false;
}

if (startCameraBtn) {
    startCameraBtn.addEventListener("click", startCamera);
}

if (stopCameraBtn) {
    stopCameraBtn.addEventListener("click", stopCamera);
}

if (switchCameraBtn) {
    switchCameraBtn.addEventListener("click", async () => {
        currentCameraFacingMode =
            currentCameraFacingMode === "user"
                ? "environment"
                : "user";

        if (cameraStream) {
            await startCamera();
        } else {
            showToast(
                currentCameraFacingMode === "user"
                    ? "Front camera selected."
                    : "Rear camera selected."
            );
        }
    });
}

/* =========================================================
   MEDIAPIPE SEGMENTATION
   ========================================================= */

async function initializeSegmentation() {
    if (segmentationReady) return;

    if (typeof SelfieSegmentation === "undefined") {
        console.warn("MediaPipe SelfieSegmentation not loaded.");
        showToast("AI background library is not available.");
        return;
    }

    try {
        segmentation = new SelfieSegmentation({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
            }
        });

        segmentation.setOptions({
            modelSelection: 1
        });

        segmentation.onResults(handleSegmentationResults);

        segmentationReady = true;

        processCameraSegmentation();

        showToast("AI background ready.");
    } catch (error) {
        console.error("Segmentation initialization error:", error);
    }
}

async function processCameraSegmentation() {
    if (!segmentation || !mentorCameraVideo) {
        requestAnimationFrame(processCameraSegmentation);
        return;
    }

    if (
        currentMentorSource === "camera" &&
        mentorCameraVideo.readyState >= 2 &&
        !segmentationBusy
    ) {
        segmentationBusy = true;

        try {
            await segmentation.send({
                image: mentorCameraVideo
            });
        } catch (error) {
            console.warn("Segmentation frame error:", error);
        }

        segmentationBusy = false;
    }

    requestAnimationFrame(processCameraSegmentation);
}

/* =========================================================
   SEGMENTATION SETTINGS
   ========================================================= */

const MASK_EDGE_START = 0.10;
const MASK_EDGE_END = 0.62;
const MASK_EDGE_POWER = 1.15;
const MIN_VISIBLE_ALPHA = 0.015;

function smoothStep(edge0, edge1, value) {
    const t = clamp(
        (value - edge0) / (edge1 - edge0),
        0,
        1
    );

    return t * t * (3 - 2 * t);
}

/* =========================================================
   CANVAS PREPARATION
   ========================================================= */

function ensureAICanvases(width, height) {
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

    if (!personCanvas) {
        personCanvas = document.createElement("canvas");
        personCtx = personCanvas.getContext("2d", {
            willReadFrequently: true
        });
    }

    if (
        personCanvas.width !== width ||
        personCanvas.height !== height
    ) {
        personCanvas.width = width;
        personCanvas.height = height;
    }
}

/* =========================================================
   SEGMENTATION RESULTS
   ========================================================= */

function handleSegmentationResults(results) {
    if (
        !results ||
        !results.image ||
        currentMentorSource !== "camera"
    ) {
        return;
    }

    const source = results.image;

    const width = source.videoWidth || source.width;
    const height = source.videoHeight || source.height;

    if (!width || !height) return;

    ensureAICanvases(width, height);

    const sourceCtx = aiSourceCanvas.getContext("2d", {
        willReadFrequently: true
    });

    const maskCtx = aiMaskCanvas.getContext("2d", {
        willReadFrequently: true
    });

    const outputCtx = aiCanvas.getContext("2d");

    sourceCtx.clearRect(
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

    /* Original */
    if (backgroundMode === "original") {
        outputCtx.clearRect(
            0,
            0,
            width,
            height
        );

        outputCtx.drawImage(
            source,
            0,
            0,
            width,
            height
        );

        showAICanvas();

        return;
    }

    /* Mask */
    maskCtx.clearRect(
        0,
        0,
        width,
        height
    );

    if (results.segmentationMask) {
        maskCtx.drawImage(
            results.segmentationMask,
            0,
            0,
            width,
            height
        );
    }

    const sourceData = sourceCtx.getImageData(
        0,
        0,
        width,
        height
    );

    const maskData = maskCtx.getImageData(
        0,
        0,
        width,
        height
    );

    if (
        personCanvas.width !== width ||
        personCanvas.height !== height
    ) {
        personCanvas.width = width;
        personCanvas.height = height;
    }

    const personImageData = personCtx.createImageData(
        width,
        height
    );

    const sourcePixels = sourceData.data;
    const maskPixels = maskData.data;
    const personPixels = personImageData.data;

    for (
        let i = 0;
        i < sourcePixels.length;
        i += 4
    ) {
        const confidence = maskPixels[i] / 255;

        let alpha = smoothStep(
            MASK_EDGE_START,
            MASK_EDGE_END,
            confidence
        );

        alpha = Math.pow(
            alpha,
            MASK_EDGE_POWER
        );

        if (alpha < MIN_VISIBLE_ALPHA) {
            alpha = 0;
        }

        personPixels[i] = sourcePixels[i];
        personPixels[i + 1] = sourcePixels[i + 1];
        personPixels[i + 2] = sourcePixels[i + 2];
        personPixels[i + 3] = Math.round(
            alpha * 255
        );
    }

    personCtx.putImageData(
        personImageData,
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
    if (backgroundMode === "remove") {
        outputCtx.clearRect(
            0,
            0,
            width,
            height
        );
    }

    else if (backgroundMode === "blur") {
        outputCtx.save();

        outputCtx.filter = "blur(18px)";

        outputCtx.drawImage(
            source,
            -20,
            -20,
            width + 40,
            height + 40
        );

        outputCtx.restore();
    }

    else if (
        backgroundMode === "image" &&
        customBackgroundImage
    ) {
        drawImageCover(
            outputCtx,
            customBackgroundImage,
            0,
            0,
            width,
            height
        );
    }

    else if (backgroundMode === "color") {
        outputCtx.fillStyle =
            backgroundColor?.value || "#162033";

        outputCtx.fillRect(
            0,
            0,
            width,
            height
        );
    }

    else {
        outputCtx.drawImage(
            source,
            0,
            0,
            width,
            height
        );
    }

    /* Person on top */
    outputCtx.drawImage(
        personCanvas,
        0,
        0,
        width,
        height
    );

    showAICanvas();
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
    const iw = image.naturalWidth || image.width;
    const ih = image.naturalHeight || image.height;

    if (!iw || !ih) return;

    const imageRatio = iw / ih;
    const targetRatio = width / height;

    let drawWidth;
    let drawHeight;
    let drawX;
    let drawY;

    if (imageRatio > targetRatio) {
        drawHeight = height;
        drawWidth = height * imageRatio;

        drawX = x + (width - drawWidth) / 2;
        drawY = y;
    } else {
        drawWidth = width;
        drawHeight = width / imageRatio;

        drawX = x;
        drawY = y + (height - drawHeight) / 2;
    }

    ctx.drawImage(
        image,
        drawX,
        drawY,
        drawWidth,
        drawHeight
    );
}

/* =========================================================
   SHOW AI CANVAS
   ========================================================= */

function showAICanvas() {
    if (!mentorAICanvas || !aiCanvas) return;

    mentorAICanvas.width = aiCanvas.width;
    mentorAICanvas.height = aiCanvas.height;

    const ctx = mentorAICanvas.getContext("2d");

    ctx.clearRect(
        0,
        0,
        mentorAICanvas.width,
        mentorAICanvas.height
    );

    ctx.drawImage(
        aiCanvas,
        0,
        0,
        mentorAICanvas.width,
        mentorAICanvas.height
    );

    mentorAICanvas.style.display = "block";

    if (mentorCameraVideo) {
        mentorCameraVideo.style.display = "none";
    }
}

/* =========================================================
   BACKGROUND BUTTONS
   ========================================================= */

function setBackgroundMode(mode) {
    backgroundMode = mode;

    const buttons = [
        bgOriginalBtn,
        bgRemoveBtn,
        bgBlurBtn,
        bgImageBtn,
        bgColorBtn
    ];

    buttons.forEach((button) => {
        if (!button) return;

        button.classList.remove("active");
        button.setAttribute(
            "aria-pressed",
            "false"
        );
    });

    const buttonMap = {
        original: bgOriginalBtn,
        remove: bgRemoveBtn,
        blur: bgBlurBtn,
        image: bgImageBtn,
        color: bgColorBtn
    };

    const activeButton = buttonMap[mode];

    if (activeButton) {
        activeButton.classList.add("active");
        activeButton.setAttribute(
            "aria-pressed",
            "true"
        );
    }

    if (mode === "image") {
        if (backgroundImageUpload) {
            backgroundImageUpload.click();
        }
    }

    showToast(
        `Background: ${mode}`
    );
}

if (bgOriginalBtn) {
    bgOriginalBtn.addEventListener(
        "click",
        () => setBackgroundMode("original")
    );
}

if (bgRemoveBtn) {
    bgRemoveBtn.addEventListener(
        "click",
        () => setBackgroundMode("remove")
    );
}

if (bgBlurBtn) {
    bgBlurBtn.addEventListener(
        "click",
        () => setBackgroundMode("blur")
    );
}

if (bgImageBtn) {
    bgImageBtn.addEventListener(
        "click",
        () => setBackgroundMode("image")
    );
}

if (bgColorBtn) {
    bgColorBtn.addEventListener(
        "click",
        () => setBackgroundMode("color")
    );
}

if (backgroundColor) {
    backgroundColor.addEventListener(
        "input",
        () => {
            if (backgroundMode !== "color") {
                setBackgroundMode("color");
            }
        }
    );
}

if (backgroundImageUpload) {
    backgroundImageUpload.addEventListener(
        "change",
        (event) => {
            const file = event.target.files?.[0];

            if (!file) return;

            if (!file.type.startsWith("image/")) {
                showToast("Please select an image.");
                return;
            }

            const image = new Image();

            image.onload = () => {
                customBackgroundImage = image;
                backgroundMode = "image";

                showToast(
                    "Custom background loaded."
                );
            };

            image.src = URL.createObjectURL(file);
        }
    );
}

/* =========================================================
   MENTOR DRAG
   ========================================================= */

function startMentorDrag(event) {
    if (!mentorCard) return;

    if (
        event.target === mentorResize ||
        event.target.closest?.("#mentorResize")
    ) {
        return;
    }

    if (
        event.target.tagName === "BUTTON" ||
        event.target.tagName === "INPUT" ||
        event.target.tagName === "VIDEO"
    ) {
        return;
    }

    event.preventDefault();

    mentorDrag.active = true;

    const point =
        event.touches?.[0] || event;

    mentorDrag.startX = point.clientX;
    mentorDrag.startY = point.clientY;

    mentorDrag.originalLeft =
        mentorCard.offsetLeft;

    mentorDrag.originalTop =
        mentorCard.offsetTop;

    document.body.style.userSelect = "none";
}

function moveMentorDrag(event) {
    if (!mentorDrag.active || !mentorCard) {
        return;
    }

    const point =
        event.touches?.[0] || event;

    const dx =
        point.clientX -
        mentorDrag.startX;

    const dy =
        point.clientY -
        mentorDrag.startY;

    let newLeft =
        mentorDrag.originalLeft + dx;

    let newTop =
        mentorDrag.originalTop + dy;

    const maxLeft =
        stage
            ? Math.max(
                0,
                stage.clientWidth -
                mentorCard.offsetWidth
            )
            : Infinity;

    const maxTop =
        stage
            ? Math.max(
                0,
                stage.clientHeight -
                mentorCard.offsetHeight
            )
            : Infinity;

    newLeft = clamp(
        newLeft,
        0,
        maxLeft
    );

    newTop = clamp(
        newTop,
        0,
        maxTop
    );

    mentorCard.style.left =
        `${newLeft}px`;

    mentorCard.style.top =
        `${newTop}px`;

    mentorCard.style.right = "auto";
    mentorCard.style.bottom = "auto";
}

function endMentorDrag() {
    if (!mentorDrag.active) return;

    mentorDrag.active = false;
    document.body.style.userSelect = "";
}

if (mentorCard) {
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
}

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
    endMentorDrag
);

document.addEventListener(
    "touchend",
    endMentorDrag
);

/* =========================================================
   STUDENTS
   ========================================================= */

function getStudents() {
    try {
        return JSON.parse(
            localStorage.getItem(
                STORAGE_KEYS.students
            )
        ) || [];
    } catch (_) {
        return [];
    }
}

function saveStudents(students) {
    localStorage.setItem(
        STORAGE_KEYS.students,
        JSON.stringify(students)
    );
}

function renderStudents() {
    if (!studentsList) return;

    const students = getStudents();

    studentsList.innerHTML = "";

    if (!students.length) {
        const empty = document.createElement("div");

        empty.textContent =
            "No students added.";

        empty.style.opacity = "0.55";
        empty.style.fontSize = "13px";
        empty.style.padding = "10px";

        studentsList.appendChild(empty);

        return;
    }

    students.forEach((student, index) => {
        const item =
            document.createElement("div");

        item.className =
            "student-item";

        item.style.display = "flex";
        item.style.alignItems = "center";
        item.style.justifyContent =
            "space-between";
        item.style.gap = "8px";
        item.style.padding = "8px 0";

        const left =
            document.createElement("div");

        left.style.display = "flex";
        left.style.alignItems = "center";
        left.style.gap = "8px";

        const dot =
            document.createElement("span");

        dot.style.width = "8px";
        dot.style.height = "8px";
        dot.style.borderRadius = "50%";
        dot.style.background = "#34d399";
        dot.style.display = "inline-block";

        const name =
            document.createElement("span");

        name.textContent =
            student.name || "Student";

        left.appendChild(dot);
        left.appendChild(name);

        const remove =
            document.createElement("button");

        remove.type = "button";
        remove.textContent = "×";

        remove.style.background =
            "transparent";
        remove.style.border = "0";
        remove.style.color =
            "rgba(255,255,255,.55)";
        remove.style.fontSize = "18px";
        remove.style.cursor = "pointer";

        remove.addEventListener(
            "click",
            () => {
                const current =
                    getStudents();

                current.splice(
                    index,
                    1
                );

                saveStudents(current);
                renderStudents();
            }
        );

        item.appendChild(left);
        item.appendChild(remove);

        studentsList.appendChild(item);
    });
}

function addStudent() {
    const name =
        prompt("Student name:");

    if (!name || !name.trim()) {
        return;
    }

    const students =
        getStudents();

    students.push({
        id: Date.now(),
        name: name.trim()
    });

    saveStudents(students);
    renderStudents();
}

if (addStudentBtn) {
    addStudentBtn.addEventListener(
        "click",
        addStudent
    );
}

/* =========================================================
   SETTINGS
   ========================================================= */

function getBrandName() {
    return (
        localStorage.getItem(
            STORAGE_KEYS.brandName
        ) || "Personal Course Studio"
    );
}

function applyBrandName() {
    if (!brandBadge) return;

    brandBadge.textContent =
        getBrandName();
}

if (settingsBtn) {
    settingsBtn.addEventListener(
        "click",
        () => {
            if (settingsModal) {
                settingsModal.classList.add(
                    "open"
                );

                settingsModal.style.display =
                    "flex";
            }
        }
    );
}

if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener(
        "click",
        () => {
            if (settingsModal) {
                settingsModal.classList.remove(
                    "open"
                );

                settingsModal.style.display =
                    "none";
            }
        }
    );
}

if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener(
        "click",
        () => {
            const brandInput =
                document.getElementById(
                    "brandNameInput"
                );

            if (brandInput) {
                localStorage.setItem(
                    STORAGE_KEYS.brandName,
                    brandInput.value.trim() ||
                    "Personal Course Studio"
                );
            }

            applyBrandName();

            if (settingsModal) {
                settingsModal.classList.remove(
                    "open"
                );

                settingsModal.style.display =
                    "none";
            }

            showToast(
                "Settings saved."
            );
        }
    );
}

/* =========================================================
   TELEPROMPTER UI
   ========================================================= */

function createTeleprompter() {
    if (teleprompterPanel) return;

    teleprompterPanel =
        document.createElement("section");

    teleprompterPanel.id =
        "courseStudioTeleprompter";

    Object.assign(
        teleprompterPanel.style,
        {
            position: "fixed",
            right: "24px",
            bottom: "24px",
            width: "min(420px, calc(100vw - 48px))",
            height: "520px",
            background: "rgba(8, 12, 20, .96)",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: "20px",
            boxShadow: "0 25px 70px rgba(0,0,0,.55)",
            zIndex: "9000",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            backdropFilter: "blur(18px)"
        }
    );

    teleprompterPanel.innerHTML = `
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
                        color:#fff;
                        font-size:15px;
                        font-weight:800;
                    "
                >
                    Teleprompter
                </div>

                <div
                    style="
                        color:rgba(255,255,255,.5);
                        font-size:11px;
                        margin-top:3px;
                    "
                >
                    Read your script while recording
                </div>
            </div>

            <button
                type="button"
                id="teleprompterClose"
                style="
                    width:32px;
                    height:32px;
                    border:0;
                    border-radius:10px;
                    background:rgba(255,255,255,.07);
                    color:#fff;
                    cursor:pointer;
                    font-size:18px;
                "
            >
                ×
            </button>
        </div>

        <div
            id="teleprompterViewport"
            style="
                position:relative;
                flex:1;
                min-height:0;
                overflow:auto;
                padding:28px 22px 60px;
                scroll-behavior:auto;
            "
        >
            <div
                id="teleprompterText"
                style="
                    color:#fff;
                    line-height:1.8;
                    white-space:pre-wrap;
                    word-break:break-word;
                    font-size:28px;
                    font-weight:600;
                    padding-bottom:360px;
                "
            >
                Paste your script here...
            </div>
        </div>

        <div
            style="
                border-top:1px solid rgba(255,255,255,.08);
                padding:12px;
                background:rgba(0,0,0,.18);
            "
        >
            <textarea
                id="teleprompterEditor"
                placeholder="Write or paste your script here..."
                style="
                    width:100%;
                    height:82px;
                    resize:none;
                    box-sizing:border-box;
                    border:1px solid rgba(255,255,255,.1);
                    border-radius:12px;
                    background:#0d1320;
                    color:#fff;
                    outline:none;
                    padding:10px 12px;
                    font-family:inherit;
                    font-size:13px;
                "
            ></textarea>

            <div
                style="
                    display:flex;
                    align-items:center;
                    gap:8px;
                    margin-top:9px;
                    flex-wrap:wrap;
                "
            >
                <button
                    type="button"
                    id="teleprompterPlay"
                    style="
                        border:0;
                        border-radius:10px;
                        padding:9px 13px;
                        background:#2563eb;
                        color:#fff;
                        font-weight:700;
                        cursor:pointer;
                    "
                >
                    ▶ Play
                </button>

                <button
                    type="button"
                    id="teleprompterPause"
                    style="
                        border:0;
                        border-radius:10px;
                        padding:9px 13px;
                        background:rgba(255,255,255,.08);
                        color:#fff;
                        font-weight:700;
                        cursor:pointer;
                    "
                >
                    ❚❚ Pause
                </button>

                <button
                    type="button"
                    id="teleprompterReset"
                    style="
                        border:0;
                        border-radius:10px;
                        padding:9px 13px;
                        background:rgba(255,255,255,.08);
                        color:#fff;
                        font-weight:700;
                        cursor:pointer;
                    "
                >
                    ↺ Reset
                </button>

                <label
                    style="
                        display:flex;
                        align-items:center;
                        gap:5px;
                        color:rgba(255,255,255,.65);
                        font-size:11px;
                        margin-left:auto;
                    "
                >
                    <input
                        type="file"
                        id="teleprompterFile"
                        accept=".txt,text/plain"
                        style="display:none;"
                    >

                    <button
                        type="button"
                        id="teleprompterUploadBtn"
                        style="
                            border:0;
                            border-radius:10px;
                            padding:9px 11px;
                            background:rgba(255,255,255,.08);
                            color:#fff;
                            cursor:pointer;
                        "
                    >
                        Upload TXT
                    </button>
                </label>
            </div>

            <div
                style="
                    display:grid;
                    grid-template-columns:1fr;
                    gap:8px;
                    margin-top:10px;
                "
            >
                <label
                    style="
                        color:rgba(255,255,255,.65);
                        font-size:11px;
                    "
                >
                    Speed:
                    <span id="teleprompterSpeedValue">
                        1.2
                    </span>

                    <input
                        id="teleprompterSpeed"
                        type="range"
                        min="0.2"
                        max="5"
                        step="0.1"
                        value="1.2"
                        style="width:100%;"
                    >
                </label>

                <label
                    style="
                        color:rgba(255,255,255,.65);
                        font-size:11px;
                    "
                >
                    Font:
                    <span id="teleprompterFontValue">
                        28px
                    </span>

                    <input
                        id="teleprompterFontSize"
                        type="range"
                        min="16"
                        max="60"
                        step="1"
                        value="28"
                        style="width:100%;"
                    >
                </label>

                <label
                    style="
                        color:rgba(255,255,255,.65);
                        font-size:11px;
                    "
                >
                    Opacity:
                    <span id="teleprompterOpacityValue">
                        92%
                    </span>

                    <input
                        id="teleprompterOpacity"
                        type="range"
                        min="0.25"
                        max="1"
                        step="0.01"
                        value="0.92"
                        style="width:100%;"
                    >
                </label>
            </div>
        </div>
    `;

    document.body.appendChild(
        teleprompterPanel
    );

    teleprompterText =
        $("teleprompterText");

    teleprompterEditor =
        $("teleprompterEditor");

    teleprompterPlayBtn =
        $("teleprompterPlay");

    teleprompterPauseBtn =
        $("teleprompterPause");

    teleprompterResetBtn =
        $("teleprompterReset");

    teleprompterSpeed =
        $("teleprompterSpeed");

    teleprompterFontSize =
        $("teleprompterFontSize");

    teleprompterOpacity =
        $("teleprompterOpacity");

    teleprompterSpeedValue =
        $("teleprompterSpeedValue");

    teleprompterFontValue =
        $("teleprompterFontValue");

    teleprompterOpacityValue =
        $("teleprompterOpacityValue");

    /* Close */
    const close =
        $("teleprompterClose");

    if (close) {
        close.addEventListener(
            "click",
            () => {
                teleprompterPanel.style.display =
                    "none";

                stopTeleprompter();
            }
        );
    }

    /* Editor */
    teleprompterEditor.addEventListener(
        "input",
        updateTeleprompterText
    );

    /* Play */
    teleprompterPlayBtn.addEventListener(
        "click",
        startTeleprompter
    );

    /* Pause */
    teleprompterPauseBtn.addEventListener(
        "click",
        stopTeleprompter
    );

    /* Reset */
    teleprompterResetBtn.addEventListener(
        "click",
        resetTeleprompter
    );

    /* Speed */
    teleprompterSpeed.addEventListener(
        "input",
        () => {
            teleprompterSpeedValueNumber =
                parseFloat(
                    teleprompterSpeed.value
                ) || 1.2;

            teleprompterSpeedValue.textContent =
                teleprompterSpeedValueNumber.toFixed(
                    1
                );

            localStorage.setItem(
                STORAGE_KEYS.teleprompterSpeed,
                String(
                    teleprompterSpeedValueNumber
                )
            );
        }
    );

    /* Font */
    teleprompterFontSize.addEventListener(
        "input",
        () => {
            teleprompterFontSizeValue =
                parseInt(
                    teleprompterFontSize.value,
                    10
                ) || 28;

            teleprompterFontValue.textContent =
                `${teleprompterFontSizeValue}px`;

            teleprompterText.style.fontSize =
                `${teleprompterFontSizeValue}px`;

            localStorage.setItem(
                STORAGE_KEYS.teleprompterFontSize,
                String(
                    teleprompterFontSizeValue
                )
            );
        }
    );

    /* Opacity */
    teleprompterOpacity.addEventListener(
        "input",
        () => {
            teleprompterOpacityValueNumber =
                parseFloat(
                    teleprompterOpacity.value
                ) || 0.92;

            teleprompterOpacityValue.textContent =
                `${Math.round(
                    teleprompterOpacityValueNumber *
                    100
                )}%`;

            teleprompterPanel.style.opacity =
                teleprompterOpacityValueNumber;

            localStorage.setItem(
                STORAGE_KEYS.teleprompterOpacity,
                String(
                    teleprompterOpacityValueNumber
                )
            );
        }
    );

    /* TXT upload */
    const fileInput =
        $("teleprompterFile");

    const uploadButton =
        $("teleprompterUploadBtn");

    if (uploadButton && fileInput) {
        uploadButton.addEventListener(
            "click",
            () => fileInput.click()
        );

        fileInput.addEventListener(
            "change",
            async (event) => {
                const file =
                    event.target.files?.[0];

                if (!file) return;

                try {
                    const text =
                        await file.text();

                    teleprompterEditor.value =
                        text;

                    updateTeleprompterText();

                    showToast(
                        "Script loaded."
                    );
                } catch (error) {
                    console.error(error);

                    showToast(
                        "Could not read script."
                    );
                }
            }
        );
    }

    loadTeleprompterSettings();
    updateTeleprompterText();
}

/* =========================================================
   TELEPROMPTER TEXT
   ========================================================= */

function updateTeleprompterText() {
    if (
        !teleprompterEditor ||
        !teleprompterText
    ) {
        return;
    }

    const text =
        teleprompterEditor.value.trim();

    teleprompterText.textContent =
        text ||
        "Paste your script here...";

    teleprompterText.style.fontSize =
        `${teleprompterFontSizeValue}px`;
}

/* =========================================================
   TELEPROMPTER START
   ========================================================= */

function startTeleprompter() {
    if (!teleprompterPanel) {
        createTeleprompter();
    }

    teleprompterPanel.style.display =
        "flex";

    if (teleprompterPlaying) {
        return;
    }

    teleprompterPlaying = true;

    const viewport =
        document.getElementById(
            "teleprompterViewport"
        );

    if (!viewport) return;

    let lastTime = performance.now();

    function animate(now) {
        if (!teleprompterPlaying) {
            return;
        }

        const delta =
            now - lastTime;

        lastTime = now;

        const pixelsPerSecond =
            10 *
            teleprompterSpeedValueNumber;

        viewport.scrollTop +=
            pixelsPerSecond *
            (delta / 1000);

        if (
            viewport.scrollTop +
            viewport.clientHeight >=
            viewport.scrollHeight - 2
        ) {
            teleprompterPlaying = false;

            if (teleprompterPlayBtn) {
                teleprompterPlayBtn.textContent =
                    "▶ Play";
            }

            return;
        }

        teleprompterAnimation =
            requestAnimationFrame(
                animate
            );
    }

    if (teleprompterPlayBtn) {
        teleprompterPlayBtn.textContent =
            "▶ Playing";
    }

    teleprompterAnimation =
        requestAnimationFrame(
            animate
        );
}

function stopTeleprompter() {
    teleprompterPlaying = false;

    if (teleprompterAnimation) {
        cancelAnimationFrame(
            teleprompterAnimation
        );

        teleprompterAnimation = null;
    }

    if (teleprompterPlayBtn) {
        teleprompterPlayBtn.textContent =
            "▶ Play";
    }
}

function resetTeleprompter() {
    stopTeleprompter();

    const viewport =
        document.getElementById(
            "teleprompterViewport"
        );

    if (viewport) {
        viewport.scrollTop = 0;
    }

    showToast(
        "Teleprompter reset."
    );
}

/* =========================================================
   LOAD TELEPROMPTER SETTINGS
   ========================================================= */

function loadTeleprompterSettings() {
    const savedSpeed =
        parseFloat(
            localStorage.getItem(
                STORAGE_KEYS.teleprompterSpeed
            )
        );

    const savedFont =
        parseInt(
            localStorage.getItem(
                STORAGE_KEYS.teleprompterFontSize
            ),
            10
        );

    const savedOpacity =
        parseFloat(
            localStorage.getItem(
                STORAGE_KEYS.teleprompterOpacity
            )
        );

    if (!Number.isNaN(savedSpeed)) {
        teleprompterSpeedValueNumber =
            clamp(
                savedSpeed,
                0.2,
                5
            );
    }

    if (!Number.isNaN(savedFont)) {
        teleprompterFontSizeValue =
            clamp(
                savedFont,
                16,
                60
            );
    }

    if (!Number.isNaN(savedOpacity)) {
        teleprompterOpacityValueNumber =
            clamp(
                savedOpacity,
                0.25,
                1
            );
    }

    if (teleprompterSpeed) {
        teleprompterSpeed.value =
            teleprompterSpeedValueNumber;
    }

    if (teleprompterFontSize) {
        teleprompterFontSize.value =
            teleprompterFontSizeValue;
    }

    if (teleprompterOpacity) {
        teleprompterOpacity.value =
            teleprompterOpacityValueNumber;
    }

    if (teleprompterSpeedValue) {
        teleprompterSpeedValue.textContent =
            teleprompterSpeedValueNumber.toFixed(
                1
            );
    }

    if (teleprompterFontValue) {
        teleprompterFontValue.textContent =
            `${teleprompterFontSizeValue}px`;
    }

    if (teleprompterOpacityValue) {
        teleprompterOpacityValue.textContent =
            `${Math.round(
                teleprompterOpacityValueNumber *
                100
            )}%`;
    }
}

/* =========================================================
   TELEPROMPTER OPEN BUTTON
   ========================================================= */

function createTeleprompterOpenButton() {
    if (
        document.getElementById(
            "openTeleprompterBtn"
        )
    ) {
        return;
    }

    const button =
        document.createElement("button");

    button.id =
        "openTeleprompterBtn";

    button.type = "button";

    button.textContent =
        "📜 Teleprompter";

    Object.assign(
        button.style,
        {
            position: "fixed",
            right: "24px",
            bottom: "24px",
            zIndex: "8999",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: "12px",
            background: "rgba(25,32,45,.95)",
            color: "#fff",
            padding: "11px 15px",
            cursor: "pointer",
            fontWeight: "700",
            boxShadow: "0 12px 35px rgba(0,0,0,.3)"
        }
    );

    button.addEventListener(
        "click",
        () => {
            createTeleprompter();

            teleprompterPanel.style.display =
                "flex";

            button.style.display =
                "none";
        }
    );

    document.body.appendChild(
        button
    );
}

/* =========================================================
   MAIN VIDEO AUDIO TOGGLE
   ========================================================= */

function createAudioToggle() {
    if (
        document.getElementById(
            "mainVideoAudioToggle"
        )
    ) {
        return;
    }

    const panel =
        document.createElement("div");

    panel.id =
        "mainVideoAudioToggle";

    Object.assign(
        panel.style,
        {
            position: "fixed",
            left: "24px",
            bottom: "24px",
            zIndex: "8998",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 13px",
            borderRadius: "12px",
            background: "rgba(20,26,37,.94)",
            border: "1px solid rgba(255,255,255,.1)",
            color: "#fff",
            fontSize: "12px",
            boxShadow: "0 12px 35px rgba(0,0,0,.28)"
        }
    );

    panel.innerHTML = `
        <input
            type="checkbox"
            id="mainVideoAudioCheckbox"
            checked
        >

        <label
            for="mainVideoAudioCheckbox"
            style="cursor:pointer;"
        >
            Main video audio
        </label>
    `;

    document.body.appendChild(
        panel
    );

    const checkbox =
        document.getElementById(
            "mainVideoAudioCheckbox"
        );

    checkbox.addEventListener(
        "change",
        () => {
            mainVideoAudioEnabled =
                checkbox.checked;

            showToast(
                mainVideoAudioEnabled
                    ? "Main video audio ON"
                    : "Main video audio OFF"
            );
        }
    );
}

/* =========================================================
   AUDIO CONTEXT
   ========================================================= */

async function ensureAudioContext() {
    if (!audioContext) {
        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

        recordingAudioDestination =
            audioContext.createMediaStreamDestination();
    }

    if (
        audioContext.state === "suspended"
    ) {
        await audioContext.resume();
    }
}

/* =========================================================
   MEDIA ELEMENT AUDIO SOURCE
   ========================================================= */

function getMainVideoAudioSource() {
    if (!mainVideo) return null;

    if (mainVideoAudioSource) {
        return mainVideoAudioSource;
    }

    try {
        mainVideoAudioSource =
            audioContext.createMediaElementSource(
                mainVideo
            );

        return mainVideoAudioSource;
    } catch (error) {
        console.warn(
            "Main video audio source error:",
            error
        );

        return null;
    }
}

function getMentorVideoAudioSource() {
    if (!mentorVideo) return null;

    if (mentorVideoAudioSource) {
        return mentorVideoAudioSource;
    }

    try {
        mentorVideoAudioSource =
            audioContext.createMediaElementSource(
                mentorVideo
            );

        return mentorVideoAudioSource;
    } catch (error) {
        console.warn(
            "Mentor video audio source error:",
            error
        );

        return null;
    }
}

/* =========================================================
   AUDIO MIX
   ========================================================= */

async function prepareAudioMix() {
    await ensureAudioContext();

    const destination =
        recordingAudioDestination;

    /* Main video */
    if (mainVideo) {
        const source =
            getMainVideoAudioSource();

        if (source) {
            if (mainVideoAudioEnabled) {
                source.connect(
                    destination
                );
            }

            source.connect(
                audioContext.destination
            );
        }
    }

    /* Mentor uploaded video */
    if (
        mentorVideo &&
        currentMentorSource === "video"
    ) {
        const source =
            getMentorVideoAudioSource();

        if (source) {
            source.connect(
                destination
            );

            source.connect(
                audioContext.destination
            );
        }
    }

    /* Microphone */
    try {
        microphoneStream =
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

        microphoneSource =
            audioContext.createMediaStreamSource(
                microphoneStream
            );

        microphoneSource.connect(
            destination
        );
    } catch (error) {
        console.warn(
            "Microphone unavailable:",
            error
        );

        microphoneStream = null;
        microphoneSource = null;

        showToast(
            "Microphone not available. Recording will continue without mic."
        );
    }

    return destination;
}

/* =========================================================
   COMPOSITION CANVAS
   ========================================================= */

let compositionCanvas = null;
let compositionCtx = null;

function ensureCompositionCanvas() {
    if (!compositionCanvas) {
        compositionCanvas =
            document.createElement(
                "canvas"
            );

        compositionCanvas.width =
            1920;

        compositionCanvas.height =
            1080;

        compositionCtx =
            compositionCanvas.getContext(
                "2d"
            );
    }

    return compositionCanvas;
}

/* =========================================================
   DRAW MAIN STAGE
   ========================================================= */

function drawMainStage() {
    const canvas =
        ensureCompositionCanvas();

    const ctx =
        compositionCtx;

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

    /* Background */
    ctx.fillStyle =
        "#0a0f18";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );

    /* Main image */
    if (
        currentMainType === "image" &&
        mainImage &&
        mainImage.complete &&
        mainImage.naturalWidth
    ) {
        drawMediaCover(
            ctx,
            mainImage,
            0,
            0,
            width,
            height
        );
    }

    /* Main video */
    else if (
        currentMainType === "video" &&
        mainVideo &&
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
    }

    /* Welcome */
    else {
        ctx.fillStyle =
            "#0a0f18";

        ctx.fillRect(
            0,
            0,
            width,
            height
        );

        ctx.fillStyle =
            "rgba(255,255,255,.8)";

        ctx.font =
            "700 42px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "Personal Course Studio",
            width / 2,
            height / 2
        );

        ctx.font =
            "400 22px Arial";

        ctx.fillStyle =
            "rgba(255,255,255,.45)";

        ctx.fillText(
            "Upload your class content to begin",
            width / 2,
            height / 2 + 45
        );

        ctx.textAlign =
            "left";
    }
}

/* =========================================================
   DRAW MEDIA COVER
   ========================================================= */

function drawMediaCover(
    ctx,
    media,
    x,
    y,
    width,
    height
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

    const mediaRatio =
        mediaWidth /
        mediaHeight;

    const targetRatio =
        width /
        height;

    let drawWidth;
    let drawHeight;
    let drawX;
    let drawY;

    if (
        mediaRatio >
        targetRatio
    ) {
        drawHeight =
            height;

        drawWidth =
            height *
            mediaRatio;

        drawX =
            x +
            (width -
                drawWidth) /
            2;

        drawY =
            y;
    } else {
        drawWidth =
            width;

        drawHeight =
            width /
            mediaRatio;

        drawX =
            x;

        drawY =
            y +
            (height -
                drawHeight) /
            2;
    }

    ctx.drawImage(
        media,
        drawX,
        drawY,
        drawWidth,
        drawHeight
    );
}

/* =========================================================
   DRAW MENTOR
   ========================================================= */

function drawMentorOverlay() {
    if (!mentorCard) return;

    const canvas =
        compositionCanvas;

    const ctx =
        compositionCtx;

    const canvasWidth =
        canvas.width;

    const canvasHeight =
        canvas.height;

    const stageRect =
        stage?.getBoundingClientRect();

    const cardRect =
        mentorCard.getBoundingClientRect();

    if (
        !stageRect ||
        !cardRect ||
        stageRect.width <= 0 ||
        stageRect.height <= 0
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
        (cardRect.left -
            stageRect.left) *
        scaleX;

    const y =
        (cardRect.top -
            stageRect.top) *
        scaleY;

    const width =
        cardRect.width *
        scaleX;

    const height =
        cardRect.height *
        scaleY;

    /* Shadow */
    ctx.save();

    ctx.shadowColor =
        "rgba(0,0,0,.45)";

    ctx.shadowBlur =
        28;

    ctx.shadowOffsetY =
        12;

    ctx.fillStyle =
        "rgba(0,0,0,.01)";

    ctx.fillRect(
        x,
        y,
        width,
        height
    );

    ctx.restore();

    /* Mentor media */
    let mentorSource = null;

    if (
        currentMentorSource === "camera" &&
        mentorAICanvas &&
        mentorAICanvas.width
    ) {
        mentorSource =
            mentorAICanvas;
    }

    else if (
        currentMentorSource === "camera" &&
        mentorCameraVideo &&
        mentorCameraVideo.readyState >= 2
    ) {
        mentorSource =
            mentorCameraVideo;
    }

    else if (
        currentMentorSource === "video" &&
        mentorVideo &&
        mentorVideo.readyState >= 2
    ) {
        mentorSource =
            mentorVideo;
    }

    if (mentorSource) {
        ctx.save();

        /* Rounded rectangle clip */
        const radius =
            Math.min(
                30,
                width * 0.08
            );

        roundedRectPath(
            ctx,
            x,
            y,
            width,
            height,
            radius
        );

        ctx.clip();

        drawMediaCover(
            ctx,
            mentorSource,
            x,
            y,
            width,
            height
        );

        ctx.restore();
    }

    else {
        ctx.save();

        roundedRectPath(
            ctx,
            x,
            y,
            width,
            height,
            30
        );

        ctx.fillStyle =
            "#111827";

        ctx.fill();

        ctx.fillStyle =
            "rgba(255,255,255,.7)";

        ctx.font =
            "700 32px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "MENTOR",
            x + width / 2,
            y + height / 2
        );

        ctx.textAlign =
            "left";

        ctx.restore();
    }

    /* Label */
    ctx.save();

    ctx.fillStyle =
        "rgba(0,0,0,.58)";

    ctx.fillRect(
        x,
        y + height - 42,
        width,
        42
    );

    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "700 17px Arial";

    ctx.fillText(
        currentMentorSource === "camera"
            ? "LIVE MENTOR"
            : currentMentorSource === "video"
                ? "MENTOR VIDEO"
                : "MENTOR",
        x + 16,
        y + height - 15
    );

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
   DRAW BRAND
   ========================================================= */

function drawBrandBadge() {
    if (!brandBadge) return;

    const canvas =
        compositionCanvas;

    const ctx =
        compositionCtx;

    const text =
        brandBadge.textContent ||
        "Personal Course Studio";

    ctx.save();

    ctx.font =
        "700 22px Arial";

    const paddingX =
        18;

    const paddingY =
        11;

    const metrics =
        ctx.measureText(text);

    const width =
        metrics.width +
        paddingX * 2;

    const height =
        46;

    const x =
        30;

    const y =
        canvas.height -
        height -
        30;

    ctx.fillStyle =
        "rgba(0,0,0,.65)";

    roundedRectPath(
        ctx,
        x,
        y,
        width,
        height,
        13
    );

    ctx.fill();

    ctx.fillStyle =
        "#ffffff";

    ctx.fillText(
        text,
        x + paddingX,
        y + 30
    );

    ctx.restore();
}

/* =========================================================
   DRAW TELEPROMPTER INTO RECORDING
   ========================================================= */

function drawTeleprompterRecordingOverlay() {
    if (
        !teleprompterPanel ||
        teleprompterPanel.style.display ===
            "none"
    ) {
        return;
    }

    /* 
       Important:
       Teleprompter is intentionally NOT
       recorded into final video.

       It stays visible to the mentor only.
    */
}

/* =========================================================
   RENDER COMPOSITION FRAME
   ========================================================= */

function renderCompositionFrame() {
    drawMainStage();

    drawMentorOverlay();

    drawBrandBadge();

    drawTeleprompterRecordingOverlay();
}

/* =========================================================
   COMPOSITION LOOP
   ========================================================= */

let compositionAnimationFrame = null;

function startCompositionLoop() {
    if (compositionAnimationFrame) {
        return;
    }

    function loop() {
        renderCompositionFrame();

        compositionAnimationFrame =
            requestAnimationFrame(loop);
    }

    compositionAnimationFrame =
        requestAnimationFrame(loop);
}

/* =========================================================
   RECORDING UI
   ========================================================= */

function createRecordingControls() {
    if (recordingControls) return;

    recordingControls =
        document.createElement("div");

    recordingControls.id =
        "courseStudioRecordingControls";

    Object.assign(
        recordingControls.style,
        {
            position: "fixed",
            top: "74px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: "10000",
            display: "none",
            alignItems: "center",
            gap: "9px",
            padding: "9px 12px",
            borderRadius: "14px",
            background: "rgba(10,14,22,.96)",
            border: "1px solid rgba(255,255,255,.1)",
            boxShadow: "0 18px 50px rgba(0,0,0,.45)",
            color: "#fff"
        }
    );

    recordingControls.innerHTML = `
        <span
            id="recordingLiveDot"
            style="
                width:9px;
                height:9px;
                border-radius:50%;
                background:#ef4444;
                display:inline-block;
                box-shadow:0 0 14px rgba(239,68,68,.7);
            "
        ></span>

        <strong
            id="recordingTimer"
            style="
                font-variant-numeric:tabular-nums;
                min-width:72px;
            "
        >
            00:00:00
        </strong>

        <button
            type="button"
            id="recordingPauseButton"
            style="
                border:0;
                border-radius:9px;
                padding:8px 11px;
                background:rgba(255,255,255,.08);
                color:#fff;
                cursor:pointer;
                font-weight:700;
            "
        >
            ❚❚ Pause
        </button>

        <button
            type="button"
            id="recordingStopButton"
            style="
                border:0;
                border-radius:9px;
                padding:8px 11px;
                background:#dc2626;
                color:#fff;
                cursor:pointer;
                font-weight:700;
            "
        >
            ■ Stop
        </button>
    `;

    document.body.appendChild(
        recordingControls
    );

    recordingTimerElement =
        $("recordingTimer");

    recordingPauseButton =
        $("recordingPauseButton");

    recordingStopButton =
        $("recordingStopButton");

    recordingPauseButton.addEventListener(
        "click",
        toggleRecordingPause
    );

    recordingStopButton.addEventListener(
        "click",
        stopRecording
    );
}

/* =========================================================
   UPDATE RECORDING TIMER
   ========================================================= */

function updateRecordingTimer() {
    if (!recordingTimerElement) {
        return;
    }

    let elapsed =
        Date.now() -
        recordingStartedAt -
        totalPausedTime;

    if (
        isRecordingPaused &&
        recordingPausedAt
    ) {
        elapsed =
            recordingPausedAt -
            recordingStartedAt -
            totalPausedTime;
    }

    recordingTimerElement.textContent =
        formatTime(
            elapsed / 1000
        );
}

/* =========================================================
   START TIMER
   ========================================================= */

function startRecordingTimer() {
    recordingStartedAt =
        Date.now();

    totalPausedTime = 0;
    recordingPausedAt = 0;

    clearInterval(
        recordingTimerInterval
    );

    recordingTimerInterval =
        setInterval(
            updateRecordingTimer,
            250
        );

    updateRecordingTimer();
}

/* =========================================================
   STOP TIMER
   ========================================================= */

function stopRecordingTimer() {
    clearInterval(
        recordingTimerInterval
    );

    recordingTimerInterval =
        null;
}

/* =========================================================
   PAUSE RECORDING
   ========================================================= */

function toggleRecordingPause() {
    if (
        !mediaRecorder ||
        !isRecording
    ) {
        return;
    }

    if (
        mediaRecorder.state ===
        "recording"
    ) {
        try {
            mediaRecorder.pause();

            isRecordingPaused =
                true;

            recordingPausedAt =
                Date.now();

            if (recordingPauseButton) {
                recordingPauseButton.textContent =
                    "▶ Resume";
            }

            stopTeleprompter();

            showToast(
                "Recording paused."
            );
        } catch (error) {
            console.error(error);
        }
    }

    else if (
        mediaRecorder.state ===
        "paused"
    ) {
        try {
            mediaRecorder.resume();

            if (recordingPausedAt) {
                totalPausedTime +=
                    Date.now() -
                    recordingPausedAt;
            }

            recordingPausedAt = 0;

            isRecordingPaused =
                false;

            if (recordingPauseButton) {
                recordingPauseButton.textContent =
                    "❚❚ Pause";
            }

            if (
                teleprompterPanel &&
                teleprompterPanel.style.display !==
                    "none"
            ) {
                startTeleprompter();
            }

            showToast(
                "Recording resumed."
            );
        } catch (error) {
            console.error(error);
        }
    }
}

/* =========================================================
   MIME TYPE
   ========================================================= */

function getSupportedMimeType() {
    const types = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm"
    ];

    for (const type of types) {
        if (
            window.MediaRecorder &&
            MediaRecorder.isTypeSupported(type)
        ) {
            return type;
        }
    }

    return "";
}

/* =========================================================
   START RECORDING
   ========================================================= */

async function startRecording() {
    if (isRecording) {
        showToast(
            "Recording is already running."
        );

        return;
    }

    try {
        await ensureAudioContext();

        createRecordingControls();

        ensureCompositionCanvas();

        renderCompositionFrame();

        const canvasStream =
            compositionCanvas.captureStream(
                30
            );

        const audioDestination =
            await prepareAudioMix();

        const combinedStream =
            new MediaStream();

        canvasStream
            .getVideoTracks()
            .forEach((track) => {
                combinedStream.addTrack(
                    track
                );
            });

        if (
            audioDestination &&
            audioDestination.stream
        ) {
            audioDestination.stream
                .getAudioTracks()
                .forEach((track) => {
                    combinedStream.addTrack(
                        track
                    );
                });
        }

        recordingStream =
            combinedStream;

        recordedChunks = [];

        const mimeType =
            getSupportedMimeType();

        mediaRecorder =
            mimeType
                ? new MediaRecorder(
                    combinedStream,
                    {
                        mimeType
                    }
                )
                : new MediaRecorder(
                    combinedStream
                );

        mediaRecorder.ondataavailable =
            (event) => {
                if (
                    event.data &&
                    event.data.size > 0
                ) {
                    recordedChunks.push(
                        event.data
                    );
                }
            };

        mediaRecorder.onerror =
            (event) => {
                console.error(
                    "MediaRecorder error:",
                    event
                );

                showToast(
                    "Recording error."
                );
            };

        mediaRecorder.onstop =
            handleRecordingStopped;

        mediaRecorder.start(
            1000
        );

        isRecording = true;
        isRecordingPaused = false;

        if (recordingControls) {
            recordingControls.style.display =
                "flex";
        }

        if (recordingPauseButton) {
            recordingPauseButton.textContent =
                "❚❚ Pause";
        }

        startRecordingTimer();

        if (
            teleprompterPanel &&
            teleprompterPanel.style.display !==
                "none"
        ) {
            resetTeleprompter();
            startTeleprompter();
        }

        showToast(
            "Recording started."
        );
    } catch (error) {
        console.error(
            "Recording start error:",
            error
        );

        cleanupRecordingResources();

        showToast(
            "Could not start recording."
        );
    }
}

/* =========================================================
   STOP RECORDING
   ========================================================= */

function stopRecording() {
    if (
        !mediaRecorder ||
        !isRecording
    ) {
        return;
    }

    try {
        if (
            mediaRecorder.state !==
            "inactive"
        ) {
            mediaRecorder.stop();
        }
    } catch (error) {
        console.error(error);

        handleRecordingStopped();
    }
}

/* =========================================================
   RECORDING STOPPED
   ========================================================= */

function handleRecordingStopped() {
    isRecording = false;
    isRecordingPaused = false;

    stopRecordingTimer();
    stopTeleprompter();

    if (recordingControls) {
        recordingControls.style.display =
            "none";
    }

    const blob =
        new Blob(
            recordedChunks,
            {
                type:
                    mediaRecorder?.mimeType ||
                    "video/webm"
            }
        );

    lastRecordingBlob = blob;

    if (lastRecordingUrl) {
        URL.revokeObjectURL(
            lastRecordingUrl
        );
    }

    lastRecordingUrl =
        URL.createObjectURL(
            blob
        );

    cleanupRecordingResources();

    showRecordingPreview(
        lastRecordingUrl
    );
}

/* =========================================================
   CLEANUP RECORDING
   ========================================================= */

function cleanupRecordingResources() {
    if (microphoneStream) {
        microphoneStream
            .getTracks()
            .forEach((track) => {
                try {
                    track.stop();
                } catch (_) {}
            });

        microphoneStream = null;
    }

    microphoneSource = null;

    if (recordingStream) {
        recordingStream
            .getTracks()
            .forEach((track) => {
                try {
                    track.stop();
                } catch (_) {}
            });

        recordingStream = null;
    }

    mediaRecorder = null;
}

/* =========================================================
   RECORDING PREVIEW
   ========================================================= */

function createPreviewModal() {
    if (previewModal) return;

    previewModal =
        document.createElement("div");

    previewModal.id =
        "courseStudioPreviewModal";

    Object.assign(
        previewModal.style,
        {
            position: "fixed",
            inset: "0",
            zIndex: "11000",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "rgba(0,0,0,.78)",
            backdropFilter: "blur(10px)"
        }
    );

    previewModal.innerHTML = `
        <div
            style="
                width:min(1000px, 100%);
                max-height:calc(100vh - 48px);
                overflow:auto;
                background:#0c111b;
                border:1px solid rgba(255,255,255,.1);
                border-radius:22px;
                padding:18px;
                box-shadow:0 30px 100px rgba(0,0,0,.6);
            "
        >
            <div
                style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:12px;
                    margin-bottom:14px;
                "
            >
                <div>
                    <div
                        style="
                            color:#fff;
                            font-size:18px;
                            font-weight:800;
                        "
                    >
                        Recording Preview
                    </div>

                    <div
                        style="
                            color:rgba(255,255,255,.5);
                            font-size:12px;
                            margin-top:4px;
                        "
                    >
                        Review your recorded class before downloading.
                    </div>
                </div>

                <button
                    type="button"
                    id="previewCloseBtn"
                    style="
                        width:36px;
                        height:36px;
                        border:0;
                        border-radius:11px;
                        background:rgba(255,255,255,.08);
                        color:#fff;
                        cursor:pointer;
                        font-size:20px;
                    "
                >
                    ×
                </button>
            </div>

            <video
                id="recordingPreviewVideo"
                controls
                playsinline
                style="
                    width:100%;
                    display:block;
                    background:#000;
                    border-radius:15px;
                    max-height:65vh;
                "
            ></video>

            <div
                style="
                    display:flex;
                    justify-content:flex-end;
                    flex-wrap:wrap;
                    gap:10px;
                    margin-top:15px;
                "
            >
                <button
                    type="button"
                    id="deleteRecordingBtn"
                    style="
                        border:0;
                        border-radius:11px;
                        padding:11px 15px;
                        background:rgba(239,68,68,.12);
                        color:#fca5a5;
                        cursor:pointer;
                        font-weight:700;
                    "
                >
                    Delete
                </button>

                <button
                    type="button"
                    id="recordAgainBtn"
                    style="
                        border:0;
                        border-radius:11px;
                        padding:11px 15px;
                        background:rgba(255,255,255,.08);
                        color:#fff;
                        cursor:pointer;
                        font-weight:700;
                    "
                >
                    Record Again
                </button>

                <button
                    type="button"
                    id="downloadRecordingBtn"
                    style="
                        border:0;
                        border-radius:11px;
                        padding:11px 18px;
                        background:#2563eb;
                        color:#fff;
                        cursor:pointer;
                        font-weight:800;
                    "
                >
                    Download Video
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(
        previewModal
    );

    previewVideo =
        $("recordingPreviewVideo");

    downloadRecordingBtn =
        $("downloadRecordingBtn");

    recordAgainBtn =
        $("recordAgainBtn");

    deleteRecordingBtn =
        $("deleteRecordingBtn");

    const closeBtn =
        $("previewCloseBtn");

    closeBtn.addEventListener(
        "click",
        closePreviewModal
    );

    downloadRecordingBtn.addEventListener(
        "click",
        downloadRecording
    );

    recordAgainBtn.addEventListener(
        "click",
        () => {
            closePreviewModal();

            setTimeout(() => {
                startRecording();
            }, 200);
        }
    );

    deleteRecordingBtn.addEventListener(
        "click",
        () => {
            lastRecordingBlob = null;

            if (lastRecordingUrl) {
                URL.revokeObjectURL(
                    lastRecordingUrl
                );

                lastRecordingUrl = null;
            }

            if (previewVideo) {
                previewVideo.removeAttribute(
                    "src"
                );

                previewVideo.load();
            }

            closePreviewModal();

            showToast(
                "Recording deleted."
            );
        }
    );
}

/* =========================================================
   SHOW PREVIEW
   ========================================================= */

function showRecordingPreview(url) {
    createPreviewModal();

    if (previewVideo) {
        previewVideo.src = url;
        previewVideo.currentTime = 0;
    }

    if (previewModal) {
        previewModal.style.display =
            "flex";
    }
}

/* =========================================================
   CLOSE PREVIEW
   ========================================================= */

function closePreviewModal() {
    if (!previewModal) return;

    if (previewVideo) {
        previewVideo.pause();
    }

    previewModal.style.display =
        "none";
}

/* =========================================================
   DOWNLOAD RECORDING
   ========================================================= */

function downloadRecording() {
    if (!lastRecordingBlob) {
        showToast(
            "No recording available."
        );

        return;
    }

    const url =
        URL.createObjectURL(
            lastRecordingBlob
        );

    const date =
        new Date();

    const stamp =
        date
            .toISOString()
            .replace(
                /[:.]/g,
                "-"
            )
            .slice(
                0,
                19
            );

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        `Personal-Course-Studio-${stamp}.webm`;

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();

    setTimeout(() => {
        URL.revokeObjectURL(
            url
        );
    }, 1000);

    showToast(
        "Video download started."
    );
}

/* =========================================================
   RECORD BUTTON
   ========================================================= */

if (recordBtn) {
    recordBtn.addEventListener(
        "click",
        () => {
            if (isRecording) {
                stopRecording();
            } else {
                startRecording();
            }
        }
    );
}

/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

document.addEventListener(
    "keydown",
    (event) => {
        const tag =
            event.target?.tagName;

        if (
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT"
        ) {
            return;
        }

        /* Space = play/pause teleprompter */
        if (
            event.code ===
            "Space"
        ) {
            if (
                teleprompterPanel &&
                teleprompterPanel.style.display !==
                    "none"
            ) {
                event.preventDefault();

                if (teleprompterPlaying) {
                    stopTeleprompter();
                } else {
                    startTeleprompter();
                }
            }
        }

        /* R = recording */
        if (
            event.key.toLowerCase() ===
            "r"
        ) {
            if (!isRecording) {
                startRecording();
            }
        }

        /* Escape */
        if (
            event.key ===
            "Escape"
        ) {
            if (
                previewModal &&
                previewModal.style.display !==
                    "none"
            ) {
                closePreviewModal();
            }
        }
    }
);

/* =========================================================
   RESIZE RESTORE
   ========================================================= */

function restoreMentorSize() {
    if (!mentorCard) return;

    const width =
        localStorage.getItem(
            STORAGE_KEYS.mentorWidth
        );

    const height =
        localStorage.getItem(
            STORAGE_KEYS.mentorHeight
        );

    if (width) {
        mentorCard.style.width =
            width + "px";
    }

    if (height) {
        mentorCard.style.height =
            height + "px";
    }
}

/* =========================================================
   GLOBAL API
   ========================================================= */

window.CourseStudio = {
    startCamera,
    stopCamera,

    setBackgroundMode,

    startRecording,
    stopRecording,
    toggleRecordingPause,

    createTeleprompter,
    startTeleprompter,
    stopTeleprompter,
    resetTeleprompter,

    renderCompositionFrame,

    getStudents,
    saveStudents,

    showRecordingPreview,
    downloadRecording
};

/* =========================================================
   INITIALIZATION
   ========================================================= */

function initializeStudio() {
    renderStudents();

    applyBrandName();

    restoreMentorSize();

    createTeleprompter();

    if (teleprompterPanel) {
        teleprompterPanel.style.display =
            "none";
    }

    createTeleprompterOpenButton();

    createAudioToggle();

    createPreviewModal();

    ensureCompositionCanvas();

    startCompositionLoop();

    /* Default background */
    setBackgroundMode(
        "original"
    );

    /* Hide AI canvas initially */
    if (mentorAICanvas) {
        mentorAICanvas.style.display =
            "none";
    }

    if (mainImage) {
        mainImage.style.display =
            currentMainType === "image"
                ? "block"
                : "none";
    }

    if (mainVideo) {
        mainVideo.style.display =
            currentMainType === "video"
                ? "block"
                : "none";
    }

    showToast(
        "Personal Course Studio ready."
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
        initializeStudio
    );
} else {
    initializeStudio();
}
