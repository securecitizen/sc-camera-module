/**
 * name: sc-camera-module
 * version: v1.0.0
 * description: This is the SC Camera Module repo that will create a Vite workflow to ease creation of Javascript modules with a dev server, GitHub Pages support and automated publishing to NPM.
 * author: Grant Vine <grantv@securecitizen.co.za> (https://securecitizen.co.za)
 * repository: https://github.com/securecitizen/sc-camera-module
 * build date: 2023-07-12T14:13:13.146Z 
 */
(function(global2, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global2 = typeof globalThis !== "undefined" ? globalThis : global2 || self, factory(global2["sc-camera-module"] = {}));
})(this, function(exports2) {
  "use strict";var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

  const DEFAULT_WIDTH = 1024;
  const DEFAULT_HEIGHT = 768;
  const DEFAULT_MIN_WIDTH = 140;
  const DEFAULT_MIN_HEIGHT = 220;
  const DEFAULT_ASPECT_RATIO = DEFAULT_MIN_HEIGHT / DEFAULT_MIN_WIDTH;
  const DEFAULT_ERROR_OUTSINK = "out";
  function DebugLogger(debug, value) {
    if (debug) {
      console.log(value);
    }
  }
  function log(...args) {
    const out = document.getElementById(DEFAULT_ERROR_OUTSINK);
    if (!out)
      return;
    out.innerText = "";
    Array.prototype.forEach.call(args, function(msg) {
      if (msg instanceof Error) {
        msg = "Error: " + msg.message;
      } else if (typeof msg !== "string") {
        msg = JSON.stringify(msg, null, 2);
      }
      out.innerHTML += msg + "\r\n";
      DebugLogger(true, msg);
    });
  }
  var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  var platformDetect = { exports: {} };
  (function(module2, exports3) {
    !function(e, o) {
      module2.exports = o();
    }(commonjsGlobal, function() {
      function e(e2, o2) {
        var n2 = window.matchMedia(e2);
        o2(n2.matches);
        var i2 = function() {
          return o2(n2.matches);
        };
        return n2.addListener(i2), function() {
          return n2.removeListener(i2);
        };
      }
      function o(e2, o2) {
        return t[e2] !== o2 && (t[e2] = o2, s(e2, o2), true);
      }
      var n = "undefined" != typeof navigator && "undefined" != typeof window;
      if (n && "undefined" != typeof nw)
        try {
          nw.Window.get();
        } catch (e2) {
          n = false;
        }
      var i = !n, r = n ? navigator.userAgent : void 0, t = { gui: n, terminal: i, registerQuery: e };
      t.node = "undefined" != typeof process && !!process.versions && !!process.versions.node, t.pwa = t.gui && window.matchMedia("(display-mode: standalone)").matches && null !== document.head.querySelector('[rel="manifest"]'), t.uwp = "undefined" != typeof Windows && "undefined" != typeof MSApp, t.nwjs = !(!t.node || !process.versions.nw), t.electron = !(!t.node || !process.versions.electron), t.cordova = !(!t.gui || !window.cordova), t.packaged = t.uwp || t.nwjs || t.electron || t.cordova, t.web = !t.node && !t.packaged, t.browser = t.web, t.website = t.web && !t.pwa, t.worker = !t.gui && "undefined" != typeof self && void 0 !== self.importScripts, t.serviceWorker = t.worker && !!navigator.serviceWorker.controller || false, t.android = !!t.gui && r.includes("Android"), t.chromeos = !!t.gui && r.includes("CrOS"), t.tizen = !!t.gui && r.includes("Tizen"), t.ios = t.gui && /iPad|iPhone|iPod/.test(r) && !window.MSStream || false, t.linuxBased = t.android || t.tizen, t.windows = t.node ? "win32" === process.platform : r.includes("Windows"), t.macos = t.node ? "darwin" === process.platform : r.includes("Macintosh"), t.linux = t.node ? "linux" === process.platform : r.includes("Linux") && !t.linuxBased && !t.macos, t.edgeHtml = t.gui && r.includes("Edge/"), t.edgeChromium = t.gui && r.includes("Edg/"), t.edgeAndroid = t.gui && r.includes("EdgA/"), t.edgeIos = t.gui && r.includes("EdgiOS/"), t.chromeIos = t.gui && r.includes("CriOS/"), t.firefoxIos = t.gui && r.includes("FxiOS/"), t.edge = t.edgeHtml || t.edgeChromium || t.edgeAndroid || t.edgeIos, t.samsungBrowser = t.gui && r.includes("SamsungBrowser/"), t.opera = t.gui && (r.includes("Opera") || r.includes("OPR/")), t.firefox = t.gui && (r.includes("Firefox") || t.firefoxIos), t.chrome = t.gui && (r.includes("Chrome") || t.chromeIos) && !t.edge && !t.opera && !t.samsungBrowser, t.safari = t.gui && r.includes("Safari") && !t.chrome && !t.edge && !t.firefox && !t.opera && !t.samsungBrowser || t.edgeIos || t.chromeIos || t.firefoxIos, t.ie = t.trident = t.gui && r.includes("Trident"), t.blink = t.chrome && !t.chromeIos || t.edgeChromium || t.edgeAndroid || t.samsungBrowser, t.webkit = t.blink || t.safari, t.gecko = t.firefox && !t.firefoxIos && !t.webkit && !t.safari;
      var d = {};
      t.on = function(e2, o2) {
        d[e2] = d[e2] || /* @__PURE__ */ new Set(), d[e2].add(o2);
      }, t.off = t.removeListener = function(e2, o2) {
        d[e2] && d[e2].delete(o2);
      };
      var s = t.emit = function(e2, o2) {
        d[e2] && d[e2].forEach(function(e3) {
          return e3(o2);
        });
      };
      if (t.gui) {
        t.pixelRatio = parseFloat(window.devicePixelRatio.toFixed(2)), t.gameconsole = r.includes("Xbox") || r.includes("PlayStation");
        var a = 0;
        if (window.addEventListener("gamepadconnected", function(e2) {
          return a++;
        }), window.addEventListener("gamepaddisconnected", function(e2) {
          return a--;
        }), t.gameconsole)
          t.gamepad = true, t.mouse = true, t.touch = false, t.tv = true, t.battery = false, t.phone = t.tablet = t.hybrid = t.laptop = t.desktop = false, t.formfactor = "gameconsole";
        else {
          var c = function() {
            o("tv", "tv" === t.formfactor), o("phone", "phone" === t.formfactor), o("tablet", "tablet" === t.formfactor), o("hybrid", "hybrid" === t.formfactor), o("laptop", "laptop" === t.formfactor), o("desktop", "desktop" === t.formfactor);
          }, u = function() {
            var e2 = Math.min(window.screen.width, window.screen.height);
            return t.tv ? "tv" : t.touch && e2 < 600 ? "phone" : t.touch && !t.mouse ? "tablet" : t.touch && t.mouse ? "hybrid" : t.battery ? "laptop" : "desktop";
          };
          t.touch = navigator.maxTouchPoints > 0, t.tv = r.includes("TV"), a = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(function(e2) {
            return null !== e2 && void 0 !== e2;
          }).length : 0, t.gamepad = a > 0, e("(orientation: portrait)", function(e2) {
            t.portrait = e2, t.landscape = !e2, t.orientation = e2 ? "portrait" : "landscape", s("portrait", t.portrait), s("landscape", t.landscape), s("orientation", t.orientation);
          }), e("(any-pointer: coarse)", function(e2) {
            o("touch", e2), o("formfactor", u()) && c();
          }), e("(hover: hover)", function(e2) {
            o("mouse", e2), o("input", e2 ? "mouse" : "touch"), o("formfactor", u()) && c();
          });
        }
      }
      return t.csp = t.uwp || false, t.nwjs ? t.dev = "sdk" === process.versions["nw-flavor"] : t.electron ? t.dev = process.execPath.replace(/\\/g, "/").includes("node_modules/electron/") : t.uwp ? t.dev = Windows.ApplicationModel.Package.current.isDevelopmentMode : t.node ? t.dev = "production" !== process.env.NODE_ENV : t.dev = void 0, t;
    });
  })(platformDetect);
  var platformDetectExports = platformDetect.exports;
  const platform = /* @__PURE__ */ getDefaultExportFromCjs(platformDetectExports);
  function BootstrapCameraDiv(random_id_suffix, width) {
    const cameraDiv = document.createElement("div");
    cameraDiv.id = "camera" + random_id_suffix;
    cameraDiv.className = "camera";
    cameraDiv.style.width = width.toString();
    cameraDiv.style.height = (width * DEFAULT_ASPECT_RATIO).toString();
    cameraDiv.style.color = "white";
    cameraDiv.style.display = "flex";
    cameraDiv.style.alignItems = "center";
    cameraDiv.style.justifyContent = "center";
    cameraDiv.style.position = "relative";
    return cameraDiv;
  }
  function BootstrapVideo(random_id_suffix) {
    var videoElement = document.createElement("video");
    videoElement.id = "cameraVideo" + random_id_suffix;
    videoElement.className = "cameraVideo";
    videoElement.loop = true;
    videoElement.autoplay = true;
    videoElement.playsInline = true;
    videoElement.muted = true;
    videoElement.style.borderWidth = "10";
    videoElement.style.borderColor = "black";
    videoElement.style.width = "100%";
    videoElement.style.height = "100%";
    videoElement.style.position = "absolute";
    videoElement.style.maxHeight = "100%";
    videoElement.style.maxWidth = "100%";
    videoElement.style.background = "black";
    videoElement.style.transform = "scale(-1, 1)";
    videoElement.style.webkitTransform = "scale(-1, 1)";
    return videoElement;
  }
  function BootstrapCanvas(random_id_suffix, chosenMask) {
    var canvasElement = document.createElement("canvas");
    canvasElement.id = "cameraCanvas" + random_id_suffix;
    canvasElement.className = "cameraCanvas";
    canvasElement.style.width = "100%";
    canvasElement.style.height = "100%";
    canvasElement.style.display = "none";
    canvasElement.style.zIndex = "1";
    if (chosenMask !== void 0) {
      const maskImage = new Image();
      maskImage.src = chosenMask;
      maskImage.width = 140;
      maskImage.height = 220;
      console.log("Image Info - Width: " + maskImage.width + " - Height: " + maskImage.height);
      console.log("Data in the mask: " + chosenMask);
      canvasElement.style.display = "block";
      const canvasCtx = canvasElement.getContext("2d");
      maskImage.onload = () => {
        const hRatio = canvasElement.width / maskImage.width;
        const vRatio = canvasElement.height / maskImage.height;
        const ratio = Math.min(hRatio, vRatio);
        const portraitOrientation = canvasElement.width < canvasElement.height;
        const paddingX = portraitOrientation ? 50 : 100;
        const paddingY = portraitOrientation ? 200 : 100;
        const centerShift_x = (canvasElement.width - maskImage.width * ratio) / 2;
        const centerShift_y = (canvasElement.height - maskImage.height * ratio) / 2;
        canvasCtx == null ? void 0 : canvasCtx.drawImage(
          maskImage,
          // this is how far from the top left we want to crop the image by.
          // So if it is 50, the image will be cropped 50 pixels from the left hand side.
          0,
          // this is how far from the top we want to crop the image by. So if it is 50,
          // the image will be cropped 50 pixels from the top side.
          0,
          // this is how big we want the image to be from the point of cx. So if 100, the
          // image will continue for 100px from cx, and then be cropped at that point.
          maskImage.width,
          //  this is how big we want the image to be from the point of ch. So if 100, the
          // image will continue for 100px from ch, and then be cropped at that point.
          maskImage.height,
          // the x position on the canvas for the top left corner of the image.
          centerShift_x + paddingX,
          // the y position on the canvas for the top left corner of the image.
          centerShift_y + paddingY,
          // the width of the image. If left blank, the original image width is used.
          maskImage.width * ratio - paddingX * 2,
          // the height of the image. If left blank, the original image height is used.
          maskImage.height * ratio - paddingY * 2
        );
      };
    }
    return canvasElement;
  }
  class SecureCitizenBootstrapper {
    // the mask <canvas>
    /**
     * This bootstrap process will perform the following functions:
     * 1 - Identify what base URL we are running on for authentication configurations
     * 2 - Identify what type of device we are running on
     * 3 - Identify our PixelRatio, and the width (required) and height (optional) 
     *     from the enclosing div element
     * 4 - Create a Video Element
     * 5 - Create a Mask Canvas Element - requires defining what mask to use - served from the public folder URL
     * 6 - Create a Text Canvas Element to display status changes including 'Launch Camera'
     * 7 - 
     * 8 - Create a resizeObserver on the enclosing div to manage orientation and page changes
     */
    constructor(div_id, client_id) {
      __publicField(this, "random_id_suffix", Math.floor(Math.random() * 1e6).toString());
      __publicField(this, "authBase");
      __publicField(this, "isMobile");
      __publicField(this, "isMac");
      __publicField(this, "isIOS");
      __publicField(this, "pixelRatio");
      __publicField(this, "parentDivWidth", 0);
      __publicField(this, "parentDivHeight", 0);
      __publicField(this, "divWidth", 0);
      __publicField(this, "divHeight", 0);
      __publicField(this, "videoElement");
      // the <video> tag
      __publicField(this, "canvasElement");
      if (!platform.web) {
        throw Error("This library is only for browser based usage");
      }
      const whatPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/"));
      this.authBase = window.location.origin + whatPath;
      this.isMobile = platform.phone || platform.tablet;
      this.isIOS = platform.ios;
      this.isMac = platform.macos;
      log("Mobile: " + this.isMobile);
      log("IOS: " + this.isIOS);
      log("MAC: " + this.isMac);
      this.pixelRatio = platform.pixelRatio;
      log("Pixel Ratio: " + this.pixelRatio);
      this.videoElement = document.createElement("video");
      this.canvasElement = document.createElement("canvas");
    }
    // public GenerateErrorDiv(): HTMLDivElement {
    //     return GenerateErrorDiv(this.random_id_suffix);
    // }
    GenerateMainCaptureDiv(isCameraActive, chosenMask) {
      const videoElement = BootstrapVideo(this.random_id_suffix);
      const canvasElement = BootstrapCanvas(this.random_id_suffix, chosenMask);
      return { videoElement, canvasElement };
    }
    // public GenerateControlPanel() {
    //     return GenerateControlPanel(this.random_id_suffix);
    // }
    GenerateCameraDiv(width) {
      log("Width Configured to " + width);
      return BootstrapCameraDiv(this.random_id_suffix, width);
    }
    UpdateValues(container) {
      this.parentDivWidth = window.screen.availWidth;
      this.parentDivHeight = window.screen.availHeight;
      log("Parent size set to - Width: " + this.parentDivWidth + " - Height: " + this.parentDivHeight);
      this.divWidth = container.clientWidth !== 0 || container.clientWidth <= DEFAULT_WIDTH ? container.clientWidth : DEFAULT_WIDTH;
      this.divHeight = container.clientHeight !== 0 || container.clientHeight <= DEFAULT_HEIGHT ? container.clientHeight : DEFAULT_HEIGHT;
      log("Canvas size set to - Width: " + this.divWidth + " - Height: " + this.divHeight);
    }
  }
  function init(config) {
    log(config);
    const messageOutputElement = document.getElementById("messageOutput");
    if (messageOutputElement) {
      messageOutputElement.innerHTML = config.client_id;
    }
    const bootstrap = new SecureCitizenBootstrapper(config.div_id, config.client_id);
    return bootstrap;
  }
  const scCameraModule = {
    init,
    log
  };
  exports2.default = scCameraModule;
  exports2.init = init;
  exports2.log = log;
  Object.defineProperties(exports2, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
});
