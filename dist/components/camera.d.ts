import * as H from '@vladmandic/human';
import { InitConfig } from "../utils/configuration";
declare class SecureCitizenCamera {
    videoElement: HTMLVideoElement | undefined;
    canvasElement: HTMLCanvasElement;
    fpsElement: HTMLPreElement | undefined;
    okElement: HTMLDivElement;
    messageElement: HTMLPreElement;
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
        mask: boolean | undefined;
        rotation: boolean | undefined;
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
    constructor(config: InitConfig, override?: {
        canvasElement?: HTMLCanvasElement | undefined;
        okElement?: HTMLDivElement | undefined;
        messageElement?: HTMLPreElement | undefined;
    }, optional?: {
        fpsElement?: HTMLPreElement | undefined;
        videoElement?: HTMLVideoElement | undefined;
    });
    validationLoop(): Promise<H.FaceResult>;
    detectFace(): Promise<boolean>;
    main(): Promise<boolean>;
    init(): Promise<void>;
}
export { SecureCitizenCamera };
