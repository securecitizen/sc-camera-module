import * as faceapi from '@vladmandic/face-api';
import base64Photo from './photo-to-start-detector';
import { FaceDetectionFeedback } from './face-detection-feedback';
import { HeadPosition } from './head-position/head-position';
import cv from '@techstark/opencv-js';

  
export class Detector {
  static tinyFaceDetectorOptions = new faceapi.TinyFaceDetectorOptions({ inputSize: 192 });
  static BACKEND = 'webgl';
  static debug = false;

  probabilityThreshold: number;
  counterSuccessfulResults: number;
  rendering: {
    now: number,
    elapsed: number,
    then: number,
  };
  videoRatio: number;
  headTurnCounter: number;
  counterSuccessfulHeadTurns: number;
  isMobile: boolean;
  isIos: boolean;
  videoElement: HTMLVideoElement;
  innerCanvas: HTMLCanvasElement | null;
  animationFrame: number | null;

  onAutoCapture: () => void;
  onFaceDetectionError: (feedback: FaceDetectionFeedback) => void;

  MAX_DETECTION_FPS: number;
  MAX_NUMBER_FACES: number;
  MAX_ANGLE_TURN_HEAD: number;
  MIN_FACE_SIZE_FOR_MOBILE: number;
  MIN_FACE_SIZE_FOR_DESKTOP: number;
  MIN_OCCUPIED_SPACE_FOR_DESKTOP: number;
  MIN_OCCUPIED_SPACE_FOR_MOBILE: number;
  X_OFFSET_FROM_FRAME: number;
  Y_OFFSET_FROM_FRAME: number;
  DEFAULT_NUMBER_SUCCESSFUL_RESULTS_FOR_AUTO_CAPTURING: number;

  constructor(
    isMobile: boolean,
    isIos: boolean,
    videoElement: HTMLVideoElement, 
    canvasElement: HTMLCanvasElement,
    onAutoCapture: () => void, 
    onFaceDetectionError: (feedback: FaceDetectionFeedback) => void) 
  {
    this.MAX_DETECTION_FPS = 1000 / 5;
    this.MAX_NUMBER_FACES = 1;
    this.MAX_ANGLE_TURN_HEAD = 30;
    this.MIN_FACE_SIZE_FOR_MOBILE = 224;
    this.MIN_FACE_SIZE_FOR_DESKTOP = 350;
    this.MIN_OCCUPIED_SPACE_FOR_DESKTOP = 15;
    this.MIN_OCCUPIED_SPACE_FOR_MOBILE = 15;
    this.X_OFFSET_FROM_FRAME = 15;
    this.Y_OFFSET_FROM_FRAME = 5;
    this.DEFAULT_NUMBER_SUCCESSFUL_RESULTS_FOR_AUTO_CAPTURING = 5;
    
    this.onAutoCapture = onAutoCapture;
    this.onFaceDetectionError = onFaceDetectionError;

    this.probabilityThreshold = 50;
    this.counterSuccessfulResults = 0;
    this.rendering = {
      now: 0,
      elapsed: 0,
      then: 0,
    };
    this.videoRatio = 1;
    this.headTurnCounter = 0;
    this.counterSuccessfulHeadTurns = 0;
    this.isMobile = isMobile;
    this.isIos = isIos;
    this.videoElement = videoElement;
    this.innerCanvas = canvasElement;
    this.animationFrame = null;
  }

  /** Loads models into faceapi (if they aren't already loaded) so that they don't 
   * take time to load when you need to open a camera with face detection.*/
  public static async warmUp() {
    console.log('attempting to initialise detector');

    faceapi.tf.ENV.set('DEBUG', Detector.debug);
    await (faceapi.tf as any).setBackend(Detector.BACKEND);
    await (faceapi.tf as any).enableProdMode();
    await (faceapi.tf as any).ready();

    if (this.modelsLoaded()) {
      console.log('detector models already loaded');
    } else{
      console.log('detector loading models');
       // from disk
       await faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
       await faceapi.nets.faceLandmark68TinyNet.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
       
      // await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      // await faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models');
      console.log('detector done loading models');
    }

    if (!cv)
      throw 'open cv not found';

    //this is slow and blocks the UI
    //await this.warmUpModels();

    return 'initialised successfully';
  }
  private static modelsLoaded() {
    return faceapi.nets.tinyFaceDetector.isLoaded && faceapi.nets.faceLandmark68TinyNet.isLoaded;
  }
  private static async warmUpModels() {
    const image = new Image();
    image.src = base64Photo;
    await faceapi
        .detectAllFaces(image, Detector.tinyFaceDetectorOptions)
        .withFaceLandmarks(true);
  }

