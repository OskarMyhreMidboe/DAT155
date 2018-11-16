import {TextureLoader, IcosahedronBufferGeometry, LOD, Mesh, MeshBasicMaterial, PointLight} from "../lib/Three.es.js";


/**
 * texturePath is a string to the right texture
 * lightIntesity will be the intensity of the pointlight
 */
export default class SunMoon extends LOD{

    constructor(texturePath, lightIntensity){
        super();

        const texture = new TextureLoader().load(texturePath);

        const material = new MeshBasicMaterial({
            map: texture,
            fog: false,
            wireframe: true
        });

        for( let i = 0; i < 3; i++ ) {

             let geometry = new IcosahedronBufferGeometry( 5, 3 - i );
             this.addLevel( new Mesh(geometry, material), (i * 30)+30 );

        }

        this.position.y = 90;
        let light = new PointLight( 0xFFFFFFF, lightIntensity, 1000);
        light.castShadow = true;

        this.add( light );

    }
}