// PBMIDI.ts
//
//
//
// This class handles all MIDI communications.
//

import {PBConst} from "./PBConst.js";
import {PBStatusWindow} from "./PBStatusWindow.js";
import {PBTester} from "./PBTester.js";
import {PBSequencer} from "./PBSequencer";
import MIDIAccess = WebMidi.MIDIAccess;

class PBMIDI {
    inputs: WebMidi.MIDIInputMap;
    outputs: WebMidi.MIDIOutputMap

    constructor(public statusWindow: PBStatusWindow, public sequencer: PBSequencer, public tester: PBTester) {
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess().
            then((midiAccess) => {
                this.statusWindow.writeMsg("MIDI is available.");
                this.inputs = midiAccess.inputs;
                this.outputs = midiAccess.outputs;

                for (let input of midiAccess.inputs.values()) {
                    input.onmidimessage = (message) => {this.handleMIDIMessage(message)};
                }
            }).catch((error) => {
                this.statusWindow.writeErr("MIDI is NOT available.");
            });
        }
    }
    handleMIDIMessage(message: WebMidi.MIDIMessageEvent) {
        let command = message.data[0];
        let note = message.data[1];
        let velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command

        switch (command) {
            case PBConst.MIDI.NOTE_ON:
                (velocity > 0) ? this.noteOnReceived(note, velocity) : this.noteOffReceived(note);
                break;
            case PBConst.MIDI.NOTE_OFF:
                this.noteOffReceived(note);
                break;
            case PBConst.MIDI.ACTIVE_SENSING:
                break;
            default:
                break;
        }
    }

    noteOnReceived(note: number, velocity: number) : void {
        this.sequencer.playNote(note);
        document.dispatchEvent(new CustomEvent(PBConst.EVENTS.keyboardHover, {detail: note})); // No longer hovering
    }

    noteOffReceived(note: number) : void {
    }

}

export {PBMIDI};