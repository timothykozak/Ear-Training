//
// PBSounds.ts
//
// This class downloads INSTRUMENT_FILE_NAME, which has information on all sounds on the server
// An instrument has notes B3 through C5 inclusive.  These are separate files that are downloaded.
// This class listens to the sequencer and plays the sequenced notes.
//
// TODO: Combine the individual notes to form the chord

import {PBStatusWindow} from "./PBStatusWindow.js";
import {PBConst} from "./PBConst.js";

interface Sound {
    playing: boolean,
    available: boolean,
    buffer: AudioBuffer,
    source: AudioBufferSourceNode
}

interface Instrument {
    name: string,
    description: string,
    url: string
}

class PBSounds {
    static INSTRUMENT_FILE_NAME = "instruments.txt";
    static BASE_URL = "assets/sounds/";    // This directory contains instruments.txt, and the subdirectories contain all the sounds files.
    static MIDI_LOW = 59;  // On a piano keyboard, 21 is A0, 108 is C8 and 60 is C4 (middle C)
    static MIDI_MIDDLE_C = 60;
    static MIDI_HIGH = 72;
    static MIDI_FILE_REG_EXP = /\d{1,3}\.mp3/;    // Used to separate a valid MIDI file name from the BASE_URL

    sounds: Array<Sound>;
    allSoundsLoaded = false;
    instruments: Instrument[] = null;    // From the JSON file INSTRUMENT_FILE_NAME
    soundsAvailable =0;
    soundsRequested = 0;

    constructor(public msgWindow: PBStatusWindow, public context: AudioContext) {
        document.addEventListener(PBConst.EVENTS.sequencerNotePlayed, (event: CustomEvent) => {this.onSequencer(event)}, false);
        this.buildSoundsArray();
        this.loadInstrumentsJSON();
    }

    onSequencer(event: CustomEvent) {
        if (event.detail.state)
            this.playSound(event.detail.note);
    }

    buildSoundsArray() {
        this.sounds = [];    // Index into array is the MIDI note number
        for (let i = PBSounds.MIDI_LOW; i <= PBSounds.MIDI_HIGH; i++) {
            this.sounds[i]= {
                available: false,
                buffer: null,
                source: this.context.createBufferSource(),
                playing: false
            };
            this.sounds[i].source.connect(this.context.destination);
        }
    }

    clearOutSoundsArray() {
        this.sounds.forEach((sound: Sound) => {
            sound.available = false;
            sound.source.buffer = null;
            sound.playing = false;
        })
    }

    updateSoundsRequested() {
        this.soundsRequested++;
        if (this.soundsRequested > (PBSounds.MIDI_HIGH - PBSounds.MIDI_LOW)) {  // All download requests are finished.
            this.allSoundsLoaded = true;
            document.dispatchEvent(new Event(PBConst.EVENTS.soundsInstrumentLoaded));
            this.msgWindow.writeMsg("Instrument loaded.");
        }
    }

    loadASound(url: string) {
        window.fetch(PBSounds.BASE_URL + url).
        then((response: Response) => {
            if (!response.ok) {
                throw new Error('Network error');
            }
            return (response.arrayBuffer());
        }).then((theArrayBuffer: ArrayBuffer) => {
            return(this.context.decodeAudioData(theArrayBuffer))
        }).then((decodedData: AudioBuffer) => {
            this.soundsAvailable++;
            this.updateSoundsRequested();
            let fileName = url.match(PBSounds.MIDI_FILE_REG_EXP)[0];
            let midiNote = Number(fileName.match(/\d+/)[0]);
            let sound = this.sounds[midiNote];
            sound.available = true;
            sound.buffer = decodedData;
            sound.source.buffer = decodedData;
            sound.playing = false;
        }).catch((error: Error) => {
            this.msgWindow.writeErr('Could not retrieve ' + url + ': ' + error.message);
        })
    }

    loadInstrumentsJSON() {
        window.fetch(PBSounds.BASE_URL + PBSounds.INSTRUMENT_FILE_NAME).
        then((response) => {
            if (!response.ok) {
                throw new Error('Network error');
            }
            return (response.json());
        }).then((theJSON) => {
            this.instruments = theJSON;
            this.msgWindow.writeMsg("instruments.txt was loaded.");
            this.loadInstrument(this.instruments[0]);
        }).catch((error) => {
            this.msgWindow.writeErr('Could not retrieve ' + PBSounds.INSTRUMENT_FILE_NAME + ': ' + error.message);
        })
    }

    loadInstrument(instrument: Instrument) { // Download the sounds
        this.allSoundsLoaded = false;
        this.clearOutSoundsArray();
        this.soundsAvailable = 0;
        this.soundsRequested = 0;
        for (let i = PBSounds.MIDI_LOW; i <= PBSounds.MIDI_HIGH; i++) {    // Get the entire range
            this.loadASound(instrument.url + i + ".mp3");
        }
    }

    playSound(midiNote: number) {
        let sound = this.sounds[midiNote];
        if (sound.available) {
            if (sound.playing) {    // Can only start once, need a new BufferSource
                sound.source = this.context.createBufferSource();
                sound.source.buffer = sound.buffer;
                sound.source.connect(this.context.destination);
            }
            sound.source.start();
            sound.playing = true;
        }
    }
}

export {PBSounds};