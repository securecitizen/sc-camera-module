declare module "utils/defaults" {
    export const DEFAULT_WIDTH = 1024;
    export const DEFAULT_HEIGHT = 768;
    export const DEFAULT_BTN_WIDTH = "30";
    export const DEFAULT_CAMERA_TEXT = "Start Camera";
    export const DEFAULT_CONTROLS_STATE = true;
    export const DEFAULT_AUTO_START = false;
    export const DEFAULT_FACE_DETECT = true;
    export const DEFAULT_DEBUG_VALUE = false;
    export const CAMERA_TOP_PADDING = "10px";
    export const CAMERA_BOTTOM_PADDING = "10px";
    export const CAMERA_LEFT_PADDING = "10px";
    export const CAMERA_RIGHT_PADDING = "10px";
    export const DEFAULT_AUTH_SUFFIX = "/sample";
    export const DEFAULT_MIN_WIDTH = 140;
    export const DEFAULT_MIN_HEIGHT = 220;
    export const DEFAULT_ASPECT_RATIO: number;
    export const DEFAULT_ERROR_OUTSINK = "out";
    export const DEFAULT_MESSAGE_OUTSINK = "logMessages";
}
declare module "utils/errors" {
    const errorToFriendly: {
        [key: string]: string;
    };
    function DebugLogger(debug: boolean, value: string): void;
    function log(...args: any[]): void;
    function logMessages(...args: any[]): void;
    export { errorToFriendly, log, logMessages, DebugLogger };
}
declare module "components/error-output" {
    function GenerateErrorDiv(random_id_suffix: string): HTMLDivElement;
    export { GenerateErrorDiv };
}
declare module "components/main-camera-div" {
    function IdentifyWindow(checkedElement: HTMLDivElement): void;
    function IdentifyContent(checkedElement: HTMLVideoElement | HTMLCanvasElement): void;
    function BootstrapCameraDiv(random_id_suffix: string, width: number): HTMLDivElement;
    function BootstrapVideo(random_id_suffix: string): HTMLVideoElement;
    function BootstrapCanvas(random_id_suffix: string, chosenMask?: string): HTMLCanvasElement;
    function GenerateMainCaptureDiv(random_id_suffix: string, width: string, height: string, isCameraActive: boolean): {
        videoElement: HTMLVideoElement;
        canvasElement: HTMLCanvasElement;
    };
    export { GenerateMainCaptureDiv, BootstrapCanvas, BootstrapVideo, BootstrapCameraDiv, IdentifyWindow, IdentifyContent, };
}
declare module "components/add-button" {
    function AddButton(random_id_suffix: string, innerText: string, f: Function): HTMLButtonElement;
    export { AddButton };
}
declare module "utils/typedeventemitter" {
    import { User } from 'oidc-client-ts';
    class TypedEventEmitter<TEvents extends Record<string, any>> {
        private emitter;
        emit<TEventName extends keyof TEvents & string>(eventName: TEventName, ...eventArg: TEvents[TEventName]): void;
        on<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void): void;
        off<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void): void;
    }
    /**
     * A map of event names to argument tuples
     */
    type LocalEventTypes = {
        'takePhotoBtn': [];
        'openCameraBtn': [];
        'closeCameraBtn': [];
        'photoTaken': [statusCode: number, photoString: string];
        'userAcquired': [statusCode: number, user: User | null];
        'userChange': [statusCode: number, change: 'token_expired' | 'token_expiring' | 'user_loaded' | 'user_unloaded' | 'user_signed_in' | 'user_signed_out'];
        'userError': [statusCode: number, error: string];
        'cancelled': [statusCode: number, reason?: string];
        'cameraError': [statusCode: number, error: string];
    };
    export const EventBroker: TypedEventEmitter<LocalEventTypes>;
}
declare module "components/control-panel" {
    function GenerateControlPanel(random_id_suffix: string): HTMLDivElement;
    export { GenerateControlPanel };
}
declare module "utils/bootstrap" {
    class SecureCitizenBootstrapper {
        private random_id_suffix;
        authBase: string;
        isMobile: boolean;
        isMac: boolean;
        isIOS: boolean;
        pixelRatio: number;
        parentDivWidth: number;
        parentDivHeight: number;
        divWidth: number;
        divHeight: number;
        videoElement: HTMLVideoElement;
        canvasElement: HTMLCanvasElement;
        /**
         * This bootstrap process will perform the following functions:
         * 1 - Identify what base URL we are running on for authentication configurations
         * 2 - Identify what type of device we are running on
         * 3 - Identify our PixelRatio, and the width (required) and height (optional)
         *     from the enclosing div element
         * 4 - Create a Video Element
         * 5 - Create a Mask Canvas Element - requires defining what mask to use - served from the public folder URL
         * 6 - Create a Text Canvas Element to display status changes including 'Launch Camera'
         * 7 -
         * 8 - Create a resizeObserver on the enclosing div to manage orientation and page changes
         */
        constructor(div_id: string, client_id: string);
        GenerateMainCaptureDiv(isCameraActive: boolean, chosenMask?: string): {
            videoElement: HTMLVideoElement;
            canvasElement: HTMLCanvasElement;
        };
        GenerateCameraDiv(width: number): HTMLDivElement;
        UpdateValues(container: HTMLDivElement): void;
    }
    export { SecureCitizenBootstrapper };
}
declare module "utils/configuration" {
    export interface InitialConfig {
        div_id: string;
        client_id: string;
    }
    export interface ISecureCitizenCameraConfig {
        showControls: boolean;
        autoStart: boolean;
        useFaceDetection: boolean;
        startCameraText: string;
        buttonWidth: string;
        debug: boolean;
    }
    export class SecureCitizenCameraConfig {
        private showControls;
        private autoStart;
        private useFaceDetection;
        private startCameraText;
        private buttonWidth;
        private debugSetting;
        constructor(buttonWidth?: string, useFaceDetection?: boolean, autoStart?: boolean, showControls?: boolean, startCameraText?: string, debug?: boolean);
        printConfig(): ISecureCitizenCameraConfig;
        setCameraText(text: string): SecureCitizenCameraConfig;
        disableFaceDetection(): SecureCitizenCameraConfig;
        enableFaceDetection(autoStart?: boolean): SecureCitizenCameraConfig;
        setButtonWidth(width: string): SecureCitizenCameraConfig;
        changeShowControls(value?: boolean): SecureCitizenCameraConfig;
        changeDebug(value?: boolean): SecureCitizenCameraConfig;
        IsAutoStartEnabled: () => boolean;
        IsFaceDetectionEnabled: () => boolean;
        ButtonWidth: () => string;
        ShowControls: () => boolean;
        Debug: () => boolean;
        CameraText: () => string;
    }
    /** Gets the parameters used to start navigator.mediaDevices.getUserMedia(...) */
    export function GetConstraints(isMac?: boolean, width?: string, height?: string): {
        audio: boolean;
        video: {
            facingMode: string;
            width: number;
            height: number;
        };
    } | {
        audio: boolean;
        video: {
            facingMode: string;
            width: {
                ideal: number;
            };
            height: {
                ideal: number;
            };
        };
    };
}
declare module "sc-camera-module" {
    import { log } from "utils/errors";
    import { SecureCitizenBootstrapper } from "utils/bootstrap";
    import { InitialConfig } from "utils/configuration";
    function init(config: InitialConfig): SecureCitizenBootstrapper;
    const _default: {
        init: typeof init;
        log: typeof log;
    };
    export default _default;
}
