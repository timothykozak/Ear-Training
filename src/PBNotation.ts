//
// PBNotation.ts
//
// This module handles the musical notation.  It is passed an HTMLCanvasElement
// on which it draws out the treble staff in the key of C Major.

// TODO: Make canvas resizable; use all of canvas;

import {SequenceItem} from "./PBSequencer.js";

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

    static GLYPHS = {
        brace:              {value: '\u{0e000}', rem: 3.0},
        beginBar:           {value: '\u{0e030}', rem: 1.0},
        endBar:             {value: '\u{0e032}', rem: 1.0},
        gClef:              {value: '\u{1d11e}', rem: 1.0},
        fClef:              {value: '\u{1d122}', rem: 1.0},
        staff5Lines:        {value: '\u{1d11a}', rem: 1.0},
        ledgerLine:         {value: '\u{1d116}', rem: 1.0},

        wholeNote:          {value: '\u{0e1d2}', rem: 1.0},
        halfNoteUp:         {value: '\u{0e1d3}', rem: 1.0},
        halfNoteDown:       {value: '\u{0e1d4}', rem: 1.0},
        quarterNoteUp:      {value: '\u{0e1d5}', rem: 1.0},
        quarterNoteDown:    {value: '\u{0e1d6}', rem: 1.0},

        sharp:              {value: '\u{0e262}', rem: 1.0},
        flat:               {value: '\u{0e260}', rem: 1.0}
    };

    context: CanvasRenderingContext2D;
    fontSize: number;
    noteWidth: number;
    noteHeight: number;
    grandStaff: boolean = false;

    constructor(public canvas: HTMLCanvasElement) {
        this.context = this.canvas.getContext("2d");    // The 2d context of the canvas
        this.updateFontSize(100);
        document.addEventListener('sequencer', (event: CustomEvent) => {this.onSequencer(event);}, false)
    }

    updateFontSize(newSize: number) {
        this.fontSize = newSize;
        this.noteWidth = this.fontSize / 2;
        this.noteHeight = this.fontSize / 4;
    }

    static midiToQualifiedNote(midi: number) : QualifiedNote {
        let i = midi % 12;
        let theDegree = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7];
        let isSharped = [false, true, false, true, false, false, true, false, true, false, true, false];
        return({octave: 4, degree: theDegree[i], sharped: isSharped[i]});
    }

    onSequencer (event: CustomEvent) {
        let theItem: SequenceItem = event.detail;
        if (theItem.state) {
            let x = PBNotation.ORG_X  + ((2 + theItem.time / 4) * this.noteWidth);
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

    drawGlyph(x: number, y: number, glyph: GlyphItem, align: string, baseline: string, color: string, repeat: number = 1) {
        this.context.beginPath();
        this.context.fillStyle = color;
        this.context.font = (this.fontSize * glyph.rem) + "px aruvarb";

        this.context.textAlign = align;
        this.context.textBaseline = baseline;
        let string = glyph.value;
        while (repeat > 1) {
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
        let ng = PBNotation.GLYPHS;
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

    drawQualifiedNote(x: number, qNote: QualifiedNote) {
        // ORG_Y is E4 and not C4
        let y = PBNotation.ORG_Y + (qNote.degree - 2) * this.noteHeight / -2;
        this.drawGlyph(x, y, PBNotation.GLYPHS.quarterNoteUp, 'left', 'middle', 'black');
        if (qNote.degree == 0)  // Need a ledger line
            this.drawGlyph(x - this.noteWidth / 4, y + this.noteHeight * 2, PBNotation.GLYPHS.ledgerLine, 'left', 'middle', 'black');
        if (qNote.sharped)
            this.drawGlyph(x + this.noteWidth, y, PBNotation.GLYPHS.sharp, 'left', 'middle', 'black');
    }

    redraw() {
        this.clearCanvas();
        this.drawStaff();
    }
}

export {PBNotation};