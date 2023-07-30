import { ContainerType, IDomContainer, IFullDomContainer, allOk, drawValidationTests, ok } from "../utils/detection";
import * as H from '@vladmandic/human'
import humanConfig from './camera-configs'
import { log } from "../utils/errors";
import drawOptions from "./draw-templates";
import { InitConfig } from "../utils/configuration";
import { DEFAULT_MESSAGE_OUTSINK } from "../utils/defaults";

class SecureCitizenCamera {
    public dom: IFullDomContainer | IDomContainer;
    public human: H.Human;
    // const matchOptions = { order: 2, multiplier: 1000, min: 0.0, max: 1.0 }; // for embedding model
    public matchOptions = { order: 2, multiplier: 25, min: 0.2, max: 0.8 } // for faceres model
    public debug = false;

    public options = {
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
        ...this.matchOptions,
    }

    public current: { face: H.FaceResult | null } = { face: null } // current face record and matched database record

    public blink = {
        // internal timers for blink start/end/duration
        start: 0,
        end: 0,
        time: 0,
    }

    public timestamp = { detect: 0, draw: 0 } // holds information used to calculate performance and possible memory leaks
    public startTime = 0

    protected sourceDomElements(): void {
        // grab instances of dom objects so we dont have to look them up later
        this.dom.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.dom.fps = document.getElementById('fps') as HTMLPreElement;
        this.dom.ok = document.getElementById('ok') as HTMLDivElement;

        // Add additional elements if full
        if(this.dom instanceof IFullDomContainer) {
            this.dom.match = document.getElementById('match') as HTMLDivElement;
            this.dom.name = document.getElementById('name') as HTMLInputElement;
            this.dom.save =  document.getElementById('save') as HTMLSpanElement;
            this.dom.delete = document.getElementById('delete') as HTMLSpanElement;
            this.dom.retry = document.getElementById('retry') as HTMLDivElement;
            this.dom.source = document.getElementById('source') as HTMLCanvasElement;
        }

        if(this.debug) {
            this.dom.ok.style.visibility = 'hidden';
        }
    }

    constructor(config: InitConfig, type: ContainerType = ContainerType.Minimal)
    {
        // configure debug to what has been provided in the config
        this.debug = config.debug ?? false;

        console.log('Debug Mode: ' + this.debug);

        switch(type) {
            case ContainerType.Full:
                this.dom = new IFullDomContainer();
                break;
            case ContainerType.Minimal:
                this.dom = new IDomContainer();
                break;
        }

        this.sourceDomElements();

        this.human = new H.Human(humanConfig);
        
        this.human.env.perfadd = false // is performance data showing instant or total values
        // this.human.draw.options.font = 'small-caps 18px "Lato"'; // set font used to draw labels when using draw methods
        this.human.draw.options.lineHeight = 20;

        if(this.debug) {
            this.human.draw.options.drawPoints = true; // draw points on face mesh
        }
    }

    public async validationLoop(): Promise<H.FaceResult> {
        // main screen refresh loop
        const interpolated = this.human.next(this.human.result) // smoothen result using last-known results
        this.human.draw.canvas(this.human.webcam.element!, this.dom.canvas) // draw canvas to screen
    
        if(this.debug) {
            await this.human.draw.all(this.dom.canvas, interpolated, drawOptions) // draw labels, boxes, lines, etc.
        }
        
        const now = this.human.now()
        ok.detectFPS.val = Math.round(10000 / (now - this.timestamp.detect)) / 10;
        ok.drawFPS.val = Math.round(10000 / (now - this.timestamp.draw)) / 10
        this.timestamp.draw = now
        ok.faceCount.val = this.human.result.face.length
        ok.faceCount.status = ok.faceCount.val === 1 // must be exactly detected face
        if (ok.faceCount.status) {
            // skip the rest if no face
            const gestures: string[] = Object.values(this.human.result.gesture).map(
                (gesture: H.GestureResult) => gesture.gesture
            ) // flatten all gestures
            if (
                gestures.includes('blink left eye') ||
                gestures.includes('blink right eye')
            )
                this.blink.start = this.human.now() // blink starts when eyes get closed
            if (
                this.blink.start > 0 &&
                !gestures.includes('blink left eye') &&
                !gestures.includes('blink right eye')
            )
                this.blink.end = this.human.now() // if blink started how long until eyes are back open
            ok.blinkDetected.status =
                ok.blinkDetected.status ||
                (Math.abs(this.blink.end - this.blink.start) > this.options.blinkMin &&
                    Math.abs(this.blink.end - this.blink.start) < this.options.blinkMax)
            if (ok.blinkDetected.status && this.blink.time === 0)
                this.blink.time = Math.trunc(this.blink.end - this.blink.start)
            ok.facingCenter.status = gestures.includes('facing center')
            ok.lookingCenter.status = gestures.includes('looking center') // must face camera and look at camera
            ok.faceConfidence.val =
                this.human.result.face[0].faceScore || this.human.result.face[0].boxScore || 0
            ok.faceConfidence.status =
                ok.faceConfidence.val >= this.options.minConfidence
            ok.antispoofCheck.val = this.human.result.face[0].real || 0
            ok.antispoofCheck.status =
                ok.antispoofCheck.val >= this.options.minConfidence
            ok.livenessCheck.val = this.human.result.face[0].live || 0
            ok.livenessCheck.status = ok.livenessCheck.val >= this.options.minConfidence
            ok.faceSize.val = Math.min(
                this.human.result.face[0].box[2],
                this.human.result.face[0].box[3]
            )
            ok.faceSize.status = ok.faceSize.val >= this.options.minSize
            ok.distance.val = this.human.result.face[0].distance || 0
            ok.distance.status =
                ok.distance.val >= this.options.distanceMin &&
                ok.distance.val <= this.options.distanceMax
            ok.descriptor.val = this.human.result.face[0].embedding?.length || 0
            ok.descriptor.status = ok.descriptor.val > 0
            ok.age.val = this.human.result.face[0].age || 0
            ok.age.status = ok.age.val > 0
            ok.gender.val = this.human.result.face[0].genderScore || 0
            ok.gender.status = ok.gender.val >= this.options.minConfidence
        }
        // run again
        ok.timeout.status = ok.elapsedMs.val <= this.options.maxTime
        drawValidationTests(this.dom)
        if (allOk() || !ok.timeout.status) {
            // all criteria met
            this.human.webcam.element?.pause()
            return this.human.result.face[0]
        }
        ok.elapsedMs.val = Math.trunc(this.human.now() - this.startTime)
        return new Promise((resolve) => {
            setTimeout(async () => {
                await this.validationLoop() // run validation loop until conditions are met
                resolve(this.human.result.face[0]) // recursive promise resolve
            }, 30) // use to slow down refresh from max refresh rate to target of 30 fps
        })
    }
    
