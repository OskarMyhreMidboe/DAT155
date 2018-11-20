import {Sprite, TextureLoader, SpriteMaterial} from '../lib/Three.es.js'
import Utilities from "../lib/Utilities.js";

export default class Grass extends Sprite{
    constructor(terrainGeometry, waterLevel){
        super();

        let texture = new TextureLoader().load('resources/textures/grass.png');

        let spriteMaterial = new SpriteMaterial({
            map: texture,
            color: 0xEEE8AA,
            fog: true,
            transparent: true,
            opacity: 0.7
        });
        let sprite = new Sprite(spriteMaterial);

        let grassGroup = Utilities.cloneObjects(sprite, 200);

        for(let x = 0; x < grassGroup.length; x++){
            grassGroup[x].position.xyz = Utilities.randomXAndZCord(grassGroup[x].position, terrainGeometry, waterLevel);
            grassGroup[x].position.y +=0.5;
            this.add(grassGroup[x]);
        }

        this.position.x -=50;
        this.position.z -=50;

    }
}