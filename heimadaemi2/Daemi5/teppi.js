"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 5;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -1, -1 ), //a
        vec2(  -1,  1 ), //b
        vec2(  1, 1 ), //c
        vec2( 1, -1) //d
    ];

    divideTeppi( vertices[0], vertices[1], vertices[2], vertices[3],
                    NumTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function teppi( a, b, c, d)
{
    points.push( a, b, c, d);
}

function divideTeppi( a, b, c, d, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        teppi( a, b, c, d);
    }
    else {

        //bisect the sides

        var ab1 = mix(a, b, 1/3);
        var ab2 = mix(a, b, 2/3);
        var bc1 = mix(b, c, 1/3);
        var bc2 = mix(b, c, 2/3);
        var cd1 = mix(c, d, 1/3);
        var cd2 = mix(c, d, 2/3);
        var ad1 = mix(a, d, 1/3);
        var ad2 = mix(a, d, 2/3);
        var adbc11 = mix(ad1, bc1, 1/3);
        var adbc12 = mix(ad1, bc1, 2/3);
        var adbc21 = mix(ad2, bc2, 1/3);
        var adbc22 = mix(ad2, bc2, 2/3);

        --count;

        // three new triangles

        divideTeppi( a, ab1, adbc11, ad1, count);
        divideTeppi( ab1, ab2, adbc12, adbc11, count);
        divideTeppi( ab2, b, bc1, adbc12, count);
        divideTeppi( adbc12, bc1, bc2, adbc22, count);
        divideTeppi( adbc22, bc2, c, cd1, count);
        divideTeppi( adbc21, adbc22, cd1, cd2, count);
        divideTeppi( ad2, adbc21, cd2, d, count);
        divideTeppi( ad1, adbc11, adbc21, ad2, count);
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
