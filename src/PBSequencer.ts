//
//  pbSequencer.js
//
// This module is the sequencer
//
// TODO: Use the note types, and handle the chordal notes

import {PBSounds} from "./PBSounds.js";
import {PBConst, NoteType} from "./PBConst.js";

interface SequenceItem {
    note: number,   // A MIDI note
    state: boolean, // True equals note on
    time: number,   // Current time in clock ticks
    noteType: NoteType
}

class PBSequencer {
    static I_CHORD = [PBConst.MIDI.MIDDLE_C, PBConst.MIDI.MIDDLE_C + 4, PBConst.MIDI.MIDDLE_C + 7];
    static IV_CHORD = [PBConst.MIDI.MIDDLE_C + 5, PBConst.MIDI.MIDDLE_C + 9, PBConst.MIDI.MIDDLE_C];
    static V_CHORD = [PBConst.MIDI.MIDDLE_C + 7, PBConst.MIDI.MIDDLE_C - 1, PBConst.MIDI.MIDDLE_C + 2];

    sequence: SequenceItem[] = [];
    ticks = 0;
    sequenceRunning = false;
    ticksBetweenChords = 5;
    noteBeingTested: number;

    constructor() {
        this.sequence = [];
        this.ticks = 0;
        this.sequenceRunning = false;
        setInterval(() => {this.onTimer()}, 100);   // One tick equals 100ms
    }

    onTimer() {
        if (this.sequenceRunning) {
            this.sequence.forEach((item) => {
                if (item.time == this.ticks) {
                    document.dispatchEvent(new CustomEvent(PBConst.EVENTS.sequencerNotePlayed, {detail: item}));
                    if (item.noteType == NoteType.Testing) {
                        document.dispatchEvent(new CustomEvent(PBConst.EVENTS.sequencerTestNotePlayed, {detail: item}));
                    }
                }
            });
            if (this.sequence[this.sequence.length - 1].time <= this.ticks)
                this.sequenceRunning = false;
            this.ticks++;
        }
    }

    playNote(theMidi: number) { // Play a note right now
        document.dispatchEvent(new CustomEvent(PBConst.EVENTS.sequencerNotePlayed, {detail: {note: theMidi, state: true, time: this.ticks, noteType: NoteType.Immediate} as SequenceItem}))
    }

    startSequence() {
        this.ticks = 0;
        this.sequenceRunning = true;
        document.dispatchEvent(new CustomEvent(PBConst.EVENTS.sequencerCadenceStarted, {detail: this.noteBeingTested}));
    }

    addNoteToSequence(theNote: number, theState: boolean, theTimeInc: number, theNoteType: NoteType) { // Tack to end of sequence.  To do a chord, don't increment the time
        let theTime = (this.sequence.length > 0) ? this.sequence[this.sequence.length - 1].time : 0;    // Get time of last note in sequence
        theTime += theTimeInc;
        this.sequence.push({note: theNote, state: theState, time: theTime, noteType: theNoteType} as SequenceItem);
    }

    addChord(theNotes: number[], theState: boolean, theTimeInc: number, theNoteType: NoteType) {
        theNotes.forEach((theNote, theIndex) => {
            let localTimeInc = (theIndex == 0) ? theTimeInc : 0;
            this.addNoteToSequence(theNote, theState, localTimeInc, theNoteType);
        })
    }

    addTerminatedChord(theNotes: number[], theNoteType: NoteType) {
        this.addChord(theNotes, true, 0, theNoteType);  // Turn the chord on
        this.addChord(theNotes, false, this.ticksBetweenChords, theNoteType);  // Turn the chord on
    }

    cadenceSequence() {
        this.sequence = []; // Clear out old sequence
        this.addTerminatedChord(PBSequencer.I_CHORD, NoteType.Cadence1);
        this.addTerminatedChord(PBSequencer.IV_CHORD, NoteType.Cadence2);
        this.addTerminatedChord(PBSequencer.V_CHORD, NoteType.Cadence3);
        this.addTerminatedChord(PBSequencer.I_CHORD, NoteType.Cadence4);
    }

    cadencePlusNote(theNote: number) {
        this.noteBeingTested = theNote;
        this.cadenceSequence();
        this.addNoteToSequence(theNote, true, this.ticksBetweenChords * 4, NoteType.Testing);
        this.addNoteToSequence(theNote, false, this.ticksBetweenChords, NoteType.Testing);
    }
}
export {PBSequencer, NoteType, SequenceItem};