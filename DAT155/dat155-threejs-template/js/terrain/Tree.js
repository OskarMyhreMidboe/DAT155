import Utilities from "../lib/Utilities.js"
import {Object3D, OBJLoader, MTLLoader, Mesh} from "../lib/Three.es.js";

export default class Tree extends Object3D{

    constructor(terrainGeometry, numberOfTrees, waterLevel){
        super();



        new MTLLoader()
            .load( 'resources/models/lowPolyTree/lowpolytree.mtl', ( materials ) => {

                materials.preload();
                new OBJLoader()
                    .setMaterials( materials )
                    .load( 'resources/models/lowPolyTree/lowpolytree.obj', ( object ) => {

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
                            trees[x].position.xyz = Utilities.randomXAndZCord(trees[x].position, terrainGeometry, waterLevel);
                            trees[x].position.x -=50;
                            trees[x].position.z -=50;
                            trees[x].position.y += 2;
                            this.add( trees[x] );
                        }

                        this.add( object );
                    });

            });

    }
}