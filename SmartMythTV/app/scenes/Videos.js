var widgetAPI = new Common.API.Widget(); // Create Common module

function SceneVideos(options) {
	this.options = options;
}

SceneVideos.prototype.initialize = function() {
	$('#svecListbox_BOVI').sfList({
		itemsPerPage : 10
	});
	$('#svecScrollbar_UKVI').sfScroll({
		page : 0
	});
	$('#svecKeyHelp_O2VI').sfKeyHelp({
		'red' : 'Delete',
		'yellow' : 'Groups',
		'enter' : 'Play',
		'updown' : 'UpDown',
		'tools' : 'Settings',
		'return' : 'Back'
	});
	current = 0;
};

SceneVideos.prototype.handleShow = function() {
};

SceneVideos.prototype.handleHide = function() {
	// this function will be called when the scene manager hide this scene
};

SceneVideos.prototype.handleFocus = function() {
	Data.mainScene = "Videos";
	if(Data.maxVideos==0) {
		if(Data.URL==null) {
			Data.URL = sf.core.localData("serverip");
		}
		$('#svecLoadingImage_RBVI').sfLoading('show');
		ServiceAPI.onReceived = function() {
			$('#svecListbox_BOVI').sfList({
				data : Data.VideoTitles,
				index : current
			});
			$('#svecLoadingImage_RBVI').sfLoading('hide');
		};
		ServiceAPI.onDeleteCurrent = SceneVideos.prototype.removeCurrentRecording;
		ServiceAPI.loadVideos();
		SceneVideos.prototype.showDescription();
	}
};

SceneVideos.prototype.handleBlur = function() {
};

SceneVideos.prototype.receivedFailed = function() {
	Data.titles = [];
	Data.links = [];
	Data.Description = [];
	Data.Titles[0] = "Failed to load mythtv recordings";
	Data.Description[0] = "Failed to load mythtv recordings\nStatus: "
			+ XHRObj.status + "\nURL: " + "http://" + Data.URL + "/mythweb";
	Data.maxVideos = 1;
	current = 0;
	$('#svecListbox_BOVI').sfList({
		data : Data.titles,
		index : current
	});
	$('#svecLoadingImage_RBVI').sfLoading('hide');
	SceneVideos.showDescription();
};

/*
 * function toText(value) { return (value<10?"0":"")+value; }
 */

SceneVideos.prototype.showDescription = function() {
	var vid = SceneVideos.prototype.getVideo();
	var data = "<table border>";

	if(vid.SubTitle!="") {
		data = data + "<tr><td>SubTitle</td><td>" + vid.SubTitle + "</td></tr>";
	}
	if(vid.length>0){
		data = data + "<tr><td>Length</td><td>" + vid.length + " minutes</td></tr>";
	}	
	
	data = data + "</table>";
	data = data + vid.Description.replace(/\n/g, '<br>');	
	
	if(vid.coverart){
		var cover= "<img src=\"http://" + Data.URL + ":6544"+vid.coverart+"\" width=150>";
//		$('#cover_VI').sfImage({src:"http://" + Data.URL + ":6544"+vid.coverart});
//		$('#cover_VI').sfImage('show');
		widgetAPI.putInnerHTML(document.getElementById("cover_VI"), cover);
	}
	widgetAPI.putInnerHTML(document.getElementById("description_VI"), data);
};

SceneVideos.prototype.removeCurrentRecording = function() {
	/*
	 * current = $('#svecListbox_BOUK').sfList('getIndex');
	 * Data.Recordings.splice(current, 1); Data.Titles.splice(current, 1);
	 * Data.max--; $('#svecListbox_BOUK').sfList({data:Data.Titles,
	 * index:current});
	 */
};

SceneVideos.prototype.getVideo = function() {
	return Data.Videos[$('#svecListbox_BOVI').sfList('getIndex')];
};

SceneVideos.prototype.handleKeyDown = function(keyCode) {
	switch (keyCode) {
	case sf.key.LEFT:
		break;
	case sf.key.RIGHT:
		break;
	case sf.key.UP:
		$('#svecScrollbar_UKVI').sfScroll('prev');
		var idx = $('#svecListbox_BOVI').sfList('getIndex');
		if(idx == 0) break;
		$('#svecListbox_BOVI').sfList('prev');
		SceneVideos.prototype.showDescription();
		break;
	case sf.key.DOWN:
		$('#svecScrollbar_UKVI').sfScroll('next');
		var idx = $('#svecListbox_BOVI').sfList('getIndex');
		if(idx == Data.maxVideos) break;
		$('#svecListbox_BOVI').sfList('next');
		SceneVideos.prototype.showDescription();
		break;
	case sf.key.ENTER:
		Data.currentTitle = Data.Titles[$('#svecListbox_BOVI').sfList(
				'getIndex')];
		Data.currentVideo = SceneVideos.prototype.getVideo();
		Data.streamURL = "http://" + Data.URL + ":6544/Content/GetVideo?Id="
				+ Data.currentVideo.Id;
		sf.scene.hide('Videos');
		sf.scene.show('Player', {
			parent : "Videos"
		});
		sf.scene.focus('Player');
		break;
	case 108: // RED
		$('#svecPopup_ok_cancel_0AVI').sfPopup({
			text : 'Do you really want to delete '
				+ Data.Titles[$('#svecListbox_BOVI').sfList('getIndex')] + '?',
			buttons : [ 'Yes', 'No' ],
			callback : function(rlt) {
				if (rlt == 0) {
					$('#svecLoadingImage_RBMO').sfLoading('show');
					ServiceAPI.deleteRecording(SceneVideos.prototype
						.getRecording());
					$('#svecLoadingImage_RBMO').sfLoading('hide');
				}
			}
		});
		$('#svecPopup_ok_cancel_0AVI').sfPopup('show');
		$('#svecPopup_ok_cancel_0AVI').sfPopup('focus');
		break;
	case sf.key.YELLOW:
		sf.scene.hide('Videos');
		sf.scene.show('Groups');
		sf.scene.focus('Groups');
		break;
	case sf.key.TOOLS:
		sf.scene.hide('Videos');
		sf.scene.show('Settings');
		sf.scene.focus('Settings');
		break;
	}
};
