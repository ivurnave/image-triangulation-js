/**
 * The p5.js related functions for drawing to canvas
 */

// Globals
let vertices = [];
let triangleVertices = [];
let triangles = [];
let radius = 5; // grab radius
let grab_active = false;
let drawTriangles = false;

// Loading files in a blocking way
function preload() {
    // img = loadImage('assets/test.JPG');
    img = loadImage('assets/indy.JPG');
    // img = loadImage('assets/hand.JPG');
    // TODO: loading JSON for triangulation points
}

function setup() {
    img.resize(500,0);
    var canvas = createCanvas(img.width, img.height);
    canvas.parent('sketch-holder');

    img.loadPixels();

    img.updatePixels();
    noLoop();
}

function draw() {
    image(img, 0, 0);
    if (!drawTriangles) {
        vertices.forEach(vertex => {
            stroke('black');
            fill(vertex.color);
            circle(vertex.x, vertex.y, vertex.d);
        });
    }
    else {
        // triangleVertices.forEach(tri => {
        //     console.log(tri);
        //     // noStroke();
        //     let color = getTriangleColor(img, tri);
        //     stroke(color.red, color.green, color.blue);
        //     fill(color.red, color.green, color.blue)
        //     triangle(tri[0].x, tri[0].y, tri[1].x, tri[1].y, tri[2].x, tri[2].y)
        // })
        triangles.forEach(t => {
            console.log(t);
            // noStroke();
            let color = t.color;
            let tri=t.vertices;
            stroke(color.red, color.green, color.blue);
            fill(color.red, color.green, color.blue)
            triangle(tri[0].x, tri[0].y, tri[1].x, tri[1].y, tri[2].x, tri[2].y)
        })
    }
}

function mousePressed() {
	if (vertices.length > 0) {
		for (var i = 0; i < vertices.length; i++) {
			var vertex = vertices[i],
					distance = dist(mouseX, mouseY, vertex.x, vertex.y);
			if (distance < radius) {
                vertex.active = true;
                grab_active = true;
				vertex.color = '#f00';
			} else {
                vertex.active = false;
                grab_active = false;
				vertex.color = '#fff';
			}
		}
	}
  // Prevent default functionality.
  return false;
}

// Run when the mouse/touch is dragging.
function mouseDragged() {
	if (vertices.length > 0) {
		for (var i = 0; i < vertices.length; i++) {
			var vertex = vertices[i];
			if (vertex.active) {
				vertex.x = mouseX;
                vertex.y = mouseY;
				break;
			}
		}
	}
  // Prevent default functionality.
  return false;
}

function mouseReleased() {
    vertices.forEach(vertex => {vertex.active = false})
    let inside = (mouseX < img.width && mouseX > 0 && mouseY < img.height && mouseY > 0);
    if (mouseButton === LEFT && inside && !grab_active) {
        drawTriangles = false;
        vertices.push({x: mouseX, y: mouseY, d: 3, active: false, color: '#fff'});
    }

    if (vertices.length >= 3) {
        triangleVertices = triangulate(vertices);
    }
    console.log(vertices);

    // prevent default (?)
    redraw();
    return false;
}

function makeTriangles() {
    if (triangleVertices.length >= 1) {
        drawTriangles = true
        let tris = [];
        triangleVertices.forEach(tri => {
            let color = getTriangleColor(img, tri);
            tris.push({
                color,
                vertices: tri
            })
        });
        // debugger;
        // return tris;
        triangles = tris;
        redraw();
    }
}