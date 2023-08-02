import { SecureCitizenUserManager } from './auth/scauth';
import { SecureCitizenCamera } from './components/camera';
import { InitConfig } from './utils/configuration';
declare function init(config: InitConfig): void;
declare const _default: {
    quickInit: typeof init;
    SecureCitizenCamera: typeof SecureCitizenCamera;
    SecureCitizenUserManager: typeof SecureCitizenUserManager;
};
export default _default;
