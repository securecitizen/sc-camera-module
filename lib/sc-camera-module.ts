// do not combile a default export AND named exports in the same file
// because consumers of your bundle will have to use `my-bundle.default`
// to access the default export, which may not be what you want.
// Use `output.exports: "named"` to disable this warning.

import { SecureCitizenUserManager } from './auth/scauth'
import { SecureCitizenCamera } from './components/camera';
import { AuthInit, InitConfig } from './utils/configuration'

function init(config: InitConfig): void {

  config.debug = true;

  const camera = new SecureCitizenCamera(config);

  camera.init();
  // return bootstrap;
}

function authinit(config: AuthInit): SecureCitizenUserManager {
  return new SecureCitizenUserManager(config.clientId);
}

export default {
  init: init,
  authinit: authinit
}
