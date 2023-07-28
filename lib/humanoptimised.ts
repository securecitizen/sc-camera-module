// /**
//  * Human demo for browsers
//  * @default Human Library
//  * @summary <https://github.com/vladmandic/human>
//  * @author <https://github.com/vladmandic>
//  * @copyright <https://github.com/vladmandic>
//  * @license MIT
//  */

import * as H from '@vladmandic/human'
import humanConfig from './components/camera-configs'
import { ok, allOk, drawValidationTests } from './utils/detection'
import { log } from './utils/errors'
import drawOptions from './components/draw-templates'
import { SecureCitizenCamera } from './components/camera'

// const matchOptions = { order: 2, multiplier: 1000, min: 0.0, max: 1.0 }; // for embedding model
const matchOptions = { order: 2, multiplier: 25, min: 0.2, max: 0.8 } // for faceres model

const options = {
    minConfidence: 0.6, // overal face confidence for box, face, gender, real, live
    minSize: 264, // min input to face descriptor model before degradation
    maxTime: 30000, // max time before giving up
    blinkMin: 10, // minimum duration of a valid blink
    blinkMax: 800, // maximum duration of a valid blink
    threshold: 0.5, // minimum similarity
    distanceMin: 0.4, // closest that face is allowed to be to the cammera in cm
    distanceMax: 1.0, // farthest that face is allowed to be to the cammera in cm
    mask: humanConfig.face?.detector?.mask,
    rotation: humanConfig.face?.detector?.rotation,
    ...matchOptions,
}

const current: { face: H.FaceResult | null } = { face: null } // current face record and matched database record

const blink = {
    // internal timers for blink start/end/duration
    start: 0,
    end: 0,
    time: 0,
}

const human = new H.Human(humanConfig) // create instance of human with overrides from user configuration

human.env.perfadd = false // is performance data showing instant or total values
// human.draw.options.font = 'small-caps 18px "Lato"'; // set font used to draw labels when using draw methods
human.draw.options.lineHeight = 20;

const sccamera = new SecureCitizenCamera();

const timestamp = { detect: 0, draw: 0 } // holds information used to calculate performance and possible memory leaks
let startTime = 0

async function validationLoop(): Promise<H.FaceResult> {
    // main screen refresh loop
    const interpolated = human.next(human.result) // smoothen result using last-known results
    human.draw.canvas(human.webcam.element!, sccamera.dom.canvas) // draw canvas to screen

    await human.draw.all(sccamera.dom.canvas, interpolated, drawOptions) // draw labels, boxes, lines, etc.
    const now = human.now()
    ok.detectFPS.val = Math.round(10000 / (now - timestamp.detect)) / 10;
    ok.drawFPS.val = Math.round(10000 / (now - timestamp.draw)) / 10
    timestamp.draw = now
    ok.faceCount.val = human.result.face.length
    ok.faceCount.status = ok.faceCount.val === 1 // must be exactly detected face
    if (ok.faceCount.status) {
        // skip the rest if no face
        const gestures: string[] = Object.values(human.result.gesture).map(
            (gesture: H.GestureResult) => gesture.gesture
        ) // flatten all gestures
        if (
            gestures.includes('blink left eye') ||
            gestures.includes('blink right eye')
        )
            blink.start = human.now() // blink starts when eyes get closed
        if (
            blink.start > 0 &&
            !gestures.includes('blink left eye') &&
            !gestures.includes('blink right eye')
        )
            blink.end = human.now() // if blink started how long until eyes are back open
        ok.blinkDetected.status =
            ok.blinkDetected.status ||
            (Math.abs(blink.end - blink.start) > options.blinkMin &&
                Math.abs(blink.end - blink.start) < options.blinkMax)
        if (ok.blinkDetected.status && blink.time === 0)
            blink.time = Math.trunc(blink.end - blink.start)
        ok.facingCenter.status = gestures.includes('facing center')
        ok.lookingCenter.status = gestures.includes('looking center') // must face camera and look at camera
        ok.faceConfidence.val =
            human.result.face[0].faceScore || human.result.face[0].boxScore || 0
        ok.faceConfidence.status =
            ok.faceConfidence.val >= options.minConfidence
        ok.antispoofCheck.val = human.result.face[0].real || 0
        ok.antispoofCheck.status =
            ok.antispoofCheck.val >= options.minConfidence
        ok.livenessCheck.val = human.result.face[0].live || 0
        ok.livenessCheck.status = ok.livenessCheck.val >= options.minConfidence
        ok.faceSize.val = Math.min(
            human.result.face[0].box[2],
            human.result.face[0].box[3]
        )
        ok.faceSize.status = ok.faceSize.val >= options.minSize
        ok.distance.val = human.result.face[0].distance || 0
        ok.distance.status =
            ok.distance.val >= options.distanceMin &&
            ok.distance.val <= options.distanceMax
        ok.descriptor.val = human.result.face[0].embedding?.length || 0
        ok.descriptor.status = ok.descriptor.val > 0
        ok.age.val = human.result.face[0].age || 0
        ok.age.status = ok.age.val > 0
        ok.gender.val = human.result.face[0].genderScore || 0
        ok.gender.status = ok.gender.val >= options.minConfidence
    }
    // run again
    ok.timeout.status = ok.elapsedMs.val <= options.maxTime
    drawValidationTests(sccamera.dom)
    if (allOk() || !ok.timeout.status) {
        // all criteria met
        human.webcam.element?.pause()
        return human.result.face[0]
    }
    ok.elapsedMs.val = Math.trunc(human.now() - startTime)
    return new Promise((resolve) => {
        setTimeout(async () => {
            await validationLoop() // run validation loop until conditions are met
            resolve(human.result.face[0]) // recursive promise resolve
        }, 30) // use to slow down refresh from max refresh rate to target of 30 fps
    })
}

