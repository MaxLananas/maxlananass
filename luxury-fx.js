// ============================================================================
// MAXLANANAS AWWWARDS ENGINE — SOTM / SOTY GRADE CREATIVE TECHNOLOGY
// Raymarched 3D Voxel Hologram · Liquid Chromatic Shader · Web Audio Synth
// Inspired by Lusion, Artem Shcherbakov, IVRESS, Bruno Simon, Mat Voyce & Sutéra
// ============================================================================

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasFinePointer = () => window.matchMedia("(pointer: fine)").matches;

// ----------------------------------------------------------------------------
// 1. WEB AUDIO API SYNTHESIZER (Pure procedural acoustics, 0 audio assets)
// ----------------------------------------------------------------------------
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    try {
      this.enabled = localStorage.getItem("portfolio-sound") === "on";
    } catch (_) {}
    this.lastHover = 0;
  }

  ensureContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  toggle() {
    this.ensureContext();
    this.enabled = !this.enabled;
    try {
      localStorage.setItem("portfolio-sound", this.enabled ? "on" : "off");
    } catch (_) {}
    if (this.enabled) this.playChime();
    return this.enabled;
  }

  // Micro-tick for hovering interactive elements
  playTick() {
    if (!this.enabled || prefersReducedMotion()) return;
    const now = Date.now();
    if (now - this.lastHover < 40) return;
    this.lastHover = now;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;
      osc.type = "sine";
      osc.frequency.setValueAtTime(1600, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.018);
      gain.gain.setValueAtTime(0.018, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.018);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.018);
    } catch (_) {}
  }

  // Deep organic woody snap for button clicks
  playClick() {
    if (!this.enabled || prefersReducedMotion()) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;
      osc.type = "triangle";
      osc.frequency.setValueAtTime(360, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.045);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.045);
    } catch (_) {}
  }

  // Harmonic chord chime
  playChime() {
    if (prefersReducedMotion()) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = t + idx * 0.035;
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.04, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.32);
      });
    } catch (_) {}
  }

  // Deep warm sub-bass swell for lightbox / modal
  playSwell() {
    if (!this.enabled || prefersReducedMotion()) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;
      osc.type = "sine";
      osc.frequency.setValueAtTime(65, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.2);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.07, t + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    } catch (_) {}
  }
}

export const soundFX = new SoundFX();

