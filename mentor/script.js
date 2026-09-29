<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <meta
    name="theme-color"
    content="#07111d"
  >

  <meta
    name="description"
    content="Personal Course Studio — Professional Mentor Recording Studio"
  >

  <title>Mentor Studio | Personal Course Studio</title>

  <style>

    /* =========================================================
       STEP 3.9
       PERSONAL COURSE STUDIO
       PREMIUM MENTOR STUDIO UI
       ========================================================= */

    :root {
      --bg: #050a11;
      --bg-2: #08111d;
      --panel: #0b1522;
      --panel-2: #0f1b2a;
      --panel-3: #132236;

      --line: rgba(255,255,255,.08);
      --line-strong: rgba(255,255,255,.14);

      --text: #f5f8fc;
      --muted: #8ea0b6;
      --muted-2: #65788f;

      --blue: #4da3ff;
      --blue-2: #2388ef;
      --blue-soft: rgba(77,163,255,.14);

      --green: #31d28c;
      --green-soft: rgba(49,210,140,.13);

      --red: #ff5570;
      --red-soft: rgba(255,85,112,.13);

      --yellow: #ffc857;
      --yellow-soft: rgba(255,200,87,.13);

      --shadow:
        0 25px 80px rgba(0,0,0,.42);

      --radius: 16px;
      --radius-sm: 11px;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      width: 100%;
      min-height: 100%;
      margin: 0;
      padding: 0;
    }

    body {
      background:
        radial-gradient(
          circle at 15% 10%,
          rgba(43,128,220,.10),
          transparent 28%
        ),
        radial-gradient(
          circle at 85% 15%,
          rgba(70,160,255,.07),
          transparent 25%
        ),
        var(--bg);

      color: var(--text);

      font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;

      overflow-x: hidden;
    }

    button,
    input,
    select,
    textarea {
      font: inherit;
    }

    button {
      border: 0;
      cursor: pointer;
    }

    button:disabled {
      opacity: .45;
      cursor: not-allowed;
    }

    input,
    select,
    textarea {
      outline: none;
    }

    .hidden {
      display: none !important;
    }

    /* =========================================================
       APP
       ========================================================= */

    #app {
      width: 100%;
      min-height: 100vh;

      display: flex;
      flex-direction: column;

      background:
        linear-gradient(
          180deg,
          rgba(255,255,255,.012),
          transparent
        );
    }

    /* =========================================================
       TOP BAR
       ========================================================= */

    .topbar {
      height: 68px;

      display: flex;
      align-items: center;
      justify-content: space-between;

      padding:
        0 18px;

      background:
        rgba(5,10,17,.90);

      border-bottom:
        1px solid var(--line);

      backdrop-filter:
        blur(20px);

      position: relative;
      z-index: 50;
    }

    .brand-area {
      display: flex;
      align-items: center;
      gap: 12px;

      min-width: 220px;
    }

    .brand-logo {
      width: 38px;
      height: 38px;

      border-radius: 12px;

      display: grid;
      place-items: center;

      background:
        linear-gradient(
          135deg,
          #4da3ff,
          #176dcc
        );

      color: #fff;

      font-size: 17px;
      font-weight: 900;

      box-shadow:
        0 8px 25px rgba(35,136,239,.25);
    }

    .brand-copy {
      min-width: 0;
    }

    .brand-title {
      font-size: 14px;
      font-weight: 800;
      letter-spacing: -.2px;
    }

    .brand-subtitle {
      margin-top: 2px;

      color: var(--muted);
      font-size: 11px;
    }

    .top-actions {
      display: flex;
      align-items: center;
      gap: 7px;

      overflow-x: auto;
      scrollbar-width: none;
    }

    .top-actions::-webkit-scrollbar {
      display: none;
    }

    .top-btn {
      min-height: 38px;

      padding:
        0 12px;

      border:
        1px solid var(--line);

      border-radius:
        10px;

      background:
        rgba(255,255,255,.025);

      color:
        var(--text);

      display:
        inline-flex;

      align-items:
        center;

      justify-content:
        center;

      gap: 7px;

      white-space: nowrap;

      transition:
        .2s ease;
    }

    .top-btn:hover {
      background:
        rgba(255,255,255,.07);

      border-color:
        var(--line-strong);

      transform:
        translateY(-1px);
    }

    .top-btn.primary {
      background:
        linear-gradient(
          135deg,
          #4da3ff,
          #217fdc
        );

      border-color:
        transparent;

      color: white;

      box-shadow:
        0 8px 25px rgba(35,136,239,.20);
    }

    .top-btn.danger {
      background:
        rgba(255,85,112,.10);

      border-color:
        rgba(255,85,112,.25);

      color:
        #ff91a4;
    }

    .top-btn.record-active {
      background:
        rgba(255,85,112,.15);

      border-color:
        rgba(255,85,112,.45);

      color:
        #ff8197;
    }

    /* =========================================================
       RECORDING STATUS BAR
       ========================================================= */

    .recording-status-bar {
      min-height: 54px;

      padding:
        8px 18px;

      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        12px;

      background:
        rgba(8,17,29,.94);

      border-bottom:
        1px solid var(--line);

      position:
        relative;

      z-index:
        40;
    }

    .recording-status-left,
    .recording-status-right {
      display:
        flex;

      align-items:
        center;

      gap:
        10px;

      min-width:
        0;
    }

    .recording-live-box {
      display:
        flex;

      align-items:
        center;

      gap:
        8px;

      padding:
        7px 10px;

      border-radius:
        10px;

      background:
        rgba(255,255,255,.035);

      border:
        1px solid var(--line);
    }

    .recording-status-dot {
      width: 9px;
      height: 9px;

      border-radius:
        50%;

      background:
        #526579;

      box-shadow:
        none;
    }

    .recording-status-dot.live {
      background:
        var(--red);

      box-shadow:
        0 0 0 5px rgba(255,85,112,.10),
        0 0 18px rgba(255,85,112,.70);

      animation:
        recordingPulse 1.15s infinite;
    }

    @keyframes recordingPulse {
      0% {
        opacity: 1;
      }

      50% {
        opacity: .45;
      }

      100% {
        opacity: 1;
      }
    }

    .recording-status-text {
      font-size:
        12px;

      font-weight:
        700;

      color:
        var(--muted);
    }

    .recording-timer {
      font-variant-numeric:
        tabular-nums;

      font-size:
        14px;

      font-weight:
        900;

      letter-spacing:
        .7px;

      color:
        white;

      min-width:
        75px;

      text-align:
        center;
    }

    .recording-select {
      height:
        34px;

      padding:
        0 10px;

      background:
        rgba(255,255,255,.035);

      border:
        1px solid var(--line);

      border-radius:
        9px;

      color:
        var(--text);

      font-size:
        12px;
    }

    .recording-control-btn {
      height:
        34px;

      padding:
        0 11px;

      border:
        1px solid var(--line);

      border-radius:
        9px;

      background:
        rgba(255,255,255,.035);

      color:
        var(--text);

      font-size:
        12px;

      font-weight:
        700;
    }

    .recording-control-btn:hover {
      background:
        rgba(255,255,255,.08);
    }

    .recording-control-btn.pause {
      color:
        #ffc857;

      border-color:
        rgba(255,200,87,.22);
    }

    .recording-control-btn.resume {
      color:
        #55e3a2;

      border-color:
        rgba(49,210,140,.22);
    }

    .recording-control-btn.stop {
      color:
        #ff8296;

      border-color:
        rgba(255,85,112,.24);
    }

    /* =========================================================
       STATUS INDICATORS
       ========================================================= */

    .status-indicators {
      display:
        flex;

      align-items:
        center;

      gap:
        7px;
    }

    .status-chip {
      display:
        inline-flex;

      align-items:
        center;

      gap:
        6px;

      min-height:
        32px;

      padding:
        0 9px;

      border-radius:
        9px;

      background:
        rgba(255,255,255,.025);

      border:
        1px solid var(--line);

      color:
        var(--muted);

      font-size:
        11px;

      white-space:
        nowrap;
    }

    .status-chip-dot {
      width:
        7px;

      height:
        7px;

      border-radius:
        50%;

      background:
        #526579;
    }

    .status-chip-dot.online {
      background:
        var(--green);

      box-shadow:
        0 0 10px rgba(49,210,140,.55);
    }

    /* =========================================================
       MAIN WORKSPACE
       ========================================================= */

    .workspace {
      flex:
        1;

      min-height:
        0;

      display:
        grid;

      grid-template-columns:
        minmax(0, 1fr)
        310px;

      gap:
        12px;

      padding:
        12px;

      overflow:
        hidden;
    }

    .main-workspace {
      min-width:
        0;

      min-height:
        0;

      display:
        flex;

      flex-direction:
        column;

      gap:
        10px;
    }

    /* =========================================================
       STAGE
       ========================================================= */

    .stage-shell {
      position:
        relative;

      flex:
        1;

      min-height:
        400px;

      border:
        1px solid var(--line);

      border-radius:
        var(--radius);

      background:
        #03070c;

      overflow:
        hidden;

      box-shadow:
        var(--shadow);
    }

    .stage {
      position:
        absolute;

      inset:
        0;

      overflow:
        hidden;

      background:
        #03070c;
    }

    .stage img,
    .stage video,
    .stage canvas {
      max-width:
        none;
    }

    #mainImage,
    #mainVideo,
    #screenCaptureVideo {
      position:
        absolute;

      inset:
        0;

      width:
        100%;

      height:
        100%;

      object-fit:
        contain;

      display:
        none;

      background:
        #03070c;
    }

    #mainImage.active,
    #mainVideo.active,
    #screenCaptureVideo.active {
      display:
        block;
    }

    #screenCaptureVideo {
      pointer-events:
        none;
    }

    .welcome-content {
      position:
        absolute;

      inset:
        0;

      display:
        flex;

      align-items:
        center;

      justify-content:
        center;

      text-align:
        center;

      padding:
        30px;
    }

    .welcome-inner {
      max-width:
        520px;
    }

    .welcome-icon {
      width:
        76px;

      height:
        76px;

      margin:
        0 auto 20px;

      border-radius:
        22px;

      display:
        grid;

      place-items:
        center;

      background:
        linear-gradient(
          135deg,
          rgba(77,163,255,.18),
          rgba(35,136,239,.06)
        );

      border:
        1px solid
        rgba(77,163,255,.20);

      color:
        #6ab4ff;

      font-size:
        30px;
    }

    .welcome-title {
      margin:
        0;

      font-size:
        25px;

      font-weight:
        900;

      letter-spacing:
        -.8px;
    }

    .welcome-text {
      margin:
        10px 0 0;

      color:
        var(--muted);

      font-size:
        13px;

      line-height:
        1.7;
    }

    /* =========================================================
       MENTOR CARD
       ========================================================= */

    .mentor-card {
      position:
        absolute;

      top:
        22px;

      right:
        22px;

      width:
        235px;

      height:
        155px;

      min-width:
        130px;

      min-height:
        90px;

      max-width:
        45%;

      max-height:
        65%;

      border:
        1px solid
        rgba(255,255,255,.14);

      border-radius:
        15px;

      overflow:
        hidden;

      background:
        #07101b;

      box-shadow:
        0 18px 45px rgba(0,0,0,.45);

      z-index:
        12;

      touch-action:
        none;
    }

    .mentor-card::after {
      content:
        "";

      position:
        absolute;

      inset:
        0;

      pointer-events:
        none;

      border:
        1px solid
        rgba(255,255,255,.05);

      border-radius:
        inherit;
    }

    .mentor-source-label {
      position:
        absolute;

      top:
        9px;

      left:
        9px;

      z-index:
        20;

      padding:
        4px 7px;

      border-radius:
        7px;

      background:
        rgba(0,0,0,.55);

      color:
        #dce9f8;

      font-size:
        9px;

      font-weight:
        800;

      text-transform:
        uppercase;

      letter-spacing:
        .5px;
    }

    #mentorVideo,
    #mentorCameraVideo,
    #mentorAICanvas {
      position:
        absolute;

      inset:
        0;

      width:
        100%;

      height:
        100%;

      object-fit:
        cover;

      display:
        none;
    }

    #mentorVideo.active,
    #mentorCameraVideo.active,
    #mentorAICanvas.active {
      display:
        block;
    }

    .mentor-placeholder {
      position:
        absolute;

      inset:
        0;

      display:
        grid;

      place-items:
        center;

      background:
        radial-gradient(
          circle,
          rgba(77,163,255,.08),
          transparent 60%
        );

      color:
        var(--muted);
    }

    .mentor-placeholder-inner {
      text-align:
        center;
    }

    .mentor-placeholder-icon {
      font-size:
        27px;

      margin-bottom:
        6px;
    }

    .mentor-placeholder-text {
      font-size:
        10px;

      font-weight:
        700;
    }

    .mentor-resize {
      position:
        absolute;

      right:
        5px;

      bottom:
        5px;

      width:
        18px;

      height:
        18px;

      border-radius:
        5px;

      background:
        rgba(0,0,0,.55);

      border:
        1px solid
        rgba(255,255,255,.12);

      cursor:
        nwse-resize;

      z-index:
        30;
    }

    .mentor-resize::before {
      content:
        "";

      position:
        absolute;

      right:
        4px;

      bottom:
        4px;

      width:
        7px;

      height:
        7px;

      border-right:
        2px solid
        rgba(255,255,255,.75);

      border-bottom:
        2px solid
        rgba(255,255,255,.75);
    }

    /* =========================================================
       BRAND BADGE
       ========================================================= */

    .brand-badge {
      position:
        absolute;

      left:
        18px;

      bottom:
        18px;

      z-index:
        20;

      max-width:
        45%;

      padding:
        7px 11px;

      border-radius:
        9px;

      background:
        rgba(4,10,17,.76);

      border:
        1px solid
        rgba(255,255,255,.10);

      color:
        #fff;

      font-size:
        11px;

      font-weight:
        800;

      backdrop-filter:
        blur(10px);
    }

    /* =========================================================
       RECORDING OVERLAY
       ========================================================= */

    .recording-overlay {
      position:
        absolute;

      top:
        16px;

      left:
        50%;

      transform:
        translateX(-50%)
        translateY(-8px);

      opacity:
        0;

      pointer-events:
        none;

      z-index:
        50;

      padding:
        7px 11px;

      border-radius:
        10px;

      background:
        rgba(6,10,16,.82);

      border:
        1px solid
        rgba(255,85,112,.28);

      color:
        #fff;

      font-size:
        11px;

      font-weight:
        800;

      transition:
        .2s ease;
    }

    .recording-overlay.active {
      opacity:
        1;

      transform:
        translateX(-50%)
        translateY(0);
    }

    /* =========================================================
       STAGE BADGES
       ========================================================= */

    .stage-meta {
      position:
        absolute;

      left:
        16px;

      top:
        16px;

      z-index:
        30;

      display:
        flex;

      gap:
        6px;
    }

    .stage-badge {
      padding:
        5px 8px;

      border-radius:
        7px;

      background:
        rgba(0,0,0,.48);

      border:
        1px solid
        rgba(255,255,255,.09);

      color:
        #bdcce0;

      font-size:
        9px;

      font-weight:
        800;

      backdrop-filter:
        blur(10px);
    }

    /* =========================================================
       STAGE TOOLBAR
       ========================================================= */

    .stage-toolbar {
      min-height:
        60px;

      display:
        flex;

      align-items:
        center;

      gap:
        7px;

      padding:
        8px;

      overflow-x:
        auto;

      scrollbar-width:
        none;

      border:
        1px solid var(--line);

      border-radius:
        13px;

      background:
        rgba(11,21,34,.88);
    }

    .stage-toolbar::-webkit-scrollbar {
      display:
        none;
    }

    .tool-btn {
      flex:
        0 0 auto;

      height:
        40px;

      padding:
        0 12px;

      display:
        inline-flex;

      align-items:
        center;

      justify-content:
        center;

      gap:
        7px;

      border:
        1px solid var(--line);

      border-radius:
        10px;

      background:
        rgba(255,255,255,.025);

      color:
        var(--text);

      font-size:
        11px;

      font-weight:
        750;

      white-space:
        nowrap;

      transition:
        .2s ease;
    }

    .tool-btn:hover {
      background:
        rgba(255,255,255,.075);

      transform:
        translateY(-1px);
    }

    .tool-btn.primary {
      background:
        var(--blue-soft);

      border-color:
        rgba(77,163,255,.22);

      color:
        #79bcff;
    }

    .tool-btn.record {
      background:
        rgba(255,85,112,.11);

      border-color:
        rgba(255,85,112,.22);

      color:
        #ff8297;
    }

    /* =========================================================
       RIGHT PANEL
       ========================================================= */

    .side-panel {
      min-height:
        0;

      overflow-y:
        auto;

      padding:
        2px 1px 2px 0;

      scrollbar-width:
        thin;
    }

    .side-panel::-webkit-scrollbar {
      width:
        5px;
    }

    .side-panel::-webkit-scrollbar-thumb {
      background:
        rgba(255,255,255,.10);

      border-radius:
        10px;
    }

    .panel-card {
      margin-bottom:
        10px;

      padding:
        12px;

      border:
        1px solid var(--line);

      border-radius:
        14px;

      background:
        rgba(11,21,34,.90);

      box-shadow:
        0 10px 30px rgba(0,0,0,.12);
    }

    .panel-heading {
      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        10px;

      margin-bottom:
        10px;
    }

    .panel-title {
      font-size:
        12px;

      font-weight:
        850;
    }

    .panel-subtitle {
      color:
        var(--muted-2);

      font-size:
        9px;
    }

    .panel-grid {
      display:
        grid;

      grid-template-columns:
        repeat(2, minmax(0,1fr));

      gap:
        7px;
    }

    .side-btn {
      min-height:
        38px;

      padding:
        7px 8px;

      border:
        1px solid var(--line);

      border-radius:
        9px;

      background:
        rgba(255,255,255,.025);

      color:
        #d9e5f2;

      font-size:
        10px;

      font-weight:
        700;
    }

    .side-btn:hover {
      background:
        rgba(255,255,255,.07);
    }

    .side-btn.active {
      background:
        var(--blue-soft);

      border-color:
        rgba(77,163,255,.25);

      color:
        #7ec2ff;
    }

    .side-btn.green {
      color:
        #63e5a8;
    }

    .side-btn.red {
      color:
        #ff8297;
    }

    /* =========================================================
       CAMERA STATUS
       ========================================================= */

    .status-box {
      margin-top:
        9px;

      padding:
        9px;

      border-radius:
        9px;

      background:
        rgba(255,255,255,.025);

      border:
        1px solid var(--line);

      color:
        var(--muted);

      font-size:
        10px;
    }

    /* =========================================================
       BACKGROUND OPTIONS
       ========================================================= */

    .background-options {
      display:
        grid;

      grid-template-columns:
        repeat(5, minmax(0,1fr));

      gap:
        5px;
    }

    .bg-option {
      min-height:
        42px;

      border:
        1px solid var(--line);

      border-radius:
        8px;

      background:
        rgba(255,255,255,.025);

      color:
        var(--muted);

      font-size:
        8px;

      font-weight:
        750;

      padding:
        4px;
    }

    .bg-option.active {
      border-color:
        rgba(77,163,255,.35);

      color:
        #78bcff;

      background:
        rgba(77,163,255,.09);
    }

    .color-row {
      margin-top:
        8px;

      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        8px;

      color:
        var(--muted);

      font-size:
        10px;
    }

    .color-row input[type="color"] {
      width:
        45px;

      height:
        30px;

      padding:
        2px;

      border:
        1px solid var(--line);

      border-radius:
        7px;

      background:
        transparent;
    }

    /* =========================================================
       SCREEN CAPTURE
       ========================================================= */

    .screen-status {
      display:
        flex;

      align-items:
        center;

      gap:
        8px;

      padding:
        9px;

      border-radius:
        9px;

      background:
        rgba(255,255,255,.025);

      border:
        1px solid var(--line);

      color:
        var(--muted);

      font-size:
        10px;
    }

    .screen-status-light {
      width:
        7px;

      height:
        7px;

      border-radius:
        50%;

      background:
        #526579;
    }

    .screen-status-light.online {
      background:
        var(--green);

      box-shadow:
        0 0 9px rgba(49,210,140,.5);
    }

    /* =========================================================
       AUDIO CONTROLS
       ========================================================= */

    .audio-row {
      margin-bottom:
        10px;

      padding:
        9px;

      border-radius:
        10px;

      background:
        rgba(255,255,255,.022);

      border:
        1px solid var(--line);
    }

    .audio-row:last-child {
      margin-bottom:
        0;
    }

    .audio-label {
      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        8px;

      margin-bottom:
        7px;

      color:
        #dce7f4;

      font-size:
        10px;

      font-weight:
        750;
    }

    .audio-value {
      color:
        var(--blue);

      font-size:
        9px;
    }

    input[type="range"] {
      width:
        100%;

      accent-color:
        var(--blue);
    }

    .check-row {
      display:
        flex;

      align-items:
        center;

      gap:
        8px;

      margin-top:
        8px;

      color:
        var(--muted);

      font-size:
        10px;
    }

    .check-row input {
      accent-color:
        var(--blue);
    }

    /* =========================================================
       AUDIO LEVEL METER
       ========================================================= */

    .audio-meter {
      display:
        flex;

      align-items:
        center;

      gap:
        8px;

      margin-top:
        10px;
    }

    .audio-meter-label {
      width:
        52px;

      color:
        var(--muted);

      font-size:
        9px;
    }

    .audio-meter-track {
      flex:
        1;

      height:
        7px;

      border-radius:
        10px;

      background:
        rgba(255,255,255,.07);

      overflow:
        hidden;

      display:
        flex;

      gap:
        2px;
    }

    .audio-meter-bar {
      flex:
        1;

      height:
        100%;

      background:
        rgba(255,255,255,.10);

      transition:
        background .08s linear;
    }

    .audio-meter-bar.active {
      background:
        var(--green);
    }

    .audio-meter-bar.hot {
      background:
        var(--yellow);
    }

    .audio-meter-bar.clip {
      background:
        var(--red);
    }

    /* =========================================================
       MICROPHONE WAVEFORM
       ========================================================= */

    .waveform-box {
      margin-top:
        9px;

      height:
        48px;

      padding:
        5px;

      border:
        1px solid var(--line);

      border-radius:
        9px;

      background:
        rgba(0,0,0,.14);

      overflow:
        hidden;
    }

    #micWaveformCanvas {
      width:
        100%;

      height:
        100%;

      display:
        block;
    }

    /* =========================================================
       TELEPROMPTER
       ========================================================= */

    .teleprompter-mini {
      min-height:
        76px;

      max-height:
        120px;

      overflow:
        hidden;

      padding:
        10px;

      border:
        1px solid var(--line);

      border-radius:
        9px;

      background:
        rgba(0,0,0,.14);

      color:
        #c9d9e9;

      font-size:
        10px;

      line-height:
        1.6;
    }

    .teleprompter-mini-empty {
      color:
        var(--muted-2);

      text-align:
        center;

      padding:
        20px 5px;
    }

    /* =========================================================
       STUDENTS
       ========================================================= */

    .student-item {
      display:
        flex;

      align-items:
        center;

      gap:
        8px;

      padding:
        8px;

      margin-bottom:
        6px;

      border:
        1px solid var(--line);

      border-radius:
        9px;

      background:
        rgba(255,255,255,.02);
    }

    .student-avatar {
      width:
        31px;

      height:
        31px;

      flex:
        0 0 31px;

      display:
        grid;

      place-items:
        center;

      border-radius:
        9px;

      background:
        var(--blue-soft);

      color:
        #79bdff;

      font-size:
        9px;

      font-weight:
        900;
    }

    .student-info {
      min-width:
        0;

      flex:
        1;
    }

    .student-name {
      color:
        #dce7f4;

      font-size:
        10px;

      font-weight:
        750;

      overflow:
        hidden;

      text-overflow:
        ellipsis;

      white-space:
        nowrap;
    }

    .student-status {
      margin-top:
        2px;

      color:
        var(--green);

      font-size:
        8px;
    }

    .student-remove {
      width:
        26px;

      height:
        26px;

      border-radius:
        7px;

      background:
        var(--red-soft);

      color:
        #ff8297;

      font-size:
        15px;
    }

    /* =========================================================
       RECORDING SETTINGS
       ========================================================= */

    .setting-row {
      display:
        grid;

      grid-template-columns:
        1fr 1fr;

      gap:
        7px;

      margin-bottom:
        8px;
    }

    .setting-group label {
      display:
        block;

      margin-bottom:
        5px;

      color:
        var(--muted);

      font-size:
        9px;
    }

    .setting-group select,
    .setting-group input[type="text"] {
      width:
        100%;

      height:
        36px;

      padding:
        0 9px;

      border:
        1px solid var(--line);

      border-radius:
        8px;

      background:
        rgba(255,255,255,.025);

      color:
        var(--text);

      font-size:
        10px;
    }

    /* =========================================================
       FILES
       ========================================================= */

    .file-grid {
      display:
        grid;

      grid-template-columns:
        repeat(2, minmax(0,1fr));

      gap:
        6px;
    }

    /* =========================================================
       MODALS
       ========================================================= */

    .modal-backdrop {
      position:
        fixed;

      inset:
        0;

      z-index:
        100;

      display:
        flex;

      align-items:
        center;

      justify-content:
        center;

      padding:
        20px;

      background:
        rgba(0,0,0,.72);

      backdrop-filter:
        blur(14px);

      opacity:
        0;

      visibility:
        hidden;

      pointer-events:
        none;

      transition:
        .2s ease;
    }

    .modal-backdrop.show {
      opacity:
        1;

      visibility:
        visible;

      pointer-events:
        auto;
    }

    .modal {
      width:
        min(720px, 100%);

      max-height:
        90vh;

      overflow:
        auto;

      border:
        1px solid var(--line-strong);

      border-radius:
        18px;

      background:
        #09131f;

      box-shadow:
        0 40px 100px rgba(0,0,0,.55);

      transform:
        translateY(10px)
        scale(.98);

      transition:
        .2s ease;
    }

    .modal-backdrop.show .modal {
      transform:
        translateY(0)
        scale(1);
    }

    .modal-header {
      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        12px;

      padding:
        15px 17px;

      border-bottom:
        1px solid var(--line);
    }

    .modal-title {
      font-size:
        14px;

      font-weight:
        850;
    }

    .modal-close {
      width:
        32px;

      height:
        32px;

      border-radius:
        9px;

      background:
        rgba(255,255,255,.05);

      color:
        #b7c5d5;

      font-size:
        18px;
    }

    .modal-body {
      padding:
        17px;
    }

    .modal-footer {
      display:
        flex;

      justify-content:
        flex-end;

      gap:
        8px;

      padding:
        12px 17px;

      border-top:
        1px solid var(--line);
    }

    .modal-field {
      margin-bottom:
        13px;
    }

    .modal-field label {
      display:
        block;

      margin-bottom:
        6px;

      color:
        var(--muted);

      font-size:
        10px;
    }

    .modal-field input,
    .modal-field select,
    .modal-field textarea {
      width:
        100%;

      padding:
        10px 11px;

      border:
        1px solid var(--line);

      border-radius:
        9px;

      background:
        rgba(255,255,255,.025);

      color:
        var(--text);

      font-size:
        11px;
    }

    .modal-field textarea {
      min-height:
        180px;

      resize:
        vertical;

      line-height:
        1.7;
    }

    .modal-button {
      min-height:
        38px;

      padding:
        0 13px;

      border-radius:
        9px;

      border:
        1px solid var(--line);

      background:
        rgba(255,255,255,.04);

      color:
        var(--text);

      font-size:
        11px;

      font-weight:
        750;
    }

    .modal-button.primary {
      background:
        linear-gradient(
          135deg,
          #4da3ff,
          #217fdc
        );

      border-color:
        transparent;
    }

    .modal-button.danger {
      color:
        #ff8297;

      border-color:
        rgba(255,85,112,.22);

      background:
        rgba(255,85,112,.08);
    }

    /* =========================================================
       TELEPROMPTER MODAL
       ========================================================= */

    .teleprompter-preview {
      height:
        300px;

      overflow:
        auto;

      padding:
        35px;

      margin-bottom:
        12px;

      border:
        1px solid var(--line);

      border-radius:
        12px;

      background:
        #02060a;

      color:
        #fff;

      line-height:
        1.65;

      white-space:
        pre-wrap;

      text-align:
        center;

      scroll-behavior:
        auto;
    }

    .teleprompter-controls {
      display:
        grid;

      grid-template-columns:
        repeat(3, minmax(0,1fr));

      gap:
        8px;
    }

    /* =========================================================
       RECORDING PREVIEW
       ========================================================= */

    .recording-preview-modal {
      width:
        min(1050px, 100%);
    }

    .recording-preview-layout {
      display:
        grid;

      grid-template-columns:
        minmax(0, 1.55fr)
        minmax(250px, .7fr);

      gap:
        14px;
    }

    .recording-preview-video-wrap {
      position:
        relative;

      min-height:
        340px;

      border:
        1px solid var(--line);

      border-radius:
        13px;

      overflow:
        hidden;

      background:
        #000;
    }

    #recordingPreviewVideo {
      width:
        100%;

      height:
        100%;

      min-height:
        340px;

      display:
        block;

      object-fit:
        contain;

      background:
        #000;
    }

    .preview-info-panel {
      padding:
        13px;

      border:
        1px solid var(--line);

      border-radius:
        13px;

      background:
        rgba(255,255,255,.02);
    }

    .preview-info-title {
      font-size:
        13px;

      font-weight:
        850;

      margin-bottom:
        12px;
    }

    .recording-file-info {
      color:
        var(--muted);

      font-size:
        10px;

      line-height:
        1.8;

      padding:
        10px;

      border-radius:
        9px;

      background:
        rgba(255,255,255,.025);

      border:
        1px solid var(--line);
    }

    .preview-actions {
      display:
        grid;

      grid-template-columns:
        1fr;

      gap:
        7px;

      margin-top:
        12px;
    }

    .preview-action-btn {
      min-height:
        40px;

      border:
        1px solid var(--line);

      border-radius:
        9px;

      background:
        rgba(255,255,255,.035);

      color:
        var(--text);

      font-size:
        10px;

      font-weight:
        800;
    }

    .preview-action-btn.primary {
      background:
        linear-gradient(
          135deg,
          #4da3ff,
          #217fdc
        );

      border-color:
        transparent;
    }

    .preview-action-btn.danger {
      color:
        #ff8297;

      background:
        rgba(255,85,112,.07);

      border-color:
        rgba(255,85,112,.20);
    }

    /* =========================================================
       RECORDING HISTORY
       ========================================================= */

    .history-list {
      display:
        flex;

      flex-direction:
        column;

      gap:
        7px;
    }

    .history-empty {
      padding:
        15px 8px;

      color:
        var(--muted-2);

      text-align:
        center;

      font-size:
        10px;
    }

    .history-item {
      display:
        flex;

      align-items:
        center;

      gap:
        9px;

      padding:
        8px;

      border:
        1px solid var(--line);

      border-radius:
        9px;

      background:
        rgba(255,255,255,.02);
    }

    .history-icon {
      width:
        34px;

      height:
        34px;

      flex:
        0 0 34px;

      display:
        grid;

      place-items:
        center;

      border-radius:
        9px;

      background:
        var(--blue-soft);

      color:
        #76bbff;

      font-size:
        12px;
    }

    .history-info {
      min-width:
        0;

      flex:
        1;
    }

    .history-name {
      font-size:
        10px;

      font-weight:
        750;

      overflow:
        hidden;

      white-space:
        nowrap;

      text-overflow:
        ellipsis;
    }

    .history-meta {
      margin-top:
        3px;

      color:
        var(--muted-2);

      font-size:
        8px;
    }

    .history-actions {
      display:
        flex;

      gap:
        4px;
    }

    .history-action {
      width:
        27px;

      height:
        27px;

      border-radius:
        7px;

      background:
        rgba(255,255,255,.04);

      color:
        #aebdd0;

      font-size:
        10px;
    }

    /* =========================================================
       TOAST
       ========================================================= */

    #toastContainer {
      position:
        fixed;

      right:
        18px;

      bottom:
        18px;

      z-index:
        300;

      display:
        flex;

      flex-direction:
        column;

      gap:
        7px;

      pointer-events:
        none;
    }

    .toast {
      min-width:
        230px;

      max-width:
        360px;

      padding:
        11px 13px;

      border:
        1px solid
        rgba(255,255,255,.10);

      border-radius:
        10px;

      background:
        rgba(8,17,29,.94);

      color:
        #e9f2fb;

      box-shadow:
        0 16px 40px rgba(0,0,0,.35);

      font-size:
        10px;

      font-weight:
        700;

      transition:
        .2s ease;
    }

    /* =========================================================
       FULLSCREEN
       ========================================================= */

    body.fullscreen-active {
      background:
        #000;
    }

    body.fullscreen-active #app {
      background:
        #000;
    }

    :fullscreen {
      background:
        #000;
    }

    /* =========================================================
       RESPONSIVE
       ========================================================= */

    @media (max-width: 1180px) {

      .workspace {
        grid-template-columns:
          minmax(0, 1fr)
          275px;
      }

      .mentor-card {
        width:
          210px;

        height:
          140px;
      }

      .status-chip {
        padding:
          0 7px;
      }

      .status-chip span:last-child {
        display:
          none;
      }
    }

    @media (max-width: 900px) {

      .workspace {
        grid-template-columns:
          1fr;

        overflow:
          visible;
      }

      .side-panel {
        max-height:
          none;

        overflow:
          visible;
      }

      .stage-shell {
        min-height:
          430px;
      }

      .recording-preview-layout {
        grid-template-columns:
          1fr;
      }

      .recording-preview-video-wrap {
        min-height:
          300px;
      }
    }

    @media (max-width: 700px) {

      .topbar {
        height:
          auto;

        min-height:
          62px;

        align-items:
          flex-start;

        padding:
          10px;

        gap:
          8px;
      }

      .brand-area {
        min-width:
          155px;
      }

      .brand-logo {
        width:
          34px;

        height:
          34px;
      }

      .top-actions {
        justify-content:
          flex-end;
      }

      .top-btn {
        padding:
          0 9px;

        font-size:
          10px;
      }

      .top-btn span.label {
        display:
          none;
      }

      .recording-status-bar {
        flex-wrap:
          wrap;

        padding:
          8px 10px;
      }

      .recording-status-left,
      .recording-status-right {
        width:
          100%;

        justify-content:
          space-between;
      }

      .status-indicators {
        width:
          100%;

        overflow-x:
          auto;
      }

      .workspace {
        padding:
          8px;

        gap:
          8px;
      }

      .stage-shell {
        min-height:
          330px;

        border-radius:
          12px;
      }

      .mentor-card {
        top:
          12px;

        right:
          12px;

        width:
          165px;

        height:
          110px;
      }

      .brand-badge {
        left:
          10px;

        bottom:
          10px;

        font-size:
          9px;
      }

      .stage-meta {
        left:
          10px;

        top:
          10px;
      }

      .stage-toolbar {
        min-height:
          54px;
      }

      .tool-btn {
        height:
          36px;

        padding:
          0 9px;

        font-size:
          9px;
      }

      .background-options {
        grid-template-columns:
          repeat(5, minmax(42px,1fr));
      }

      .teleprompter-controls {
        grid-template-columns:
          1fr;
      }

      .modal-backdrop {
        padding:
          8px;
      }

      .modal {
        border-radius:
          14px;
      }

      .recording-preview-video-wrap,
      #recordingPreviewVideo {
        min-height:
          220px;
      }
    }

    @media (max-width: 480px) {

      .brand-subtitle {
        display:
          none;
      }

      .brand-title {
        font-size:
          12px;
      }

      .top-actions .top-btn:nth-child(1),
      .top-actions .top-btn:nth-child(2) {
        display:
          none;
      }

      .stage-shell {
        min-height:
          260px;
      }

      .mentor-card {
        width:
          140px;

        height:
          94px;
      }

      .recording-select {
        max-width:
          78px;
      }

      .recording-control-btn {
        padding:
          0 8px;
      }

      .setting-row {
        grid-template-columns:
          1fr;
      }
    }

  </style>
