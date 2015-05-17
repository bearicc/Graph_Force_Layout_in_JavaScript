/* CS519 MP2 Part 1:
 * GraphForceLayout
 *   by Hao Xiong
 */

// -----------------------------------------------------
// Global variables

var g_bRunning = false; // for animation
var g_tid;              // for animation
var g_width  = 640;     // canvas width
var g_height = 480;     // canvas height
var g_nodes;            // graph nodes
var g_edges;            // graph edges
var g_area;             // canvas area
var g_k;                // for force calc
var g_adjacent_matrix;  // adjacent matrix of graph
var g_t = 10;           // maximum movement
var g_delta_t = 0;      // damping value
 
// graph1: given by the old MP2 problem
// graph2: four nodes, a simple example, which should be a squre layout
// graph3: random nodes, which should be a circle layout
var graph1 = {
    "nodes": [  { "x": 208.992345, "y": 273.053211 },
                { "x": 595.98896,  "y":  56.377057 },
                { "x": 319.568434, "y": 278.523637 },
                { "x": 214.494264, "y": 214.893585 },
                { "x": 482.664139, "y": 340.386773 },
                { "x":  84.078465, "y": 192.021902 },
                { "x": 196.952261, "y": 370.798667 },
                { "x": 107.358165, "y": 435.15643  },
                { "x": 401.168523, "y": 443.407779 },
                { "x": 508.368779, "y": 386.665811 },
                { "x": 355.93773,  "y": 460.158711 },
                { "x": 283.630624, "y":  87.898162 },
                { "x": 194.771218, "y": 436.366028 },
                { "x": 477.520013, "y": 337.547331 },
                { "x": 572.98129,  "y": 453.668459 },
                { "x": 106.717817, "y": 235.990363 },
                { "x": 265.064649, "y": 396.904945 },
                { "x": 452.719997, "y": 137.886092 }
            ],
    "edges": [  { "target": 11, "source":  0 },
                { "target":  3, "source":  0 },
                { "target": 10, "source":  0 },
                { "target": 16, "source":  0 },
                { "target":  1, "source":  0 },
                { "target":  3, "source":  0 },
                { "target":  9, "source":  0 },
                { "target":  5, "source":  0 },
                { "target": 11, "source":  0 },
                { "target": 13, "source":  0 },
                { "target": 16, "source":  0 },
                { "target":  3, "source":  1 },
                { "target":  9, "source":  1 },
                { "target": 12, "source":  1 },
                { "target":  4, "source":  2 },
                { "target":  6, "source":  2 },
                { "target":  8, "source":  2 },
                { "target": 13, "source":  2 },
                { "target": 10, "source":  3 },
                { "target": 16, "source":  3 },
                { "target":  9, "source":  3 },
                { "target":  7, "source":  3 },
                { "target": 11, "source":  5 },
                { "target": 13, "source":  5 },
                { "target": 12, "source":  5 },
                { "target":  8, "source":  6 },
                { "target": 13, "source":  6 },
                { "target": 10, "source":  7 },
                { "target": 11, "source":  7 },
                { "target": 17, "source":  8 },
                { "target": 13, "source":  8 },
                { "target": 11, "source": 10 },
                { "target": 16, "source": 10 },
                { "target": 13, "source": 11 },
                { "target": 14, "source": 12 },
                { "target": 14, "source": 12 },
                { "target": 14, "source": 12 },
                { "target": 15, "source": 12 },
                { "target": 16, "source": 12 },
                { "target": 15, "source": 14 },
                { "target": 16, "source": 14 },
                { "target": 15, "source": 14 },
                { "target": 16, "source": 15 },
                { "target": 16, "source": 15 },
                { "target": 17, "source": 16 }
            ]
}; // Graph
var graph2 = {
    "nodes": [  { "x": 208.992345, "y": 273.053211 },
                { "x": 595.98896,  "y":  56.377057 },
                { "x": 319.568434, "y": 278.523637 },
                { "x": 214.494264, "y": 214.893585 },
             ],
    "edges": [  { "target": 1, "source":  0 },
                { "target": 2, "source":  1 },
                { "target": 3, "source":  2 },
                { "target": 0, "source":  3 },
             ]
}
var graph3 = random_cycle(20, 0.5*g_width, 0.5*g_height);
var g_graph = graph3;

