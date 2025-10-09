////////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//    Byggt á sýnisforriti í C fyrir OpenGL, höfundur óþekktur.
//
//     Bíll sem keyrir í hringi í umhverfi með húsum.  Hægt að
//    breyta sjónarhorni áhorfanda með því að slá á 1, 2, ..., 8.
//    Einnig hægt að breyta hæð áhorfanda með upp/niður örvum.
//    Leiðrétt útgáfa fyrir réttan snúning í MV.js
//
//    Hjálmtýr Hafsteinsson, september 2025
////////////////////////////////////////////////////////////////////
var canvas;
var gl;

// position of the track
var TRACK_RADIUS = 100.0;
var TRACK_INNER = 90.0;
var TRACK_OUTER = 110.0;
var TRACK_PTS = 100;

// Postion for the track stripe
var TRACK_MIDDLE_RIGHT = (TRACK_INNER + TRACK_OUTER) / 2 + 2;
var TRACK_MIDDLE_LEFT = (TRACK_INNER + TRACK_OUTER) / 2 - 2;

// Colors for the project
var BLUE = vec4(0.0, 0.0, 1.0, 1.0);
var RED = vec4(1.0, 0.0, 0.0, 1.0);
var GRAY = vec4(0.4, 0.4, 0.4, 1.0);
var YELLOW = vec4(1.0, 1.0, 0.0, 1.0);
var WHITE = vec4(1.0, 1.0, 1.0, 1.0);

// Colors for the bridge
var bridge1 = vec4(0.475, 0.224, 0.137, 1.0); // deep clay red
var bridge2 = vec4(0.545, 0.267, 0.153, 1.0); // warm brick
var bridge3 = vec4(0.616, 0.31, 0.169, 1.0); // burnt sienna
var bridge4 = vec4(0.686, 0.357, 0.188, 1.0); // canyon earth
var bridge5 = vec4(0.765, 0.416, 0.22, 1.0); // copper ochre
var bridge6 = vec4(0.827, 0.475, 0.255, 1.0); // warm sandstone
var bridge7 = vec4(0.882, 0.533, 0.29, 1.0); // desert gold
var bridge8 = vec4(0.941, 0.6, 0.333, 1.0); // sunlit amber

// Colors for the plane
var PLANE_BODY = vec4(0.82, 0.78, 0.70, 1.0);     // light beige fuselage
var PLANE_WINGS = vec4(0.36, 0.54, 0.71, 1.0);    // desaturated blue
var PLANE_TAIL = vec4(0.73, 0.39, 0.23, 1.0);     // warm brick accent
var PLANE_CANOPY = vec4(0.55, 0.73, 0.88, 1.0);   // glassy sky blue

//Colors for the houses
//TALL House
var TALL_HOUSE_BASE = vec4(0.753, 0.824, 0.714, 1.0);
var TALL_HOUSE_ROOF = vec4(0.596, 0.278, 0.161, 1.0);
//House
var HOUSE_BASE = vec4(0.941, 0.706, 0.314, 1.0);
var HOUSE_ROOF = vec4(0.51, 0.235, 0.118, 1.0);
//L House
var LHOUSE_BASE = vec4(0.933, 0.784, 0.588, 1.0);
var LHOUSE_ROOF = vec4(0.486, 0.22, 0.11, 1.0);

//Number of vertices for the project
var numCubeVertices = 36;
var numTrackVertices = 2 * TRACK_PTS + 2;
var numRoofVertices = 18;
var numStripeVertices = 6 * Math.ceil(TRACK_PTS / 2);

// varables for the plane
var planeT = 0.0;
var planeSpeed = 0.01;
var planeA = 120.0; 
var planeHeight = 28.0;

// variables for moving car
var carDirection = 0.0;
var carXPos = 100.0;
var carYPos = 0.0;
var height = 0.0;

//The second car
var car2Angle = 180;
var car2Speed = -0.5;
var car2Radius = TRACK_RADIUS + 6;
var car2X, car2Y;

