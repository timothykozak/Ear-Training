//
// PBUI.ts
//
// Handles the user interface

import {PBSequencer} from "./PBSequencer.js";
import {PBNotation} from "./PBNotation.js";
import {PBPianoKeyboard} from "./PBPianoKeyboard.js";
import {PBStatusWindow} from "./PBStatusWindow.js";

interface ClippingRect {
    x: number,
    y: number,
    width: number,
    height: number
}

class PBUI {
    canvas: HTMLCanvasElement; // The drawing canvas for both notation and keyboard
    context: CanvasRenderingContext2D;
    notation: PBNotation;
    pianoKeyboard: PBPianoKeyboard;
    resizingTimer: number = -1;
    notationClippingRect: ClippingRect;
    pianoClippingRect: ClippingRect;

    constructor(public statusWindow: PBStatusWindow, public sequencer: PBSequencer) {
        this.canvas = document.createElement("canvas");
        document.body.appendChild(this.canvas);
        this.canvas.style.cssText = "border-style: dotted; position: absolute; left: 0px; top: 0px;";
        this.context = this.canvas.getContext("2d");
        this.onResizeFinished();    // The initial sizing

        window.onresize = () => {   // The resizing can go on for many events.
                                    // Wait until the resize of the window has finished.
            clearTimeout(this.resizingTimer);
            this.resizingTimer = setTimeout(() => {
                this.onResizeFinished();}, 200);
        };
    }

    onResizeFinished() {
        this.canvas.width = 1100;
        this.canvas.height = 700;
        this.notationClippingRect = PBUI.buildClippingRect(0, 0, 1000, 250);
        this.pianoClippingRect = PBUI.buildClippingRect(0, 250, 1000, 750);

        if (!this.notation) { // In the constructor
            this.notation = new PBNotation(this.context, this.notationClippingRect);
            this.pianoKeyboard = new PBPianoKeyboard(this.canvas, this.context, this.pianoClippingRect, this.statusWindow, this.sequencer);
        }
        this.notation.resize(this.notationClippingRect);
        this.pianoKeyboard.resize(this.pianoClippingRect);
    }

    static buildClippingRect(theX: number, theY: number, theWidth: number, theHeight: number): ClippingRect {
        return({x: theX, y: theY, width: theWidth, height: theHeight});
    }
}

export {PBUI, ClippingRect};