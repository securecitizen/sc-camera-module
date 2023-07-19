import platform from 'platform-detect';
import { log } from './errors';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from './defaults';
import { GenerateErrorDiv } from '../components/error-output';
import { BootstrapCameraDiv, IdentifyOverlay, IdentifyWindow } from '../components/main-camera-div';
import { GenerateControlPanel } from '../components/control-panel';
import { SecureCitizenUserManager, SecureCitizenOIDC } from "../auth/scauth";
import { SecureCitizenCamera } from '../obsolete/sc-camera';
import { User } from 'oidc-client-ts';
import { EventBroker } from './typedeventemitter';

class SecureCitizenBootstrapper {
    private random_id_suffix = Math.floor((Math.random() * 1000000)).toString();
    // private authBase: string;
    private auth: SecureCitizenUserManager;
    // private isMobile: boolean;
    // private isMac: boolean;
    // private isIOS: boolean;
    // private pixelRatio: number;
    private camera: SecureCitizenCamera;

    private originationDiv: HTMLDivElement;
    private overlayMask: HTMLImageElement;
    
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
    constructor(
        sourceDiv: string,
        clientId: string,
        maskDiv?: string
    ) {
        // set all fixed  or initial values in the constructor

        // Check if browser or exit
        if(!platform.web) { throw Error("This library is only for browser based usage")}

        this.auth = new SecureCitizenUserManager(clientId);
        log('Auth Config: ', this.auth.settings)

        // check the pixelRatio (to be used for scaling ?)
        const pixelRatio = platform.pixelRatio;

        log('Pixel Ratio: ' + pixelRatio);

        // check the width and height of the div we are located in

        this.overlayMask = document.getElementById(maskDiv ?? 'overlayMask') as HTMLImageElement;

        const { width: overlayWidth, height: overlayHeight } = IdentifyOverlay(this.overlayMask);

        this.originationDiv = document.getElementById(sourceDiv) as HTMLDivElement;

        const { width, height } = IdentifyWindow(this.originationDiv);

        this.camera = new SecureCitizenCamera(this.random_id_suffix, overlayWidth, overlayHeight);

        // log(this.camera.cameraDiv);
        // IdentifyWindow(this.camera.cameraDiv)
        this.originationDiv.appendChild(this.camera.cameraDiv);

        
    if(this.camera.config.ShowControls()) {
        // attach the control panel to the named div if requested
        const controlPanelDiv = GenerateControlPanel(this.random_id_suffix);
        
        // Finally append the controlPanelDiv to the SecureCitizenCameraDiv
        this.originationDiv?.appendChild(controlPanelDiv);
        
        // Listening to button bresses from the control panel
        EventBroker.on('openCameraBtn', () => {
          this.camera.openCamera();
        });
        EventBroker.on('takePhotoBtn', () => {
          this.camera.takePhoto();
        });
        EventBroker.on('closeCameraBtn', () => {
          this.camera.closeCamera();
        });
        EventBroker.on('login', () => {
            this.auth.signinPopup();
          });
          EventBroker.on('logout', () => {
            this.auth.signoutPopup();
          });
          EventBroker.on('getSession', () => {
            const session = this.auth.querySessionStatus();
            log('Session: ', session)
          });
          EventBroker.on('getUser', () => {
            const user = this.auth.getUser();
            log('User: ' + user)
          });
      }

        this.ConfigureListeners();
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

    // public GenerateErrorDiv(): HTMLDivElement {
    //     return GenerateErrorDiv(this.random_id_suffix);
    // }

    // public GenerateControlPanel() {
    //     return GenerateControlPanel(this.random_id_suffix);
    // }
}

export { SecureCitizenBootstrapper }