</head>

<body>

  <div id="app">

    <!-- =======================================================
         TOP BAR
         ======================================================= -->

    <header class="topbar">

      <div class="brand-area">

        <div class="brand-logo">
          M
        </div>

        <div class="brand-copy">

          <div
            class="brand-title"
            id="studioTitle"
          >
            Mentor Studio
          </div>

          <div class="brand-subtitle">
            Personal Course Studio
          </div>

        </div>

      </div>


      <div class="top-actions">

        <button
          type="button"
          class="top-btn"
          id="openShortcutsBtn"
          title="Keyboard shortcuts"
        >
          ⌨
          <span class="label">
            Shortcuts
          </span>
        </button>


        <button
          type="button"
          class="top-btn"
          id="startScreenCaptureBtn"
          title="Start screen capture"
        >
          🖥
          <span class="label">
            Screen
          </span>
        </button>


        <button
          type="button"
          class="top-btn"
          id="fullscreenStageBtn"
          title="Stage fullscreen"
        >
          ⛶
          <span class="label">
            Stage
          </span>
        </button>


        <button
          type="button"
          class="top-btn"
          id="fullscreenStudioBtn"
          title="Full studio fullscreen"
        >
          ⛶
          <span class="label">
            Studio
          </span>
        </button>


        <button
          type="button"
          class="top-btn"
          id="settingsBtn"
        >
          ⚙
          <span class="label">
            Settings
          </span>
        </button>


        <button
          type="button"
          class="top-btn"
          id="openTeleprompterTopBtn"
        >
          📜
          <span class="label">
            Teleprompter
          </span>
        </button>


        <button
          type="button"
          class="top-btn primary"
          id="recordBtn"
        >
          ● Record
        </button>

      </div>

    </header>


    <!-- =======================================================
         RECORDING STATUS BAR
         ======================================================= -->

    <section
      class="recording-status-bar"
      id="recordingStatusBar"
    >

      <div class="recording-status-left">

        <div class="recording-live-box">

          <span
            class="recording-status-dot"
            id="recordingStatusDot"
          ></span>

          <span
            class="recording-status-text"
            id="recordingStatusText"
          >
            Ready
          </span>

        </div>


        <div
          class="recording-timer"
          id="recordingTimer"
        >
          00:00:00
        </div>


        <select
          class="recording-select"
          id="recordingQuality"
          aria-label="Recording quality"
        >
          <option value="720">
            720p
          </option>

          <option value="1080" selected>
            1080p
          </option>

          <option value="1440">
            1440p
          </option>
        </select>


        <select
          class="recording-select"
          id="recordingFps"
          aria-label="Recording FPS"
        >
          <option value="24">
            24 FPS
          </option>

          <option value="30" selected>
            30 FPS
          </option>

          <option value="60">
            60 FPS
          </option>
        </select>

      </div>


      <div class="recording-status-right">

        <div class="status-indicators">

          <div class="status-chip">

            <span
              class="status-chip-dot"
              id="cameraIndicator"
            ></span>

            <span>
              Camera
            </span>

          </div>


          <div class="status-chip">

            <span
              class="status-chip-dot"
              id="micIndicator"
            ></span>

            <span>
              Mic
            </span>

          </div>


          <div class="status-chip">

            <span
              class="status-chip-dot"
              id="audioIndicator"
            ></span>

            <span>
              Audio
            </span>

          </div>


          <div class="status-chip">

            <span
              class="status-chip-dot"
              id="screenIndicator"
            ></span>

            <span>
              Screen
            </span>

          </div>

        </div>


        <button
          type="button"
          class="recording-control-btn pause"
          id="pauseRecordingBtn"
        >
          ⏸ Pause
        </button>


        <button
          type="button"
          class="recording-control-btn resume hidden"
          id="resumeRecordingBtn"
        >
          ▶ Resume
        </button>


        <button
          type="button"
          class="recording-control-btn stop"
          id="stopRecordingBtn"
        >
          ■ Stop
        </button>

      </div>

    </section>


    <!-- =======================================================
         WORKSPACE
         ======================================================= -->

    <main class="workspace">

      <!-- =====================================================
           MAIN WORKSPACE
           ===================================================== -->

      <section class="main-workspace">


        <!-- ===================================================
             STAGE
             =================================================== -->

        <div
          class="stage-shell"
          id="stageShell"
        >

          <div
            class="stage"
            id="stage"
          >

            <!-- Main image -->

            <img
              id="mainImage"
              alt="Main slide"
              draggable="false"
            >


            <!-- Main video -->

            <video
              id="mainVideo"
              playsinline
              preload="metadata"
            ></video>


            <!-- Screen capture -->

            <video
              id="screenCaptureVideo"
              playsinline
              muted
            ></video>


            <!-- Welcome -->

            <div
              class="welcome-content"
              id="welcomeContent"
            >

              <div class="welcome-inner">

                <div class="welcome-icon">
                  ▶
                </div>

                <h1 class="welcome-title">
                  Personal Course Studio
                </h1>

                <p class="welcome-text">
                  Upload your slide, course video,
                  mentor video or start your camera
                  to begin recording.
                </p>

              </div>

            </div>


            <!-- Stage meta -->

            <div class="stage-meta">

              <div
                class="stage-badge"
                id="stageResolutionBadge"
              >
                1920 × 1080
              </div>

              <div
                class="stage-badge"
                id="stageFpsBadge"
              >
                30 FPS
              </div>

              <div
                class="stage-badge"
                id="stageSourceBadge"
              >
                Ready
              </div>

            </div>


            <!-- Mentor card -->

            <div
              class="mentor-card"
              id="mentorCard"
            >

              <div
                class="mentor-source-label"
                id="mentorSourceLabel"
              >
                Mentor
              </div>


              <video
                id="mentorVideo"
                playsinline
                muted
                loop
              ></video>


              <video
                id="mentorCameraVideo"
                playsinline
                muted
              ></video>


              <canvas
                id="mentorAICanvas"
              ></canvas>


              <div
                class="mentor-placeholder"
                id="mentorPlaceholder"
              >

                <div
                  class="mentor-placeholder-inner"
                >

                  <div class="mentor-placeholder-icon">
                    👤
                  </div>

                  <div class="mentor-placeholder-text">
                    Mentor Camera
                  </div>

                </div>

              </div>


              <div
                class="mentor-resize"
                id="mentorResize"
                title="Resize mentor video"
              ></div>

            </div>


            <!-- Brand -->

            <div
              class="brand-badge"
              id="brandBadge"
            >
              Personal Course Studio
            </div>


            <!-- Recording overlay -->

            <div
              class="recording-overlay"
              id="recordingOverlay"
            >
              ● REC
              <span id="recordingOverlayTimer">
                00:00:00
              </span>
            </div>

          </div>

        </div>


        <!-- ===================================================
             STAGE TOOLBAR
             =================================================== -->

        <div class="stage-toolbar">

          <button
            type="button"
            class="tool-btn"
            id="uploadMainBtn"
          >
            🖼 Upload Slide
          </button>


          <button
            type="button"
            class="tool-btn"
            id="uploadVideoBtn"
          >
            🎬 Upload Video
          </button>


          <button
            type="button"
            class="tool-btn"
            id="mainPlayBtn"
          >
            ▶ Play
          </button>


          <button
            type="button"
            class="tool-btn"
            id="mainPauseBtn"
          >
            ⏸ Pause
          </button>


          <button
            type="button"
            class="tool-btn"
            id="uploadMentorBtn"
          >
            👤 Mentor Video
          </button>


          <button
            type="button"
            class="tool-btn"
            id="startCameraBtn"
          >
            📷 Camera
          </button>


          <button
            type="button"
            class="tool-btn"
            id="stopCameraBtn"
          >
            ⛔ Stop Camera
          </button>


          <button
            type="button"
            class="tool-btn primary"
            id="openTeleprompterBtn"
          >
            📜 Teleprompter
          </button>


          <button
            type="button"
            class="tool-btn record"
            id="recordToolbarBtn"
          >
            ● Record
          </button>

        </div>

      </section>


      <!-- =====================================================
           SIDE PANEL
           ===================================================== -->

      <aside class="side-panel">


        <!-- ===================================================
             CAMERA
             =================================================== -->

        <section class="panel-card">

          <div class="panel-heading">

            <div>

              <div class="panel-title">
                Camera
              </div>

              <div class="panel-subtitle">
                Mentor camera controls
              </div>

            </div>

          </div>


          <div class="panel-grid">

            <button
              type="button"
              class="side-btn green"
              id="startCameraSideBtn"
            >
              ▶ Start
            </button>

            <button
              type="button"
              class="side-btn red"
              id="stopCameraSideBtn"
            >
              ■ Stop
            </button>

            <button
              type="button"
              class="side-btn"
              id="switchCameraSideBtn"
            >
              ⇄ Switch
            </button>

            <button
              type="button"
              class="side-btn"
              id="uploadMentorSideBtn"
            >
              🎬 Video
            </button>

          </div>


          <div
            class="status-box"
            id="cameraStatus"
          >
            Camera Off
          </div>

        </section>


        <!-- ===================================================
             AI BACKGROUND
             =================================================== -->

        <section class="panel-card">

          <div class="panel-heading">

            <div>

              <div class="panel-title">
                AI Background
              </div>

              <div class="panel-subtitle">
                Keep person visible
              </div>

            </div>

          </div>


          <div class="background-options">

            <button
              type="button"
              class="bg-option active"
              id="bgOriginalBtn"
            >
              Original
            </button>

            <button
              type="button"
              class="bg-option"
              id="bgRemoveBtn"
            >
              Remove
            </button>

            <button
              type="button"
              class="bg-option"
              id="bgBlurBtn"
            >
              Blur
            </button>

            <button
              type="button"
              class="bg-option"
              id="bgImageBtn"
            >
              Image
            </button>

            <button
              type="button"
              class="bg-option"
              id="bgColorBtn"
            >
              Color
            </button>

          </div>


          <div class="color-row">

            <span>
              Background color
            </span>

            <input
              type="color"
              id="backgroundColor"
              value="#142238"
            >

          </div>


          <button
            type="button"
            class="side-btn"
            id="uploadBackgroundSideBtn"
            style="width:100%;margin-top:8px;"
          >
            🖼 Upload Custom Background
          </button>


          <div
            class="status-box"
            id="backgroundUploadBox"
          >
            No custom background selected.
          </div>

        </section>


        <!-- ===================================================
             SCREEN CAPTURE
             =================================================== -->

        <section class="panel-card">

          <div class="panel-heading">

            <div>

              <div class="panel-title">
                Screen Capture
              </div>

              <div class="panel-subtitle">
                Screen / window / tab
              </div>

            </div>

          </div>


          <div class="panel-grid">

            <button
              type="button"
              class="side-btn green"
              id="startScreenCaptureSideBtn"
            >
              🖥 Start
            </button>

            <button
              type="button"
              class="side-btn red"
              id="stopScreenCaptureBtn"
            >
              ■ Stop
            </button>

          </div>


          <div
            class="screen-status"
            id="screenCaptureStatus"
            style="margin-top:8px;"
          >

            <span
              class="screen-status-light"
              id="screenCaptureStatusLight"
            ></span>

            <span>
              Screen capture is off
            </span>

          </div>

        </section>


        <!-- ===================================================
             AUDIO
             =================================================== -->

        <section class="panel-card">

          <div class="panel-heading">

            <div>

              <div class="panel-title">
                Recording Audio
              </div>

              <div class="panel-subtitle">
                Main video + microphone
              </div>

            </div>

          </div>


          <!-- Main video -->

          <div class="audio-row">

            <div class="audio-label">

              <span>
                Main Video Audio
              </span>

              <span
                class="audio-value"
                id="mainVolumeValue"
              >
                100%
              </span>

            </div>


            <input
              type="range"
              id="mainVideoVolume"
              min="0"
              max="100"
              value="100"
            >


            <label class="check-row">

              <input
                type="checkbox"
                id="mainVideoAudioCheckbox"
                checked
              >

              Include video audio

            </label>

          </div>


          <!-- Mic -->

          <div class="audio-row">

            <div class="audio-label">

              <span>
                Microphone
              </span>

              <span
                class="audio-value"
                id="micVolumeValue"
              >
                100%
              </span>

            </div>


            <input
              type="range"
              id="micVolume"
              min="0"
              max="100"
              value="100"
            >


            <label class="check-row">

              <input
                type="checkbox"
                id="micEnabled"
                checked
              >

              Record microphone

            </label>


            <label class="check-row">

              <input
                type="checkbox"
                id="micMonitor"
              >

              Monitor microphone

            </label>


            <div
              class="status-box"
              data-mic-status
            >
              Microphone not connected
            </div>


            <!-- Waveform -->

            <div class="waveform-box">

              <canvas
                id="micWaveformCanvas"
              ></canvas>

            </div>


            <!-- Level meter -->

            <div class="audio-meter">

              <span class="audio-meter-label">
                Level
              </span>

              <div
                class="audio-meter-track"
                id="audioMeterTrack"
              >

                <span class="audio-meter-bar"></span>
                <span class="audio-meter-bar"></span>
                <span class="audio-meter-bar"></span>
                <span class="audio-meter-bar"></span>
                <span class="audio-meter-bar"></span>
                <span class="audio-meter-bar"></span>
                <span class="audio-meter-bar"></span>
                <span class="audio-meter-bar"></span>
                <span class="audio-meter-bar"></span>
                <span class="audio-meter-bar"></span>
                <span class="audio-meter-bar"></span>
                <span class="audio-meter-bar"></span>

              </div>

            </div>

          </div>

        </section>


        <!-- ===================================================
             TELEPROMPTER
             =================================================== -->

        <section class="panel-card">

          <div class="panel-heading">

            <div>

              <div class="panel-title">
                Teleprompter
              </div>

              <div class="panel-subtitle">
                Read while recording
              </div>

            </div>

          </div>


          <div
            class="teleprompter-mini"
            id="teleprompterMiniPreview"
          >
            <div class="teleprompter-mini-empty">
              No script loaded.
            </div>
          </div>


          <div class="panel-grid" style="margin-top:8px;">

            <button
              type="button"
              class="side-btn active"
              id="openTeleprompterSide"
            >
              📜 Open
            </button>

            <button
              type="button"
              class="side-btn"
              id="uploadTeleprompterBtn"
            >
              TXT Upload
            </button>

          </div>

        </section>


        <!-- ===================================================
             STUDENTS
             =================================================== -->

        <section class="panel-card">

          <div class="panel-heading">

            <div>

              <div class="panel-title">
                Students
              </div>

              <div class="panel-subtitle">
                Live class participants
              </div>

            </div>


            <button
              type="button"
              class="side-btn"
              id="addStudentBtn"
              style="min-height:30px;padding:5px 8px;"
            >
              + Add
            </button>

          </div>


          <div id="studentsList"></div>

        </section>


        <!-- ===================================================
             RECORDING SETTINGS
             =================================================== -->

        <section class="panel-card">

          <div class="panel-heading">

            <div>

              <div class="panel-title">
                Recording Settings
              </div>

              <div class="panel-subtitle">
                Quality and FPS
              </div>

            </div>

          </div>


          <div class="setting-row">

            <div class="setting-group">

              <label>
                Quality
              </label>

              <select
                id="recordingQualitySide"
              >

                <option value="720">
                  720p
                </option>

                <option value="1080" selected>
                  1080p
                </option>

                <option value="1440">
                  1440p
                </option>

              </select>

            </div>


            <div class="setting-group">

              <label>
                FPS
              </label>

              <select
                id="recordingFpsSide"
              >

                <option value="24">
                  24
                </option>

                <option value="30" selected>
                  30
                </option>

                <option value="60">
                  60
                </option>

              </select>

            </div>

          </div>

        </section>


        <!-- ===================================================
             FILES
             =================================================== -->

        <section class="panel-card">

          <div class="panel-heading">

            <div>

              <div class="panel-title">
                Files
              </div>

              <div class="panel-subtitle">
                Quick upload
              </div>

            </div>

          </div>


          <div class="file-grid">

            <button
              type="button"
              class="side-btn"
              id="uploadMainSideBtn"
            >
              🖼 Slide
            </button>

            <button
              type="button"
              class="side-btn"
              id="uploadVideoSideBtn"
            >
              🎬 Video
            </button>

            <button
              type="button"
              class="side-btn"
              id="uploadMentorFileSideBtn"
            >
              👤 Mentor
            </button>

            <button
              type="button"
              class="side-btn"
              id="uploadBackgroundSideBtn"
            >
              🌄 Background
            </button>

          </div>

        </section>


        <!-- ===================================================
             RECORDING HISTORY
             =================================================== -->

        <section class="panel-card">

          <div class="panel-heading">

            <div>

              <div class="panel-title">
                Recording History
              </div>

              <div class="panel-subtitle">
                Saved recordings
              </div>

            </div>

          </div>


          <div
            class="history-list"
            id="recordingHistoryList"
          >

            <div class="history-empty">
              No recordings yet.
            </div>

          </div>

        </section>

      </aside>

    </main>

  </div>


  <!-- =========================================================
       HIDDEN FILE INPUTS
       ========================================================= -->

  <input
    type="file"
    id="mainFileInput"
    accept="image/*"
    hidden
  >

  <input
    type="file"
    id="mainVideoInput"
    accept="video/*"
    hidden
  >

  <input
    type="file"
    id="mentorFileInput"
    accept="video/*"
    hidden
  >

  <input
    type="file"
    id="backgroundImageUpload"
    accept="image/*"
    hidden
  >

  <input
    type="file"
    id="teleprompterFileInput"
    accept=".txt,text/plain"
    hidden
  >


  <!-- =========================================================
       AI CANVASES
       ========================================================= -->

  <canvas
    id="aiCanvas"
    width="640"
    height="480"
    hidden
  ></canvas>

  <canvas
    id="aiSourceCanvas"
    width="640"
    height="480"
    hidden
  ></canvas>

  <canvas
    id="aiMaskCanvas"
    width="640"
    height="480"
    hidden
  ></canvas>


  <!-- =========================================================
       SETTINGS MODAL
       ========================================================= -->

  <div
    class="modal-backdrop"
    id="settingsModal"
  >

    <div class="modal">

      <div class="modal-header">

        <div class="modal-title">
          Studio Settings
        </div>

        <button
          type="button"
          class="modal-close"
          id="closeSettingsBtn"
        >
          ×
        </button>

      </div>


      <div class="modal-body">

        <div class="modal-field">

          <label>
            Brand / Studio Name
          </label>

          <input
            type="text"
            id="brandNameInput"
            value="Personal Course Studio"
            placeholder="Your studio name"
          >

        </div>


        <div class="setting-row">

          <div class="modal-field">

            <label>
              Recording Quality
            </label>

            <select
              id="settingsRecordingQuality"
            >

              <option value="720">
                720p
              </option>

              <option value="1080">
                1080p
              </option>

              <option value="1440">
                1440p
              </option>

            </select>

          </div>


          <div class="modal-field">

            <label>
              Recording FPS
            </label>

            <select
              id="settingsRecordingFps"
            >

              <option value="24">
                24 FPS
              </option>

              <option value="30">
                30 FPS
              </option>

              <option value="60">
                60 FPS
              </option>

            </select>

          </div>

        </div>


        <label class="check-row">

          <input
            type="checkbox"
            id="settingsAutoStartTeleprompter"
          >

          Automatically start teleprompter with recording

        </label>


        <label class="check-row">

          <input
            type="checkbox"
            id="settingsShowTeleprompterRecording"
            checked
          >

          Show teleprompter while recording

        </label>

      </div>


      <div class="modal-footer">

        <button
          type="button"
          class="modal-button"
          id="closeSettingsFooterBtn"
        >
          Cancel
        </button>

        <button
          type="button"
          class="modal-button primary"
          id="saveSettingsBtn"
        >
          Save Settings
        </button>

      </div>

    </div>

  </div>


  <!-- =========================================================
       SHORTCUTS MODAL
       ========================================================= -->

  <div
    class="modal-backdrop"
    id="shortcutsModal"
  >

    <div class="modal">

      <div class="modal-header">

        <div class="modal-title">
          Keyboard Shortcuts
        </div>

        <button
          type="button"
          class="modal-close"
          id="closeShortcutsBtn"
        >
          ×
        </button>

      </div>


      <div class="modal-body">

        <div class="setting-row">

          <div class="status-box">
            <strong>Space</strong><br>
            Play / Pause main video
            <br>
            During recording:
            Pause / Resume
          </div>

          <div class="status-box">
            <strong>Ctrl + Enter</strong><br>
            Start / Stop recording
          </div>

        </div>


        <div class="setting-row">

          <div class="status-box">
            <strong>Ctrl + Shift + S</strong><br>
            Start / Stop screen capture
          </div>

          <div class="status-box">
            <strong>Ctrl + Shift + F</strong><br>
            Stage fullscreen
          </div>

        </div>


        <div class="setting-row">

          <div class="status-box">
            <strong>Ctrl + Shift + G</strong><br>
            Studio fullscreen
          </div>

          <div class="status-box">
            <strong>Esc</strong><br>
            Close modal / exit fullscreen
          </div>

        </div>

      </div>

    </div>

  </div>


  <!-- =========================================================
       TELEPROMPTER MODAL
       ========================================================= -->

  <div
    class="modal-backdrop"
    id="teleprompterModal"
  >

    <div class="modal">

      <div class="modal-header">

        <div class="modal-title">
          Teleprompter
        </div>

        <button
          type="button"
          class="modal-close"
          id="closeTeleprompterBtn"
        >
          ×
        </button>

      </div>


      <div class="modal-body">

        <div
          class="teleprompter-preview"
          id="teleprompterPreview"
        >
          Your teleprompter text will appear here.
        </div>


        <div class="modal-field">

          <label>
            Script
          </label>

          <textarea
            id="teleprompterText"
            placeholder="Write or paste your class script here..."
          ></textarea>

        </div>


        <div class="teleprompter-controls">

          <div class="modal-field">

            <label>
              Scroll Speed
            </label>

            <input
              type="range"
              id="teleprompterSpeed"
              min="10"
              max="200"
              value="60"
            >

          </div>


          <div class="modal-field">

            <label>
              Font Size
            </label>

            <input
              type="range"
              id="teleprompterFontSize"
              min="18"
              max="70"
              value="30"
            >

          </div>


          <div class="modal-field">

            <label>
              Opacity
            </label>

            <input
              type="range"
              id="teleprompterOpacity"
              min="20"
              max="100"
              value="92"
            >

          </div>

        </div>

      </div>


      <div class="modal-footer">

        <button
          type="button"
          class="modal-button"
          id="teleprompterResetBtn"
        >
          Reset
        </button>

        <button
          type="button"
          class="modal-button"
          id="teleprompterPauseBtn"
        >
          ⏸ Pause
        </button>

        <button
          type="button"
          class="modal-button"
          id="teleprompterPlayBtn"
        >
          ▶ Play
        </button>

        <button
          type="button"
          class="modal-button primary"
          id="teleprompterSaveBtn"
        >
          Save
        </button>

      </div>

    </div>

  </div>


  <!-- =========================================================
       RECORDING PREVIEW MODAL
       ========================================================= -->

  <div
    class="modal-backdrop"
    id="recordingPreviewModal"
  >

    <div class="modal recording-preview-modal">

      <div class="modal-header">

        <div class="modal-title">
          🎬 Recording Preview
        </div>

        <button
          type="button"
          class="modal-close"
          id="closeRecordingPreviewBtn"
        >
          ×
        </button>

      </div>


      <div class="modal-body">

        <div class="recording-preview-layout">

          <!-- Video -->

          <div
            class="recording-preview-video-wrap"
          >

            <video
              id="recordingPreviewVideo"
              controls
              playsinline
            ></video>

          </div>


          <!-- Info -->

          <div class="preview-info-panel">

            <div class="preview-info-title">
              Recording Details
            </div>


            <div
              class="recording-file-info"
              id="recordingFileInfo"
            >
              Recording information will appear here.
            </div>


            <div class="preview-actions">

              <a
                class="preview-action-btn primary"
                id="downloadRecordingBtn"
                href="#"
                download
                style="
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  text-decoration:none;
                "
              >
                ⬇ Download Recording
              </a>


              <button
                type="button"
                class="preview-action-btn"
                id="recordAgainBtn"
              >
                ● Record Again
              </button>


              <button
                type="button"
                class="preview-action-btn danger"
                id="deleteRecordingBtn"
              >
                🗑 Delete Recording
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  </div>


  <!-- =========================================================
       ADD STUDENT MODAL
       ========================================================= -->

  <div
    class="modal-backdrop"
    id="studentModal"
  >

    <div class="modal">

      <div class="modal-header">

        <div class="modal-title">
          Add Student
        </div>

        <button
          type="button"
          class="modal-close"
          id="closeStudentModalBtn"
        >
          ×
        </button>

      </div>


      <div class="modal-body">

        <div class="modal-field">

          <label>
            Student Name
          </label>

          <input
            type="text"
            id="studentNameInput"
            placeholder="Enter student name"
          >

        </div>

      </div>


      <div class="modal-footer">

        <button
          type="button"
          class="modal-button"
          id="cancelStudentBtn"
        >
          Cancel
        </button>

        <button
          type="button"
          class="modal-button primary"
          id="saveStudentBtn"
        >
          Add Student
        </button>

      </div>

    </div>

  </div>


  <!-- =========================================================
       TOAST
       ========================================================= -->

  <div
    id="toastContainer"
  ></div>


  <!-- =========================================================
       INLINE BRIDGE
       ========================================================= -->

  <script>

    /*
     * Microphone bridge
     * Used by Mentor Studio JavaScript.
     */

    window.CourseStudioMicVolume =
      1;

    window.CourseStudioMicEnabled =
      true;

    window.CourseStudioMicMonitor =
      false;


    /*
     * Mentor resize bridge
     */

    (() => {

      const mentor =
        document.getElementById(
          "mentorCard"
        );

      const handle =
        document.getElementById(
          "mentorResize"
        );

      const stage =
        document.getElementById(
          "stage"
        );

      if (
        !mentor ||
        !handle ||
        !stage
      ) {
        return;
      }


      let resizing =
        false;

      let startX =
        0;

      let startY =
        0;

      let startWidth =
        0;

      let startHeight =
        0;


      function getPoint(event) {

        if (
          event.touches &&
          event.touches.length
        ) {

          return event.touches[0];
        }

        return event;
      }


      function startResize(event) {

        event.preventDefault();

        event.stopPropagation();

        const point =
          getPoint(event);

        const rect =
          mentor.getBoundingClientRect();

        resizing =
          true;

        startX =
          point.clientX;

        startY =
          point.clientY;

        startWidth =
          rect.width;

        startHeight =
          rect.height;

        document.body.style.userSelect =
          "none";
      }


      function resize(event) {

        if (!resizing) {
          return;
        }

        event.preventDefault();

        const point =
          getPoint(event);

        const stageRect =
          stage.getBoundingClientRect();

        const dx =
          point.clientX -
          startX;

        const dy =
          point.clientY -
          startY;

        const aspect =
          startWidth /
          startHeight;

        let width =
          startWidth +
          dx;

        let height =
          startHeight +
          dy;

        /*
         * Keep reasonable aspect ratio.
         */

        if (
          Math.abs(dx) >
          Math.abs(dy)
        ) {

          height =
            width /
            aspect;

        } else {

          width =
            height *
            aspect;
        }


        const minWidth =
          130;

        const minHeight =
          90;

        const maxWidth =
          stageRect.width *
          .45;

        const maxHeight =
          stageRect.height *
          .65;


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


        mentor.style.width =
          `${width}px`;

        mentor.style.height =
          `${height}px`;
      }


      function stopResize() {

        resizing =
          false;

        document.body.style.userSelect =
          "";
      }


      handle.addEventListener(
        "mousedown",
        startResize
      );

      handle.addEventListener(
        "touchstart",
        startResize,
        {
          passive: false
        }
      );

      window.addEventListener(
        "mousemove",
        resize
      );

      window.addEventListener(
        "touchmove",
        resize,
        {
          passive: false
        }
      );

      window.addEventListener(
        "mouseup",
        stopResize
      );

      window.addEventListener(
        "touchend",
        stopResize
      );

    })();

  </script>


  <!-- =========================================================
       MEDIAPIPE
       ========================================================= -->

  <script
    src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
  ></script>

  <script
    src="https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js"
  ></script>


  <!-- =========================================================
       MAIN JAVASCRIPT
       ========================================================= -->

  <script src="script.js"></script>


  <!-- =========================================================
       STEP 3.9 AUDIO VISUALIZER
       ========================================================= -->

  <script>

    /*
     * This visualizer is intentionally independent from
     * the main recording engine.
     *
     * It becomes active when an analyser is exposed by
     * script.js.
     */

    (() => {

      const canvas =
        document.getElementById(
          "micWaveformCanvas"
        );

      if (!canvas) {
        return;
      }

      const ctx =
        canvas.getContext("2d");

      const bars =
        Array.from(
          document.querySelectorAll(
            ".audio-meter-bar"
          )
        );

      function resize() {

        const rect =
          canvas.getBoundingClientRect();

        const ratio =
          window.devicePixelRatio ||
          1;

        canvas.width =
          Math.max(
            1,
            Math.round(
              rect.width *
              ratio
            )
          );

        canvas.height =
          Math.max(
            1,
            Math.round(
              rect.height *
              ratio
            )
          );

        ctx.setTransform(
          ratio,
          0,
          0,
          ratio,
          0,
          0
        );
      }


      function draw() {

        const rect =
          canvas.getBoundingClientRect();

        const width =
          rect.width;

        const height =
          rect.height;

        ctx.clearRect(
          0,
          0,
          width,
          height
        );


        /*
         * Waiting state
         */

        const analyser =
          window.CourseStudio &&
          window.CourseStudio.getAnalyser
            ? window.CourseStudio.getAnalyser()
            : null;


        if (!analyser) {

          ctx.strokeStyle =
            "rgba(77,163,255,.18)";

          ctx.lineWidth =
            1;

          ctx.beginPath();

          ctx.moveTo(
            0,
            height / 2
          );

          ctx.lineTo(
            width,
            height / 2
          );

          ctx.stroke();


          bars.forEach(bar => {

            bar.classList.remove(
              "active",
              "hot",
              "clip"
            );

          });


          requestAnimationFrame(
            draw
          );

          return;
        }


        const data =
          new Uint8Array(
            analyser.fftSize
          );

        analyser.getByteTimeDomainData(
          data
        );


        ctx.beginPath();

        const slice =
          width /
          data.length;

        let x =
          0;


        for (
          let i = 0;
          i < data.length;
          i++
        ) {

          const value =
            data[i] /
            128;

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

          x += slice;
        }


        ctx.strokeStyle =
          "#4da3ff";

        ctx.lineWidth =
          1.5;

        ctx.stroke();


        /*
         * Meter
         */

        let sum =
          0;

        for (
          let i = 0;
          i < data.length;
          i++
        ) {

          const normalized =
            (
              data[i] -
              128
            ) / 128;

          sum +=
            normalized *
            normalized;
        }

        const rms =
          Math.sqrt(
            sum /
            data.length
          );

        const level =
          Math.min(
            1,
            rms * 4
          );

        const activeBars =
          Math.round(
            level *
            bars.length
          );


        bars.forEach(
          (bar, index) => {

            bar.classList.remove(
              "active",
              "hot",
              "clip"
            );

            if (
              index <
              activeBars
            ) {

              if (
                index >=
                bars.length * .9
              ) {

                bar.classList.add(
                  "clip"
                );

              } else if (
                index >=
                bars.length * .72
              ) {

                bar.classList.add(
                  "hot"
                );

              } else {

                bar.classList.add(
                  "active"
                );
              }
            }

          }
        );


        requestAnimationFrame(
          draw
        );
      }


      window.addEventListener(
        "resize",
        resize
      );

      resize();
      draw();

    })();

  </script>

</body>
</html>
