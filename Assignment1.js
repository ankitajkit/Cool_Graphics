////////////////////////////////////////////////////////////////////////
// A simple WebGL program to draw simple 2D shapes with animation.
//

var gl;
var color;
var animation;
var degree0 = 0;
var degree1 = 0;
var matrixStack = [];

var degree0 = 0;
var degree1 = 0;
var boatx = 0;
var f = 1;
var y =1;
var t =1;
var birdwing=0;
var viewChange = 2;
// mMatrix is called the model matrix, transforms objects
// from local object space to world space.
var mMatrix = mat4.create();
var uMMatrixLocation;
var aPositionLocation;
var uColorLoc;

var circleBuf;
var circleIndexBuf;
var sqVertexPositionBuffer;
var sqVertexIndexBuffer;
var triangleBuf;
var triangleIndexBuf;

const vertexShaderCode = `#version 300 es
in vec2 aPosition;
uniform mat4 uMMatrix;

void main() {
  gl_Position = uMMatrix*vec4(aPosition,0.0,1.0);
  gl_PointSize = 3.0;
}`;

const fragShaderCode = `#version 300 es
precision mediump float;
out vec4 fragColor;

uniform vec4 color;

void main() {
  fragColor = color;
}`;

function pushMatrix(stack, m) {
  //necessary because javascript only does shallow push
  var copy = mat4.create(m);
  stack.push(copy);
}

function popMatrix(stack) {
  if (stack.length > 0) return stack.pop();
  else console.log("stack has no matrix to pop!");
}

function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function vertexShaderSetup(vertexShaderCode) {
  shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(shader, vertexShaderCode);
  gl.compileShader(shader);
  // Error check whether the shader is compiled correctly
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

function fragmentShaderSetup(fragShaderCode) {
  shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(shader, fragShaderCode);
  gl.compileShader(shader);
  // Error check whether the shader is compiled correctly
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

function initShaders() {
  shaderProgram = gl.createProgram();

  var vertexShader = vertexShaderSetup(vertexShaderCode);
  var fragmentShader = fragmentShaderSetup(fragShaderCode);

  // attach the shaders
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  //link the shader program
  gl.linkProgram(shaderProgram);

  // check for compilation and linking status
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader));
    console.log(gl.getShaderInfoLog(fragmentShader));
  }

  //finally use the program.
  gl.useProgram(shaderProgram);

  return shaderProgram;
}

function initGL(canvas) {
  try {
    gl = canvas.getContext("webgl2"); // the graphics webgl2 context
    gl.viewportWidth = canvas.width; // the width of the canvas
    gl.viewportHeight = canvas.height; // the height
  } catch (e) {}
  if (!gl) {
    alert("WebGL initialization failed");
  }
}

function initSquareBuffer() {
  // buffer for point locations
  const sqVertices = new Float32Array([
    0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
  ]);
  sqVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sqVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, sqVertices, gl.STATIC_DRAW);
  sqVertexPositionBuffer.itemSize = 2;
  sqVertexPositionBuffer.numItems = 4;

  // buffer for point indices
  const sqIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);
  sqVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sqVertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sqIndices, gl.STATIC_DRAW);
  sqVertexIndexBuffer.itemsize = 1;
  sqVertexIndexBuffer.numItems = 6;
}

function drawSquare(color, mMatrix) {
  gl.uniformMatrix4fv(uMMatrixLocation, false, mMatrix);

  // buffer for point locations
  gl.bindBuffer(gl.ARRAY_BUFFER, sqVertexPositionBuffer);
  gl.vertexAttribPointer(
    aPositionLocation,
    sqVertexPositionBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  // buffer for point indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sqVertexIndexBuffer);

  gl.uniform4fv(uColorLoc, color);

  // now draw the square
  if(viewChange == 0)
  gl.drawElements(
    gl.POINT,
    sqVertexIndexBuffer.numItems,
    gl.UNSIGNED_SHORT,
    0
  );
  else if(viewChange == 1)
  gl.drawElements(
    gl.LINE_LOOP,
    sqVertexIndexBuffer.numItems,
    gl.UNSIGNED_SHORT,
    0
  );
  else 
  gl.drawElements(
    gl.TRIANGLES,
    sqVertexIndexBuffer.numItems,
    gl.UNSIGNED_SHORT,
    0
  );
}

function initTriangleBuffer() {
  // buffer for point locations
  const triangleVertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
  triangleBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuf);
  gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW);
  triangleBuf.itemSize = 2;
  triangleBuf.numItems = 3;

  // buffer for point indices
  const triangleIndices = new Uint16Array([0, 1, 2]);
  triangleIndexBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleIndexBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices, gl.STATIC_DRAW);
  triangleIndexBuf.itemsize = 1;
  triangleIndexBuf.numItems = 3;
}

