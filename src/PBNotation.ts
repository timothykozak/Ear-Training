//
// PBNotation.ts
//
// This module handles the musical notation.  It is passed an HTMLCanvasElement
// on which it draws out the treble staff in the key of C Major.

// TODO: Make canvas resizable & use all of canvas;
// TODO: Handle the chords in place of individual notes

import {SequenceItem} from "./PBSequencer.js";
import {PBConst} from "./PBConst.js";
import {PBSequencer, NoteType} from "./PBSequencer.js";
import {PBSounds} from "./PBSounds.js";

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

    static ORG_X = 50;  // x coord of the origin
    static ORG_Y = 250; // y coord of the origin
    static ORG_WIDTH = 20;  // The width of the origin cross

    static xByNoteType = [2, 3, 4, 5, 7, 9, 11];  // Units are noteWidth

    context: CanvasRenderingContext2D;
    fontSize: number;   // In pixels
    noteWidth: number;
    noteHeight: number;
    grandStaff: boolean = false;

    constructor(public canvas: HTMLCanvasElement) {
        this.context = this.canvas.getContext("2d");    // The 2d context of the canvas
        this.updateFontSize(100);   // Set the default font size
        document.addEventListener(PBConst.EVENTS.sequencerNotePlayed, (event: CustomEvent) => {this.onSequencer(event);}, false);
        document.addEventListener(PBConst.EVENTS.keyboardHover, (event: CustomEvent) => {this.onHover(event);}, false);
        document.addEventListener(PBConst.EVENTS.testerNoteAnswered, (event: CustomEvent) => {this.onAnswered(event);}, false);
    }

    onAnswered(event: CustomEvent) {
        let x = PBNotation.ORG_X + (PBNotation.xByNoteType[NoteType.Answer] * this.noteWidth);
        let y = 120;
        if (event.detail.correct)
            this.drawGlyph(x, y, PBConst.GLYPHS.checkMark, 'left', 'middle', 'green', 1, "ionicons");
        else
          this.drawGlyph(x, y, PBConst.GLYPHS.xMark, 'left', 'middle', 'red', 1, "ionicons");
    }

    onHover(event: CustomEvent) {
        this.drawHoverNote(event.detail, 0);
    }

    drawHoverNote(note: number, color: number) {
        let x = PBNotation.ORG_X + PBNotation.xByNoteType[NoteType.Answer] * this.noteWidth;
        let y = PBNotation.ORG_Y;
        this.context.clearRect(x - this.noteWidth, y + (this.noteHeight * 2), this.noteWidth * 3, -(this.noteHeight * 8));
        this.drawGlyph(x - this.noteWidth, y, PBConst.GLYPHS.staff5Lines, 'left', 'middle', 'black', 3);
        if (note != -1)
            this.drawQualifiedNote(x, PBNotation.midiToQualifiedNote(note + PBSounds.MIDI_MIDDLE_C -2), 'gray');
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
            let x = PBNotation.ORG_X  + (PBNotation.xByNoteType[theItem.noteType] * this.noteWidth);
            this.drawNote(x, theItem.note);
        }
    }

    clearCanvas() {
        this.context.fillStyle = "white";
        this.context.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
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
        this.drawLine(PBNotation.ORG_X - PBNotation.ORG_WIDTH, PBNotation.ORG_Y, PBNotation.ORG_X + PBNotation.ORG_WIDTH, PBNotation.ORG_Y, 1, 'red', 'butt');
        this.drawLine(PBNotation.ORG_X, PBNotation.ORG_Y - PBNotation.ORG_WIDTH, PBNotation.ORG_X, PBNotation.ORG_Y + PBNotation.ORG_WIDTH, 1, 'red', 'butt');
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
        let staffY = PBNotation.ORG_Y;
        let ng = PBConst.GLYPHS;
        let lengthInNotes = this.canvas.width / this.noteWidth - 1;

        this.drawGlyph(PBNotation.ORG_X, staffY, ng.staff5Lines, 'left', 'middle', 'black', lengthInNotes);    // Draw treble staff
        this.drawGlyph(PBNotation.ORG_X, staffY, ng.beginBar, 'left', 'middle', 'black');
        this.drawGlyph(PBNotation.ORG_X + (this.noteWidth / 4), staffY - this.noteHeight, ng.gClef, 'left', 'middle', 'black');
        this.drawGlyph(PBNotation.ORG_X + (this.noteWidth * lengthInNotes), staffY, ng.endBar, 'right', 'middle', 'black');

        if (this.grandStaff) {
            staffY += (this.noteHeight * 8);
            this.drawGlyph(PBNotation.ORG_X, staffY, ng.staff5Lines, 'left', 'middle', 'black', lengthInNotes);    // Draw bass staff
            this.drawGlyph(PBNotation.ORG_X, staffY, ng.beginBar, 'left', 'middle', 'black');
            this.drawGlyph(PBNotation.ORG_X + (this.noteWidth / 4), staffY - (3 * this.noteHeight), ng.fClef, 'left', 'middle', 'black');
            this.drawGlyph(PBNotation.ORG_X + (this.noteWidth * lengthInNotes), staffY, ng.endBar, 'right', 'middle', 'black');

            this.drawGlyph(PBNotation.ORG_X, staffY, ng.brace, 'right', 'middle', 'black');  // Draw the combining brace
        }
    }

    drawNote(x: number, theMidi: number) {
        this.drawQualifiedNote(x, PBNotation.midiToQualifiedNote(theMidi));
    }

    drawQualifiedNote(x: number, qNote: QualifiedNote, color: string = 'black') {
        // Draw the note, along with accidentals and ledger line
        // ORG_Y is E4 and not C4
        let y = PBNotation.ORG_Y + (qNote.degree - 2) * this.noteHeight / -2;
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