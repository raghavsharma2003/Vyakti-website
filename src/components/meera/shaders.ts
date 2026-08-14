export const MEERA_FACE_VERTEX = /* glsl */ `
  uniform float uMouthOpen;
  uniform float uBlink;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vSpeech;
  varying float vVertical;
  varying vec2 vUv;
  varying vec3 vBasePosition;

  void main() {
    vec3 base = position;
    vec3 pos = base;

    vec3 mouthDelta = base - vec3(0.0, -0.04, 0.59);
    float lipMask = exp(-(
      mouthDelta.x * mouthDelta.x * 55.0 +
      mouthDelta.y * mouthDelta.y * 800.0 +
      mouthDelta.z * mouthDelta.z * 120.0
    )) * smoothstep(0.42, 0.52, base.z);

    float jawMask =
      (1.0 - smoothstep(-0.01, 0.08, base.y)) *
      smoothstep(-0.70, -0.42, base.y) *
      smoothstep(0.0, 0.28, base.z) *
      (1.0 - smoothstep(0.55, 0.78, abs(base.x)));

    float jawAngle = uMouthOpen * 0.082;
    vec2 jawPivot = vec2(0.07, 0.13);
    vec2 jaw = pos.yz - jawPivot;
    float jawCos = cos(jawAngle);
    float jawSin = sin(jawAngle);
    vec2 rotatedJaw = vec2(
      jawCos * jaw.x - jawSin * jaw.y,
      jawSin * jaw.x + jawCos * jaw.y
    ) + jawPivot;
    pos.yz = mix(pos.yz, rotatedJaw, jawMask);

    float lowerLip =
      lipMask * (1.0 - smoothstep(-0.006, 0.018, mouthDelta.y));
    float upperLip =
      lipMask * smoothstep(-0.006, 0.022, mouthDelta.y);
    pos.y -= lowerLip * uMouthOpen * 0.018;
    pos.y += upperLip * uMouthOpen * 0.005;
    pos.z -= lowerLip * uMouthOpen * 0.005;

    // The eye masks compress the actual eyelid topology toward each eye
    // centre. It creates a real closure without moving the eyeballs.
    vec3 leftEyeDelta = base - vec3(0.186, 0.398, 0.49);
    vec3 rightEyeDelta = base - vec3(-0.186, 0.398, 0.49);
    float leftEye = exp(-(
      leftEyeDelta.x * leftEyeDelta.x * 105.0 +
      leftEyeDelta.y * leftEyeDelta.y * 620.0 +
      leftEyeDelta.z * leftEyeDelta.z * 150.0
    ));
    float rightEye = exp(-(
      rightEyeDelta.x * rightEyeDelta.x * 105.0 +
      rightEyeDelta.y * rightEyeDelta.y * 620.0 +
      rightEyeDelta.z * rightEyeDelta.z * 150.0
    ));
    float eyeMask = (leftEye + rightEye) * smoothstep(0.34, 0.48, base.z);
    float lidDirection = sign(base.y - 0.398);
    pos.y -= lidDirection * eyeMask * uBlink * 0.025;
    pos.z -= eyeMask * uBlink * 0.009;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewPosition = mvPosition.xyz;
    vSpeech = lipMask * uMouthOpen;
    vVertical = smoothstep(-0.9, 0.95, base.y);
    vUv = uv;
    vBasePosition = base;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const MEERA_FACE_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform vec3 uPearl;
  uniform vec3 uShadow;
  uniform vec3 uAccent;
  uniform sampler2D uTopology;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vSpeech;
  varying float vVertical;
  varying vec2 vUv;
  varying vec3 vBasePosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(-vViewPosition);
    vec3 keyDirection = normalize(vec3(-0.38, 0.62, 0.78));
    vec3 fillDirection = normalize(vec3(0.72, -0.08, 0.58));

    float key = max(dot(normal, keyDirection), 0.0);
    float fill = max(dot(normal, fillDirection), 0.0);
    float rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.6);
    float light = smoothstep(
      0.06,
      0.92,
      clamp(0.08 + key * 0.76 + fill * 0.12, 0.0, 1.0)
    );

    vec3 color = mix(uShadow, uPearl, light);
    color += uPearl * rim * 0.18;
    color = mix(color, uAccent, clamp(vSpeech * 0.18 + rim * 0.025, 0.0, 0.20));
    color *= mix(0.94, 1.03, vVertical);

    float lipTint = exp(-(
      vBasePosition.x * vBasePosition.x * 42.0 +
      (vBasePosition.y + 0.022) * (vBasePosition.y + 0.022) * 620.0 +
      (vBasePosition.z - 0.596) * (vBasePosition.z - 0.596) * 120.0
    ));
    float leftBrow = exp(-(
      (vBasePosition.x - 0.185) * (vBasePosition.x - 0.185) * 72.0 +
      (vBasePosition.y - 0.49) * (vBasePosition.y - 0.49) * 510.0 +
      (vBasePosition.z - 0.515) * (vBasePosition.z - 0.515) * 90.0
    ));
    float rightBrow = exp(-(
      (vBasePosition.x + 0.185) * (vBasePosition.x + 0.185) * 72.0 +
      (vBasePosition.y - 0.49) * (vBasePosition.y - 0.49) * 510.0 +
      (vBasePosition.z - 0.515) * (vBasePosition.z - 0.515) * 90.0
    ));
    float cheekWarmth = exp(-(
      (abs(vBasePosition.x) - 0.29) * (abs(vBasePosition.x) - 0.29) * 34.0 +
      (vBasePosition.y - 0.13) * (vBasePosition.y - 0.13) * 34.0 +
      (vBasePosition.z - 0.48) * (vBasePosition.z - 0.48) * 42.0
    ));
    color = mix(color, vec3(0.49, 0.31, 0.29), lipTint * 0.32);
    color = mix(color, vec3(0.20, 0.18, 0.17), clamp(leftBrow + rightBrow, 0.0, 1.0) * 0.22);
    color = mix(color, vec3(0.79, 0.49, 0.42), cheekWarmth * 0.055);

    // GNM's own edge-flow map makes the surface read as research material,
    // not an untextured mannequin. It restores eye, lip and facial-plane
    // definition without pretending to be human skin.
    float topologyInk = 1.0 - texture2D(uTopology, vUv).r;
    topologyInk = smoothstep(0.18, 0.72, topologyInk);
    color = mix(color, vec3(0.13, 0.125, 0.115), topologyInk * 0.19);

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export const MEERA_HAIR_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;

  attribute float aRandom;

  varying float vRandom;
  varying float vFade;

  void main() {
    vec3 pos = position;
    float drift = 0.0025 + aRandom * 0.0045;
    pos.x += sin(uTime * 0.62 + aRandom * 18.0 + pos.y * 3.0) * drift;
    pos.z += cos(uTime * 0.48 + aRandom * 14.0 + pos.y * 2.0) * drift;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float distanceToCamera = -mvPosition.z;
    gl_PointSize = uSize * uPixelRatio * (0.58 + aRandom * 0.72);
    gl_PointSize *= 1.0 / max(distanceToCamera, 0.001);
    gl_Position = projectionMatrix * mvPosition;

    vRandom = aRandom;
    vFade = smoothstep(-1.0, -0.66, pos.y);
  }
`;

