import { DEFAULT_ASPECT_RATIO } from "../utils/defaults";
import { log } from "../utils/errors";

function IdentifyWindow(checkedElement: HTMLDivElement) : { width: number, height: number } {

  const setWidth = checkedElement.clientWidth;
  const setHeight = checkedElement.clientHeight;
  const actualWidth = checkedElement.offsetWidth;
  const actualHeight = checkedElement.offsetHeight;

  log("Checking Div ID: " + checkedElement.id)
  log("Client Width: " + setWidth);
  log("Client Height: " + setHeight);
  log("OffsetWidth: " + actualWidth);
  log("OffsetHeight: " + actualHeight);

  return { width: actualWidth, height: actualHeight } 

}

function IdentifyContent(checkedElement: HTMLVideoElement | HTMLCanvasElement) {

  log("Checking Element ID: " + checkedElement.id)
  log("Set Width: " + checkedElement.width);
  log("Set Height: " + checkedElement.height);
  log("Client Width: " + checkedElement.clientWidth);
  log("Client Height: " + checkedElement.clientHeight);
  log("Offset Width: " + checkedElement.offsetWidth);
  log("Offset Height: " + checkedElement.offsetHeight);

}

function PatchContentSize(checkedElement: HTMLVideoElement | HTMLCanvasElement, width: number, height: number) {

  checkedElement.width = width;
  checkedElement.height = height;
}

function BootstrapCameraDiv(cameraDiv: HTMLDivElement): HTMLDivElement {
  cameraDiv.className = 'camera';
  cameraDiv.style.color = 'white';
  cameraDiv.style.display = 'flex';
  cameraDiv.style.alignItems = 'center';
  cameraDiv.style.justifyContent = 'center';
  cameraDiv.style.position = 'relative';
  cameraDiv.style.minWidth = '240px';
  cameraDiv.style.minHeight = '480px';

  return cameraDiv;
}

function BootstrapVideo(random_id_suffix: string): HTMLVideoElement {
  var videoElement = document.createElement('video');
  videoElement.id = 'cameraVideo' + random_id_suffix;
  videoElement.className = 'cameraVideo';
  // videoElement.ref = 'cameraVideo';
  videoElement.loop = true;
  videoElement.autoplay = true;
  videoElement.playsInline = true;
  videoElement.muted = true;
  videoElement.style.borderWidth = '10';
  videoElement.style.borderColor = 'black';
  videoElement.style.width = '100%';
  videoElement.style.height = '100%';

  // Dynamic Styling

  //   .cameraVideo {
  //     -webkit-transform: scale(-1, 1);
  //     transform: scale(-1, 1);
  //     position: absolute;
  //     max-width: 100%;
  //     max-height: 100%;
  //     background: black;
  //   }
  videoElement.style.position = 'absolute';
  videoElement.style.maxHeight = '100%';
  videoElement.style.maxWidth = '100%';
  videoElement.style.background = 'black';
  videoElement.style.transform = 'scale(-1, 1)';
  videoElement.style.webkitTransform = 'scale(-1, 1)';

  return videoElement;
}

function BootstrapCanvas(
  random_id_suffix: string,
  chosenMask?: string
): HTMLCanvasElement {
  var canvasElement = document.createElement('canvas');
  canvasElement.id = 'cameraCanvas' + random_id_suffix;
  canvasElement.className = 'cameraCanvas';
  // canvasElement.ref = "cameraCanvas";
  canvasElement.style.width = '100%';
  canvasElement.style.height = '100%';
  // canvasElement.style.maxWidth = '700px'; // this causes the mask to squish ... (need a resize, not a crop)
  // canvasElement.style.maxHeight = '100%'; // ?? why ?
  canvasElement.style.minWidth = '240px';
  canvasElement.style.minHeight = '480px';
  canvasElement.style.display = 'none';
  canvasElement.style.zIndex = '1';

  if (chosenMask !== undefined) {
    const maskImage = new Image();
    maskImage.src = chosenMask;
    maskImage.width = 140;
    maskImage.height = 220;

    console.log("Image Info - Width: " + maskImage.width + " - Height: " + maskImage.height)
    console.log("Data in the mask: " + chosenMask)

    canvasElement.style.display = 'block';
    const canvasCtx = canvasElement.getContext('2d');

    maskImage.onload = () => {
      // calcs
      const hRatio = canvasElement.width / maskImage.width;
      const vRatio = canvasElement.height / maskImage.height;
      const ratio = Math.min(hRatio, vRatio);
      const portraitOrientation = canvasElement.width < canvasElement.height;
      const paddingX = portraitOrientation ? 50 : 100;
      const paddingY = portraitOrientation ? 200 : 100;
      const centerShift_x = (canvasElement.width - maskImage.width * ratio) / 2;
      const centerShift_y =
        (canvasElement.height - maskImage.height * ratio) / 2;

      // canvasCtx.drawImage(image, cx, cy, sw, sh, x, y, width, height)
      canvasCtx?.drawImage(
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
        // ref https://fjolt.com/images/misc/202203282.png
      );
    };
  }

  return canvasElement;
}

export {
  BootstrapCanvas,
  BootstrapVideo,
  BootstrapCameraDiv,
  IdentifyWindow,
  IdentifyContent,
  PatchContentSize
};
