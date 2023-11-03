import sketch from './sketch.js';
import { monosynth, SimpleSynth } from './synthDef.js'; // Import monosynth module

let output = new Tone.Multiply(0.1).toDestination()
//let synth = new Tone.PolySynth(SimpleSynth)
// let synth = new monosynth();

let synth = []

for(let i=0;i<8;i++) {
  synth.push( new Tone.MonoSynth())
  synth[i].connect(output )
  console.log(synth)
}

//console.log(SimpleSynth)

// synth.set({'envelope':{'release': 5}})
// synth.set({'envelope':{'decay': 5}})
// synth.set({'envelope':{'attack': .05}})

//monosynth.connect( output )

// Define a sequence of notes
const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
let sequenceIndex = 0

console.log(synth)

// Create a looped sequence with Tone.Transport
const sequence = new Tone.Pattern((time, note) => {
  let midiNote= note //degreeToScale( note+21)
  console.log(sequenceIndex)
  
  synth[sequenceIndex].triggerAttackRelease(Tone.Midi(midiNote).toFrequency(), .05, time);

  sequenceIndex = (sequenceIndex+1) % 8

}, notes);

// Create a looped sequence with Tone.Transport
// const sequence = new Tone.Pattern((time, note) => {
//   let midiNote= note //degreeToScale( note+21)
//   console.log(midiNote)

//   monosynth.triggerAttackRelease(Tone.Midi(midiNote).toFrequency(), .05, time);

//   sequenceIndex += 1

// }, notes);

// const seq = function(){
//   //let midiNote= Tone.Frequency(notes[sequenceIndex]).toMidi()
//   let midiNote= notes[sequenceIndex]
//     synth.triggerAttackRelease(midiNote, .1);

//     sequenceIndex = (sequenceIndex+1) % notes.length
// }
// let myseq 

// myseq = setInterval(seq, 250)
// clearInterval( myseq)

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
      //myseq = setInterval(seq, 250)
      sequence.start(0);
      startStopButton.textContent = 'Stop Sequencer';
      isPlaying = true;
      console.log('start');
    } else {
      // Stop the sequencer if it's already playing
      Tone.Transport.stop();
      sequence.stop();
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