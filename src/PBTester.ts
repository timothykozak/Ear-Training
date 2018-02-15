//
// PBTester.ts
//
// This class actually runs the tests.

import {PBSequencer} from "./PBSequencer.js";
import {PBSounds} from "./PBSounds.js";

interface ResultItem {
    numTests: number,
    numCorrect: number,
    numWrong: number,
    numSlow: number
}

class PBTester {
    static DEGREE_MIN = 0;
    static DEGREE_MAX = 11;
    static TEST_I_IV_V = [0, 5, 7];
    static TEST_I_TO_VII = [0, 2, 4, 5, 7, 9, 11];
    static TEST_SHARPED = [1, 3, 6, 8, 10];
    static TEST_ALL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    private _degreesToTest: Array<number> = PBTester.TEST_I_IV_V;
    results: ResultItem[];

    constructor(public sequencer: PBSequencer) {

    }

    set degreesToTest(theDegrees: Array<number>) {
        for (let i = 0; i < theDegrees.length; i++) {
            if ((theDegrees[i] > PBTester.DEGREE_MAX) || (theDegrees[i] < PBTester.DEGREE_MIN))
                theDegrees.splice(i, 1);
        }
        if (theDegrees.length == 0)
            this._degreesToTest = PBTester.TEST_ALL;
        else
            this._degreesToTest = theDegrees;
    }

    get degreesToTest() {
        return(this._degreesToTest);
    }

    startTest(theDegree: number) {
        if (!this.sequencer.sequenceRunning) {
            this.sequencer.cadencePlusNote(theDegree + PBSounds.MIDI_MIDDLE_C);
            this.sequencer.startSequence();
        }
    }
}

export {PBTester};