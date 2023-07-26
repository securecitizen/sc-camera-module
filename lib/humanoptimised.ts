// /**
//  * Human demo for browsers
//  * @default Human Library
//  * @summary <https://github.com/vladmandic/human>
//  * @author <https://github.com/vladmandic>
//  * @copyright <https://github.com/vladmandic>
//  * @license MIT
//  */

import * as H from '@vladmandic/human'

const humanConfig: Partial<H.Config> = {
    // user configuration for human, used to fine-tune behavior
    cacheSensitivity: 0,
    modelBasePath: 'models', // models can be loaded directly from cdn as well
    debug: true,
    backend: 'webgl',
    filter: { enabled: true, equalization: true, flip: false }, // lets run with histogram equilizer
    face: {
        enabled: true,
        detector: { rotation: false, return: true, mask: false }, // return tensor is used to get detected face image
        mesh: { enabled: true },
        attention: { enabled: false }, // TODO: need to see how this works ??
        description: { enabled: true }, // default model for face descriptor extraction is faceres
        // mobilefacenet: { enabled: true, modelPath: 'https://vladmandic.github.io/human-models/models/mobilefacenet.json' }, // alternative model
        // insightface: { enabled: true, modelPath: 'https://vladmandic.github.io/insightface/models/insightface-mobilenet-swish.json' }, // alternative model
        iris: { enabled: true }, // needed to determine gaze direction
        emotion: { enabled: false }, // not needed
        antispoof: { enabled: true }, // enable optional antispoof module
        liveness: { enabled: true }, // enable optional liveness module
        // scale: 1.5
    },
    body: { enabled: false },
    hand: { enabled: false },
    gesture: { enabled: true }, // parses face and iris gestures
    object: { enabled: false },
    segmentation: { enabled: false },
}

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

const ok: Record<string, { status: boolean | undefined; val: number }> = {
    // must meet all rules
    faceCount: { status: false, val: 0 },
    faceConfidence: { status: false, val: 0 },
    facingCenter: { status: false, val: 0 },
    lookingCenter: { status: false, val: 0 },
    blinkDetected: { status: false, val: 0 },
    faceSize: { status: false, val: 0 },
    antispoofCheck: { status: false, val: 0 },
    livenessCheck: { status: false, val: 0 },
    distance: { status: false, val: 0 },
    age: { status: false, val: 0 },
    gender: { status: false, val: 0 },
    timeout: { status: true, val: 0 },
    descriptor: { status: false, val: 0 },
    elapsedMs: { status: undefined, val: 0 }, // total time while waiting for valid face
    detectFPS: { status: undefined, val: 0 }, // mark detection fps performance
    drawFPS: { status: undefined, val: 0 }, // mark redraw fps performance
}

const allOk = () =>
    ok.faceCount.status &&
    ok.faceSize.status &&
    ok.blinkDetected.status &&
    ok.facingCenter.status &&
    ok.lookingCenter.status &&
    ok.faceConfidence.status &&
    ok.antispoofCheck.status &&
    ok.livenessCheck.status &&
    ok.distance.status &&
    ok.descriptor.status &&
    ok.age.status &&
    ok.gender.status

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
// human.draw.options.lineHeight = 20;

const dom = {
    // grab instances of dom objects so we dont have to look them up later
    canvas: document.getElementById('canvas') as HTMLCanvasElement,
    log: document.getElementById('messageOutput') as HTMLPreElement,
    fps: document.getElementById('fps') as HTMLPreElement,
    // perf: document.getElementById('performance') as HTMLDivElement,
    ok: document.getElementById('ok') as HTMLDivElement,
}

const timestamp = { detect: 0, draw: 0 } // holds information used to calculate performance and possible memory leaks
let startTime = 0

const log = (...msg) => {
    // helper method to output messages
    dom.log.innerText += msg.join(' ') + '\n'
    console.log(...msg) // eslint-disable-line no-console
}

