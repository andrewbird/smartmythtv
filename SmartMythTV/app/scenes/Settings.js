var widgetAPI = new Common.API.Widget(); // Create Common module
var tvKey = new Common.API.TVKeyValue();
var idx;
var idxMax=3;

function SceneSettings(options) {
	this.options = options;
}

SceneSettings.prototype.initialize = function () {
	$('#svecLabel_WPTS').sfLabel({text:'URL to mythweb: '});
	$('#svecButton_OK').sfButton({text:'Ok'});
	$('#svecButton_CAN').sfButton({text:'Cancel'});
	$('#svecLabel_RTUS').sfLabel({text:'Please enter IP to mythweb and mythbackend (e.g. 192.168.1.99)<br>'
		+'Use TTX/MIX or the GREEN key for . and the RED key to delete.'});
	$('#svecCheckBox_Groups').sfCheckBox();
	if(Data.startGroups){
		$('#svecCheckBox_Groups').sfCheckBox('check');
	}
	$('#svecButton_Groups').sfButton({text:'Start in Groups View'});
	idx=1;
	changestate(idx,'focus');
};

SceneSettings.prototype.handleShow = function () {
};

SceneSettings.prototype.handleHide = function () {
};

SceneSettings.prototype.handleFocus = function () {
	document.getElementById("serverip").value = Data.URL;
	startGroups=Data.startGroups;
};

SceneSettings.prototype.handleBlur = function () {
};

changestate = function(idx,action) {
	switch(idx) {
		/*case 0:
			$('#svecInput_URL').sfTextInput(action).sfTextInput("setKeypadPos",650,150,9);
			break;*/
		case 1:
			$('#svecButton_OK').sfButton(action);
			break;
		case 2:
			$('#svecButton_CAN').sfButton(action);
			break;
		case 3:
			$('#svecButton_Groups').sfButton(action);
			break;
	}
};

addchar = function(c) {
	document.getElementById("serverip").value += c;
};

SceneSettings.prototype.handleKeyDown = function (keyCode) {
	switch (keyCode) {
		case sf.key.LEFT:
		case sf.key.UP:
			changestate(idx,'blur');
			if(idx>0) {
				idx--;
			} else {
				idx=idxMax;
			}
			changestate(idx,'focus');
			break;
		case sf.key.RIGHT:
		case sf.key.DOWN:
			changestate(idx,'blur');
			if(idx<idxMax) {
				idx++;
			} else {
				idx=0;
			}
			changestate(idx,'focus');
			break;
		case sf.key.ENTER:
			switch(idx) {
				case 1: //ok
					sf.core.localData('serverip', document.getElementById("serverip").value);
					sf.core.localData('startgroups', Data.startGroups);
					if(Data.startGroups){
						Data.mainScene="Groups";
					}else{
						Data.mainScene="Recordings";
					}
					Data.URL = document.getElementById("serverip").value;
					Data.max = 0; //reload data
					//no break
				case 2: //cancel
					sf.scene.hide('Settings');
					sf.scene.show(Data.mainScene);
					sf.scene.focus(Data.mainScene);
					break;
				case 3: //groups
					if(Data.startGroups){
						Data.startGroups=0;
						$('#svecCheckBox_Groups').sfCheckBox('uncheck');
					}else{
						Data.startGroups=1;
						$('#svecCheckBox_Groups').sfCheckBox('check');
					}
					break;
			}
			break;
		case tvKey.KEY_1:
			addchar(1);
			break;
		case tvKey.KEY_2:
			addchar(2);
			break;
		case tvKey.KEY_3:
			addchar(3);
			break;
		case tvKey.KEY_4:
			addchar(4);
			break;
		case tvKey.KEY_5:
			addchar(5);
			break;
		case tvKey.KEY_6:
			addchar(6);
			break;
		case tvKey.KEY_7:
			addchar(7);
			break;
		case tvKey.KEY_8:
			addchar(8);
			break;
		case tvKey.KEY_9:
			addchar(9);
			break;
		case tvKey.KEY_0:
			addchar(0);
			break;
		case 35: //emulator
		case tvKey.KEY_TTX_MIX: //TTX
		case tvKey.SUBTITLE:
		case tvKey.KEY_GREEN:
			addchar(".");
			break;
		case tvKey.KEY_PRECH:
		case tvKey.KEY_RED:
			var value = document.getElementById("serverip").value;
			document.getElementById("serverip").value = value.substr(0, value.length-1);
			break;
	}
};
