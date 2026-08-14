export const NOOR_FACE_VERTEX = /* glsl */ `
  uniform float uConsolidation;
  uniform float uRelease;
  uniform vec3 uViseme;
  uniform float uBlink;
  uniform vec2 uPointer;

  attribute vec4 aRig;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vBase;

  vec3 rotateX(vec3 point, vec3 pivot, float angle) {
    float sine = sin(angle);
    float cosine = cos(angle);
    vec3 relative = point - pivot;
    relative.yz = mat2(cosine, -sine, sine, cosine) * relative.yz;
    return relative + pivot;
  }

  void main() {
    vec3 base = position;
    vec3 pos = base;
    vec3 deformedNormal = normal;
    float upperLip = aRig.r;
    float lowerLip = aRig.g;
    float jawWeight = aRig.b;
    float eyelid = aRig.a;

    vec3 viseme = max(uViseme, vec3(0.0));
    viseme /= max(1.0, viseme.x + viseme.y + viseme.z);
    float A = viseme.x;
    float O = viseme.y;
    float M = viseme.z;
    float theta = 0.105 * A + 0.045 * O;
    pos = mix(pos, rotateX(pos, vec3(0.0, 0.055, 0.08), -theta), jawWeight);
    deformedNormal = mix(
      deformedNormal,
      rotateX(deformedNormal, vec3(0.0), -theta),
      jawWeight
    );
    float lipWeight = max(upperLip, lowerLip);
    vec3 mouthCenter = vec3(0.000668, -0.010513, 0.598307);
    float corner = smoothstep(0.065, 0.145, abs(base.x - mouthCenter.x)) * lipWeight;
    float xScale = 1.0 + 0.055 * A - 0.28 * O - 0.035 * M;
    pos.x += lipWeight * (
      mouthCenter.x + (pos.x - mouthCenter.x) * xScale - pos.x
    );
    pos.y += upperLip * (0.006*A + 0.007*O - 0.008*M);
    pos.y += lowerLip * (-0.004*A - 0.010*O + 0.008*M);
    pos.z += lipWeight * (0.002*A + (0.014 + 0.006*corner)*O + 0.007*M);
    pos.y = mix(pos.y, 0.38 + (pos.y - 0.38) * 0.14, eyelid * uBlink);

    float field = sin(base.x * 19.0 + base.y * 27.0 + base.z * 13.0);
    float cohesion = min(uConsolidation, 1.0 - uRelease);
    float unresolved = 1.0 - smoothstep(0.12, 0.74, cohesion);
    pos += deformedNormal * field * unresolved * 0.024;
    pos.x += uPointer.x * 0.012;
    pos.y += uPointer.y * 0.008;

    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vNormal = normalize(normalMatrix * deformedNormal);
    vViewPosition = viewPosition.xyz;
    vBase = base;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

export const NOOR_FEATURE_VERTEX = /* glsl */ `
  uniform vec3 uViseme;
  uniform float uBlink;
  uniform float uIsEye;
  uniform float uIsMouth;
  varying vec3 vFeatureBase;

  vec3 rotateX(vec3 point, vec3 pivot, float angle) {
    float sine = sin(angle);
    float cosine = cos(angle);
    vec3 relative = point - pivot;
    relative.yz = mat2(cosine, -sine, sine, cosine) * relative.yz;
    return relative + pivot;
  }

  void main() {
    vec3 pos = position;
    vFeatureBase = position;
    if (uIsEye > 0.5) {
      pos.y = mix(pos.y, 0.38 + (pos.y - 0.38) * 0.12, uBlink);
    }
    if (uIsMouth > 0.5) {
      vec3 viseme = max(uViseme, vec3(0.0));
      viseme /= max(1.0, viseme.x + viseme.y + viseme.z);
      float A = viseme.x;
      float O = viseme.y;
      float M = viseme.z;
      float jawWeight = 1.0 - smoothstep(-0.012, 0.012, pos.y);
      float theta = 0.105 * A + 0.045 * O;
      pos = mix(
        pos,
        rotateX(pos, vec3(0.0, 0.055, 0.08), -theta),
        jawWeight
      );
      vec3 mouthCenter = vec3(0.000668, -0.010513, 0.598307);
      float front = smoothstep(0.48, 0.59, pos.z);
      float xScale = 1.0 + 0.055 * A - 0.28 * O - 0.035 * M;
      pos.x += front * (
        mouthCenter.x + (pos.x - mouthCenter.x) * xScale - pos.x
      );
      pos.z += front * (0.002*A + 0.014*O + 0.007*M);
    }
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const NOOR_FACE_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform float uConsolidation;
  uniform float uRelease;
  uniform float uMeshOpacity;
  uniform vec3 uPaper;
  uniform vec3 uInk;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vBase;

  float hash21(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(-vViewPosition);
    vec3 keyDirection = normalize(vec3(-0.46, 0.58, 0.76));
    float diffuse = max(dot(normal, keyDirection), 0.0);
    float facing = max(dot(normal, viewDirection), 0.0);
    float rim = pow(1.0 - facing, 1.75);
    float cohesion = min(uConsolidation, 1.0 - uRelease);
    float form = smoothstep(0.24, 0.86, cohesion);

    vec2 anchoredCell = floor(
      (vBase.xy + vBase.z * vec2(0.24, -0.15)) * mix(36.0, 82.0, form)
    );
    float grain = hash21(anchoredCell);
    float tone = diffuse * 0.91 - rim * 0.27 + 0.015;
    float threshold = mix(0.57, 0.43, form) + (grain - 0.5) * mix(0.26, 0.09, form);
    float inkField = 1.0 - smoothstep(threshold - 0.095, threshold + 0.095, tone);
    float contour = smoothstep(0.15, 0.72, rim) * 0.48;
    float depthBand = exp(-abs(vBase.z - 0.55) * 8.0);
    float eyeBand = exp(-abs(vBase.y - 0.38) * 20.0);
    float mouthBand =
      exp(-abs(vBase.y + 0.0105) * 40.0) *
      exp(-abs(vBase.x) * 9.0) *
      smoothstep(0.5, 0.6, vBase.z);
    float featureBand = depthBand * eyeBand * 0.035 + mouthBand * 0.055;
    float inkAmount = clamp(inkField + contour + featureBand, 0.0, 1.0);
    vec3 color = mix(uPaper, uInk, inkAmount);

    float island = clamp(
      0.5 +
      sin(vBase.x * 17.0 + vBase.y * 11.0 + vBase.z * 7.0) * 0.2 +
      sin(vBase.y * 25.0 - vBase.z * 13.0) * 0.15 +
      sin((vBase.x - vBase.z) * 37.0 + vBase.y * 5.0) * 0.08 +
      (grain - 0.5) * 0.09,
      0.0,
      1.0
    );
    float surface = smoothstep(0.12, 0.76, cohesion);
    float surfaceGate = smoothstep(0.2, 0.3, cohesion);
    float reveal =
      surfaceGate * smoothstep(island - 0.16, island + 0.11, surface);
    if (reveal < 0.012) discard;
    gl_FragColor = vec4(color, uMeshOpacity * reveal);
    #include <colorspace_fragment>
  }
`;

export const NOOR_POINTS_VERTEX = /* glsl */ `
  uniform float uConsolidation;
  uniform float uRelease;
  uniform float uPixelRatio;
  attribute float aRandom;
  attribute float aArrival;
  attribute float aSize;
  attribute vec3 aOrigin;
  attribute vec3 aControl;
  varying float vAlpha;
  varying float vRandom;

  void main() {
    vec3 target = position;
    float cohesion = min(uConsolidation, 1.0 - uRelease);
    float arrival = smoothstep(aArrival, min(aArrival + 0.22, 1.0), cohesion);
    vec3 originToControl = mix(aOrigin, aControl, arrival);
    vec3 controlToTarget = mix(aControl, target, arrival);
    vec3 pos = mix(originToControl, controlToTarget, arrival);

    vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize =
      (1.4 + aSize * 1.9) * uPixelRatio *
      (3.8 / max(-viewPosition.z, 0.001));
    gl_Position = projectionMatrix * viewPosition;
    vAlpha =
      (1.0 - smoothstep(0.72, 1.0, arrival)) *
      mix(0.46, 0.9, aRandom);
    vRandom = aRandom;
  }
`;

export const NOOR_POINTS_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform vec3 uInk;
  varying float vAlpha;
  varying float vRandom;

  void main() {
    vec2 point = gl_PointCoord - 0.5;
    float distanceFromCenter = length(point);
    if (distanceFromCenter > 0.5) discard;
    float alpha = smoothstep(0.5, 0.12, distanceFromCenter) * vAlpha;
    gl_FragColor = vec4(uInk, alpha * mix(0.55, 1.0, vRandom));
    #include <colorspace_fragment>
  }
`;
