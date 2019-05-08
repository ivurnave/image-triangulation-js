// From codepen: https://codepen.io/jhnsnc/pen/PpPgqL?editors=0010

var opts;
var svg;

//////////////////////////////
// Helper Functions
//////////////////////////////

var EPSILON = 1.0 / 1048576.0;
// Finds the circumcircle for the three specified points
function calcTriangleInfo(i, j, k) {
  var yDiffIJ = Math.abs(i.y - j.y), yDiffJK = Math.abs(j.y - k.y),
      xCenter, yCenter, s1, s2, xMidIJ, xMidJK, yMidIJ, yMidJK, xDiff, yDiff;
  // bail condition
  if(yDiffIJ < EPSILON && yDiffJK < EPSILON)
    throw new Error("Can't get circumcircle since all 3 points are y-aligned. Halt and catch fire.");
  // solve for circumcircle (center x/y, radius)
  s1  = -((j.x - i.x) / (j.y - i.y));
  s2  = -((k.x - j.x) / (k.y - j.y));
  xMidIJ = (i.x + j.x) / 2.0;
  xMidJK = (j.x + k.x) / 2.0;
  yMidIJ = (i.y + j.y) / 2.0;
  yMidJK = (j.y + k.y) / 2.0;
  xCenter = (yDiffIJ < EPSILON) ? xMidIJ :
    (yDiffJK < EPSILON) ? xMidJK :
    (s1 * xMidIJ - s2 * xMidJK + yMidJK - yMidIJ) / (s1 - s2);
  yCenter  = (yDiffIJ > yDiffJK) ?
    s1 * (xCenter - xMidIJ) + yMidIJ :
    s2 * (xCenter - xMidJK) + yMidJK;
  xDiff = j.x - xCenter;
  yDiff = j.y - yCenter;
  return {i: i, j: j, k: k, id: 't-'+i.id+'-'+j.id+'-'+k.id, x: xCenter, y: yCenter, radiusSquared: xDiff * xDiff + yDiff * yDiff};
}
// Removes edges with matching endpoints (leaves no copies)
function removeCommonEdges(edges) {
  for(var j = edges.length; j--; )
    for(var i = j; i--; )
      if((edges[j].a === edges[i].a && edges[j].b === edges[i].b) || (edges[j].a === edges[i].b && edges[j].b === edges[i].a)) {
        edges.splice(j--, 1);
        edges.splice(i, 1);
        break;
      }
}
function generateRandomPoint(w, h) {
  var x,y;
  do {
    x = (Math.random() - 0.5) * 0.95;
    y = (Math.random() - 0.5) * 0.95;
  } while (x*x + y*y > 0.25);
  return {x: (x+0.5)*w, y: (y+0.5)*h};
}
function createTriangleDrawing(tri, w, h) {
  var group = document.createElementNS('http://www.w3.org/2000/svg','g');
  group.id = tri.id;
  group.classList.add('triangleGroup');
  if (tri.id.indexOf('st') !== -1)
    group.classList.add('temporary');
  if (tri.final)
    group.classList.add('final');

  // performance is really bad for the shapes with supertriangle verts,
  // so don't draw full thing if touches supertriangle vertex
  if (tri.i.supertriangle || tri.j.supertriangle || tri.k.supertriangle) {
    // shuffle points so math works out nicer
    var t;
    var swapVerts = function() {
      if (tri.i.id === 'st2') {
        t = tri.i;
        tri.i = tri.j;
        tri.j = t;
        swapVerts();
      } else if (tri.i.id === 'st3') {
        t = tri.i;
        tri.i = tri.k;
        tri.k = t;
        swapVerts();
      }
      if (tri.j.id === 'st1') {
        t = tri.j;
        tri.j = tri.i;
        tri.i = t;
        swapVerts();
      } else if (tri.j.id === 'st3') {
        t = tri.j;
        tri.j = tri.k;
        tri.k = t;
        swapVerts();
      }
      if (tri.k.id === 'st1') {
        t = tri.k;
        tri.k = tri.i;
        tri.i = t;
        swapVerts();
      } else if (tri.k.id === 'st2') {
        t = tri.k;
        tri.k = tri.j;
        tri.j = t;
        swapVerts();
      }
    }
    swapVerts();
    // create lines
    var triangleLine;
    if (!tri.i.supertriangle) { // I -> J
      triangleLine = document.createElementNS('http://www.w3.org/2000/svg','line');
      triangleLine.classList.add('triangle');
      triangleLine.setAttribute('x1', tri.i.x);
      triangleLine.setAttribute('y1', tri.i.y);
      if (tri.j.supertriangle) { // draw partial
        triangleLine.setAttribute('x2', ((tri.j.x-tri.i.x)*(2*h-tri.i.y)/(tri.j.y-tri.i.y)) + tri.i.x);
        triangleLine.setAttribute('y2', 2*h);
      } else { // draw full
        triangleLine.setAttribute('x2', tri.j.x);
        triangleLine.setAttribute('y2', tri.j.y);
      }
      group.appendChild(triangleLine);
    }
    if (!tri.j.supertriangle) { // J -> K
      triangleLine = document.createElementNS('http://www.w3.org/2000/svg','line');
      triangleLine.classList.add('triangle');
      triangleLine.setAttribute('x1', tri.j.x);
      triangleLine.setAttribute('y1', tri.j.y);
      if (tri.k.supertriangle) { // draw partial
        triangleLine.setAttribute('x2', 2*w);
        triangleLine.setAttribute('y2', ((tri.k.y-tri.j.y)*(2*w-tri.j.y)/(tri.k.x-tri.j.x)) + tri.j.y);
      } else { // draw full
        triangleLine.setAttribute('x2', tri.k.x);
        triangleLine.setAttribute('y2', tri.k.y);
      }
      group.appendChild(triangleLine);
    }
    if (!tri.k.supertriangle) { // K -> I
      triangleLine = document.createElementNS('http://www.w3.org/2000/svg','line');
      triangleLine.classList.add('triangle');
      triangleLine.setAttribute('x1', tri.k.x);
      triangleLine.setAttribute('y1', tri.k.y);
      if (tri.i.supertriangle) { // draw partial
        triangleLine.setAttribute('x2', -1*w);
        triangleLine.setAttribute('y2', ((tri.i.y-tri.k.y)*(-1*w-tri.k.y)/(tri.i.x-tri.k.x)) + tri.k.y);
      } else { // draw full
        triangleLine.setAttribute('x2', tri.i.x);
        triangleLine.setAttribute('y2', tri.i.y);
      }
      group.appendChild(triangleLine);
    }
  } else { // normal triangle
    var circOuter = document.createElementNS('http://www.w3.org/2000/svg','circle');
    circOuter.classList.add('circumference');
    circOuter.setAttribute('cx', tri.x);
    circOuter.setAttribute('cy', tri.y);
    circOuter.setAttribute('r', Math.sqrt(tri.radiusSquared));
    group.appendChild(circOuter);

    var circCenter = document.createElementNS('http://www.w3.org/2000/svg','circle');
    circCenter.classList.add('center');
    circCenter.setAttribute('cx', tri.x);
    circCenter.setAttribute('cy', tri.y);
    circCenter.setAttribute('r', 1);
    group.appendChild(circCenter);

    var polyTriangle = document.createElementNS('http://www.w3.org/2000/svg','polygon');
    polyTriangle.classList.add('triangle');
    polyTriangle.setAttribute('points', [tri.i.x, tri.i.y, tri.j.x, tri.j.y, tri.k.x, tri.k.y].join(','));
    group.appendChild(polyTriangle);
  }

  return group;
}

