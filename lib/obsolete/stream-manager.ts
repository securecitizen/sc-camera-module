import { log } from '../utils/errors';
import { Detector } from '../face-detector/detector';
import platform from 'platform-detect';
import { DEFAULT_MAX_WIDTH } from '../utils/defaults';

export class StreamManager {

  stream: MediaStream | null;
  showMask: boolean;
  videoSize;
  videoElement: HTMLVideoElement;
  canvasElement: HTMLCanvasElement;
  detector: Detector | null;
  maskOverlayImageElement: HTMLImageElement;
  isMobile: boolean;
  isIos: boolean;
  isMac: boolean;

  onErrors: (errors: any) => void;

  constructor(
    videoElement: HTMLVideoElement, 
    canvasElement: HTMLCanvasElement,
    detector: Detector | null,
    mask: HTMLImageElement,
    onErrors: (errors: any) => void) 
  {
      this.stream = null;
      this.showMask = true;
      this.videoSize = { width: 0, height: 0 };
      this.videoElement = videoElement;
      this.canvasElement = canvasElement;
      this.detector = detector;
      this.onErrors = onErrors;

      // check if this isMobile, isIOS or isMac
      this.isMobile = platform.phone || platform.tablet;
      this.isIos = platform.ios;
      this.isMac = platform.macos;

      log('Mobile: ' + this.isMobile);
      log('IOS: ' + this.isIos);
      log('MAC: ' + this.isMac);
      
      // this.maskOverlayImageElement = new Image();
      this.maskOverlayImageElement = mask;
      
      // replace with resizeObserver
      // window.addEventListener('resize', this.orientationChange, false);
      // window.addEventListener('orientationchange', this.orientationChange, false);
  }

  startStream(stream: MediaStream) {
    if (this.stream)
      this.stream.getTracks().forEach((track) => track.stop());
    this.stream = stream;
    if ('srcObject' in this.videoElement) {
      this.videoElement.srcObject = stream;
    }
    else {
      console.log('startStream -> \'srcObject\' not in this.videoElement')
      //this.videoElement.src = window.URL.createObjectURL(stream);
    }
    
    this.videoElement.play().then(() => {
      if (this.detector){
        this.drawMask();
        this.detector?.startDetector().then(() => {
            console.log('startDetection -> detection started')
          }).catch((error: any) => {
            console.log('startDetection -> error', error)
          });
      } else 
        this.updateCanvasSize(this.canvasElement);
    }).catch((error) => {
      console.log('startStream -> this.videoElement.play() -> error', error);
    });
  }

  streamIsActive() {
    return this.stream && 
    this.stream.getTracks && 
    this.stream.getTracks().length > 0;
  }
  
  dropStream() {
    if (this.streamIsActive()) {
      this.stream?.getTracks().forEach((track) => track.stop());
      this.videoElement.srcObject = null;
    }
    if (this.detector){
      this.detector?.stopDetector();
      this.dropMask();
    }
  }

  async takePhoto() {
    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;
    return await this.getFrame(canvas);
  }

  /**Get the current frame of the camera video as an image in the form of a string */
  getFrame(canvas: HTMLCanvasElement) {
    return new Promise<string>((resolve, reject) => {
      const context = canvas.getContext('2d');
      context?.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
      const frame = canvas.toDataURL('image/jpeg');
      if (!frame){
        reject('frame is null or undefined');
      }
      else if (!this.isIos) {
        try {
          resolve(frame);
        }
        catch (error) {
          resolve(frame);
          this.onErrors(error);
        }
      }
      else {
        resolve(frame);
      }
    });
  }

  /**Draw an outline, showing you where to place your face in the camera video so that it can auto-capture */
  drawMask() {
    if (this.showMask) {
      setTimeout(() => {
        this.updateCanvasSize(this.canvasElement);
        const canvas = this.canvasElement;
        const canvasCtx = canvas.getContext('2d');
        const hRatio = canvas.width / this.maskOverlayImageElement.width;
        log('hRatio: ' + hRatio)
        const vRatio = canvas.height / this.maskOverlayImageElement.height;
        log('vRatio: ' + vRatio)
        const ratio = Math.min(hRatio, vRatio);
        const portraitOrientation = canvas.width < canvas.height;
        log('Orientation:' + portraitOrientation ? 'Portrait' : 'Landscape')
        const paddingX = (!portraitOrientation && this.isMobile) ? 50 : 100;
        log('X Padding: ' + paddingX)
        const paddingY = portraitOrientation ? 200 : 100;
        log('Y Padding: ' + paddingY)
        const centerShift_x = (canvas.width - this.maskOverlayImageElement.width * ratio) / 2;
        log('centerShift X: ' + centerShift_x)
        const centerShift_y = (canvas.height - this.maskOverlayImageElement.height * ratio) / 2;
        log('centerShift Y: ' + centerShift_y)
        canvasCtx?.drawImage(
          this.maskOverlayImageElement, 
          0, 
          0, 
          this.maskOverlayImageElement.width, 
          this.maskOverlayImageElement.height, 
          centerShift_x + paddingX, 
          centerShift_y + paddingY, 
          (this.maskOverlayImageElement.width * ratio) - paddingX * 2, 
          (this.maskOverlayImageElement.height * ratio) - paddingY * 2);
      }, 150);
    }
  }
  updateCanvasSize(canvas: HTMLCanvasElement) {
    this.videoSize = { width: this.videoElement.videoWidth, height: this.videoElement.videoHeight };
    canvas.width = this.videoSize.width;
    canvas.height = this.videoSize.height;
    canvas.style.display = 'block';
  }
  dropMask() {
    const canvas = this.canvasElement;
    const canvasCtx = canvas.getContext('2d');
    canvasCtx?.clearRect(0, 0, 10000, 10000);
    canvas.style.display = 'none';
  }

  orientationChange = () => {
    log("Resize triggered")
    this.drawMask();
  }
}


/** Gets the parameters used to start navigator.mediaDevices.getUserMedia(...) */
export function GetConstraints(
  width: string = '1920',
  height: string = '1080'
) {
  const w = Number(width);
  const h = Number(height);

  if (w === 0 || w > 1920) {
    width = DEFAULT_MAX_WIDTH.toString();
  }

  return platform.macos
    ? {
        audio: false,
        video: {
          facingMode: 'user',
          width: w,
          height: h,
        },
      }
    : {
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: w },
          height: { ideal: h },
        },
      };
}
