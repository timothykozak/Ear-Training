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
    static NOTATION_FRACTION_OF_CANVAS = 0.33;
    static MENU_WIDTH = 50; // In pixels
    static PLAYER_HEIGHT = 50;
    static SCROLL_BAR_WIDTH = 35;
    static RESIZE_PAUSE = 200;  // In milliseconds

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
        this.canvas.style.cssText = "border-style: dotted; position: absolute;";
        this.context = this.canvas.getContext("2d");
        this.onResizeFinished();    // The initial sizing

        window.onresize = () => {   // The resizing can go on for many events.
                                    // Wait until the resize of the window has paused for a while.
            clearTimeout(this.resizingTimer);
            this.resizingTimer = setTimeout(() => {
                this.onResizeFinished();}, 200);
        };
    }

    onResizeFinished() {
        this.canvas.width = window.innerWidth - PBUI.MENU_WIDTH - PBUI.SCROLL_BAR_WIDTH;    // Resize the canvas
        this.canvas.height = window.innerHeight - PBUI.PLAYER_HEIGHT - PBUI.SCROLL_BAR_WIDTH;
        this.canvas.style.left = PBUI.MENU_WIDTH + "px";    // Position the canvas
        this.canvas.style.top = "0px";

        let notationHeight = Math.floor(this.canvas.height * PBUI.NOTATION_FRACTION_OF_CANVAS); // Resize the clippingRects
        this.notationClippingRect = PBUI.buildClippingRect(0, 0, this.canvas.width, notationHeight);
        this.pianoClippingRect = PBUI.buildClippingRect(0, notationHeight, this.canvas.width, this.canvas.height - notationHeight);

        if (!this.notation) { // In the constructor
            this.notation = new PBNotation(this.context, this.notationClippingRect);
            this.pianoKeyboard = new PBPianoKeyboard(this.canvas, this.context, this.pianoClippingRect, this.statusWindow, this.sequencer);
        } else { // Regular resize
            this.notation.resize(this.notationClippingRect);
            this.pianoKeyboard.resize(this.pianoClippingRect);
        }
    }

    static buildClippingRect(theX: number, theY: number, theWidth: number, theHeight: number): ClippingRect {
        return({x: theX, y: theY, width: theWidth, height: theHeight});
    }
}

export {PBUI, ClippingRect};