import * as jab from "./jablo.js";

const bodies = [];
// // Body 1
// bodies.push({
//   element: jab.add("div", ".body"),
//   x: -200,
//   y: 0,
//   velx: 0,
//   vely: 0.55,
//   mass: 50000,
//   radius: 50,
//   color: "yellow",
//   name: "Body 1"
// });
// // Body 2
// bodies.push({
//   element: jab.add("div", ".body"),
//   x: 200,
//   y: 0,
//   velx: 0,
//   vely: -0.55,
//   mass: 50000,
//   radius: 50,
//   color: "cyan",
//   name: "Body 2"
// });
// // Body 3
// bodies.push({
//   element: jab.add("div", ".body"),
//   x: 0,
//   y: 0,
//   velx: 0,
//   vely: 0,
//   mass: 50000,
//   radius: 50,
//   color: "red",
//   name: "Body 3"
// });

// The sun
bodies.push({
  element: jab.add("div", ".body"),
  x: 0,
  y: 0,
  velx: 0,
  vely: 0,
  mass: 30000,
  radius: 70,
  color: "yellow",
  name: "Sun"
});
// The earth
bodies.push({
  element: jab.add("div", ".body"),
  x: -2500,
  y: 0,
  velx: 0,
  vely: -0.112249,
  mass: 1500,
  radius: 15,
  color: "cyan",
  name: "Earth"
});
// The moon
bodies.push({
  element: jab.add("div", ".body"),
  x: -2800,
  y: 0,
  velx: 0,
  vely: -0.112249 + 0.079582,
  mass: 400,
  radius: 5,
  color: "gray",
  name: "Moon"
});
// The station
bodies.push({
  element: jab.add("div", ".body"),
  x: -2550,
  y: 0,
  velx: 0,
  vely: -0.112249 + 0.173781,
  mass: 10,
  radius: 3,
  color: "red",
  name: "S-7/A"
});
// The rocket
bodies.push({
  element: jab.add("div", ".body"),
  x: -2785,
  y: 0,
  velx: 0,
  vely: -0.112249 + 0.079582 - 0.16391,
  mass: 3,
  radius: 3,
  color: "red",
  name: "E-7/A"
});

// Sim settings
let stepsPerMS = 1;
const interval = 16;
let displayCoords = true;
const cam = { x: 0, y: 0, scale: 1, follow: bodies[1], speed: 10, zoom: function (scale) {
  scale = Math.max(Math.min(scale, 10), 0.01);
  cam.x *= cam.scale / scale;
  cam.y *= cam.scale / scale;
  cam.scale = scale;
}}
cam.x -= 0.5 * window.innerWidth / cam.scale; cam.y -= 0.5 * window.innerHeight / cam.scale;

// Laws of physics
const G = 0.001;
const linear = false;

// Elements
const textboxes = [jab.add("p", ".cc")];
for (let i = 0; i < bodies.length; i++) {
  textboxes.push(jab.add("p", ".c"));
  textboxes[i + 1].onclick = function() {
    cam.x = bodies[i].x - (cam.follow == null ? 0 : cam.follow.x) - 0.5 * window.innerWidth / cam.scale;
    cam.y = bodies[i].y - (cam.follow == null ? 0 : cam.follow.y) - 0.5 * window.innerHeight / cam.scale;
  }
  bodies[i].element.onclick = function() {
    cam.x = cam.x + (cam.follow == null ? 0 : cam.follow.x) - (cam.follow == bodies[i] ? 0 : bodies[i].x);
    cam.y = cam.y + (cam.follow == null ? 0 : cam.follow.y) - (cam.follow == bodies[i] ? 0 : bodies[i].y);
    
    cam.follow = cam.follow == bodies[i] ? null : bodies[i];
  }
}

function distance(x1, y1, x2, y2) {
  return pythag(x2 - x1, y2 - y1);
}

function pythag(a, b) {
  return Math.sqrt(a * a + b * b);
}

