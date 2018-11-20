import {
    PerspectiveCamera,

} from './lib/Three.es.js';


import MouseLookController from './controls/MouseLookController.js';
import KeyboardMovementController from './controls/KeyboardMovementController.js';
import MyScene from "./lib/MyScene.js";
import Boat from "./terrain/Boat.js";
import Skydome from "./terrain/Skydome.js";
import SunMoonNode from "./terrain/SunMoonNode.js";
import Water2 from "./terrain/Water2.js";
import Island from "./terrain/Island.js";
import Renderer from "./lib/Renderer.js"



const scene = new MyScene();

const waterLevel = 4.0;
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new Renderer();
const mouseLookController = new MouseLookController(camera);
const keyboardMovementController = new KeyboardMovementController(camera);
/**
 * Handle window resize:
 *  - update aspect ratio.
 *  - update projection matrix
 *  - update renderer size
 */
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.updateSize();
}, false);

/**
 * Add canvas element to DOM.
 */
document.body.appendChild(renderer.domElement);

camera.position.z = 55;
camera.position.y = 15;

/**
 * Set up camera controller:
 */


// We attach a click lister to the canvas-element so that we can request a pointer lock.
// https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
const canvas = renderer.domElement;

canvas.addEventListener('click', () => {
    canvas.requestPointerLock();
});



//Setting up movment-controlls with mouse
let yaw = 0;
let pitch = 0;
const mouseSensitivity = 0.001;

function updateCamRotation(event) {
    yaw += event.movementX * mouseSensitivity;
    pitch += event.movementY * mouseSensitivity;
}

document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
        canvas.addEventListener('mousemove', updateCamRotation, false);
    } else {
        canvas.removeEventListener('mousemove', updateCamRotation, false);
    }
});

//Object with attributes to keep track of time
let time = {
    counter: 1,
    mode: 1
};

//Setting up the Objects and adding them to the scene
let skyDome = new Skydome();
let sun = new SunMoonNode('resources/images/sunmap.jpg', 0.8, -20, 140);
let moon = new SunMoonNode('resources/images/moonmap.jpg', 0.4, -20, -40);
let boat = new Boat(waterLevel);
let water = new Water2(waterLevel);
scene.add( new Island(waterLevel), skyDome, sun, moon, water, boat );


let then = performance.now();
let start = Date.now();
let deltaTime = 0;
function loop(now) {
    // update controller rotation.
    mouseLookController.update(pitch, yaw);
    const delta = now-then;
    then = now;
    deltaTime = Date.now()-start;

    //Reset mouse-point every frame
    yaw = 0;
    pitch = 0;



    //Rotate both sun and moon
    moon.rotation.z += 0.005;
    sun.rotation.z += 0.005;


    if( moon.rotation.z > (time.counter*90)*Math.PI/180){

        time.counter+=2;

        skyDome.setDayNight(time.mode);
        scene.switchFog(time.mode);
        water.dayNightEnvMap(time.mode);
        time.mode = (time.mode % 2) +1;

    };

    // render scene:
    renderer.render(scene, camera);

    //Update LOD objects relative to the camera
    sun.updateLOD(camera);
    moon.updateLOD(camera);

    boat.driveBoat(deltaTime);
    water.flow(deltaTime);

    //Oppdaterer camera-beveglse utifra keyboard
    keyboardMovementController.update(delta);

    //Update camera to where it is in world matrix
    camera.updateWorldMatrix();
    requestAnimationFrame(loop);

}
requestAnimationFrame(loop);