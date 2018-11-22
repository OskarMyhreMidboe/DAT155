import {Object3D, Mesh, PointLight, Group, OBJLoader, MTLLoader, CurvePath, Vector3, CubicBezierCurve3, SplineCurve, Vector2} from "../lib/Three.es.js"
import Utilities from "../lib/Utilities.js";

export default class Boat extends Group{

    constructor(waterLevel){
        super();

        this.boat = new Object3D();
        this.waterLevel = waterLevel;

        this.placementInCurve = 0;
        this.up = new Vector3(0, 1, 0);
        this.boatLine = new CurvePath();
        this.boatPath();
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
                        object.position.y = this.waterLevel;

                        object.traverse ( function (node) {
                            if (node instanceof Mesh ){
                                node.castShadow = true ;
                                node.receiveShadow = true ;
                            }
                        });

                        this.boat.add(object);
                        this.add(this.boat);
                    });

            });
    }

    boatPath(){
        let path1 = new CubicBezierCurve3(
            new Vector3( -45, 4, -45 ),
            new Vector3( 30, 4, -90 ),
            new Vector3( 90, 4, -30 ),
            new Vector3( 45, 4, 45 )
        );

        let path2 = new CubicBezierCurve3(
            new Vector3( 45, 4, 45 ),
            new Vector3( -30, 4, 90 ),
            new Vector3( -90, 4, 30 ),
            new Vector3( -45, 4, -45 )
        );

        this.boatLine.add(path1);
        this.boatLine.add(path2);
    }

    driveBoat(timeDelta){
        // add up to position for movement
        this.placementInCurve += 0.0001;


        // get the point at position
        let point = this.boatLine.getPointAt(this.placementInCurve);
        if(point === null){
            this.placementInCurve = 0.0001;
            point = this.boatLine.getPointAt(this.placementInCurve);
        }
        this.boat.position.x = point.x;
        this.boat.position.z = point.z;
        this.boat.position.y = Math.sin(timeDelta/4000)+0.2;

        let angle = Utilities.getAngle(this.placementInCurve, this.boatLine);
        // set the quaternion
        this.boat.quaternion.setFromAxisAngle( this.up, angle );
    }
}