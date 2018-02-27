//
// PBNotation.ts
//
// This module handles the musical notation.  It is passed an HTMLCanvasElement
// on which it draws out the treble staff in the key of C Major.

// TODO: Handle the chords in place of individual notes

import {SequenceItem} from "./PBSequencer.js";
import {PBConst} from "./PBConst.js";
import {PBSequencer, NoteType} from "./PBSequencer.js";
import {PBSounds} from "./PBSounds.js";
import {ClippingRect} from "./PBUI";

interface GlyphItem {
    value: string,
    rem: number
}

interface QualifiedNote {
    octave: number,
    degree: number,
    sharped: boolean
}

export default class PBNotation {
    static ORG_X_IN_NOTE_WIDTHS = 1.0;
    static ORG_Y_IN_NOTE_HEIGHTS = 6.0;
    static ORG_WIDTH = 20;  // The width of the origin cross

    orgX = 50;  // x coord of the origin
    orgY = 250; // y coord of the origin

    static xByNoteType = [2, 3, 4, 5, 7, 9, 11];  // Units are noteWidth

    fontSize: number;   // In pixels
    noteWidth: number;
    noteHeight: number;
    grandStaff: boolean = false;

    constructor(public context: CanvasRenderingContext2D, public clippingRect: ClippingRect) {
        this.resize();
        document.addEventListener(PBConst.EVENTS.sequencerCadenceStarted, (event: CustomEvent) => {this.onCadenceStarted(event);}, false);
        document.addEventListener(PBConst.EVENTS.sequencerNotePlayed, (event: CustomEvent) => {this.onSequencer(event);}, false);
        document.addEventListener(PBConst.EVENTS.keyboardHover, (event: CustomEvent) => {this.onHover(event);}, false);
        document.addEventListener(PBConst.EVENTS.testerNoteAnswered, (event: CustomEvent) => {this.onAnswered(event);}, false);
    }

    onAnswered(event: CustomEvent) {
        let x = this.orgX + (PBNotation.xByNoteType[NoteType.Answer] * this.noteWidth);
        let y = this.orgY - this.noteHeight * 5;
        if (event.detail.correct)
            this.drawGlyph(x, y, PBConst.GLYPHS.checkMark, 'left', 'middle', 'green', 1, "ionicons");
        else
          this.drawGlyph(x, y, PBConst.GLYPHS.xMark, 'left', 'middle', 'red', 1, "ionicons");
    }

    onCadenceStarted(event: CustomEvent) {
        this.redraw();
    }

    onHover(event: CustomEvent) {
        this.drawHoverNote(event.detail, 0);
    }

    drawHoverNote(note: number, color: number) {
        let x = this.orgX + PBNotation.xByNoteType[NoteType.Answer] * this.noteWidth;
        let y = this.orgY;
        this.context.clearRect(x - this.noteWidth, y + (this.noteHeight * 2), this.noteWidth * 3, -(this.noteHeight * 8));
        this.drawGlyph(x - this.noteWidth, y, PBConst.GLYPHS.staff5Lines, 'left', 'middle', 'black', 3);
        if (note != -1)
            this.drawQualifiedNote(x, PBNotation.midiToQualifiedNote(note + PBSounds.MIDI_MIDDLE_C -2), 'gray');
    }
    
    resize() {
        this.updateFontSize(100);   // Set the default font size
        this.orgX = this.clippingRect.x + PBNotation.ORG_X_IN_NOTE_WIDTHS * this.noteWidth;
        this.orgY = this.clippingRect.y + PBNotation.ORG_Y_IN_NOTE_HEIGHTS * this.noteHeight;
        this.redraw();
    }

    updateFontSize(newSize: number) {
        this.fontSize = newSize;
        this.noteWidth = this.fontSize / 2;
        this.noteHeight = this.fontSize / 4;
    }

