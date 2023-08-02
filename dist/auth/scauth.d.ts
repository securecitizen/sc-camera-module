import { Log, UserManager, UserManagerSettings } from "oidc-client-ts";
declare const url: string;
export declare const SecureCitizenOIDC: UserManagerSettings;
declare class SecureCitizenUserManager extends UserManager {
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
