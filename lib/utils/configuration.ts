import {
  DEFAULT_AUTO_START,
  DEFAULT_BTN_WIDTH,
  DEFAULT_CAMERA_TEXT,
  DEFAULT_CONTROLS_STATE,
  DEFAULT_DEBUG_VALUE,
  DEFAULT_FACE_DETECT,
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
} from './defaults';

export interface InitialConfig {
  div_id: string,
  client_id: string
}

export interface ISecureCitizenCameraConfig {
  showControls: boolean;
  autoStart: boolean;
  useFaceDetection: boolean;
  startCameraText: string;
  buttonWidth: string;
  // cameraWidth: string,
  // cameraHeight: string,
  debug: boolean;
}

export class SecureCitizenCameraConfig {
  private showControls: boolean = DEFAULT_CONTROLS_STATE;
  private autoStart: boolean = DEFAULT_AUTO_START;
  private useFaceDetection: boolean = DEFAULT_FACE_DETECT;
  private startCameraText: string = DEFAULT_CAMERA_TEXT;
  private buttonWidth: string = DEFAULT_BTN_WIDTH;
  // private cameraWidth: string = DEFAULT_WIDTH;
  // private cameraHeight: string = DEFAULT_HEIGHT;
  private debugSetting: boolean = DEFAULT_DEBUG_VALUE;

  constructor(
    buttonWidth?: string,
    // canvasWidth?: string,
    // canvasHeight?: string,
    useFaceDetection?: boolean,
    autoStart?: boolean,
    showControls?: boolean,
    startCameraText?: string,
    debug?: boolean
  ) {
    this.startCameraText = startCameraText ?? DEFAULT_CAMERA_TEXT;
    this.buttonWidth = buttonWidth ?? DEFAULT_BTN_WIDTH;
    // this.cameraHeight = canvasHeight ?? DEFAULT_HEIGHT;
    // this.cameraWidth = canvasWidth ?? DEFAULT_WIDTH;
    this.useFaceDetection = useFaceDetection ?? DEFAULT_FACE_DETECT;
    this.autoStart = autoStart ?? DEFAULT_AUTO_START;
    this.showControls = showControls ?? DEFAULT_CONTROLS_STATE;
    this.debugSetting = debug ?? DEFAULT_DEBUG_VALUE;
  }

  public printConfig(): ISecureCitizenCameraConfig {
    const config: ISecureCitizenCameraConfig = {
      autoStart: this.autoStart,
      showControls: this.showControls,
      useFaceDetection: this.useFaceDetection,
      startCameraText: this.startCameraText,
      buttonWidth: this.buttonWidth,
      // cameraWidth: this.cameraWidth,
      // cameraHeight: this.cameraHeight,
      debug: this.debugSetting,
    };
    console.log(config);
    return config;
  }

  public setCameraText(text: string): SecureCitizenCameraConfig {
    if (text.length === 0) return this;
    this.startCameraText = text;
    return this;
  }

  public disableFaceDetection(): SecureCitizenCameraConfig {
    this.useFaceDetection = false;
    this.autoStart = false;
    return this;
  }

  public enableFaceDetection(autoStart?: boolean): SecureCitizenCameraConfig {
    this.useFaceDetection = false;
    this.autoStart = autoStart ?? false;
    return this;
  }

  public setButtonWidth(width: string): SecureCitizenCameraConfig {
    const w = Number(width);

    if (w === 0 || w > 100) {
      this.buttonWidth = DEFAULT_BTN_WIDTH;
    } else {
      this.buttonWidth = width;
    }

    return this;
  }

  public changeShowControls(value?: boolean): SecureCitizenCameraConfig {
    if (value !== undefined) {
      this.showControls = value;
      return this;
    }
    this.showControls = !this.showControls;
    return this;
  }

  public changeDebug(value?: boolean): SecureCitizenCameraConfig {
    if (value !== undefined) {
      this.debugSetting = value;
    } else {
      this.debugSetting = !this.debugSetting;
    }
    return this;
  }

  // public setCanvas({ width, height } : ICanvasConfig): SecureCitizenCameraConfig {
  //   let w = Number(width)
  //   let h = Number(height)
  //   if(w ===0 || w > 1920) {
  //     width = DEFAULT_WIDTH // set a default if provided exceeds
  //   }

  //   if(h ===0 || h > 1080) {
  //     height = DEFAULT_HEIGHT // set a default if provided exceeds
  //   }

  //   this.cameraWidth = width;
  //   this.cameraHeight = height;

  //   return this;
  // }

  public IsAutoStartEnabled = () => {
    return this.autoStart;
  };
  public IsFaceDetectionEnabled = () => {
    return this.useFaceDetection;
  };
  // public CanvasConfig = () => {  return { width: this.cameraWidth, height: this.cameraHeight } as ICanvasConfig };
  public ButtonWidth = () => {
    return this.buttonWidth;
  };
  public ShowControls = () => {
    return this.showControls;
  };
  public Debug = () => {
    return this.debugSetting;
  };
  public CameraText = () => {
    return this.startCameraText;
  };
}

/** Gets the parameters used to start navigator.mediaDevices.getUserMedia(...) */
export function GetConstraints(
  isMac?: boolean,
  width: string = '1920',
  height: string = '1080'
) {
  const w = Number(width);
  const h = Number(height);

  if (w === 0 || w > 1920) {
    width = DEFAULT_WIDTH.toString();
  }

  if (h === 0 || h > 1080) {
    height = DEFAULT_HEIGHT.toString();
  }

  return isMac
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
