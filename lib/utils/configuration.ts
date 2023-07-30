import {
  DEFAULT_AUTO_START,
  DEFAULT_CAMERA_TEXT,
  DEFAULT_CONTROLS_STATE,
  DEFAULT_DEBUG_VALUE,
} from './defaults';

export interface AuthInit {
  clientId: string,
}

export interface InitConfig extends AuthInit {
  sourceDiv?: string,
  showControls?: boolean;
  autoStart?: boolean;
  startCameraText?: string;
  debug?: boolean;
}

export class SecureCitizenCameraConfig {
  public showControls: boolean;
  public autoStart: boolean;
  public startCameraText: string;
  public debug: boolean;

  constructor(
    autoStart: boolean = DEFAULT_AUTO_START,
    showControls: boolean = DEFAULT_CONTROLS_STATE,
    startCameraText: string = DEFAULT_CAMERA_TEXT,
    debug: boolean = DEFAULT_DEBUG_VALUE
  ) {
    this.startCameraText = startCameraText;
    this.autoStart = autoStart;
    this.showControls = showControls;
    this.debug = debug;
  }

  public setCameraText(text: string): SecureCitizenCameraConfig {
    if (text.length === 0) return this;
    this.startCameraText = text;
    return this;
  }
}
