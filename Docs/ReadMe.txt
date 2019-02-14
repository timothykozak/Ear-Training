                      Ear Training

This program is a web app that implements the Bruce Arnold
method for recognizing a note within the "sense" of a key.
It plays a I IV V I chord cadence to give the "sense" of
the key.  It then plays a note.  The user guesses the note.

The app has a menu bar on the left, a transport bar on the
bottom and the rest of the window is used for the various
"pages" which are accessed through the menu bar.

The home page shows a piano keyboard and the
treble staff.  The keyboard goes from the A# below middle C
through the C# an octave above middle C.  There is also a
floating window that shows status messages.  This is normally
hidden and is for testing purposes.

The settings page allows the setting of various options,
such as the frequency of each note to test, time between cadence
chords, etc.  These settings are saved in the browser using
local storage.

The results page displays the results of the tests.  These results
are saved using local storage.

The help page gives some basic information and acknowledgements.


Will only run on Chrome with experimental canvas features enabled (chrome://flags then search for canvas).