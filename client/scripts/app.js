document.addEventListener( 'mousemove', onDocumentMouseMove, false );

var mouseX = 0;
var mouseY = 0;

/************************* AUDIO ANALYZER ******************************/

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var audioElement = document.getElementById('audioElement');
var audioSrc = audioCtx.createMediaElementSource(audioElement);
var analyzer = audioCtx.createAnalyser();

// Bind our analyser to the media element source.
audioSrc.connect(analyzer);
audioSrc.connect(audioCtx.destination);

var frequencyData = new Uint8Array(200);

// MAY NEED TO MOVE THIS CODE
var interval = 0;
var getFrequencies = function() {
	analyzer.getByteFrequencyData(frequencyData);
	var frequency = frequencyData;
	if (interval++ > 30) {
		interval = 0;
	}
}

/************************  CREATE THE SCENE ****************************/
var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 500;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement); 

/*************************** CREATE OBJECTS ****************************/

var geometry = new THREE.BoxGeometry(25, 25, 25);
var materialsList = [];
var colorsList = [0x009bff, 0xf9a114, 0xfff200, 0x66fc26, 0xf50057, 0x51458d];

for (var y = 0; y < 6; y++) {
	materialsList.push(new THREE.MeshBasicMaterial({color: colorsList[y]}));
}

// Creates arrays of meshes. These arrays will be able to handle a stack
// growing larger or smaller later on. 
var createObjects = function(numGroups, geo, materials) {
	var results = [];
	var colorCount = 0;
	for (var x = 0; x < numGroups; x++) {
		if (colorCount > 5) {
			colorCount = 0;
		}
		results.push([new THREE.Mesh(geo, materials[colorCount++])]);
	}
	return results;
};

meshedCubes = createObjects(10, geometry, materialsList);
console.log(meshedCubes[0][0].material.color);
meshedCubes[0].push(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: meshedCubes[0][0].material.color})));

/************************ ADD OBJECTS TO SCENE **************************/

var addObjsToScene = function(objArray, options) {
	var objPositions = options.objPositions || {x: 0, y: 0, z: 0};
	var increment = options.increment || {x: 0, y: 0, z: 0};

	objArray.forEach(function(obj, idx) {
		scene.add(obj);
		obj.position.set(objPositions.x, objPositions.y, objPositions.z);
		objPositions.x += increment.x;
		objPositions.y += increment.y;
		objPositions.z += increment.z;
	});
};

var addSetsToScene = function(setsArray, options) {
	var setsPositions = options.setsPositions || {x: 0, y: 0, z: 0};
	var incrementSet = options.increment || {x: 0, y: 0, z: 0};
	var incrementObj = options.incrementObj || {x: 0, y: 0, z: 0};

	setsArray.forEach(function(set) {
		addObjsToScene(set, {objPositions: setsPositions, increment: incrementObj});
		setsPositions.x += incrementSet.x;
		setsPositions.y += incrementSet.y;
		setsPositions.z += incrementSet.z;		
	});
}

addSetsToScene(meshedCubes, {setsPositions: {x:-500, y:-200, z:0}, increment: {x: 60, y: 0, z: 0}, incrementObj: {x: 0, y: 0, z: 0}});

/************************ MODIFY OBJECT SETS TO DATA *********************/

var modifySets = function(data, sets, options) {
	var modifier = options.modifier || 0;
	var geosize = options.geosize || 0;
	data.forEach(function(item) {
		if (item + modifier > sets.length * geosize) {

		}
	});
}


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
var myInterval = 0;
function render() {
	requestAnimationFrame(render);
	// Addition of function that rotates the cube. 
	// cubeRotationFunc();
	myInterval++;

	// camera.position.x += ( mouseX - camera.position.x ) * .05;
	// camera.position.y += ( - mouseY - camera.position.y ) * .05;
	camera.lookAt( scene.position );
	getFrequencies();
	// cubeTranslation();
	cubeResize(meshedCubes);
	additionCubes();
	// var myCube = meshedCubes[0];
	// console.log(myCube.position.x);
	// myCube.position.set(myCube.position.x + 0.02, myCube.position.y + 0.01, 0);
	renderer.render(scene, camera);
}
render();

/******************* ANIMATE THE CUBE ***********************/

function additionCubes() {
	if (myInterval % 240 === 0) {
		meshedCubes[0].push(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: meshedCubes[0][0].material.color})));
		meshedCubes[0][meshedCubes[0].length - 1].position.set(
			meshedCubes[0][meshedCubes[0].length - 2].position.x,
			meshedCubes[0][meshedCubes[0].length - 2].position.y,
			meshedCubes[0][meshedCubes[0].length - 2].position.z
		);
		scene.add(meshedCubes[0][meshedCubes[0].length - 1]);
	}
}

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
		var targetHeight = cubeset.length * 25 - 200;
		var move = topCubePos.y + 25 < targetHeight ? 1 : 0;
		topCube.position.set(topCubePos.x, topCubePos.y + move, topCubePos.z);

	});
}