// -----------------------------------------------------
// Init, register control events using jQuery
$(document).ready(function() {
    $("#mp2 button").on("click", function(e) {
        if (g_bRunning) {
            g_bRunning = false;
            $("#mp2 button").text("Resume");
            clearTimeout(g_tid);
        }
        else {
            g_bRunning = true;
            $("#mp2 button").text("Stop");
            g_tid = setTimeout(mycode, 100);
        }
    });
    $("#test1").on("click", function(e) {
        g_graph  = graph1;
        init();
        render();
    });
    $("#test2").on("click", function(e) {
        g_graph  = graph2;
        init();
        render();
    });
    $("#test3").on("click", function(e) {
        g_graph  = graph3;
        init();
        render();
    });
    $("#default_k").on("click", function(e) {
        if ($(this).is(":checked")) {
            if ($("test1").is(":checked")) {
                g_k = Math.sqrt(g_area/g_nodes.length);
            }
            if ($("test2").is(":checked")) {
                g_k = Math.sqrt(g_area/g_nodes.length);
            }
            if ($("test3").is(":checked")) {
                g_k = 40;
            }
            $("#k").prop("disabled", true);
        }
        else {
            $("#k").prop("disabled", false);
            g_k = $("#k").val();
        }
        init2();
    });
    $("#k").blur(function(e) {
        g_k = $("#k").val();
        if (g_k == "") {
            $(this).val("1");
        }
        init2();
    });
    $("#t").blur(function(e) {
        g_t = $("#t").val();
        if (g_k == "") {
            $(this).val("100");
        }
        init2();
    });
    $("#delta_t").blur(function(e) {
        g_delta_t = $("#delta_t").val();
        if (g_k == "") {
            $(this).val("0");
        }
        init2();
    });
    var canvas = document.getElementById('example');
    if (! canvas) {
        console.log(' Failed to retrieve the < canvas > element');
        return false;
    }
    else {
	    console.log(' Got < canvas > element ');
    }
    init();    
    render();
});

// -----------------------------------------------------
// Find adjcant nodes
function get_adjacent_matrix(graph) {
    var nodes_num = g_nodes.length
    var adjacent_matrix = new Array(nodes_num)
    for (var i = 0; i < nodes_num; i++) {
        adjacent_matrix[i] = new Array();
    }
    for (var i = 0; i < g_edges.length; i++) {
        var e = g_edges[i]
        var source = e["source"];
        var target = e["target"];
        adjacent_matrix[source].push(target);
        adjacent_matrix[target].push(source);
    }
    return adjacent_matrix;
}

//------------------------------------------------------