// current viewpoint
var view = 1;

// variables for mouseLook 
var speed = 1.0;
var userX = -70.0;
var userY = -70.0;

var yaw = 0.0;
var pitch = 0.0;

var colorLoc;
var mvLoc;
var pLoc;
var proj;

var cubeBuffer;
var trackBuffer;
var stripeBuffer;
var roofBuffer;
var vPosition;

// the 36 vertices of the cube
var cVertices = [
  // front side:
  vec3(-0.5, 0.5, 0.5),
  vec3(-0.5, -0.5, 0.5),
  vec3(0.5, -0.5, 0.5),
  vec3(0.5, -0.5, 0.5),
  vec3(0.5, 0.5, 0.5),
  vec3(-0.5, 0.5, 0.5),
  // right side:
  vec3(0.5, 0.5, 0.5),
  vec3(0.5, -0.5, 0.5),
  vec3(0.5, -0.5, -0.5),
  vec3(0.5, -0.5, -0.5),
  vec3(0.5, 0.5, -0.5),
  vec3(0.5, 0.5, 0.5),
  // bottom side:
  vec3(0.5, -0.5, 0.5),
  vec3(-0.5, -0.5, 0.5),
  vec3(-0.5, -0.5, -0.5),
  vec3(-0.5, -0.5, -0.5),
  vec3(0.5, -0.5, -0.5),
  vec3(0.5, -0.5, 0.5),
  // top side:
  vec3(0.5, 0.5, -0.5),
  vec3(-0.5, 0.5, -0.5),
  vec3(-0.5, 0.5, 0.5),
  vec3(-0.5, 0.5, 0.5),
  vec3(0.5, 0.5, 0.5),
  vec3(0.5, 0.5, -0.5),
  // back side:
  vec3(-0.5, -0.5, -0.5),
  vec3(-0.5, 0.5, -0.5),
  vec3(0.5, 0.5, -0.5),
  vec3(0.5, 0.5, -0.5),
  vec3(0.5, -0.5, -0.5),
  vec3(-0.5, -0.5, -0.5),
  // left side:
  vec3(-0.5, 0.5, -0.5),
  vec3(-0.5, -0.5, -0.5),
  vec3(-0.5, -0.5, 0.5),
  vec3(-0.5, -0.5, 0.5),
  vec3(-0.5, 0.5, 0.5),
  vec3(-0.5, 0.5, -0.5),
];

// vertices of the track
var tVertices = [];

var pVertices = [];

//Verts for the roofs

var rVertices = [
  //vinstri
  vec3(-0.5, -0.5, 0),
  vec3(-0.5, 0.5, 0),
  vec3(0.0, 0.5, 1),
  vec3(-0.5, -0.5, 0),
  vec3(0.0, 0.5, 1),
  vec3(0.0, -0.5, 1),
  //Hægri
  vec3(0.0, -0.5, 1),
  vec3(0.0, 0.5, 1),
  vec3(0.5, 0.5, 0),
  vec3(0.0, -0.5, 1),
  vec3(0.5, 0.5, 0),
  vec3(0.5, -0.5, 0),
  //framan
  vec3(-0.5, -0.5, 0),
  vec3(0.5, -0.5, 0),
  vec3(0.0, -0.5, 1),
  //Aftan
  vec3(-0.5, 0.5, 0),
  vec3(0.0, 0.5, 1),
  vec3(0.5, 0.5, 0.0),
];

