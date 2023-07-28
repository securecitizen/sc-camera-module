import { DEFAULT_MESSAGE_OUTSINK } from './defaults'
import { IDomContainer } from './detection'

const errorToFriendly: { [key: string]: string } = {
    FACE_ANGLE_TOO_LARGE: 'Please face the camera',
    FACE_CLOSE_TO_BORDER: 'Too close to borders',
    FACE_NOT_FOUND: 'No face found',
    FACE_TOO_SMALL: 'Please get closer to the camera',
    PROBABILITY_TOO_SMALL: 'Can\'t detect a face',
    TOO_MANY_FACES: 'Too many faces in view',
  }

function DebugLogger(debug: boolean, value: string) : void {
    if (debug) { console.log(value) };
  }

const log = (dom: IDomContainer, ...msg: any[]) => {
    // helper method to output messages
    dom.log.innerText += msg.join(' ') + '\n'
    console.log(...msg) // eslint-disable-line no-console
}

function logMessages(...args: any[]) {
    const out = document.getElementById(DEFAULT_MESSAGE_OUTSINK);
    if(!out) return;
    out.innerText = "";

    Array.prototype.forEach.call(args, function(msg) {
        if (msg instanceof Error) {
            msg = "Error: " + msg.message;
        }
        else if (typeof msg !== "string") {
            msg = JSON.stringify(msg, null, 2);
        }
        out.innerHTML += msg + "\r\n";
        DebugLogger(true, msg);
    });
}

export { errorToFriendly, log, logMessages, DebugLogger }