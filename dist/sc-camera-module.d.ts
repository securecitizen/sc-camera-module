declare module "utils/defaults" {
    export const DEFAULT_CAMERA_TEXT = "Start Camera";
    export const DEFAULT_CONTROLS_STATE = true;
    export const DEFAULT_AUTO_START = false;
    export const DEFAULT_DEBUG_VALUE = false;
    export const DEFAULT_AUTH_SUFFIX = "/scauth";
    export const DEFAULT_CLIENT_ID = "sc-app-beta";
    export const DEFAULT_MESSAGE_OUTSINK = "messageOutput";
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
declare module "utils/detection" {
    export class IDomContainer {
        canvas: HTMLCanvasElement;
        fps: HTMLPreElement;
        ok: HTMLDivElement;
    }
    export class IFullDomContainer extends IDomContainer {
        match: HTMLDivElement;
        name: HTMLInputElement;
        save: HTMLSpanElement;
        delete: HTMLSpanElement;
        retry: HTMLDivElement;
        source: HTMLCanvasElement;
    }
    export enum ContainerType {
        Minimal = 0,
        Full = 1
    }
    export const ok: Record<string, {
        status: boolean | undefined;
        val: number;
    }>;
    export const allOk: () => boolean;
    export function drawValidationTests(dom: IDomContainer): void;
}
declare module "components/camera-configs" {
    import * as H from '@vladmandic/human';
    const simpleConfig: Partial<H.Config>;
    const basicConfig: Partial<H.Config>;
    const optimisedConfig: Partial<H.Config>;
    export { optimisedConfig, simpleConfig, basicConfig };
    export default optimisedConfig;
}
declare module "utils/errors" {
    const errorToFriendly: {
        [key: string]: string;
    };
    function DebugLogger(debug: boolean, value: string): void;
    const log: (messageOutputElement: HTMLPreElement, ...msg: any[]) => void;
    function logMessages(...args: any[]): void;
    export { errorToFriendly, log, logMessages, DebugLogger };
}
declare module "components/draw-templates" {
    import * as H from "@vladmandic/human";
    export const drawOptions: Partial<H.DrawOptions>;
    export default drawOptions;
}
declare module "utils/configuration" {
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
    export class SecureCitizenCameraConfig {
        showControls: boolean;
        autoStart: boolean;
        startCameraText: string;
        debug: boolean;
        constructor(autoStart?: boolean, showControls?: boolean, startCameraText?: string, debug?: boolean);
        setCameraText(text: string): SecureCitizenCameraConfig;
    }
}
declare module "components/camera" {
    import { ContainerType, IDomContainer, IFullDomContainer } from "utils/detection";
    import * as H from '@vladmandic/human';
    import { InitConfig } from "utils/configuration";
    class SecureCitizenCamera {
        dom: IFullDomContainer | IDomContainer;
        log: HTMLPreElement;
        human: H.Human;
        matchOptions: {
            order: number;
            multiplier: number;
            min: number;
            max: number;
        };
        debug: boolean;
        options: {
            order: number;
            multiplier: number;
            min: number;
            max: number;
            minConfidence: number;
            minSize: number;
            maxTime: number;
            blinkMin: number;
            blinkMax: number;
            threshold: number;
            distanceMin: number;
            distanceMax: number;
            mask: boolean;
            rotation: boolean;
        };
        current: {
            face: H.FaceResult | null;
        };
        blink: {
            start: number;
            end: number;
            time: number;
        };
        timestamp: {
            detect: number;
            draw: number;
        };
        startTime: number;
        protected sourceDomElements(): void;
        constructor(config: InitConfig, type?: ContainerType);
        validationLoop(): Promise<H.FaceResult>;
        detectFace(): Promise<boolean>;
        main(): Promise<boolean>;
        init(): Promise<void>;
    }
    export { SecureCitizenCamera };
}
declare module "sc-camera-module" {
    import { SecureCitizenUserManager } from "auth/scauth";
    import { AuthInit, InitConfig } from "utils/configuration";
    function init(config: InitConfig): void;
    function authinit(config: AuthInit): SecureCitizenUserManager;
    const _default: {
        init: typeof init;
        authinit: typeof authinit;
    };
    export default _default;
}