window.onload = function init() {
  canvas = document.getElementById('gl-canvas');

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.65, 0.7, 0.78, 1.0);

  gl.enable(gl.DEPTH_TEST);

  //
  //  Load shaders and initialize attribute buffers
  //
  var program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);

  createTrack();

  //VBO for the roof
  roofBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, roofBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(rVertices), gl.STATIC_DRAW);

  // VBO for the track
  trackBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, trackBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(tVertices), gl.STATIC_DRAW);

  //VBO for the middle stripe
  stripeBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, stripeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pVertices), gl.STATIC_DRAW);

  // VBO for the cube
  cubeBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(cVertices), gl.STATIC_DRAW);

  vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  colorLoc = gl.getUniformLocation(program, 'fColor');

  mvLoc = gl.getUniformLocation(program, 'modelview');

  // set projection
  pLoc = gl.getUniformLocation(program, 'projection');
  proj = perspective(50.0, 1.0, 1.0, 500.0);
  gl.uniformMatrix4fv(pLoc, false, flatten(proj));

  document.getElementById('Viewpoint').innerHTML = '1: Fjarlægt sjónarhorn';
  document.getElementById('Height').innerHTML = 'Viðbótarhæð: ' + height;

  // Event listener for keyboard
  window.addEventListener('keydown', function (e) {
    switch (e.keyCode) {
        case 48:
            view = 0;
            break;
      case 49: // 1: distant and stationary viewpoint
        view = 1;
        document.getElementById('Viewpoint').innerHTML =
          '1: Fjarlægt sjónarhorn';
        break;
      case 50: // 2: panning camera inside the track
        view = 2;
        document.getElementById('Viewpoint').innerHTML =
          '2: Horfa á bílinn innan úr hringnum';
        break;
      case 51: // 3: panning camera inside the track
        view = 3;
        document.getElementById('Viewpoint').innerHTML =
          '3: Horfa á bílinn fyrir utan hringinn';
        break;
      case 52: // 4: driver's point of view
        view = 4;
        document.getElementById('Viewpoint').innerHTML =
          '4: Sjónarhorn ökumanns';
        break;
      case 53: // 5: drive around while looking at a house
        view = 5;
        document.getElementById('Viewpoint').innerHTML =
          '5: Horfa alltaf á eitt hús innan úr bílnum';
        break;
      case 54: // 6: Above and behind the car
        view = 6;
        document.getElementById('Viewpoint').innerHTML =
          '6: Fyrir aftan og ofan bílinn';
        break;
      case 55: // 7: from another car in front
        view = 7;
        document.getElementById('Viewpoint').innerHTML =
          '7: Horft aftur úr bíl fyrir framan';
        break;
      case 56: // 8: from beside the car
        view = 8;
        document.getElementById('Viewpoint').innerHTML =
          '8: Til hliðar við bílinn';
        break;

      case 38: // up arrow
        height += 2.0;
        document.getElementById('Height').innerHTML = 'Viðbótarhæð: ' + height;
        break;
      case 40: // down arrow
        height -= 2.0;
        document.getElementById('Height').innerHTML = 'Viðbótarhæð: ' + height;
        break;

        //Movement for the mouse look
        case 87: // W 
            userX += Math.cos(yaw) * speed;
            userY += Math.sin(yaw) * speed;
            break;

        case 83: // S
            userX -= Math.cos(yaw) * speed;
            userY -= Math.sin(yaw) * speed;            
            break;
        
        case 65: // A
            userX += -Math.sin(yaw) * speed;
            userY += Math.cos(yaw) * speed;
            break;

        case 68: // D
            userX += Math.sin(yaw) * speed;
            userY += -Math.cos(yaw) * speed;
            break;

    }
  });


  window.addEventListener('mousemove', (e) => {
    if (view !== 0) return;

    yaw   -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;
  
    const maxPitch = 1.55;
    if (pitch >  maxPitch) pitch =  maxPitch;
    if (pitch < -maxPitch) pitch = -maxPitch;
  });
  render();
};

