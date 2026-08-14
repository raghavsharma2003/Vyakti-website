export const LAB_FACE_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uLocal;
  uniform float uMouthOpen;
  uniform float uLayer;
  uniform float uExplode;
  uniform vec2 uPointer;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vBase;
  varying float vSpeech;
  varying float vLayer;
  varying vec2 vUv;

  void main() {
    vec3 base = position;
    vec3 pos = base;

    vec3 mouthDelta = base - vec3(0.0, -0.025, 0.515);
    float lipMask = exp(-(
      mouthDelta.x * mouthDelta.x * 48.0 +
      mouthDelta.y * mouthDelta.y * 520.0 +
      mouthDelta.z * mouthDelta.z * 180.0
    )) * smoothstep(0.40, 0.49, base.z);
    float jawMask =
      (1.0 - smoothstep(0.00, 0.09, base.y)) *
      smoothstep(-0.70, -0.42, base.y) *
      smoothstep(-0.02, 0.30, base.z) *
      (1.0 - smoothstep(0.54, 0.76, abs(base.x)));
    float angle = uMouthOpen * 0.12;
    vec2 hinge = vec2(0.18, 0.34);
    vec2 jaw = pos.yz - hinge;
    float c = cos(angle);
    float s = sin(angle);
    vec2 rotated = vec2(c * jaw.x - s * jaw.y, s * jaw.x + c * jaw.y) + hinge;
    pos.yz = mix(pos.yz, rotated, jawMask);
    float lowerLip = lipMask * (1.0 - smoothstep(-0.025, 0.02, base.y));
    float upperLip = lipMask * smoothstep(-0.025, 0.02, base.y);
    pos.y -= lowerLip * uMouthOpen * 0.046;
    pos.y += upperLip * uMouthOpen * 0.016;
    pos.z -= lowerLip * uMouthOpen * 0.008;

    float formation = smoothstep(0.0, 0.24, uLocal);
    float exitScatter = smoothstep(0.82, 1.0, uLocal);
    float noise = sin(base.x * 19.0 + base.y * 13.0 + base.z * 23.0 + uTime * 0.9);
    vec3 direction = normalize(base + vec3(noise * 0.2, -0.08, noise * 0.16));
    pos += direction * (1.0 - formation) * uExplode * (0.34 + abs(noise) * 0.28);
    pos += normal * exitScatter * uExplode * noise * 0.18;

    float membrane = sin((base.x + base.y * 0.42) * 18.0 + uLayer * 2.4);
    pos += normal * membrane * uLayer * 0.006;
    pos.x += uPointer.x * 0.018;
    pos.y += uPointer.y * 0.012;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewPosition = mvPosition.xyz;
    vBase = base;
    vSpeech = lipMask * uMouthOpen;
    vLayer = uLayer;
    vUv = uv;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const LAB_FACE_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform float uOpacity;
  uniform float uStyle;
  uniform vec3 uBaseColor;
  uniform vec3 uShadowColor;
  uniform vec3 uAccent;
  uniform sampler2D uTopology;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vBase;
  varying float vSpeech;
  varying float vLayer;
  varying vec2 vUv;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(-vViewPosition);
    vec3 keyDirection = normalize(vec3(-0.34, 0.63, 0.75));
    float diffuse = max(dot(normal, keyDirection), 0.0);
    float facing = max(dot(normal, viewDirection), 0.0);
    float rim = pow(1.0 - facing, 2.2);
    float light = smoothstep(0.02, 0.94, 0.12 + diffuse * 0.88);
    vec3 color = mix(uShadowColor, uBaseColor, light);
    float topology = smoothstep(0.16, 0.74, 1.0 - texture2D(uTopology, vUv).r);

    if (uStyle < 0.5) {
      color = mix(color, vec3(0.17), topology * 0.14);
      float lip = exp(-(vBase.x * vBase.x * 46.0 + (vBase.y + 0.025) * (vBase.y + 0.025) * 540.0));
      color = mix(color, vec3(0.49, 0.28, 0.27), lip * 0.24);
    } else if (uStyle < 1.5) {
      float bands = smoothstep(0.46, 0.54, 0.5 + 0.5 * sin(vUv.y * 145.0 + vUv.x * 34.0));
      color = mix(vec3(0.11), vec3(0.88), bands * 0.88);
      color = mix(color, uAccent, vSpeech * 0.42);
    } else if (uStyle < 2.5) {
      color = mix(vec3(0.20), vec3(0.015), light);
      color += uAccent * vSpeech * 0.32;
    } else if (uStyle < 3.5) {
      color = mix(vec3(0.70, 0.76, 0.80), vec3(0.96, 0.98, 0.99), light);
      color += vec3(0.20, 0.25, 0.31) * rim * 0.28;
      color = mix(color, uAccent, vSpeech * 0.18);
    } else {
      float threshold = smoothstep(0.38, 0.62, light + topology * 0.2);
      color = mix(vec3(0.03), vec3(0.965), threshold);
      color = mix(color, uAccent, vSpeech * 0.48);
    }

    color += uBaseColor * rim * (uStyle > 2.5 && uStyle < 3.5 ? 0.18 : 0.06);
    float alpha = uOpacity;
    if (uStyle > 2.5 && uStyle < 3.5) alpha *= 0.54 + facing * 0.46;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`;

export const LAB_POINTS_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uLocal;
  uniform float uOpacity;
  uniform float uPointSize;
  uniform float uPixelRatio;
  uniform float uExplode;
  uniform float uStyle;
  uniform vec2 uPointer;

  attribute float aRandom;
  attribute vec3 aDirection;

  varying float vRandom;
  varying float vOpacity;
  varying float vSpeech;

  void main() {
    vec3 base = position;
    vec3 pos = base;
    float formation = smoothstep(0.0, 0.26, uLocal);
    float exitScatter = smoothstep(0.82, 1.0, uLocal);
    float wave = sin(length(base.xy) * 25.0 - uTime * 4.0 + aRandom * 4.0);
    pos += aDirection * (1.0 - formation) * uExplode * (0.42 + aRandom * 0.68);
    pos += aDirection * exitScatter * uExplode * 0.34;
    pos += normal * wave * 0.008;
    pos.x += uPointer.x * 0.022;
    pos.y += uPointer.y * 0.015;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float distanceToCamera = -mvPosition.z;
    gl_PointSize = uPointSize * uPixelRatio * (0.54 + aRandom * 0.84);
    gl_PointSize *= 1.0 / max(distanceToCamera, 0.001);
    gl_Position = projectionMatrix * mvPosition;
    vRandom = aRandom;
    vOpacity = uOpacity;
    vSpeech = exp(-length(base - vec3(0.0, -0.025, 0.515)) * 7.0) * abs(wave);
  }
`;

export const LAB_POINTS_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform float uStyle;
  uniform vec3 uBaseColor;
  uniform vec3 uAccent;
  varying float vRandom;
  varying float vOpacity;
  varying float vSpeech;

  void main() {
    vec2 point = gl_PointCoord - 0.5;
    float distanceFromCenter = length(point);
    if (distanceFromCenter > 0.5) discard;
    float alpha = smoothstep(0.5, 0.08, distanceFromCenter) * vOpacity;
    vec3 color = uBaseColor;
    color = mix(color, uAccent, smoothstep(0.84, 1.0, vSpeech) * 0.58);
    color = mix(color, vec3(0.80), vRandom * (uStyle > 2.5 ? 0.2 : 0.08));
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`;
