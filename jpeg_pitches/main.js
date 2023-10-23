import sketch from './sketch.js';
import { monosynth, kick, hihat } from './synthDef.js'; // Import monosynth module

let output = new Tone.Multiply(0.1).toDestination()
monosynth.connect( output )

// Define a sequence of notes
const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
let sequenceIndex = 0

// Create a looped sequence with Tone.Transport
const sequence = new Tone.Pattern((time, note) => {
    let pixels = p.getPixel(sequenceIndex,0 )
    note = pixels[0] + pixels[1] + pixels[2]
    note = note/3
    note = Math.floor( note / 16 )

    let midiNote= degreeToScale( note+21)
    console.log(midiNote)

    monosynth.triggerAttackRelease(Tone.Midi(midiNote).toFrequency(), .05, time);

    

    // if(midiNote < 65){
    //     kick.start();
    // }

    // if(midiNote > 65){
    //     hihat.triggerAttackRelease(.05, time, (midiNote-60)/12);
    // }

    //monitor note
    //console.log( note)
    sequenceIndex += 1

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


/********Accessing NOAA data **************/
const stationId = "9410170";  // Replace with the desired station's ID
let tideValues = [] //placeholder for received data

// Get the current date and time
const currentDate = new Date();
const oneYearAgo = new Date(currentDate);
oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

// Format the date range in YYYYMMDD format
const beginDate = formatDate(oneYearAgo);
const endDate = formatDate(currentDate);

// Define a function to format a date in the required format (YYYYMMDD)
function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
}

// Construct the API endpoint URL with the date range
const apiUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${beginDate}&end_date=${endDate}&station=${stationId}&product=predictions&datum=MLLW&time_zone=lst_ldt&units=english&interval=hilo&format=json`;

// Use the fetch function to access the API and retrieve tide predictions
fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    tideValues = data.predictions.map(prediction => prediction.v);
    //saveTextAsFile('data.txt', tideValues);
    console.log("data received")

    sequence.values = dataToQuantizedPitch(tideValues)
  })
  .catch(error => {
    console.error("Error fetching tide data:", error);
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
}