// create the vertices that form the car track
function createTrack() {
  var dTheta = 360.0 / TRACK_PTS;
  var theta = 0.0;
  for (var i = 0; i <= TRACK_PTS; i++) {
    var p1 = vec3(
      TRACK_OUTER * Math.cos(radians(theta)),
      TRACK_OUTER * Math.sin(radians(theta)),
      0.0
    );
    var p2 = vec3(
      TRACK_INNER * Math.cos(radians(theta)),
      TRACK_INNER * Math.sin(radians(theta)),
      0.0
    );
    tVertices.push(p1);
    tVertices.push(p2);
    theta += 360.0 / TRACK_PTS;
  }

  for (var i = 0; i < TRACK_PTS; i++) {
    if (i % 2 !== 0) continue;

    var a0 = i * dTheta;
    var a1 = (i + 1) * dTheta;

    var p3 = vec3(
      TRACK_MIDDLE_LEFT * Math.cos(radians(a0)),
      TRACK_MIDDLE_LEFT * Math.sin(radians(a0)),
      0.01
    );
    var p4 = vec3(
      TRACK_MIDDLE_LEFT * Math.cos(radians(a1)),
      TRACK_MIDDLE_LEFT * Math.sin(radians(a1)),
      0.01
    );
    var p5 = vec3(
      TRACK_MIDDLE_RIGHT * Math.cos(radians(a0)),
      TRACK_MIDDLE_RIGHT * Math.sin(radians(a0)),
      0.01
    );
    var p6 = vec3(
      TRACK_MIDDLE_RIGHT * Math.cos(radians(a1)),
      TRACK_MIDDLE_RIGHT * Math.sin(radians(a1)),
      0.01
    );

    pVertices.push(p5, p3, p6, p6, p3, p4);
  }
}

//Create the bridge
function createBridge(mv) {
  var mv1 = mv;
  //left side blocks
  gl.uniform4fv(colorLoc, bridge1);
  //The original posistion and size of the block
  mv = mult(mv, translate(0, -120, 1));
  mv = mult(mv, scalem(5, 9, 2));

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  gl.uniform4fv(colorLoc, bridge2);
  mv = mult(mv, translate(0, 0.25, 1));
  gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  gl.uniform4fv(colorLoc, bridge3);
  mv = mult(mv, translate(0, 0.25, 1));
  gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  gl.uniform4fv(colorLoc, bridge4);
  mv = mult(mv, translate(0, 0.25, 1));
  gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  gl.uniform4fv(colorLoc, bridge5);
  mv = mult(mv, translate(0, 0.25, 1));
  gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  gl.uniform4fv(colorLoc, bridge6);
  mv = mult(mv, translate(0, 0.25, 1));
  gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  gl.uniform4fv(colorLoc, bridge7);
  mv = mult(mv, translate(0, 0.25, 1));
  gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  gl.uniform4fv(colorLoc, bridge8);
  mv = mult(mv, translate(0, 0.25, 1));
  gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  //Right side blocks

  gl.uniform4fv(colorLoc, bridge1);
  //The original posistion and size of the right block
  mv1 = mult(mv1, translate(0, -80, 1));
  mv1 = mult(mv1, scalem(5, 9, 2));

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(mvLoc, false, flatten(mv1));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  gl.uniform4fv(colorLoc, bridge2);
  mv1 = mult(mv1, translate(0, -0.25, 1));
  gl.uniformMatrix4fv(mvLoc, false, flatten(mv1));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  gl.uniform4fv(colorLoc, bridge3);
  mv1 = mult(mv1, translate(0, -0.25, 1));
  gl.uniformMatrix4fv(mvLoc, false, flatten(mv1));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  gl.uniform4fv(colorLoc, bridge4);
  mv1 = mult(mv1, translate(0, -0.25, 1));
  gl.uniformMatrix4fv(mvLoc, false, flatten(mv1));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  gl.uniform4fv(colorLoc, bridge5);
  mv1 = mult(mv1, translate(0, -0.25, 1));
  gl.uniformMatrix4fv(mvLoc, false, flatten(mv1));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  gl.uniform4fv(colorLoc, bridge6);
  mv1 = mult(mv1, translate(0, -0.25, 1));
  gl.uniformMatrix4fv(mvLoc, false, flatten(mv1));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  gl.uniform4fv(colorLoc, bridge7);
  mv1 = mult(mv1, translate(0, -0.25, 1));
  gl.uniformMatrix4fv(mvLoc, false, flatten(mv1));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  gl.uniform4fv(colorLoc, bridge8);
  mv1 = mult(mv1, translate(0, -0.25, 1));
  gl.uniformMatrix4fv(mvLoc, false, flatten(mv1));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);
}

