
function onStart () {
	Data.URL = sf.core.localData("serverip");
	if(Data.URL==null) {
		sf.scene.show("Settings", {parent:'Recordings'});
		sf.scene.focus("Settings");
	} else {
		sf.scene.show("Recordings");
		sf.scene.focus("Recordings");
	}
	
	sf.start();
}
function onDestroy () {
	//stop your XHR or Ajax operation and put codes to distroy your application here
}

alert("init.js loaded.");
