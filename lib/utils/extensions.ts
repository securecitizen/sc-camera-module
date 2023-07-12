import * as faceapi from '@vladmandic/face-api';
let path = require("path");

async function loadModelsFromDisk() {

    await faceapi.nets.tinyFaceDetector.loadFromDisk(path.join(__dirname, '../models'));
    await faceapi.nets.faceLandmark68TinyNet.loadFromDisk(path.join(__dirname, '../models'));
}

async function loadModelsFromPackage() {

    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
       await faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models');
       
}

export { loadModelsFromPackage, loadModelsFromDisk }

