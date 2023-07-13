// do not combile a default export AND named exports in the same file
// because consumers of your bundle will have to use `my-bundle.default`
// to access the default export, which may not be what you want.
// Use `output.exports: "named"` to disable this warning.

import { log }  from './utils/errors';
import { SecureCitizenUserManager } from './auth/scauth'
// import { SecureCitizenFaceCamera } from './sc-face-camera';
import { SecureCitizenBootstrapper } from './utils/bootstrap'
import { AuthInit, InitConfig } from './utils/configuration'

function init(config: InitConfig): void {
  log(config);
  const messageOutputElement = document.getElementById("messageOutput");
  if (messageOutputElement) {
    messageOutputElement.innerHTML = config.clientId;
  }

  const bootstrap = new SecureCitizenBootstrapper(config.sourceDiv, config.clientId);

  // return bootstrap;
}

function authinit(config: AuthInit): SecureCitizenUserManager {
  return new SecureCitizenUserManager(config.clientId);
}

export default {
  init: init,
  authinit: authinit,
  log
}
