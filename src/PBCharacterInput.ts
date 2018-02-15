//
// PBCharacterInput.ts
//
// Handles the character input from computer keyboard.

import {PBSequencer} from "./PBSequencer.js";
import {PBTester} from "./PBTester.js";

class PBCharacterInput {
    theNote: number = 0;

    constructor(public sequencer: PBSequencer, public tester: PBTester) {
        document.addEventListener('keypress', (event: KeyboardEvent) => {this.onCharacterInput(event);}, false)
    }

    onCharacterInput(event: KeyboardEvent) {
        if (event.key)
            this.tester.startTest(this.theNote++);
    }
}

export {PBCharacterInput};