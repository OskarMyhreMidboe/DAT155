import {Vector2, Object3D, CircleBufferGeometry, MeshPhongMaterial, TextureLoader, Mesh, CubeTextureLoader} from "../lib/Three.es.js";


export default class Water2 extends Object3D{
    constructor(waterLevel){
        super();

        let urlsDay = [
            'resources/skybox/day/TropicalSunnyDayFront2048.png',
            'resources/skybox/day/TropicalSunnyDayBack2048.png',
            'resources/skybox/day/TropicalSunnyDayLeft2048.png',
            'resources/skybox/day/TropicalSunnyDayRight2048.png',
            'resources/skybox/day/TropicalSunnyDayUp2048.png',
            'resources/skybox/day/TropicalSunnyDayDown2048.png'];
        let urlsNight = [
            'resources/skybox/night/FullMoonFront2048.png',
            'resources/skybox/night/FullMoonBack2048.png',
            'resources/skybox/night/FullMoonLeft2048.png',
            'resources/skybox/night/FullMoonRight2048.png',
            'resources/skybox/night/FullMoonUp2048.png',
            'resources/skybox/night/FullMoonDown2048.png'];

        this.reflectionDay = new CubeTextureLoader().load(urlsDay);
        this.reflectionDay.name = "dayRef";
        this.reflectionNight = new CubeTextureLoader().load(urlsNight);
        this.reflectionNight.name = "nightRef";

        this.waterLevel = waterLevel;
        const waterGeometry = new CircleBufferGeometry(100, 32);
        const normalMap = new TextureLoader().load("resources/images/normalMapWater.jpg");
        const waterTexture = new TextureLoader().load("resources/textures/water.jpg");

        const waterMaterial = new MeshPhongMaterial({
            emissive: 0x5e807F,
            emissiveIntensity: 0.8,
            normalMap: normalMap,
            normalScale: new Vector2(1.0, 1.0),
            specular: 0xe09278,
            lights: true,
            envMap: this.reflectionNight,
            side: 1,
            reflectivity: 0.8,
            skinning: true,
        });

        this.water = new Mesh(waterGeometry, waterMaterial);
        this.water.receiveShadow = true;
        this.water.rotation.x = Math.PI * +0.5;
        this.add(this.water);

    }

    flow(deltaTime){
        this.water.position.y = Math.sin(deltaTime/4000)+ this.waterLevel;
        this.water.position.z = Math.sin(deltaTime/700);
        this.water.material.normalScale.set(Math.sin(deltaTime/900), 1.0);
    }

    dayNightEnvMap(time){
        if(time === 1){
            this.water.material.envMap = this.reflectionDay;
        }else{
            this.water.material.envMap = this.reflectionNight
        }
        this.water.material.needsUpdate = true;
    }

}