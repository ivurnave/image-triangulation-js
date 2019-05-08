// Point object
function Point (x,y) {
    return ({
        x,
        y
    });
}

// helper function
function leftOf(a,b,c) {
    return ((b.x-a.x)*(c.y-a.y) - (b.y-a.y)*(c.x-a.x) >= 0);
}

// helper function
function sortByAngle(S, anchor) {
    S.sort(function(a,b) {
        if (leftOf(anchor,a,b)) {
            return -1;
        } else {
            return 1;
        }
    });
    return S;
}

// takes a point set S as input, returns the convex hull of S
function GrahamScan(S_orig) {
    // find anchor point
    var lowest_index = 0;
    for (var i=0; i<S_orig.length; i++) {
        if (S_orig[i].y <= S_orig[lowest_index].y) {
            lowest_index = i;
        }
    }
    var anchor = S_orig[lowest_index]

    // sort S by angle to anchor point
    S = S_orig.slice();
    S.splice(lowest_index,1);
    S = sortByAngle(S, anchor);

    H = [anchor, S[0]]; // the convex hull
    for (let i=1; i<S.length; i++) {
        // append next element in sorted list to the hull
        let a = S[i];
        H.push(a);

        // while the next to last vertex of hull forms a right turn:
        while(!leftOf(H[H.length-3], H[H.length-2], a)) {
            // remove next to last vertex from hull
            H.splice(H.length-2, 1);
        }
        
    }
    return H;
}

S1 = [Point(3,0), Point(5,2), Point(2,1), Point(0,0), Point(4,4), Point(2,3), Point(3,2), Point(1.3,4.2)];
H1 = GrahamScan(S1);
// console.log("Convex hull of S1:\n", H1);

S2 = [Point(-3,2), Point(-2,-3), Point(-1,1), Point(-1,-1), Point(1, 0.5), Point(3,1)]
H2 = GrahamScan(S2);
// console.log("Convex hull of S2:\n", H2);