// draw a house in location (x, y) of size size
function house(x, y, size, mv, color, rColor) {
  var mv1 = mv;
  gl.uniform4fv(colorLoc, color);

  mv = mult(mv, translate(x, y, size / 2));
  mv = mult(mv, scalem(size, size, size));

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  //roofH er stærð á þakinu
  var roofH = 0.4 * size;
  gl.uniform4fv(colorLoc, rColor);

  //Setur þakið aðeins lægra en húsið til að fela opið á mill
  mv1 = mult(mv1, translate(x, y, size - 0.4));
  //Stækkar þakið þannig það liggi út fyrir húsið
  mv1 = mult(mv1, scalem(size + 2, size + 2, roofH));

  gl.bindBuffer(gl.ARRAY_BUFFER, roofBuffer);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(mvLoc, false, flatten(mv1));
  gl.drawArrays(gl.TRIANGLES, 0, numRoofVertices);
}

// draw a house in location (x, y) of size size
function houseTall(x, y, size, floors, mv, color, rColor) {
  var mv1 = mv;
  gl.uniform4fv(colorLoc, color);

  for (var i = 0; i < floors; i++) {
    var mvFloor = mult(mv, translate(x, y, size / 2 + i * size));
    mvFloor = mult(mvFloor, scalem(size, size, size));

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvFloor));
    gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);
  }

  //roofH er stærð á þakinu
  var roofH = 0.4 * size;
  gl.uniform4fv(colorLoc, rColor);

  //Setur þakið aðeins lægra en húsið til að fela opið á mill
  mv1 = mult(mv1, translate(x, y, floors * size - 0.4));
  //Stækkar þakið þannig það liggi út fyrir húsið
  mv1 = mult(mv1, scalem(size + 2, size + 2, roofH));

  gl.bindBuffer(gl.ARRAY_BUFFER, roofBuffer);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(mvLoc, false, flatten(mv1));
  gl.drawArrays(gl.TRIANGLES, 0, numRoofVertices);
}

// draw a L shaped house in location (x, y) of size size
function houseL(x, y, size, wing, mv, color, rColor) {
  var mv1 = mv;
  var mvL = mv;
  gl.uniform4fv(colorLoc, color);

  //Main house
  mv = mult(mv, translate(x, y, size / 2));
  mv = mult(mv, scalem(size, size, size));

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  //L part
  var w = wing * size;
  mvW = mult(mvL, translate(x, y + (size + w) / 2, w / 2));
  mvW = mult(mvW, scalem(size, w, w));

  gl.uniformMatrix4fv(mvLoc, false, flatten(mvW));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  //roofH er stærð á þakinu
  var roofH = 0.4 * size;
  gl.uniform4fv(colorLoc, rColor);

  //Roof for the main house
  var roofMain = mult(mv1, translate(x, y, size - 0.4));
  roofMain = mult(roofMain, scalem(size + 2, size + 2, roofH));

  gl.bindBuffer(gl.ARRAY_BUFFER, roofBuffer);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(mvLoc, false, flatten(roofMain));
  gl.drawArrays(gl.TRIANGLES, 0, numRoofVertices);

  //Roof for the L
  var roofL = mult(mv1, translate(x, y + (size + w) / 2, w - 0.4));
  roofL = mult(roofL, scalem(size + 2, w + 2, w * 0.4));
  gl.uniformMatrix4fv(mvLoc, false, flatten(roofL));
  gl.drawArrays(gl.TRIANGLES, 0, numRoofVertices);
}

