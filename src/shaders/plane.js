export const planeVert = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
uniform vec2 uMouse;
void main() {
  vUv = uv;
  vec3 p = position;
  float wave = sin((uv.x + uv.y) * 6.0 + uTime * 0.6) * 0.035;
  p.z += wave;
  p.x += (uMouse.x) * 0.08 * (uv.y - 0.5);
  p.y += (uMouse.y) * 0.06 * (uv.x - 0.5);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

export const planeFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uMap;
uniform float uFocus;
uniform vec2 uMouse;
void main() {
  vec2 uv = vUv;
  vec2 m = (uMouse * 0.5 + 0.5);
  uv += (m - 0.5) * 0.018 * uFocus;
  float aberr = 0.0028 * uFocus;
  float r = texture2D(uMap, uv + vec2(aberr, 0.0)).r;
  float g = texture2D(uMap, uv).g;
  float b = texture2D(uMap, uv - vec2(aberr, 0.0)).b;
  vec3 col = vec3(r, g, b);
  float vign = smoothstep(0.95, 0.35, distance(uv, vec2(0.5)));
  col *= mix(0.72, 1.0, vign);
  float fade = smoothstep(0.0, 0.18, uFocus) * smoothstep(1.0, 0.82, uFocus);
  gl_FragColor = vec4(col, fade);
}
`;
