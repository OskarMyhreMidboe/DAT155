import {
    PerspectiveCamera,
    Vector3,
    CurvePath,
    Path
} from './lib/Three.es.js';


import MouseLookController from './controls/MouseLookController.js';
import MyScene from "./lib/MyScene.js";
import Boat from "./terrain/Boat.js";
import Skydome from "./terrain/Skydome.js";
import SunMoonNode from "./terrain/SunMoonNode.js";
import Water from "./terrain/Water.js";
import Island from "./terrain/Island.js";
import Renderer from "./lib/Renderer.js"


const scene = new MyScene();

const waterLevel = 4.0;
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new Renderer();

const mouseLookController = new MouseLookController(camera);

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

let time = {
    counter: 1,
    mode: 1
};

let move = {
    forward: false,
    backwards: false,
    left: false,
    right: false,
    speed: 0.02
};



//Setting up movement-controlls with WASD
document.addEventListener('keydown', (e) =>{
    switch(e.code){
        case 'KeyW':
            move.forward = true;
            e.preventDefault();
            break;

        case 'KeyA':
            move.left = true;
            e.preventDefault();
            break;

        case 'KeyS':
            move.backwards = true;
            e.preventDefault();
            break;

        case 'KeyD':
            move.right = true;
            e.preventDefault();
            break;
    }
});
document.addEventListener('keyup', (e) =>{
    switch(e.code){
        case 'KeyW':
            move.forward = false;
            e.preventDefault();
            break;

        case 'KeyA':
            move.left = false;
            e.preventDefault();
            break;

        case 'KeyS':
            move.backwards = false;
            e.preventDefault();
            break;

        case 'KeyD':
            move.right = false;
            e.preventDefault();
            break;
    }
});

//Setting up the Objects and adding them to the scene
let skyDome = new Skydome();

let moon = new SunMoonNode('resources/images/moonmap.jpg', 0.4, -20, -40);
let sun = new SunMoonNode('resources/images/sunmap.jpg', 0.8, -20, 140);
let boat = new Boat(waterLevel);

scene.add( new Island(waterLevel), skyDome, sun, moon, new Water(waterLevel), boat );

//Variables and const for movement
const velocity = new Vector3(0.0, 0.0, 0.0);
let then = performance.now();


/**
 * boat movement Variables
 **/
var angle = 0;
var position = 0;

// direction vector for movement
var direction = new Vector3(1, 0, 0);
var up = new Vector3(0, 1, 0);
var axis = new Vector3();
// scalar to simulate speed
var speed = 0.5;
let curve = new CurvePath();
//boatPath();



//scene.add(Utilities.drawPath(curve));
/**
 * path 2D
 * @type {Path}
 */
//let previousAngle = Utilities.getAngle(position, curve);
//let previousPoint = curve.getPointAt( position );


function loop(now) {
    // update controller rotation.
    mouseLookController.update(pitch, yaw);
    const delta = now-then;
    then = now;
    const moveSpeed = move.speed * delta;
    //Reset mouse-point every frame
    yaw = 0;
    pitch = 0;

    velocity.set(0.0, 0.0, 0.0);

    if(move.left){
        velocity.x -= moveSpeed;
    }
    if(move.right){
        velocity.x += moveSpeed;
    }
    if(move.forward){
        velocity.z -= moveSpeed;
    }
    if(move.backwards){
        velocity.z += moveSpeed;
    }

    //Legger beveglsen til velocity utifra camera vinkel og legger til bevegelse
    velocity.applyQuaternion(camera.quaternion);
    camera.position.add(velocity);


    //Rotate both sun and moon
    moon.rotation.z += 0.01;
    sun.rotation.z += 0.01;


    if( moon.rotation.z > (time.counter*90)*Math.PI/180){

        time.counter+=2;

        skyDome.setDayNight(time.mode);
        scene.switchFog(time.mode);
        time.mode = (time.mode % 2) +1;

    };

    // render scene:
    renderer.render(scene, camera);

    //Update LOD
    moon.updateLOD(camera);
    sun.updateLOD(camera);

    //Update camera to where it is in world matrix
    camera.updateWorldMatrix();
    requestAnimationFrame(loop);

}
requestAnimationFrame(loop);
/**
 function boatPath(){
    let path1 = new CubicBezierCurve3(
        new Vector3( -50, 4, -40 ),
        new Vector3( -80, 4, 10 ),
        new Vector3( -90, 4, 20 ),
        new Vector3( 35, 4, 45 )
    );

    let path2 = new CubicBezierCurve3(
        new Vector3( 35, 4, 45 ),
        new Vector3( 40, 4, -80 ),
        new Vector3( 10, 4, -70 ),
        new Vector3( -50, 4, -40 )
    );

    curve.add(path1);
    curve.add(path2);
}

 function driveBoat(){
    // add up to position for movement
    position += 0.0001;


    // get the point at position
    let point = curve.getPointAt(position);
    if(point === null){
        position = 0.0001;
        point = curve.getPointAt(position);
    }
    boat.position.x = point.x;
    boat.position.z = point.z;

    let angle = Utilities.getAngle(position, curve);
    // set the quaternion
    boat.quaternion.setFromAxisAngle( up, angle );

    previousPoint = point;
    previousAngle = angle;
}

 function wobbleBoat() {

}
 **/



