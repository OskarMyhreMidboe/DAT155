import {Scene, Fog} from "./Three.es.js";

export default class MyScene extends Scene{
    constructor(){
        super();
        this.background = 0xFFFFFF;
        this.fog = nightFog;

    }

    switchFog(time){
        if(time === 1){
            this.fog = dayFog;
        }else{
            this.fog = nightFog;
        }
    }
}
const nightFog = new Fog( 0x191919	, -10, 150 );
const dayFog = new Fog( 0xFFFFFF, -10, 200 );