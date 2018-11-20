import Utilities from "../lib/Utilities.js"
import {Object3D, OBJLoader, MTLLoader, Mesh, TextureLoader} from "../lib/Three.es.js";

export default class Tree extends Object3D{

    constructor(treeName, terrainGeometry, numberOfTrees, waterLevel){
        super();



        new MTLLoader()
            .load( 'resources/models/lowPolyTree/'+treeName+'.mtl', ( materials ) => {

                materials.preload();
                new OBJLoader()
                    .setMaterials( materials )
                    .load( 'resources/models/lowPolyTree/'+treeName+'.obj', ( object ) => {

                        object.traverse ( function (node) {
                            if (node instanceof Mesh ){
                                node.castShadow = true ;
                                node.receiveShadow = true ;

                                if(!Array.isArray(node.material)){
                                    node.material.emissive.setHex(0x404040);
                                    node.material.emissiveIntensity = 0.4;
                                    node.material.shininess = 0;
                                    node.scale.set(0.3,0.3,0.3);
                                }else{
                                    node.material[0].emissive.setHex(0x006900);
                                    node.material[0].emissiveIntensity = 0.4;
                                    node.material[0].bumpMap = new TextureLoader().load("resources/images/bumpMap.jpg")
                                    node.material[1].emissive.setHex(0x404040);
                                    node.material[1].emissiveIntensity = 0.4;
                                }
                            }
                        });



                        const trees = Utilities.cloneObjects(object, numberOfTrees);
                        for(let x = 0; x < trees.length; x++){
                            trees[x].position.xyz = Utilities.randomXAndZCord(trees[x].position, terrainGeometry, waterLevel);
                            trees[x].position.x -=50;
                            trees[x].position.z -=50;
//                            trees[x].position.y += 2;
                            this.add( trees[x] );
                        }

                        this.add( object );
                    });

            });

    }
}