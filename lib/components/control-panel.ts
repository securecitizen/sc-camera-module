import { AddButton } from './add-button';
import { EventBroker } from '../utils/typedeventemitter'
import { log } from '../utils/errors';

function GenerateControlPanel(
  random_id_suffix: string, 
  ): HTMLDivElement 
  {
    // Styling
    // .controlPanel {
    //   height: 35%;
    //   display: flex;
    //   justify-content: space-evenly;
    //   align-items: center;
    //   width: 100%;
    //   max-width: 450px;
    //   margin: auto
    // }

    // define the controlPanel
    const index = 'controlPanel';
    const controlPanelDiv = document.createElement('div');
    controlPanelDiv.id = index + random_id_suffix;
    controlPanelDiv.className = index;
    controlPanelDiv.style.height = "35%";
    controlPanelDiv.style.maxWidth = "450px";
    controlPanelDiv.style.margin = "auto";
    controlPanelDiv.style.display = "flex";
    controlPanelDiv.style.justifyContent = "space-evenly";
    controlPanelDiv.style.alignItems = "center";

    // <div class="controlPanel" :class="Platform.is.mobile && 'controlMobile'" v-if="showControls">
    // if(this.configuredProps.RunningOn() === 'mobile') {
      // Nothing in CSS ??
      // controlPanelDiv.style.position = 'fixed';
    // }

    // const loginBtn = AddButton('Login', () => this.startSigninMainWindow());

    // controlPanelDiv.appendChild(loginBtn);

    // const statusBtn = AddButton('Get Session', () => this.sessionStatus());

    // controlPanelDiv.appendChild(statusBtn);

    // const userBtn = AddButton('Get User', () => this.getUser());

    // controlPanelDiv.appendChild(userBtn);

    // const logoutBtn = AddButton('Logout', () => this.startSignoutMainWindow());

    // controlPanelDiv.appendChild(logoutBtn);

    const takePhotoBtn = AddButton(random_id_suffix, 'Take Photo', () => {
        EventBroker.emit('takePhotoBtn');
        log('Taking Photo from Control Panel');
    }
    );

    controlPanelDiv.appendChild(takePhotoBtn);

    const openCameraBtn = AddButton(random_id_suffix, 'Open Camera', () => {
          EventBroker.emit('openCameraBtn');
          log('Open Camera from Control Panel');
      }
    );

    controlPanelDiv.appendChild(openCameraBtn);

    const closeCameraBtn = AddButton(random_id_suffix, 'Close Camera', () => {
        EventBroker.emit('closeCameraBtn');
        log('Close Camera from Control Panel');
    }
    );

    controlPanelDiv.appendChild(closeCameraBtn);

    return controlPanelDiv;
  }

  export { GenerateControlPanel }

