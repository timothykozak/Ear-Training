//
// PBUI.ts
//
// Handles the user interface

import {PBSequencer} from "./PBSequencer.js";
import {PBNotation} from "./PBNotation.js";
import {PBPianoKeyboard} from "./PBPianoKeyboard.js";
import {PBStatusWindow} from "./PBStatusWindow.js";

interface MyRect {
    x: number, // Of the upper left corner
    y: number,
    width: number,
    height: number
}

class PBUI {
    static NOTATION_FRACTION_OF_CANVAS = 0.33; // Fraction of the canvas to be used by notation
    static GUTTER = 10; // Gutter between notation and keyboard, in pixels
    static MENU_WIDTH = 50; // In pixels, the menu is on the left
    static PLAYER_HEIGHT = 50; // The transport is on the bottom
    static SCROLL_BAR_WIDTH = 35; // Have to assume that it is there
    static RESIZE_PAUSE = 200;  // In milliseconds

    canvas: HTMLCanvasElement; // The drawing canvas for both notation and keyboard
    context: CanvasRenderingContext2D;
    notation: PBNotation;
    pianoKeyboard: PBPianoKeyboard;
    resizingTimer: number = -1; // Handle to the timer to use for delaying the redraw on resize
    notationRect: MyRect;
    pianoRect: MyRect;

    constructor(public statusWindow: PBStatusWindow, public sequencer: PBSequencer) {
        PBUI.buildBodyHTML();
        this.canvas = document.getElementById("theCanvas") as HTMLCanvasElement;
        this.context = this.canvas.getContext("2d");
        this.onResizeFinished();    // The initial sizing

        window.onresize = () => {   // The resizing can go on for many events.
                                    // Wait until the resize of the window has paused for a while.
            clearTimeout(this.resizingTimer);
            this.resizingTimer = setTimeout(() => {
                this.onResizeFinished();}, PBUI.RESIZE_PAUSE);
        };
    }

    static buildCanvasHTML(): string {
        return (`<canvas id="theCanvas" style="border-style: dotted; position: absolute;"></canvas>`);
    }

    static buildTransportHTML(): string {
        return(`<div class="transportDiv">
            <ul>
                <li>&#xf3cf</li>
                <li onclick="window.pbEarTraining.tester.startTest();">&#xf488</li>
                <li>&#xf478</li>
                <li>&#xf3d1</li>
            </ul>
        </div>        `);
    }

    static buildMenuHTML(): string {
        return(`        <div class="menuDiv">
            <ul>
                <li>&#xf20d</li>
                <li>&#xf2f7</li>
                <li>&#xf384</li>
                <li>&#xf2b5</li>
                <li>&#xf444</li>
            </ul>
        </div>
        `);
    }

    static buildBodyHTML() {
        document.body.insertAdjacentHTML('beforeend', PBUI.buildCanvasHTML() + PBUI.buildTransportHTML() + PBUI.buildMenuHTML());
    }

    onResizeFinished() {
        // Called during a resize and in the constructor
        this.canvas.width = window.innerWidth - PBUI.MENU_WIDTH - PBUI.SCROLL_BAR_WIDTH;    // Resize the canvas
        this.canvas.height = window.innerHeight - PBUI.PLAYER_HEIGHT - PBUI.SCROLL_BAR_WIDTH;
        this.canvas.style.left = PBUI.MENU_WIDTH + "px";    // Position the canvas
        this.canvas.style.top = "0px";

        let notationHeight = Math.floor(this.canvas.height * PBUI.NOTATION_FRACTION_OF_CANVAS); // Resize the Rects
        this.notationRect = PBUI.buildRect(0, 0, this.canvas.width, notationHeight);
        this.pianoRect = PBUI.buildRect(0, notationHeight + PBUI.GUTTER, this.canvas.width, this.canvas.height - notationHeight - PBUI.GUTTER);

        if (!this.notation) { // In the constructor.  Need to instantiate the classes.
            this.notation = new PBNotation(this.context, this.notationRect);
            this.pianoKeyboard = new PBPianoKeyboard(this.canvas, this.context, this.pianoRect, this.statusWindow, this.sequencer);
        } else { // Regular resize
            this.notation.resize(this.notationRect);
            this.pianoKeyboard.resize(this.pianoRect);
        }
    }

    static buildRect(theX: number, theY: number, theWidth: number, theHeight: number): MyRect {
        return({x: theX, y: theY, width: theWidth, height: theHeight});
    }
}

export {PBUI, MyRect};