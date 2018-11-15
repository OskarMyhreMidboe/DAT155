import {
    PerspectiveCamera,
    WebGLRenderer,
    Scene,
    MeshBasicMaterial,
    Mesh,
    MeshPhongMaterial,
    TextureLoader,
    Fog,
    Color,
    OBJLoader,
    MTLLoader,
    PointLight,
    PCFSoftShadowMap,
    MeshStandardMaterial,
    Object3D,
    IcosahedronBufferGeometry,
    LOD,
    SphereBufferGeometry,
    CircleBufferGeometry,
    Node,
    Vector3,
    CurvePath,
    CubicBezierCurve3,
    Path,
    Vector2,
    Line,
    Group
} from './lib/Three.es.js';


import Utilities from './lib/Utilities.js';
import MouseLookController from './controls/MouseLookController.js';

import TerrainBufferGeometry from "./terrain/TerrainBufferGeometry.js";
const scene = new Scene();

scene.background = 0xFFFFFF;
let nightFog = new Fog( 0x808080, -10, 150 );
let dayFog = new Fog( 0xFFFFFF, -10, 200 );
scene.fog = nightFog;

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let loader = new TextureLoader();
let moonNode, sunNode, lodMoon, lodSun;
let nightTexture = loader.load("resources/skydome/skyTexture3.jpg");
let dayTexture = loader.load("resources/skydome/skyTexture2.jpg");
let boat = new Group();
const renderer = new WebGLRenderer({
    antialias: true
});

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;





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

let terrainGeometry;