// ----------------------------------------------------------------------------
// 2. RAYMARCHED 3D GLSL WEBGL SHADER PIPELINE (Voxel Monolith & Liquid Ripple)
// ----------------------------------------------------------------------------
function initWebGLShader() {
  let canvas = document.getElementById("ambientCanvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "ambientCanvas";
    canvas.className = "ambient-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);
  }

  // Attempt WebGL 2.0 then 1.0
  const gl = canvas.getContext("webgl2", { alpha: false, depth: false, antialias: false, powerPreference: "high-performance" }) ||
             canvas.getContext("webgl", { alpha: false, depth: false, antialias: false, powerPreference: "high-performance" });

  if (!gl) {
    // Graceful fallback to 2D Canvas if WebGL unsupported
    initCanvas2DFallback(canvas);
    return;
  }

  // Vertex Shader
  const vsSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  // Fragment Shader: 3D Raymarched Architecture Voxel Lattice & Chromatic Liquid Ripples
  const fsSource = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_time;
    uniform float u_scroll;
    uniform vec3 u_shockwave; // x, y, progress

    // Rotation matrices
    mat2 rot(float a) {
      float c = cos(a), s = sin(a);
      return mat2(c, -s, s, c);
    }

    // Box Distance Function
    float sdBox(vec3 p, vec3 b) {
      vec3 q = abs(p) - b;
      return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
    }

    // Scene SDF: 3D Voxel Monolith & Spatial Architectural Grid
    float map(vec3 p) {
      // Mouse interaction rotation
      vec2 m = (u_mouse - 0.5) * 2.0;
      p.yz *= rot(m.y * 0.45);
      p.xz *= rot(m.x * 0.65 + u_time * 0.12);

      // Central Voxel Monolith (Minecraft/Architectural Motif)
      vec3 pCore = p;
      float d = sdBox(pCore, vec3(0.9, 1.1, 0.9)) - 0.04;

      // Sculpt hollowed architectural chambers
      d = max(d, -sdBox(pCore, vec3(1.2, 0.7, 0.7)));
      d = max(d, -sdBox(pCore, vec3(0.7, 1.3, 0.7)));
      d = max(d, -sdBox(pCore, vec3(0.7, 0.7, 1.2)));

      // Floating satellite voxels orbiting the structure
      vec3 pSub = p;
      pSub.xz *= rot(u_time * 0.3);
      pSub.y += sin(u_time * 0.8 + pSub.x) * 0.2;
      vec3 qSub = mod(pSub + vec3(1.5), 3.0) - vec3(1.5);
      float dSat = sdBox(qSub, vec3(0.18)) - 0.02;

      // Spatial floor grid lines
      float dFloor = p.y + 2.2;

      return min(min(d, dSat), dFloor);
    }

    // Normal calculation
    vec3 calcNormal(vec3 p) {
      vec2 e = vec2(0.002, 0.0);
      return normalize(vec3(
        map(p + e.xyy) - map(p - e.xyy),
        map(p + e.yxy) - map(p - e.yxy),
        map(p + e.yyx) - map(p - e.yyx)
      ));
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);

      // Mouse distance for liquid lens ripple
      if (u_shockwave.z > 0.0 && u_shockwave.z < 1.0) {
        vec2 wavePos = (u_shockwave.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
        float dWave = length(uv - wavePos);
        float waveRadius = u_shockwave.z * 1.4;
        float diff = abs(dWave - waveRadius);
        if (diff < 0.18) {
          float strength = (1.0 - u_shockwave.z) * (1.0 - diff / 0.18) * 0.05;
          uv += normalize(uv - wavePos) * sin(diff * 35.0) * strength;
        }
      }

      // Camera setup with scroll-velocity depth travel
      vec3 ro = vec3(0.0, 0.4, -4.2 + u_scroll * 0.001);
      vec3 rd = normalize(vec3(uv, 1.2));

      // Raymarching loop (bounded to 36 steps for solid 60-120fps performance)
      float t = 0.0;
      float d = 0.0;
      int hit = 0;
      for (int i = 0; i < 36; i++) {
        vec3 p = ro + rd * t;
        d = map(p);
        if (d < 0.003) {
          hit = 1;
          break;
        }
        t += d;
        if (t > 12.0) break;
      }

      // Deep Obsidian base color
      vec3 col = vec3(0.027, 0.027, 0.035);

      // Ambient celestial gradient background
      vec3 bgSky = mix(vec3(0.02, 0.03, 0.06), vec3(0.08, 0.06, 0.03), uv.y + 0.5);
      col = mix(col, bgSky, 0.85);

      // Shading if ray hit 3D geometry
      if (hit == 1) {
        vec3 p = ro + rd * t;
        vec3 n = calcNormal(p);

        // Light sources
        vec3 lightPos1 = vec3(2.5, 4.0, -3.0);
        vec3 l1 = normalize(lightPos1 - p);
        float diff1 = max(dot(n, l1), 0.0);

        // Fresnel rim glow
        float fresnel = pow(1.0 - max(dot(-rd, n), 0.0), 3.0);

        // Studio Brand Gold / Champagne color + Celestial Indigo
        vec3 gold = vec3(0.87, 0.75, 0.47);
        vec3 indigo = vec3(0.35, 0.40, 0.95);
        vec3 cyan = vec3(0.25, 0.70, 0.90);

        vec3 matCol = mix(vec3(0.06, 0.06, 0.08), gold, diff1 * 0.4);
        matCol += fresnel * indigo * 0.85;

        // Voxel wireframe edge glow
        vec3 edgeGrid = abs(fract(p * 2.0 - 0.5) - 0.5);
        float edge = step(0.44, max(edgeGrid.x, max(edgeGrid.y, edgeGrid.z)));
        matCol += edge * gold * 0.35;

        // Fog falloff into dark distance
        float fog = 1.0 - exp(-t * 0.22);
        col = mix(matCol, col, fog);
      }

      // Chromatic dispersion vignette on edges
      float vignette = length(uv);
      col *= smoothstep(1.6, 0.4, vignette);

      // Subtle warm cursor glow in screen space
      vec2 mouseUV = (u_mouse - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
      float mouseDist = length(uv - mouseUV);
      col += vec3(0.87, 0.75, 0.47) * (0.07 / (mouseDist * mouseDist + 0.45));

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // Shader compilation helper
  const createShader = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn("WebGL shader compile error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vs = createShader(gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) {
    initCanvas2DFallback(canvas);
    return;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("WebGL link error:", gl.getProgramInfoLog(program));
    initCanvas2DFallback(canvas);
    return;
  }

  gl.useProgram(program);

  // Quad geometry
  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1
  ]), gl.STATIC_DRAW);

  const posAttr = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(posAttr);
  gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

  // Uniform locations
  const uRes = gl.getUniformLocation(program, "u_resolution");
  const uMouse = gl.getUniformLocation(program, "u_mouse");
  const uTime = gl.getUniformLocation(program, "u_time");
  const uScroll = gl.getUniformLocation(program, "u_scroll");
  const uShock = gl.getUniformLocation(program, "u_shockwave");

  let mouseX = 0.5;
  let mouseY = 0.5;
  let targetMouseX = 0.5;
  let targetMouseY = 0.5;
  let scrollY = 0;
  let targetScrollY = 0;
  let shockwave = [0, 0, 0]; // x, y, progress

  const resize = () => {
    // Bound resolution for solid 60-120fps (retina downsample)
    const dpr = Math.min(window.devicePixelRatio || 1, 1.2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();
  window.addEventListener("resize", resize, { passive: true });

  window.addEventListener("mousemove", (e) => {
    targetMouseX = e.clientX / window.innerWidth;
    targetMouseY = 1.0 - (e.clientY / window.innerHeight);
  }, { passive: true });

  window.addEventListener("scroll", () => {
    targetScrollY = window.scrollY;
  }, { passive: true });

  // Trigger liquid shockwave on click
  window.addEventListener("click", (e) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.2);
    shockwave[0] = e.clientX * dpr;
    shockwave[1] = (window.innerHeight - e.clientY) * dpr;
    shockwave[2] = 0.01; // Start progress
  }, { passive: true });

  let animId = 0;
  let isRunning = false;
  const startTime = performance.now();

  const render = (now) => {
    if (prefersReducedMotion() || document.hidden) {
      animId = requestAnimationFrame(render);
      return;
    }

    const elapsed = (now - startTime) * 0.001;

    // Smooth physics damping (lerp)
    mouseX += (targetMouseX - mouseX) * 0.06;
    mouseY += (targetMouseY - mouseY) * 0.06;
    scrollY += (targetScrollY - scrollY) * 0.08;

    // Progress shockwave
    if (shockwave[2] > 0.0) {
      shockwave[2] += 0.024;
      if (shockwave[2] >= 1.0) shockwave[2] = 0.0;
    }

    gl.useProgram(program);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uMouse, mouseX, mouseY);
    gl.uniform1f(uTime, elapsed);
    gl.uniform1f(uScroll, scrollY);
    gl.uniform3f(uShock, shockwave[0], shockwave[1], shockwave[2]);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animId = requestAnimationFrame(render);
  };

  const start = () => {
    if (!isRunning) {
      isRunning = true;
      animId = requestAnimationFrame(render);
    }
  };

  const stop = () => {
    if (isRunning) {
      isRunning = false;
      cancelAnimationFrame(animId);
    }
  };

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  start();
}

