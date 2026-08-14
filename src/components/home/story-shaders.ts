export const STORY_FACE_VERTEX = /* glsl */ `
  uniform float uIdentityMix;
  uniform float uCohesion;
  uniform vec3 uViseme;
  uniform float uBlink;
  uniform vec2 uPointer;

  attribute vec3 aMeeraPosition;
  attribute vec3 aMeeraNormal;
  attribute vec4 aRig;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vBase;
  varying float vIdentityMix;

  vec3 rotateX(vec3 point, vec3 pivot, float angle) {
    float sine = sin(angle);
    float cosine = cos(angle);
    vec3 relative = point - pivot;
    relative.yz = mat2(cosine, -sine, sine, cosine) * relative.yz;
    return relative + pivot;
  }

  void main() {
    vec3 base = mix(position, aMeeraPosition, uIdentityMix);
    vec3 pos = base;
    vec3 deformedNormal = normalize(mix(normal, aMeeraNormal, uIdentityMix));
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

    float unresolved = 1.0 - smoothstep(0.12, 0.74, uCohesion);
    float field =
      sin(base.x * 19.0 + base.y * 27.0 + base.z * 13.0) * 0.62 +
      sin(base.y * 11.0 - base.z * 21.0) * 0.38;
    pos += deformedNormal * field * unresolved * 0.021;
    pos.x += uPointer.x * 0.012;
    pos.y += uPointer.y * 0.008;

    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vNormal = normalize(normalMatrix * deformedNormal);
    vViewPosition = viewPosition.xyz;
    vBase = base;
    vIdentityMix = uIdentityMix;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

export const STORY_FACE_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform float uCohesion;
  uniform float uMeshOpacity;
  uniform vec3 uPaper;
  uniform vec3 uMeeraPaper;
  uniform vec3 uInk;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vBase;
  varying float vIdentityMix;

  float hash21(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(-vViewPosition);
    vec3 keyDirection = normalize(mix(
      vec3(-0.46, 0.58, 0.76),
      vec3(-0.13, 0.55, 0.98),
      vIdentityMix
    ));
    float diffuse = max(dot(normal, keyDirection), 0.0);
    float facing = max(dot(normal, viewDirection), 0.0);
    float rim = pow(1.0 - facing, 1.72);
    float form = smoothstep(0.24, 0.86, uCohesion);

    vec2 anchoredCell = floor(
      (vBase.xy + vBase.z * vec2(0.24, -0.15)) * mix(36.0, 84.0, form)
    );
    float grain = hash21(anchoredCell);
    float tone =
      diffuse * mix(0.92, 1.06, vIdentityMix) -
      rim * mix(0.27, 0.16, vIdentityMix) +
      0.012;
    float resolvedThreshold = mix(0.43, 0.405, vIdentityMix);
    float threshold =
      mix(0.57, resolvedThreshold, form) +
      (grain - 0.5) * mix(0.26, mix(0.085, 0.07, vIdentityMix), form);
    float inkField = 1.0 - smoothstep(threshold - 0.09, threshold + 0.09, tone);
    float contour =
      smoothstep(0.15, 0.72, rim) * mix(0.48, 0.34, vIdentityMix);
    float mouthBand =
      exp(-abs(vBase.y + 0.0105) * 40.0) *
      exp(-abs(vBase.x) * 9.0) *
      smoothstep(0.5, 0.6, vBase.z);
    float inkAmount = clamp(
      inkField + contour + mouthBand * mix(0.052, 0.045, vIdentityMix),
      0.0,
      1.0
    );
    vec3 paper = mix(uPaper, uMeeraPaper, vIdentityMix);
    vec3 color = mix(paper, uInk, inkAmount);

    float island = clamp(
      0.5 +
      sin(vBase.x * 17.0 + vBase.y * 11.0 + vBase.z * 7.0) * 0.2 +
      sin(vBase.y * 25.0 - vBase.z * 13.0) * 0.15 +
      sin((vBase.x - vBase.z) * 37.0 + vBase.y * 5.0) * 0.08 +
      (grain - 0.5) * 0.09,
      0.0,
      1.0
    );
    float surface = smoothstep(0.12, 0.76, uCohesion);
    float surfaceGate = smoothstep(0.2, 0.3, uCohesion);
    float reveal = surfaceGate * smoothstep(island - 0.16, island + 0.11, surface);
    if (reveal < 0.012) discard;
    gl_FragColor = vec4(color, uMeshOpacity * reveal);
    #include <colorspace_fragment>
  }
`;

