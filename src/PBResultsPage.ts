// PBResultsPagege.ts
//
// This class handles the results page for the menu.  The results are
// saved/restored in the browser.
//

import {TestItem, TestResults} from "./PBTester.js";
import {PBConst} from "./PBConst.js";
import {PBStatusWindow} from "./PBStatusWindow.js";

class PBResultsPage {
    theResults: number;

    constructor(public statusWindow: PBStatusWindow, public parentHTMLDiv: HTMLDivElement) {
        window.addEventListener(PBConst.EVENTS.unload, () => { this.onUnload()});
        document.addEventListener(PBConst.EVENTS.testerNoteAnswered, (event: CustomEvent) => {this.onNoteAnswered(event);}, false);
        this.restoreOptions();
    }

    restoreOptions() {
        // Need to get the options from the browser.
        this.theResults = JSON.parse(localStorage.getItem(PBConst.STORAGE.statsPage));
        if (!this.theResults) {
            this.theResults = 0;
        }
    }

    onUnload(){
        // The window is being shut down.  Save everything.
        localStorage.setItem(PBConst.STORAGE.statsPage, JSON.stringify(this.theResults));
    }

    onNoteAnswered(event: CustomEvent) {
        let theTest = event.detail.theTestItem as TestItem;
    }

}

export {PBResultsPage};