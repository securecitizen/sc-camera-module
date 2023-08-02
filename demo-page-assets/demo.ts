// Path: demo-page-assets/demo.ts
// This is the entry point for the demo page. It's a TypeScript file that
//  loads in the module that we're buidling with this repo
import ModuleDemoPage from '../lib/sc-camera-module'
import { DEFAULT_CLIENT_ID } from '../lib/utils/defaults';

const config = {
    clientId: DEFAULT_CLIENT_ID,
    debug: true
}

ModuleDemoPage.quickInit(config);

import './style.pcss';