//////////////////////////////
// Triangulation Functions
//////////////////////////////

function getDelaunayTriangulation(points, w, h) {
  var candidates, locked, edges,
      triangles, steps, add, remove, lock,
      i, p, t, currentPoint, xDiff, yDiff;

  candidates = []; // triangles/circumcircles for evaluation
  locked = []; // triangles/circumcircles that are "locked"
  triangles = {}; // map of all triangles used in triangulation process
  steps = []; // list of which triangles are added/removed/locked at each scan step

  // fake supertriangle vertices (will remove these verts at the end)
  t = calcTriangleInfo(
    {x: 0.5 * w - 10 * w - 10 * h, y: -0.5 * h, id: 'st1', supertriangle: true},
    {x: 0.5 * w, y: 0.5 * h + 10 * w + 10 * h, id: 'st2', supertriangle: true},
    {x: 0.5 * w + 10 * w + 10 * h, y: -0.5 * h, id: 'st3', supertriangle: true}
  );
  candidates.push(t);
  triangles[t.id] = t;
  steps.push({add: [t.id], remove: [], lock: [], point: 'setup'});

  // add each vertex incrementally
  for(p = points.length; p--; ) {
    currentPoint = points[p];
    edges = [];
    add = [];
    remove = [];
    lock = [];

    // check each "candidate" triangle
    for(i = candidates.length; i--; ) {
      // vertex is beyond right side of circumcircle, so we can lock this tri
      xDiff = currentPoint.x - candidates[i].x;
      if(xDiff > 0.0 && xDiff * xDiff > candidates[i].radiusSquared) {
        if (!candidates[i].i.supertriangle && !candidates[i].j.supertriangle && !candidates[i].k.supertriangle) {
          t = candidates.splice(i, 1)[0];
          locked.push(t);
          lock.push(t.id);
        }
        continue;
      }
      // vertex outside circumcircle, skip
      yDiff = currentPoint.y - candidates[i].y;
      if(xDiff*xDiff + yDiff*yDiff > candidates[i].radiusSquared)
        continue;
      // vertex inside circumcircle, break up triangle and add edges to edge list
      remove.push(candidates[i].id);
      edges.push(
        {a: candidates[i].i, b: candidates[i].j},
        {a: candidates[i].j, b: candidates[i].k},
        {a: candidates[i].k, b: candidates[i].i}
      );
      candidates.splice(i, 1);
    }

    // create new candidate triangles from orphaned edges and current point
    removeCommonEdges(edges);
    for(i = edges.length; i--; ) {
      t = calcTriangleInfo(edges[i].a, edges[i].b, currentPoint);
      candidates.push(t);
      triangles[t.id] = t;
      add.push(t.id);
    }

    // store steps executed this iteration (demo purposes only)
    steps.push({add: add, remove: remove, lock: lock, point: currentPoint});
  }

  // remove triangles touching supertriangle verts and lock remaining tris
  remove = [];
  lock = [];
  for (i = candidates.length; i--; ) {
    if (candidates[i].i.supertriangle || candidates[i].j.supertriangle || candidates[i].k.supertriangle) {
      remove.push(candidates[i].id);
    } else {
      candidates[i].final = true;
      lock.push(candidates[i].id);
    }
  }
  for (i = locked.length; i--; ) {
    locked[i].final = true;
  }

  steps.push({add: [], remove: remove, lock: lock, point: 'finalize'});

  return {
    triangles: triangles,
    steps: steps
  };
}