  /** Uses faceapi to detect all faces in the given video element or image */
  async detectAllFaces(src: faceapi.TNetInput): 
    Promise<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection; }, faceapi.FaceLandmarks68>[]> {
    let result: faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection; }, faceapi.FaceLandmarks68>[] = [];
    try {
      let input = src;
      if (this.isIos && src instanceof HTMLVideoElement) {
        const canvas = document.createElement('canvas');
        const width = 480;
        const height = 640;
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        context?.drawImage(src, 0, 0, width, height);
        input = canvas;
      }
      result = await faceapi
        .detectAllFaces(input, Detector.tinyFaceDetectorOptions)
        .withFaceLandmarks(true);
    }
    catch (e) {
    }
    return result;
  }

  async startDetector() {
    await Detector.warmUp();
    
    if (!this.videoElement)
      throw Error('Video element not found');
    if (this.videoElement.clientWidth === 0)
      throw Error('Video element too small');

    this.rendering.then = Date.now();
    this.counterSuccessfulResults = 0;
    if (this.isIos)
      this.useIosSettings();
    this.videoRatio = this.getVideoRatio(this.videoElement);
    this.animationFrame = requestAnimationFrame(() => void this.detection());
  }
  stopDetector() {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame); 
      this.animationFrame = null;
    }
  }
  useIosSettings() {
    this.DEFAULT_NUMBER_SUCCESSFUL_RESULTS_FOR_AUTO_CAPTURING = 3;
    this.MAX_DETECTION_FPS = 1000 / 2;
  }

  /** Handles detecting faces and tries to auto capture, otherwise returns feedback to callback function */
  async detection() {
    this.animationFrame = requestAnimationFrame(() => void this.detection());
    this.rendering.now = Date.now();
    this.rendering.elapsed = this.rendering.now - this.rendering.then;
    if (this.rendering.elapsed > this.MAX_DETECTION_FPS) {
      this.rendering.then = this.rendering.now - (this.rendering.elapsed % this.MAX_DETECTION_FPS);
      const detectionResult = await this.detectAllFaces(this.videoElement);
      if (Detector.debug)
        this.drawFaces(detectionResult);
      const faceErrors = this.prepareFeedbackFromDetectionResult(detectionResult);
      if (Object.values(faceErrors).every(v => !v)) {
        this.handleFacePassingChecks();
      }
      else {
        this.counterSuccessfulResults = 0;
        this.onFaceDetectionError(faceErrors);
      }
    }
  }

  /**Prepare and return the feedback from the result of a detection */
  prepareFeedbackFromDetectionResult(detectedFaces: faceapi.WithFaceLandmarks<{
    detection: faceapi.FaceDetection;
}, faceapi.FaceLandmarks68>[]) {
    const detectionFacesForSize = faceapi.resizeResults(detectedFaces, {
      width: this.videoElement.videoWidth,
      height: this.videoElement.videoHeight,
    });
    const pipelineResults = new FaceDetectionFeedback();
    const correctNumFaces = this.checkNumberFaces(detectionFacesForSize);
    pipelineResults['FACE_NOT_FOUND'] = !correctNumFaces && detectionFacesForSize.length === 0;
    pipelineResults['TOO_MANY_FACES'] = !correctNumFaces && detectionFacesForSize.length > this.MAX_NUMBER_FACES;
    if (correctNumFaces) {
      if (cv)
        pipelineResults['FACE_ANGLE_TOO_LARGE'] = !this.checkHeadRotation(detectionFacesForSize);
      pipelineResults['PROBABILITY_TOO_SMALL'] = !this.checkProbability(detectionFacesForSize);
      pipelineResults['FACE_TOO_SMALL'] = !this.checkFaceSize(detectionFacesForSize);
      pipelineResults['FACE_CLOSE_TO_BORDER'] = !this.checkFaceIndent(detectionFacesForSize);
    }
    return pipelineResults;
  }

  /**Tells the callback that it can auto-capture (if your face passes all checks for a small number of consecutive frames) */
  handleFacePassingChecks() {
    this.counterSuccessfulResults++;

    if (Detector.debug)
      console.info(this.counterSuccessfulResults);
    if (this.counterSuccessfulResults >= this.DEFAULT_NUMBER_SUCCESSFUL_RESULTS_FOR_AUTO_CAPTURING) {
      this.onAutoCapture();
      this.counterSuccessfulResults = 0;
    }
  }
  
  /**Check that the number of faces matches the amount defined in the constructor */
  checkNumberFaces(detectionResult: faceapi.WithFaceLandmarks<{
    detection: faceapi.FaceDetection;
}, faceapi.FaceLandmarks68>[]) {
    return detectionResult.length === this.MAX_NUMBER_FACES;
  }

  /**Check that the probability that this is a face (returned from faceapi) is greater than the minimum defined in the constructor */
  checkProbability(detectionResult: faceapi.WithFaceLandmarks<{
    detection: faceapi.FaceDetection;
}, faceapi.FaceLandmarks68>[]) {
    const score = detectionResult[0].detection.score;
    return score > +this.probabilityThreshold / 100;
  }
  checkFaceSize(detectionResult: faceapi.WithFaceLandmarks<{
    detection: faceapi.FaceDetection;
}, faceapi.FaceLandmarks68>[]) {
    const faceBox = detectionResult[0].detection.box;
    const { width, height, area } = faceBox;
    const { imageHeight, imageWidth } = detectionResult[0].detection;
    const occupiedSize = 100 / ((imageHeight * imageWidth) / area);
    const minSide = Math.min(width / this.videoRatio, height / this.videoRatio);
    return (minSide > (this.isMobile ? this.MIN_FACE_SIZE_FOR_MOBILE : this.MIN_FACE_SIZE_FOR_DESKTOP) &&
      occupiedSize > (this.isMobile ? this.MIN_OCCUPIED_SPACE_FOR_MOBILE : this.MIN_OCCUPIED_SPACE_FOR_DESKTOP));
  }

  /**Check that your face is within the borders of the camera video */
  checkFaceIndent(detectionResult: faceapi.WithFaceLandmarks<{
    detection: faceapi.FaceDetection;
}, faceapi.FaceLandmarks68>[]) {
    const faceBox = detectionResult[0].detection.box;
    const { imageHeight, imageWidth } = detectionResult[0].detection;
    const { top, left, bottom, right } = faceBox;
    const topIndent = top;
    const leftIndent = left;
    const rightIndent = imageWidth - right;
    const bottomIndent = imageHeight - bottom;
    return !(topIndent < this.Y_OFFSET_FROM_FRAME ||
      leftIndent < this.X_OFFSET_FROM_FRAME ||
      rightIndent < this.X_OFFSET_FROM_FRAME ||
      bottomIndent < this.Y_OFFSET_FROM_FRAME);
  }
  checkHeadRotation(detectionResult: faceapi.WithFaceLandmarks<{
    detection: faceapi.FaceDetection;
}, faceapi.FaceLandmarks68>[]) {
    const temporaryCanvas = document.createElement('canvas');
    const dims = faceapi.matchDimensions(temporaryCanvas, this.videoElement, true);
    temporaryCanvas.remove();
    const headPosition = new HeadPosition(detectionResult[0].landmarks.positions, dims);
    let angles = [0, 0, 0];
    try {
      angles = Array.from(headPosition.estimateHeadPose());
    }
    catch (e) {
    }
    if (angles[2] > this.MAX_ANGLE_TURN_HEAD || angles[2] * -1 > this.MAX_ANGLE_TURN_HEAD) {
      this.headTurnCounter++;
    }
    else {
      this.counterSuccessfulHeadTurns++;
      if (this.counterSuccessfulHeadTurns >= 5) {
        this.headTurnCounter = 0;
        this.counterSuccessfulHeadTurns = 0;
      }
    }
    return this.headTurnCounter <= 1;
  }

  /** Draw the points of the detected face (mainly for debugging?) */
  drawFaces(data: faceapi.WithFaceLandmarks<{
    detection: faceapi.FaceDetection;
}, faceapi.FaceLandmarks68>[]) {
    const canvas = this.innerCanvas;
    if (!canvas)
      return console.error('no canvas for drawing');
    const ctx = canvas.getContext('2d');
    if (!ctx)
      return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'small-caps 20px "Segoe UI"';
    ctx.fillStyle = 'white';
    for (const person of data) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'deepskyblue';
      ctx.fillStyle = 'deepskyblue';
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.rect(person.detection.box.x, person.detection.box.y, person.detection.box.width, person.detection.box.height);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = 'lightblue';
      const pointSize = 2;
      for (let i = 0; i < person.landmarks.positions.length; i++) {
        ctx.beginPath();
        ctx.arc(person.landmarks.positions[i].x, person.landmarks.positions[i].y, pointSize, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
  getVideoRatio(videoElement: HTMLVideoElement) {
    const hRatio = videoElement.clientWidth / videoElement.videoWidth;
    const vRatio = videoElement.clientHeight / videoElement.videoHeight;
    return Math.min(hRatio, vRatio);
  }
  
}