// ----------------------------------------------------------------------------
// 2B. 2D CANVAS FALLBACK (In case WebGL is blocked or unavailable)
// ----------------------------------------------------------------------------
function initCanvas2DFallback(canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = 0, height = 0;
  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize, { passive: true });

  let mouseX = width / 2, mouseY = height / 2;
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  const render = () => {
    if (document.hidden || prefersReducedMotion()) {
      requestAnimationFrame(render);
      return;
    }
    ctx.fillStyle = "#070709";
    ctx.fillRect(0, 0, width, height);

    const grad = ctx.createRadialGradient(mouseX, mouseY, 10, mouseX, mouseY, Math.min(width, height) * 0.6);
    grad.addColorStop(0, "rgba(223, 190, 120, 0.15)");
    grad.addColorStop(0.5, "rgba(88, 101, 242, 0.08)");
    grad.addColorStop(1, "rgba(7, 7, 9, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, Math.min(width, height) * 0.6, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(render);
  };
  render();
}

// ----------------------------------------------------------------------------
// 3. ANALOG FILM GRAIN OVERLAY (High-frequency procedural 35mm grain)
// ----------------------------------------------------------------------------
function initGrainOverlay() {
  let overlay = document.querySelector(".grain-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "grain-overlay";
    overlay.setAttribute("aria-hidden", "true");
    document.body.prepend(overlay);
  }

  try {
    const grainCanvas = document.createElement("canvas");
    grainCanvas.width = 128;
    grainCanvas.height = 128;
    const gCtx = grainCanvas.getContext("2d");
    if (gCtx) {
      const imgData = gCtx.createImageData(128, 128);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const val = Math.floor(Math.random() * 255);
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = Math.floor(Math.random() * 42); // Soft alpha
      }
      gCtx.putImageData(imgData, 0, 0);
      overlay.style.backgroundImage = `url("${grainCanvas.toDataURL("image/png")}")`;
    }
  } catch (_) {}
}