function normalize(vec) {
  let length = pythag(vec.x, vec.y);
  return {
    x: vec.x / length,
    y: vec.y / length
  }
}

document.body.onkeydown = function(e) {
  if (e.keyCode == 87) cam.y -= cam.speed / cam.scale; // W
  if (e.keyCode == 65) cam.x -= cam.speed / cam.scale; // A
  if (e.keyCode == 83) cam.y += cam.speed / cam.scale; // S
  if (e.keyCode == 68) cam.x += cam.speed / cam.scale; // D
  if (e.keyCode == 81) cam.zoom(cam.scale / 1.02) // Q
  if (e.keyCode == 69) cam.zoom(cam.scale * 1.02) // E
  if (e.keyCode == 67) displayCoords = !displayCoords; // C
  if (e.keyCode == 90) { // Z
    if (stepsPerMS >= 2) stepsPerMS -= 1;
    else if (stepsPerMS >= 0.2) stepsPerMS -= 0.1;
    else if (stepsPerMS >= 0.02) stepsPerMS -= 0.01;
  }
  if (e.keyCode == 88) { // X
    if (stepsPerMS >= 1 && stepsPerMS <= 9) stepsPerMS += 1;
    else if (stepsPerMS >= 0.1 && stepsPerMS <= 9) stepsPerMS += 0.1;
    else if (stepsPerMS >= 0.01 && stepsPerMS <= 9) stepsPerMS += 0.01;
  }
}

setInterval(function() {
  let following = cam.follow == null ?  "space" : cam.follow.name;
  textboxes[0].innerText = 
    `Camera: (${Math.round(cam.x)}, ${Math.round(-cam.y)}) - relative to ${following}
    Speed: ${Math.round(stepsPerMS * 100) / 100}
    Zoom: ${Math.round(cam.scale * 100)}%`;
  
  // COMMENCE OPERATION GRAVITY
  for (let step = 0; step < stepsPerMS * interval; step++) {
    for (let b1 = 0; b1 < bodies.length; b1++) {
      for (let b2 = b1 + 1; b2 < bodies.length; b2++) {
        let vec = { x: bodies[b2].x - bodies[b1].x, y: bodies[b2].y - bodies[b1].y }
        vec = normalize(vec);
        
        let a1 = G * bodies[b2].mass / distance(bodies[b1].x, bodies[b1].y, bodies[b2].x, bodies[b2].y) ** (linear ? 1 : 2);
        let a2 = G * bodies[b1].mass / distance(bodies[b1].x, bodies[b1].y, bodies[b2].x, bodies[b2].y) ** (linear ? 1 : 2);
        
        bodies[b1].velx += vec.x * a1;
        bodies[b1].vely += vec.y * a1;
        
        bodies[b2].velx -= vec.x * a2;
        bodies[b2].vely -= vec.y * a2;
      }
    }
    
    for (let i = 0; i < bodies.length; i++) {
      const nextX = bodies[i].x + bodies[i].velx;
      const nextY = bodies[i].y + bodies[i].vely;
      
      bodies[i].x = nextX;
      bodies[i].y = nextY;
      
      let relativeX = bodies[i].x - (cam.follow == null ? 0 : cam.follow.x);
      let relativeY = bodies[i].y - (cam.follow == null ? 0 : cam.follow.y);
    
      bodies[i].element.style.setProperty("--x", `${(relativeX - cam.x) * cam.scale}px`);
      bodies[i].element.style.setProperty("--y", `${(relativeY - cam.y) * cam.scale}px`);
      bodies[i].element.style.setProperty("--radius", `${bodies[i].radius * cam.scale}px`);
      bodies[i].element.style.setProperty("--color", bodies[i].color);
      
      if (step == 0 && displayCoords) {
        textboxes[i + 1].innerText = `${bodies[i].name}: (${Math.round(relativeX)}, ${Math.round(-relativeY)}) - relative to ${following}`;
      }   
    }
  }
  if (!displayCoords) for (let i = 0; i <= bodies.length; i++) textboxes[i].innerText = "";
}, interval);
