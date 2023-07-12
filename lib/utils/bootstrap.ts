import platform from 'platform-detect';
import { log } from './errors';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from './defaults';
import { GenerateErrorDiv } from '../components/error-output';
import { BootstrapCameraDiv, BootstrapCanvas, BootstrapVideo, GenerateMainCaptureDiv } from '../components/main-camera-div';
import { GenerateControlPanel } from '../components/control-panel';
// import { EventBroker } from './typedeventemitter'

class SecureCitizenBootstrapper {
    private random_id_suffix = Math.floor((Math.random() * 1000000)).toString();
    public authBase: string;
    public isMobile: boolean;
    public isMac: boolean;
    public isIOS: boolean;
    public pixelRatio: number;

    public parentDivWidth: number = 0;
    public parentDivHeight: number = 0;
    public divWidth: number = 0;
    public divHeight: number = 0;

    public videoElement: HTMLVideoElement; // the <video> tag
    public canvasElement: HTMLCanvasElement; // the mask <canvas>
    
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
    constructor(
        div_id: string,
        client_id: string
    ) {
        // set all fixed  or initial values in the constructor

        // Check if browser or exit
        if(!platform.web) { throw Error("This library is only for browser based usage")}
        
        // Set the Auth Suffix
        const whatPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
        this.authBase = window.location.origin + whatPath;

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

        // check the width and height of the div we are located in - TBD

        this.videoElement = document.createElement('video'); // moved to function
        this.canvasElement = document.createElement('canvas'); // moved to function
    }

    // public GenerateErrorDiv(): HTMLDivElement {
    //     return GenerateErrorDiv(this.random_id_suffix);
    // }

    public GenerateMainCaptureDiv(
        isCameraActive: boolean,
        chosenMask?: string
    ): {
        videoElement: HTMLVideoElement;
        canvasElement: HTMLCanvasElement;
    } {
        const videoElement = BootstrapVideo(this.random_id_suffix);
        const canvasElement = BootstrapCanvas(this.random_id_suffix, chosenMask);
        
        return { videoElement, canvasElement };
    }

    // public GenerateControlPanel() {
    //     return GenerateControlPanel(this.random_id_suffix);
    // }

    public GenerateCameraDiv(width: number): HTMLDivElement {
        
        log("Width Configured to " + width)
        return BootstrapCameraDiv(this.random_id_suffix, width);
    }

    public UpdateValues(
        container: HTMLDivElement
    ) {
        this.parentDivWidth = window.screen.availWidth;
        this.parentDivHeight = window.screen.availHeight;

        log('Parent size set to - Width: ' + this.parentDivWidth + ' - Height: ' + this.parentDivHeight)

        this.divWidth = container.clientWidth !== 0 || container.clientWidth <= DEFAULT_WIDTH ? container.clientWidth : DEFAULT_WIDTH;
        this.divHeight = container.clientHeight !== 0 || container.clientHeight <= DEFAULT_HEIGHT ? container.clientHeight : DEFAULT_HEIGHT;

        log('Canvas size set to - Width: ' + this.divWidth + ' - Height: ' + this.divHeight)
    }
}

export { SecureCitizenBootstrapper }
