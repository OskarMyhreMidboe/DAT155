import {Object3D} from "../lib/Three.es.js";
import SunMoon from "./SunMoon.js";

export default class SunMoonNode extends Object3D{

    constructor(texturePath, lightIntensity, rotX, rotZ){
        super();
        sunMoon = new SunMoon(texturePath, lightIntensity);
        this.rotation.x += rotX*Math.PI/180;
        this.rotation.z += rotZ*Math.PI/180;
        this.add(sunMoon);
    }

    updateLOD(camera){
        sunMoon.update(camera);
    }
}
let sunMoon;