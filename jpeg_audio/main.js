import sketch from './sketch.js';
/****************** Setup p5 *******************/
let p //name of p5 instance

const externalObjects = {
    //sequence: sequence
    fillBufferFunction: fillBuffer
};

function initializeP5(external) {
    p = new p5((p) => sketch(p, external), 'canvas-container');
  }

initializeP5(externalObjects);

/****************** Audio *******************/

// Initialize the buffer size
const dimensions = {x:32, y:32}
const bufferSize = dimensions.x*dimensions.y;

// Create a native AudioBuffer of the desired length
const nativeBuffer = Tone.context.createBuffer(1, bufferSize, Tone.context.sampleRate);

// Wrap the native AudioBuffer with ToneAudioBuffer
const buffer = new Tone.ToneAudioBuffer(nativeBuffer);

// Get the channel data from the buffer
let channelData = buffer.getChannelData(0);

//create audio objects
let player = new Tone.Player()
let output = new Tone.Multiply(0.1).toDestination()
player.connect( output )

//fillBuffer()

player.loop = true

function fillBuffer(){

  for (let i = 0; i < dimensions.y; i++) {
    for (let j = 0; j < dimensions.x; j++) {
        let val = p.getPixel(i,j)[0] //get the red value from all of our pixels
        // Map the red value (0-255) to a suitable audio range. Here we map to (-1, 1).
        let sampleValue = map(val, 0, 255, -1, 1);
        channelData[i*16+j] = sampleValue
        //buffer.set(i*16 + j, sampleValue);
    }
  }
  console.log('buf', channelData.slice(0,100)); // logs the first 100 samples
  player.buffer = buffer
}




// Define a sequence of notes
const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
let sequenceIndex = 0

// Create a looped sequence with Tone.Transport
const sequence = new Tone.Pattern((time, note) => {
  //fillBuffer()

    let pixels = p.getPixel(sequenceIndex,0 )
    note = pixels[0] + pixels[1] + pixels[2]
    note = note/3
    note = Math.floor( note / 16 )

    let midiNote= degreeToScale( note+21)
    console.log(midiNote, midiToPlaybackRate( midiNote ))

    player.playbackRate = midiToPlaybackRate( midiNote )
    // player.stop()
    // player.start()

    sequenceIndex += 1

    //let channelData = audioBuffer.getChannelData(0);
    console.log(buffer.get()); // logs the first 100 samples

}, notes);

sequence.interval = '8n';

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
      player.start()
    } else {
      // Stop the sequencer if it's already playing
      Tone.Transport.stop();
      sequence.stop();
      startStopButton.textContent = 'Start Sequencer';
      isPlaying = false;
      console.log('stop');
      player.stop()
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


function degreeToScale(val, scale = [0,2,4,5,7,9,11]){
  if(val < 0) val = 0
  let octave = Math.floor(val/ scale.length)
  let index = Math.floor(val) % scale.length
  // console.log(val, index, octave, scale.length)
  return scale[index] + octave*12
}//degree to scale

function midiToPlaybackRate( targetMidi, originalMidi = 60) {
  let differenceInMIDINotes = targetMidi - originalMidi;
  let playbackRate = Math.pow(2, differenceInMIDINotes / 12);
  return playbackRate;
} //midi to playback rate

function map(value, start1, stop1, start2, stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}