// ----------------------------------------------------------------------------
// 4. TOP SCROLL READING PROGRESS BAR (2.5px glowing gold-indigo gradient)
// ----------------------------------------------------------------------------
function initScrollProgress() {
  let bar = document.getElementById("scrollProgress");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "scrollProgress";
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.prepend(bar);
  }

  let scheduled = false;
  const updateProgress = () => {
    scheduled = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
    bar.style.transform = `scaleX(${progress / 100})`;
  };

  window.addEventListener("scroll", () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  updateProgress();
}

// ----------------------------------------------------------------------------
// 5. CUSTOM MAGNETIC CURSOR & MORPHING FOLLOWER (Sutéra / Uncommon SOTD)
// ----------------------------------------------------------------------------
function initCustomCursor() {
  if (!hasFinePointer()) return;

  let dot = document.getElementById("cursorDot");
  let ring = document.getElementById("cursorRing");
  let label = document.getElementById("cursorLabel");

  if (!dot) {
    dot = document.createElement("div");
    dot.id = "cursorDot";
    dot.className = "cursor-dot";
    dot.setAttribute("aria-hidden", "true");
    document.body.appendChild(dot);
  }

  if (!ring) {
    ring = document.createElement("div");
    ring.id = "cursorRing";
    ring.className = "cursor-ring";
    ring.setAttribute("aria-hidden", "true");
    label = document.createElement("span");
    label.id = "cursorLabel";
    label.className = "cursor-label";
    ring.appendChild(label);
    document.body.appendChild(ring);
  }

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  let magneticTarget = null;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  }, { passive: true });

  const tick = () => {
    if (prefersReducedMotion()) return;

    let targetX = mouseX;
    let targetY = mouseY;

    if (magneticTarget) {
      const rect = magneticTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      targetX = centerX + (mouseX - centerX) * 0.28;
      targetY = centerY + (mouseY - centerY) * 0.28;

      const pullX = (mouseX - centerX) * 0.22;
      const pullY = (mouseY - centerY) * 0.22;
      magneticTarget.style.transform = `translate3d(${pullX}px, ${pullY}px, 0)`;
    }

    ringX += (targetX - ringX) * 0.18;
    ringY += (targetY - ringY) * 0.18;

    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  document.addEventListener("mousedown", () => ring.classList.add("is-pressed"));
  document.addEventListener("mouseup", () => ring.classList.remove("is-pressed"));
  document.addEventListener("mouseleave", () => {
    dot.classList.add("is-hidden");
    ring.classList.add("is-hidden");
  });
  document.addEventListener("mouseenter", () => {
    dot.classList.remove("is-hidden");
    ring.classList.remove("is-hidden");
  });

  // Dynamic context-aware morphing
  document.addEventListener("mouseover", (e) => {
    const target = e.target.closest("a, button, input, .tile, .project-card, .dev-spotlight, .tab, .seg, .sort-btn, .icon-btn, video, [data-native-player]");
    if (!target) {
      ring.className = "cursor-ring";
      label.textContent = "";
      if (magneticTarget) {
        magneticTarget.style.transform = "";
        magneticTarget = null;
      }
      return;
    }

    soundFX.playTick();

    if (target.closest(".tile") || target.closest(".photo-card")) {
      ring.className = "cursor-ring is-pill";
      label.textContent = "VIEW";
    } else if (target.closest(".project-card") || target.closest(".dev-spotlight")) {
      ring.className = "cursor-ring is-pill";
      label.textContent = "EXPLORE ↗";
    } else if (target.closest("video") || target.closest("[data-native-player]")) {
      ring.className = "cursor-ring is-pill";
      label.textContent = "PLAY ▶";
    } else if (target.matches(".btn-pill-solid, .discord-cta, .quick-nav-cta, .tab, .sort-btn, .icon-btn")) {
      ring.className = "cursor-ring is-magnetic";
      label.textContent = "";
      magneticTarget = target;
    } else if (target.matches("a, button")) {
      ring.className = "cursor-ring is-active";
      label.textContent = "";
    } else if (target.matches("input, textarea")) {
      ring.className = "cursor-ring is-text";
      label.textContent = "";
    }
  }, { passive: true });

  document.addEventListener("mouseout", (e) => {
    const target = e.target.closest("a, button, input, .tile, .project-card, .dev-spotlight, .tab, .seg, .sort-btn, .icon-btn, video, [data-native-player]");
    if (target && target === magneticTarget) {
      magneticTarget.style.transform = "";
      magneticTarget = null;
      ring.className = "cursor-ring";
      label.textContent = "";
    }
  }, { passive: true });
}

