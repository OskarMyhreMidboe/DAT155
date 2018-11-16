import {WebGLRenderer, PCFSoftShadowMap} from "./Three.es.js";

export default class Renderer extends WebGLRenderer{
    constructor(){
        super({antialias: true});


        this.setPixelRatio( window.devicePixelRatio );
        this.updateSize();
        this.shadowMap.enabled = true;
        this.shadowMap.type = PCFSoftShadowMap;

    }

    updateSize(){
        this.setSize(window.innerWidth, window.innerHeight);
    }
}