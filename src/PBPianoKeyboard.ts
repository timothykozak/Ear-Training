//
// PBPianoKeyboard.ts
//
// Draws and handles all input/output through the piano keyboard interface.
// Since we only use one octave of CMaj, we only need to draw A#3 through C#5.
// Watches the sequencer to reflect the notes being played.
// The keyboard is used to answer tested note.

// TODO: Hit regions not supported on tablet

import {PBStatusWindow} from "./PBStatusWindow.js";
import {PBNotation} from "./PBNotation.js";
import {PBSequencer, SequenceItem} from "./PBSequencer.js";
import {PBSounds} from "./PBSounds.js";

interface RegionOptions { // For context2D.addHitRegion
    id: string,
    path: Path2D,
    control: HTMLElement    // Required by context2D.addHitRegion even if always set to null.
}

interface KeyRegion {
    options: RegionOptions,
    playing: boolean,
    hover: boolean,
    notPlayingFillStyle: string,
    innerPath: Path2D
}

class PBPianoKeyboard {

    static WHITE_WIDTH = 24;   // Dimensions are in millimeters
    static WHITE_LENGTH = 148;
    static BLACK_WIDTH = 13;
    static BLACK_LENGTH = 98;
    static BLACK_KEY_FILL_STYLE = 'black';
    static WHITE_KEY_FILL_STYLE = 'white';
    static HOVER_FILL_STYLE = 'darkgray';

    // These arrays start on A#3 (MIDI 58) and end on C#5 (MIDI 73)
    static WHITE_KEYS = [false, true, true, false, true, false, true, true, false, true, false, true, false, true, true, false];
    static X_OFFSET = [3, 0, 0, -3, 0, 3, 0, 0, -3, 0, 0, 0, 3, 0, 0, -3];   // Most of the black keys are not centered
    keyRegions: KeyRegion[];

    context2D: CanvasRenderingContext2D;
    scale: number = 3;
    mouseOverRegion: string;
    mouseOver: boolean = false;

    constructor(public statusWnd: PBStatusWindow, public canvas: HTMLCanvasElement,
                public notation: PBNotation, public sequencer: PBSequencer) {
        if (canvas) {
            this.context2D = this.canvas.getContext("2d");
            this.canvas.addEventListener("click", (event: MouseEvent) => {this.onClick(event);});
            this.canvas.addEventListener("mouseleave", (event: MouseEvent) => {this.onMouseLeave(event);});
            this.canvas.addEventListener("mousemove", (event: MouseEvent) => {this.onMouseMove(event);});
            document.addEventListener('sequencer', (event: CustomEvent) => {this.onSequencer(event);}, false);
            this.buildKeyboardRegions();
            this.drawKeyboard();
        }

    }

    onSequencer(event: CustomEvent) {
        let theItem: SequenceItem = event.detail;
        if (theItem.state) {
            if (this.mouseOver) {}
        }
    }

    onMouseLeave(event: MouseEvent) {
        this.statusWnd.writeMsg(event.type + " event: x " + event.x + " y " + event.y + "  region: " + event.region);
        if (this.mouseOver) {
            if (event.region) {}
        }
        this.mouseOver = false;
    }

    onMouseMove(event: MouseEvent) {
        this.statusWnd.writeMsg(event.type + " event: x " + event.x + " y " + event.y + "  region: " + event.region);
        if (event.region) { // Hovering
            if (this.mouseOver) { // Previously hovering
                if (!(event.region == this.mouseOverRegion)) {    // Changed regions
                    this.fillRegion(this.mouseOverRegion, false);
                }
            }
            this.fillRegion(event.region, true);
            this.mouseOver = true;
            this.mouseOverRegion = event.region;
        } else { // Not hovering
            if (this.mouseOver) {  // Remove old hover
                this.fillRegion(this.mouseOverRegion, false);
            }
            this.mouseOver = false;
            this.mouseOverRegion = null;
        }
    }

    onClick(event: MouseEvent) {
        this.statusWnd.writeMsg(event.type + " event: x " + event.x + " y " + event.y + "  region: " + event.region);
        if (event.region) {
            let index = parseInt(event.region);
            this.statusWnd.writeMsg("Piano: Clicked region " + index);
            this.sequencer.playNote(index + PBSounds.MIDI_MIDDLE_C - 2)
        }
    }

    fillRegion(id: string, hover: boolean) {
        let i = parseInt(id);
        if (i >= 0) { // Valid region
            let theKeyRegion = this.keyRegions[i];
            this.context2D.fillStyle = (hover) ? PBPianoKeyboard.HOVER_FILL_STYLE : theKeyRegion.notPlayingFillStyle;
            this.context2D.fill(theKeyRegion.options.path);
            this.context2D.stroke(theKeyRegion.options.path);
        }
    }

