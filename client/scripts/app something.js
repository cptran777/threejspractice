document.addEventListener( 'mousemove', onDocumentMouseMove, false );

var mouseX = 0;
var mouseY = 0;

/******************* CODE TO CREATE THE SCENE ***********************/
var scene = new THREE.Scene();
// Parameters: Field of view, aspect ratio, near clipping plane, far clipping plane
// Note: Aspect ratio will almost always be width of element divided by height, or 
// else the image will look squashed. 

// Far/near clipping plane notes: Objects farther away from camera than the
// value of far or closer than near won't be rendered. 
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// One of many three.js renderers. 
var renderer = new THREE.WebGLRenderer();

// Good idea to use the width and hieght of the area that the app should fill
// For more intensive apps, can set size to smaller values, like half size

// Note, also possible to lower resolution by calling setSize with false as update style.
// Ex: setSize(window.innerWidth2, window.innerHeight/2, false);
renderer.setSize(window.innerWidth, window.innerHeight);

// Adds renderer element to HTML document. 
document.body.appendChild(renderer.domElement); 

/******************* CREATE A CUBE ***********************/

// BoxGeometry is an object that contains all the points (vertices) and
// fill (faces) of a cube. 
var geometry = new THREE.BoxGeometry(100, 100, 100);

// Material to color the cube. Three.js comes with several kinds of materials.
var material = new THREE.MeshBasicMaterial({color: 0x009bff, wireframe: true}); // Note: green, hex

// Mesh is an object that takes a geometry and applies a material to it. 
// var cube = new THREE.Mesh(geometry, material);

// By default, scene.add() adds an object to coordinates (0,0,0)
// scene.add(cube);

// As that would cause the camera to be inside the cube, moving the camera
// away a bit:
camera.position.z = 500;

/********************* CUBE RESIZE *************************/

// Scale is an actual % scale as opposed to setting an actual dimension.
// cube.scale.y = 0.5;

/****************** CREATE MORE CUBES **********************/

var cubeNation = [];
for (var x = 0; x < 4; x++) {
	cubeNation.push(new THREE.BoxGeometry(50, 50, 50));
}

var materialsList = [];
var colorsList = [0x009bff, 0xf9a114, 0xfff200, 0x66fc26, 0xf50057, 0x51458d];

for (var y = 0; y < 6; y++) {
	materialsList.push(new THREE.MeshBasicMaterial({color: colorsList[y]}));
}

var colorCount = 0;

var meshedCubes = cubeNation.map(function meshAll(item) {
	if(colorCount > 5) {
		colorCount = 0;
	}
	return [new THREE.Mesh(item, materialsList[colorCount++])];
});

var objPositions = {
	x: -500,
	y: -200,
	z: 0
}

meshedCubes[1].push(new THREE.Mesh(new THREE.BoxGeometry(50, 50, 50), materialsList[1]));

meshedCubes.forEach(function addToScene(cubic) {
	cubic.forEach(function setCubic(cube) {
		scene.add(cube);
		cube.position.set(objPositions.x, objPositions.y, objPositions.z);
	});
	objPositions.x += 60;
	// objPositions.y += 100;
});

/********************* ADD LIGHT ****************************/

// create a point light
var pointLight =
  new THREE.Light(0xFFFFFF);

// set its position
pointLight.position.x = 1;
pointLight.position.y = 1;
pointLight.position.z = 1;

// add to the scene
scene.add(pointLight);

/******************* RENDER THE SCENE ***********************/
function onDocumentMouseMove(event) {
	mouseX = (event.clientX - window.innerWidth / 2);
	mouseY = (event.clientY - window.innerHeight / 2);
	mousePosX = event.clientX;
	mousePosY = event.clientY;
}
// Render loop:
// Create a loop that causes the renderer to draw the scene 60 times
// per second.
// Note: requestAnimationFrame has some advantages over simple setInterval: 
// Pauses when the user navigates to another browser tab, so doesn't waste
// processing power. 
function render() {
	requestAnimationFrame(render);
	// Addition of function that rotates the cube. 
	// cubeRotationFunc();

	camera.position.x += ( mouseX - camera.position.x ) * .05;
	camera.position.y += ( - mouseY - camera.position.y ) * .05;
	camera.lookAt( scene.position );
	// cubeTranslation();
	cubeResize(meshedCubes);
	// var myCube = meshedCubes[0];
	// console.log(myCube.position.x);
	// myCube.position.set(myCube.position.x + 0.02, myCube.position.y + 0.01, 0);
	renderer.render(scene, camera);
}
render();

/******************* ANIMATE THE CUBE ***********************/

// This will run on every frame (at 60fps). Anything that moves
// or changes will be run through the render loop. 
function cubeRotationFunc() {
	// cube.rotation.x += 0.01;
	// cube.rotation.y += 0.05;
	meshedCubes.forEach(function rotations(item) {
		item.rotation.x += 0.02;
		item.rotation.y += 0.06;
	});
}

function cubeTranslation() {
	meshedCubes.forEach(function rotations(item) {
		var x = item.position.x;
		x += x < mouseX ? 1 : -1;
		var y = item.position.y;
		y += y < mouseY ? 1 : -1;
		var z = item.position.z;
		z += z < 0 ? 1 : -0.5;
		item.position.set(x, y, z);
	});
}

function cubeResize(cubes) {
	cubes.forEach(function adjustStack(cubeset) {
		var topCube = cubeset[cubeset.length - 1];
		var topCubePos = {
			x: topCube.position.x,
			y: topCube.position.y,
			z: topCube.position.z
		};
		var targetHeight = cubeset.length * 50 - 200;
		var move = topCubePos.y + 50 < targetHeight ? 1 : 0;
		topCube.position.set(topCubePos.x, topCubePos.y + move, topCubePos.z);

	});
}















