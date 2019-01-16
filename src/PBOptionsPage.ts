// PBOptionsPage.ts
//

import {PBConst} from "./PBConst.js";
import {PBStatusWindow} from "./PBStatusWindow";

class PBOptionsPage {
    theOptions: string;

    constructor(public statusWindow: PBStatusWindow) {
        this.restoreOptions();
        window.addEventListener(PBConst.EVENTS.unload, () => { this.onUnload()});
    }

    restoreOptions() {
        this.theOptions = localStorage.getItem(PBConst.STORAGE.optionsPage);
    }

    onUnload(){
        // The window is being shut down.  Save everything.
        localStorage.setItem(PBConst.STORAGE.optionsPage, 'These are the options.');
    }
}

export {PBOptionsPage};