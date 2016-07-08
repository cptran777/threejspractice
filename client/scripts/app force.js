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


/********************** CREATE A CUBE *************************/

// BoxGeometry is an object that contains all the points (vertices) and
// fill (faces) of a cube. 
var geometry = new THREE.BoxGeometry(1, 1, 1);

// Material to color the cube. Three.js comes with several kinds of materials.
var material = new THREE.MeshBasicMaterial({color: 0x009bff}); // Note: green, hex

// Mesh is an object that takes a geometry and applies a material to it. 
// var cube = new THREE.Mesh(geometry, material);

// By default, scene.add() adds an object to coordinates (0,0,0)
// scene.add(cube);

// As that would cause the camera to be inside the cube, moving the camera
// away a bit:
camera.position.z = 500;

/****************** CREATE MORE CUBES **********************/

var cubeNation = [];
for (var x = 0; x < 500; x++) {
	cubeNation.push(new THREE.BoxGeometry(30, 30, 30));
}

var materialsList = [];
var colorsList = [0x009bff, 0xf9a114, 0xfff200, 0x66fc26, 0xf50057, 0x51458d];

for (var y = 0; y < 6; y++) {
	materialsList.push(new THREE.MeshBasicMaterial({color: colorsList[y], wireframe: true}));
}

var colorCount = 0;

var meshedCubes = cubeNation.map(function meshAll(item) {
	if(colorCount > 5) {
		colorCount = 0;
	}
	return new THREE.Mesh(item, materialsList[colorCount++]);
});

var objPositions = {
	count: 0
}

/********************** D3 FORCE LAYOUT ***********************/
var nodes = d3.range(500).map(function() { 
	if (colorCount > 5) {
		colorCount = 0;
	}
	var radius = Math.random() * 50 + 15;
	return {
		radius: radius,
		obj: new THREE.Mesh(new THREE.BoxGeometry(radius, radius, radius), materialsList[colorCount++])
	};
});

var root = nodes[0] = {radius: 500, obj: new THREE.Mesh(new THREE.BoxGeometry(500, 500, 500), materialsList[3])};

nodes.forEach(function addToScene(node) {
	scene.add(node.obj);
	node.obj.position.set(Math.random() * 1000 - 500, Math.random() * 1000 - 500, Math.random() * 900 - 450);
});


var color = d3.scale.category10();

var forceWidth = 960;
var forceHeight = 500;

root.radius = 0;
root.fixed = true;

var force = d3.layout.force()
	.gravity(0.05)
	.charge(function(d, i) { return i ? 0 : -2000; })
	.nodes(nodes)
	.size([forceWidth, forceHeight]);

force.start();

force.on('tick', function(e) {
  var q = d3.geom.quadtree(nodes);
  var i = 0;
  var n = nodes.length;

  while (++i < n) {
    q.visit(collide(nodes[i]));
  }

  // svg.selectAll('circle')
  //     .attr('cx', function(d) { return d.x; })
  //     .attr('cy', function(d) { return d.y; });
});

var collide = function(node) {
  var r = node.radius + 16;
  var nx1 = node.obj.position.x - r;
  var nx2 = node.obj.position.x + r;
  var ny1 = node.obj.position.y - r;
  var ny2 = node.obj.position.y + r;
  return function(quad, x1, y1, x2, y2) {
    if (quad.point && (quad.point !== node)) {
      var x = node.obj.position.x - quad.point.x;
      var y = node.obj.position.y - quad.point.y;
      var l = Math.sqrt(x * x + y * y);
      var r = node.radius + quad.point.radius;
      if (l < r) {
        l = (l - r) / l * .5;
        node.obj.position.set(node.obj.position.x - (x *= l), node.obj.position.y - (y *= l), node.obj.position.z);
        quad.point.x += x;
        quad.point.y += y;
      }
    }
    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
  };
};


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
	var p1 = d3.mouse(this);
  	var rootx = p1[0];
  	var rooty = p1[1];
  	root.obj.position.set(rootx, rooty, root.obj.position.z);
  	force.resume();
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
	cubeRotationFunc();

	// camera.position.x += ( mouseX - camera.position.x ) * .05;
	// camera.position.y += ( - mouseY - camera.position.y ) * .05;
	camera.lookAt( scene.position );
	//cubeTranslation();
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
	nodes.forEach(function rotations(item) {
		item.obj.rotation.x += 0.02;
		item.obj.rotation.y += 0.06;
	});
}

function cubeTranslation() {
	nodes.forEach(function rotations(node) {
		var x = node.obj.position.x;
		var y = node.obj.position.y;
		var z = node.obj.position.z;
		x += x > 0 ? -1 : 1;
		y += y > 0 ? -1 : 1;
		z += z > 0 ? -1 : 1;
		node.obj.position.set(x, y, z);
	});
}