function drawTriangle(color, mMatrix) {
  gl.uniformMatrix4fv(uMMatrixLocation, false, mMatrix);

  // buffer for point locations
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuf);
  gl.vertexAttribPointer(
    aPositionLocation,
    triangleBuf.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  // buffer for point indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleIndexBuf);

  gl.uniform4fv(uColorLoc, color);

  // now draw the square
  if(viewChange == 0)
  gl.drawElements(
    gl.POINT,
    triangleIndexBuf.numItems,
    gl.UNSIGNED_SHORT,
    0
  );
  else if(viewChange == 1)
  gl.drawElements(
    gl.LINE_LOOP,
    triangleIndexBuf.numItems,
    gl.UNSIGNED_SHORT,
    0
  );
  else 
  gl.drawElements(
    gl.TRIANGLES,
    triangleIndexBuf.numItems,
    gl.UNSIGNED_SHORT,
    0
  );
}


function initCircleBuffer() {
  const numSegments = 60; // Number of segments to approximate a circle

  const circleVertices = [0.0, 0.0]; // Center of the circle
  for (let i = 0; i <= numSegments; i++) {
    const angle = (i / numSegments) * Math.PI * 2;
    const x = Math.cos(angle) * 0.5; // Radius is 0.5
    const y = Math.sin(angle) * 0.5;
    circleVertices.push(x, y);
  }

  circleBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, circleBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleVertices), gl.STATIC_DRAW);
  circleBuf.itemSize = 2;
  circleBuf.numItems = numSegments;

  const circleIndices = [];
  for (let i = 0; i <= numSegments; i++) {
    circleIndices.push(0, i, i + 1);
    circleIndices.push(0, i+1, i + 2);
  }

  circleIndexBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, circleIndexBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(circleIndices), gl.STATIC_DRAW);
  circleIndexBuf.itemsize = 1;
  circleIndexBuf.numItems = numSegments * 6;
}

function drawCircle(color, mMatrix) {

    gl.uniformMatrix4fv(uMMatrixLocation, false, mMatrix);

    // buffer for point locations
    gl.bindBuffer(gl.ARRAY_BUFFER, circleBuf);
    gl.vertexAttribPointer(
      aPositionLocation,
      circleBuf.itemSize,
      gl.FLOAT,
      false,
      0,
      0
    );
  
    // buffer for point indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, circleIndexBuf);
  
    gl.uniform4fv(uColorLoc, color);
  

  if (viewChange == 0)
    gl.drawElements(gl.POINTS, circleIndexBuf.numItems, gl.UNSIGNED_SHORT, 0);
  else if (viewChange == 1)
    gl.drawElements(gl.LINES, circleIndexBuf.numItems+3, gl.UNSIGNED_SHORT, 0);
  else
    gl.drawElements(gl.TRIANGLES, circleIndexBuf.numItems+3, gl.UNSIGNED_SHORT, 0);
}