// ----------------------------------------------------------------------------
// 6. 3D CARD TILT & MULTI-LAYER SPECULAR SHEEN (Apple / Linear / Hubtown SOTD)
// ----------------------------------------------------------------------------
function init3DTiltAndSpecular() {
  if (prefersReducedMotion() || !hasFinePointer()) return;

  const selector = ".project-card, .dev-spotlight, .process-list li, .services-list li, .photo-card, .tile, .case-facts > div, .source-note";

  document.addEventListener("mousemove", (e) => {
    const card = e.target.closest(selector);
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -7.5; // Max 7.5 deg
    const rotateY = ((x - centerX) / centerX) * 7.5;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translate3d(0, -4px, 0)`;
  }, { passive: true });

  document.addEventListener("mouseout", (e) => {
    const card = e.target.closest(selector);
    if (card && (!e.relatedTarget || !card.contains(e.relatedTarget))) {
      card.style.transform = "";
    }
  }, { passive: true });
}

// ----------------------------------------------------------------------------
// 7. HEADER TELEMETRY (Paris Real-Time Clock, Status Beacon, Sound Equalizer)
// ----------------------------------------------------------------------------
function initHeaderTelemetry() {
  const headers = document.querySelectorAll(".site-header");
  headers.forEach((header) => {
    const row = header.querySelector(".header-row");
    if (!row || row.querySelector(".header-meta-strip")) return;

    const strip = document.createElement("div");
    strip.className = "header-meta-strip";

    // Live clock
    const clock = document.createElement("span");
    clock.className = "header-clock";
    clock.setAttribute("aria-label", "Current time in Paris");

    // Status beacon
    const status = document.createElement("span");
    status.className = "header-status-pill";
    status.innerHTML = `<span class="status-beacon" aria-hidden="true"></span><span class="status-label">OPEN FOR COMMISSIONS</span>`;

    // Sound toggle button
    const soundBtn = document.createElement("button");
    soundBtn.type = "button";
    soundBtn.className = "sound-toggle-btn";
    soundBtn.setAttribute("aria-label", "Toggle tactile soundscape");
    soundBtn.innerHTML = `
      <span class="sound-bars" aria-hidden="true">
        <span class="bar bar-1"></span>
        <span class="bar bar-2"></span>
        <span class="bar bar-3"></span>
      </span>
      <span class="sound-label">${soundFX.enabled ? "SOUND: ON" : "SOUND: OFF"}</span>
    `;

    const updateSoundState = () => {
      soundBtn.classList.toggle("is-active", soundFX.enabled);
      const labelEl = soundBtn.querySelector(".sound-label");
      if (labelEl) labelEl.textContent = soundFX.enabled ? "SOUND: ON" : "SOUND: OFF";
    };
    updateSoundState();

    soundBtn.addEventListener("click", () => {
      soundFX.toggle();
      updateSoundState();
    });

    strip.append(status, clock, soundBtn);
    row.appendChild(strip);

    const updateClock = () => {
      try {
        const d = new Date();
        const timeStr = d.toLocaleTimeString("en-GB", { timeZone: "Europe/Paris", hour12: false });
        clock.textContent = `PARIS ${timeStr} UTC+2`;
      } catch (_) {
        clock.textContent = `2026 EDITION`;
      }
    };
    updateClock();
    setInterval(updateClock, 1000);
  });
}

// ----------------------------------------------------------------------------
// 8. KINETIC SCROLL REVEALS & BLUR-UP ENTRANCES
// ----------------------------------------------------------------------------
function initKineticScroll() {
  if (prefersReducedMotion()) return;

  const targets = document.querySelectorAll(`
    .intro-text h1, .intro-text p, .gallery-controls, .results-count,
    .gallery-section-title, .site-section > h2, .site-section > p,
    .project-card, .dev-spotlight, .process h2, .process-list li,
    .contact h2, .contact > p, .services-list li, .faq details,
    .content-page h1, .content-page h2, .content-page article > p,
    .photo-card, .case-deck, .case-facts, .case-chapter
  `);

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -40px 0px", threshold: 0.08 });

  targets.forEach((el, idx) => {
    el.classList.add("reveal-on-scroll");
    el.style.setProperty("--stagger", `${(idx % 6) * 0.07}s`);
    observer.observe(el);
  });
}

// ----------------------------------------------------------------------------
// 9. KEYBOARD COMMAND PALETTE SHORTCUTS ([CMD+K], [S], [ESC])
// ----------------------------------------------------------------------------
function initKeyboardShortcuts() {
  window.addEventListener("keydown", (e) => {
    const isInput = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);

    if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !isInput)) {
      const search = document.getElementById("searchInput");
      if (search) {
        e.preventDefault();
        search.focus();
        search.select();
        soundFX.playClick();
      }
    } else if (e.key === "s" && !isInput && !e.metaKey && !e.ctrlKey) {
      soundFX.toggle();
      const soundBtn = document.querySelector(".sound-toggle-btn");
      if (soundBtn) {
        soundBtn.classList.toggle("is-active", soundFX.enabled);
        const labelEl = soundBtn.querySelector(".sound-label");
        if (labelEl) labelEl.textContent = soundFX.enabled ? "SOUND: ON" : "SOUND: OFF";
      }
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest("button, a, .tab, .seg, .sort-btn, .icon-btn")) {
      soundFX.playClick();
    }
  }, { passive: true });
}

// ----------------------------------------------------------------------------
// MAIN ENGINE INITIALIZATION
// ----------------------------------------------------------------------------
export function initLuxuryFX() {
  if (typeof window === "undefined") return;

  const run = () => {
    initWebGLShader();
    initGrainOverlay();
    initScrollProgress();
    initCustomCursor();
    init3DTiltAndSpecular();
    initHeaderTelemetry();
    initKineticScroll();
    initKeyboardShortcuts();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
}
