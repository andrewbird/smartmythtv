var widgetAPI = new Common.API.Widget(); // Create Common module

function SceneRecordings(options) {
	this.options = options;
}

SceneRecordings.prototype.initialize = function () {
	$('#svecListbox_BOUK').sfList({itemsPerPage:10});
	$('#svecScrollbar_UKRU').sfScroll({page:0});
    $('#svecKeyHelp_O2NM').sfKeyHelp({
		'user':Data.SMARTMYTHTVVERSION,
		'red':'Delete',
		'green':'Videos',
		'yellow':'Groups',
		'blue' : 'Upcoming',
		'enter':'Play',
		'updown':'UpDown',
		'tools':'Settings',
		'return':'Back'
	});
	current = 0;
};

SceneRecordings.prototype.handleShow = function () {
};

SceneRecordings.prototype.handleHide = function () {
	// this function will be called when the scene manager hide this scene
};

SceneRecordings.prototype.handleFocus = function () {
	Data.mainScene = "Recordings";
	if(Data.loadedRecordings==0) {
		if(Data.URL==null) {
			Data.URL = sf.core.localData("serverip");
		}
		$('#svecLoadingImage_RBMO').sfLoading('show');
		ServiceAPI.onReceived = function() {
			$('#svecListbox_BOUK').sfList({data:Data.Titles, index:current});
			$('#svecLoadingImage_RBMO').sfLoading('hide');
		};
		ServiceAPI.onFailed = function() {
			$('#svecLoadingImage_RBMO').sfLoading('hide');
			ServiceAPI.onError();
		};
		ServiceAPI.onDeleteCurrent = SceneRecordings.prototype.removeCurrentRecording;
		ServiceAPI.loadRecordings();
	}
};

SceneRecordings.prototype.handleBlur = function () {
};

SceneRecordings.prototype.receivedFailed = function() {
	Data.Titles = [ ];
	Data.Recordings = [ ];
	Data.Titles[0] = "Failed to load mythtv recordings";
	var r = new Object();
	r.Description = "Failed to load mythtv recordings\nStatus: "+XHRObj.status
		+"\nURL: "+"http://"+Data.URL+":6544/";
	Data.Recordings[0] = r;
	Data.max = 1;
	current = 0;
	ServiceAPI.onReceived();
	SceneRecordings.prototype.showDescription();
};

function toText(value) {
	return (value<10?"0":"")+value;
}

SceneRecordings.prototype.showDescription = function () {
	widgetAPI.putInnerHTML(document.getElementById("description"),
			SceneRecordings.prototype.getRecording().Description.replace(/\n/g, '<br>')
		);
};

SceneRecordings.prototype.removeCurrentRecording = function () {
	current = $('#svecListbox_BOUK').sfList('getIndex');
	Data.Recordings.splice(current, 1);
	Data.Titles.splice(current, 1);
	Data.max--;
	$('#svecListbox_BOUK').sfList({data:Data.Titles, index:current});
};

SceneRecordings.prototype.getRecording = function () {
	 return Data.Recordings[$('#svecListbox_BOUK').sfList('getIndex')];
};

SceneRecordings.prototype.handleKeyDown = function (keyCode) {
	switch (keyCode) {
		case sf.key.LEFT:
			break;
		case sf.key.RIGHT:
			break;
		case sf.key.UP:
			$('#svecScrollbar_UKRU').sfScroll('prev');
			var idx = $('#svecListbox_BOUK').sfList('getIndex');
			if(idx != 0) {
				$('#svecListbox_BOUK').sfList('prev');
				SceneRecordings.prototype.showDescription();
			}
			break;
		case sf.key.DOWN:
			$('#svecScrollbar_UKRU').sfScroll('next');
			var idx = $('#svecListbox_BOUK').sfList('getIndex');
			if(idx != Data.max) {
				$('#svecListbox_BOUK').sfList('next');
				SceneRecordings.prototype.showDescription();
			}
			break;
		case sf.key.ENTER:
			Data.currentTitle = Data.Titles[$('#svecListbox_BOUK').sfList('getIndex')];
			Data.currentRecording = SceneRecordings.prototype.getRecording();
			Data.streamURL = "http://"+Data.URL+":6544/Content/GetRecording?ChanId="
				+Data.currentRecording.ChanId+"&StartTime="+Data.currentRecording.StartTime;
			sf.scene.hide('Recordings');
			sf.scene.show('Player',{parent:"Recordings"});
			sf.scene.focus('Player');
			break;
		case 108: //RED
			$('#svecPopup_ok_cancel_0AM7').sfPopup({
				text:'Do you really want to delete '+Data.Titles[$('#svecListbox_BOUK').sfList('getIndex')]+'?',
				buttons:['Yes', 'No'],
				callback:function (rlt){
					if(rlt==0) {
						$('#svecLoadingImage_RBMO').sfLoading('show');
						ServiceAPI.deleteRecording(SceneRecordings.prototype.getRecording());
						$('#svecLoadingImage_RBMO').sfLoading('hide');
					}
				}
			});
			$('#svecPopup_ok_cancel_0AM7').sfPopup('show');
			$('#svecPopup_ok_cancel_0AM7').sfPopup('focus');
			break;
		case 20: //GREEN
			sf.scene.hide('Recordings');
			sf.scene.show('Videos');
			sf.scene.focus('Videos');
			break;
		case 21: //YELLOW
			sf.scene.hide('Recordings');
			sf.scene.show('Groups');
			sf.scene.focus('Groups');
			break;
		case sf.key.TOOLS:
			sf.scene.hide('Recordings');
			sf.scene.show('Settings');
			sf.scene.focus('Settings');
			break;
		case sf.key.BLUE:
			sf.scene.hide('Recordings');
			sf.scene.show('Upcoming');
			sf.scene.focus('Upcoming');
			return;
	}
};
