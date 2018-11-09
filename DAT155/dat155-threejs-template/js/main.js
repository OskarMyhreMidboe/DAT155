import {
    PerspectiveCamera,
    WebGLRenderer,
    Scene,
    BoxBufferGeometry,
    MeshBasicMaterial,
    Mesh,
    SphereGeometry,
    MeshPhongMaterial,
    TextureLoader,
    Vector3,
    RepeatWrapping,
    ImageUtils,
    ShaderMaterial,
    Vector2,
    Vector4,
    ShaderLib,
    PlaneBufferGeometry,
    AmbientLight,
    Fog,
    Color

} from './lib/three.module.js';



import Utilities from './lib/Utilities.js';
import MouseLookController from './controls/MouseLookController.js';

import TerrainBufferGeometry from './terrain/TerrainBufferGeometry.js';
import OBJLoader from "./loaders/OBJLoader";

const fogColor = new Color( 0xEFFEFF );
const scene = new Scene();

scene.background = fogColor;
scene.fog = new Fog( fogColor, 0.1, 100 );

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new WebGLRenderer();
renderer.setClearColor( 0x000000 );
renderer.setSize(window.innerWidth, window.innerHeight);



/**
 * Handle window resize:
 *  - update aspect ratio.
 *  - update projection matrix
 *  - update renderer size
 */
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

/**
 * Add canvas element to DOM.
 */
document.body.appendChild(renderer.domElement);

const geometry = new BoxBufferGeometry(1, 1, 1);
const material = new MeshBasicMaterial({ color: 0x00ff00 });
const cube = new Mesh(geometry, material);
scene.add(cube);

camera.position.z = 55;
camera.position.y = 15;


/**
 * Add terrain:
 * 
 * We have to wait for the image file to be loaded by the browser.
 * We pass a callback function with the stuff we want to do once the image is loaded.
 * There are many ways to handle asynchronous flow in your application.
 * An alternative way to handle asynchronous functions is async/await
 *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
 */
let loader = new TextureLoader();
let objLoader = new OBJLoader();
//let mtlLoader = new THREE.MTLLoader();

Utilities.loadImage('resources/images/heightmap.png').then((heightmapImage) => {

    const terrainGeometry = new TerrainBufferGeometry({
        heightmapImage,
        numberOfSubdivisions: 128
    });

    const terrainMaterial = new MeshPhongMaterial({
        map: loader.load('resources/textures/lovenes_konge.jpg')
    });

    const terrain = new Mesh(terrainGeometry, terrainMaterial);

    scene.add(terrain);

});



/**
 * Set up camera controller:
 */

const mouseLookController = new MouseLookController(camera);

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





//Setting up movement-controlls with WASD
let moveSpeed = 0.5;
let direction = camera.getWorldDirection();
document.addEventListener('keydown', (e) =>{
    e.preventDefault();
    camera.getWorldDirection(direction);



    switch(e.code){
        case 'KeyW':
            camera.position.add(direction.multiplyScalar(moveSpeed));
            break;

        case 'KeyA':
            break;

        case 'KeyS':
            camera.position.add(direction.multiplyScalar(-moveSpeed));
            break;

        case 'KeyD':
            break;
    }

    camera.updateWorldMatrix();

});





light();
water();
skydome();
//makeMeSomeTrees();
loop();


function loop() {
    // update controller rotation.
    mouseLookController.update(pitch, yaw);
    yaw = 0;
    pitch = 0;

    // animate cube rotation:
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // render scene:
    renderer.render(scene, camera);

    requestAnimationFrame(loop);

}

function light(){
    let light = new AmbientLight( 0xFFFFFFF ); // soft white light
    light.intensity = 0.7;

    scene.add( light );
}


function water() {
    let waterGeometry = new PlaneBufferGeometry(200, 200);

    let waterMaterial2 = new ShaderMaterial({
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent
    });

    const waterMaterial = new MeshPhongMaterial({
        map: loader.load('resources/textures/water.jpg'),
        side: 2
    })

    let water = new Mesh(waterGeometry, waterMaterial);
    water.rotation.x = Math.PI * -0.5;
    water.translateZ(4);

    scene.add(water);
}

function skydome() {
    let skyGeometry = new SphereGeometry(100, 25, 25);

    let texture = loader.load("resources/skydome/skyTexture2.jpg");

    let material = new MeshPhongMaterial({
        map: texture,
        side: 2
    });

    let sky = new Mesh(skyGeometry, material);
    //  sky.rotation.x = Math.PI * -0.5;

    scene.add(sky);
}


function makeMeSomeTrees() {

    objLoader.load('resources/models/lowPolyTree/lowpolytree.obj')
}

