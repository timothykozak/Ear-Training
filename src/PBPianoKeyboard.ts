//
// PBPianoKeyboard.ts
//
// Draws and handles all input/output through the piano keyboard interface.
// Since we only use one octave of CMaj, we only need to draw A#3 through C#5.
// Watches the sequencer to reflect the notes being played.
// The keyboard is used to answer tested note.

import {PBStatusWindow} from "./PBStatusWindow.js";
import {PBSequencer, SequenceItem} from "./PBSequencer.js";
import {PBSounds} from "./PBSounds.js";
import {PBConst} from "./PBConst.js";
import {ClippingRect} from "./PBUI.js";

interface KeyRegion {
    path: Path2D,
    playing: boolean,
    fillStyle: string,
}

class PBPianoKeyboard {

    static WHITE_WIDTH = 24;   // Dimensions are in millimeters
    static WHITE_LENGTH = 148;
    static BLACK_WIDTH = 13;
    static BLACK_LENGTH = 98;
    static BLACK_KEY_FILL_STYLE = 'black';
    static WHITE_KEY_FILL_STYLE = 'white';
    static HOVER_FILL_STYLE = 'darkgray';
    static SCALE_PER_WIDTH = 0.0043;    // For determining best scale based on canvas width...
    static SCALE_PER_HEIGHT = 0.0065;   // and height

    // These arrays start on A#3 (MIDI 58) and end on C#5 (MIDI 73)
    static WHITE_KEYS = [false, true, true, false, true, false, true, true, false, true, false, true, false, true, true, false];
    static X_OFFSET = [3, 0, 0, -3, 0, 3, 0, 0, -3, 0, 0, 0, 3, 0, 0, -3];   // Most of the black keys are not centered
    keyRegions: KeyRegion[];

    scale: number = 3;
    hoverKey: number = -1;

    constructor(public canvas: HTMLCanvasElement, public context: CanvasRenderingContext2D, public clippingRect: ClippingRect, public statusWnd: PBStatusWindow, public sequencer: PBSequencer) {
        if (canvas) {
            this.canvas.addEventListener(PBConst.EVENTS.mouseClick, (event: MouseEvent) => {
                this.onClick(event);
            });
            this.canvas.addEventListener(PBConst.EVENTS.mouseLeave, (event: MouseEvent) => {
                this.onMouseLeave(event);
            });
            this.canvas.addEventListener(PBConst.EVENTS.mouseMove, (event: MouseEvent) => {
                this.onMouseMove(event);
            });
            document.addEventListener(PBConst.EVENTS.sequencerNotePlayed, (event: CustomEvent) => {
                this.onSequencerNotePlayed(event);
            }, false);
            this.resize(this.clippingRect);
        }
    }

    onSequencerNotePlayed(event: CustomEvent) {
        let theItem: SequenceItem = event.detail;
        let theKey = theItem.note - PBSounds.MIDI_MIDDLE_C + 2;
        if (this.hoverKey != theKey) {    // Not hovering over the key, update it
            this.fillRegion(theKey, theItem.state);
        }
    }

    static dispatchHoverEvent(theHoverKey: number) {
        document.dispatchEvent(new CustomEvent(PBConst.EVENTS.keyboardHover, {detail: theHoverKey})); // No longer hovering
    }

    checkForHover(event: MouseEvent): number {
        // Returns the key over which the mouse is hovering, or -1 for none
        let x = event.offsetX;
        let y = event.offsetY;
        let theResult = -1;
        for (let index = 0; index < this.keyRegions.length; index++) {
            if (this.context.isPointInPath(this.keyRegions[index].path, x, y)) {
                this.statusWnd.writeMsg("Mouseover: key " + index);
                theResult = index;
            }
        }
        return (theResult);
    }

    onMouseLeave(event: MouseEvent) {
        this.statusWnd.writeMsg(event.type + " event: x " + event.offsetX + " y " + event.offsetY);
        if (this.hoverKey != -1) {
            this.fillRegion(this.hoverKey, false);
        }
        this.hoverKey = -1;
        PBPianoKeyboard.dispatchHoverEvent(-1); // No longer hovering
    }

    onMouseMove(event: MouseEvent) {
        let hoverKey = this.checkForHover(event);
        this.statusWnd.writeMsg(event.type + " event: x " + event.offsetX + " y " + event.offsetY + "  hoverKey: " + hoverKey);
        if (hoverKey != -1) { // Hovering
            PBPianoKeyboard.dispatchHoverEvent(hoverKey);
            if (this.hoverKey != -1) { // Previously hovering
                if (!(hoverKey == this.hoverKey)) {    // Changed regions
                    this.fillRegion(this.hoverKey, false);
                }
            }
            this.fillRegion(hoverKey, true);
        } else { // Not hovering
            if (this.hoverKey != -1) {  // Remove old hover
                PBPianoKeyboard.dispatchHoverEvent(-1);
                this.fillRegion(this.hoverKey, false);
            }
        }
        this.hoverKey = hoverKey;
    }

    onClick(event: MouseEvent) {
        let hoverKey = this.checkForHover(event);
        this.statusWnd.writeMsg(event.type + " event: x " + event.offsetX + " y " + event.offsetY + "  hoverKey: " + hoverKey);
        if (hoverKey != -1) {
            this.statusWnd.writeMsg("Piano: Clicked region " + hoverKey);
            this.sequencer.playNote(hoverKey + PBSounds.MIDI_MIDDLE_C - 2)
        }
    }

