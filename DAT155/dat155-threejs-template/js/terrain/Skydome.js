import {TextureLoader, Mesh, MeshStandardMaterial, Object3D, SphereBufferGeometry} from "../lib/Three.es.js";

export default class Skydome extends Object3D{

    constructor(){
        super();

        nightTexture = tl.load("resources/skydome/skyTexture3_resized.jpg");
        dayTexture = tl.load("resources/skydome/skyTexture4.jpg");

        let skyGeometry = new SphereBufferGeometry(100, 32, 32, Math.PI/2, Math.PI*2, 0, 0.5 * Math.PI);


        let material = new MeshStandardMaterial({
            map: nightTexture,
            side: 2
        });

        let sky = new Mesh(skyGeometry, material);
        //  sky.rotation.x = Math.PI * -0.5;

        sky.traverse ( (node) => {
            if (node instanceof Mesh ){
                node.castShadow = false;
                node.receiveShadow = false;
            }
        });

        this.add(sky);
    }


    setDayNight(time){

        this.traverse ( (node) => {
            if (node instanceof Mesh ){

                if(time === 1){
                    node.material.map = dayTexture;
                }else{
                    node.material.map = nightTexture;
                }

                node.material.needsUpdate = true;
            }
        });
    }


}
let tl = new TextureLoader();
let nightTexture;
let dayTexture;