// async function detectionLoop() { // main detection loop
//   if (!human.webcam.element?.paused) {
//     if (current.face?.tensor) human.tf.dispose(current.face.tensor); // dispose previous tensor
//     await human.detect(human.webcam.element); // actual detection; were not capturing output in a local variable as it can also be reached via human.result
//     const now = human.now();
//     ok.detectFPS.val = Math.round(10000 / (now - timestamp.detect)) / 10;
//     timestamp.detect = now;
//     requestAnimationFrame(detectionLoop); // start new frame immediately
//   }
// }

function drawValidationTests() {
    let y = 32
    for (const [key, val] of Object.entries(ok)) {
        let el = document.getElementById(`ok-${key}`)
        if (!el) {
            el = document.createElement('div')
            el.id = `ok-${key}`
            el.innerText = key
            el.className = 'ok'
            el.style.top = `${y}px`
            dom.ok.appendChild(el)
        }
        if (typeof val.status === 'boolean')
            el.style.backgroundColor = val.status ? 'lightgreen' : 'lightcoral'
        const status = val.status ? 'ok' : 'fail'
        el.innerText = `${key}: ${val.val === 0 ? status : val.val}`
        y += 28
    }
}

async function validationLoop(): Promise<H.FaceResult> {
    // main screen refresh loop
    const interpolated = human.next(human.result) // smoothen result using last-known results
    human.draw.canvas(human.webcam.element!, dom.canvas) // draw canvas to screen
    await human.draw.all(dom.canvas, interpolated) // draw labels, boxes, lines, etc.
    const now = human.now()
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
    drawValidationTests()
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
    dom.canvas.style.height = ''
    dom.canvas
        .getContext('2d')
        ?.clearRect(0, 0, options.minSize, options.minSize)
    if (!current?.face?.tensor || !current?.face?.embedding) return false
    console.log('face record:', current.face) // eslint-disable-line no-console
    log(
        `detected face: ${current.face.gender} ${
            current.face.age || 0
        }y distance ${100 * (current.face.distance || 0)}cm/${Math.round(
            (100 * (current.face.distance || 0)) / 2.54
        )}in`
    )
    await human.tf.browser.toPixels(current.face.tensor, dom.canvas)
}

// async function drawLoop() {
//     // main screen refresh loop
//     const interpolated = human.next() // get smoothened result using last-known results which are continously updated based on input webcam video
//     human.draw.canvas(human.webcam.element!, dom.canvas) // draw webcam video to screen canvas // better than using procesed image as this loop happens faster than processing loop
//     await human.draw.all(dom.canvas, interpolated) // draw labels, boxes, lines, etc.
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
    dom.log.innerHTML = `human version: ${human.version} | tfjs version: ${human.tf.version['tfjs-core']}<br>platform: ${human.env.platform} | agent ${human.env.agent}`
    await human.webcam.start({ crop: true }) // find webcam and start it
    human.video(human.webcam.element!) // instruct human to continously detect video frames
    dom.canvas.width = human.webcam.width // set canvas resolution to input webcam native resolution
    dom.canvas.height = human.webcam.height
    dom.canvas.onclick = async () => {
        // pause when clicked on screen and resume on next click
        if (human.webcam.paused) {
          await human.webcam.play();
        }
        else human.webcam.pause()
    }
    startTime = human.now()
    current.face = await validationLoop() // start validation/draw loop
    dom.canvas.width = current.face?.tensor?.shape[1] || options.minSize
    dom.canvas.height = current.face?.tensor?.shape[0] || options.minSize
    dom.canvas.style.width = ''
    if (!allOk()) {
        // is all criteria met?
        log('did not find valid face')
        return false
    }
    return detectFace()
}

async function init() {
  log('human version:', human.version, '| tfjs version:', human.tf.version['tfjs-core']);
  log('options:', JSON.stringify(options).replace(/{|}|"|\[|\]/g, '').replace(/,/g, ' '));
  log('initializing webcam...');
  log('loading human models...');
  await human.load(); // preload all models
  log('initializing human...');
  log('face embedding model:', humanConfig.face?.description?.enabled ? 'faceres' : '', humanConfig.face!['mobilefacenet']?.enabled ? 'mobilefacenet' : '', humanConfig.face!['insightface']?.enabled ? 'insightface' : '');
  log('loading face database...');
  await human.warmup(); // warmup function to initialize backend for future faster detection
  await main();
}

export default {
    init: init,
    log,
}
