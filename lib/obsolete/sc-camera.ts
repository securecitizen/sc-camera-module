import {
  SecureCitizenCameraConfig,
} from '../utils/configuration';
import { FaceDetectionFeedback } from '../face-detector/face-detection-feedback';
import { Detector } from '../face-detector/detector';
import { GetConstraints, StreamManager } from './stream-manager';
import { log } from '../utils/errors';
import { EventBroker } from '../utils/typedeventemitter'

import { BootstrapCameraDiv, IdentifyOverlay } from '../components/main-camera-div';
import { DEFAULT_MAX_WIDTH, DEFAULT_MIN_WIDTH } from '../utils/defaults';

export function DefaultCameraConfig(): SecureCitizenCameraConfig { 
  return new SecureCitizenCameraConfig().changeDebug(true) 
};
export function DisableFaceCameraConfig(): SecureCitizenCameraConfig { 
  return new SecureCitizenCameraConfig().disableFaceDetection() 
};
export function DefaultCameraConfigWithControls(): SecureCitizenCameraConfig { 
  return  new SecureCitizenCameraConfig().changeShowControls(true).changeDebug() 
};

class SecureCitizenCamera {
  public isCameraActive = false;
  public faceDetectionFeedback: FaceDetectionFeedback | null = null;
  public config: SecureCitizenCameraConfig = DefaultCameraConfig();
  public debugSetting: boolean = false;

  streamManager: StreamManager | null = null;

  private videoElement: HTMLVideoElement;
  private canvasElement: HTMLCanvasElement;
  private maskElement: HTMLImageElement;
  public cameraDiv: HTMLDivElement;

  constructor(
    random_id_suffix: string, 
    width: number,
    maskDiv: string
  ) {

    this.maskElement = document.getElementById(maskDiv) as HTMLImageElement;

    log("Mask Details", this.maskElement);
    if(this.maskElement === null) {
      throw new Error("Please provide a mask image with a div ID of " + maskDiv);
    }

    // check if width exceeds DEFAULT_MAX_WIDTH
    let tWidth = "";
    if((width > DEFAULT_MIN_WIDTH)) {
      (width < DEFAULT_MAX_WIDTH) ?
      tWidth = width + "px" :
      tWidth =DEFAULT_MAX_WIDTH + "px";
    } else {
      throw new Error("The provided Camera overlay is too small");
    }

    const { aspectRatio } = IdentifyOverlay(this.maskElement);

    // const tWidth = width + "px";
    log('Width configured as: ' + tWidth)
    const height = (aspectRatio * width) + "px";
    log('Height configured as: ' + height)

    

    const { cameraDiv, videoElement, canvasElement } = BootstrapCameraDiv(random_id_suffix, tWidth, height, this.maskElement);
    this.cameraDiv = cameraDiv;
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    
    // check if configuration has been provided and merge them
    // if (configuration) {
    //   log('Merging Config');
    //   this.configuredProps = { ...this.configuredProps, ...configuration } as SecureCitizenCameraConfig;
    // }

    // Enable Debug if set
    this.debugSetting = this.config.Debug();

    // check if Auto Start is Enabled
    if (this.config.IsAutoStartEnabled()) {
      log('Auto Start Detector');
      Detector.warmUp()
        .then((response) =>
          log('attempt to initialise detector early: ' + response)
        )
        .catch((error) =>
          log('attempt to initialise detector early failed:' + error)
        );
    }

    // check if Face Detection is Enabled
    if (this.config.IsFaceDetectionEnabled()) {
      log('Use Face Detection Enabled');
    }
    
    // check the Provided Camera Text
    const cameraText = this.config.CameraText();
    if (cameraText) {
      log('Start Camera Text: ' + cameraText);
    }

    // check if Show Controls is Enabled
    if (this.config.ShowControls()) {
      log('Show Controls Enabled');
    }

    
    // Debugging
  
    if(this.debugSetting) {
      // Debug subscriptions
      EventBroker.on('photoTaken', (statusCode: number, photoString: string) => {
        log('Debug Code ' + statusCode + ': photoTaken event called ' +  photoString)
      })
      EventBroker.on('cancelled', (statusCode: number) => {
        log('Debug Code ' + statusCode + ': cancelled event called')
      })
      EventBroker.on('cameraError', (statusCode: number, error: string) => {
        log('Debug Code ' + statusCode + ': cameraError event called ' + error)
      })
    }
    
    // this.configuredProps.printConfig();

    }

