// Path: demo-page-assets/demo.ts
// This is the entry point for the demo page. It's a TypeScript file that
//  loads in the module that we're buidling with this repo
import { SecureCitizenUserManager } from '../lib/sc-camera-module'
import { DEFAULT_CLIENT_ID } from '../lib/utils/defaults';

const loginElement: HTMLButtonElement | undefined  = document.getElementById('login') as HTMLButtonElement;
const checkSessionElement: HTMLButtonElement | undefined  = document.getElementById('checksession') as HTMLButtonElement;

const config = {
    clientId: DEFAULT_CLIENT_ID,
    debug: false
}

const auth = new SecureCitizenUserManager(config.clientId);


loginElement.addEventListener('click', () => {
        // console.log(auth);
        auth.signinPopup();
        // auth.startSigninMainWindow();
    });

auth.events.addUserLoaded(() => {
    checkSessionElement.hidden = false;
    console.log("User loaded");
})

auth.events.addUserSignedIn(() =>
{
    checkSessionElement.hidden = false;
    console.log("User Signed In");
})

checkSessionElement.addEventListener('click', async () => {
    console.log(await auth.sessionStatus());
})

import './style.pcss';