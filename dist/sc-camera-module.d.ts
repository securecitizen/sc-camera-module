import { SecureCitizenUserManager } from './auth/scauth';
import { SecureCitizenCamera } from './components/camera';
import { AuthInit, InitConfig } from './utils/configuration';
declare function init(config: InitConfig): void;
declare function authinit(config: AuthInit): SecureCitizenUserManager;
export { SecureCitizenCamera, SecureCitizenUserManager };
declare const _default: {
    quickInit: typeof init;
    authinit: typeof authinit;
};
export default _default;
