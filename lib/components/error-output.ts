import { errorToFriendly } from "../utils/errors";

function GenerateErrorDiv(random_id_suffix: string): HTMLDivElement {
    // temp hack - TODO must fix
    const error = [''];
    // <div
    //           class=""
    //           >
    //           <div class="" >
    //             {{ errorToFriendly[error[0]] }}
    //           </div>
    //         </div>

    // Styling
  //   .face-detection-error {
  //     color: black;
  //     background-color: white;
  //     padding-left: 5px;
  //     padding-right: 5px;
  //     margin-bottom: 5px;
  //   }
    
  // .face-detection-errors-wrapper {
  //     position: absolute;
  //     width: 100%;
  //     top: 10px;
  //     display: flex;
  //     flex-direction: column;
  //     align-items: center;
  //     z-index: 1;
  //   }

    // // Face Detection Wrapper
    const errorIndex = 'face-detection-errors-wrapper';
    const errorDiv = document.createElement('div');
    errorDiv.id = errorIndex + random_id_suffix;
    errorDiv.style.color = 'black';
    errorDiv.style.backgroundColor = 'white';
    errorDiv.style.paddingLeft = '5px';
    errorDiv.style.paddingRight = '5px';
    errorDiv.style.marginBottom = '5px';
    errorDiv.className = errorIndex;
    errorDiv.hidden = true;

    // Face Detection Error
    const faceErrorIndex = 'face-detection-error';
    const faceErrorDiv = document.createElement('div');
    faceErrorDiv.id = faceErrorIndex + random_id_suffix;
    faceErrorDiv.className = faceErrorIndex;
    faceErrorDiv.innerText = errorToFriendly[error[0]];
    faceErrorDiv.style.position = 'absolute';
    faceErrorDiv.style.width = '100%';
    faceErrorDiv.style.top = '10px';
    faceErrorDiv.style.display = 'flex';
    faceErrorDiv.style.flexDirection = 'column';
    faceErrorDiv.style.alignItems = 'center';
    faceErrorDiv.style.zIndex = '1';
    faceErrorDiv.hidden = true;

    errorDiv.appendChild(faceErrorDiv);

    return errorDiv;
  }

  export { GenerateErrorDiv };