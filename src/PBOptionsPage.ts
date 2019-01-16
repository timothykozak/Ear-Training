// PBOptionsPage.ts
//

import {PBConst} from "./PBConst.js";
import {PBStatusWindow} from "./PBStatusWindow";
import {PBTester} from "./PBTester";

class PBOptionsPage {
    static NOTES_IN_OCTAVE = 12;
    static NOTE_FREQUENCY_I_IV_V = [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0];
    static NOTE_FREQUENCY_ALL = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    static NOTE_FREQUENCY_WHITE = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1];
    static NOTE_FREQUENCY_BLACK = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
    theOptions: {
        noteFrequency: number[];
        timeToWait: number;
    };
    noteHTMLInput: Array<HTMLInputElement>;

    constructor(public statusWindow: PBStatusWindow, public parentHTMLDiv: HTMLDivElement, public tester: PBTester) {
        this.restoreOptions();
        this.buildHTML();
        window.addEventListener(PBConst.EVENTS.unload, () => { this.onUnload()});
    }

    restoreOptions() {
        this.theOptions = JSON.parse(localStorage.getItem(PBConst.STORAGE.optionsPage));
        if (!this.theOptions) {
            this.theOptions = {
                noteFrequency: PBOptionsPage.NOTE_FREQUENCY_I_IV_V,
                timeToWait: 10 };
        }
    }

    onUnload(){
        // The window is being shut down.  Save everything.
        localStorage.setItem(PBConst.STORAGE.optionsPage, JSON.stringify(this.theOptions));
    }

    createStandardTest(testType: number) {
        let theTests = [PBOptionsPage.NOTE_FREQUENCY_ALL,
                        PBOptionsPage.NOTE_FREQUENCY_BLACK,
                        PBOptionsPage.NOTE_FREQUENCY_WHITE,
                        PBOptionsPage.NOTE_FREQUENCY_I_IV_V];
        testType = ((testType >= 0) && (testType < theTests.length)) ? testType : 0;
        this.theOptions.noteFrequency = theTests[testType];
        this.createNewTest();
    }

    createNewTest() {
        let theDegreesToTest: Array<number> = [];
        this.theOptions.noteFrequency.forEach((value, index) => {
            for (let i = 0; i < value; i++)
                theDegreesToTest.push(index);
        });
        this.tester.degreesToTest = theDegreesToTest;
    }

    buildHTML(){
        this.parentHTMLDiv.insertAdjacentHTML('beforeend',
            `<div>
                C:<input type="text" id="C"><br>
                C#:<input type="text" id="C#"><br>
                D:<input type="text" id="D"><br>
                <input type="button" value="All" onclick="window.pbEarTraining.ui.options.createStandardTest(0);">
                <input type="button" value="Black" onclick="window.pbEarTraining.ui.options.createStandardTest(1);">
                <input type="button" value="White" onclick="window.pbEarTraining.ui.options.createStandardTest(2);">
                <input type="button" value="I IV V" onclick="window.pbEarTraining.ui.options.createStandardTest(3);">
            </div>
            `);
    }
}

export {PBOptionsPage};