    public async detectFace() {
        this.dom.canvas.style.height = ''
        this.dom.canvas
            .getContext('2d')
            ?.clearRect(0, 0, this.options.minSize, this.options.minSize)
        if (!this.current?.face?.tensor || !this.current?.face?.embedding) return false
        
        console.log('face record:', this.current.face) // eslint-disable-line no-console
        
        // log(this.log,
        //     `detected face: ${this.current.face.gender} ${
        //         this.current.face.age || 0
        //     }y distance ${100 * (this.current.face.distance || 0)}cm/${Math.round(
        //         (100 * (this.current.face.distance || 0)) / 2.54
        //     )}in`
        // )
    
        await this.human.tf.browser.toPixels(this.current.face.tensor, this.dom.canvas)
        this.human.tf.dispose(this.current.face.tensor);
    }
    
    // async function drawLoop() {
    //     // main screen refresh loop
    //     const interpolated = this.human.next() // get smoothened result using last-known results which are continously updated based on input webcam video
    //     this.human.draw.canvas(this.human.webcam.element!, this.dom.canvas) // draw webcam video to screen canvas // better than using procesed image as this loop happens faster than processing loop
    //     await this.human.draw.all(this.dom.canvas, interpolated) // draw labels, boxes, lines, etc.
    //     setTimeout(drawLoop, 30) // use to slow down refresh from max refresh rate to target of 1000/30 ~ 30 fps
    // }
    
    public async main() {
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
        // this.log.innerHTML = `human version: ${this.human.version} | tfjs version: ${this.human.tf.version['tfjs-core']}<br>platform: ${this.human.env.platform} | agent ${this.human.env.agent}`
        await this.human.webcam.start({ crop: true }) // find webcam and start it
        this.human.video(this.human.webcam.element!) // instruct human to continously detect video frames
        this.dom.canvas.width = this.human.webcam.width // set canvas resolution to input webcam native resolution
        this.dom.canvas.height = this.human.webcam.height
        this.dom.canvas.onclick = async () => {
            // pause when clicked on screen and resume on next click
            if (this.human.webcam.paused) {
              await this.human.webcam.play();
            }
            else this.human.webcam.pause()
        }
        this.startTime = this.human.now()
        this.current.face = await this.validationLoop() // start validation/draw loop
        this.dom.canvas.width = this.current.face?.tensor?.shape[1] || this.options.minSize
        this.dom.canvas.height = this.current.face?.tensor?.shape[0] || this.options.minSize
        this.dom.canvas.style.width = ''
        if (!allOk()) {
            // is all criteria met?
            // log(this.log, 'did not find valid face')
            return false
        }
        return this.detectFace()
    }

    public async init(messageOutputElement: HTMLPreElement) {
        log(messageOutputElement, 'human version:', this.human.version, '| tfjs version:', this.human.tf.version['tfjs-core']);
        log(messageOutputElement, 'options:', JSON.stringify(this.options).replace(/{|}|"|\[|\]/g, '').replace(/,/g, ' '));
        log(messageOutputElement, 'initializing webcam...');
        log(messageOutputElement, 'loading human models...');
        await this.human.load(); // preload all models
        log(messageOutputElement, 'initializing this.human...');
        log(messageOutputElement, 'face embedding model:', humanConfig.face?.description?.enabled ? 'faceres' : '', humanConfig.face!['mobilefacenet']?.enabled ? 'mobilefacenet' : '', humanConfig.face!['insightface']?.enabled ? 'insightface' : '');
        log(messageOutputElement, 'loading face database...');
        await this.human.warmup(); // warmup function to initialize backend for future faster detection
        await this.main();
      }
}

export { SecureCitizenCamera };