  /** Handles errors coming from the stream manager */
  private onStreamManagerError(error: any, isError: boolean) {
    if (isError) {
      log('cameraError ' + JSON.stringify(error));
      EventBroker.emit('cameraError', 1, error);
      this.closeCamera();
    } else {
      log('cancelled ' + JSON.stringify(error));
      EventBroker.emit('cancelled', 1, 'cancelled ' + error);
    }
  }
  
  /** Takes a photo of the current frame and returns it as a string */
  public takePhoto() {
    this.streamManager
      ?.takePhoto()
      .then((photo: string) => {
        this.closeCamera();
        log('photoTaken', JSON.stringify(photo));
        EventBroker.emit('photoTaken', 1, photo)
      })
      .catch((error) => {
        log('takePhoto -> error', JSON.stringify(error));
        EventBroker.emit('cameraError', 2, 'takePhoto -> error' + error)
      });
  }

  /**Starts a stream to display the camera video on screen and starts face detection if necessary */
  public openCamera() {
    this.isCameraActive = true;
    setTimeout(() => {
      //get the stream

      navigator.mediaDevices
        .getUserMedia(
          GetConstraints(
            this.videoElement?.width.toString(),
            this.videoElement?.height.toString()
          )
        ) // GetConstraints(isMac: false, width: 1024, height: 768)
        .then((cameraStream) => {
          this.canvasElement;
          if (!this.videoElement || !this.canvasElement) {
            console.error('camera video or canvas element is null');
            throw 'camera video or canvas element is null';
          }

          //create a face detector if necessary
          let detector: Detector | null = null;
          if (this.config.IsFaceDetectionEnabled()) {
            detector = new Detector(
              this.videoElement,
              this.canvasElement,
              //this is called when a face is detected and is determined to be in the right position to auto-capture a photo
              () => {
                this.faceDetectionFeedback = null;
                log('Face Detected');
                this.takePhoto();
              },
              //this is called while the face detector is trying to detect a face to tell you what it is seeing
              //and what it needs in order to auto-capture
              (feedback: FaceDetectionFeedback) => {
                log('Face Detecting ' + JSON.stringify(feedback));
                this.faceDetectionFeedback = feedback;
              },
            );
          }

          this.streamManager = new StreamManager(
            this.videoElement,
            this.canvasElement,
            detector,
            this.maskElement,
            (errors) => {
              log('errors' + JSON.stringify(errors));
              this.onStreamManagerError(errors, false);
            }
          );
          //start the stream and display the video (and start the face detector if necessary)
          this.streamManager.startStream(cameraStream);
        })
        .catch((e) => {
          this.closeCamera();
          log('cameraError' + JSON.stringify(e));
          EventBroker.emit('cameraError', 3, e)
        });
    }, 100);
  }

  public closeCamera() {
    if (this.streamManager) {
      this.isCameraActive = false;
      this.streamManager?.dropStream();
    }
  }

  /**
   * SubscribeToCancelled
   */
  public SubscribeToCancelled(f: Function) {
    EventBroker.on('cancelled', (statusCode: number, reason?: string) => {
      f(statusCode, reason);
    })
  }

  /**
   * SubscribeToCameraError
   */
  public SubscribeToCameraError(f: Function) {
    EventBroker.on('cameraError', (statusCode: number, error: string) => {
      f(statusCode, error);
    })
  }

  /**
   * SubscribeToPhotoTaken
   */
  public SubscribeToPhotoTaken(f: Function) {
    EventBroker.on('photoTaken', (statusCode: number, photoString: string) => {
      f(statusCode, photoString);
    })
  }

}

export { SecureCitizenCamera };
