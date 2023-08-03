// Path: demo-page-assets/demo.ts
// This is the entry point for the demo page. It's a TypeScript file that
//  loads in the module that we're buidling with this repo
import { SecureCitizenCamera } from '../lib/sc-camera-module'
import { DEFAULT_CLIENT_ID } from '../lib/utils/defaults';

// import ModuleDemoPage from '../lib/sc-camera-module'

// const config = {
//     clientId: DEFAULT_CLIENT_ID,
//     debug: true
// }

// ModuleDemoPage.quickInit(config);

// The important part: the name of the variable needs to be equal to the ref's name of the canvas element in the template
const canvasElement: HTMLCanvasElement | undefined = document.getElementById('canvas') as HTMLCanvasElement;
const okElement: HTMLDivElement | undefined  = document.getElementById('ok') as HTMLDivElement;
const messageElement: HTMLPreElement | undefined  = document.getElementById('messageOutput') as HTMLPreElement;

const config = {
    clientId: DEFAULT_CLIENT_ID,
    debug: false
}


const override = {
    canvasElement,
    okElement,
    messageElement
}

const camera = new SecureCitizenCamera(config, override);

camera.init();

import './style.pcss';

