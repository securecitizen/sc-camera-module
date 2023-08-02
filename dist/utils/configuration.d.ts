export interface AuthInit {
    clientId: string;
}
export interface InitConfig extends AuthInit {
    sourceDiv?: string;
    showControls?: boolean;
    autoStart?: boolean;
    startCameraText?: string;
    debug?: boolean;
}
export declare class SecureCitizenCameraConfig {
    showControls: boolean;
    autoStart: boolean;
    startCameraText: string;
    debug: boolean;
    constructor(autoStart?: boolean, showControls?: boolean, startCameraText?: string, debug?: boolean);
    setCameraText(text: string): SecureCitizenCameraConfig;
}
