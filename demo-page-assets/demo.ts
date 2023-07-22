// Path: demo-page-assets/demo.ts
// This is the entry point for the demo page. It's a TypeScript file that
//  loads in the module that we're buidling with this repo
import ModuleDemoPage from '../lib/human'

// ModuleDemoPage.init('Success! The module is working.')

ModuleDemoPage.init();

// ModuleDemoPage.init({sourceDiv: 'camera', clientId: 'sc-app-beta'});

// const container = document.getElementById('camera') as HTMLDivElement
// camera.UpdateValues(container);

import './style.pcss';

// From here, you can add any additional JavaScript you want to run on the demo page.
// For example, you could add a button that calls a function in the module.

