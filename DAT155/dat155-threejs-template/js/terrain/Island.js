import Utilities from "../lib/Utilities.js"
import TerrainBufferGeometry from "./TerrainBufferGeometry.js";
import {Object3D, Mesh, MeshPhongMaterial, TextureLoader} from "../lib/Three.es.js";
import Tree from "./Tree.js";


export default class Island extends Object3D{

    constructor(waterLevel){
        super();

        Utilities.loadImage('resources/images/heightmap2.png').then((heightmapImage) => {

            let terrainGeometry = new TerrainBufferGeometry({
                heightmapImage,
                numberOfSubdivisions: 128
            });

            const terrainMaterial = new MeshPhongMaterial({
                map: new TextureLoader().load('resources/textures/lovenes_konge.jpg'),
                clipShadows: true
            });


            const terrain = new Mesh(terrainGeometry, terrainMaterial);

            terrain.traverse ( function (node) {
                if (node instanceof Mesh ){
                    node.castShadow = true ;
                    node.receiveShadow = true ;
                }
            });
            let trees = new Tree(terrainGeometry, 20, waterLevel);
            terrain.add(trees);

            this.add(terrain);
        });
    }

}