export const MEERA_CAP_VERTEX = /* glsl */ `
  varying vec3 vBasePosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vBasePosition = position;
    vec3 pos = position + normal * 0.018;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewPosition = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const MEERA_CAP_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform vec3 uHair;
  uniform vec3 uHairLight;

  varying vec3 vBasePosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    float centrePart = exp(-vBasePosition.x * vBasePosition.x * 16.0);
    float partOffset = exp(
      -(vBasePosition.x - 0.055) * (vBasePosition.x - 0.055) * 120.0
    );
    float hairline = 0.445 + centrePart * 0.215 + partOffset * 0.028;
    float top = smoothstep(hairline, hairline + 0.055, vBasePosition.y);
    float back =
      smoothstep(0.08, 0.24, vBasePosition.y) *
      (1.0 - smoothstep(0.16, 0.31, vBasePosition.z));
    float temple =
      smoothstep(0.38, 0.52, abs(vBasePosition.x)) *
      smoothstep(-0.34, 0.20, vBasePosition.y) *
      (1.0 - smoothstep(0.30, 0.45, vBasePosition.z));
    float mask = clamp(max(top, max(back, temple)), 0.0, 1.0);
    if (mask < 0.04) discard;

    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(-vViewPosition);
    float rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.2);
    vec3 color = mix(uHair, uHairLight, rim * 0.46 + top * 0.08);
    float strand = 0.5 + 0.5 * sin(
      vBasePosition.x * 118.0 +
      vBasePosition.y * 19.0 +
      vBasePosition.z * 31.0
    );
    float part =
      exp(-vBasePosition.x * vBasePosition.x * 620.0) *
      smoothstep(0.58, 0.84, vBasePosition.y);
    color = mix(color, uHairLight, strand * 0.055 + part * 0.34);

    gl_FragColor = vec4(color, smoothstep(0.04, 0.58, mask) * 0.91);
    #include <colorspace_fragment>
  }
`;

export const MEERA_HAIR_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform vec3 uHair;
  uniform vec3 uHairLight;
  uniform vec3 uAccent;
  uniform float uOpacity;

  varying float vRandom;
  varying float vFade;

  void main() {
    vec2 point = gl_PointCoord - 0.5;
    float distanceFromCenter = length(point);
    if (distanceFromCenter > 0.5) discard;

    float alpha = smoothstep(0.5, 0.08, distanceFromCenter);
    vec3 color = mix(uHair, uHairLight, vRandom * 0.55);
    float accentPoint = smoothstep(0.982, 1.0, vRandom);
    color = mix(color, uAccent, accentPoint * 0.32);
    alpha *= uOpacity * vFade;

    if (alpha < 0.01) discard;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`;
