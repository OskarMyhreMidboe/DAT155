import {Vector3} from "../lib/Three.es.js";


export default class KeyboardMovementController{

    constructor(camera){
        this.camera = camera;
        this.velocity = new Vector3(0.0, 0.0, 0.0);
        this.move = {
            forward: false,
            backwards: false,
            left: false,
            right: false,
            speed: 0.02
        };


        document.addEventListener('keydown', (e) =>{
            switch(e.code){
                case 'KeyW':
                    this.move.forward = true;
                    e.preventDefault();
                    break;

                case 'KeyA':
                    this.move.left = true;
                    e.preventDefault();
                    break;

                case 'KeyS':
                    this.move.backwards = true;
                    e.preventDefault();
                    break;

                case 'KeyD':
                    this.move.right = true;
                    e.preventDefault();
                    break;
            }
        });
        document.addEventListener('keyup', (e) =>{
            switch(e.code){
                case 'KeyW':
                    this.move.forward = false;
                    e.preventDefault();
                    break;

                case 'KeyA':
                    this.move.left = false;
                    e.preventDefault();
                    break;

                case 'KeyS':
                    this.move.backwards = false;
                    e.preventDefault();
                    break;

                case 'KeyD':
                    this.move.right = false;
                    e.preventDefault();
                    break;
            }
        });

    }

    update(delta){
        this.velocity.set( 0.0, 0.0, 0.0 );
        this.moveSpeed = delta*this.move.speed;

        if(this.move.left){
            this.velocity.x -= this.moveSpeed;
        }
        if(this.move.right){
            this.velocity.x += this.moveSpeed;
        }
        if(this.move.forward){
            this.velocity.z -= this.moveSpeed;
        }
        if(this.move.backwards){
            this.velocity.z += this.moveSpeed;
        }

        this.velocity.applyQuaternion(this.camera.quaternion);
        this.camera.position.add(this.velocity);
    }

}