//////////////////////////////
// Demo Functions
//////////////////////////////

var demoTriangles, processSteps, activeAnimation;
var svgWidth, svgHeight;

function runDemo() {
  // set up demo
  svgWidth = window.innerWidth;
  svgHeight = window.innerHeight;
  // between 8-40 points (based on window size)
  // don't try much more b/c this algorithm is inefficient and this demo stores each step in memory
  var i, r1, r2, n = Math.min(40, Math.max(8,Math.floor(svgWidth * svgHeight / 27000)));
  console.log('Running demo with '+n+' random points.');

  var points = new Array(n);

  // reset SVG
  svg.main.setAttribute('viewBox', '0 0 '+svgWidth+' '+svgHeight);

  // set up points
  for (i = 0; i < n; i++) {
    points[i] = generateRandomPoint(svgWidth, svgHeight);
    points[i].id = i + 1;
  }

  // sort by x-position
  points.sort(function(a, b) {
    return b.x - a.x;
  });

  // draw points
  for (i = 0; i < n; i++) {
    var circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
    circle.setAttribute('cx', points[i].x);
    circle.setAttribute('cy', points[i].y);
    circle.setAttribute('r', 3);
    r1 = Math.floor(Math.random() * 500) + 400; // random fade duration
    r2 = (points[i].x / svgWidth) * 1000 + 100; // fade delay based on x-position
    circle.style.transition = 'opacity '+r1+'ms '+r2+'ms';
    circle.style.webkitTransition = 'opacity '+r1+'ms '+r2+'ms';
    svg.points.appendChild(circle);
    points[i].svg = circle;
  }

  setTimeout(function() {
    for (var i = points.length; i--; )
      points[i].svg.classList.add('show');
  }, 10);

  var triangulation = getDelaunayTriangulation(points, svgWidth, svgHeight);
  demoTriangles = triangulation.triangles;
  processSteps = triangulation.steps;

  // add triangles to DOM
  for (i in demoTriangles) {
    if (demoTriangles.hasOwnProperty(i)) {
      demoTriangles[i].svg = createTriangleDrawing(demoTriangles[i], svgWidth, svgHeight);
      svg.triangles.appendChild(demoTriangles[i].svg);
    }
  }

  setTimeout(function() {
    for (i in demoTriangles)
      if (demoTriangles.hasOwnProperty(i))
        if (demoTriangles[i].final)
          demoTriangles[i].svg.classList.add('flash');
    setTimeout(playDemo, 1000);
  }, 1200);
}

