import { Log, User, UserManager, UserManagerSettings, WebStorageStateStore } from "oidc-client-ts";
import { DEFAULT_CLIENT_ID } from "../utils/defaults";
import { log } from "../utils/errors";

Log.setLogger(console);
Log.setLevel(Log.INFO);

const whatPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
const url = window.location.origin + whatPath;

export const SecureCitizenOIDC : UserManagerSettings = {
    stateStore: new WebStorageStateStore({ store: window.localStorage }),
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    authority: "https://sts.dev.securecitizen.cloud",
    client_id: DEFAULT_CLIENT_ID,
    //client_id: 'interactive.public.short',
    redirect_uri: url + "/index.html",
    post_logout_redirect_uri: url + "/index.html",
    response_type: "code",
    //response_mode: 'fragment',
    scope: "openid profile offline_access",
    //scope: 'openid profile api offline_access',

    popup_redirect_uri: url + "/scauth/popup-signin.html",
    popup_post_logout_redirect_uri: url + "/scauth/popup-signout.html",

    

    silent_redirect_uri: url + "/scauth/silent-renew.html",
    automaticSilentRenew: false,
    validateSubOnSilentRenew: true,
    //silentRequestTimeout: 10000,

    loadUserInfo: true,

    monitorAnonymousSession: true,

    filterProtocolClaims: true,
    revokeTokensOnSignout: true,

    //metadata: {"issuer":"https://demo.duendesoftware.com","jwks_uri":"https://demo.duendesoftware.com/.well-known/openid-configuration/jwks","authorization_endpoint":"https://demo.duendesoftware.com/connect/authorize","token_endpoint":"https://demo.duendesoftware.com/connect/token","userinfo_endpoint":"https://demo.duendesoftware.com/connect/userinfo","end_session_endpoint":"https://demo.duendesoftware.com/connect/endsession","check_session_iframe":"https://demo.duendesoftware.com/connect/checksession","revocation_endpoint":"https://demo.duendesoftware.com/connect/revocation","introspection_endpoint":"https://demo.duendesoftware.com/connect/introspect","device_authorization_endpoint":"https://demo.duendesoftware.com/connect/deviceauthorization","frontchannel_logout_supported":true,"frontchannel_logout_session_supported":true,"backchannel_logout_supported":true,"backchannel_logout_session_supported":true,"scopes_supported":["openid","profile","email","api","api.scope1","api.scope2","scope2","policyserver.runtime","policyserver.management","offline_access"],"claims_supported":["sub","name","family_name","given_name","middle_name","nickname","preferred_username","profile","picture","website","gender","birthdate","zoneinfo","locale","updated_at","email","email_verified"],"grant_types_supported":["authorization_code","client_credentials","refresh_token","implicit","password","urn:ietf:params:oauth:grant-type:device_code"],"response_types_supported":["code","token","id_token","id_token token","code id_token","code token","code id_token token"],"response_modes_supported":["form_post","query","fragment"],"token_endpoint_auth_methods_supported":["client_secret_basic","client_secret_post"],"id_token_signing_alg_values_supported":["RS256"],"subject_types_supported":["public"],"code_challenge_methods_supported":["plain","S256"],"request_parameter_supported":true},
    //metadataSeed: {"some_extra_data":"some_value"},
    //signingKeys:[{"kty":"RSA","use":"sig","kid":"5CCAA03EDDE26D53104CC35D0D4B299C","e":"AQAB","n":"3fbgsZuL5Kp7HyliAznS6N0kTTAqApIzYqu0tORUk4T9m2f3uW5lDomNmwwPuZ3QDn0nwN3esx2NvZjL_g5DN407Pgl0ffHhARdtydJvdvNJIpW4CmyYGnI8H4ZdHtuW4wF8GbKadIGgwpI4UqcsHuPiWKARfWZMQfPKBT08SiIPwGncavlRRDgRVX1T94AgZE_fOTJ4Odko9RX9iNXghJIzJ_wEkY9GEkoHz5lQGdHYUplxOS6fcxL8j_N9urSBlnoYjPntBOwUfPsMoNcmIDXPARcq10miWTz8SHzUYRtsiSUMqimRJ9KdCucKcCmttB_p_EAWohJQDnav-Vqi3Q","alg":"RS256"}]
};

class SecureCitizenUserManager extends UserManager {
    constructor(clientId: string) {
        const settings = SecureCitizenOIDC;
        settings.client_id = clientId;
        super(settings);

        // Initialise an Auth instance
        log('Client ID: ' + clientId + ' and authBase set to ' + url);
    }

    
    // Auth methods

    public clearState() {
        this.clearStaleState().then(function() {
            log("clearStateState success");
        }).catch(function(err) {
            console.error(err);
            log(err);
        });
    }

public sessionStatus() {
    this.querySessionStatus().then(function(status) {
        log("user's session status", status);
    }).catch(function(err) {
        console.error(err);
        log(err);
    });
}

public getUserInfo() {
    this.getUser().then(function(user: User | null) {
        log("user object", user);
    }).catch(function(err) {
        console.error(err);
        log(err);
    });
}

public revokeAccessToken() {
    this.revokeTokens().then(function() {
        log("access token revoked");
    }).catch(function(err) {
        console.error(err);
        log(err);
    });
}

public startSigninMainWindow() {
    this.signinRedirect({ state: { foo: "bar" } /*, useReplaceToNavigate: true*/ }).then(function() {
        log("signinRedirect done");
    }).catch(function(err) {
        console.error(err);
        log(err);
    });
}

public endSigninMainWindow() {
    this.signinRedirectCallback().then(function(user) {
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
    this.signinPopupCallback().then(function(user) {
        log("signed in", user);
    }).catch(function(err) {
        console.error(err);
        log(err);
    });
}

public popupSignout() {
    this.signoutPopupCallback().then(function() {
        log("signed out");
    }).catch(function(err) {
        console.error(err);
        log(err);
    });
}

public iframeSignin() {
    this.signinSilent().then(function(user) {
        log("signed in silent", user);
    }).catch(function(err) {
        console.error(err);
        log(err);
    });
}

public startSignoutMainWindow() {
    this.signoutRedirect().then(function(resp) {
        log("signed out", resp);
    }).catch(function(err) {
        console.error(err);
        log(err);
    });
}

public endSignoutMainWindow() {
    this.signoutRedirectCallback().then(function(resp) {
        log("signed out", resp);
    }).catch(function(err) {
        console.error(err);
        log(err);
    });
}
}

export {
    Log as UserManagerLog,
    SecureCitizenUserManager,
    url as baseUrl
};