export const STORY_FEATURE_VERTEX = /* glsl */ `
  uniform float uIdentityMix;
  uniform vec3 uViseme;
  uniform float uBlink;
  uniform float uIsEye;
  uniform float uIsMouth;
  attribute vec3 aMeeraPosition;
  varying vec3 vFeatureBase;

  vec3 rotateX(vec3 point, vec3 pivot, float angle) {
    float sine = sin(angle);
    float cosine = cos(angle);
    vec3 relative = point - pivot;
    relative.yz = mat2(cosine, -sine, sine, cosine) * relative.yz;
    return relative + pivot;
  }

  void main() {
    vec3 pos = mix(position, aMeeraPosition, uIdentityMix);
    vFeatureBase = pos;
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
      pos = mix(pos, rotateX(pos, vec3(0.0, 0.055, 0.08), -theta), jawWeight);
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

export const STORY_FEATURE_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uIsTeeth;
  uniform float uIsSocket;
  uniform vec3 uViseme;
  varying vec3 vFeatureBase;

  void main() {
    float alpha = uOpacity;
    if (uIsSocket > 0.5) {
      float A = uViseme.x;
      float O = uViseme.y;
      float openness = clamp(A + O * 0.82, 0.0, 1.0);
      float halfWidth = max(0.07, 0.112 + A * 0.045 - O * 0.025);
      float halfHeight = 0.006 + A * 0.052 + O * 0.038;
      vec2 aperture = vec2(
        (vFeatureBase.x - 0.000668) / halfWidth,
        (vFeatureBase.y + 0.010513) / halfHeight
      );
      alpha *=
        (1.0 - smoothstep(0.86, 1.03, length(aperture))) *
        smoothstep(0.08, 0.26, openness);
    }
    if (uIsTeeth > 0.5) {
      float openness = clamp(uViseme.x + uViseme.y * 0.82, 0.0, 1.0);
      float upperTeeth = smoothstep(0.002, 0.024, vFeatureBase.y);
      float frontTeeth = smoothstep(0.52, 0.59, vFeatureBase.z);
      alpha *= upperTeeth * frontTeeth * smoothstep(0.3, 0.64, openness) * 0.72;
    }
    if (alpha < 0.012) discard;
    gl_FragColor = vec4(uColor, alpha);
    #include <colorspace_fragment>
  }
`;

export const STORY_POINTS_VERTEX = /* glsl */ `
  uniform float uMaleCohesion;
  uniform float uMeeraCohesion;
  uniform float uIdentityMix;
  uniform float uPixelRatio;

  attribute float aRandom;
  attribute float aArrival;
  attribute float aSize;
  attribute vec3 aOrigin;
  attribute vec3 aMaleControl;
  attribute vec3 aMeeraControl;
  attribute vec3 aMeeraTarget;

  varying float vAlpha;
  varying float vRandom;

  void main() {
    float maleArrival = smoothstep(
      aArrival,
      min(aArrival + 0.22, 1.0),
      uMaleCohesion
    );
    float meeraArrival = smoothstep(
      aArrival,
      min(aArrival + 0.22, 1.0),
      uMeeraCohesion
    );

    vec3 maleA = mix(aOrigin, aMaleControl, maleArrival);
    vec3 maleB = mix(aMaleControl, position, maleArrival);
    vec3 malePath = mix(maleA, maleB, maleArrival);

    vec3 meeraA = mix(aOrigin, aMeeraControl, meeraArrival);
    vec3 meeraB = mix(aMeeraControl, aMeeraTarget, meeraArrival);
    vec3 meeraPath = mix(meeraA, meeraB, meeraArrival);

    vec3 pos = mix(malePath, meeraPath, uIdentityMix);
    float arrival = mix(maleArrival, meeraArrival, uIdentityMix);
    vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize =
      (1.35 + aSize * 1.85) * uPixelRatio *
      (3.8 / max(-viewPosition.z, 0.001));
    gl_Position = projectionMatrix * viewPosition;
    vAlpha =
      (1.0 - smoothstep(0.72, 1.0, arrival)) *
      mix(0.46, 0.9, aRandom);
    vRandom = aRandom;
  }
`;

export const STORY_POINTS_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform vec3 uInk;
  uniform vec3 uSignal;
  varying float vAlpha;
  varying float vRandom;

  void main() {
    vec2 point = gl_PointCoord - 0.5;
    float distanceFromCenter = length(point);
    if (distanceFromCenter > 0.5) discard;
    float alpha = smoothstep(0.5, 0.12, distanceFromCenter) * vAlpha;
    float signalPoint = smoothstep(0.91, 0.985, vRandom);
    vec3 color = mix(uInk, uSignal, signalPoint * 0.92);
    gl_FragColor = vec4(color, alpha * mix(0.55, 1.0, vRandom));
    #include <colorspace_fragment>
  }
`;

export const STORY_HAIR_VERTEX = /* glsl */ `
  uniform float uReveal;
  uniform float uPixelRatio;
  attribute float aRandom;
  attribute float aArrival;
  attribute float aSize;
  attribute vec3 aOrigin;
  attribute vec3 aControl;
  varying float vAlpha;
  varying float vRandom;

  void main() {
    float arrival = smoothstep(
      aArrival,
      min(aArrival + 0.24, 1.0),
      uReveal
    );
    vec3 first = mix(aOrigin, aControl, arrival);
    vec3 second = mix(aControl, position, arrival);
    vec3 pos = mix(first, second, arrival);
    vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize =
      (1.38 + aSize * 1.72) * uPixelRatio *
      (3.8 / max(-viewPosition.z, 0.001));
    gl_Position = projectionMatrix * viewPosition;
    vAlpha = smoothstep(0.02, 0.72, arrival) * mix(0.48, 0.9, aRandom);
    vRandom = aRandom;
  }
`;

export const STORY_HAIR_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform vec3 uHair;
  uniform vec3 uHairLight;
  uniform vec3 uSignal;
  varying float vAlpha;
  varying float vRandom;

  void main() {
    vec2 point = gl_PointCoord - 0.5;
    float distanceFromCenter = length(point);
    if (distanceFromCenter > 0.5) discard;
    float alpha = smoothstep(0.5, 0.1, distanceFromCenter) * vAlpha;
    vec3 color = mix(uHair, uHairLight, vRandom * 0.38);
    color = mix(color, uSignal, smoothstep(0.97, 0.995, vRandom) * 0.5);
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`;
