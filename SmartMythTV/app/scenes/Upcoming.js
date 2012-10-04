function SceneUpcoming() {
	

}
var itemid=0;

SceneUpcoming.prototype.initialize = function () {
	alert("SceneUpcoming.initialize()");
	// this function will be called only once when the scene manager show this scene first time
	// initialize the scene controls and styles, and initialize your variables here 
	// scene HTML and CSS will be loaded before this function is called
	
	$('#svecImage_QTRS').sfImage({
		src:'images/mythtv.png'
	}).sfImage('show');
	
	if (Data.loadedUpcoming == 0) {
		if (Data.URL == null) {
			Data.URL = sf.core.localData("serverip");
		}
		$('#svecLoadingImage_Upcoming').sfLoading('show');
		ServiceAPI.onReceived = function() {
			alert("onReceived upcoming");
			$('#svecListbox_N9NK').sfList({
				data : Data.UpcomingList,
				index : 0
			});
			SceneUpcoming.prototype.showDescription();
			itemid=0;			
			$('#svecListbox_N9NK').sfList('focus');
			$('#svecLoadingImage_Upcoming').sfLoading('hide');
		};
		ServiceAPI.onFailed = function() {
			widgetAPI.putInnerHTML(document.getElementById("descriptionUpcoming"),
					"Failed to load data from MythTv backend");
			$('#svecLoadingImage_Upcoming').sfLoading('hide');
		};
		ServiceAPI.onDeleteCurrent = function() {
			alert("onDeleteCurrent upcoming");
			setTimeout(ServiceAPI.loadUpcoming,(5*1000));
			//Reload the data again as deleting one rule may remove multiple items
			//Delaying the reload for 5 seconds, as my mythbackend seems to a take a while to update the schedule
		};

		ServiceAPI.loadUpcoming();
	}
	
	SceneUpcoming.prototype.setHelp();
};



SceneUpcoming.prototype.setHelp = function() {
	
		$('#svecKeyHelp_Upcoming').sfKeyHelp({
			'user' : 'SmartMythTV 0.2.4',
			'red' : 'Disable Recording',
			'green' : 'Videos',
			'yellow' : 'Groups',
			'blue' : 'Recordings',
			'tools' : 'Settings',
			'return' : 'Back'
		});
	
};
SceneUpcoming.prototype.handleShow = function (data) {
	alert("SceneUpcoming.handleShow()");
	// this function will be called when the scene manager show this scene 
};

SceneUpcoming.prototype.handleHide = function () {
	alert("SceneUpcoming.handleHide()");
	// this function will be called when the scene manager hide this scene  
};

SceneUpcoming.prototype.handleFocus = function () {
	Data.mainScene = "Upcoming";	
};

SceneUpcoming.prototype.handleBlur = function () {
	alert("SceneUpcoming.handleBlur()");
	// this function will be called when the scene manager move focus to another scene from this scene
};

SceneUpcoming.prototype.handleKeyDown = function (keyCode) {
	alert("SceneUpcoming.handleKeyDown(" + keyCode + ")");
	// TODO : write an key event handler when this scene get focued
	switch (keyCode) {
		case sf.key.LEFT:
			break;
		case sf.key.RIGHT:
			break;
		case sf.key.UP:			
			$('#svecListbox_N9NK').sfList('prev');
			itemid= $('#svecListbox_N9NK').sfList('getIndex');
			SceneUpcoming.prototype.showDescription();
			break;
		case sf.key.DOWN:				
			$('#svecListbox_N9NK').sfList('next');
			itemid= $('#svecListbox_N9NK').sfList('getIndex');
			SceneUpcoming.prototype.showDescription();
			break;
		case sf.key.ENTER:
			break;
		case sf.key.RED:
			$('#svecPopup_ok_cancel_0AM8').sfPopup({
				text:'Do you really want to disable rule '+Data.UpcomingList[$('#svecListbox_N9NK').sfList('getIndex')]+'?', 
				buttons:['Yes', 'No'], 
				callback:function (rlt){
					if(rlt==0) { //Yes
						$('#svecLoadingImage_Upcoming').sfLoading('show');
						//TODO integrate "Don't record" feature, when available in backend
						ServiceAPI.disableRecordSchedule(SceneUpcoming.prototype.getRecording());
						//onDeleteCurrent will be called back
					}
				}
			});
			$('#svecPopup_ok_cancel_0AM8').sfPopup('show');
			$('#svecPopup_ok_cancel_0AM8').sfPopup('focus');
			break;
		case sf.key.GREEN: 
			sf.scene.hide('Upcoming');
			sf.scene.show('Videos');
			sf.scene.focus('Videos');
			return;
		case sf.key.YELLOW:
			sf.scene.hide('Upcoming');
			sf.scene.show('Groups');
			sf.scene.focus('Groups');
			return;
		case sf.key.BLUE:
			sf.scene.hide('Upcoming');
			sf.scene.show('Recordings');
			sf.scene.focus('Recordings');
			return;
		case sf.key.TOOLS:
			sf.scene.hide('Recordings');
			sf.scene.show('Settings');
			sf.scene.focus('Settings');
			return;
		case sf.key.N1:  //Reload
			$('#svecLoadingImage_Upcoming').sfLoading('show');
			ServiceAPI.loadUpcoming();
			$('#svecLoadingImage_Upcoming').sfLoading('hide');
			return;	
	};
};
SceneUpcoming.prototype.getRecording = function() {

	var item = $('#svecListbox_N9NK').sfList('getIndex');	
	return Data.UpcomingDetail[item];
};
//Fill the Description area with details of the selected Recording
SceneUpcoming.prototype.showDescription = function() {
	var rec = SceneUpcoming.prototype.getRecording();

	var data = "<table border><tr><td>Channel</td><td>" + rec.ChannelName
			+ "</td></tr>";	
	data = data + "<tr><td>Title</td><td>" + rec.Title + "</td></tr>";
	if (rec.SubTitle != "") {
		data = data + "<tr><td>SubTitle</td><td>" + rec.SubTitle + "</td></tr>";
	}
	data = data + "<tr><td>Start</td><td>"
			+ ServiceAPI.showDate(rec.StartTimeDate) + "</td></tr>";
	data = data + "<tr><td>End</td><td>" + ServiceAPI.showDate(rec.EndTimeDate)
			+ "</td></tr>";
	if (rec.Status == -2) {
		// Recording
		data = data + "<tr><td colspan=2>Currently recording</td></tr>";
	}
	data = data + "</table>";
	data = data + rec.Description.replace(/\n/g, '<br>');
	data = data + "</table>";
	//$('#descriptionUpcoming').sfLabel({text:data});
	widgetAPI.putInnerHTML(document.getElementById("descriptionUpcoming"),data);
};
