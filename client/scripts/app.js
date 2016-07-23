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

meshedCubes = createObjects(100, geometry, materialsList);
console.log(meshedCubes[0][0].material.color);
meshedCubes[0].push(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: meshedCubes[0][0].material.color})));

/************************ ADD OBJECTS TO SCENE **************************/

var addObjsToScene = function(objArray, options) {
	var objPositions = options.objPositions || {x: 0, y: 0, z: 0};
	var increment = options.increment || {x: 0, y: 0, z: 0};
	// TODO: Make the function more generalized by allowing to pass in an option for randomizing the Z
	// coordinate. 
	var randomizedZ = Math.random() * 1000 - 250;

	objArray.forEach(function(obj, idx) {
		scene.add(obj);
		obj.position.set(objPositions.x, objPositions.y, randomizedZ);
		objPositions.x += increment.x;
		objPositions.y += increment.y;
		objPositions.z += increment.z;
	});
};

var addSetsToScene = function(setsArray, options) {
	var setsPositions = options.setsPositions || {x: 0, y: 0, z: 0};
	var incrementSet = options.increment || {x: 0, y: 0, z: 0};
	var incrementObj = options.incrementObj || {x: 0, y: 0, z: 0};
	// Commented code will eventually allow the ability to set a random position for each set of objects. 
	// var randomize = {
	// 	x: options.randomizeX || false,
	// 	y: options.randomizeY || false,
	// 	z: options.randomizeZ || false
	// };

	setsArray.forEach(function(set) {
		addObjsToScene(set, {objPositions: setsPositions, increment: incrementObj});
		setsPositions.x += incrementSet.x;
		setsPositions.y += incrementSet.y;
		setsPositions.z += incrementSet.z;		
	});
}

addSetsToScene(meshedCubes, {setsPositions: {x:-500, y:-200, z:0}, increment: {x: 60, y: 0, z: 0}, incrementObj: {x: 0, y: 0, z: 0}, randomizeZ: true});

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

/************************ DUMMY DATA ************************/
var myDataArray = [];
for (var x = 0; x < 100; x++) {
	myDataArray.push(1);
}
var flipped = false;

var incrementDummies = function() {
	if (myInterval % 15 === 0) {
		myDataArray.forEach(function(data, idx) {
			myDataArray[idx] = Math.ceil(Math.random() * 20);
		});
	}

	// The below commented code increases and decreases dataArray at a steady
	// rate. For the sake of further testing, will be testing non-consistent changes.
	// However, this code is being saved for future use if necessary. 
	// if (myInterval % 25 === 0 && flipped) {
	// 	myDataArray.forEach(function(data, idx) {
	// 		myDataArray[idx] -= 1;
	// 	});
	// 	if (myDataArray[0] <= 1) {
	// 		flipped = false;
	// 	}
	// } else if (myInterval % 25 === 0 && !flipped) {
	// 	myDataArray.forEach(function(data, idx) {
	// 		myDataArray[idx] += 1;
	// 	});
	// 	if (myDataArray[0] >= 10) {
	// 		flipped = true;
	// 	}
	// }
}

/******************* RENDER THE SCENE ***********************/
function onDocumentMouseMove(event) {
	mouseX = (event.clientX - window.innerWidth / 2);
	mouseY = (event.clientY - window.innerHeight / 2);
	mousePosX = event.clientX;
	mousePosY = event.clientY;
}

// MAY NEED TO MOVE THIS CODE
var getFrequencies = function() {
	analyzer.getByteFrequencyData(frequencyData);
	var frequency = frequencyData;
	var result = [];
	for (var x = 50; x < 150; x++) {
		if (frequency[x] > 100) {
			var toAdd = Math.floor(frequency[x] - 100) % 10;

			result.push(toAdd > 10 ? toAdd * 3 : toAdd > 7 ? toAdd * 2 : toAdd);
		} else {
			result.push(1);
		}
	}
	return result;
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

	camera.position.x += ( mouseX - camera.position.x ) * .05;
	camera.position.y += ( - mouseY - camera.position.y ) * .05;
	camera.lookAt( scene.position );
	var frequencies = getFrequencies();
	// cubeTranslation();
	incrementDummies();
	dataTranslation(frequencies, 20, meshedCubes);
	// additionCubes();
	// var myCube = meshedCubes[0];
	// console.log(myCube.position.x);
	// myCube.position.set(myCube.position.x + 0.02, myCube.position.y + 0.01, 0);
	renderer.render(scene, camera);
}
render();

/******************* ANIMATE THE CUBE ***********************/

