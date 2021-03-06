/* global Printer */

var percent = 0;
var seconds = 0;
var offset = 0;
var gltest;
// get a single cookie from this domains cookies
function getCookieValue(cookieName)
{
 var value=null;
 if(document.cookie !== "") 
 {
  cookieName=cookieName+"=";
  
  var start=document.cookie.indexOf(cookieName);
  if(start>=0) 
  {
   start=start+cookieName.length;
   
   var end=document.cookie.indexOf(";", start);
   if(end<0) end=document.cookie.length;
   
   value=document.cookie.substring(start,end);
   value=unescape(value);
  }
 }
 return value;
}


// the main reprap printer UI controller
Printer=new function(){

	// if the server is currently connected to a printer
	this.connected=false;

	// the mesh currently previewed, if any
	this.mesh=null; 

	// load a .stl or .gcode file for preview
	this.load=function(file){
		localStorage.gcode_name=file.name;
		document.getElementById('filename').innerHTML=file.name;
		localStorage.session=this.getSession();
		//document.getElementById('slicingStyle').innerHTML='.sliced{visibility: hidden;}';
		var reader=new FileReader();
		reader.onload=function(e){
			var text=e.target.result;
			var suffix=file.name.substring(file.name.lastIndexOf('.'));
			if(suffix=='.gcode') {
				Printer.uploadGcode(text);
				if(gltest!=null){
					if(confirm('Produce 3D gcode preview of '+file.name+' ?')==true){
						document.getElementById('gcode_name').innerHTML='<i>working...</i>';
						Printer.onSliced(text);
						document.getElementById('gcode_name').innerHTML=localStorage.gcode_name;
						Printer.console.value+='\n>Finished producing 3D g-code preview for '+filename;
						tabs('3D_tab','3D');
					}
				}
			} else {
				alert('Bad file type '+suffix);
			}
		}
		reader.onerror=function(e){
			alert(e.message);
		}
		reader.readAsText(file);
	}

// issue a http POST request and call callback on response
	this.httpPost=function(path,data, callback){
		var req = new XMLHttpRequest();
		req.overrideMimeType ( "text / plain"); 
		req.onreadystatechange = function () {
			if (req.readyState == 4) {
				if(req.status!=200) {
						alert("POST failed in "+path+", server response:\n"+req.responseText);
				}
				callback(req.responseText);
			}
		};
		var formData=new FormData();
		for(key in data)
		formData.append(key, data[key]);

		req.open('POST',path, true);
		req.send(formData);
	}

	// issue a http GET request and call callback on response
	// relates to serve_state in webserver.py
	this.httpGet=function(path,callback){
		var req = new XMLHttpRequest();
		req.onreadystatechange = function () {
			if (req.readyState == 4) {
				//alert(req.responseText);
				callback(req.responseText);
			}
		};
		req.open('GET',path, true);
		req.send(null);
	}

	// set progress indicator to given value and caption
	// a value of 0 (nothing in progress) and 1 (completed) hides the indicator.
	this.progress=function(caption, p, time, offset){
		var indic		 =document.getElementById('progress');
		var bar		   =document.getElementById('progressBar');
		var captionElement=document.getElementById('progressName');
		var string;
		if(!caption) {
			string='';
		} else {
			string = parseInt(p*100)+'%';
		}
		if(time!=0){
			var t = new Date(1970,0,1);
			t.setSeconds(time);
			string+=' | '+t.toTimeString().substr(0,8)+' elapsed';
		}
		if(offset!=0 && (parseInt(p*100)>2)){
			var t = new Date(1970,0,1);
			if(percent==p){
				seconds--;
				t.setSeconds(seconds);
			} else {
				seconds=((time-offset)/p)-(time-offset);
				//alert('time: '+time+'\noffset: '+offset+'\ncalculated seconds: '+seconds);
				t.setSeconds(seconds);
				percent=p;
			}				
			string+=' | '+t.toTimeString().substr(0,8)+' remaining';
			var t = new Date(1970,0,1);
			var total = parseInt(time)+parseInt(seconds);
			t.setSeconds(total);
			//alert('t: '+time+' + s: '+seconds+' = '+time
			string+=' | '+t.toTimeString().substr(0,8)+' total predicted';
		} else {
			
		}
		captionElement.innerHTML=string;
		if (!p || p>0.99) indic.style.display='none';
		else			indic.style.display='block';
		if(p==1) p=0;
		if(p<0.02) p=0.02;
		bar.style.width=(p*100)+'%';
	}

	// poll /state for UI feedback of printer and slicing state
	this.checkState=function(){
			Printer.httpGet('state',function(result){
				Printer.onState(result);
			});
			Printer.httpGet('temp', function(result){
				//Printer.onState(result);
			});
			Printer.httpGet('posi', function(result){
				//Printer.onState(result);
			});
			window.setTimeout(function(e){Printer.checkState();},1000);
	}

	// callback to handle a state report from the server
	this.onState=function(response){
		this.state=JSON.parse(response);
		// set progress indicator by ongoing server processes
		this.onProgress(this.state.progress);

		// all boolean state properties are reflected by a visibility CSS class 
		// named .property or .not_property that can be used to show/hide UI elements 
		// depending on state
		var stateStyle="";
		for(key in this.state){
			if	  (this.state[key]===false) {
				stateStyle+="."+key+"{visibility: hidden;}\n"
			} else if (this.state[key]===true ) {
				stateStyle+=".not_"+key
				+"{visibility: hidden;}\n";
			}
		}
		var stateElement=document.getElementById('stateStyle');
		if (stateStyle!=stateElement.innerHTML) stateElement.innerHTML=stateStyle;
	}

	// handle a progress change
	this.onProgress=function(response){
		if(!response) response='Idle 0';
		var parts=response.split(' ');
		var caption=parts[0];
		var progress=parseInt(parts[1]);
		var time=0;
		var offset=0;
		if(progress > 0){
			time=parts[2];
			offset=parts[3];
		}
		this.progress(caption, progress/100, time, offset);
	}

	// upload a ready made .gcode 
	this.uploadGcode=function(text){
		// create callback to give feedback and complete progress indicator
		var onUploaded=function(response){
			Printer.console.value+="\nUploaded.\n";
			Printer.progress();
		}

		// issue .gcode upload request
		this.httpPost('upload',{'gcode':text}, onUploaded);
		this.console.value+="\nUploading gcode...\n";
		Printer.progress("Uploading gcode...",.5);
	}

	// issue G1 gcode to send printer to location given by goto form
	this.goto=function(form){
		var cmd="G1 X"+form.X.value+" Y"+form.Y.value+" Z"+form.Z.value+" E"+form.E.value;
		this.cmd(cmd);
	}

	// get session id from cookie
	this.getSession=function(){
		return getCookieValue("session");
	}

	// issue print command 
	this.print=function(){
		var session=this.getSession();

		this.console.value+="\nPrinting... (this might take a few seconds to start)\n";
		// issue pronsole command
		this.cmd("load tmp/"+session+".gcode\nprint");
	}
	
	// issue pronsole command, calling callback on completion
	// only native pronsole commands like connect, pause etc. give a valid response
	// as printer comamnds like gcodes are handled in background and their responses
	// must be read by fetching the printer log at /printer
	this.cmd=function(cmd,callback){
		var console=document.getElementById('console');
		if(!callback) console.value+="\n>"+cmd+"\n";
		if(!callback) callback=function(response){Printer.onCmd(response)};
		this.httpGet('pronsole?cmd='+encodeURI(cmd), callback);
	}
	
	// default callback for pronsole commands 
	// append the result to console textarea
	this.onCmd=function(result){
		var console=document.getElementById('console');
		console.value+=result;
		console.scrollTop = console.scrollHeight;
	}
		
	// slicing completed handler
	// the received gcode is parsed and a line mesh is build to preview the printer pathes
	this.onSliced=function(gcode){
		this.gcode=gcode;

		// create a line mesh
		var mesh = new GL.Mesh({ triangles: false, lines: true, colors: false });

		// parse gcode and add lines
		var pos={'X':0.0, 'Y':0.0, 'Z':0.0};
		var lines=gcode.split("\n");
		var index=0;
		for(var i=0; i<lines.length; i++)
		{
			var line=lines[i];
			var parts=line.split(" ");
			if(parts[0]=='G1'){
				var epos=line.indexOf('E',0);
				//alert(epos+'\n'+line)
				for(var j=1; j<parts.length; j++){
					var part=parts[j];
					var axis=part.substr(0,1);
					var value=parseFloat(part.substr(1));
					pos[axis]=value;
				}
				mesh.vertices.push([pos.X-100, pos.Y-100, pos.Z]);
				if(index>0) {
					if(epos>=15){
						mesh.lines.push([index-1, index]);
						//mesh.colors.push(1,0,0,1);
					}
				}
				index++;
			}
		}
		mesh.compile();
		this.mesh=mesh;
		// show mesh
		this.update();
		document.getElementById('slicingStyle').innerHTML='';
	}
	
	// establish connection to printer
	this.connect=function(){
		// issue pronsole connect command
		this.cmd('connect');			
	}

	// repeatedly poll printer output buffer from server
	// this is done every second if a printer is connected, and every 10 seconds
	// if not, as connecting takes about 10s to succeed. 
	// TODO it would be better to let the server retry the printer connection, or
	// to retry connect indipendently of the check polling so we can poll the state 
	// as often we like to stay responsive for printerless use (eg. slicing).
	this.check=function(){
		// issue /check request, calling onCheck on response
		Printer.httpGet('printer',function(result){
			Printer.onCheck(result);
		});

		if(!this.connected) {
			// not connected to the printer, try to connect and check again in 10s
			window.setTimeout(function(e){Printer.check();},1000);
		} else {
			// the printer is connected, check again in one second
			window.setTimeout(function(e){Printer.check();},1000);
		}
	}

	// printer output response handler
	// refreshes the this.connected state and corresponding UI
	// adds messages to the console textarea
	this.onCheck=function(result){
		
			if(result === ''){
				console.error("Disconnected from Printer")
				//this.connect();
			}
		
		
			var lines=result.split('\n')			
			for(var i=0; i<lines.length; i++){
				var line=lines[i];
				if(!line) {
					continue;
				} else if(line.substr(0,4) == "ok T"){ // normal temp m105 feedback
					var exa = document.getElementById('exa');
					var ext = document.getElementById('ext');
					var bea = document.getElementById('bea');
					var bet = document.getElementById('bet');
					var pieces=line.split(" ");
					exa.innerHTML=pieces[1].substr(2);
					ext.innerHTML=pieces[2].substr(1);
					bea.innerHTML=pieces[3].substr(2);
					bet.innerHTML=pieces[4].substr(1);
					bea.className="actual_temp";
					exa.className="actual_temp";
				} else if(line.substr(0,2) == "T:"){ // bed or extruder heating alternate feedback					
					var exa = document.getElementById('exa');
					var ext = document.getElementById('ext');
					var bea = document.getElementById('bea');
					var bet = document.getElementById('bet');
					var pieces=line.split(" ");
					exa.innerHTML=pieces[0].substr(2);
					if(pieces[2].substr(0,1)=='B'){
						bea.innerHTML=pieces[2].substr(2);
						bea.className="active_temp";
						exa.className="actual_temp";
					} else {
						exa.className="active_temp";
						bea.className="actual_temp";
					}
				} else if(line.substr(0,2) == 'X:'){ // m114 feedback
					var xpos = document.getElementById('xpos');
					var ypos = document.getElementById('ypos');
					var zpos = document.getElementById('zpos');
					var pieces=line.split(":");
					xpos.innerHTML=pieces[1].substr(0,pieces[1].length-1);
					ypos.innerHTML=pieces[2].substr(0,pieces[2].length-1);
					zpos.innerHTML=pieces[3].substr(0,pieces[3].length-1);
				} else if(line.indexOf('ok ')==0){ //|| (line.substr(0,4) == "ok T")) {
					// we received an 'ok', so consider the printer connected
					this.connected=true;
					document.getElementById('connection'	 ).innerHTML='connected';
					document.getElementById('connectionStyle').innerHTML='';
				} else if(line!='ok'){
					// echo printer output to console textarea
					this.console.value+=line+"\n";
					this.console.scrollTop=this.console.scrollHeight;
				}
		}
	}

	// request server /cancel 
	// this cancels the current operation, that may be a slicing or printing operation
	this.cancel=function(){
			this.httpGet('cancel');
	}
	
	// update the 3d preview to show our current mesh
	this.update=function(){
		viewer.mesh=this.mesh;
		// adjust camera to show anything
		viewer.showAll();
		viewer.gl.ondraw();
	}

	// attach this Printer controller to a HTML UI
	// the html need to provide several UI elements and classes
	// see index.html 
	this.attach=function(){
//WEBGL NOT WORKING ON PI
//		var canvas = document.getElementById('gltest');
//		try { gltest = canvas.getContext("webgl"); }
//    	catch (x) { gltest = null;}

//   	 	if (gltest == null) {
//       	try { gltest = canvas.getContext("experimental-webgl");}
//        	catch (x) { gltest = null;}
//    	}
//		if(gltest != null){
//			var viewPane=document.getElementById('view');
//			if(viewPane) {
//				viewer = new Viewer(viewPane);
//				viewer.showAll();
//			}
//		} else {
//			alert('Webgl not supported!\n3D g-code preview disabled. Please upgrade to a newer browser:\nhttp://get.webgl.org');
//		}
		
		
		this.console=document.getElementById('settingsConsole');
		var Printer=this;
		restoreValues();
		this.check();
		this.checkState();
		//load_gcode();
	}
}

