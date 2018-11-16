import {Object3D, CircleBufferGeometry, Mesh, MeshPhongMaterial, TextureLoader} from "../lib/Three.es.js";


export default class Water extends Object3D{

    constructor(waterLevel){
        super();

        let waterGeometry = new CircleBufferGeometry(100, 32);

        const waterMaterial = new MeshPhongMaterial({
            map: new TextureLoader().load('resources/textures/water.jpg'),
            side: 2
        });

        let water = new Mesh(waterGeometry, waterMaterial);
        water.rotation.x = Math.PI * -0.5;
        water.translateZ(waterLevel);


        water.traverse ( function (node) {
            if (node instanceof Mesh ){
                node.castShadow = false ;
                node.receiveShadow = true ;
            }
        });

        this.add(water);
    }
}