    clearCanvas () {
        this.context2D.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    updateScale() {
        this.scale = 3;
    }

    buildBlackKeyPath(orgX: number, orgY: number, index: number, inset: number = 0): Path2D {
        // The black key is only a rectangle.
        let keyPath = new Path2D();
        let x = orgX + Math.floor(this.scale * (PBPianoKeyboard.X_OFFSET[index] - (PBPianoKeyboard.BLACK_WIDTH / 2) + inset));
        let width = Math.floor(this.scale * (PBPianoKeyboard.BLACK_WIDTH - (inset * 2)));
        let height = Math.floor(this.scale * (PBPianoKeyboard.BLACK_LENGTH - (inset * 2)));
        keyPath.rect(x, orgY + inset * this.scale, width, height);
        return(keyPath);
    }

    buildWhiteKeyPath(orgX: number, orgY: number, index: number): Path2D {
        // The white key is a rectangle with a notch from a black key
        // on at least one side.
        let keyPath = new Path2D();
        let leftNotch = 0;
        if (!PBPianoKeyboard.WHITE_KEYS[index - 1])
            leftNotch = Math.abs(Math.floor(this.scale * (PBPianoKeyboard.X_OFFSET[index - 1] + (PBPianoKeyboard.BLACK_WIDTH / 2))));   // There is always key before and after a white key.
        let rightNotch = 0;
        if (!PBPianoKeyboard.WHITE_KEYS[index + 1])
            rightNotch = Math.abs(Math.floor(this.scale * (PBPianoKeyboard.X_OFFSET[index + 1] -  (PBPianoKeyboard.BLACK_WIDTH / 2))));
        let notchLength = Math.floor(this.scale * PBPianoKeyboard.BLACK_LENGTH);
        let width = Math.floor(this.scale * PBPianoKeyboard.WHITE_WIDTH);
        let wideLength = Math.floor(this.scale * (PBPianoKeyboard.WHITE_LENGTH - PBPianoKeyboard.BLACK_LENGTH));
        let x = orgX + leftNotch;
        let y = orgY;

        keyPath.moveTo(x, y);
        keyPath.lineTo(x, y += notchLength);
        keyPath.lineTo(x -= leftNotch, y);
        keyPath.lineTo(x, y += wideLength);
        keyPath.lineTo(x += width, y);
        keyPath.lineTo(x, y -= wideLength);
        keyPath.lineTo(x -= rightNotch, y);
        keyPath.lineTo(x, orgY);
        keyPath.closePath();
        return(keyPath);
    }

    buildKeyboardRegions() {
        this.keyRegions = [];   // Toss old regions
        let orgX = Math.floor(this.scale * PBPianoKeyboard.BLACK_WIDTH / 2);    // Round down to whole pixel, and take into account scaling
        let orgY = 0;
        let thePath: Path2D = null;
        let theInnerPath: Path2D = null;
        let theFillStyle: string = null;

        PBPianoKeyboard.WHITE_KEYS.forEach( (white, index) => { //
            if (white) {
                thePath = this.buildWhiteKeyPath(orgX, orgY, index);
                theInnerPath = null;
                theFillStyle = PBPianoKeyboard.WHITE_KEY_FILL_STYLE;
                orgX += Math.floor(this.scale * PBPianoKeyboard.WHITE_WIDTH);
            } else {
                thePath = this.buildBlackKeyPath(orgX, orgY, index);
                theInnerPath = this.buildBlackKeyPath(orgX, orgY, index, 2);
                theFillStyle = PBPianoKeyboard.BLACK_KEY_FILL_STYLE;
            }
            let theOptions: RegionOptions = {path: thePath, id: index.toString(), control: null};
            this.keyRegions[index] = {options: theOptions, playing: false, hover: false, notPlayingFillStyle: theFillStyle, innerPath: theInnerPath};
            this.context2D.addHitRegion(this.keyRegions[index].options);
        });
    };

    // drawAKey(white: boolean, index: number) {
    //     let theKeyRegion = this.keyRegions[index];
    //     if (white) {
    //         this.context2D.stroke(theKeyRegion.options.path);
    //     }
    //     else {
    //         this.context2D.fill(theKeyRegion.options.path);
    //     }
    // }

    drawAKey(white: boolean, index: number) {
        let theKeyRegion = this.keyRegions[index];
        if (white) {
            this.context2D.stroke(theKeyRegion.options.path);
        }
        else {
            this.context2D.fill(theKeyRegion.options.path);
        }
    }

    drawKeyboard () {
        this.clearCanvas();
        this.updateScale();
        this.buildKeyboardRegions();
        PBPianoKeyboard.WHITE_KEYS.forEach( (white, index) => { this.drawAKey(white, index);});
    }
}

export {PBPianoKeyboard};