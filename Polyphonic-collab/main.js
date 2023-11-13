//use an ascii keyboard to schedule notes to play from a 
//midi sequencer
//see var keyToNote at end of main.js

import sketch from './sketch.js';
import { monosynth, SimpleSynth3, hiHat } from './synthDef.js'; // Import monosynth module

console.log('collaborative ASCII sequencer')

/****************** Setup WebRTC *******************/
//const ws = new WebSocket('ws://localhost:3000');
const ws = new WebSocket('ws://m369.us-3.evennode.com');


ws.onopen = function() {
    console.log("Connected to the signaling server");
};

ws.onmessage = function(msg) {
    // Handle incoming messages (signaling data)
};

ws.onerror = function(err) {
    console.error("WebSocket error observed:", err);
};


/****************** Setup ASCII keyboard *******************/
let scheduledNotes = []
document.addEventListener('keydown', (e) => {
  let key = e.key.toLowerCase();
  try {
    console.log(keyToNote[key])
    if(keyToNote[key]) {
        const note = keyToNote[key].midi;
        console.log('ascii ', note)
        scheduledNotes.push(note)
        
        // Send the note information to other clients via WebSocket
        ws.send(JSON.stringify({ action: 'playNote', note:note }));
    } else {
      console.log('key not defined')
    }
  }
  catch (error) {
    console.error("Error in keydown event handler:", error);
  }
});

// Handle incoming WebSocket messages
ws.onmessage = function(event) {
  let message 

  try {
    if (event.data instanceof Blob) {
      console.log('blob parser')
          // Create a FileReader to read the Blob
          const reader = new FileReader();

          // Define the onload event handler
          reader.onload = function() {
              // Once the Blob has been read as text, parse it as JSON
              try {
                  message = JSON.parse(reader.result);
                  //console.log('Received note:', message.note);
                  scheduledNotes.push(message.note);
              } catch (parseError) {
                  console.error("Error parsing Blob data as JSON:", parseError);
              }
          };
        
          // Read the Blob as text
          reader.readAsText(event.data);
      }
      // Check if the received data is a string
      else if (typeof event.data === "string") {
          // Try parsing the string as JSON
          const message = JSON.parse(event.data);

          // Handle the parsed JSON message
          if (message.action === 'playNote') {
              //console.log('Received note:', message.note);
              scheduledNotes.push(message.note);
          }
      } else {
          console.error("Received data is not a string:", event.data);
      }
  } catch (e) {
      console.error("Error parsing received data as JSON:", e);
  }
};
/****************** Setup Tone.js *******************/

/*** debugging creating custom classes for use with 
 * Tone.PolySynth()
 * 
 * SimpleSynth3 seems to work
 * - many other approaches create inconsistent timing
 */

// Usage
let output = new Tone.Multiply(0.1).toDestination()
const synth = new Tone.PolySynth(SimpleSynth3)
synth.connect( output )
hiHat.connect( output )
hiHat.volume.value = -12

let sequenceIndex = 0
const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
// Create a looped sequence with Tone.Transport
const sequence = new Tone.Pattern((time, note) => {
  //let midiNote= note //degreeToScale( note+21)
  scheduledNotes.forEach(note => {
    let midiNote = Tone.Midi(note).toFrequency()
    synth.triggerAttackRelease(midiNote, .5, time);
    //console.log('trigger', note)

})
scheduledNotes = []

hiHat.triggerAttackRelease('c4', "8n", time); 

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
Tone.Transport.bpm.value = 120; // Set the BPM
Tone.Transport.start();

// sequence.start(0);
let isPlaying = false;

// Add a click event listener to toggle the sequencer
startStopButton.addEventListener('click', () => {
    if (!isPlaying) {
      // Start the sequencer if it's not already playing
      Tone.Transport.start();
      //myseq = setInterval(seq, 250)
      sequence.start(0);
      startStopButton.textContent = 'Stop Sequencer';
      isPlaying = true;
      console.log('start');
    } else {
      // Stop the sequencer if it's already playing
      Tone.Transport.stop();
      sequence.stop();
      synth.releaseAll();
      //clearInterval(myseq)
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

  var keyToNote = {
    'z': { "midi": 60, "pitch": "C" },      // Z
    's': { "midi": 61, "pitch": "C#/Db" },  // S
    'x': { "midi": 62, "pitch": "D" },      // X
    'd': { "midi": 63, "pitch": "D#/Eb" },  // D
    'c': { "midi": 64, "pitch": "E" },      // C
    'v': { "midi": 65, "pitch": "F" },      // V
    'g': { "midi": 66, "pitch": "F#/Gb" },  // G
    'b': { "midi": 67, "pitch": "G" },      // B
    'h': { "midi": 68, "pitch": "G#/Ab" },  // H
    'n': { "midi": 69, "pitch": "A" },      // N
    'j': { "midi": 70, "pitch": "A#/Bb" },  // J
    'm': { "midi": 71, "pitch": "B" },      // M
    ',': { "midi": 72, "pitch": "C" },      // , (or < depending on keyboard)
    'l': { "midi": 73, "pitch": "C#/Db" },  // L
    '.': { "midi": 74, "pitch": "D" },      // . (or > depending on keyboard)
    ';': { "midi": 75, "pitch": "D#/Eb" },  // ; (or : depending on keyboard)
    '/': { "midi": 76, "pitch": "E" }       // / (or ? depending on keyboard)
};