function playDemo() {
  // reset
  for (i in demoTriangles)
    if (demoTriangles.hasOwnProperty(i))
      demoTriangles[i].svg.classList.remove('locked', 'rejected', 'candidate', 'flash');
  svg.scanline.classList.remove('show');

  if (activeAnimation) {
    window.cancelAnimationFrame(activeAnimation);
  }

  // animate steps
  var nextStep = 0;

  var processNextStep = function() {
    // add/lock/remove tris
    processSteps[nextStep].add.forEach(function(triId) {
      demoTriangles[triId].svg.classList.add('candidate');
    });
    processSteps[nextStep].remove.forEach(function(triId) {
      demoTriangles[triId].svg.classList.remove('candidate');
      demoTriangles[triId].svg.classList.add('rejected');
    });
    processSteps[nextStep].lock.forEach(function(triId) {
      demoTriangles[triId].svg.classList.remove('candidate');
      demoTriangles[triId].svg.classList.add('locked');
    });

    // advance
    if (nextStep < processSteps.length - 1)
      nextStep += 1;
    else
      nextStep = -1;
  };
  var lastScanlineTick;
  var scanlinePosition = 0;
  var tickScanline = function(time) {
    // update position
    var deltaTime;
    if (!lastScanlineTick) {
      scanlinePosition = 0.0075*svgWidth;
    } else {
      deltaTime = time - lastScanlineTick;
      scanlinePosition += 0.00002 * opts.speed * deltaTime * svgWidth;
    }
    svg.scanline.style.transform = 'translateX('+scanlinePosition+'px)';
    lastScanlineTick = time;

    // check for ticking next step
    if (nextStep === -1 || processSteps[nextStep].point === 'finalize' && scanlinePosition > svgWidth) {
      processNextStep();
      svg.scanline.classList.remove('show');
    } else if (processSteps[nextStep].point === 'setup') {
      svg.scanline.classList.add('show');
      processNextStep();
      activeAnimation = window.requestAnimationFrame(tickScanline);
    } else {
      if (scanlinePosition >= processSteps[nextStep].point.x) {
        processNextStep();
      }
      activeAnimation = window.requestAnimationFrame(tickScanline);
    }
  };

  activeAnimation = window.requestAnimationFrame(tickScanline);
}
function resetDemo() {
  while (svg.triangles.hasChildNodes()) {
    svg.triangles.removeChild(svg.triangles.lastChild);
  }
  while (svg.points.hasChildNodes()) {
    svg.points.removeChild(svg.points.lastChild);
  }
  svg.scanline.classList.remove('show');

  if (activeAnimation) {
    window.cancelAnimationFrame(activeAnimation);
  }
  
  // restart
  runDemo();
}

var Options = function() {
  this.speed = 3;
  this.playAgain = () => {
    playDemo();
  };
  this.randomizePoints = () => {
    resetDemo();
  };
};
function init() {
  // stats
  var stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0';
  stats.domElement.style.top = '0';
  document.body.appendChild(stats.domElement);
  requestAnimationFrame(function updateStats(){
    stats.update();
    requestAnimationFrame(updateStats);
  });
  // dat gui
  opts = new Options();
  gui = new dat.GUI();
  gui.add(opts, 'randomizePoints');
  gui.add(opts, 'speed', 0.5, 10);
  gui.add(opts, 'playAgain');
  // DOM queries
  svg = {
    main: document.getElementById('svg'),
    triangles: document.getElementById('triangles'),
    scanline: document.getElementById('scanline'),
    points: document.getElementById('points'),
  }
  runDemo();
}
init();