// dataArray expects an array of integers corresponding to the visualSet which is supposed to be representing this data. 
// Delay helps to set the interval so that this does not run once for every render loop. 
// Options are currently limited to scale options where the size of the integers in the data array may not exactly 
// correspond at a 1:1 ratio for the visualSet
function dataTranslation(dataArray, delay, visualSet, options) {
	// The commented code is to create ad elay on the dataTranslation. Currently, because of animation issues this function
	// needs to be fully run on each render loop. To look further into how to do less than the full render loop to save computing power. 
	// if (myInterval % delay !== 0) {
	// 	return;
	// }
	if (options) {
		var scaling = options.scale ? options.scale : 1;
	}
	dataArray.forEach(function compareVis(dataPoint, idx) {
		// Note scale is done to the length of the array of visuals and does not take into account the actual size of
		// each box. 
		var targetPoint = dataPoint * (scaling ? scaling : 1);
		if (targetPoint > visualSet[idx].length) {
			cubeAddition(visualSet, idx);
		}
		cubeResize(visualSet[idx], targetPoint * 25 - 200);
	});
}

function cubeAddition(cubeArray, index) {
	cubeArray[index].push(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: cubeArray[index][0].material.color})));
	cubeArray[index][cubeArray[index].length - 1].position.set(
		cubeArray[index][cubeArray[index].length - 2].position.x,
		cubeArray[index][cubeArray[index].length - 2].position.y + 1,
		cubeArray[index][cubeArray[index].length - 2].position.z
	);
	scene.add(cubeArray[index][cubeArray[index].length - 1]);
}

// This function is retired for a more generalized cube addition function. 
// function additionCubes() {
// 	if (myInterval % 240 === 0) {
// 		meshedCubes[0].push(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: meshedCubes[0][0].material.color})));
// 		meshedCubes[0][meshedCubes[0].length - 1].position.set(
// 			meshedCubes[0][meshedCubes[0].length - 2].position.x,
// 			meshedCubes[0][meshedCubes[0].length - 2].position.y,
// 			meshedCubes[0][meshedCubes[0].length - 2].position.z
// 		);
// 		scene.add(meshedCubes[0][meshedCubes[0].length - 1]);
// 	}
// }

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

// If 'top' cube position is not as high as it could be, move it up by one notch. 
// TODO: Need to also include the ability to remove cubes as well. 
// function cubeResize(cubeset, targetHeight) {
// 	var topCube = cubeset[cubeset.length - 1];
// 	var topCubePos = {
// 		x: topCube.position.x,
// 		y: topCube.position.y,
// 		z: topCube.position.z
// 	};
// 	var move;
// 	if (cubeset.length > 1) {
// 		move = topCubePos.y + 25 < targetHeight ? 1 : topCubePos.y + 25 > targetHeight ? -1 : 0;
// 	} else {
// 		move = topCubePos.y + 25 < targetHeight ? 1 : 0;
// 	}
// 	topCube.position.set(topCubePos.x, topCubePos.y + move, topCubePos.z);
// 	if (cubeset.length > 2) {
// 		var secondCube = cubeset[cubeset.length - 2];
// 		var secondCubePos = {
// 			x: secondCube.position.x,
// 			y: secondCube.position.y,
// 			z: secondCube.position.z
// 		};
// 		var targetHeight = (cubeset.length - 1) * 25 - 200;
// 		var move = secondCubePos.y + 25 < targetHeight ? 1 : 0;
// 		secondCube.position.set(secondCubePos.x, secondCubePos.y + move, secondCubePos.z);		
// 		if (topCube.position.y <= secondCube.position.y) {
// 			scene.remove(topCube);
// 			cubeset.pop();
// 		}
// 	} 
// }

function cubeResize(cubeset, targetHeight) {
	var topCube = cubeset[cubeset.length - 1];
	var topCubePos = {
		x: topCube.position.x,
		y: topCube.position.y,
		z: topCube.position.z
	};
	var move;
	if (cubeset.length > 1) {
		move = topCubePos.y + 25 < targetHeight ? 5 : topCubePos.y + 25 > targetHeight ? -5 : 0;
	} else {
		move = topCubePos.y + 25 < targetHeight ? 5 : 0;
	}
	topCube.position.set(topCubePos.x, topCubePos.y + move, topCubePos.z);
	for (var i = cubeset.length - 2; i >= 0; i--) {
		var cubeTarget = (i + 1) * 25 - 200;
		var cubePos = {
			x: cubeset[i].position.x,
			y: cubeset[i].position.y,
			z: cubeset[i].position.z
		};
		var move = cubePos.y + 25 < cubeTarget ? 5 : 0;
		cubeset[i].position.set(cubePos.x, cubePos.y + move, cubePos.z);
	}
	if (cubeset.length > 2 && topCube.position.y <= cubeset[cubeset.length - 2].position.y) {
		scene.remove(topCube);
		cubeset.pop();
	}
}















