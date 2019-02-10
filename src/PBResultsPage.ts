// PBResultsPage.ts
//
// This class handles the results page for the menu.  The results are
// saved/restored in the browser.
//

import {TestItem, TestResults} from "./PBTester.js";
import {PBConst} from "./PBConst.js";
import {PBStatusWindow} from "./PBStatusWindow.js";

interface ResultItem {
    numTests: number,
    numCorrect: number
}

class PBResultsPage {
    static ITEMS_PER_OCTAVE = 12;

    theResults: Array<ResultItem>;

    constructor(public statusWindow: PBStatusWindow, public parentHTMLDiv: HTMLDivElement) {
        window.addEventListener(PBConst.EVENTS.unload, () => { this.onUnload()});
        document.addEventListener(PBConst.EVENTS.testerNoteAnswered, (event: CustomEvent) => {this.onNoteAnswered(event);}, false);
        this.restoreOptions();
    }

    initTheResults() {
        this.theResults = [];
        for (let index = 0; index < PBResultsPage.ITEMS_PER_OCTAVE; index++) {
            this.theResults.push({numTests: 0, numCorrect: 0});
        }
    }

    restoreOptions() {
        // Need to get the options from the browser.
        this.theResults = JSON.parse(localStorage.getItem(PBConst.STORAGE.statsPage));
        if (!this.theResults) {
            this.initTheResults();
        }
    }

    onUnload(){
        // The window is being shut down.  Save everything.
        localStorage.setItem(PBConst.STORAGE.statsPage, JSON.stringify(this.theResults));
    }

    onNoteAnswered(event: CustomEvent) {
        let theTest = event.detail.theTestItem as TestItem;
        let index = theTest.testNote - PBConst.MIDI.MIDDLE_C;
        if ((index >= 0) && (index <= PBResultsPage.ITEMS_PER_OCTAVE)) {
            this.theResults[index].numTests++;
            if (theTest.correct)
                this.theResults[index].numCorrect++;
        }
    }

}

export {PBResultsPage};