//
// PBCharacterInput.ts
//
// Handles the character input from computer keyboard.
//
// TODO: Flesh out this stub

import {PBSequencer} from "./PBSequencer.js";
import {PBTester} from "./PBTester.js";
import {PBConst} from "./PBConst.js";
import {PBStatusWindow} from "./PBStatusWindow.js";

class PBCharacterInput {
    theNote: number = 0;

    constructor(public sequencer: PBSequencer, public tester: PBTester) {
        document.addEventListener(PBConst.EVENTS.keyPress, (event: KeyboardEvent) => {this.onCharacterInput(event);}, false)
    }

    onCharacterInput(event: KeyboardEvent) {
        if (event.key)
            switch (event.key) {
                case 'h':
                case 'H':
                    PBStatusWindow.switchAll();
                    break;
            }
            this.tester.pickNextNoteToTest();
    }
}

export {PBCharacterInput};