function drawGround(){
    // initialize the model matrix to identity matrix
    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);
    color = [0.408, 0.886, 0.541, 1];
    mMatrix = mat4.translate(mMatrix, [0.0, -0.55, 0]);
    mMatrix = mat4.scale(mMatrix, [3, 1.15, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
}

function drawSky(){
    // initialize the model matrix to identity matrix
    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);
    color = [0.502, 0.792, 0.98, 1];
    mMatrix = mat4.translate(mMatrix, [0.0, 0.5, 0]);
    mMatrix = mat4.scale(mMatrix, [3, 1.15, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
}

function drawRiver(){
    // initialize the model matrix to identity matrix
    mat4.identity(mMatrix);

    //water
    pushMatrix(matrixStack, mMatrix);
    color = [0.165, 0.392, 0.965, 1];
    mMatrix = mat4.translate(mMatrix, [0.0, -0.15, 0]);
    mMatrix = mat4.scale(mMatrix, [2, 0.3, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    //waves
    //left
    pushMatrix(matrixStack, mMatrix);
    color = [0.99, 0.98, 0.97, 1];
    mMatrix = mat4.translate(mMatrix, [-0.8, -0.15, 0]);
    mMatrix = mat4.scale(mMatrix, [0.3, 0.002, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [0.99, 0.98, 0.97, 1];
    mMatrix = mat4.translate(mMatrix, [0., -0.06, 0]);
    mMatrix = mat4.scale(mMatrix, [0.3, 0.002, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [0.99, 0.98, 0.97, 1];
    mMatrix = mat4.translate(mMatrix, [0.55, -0.25, 0]);
    mMatrix = mat4.scale(mMatrix, [0.3, 0.002, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
}

function drawWindMill_1(){
    

    //pole
    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);
    color = [0.2, 0.2, 0.2, 1];
    mMatrix = mat4.translate(mMatrix, [0.6, -0.19, 0]);
    mMatrix = mat4.scale(mMatrix, [0.025, 0.6, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    //fan
    pushMatrix(matrixStack, mMatrix);
    color = [0.701, 0.701, 0.224, 1];
    mMatrix = mat4.translate(mMatrix, [0.6, 0.11, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(45+degree0), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.08, 0.37, 1])
    mMatrix = mat4.translate(mMatrix, [0, -0.3, 0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack); 

    pushMatrix(matrixStack, mMatrix);
    color = [0.701, 0.701, 0.224, 1];
    mMatrix = mat4.translate(mMatrix, [0.6, 0.11, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(-45+degree0), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.08, 0.37, 1])
    mMatrix = mat4.translate(mMatrix, [0, -0.3, 0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack); 

    pushMatrix(matrixStack, mMatrix);
    color = [0.701, 0.701, 0.224, 1];
    mMatrix = mat4.translate(mMatrix, [0.6, 0.11, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(-135+degree0), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.08, 0.37, 1])
    mMatrix = mat4.translate(mMatrix, [0, -0.3, 0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack); 

    pushMatrix(matrixStack, mMatrix);
    color = [0.701, 0.701, 0.224, 1];
    mMatrix = mat4.translate(mMatrix, [0.6, 0.11, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(135+degree0), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.08, 0.37, 1])
    mMatrix = mat4.translate(mMatrix, [0, -0.3, 0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack); 

    //circle
    pushMatrix(matrixStack, mMatrix);
    color = [0, 0, 0, 1];
    mMatrix = mat4.translate(mMatrix, [0.6, 0.1, 0]);
    mMatrix = mat4.scale(mMatrix, [0.05, 0.05, 1]);
    drawCircle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

}

function drawWindMill_2(){
    

    //pole
    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);
    color = [0.2, 0.2, 0.2, 1];
    mMatrix = mat4.translate(mMatrix, [-0.6, -0.19, 0]);
    mMatrix = mat4.scale(mMatrix, [0.025, 0.6, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);


    //fan
    pushMatrix(matrixStack, mMatrix);
    color = [0.701, 0.701, 0.224, 1];
    mMatrix = mat4.translate(mMatrix, [0.6-1.2, 0.1, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(-45+degree0), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.08, 0.37, 1])
    mMatrix = mat4.translate(mMatrix, [0, -0.3, 0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack); 

    pushMatrix(matrixStack, mMatrix);
    color = [0.701, 0.701, 0.224, 1];
    mMatrix = mat4.translate(mMatrix, [0.6-1.2, 0.1, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(45+degree0), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.08, 0.37, 1])
    mMatrix = mat4.translate(mMatrix, [0, -0.3, 0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack); 

    pushMatrix(matrixStack, mMatrix);
    color = [0.701, 0.701, 0.224, 1];
    mMatrix = mat4.translate(mMatrix, [0.6-1.2, 0.1, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(-135+degree0), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.08, 0.37, 1])
    mMatrix = mat4.translate(mMatrix, [0, -0.3, 0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack); 

    pushMatrix(matrixStack, mMatrix);
    color = [0.701, 0.701, 0.224, 1];
    mMatrix = mat4.translate(mMatrix, [0.6-1.2, 0.1, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(135+degree0), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.08, 0.37, 1])
    mMatrix = mat4.translate(mMatrix, [0, -0.3, 0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack); 

    //circle
    pushMatrix(matrixStack, mMatrix);
    color = [0, 0, 0, 1];
    mMatrix = mat4.translate(mMatrix, [-0.6, 0.1, 0]);
    mMatrix = mat4.scale(mMatrix, [0.05, 0.05, 1]);
    drawCircle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

}

function drawHouse(){
    
    //roof
    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);
    color = [1, 0.5, 0, 1];
    mMatrix = mat4.translate(mMatrix, [-0.65, -0.3, 0]);
    mMatrix = mat4.scale(mMatrix, [0.3, 0.2, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [1, 0.5, 0, 1];
    mMatrix = mat4.translate(mMatrix, [-0.8, -0.3, 0]);
    mMatrix = mat4.scale(mMatrix, [0.3, 0.2, 1]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [1, 0.5, 0, 1];
    mMatrix = mat4.translate(mMatrix, [-0.5, -0.3, 0]);
    mMatrix = mat4.scale(mMatrix, [0.3, 0.2, 1]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    //walls
    pushMatrix(matrixStack, mMatrix);
    color = [1, 0.98, 0.9, 1];
    mMatrix = mat4.translate(mMatrix, [-0.65, -0.52, 0]);
    mMatrix = mat4.scale(mMatrix, [0.45, 0.24, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    //window and door
    pushMatrix(matrixStack, mMatrix);
    color = [0.9, 0.9, 0, 1];
    mMatrix = mat4.translate(mMatrix, [-0.78, -0.47, 0]);
    mMatrix = mat4.scale(mMatrix, [0.07, 0.07, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [0.9, 0.9, 0, 1];
    mMatrix = mat4.translate(mMatrix, [-0.53, -0.47, 0]);
    mMatrix = mat4.scale(mMatrix, [0.07, 0.07, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [0.9, 0.9, 0, 1];
    mMatrix = mat4.translate(mMatrix, [-0.65, -0.59, 0]);
    mMatrix = mat4.scale(mMatrix, [0.07, 0.1, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
}

function drawCar(){

    //roof
    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);
    color = [0.749, 0.42, 0.325, 1];
    mMatrix = mat4.translate(mMatrix, [-0.622, -0.73, 0]);
    mMatrix = mat4.scale(mMatrix, [0.15, 0.1, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [0.749, 0.42, 0.325, 1];
    mMatrix = mat4.translate(mMatrix, [-0.698, -0.73, 0]);
    mMatrix = mat4.scale(mMatrix, [0.15, 0.1, 1]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [0.749, 0.42, 0.325, 1];
    mMatrix = mat4.translate(mMatrix, [-0.546, -0.73, 0]);
    mMatrix = mat4.scale(mMatrix, [0.15, 0.1, 1]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    //wheels
    pushMatrix(matrixStack, mMatrix);
    color = [0, 0, 0, 1];
    mMatrix = mat4.translate(mMatrix, [-0.51, -0.88, 0]);
    mMatrix = mat4.scale(mMatrix, [0.1, 0.1, 1]);
    drawCircle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [0, 0, 0, 1];
    mMatrix = mat4.translate(mMatrix, [-0.74, -0.88, 0]);
    mMatrix = mat4.scale(mMatrix, [0.1, 0.1, 1]);
    drawCircle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [0.8, 0.8, 0.8, 1];
    mMatrix = mat4.translate(mMatrix, [-0.51, -0.88, 0]);
    mMatrix = mat4.scale(mMatrix, [0.084, 0.084, 1]);
    drawCircle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [0.8, 0.8, 0.8, 1];
    mMatrix = mat4.translate(mMatrix, [-0.74, -0.88, 0]);
    mMatrix = mat4.scale(mMatrix, [0.084, 0.084, 1]);
    drawCircle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);


    //body
    pushMatrix(matrixStack, mMatrix);
    color = [0.216, 0.494, 0.871, 1];
    mMatrix = mat4.translate(mMatrix, [-0.622, -0.81, 0]);
    mMatrix = mat4.scale(mMatrix, [0.4, 0.1, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [0.216, 0.494, 0.871, 1];
    mMatrix = mat4.translate(mMatrix, [-0.822, -0.81, 0]);
    mMatrix = mat4.scale(mMatrix, [0.1, 0.1, 1]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [0.216, 0.494, 0.871, 1];
    mMatrix = mat4.translate(mMatrix, [-0.422, -0.81, 0]);
    mMatrix = mat4.scale(mMatrix, [0.1, 0.1, 1]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

}

function drawCloud() {
    // initialize the model matrix to identity matrix
    mat4.identity(mMatrix);

    //clouds
    pushMatrix(matrixStack, mMatrix);
    color = [1.0, 1.0, 1.0, 1.0];
    mMatrix = mat4.translate(mMatrix, [-0.88, 0.53, 0]);
    mMatrix = mat4.scale(mMatrix, [0.3, 0.17, 1.0]);
    drawCircle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
  
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [-0.73, 0.51, 0]);
    mMatrix = mat4.scale(mMatrix, [0.2, 0.12, 1.0]);
    color = [1.0, 1.0, 1.0, 1.0];
    drawCircle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
  
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [-0.63, 0.51, 0]);
    mMatrix = mat4.scale(mMatrix, [0.15, 0.07, 1.0]);
    color = [1.0, 1.0, 1.0, 1.0];
    drawCircle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
  }
 
function drawMountain() {
    // initialize the model matrix to identity matrix
    mat4.identity(mMatrix);

    //mountian 1
    pushMatrix(matrixStack, mMatrix); 
    color = [0.482, 0.369, 0.275, 1];
    mMatrix = mat4.translate(mMatrix, [-0.72, 0.06, 0]);
    mMatrix = mat4.scale(mMatrix, [1.4, 0.33, 1.0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
  
    //mountain 2
    pushMatrix(matrixStack, mMatrix); 
    color = [0.569, 0.475, 0.341, 1];
    mMatrix = mat4.translate(mMatrix, [-0.69, 0.058, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(10), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [1.32, 0.34, 1.0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
  
    //mountain 3
    pushMatrix(matrixStack, mMatrix);
    color = [0.482, 0.369, 0.275, 1];
    mMatrix = mat4.translate(mMatrix, [-0.09, 0.051, 0]);
    mMatrix = mat4.scale(mMatrix, [1.7, 0.62, 1.0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
  
    //mountain 4
    pushMatrix(matrixStack, mMatrix);
    color = [0.569, 0.475, 0.341, 1];
    mMatrix = mat4.translate(mMatrix, [-0.038, 0.065, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(10), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [1.8, 0.6, 1.0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
  
    //mountain 5
    color = [0.569, 0.475, 0.341, 1];
    pushMatrix(matrixStack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [0.78, 0.08, 0]);
    mMatrix = mat4.scale(mMatrix, [0.80, 0.24, 1.0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
  }
  
  function drawTree() {
    
    mat4.identity(mMatrix);
  
    //Tree 1 starts from right
    //trunk 
    pushMatrix(matrixStack, mMatrix);
    color = [0.494, 0.345, 0.314, 1];
    mMatrix = mat4.translate(mMatrix, [0.76, 0.19, 0]);
    mMatrix = mat4.scale(mMatrix, [0.04, 0.35, 1.0]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
  
    pushMatrix(matrixStack, mMatrix);
    color = [0.263, 0.592, 0.333, 1];
    mMatrix = mat4.translate(mMatrix, [0.76, 0.42, 0]);
    mMatrix = mat4.scale(mMatrix, [0.4, 0.25, 1.0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
    
    pushMatrix(matrixStack, mMatrix);
    color = [0.412, 0.694, 0.353, 1];
    mMatrix = mat4.translate(mMatrix, [0.76, 0.46, 0]);
    mMatrix = mat4.scale(mMatrix, [0.4, 0.25, 1.0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
  
    pushMatrix(matrixStack, mMatrix);
    color = [0.502, 0.792, 0.373, 1];
    mMatrix = mat4.translate(mMatrix, [0.76, 0.5, 0]);
    mMatrix = mat4.scale(mMatrix, [0.4, 0.25, 1.0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
  
    //Tree 2
    //trunk
    pushMatrix(matrixStack, mMatrix);
    color = [0.494, 0.345, 0.314, 1];
    mMatrix = mat4.translate(mMatrix, [0.46, 0.215, 0]);
    mMatrix = mat4.scale(mMatrix, [0.05, 0.4, 1.0]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
  
    pushMatrix(matrixStack, mMatrix);
    color = [0.263, 0.592, 0.333, 1];
    mMatrix = mat4.translate(mMatrix, [0.46, 0.5, 0]);
    mMatrix = mat4.scale(mMatrix, [0.45, 0.3, 1.0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
  
    pushMatrix(matrixStack, mMatrix);
    color = [0.412, 0.694, 0.353, 1];
    mMatrix = mat4.translate(mMatrix, [0.46, 0.55, 0]);
    mMatrix = mat4.scale(mMatrix, [0.45, 0.3, 1.0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
  
    pushMatrix(matrixStack, mMatrix);
    color = [0.502, 0.792, 0.373, 1];
    mMatrix = mat4.translate(mMatrix, [0.46, 0.6, 0]);
    mMatrix = mat4.scale(mMatrix, [0.45, 0.3, 1.0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
  
    //Tree 3
    //trunk
    pushMatrix(matrixStack, mMatrix);
    color = [0.494, 0.345, 0.314, 1];
    mMatrix = mat4.translate(mMatrix, [0.18, 0.16, 0]);
    mMatrix = mat4.scale(mMatrix, [0.035, 0.3, 1.0]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
  
    pushMatrix(matrixStack, mMatrix);
    color = [0.263, 0.592, 0.333, 1];
    mMatrix = mat4.translate(mMatrix, [0.18, 0.37, 0]);
    mMatrix = mat4.scale(mMatrix, [0.35, 0.2, 1.0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
  
  
    pushMatrix(matrixStack, mMatrix);
    color = [0.412, 0.694, 0.353, 1];
    mMatrix = mat4.translate(mMatrix, [0.18, 0.41, 0]);
    mMatrix = mat4.scale(mMatrix, [0.35, 0.2, 1.0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
  
    pushMatrix(matrixStack, mMatrix);
    color = [0.502, 0.792, 0.373, 1];
    mMatrix = mat4.translate(mMatrix, [0.18, 0.45, 0]);
    mMatrix = mat4.scale(mMatrix, [0.35, 0.2, 1.0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
}

function drawPath(){
    // initialize the model matrix to identity matrix
    mat4.identity(mMatrix);

    pushMatrix(matrixStack, mMatrix);
    color = [0.471, 0.694, 0.282, 1];
    mMatrix = mat4.translate(mMatrix, [0.4, -0.8, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(50), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [1.8, 1.8, 1]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
}

function drawSun(){
    mat4.identity(mMatrix);

    //rays
    pushMatrix(matrixStack, mMatrix);
    color = [1, 0.9, 0, 1];
    mMatrix = mat4.translate(mMatrix, [-0.8, 0.77, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(45+degree1), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.005, 0.25, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [1, 0.9, 0, 1];
    mMatrix = mat4.translate(mMatrix, [-0.8, 0.77, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(90+degree1), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.005, 0.25, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [1, 0.9, 0, 1];
    mMatrix = mat4.translate(mMatrix, [-0.8, 0.77, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(135+degree1), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.005, 0.25, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [1, 0.9, 0, 1];
    mMatrix = mat4.translate(mMatrix, [-0.8, 0.77, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(180+degree1), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.005, 0.25, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
    
    //sun
    pushMatrix(matrixStack, mMatrix);
    color = [1, 0.9, 0, 1];
    mMatrix = mat4.translate(mMatrix, [-0.8, 0.77, 0]);
    mMatrix = mat4.scale(mMatrix, [0.18, 0.18, 1]);
    drawCircle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

}

function drawBoat(){
    mat4.identity(mMatrix);
    //body
    pushMatrix(matrixStack, mMatrix);
    color = [0.8, 0.8, 0.8, 1];
    mMatrix = mat4.translate(mMatrix, [0+boatx, -0.12, 0]);
    mMatrix = mat4.scale(mMatrix, [0.12, 0.05, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [0.8, 0.8, 0.8, 1];
    mMatrix = mat4.translate(mMatrix, [-0.061+boatx, -0.12, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(180), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.12, 0.05, 1]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [0.8, 0.8, 0.8, 1];
    mMatrix = mat4.translate(mMatrix, [0.061+boatx, -0.12, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(180), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.12, 0.05, 1]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);


    //pole
    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);
    color = [0.043, 0.039, 0.027, 1];
    mMatrix = mat4.translate(mMatrix, [0+boatx, -0.0, 0]);
    mMatrix = mat4.scale(mMatrix, [0.008, 0.195, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    mat4.identity(mMatrix);
    pushMatrix(matrixStack, mMatrix);
    color = [0.043, 0.039, 0.027, 1];
    mMatrix = mat4.translate(mMatrix, [-0.05+boatx, -0.01, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(-30), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.002, 0.2, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    //flag
    pushMatrix(matrixStack, mMatrix);
    color = [1, 0.5, 0, 1];
    mMatrix = mat4.translate(mMatrix, [0.085+boatx, -0.0, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(-90), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.16, 0.16, 1]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

}

function drawBird_1(){
    mat4.identity(mMatrix);
    //body
    pushMatrix(matrixStack, mMatrix);
    color = [0, 0, 0, 1];
    mMatrix = mat4.translate(mMatrix, [0, 0.602, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(5), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.009, 0.015, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
    
    //wings
    //right
    pushMatrix(matrixStack, mMatrix);
    color = [0, 0, 0, 1];
    mMatrix = mat4.translate(mMatrix, [-0.003, 0.61, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(10+birdwing), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.05, 0.008, 1]);
    mMatrix = mat4.translate(mMatrix, [0.5, 0, 0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
    //left
    pushMatrix(matrixStack, mMatrix);
    color = [0, 0, 0, 1];
    mMatrix = mat4.translate(mMatrix, [0, 0.61, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(-10-birdwing), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.05, 0.008, 1]);
    mMatrix = mat4.translate(mMatrix, [-0.5, 0,0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
}

function drawBird_2(){
    mat4.identity(mMatrix);
    //body
    pushMatrix(matrixStack, mMatrix);
    color = [0, 0, 0, 1];
    mMatrix = mat4.translate(mMatrix, [0+0.2, 0.6+0.103, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(5), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.008/1.5, 0.014/1.5, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
    
    //wings
    //right
    pushMatrix(matrixStack, mMatrix);
    color = [0, 0, 0, 1];
    mMatrix = mat4.translate(mMatrix, [0.2, 0.61+0.1, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(10+birdwing), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.05/1.5, 0.008/1.5, 1]);
    mMatrix = mat4.translate(mMatrix, [0.5, 0, 0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
    //left
    pushMatrix(matrixStack, mMatrix);
    color = [0, 0, 0, 1];
    mMatrix = mat4.translate(mMatrix, [0.2, 0.61+0.1, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(-10-birdwing), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.05/1.5, 0.008/1.5, 1]);
    mMatrix = mat4.translate(mMatrix, [-0.5, 0, 0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
}

function drawBird_3(){
    mat4.identity(mMatrix);
    //body
    pushMatrix(matrixStack, mMatrix);
    color = [0, 0, 0, 1];
    mMatrix = mat4.translate(mMatrix, [0-0.3, 0.623, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(5), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.008/1.5, 0.014/1.5, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
    
    //wings
    //right
    pushMatrix(matrixStack, mMatrix);
    color = [0, 0, 0, 1];
    mMatrix = mat4.translate(mMatrix, [-0.3, 0.63, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(10+birdwing), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.05/1.5, 0.008/1.5, 1]);
    mMatrix = mat4.translate(mMatrix, [0.5, 0, 0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
    //left
    pushMatrix(matrixStack, mMatrix);
    color = [0, 0, 0, 1];
    mMatrix = mat4.translate(mMatrix, [-0.3, 0.63, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(-10-birdwing), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.05/1.5, 0.008/1.5, 1]);
    mMatrix = mat4.translate(mMatrix, [-0.5, 0, 0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
}

function drawBird_4(){
    mat4.identity(mMatrix);
    //body
    pushMatrix(matrixStack, mMatrix);
    color = [0, 0, 0, 1];
    mMatrix = mat4.translate(mMatrix, [-0.15, 0.706, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(10), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.008/1.9, 0.014/1.9, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
    
    //wings
    //right
    pushMatrix(matrixStack, mMatrix);
    color = [0, 0, 0, 1];
    mMatrix = mat4.translate(mMatrix, [-0.15, 0.71, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(10+birdwing), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.05/1.9, 0.008/1.9, 1]);
    mMatrix = mat4.translate(mMatrix, [0.5, 0, 0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
    //left
    pushMatrix(matrixStack, mMatrix);
    color = [0, 0, 0, 1];
    mMatrix = mat4.translate(mMatrix, [-0.15, 0.71, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(-10-birdwing), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.05/1.9, 0.008/1.9, 1]);
    mMatrix = mat4.translate(mMatrix, [-0.5, 0, 0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
}

function drawBird_5(){
    mat4.identity(mMatrix);
    //body
    pushMatrix(matrixStack, mMatrix);
    color = [0, 0, 0, 1];
    mMatrix = mat4.translate(mMatrix, [0, 0.757, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(10), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.008/2.2, 0.014/2.2, 1]);
    drawSquare(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
    
    //wings
    //right
    pushMatrix(matrixStack, mMatrix);
    color = [0, 0, 0, 1];
    mMatrix = mat4.translate(mMatrix, [0, 0.76, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(10+birdwing), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.05/2.2, 0.008/2.2, 1]);
    mMatrix = mat4.translate(mMatrix, [0.5, 0, 0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
    //left
    pushMatrix(matrixStack, mMatrix);
    color = [0, 0, 0, 1];
    mMatrix = mat4.translate(mMatrix, [0, 0.76, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(-10-birdwing), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.05/2.2, 0.008/2.2, 1]);
    mMatrix = mat4.translate(mMatrix, [-0.5, 0, 0]);
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
}

function drawGrass(){
    mat4.identity(mMatrix);
    //leftmost
    pushMatrix(matrixStack, mMatrix);
    color = [0.314, 0.69, 0.2, 1];
    mMatrix = mat4.translate(mMatrix, [-1.02, -0.6, 0]);
    mMatrix = mat4.scale(mMatrix, [0.12, 0.08, 1]);
    drawCircle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [0.263, 0.592, 0.165, 1];
    mMatrix = mat4.translate(mMatrix, [-0.91, -0.59, 0]);
    mMatrix = mat4.scale(mMatrix, [0.15, 0.1, 1]);
    drawCircle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [0.165, 0.392, 0.098, 1];
    mMatrix = mat4.translate(mMatrix, [-0.28, -0.59, 0]);
    mMatrix = mat4.scale(mMatrix, [0.09, 0.07, 1]);
    drawCircle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
    
    pushMatrix(matrixStack, mMatrix);
    color = [0.263, 0.592, 0.165, 1];
    mMatrix = mat4.translate(mMatrix, [-0.37, -0.59, 0]);
    mMatrix = mat4.scale(mMatrix, [0.17, 0.11, 1]);
    drawCircle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [0.314, 0.69, 0.2, 1];
    mMatrix = mat4.translate(mMatrix, [-0.4, -0.98, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(10), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.2, 0.1, 1]);
    drawCircle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [0.165, 0.392, 0.098, 1];
    mMatrix = mat4.translate(mMatrix, [-0.1, -1, 0]);
    mMatrix = mat4.rotate(mMatrix, degToRad(-10), [0, 0, 1]);
    mMatrix = mat4.scale(mMatrix, [0.2, 0.1, 1]);
    drawCircle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [0.263, 0.592, 0.165, 1];
    mMatrix = mat4.translate(mMatrix, [-0.23, -1, 0]);
    mMatrix = mat4.scale(mMatrix, [0.35, 0.2, 1]);
    drawCircle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [0.314, 0.69, 0.2, 1];
    mMatrix = mat4.translate(mMatrix, [0.8, -0.52, 0]);
    mMatrix = mat4.scale(mMatrix, [0.15, 0.12, 1]);
    drawCircle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

    pushMatrix(matrixStack, mMatrix);
    color = [0.263, 0.592, 0.165, 1];
    mMatrix = mat4.translate(mMatrix, [1, -0.5, 0]);
    mMatrix = mat4.scale(mMatrix, [0.35, 0.2, 1]);
    drawCircle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);

}
////////////////////////////////////////////////////////////////////////
function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

    // stop the current loop of animation
    if (animation) {
      window.cancelAnimationFrame(animation);
    }
  
    var animate = function () {
        gl.clearColor(1, 1, 1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        // initialize the model matrix to identity matrix
        mat4.identity(mMatrix);
    
        birdwing += 1*y;
        if(birdwing>20)
        {
            y=-1;
        }
        else if(birdwing<-7)
        {
            y=1;
        }
        degree0 -= 1.1;
        degree1 += 0.3;

        t=t*-1;

        boatx = boatx + f * 0.002;
        if (boatx > 0.8)
            f = -1;
        else if (boatx < -0.8)
            f = 1;
    
        drawSky();
        drawMountain();
        drawRiver();
        drawGround();
        drawPath();
        drawRiver();
        drawTree();
        drawBoat();
        drawWindMill_2();
        drawWindMill_1();
        drawSun();
        drawBird_1();
        drawBird_2();
        drawBird_3();
        drawBird_4();
        drawBird_5();
        drawGrass();
        drawHouse();
        drawCar();
        drawCloud();
    
        animation = window.requestAnimationFrame(animate);
    };
  
    animate();
  }
  
  // This is the entry point from the html
  function webGLStart() {
    var canvas = document.getElementById("Assignment");
    initGL(canvas);
    shaderProgram = initShaders();
  
    //get locations of attributes declared in the vertex shader
    const aPositionLocation = gl.getAttribLocation(shaderProgram, "aPosition");
  
    uMMatrixLocation = gl.getUniformLocation(shaderProgram, "uMMatrix");
  
    //enable the attribute arrays
    gl.enableVertexAttribArray(aPositionLocation);
  
    uColorLoc = gl.getUniformLocation(shaderProgram, "color");
  
    initSquareBuffer();
    initTriangleBuffer();
    initCircleBuffer();
    drawScene();
  }
  function changeMode(mode) {
    viewChange = mode;

    drawScene();
  }
  
