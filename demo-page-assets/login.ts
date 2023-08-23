import SecureCitizenAuth from '../lib/sc-camera-module'

        // ModuleDemoPage.init('Success! The module is working.')

        const auth = SecureCitizenAuth.authinit({clientId: 'sc-app-beta'});
        console.log(auth);
        // auth.signinPopupCallback();
        // auth.signoutPopupCallback();
        // auth.startSilentRenew();