Utilities.loadImage('resources/images/heightmap2.png').then((heightmapImage) => {

    terrainGeometry = new TerrainBufferGeometry({
        heightmapImage,
        numberOfSubdivisions: 128
    });

    const terrainMaterial = new MeshPhongMaterial({
        map: loader.load('resources/textures/lovenes_konge.jpg'),
        clipShadows: true
    });


    const terrain = new Mesh(terrainGeometry, terrainMaterial);

    terrain.traverse ( function (node) {
        if (node instanceof Mesh ){
            node.castShadow = true ;
            node.receiveShadow = true ;
        }
    });
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

//Setting up the skydome and storing it so that we later can use it to change texture
let skyDome = skydome();
scene.add(skyDome);

//Variables and const for movement
const velocity = new Vector3(0.0, 0.0, 0.0);
let then = performance.now();


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
    moonNode.rotation.z += 0.01;
    sunNode.rotation.z += 0.01;



    if( moonNode.rotation.z > (time.counter*90)*Math.PI/180){

        time.counter+=2;

        setDayNight(skyDome);

        time.mode = (time.mode % 2) +1;

    };

    // render scene:
    renderer.render(scene, camera);

    //Update LOD
    lodMoon.update(camera);
    lodSun.update(camera);
    camera.updateWorldMatrix();
    requestAnimationFrame(loop);

}

moonAndSun();
water();
setTimeout(makeMeSomeTrees ,'2000');
setShip();
setTimeout(requestAnimationFrame(loop),'2000');




function water() {
    let waterGeometry = new CircleBufferGeometry(100, 32);

    const waterMaterial = new MeshPhongMaterial({
        map: loader.load('resources/textures/water.jpg'),
        side: 2
    });

    let water = new Mesh(waterGeometry, waterMaterial);
    water.rotation.x = Math.PI * -0.5;
    water.translateZ(4);


    water.traverse ( function (node) {
        if (node instanceof Mesh ){
            node.castShadow = false ;
            node.receiveShadow = true ;
        }
    });

    scene.add(water);
}

function skydome() {
    let skyGeometry = new SphereBufferGeometry(100, 32, 32, Math.PI/2, Math.PI*2, 0, 0.5 * Math.PI);


    let material = new MeshStandardMaterial({
        map: nightTexture,
        side: 2
    });

    let sky = new Mesh(skyGeometry, material);
    //  sky.rotation.x = Math.PI * -0.5;

    sky.traverse ( function (node) {
        if (node instanceof Mesh ){
            node.castShadow = false;
            node.receiveShadow = false;
        }
    });

    return sky;
}

function makeMeSomeTrees(numberOfTrees = 20) {

    new MTLLoader()
        .load( 'resources/models/lowPolyTree/lowpolytree.mtl', function( materials ) {

        materials.preload();
        new OBJLoader()
            .setMaterials( materials )
            .load( 'resources/models/lowPolyTree/lowpolytree.obj', function ( object ) {

            object.traverse ( function (node) {
                if (node instanceof Mesh ){
                    node.castShadow = true ;
                    node.receiveShadow = true ;
                    node.material[0].emissive.setHex(0x006900);
                    node.material[0].emissiveIntensity = 0.4;
                    node.material[1].emissive.setHex(0x404040);
                    node.material[1].emissiveIntensity = 0.4;
                    node.material[0].roughness = 1.0;
                    node.material[1].roughness = 1.0;



                }
            });

            const trees = Utilities.cloneObjects(object, numberOfTrees);
            for(let x = 0; x < trees.length; x++){
                trees[x].position.xyz = Utilities.randomXAndZCord(trees[x].position, terrainGeometry);
                trees[x].position.x -=50;
                trees[x].position.z -=50;
                trees[x].position.y += 2;
                scene.add( trees[x] );
            }





        });

    });

}

function setShip(){


    let lantern = new PointLight( 0xFFFFFFF, 1.0, 5);
    lantern.castShadow = true;
    lantern.position.y += 1;

    new MTLLoader()
        .load( 'resources/models/ship/pirate-ship-fat.mtl', function( materials ) {

        materials.preload();
        new OBJLoader()
            .setMaterials( materials )
            .load( 'resources/models/ship/pirate-ship-fat.obj', function ( object ) {

                object.add(lantern);
                object.name = "boat";
                console.log(object);
                object.traverse ( function (node) {
                    if (node instanceof Mesh ){
                        node.castShadow = true ;
                        node.receiveShadow = true ;
                    }
                });
            boat = object;
            scene.add(boat);
            });

    });
}

function moonAndSun(){

    lodSun = new LOD();
    lodMoon = new LOD();
    moonNode = createMoonNode();
    sunNode = createSunNode();

    const moonTexture = loader.load('resources/images/moonmap.jpg');
    const sunTexture = loader.load('resources/images/sunmap.jpg');
    const moonMaterial = new MeshBasicMaterial({
        map: moonTexture,
        fog: false
    });
    const sunMaterial = new MeshBasicMaterial({
        map: sunTexture,
        fog: false
    });

    for( let i = 0; i < 3; i++ ) {

        let Geometry = new IcosahedronBufferGeometry( 5, 3 - i );
        let moon = new Mesh( Geometry, moonMaterial );
        let sun = new Mesh( Geometry, sunMaterial );
        lodMoon.addLevel( moon, (i * 30)+30 );
        lodSun.addLevel( sun, (i * 30)+30 );

    }

    //let moonGeometry = new SphereGeometry(5, 32, 32)

    //let moon = new Mesh(moonGeometry, moonMaterial);
    lodMoon.position.y = 90;
    lodSun.position.y = 90;
    moonNode.add(lodMoon);
    sunNode.add(lodSun);



    //Lighting for the moon
    let moonLight = new PointLight( 0xFFFFFFF, 0.4, 1000);
    moonLight.castShadow = true;
    let sunLight = new PointLight( 0xFFFFFFF, 0.8, 1000);
    sunLight.castShadow = true;

    lodMoon.add( moonLight );
    lodSun.add( sunLight );
}

function createMoonNode(){
    moonNode = new Object3D();
    moonNode.rotation.x += -20*Math.PI/180;
    moonNode.rotation.z -= 40*Math.PI/180;
    scene.add(moonNode);
    return moonNode
}
function createSunNode(){
    sunNode = new Object3D();
    sunNode.rotation.x += -20*Math.PI/180;
    sunNode.rotation.z += 140*Math.PI/180;
    scene.add(sunNode);
    return sunNode
}

function setDayNight(skydome){

    skydome.traverse ( function (node) {
        if (node instanceof Mesh ){

            if(time.mode === 1){
                node.material.map = dayTexture;
                scene.fog = dayFog;
            }else{
                node.material.map = nightTexture;
                scene.fog = nightFog
            }

            node.material.needsUpdate = true;

        }
    });

}

function boatPath(){
}

function driveBoat(){
}


