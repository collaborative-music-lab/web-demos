export default function sketch ( p, external )  {
  let img;
  let pixelArray = [];
  let gridDimensions = {x:8,y:8}
  

  p.preload = function() {
    //img = p.loadImage('https://picsum.photos/400/400');
    img = p.loadImage('https://picsum.photos/id/237/400/400');
    
  }

  p.setup = function() {
    let cnv = p.createCanvas(400,400);
    cnv.parent ('canvas-container')
    // p.imageMode(p.CENTER);

    img.resize(gridDimensions.x,gridDimensions.y);

    // Extract pixel data from the resized image
    img.loadPixels();
    for (let y = 0; y < img.height; y++) {
      let row = [];
      for (let x = 0; x < img.width; x++) {
        let index = (x + y * img.width) * 4;
        let r = img.pixels[index];
        let g = img.pixels[index + 1];
        let b = img.pixels[index + 2];
        let a = img.pixels[index + 3];
        let pixelColor = p.color(r, g, b, a);
        row.push(pixelColor);
      }
      pixelArray.push(row);
    }

    // Draw the resized image (Optional)
    p.image(img, 0, 0, p.width, p.height);

    // Debugging: Print the 2D pixel array
    console.log(pixelArray);

    external.fillBufferFunction();
  };//setup

  let newSeq = [0];
  let seqDrawStarted = 0;
  const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];

  p.draw = function() {
    if (p.mouseIsPressed) {
      Tone.start();
    }

    // Optional: visualize the 16x16 pixel data
    // for (let x = 0; x < pixelArray.length; x++) {
    //   for (let y = 0; y < pixelArray[x].length; y++) {
    //     p.stroke(pixelArray[x][y]);
    //     p.point(x, y);
    //   }
    // }
  };


  p.getPixel = function(x,y){
    if( x > gridDimensions.x) y = Math.floor(x/gridDimensions.x)
    x = x % gridDimensions.x
    y = y % gridDimensions.y
    
    let c = []
    
    try { c = pixelArray[x][y] }
    catch(e){ console.log(e)}

    let xCell = p.width/gridDimensions.x
    let yCell = p.height/gridDimensions.y

    x = gridDimensions.x - x - 1
    y = gridDimensions.y - y - 1

    x = x * xCell
    y = y * yCell
  

    // Draw a square 
    p.fill(0); // Set the fill color for the square

    p.image(img, 0, 0, p.width, p.height);
    p.rect(x, y, xCell, yCell);

    return [p.red(c), p.green(c), p.blue(c)]
  }


};
