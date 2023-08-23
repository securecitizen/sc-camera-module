
import * as H from '@vladmandic/human'

const BACKEND = 'webgl';
const MODEL_BASE_PATH = '/models'

const simpleConfig: Partial<H.Config> = { // user configuration for human, used to fine-tune behavior
    debug: false,
    backend: BACKEND,
    // cacheSensitivity: 0,
    // cacheModels: false,
    // warmup: 'none',
    modelBasePath: MODEL_BASE_PATH,
  //   modelBasePath: 'https://vladmandic.github.io/human-models/models/',
    filter: { enabled: true, equalization: false, flip: false },
    face: { enabled: true, detector: { rotation: false }, mesh: { enabled: true }, attention: { enabled: false }, iris: { enabled: true }, description: { enabled: true }, emotion: { enabled: true }, antispoof: { enabled: true }, liveness: { enabled: true } },
    body: { enabled: false },
    hand: { enabled: false },
    object: { enabled: false },
    segmentation: { enabled: false },
    gesture: { enabled: true },
  };

const basicConfig: Partial<H.Config> = { // user configuration for human, used to fine-tune behavior
    cacheSensitivity: 0,
    modelBasePath: MODEL_BASE_PATH,
    backend: BACKEND,
    filter: { enabled: true, equalization: true }, // lets run with histogram equilizer
    debug: false,
    face: {
      enabled: true,
      detector: { rotation: false, return: true, mask: false }, // return tensor is used to get detected face image
      description: { enabled: true }, // default model for face descriptor extraction is faceres
      // mobilefacenet: { enabled: true, modelPath: 'https://vladmandic.github.io/human-models/models/mobilefacenet.json' }, // alternative model
      // insightface: { enabled: true, modelPath: 'https://vladmandic.github.io/insightface/models/insightface-mobilenet-swish.json' }, // alternative model
      iris: { enabled: true }, // needed to determine gaze direction
      emotion: { enabled: false }, // not needed
      antispoof: { enabled: true }, // enable optional antispoof module
      liveness: { enabled: true }, // enable optional liveness module
    },
    body: { enabled: false },
    hand: { enabled: false },
    object: { enabled: false },
    gesture: { enabled: true }, // parses face and iris gestures
  };

const optimisedConfig: Partial<H.Config> = {
    // user configuration for human, used to fine-tune behavior
    cacheSensitivity: 0,
    modelBasePath: MODEL_BASE_PATH, // models can be loaded directly from cdn as well
    debug: false,
    backend: BACKEND,
    filter: { enabled: true, equalization: true, flip: false }, // lets run with histogram equilizer
    face: {
        enabled: true,
        detector: { rotation: false, return: true, mask: false }, // return tensor is used to get detected face image
        mesh: { enabled: true },
        attention: { enabled: false }, // TODO: need to see how this works ??
        description: { enabled: false }, // default model for face descriptor extraction is faceres
        // mobilefacenet: { enabled: true, modelPath: 'https://vladmandic.github.io/human-models/models/mobilefacenet.json' }, // alternative model
        // insightface: { enabled: true, modelPath: 'https://vladmandic.github.io/insightface/models/insightface-mobilenet-swish.json' }, // alternative model
        iris: { enabled: true }, // needed to determine gaze direction
        emotion: { enabled: false }, // not needed
        antispoof: { enabled: true }, // enable optional antispoof module
        liveness: { enabled: true }, // enable optional liveness module
        // scale: 1.5
    },
    body: { enabled: false },
    hand: { enabled: false },
    gesture: { enabled: true }, // parses face and iris gestures
    object: { enabled: false },
    segmentation: { enabled: false },
}

optimisedConfig.face!['scale'] = 1.5;
optimisedConfig.face!['insightface'] = { enabled: true, modelPath: 'insightface-mobilenet-swish.json' }


export { optimisedConfig, simpleConfig, basicConfig }

export default optimisedConfig;