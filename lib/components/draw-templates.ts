import * as H from "@vladmandic/human";

export const drawOptions: Partial<H.DrawOptions> = {
    faceLabels: `face
      confidence: [score]%
      [gender] [genderScore]%
      age: [age] years
      distance: [distance]cm
      real: [real]%
      live: [live]%
      [emotions]
      roll: [roll]° yaw:[yaw]° pitch:[pitch]°
      gaze: [gaze]°`,
    bodyLabels: 'body [score]%',
    bodyPartLabels: '[label] [score]%',
    objectLabels: '[label] [score]%',
    handLabels: '[label] [score]%',
    fingerLabels: '[label]',
    gestureLabels: '[where] [who]: [what]',
  };

export default drawOptions;