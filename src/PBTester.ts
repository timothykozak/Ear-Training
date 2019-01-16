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
    static DEGREE_MIN = 0;  // The degree is the position in the 12 tone musical scale,
                            // with 0 = C, 1 = C#, 2 = D, ... 11 = B
    static DEGREE_MAX = 11;
    static TEST_I_IV_V = [0, 5, 7];
    static TEST_I_TO_VII = [0, 2, 4, 5, 7, 9, 11];
    static TEST_SHARPED = [1, 3, 6, 8, 10];
    static TEST_ALL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    private _degreesToTest: Array<number>;  // The degrees to be tested
    testRunning: boolean = false;
    degreeBeingTested: number;
    waitingForAnswer: boolean;
    results: ResultItem[];

    constructor(public sequencer: PBSequencer) {
        document.addEventListener(PBConst.EVENTS.sequencerNotePlayed, (event: CustomEvent) => {this.onNotePlayed(event);}, false);
        document.addEventListener(PBConst.EVENTS.sequencerTestNotePlayed, (event: CustomEvent) => {this.onTestNotePlayed(event);}, false);
        this._degreesToTest = PBTester.TEST_I_IV_V;
    }

    onTestNotePlayed(event: CustomEvent) {
        this.waitingForAnswer = true;
    }

    onNotePlayed(event: CustomEvent) {
        if (this.waitingForAnswer && event.detail.state) {  // Make sure to disregard the note off of the degreeBeingTested note
            this.waitingForAnswer = false;
            let midiNote = this.degreeBeingTested + PBConst.MIDI.MIDDLE_C;
            let correctAnswer = (event.detail.note == midiNote);
            document.dispatchEvent(new CustomEvent(PBConst.EVENTS.testerNoteAnswered, {detail: {testNote: this.degreeBeingTested, answerNote: event.detail.note, correct: correctAnswer}}));
        }
    }

    set degreesToTest(theDegrees: Array<number>) {
        // theDegrees contains all the degrees to test.  The same degree can show up
        // multiple times or the degree may not show up at all.  The order that the
        // degrees appear does not equal the order that they are played.
        theDegrees.forEach((item: number, index: number) => { // Remove all invalid degrees
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
        // Used to play the next note in the test.
        // Picks a note at random from theDegrees and starts the sequence.
        // Returns the degree being tested, or -1 for failure.
        let theResult = -1;
        if (!this.sequencer.sequenceRunning && this.testRunning) {  // Still running the test
            let length = this._degreesToTest.length;
            if (length > 0) {
                let index = Math.floor(Math.random() * length); // Select a random note to test
                theResult = this._degreesToTest[index];
                this.degreeBeingTested = theResult;
                this._degreesToTest.splice(index, 1);   // Remove the note being tested
                this.sequencer.cadencePlusNote(theResult + PBConst.MIDI.MIDDLE_C);
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
            if (this.pickNextNoteToTest() != -1) {
                theResult = true; // Test has actually started
                document.dispatchEvent(new CustomEvent(PBConst.EVENTS.testerStarted, {detail: {}}));
            }
        }
        return(theResult);
    }

    stopTest() {
        this.testRunning = false;
        this.waitingForAnswer = false;
    }

    newTest() {
        this.stopTest();
        this.degreesToTest = PBTester.TEST_ALL;
        this.startTest();
    }
}

export {PBTester};