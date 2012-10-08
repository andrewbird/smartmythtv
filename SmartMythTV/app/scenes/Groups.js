function SceneGroups(options) {
	this.options = options;
}
var widgetAPI = new Common.API.Widget(); // Create Common module
var level = 0;
var groupid = 0;
var itemid=0;

SceneGroups.prototype.initialize = function() {
	$('#svecListbox_GOUK').sfList({
		itemsPerPage : 10
	});
	$('#svecScrollbar_GKRU').sfScroll({
		page : 0
	});
	level = 0;
	if (Data.loadedGroups == 0) {
		if (Data.URL == null) {
			Data.URL = sf.core.localData("serverip");
		}
		$('#svecLoadingImage_GBMO').sfLoading('show');
		ServiceAPI.onReceived = function() {
			$('#svecListbox_GOUK').sfList({
				data : Data.GroupsList,
				index : 0
			});
			groupid = 0; itemid=0;			
			$('#svecListbox_GOUK').sfList('focus');
			$('#svecLoadingImage_GBMO').sfLoading('hide');
		};
		ServiceAPI.onFailed = function() {
			widgetAPI.putInnerHTML(document.getElementById("descriptionGroups"),
					"Failed to load data from MythTv backend<br>Status: "+XHRObj.status
					+"<br>URL: "+"http://"+Data.URL+":6544/");
			$('#svecLoadingImage_GBMO').sfLoading('hide');
		};

		ServiceAPI.loadGroups();
	}
	SceneGroups.prototype.Level0();
	
};

SceneGroups.prototype.setHelp = function() {
	if (level == 0) {
		$('#svecKeyHelp_G2NM').sfKeyHelp({
			'user' : 'SmartMythTV 0.2.4',
			'green' : 'Videos',
			'NO1' : 'Refresh',
			'yellow' : 'Recordings',
			'blue' : 'Upcoming',
			'enter' : 'Select',
			'tools' : 'Settings',
			'return' : 'Back'
		});
	} else {
		$('#svecKeyHelp_G2NM').sfKeyHelp({
			'user' : 'SmartMythTV 0.2.4',
			'red' : 'Delete',
			'green' : 'Videos',
			'yellow' : 'Recordings',
			'blue' : 'Upcoming',
			'enter' : 'Play',			
			'return' : 'Back'
		});
	}
};
SceneGroups.prototype.handleShow = function() {
};

SceneGroups.prototype.handleHide = function() {
	// this function will be called when the scene manager hide this scene
};
SceneGroups.prototype.handleFocus = function() {
	Data.mainScene = "Groups";	
	ServiceAPI.onDeleteCurrent = SceneGroups.prototype.removeCurrentRecording;
};

SceneGroups.prototype.handleBlur = function() {
};

SceneGroups.prototype.handleKeyDown = function(keyCode) {

	switch (keyCode) {
	case 20: // GREEN
		sf.scene.hide('Groups');
		sf.scene.show('Videos');
		sf.scene.focus('Videos');
		return;
	case sf.key.YELLOW:
		sf.scene.hide('Groups');
		sf.scene.show('Recordings');
		sf.scene.focus('Recordings');
		return;
	case sf.key.TOOLS:
		sf.scene.hide('Groups');
		sf.scene.show('Settings');
		sf.scene.focus('Settings');
		return;
	case sf.key.BLUE:
		sf.scene.hide('Groups');
		sf.scene.show('Upcoming');
		sf.scene.focus('Upcoming');
		return;
	case sf.key.N1:
		$('#svecLoadingImage_GBMO').sfLoading('show');
		ServiceAPI.loadGroups();
		$('#svecLoadingImage_GBMO').sfLoading('hide');
		return;
	}
	;

	if (level == 0) {
		switch (keyCode) {
		case sf.key.LEFT:			
			break;
		case sf.key.RIGHT:
		case sf.key.ENTER:
		case sf.key.PLAY:
			//Select a level 0 item from Group, now change the list to be All the titles in that group and move to level 1
			itemid=0;
			SceneGroups.prototype.Level1();
			break;
		case sf.key.UP:
			//Show previous item in level 0 list			
			$('#svecScrollbar_GKRU').sfScroll('prev');
			$('#svecListbox_GOUK').sfList('prev');
			groupid = $('#svecListbox_GOUK').sfList('getIndex');
			break;
		case sf.key.DOWN:
			//Show next item in level 0 list			
			$('#svecScrollbar_GKRU').sfScroll('next');
			$('#svecListbox_GOUK').sfList('next');
			groupid = $('#svecListbox_GOUK').sfList('getIndex');
			break;

		}
	} else {
		//level 1, items in the group
		switch (keyCode) {
		case sf.key.LEFT:
		case sf.key.BACK:
		case sf.key.RETURN:
			//Go back to previous level, show all the groups
			SceneGroups.prototype.Level0();
			break;
		
		case sf.key.UP:
			$('#svecScrollbar_GKRU').sfScroll('prev');		
			$('#svecListbox_GOUK').sfList('prev');
			itemid= $('#svecListbox_GOUK').sfList('getIndex');
			SceneGroups.prototype.showDescription();
			break;
			
		case sf.key.DOWN:
			$('#svecScrollbar_GKRU').sfScroll('next');			
			$('#svecListbox_GOUK').sfList('next');
			itemid= $('#svecListbox_GOUK').sfList('getIndex');
			SceneGroups.prototype.showDescription();
			break;
			
		case sf.key.RIGHT:
		case sf.key.ENTER:
		case sf.key.PLAY:
			//Play the selected item
			Data.currentRecording = SceneGroups.prototype.getRecording();
			Data.currentTitle = Data.currentRecording.Title;
			Data.streamURL = "http://" + Data.URL
					+ ":6544/Content/GetRecording?ChanId="
					+ Data.currentRecording.ChanId + "&StartTime="
					+ Data.currentRecording.StartTime;
			sf.scene.hide('Groups');
			sf.scene.show('Player', {
				parent : "Groups"
			});
			sf.scene.focus('Player');
			break;
			
		case sf.key.RED:
			//Delete the selected item
			$('#svecPopup_ok_cancel_GAM7')
					.sfPopup(
							{
								text : 'Do you really want to delete '
										+ SceneGroups.prototype.getRecording().Title
										+ '?',
								buttons : [ 'Yes', 'No' ],
								callback : function(rlt) {
									if (rlt == 0) {
										$('#svecLoadingImage_GBMO').sfLoading(
												'show');
										ServiceAPI
												.deleteRecording(SceneGroups.prototype
														.getRecording());
										$('#svecLoadingImage_GBMO').sfLoading(
												'hide');										
										
									}
								}
							});
			$('#svecPopup_ok_cancel_GAM7').sfPopup('show');
			$('#svecPopup_ok_cancel_GAM7').sfPopup('focus');
			break;

		}
	}
	
};

