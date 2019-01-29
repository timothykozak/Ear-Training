// PBOptionsPage.ts
//

import {PBConst} from "./PBConst.js";
import {PBStatusWindow} from "./PBStatusWindow.js";
import {PBTester} from "./PBTester.js";
import {PBKeyCustomComponent} from "./PBKeyCustomComponent.js";

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
    theCC: PBKeyCustomComponent;

    constructor(public statusWindow: PBStatusWindow, public parentHTMLDiv: HTMLDivElement, public tester: PBTester) {
        customElements.define('key-component', PBKeyCustomComponent);
        this.restoreOptions();
        this.buildHTML();
        this.theCC = document.getElementById('theCC') as PBKeyCustomComponent;
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
                <input type="button" value="All" onclick="window.pbEarTraining.ui.options.createStandardTest(0);">
                <input type="button" value="Black" onclick="window.pbEarTraining.ui.options.createStandardTest(1);">
                <input type="button" value="White" onclick="window.pbEarTraining.ui.options.createStandardTest(2);">
                <input type="button" value="I IV V" onclick="window.pbEarTraining.ui.options.createStandardTest(3);">
                <key-component id="idC" x="100" y="200" label="C"></key-component>
                <key-component id="idD" x="140" y="200" label="D"></key-component>
                <key-component id="idE" x="180" y="200" label="E"></key-component>
                <key-component id="idF" x="220" y="200" label="F"></key-component>
                <key-component id="idG" x="260" y="200" label="G"></key-component>
                <key-component id="idA" x="300" y="200" label="A"></key-component>
                <key-component id="idB" x="340" y="200" label="B"></key-component>
                <key-component id="idC#" x="120" y="50" label="C#"></key-component>
                <key-component id="idD#" x="160" y="50" label="D#"></key-component>
                <key-component id="idF#" x="240" y="50" label="F#"></key-component>
                <key-component id="idG#" x="280" y="50" label="G#"></key-component>
                <key-component id="idA#" x="320" y="50" label="A#"></key-component>
            </div>
            `);
    }
}

export {PBOptionsPage};