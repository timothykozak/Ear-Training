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
    static MENU_WIDTH = 50; // In pixels, the menu is on the left
    static PLAYER_HEIGHT = 50; // The transport is on the bottom
    static SCROLL_BAR_WIDTH = 35; // Have to assume that it is there
    static RESIZE_PAUSE = 200;  // In milliseconds

    canvas: HTMLCanvasElement; // The drawing canvas for both notation and keyboard
    context: CanvasRenderingContext2D;
    notation: PBNotation;
    pianoKeyboard: PBPianoKeyboard;
    resizingTimer: number = -1;
    notationClippingRect: ClippingRect;
    pianoClippingRect: ClippingRect;

    constructor(public statusWindow: PBStatusWindow, public sequencer: PBSequencer) {
        this.buildBodyHTML();
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

    buildBodyHTML() {
        document.body.innerHTML = `
        <canvas id="theCanvas" style="border-style: dotted; position: absolute;"></canvas>
        <div class="transportDiv">
        <ul class="transportList">
        <li class="transportListItem"><a class="transportListLink" href="#lessthan">&#xf3cf</a></li>
        <li class="transportListItem"><a onclick="window.pbEarTraining.tester.startTest();" class="transportListLink" href="#start">&#xf488</a></li>
        <li class="transportListItem"><a class="transportListLink" href="#pause">&#xf478</a></li>
        <li class="transportListItem"><a class="transportListLink" href="#greaterthan">&#xf3d1</a></li>
        </ul>
        </div>

        <div class="menuDiv">
        <ul class="menuList">
        <li><a href="#hamburger">&#xf20d</a></li>
        <li><a href="#gear">&#xf2f7</a></li>
        <li><a href="#home">&#xf384</a></li>
        <li><a href="#graph">&#xf2b5</a></li>
        <li><a href="#questionmark">&#xf444</a></li>
        </ul>
        </div>`;
    }

    onResizeFinished() { // Called during a resize and in the constructor
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