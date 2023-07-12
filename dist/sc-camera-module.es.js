/**
 * name: sc-camera-module
 * version: v1.0.0
 * description: This is the SC Camera Module repo that will create a Vite workflow to ease creation of Javascript modules with a dev server, GitHub Pages support and automated publishing to NPM.
 * author: Grant Vine <grantv@securecitizen.co.za> (https://securecityizen.co.za)
 * repository: https://github.com/securecitizen/sc-camera-module
 * build date: 2023-07-12T09:08:45.223Z 
 */
function init(message) {
  console.log(message);
  const messageOutputElement = document.getElementById("messageOutput");
  if (messageOutputElement) {
    messageOutputElement.innerHTML = message;
  }
}
const scCameraModule = {
  init
};
export {
  scCameraModule as default
};
