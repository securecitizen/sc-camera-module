// do not combile a default export AND named exports in the same file
// because consumers of your bundle will have to use `my-bundle.default`
// to access the default export, which may not be what you want.
// Use `output.exports: "named"` to disable this warning.

import { SecureCitizenUserManager } from './auth/scauth'
import { SecureCitizenCamera } from './components/camera';
import { AuthInit, InitConfig } from './utils/configuration'
import { DEFAULT_MESSAGE_OUTSINK } from './utils/defaults';

function init(config: InitConfig): void {
  const messageOutputElement = document.getElementById(DEFAULT_MESSAGE_OUTSINK) as HTMLPreElement;
  if (messageOutputElement) {
    messageOutputElement.innerHTML = config.clientId;
  }

  config.debug = true;

  const camera = new SecureCitizenCamera(config);

  camera.init(messageOutputElement);
  // return bootstrap;
}

function authinit(config: AuthInit): SecureCitizenUserManager {
  return new SecureCitizenUserManager(config.clientId);
}

export default {
  init: init,
  authinit: authinit
}
