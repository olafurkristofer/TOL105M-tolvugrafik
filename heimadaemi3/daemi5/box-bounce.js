/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Ferningur skoppar um gluggann.  Notandi getur breytt
//     hraðanum með upp/niður örvum.
//
//    Hjálmtýr Hafsteinsson, september 2025
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

// Núverandi staðsetning miðju ferningsins
var box = vec2( 0.0, 0.0 );

// Núverandi staðsetning spada
var spadiPos = vec2( 0.0, 0.0 );

// Stefna (og hraði) fernings
var dX;
var dY;

// breyta spada
var xmove = 0.0;
// Svæðið er frá -maxX til maxX og -maxY til maxY
var maxX = 1.0;
var maxY = 1.0;

// Hálf breidd/hæð ferningsins
var boxRad = 0.05;

// Ferningurinn er upphaflega í miðjunni
var boxVerts = new Float32Array([-0.05, -0.05, 0.05, -0.05, 0.05, 0.05, -0.05, 0.05]);

var spadiBreidd = 0.1;
var locBox, locSpadi, locWhich;
var boxBuffer, spadiBuffer;
var vPosition;


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    
    // Gefa ferningnum slembistefnu í upphafi
    dX = Math.random()*0.1-0.05;
    dY = Math.random()*0.1-0.05;

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Setja inn spaðann
    var spadiVerts = [
        vec2( -0.1, -0.9 ),
        vec2( -0.1, -0.86 ),
        vec2(  0.1, -0.86 ),
        vec2(  0.1, -0.9 ) 
    ];

    // Load the data into the GPU
    boxBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER,boxBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, boxVerts, gl.DYNAMIC_DRAW);

    //load spadi
    spadiBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, spadiBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(spadiVerts), gl.DYNAMIC_DRAW);

    // Associate out shader variables with our data buffer
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( vPosition );

    locBox = gl.getUniformLocation( program, "boxPos" );
    locSpadi = gl.getUniformLocation( program, "spadiPos" );
    locWhich = gl.getUniformLocation( program, "which" );
    // Meðhöndlun örvalykla
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
            case 38:	// upp ör
                dX *= 1.1;
                dY *= 1.1;
                break;
            case 40:	// niður ör
                dX /= 1.1;
                dY /= 1.1;
                break;
            case 37:    // Vinstri ör
                xmove = -0.04;
                break;
            case 39:    //Hægri ör
                xmove = 0.04;
                break;
            default:
                return;
        }
    } );

    render();
}


function render() {
    
    // Láta ferninginn skoppa af veggjunum
    if (Math.abs(box[0] + dX) > maxX - boxRad) dX = -dX;
    if (Math.abs(box[1] + dY) > maxY - boxRad) dY = -dY;

    // Uppfæra staðsetningu
    box[0] += dX;
    box[1] += dY;

    spadiPos[0] += xmove;
    xmove = 0.0;
    var left  = -maxX + spadiBreidd;
    var right =  maxX - spadiBreidd;
    if (spadiPos[0] < left)  spadiPos[0] = left;
    if (spadiPos[0] > right) spadiPos[0] = right;

    if (dY < 0 && box[1] - boxRad <= -0.86 && box[0] >= spadiPos[0] - spadiBreidd && box[0] <= spadiPos[0] + spadiBreidd) {
        dY = -dY;
        box[1] = -0.86 + boxRad;};
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    
  // --- Teikna ferninginn ---
  gl.bindBuffer(gl.ARRAY_BUFFER, boxBuffer);
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.uniform1i(locWhich, 0);
  gl.uniform2fv(locBox, flatten(box));
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

  // --- Teikna spaðann ---
  gl.bindBuffer(gl.ARRAY_BUFFER, spadiBuffer);
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.uniform1i(locWhich, 1);
  gl.uniform2fv(locSpadi, flatten(spadiPos));
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    window.requestAnimFrame(render);
}