    fillRegion(i: number, hover: boolean) {
        if (i >= 0) { // Valid region
            this.context.strokeStyle = "#000";
            let theKeyRegion = this.keyRegions[i];
            this.context.fillStyle = (hover) ? PBPianoKeyboard.HOVER_FILL_STYLE : theKeyRegion.fillStyle;
            this.context.fill(theKeyRegion.path);
            this.context.stroke(theKeyRegion.path);
        }
    }

    clearClippingRect() {
        this.context.clearRect(this.clippingRect.x, this.clippingRect.y, this.clippingRect.width, this.clippingRect.height);
    }

    updateScale(theScale: number) {
        this.scale = theScale;
    }

    resize(theClippingRect: ClippingRect) {
        // Calculate the scale based on the height and the width, selecting the minimum that fits.
        this.clippingRect = theClippingRect;
        let scaleByWidth = this.clippingRect.width * PBPianoKeyboard.SCALE_PER_WIDTH;
        let scaleByHeight = this.clippingRect.height * PBPianoKeyboard.SCALE_PER_HEIGHT;
        this.updateScale(Math.min(scaleByHeight, scaleByWidth));
        this.drawKeyboard();
    }

    buildBlackKeyPath(orgX: number, orgY: number, index: number): Path2D {
        // The black key is only a rectangle.
        let keyPath = new Path2D();
        let x = orgX + Math.floor(this.scale * (PBPianoKeyboard.X_OFFSET[index] - (PBPianoKeyboard.BLACK_WIDTH / 2)));
        let width = Math.floor(this.scale * PBPianoKeyboard.BLACK_WIDTH);
        let height = Math.floor(this.scale * PBPianoKeyboard.BLACK_LENGTH);
        keyPath.rect(x, orgY, width, height);
        return (keyPath);
    }

    buildWhiteKeyPath(orgX: number, orgY: number, index: number): Path2D {
        // The white key is a rectangle with a notch from a black key
        // on at least one side.  Math.floor is used to avoid fractional pixels.
        let keyPath = new Path2D();
        let leftNotch = 0;  // Determine left notch, if any
        if (!PBPianoKeyboard.WHITE_KEYS[index - 1])
            leftNotch = Math.abs(Math.floor(this.scale * (PBPianoKeyboard.X_OFFSET[index - 1] + (PBPianoKeyboard.BLACK_WIDTH / 2))));   // There is always key before and after a white key.
        let rightNotch = 0; // Determine right notch, if any
        if (!PBPianoKeyboard.WHITE_KEYS[index + 1])
            rightNotch = Math.abs(Math.floor(this.scale * (PBPianoKeyboard.X_OFFSET[index + 1] - (PBPianoKeyboard.BLACK_WIDTH / 2))));
        let notchLength = Math.floor(this.scale * PBPianoKeyboard.BLACK_LENGTH);
        let width = Math.floor(this.scale * PBPianoKeyboard.WHITE_WIDTH);
        let unNotchedLength = Math.floor(this.scale * (PBPianoKeyboard.WHITE_LENGTH - PBPianoKeyboard.BLACK_LENGTH));    // Length of the key that is not notched
        let x = orgX + leftNotch;
        let y = orgY;

        keyPath.moveTo(x, y);   // Build the path
        keyPath.lineTo(x, y += notchLength);
        keyPath.lineTo(x -= leftNotch, y);
        keyPath.lineTo(x, y += unNotchedLength);
        keyPath.lineTo(x += width, y);
        keyPath.lineTo(x, y -= unNotchedLength);
        keyPath.lineTo(x -= rightNotch, y);
        keyPath.lineTo(x, orgY);
        keyPath.closePath();
        return (keyPath);
    }

    buildKeyboardRegions() {
        this.keyRegions = [];   // Toss old regions
        let orgX = this.clippingRect.x + Math.floor(this.scale * PBPianoKeyboard.BLACK_WIDTH / 2);    // Round down to whole pixel, and take into account scaling
        let orgY = this.clippingRect.y;
        let thePath: Path2D = null;
        let theFillStyle: string = null;

        PBPianoKeyboard.WHITE_KEYS.forEach((white, index) => { //
            if (white) {
                thePath = this.buildWhiteKeyPath(orgX, orgY, index);
                theFillStyle = PBPianoKeyboard.WHITE_KEY_FILL_STYLE;
                orgX += Math.floor(this.scale * PBPianoKeyboard.WHITE_WIDTH);
            } else {
                thePath = this.buildBlackKeyPath(orgX, orgY, index);
                theFillStyle = PBPianoKeyboard.BLACK_KEY_FILL_STYLE;
            }
            this.keyRegions[index] = {
                path: thePath,
                playing: false,
                fillStyle: theFillStyle,
            };
        });
    };

    drawKeyboard() {
        this.clearClippingRect();
        this.buildKeyboardRegions();
        PBPianoKeyboard.WHITE_KEYS.forEach((white, index) => {
            this.fillRegion(index, false);
        });
    }
}

export {PBPianoKeyboard};