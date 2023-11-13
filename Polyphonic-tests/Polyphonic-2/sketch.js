export default function sketch ( p, external )  {
  let gridCellSize = 1
  let gridDimensions = {x:16,y:16}

  p.setup = function() {
    let cnv = p.createCanvas(400, 400);
    cnv.parent ('canvas-container')

    p.colorMode(p.HSB, 255);
    p.background(0);

    gridCellSize = p.width / gridDimensions.x;
    
  };

  let newSeq = [0];
  let seqDrawStarted = 0;
  const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];

  p.draw = function() {
    if (p.mouseIsPressed) {
      Tone.start();
    }
  };

  function setColor(amplitude){
    p.background( p.mouseX, p.mouseY, amplitude);
  }

  p.drawColumn = function(index, note, min=36) {
    // Calculate the x-coordinate of the current column
    index = index % gridDimensions.x
    const x = index * gridCellSize;
  
    // Clear the current column by drawing it with the background color
    p.fill(255);
    p.rect(x, 0, gridCellSize, p.height);
  
    // Calculate the y-coordinate based on the note value
    let y = note <min ? 0 : note>=min+16 ? 0 : note-min
    y = 15-y
    // Draw a square at the y position of the current note
    p.fill(0); // Set the fill color for the square
    p.rect(x, y*gridCellSize, gridCellSize, gridCellSize);
    //console.log(y)
  }
};
