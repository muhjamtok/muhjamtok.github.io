/* 
ASG2.JS
Muhammad Jamil Tokhi
CSE160 Fall 2021
mjtokhi@ucsc.edu
https://people.ucsc.edu/~mjtokhi/
*/


// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_GlobalRotateMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

// Global variables
let canvas;
let gl;
let a_Position;
let u_Size;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

var g_points = [];     // The array for the position of a mouse press
var g_colors = [];     // The array to store the color of a point
var g_shapesList = []; // Array of shapes drawn on Canvas

// Constants
const POINT=0;
const TRIANGLE=1;
const CIRCLE=2;

// Globals related to UI elements
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5.0;
let g_selectedType = POINT;
let g_segmentNum = 10.0;
let g_globalAngle = 0.0;
let g_yellowAngle = 0.0;
let g_magentaAngle = 0.0;
let g_animation = false;

// Globals reated to Time & Animation
var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;
let g_blinkX = 1.0;
let g_blinkY = 1.0;
let g_arms = 0.0;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

// Connect javascript and GLSL variables
function connectVariablesToGLSL(){

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }


  /*
  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  } */ 

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
  	console.log('Failed to get the storage location of u_ModelMatrix');
  	return;
  }	  

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
  	console.log('Failed to get the storage location of u_GlobalRotateMatrix');
  	return;
  }	

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

// Set up actions for the HTML UI elements
function addActionsForHtmlUI(){

	// Clear button event
	//document.getElementById('clear').onclick = function() { g_shapesList = []; renderAllShapes(); };

	// Color slider events
	//document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
	//document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
	//document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });
	document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });	
	document.getElementById('yellowSlide').addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes(); });
	document.getElementById('magentaSlide').addEventListener('mousemove', function() { g_blinkY = this.value; renderAllShapes(); });
	document.getElementById('shrugSlide').addEventListener('mousemove', function() { g_arms = this.value; renderAllShapes(); });

	// Animation button events
	document.getElementById('animationOn').onclick = function() { g_animation=true; };
	document.getElementById('animationOff').onclick = function() { g_animation=false; };

	// Size slider event
	//document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize= this.value; });
	
	// Segment slider event
	//document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_segmentNum = this.value; });
	
	// Shape select events
	//document.getElementById('buttonPoint').onclick = function() { g_selectedType=POINT; };
	//document.getElementById('buttonTriangle').onclick = function() { g_selectedType=TRIANGLE; };
	//document.getElementById('buttonCircle').onclick = function() { g_selectedType=CIRCLE; };	
}

function main() {
  
  // Set up canvas and get gl variables
  setupWebGL();

  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  //canvas.onmousedown = click;
  //canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);
  //renderAllShapes();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}


// Called by browser repeatedly whenever it has time
function tick() {
	// Save the current time
	g_seconds = performance.now()/1000.0-g_startTime;

	// Update animation angles
	updateAnimatioinAngles();

	//Draw everything
	renderAllShapes();

	//Tell the browser to update again when it has time
	requestAnimationFrame(tick);
}

function updateAnimatioinAngles() {
	if(g_animation) {
		g_yellowAngle = (5*Math.sin(g_seconds));

		g_blinkX =  1;
		g_blinkY = ((Math.sin(g_seconds) + 1)/2.5) + .25;

		g_arms = Math.sin(g_seconds)/10 -.04;
	}
}

function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  
  return([x,y]);	
}
/*
function click(ev) {

  // Extract the event click and return it in WebGL coordinates
  let [x,y] = convertCoordinatesEventToGL(ev);

  // Create and store the new point
  let point;
  if (g_selectedType == POINT){
  	point = new Point();	
  }	else if(g_selectedType == TRIANGLE){
	point = new Triangle();
  } else {
  	point = new Circle();
  	point.segments = g_segmentNum;
  }

  // Populate data of new point
  point.position=[x,y];
  point.color=[g_selectedColor[0],g_selectedColor[1],g_selectedColor[2],g_selectedColor[3]];
  point.size=g_selectedSize;
  g_shapesList.push(point);

  // Draw every shape that is supposed to be in the canvas
  renderAllShapes();
}*/

