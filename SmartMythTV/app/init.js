
function onStart () {
	Data.URL = sf.core.localData("serverip");

	if(Data.URL==null) {
		sf.scene.show("Settings");
		sf.scene.focus("Settings");
	} else {
		Data.startGroups=sf.core.localData("startgroups");
		alert("StartGroups:"+Data.startGroups);
		if(Data.startGroups){
		    Data.mainScene = "Groups";
		}else{
			Data.mainScene="Recordings";
		}
		sf.scene.show(Data.mainScene);
		sf.scene.focus(Data.mainScene);
	}

	sf.start();
}
function onDestroy () {
	//stop your XHR or Ajax operation and put codes to distroy your application here
}

alert("init.js loaded.");
