var pos = [0, 0];
var oPos = [];
var s = 1;
let picWith = 512;
var m = picWith * s;
var cols;
var rows;

let img = {};
var data = {}
async function preload() {
  let files = await (await fetch("data/index.json")).json()
  for (i in files) {
    let file = files[i]
    img[file] = loadImage('data/' + file + '.png');
  }

}

async function updateData() {
  fetch("api/map")
    .then(res => res.json())
    .then(out => {
      data["map"] = out;
      const lines = [];
      for (var aName in out) {
        const a = out[aName];
        for (var bName in a["connected"]) {
          const filtered = lines.filter(a => a[0] == aName && a[1] == bName)
          if (filtered == 0)
            lines.push([bName, aName])
        }
      }
      data["lines"] = lines
    })
    .catch(err => console.log(err));

  fetch("api/drones")
  .then(res => res.json())
  .then(out => {
    data["drones"] = out;
  })
  .catch(err => console.log(err));
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  oPos = [mouseX, mouseY]
  m = picWith * s;
  cols = windowWidth / m;
  rows = windowHeight / m;

  setInterval(updateData, 1000);
}

function draw() {
  var cPos = [mouseX, mouseY]
  if (mouseIsPressed) {
    pos[0] += (oPos[0] - cPos[0]) / s
    pos[1] += (oPos[1] - cPos[1]) / s
  }
  oPos = cPos;
  background(220);
  picX = Math.floor(pos[0] / 512)
  picY = Math.floor(pos[1] / 512)
  var vPos = [(-pos[0] + picX * picWith) * s, (-pos[1] + picY * picWith) * s]

  for (let row = 0; row < rows + 2; row++) {
    for (let col = 0; col < cols + 2; col++) {
      let fileName = (picX + col) + "," + (picY + row)
      if (fileName in img) {
        image(img[fileName], m * col + vPos[0], m * row + vPos[1], 512 * s, 512 * s);
      }
    }
  }

  strokeWeight(1);
  stroke(0)

  var mPosX = floor(pos[0] + cPos[0] / s);
  var mPosY = floor(pos[1] + cPos[1] / s);
  fill(0, 0, 0, 80);
  rect(10, 8, 120, 30);
  textSize(16);
  fill(255, 255, 255);
  text("x: " + mPosX + " y: " + mPosY, 15, 30);

  stroke(200, 0, 0)

  // Draw map data
  strokeWeight(1 * s);
  for (var i in data.lines) {
    const a = data.map[data.lines[i][0]];
    const b = data.map[data.lines[i][1]];
    const a_ = convertPos(a.x, a.z)
    const b_ = convertPos(b.x, b.z)
    line(a_[0], a_[1], b_[0], b_[1])
  }
  
  textSize(3 * s);
  for (var uuid in data.map) {
    const v = data.map[uuid]
    const p = convertPos(v.x, v.z)
    strokeWeight(5 * s);
    point(p[0], p[1])
    strokeWeight(1);
    text(uuid, p[0], p[1])
  }

  stroke(100, 255, 100)
  textSize(6 * s);
  for (var uuid in data.drones) {
    const drone = data.drones[uuid]
    const p = convertPos(drone.lastLocation.x, drone.lastLocation.z)
    strokeWeight(10 * s);
    point(p[0], p[1])
    strokeWeight(1);
    text(uuid, p[0], p[1])
  }

  
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mouseWheel(event) {
  var scale = s;
  if (event.delta > 0)
    scale *= .95;
  else 
    scale *= 1.05;
  if (scale > 5) scale = 5;
  if (scale < 0.1) scale = 0.1;
  s = scale
  m = picWith * scale;
  cols = windowWidth / m
  rows = windowHeight / m
}

function convertPos(x_, y_) {
  return [(x_ - pos[0]) * s, (y_ - pos[1]) * s]
}