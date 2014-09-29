  var stage,backGroundlayer,curveLayer,controlLineLayer, controlLayer, helpLayer, quad, bezier
  var points=[],centers=[],controls=[];  
	var sharpness=0.85;
	
  $(function() {
	  var container=document.getElementById("canvas");
	  var height=container.offsetHeight;
	  var width=container.offsetWidth;
		
    stage = new Kinetic.Stage({
        container: 'canvas',
        width: width,
        height: height
    });
		
		backGroundlayer = new Kinetic.Layer({name:"curveLayer"});
		stage.add(backGroundlayer);
		
		var background = new Kinetic.Rect({
        x: 0,
        y: 0,
        width: stage.getWidth()-2,
        height: stage.getHeight()-2,
        fill: '#dddddd'
            
    });
    backGroundlayer.add(background);
    backGroundlayer.draw();
		
		
		controlLineLayer= new Kinetic.Layer({name:"controlLineLayer"});
		stage.add(controlLineLayer);
		
		
		controlLayer = new Kinetic.Layer({name:"controlLayer"});
		stage.add(controlLayer);
		
		helpLayer= new Kinetic.Layer({name:"helpLayer"});
		stage.add(helpLayer);
		
		
		var helpInfoWindow = new Kinetic.Rect({
			x:(width-500)/2,
			y:(height-300)/2,
			width: 500,
			height: 300,
			fill: '#ffffff',
			stroke: 'black',
			strokeWidth: 3,
			shadowColor:"#555555",
			shadowOffsetX:10,
			shadowOffsetY:10,
			shadowBlur:10,
			shadowOpacity:0.5
		});
		
		var helpText = new Kinetic.Text({
			x: helpInfoWindow.getAbsolutePosition().x+10,
			y: helpInfoWindow.getAbsolutePosition().y+10,
			text: 'Simple Text',
			fontSize: 20,
			fontFamily: 'Calibri',
			fill: 'black'
		});
		
		var helpInfoWindowClosImage = new Image();
		helpInfoWindowClosImage.onload = function() {
			var image = new Kinetic.Image({
				x: helpInfoWindow.getAbsolutePosition().x+helpInfoWindow.getWidth()-16,
				y: helpInfoWindow.getAbsolutePosition().y-16,
				image: helpInfoWindowClosImage,
				width: 32,
				height: 32
			});
			image.on('click', function() {
				helpLayer.hide();
			});
			helpLayer.add(image);
			helpLayer.draw();
		};
		helpInfoWindowClosImage.src = 'img/Close.png'

		helpLayer.add(helpInfoWindow);
		helpLayer.add(helpText);
		helpLayer.draw();
		
		
		stage.on("dblclick",function(){
			var pos=this.getPointerPosition();
			var newpoint=new Kinetic.Circle({radius:5,fill:"#900",stroke:"#555",strokeWidth:1,x:pos.x,y:pos.y,draggable:true});
	
			points.push(newpoint);

			controlLayer.add(newpoint);
			controlLayer.draw();
			
			centers=[];
			for(var i=0; i<points.length-1; i++){
				var p1 = points[i];
				var p2 = points[i+1];
				centers.push({x:(p1.attrs.x+p2.attrs.x)/2, y:(p1.attrs.y+p2.attrs.y)/2});
			}
			
			controls=[];
			controls.push([{x:points[0].attrs.x,y:points[0].attrs.y},{x:points[0].attrs.x,y:points[0].attrs.y}]);
			for(var i=0; i<centers.length-1; i++){
				var p1 = centers[i];
				var p2 = centers[i+1];
				var dx = points[i+1].attrs.x-(centers[i].x+centers[i+1].x)/2;
				var dy = points[i+1].attrs.y-(centers[i].y+centers[i+1].y)/2;
				controls.push([
					{
						x:(1.0-sharpness) * points[i+1].attrs.x+sharpness*(centers[i].x+dx),
						y:(1.0-sharpness) * points[i+1].attrs.y+sharpness*(centers[i].y+dy)
					},
					{
						x:(1.0-sharpness) * points[i+1].attrs.x + sharpness * (centers[i+1].x+dx),
						y:(1.0-sharpness) * points[i+1].attrs.y + sharpness * (centers[i+1].y+dy)
					}]);
				
			}
			controls.push([{x:points[points.length-1].attrs.x, y:points[points.length-1].attrs.y},{x:points[points.length-1].attrs.x, y:points[points.length-1].attrs.y}]);

			//draw control points
			controlLineLayer.clearCache();
			controlLineLayer.clear();
			controlLineLayer.destroyChildren()

			//controlLayer.clear();
			
			
			for(var i=0; i<points.length; i++){
				
				var p = {x:points[i].attrs.x,y:points[i].attrs.y};
				var c1 =controls[i][0];
				var c2 =controls[i][1];
				
				var line=new Kinetic.Line({
					points:[c1.x,c1.y,p.x,p.y,c2.x,c2.y],
					stroke:"#000099",
					strokeWidth: 2,
					lineCap: 'round',
					lineJoin: 'round',
					dash: [33, 10]
				});
				controlLineLayer.add(line);
				
				controlLineLayer.add(new Kinetic.Circle({radius:5,fill:"#009",stroke:"#555",strokeWidth:1,x:c1.x,y:c1.y,draggable:true}));
				controlLineLayer.add(new Kinetic.Circle({radius:5,fill:"#009",stroke:"#555",strokeWidth:1,x:p.x,y:p.y,draggable:true}));
				controlLineLayer.add(new Kinetic.Circle({radius:5,fill:"#009",stroke:"#555",strokeWidth:1,x:c2.x,y:c2.y,draggable:true}));
				
			}
			controlLineLayer.draw();

      });

		$("#eraser").on("click",function(){
			controlLineLayer.destroyChildren();
			controlLineLayer.clearCache();
			controlLineLayer.clear();
			
			controlLayer.destroyChildren();
			controlLayer.clearCache();
			controlLayer.clear();
			
			points=[];
			centers=[];
			controls=[]; 
			
		});
		
		$("#controlpoint").on("click",function(){
			controlLayer.isVisible()?controlLayer.hide():controlLayer.show();
			controlLineLayer.isVisible()?controlLineLayer.hide():controlLineLayer.show();
			$(this).css("opacity")==1?$(this).css("opacity",0.2):$(this).css("opacity",1);
		});
		
		$("#save").on("click",function(){
			var downloadurl=controlLayer.toDataURL({
				mimeType:"image/png"
			});
			$("#downloadlink").attr("href",downloadurl);
			$("#downloadlink").click();
			
		});
		
		$("#information").on("click",function(){
			helpLayer.show();
		});
		
	});
	function DegreeChanged(obj){
		$("#degree").text($(obj).val());
	}
