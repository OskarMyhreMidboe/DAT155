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
    PlaneBufferGeometry,
    Fog,
    Color,
    OBJLoader,
    MTLLoader,
    PointLight,
    PCFSoftShadowMap,
    MeshStandardMaterial,
    Object3D,
    IcosahedronBufferGeometry,
    LOD
} from './lib/Three.es.js';


import Utilities from './lib/Utilities.js';
import MouseLookController from './controls/MouseLookController.js';

import TerrainBufferGeometry from "./terrain/TerrainBufferGeometry.js";
const fogColor = new Color( 0x000000 );
const scene = new Scene();

scene.background = fogColor;
scene.fog = new Fog( fogColor, -10, 150 );


const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let lodMoon = new LOD();

const renderer = new WebGLRenderer({
    antialias: true
});
renderer.setClearColor( 0x000000 );
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;

let loader = new TextureLoader();




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

let terrainGeometry;

Utilities.loadImage('resources/images/heightmap.png').then((heightmapImage) => {

    terrainGeometry = new TerrainBufferGeometry({
        heightmapImage,
        numberOfSubdivisions: 128
    });

    const terrainMaterial = new MeshPhongMaterial({
        map: loader.load('resources/textures/lovenes_konge.jpg')
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


let moonNode = new Object3D();
moonNode.rotation.x += -20*Math.PI/180;
moonNode.rotation.z -= 40*Math.PI/180;
scene.add(moonNode);

water();
skydome();
loop();
setShip();
setTimeout(makeMeSomeTrees ,'2000');
moon();

function loop() {
    // update controller rotation.
    mouseLookController.update(pitch, yaw);
    yaw = 0;
    pitch = 0;


    //console.log('x: ' + camera.position.x +  '\t y: ' + camera.position.z);
    // animate cube rotation:
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    moonNode.rotation.z += 0.005;

    if(moonNode.rotation.z > 90*Math.PI/180){
        moonNode.rotation.z = -90*Math.PI/180;
    }

    // render scene:
    renderer.render(scene, camera);

    //Update LOD
    lodMoon.update(camera);

    requestAnimationFrame(loop);

}

function water() {
    let waterGeometry = new PlaneBufferGeometry(200, 200);

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
    let skyGeometry = new SphereGeometry(100, 25, 25);

    let texture = loader.load("resources/skydome/skyTexture3.jpg");
    let material = new MeshStandardMaterial({
        map: texture,
        side: 2,

    });

    let sky = new Mesh(skyGeometry, material);
    //  sky.rotation.x = Math.PI * -0.5;

    sky.traverse ( function (node) {
        if (node instanceof Mesh ){
            node.castShadow = false;
            node.receiveShadow = false;
        }
    });

    scene.add(sky);
}



function makeMeSomeTrees(numberOfTrees = 20) {

    new MTLLoader()
        .load( 'resources/models/lowPolyTree/lowpolytree.mtl', function( materials ) {

        materials.preload();
        new OBJLoader()
            .setMaterials( materials )
            .load( 'resources/models/lowPolyTree/lowpolytree.obj', function ( object ) {

             console.log(object);

            object.traverse ( function (node) {
                if (node instanceof Mesh ){
                    node.castShadow = true ;
                    node.receiveShadow = true ;
                    node.material[0].emissive.setHex(0x006900);
                    node.material[0].emissiveIntensity = 0.4;
                    node.material[1].emissive.setHex(0x404040);
                    node.material[1].emissiveIntensity = 0.4;
                    node.material[0].roughness = 1.0;


                }
            });







            const trees = Utilities.cloneObjects(object, numberOfTrees);
            for(let x = 0; x < trees.length; x++){
                trees[x].position.xyz = Utilities.randomXAndYCord(trees[x].position, terrainGeometry);
                trees[x].position.x -=50;
                trees[x].position.z -=50;
                trees[x].position.y += 2;
                scene.add( trees[x] );
            }





        });

    });

}

function moon(){

    let moonTexture = loader.load('resources/images/moonmap.jpg');
    let moonMaterial = new MeshBasicMaterial({
        map: moonTexture,
        fog: false
    });

    for( let i = 0; i < 3; i++ ) {

        let moonGeometry = new IcosahedronBufferGeometry( 5, 3 - i );

        let moon = new Mesh( moonGeometry, moonMaterial );

        lodMoon.addLevel( moon, i * 20 );

    }

    //let moonGeometry = new SphereGeometry(5, 32, 32)

    //let moon = new Mesh(moonGeometry, moonMaterial);
    lodMoon.position.y = 90;
    moonNode.add(lodMoon);



    //Lighting for the moon
    let moonLight = new PointLight( 0xFFFFFFF, 0.7, 1000);
    moonLight.castShadow = true;

    lodMoon.add( moonLight );
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
            object.position.y = 4;
            object.position.x = 80;
            object.add(lantern);

            object.traverse ( function (node) {
                if (node instanceof Mesh ){
                    node.castShadow = true ;
                    node.receiveShadow = true ;
                }
            });

            scene.add( object );

        });

    });
}
