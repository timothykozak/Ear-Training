//
// pbEarTraining.js
//
// TODO: Create a single canvas here.  Tell the classes which part it can use.

import {PBStatusWindow} from "./PBStatusWindow.js";
import {PBSounds} from "./PBSounds.js";
import {PBSequencer} from "./PBSequencer.js";
import {PBCharacterInput} from "./PBCharacterInput.js";
import {PBTester} from "./PBTester.js";
import {PBConst} from "./PBConst.js";
import {PBUI} from "./PBUI.js";

class PBEarTraining {
    soundsAvailable = false;
    audioContext: AudioContext;
    statusWindow = new PBStatusWindow('Status');
    characterInput: PBCharacterInput;
    sequencer: PBSequencer;
    soundModule: PBSounds;
    tester: PBTester;
    ui: PBUI;

    constructor(public webFont: any) {
        if (this.checkForWebAudio()) {
            this.checkForWebFont();
        }
    }

    initClass() {
        document.addEventListener(PBConst.EVENTS.soundsInstrumentLoaded, () => {this.soundsAvailable = true;}, false);
        this.soundModule = new PBSounds(this.statusWindow, this.audioContext);
        this.sequencer = new PBSequencer();
        this.tester = new PBTester(this.sequencer);
        this.characterInput = new PBCharacterInput(this.sequencer, this.tester);
        this.ui = new PBUI(this.statusWindow, this.sequencer);
    }

    checkForWebFont() {
        this.webFont.load({
            custom: { families: ['Aruvarb', 'ionicons'] },
            timeout:5000,
            fontactive: (familyName: string) => {
                this.statusWindow.writeMsg(familyName + " font available.");
            },
            fontinactive: (familyName: string) => {
                this.statusWindow.writeMsg(familyName + " font is not available.");
            },
            active: () => {
                this.initClass();
            }
        } as WebFont.Config);
    }


    checkForWebAudio() {
        // Need to make sure that the WebAudio API is available

        try {   // Check if WebAudio API is available.
            this.audioContext = new AudioContext();
            this.statusWindow.writeMsg("Web Audio is available.");
            return (true);
        } catch (e) {
            this.statusWindow.writeErr("Web Audio API is not supported in this browser");
            return (false);
        }
    }
}

export {PBEarTraining};