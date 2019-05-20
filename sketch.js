/**
 * The p5.js related functions for drawing to canvas
 */

// Globals
let vertices = [];
let triangleVertices = [];
let triangles = [];
let radius = 8; // grab radius
let grab_active = false;
let remove = false;
let drawTriangles = false;
let imagePath = 'assets/indy.JPG'; // placeholder
let canvas;

// Loading files in a blocking way
function preload() {
    img = loadImage(imagePath);
}

function setup() {
    // img.resize(600,0);
    img.resize(windowWidth - 10,0);
    canvas = createCanvas(img.width, img.height);
    canvas.parent('sketch-holder');
    img.loadPixels();
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
        triangles.forEach(t => {
            let color = t.color;
            let tri=t.vertices;
            stroke(color.red, color.green, color.blue);
            fill(color.red, color.green, color.blue);
            triangle(tri[0].x, tri[0].y, tri[1].x, tri[1].y, tri[2].x, tri[2].y)
        })
    }
}

function mousePressed() {
    if (keyIsDown(88)) remove = true;

	if (vertices.length > 0) {
		for (var i = 0; i < vertices.length; i++) {
			var vertex = vertices[i],
					distance = dist(mouseX, mouseY, vertex.x, vertex.y);
			if (distance < radius) {
                // check if "X" key is down
                if (remove) {
                    vertices.splice(i,1);
                } else {
                    vertex.active = true;
                    grab_active = true;
                    vertex.color = '#f00';
                }
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

function mouseDragged() {
	if (vertices.length > 0) {
		for (var i = 0; i < vertices.length; i++) {
			var vertex = vertices[i];
			if (vertex.active) {
                loop();
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
    if (inside && !grab_active && !remove) {
        drawTriangles = false;
        vertices.push({x: mouseX, y: mouseY, d: 5, active: false, color: '#fff'});
    }

    if (vertices.length >= 3) {
        triangleVertices = triangulate(vertices);
    }

    remove = false;
    noLoop();
    redraw();

    // prevent default (?)
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

        triangles = tris; // set global triangles
        redraw();
    }
}