function tabs(activeTab, targetTab) {
	// change active container
	var containerdiv = document.getElementById('container');
	var panels = containerdiv.getElementsByTagName('div');
	for(var i=0; i<panels.length; i++){
		if((panels[i].className =='panel_hidden') || (panels[i].className == 'panel_showing')){
			panels[i].className="panel_hidden";
		}
	}
	document.getElementById(targetTab).className="panel_showing";
	// change active tab
	var tabdiv = document.getElementById('tabs');
	var tabs = tabdiv.getElementsByTagName('div');
	for(var i=0; i<tabs.length; i++){
		tabs[i].className="inactive_tab";
	}
	document.getElementById(activeTab).className="active_tab";
	if(gltest!=null){
		viewer.resize();
	}
}

function mov(axis, distance) {
	var feed = '';
	Printer.cmd('G91');
	if(axis == 'Z') {
		feed = '300';
	} else {
		feed = '3000';
	}
	window.setTimeout(function(){Printer.cmd('G1 '+axis+distance+' F'+feed)},50);
}

function ext(direction, distance, feed) {
	Printer.cmd('G91');
	if(direction == 'retract'){
		window.setTimeout(function(){Printer.cmd('G1 E-'+distance+' F'+feed)},50);
	} else {
		window.setTimeout(function(){Printer.cmd('G1 E'+distance+' F'+feed)},50);
	}
}

