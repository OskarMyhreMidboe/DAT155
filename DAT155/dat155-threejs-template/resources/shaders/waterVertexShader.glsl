#version 120

#define USE_MAP true

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;
uniform float timeDelta;

void main(){
    vec2 vUv = uv;
    vec3 p = position;
    p.z += sin(timeDelta/5000.0);
    vec4 modelViewPosition = modelViewMatrix * vec4(p, 1.0);
    vViewPosition = -modelViewPosition.xyz;
    gl_Position = projectionMatrix * modelViewPosition,
    vNormal = normalMatrix * normal;
}
