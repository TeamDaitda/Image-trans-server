var express = require('express');

var router = express.Router();
// var Hero = require('../models/hero');



const faceapi = require("face-api.js");
const canvas = require("canvas");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { detectAllFaces } = require('face-api.js');

// mokey pathing the faceapi canvas
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const faceDetectionNet = faceapi.nets.ssdMobilenetv1;

// SsdMobilenetv1Options
const minConfidence = 0.5;

// TinyFaceDetectorOptions
const inputSize = 408;
const scoreThreshold = 0.5;

// MtcnnOptions
const minFaceSize = 50;
const scaleFactor = 0.8;

function getFaceDetectorOptions(net) {
    return net === faceapi.nets.ssdMobilenetv1 ?
        new faceapi.SsdMobilenetv1Options({ minConfidence }) :
        (net === faceapi.nets.tinyFaceDetector ?
            new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold }) :
            new faceapi.MtcnnOptions({ minFaceSize, scaleFactor })
        )
}

const faceDetectionOptions = getFaceDetectorOptions(faceDetectionNet)

// simple utils to save files
const baseDir = path.resolve(__dirname, './out')

function saveFile(fileName, buf) {
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir)
    }
    // this is ok for prototyping but using sync methods
    // is bad practice in NodeJS
    fs.writeFileSync(path.resolve(baseDir, fileName), buf)
}

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
var upload = multer({ dest: 'uploads/' });


//  Upload Image
router.post('/upload', upload.single('image'), (req, res) => {
    res.send('Uploaded! : ' + req.file.path); //  Return Object
    console.log(req.file); //  콘솔(터미널)을 통해 req.file Object 내용을 확인 가능
});

// Image TO Json
router.get('/translateImage',
    async(req, res, next) => {
        // load weights
        await faceDetectionNet.loadFromDisk('weights')
        await faceapi.nets.faceLandmark68Net.loadFromDisk('weights')

        // load the image
        const img = await canvas.loadImage('uploads/1587891e0581a28992edde5bfdac34f4')
            // const img = await canvas.loadImage('imgs_src/da.jpeg')

        // detect the faces with landmarks
        const results = await faceapi.detectAllFaces(img, faceDetectionOptions)
            .withFaceLandmarks()
            // create a new canvas and draw the detection and landmarks
        const out = faceapi.createCanvasFromMedia(img)
        faceapi.draw.drawDetections(out, results.map(res => res.detection))
        faceapi.draw.drawFaceLandmarks(out, results.map(res => res.landmarks), { drawLines: true, color: 'red' })



        // save the new canvas as image
        saveFile('faceLandmarkDetection.jpg', out.toBuffer('image/jpeg'))
        console.log('done, saved results to out/faceLandmarkDetection.jpg')
        console.log(results.map(res => res.landmarks).map(res => res.positions))
            // res.json(results.map(res => res.landmarks[0]).map(res => res._positions.map))
        res.json(results.map(res => res.landmarks));
    }
);


//  Image Upload and Translate to Json
router.get('/imageUploadAndTranslateToJson', upload.single('image'), async(req, res) => {
    //  DataBase 에 req.body로 유저 정보를 전달받은 다음 적재.
    let filePath = req.file.path;
    console.log(filePath + ' 에 저장 완료.');
    // async(req, res, next) => {
    // load weights
    console.log('faceDetectionNet load from disk weight');
    await faceDetectionNet.loadFromDisk('weights')
    console.log('faceLandmark68Net load from disk weight');
    await faceapi.nets.faceLandmark68Net.loadFromDisk('weights')

    // load the image
    const img = await canvas.loadImage(filePath);

    // detect the faces with landmarks
    const results = await faceapi.detectAllFaces(img, faceDetectionOptions)
        .withFaceLandmarks()
        // create a new canvas and draw the detection and landmarks
    const out = faceapi.createCanvasFromMedia(img)
    faceapi.draw.drawDetections(out, results.map(res => res.detection))
    faceapi.draw.drawFaceLandmarks(out, results.map(res => res.landmarks), { drawLines: true, color: 'red' })



    // save the new canvas as image
    saveFile('faceLandmarkDetection.jpg', out.toBuffer('image/jpeg'))
    console.log('done, saved results to out/faceLandmarkDetection.jpg')
    console.log(results.map(res => res.landmarks).map(res => res._positions))
    res.json(results.map(res => res.landmarks).map(res => res._positions))
        // }

});

module.exports = router;