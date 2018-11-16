"use strict";
import {
    LineBasicMaterial,
    Vector3,
    Line,
    Geometry
} from "./Three.es.js";

/**
 * Collection of general purpose utilities.
 * oskarbraten
 */
export default class Utilities {
	/**
	 * Loads image from url.
	 * @param  {String} url Location of image to load.
	 * @return {Promise} A Promise-object that resolves with the Image-object.
	 */
    static loadImage(url) {
        return new Promise((resolve, reject) => {

            if (!url) {
                reject('No URL was specified.');
            }

            let image = new Image();
            image.src = url;

            image.addEventListener('load', () => {
                resolve(image);
            });

            image.addEventListener('error', () => {
                reject('Unable to load image. Make sure the URL is correct (' + image.src + ').');
            });
        });
    }

	/**
	 * Loads heightmap data from an image.
	 * The image must be completely loaded before using this method.
	 * @param  {Image} image Image to load.
	 * @return {Array} A Uint8Array containing the heightmap data.
	 */
    static getHeightmapData(image, size) {
        let canvas = document.createElement('canvas');

        // assume texture is a square
        canvas.width = size;
        canvas.height = size;

        let context = canvas.getContext('2d');
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";

        let data = new Float32Array(size * size);

        context.drawImage(image, 0, 0, size, size);

        let imageData = context.getImageData(0, 0, size, size).data;

        imageData.forEach((a, i) => {
            if (i % 4 === 0) { // only extract the first component of (r,g,b,a).
                data[Math.floor(i / 4)] = a / 255;
            }
        });

        return data;
    }


    static getRandomCord(min, max) {
        this.min = Math.ceil(min);
        this.max = Math.floor(max);
        return Math.floor(Math.random() * (this.max - this.min)) + this.min; //The maximum is exclusive and the minimum is inclusive
    }

    static randomXAndZCord(position, terrainGeometry, waterLevel) {


        do{
            position.x = this.getRandomCord(-50, 50);
            position.z = this.getRandomCord(-50, 50);
            position.y = terrainGeometry.getHeightAt(position);
        }while(position.y < waterLevel || position.y > 10.0);


        return position
    }

    static cloneObjects(object, numberOfClones = 20){
        let clones = [];
        clones[0] = object;

        for(let x = 0; x < numberOfClones; x++){
            clones[x+1] = clones[x].clone();
        }
        return clones;
    }

    static transformQuat(out, a, q) {
        // benchmarks: https://jsperf.com/quaternion-transform-vec3-implementations-fixed
        var qx = q[0],
            qy = q[1],
            qz = q[2],
            qw = q[3];
        var x = a[0],
            y = a[1],
            z = a[2];
        // var qvec = [qx, qy, qz];
        // var uv = vec3.cross([], qvec, a);
        var uvx = qy * z - qz * y,
            uvy = qz * x - qx * z,
            uvz = qx * y - qy * x;
        // var uuv = vec3.cross([], qvec, uv);
        var uuvx = qy * uvz - qz * uvy,
            uuvy = qz * uvx - qx * uvz,
            uuvz = qx * uvy - qy * uvx;
        // vec3.scale(uv, uv, 2 * w);
        var w2 = qw * 2;
        uvx *= w2;
        uvy *= w2;
        uvz *= w2;
        // vec3.scale(uuv, uuv, 2);
        uuvx *= 2;
        uuvy *= 2;
        uuvz *= 2;
        // return vec3.add(out, a, vec3.add(out, uv, uuv));
        out[0] = x + uvx + uuvx;
        out[1] = y + uvy + uuvy;
        out[2] = z + uvz + uuvz;
        return out;
    }

    static drawPath(curve){
        let vertices = curve.getSpacedPoints(50);
        let point;
        // Change 2D points to 3D points
        //Because our up is Y we have to set the y to the z poss and since waterheight is 4 we set Y to 4

        let lineGeometry = new Geometry();
        lineGeometry.vertices = vertices;
        let lineMaterial = new LineBasicMaterial({
            color: 0xffffff
        });
        let line = new Line(lineGeometry, lineMaterial);

        return line;
    }

    static getAngle( position , path){
    // get the tangent to the curve
        let tangent = path.getTangent(position).normalize();


        // change tangent to 3D

        let angle = - Math.atan( tangent.z/tangent.x);

        return angle;
    }
}
