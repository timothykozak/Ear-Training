//
//  pbSequencer.js
//
// This module is the sequencer
//
// TODO: Use the note types, and handle the chordal notes

import {PBSounds} from "./PBSounds.js";
import {PBNotation} from "./PBNotation.js";
import {PBConst} from "./PBConst.js";

enum NoteType {  // For notation positioning
    Cadence1,
    Cadence2,
    Cadence3,
    Cadence4,
    Testing,
    Answer,
    Immediate
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
                    document.dispatchEvent(new CustomEvent(PBConst.events.sequencerNotePlayed, {detail: item}));
                    if (item.noteType == NoteType.Testing) {
                        document.dispatchEvent(new CustomEvent(PBConst.events.sequencerTestNotePlayed, {detail: item}));
                    }
                }
            });
            if (this.sequence[this.sequence.length - 1].time <= this.ticks)
                this.sequenceRunning = false;
            this.ticks++;
        }
    }

    playNote(theMidi: number) { // Play a note right now
        document.dispatchEvent(new CustomEvent(PBConst.events.sequencerNotePlayed, {detail: {note: theMidi, state: true, time: this.ticks, noteType: NoteType.Immediate} as SequenceItem}))
    }

    startSequence() {
        this.ticks = 0;
        this.sequenceRunning = true;
        this.notation.redraw();
    }

    addNoteToSequence(theNote: number, theState: boolean, theTimeInc = 0, theNoteType: NoteType) { // Tack to end of sequence.  To do a chord, don't increment the time
        let theTime = (this.sequence.length > 0) ? this.sequence[this.sequence.length - 1].time : 0;    // Get time of last note in sequence
        theTime += theTimeInc;
        this.sequence.push({note: theNote, state: theState, time: theTime, noteType: theNoteType} as SequenceItem);
    }

    cadenceSequence() {
        this.sequence = []; // Clear out old sequence
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C, true, 0, NoteType.Cadence1);    // I
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C + 4, true, 0, NoteType.Cadence1);
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C + 7, true, 0, NoteType.Cadence1);
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C + 5, true, this.ticksBetweenChords, NoteType.Cadence2); // IV
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C + 9, true, 0, NoteType.Cadence2);
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C, true, 0, NoteType.Cadence2);
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C + 7, true, this.ticksBetweenChords, NoteType.Cadence3); // V
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C + -1, true, 0, NoteType.Cadence3);
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C + 2, true, 0, NoteType.Cadence3);
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C, true, this.ticksBetweenChords, NoteType.Cadence4); // I
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C + 4, true, 0, NoteType.Cadence4);
        this.addNoteToSequence(PBSounds.MIDI_MIDDLE_C + 7, true, 0, NoteType.Cadence4);
    }

    cadencePlusNote(theNote: number) {
        this.cadenceSequence();
        this.addNoteToSequence(theNote, true, this.ticksBetweenChords * 4, NoteType.Testing);
    }
}
export {PBSequencer, NoteType, SequenceItem};