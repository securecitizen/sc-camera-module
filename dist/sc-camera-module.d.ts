declare module "utils/defaults" {
    export const DEFAULT_BTN_WIDTH = "30";
    export const DEFAULT_CAMERA_TEXT = "Start Camera";
    export const DEFAULT_CONTROLS_STATE = true;
    export const DEFAULT_AUTO_START = false;
    export const DEFAULT_FACE_DETECT = true;
    export const DEFAULT_DEBUG_VALUE = false;
    export const CAMERA_TOP_PADDING = "50px";
    export const CAMERA_BOTTOM_PADDING = "50px";
    export const CAMERA_LEFT_PADDING = "50px";
    export const CAMERA_RIGHT_PADDING = "50px";
    export const DEFAULT_AUTH_SUFFIX = "/scauth";
    export const DEFAULT_MIN_WIDTH = 140;
    export const DEFAULT_MAX_WIDTH = 732;
    export const DEFAULT_ERROR_OUTSINK = "out";
    export const DEFAULT_MESSAGE_OUTSINK = "logMessages";
    export const DEFAULT_CLIENT_ID = "sc-app-beta";
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
declare module "auth/scauth" {
    import { Log, UserManager, UserManagerSettings } from "oidc-client-ts";
    const url: string;
    export const SecureCitizenOIDC: UserManagerSettings;
    class SecureCitizenUserManager extends UserManager {
        constructor(clientId: string);
        clearState(): void;
        sessionStatus(): void;
        getUserInfo(): void;
        revokeAccessToken(): void;
        startSigninMainWindow(): void;
        endSigninMainWindow(): void;
        popupSignin(): void;
        popupSignout(): void;
        iframeSignin(): void;
        startSignoutMainWindow(): void;
        endSignoutMainWindow(): void;
    }
    export { Log as UserManagerLog, SecureCitizenUserManager, url as baseUrl };
}
declare module "components/error-output" {
    function GenerateErrorDiv(random_id_suffix: string): HTMLDivElement;
    export { GenerateErrorDiv };
}
declare module "components/main-camera-div" {
    function IdentifyWindow(checkedElement: HTMLDivElement): {
        width: number;
        height: number;
    };
    function IdentifyOverlay(checkedElement: HTMLImageElement): {
        width: number;
        height: number;
        aspectRatio: number;
    };
    function IdentifyContent(checkedElement: HTMLVideoElement | HTMLCanvasElement): void;
    function PatchContentSize(checkedElement: HTMLVideoElement | HTMLCanvasElement, width: number, height: number): void;
    function BootstrapCameraDiv(random_id_suffix: string, width: string, height: string, mask: HTMLImageElement): {
        cameraDiv: HTMLDivElement;
        videoElement: HTMLVideoElement;
        canvasElement: HTMLCanvasElement;
    };
    function BootstrapVideo(random_id_suffix: string): HTMLVideoElement;
    function BootstrapMask(chosenMask: HTMLImageElement): void;
    function BootstrapCanvas(random_id_suffix: string, chosenMask: HTMLImageElement): HTMLCanvasElement;
    export { BootstrapCanvas, BootstrapVideo, BootstrapCameraDiv, BootstrapMask, IdentifyWindow, IdentifyContent, IdentifyOverlay, PatchContentSize };
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
        'login': [];
        'logout': [];
        'getUser': [];
        'getSession': [];
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
declare module "utils/configuration" {
    export interface AuthInit {
        clientId: string;
    }
    export interface InitConfig extends AuthInit {
        sourceDiv: string;
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
}
declare module "utils/imagemgmt" {
    function resizeSVGOnCanvas(canvas: HTMLCanvasElement, originalImage: HTMLImageElement, newWidth: number, newHeight?: number): void;
    /** Gets the parameters used to start navigator.mediaDevices.getUserMedia(...) */
    function GetConstraints(width?: string, height?: string): {
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
    export { resizeSVGOnCanvas, GetConstraints };
}
declare module "obsolete/sc-camera" {
    import { SecureCitizenCameraConfig } from "utils/configuration";
    export function DefaultCameraConfig(): SecureCitizenCameraConfig;
    export function DisableFaceCameraConfig(): SecureCitizenCameraConfig;
    export function DefaultCameraConfigWithControls(): SecureCitizenCameraConfig;
    class SecureCitizenCamera {
        isCameraActive: boolean;
        config: SecureCitizenCameraConfig;
        debugSetting: boolean;
        private videoElement;
        private canvasElement;
        private maskElement;
        cameraDiv: HTMLDivElement;
        constructor(random_id_suffix: string, width: number, maskDiv: string);
        /** Handles errors coming from the stream manager */
        private onStreamManagerError;
        /** Takes a photo of the current frame and returns it as a string */
        takePhoto(): void;
        /**Starts a stream to display the camera video on screen and starts face detection if necessary */
        openCamera(): void;
        closeCamera(): void;
        /**
         * SubscribeToCancelled
         */
        SubscribeToCancelled(f: Function): void;
        /**
         * SubscribeToCameraError
         */
        SubscribeToCameraError(f: Function): void;
        /**
         * SubscribeToPhotoTaken
         */
        SubscribeToPhotoTaken(f: Function): void;
    }
    export { SecureCitizenCamera };
}
declare module "utils/bootstrap" {
    class SecureCitizenBootstrapper {
        private random_id_suffix;
        private auth;
        private camera;
        private originationDiv;
        private overlayMask;
        /**
         * This bootstrap process will perform the following functions:
         * 1 - Identify what base URL we are running on for authentication configuration
         *     and creates an OIDC Authentication client based on this information
         * 2 - Identify what type of device we are running on
         * 3 - Identify our PixelRatio, and the width (required) and height (optional)
         *     from the enclosing div element
         * 4 - Create an enclosing CameraDiv element that our items will be within (the
         *     Camera Module itself)
         * 5 - Create a Video Element
         * 5 - Create a Mask Canvas Element - requires defining what mask to use - served
         *     from the public folder URL
         * 6 - Create a Text Canvas Element to display status changes including 'Launch
         *     Camera'
         * 7 -
         * 8 - Create a resizeObserver on the enclosing div to manage orientation and page changes
         */
        constructor(sourceDiv: string, clientId: string, maskDiv?: string);
        private ConfigureListeners;
    }
    export { SecureCitizenBootstrapper };
}
declare module "sc-camera-module" {
    import { log } from "utils/errors";
    import { SecureCitizenUserManager } from "auth/scauth";
    import { AuthInit, InitConfig } from "utils/configuration";
    function init(config: InitConfig): void;
    function authinit(config: AuthInit): SecureCitizenUserManager;
    const _default: {
        init: typeof init;
        authinit: typeof authinit;
        log: typeof log;
    };
    export default _default;
}
