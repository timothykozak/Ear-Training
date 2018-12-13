//
// PBUI.ts
//
// Handles the user interface.

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
    pageContainer: HTMLDivElement;
    pages: HTMLDivElement[] = [];
    context: CanvasRenderingContext2D;
    notation: PBNotation;
    pianoKeyboard: PBPianoKeyboard;
    resizingTimer: number = -1; // Handle to the timer to use for delaying the redraw on resize
    notationRect: MyRect;
    pianoRect: MyRect;

    constructor(public statusWindow: PBStatusWindow, public sequencer: PBSequencer) {
        PBUI.buildBodyHTML();
        this.pageContainer = document.getElementById("thePageContainer") as HTMLDivElement;
        this.pageContainer.style.visibility = 'hidden';
        this.pages.push(document.getElementById("theSettingsPage") as HTMLDivElement);
        this.pages.push(document.getElementById("theResultsPage") as HTMLDivElement);
        this.pages.push(document.getElementById("theHelpPage") as HTMLDivElement);
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
        return (`<canvas id="theCanvas" style="position: absolute;"></canvas>`);
    }

    static buildTransportHTML(): string {
        return(`<div class="transportDiv">
            <ul>
                <li id="transportRewind" class="toolTip">&#xf3cf<span class="toolTipText toolTipTextAbove">Rewind</span></li>
                <li id="transportStart" class="toolTip" onclick="window.pbEarTraining.tester.startTest();">&#xf488<span class="toolTipText toolTipTextAbove">Play</span></li>
                <li id="transportStop" class="toolTip">&#xf24f<span class="toolTipText toolTipTextAbove">Stop</span></li>
                <li id="transportPause" class="toolTip">&#xf478<span class="toolTipText toolTipTextAbove">Pause</span></li>
                <li id="transportForward" class="toolTip">&#xf3d1<span class="toolTipText toolTipTextAbove">Forward</span></li>
            </ul>
        </div>        `);
    }

    static buildMenuHTML(): string {
        return(`        <div class="menuDiv">
            <ul>
                <li class="toolTip" onclick="window.pbEarTraining.ui.handleMenu(-1);">
                    &#xf20d<span class="toolTipText toolTipTextRight">Home</span></li>
                <li class="toolTip" onclick="window.pbEarTraining.ui.handleMenu(0);">
                    &#xf2f7<span class="toolTipText toolTipTextRight">Settings</span></li>
                <li class="toolTip" onclick="window.pbEarTraining.ui.handleMenu(1);">
                    &#xf2b5<span class="toolTipText toolTipTextRight">Results</span></li>
                <li class="toolTip" onclick="window.pbEarTraining.ui.handleMenu(2);">
                    &#xf444<span class="toolTipText toolTipTextRight">Help</span></li>
            </ul>
        </div>
        `);
    }

    handleMenu(thePage: number): void {
        this.pages.forEach((element) => {element.style.visibility = 'hidden';});
        if (thePage != -1)
            this.pages[thePage].style.visibility = 'visible';
    }

    static buildSettingsPageHTML(): string {
        return(`<div id="theSettingsPage" class="pageDiv" style="background-color: #ff0000;">
            This is the settings page.
            </div>`);
    }

    static buildResultsPageHTML(): string {
        return(`<div id="theResultsPage" class="pageDiv" style="background-color: #00ff00;">
            This is the results page.
            </div>`);
    }

    static buildHelpPageHTML(): string {
        return(`<div id="theHelpPage" class="pageDiv" style="background-color: #0000ff;">
            Lorem ipsum dolor sit amet, agam quodsi ne eam. Eam an tantas sapientem eloquentiam, ea nec exerci equidem. Cu duo soleat graeci equidem, eos cu stet iuvaret mnesarchum. Sale solum melius ius eu, ei facilisi accusamus sea. Mei zril gubergren ea, vero commune ne ius.

Repudiare voluptatum liberavisse ad sit, adhuc nusquam molestie et has. Et erroribus voluptatum mei. Eu mel dolorem reprehendunt, ex alterum civibus neglegentur his. Ius eu nisl nibh platonem, doming audire mei cu, qui ad vide doming appetere. Ad unum facilis nam.

Eos qualisque suscipiantur ut, nostro eirmod ocurreret per eu. Ubique legimus mel cu. Est facer oportere definiebas te, eirmod vidisse accusam sed ut. Pri ut porro ignota, ei numquam feugait adolescens vel, te accusata argumentum nam. Pri tollit appellantur conclusionemque ei. Ne sit consectetuer comprehensam, qui accusam consequat percipitur ne.

Tale atqui omnium vel no, facilisi conclusionemque ea eam, reque ipsum quo te. Cu admodum salutatus cum, vim at aeque legendos. Verear voluptatum usu ea, vim tation audiam comprehensam id. Ex mucius viderer interpretaris nec, qui mazim volumus appetere no.

Et nostrud sanctus maluisset sed, dolor eligendi interesset ut cum. Ea cum dicant aliquam dolores. His homero utamur mediocrem et. Ei has latine fierent interpretaris, no prima tamquam suscipit est.
            </div>`);
    }

    static buildPagesHTML() : string {
        return(`<div id="thePageContainer" class="pageContainerDiv">` + PBUI.buildSettingsPageHTML() + PBUI.buildResultsPageHTML() + PBUI.buildHelpPageHTML() + `</div>`);
    }

    static buildBodyHTML() {
        document.body.insertAdjacentHTML('beforeend', PBUI.buildCanvasHTML() + PBUI.buildPagesHTML() + PBUI.buildTransportHTML() + PBUI.buildMenuHTML());
    }

    onResizeFinished() {
        // Called during a resize and in the constructor

        // Size and position the canvas and pages area
        let theWidth = window.innerWidth - PBUI.MENU_WIDTH - PBUI.SCROLL_BAR_WIDTH;
        let theHeight = window.innerHeight - PBUI.PLAYER_HEIGHT - PBUI.SCROLL_BAR_WIDTH;
        let theLeft = PBUI.MENU_WIDTH + "px";   // Styles need "px" attached
        let theTop = "0px";

        this.canvas.width = theWidth;
        this.canvas.height = theHeight;
        this.canvas.style.left = theLeft;
        this.canvas.style.top = theTop;

        this.pageContainer.style.width = theWidth + "px";   // Styles need "px" attached
        this.pageContainer.style.height = theHeight + "px";
        this.pageContainer.style.left = theLeft;
        this.pageContainer.style.top = theTop;

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