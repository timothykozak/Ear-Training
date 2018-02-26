//
// PBUI.ts
//
// Handles the user interface

import {PBStatusWindow} from "./PBStatusWindow.js";
import {PBSequencer} from "./PBSequencer.js";
import {PBNotation} from "./PBNotation.js";
import {PBPianoKeyboard} from "./PBPianoKeyboard.js";

class PBUI {
    pianoCanvas: HTMLCanvasElement;
    notationCanvas: HTMLCanvasElement;
    notation: PBNotation;
    pianoKeyboard: PBPianoKeyboard;

    constructor(public statusWindow: PBStatusWindow, public sequencer: PBSequencer) {
        this.pianoCanvas = document.getElementById("pianoCanvas") as HTMLCanvasElement;
        this.notationCanvas = document.getElementById("notationCanvas") as HTMLCanvasElement;
        this.notation = new PBNotation(this.notationCanvas);
        this.notation.redraw();
        this.pianoKeyboard = new PBPianoKeyboard(this.statusWindow, this.pianoCanvas, this.notation, this.sequencer);
    }
}

export {PBUI};