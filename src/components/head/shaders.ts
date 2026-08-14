// Ashima simplex noise (MIT), trimmed to the 3D case we actually use.
const SIMPLEX = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

/**
 * The face is drawn as a point cloud so it reads as *sampled* rather than
 * modelled: a person reconstructed from measurements, which is literally
 * what the lab does.
 *
 * uDisperse blows the samples apart along their own normals. Mouth aperture
 * and speech energy are deliberately separate so syllables can close while a
 * softer expression wave continues through the face.
 */
export const HEAD_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uDisperse;
  uniform float uMouthOpen;
  uniform float uSpeechEnergy;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uNear;
  uniform float uFar;
  uniform vec2  uPointer;
  uniform vec3  uMouth;

  attribute float aRandom;
  attribute vec3  aDirection;

  varying float vDepth;
  varying float vEnergy;
  varying float vRandom;
  varying float vFacing;

  void main() {
    vec3 base = position;
    vec3 pos = base;

    // Idle life: a slow, low-amplitude field so the face never sits perfectly
    // still. Stillness is the thing that reads as dead.
    float breathe = snoise(pos * 2.2 + vec3(0.0, 0.0, uTime * 0.16));
    pos += normal * breathe * 0.012;

    // Speech motion. The scan has no blendshapes, so we rotate a restrained
    // lower-jaw region around a physical hinge and then articulate the lips.
    // Masks are evaluated from the undeformed surface to avoid feedback.
    vec3 mouthDelta = base - uMouth;
    float lipMask = exp(-(
      mouthDelta.x * mouthDelta.x * 45.0 +
      mouthDelta.y * mouthDelta.y * 650.0 +
      mouthDelta.z * mouthDelta.z * 140.0
    )) * smoothstep(0.40, 0.49, base.z);

    float jawMask =
      (1.0 - smoothstep(0.095, 0.14, base.y)) *
      smoothstep(-0.25, -0.15, base.y) *
      smoothstep(-0.08, 0.18, base.z) *
      (1.0 - smoothstep(0.48, 0.68, abs(base.x)));

    float angle = uMouthOpen * 0.105;
    vec2 pivot = vec2(0.16, 0.08);
    vec2 jaw = pos.yz - pivot;
    float c = cos(angle);
    float s = sin(angle);
    vec2 rotatedJaw = vec2(
      c * jaw.x - s * jaw.y,
      s * jaw.x + c * jaw.y
    ) + pivot;
    pos.yz = mix(pos.yz, rotatedJaw, jawMask);

    float lowerLip =
      lipMask * (1.0 - smoothstep(-0.008, 0.014, mouthDelta.y));
    float upperLip =
      lipMask * smoothstep(-0.008, 0.020, mouthDelta.y);
    pos.y -= lowerLip * uMouthOpen * 0.028;
    pos.y += upperLip * uMouthOpen * 0.008;
    pos.z -= lowerLip * uMouthOpen * 0.007;

    float dMouth = length(vec3(
      mouthDelta.x,
      mouthDelta.y * 1.25,
      mouthDelta.z
    ));
    float wave =
      sin(dMouth * 28.0 - uTime * 8.0) *
      exp(-dMouth * 5.0);
    float speakAmt = wave * uSpeechEnergy * 0.012;
    pos += normal * speakAmt;

    // Dispersion: samples leave the surface along a per-point direction,
    // turbulence rising with distance so the cloud frays instead of inflating.
    float turbulence = snoise(pos * 1.4 + uTime * 0.12);
    vec3 scatter = normalize(aDirection + normal * 0.6);
    pos += scatter * uDisperse * (0.45 + aRandom * 1.35);
    pos += scatter * turbulence * uDisperse * 0.55;

    // Pointer parallax applied in model space keeps the head "tracking" you
    // without the whole canvas sliding.
    pos.x += uPointer.x * 0.035;
    pos.y += uPointer.y * 0.035;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    vEnergy = clamp(
      lipMask * uMouthOpen * 0.72 + abs(speakAmt) * 11.0,
      0.0,
      1.0
    );

    vec3 viewNormal = normalize(normalMatrix * normal);
    vec3 viewDirection = normalize(-mvPosition.xyz);
    vFacing = dot(viewNormal, viewDirection);

    // Distance from the camera across the head's actual depth range, so the
    // near side of the face is bright and the far side falls into the ground.
    float dist = -mvPosition.z;
    vDepth = 1.0 - clamp((dist - uNear) / max(uFar - uNear, 0.001), 0.0, 1.0);
    vRandom = aRandom;

    gl_PointSize = uSize * uPixelRatio * (0.55 + aRandom * 0.75);
    gl_PointSize *= 1.0 + lipMask * uMouthOpen * 0.34;
    gl_PointSize *= 1.0 / max(dist, 0.001);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const HEAD_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform vec3  uColorCore;
  uniform vec3  uColorEdge;
  uniform vec3  uColorHot;
  uniform float uOpacity;
  uniform float uDisperse;

  varying float vDepth;
  varying float vEnergy;
  varying float vRandom;
  varying float vFacing;

  void main() {
    // Round, soft-edged points. Square points are the giveaway of a default
    // PointsMaterial.
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.06, d);

    vec3 color = mix(uColorEdge, uColorCore, smoothstep(0.0, 1.0, vDepth));
    color = mix(color, uColorHot, clamp(vEnergy, 0.0, 1.0));

    // Points that have travelled furthest cool toward the background so the
    // cloud dissolves rather than clipping.
    // Attenuating back-facing and deep samples prevents the neck and rear
    // surface from accumulating through the transparent mouth area.
    float facingAlpha = smoothstep(-0.05, 0.18, vFacing);
    float depthAlpha = smoothstep(0.08, 0.58, vDepth);
    alpha *= uOpacity * facingAlpha * depthAlpha;
    alpha *= 1.0 - uDisperse * 0.45 * (1.0 - vRandom * 0.5);

    if (alpha < 0.008) discard;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`;

export const SIMPLEX_CHUNK = SIMPLEX;
