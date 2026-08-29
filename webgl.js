(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("gl");
  if (!canvas || reduce) {
    if (canvas) canvas.remove();
    return;
  }

  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: true,
    stencil: false,
    powerPreference: "high-performance",
  });
  if (!gl) {
    canvas.remove();
    return;
  }

  const vs = `
    attribute vec3 aPos;
    attribute vec3 aOff;
    attribute float aScale;
    attribute vec3 aCol;
    uniform mat4 uProj;
    uniform mat4 uView;
    uniform float uTime;
    uniform vec2 uMouse;
    varying vec3 vCol;
    varying float vFog;
    void main() {
      vec3 p = aPos * aScale;
      float t = uTime * 0.18 + aOff.x * 0.2;
      vec3 world = aOff;
      world.y += sin(t + aOff.z) * 0.35;
      world.x += cos(t * 0.7) * 0.12;
      vec2 m = uMouse * 3.2;
      world.xy += (world.xy - m) * 0.04;
      vec4 mv = uView * vec4(p + world, 1.0);
      gl_Position = uProj * mv;
      vFog = clamp((-mv.z - 4.0) / 18.0, 0.0, 1.0);
      float lit = 0.55 + 0.45 * aPos.y;
      vCol = aCol * lit;
    }
  `;

  const fs = `
    precision mediump float;
    varying vec3 vCol;
    varying float vFog;
    void main() {
      vec3 fog = vec3(0.043, 0.043, 0.039);
      gl_FragColor = vec4(mix(vCol, fog, vFog), 0.72);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  const prog = gl.createProgram();
  const vsh = compile(gl.VERTEX_SHADER, vs);
  const fsh = compile(gl.FRAGMENT_SHADER, fs);
  if (!vsh || !fsh) { canvas.remove(); return; }
  gl.attachShader(prog, vsh);
  gl.attachShader(prog, fsh);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
  gl.useProgram(prog);

  const cube = new Float32Array([
    -1,-1, 1,  1,-1, 1,  1, 1, 1, -1,-1, 1,  1, 1, 1, -1, 1, 1,
    -1,-1,-1, -1, 1,-1,  1, 1,-1, -1,-1,-1,  1, 1,-1,  1,-1,-1,
    -1, 1,-1, -1, 1, 1,  1, 1, 1, -1, 1,-1,  1, 1, 1,  1, 1,-1,
    -1,-1,-1,  1,-1,-1,  1,-1, 1, -1,-1,-1,  1,-1, 1, -1,-1, 1,
     1,-1,-1,  1, 1,-1,  1, 1, 1,  1,-1,-1,  1, 1, 1,  1,-1, 1,
    -1,-1,-1, -1,-1, 1, -1, 1, 1, -1,-1,-1, -1, 1, 1, -1, 1,-1,
  ]);

  const posBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.bufferData(gl.ARRAY_BUFFER, cube, gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

  const COUNT = window.innerWidth < 800 ? 180 : 520;
  const off = new Float32Array(COUNT * 3);
  const sca = new Float32Array(COUNT);
  const col = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    off[i * 3] = (Math.random() - 0.5) * 16;
    off[i * 3 + 1] = (Math.random() - 0.5) * 9;
    off[i * 3 + 2] = -2 - Math.random() * 16;
    sca[i] = 0.04 + Math.random() * 0.09;
    const g = 0.72 + Math.random() * 0.28;
    col[i * 3] = g * 0.95;
    col[i * 3 + 1] = g * 0.92;
    col[i * 3 + 2] = g * 0.84;
  }

  function inst(name, data, size) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    const ext = gl.getExtension("ANGLE_instanced_arrays");
    if (!ext) return null;
    ext.vertexAttribDivisorANGLE(loc, 1);
    return ext;
  }

  const ext = inst("aOff", off, 3);
  if (!ext) { canvas.remove(); return; }
  inst("aScale", sca, 1);
  inst("aCol", col, 3);

  const uProj = gl.getUniformLocation(prog, "uProj");
  const uView = gl.getUniformLocation(prog, "uView");
  const uTime = gl.getUniformLocation(prog, "uTime");
  const uMouse = gl.getUniformLocation(prog, "uMouse");

  function perspective(out, fovy, aspect, near, far) {
    const f = 1.0 / Math.tan(fovy / 2);
    out.fill(0);
    out[0] = f / aspect;
    out[5] = f;
    out[10] = (far + near) / (near - far);
    out[11] = -1;
    out[14] = (2 * far * near) / (near - far);
  }
  function lookAt(out, eye) {
    out.fill(0);
    out[0] = 1; out[5] = 1; out[10] = 1; out[15] = 1;
    out[12] = -eye[0];
    out[13] = -eye[1];
    out[14] = -eye[2];
  }

  const proj = new Float32Array(16);
  const view = new Float32Array(16);
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const eye = [0, 0, 6];

  window.addEventListener("pointermove", (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
  }, { passive: true });

  let w = 0, h = 0, running = true;
  const hero = document.getElementById("hero");
  if (hero && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      running = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    io.observe(hero);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    perspective(proj, 0.9, canvas.width / canvas.height, 0.1, 40);
  }
  resize();
  window.addEventListener("resize", resize);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const t0 = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    if (!running) return;
    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;
    const t = (now - t0) / 1000;
    eye[0] = mouse.x * 0.8;
    eye[1] = mouse.y * 0.45;
    lookAt(view, eye);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(uProj, false, proj);
    gl.uniformMatrix4fv(uView, false, view);
    gl.uniform1f(uTime, t);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    ext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 36, COUNT);
  }
  requestAnimationFrame(frame);
})();
