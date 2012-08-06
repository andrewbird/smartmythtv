var ServiceAPI = {
	XHRObj : null,
	onReceived : null,
	onDeleteCurrent : null
};

ServiceAPI.loadRecordings = function() {
	XHRObj = new XMLHttpRequest();
    
	if (XHRObj) {
		XHRObj.onreadystatechange = function() {
			if(XHRObj.readyState==4) {
				if (XHRObj.status==200) {
					ServiceAPI.receiveRecordings();
				} else {
					SceneRecordings.prototype.receivedFailed();
				}
			}
		};
		XHRObj.open("GET", "http://"+Data.URL+":6544/Dvr/GetRecordedList?Descending=true", true); //&Count=10
		XHRObj.setRequestHeader("Accept", "application/json");
		XHRObj.send(null);
	} else {
        alert("Failed to create XHR");
    }
};

ServiceAPI.receiveRecordings = function() {
	//var elements = JSON.parse(XHRObj.responseText);
	var elements = eval('('+XHRObj.responseText+')'); //TODO security
	var list = elements.ProgramList;
	
	Data.titles = [ ];
	Data.links = [ ];
	Data.description = [ ];
	var index = 0;
	for (var i in elements.ProgramList.Programs) {
		Data.Titles[index] = list.Programs[i].Title+": "+list.Programs[i].SubTitle;
		var r = new Object();
		Data.Recordings[index] = r;
		r.Description = list.Programs[i].Description;
		r.StartTime = list.Programs[i].Recording.StartTs;
		r.ChanId = list.Programs[i].Channel.ChanId;
		index++;
	}
	Data.loaded = index;
	Data.max = list.Count;
	$('#svecListbox_BOUK').sfList({data:Data.Titles, index:current});
	$('#svecLoadingImage_RBMO').sfLoading('hide');
	widgetAPI.putInnerHTML(document.getElementById("description"), Data.Recordings[$('#svecListbox_BOUK').sfList('getIndex')].Description.replace(/\n/g, '<br>'));
	XHRObj.destroy();
	ServiceAPI.onReceived();
};

ServiceAPI.loadVideos = function() {
	XHRObj = new XMLHttpRequest();
    
	if (XHRObj) {
		XHRObj.onreadystatechange = function() {
			if(XHRObj.readyState==4) {
				if (XHRObj.status==200) {
					ServiceAPI.receiveVideos();
				} else {
					SceneRecordings.prototype.receivedFailed();
				}
			}
		};
		XHRObj.open("GET", "http://"+Data.URL+":6544/Video/GetVideoList?Descending=true", true); //&Count=10
		XHRObj.setRequestHeader("Accept", "application/json");
		XHRObj.send(null);
	} else {
        alert("Failed to create XHR");
    }
};

ServiceAPI.receiveVideos = function() {
	//var elements = JSON.parse(XHRObj.responseText);
	var elements = eval('('+XHRObj.responseText+')'); //TODO security
	var list = elements.VideoMetadataInfoList;
	
	Data.Titles = [ ];
	var index = 0;
	for (var i in list.VideoMetadataInfos) {
		Data.VideoTitles[index] = list.VideoMetadataInfos[i].Title+": "+list.VideoMetadataInfos[i].SubTitle;
		var v = new Object();
		Data.Videos[index] = v;
		v.Description = list.VideoMetadataInfos[i].Description;
		v.Id = list.VideoMetadataInfos[i].Id;
		index++;
	}
	Data.loaded = index;
	Data.maxVideos = list.Count;
	$('#svecListbox_BOUK').sfList({data:Data.Titles, index:current});
	$('#svecLoadingImage_RBMO').sfLoading('hide');
	widgetAPI.putInnerHTML(document.getElementById("description"), Data.Videos[$('#svecListbox_BOUK').sfList('getIndex')].Description.replace(/\n/g, '<br>'));
	XHRObj.destroy();
	ServiceAPI.onReceived();
};

ServiceAPI.deleteRecording = function(recording) {
	XHRObj = new XMLHttpRequest();
	XHRObj.onreadystatechange = function() {
		XHRObj.destory();
	};
	XHRObj.open("POST", "http://"+Data.URL+':6544/Dvr/RemoveRecorded', true);
	XHRObj.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	XHRObj.send('ChanId='+recording.ChanId+'&StartTime='+recording.StartTime);
	ServiceAPI.onDeleteCurrent();
};