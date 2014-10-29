/*

*/

var keyControlLayer;
var controlLineLayer;
var gridLayer;
var curveLineLayer;
var points=[];
var tool;
var operation="edit";

$(function () {
    $("#canvas").css("cursor", "url(img/pencil-cursor.png) 0 0,auto");
    Bspline.Linecolor = $("#color").val();
    Bspline.Linewidth = $("#size").val();
    Bspline.CurveType = $("#curvetype").val();
    Bspline.Degree = parseInt($("#degree").val());
    Bspline.Tessellation = $("#tessellation").val();

    var canvas = document.getElementById('canvas');
    var height =$("#canvas").height();
    var width = $("#canvas").width();
    paper.setup(canvas);

    
    gridLayer = new paper.Layer();
    gridLayer.activate();

   
    var blocksize = height / 20;
    var drawy = false;
    var drawx = false;
    for (var i = 1; i < width / blocksize; i++) {
       
        var linex = new paper.Path();
        if (i * blocksize > ((width / 2) - blocksize) && i * blocksize < (width / 2 + blocksize) && !drawy) {
            linex.strokeColor = 'black';
            linex.strokeWidth = 2;
            drawy = true;
        }
        else {
            linex.strokeColor = '#999999';
            linex.strokeWidth = 1;
        }
        linex.moveTo([i * blocksize, 0]);
        linex.lineTo([i*blocksize, height]);

    }
    for (var i = 1; i < height / blocksize; i++) {
        var liney = new paper.Path();
        
        if (i * blocksize > ((height / 2) - blocksize) && i * blocksize < (height / 2 + blocksize) && !drawx) {
            liney.strokeColor = 'black';
            liney.strokeWidth = 2;
            drawx = true;
        }
        else {
            liney.strokeColor = '#999999';
            liney.strokeWidth = 1;
        }
        liney.moveTo([0, i * blocksize]);
        liney.lineTo([width, i * blocksize]);

    }

    gridLayer.visible = false;
    paper.view.update();
    

    curveLineLayer = new paper.Layer();
    curveLineLayer.activate();

    controlLineLayer = new paper.Layer();
    controlLineLayer.activate();

    keyControlLayer = new paper.Layer();
    keyControlLayer.activate();

    
    InitStage();

    tool = new paper.Tool();
    tool.onMouseDown = onMouseDown;

    $("#newpoint").on("click", function () { operation = "edit"; $("#canvas").css("cursor", "url(img/pencil-cursor.png) 0 0,auto"); });
    $("#movepoint").on("click", function () { operation = "move"; $("#canvas").css("cursor", "url(img/move_cursor.png) 0 0,auto"); });
    $("#eraser").on("click", Erase);
    $("#controlpoint").on("click", ToggleControlPoints);
    $("#save").on("click", SaveAsImage);
    $("#information").on("click", ToggleHelpWindow);
    $("#curvetype").on("change", function () { Bspline.CurveType = $(this).val(); DrawCurve(); paper.view.update(); });
    $("#color").on("change", function () { Bspline.LineColor = $(this).val(); curveLineLayer.children[0].strokeColor = Bspline.LineColor; paper.view.update(); });
    $("#size").on("change", function () { Bspline.LineWidth = $(this).val(); curveLineLayer.children[0].strokeWidth = Bspline.LineWidth; paper.view.update(); });
    $("#degree").on("change", function () { Bspline.Degree = parseInt($(this).val()); DrawCurve(); paper.view.update(); });
    $("#btCloseButton").on("click", function () { ToggleHelpWindow() });
    $("#rendermethod").on("change", function () { Bspline.RenderMethod = $(this).val(); DrawCurve(); paper.view.update(); });
    $("#grid").on("click", function () {ToggleGridLayer();
    });
});

function onMouseDown(event) {
    if (operation == "edit") {
        
        var controlPoint = new paper.Path.Circle({
            center: [event.point.x, event.point.y],
            radius: 10
        });
        controlPoint.strokeColor = '#ff0000';
        controlPoint.fillColor = 'blue';
        controlPoint.onMouseDrag = function (event) {
            if (operation == "move") {
                this.position = event.point;
                DrawControlLine();
                DrawCurve();
            }
        }

        points.push(controlPoint);
        keyControlLayer.addChild(controlPoint);
       
        DrawControlLine();
        DrawCurve();
    }
}

