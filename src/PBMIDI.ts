// PBMIDI.ts
//
//
//
// This class handles all MIDI communications.
//

import {PBStatusWindow} from "./PBStatusWindow.js";
import {PBTester} from "./PBTester.js";
import {PBSequencer} from "./PBSequencer";

class PBMIDI {

    constructor(public statusWindow: PBStatusWindow, public sequencer: PBSequencer, public tester: PBTester) {
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess().
            then((midiAccess) => {
                this.statusWindow.writeMsg("MIDI is available.");
            }).catch((error) => {
                this.statusWindow.writeErr("MIDI is NOT available.");
            });
        }
    }

}

export {PBMIDI};