function heat(heater, temp) {
	if(heater == 'bed'){
		Printer.cmd('M140 S'+parseInt(temp));
	} else {
		Printer.cmd('M104 S'+parseInt(temp));
	}
}

function fullscreen(){
	if((screen.availWidth == window.innerWidth) && (screen.height == window.innerHeight)){
		cancelFullscreen();
	} else {
		launchFullScreen(document.documentElement);
	}
}

// Find the right method, call on correct element
function launchFullScreen(element) {
  if(element.requestFullScreen) {
    element.requestFullScreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen();
  }
}

function cancelFullscreen() {
  if(document.cancelFullScreen) {
    document.cancelFullScreen();
  } else if(document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if(document.webkitCancelFullScreen) {
    document.webkitCancelFullScreen();
  }
}

function load_gcode(){
	Printer.httpGet('gcode',function(file){
		if(file.search('Error response')==-1){
			var sessions = Printer.getSession();
			if(sessions == localStorage.session){
				var filename = localStorage.gcode_name
			} else {
				var filename = sessions+'.gcode';
			}
			document.getElementById('filename').innerHTML=filename;
			Printer.console.value+='\n>Loaded previous file '+filename;
			if(gltest!=null){
				if(confirm('Produce 3D gcode preview of '+filename+' ?')== true){
					document.getElementById('gcode_name').innerHTML='<i>working...</i>';
					Printer.onSliced(file);
					document.getElementById('gcode_name').innerHTML=filename;
					Printer.console.value+='\n>Finished producing 3D g-code preview for '+filename;
					tabs('3D_tab','3D');
				}
			}
		} else {
			alert('No previous file stored on server, please upload a g-code file.');
		}
	})
}

function testStorage(){
	try {
		localStorage.setItem('foo','bar');
        localStorage.removeItem('foo');
		return true;
	} catch(e){
		return false;
	}
}

function restoreValues(){
	var ext = document.heater.t_extruder;
	var bet = document.heater.t_bed;
	var dis = document.extrusion.distance;
	var fee = document.extrusion.feed;
	if(testStorage()==true){
		if(localStorage.stored=='yes'){
			ext.value = localStorage.ext;
			bet.value = localStorage.bet;
			dis.value = localStorage.dis;
			fee.value = localStorage.fee;
		} else {
			localStorage.stored='yes';
			localStorage.ext = 215;
			localStorage.bet = 115;
			localStorage.dis = 10;
			localStorage.fee = 100;
		}
	}
	
}
