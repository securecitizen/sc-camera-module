import { allOk, drawValidationTests, ok } from "../utils/detection";
import * as H from '@vladmandic/human'
import humanConfig from './camera-configs'
import { log, logMessages } from "../utils/errors";
import drawOptions from "./draw-templates";
import { InitConfig } from "../utils/configuration";
import { EventBroker } from "../utils/typedeventemitter";

class SecureCitizenCamera {
    public videoElement: HTMLVideoElement | undefined // this needs to be something that can be provided, or searched for in the HTML - 
    // in this case if it is not defined (video) we let human manage the video feed later on
    public canvasElement: HTMLCanvasElement // this needs to be something that can be provided, or searched for in the HTML
    public fpsElement: HTMLPreElement | undefined // this needs to be something that can be provided, or searched for in the HTML
    // in this case if it is not defined (fps) we dont output fps values from Human
    public okElement: HTMLDivElement // this needs to be something that can be provided, or searched for in the HTML
    public messageElement: HTMLPreElement; // this needs to be something that can be provided, or searched for in the HTML
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

    constructor(
        config: InitConfig,
        override?: {
            canvasElement?: HTMLCanvasElement | undefined,
            okElement?: HTMLDivElement | undefined,
            messageElement?: HTMLPreElement | undefined,
        },
        optional?: {
            fpsElement?: HTMLPreElement | undefined,
            videoElement?: HTMLVideoElement | undefined
        }
        )
    {
        // configure debug to what has been provided in the config
        this.debug = config.debug ?? false;

        log('Debug Mode: ' + this.debug);

        // check to see 
        // grab instances of dom objects so we dont have to look them up later
        
        if(override) {
            if(!(override.canvasElement || override.okElement || override.messageElement )) {
                throw Error("This library requires some configured HTML capabilities to operate, if overriding these HTML objects need to exist");
            }
            // we can set this to the override values
            this.canvasElement = override.canvasElement!;  
            log('Found Override: ' + this.canvasElement.id)
            this.okElement = override.okElement!;
            log('Found Override: ' + this.okElement.id)
            this.messageElement = override.messageElement!;
            log('Found Override: ' + this.messageElement.id)
        } else {
            // otherwise we try and fetch this from the HTML itself
            this.canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
            this.okElement = document.getElementById('ok') as HTMLDivElement;
            this.messageElement = document.getElementById('messageOutput') as HTMLPreElement;
        }

        // if the still have not been set to a value as yet, we throw an Error
        if(!(this.canvasElement || this.okElement || this.messageElement )) throw Error("This library requires some configured HTML capabilities to operate");

        // if(this.debug) {
        //     this.ok.style.visibility = 'visible';
        // }
        //  else {
        //     this.ok.style.visibility = 'hidden';
        // }

        this.human = new H.Human(humanConfig);

        if(optional?.videoElement !== undefined) {
            this.videoElement = optional.videoElement;
        }

        if(optional?.fpsElement !== undefined) {
            this.fpsElement = optional.fpsElement;
            log('Found FPS Config: ' + this.fpsElement.id)
        }
        
        this.human.env.perfadd = false // is performance data showing instant or total values
        // this.human.draw.options.font = 'small-caps 18px "Lato"'; // set font used to draw labels when using draw methods
        this.human.draw.options.lineHeight = 16;

        if(this.debug) {
            this.human.draw.options.drawPoints = true; // draw points on face mesh
        } 
        // else {
        //     this.human.draw.options.drawPoints = false; // dont draw points on face mesh
        // }
    }

    public async validationLoop(): Promise<H.FaceResult> {
        // main screen refresh loop
        const interpolated = this.human.next(this.human.result) // smoothen result using last-known results
        this.human.draw.canvas(this.human.webcam.element!, this.canvasElement) // draw canvas to screen
    
        if(this.debug) {
            await this.human.draw.all(this.canvasElement, interpolated, drawOptions) // draw labels, boxes, lines, etc.
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
            // ok.age.val = this.human.result.face[0].age || 0
            // ok.age.status = ok.age.val > 0
            // ok.gender.val = this.human.result.face[0].genderScore || 0
            // ok.gender.status = ok.gender.val >= this.options.minConfidence
        }
        // run again
        ok.timeout.status = ok.elapsedMs.val <= this.options.maxTime
        drawValidationTests(this.okElement)
        if (allOk() || !ok.timeout.status) {
            // all criteria met
            // const lastImageData = this.canvasElement.getContext('2d')?.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height) as ImageData;
            
            this.human.webcam.element?.pause();
            const interpolated = this.human.next() // get smoothened result using last-known results which are continously updated based on input webcam video
            this.human.draw.canvas(interpolated.canvas!, this.canvasElement) // we obviously detected this, so write this to the canvas as the final image
            const lastImage = this.canvasElement.toDataURL();
            EventBroker.emit('photoTaken', 200, lastImage);
            return this.human.result.face[0];
        }
        ok.elapsedMs.val = Math.trunc(this.human.now() - this.startTime)
        return new Promise((resolve) => {
            setTimeout(async () => {
                await this.validationLoop() // run validation loop until conditions are met
                resolve(this.human.result.face[0]) // recursive promise resolve
            }, 30) // use to slow down refresh from max refresh rate to target of 30 fps
        })
    }
    
