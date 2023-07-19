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

}

export { resizeSVGOnCanvas };