function draw_graph(ctx,graph) {
    // Draw the edges
    for (var i=0;i<g_edges.length;i++)
    {
        var e = g_edges[i];
        var vidx=e["source"];
        x1 = g_nodes[vidx]["x"];
        y1 = g_nodes[vidx]["y"];
        vidx=e["target"];
        x2 = g_nodes[vidx]["x"];
        y2 = g_nodes[vidx]["y"];

        ctx.beginPath();
        ctx.moveTo(x1,y1);
            ctx.lineTo(x2,y2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        ctx.stroke();
    }
    // Draw the vertices
    for (var i=0;i<g_nodes.length;i++)
    {
        var node = g_nodes[i];
        var radius = 5;
        x = node["x"];
        y = node["y"];

        ctx.beginPath();
        ctx.arc(x,y,radius,0,2*Math.PI);
        ctx.fillStyle = '#FF0000';
        ctx.fill();

    }

}

//------------------------------------------------------

function abs(array) {
    var result = 0;
    for (var i = 0; i < array.length; i++) {
        result += array[i]*array[i];
    }
    result = Math.sqrt(result);
    return result;
}
function fa(z) { return z*z/g_k; }
function fr(z) { return g_k*g_k/z; }
function update_positions() {
    var disp  = new Array(g_nodes.length)
    for (var i=0; i<disp.length; i++) {
        disp[i] = [0, 0];
    }
    var MAX_ITERATION = 4;
    var delta = [0, 0];
    for (var i=1; i<=MAX_ITERATION; i++) {
        // Calculate repulsive forces
        for (var v=0; v<g_nodes.length; v++) {
            disp[v] = [0, 0];
            for (var u=0; u<g_nodes.length; u++) {
                if (u!=v) {// && g_adjacent_matrix[v].indexOf(u) < 0) {
                    delta = [0, 0];
                    delta[0] = g_nodes[v]["x"]-g_nodes[u]["x"];
                    delta[1] = g_nodes[v]["y"]-g_nodes[u]["y"];
                    if (abs(delta)) {
                        disp[v][0] += delta[0]/abs(delta)*fr(abs(delta));
                        disp[v][1] += delta[1]/abs(delta)*fr(abs(delta));
                    }
                }
            }
        }

        // Calculate attractive forces
        for (var v=0; v<g_nodes.length; v++) {
            for (var j=0; j<g_adjacent_matrix[v].length; j++) {
                u = g_adjacent_matrix[v][j];
                delta = [0, 0];
                delta[0] = g_nodes[v]["x"]-g_nodes[u]["x"];
                delta[1] = g_nodes[v]["y"]-g_nodes[u]["y"];
                if (abs(delta)) {
                    disp[v][0] -= delta[0]/abs(delta)*fa(abs(delta));
                    disp[v][1] -= delta[1]/abs(delta)*fa(abs(delta));
                }
            }
        }

        for (var v=0; v<g_nodes.length; v++) {
            g_nodes[v]["x"] += disp[v][0]/abs(disp[v])*Math.min(abs(disp[v]),g_t);
            g_nodes[v]["y"] += disp[v][1]/abs(disp[v])*Math.min(abs(disp[v]),g_t);
            g_nodes[v]["x"] = Math.min(g_width, Math.max(0, g_nodes[v]["x"]));
            g_nodes[v]["y"] = Math.min(g_height, Math.max(0, g_nodes[v]["y"]));
        }
        if(g_t>0) g_t -= g_delta_t;
    } // for
}

function init() {
    g_nodes  = g_graph["nodes"];
    g_edges  = g_graph["edges"];
    g_area   = g_width*g_height;
    g_adjacent_matrix = get_adjacent_matrix(g_graph);
    init2();
}

function init2() {
    if ($("#default_k").is(":checked")) {
        if ($("#test1").is(":checked")) {
            g_k = parseFloat(Math.sqrt(g_area/g_nodes.length)).toFixed(2);
        }
        if ($("#test2").is(":checked")) {
            g_k = parseFloat(Math.sqrt(g_area/g_nodes.length)).toFixed(2);
        }
        if ($("#test3").is(":checked")) {
            g_k = 30;
        }
    }
    $("#msg").text("[ k ] "+parseFloat(g_k).toFixed(2)+" [ t ] "+parseFloat(g_t).toFixed(2)+" [ delta_t ] "+parseFloat(g_delta_t).toFixed(2));
    $("#k").val(g_k);
}

function render() {
    var canvas = document.getElementById('example');
    // Get the rendering context for 2DCG <- (2)
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0 , 0 , g_width, g_height);
    draw_graph(ctx,g_graph);
}

function print_array(array) {
    console.log("------------------------------");
    for (var i=0; i<array.length; i++) {
        var str = ""
        for (var j=0; j<array[i].length; j++) {
            str += array[i][j]+"\t";
        }
        console.log(str+"\n");
    }
}

function print_nodes() {
    console.log("------------------------------ Nodes:");
    for (var i=0; i<g_nodes.length; i++) {
        console.log(g_nodes[i]["x"]+"\t"+g_nodes[i]["y"]+"\t\n");
    }
}

function animate() {
    requestAnimFrame(function() {
        animate();
    });
}

function mycode() {
    update_positions();
    render();
    g_tid = setTimeout(mycode, 500); // repeat myself
}

function random_cycle(n,lim_x,lim_y) { 
    var edges=[]; 
    for(var i=0;i<n;i++) 
        { 
            edge = {"target":(i+1) % n, "source":i} 
            edges.push(edge) 
        } 
    var nodes=[] 
        for(var i=0;i<n;i++) 
        { 
            var rand_x = Math.random()*lim_x+(g_width-lim_x)/2; 
            var rand_y = Math.random()*lim_y+(g_height-lim_y)/2; 
            node = {"x": rand_x, "y": rand_y} 
            nodes.push(node) 
        } 
    var g = {"nodes":nodes,"edges":edges}; 
    return g; 
}
