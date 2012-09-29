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
		r.Title = list.Programs[i].Title;
		r.ChannelName = list.Programs[i].Channel.ChannelName;
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
		Data.VideoTitles[index] = list.VideoMetadataInfos[i].Title;
		var v = new Object();
		Data.Videos[index] = v;
		v.SubTitle=list.VideoMetadataInfos[i].SubTitle;
		v.Description = list.VideoMetadataInfos[i].Description;
		if(list.VideoMetadataInfos[i].Artwork && list.VideoMetadataInfos[i].Artwork.ArtworkInfos.length>0){
			for(var j in list.VideoMetadataInfos[i].Artwork.ArtworkInfos){
				if(list.VideoMetadataInfos[i].Artwork.ArtworkInfos[j].Type=="coverart"){
					v.coverart=list.VideoMetadataInfos[i].Artwork.ArtworkInfos[j].URL;
				}
				if(list.VideoMetadataInfos[i].Artwork.ArtworkInfos[j].Type=="fanart"){
					v.fanart=list.VideoMetadataInfos[i].Artwork.ArtworkInfos[j].URL;
				}
			}		 
		}
		v.Id = list.VideoMetadataInfos[i].Id;
		v.length=list.VideoMetadataInfos[i].Length;
		index++;
	}
	Data.loaded = index;
	Data.maxVideos = list.Count;
	$('#svecListbox_BOUK').sfList({data:Data.Titles, index:current});
	$('#svecLoadingImage_RBMO').sfLoading('hide');
	widgetAPI.putInnerHTML(document.getElementById("description"), Data.Videos[$('#svecListbox_BOVI').sfList('getIndex')].Description.replace(/\n/g, '<br>'));
	XHRObj.destroy();
	ServiceAPI.onReceived();
};

ServiceAPI.getDate = function(inTime){
	//<StartTime>2012-09-25T09:00:00Z</StartTime>
	return new Date(inTime);
};

ServiceAPI.showDate = function(date){	
	return date.toLocaleString();
};

ServiceAPI.readableBytes =function(bytes) {
    var s = ['bytes', 'kb', 'MB', 'GB', 'TB', 'PB'];
    var e = Math.floor(Math.log(bytes)/Math.log(1024));
    return (bytes/Math.pow(1024, Math.floor(e))).toFixed(2)+" "+s[e];
};

ServiceAPI.deleteRecording = function(recording) {
	XHRObj = new XMLHttpRequest();
	//XHRObj.onreadystatechange = function() {
	//	XHRObj.destroy();
	//};
	XHRObj.open("POST", "http://"+Data.URL+':6544/Dvr/RemoveRecorded', true);
	XHRObj.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	XHRObj.send('ChanId='+recording.ChanId+'&StartTime='+recording.StartTime);
	ServiceAPI.onDeleteCurrent();
};