SceneGroups.prototype.Level0 = function() {
	$('#svecListbox_GOUK').sfList('clear');
	$('#svecListbox_GOUK').sfList({
		data : Data.GroupsList,
		index : groupid
	});
	$('#svecListbox_GOUK').sfList('focus');
	level = 0;
	SceneGroups.prototype.setHelp();
	$('#descriptionGroups').sfLabel('destroy');
	widgetAPI.putInnerHTML(document.getElementById("descriptionGroups"),
			"");
};

SceneGroups.prototype.Level1 = function() {
	
	alert("Going to groupid:" + groupid);
	$('#svecListbox_GOUK').sfList('clear');
	$('#svecListbox_GOUK').sfList({
		data : Data.GroupsGroupTitles[groupid],
		index : itemid
	});
	$('#svecListbox_GOUK').sfList('move', 0);
	$('#svecListbox_GOUK').sfList('focus');
	SceneGroups.prototype.showDescription();
	level = 1;
	SceneGroups.prototype.setHelp();
	$('#svecScrollbar_GKRU').sfScroll({
		page : 0
	});
	
};


// Fill the Description area with details of the selected Recording
SceneGroups.prototype.showDescription = function() {
	var rec = SceneGroups.prototype.getRecording();

	var data = "<table border><tr><td>Channel</td><td>" + rec.ChannelName
			+ "</td></tr>";
	data = data + "<tr><td>Size</td><td>"
			+ ServiceAPI.readableBytes(rec.FileSize) + "</td></tr>";
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
	//$('#descriptionGroups').sfLabel({text:data});
	widgetAPI.putInnerHTML(document.getElementById("descriptionGroups"),data);
};

// Find the current Recording

SceneGroups.prototype.getRecording = function() {

	var item = $('#svecListbox_GOUK').sfList('getIndex');
	var fileName = Data.GroupsRecordings[groupid][item].FileName;
	alert("GetRecording returning groupid=" + groupid + " item=" + item
			+ " Filename=" + fileName);
	return Data.GroupsRecordings[groupid][item];
};

SceneGroups.prototype.removeCurrentRecording = function() {
	
	if (Data.GroupsGroupTitles[groupid].length == 1) {
		//Last one in this group, so remove the group from level0
		Data.GroupsList.splice(groupid, 1);
		Data.GroupsGroupTitles.splice(
				groupid, 1);
		Data.GroupsGroupCount.splice(
				groupid, 1);
		Data.GroupsRecordings.splice(
				groupid, 1);
		itemid=0;
		if(groupid>0){
			groupid--;
		}
		SceneGroups.prototype.Level0();
	} else {		
		
		//Just remove the item from the level 1 list
		Data.GroupsGroupTitles[groupid]
				.splice(itemid, 1);
		Data.GroupsGroupCount[groupid]--;											
		Data.GroupsRecordings[groupid]
				.splice(itemid, 1);		
		SceneGroups.prototype.Level1();
		itemid--;
	}
	
};