function DrawControlLine() {
    controlLineLayer.children[0].removeSegments();
    var segments = [];
    for (var i = 0; i < points.length; i++) {
        segments.push(points[i].position);
    }
    controlLineLayer.children[0].addSegments(segments);
}

function DrawBezierCurve() {
    Bspline.ControlPoints = [];
    for (var i = 0; i < points.length; i++) {
        Bspline.ControlPoints.push({ x: points[i].position.x, y: points[i].position.y });
    }
	if (points.length > 1) {
	    Bspline.CalculateCurvePoint("bezier");
	    if (curveLineLayer.children[0] == undefined) {
	        curveLineLayer = new paper.Layer();
	        curveLineLayer.activate();

	        var curvelLine = new paper.Path({
	            segments: Bspline.CurvePoints
	        });

	        curvelLine.strokeColor = linecolor;
	        curvelLine.strokeWidth = linewidth;
	        curveLineLayer.addChild(curvelLine);
	    }
	    else {
	        curveLineLayer.children[0].removeSegments();
	        curveLineLayer.children[0].addSegments(Bspline.CurvePoints);
	    }
	}
}

function DrawBSplineCurve() {
    Bspline.ControlPoints = [];

    for(var i=0;i<points.length;i++){
        Bspline.ControlPoints.push({ x: points[i].position.x, y: points[i].position.y });
    }
    
    Bspline.CalculateCurvePoint("bspline");

    if (curveLineLayer.children[0] == undefined) {
        curveLineLayer = new paper.Layer();
        curveLineLayer.activate();

        var curvelLine = new paper.Path({
            segments: Bspline.CurvePoints
        });

        curvelLine.strokeColor = Bspline.LineColor;
        curvelLine.strokeWidth = Bspline.LineWidth;
        curveLineLayer.addChild(curvelLine);
    }
    else {
        curveLineLayer.children[0].removeSegments();
        curveLineLayer.children[0].addSegments(Bspline.CurvePoints);
    }
}

function DrawCurve() {
    if (points.length > 1) {
        if (Bspline.CurveType == "bspline") {
            DrawBSplineCurve();
        }
        else {
            DrawBezierCurve();
        }
    }
}

function ToggleGridLayer() {
    gridLayer.visible = !gridLayer.visible;
    paper.view.update();
    $("#grid").css("opacity") <1 ? $("#grid").css("opacity", 1) : $("#grid").css("opacity", 0.2);

}

function ToggleControlPoints() {
    keyControlLayer.visible = !keyControlLayer.visible;
    controlLineLayer.visible = !controlLineLayer.visible;
    paper.view.update();
    $("#controlpoint").css("opacity") == 1 ? $("#controlpoint").css("opacity", 0.2) : $("#controlpoint").css("opacity", 1);
}

function TessellationChanged(obj) {
    $("#TessellationCount").text($(obj).val());
    Bspline.Tessellation = $(obj).val();
    DrawCurve();
    paper.view.update();
}

function Erase() {
    keyControlLayer.clear();
    controlLineLayer.clear();
    curveLineLayer.clear();
    points = [];
    paper.view.update();
    InitStage();
}

function InitStage() {
    var controlLine = new paper.Path({
        segments: []
    });
    controlLine.strokeColor = "#999999";
    controlLine.strokeWidth = 1;
    controlLineLayer.addChild(controlLine);

    var curvelLine = new paper.Path({
        segments: []
    });
    curvelLine.strokeColor = Bspline.LineColor;
    curvelLine.strokeWidth = Bspline.LineWidth;
    curveLineLayer.addChild(curvelLine);
}

function ToggleHelpWindow()
{
    var wraperWidth = $("#wrapper").width();
    var selfWidth = $("#helpwindow").width();
    $("#helpwindow").css("top", "160px");
    $("#helpwindow").css("left", (wraperWidth - selfWidth)/2+"px");
    $("#helpwindow").toggle();

}

function SaveAsImage() {
    window.open(paper.view.element.toDataURL());
}
