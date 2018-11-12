import{
    OBJLoader,
    MTLLoader
} from "./Three.es.js";
class ObjectLoader {


    constructor(scene, standardPath='resources/models') {
        this.objLoader = new OBJLoader();
        this.objLoader.setPath(standardPath);
        this.mtlLoader = new MTLLoader();
        this.mtlLoader.setPath(standardPath);
        this.scene = scene;

    }


     load(mtlPath, objPath){

            this.mtlLoader.load( mtlPath, function(materials ) {

                materials.preload();
                this.objLoader.setMaterials( materials );
                this.objLoader.load( objPath, function ( object ) {
                    object.position.y = 10;

                    this.scene.add( object );

                });

            });


    }

}
module.exports = ObjectLoader;

