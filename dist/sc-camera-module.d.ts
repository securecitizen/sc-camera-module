import { SecureCitizenUserManager } from './auth/scauth';
import { AuthInit, InitConfig } from './utils/configuration';
declare function init(config: InitConfig): void;
declare function authinit(config: AuthInit): SecureCitizenUserManager;
declare const _default: {
    init: typeof init;
    authinit: typeof authinit;
};
export default _default;