// draw the circular track and a few houses (i.e. red cubes)
function drawScenery(mv) {
  // draw track
  gl.uniform4fv(colorLoc, GRAY);
  gl.bindBuffer(gl.ARRAY_BUFFER, trackBuffer);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, numTrackVertices);

  //draw track stripe
  gl.uniform4fv(colorLoc, WHITE);
  gl.bindBuffer(gl.ARRAY_BUFFER, stripeBuffer);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
  gl.drawArrays(gl.TRIANGLES, 0, numStripeVertices);

  //draw bridge
  createBridge(mv);

  //draw the plane
  var mvPlane = planeMovement(mv);
  drawPlane(mvPlane);

  // draw houses
  house(-20.0, 50.0, 5.0, mv, HOUSE_BASE, HOUSE_ROOF);
  house(0.0, 70.0, 10.0, mv, HOUSE_BASE, HOUSE_ROOF);
  house(20.0, -10.0, 8.0, mv, HOUSE_BASE, HOUSE_ROOF);
  house(40.0, 120.0, 10.0, mv, HOUSE_BASE, HOUSE_ROOF);
  house(-30.0, -50.0, 7.0, mv, HOUSE_BASE, HOUSE_ROOF);
  house(10.0, -60.0, 10.0, mv, HOUSE_BASE, HOUSE_ROOF);
  house(-20.0, 75.0, 8.0, mv, HOUSE_BASE, HOUSE_ROOF);
  house(-40.0, 140.0, 10.0, mv, HOUSE_BASE, HOUSE_ROOF);

  //Tall houses
  houseTall(-110, -115, 10, 3, mv, TALL_HOUSE_BASE, TALL_HOUSE_ROOF);
  houseTall(10, 10, 12, 2, mv, TALL_HOUSE_BASE, TALL_HOUSE_ROOF);
  houseTall(-50, 50, 9, 2, mv, TALL_HOUSE_BASE, TALL_HOUSE_ROOF);

  //L house
  houseL(-120, 120, 10, 2, mv, LHOUSE_BASE, LHOUSE_ROOF);
  houseL(130, -50, 10, 2, mv, LHOUSE_BASE, LHOUSE_ROOF);
  houseL(-120, 120, 10, 2, mv, LHOUSE_BASE, LHOUSE_ROOF);
}

// draw car and set the color
function drawCar(mv, color) {
  // set color to blue
  gl.uniform4fv(colorLoc, color);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

  var mv1 = mv;
  // lower body of the car
  mv = mult(mv, scalem(10.0, 3.0, 2.0));
  mv = mult(mv, translate(0.0, 0.0, 0.5));

  gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  // upper part of the car
  mv1 = mult(mv1, scalem(4.0, 3.0, 2.0));
  mv1 = mult(mv1, translate(-0.2, 0.0, 1.5));

  gl.uniformMatrix4fv(mvLoc, false, flatten(mv1));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);
}

//draw a plane
function drawPlane(mv) {
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

  // Fuselage
  gl.uniform4fv(colorLoc, PLANE_BODY);
  var body = mult(mv, scalem(18.0, 3.2, 3.0));
  body = mult(body, translate(0.0, 0.0, 0.5));
  gl.uniformMatrix4fv(mvLoc, false, flatten(body));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  // Wings
  gl.uniform4fv(colorLoc, PLANE_WINGS);
  var wings = mult(mv, scalem(3.0, 36.0, 1.0));
  wings = mult(wings, translate(0.0, 0.0, 0.5));
  gl.uniformMatrix4fv(mvLoc, false, flatten(wings));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  // Horizontal tailplane
  gl.uniform4fv(colorLoc, PLANE_TAIL);
  var tailH = mult(mv, translate(-7.5, 0.0, 0.6));
  tailH = mult(tailH, scalem(2.4, 10.0, 0.8));
  gl.uniformMatrix4fv(mvLoc, false, flatten(tailH));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  // Vertical tail
  var tailV = mult(mv, translate(-7.5, 0.0, 1.6));
  tailV = mult(tailV, scalem(2.0, 0.8, 3.2));
  gl.uniformMatrix4fv(mvLoc, false, flatten(tailV));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  // Canopy (a little blue bubble)
  gl.uniform4fv(colorLoc, PLANE_CANOPY);
  var canopy = mult(mv, translate(3.0, 0.0, 1.8));
  canopy = mult(canopy, scalem(4.0, 3.0, 1.5));
  gl.uniformMatrix4fv(mvLoc, false, flatten(canopy));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);
}

