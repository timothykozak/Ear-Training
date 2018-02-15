//
//  pbSequencer.js
//
// This module is the sequencer

import {PBSounds} from "./PBSounds.js";
import {PBNotation} from "./PBNotation.js";

enum NoteType {  // For notation positioning
    Cadence,
    Testing,
    Answer,
    MouseOver
}

interface SequenceItem {
    note: number,   // A MIDI note
    state: boolean, // True equals note on
    time: number,   // Current time in clock ticks
    noteType: NoteType
}

class PBSequencer {
    sequence: SequenceItem[] = [];
    ticks = 0;
    sequenceRunning = false;
    ticksBetweenChords = 5;

    constructor(public notation: PBNotation) {
        this.sequence = [];
        this.ticks = 0;
        this.sequenceRunning = false;
        setInterval(() => {this.onTimer()}, 100);   // One tick equals 100ms
    }

    onTimer() {
        if (this.sequenceRunning) {
            this.sequence.forEach((item) => {
                if (item.time == this.ticks) {
                    document.dispatchEvent(new CustomEvent('sequencer', {detail: {note: item.note, state: item.state, time: item.time, noteType: item.noteType} as SequenceItem}))
                }
            });
            if (this.sequence[this.sequence.length - 1].time <= this.ticks)
                this.sequenceRunning = false;
            this.ticks++;
        }
    }

    playNote(theMidi: number) { // Play a note right now
        document.dispatchEvent(new CustomEvent('sequencer', {detail: {note: theMidi, state: true, time: this.ticks} as SequenceItem}))
    }

    startSequence() {
        this.ticks = 0;
        this.sequenceRunning = true;
        this.notation.redraw();
    }

    addNoteToSequence(theNote: number, theState: boolean, theTimeInc = 0, theNoteType: NoteType = NoteType.Cadence) { // Tack to end of sequence.  To do a chord, don't increment the time
        let theTime = (this.sequence.length > 0) ? this.sequence[this.sequence.length - 1].time : 0;    // Get time of last note in sequence
        theTime += theTimeInc;
        this.sequence.push({note: theNote, state: theState, time: theTime, noteType: theNoteType} as SequenceItem);
    }

    cadenceSequence() {
        this.sequence = []; // Clear out old sequence
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C, true);    // I
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C + 4, true);
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C + 7, true);
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C + 5, true, this.ticksBetweenChords); // IV
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C + 9, true);
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C, true);
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C + 7, true, this.ticksBetweenChords); // V
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C + -1, true);
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C + 2, true);
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C, true, this.ticksBetweenChords); // I
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C + 4, true);
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C + 7, true);
    }

    cadencePlusNote(theNote: number) {
        this.cadenceSequence();
        this.addNoteToSequence(theNote, true, this.ticksBetweenChords * 4);
    }
}
export {PBSequencer, NoteType, SequenceItem};