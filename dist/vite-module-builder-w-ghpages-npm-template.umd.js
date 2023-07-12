/**
 * name: vite-module-builder-w-ghpages-npm-template
 * version: v1.0.0
 * description: This is a templare repo that will create a Vite workflow to ease creation of Javascript modules with a dev server, GitHub Pages support and automated publishing to NPM.
 * author: John F. Morton <john@johnfmorton.com> (https://supergeekery.com)
 * repository: https://github.com/johnfmorton/vite-module-builder-w-ghpages-npm-template
 * build date: 2023-07-12T03:53:13.092Z 
 */
(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global["vite-module-builder-w-ghpages-npm-template"] = factory());
})(this, function() {
  "use strict";
  function init(message) {
    console.log(message);
    const messageOutputElement = document.getElementById("messageOutput");
    if (messageOutputElement) {
      messageOutputElement.innerHTML = message;
    }
  }
  const viteModuleBuilderWGhpagesNpmTemplate = {
    init
  };
  return viteModuleBuilderWGhpagesNpmTemplate;
});
