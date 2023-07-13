import platform from 'platform-detect';
import { log } from './errors';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from './defaults';
import { GenerateErrorDiv } from '../components/error-output';
import { BootstrapCameraDiv, BootstrapCanvas, BootstrapVideo, IdentifyContent, IdentifyWindow, PatchContentSize } from '../components/main-camera-div';
import { GenerateControlPanel } from '../components/control-panel';
import { SecureCitizenUserManager, SecureCitizenOIDC } from "../auth/auth-settings";
// import { EventBroker } from './typedeventemitter'

class SecureCitizenBootstrapper {
    private random_id_suffix = Math.floor((Math.random() * 1000000)).toString();
    private authBase: string;
    private auth: SecureCitizenUserManager;
    private isMobile: boolean;
    private isMac: boolean;
    private isIOS: boolean;
    private pixelRatio: number;

    private originationDiv: HTMLDivElement;
    private cameraDiv: HTMLDivElement;
    
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
        mask?: string
    ) {
        // set all fixed  or initial values in the constructor

        // Check if browser or exit
        if(!platform.web) { throw Error("This library is only for browser based usage")}
        
        // Set the Auth Suffix
        const whatPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
        this.authBase = window.location.origin + whatPath;

        SecureCitizenOIDC.client_id = clientId;

        this.auth = new SecureCitizenUserManager(SecureCitizenOIDC);

        // Initialise an Auth instance
        log('Client ID: ' + clientId + ' and authBase set to ' + this.authBase);

        log('Auth Config: ', this.auth.settings)

        // check if this isMobile, isIOS or isMac
        this.isMobile = platform.phone || platform.tablet;
        this.isIOS = platform.ios;
        this.isMac = platform.macos;

        log('Mobile: ' + this.isMobile);
        log('IOS: ' + this.isIOS);
        log('MAC: ' + this.isMac);

        // check the pixelRatio (to be used for scaling ?)
        this.pixelRatio = platform.pixelRatio;

        log('Pixel Ratio: ' + this.pixelRatio);

        // check the width and height of the div we are located in

        this.originationDiv = document.getElementById(sourceDiv) as HTMLDivElement;

        const { width, height } = IdentifyWindow(this.originationDiv);

        // Update this div by bootstrapping our content
        this.cameraDiv = BootstrapCameraDiv(this.random_id_suffix, width, height);

        this.originationDiv.appendChild(this.cameraDiv);

        const videoElement = document.getElementById('cameraVideo' + this.random_id_suffix) as HTMLVideoElement;
        const canvasElement = document.getElementById('cameraVideo' + this.random_id_suffix) as HTMLCanvasElement;

        IdentifyContent(videoElement);
        IdentifyContent(canvasElement);
    }

    // public GenerateErrorDiv(): HTMLDivElement {
    //     return GenerateErrorDiv(this.random_id_suffix);
    // }

    // public GenerateControlPanel() {
    //     return GenerateControlPanel(this.random_id_suffix);
    // }
}

export { SecureCitizenBootstrapper }
