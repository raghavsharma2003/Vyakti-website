export const INK_FACE_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uLocal;
  uniform float uJawOpen;
  uniform float uLipRound;
  uniform float uLipPress;
  uniform float uSeed;
  uniform vec2 uPointer;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vBase;
  varying float vSpeech;

  void main() {
    vec3 base = position;
    vec3 pos = base;

    vec3 mouthDelta = base - vec3(-0.004, -0.058, 0.62);
    float lipMask = exp(-(
      mouthDelta.x * mouthDelta.x * 52.0 +
      mouthDelta.y * mouthDelta.y * 560.0 +
      mouthDelta.z * mouthDelta.z * 190.0
    )) * smoothstep(0.54, 0.60, base.z);
    float lowerLip = lipMask * (1.0 - smoothstep(-0.065, -0.048, base.y));
    float upperLip = lipMask * smoothstep(-0.065, -0.048, base.y);
    float jaw = uJawOpen * (1.0 - uLipPress * 0.72);
    pos.y -= lowerLip * jaw * 0.11;
    pos.y += upperLip * jaw * 0.022;
    pos.z -= lowerLip * jaw * 0.012;
    pos.x = mix(pos.x, pos.x * 0.76, lipMask * uLipRound);
    pos.y = mix(pos.y, -0.058 + (pos.y + 0.058) * 0.48, lipMask * uLipPress);

    float assemble = smoothstep(0.0, 0.22, uLocal);
    float leave = smoothstep(0.82, 1.0, uLocal);
    float field = sin(base.x * 17.0 + base.y * 23.0 + base.z * 13.0 + uSeed * 4.7);
    vec3 direction = normalize(base + vec3(field * 0.25, 0.08, field * 0.16));
    pos += direction * (1.0 - assemble) * (0.38 + abs(field) * 0.3);
    pos += normal * leave * field * 0.24;
    pos.x += uPointer.x * 0.014;
    pos.y += uPointer.y * 0.009;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewPosition = mvPosition.xyz;
    vBase = base;
    vSpeech = lipMask * max(jaw, max(uLipRound, uLipPress));
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const INK_FACE_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform float uOpacity;
  uniform float uInkBias;
  uniform float uDotScale;
  uniform vec3 uPaper;
  uniform vec3 uInk;
  uniform vec3 uAccent;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vBase;
  varying float vSpeech;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(-vViewPosition);
    vec3 keyDirection = normalize(vec3(-0.48, 0.62, 0.72));
    float diffuse = max(dot(normal, keyDirection), 0.0);
    float facing = max(dot(normal, viewDirection), 0.0);
    float rim = pow(1.0 - facing, 1.65);
    float tone = diffuse * 0.94 - rim * 0.3 + uInkBias;

    vec2 cell = (vBase.xy + vBase.z * vec2(0.23, -0.17)) * (54.0 + uDotScale * 22.0);
    float screen = sin(cell.x * 1.34) * sin(cell.y * 1.34);
    float grain = fract(sin(dot(floor(vBase.xy * 180.0), vec2(12.9898, 78.233))) * 43758.5453);
    float threshold = 0.42 + screen * 0.14 + (grain - 0.5) * 0.08;
    float blackField = 1.0 - smoothstep(threshold - 0.11, threshold + 0.11, tone);
    float contour = smoothstep(0.12, 0.72, rim);
    float facialDetail = exp(-abs(vBase.z - 0.51) * 9.0) *
      (exp(-abs(vBase.y - 0.39) * 18.0) + exp(-abs(vBase.y + 0.025) * 24.0));
    float inkAmount = clamp(blackField + contour * 0.42 + facialDetail * 0.06, 0.0, 1.0);
    vec3 color = mix(uPaper, uInk, inkAmount);
    float mouthAperture = exp(-(
      vBase.x * vBase.x * 64.0 +
      (vBase.y + 0.058) * (vBase.y + 0.058) * 620.0 +
      (vBase.z - 0.62) * (vBase.z - 0.62) * 165.0
    )) * smoothstep(0.025, 0.16, vSpeech);
    color = mix(color, uInk, mouthAperture);

    gl_FragColor = vec4(color, uOpacity);
    #include <colorspace_fragment>
  }
`;

export const INK_POINTS_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uLocal;
  uniform float uOpacity;
  uniform float uPixelRatio;
  uniform float uSeed;
  attribute float aRandom;
  attribute vec3 aDirection;
  varying float vOpacity;
  varying float vRandom;

  void main() {
    vec3 base = position;
    vec3 pos = base;
    float assemble = smoothstep(0.0, 0.24, uLocal);
    float leave = smoothstep(0.8, 1.0, uLocal);
    float pulse = sin(uTime * 1.8 + aRandom * 8.0 + uSeed * 2.0);
    pos += aDirection * (1.0 - assemble) * (0.34 + aRandom * 0.78);
    pos += aDirection * leave * (0.2 + aRandom * 0.44);
    pos += normal * pulse * 0.006;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (2.1 + aRandom * 2.8) * uPixelRatio / max(-mvPosition.z, 0.001);
    gl_Position = projectionMatrix * mvPosition;
    vOpacity = uOpacity;
    vRandom = aRandom;
  }
`;

export const INK_POINTS_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform vec3 uInk;
  uniform vec3 uAccent;
  varying float vOpacity;
  varying float vRandom;

  void main() {
    vec2 point = gl_PointCoord - 0.5;
    if (length(point) > 0.5) discard;
    vec3 color = uInk;
    float alpha = smoothstep(0.5, 0.12, length(point)) * vOpacity;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`;
