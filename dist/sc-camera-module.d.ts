import { SecureCitizenUserManager } from './auth/scauth';
import { SecureCitizenCamera } from './components/camera';
import { InitConfig } from './utils/configuration';
declare function init(config: InitConfig): void;
export { SecureCitizenCamera, SecureCitizenUserManager };
declare const _default: {
    quickInit: typeof init;
};
export default _default;
