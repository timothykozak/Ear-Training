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
                <li class="toolTip">&#xf3cf<span class="toolTipText toolTipTextAbove">Rewind</span></li>
                <li class="toolTip" onclick="window.pbEarTraining.tester.startTest();">&#xf488<span class="toolTipText toolTipTextAbove">Play</span></li>
                <li class="toolTip">&#xf478<span class="toolTipText toolTipTextAbove">Pause</span></li>
                <li class="toolTip">&#xf3d1<span class="toolTipText toolTipTextAbove">Forward</span></li>
            </ul>
        </div>        `);
    }

    static buildMenuHTML(): string {
        return(`        <div class="menuDiv">
            <ul>
                <li class="toolTip">&#xf20d<span class="toolTipText toolTipTextRight">The Menu</span></li>
                <li class="toolTip">&#xf2f7<span class="toolTipText toolTipTextRight">Settings</span></li>
                <li class="toolTip">&#xf2b5<span class="toolTipText toolTipTextRight">Results</span></li>
                <li class="toolTip">&#xf444<span class="toolTipText toolTipTextRight">Help</span></li>
            </ul>
        </div>
        `);
    }

    static buildSettingsPageHTML(): string {
        return('');
    }

    static buildPagesHTML() : string {
        return(PBUI.buildSettingsPageHTML());
    }

    static buildBodyHTML() {
        document.body.insertAdjacentHTML('beforeend', PBUI.buildCanvasHTML() + PBUI.buildTransportHTML() + PBUI.buildMenuHTML() + PBUI.buildPagesHTML());
    }

    onResizeFinished() {
        // Called during a resize and in the constructor

        // Size and position the canvas
        this.canvas.width = window.innerWidth - PBUI.MENU_WIDTH - PBUI.SCROLL_BAR_WIDTH;    // Resize the canvas
        this.canvas.height = window.innerHeight - PBUI.PLAYER_HEIGHT - PBUI.SCROLL_BAR_WIDTH;
        this.canvas.style.left = PBUI.MENU_WIDTH + "px";    // Position the canvas
        this.canvas.style.top = "0px";

        //

        // Calculate the notation and the piano rects
        let notationHeight = Math.floor(this.canvas.height * PBUI.NOTATION_FRACTION_OF_CANVAS); // Resize the Rects
        this.notationRect = PBUI.buildMyRect(0, 0, this.canvas.width, notationHeight);
        this.pianoRect = PBUI.buildMyRect(0, notationHeight + PBUI.GUTTER, this.canvas.width, this.canvas.height - notationHeight - PBUI.GUTTER);

        if (!this.notation) { // In the constructor.  Need to instantiate the classes.
            this.notation = new PBNotation(this.context, this.notationRect);
            this.pianoKeyboard = new PBPianoKeyboard(this.canvas, this.context, this.pianoRect, this.statusWindow, this.sequencer);
        } else { // Regular resize
            this.notation.resize(this.notationRect);
            this.pianoKeyboard.resize(this.pianoRect);
        }
    }

    static buildMyRect(theX: number, theY: number, theWidth: number, theHeight: number): MyRect {
        return({x: theX, y: theY, width: theWidth, height: theHeight});
    }
}

export {PBUI, MyRect};