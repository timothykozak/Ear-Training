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
    available: boolean = false;
    inputs: WebMidi.MIDIInputMap = undefined;
    outputs: WebMidi.MIDIOutputMap = undefined;

    constructor(public statusWindow: PBStatusWindow, public sequencer: PBSequencer, public tester: PBTester) {
        this.checkForMIDI();
        document.addEventListener(PBConst.EVENTS.sequencerNotePlayed, (event: CustomEvent) => {this.onSequencer(event)}, false);
    }

    setAvailable(value: boolean) {
        this.available = value;
    }

    checkForMIDI() {
        // The callbacks of a promise will never be called before the completion
        // of the current run of the JavaScript event loop.  Therefore, the
        // availability of MIDI is not known at the end of this function.
        // The setAvailable method above is a good breakpoint for both the resolve
        // and failure callbacks.
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess({sysex: true}).then((midiAccess) => {
                this.setAvailable(true);
                this.statusWindow.writeMsg("MIDI is available.");
                this.inputs = midiAccess.inputs;
                this.outputs = midiAccess.outputs;

                for (let input of midiAccess.inputs.values()) {
                    input.onmidimessage = (message) => {
                        this.onMIDIMessage(message)
                    };
                }
                for (let output of midiAccess.outputs.values()) {
                    output = output;    // Temporary
                }
            }).catch((error) => {
                this.statusWindow.writeErr("MIDI is NOT available.");
                this.setAvailable(false);
            });
        }
    }

    onMIDIMessage(message: WebMidi.MIDIMessageEvent) {
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

    onSequencer(event: CustomEvent) {
        // The sequencer has asked that a note be played.
        if (this.available && event.detail.state) {
            // Temporary
        }
    }
}

export {PBMIDI};