function planeMovement(mv) {
  
  planeT += planeSpeed;
  
  var x = planeA * Math.sin(planeT);
  var y = planeA * Math.sin(planeT) * Math.cos(planeT);

  var dx = Math.cos(planeT);
  var dy = Math.cos(2.0 * planeT);
  var headingDeg = Math.atan2(dy, dx) * 180.0 / Math.PI;

  var mvPlane = mult(mv, translate(x, y, planeHeight));
  mvPlane = mult(mvPlane, rotateZ(headingDeg));
  return mvPlane;
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var mv1, mv2;

  //Main car
  carDirection += 0.5;
  if (carDirection > 360.0) carDirection = 0.0;
  carXPos = (TRACK_RADIUS - 6) * Math.sin(radians(carDirection));
  carYPos = (TRACK_RADIUS - 6) * Math.cos(radians(carDirection));
  //Second car
  car2Angle += car2Speed;
  if (car2Angle < 1) car2Angle = 360;
  car2X = car2Radius * Math.sin(radians(car2Angle));
  car2Y = car2Radius * Math.cos(radians(car2Angle));

  var mv = mat4();
  switch (view) {
    case 0:
      var eye =vec3(userX, userY, 5);
      var dir = vec3(
        Math.cos(yaw)*Math.cos(pitch),
        Math.sin(yaw) * Math.cos(pitch),
        Math.sin(pitch)
      );
        mv = lookAt(eye, add(eye, dir),vec3(0.0, 0.0, 1.0));

        drawScenery(mv);
        mv1 = mult(mv, translate(carXPos, carYPos, 0.0));
        mv1 = mult(mv1, rotateZ(-carDirection));
        drawCar(mv1, YELLOW);
        mv2 = mult(mv, translate(car2X, car2Y, 0));
        mv2 = mult(mv2, rotateZ(-car2Angle));
        drawCar(mv2, RED);
        break;
    case 1:
      // Distant and stationary viewpoint
      mv = lookAt(
        vec3(300.0, 0.0, 100.0 + height),
        vec3(0.0, 0.0, 0.0),
        vec3(0.0, 0.0, 1.0)
      );
      drawScenery(mv);
      mv1 = mult(mv, translate(carXPos, carYPos, 0.0));
      mv1 = mult(mv1, rotateZ(-carDirection));
      drawCar(mv1, YELLOW);
      mv2 = mult(mv, translate(car2X, car2Y, 0));
      mv2 = mult(mv2, rotateZ(-car2Angle));
      drawCar(mv2, RED);
      break;
    case 2:
      // Static viewpoint inside the track; camera follows car
      mv = lookAt(
        vec3(75.0, 0.0, 5.0 + height),
        vec3(carXPos, carYPos, 0.0),
        vec3(0.0, 0.0, 1.0)
      );
      drawScenery(mv);
      mv1 = mult(mv, translate(carXPos, carYPos, 0.0));
      mv1 = mult(mv1, rotateZ(-carDirection));
      drawCar(mv1, YELLOW);
      mv2 = mult(mv, translate(car2X, car2Y, 0));
      mv2 = mult(mv2, rotateZ(-car2Angle));
      drawCar(mv2, RED);
      break;
    case 3:
      // Static viewpoint outside the track; camera follows car
      mv = lookAt(
        vec3(125.0, 0.0, 5.0 + height),
        vec3(carXPos, carYPos, 0.0),
        vec3(0.0, 0.0, 1.0)
      );
      drawScenery(mv);
      mv1 = mult(mv, translate(carXPos, carYPos, 0.0));
      mv1 = mult(mv1, rotateZ(-carDirection));
      drawCar(mv1, YELLOW);
      mv2 = mult(mv, translate(car2X, car2Y, 0));
      mv2 = mult(mv2, rotateZ(-car2Angle));
      drawCar(mv2, RED);
      break;
    case 4:
      // Driver's point of view.
      mv = lookAt(
        vec3(-3.0, 0.0, 5.0 + height),
        vec3(12.0, 0.0, 2.0 + height),
        vec3(0.0, 0.0, 1.0)
      );
      drawCar(mv, YELLOW);
      mv = mult(mv, rotateZ(carDirection));
      mv = mult(mv, translate(-carXPos, -carYPos, 0.0));
      drawScenery(mv);
      mv2 = mult(mv, translate(car2X, car2Y, 0));
      mv2 = mult(mv2, rotateZ(-car2Angle));
      drawCar(mv2, RED);
      break;
    case 5:
      // Drive around while looking at a house at (40, 120)
      mv = rotateY(-carDirection);
      mv = mult(
        mv,
        lookAt(
          vec3(3.0, 0.0, 5.0 + height),
          vec3(40.0 - carXPos, 120.0 - carYPos, 0.0),
          vec3(0.0, 0.0, 1.0)
        )
      );
      drawCar(mv, YELLOW);
      mv = mult(mv, rotateZ(carDirection));
      mv = mult(mv, translate(-carXPos, -carYPos, 0.0));
      drawScenery(mv);
      mv2 = mult(mv, translate(car2X, car2Y, 0));
      mv2 = mult(mv2, rotateZ(-car2Angle));
      drawCar(mv2, RED);
      break;
    case 6:
      // Behind and above the car
      mv = lookAt(
        vec3(-12.0, 0.0, 6.0 + height),
        vec3(15.0, 0.0, 4.0),
        vec3(0.0, 0.0, 1.0)
      );
      drawCar(mv, YELLOW);
      mv = mult(mv, rotateZ(carDirection));
      mv = mult(mv, translate(-carXPos, -carYPos, 0.0));
      drawScenery(mv);
      mv2 = mult(mv, translate(car2X, car2Y, 0));
      mv2 = mult(mv2, rotateZ(-car2Angle));
      drawCar(mv2, RED);
      break;
    case 7:
      // View backwards looking from another car
      mv = lookAt(
        vec3(25.0, 5.0, 5.0 + height),
        vec3(0.0, 0.0, 2.0),
        vec3(0.0, 0.0, 1.0)
      );
      drawCar(mv, YELLOW);
      mv = mult(mv, rotateZ(carDirection));
      mv = mult(mv, translate(-carXPos, -carYPos, 0.0));
      drawScenery(mv);
      mv2 = mult(mv, translate(car2X, car2Y, 0));
      mv2 = mult(mv2, rotateZ(-car2Angle));
      drawCar(mv2, RED);
      break;
    case 8:
      // View from beside the car
      mv = lookAt(
        vec3(2.0, 20.0, 5.0 + height),
        vec3(2.0, 0.0, 2.0),
        vec3(0.0, 0.0, 1.0)
      );
      drawCar(mv, YELLOW);
      mv = mult(mv, rotateZ(carDirection));
      mv = mult(mv, translate(-carXPos, -carYPos, 0.0));
      drawScenery(mv);
      mv2 = mult(mv, translate(car2X, car2Y, 0));
      mv2 = mult(mv2, rotateZ(-car2Angle));
      drawCar(mv2, RED);
      break;
  }

  requestAnimFrame(render);
}
