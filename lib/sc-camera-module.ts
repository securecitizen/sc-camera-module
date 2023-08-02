// do not combile a default export AND named exports in the same file
// because consumers of your bundle will have to use `my-bundle.default`
// to access the default export, which may not be what you want.
// Use `output.exports: "named"` to disable this warning.

import { SecureCitizenUserManager } from './auth/scauth'
import { SecureCitizenCamera } from './components/camera';
import { InitConfig } from './utils/configuration'

function init(config: InitConfig): void {

  // config.debug = true;

  // const video = document.getElementById('video') as HTMLVideoElement;
  // const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  // // const fps = document.getElementById('fps') as HTMLPreElement;
  // const ok = document.getElementById('ok') as HTMLDivElement;
  // const log = document.getElementById('messageOutput') as HTMLPreElement;

  // const override = {
  //   canvas,
  //   ok,
  //   log
  // }

  // const optional = {
  //   video,
  //   // fps
  // }

  const camera = new SecureCitizenCamera(config);

  camera.init();

  // return camera;
}

export default {
  quickInit: init,
  SecureCitizenCamera,
  SecureCitizenUserManager
}