async function detectFace() {
    sccamera.dom.canvas.style.height = ''
    sccamera.dom.canvas
        .getContext('2d')
        ?.clearRect(0, 0, options.minSize, options.minSize)
    if (!current?.face?.tensor || !current?.face?.embedding) return false
    
    console.log('face record:', current.face) // eslint-disable-line no-console
    
    log(sccamera.dom,
        `detected face: ${current.face.gender} ${
            current.face.age || 0
        }y distance ${100 * (current.face.distance || 0)}cm/${Math.round(
            (100 * (current.face.distance || 0)) / 2.54
        )}in`
    )

    await human.tf.browser.toPixels(current.face.tensor, sccamera.dom.canvas)
    
}

// async function drawLoop() {
//     // main screen refresh loop
//     const interpolated = human.next() // get smoothened result using last-known results which are continously updated based on input webcam video
//     human.draw.canvas(human.webcam.element!, sccamera.dom.canvas) // draw webcam video to screen canvas // better than using procesed image as this loop happens faster than processing loop
//     await human.draw.all(sccamera.dom.canvas, interpolated) // draw labels, boxes, lines, etc.
//     setTimeout(drawLoop, 30) // use to slow down refresh from max refresh rate to target of 1000/30 ~ 30 fps
// }

async function main() {
    ok.faceCount.status = false
    ok.faceConfidence.status = false
    ok.facingCenter.status = false
    ok.blinkDetected.status = false
    ok.faceSize.status = false
    ok.antispoofCheck.status = false
    ok.livenessCheck.status = false
    ok.age.status = false
    ok.gender.status = false
    ok.elapsedMs.val = 0

    // main entry point
    sccamera.dom.log.innerHTML = `human version: ${human.version} | tfjs version: ${human.tf.version['tfjs-core']}<br>platform: ${human.env.platform} | agent ${human.env.agent}`
    await human.webcam.start({ crop: true }) // find webcam and start it
    human.video(human.webcam.element!) // instruct human to continously detect video frames
    sccamera.dom.canvas.width = human.webcam.width // set canvas resolution to input webcam native resolution
    sccamera.dom.canvas.height = human.webcam.height
    sccamera.dom.canvas.onclick = async () => {
        // pause when clicked on screen and resume on next click
        if (human.webcam.paused) {
          await human.webcam.play();
        }
        else human.webcam.pause()
    }
    startTime = human.now()
    current.face = await validationLoop() // start validation/draw loop
    sccamera.dom.canvas.width = current.face?.tensor?.shape[1] || options.minSize
    sccamera.dom.canvas.height = current.face?.tensor?.shape[0] || options.minSize
    sccamera.dom.canvas.style.width = ''
    if (!allOk()) {
        // is all criteria met?
        log(dom, 'did not find valid face')
        return false
    }
    return detectFace()
}

async function init() {
  log(sccamera.dom, 'human version:', human.version, '| tfjs version:', human.tf.version['tfjs-core']);
  log(sccamera.dom, 'options:', JSON.stringify(options).replace(/{|}|"|\[|\]/g, '').replace(/,/g, ' '));
  log(sccamera.dom, 'initializing webcam...');
  log(sccamera.dom, 'loading human models...');
  await human.load(); // preload all models
  log(sccamera.dom, 'initializing human...');
  log(sccamera.dom, 'face embedding model:', humanConfig.face?.description?.enabled ? 'faceres' : '', humanConfig.face!['mobilefacenet']?.enabled ? 'mobilefacenet' : '', humanConfig.face!['insightface']?.enabled ? 'insightface' : '');
  log(sccamera.dom, 'loading face database...');
  await human.warmup(); // warmup function to initialize backend for future faster detection
  await main();
}

export default {
    init: init,
    log,
}