    public async detectFace(): Promise<boolean> {
        this.canvasElement.style.height = ''
        this.canvasElement
            .getContext('2d')
            ?.clearRect(0, 0, this.options.minSize, this.options.minSize);
        
        if (!this.current?.face?.tensor || !this.current?.face?.embedding) return false;
        
        log('face record:', this.current.face); // eslint-disable-line no-console
        
        log(`detected face: ${this.current.face.gender} ${
                this.current.face.age || 0
            }y distance ${100 * (this.current.face.distance || 0)}cm/${Math.round(
                (100 * (this.current.face.distance || 0)) / 2.54
            )}in`
        )
    
        await this.human.tf.browser.toPixels(this.current.face.tensor, this.canvasElement);
        this.human.tf.dispose(this.current.face.tensor);
        return true;
    }
    
    // async function drawLoop() {
    //     // main screen refresh loop
    //     const interpolated = this.human.next() // get smoothened result using last-known results which are continously updated based on input webcam video
    //     this.human.draw.canvas(this.human.webcam.element!, this.canvas) // draw webcam video to screen canvas // better than using procesed image as this loop happens faster than processing loop
    //     await this.human.draw.all(this.canvas, interpolated) // draw labels, boxes, lines, etc.
    //     setTimeout(drawLoop, 30) // use to slow down refresh from max refresh rate to target of 1000/30 ~ 30 fps
    // }

    /**
    * SubscribeToPhotoTaken
    */
    public SubscribeToPhotoTaken(f: Function) {
        EventBroker.on('photoTaken', (statusCode: number, photoString: string) => {
        f(statusCode, photoString);
        })
    }
    
    public async main() {
        ok.faceCount.status = false
        ok.faceConfidence.status = false
        ok.facingCenter.status = false
        ok.blinkDetected.status = false
        ok.faceSize.status = false
        ok.antispoofCheck.status = false
        ok.livenessCheck.status = false
        // ok.age.status = false
        // ok.gender.status = false
        ok.elapsedMs.val = 0

        if(this.debug) {
            // unhide the ok results listing
            this.okElement.hidden = false;
        }
    
        // main entry point
        this.messageElement.innerHTML = `human version: ${this.human.version} | tfjs version: ${this.human.tf.version['tfjs-core']}<br>platform: ${this.human.env.platform} | agent ${this.human.env.agent}`
        
        // check if we were given an HTML element (checked and set during constructor)
        if(this.videoElement !== undefined) 
        {
            await this.human.webcam.start({ element: this.videoElement, crop: true }) // find video element and start it
            logMessages(this.messageElement, "Starting WebCam via Video Tag " + this.videoElement.id);
            log("Starting WebCam via Video Tag " + this.videoElement.id);
        } 
        else {
            await this.human.webcam.start({ crop: true }) // find webcam and start it
            logMessages(this.messageElement, "Starting WebCam Automagically");
            log("Starting WebCam Automagically");
        }

        this.human.video(this.human.webcam.element!) // instruct human to continously detect video frames
        this.canvasElement.width = this.human.webcam.width // set canvas resolution to input webcam native resolution
        this.canvasElement.height = this.human.webcam.height
        // unhide the canvas
        this.canvasElement.hidden = false;
        this.canvasElement.onclick = async () => {
            // pause when clicked on screen and resume on next click
            if (this.human.webcam.paused) {
              await this.human.webcam.play();
            }
            else this.human.webcam.pause()
        }
        this.startTime = this.human.now()
        this.current.face = await this.validationLoop() // start validation/draw loop
        this.canvasElement.width = this.current.face?.tensor?.shape[1] || this.options.minSize
        this.canvasElement.height = this.current.face?.tensor?.shape[0] || this.options.minSize
        this.canvasElement.style.width = ''
        if (!allOk()) {
            // is all criteria met?
            logMessages(this.messageElement, 'did not find valid face')
            return false
        }
        return this.detectFace()
    }

    public async init() {
        logMessages(this.messageElement, 'human version:', this.human.version, '| tfjs version:', this.human.tf.version['tfjs-core']);
        logMessages(this.messageElement, 'options:', JSON.stringify(this.options).replace(/{|}|"|\[|\]/g, '').replace(/,/g, ' '));
        logMessages(this.messageElement, 'initializing webcam...');
        logMessages(this.messageElement, 'loading human models...');
        await this.human.load(); // preload all models
        logMessages(this.messageElement, 'initializing this.human...');
        // eslint-disable-next-line
        logMessages(this.messageElement, 'face embedding model:', humanConfig.face?.description?.enabled ? 'faceres' : '', humanConfig.face!['mobilefacenet']?.enabled ? 'mobilefacenet' : '', humanConfig.face!['insightface']?.enabled ? 'insightface' : '');
        await this.human.warmup(); // warmup function to initialize backend for future faster detection
        await this.main();
      }
}

export { SecureCitizenCamera };