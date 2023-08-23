import { User } from 'oidc-client-ts';
declare class TypedEventEmitter<TEvents extends Record<string, any>> {
    private emitter;
    emit<TEventName extends keyof TEvents & string>(eventName: TEventName, ...eventArg: TEvents[TEventName]): void;
    on<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void): void;
    off<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void): void;
}
/**
 * A map of event names to argument tuples
 */
declare type LocalEventTypes = {
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
export declare const EventBroker: TypedEventEmitter<LocalEventTypes>;
export {};
