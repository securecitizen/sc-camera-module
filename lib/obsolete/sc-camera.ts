import {
  GetConstraints,
  SecureCitizenCameraConfig,
} from './utils/configuration';
import { FaceDetectionFeedback } from './components/face-detector/face-detection-feedback';
import { Detector } from './components/face-detector/detector';
import { StreamManager } from './components/stream-manager';
import { log } from './utils/errors';
import { EventBroker } from './utils/typedeventemitter'
import { DefaultCameraConfig } from './sc-face-camera';
import { SecureCitizenBootstrapper } from './utils/bootstrap'

import mask from './masks/facemask.svg';
import { IdentifyContent, IdentifyWindow } from './components/main-camera-div';

class SecureCitizenCamera {
  private isCameraActive = false;
  private faceDetectionFeedback: FaceDetectionFeedback | null = null;
  private configuredProps: SecureCitizenCameraConfig = DefaultCameraConfig();
  private bootstrap: SecureCitizenBootstrapper;
  private debugSetting: boolean = false;

  streamManager: StreamManager | null = null;

  constructor(
    configuration?: SecureCitizenCameraConfig
  ) {


    // check if configuration has been provided and merge them
    if (configuration !== undefined) {
      log('Merging Config');
      this.configuredProps = { ...this.configuredProps, ...configuration } as SecureCitizenCameraConfig;
    }

    // Enable Debug if set
    this.debugSetting = this.configuredProps.Debug();

    // check if Auto Start is Enabled
    if (this.configuredProps.IsAutoStartEnabled()) {
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
    if (this.configuredProps.IsFaceDetectionEnabled()) {
      log('Use Face Detection Enabled');
    }
    
    // check the Provided Camera Text
    const cameraText = this.configuredProps.CameraText();
    if (cameraText) {
      log('Start Camera Text: ' + cameraText);
    }

    // check if Show Controls is Enabled
    if (this.configuredProps.ShowControls()) {
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

    this.bootstrap = new SecureCitizenBootstrapper();
    
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
            this.bootstrap?.isMac,
            this.bootstrap?.divWidth.toString(),
            this.bootstrap?.divHeight.toString()
          )
        ) // GetConstraints(isMac: false, width: 1024, height: 768)
        .then((cameraStream) => {
          this.bootstrap.canvasElement;
          if (!this.bootstrap.videoElement || !this.bootstrap.canvasElement) {
            console.error('camera video or canvas element is null');
            throw 'camera video or canvas element is null';
          }

          //create a face detector if necessary
          let detector: Detector | null = null;
          if (this.configuredProps.IsFaceDetectionEnabled()) {
            detector = new Detector(
              this.bootstrap.isMobile ?? false,
              this.bootstrap.isIOS ?? false,
              this.bootstrap.videoElement,
              this.bootstrap.canvasElement,
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
            this.bootstrap.videoElement,
            this.bootstrap.canvasElement,
            this.bootstrap.isMobile,
            this.bootstrap.isMac,
            detector,
            mask,
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

  public loadCameraModule(mode?: 'body' | 'nameddiv', divName?: string) {
    // check if mode has been provided - if not this takes over the body
    if(mode === undefined) { mode = 'body', log('Mode set to body as no div found')}
    // check if a name has been provided, if so we will use it, if not a default is chosen
    const setDevName = divName ?? "SecureCitizenCamera";
    // check if the default is chosen and just inform
    if(setDevName === "SecureCitizenCamera") { log('Default div named used')}

    // get core Div (that already has a video stream defined and mapped to cameraVideo/cameraCanvas)
    // try get this from the existing dom, if not found we assume this is a body takeover (user hasnt 
    // created a <div id='name'/> for us to target)
    const SecureCitizenCameraDiv = document.getElementById(setDevName) as HTMLDivElement;

    log('Fetched Div ', SecureCitizenCameraDiv);

    if(SecureCitizenCameraDiv === undefined) { 
      mode = 'body';
      log('Mode set to body as no div found')
    } else {
      mode = 'nameddiv';
    };

    const namedDiv: HTMLDivElement = SecureCitizenCameraDiv !== null ? SecureCitizenCameraDiv : document.createElement('div') as HTMLDivElement;
    
    // this.bootstrap.UpdateValues(namedDiv); // assign bootstrap instance to the found DIV (so we know it's width/height)

    log('Named Div ', namedDiv);


    log('Named Div ID: ', namedDiv.id);

    namedDiv.id = namedDiv.id !== setDevName ? setDevName : namedDiv.id;
    
    log('Using <div id=\'' + namedDiv.id + '\' \/>');

    // define the cameraDiv
    // const index = 'camera';

    log("First One")
    IdentifyWindow(namedDiv);

    const cameraDiv = this.bootstrap.GenerateCameraDiv(namedDiv.clientWidth);
    
    // attach the errors to this div
    // const errorDiv = this.bootstrap.GenerateErrorDiv();

    
    // Finally append the controlPanelDiv to the SecureCitizenCameraDiv
    // cameraDiv?.appendChild(errorDiv);
    
    // attach the camera to this div (TODO: send over dimensions)
    const { videoElement, canvasElement } = this.bootstrap.GenerateMainCaptureDiv(this.isCameraActive, mask);

    log("Video Element")
    IdentifyContent(videoElement);
    log("Canvas Element")
    IdentifyContent(canvasElement);

    // Append the Video first
    cameraDiv.appendChild(videoElement);

    log("Camera Div - Video")
    IdentifyWindow(cameraDiv);

    // Append the Canvas Overlay second
    cameraDiv.appendChild(canvasElement);

    log("Camera Div - Canvas")
    IdentifyWindow(cameraDiv);

    // attach the cameraDiv to the namedDiv
    namedDiv.appendChild(cameraDiv);

    log("Camera Div Final")
    IdentifyWindow(cameraDiv);

    log("Second One")
    IdentifyWindow(namedDiv);

    if(this.configuredProps.ShowControls()) {
      // attach the control panel to the named div if requested
      // const controlPanelDiv = this.bootstrap.GenerateControlPanel();
      
      // Finally append the controlPanelDiv to the SecureCitizenCameraDiv
      // SecureCitizenCameraDiv?.appendChild(controlPanelDiv);
      
      // Listening to button bresses from the control panel
      EventBroker.on('openCameraBtn', () => {
        this.openCamera();
      });
      EventBroker.on('takePhotoBtn', () => {
        this.takePhoto();
      });
      EventBroker.on('closeCameraBtn', () => {
        this.closeCamera();
      });
    }

    log('Mode: ' + mode);

    log("Final One")
    IdentifyWindow(namedDiv);

    if(mode === 'body') {
      // const body =  document.body as HTMLBodyElement;
      (document.body as HTMLBodyElement).appendChild(namedDiv);
      log('Full Body ', document.body);
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

  public IsCameraActive() { return this.isCameraActive};
  public GetFaceDetectionFeedback() { return this.faceDetectionFeedback};

}

export { SecureCitizenCamera };
