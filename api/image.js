const express = require('express')
const router = express.Router()
const faceapi = require("face-api.js")
const canvas = require("canvas")
const fs = require("fs")
const path = require("path")
const multer = require("multer");
const { detectAllFaces } = require('face-api.js')
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
const faceDetectionNet = faceapi.nets.ssdMobilenetv1
const minConfidence = 0.5
const inputSize = 408
const scoreThreshold = 0.5
const minFaceSize = 50;
const scaleFactor = 0.8;
const faceDetectionOptions = getFaceDetectorOptions(faceDetectionNet)
const baseDir = path.resolve(__dirname, './out')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

function getFaceDetectorOptions(net) {
    return net === faceapi.nets.ssdMobilenetv1 ?
        new faceapi.SsdMobilenetv1Options({ minConfidence }) :
        (net === faceapi.nets.tinyFaceDetector ?
            new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold }) :
            new faceapi.MtcnnOptions({ minFaceSize, scaleFactor })
        )
}

function saveFile(fileName, buf) {
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir)
    }
    fs.writeFileSync(path.resolve(baseDir, fileName), buf)
}

const upload = multer({dest: 'uploads/'});

router.post('/upload', upload.single('image'), (req, res) => {
    res.send('Uploaded! : ' + req.file.path); //  Return Object
});

router.get('/translateImage',
    async(req, res, next) => {
        await faceDetectionNet.loadFromDisk('weights')
        await faceapi.nets.faceLandmark68Net.loadFromDisk('weights')
        const img = await canvas.loadImage('uploads/1587891e0581a28992edde5bfdac34f4')
        const results = await faceapi.detectAllFaces(img, faceDetectionOptions)
            .withFaceLandmarks()
        const out = faceapi.createCanvasFromMedia(img)
        faceapi.draw.drawDetections(out, results.map(res => res.detection))
        faceapi.draw.drawFaceLandmarks(out, results.map(res => res.landmarks), { drawLines: true, color: 'red' })
        saveFile('faceLandmarkDetection.jpg', out.toBuffer('image/jpeg'))
        let output;
        results.map(res => res.landmarks).map(res => {
            output = res.positions;
        });
        res.json({ "output": output });
    }
);

router.post('/imageUploadAndTranslateToJson', upload.single('image'), async(req, res) => {
    let filePath = req.file.path;
    await faceDetectionNet.loadFromDisk('weights')
    await faceapi.nets.faceLandmark68Net.loadFromDisk('weights')
    const img = await canvas.loadImage(filePath);
    const results = await faceapi.detectAllFaces(img, faceDetectionOptions)
        .withFaceLandmarks()
    const out = faceapi.createCanvasFromMedia(img)
    faceapi.draw.drawDetections(out, results.map(res => res.detection))
    faceapi.draw.drawFaceLandmarks(out, results.map(res => res.landmarks), { drawLines: true, color: 'red' })
    saveFile('faceLandmarkDetection.jpg', out.toBuffer('image/jpeg'))
    let output;
    results.map(res => res.landmarks).map(res => {
        output = res.positions;
    });
    res.json({ "output": output });
});

module.exports = router;
