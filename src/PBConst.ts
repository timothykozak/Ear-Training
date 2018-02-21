//
// PBConst.ts
//
// Constants used throughout the project

class PBConst {
    static events = {
        sequencerNotePlayed: "PBSequencerNotePlayed",
        sequencerCadenceStarted: "PBSequencerCadenceStarted",
        sequencerTestNotePlayed: "PBSequencerTestNotePlayed",

        testerFinished: "PBTesterFinished",
        testerNoteAnswered: "PBTesterNoteAnswered",

        soundsInstrumentLoaded: "PBSoundsInstrumentLoaded",

        keyboardHover: "PBKeyboardHover",

        mouseLeave: "mouseleave",
        mouseMove: "mousemove",
        mouseClick: "click",
        mouseDown: "mousedown",
        mouseUp: "mouseup",

        keyPress: "keypress"
    }
}

export {PBConst};