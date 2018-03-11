//
// PBTester.ts
//
// This class actually runs the tests.
//

import {PBSequencer} from "./PBSequencer.js";
import {PBSounds} from "./PBSounds.js";
import {PBConst} from "./PBConst.js";

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
    waitingForAnswer: boolean;
    results: ResultItem[];

    constructor(public sequencer: PBSequencer) {
        document.addEventListener(PBConst.EVENTS.sequencerNotePlayed, (event: CustomEvent) => {this.onNotePlayed(event);}, false);
        document.addEventListener(PBConst.EVENTS.sequencerTestNotePlayed, (event: CustomEvent) => {this.onTestNotePlayed(event);}, false);
    }

    onTestNotePlayed(event: CustomEvent) {
        this.waitingForAnswer = true;
    }

    onNotePlayed(event: CustomEvent) {
        if (this.waitingForAnswer && event.detail.state) {  // Make sure to disregard the note off of the degreeBeingTested note
            this.waitingForAnswer = false;
            let correctAnswer = (event.detail.note == (this.degreeBeingTested + PBSounds.MIDI_MIDDLE_C));
            document.dispatchEvent(new CustomEvent(PBConst.EVENTS.testerNoteAnswered, {detail: {correct: correctAnswer}}));
        }
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
        if (!this.sequencer.sequenceRunning && this.testRunning) {  // Still running the test
            let length = this._degreesToTest.length;
            if (length > 0) {
                let index = Math.floor(Math.random() * length); // Select a random note to test
                theResult = this._degreesToTest[index];
                this.degreeBeingTested = theResult;
                this._degreesToTest.splice(index, 1);   // Remove the note being tested
                this.sequencer.cadencePlusNote(theResult + PBSounds.MIDI_MIDDLE_C);
                this.sequencer.startSequence();
                this.waitingForAnswer = false;
            } else {
                this.testRunning = false;
                document.dispatchEvent(new CustomEvent(PBConst.EVENTS.testerFinished, {detail: {}}));
            }
        }
        return(theResult);
    }

    startTest(): boolean {
        let theResult = false;  // Return false if problem starting test
        if (!this.sequencer.sequenceRunning && !this.testRunning) {
            this.testRunning = true;
            if (this.pickNextNoteToTest() >= PBSounds.MIDI_LOW)
                theResult = true; // Test has actually started
        }
        return(theResult);
    }
}

export {PBTester};