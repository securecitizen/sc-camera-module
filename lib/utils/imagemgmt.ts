import { DEFAULT_MAX_WIDTH } from "./defaults";
import platform from 'platform-detect';

function resizeSVGOnCanvas(canvas: HTMLCanvasElement, originalImage: HTMLImageElement, newWidth: number, newHeight?: number) {
    // //create an image object from the path
    // const originalImage = new Image();
    // originalImage.src = image.src;
    if(originalImage.src.split(".").reverse()[0].toLowerCase() !== 'svg') {
        throw new Error("Please provide an SVG as an image source (src attribute).")
    }
    
    originalImage.addEventListener('load', function() {

        const ctx = canvas.getContext('2d');
        //get the original image size and aspect ratio
        const originalWidth = originalImage.naturalWidth;
        const originalHeight = originalImage.naturalHeight;
        const aspectRatio = originalWidth/originalHeight;

        //if the new height wasn't specified, use the width and the original aspect ratio
        if (newHeight === undefined) {
            //calculate the new height
            newHeight = newWidth/aspectRatio;
            newHeight = Math.floor(newHeight);
        }
      
        //set the canvas size
        canvas.width = newWidth;
        canvas.height = newHeight;
         
        //render the image
        ctx?.drawImage(originalImage, 0, 0, newWidth, newHeight);
    });
    }

/** Gets the parameters used to start navigator.mediaDevices.getUserMedia(...) */
function GetConstraints(
    width: string = '1920',
    height: string = '1080'
  ) {
    const w = Number(width);
    const h = Number(height);
  
    if (w === 0 || w > 1920) {
      width = DEFAULT_MAX_WIDTH.toString();
    }
  
    return platform.macos
      ? {
          audio: false,
          video: {
            facingMode: 'user',
            width: w,
            height: h,
          },
        }
      : {
          audio: false,
          video: {
            facingMode: 'user',
            width: { ideal: w },
            height: { ideal: h },
          },
        };
  }

export { resizeSVGOnCanvas, GetConstraints };