function renderAllShapes(){

  // check the time at the start of this function
  var startTime = performance.now();

  // Camera Angle matrix
  var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  /*----------------------------
  // Draw each shape in the list
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
  	g_shapesList[i].render();
  }
  -----------------------------*/


  // Body
  var body = new Cube();
  body.color = [.5, .5, .5, 1.0];
  //body.matrix = headCoordinates3;
  body.matrix.scale(.4, .75, .35);
  body.matrix.translate(-.5, -.5, 0);
  body.render();
  var bodyCoordinates = new Matrix4(body.matrix);
  var bodyCoordinates1 = new Matrix4(body.matrix);
  var bodyCoordinates2 = new Matrix4(body.matrix);
  var bodyCoordinates3 = new Matrix4(body.matrix);
  var bodyCoordinates4 = new Matrix4(body.matrix);

  // Neck
  var neck = new Cube();
  neck.matrix = bodyCoordinates;
  neck.color = [.5, .5, .5, 1.0];
  neck.matrix.translate(0.4,1,.4);
  neck.matrix.scale(.2,.2,.2);
  var neckCoordinates = new Matrix4(neck.matrix);
  neck.render();

  // Head
  var head = new Cube();
  head.color = [.5, .5, .5, 1.0];
  head.matrix = neckCoordinates;
  head.matrix.scale(3, 1.55, 3.33);
  head.matrix.translate(-.35, .35, -.375);
  head.matrix.rotate(-g_yellowAngle, 0.0, 0.0, 1.0);
  head.render();
  var headCoordinates1 = new Matrix4(head.matrix);
  var headCoordinates2 = new Matrix4(head.matrix);
  
  // Eyes
  var leftEye = new Cube();
  leftEye.matrix = headCoordinates1;
  leftEye.color = [1, 1, 1, 1.0];
  leftEye.matrix.translate(.1, .2, -.01);
  leftEye.matrix.scale(.25,.25,.25);
  //blink
  leftEye.matrix.scale(g_blinkX, g_blinkY, 0);
  leftEye.render();

  var rightEye = new Cube();
  rightEye.matrix = headCoordinates2;
  rightEye.color = [1, 1, 1, 1.0];
  rightEye.matrix.translate(.65, .2, -.01);
  rightEye.matrix.scale(.25,.25,.25);
  //blink
  rightEye.matrix.scale(g_blinkX, g_blinkY, 0);
  rightEye.render();

  // Legs
  var leftLeg = new Cube();
  leftLeg.color = [0.4, 0.4, 0.4, 1];
  leftLeg.matrix = bodyCoordinates1;
  leftLeg.matrix.scale(.2, .75, .35);	
  leftLeg.matrix.translate(1,-1,.75);
  leftLeg.render();

  var rightLeg = new Cube();
  rightLeg.color = [0.4, 0.4, 0.4, 1];
  rightLeg.matrix = bodyCoordinates2;
  rightLeg.matrix.scale(.2, .75, .35);	
  rightLeg.matrix.translate(3,-1,.75);
  rightLeg.render();

  // Arms

  var leftArm = new Cube();
  leftArm.color = [.4,.4,.4,1];
  leftArm.matrix = bodyCoordinates3;
  leftArm.matrix.scale(.1,1,.35);
  leftArm.matrix.translate(-1,0,.5);
  leftArm.matrix.translate(0, g_arms, 0);
  leftArm.render();

  var rightArm = new Cube();
  rightArm.color = [.4,.4,.4,1];
  rightArm.matrix = bodyCoordinates4;
  rightArm.matrix.scale(.1,1,.35);
  rightArm.matrix.translate(10,0,.5);
  rightArm.matrix.translate(0, g_arms, 0);
  rightArm.render();
  /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Draw the body cube
  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.matrix.translate(-0.25, -0.75, 0.0);
  body.matrix.rotate(-5,1,0,0);
  body.matrix.scale(0.5, 0.3, 0.5);
  body.render();

  // Draw a left arm
  var leftArm = new Cube();
  leftArm.color = [1.0, 1.0, 0.0, 1.0];
  leftArm.matrix.setTranslate(0, -0.5, 0.0);
  leftArm.matrix.rotate(-5, 1.0, 0.0, 0.0);
  
  leftArm.matrix.rotate(-g_yellowAngle, 0.0, 0.0, 1.0);

  var yellowCoordinates = new Matrix4(leftArm.matrix);
  leftArm.matrix.scale(0.25, 0.7, 0.5);
  leftArm.matrix.translate(-0.5, 0.0, 0.0);
  leftArm.render();

  // Test box
  var box = new Cube();
  box.color = [1,0,1,1];
  box.matrix = yellowCoordinates;
  box.matrix.translate(0.0,0.65,0.0);
  box.matrix.rotate(g_magentaAngle,0,0,1);
  box.matrix.scale(.3,.3,.3);
  box.matrix.translate(-0.5, 0.0, -0.001);
  box.render();
  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
}

  /*-------------------------------------------
  //PERFORMANCE TESTING
  // Check time at end of function, show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + "fps: " + Math.floor(10000/duration)/10, "numdot");
}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID){
	var htmlElm = document.getElementById(htmlID);
	if(!htmlElm) {
		console.log("Failed to get " + htmlID + " from HTML");
		return;
	}
	htmlElm.innerHTML = text;
}
  -------------------------------------------*/
