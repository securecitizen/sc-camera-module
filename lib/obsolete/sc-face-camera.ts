import { SecureCitizenCamera } from './sc-camera';
import { UserManager, SecureCitizenOIDC } from "./auth/auth-settings";
import { User } from 'oidc-client-ts';
import { log } from './utils/errors';
import { EventBroker } from './utils/typedeventemitter'
import { SecureCitizenCameraConfig } from './utils/configuration';

interface Inputs {
    client_id?: string | null
}

class SecureCitizenFaceCamera {
    // private cameraDiv: HTMLDivElement;
    private auth: UserManager;
    private camera: SecureCitizenCamera;
    /**
     *
     */
    constructor({ client_id } : Inputs) {
        // if no client_id has been defined then throw an error
        if(client_id === undefined || client_id?.length === 0) {
            throw new Error("Please provide a suitable client_id");
        } else 
        // hack for our apps - if client_Id is set to null then we use our defaults
        if(client_id === null) {
            // use all defaults
            log("ClientID set to NULL - using client_id: " + SecureCitizenOIDC.client_id)
            this.auth = new UserManager(SecureCitizenOIDC);
        } else {
            SecureCitizenOIDC.client_id = client_id;
            // use all defaults
            log("ClientID set to " + SecureCitizenOIDC.client_id)
            this.auth = new UserManager(SecureCitizenOIDC);
        }

        this.ConfigureListeners();

        // configure the camera

        this.camera = new SecureCitizenCamera();
        this.camera.loadCameraModule();
    }

    private ConfigureListeners() {
        
        const um = this.auth;
    this.auth.events.addAccessTokenExpiring(function () {
        console.log("token expiring");
        log("token expiring");
        EventBroker.emit('userChange', 1, 'token_expiring');
        // maybe do this code manually if automaticSilentRenew doesn't work for you
        um.signinSilent().then(function(user: User | null) {
            EventBroker.emit('userAcquired', 1, user);
            log("silent renew success", user);
        }).catch(function(e: Error) {
            log("silent renew error", e.message);
            EventBroker.emit('userError', 1, e.message);
        });
    });

    this.auth.events.addAccessTokenExpired(function () {
        console.log("token expired");
        log("token expired");
        EventBroker.emit('userChange', 1, 'token_expired');
    });

    this.auth.events.addSilentRenewError(function (e) {
        console.log("silent renew error", e.message);
        log("silent renew error", e.message);
        EventBroker.emit('userError', 1, e.message);
    });

    this.auth.events.addUserLoaded(function (user) {
        console.log("user loaded", user);
        um.getUser().then(function() {
            console.log("getUser loaded user after userLoaded event fired");
        });
        EventBroker.emit('userChange', 1, 'user_loaded');
    });                                                                             

    this.auth.events.addUserUnloaded(function () {
        console.log("user unloaded");
        EventBroker.emit('userChange', 1, 'user_unloaded');
    });

    this.auth.events.addUserSignedIn(function () {
        log("user logged in to the token server");
        EventBroker.emit('userChange', 1, 'user_signed_in');
    });

    this.auth.events.addUserSignedOut(function () {
        log("user logged out of the token server");
        EventBroker.emit('userChange', 1, 'user_signed_out');
    });
    }

    // Auth methods

  public clearState() {
    this.auth.clearStaleState().then(function() {
        log("clearStateState success");
    }).catch(function(err) {
        console.error(err);
        log(err);
    });
}

public sessionStatus() {
    this.auth.querySessionStatus().then(function(status) {
        log("user's session status", status);
    }).catch(function(err) {
        console.error(err);
        log(err);
    });
}

public getUser() {
  this.auth.getUser().then(function(user: User | null) {
      log("user object", user);
  }).catch(function(err) {
      console.error(err);
      log(err);
  });
}

public revokeAccessToken() {
    this.auth.revokeTokens().then(function() {
        log("access token revoked");
    }).catch(function(err) {
        console.error(err);
        log(err);
    });
}

public startSigninMainWindow() {
    this.auth.signinRedirect({ state: { foo: "bar" } /*, useReplaceToNavigate: true*/ }).then(function() {
        log("signinRedirect done");
    }).catch(function(err) {
        console.error(err);
        log(err);
    });
}

public endSigninMainWindow() {
    this.auth.signinRedirectCallback().then(function(user) {
        log("signed in", user);
        // this is how you get the custom state after the login:
        var customState = (user as User).state;
        console.log("here's our post-login custom state", customState);
    }).catch(function(err) {
        console.error(err);
        log(err);
    });
}

public popupSignin() {
    this.auth.signinPopup().then(function(user) {
        log("signed in", user);
    }).catch(function(err) {
        console.error(err);
        log(err);
    });
}

public popupSignout() {
    this.auth.signoutPopup().then(function() {
        log("signed out");
    }).catch(function(err) {
        console.error(err);
        log(err);
    });
}

public iframeSignin() {
    this.auth.signinSilent().then(function(user) {
        log("signed in silent", user);
    }).catch(function(err) {
        console.error(err);
        log(err);
    });
}

public startSignoutMainWindow() {
    this.auth.signoutRedirect().then(function(resp) {
        log("signed out", resp);
    }).catch(function(err) {
        console.error(err);
        log(err);
    });
}

public endSignoutMainWindow() {
    this.auth.signoutRedirectCallback().then(function(resp) {
        log("signed out", resp);
    }).catch(function(err) {
        console.error(err);
        log(err);
    });
}
}

export { SecureCitizenFaceCamera };

export function DefaultCameraConfig(): SecureCitizenCameraConfig { 
    return new SecureCitizenCameraConfig().changeDebug(true) 
  };
export function DisableFaceCameraConfig(): SecureCitizenCameraConfig { 
    return new SecureCitizenCameraConfig().disableFaceDetection() 
  };
export function DefaultCameraConfigWithControls(): SecureCitizenCameraConfig { 
    return  new SecureCitizenCameraConfig().changeShowControls(true).changeDebug() 
  };