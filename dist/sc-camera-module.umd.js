/**
 * name: sc-camera-module
 * version: v1.0.0
 * description: This is the SC Camera Module repo that will create a Vite workflow to ease creation of Javascript modules with a dev server, GitHub Pages support and automated publishing to NPM.
 * author: Grant Vine <grantv@securecitizen.co.za> (https://securecitizen.co.za)
 * repository: https://github.com/securecitizen/sc-camera-module
 * build date: 2023-07-12T09:32:57.933Z 
 */
(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global["sc-camera-module"] = factory());
})(this, function() {
  "use strict";
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
  return scCameraModule;
});
