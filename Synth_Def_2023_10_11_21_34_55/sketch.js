// Define a sequence of notes
const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];

// Create a looped sequence with Tone.Transport
const sequence = new Tone.Pattern((time, note) => {
    synth.triggerAttackRelease(note, '8n', time);
}, notes);

sequence.interval = '16n'

function setup() {
  createCanvas(400, 400);
  colorMode(HSB, 255);
  background( 0 );
  
  Tone.Transport.start();
  sequence.start(0);
}//setup

let audioStarted = 0
let newSeq = []
let seqDrawStarted = 0


function draw() {
  if (mouseIsPressed) {
    if(!audioStarted) Tone.start();
    
    if( seqDrawStarted == 0){
      seqDrawStarted = 1;
      newSeq = [];
    }
    let index = Math.floor( map(mouseX,0,width,0,7));
    newSeq.push( notes[index]);
    
    //setColor(amplitude);
  
  }
  else {
    if( seqDrawStarted == 1){
      seqDrawStarted = 0;
      console.log(sequence.values)
      sequence.values = newSeq;
      console.log(newSeq)
      newSeq = []
    }
  }
}//draw

function setColor(amplitude){
  background( mouseX, mouseY, amplitude)
}//setColor

