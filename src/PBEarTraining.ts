//
// pbEarTraining.js
//
// TODO: Create a single canvas here.  Tell the classes which part it can use.

import {PBStatusWindow} from "./PBStatusWindow.js";
import {PBSounds} from "./PBSounds.js";
import {PBSequencer} from "./PBSequencer.js";
import {PBNotation} from "./PBNotation.js";
import {PBPianoKeyboard} from "./PBPianoKeyboard.js";
import {PBCharacterInput} from "./PBCharacterInput.js";
import {PBTester} from "./PBTester.js";
import {PBConst} from "./PBConst.js";

class PBEarTraining {
    pianoCanvas: HTMLCanvasElement = document.getElementById("pianoCanvas") as HTMLCanvasElement;
    notationCanvas: HTMLCanvasElement = document.getElementById("notationCanvas") as HTMLCanvasElement;
    soundsAvailable = false;
    audioContext: AudioContext;
    statusWindow = new PBStatusWindow('Status');
    characterInput: PBCharacterInput;
    sequencer: PBSequencer;
    soundModule: PBSounds;
    notation: PBNotation;
    pianoKeyboard: PBPianoKeyboard;
    tester: PBTester;

    constructor(public webFont: any) {
        if (this.checkForWebAudio()) {
            this.checkForWebFont();
        }
    }

    initClass() {
        document.addEventListener(PBConst.events.soundsInstrumentLoaded, () => {this.soundsAvailable = true;}, false);
        this.soundModule = new PBSounds(this.statusWindow, this.audioContext);
        this.notation = new PBNotation(this.notationCanvas);
        this.notation.redraw();
        this.sequencer = new PBSequencer(this.notation);
        this.pianoKeyboard = new PBPianoKeyboard(this.statusWindow, this.pianoCanvas, this.notation, this.sequencer);
        this.tester = new PBTester(this.sequencer);
        this.characterInput = new PBCharacterInput(this.sequencer, this.tester);
    }

    checkForWebFont() {
        this.webFont.load({
            custom: { families: ['Aruvarb'] },
            timeout:5000,
            fontactive: (familyName: string) => {
                this.statusWindow.writeMsg(familyName + " font available.");
                this.initClass();
            },
            fontinactive: (familyName: string) => {
                this.statusWindow.writeMsg(familyName + " font is not available.");
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