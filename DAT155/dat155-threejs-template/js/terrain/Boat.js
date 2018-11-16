import {Mesh, PointLight, Group, OBJLoader, MTLLoader} from "../lib/Three.es.js"

export default class Boat extends Group{

    constructor(waterLevel){
        super();


        let lantern = new PointLight( 0xFFFFFFF, 1.0, 5);
        lantern.castShadow = true;
        lantern.position.y += 1;

        new MTLLoader()
            .load( 'resources/models/ship/pirate-ship-fat.mtl', ( materials ) => {

                materials.preload();
                new OBJLoader()
                    .setMaterials( materials )
                    .load( 'resources/models/ship/pirate-ship-fat.obj', ( object ) => {

                        object.add(lantern);
                        object.position.y = waterLevel + 0.5;
                        object.traverse ( function (node) {
                            if (node instanceof Mesh ){
                                node.castShadow = true ;
                                node.receiveShadow = true ;
                            }
                        });

                        this.add(object);
                    });

            });
    }
}