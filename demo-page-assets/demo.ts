// Path: demo-page-assets/demo.ts
// This is the entry point for the demo page. It's a TypeScript file that
//  loads in the module that we're buidling with this repo
import ModuleDemoPage from '../lib/sc-camera-module'

// ModuleDemoPage.init('Success! The module is working.')

ModuleDemoPage.init({div_id: 'camera', client_id: 'sc-app-beta'});

import './style.pcss';

// From here, you can add any additional JavaScript you want to run on the demo page.
// For example, you could add a button that calls a function in the module.