    static midiToQualifiedNote(midi: number) : QualifiedNote {
        // A qualified note is the degree plus accidentals
        let i = midi % 12;
        let theDegree = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7];
        let isSharped = [false, true, false, true, false, false, true, false, true, false, true, false];
        return({octave: 4, degree: theDegree[i], sharped: isSharped[i]});
    }

    onSequencer (event: CustomEvent) {
        let theItem: SequenceItem = event.detail;
        if (theItem.state) {
            let x = this.orgX  + (PBNotation.xByNoteType[theItem.noteType] * this.noteWidth);
            this.drawNote(x, theItem.note);
        }
    }

    clearCanvas() {
        this.context.fillStyle = "white";
        this.context.fillRect(this.clippingRect.x, this.clippingRect.y, this.clippingRect.width, this.clippingRect.height);
    }

    drawLine(startX: number,  startY: number,  endX: number,  endY: number,  width: number,  color: string,  cap: string) {
        this.context.beginPath();
        this.context.strokeStyle = color;
        this.context.lineWidth = width;
        this.context.lineCap = cap;
        this.context.moveTo(startX, startY);
        this.context.lineTo(endX, endY);
        this.context.stroke();
        this.context.closePath();
    }

    drawOrg() {
        this.drawLine(this.orgX - PBNotation.ORG_WIDTH, this.orgY, this.orgX + PBNotation.ORG_WIDTH, this.orgY, 1, 'red', 'butt');
        this.drawLine(this.orgX, this.orgY - PBNotation.ORG_WIDTH, this.orgX, this.orgY + PBNotation.ORG_WIDTH, 1, 'red', 'butt');
    }

    drawGlyph(x: number, y: number, glyph: GlyphItem, align: string, baseline: string, color: string, repeat: number = 1, font: string = 'aruvarb') {
        this.context.beginPath();
        this.context.fillStyle = color;
        this.context.font = (this.fontSize * glyph.rem) + "px " + font; // "px aruvarb";

        this.context.textAlign = align;
        this.context.textBaseline = baseline;
        let string = glyph.value;
        while (repeat > 1) {    // Primarily used for drawing the staff
            string += glyph.value;
            repeat--;
        }
        this.context.fillText(string, x, y);
        this.context.closePath();
    }

    drawStaff() {
        // Draw the empty staff with clefs and terminations
        this.drawOrg();
        let staffY = this.orgY;
        let ng = PBConst.GLYPHS;
        let lengthInNotes = this.clippingRect.width / this.noteWidth - 1;

        this.drawGlyph(this.orgX, staffY, ng.staff5Lines, 'left', 'middle', 'black', lengthInNotes);    // Draw treble staff
        this.drawGlyph(this.orgX, staffY, ng.beginBar, 'left', 'middle', 'black');
        this.drawGlyph(this.orgX + (this.noteWidth / 4), staffY - this.noteHeight, ng.gClef, 'left', 'middle', 'black');
        this.drawGlyph(this.orgX + (this.noteWidth * lengthInNotes), staffY, ng.endBar, 'right', 'middle', 'black');

        if (this.grandStaff) {
            staffY += (this.noteHeight * 8);
            this.drawGlyph(this.orgX, staffY, ng.staff5Lines, 'left', 'middle', 'black', lengthInNotes);    // Draw bass staff
            this.drawGlyph(this.orgX, staffY, ng.beginBar, 'left', 'middle', 'black');
            this.drawGlyph(this.orgX + (this.noteWidth / 4), staffY - (3 * this.noteHeight), ng.fClef, 'left', 'middle', 'black');
            this.drawGlyph(this.orgX + (this.noteWidth * lengthInNotes), staffY, ng.endBar, 'right', 'middle', 'black');

            this.drawGlyph(this.orgX, staffY, ng.brace, 'right', 'middle', 'black');  // Draw the combining brace
        }
    }

    drawNote(x: number, theMidi: number) {
        this.drawQualifiedNote(x, PBNotation.midiToQualifiedNote(theMidi));
    }

    drawQualifiedNote(x: number, qNote: QualifiedNote, color: string = 'black') {
        // Draw the note, along with accidentals and ledger line
        // ORG_Y is E4 and not C4
        let y = this.orgY + (qNote.degree - 2) * this.noteHeight / -2;
        this.drawGlyph(x, y, PBConst.GLYPHS.quarterNoteUp, 'left', 'middle', color);
        if (qNote.degree == 0)  // Need a ledger line
            this.drawGlyph(x - this.noteWidth / 4, y + this.noteHeight * 2, PBConst.GLYPHS.ledgerLine, 'left', 'middle', color);
        if (qNote.sharped)
            this.drawGlyph(x + this.noteWidth, y, PBConst.GLYPHS.sharp, 'left', 'middle', color);
    }

    redraw() {
        this.clearCanvas();
        this.drawStaff();
    }
}

export {PBNotation};