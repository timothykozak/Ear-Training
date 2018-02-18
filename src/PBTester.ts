//
// PBTester.ts
//
// This class actually runs the tests.
//

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
    testRunning: boolean = false;
    degreeBeingTested: number;
    results: ResultItem[];

    constructor(public sequencer: PBSequencer) {

    }

    set degreesToTest(theDegrees: Array<number>) { // Clean it up before using
        theDegrees.forEach((item: number, index: number) => {
            if ((item > PBTester.DEGREE_MAX) || (item < PBTester.DEGREE_MIN))
                theDegrees.splice(index, 1); // Remove invalid degrees
        });
        if (theDegrees.length == 0)
            this._degreesToTest = PBTester.TEST_ALL;    // None at all.  Use default.
        else
            this._degreesToTest = theDegrees;
    }

    get degreesToTest() {
        return(this._degreesToTest);
    }

    pickNextNoteToTest(): number {
        let theResult = -1; // Returns the degree being tested, or -1 for failure.
        if (!this.sequencer.sequenceRunning && this.testRunning) {
            let length = this._degreesToTest.length;
            if (length > 0) {
                let index = Math.floor(Math.random() * length);
                theResult = this._degreesToTest[index];
                this.degreeBeingTested = theResult;
                this._degreesToTest.splice(index, 1);
                this.sequencer.cadencePlusNote(theResult + PBSounds.MIDI_MIDDLE_C);
                this.sequencer.startSequence();
            } else {
                this.testRunning = false;
            }
        }
        return(theResult);
    }

    startTest(): boolean {
        let theResult = false;
        if (!this.sequencer.sequenceRunning && !this.testRunning) {
            this.testRunning = true;
            if (this.pickNextNoteToTest() >= PBSounds.MIDI_LOW)
                theResult = true; // Test has actually started
        }
        return(theResult);
    }
}

export {PBTester};