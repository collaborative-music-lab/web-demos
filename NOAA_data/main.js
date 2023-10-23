import sketch from './sketch.js';
import { monosynth, kick, hihat } from './synthDef.js'; // Import monosynth module

let output = new Tone.Multiply(0.1).toDestination()
monosynth.connect( output )

// Define a sequence of notes
const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
let sequenceIndex = 0

// Create a looped sequence with Tone.Transport
const sequence = new Tone.Pattern((time, note) => {
    let midiNote= Tone.Frequency(note).toMidi()

    monosynth.triggerAttackRelease(note, .05, time);

    // if(midiNote < 65){
    //     kick.start();
    // }

    // if(midiNote > 65){
    //     hihat.triggerAttackRelease(.05, time, (midiNote-60)/12);
    // }

    //monitor note
    //console.log( note)
    sequenceIndex += 1

    p.drawColumn( sequenceIndex,midiNote, 60)

}, notes);

sequence.interval = '8n';

/****************** Setup p5 *******************/
let p //name of p5 instance

const externalObjects = {
    sequence: sequence
};

function initializeP5(external) {
    p = new p5((p) => sketch(p, external), 'canvas-container');
  }

initializeP5(externalObjects);


/****************** Starting Sequence *******************/
// Get references to the button element
const startStopButton = document.getElementById('startStopButton');

// Set the initial state of the button
Tone.Transport.start();
// sequence.start(0);
let isPlaying = false;

// Add a click event listener to toggle the sequencer
startStopButton.addEventListener('click', () => {
    if (!isPlaying) {
      // Start the sequencer if it's not already playing
      Tone.Transport.start();
      sequence.start(0);
      startStopButton.textContent = 'Stop Sequencer';
      isPlaying = true;
      console.log('start');
    } else {
      // Stop the sequencer if it's already playing
      Tone.Transport.stop();
      sequence.stop();
      startStopButton.textContent = 'Start Sequencer';
      isPlaying = false;
      console.log('stop');
    }
  });

// Get a reference to the dropdown element to set playback rate
const sequenceRateDropdown = document.getElementById('sequenceRate');

// Add an event listener to detect changes in the dropdown
sequenceRateDropdown.addEventListener('change', () => {
  // Get the selected value from the dropdown
  const selectedRate = sequenceRateDropdown.value;

  // Set the sequence rate based on the selected value
  sequence.interval = selectedRate; // Adjust the interval as needed
  //sequence.playbackRate = selectedRate;
});


/******** Get JPEG data **************/


/******** HELPER FUNCTIONS **************/
//function to save data to disk
function saveTextAsFile(filename, text) {

// Create a Blob object from the text content
const blob = new Blob([text], { type: "text/plain" });

// Create a URL for the Blob object
const url = URL.createObjectURL(blob);

// Create a link element and set its attributes
const a = document.createElement("a");
a.href = url;
a.download = filename;

// Simulate a click on the link to trigger the download
a.click();

// Clean up by revoking the Blob URL
URL.revokeObjectURL(url);

console.log("data saved to disk as: " + filename)
}//saveTextAsFile


function dataToQuantizedPitch(data, scalar=1, offset=0, scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B']) {
    // Map vValues to musical notes or pitches
    const pitches = data.map(v => {
        v = Math.floor(v*scalar + offset)
        if( v < 0 ) v = 0
        const octave = 4 + Math.floor(v/scale.length)
        const index = v % scale.length;
        //console.log(v, scale[index] + octave)
        return scale[index] + octave;
    });
  
    // Set the pitches in your Tone.js sequence
    return pitches;
  }//setPitchesInSequence