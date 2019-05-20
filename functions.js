// Average pixels for a region (array of {x,y} coordinates)
// average using the sqare root of mean of the sum of squares
function averageColor (img, region) {
    // img.loadPixels();
    let r=g=b=0;
    let index, x, y;

    // iterate over region, find average values
    region.forEach(coord => {
        // x = coord[0];
        // y = coord[1];
        x = coord.x;
        y = coord.y;
        index = (x + y * img.width) * 4;
        r += img.pixels[index] * img.pixels[index];
        g += img.pixels[index + 1] * img.pixels[index + 1];
        b += img.pixels[index + 2] * img.pixels[index + 2];
    });

    // average values
    let red = Math.sqrt(r / region.length);
    let green = Math.sqrt(g / region.length);
    let blue = Math.sqrt(b / region.length);

    // iterate over region, assign average values
    region.forEach(coord => {
        x = coord[0];
        y = coord[1];
        index = (x + y * img.width) * 4;
        writeColor(img, x, y, red, green, blue);
    });
    img.updatePixels();
}

// helper for writing color to array
function writeColor(image, x, y, red, green, blue) {
    let index = (x + y * image.width) * 4;
    image.pixels[index] = red;
    image.pixels[index + 1] = green;
    image.pixels[index + 2] = blue;
}

// helpers needed for Delaunator
function getX (point) {return point.x}
function getY (point) {return point.y}

// generates the Delauney triangulation, returns triples of coordinates
function triangulate (points) {
    const delaunay = Delaunator.from(points, getX, getY);
    var coordinates = []; // array of 3 point (x,y) tuples
    var triangles = delaunay.triangles;
    for (let i = 0; i < triangles.length; i += 3) {
        coordinates.push([
            points[triangles[i]],
            points[triangles[i + 1]],
            points[triangles[i + 2]]
        ]);
    }
    return coordinates;
}

function triangleArea (a, b, c) {
    return Math.abs((a.x*(b.y-c.y) + b.x*(c.y-a.y)+ c.x*(a.y-b.y))/2.0);
}
// Testing triangleArea
// console.log(triangleArea({x:0,y:0}, {x:2,y:0},{x:0,y:1}));

// check if a point (x,y) is inside a triangle (3 pairs of (x,y))
function isInsideTriangle(point, triangle) {
    var A = triangleArea(triangle[0], triangle[1], triangle[2]);
    var A1 = triangleArea(point, triangle[0], triangle[1]);
    var A2 = triangleArea(point, triangle[0], triangle[2]);
    var A3 = triangleArea(point, triangle[1], triangle[2]);

    return (A == A1+A2+A3);
}

// Testing isInsideTriangle
// var t = [{x:0,y:0}, {x:3,y:0},{x:0,y:5}];
// var p = {x:8, y:1};
// console.log(isInsideTriangle(p,t));

// find all points inside a triangle (3 pairs of (x,y)), return their average color (r,g,b)
// TODO: Do the color averaging in this function so you don't have to iterate over the region again
function getTriangleColor(img, triangle) {
    let r=g=b=0;
    let index, minX, minY, maxX, maxY;

    // get triangle bounding box
    minX = Math.floor(Math.min(triangle[0].x, triangle[1].x, triangle[2].x));
    maxX = Math.floor(Math.max(triangle[0].x, triangle[1].x, triangle[2].x));
    minY = Math.floor(Math.min(triangle[0].y, triangle[1].y, triangle[2].y));
    maxY = Math.floor(Math.max(triangle[0].y, triangle[1].y, triangle[2].y));

    // iterate over bounding box, build region
    let size = 0;
    for (let x=minX; x<maxX; x++) {
        for (let y=minY; y<maxY; y++) {
            if (isInsideTriangle({x,y}, triangle)) {
                index = (x + y * img.width) * 4;
                r += img.pixels[index] * img.pixels[index];
                g += img.pixels[index + 1] * img.pixels[index + 1];
                b += img.pixels[index + 2] * img.pixels[index + 2];
                size++;
            }
        }
    }
    let red = Math.sqrt(r / size);
    let green = Math.sqrt(g / size);
    let blue = Math.sqrt(b / size);

    return ({
        red, green, blue
    });
}

function clearPoints() {
    vertices = [];
    triangleVertices = [];
    triangles = [];
    grab_active = false;
    drawTriangles = false;
    redraw();
}

function hideTriangles() {
    drawTriangles = false;
    redraw();
}

function loadFile() {
    dialog.showOpenDialog((fileNames) => {
        // fileNames is an array that contains all the selected
        if(fileNames === undefined){
            console.log("No file selected");
            return;
        }
        imagePath = fileNames[0];
        img = loadImage(imagePath,
            // success callback
            ()=>{
                console.log(img.width, img.height)
                // img.resize(600,0);
                img.resize(windowWidth - 10,0);
                canvas.resize(img.width, img.height);
                img.loadPixels();
                clearPoints();
                redraw();
            });
    });
}

function saveCanvas() {
    save();
}