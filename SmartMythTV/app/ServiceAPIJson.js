var ServiceAPI = {
	XHRObj : null,
	onReceived : null,
	onDeleteCurrent : null,
	onUpdateUpcoming : null
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

ServiceAPI.removeRecordSchedule = function(recording) {
	XHRObj = new XMLHttpRequest();
	//XHRObj.onreadystatechange = function() {
	//	XHRObj.destroy();
	//};
	alert("Disable Record Schedule "+recording.RecordId);
	XHRObj.open("POST", "http://"+Data.URL+':6544/Dvr/RemoveRecordSchedule', true);
	XHRObj.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	XHRObj.send('RecordId='+recording.RecordId);
	ServiceAPI.onDeleteCurrent();
};

ServiceAPI.loadGroups = function() {
	XHRObj = new XMLHttpRequest();
    
	if (XHRObj) {
		XHRObj.onreadystatechange = function() {
			if(XHRObj.readyState==4) {
				if (XHRObj.status==200) {
					ServiceAPI.receiveGroups();
				} else {
					ServiceAPI.onFailed();
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

ServiceAPI.receiveGroups = function() {
	//var elements = JSON.parse(XHRObj.responseText);
	var elements = eval('('+XHRObj.responseText+')'); //TODO security
	var list = elements.ProgramList;
	Data.GroupsList=[];
	Data.GroupsGroupTitles=[];
	Data.GroupsGroupCount=[];
	Data.GroupsRecordings=[];
	
	
	var index = 0;
	for (var i in elements.ProgramList.Programs) {
	    var pos=Data.GroupsList.indexOf(list.Programs[i].Title);
		if(pos==-1){  //Not found		 
		  Data.GroupsGroupCount[index]=0;
		  Data.GroupsGroupTitles[index]=[];
		  Data.GroupsList[index]=list.Programs[i].Title;
		  Data.GroupsRecordings[index]=[];
		  pos=index;
		  index++;
		}else{
		  Data.GroupsGroupCount[pos]++;
		}
		
		var info=list.Programs[i].SubTitle;
		if(info==""){
			info=ServiceAPI.showDate(ServiceAPI.getDate(list.Programs[i].StartTime));
		}
		var groupPos=Data.GroupsGroupCount[pos];
		Data.GroupsGroupTitles[pos][groupPos] =info;
				
		var r=new Object();
		Data.GroupsRecordings[pos][groupPos] = r;
		r.Description = list.Programs[i].Description;
		r.StartTime = list.Programs[i].Recording.StartTs;
		r.ChanId = list.Programs[i].Channel.ChanId;
		r.Title=list.Programs[i].Title;	
		r.SubTitle=list.Programs[i].SubTitle;
		r.FileName=list.Programs[i].FileName;
		r.ChannelName=list.Programs[i].Channel.ChannelName;
		r.FileSize=list.Programs[i].FileSize;
		r.Status=list.Programs[i].Recording.Status;
		
		r.StartTimeDate=ServiceAPI.getDate(list.Programs[i].StartTime);		
		r.EndTimeDate=ServiceAPI.getDate(list.Programs[i].EndTime);
	}
	
	XHRObj.destroy();
	Data.loadedGroups=1;
	ServiceAPI.onReceived();
};

ServiceAPI.loadUpcoming = function() {
	XHRObj = new XMLHttpRequest();
    
	if (XHRObj) {
		XHRObj.onreadystatechange = function() {
			if(XHRObj.readyState==4) {
				if (XHRObj.status==200) {
					ServiceAPI.receiveUpcoming();
				} else {
					ServiceAPI.onFailed();
				}
			}
		};
		XHRObj.open("GET", "http://"+Data.URL+":6544/Dvr/GetUpcomingList?Count=10", true); 
		XHRObj.setRequestHeader("Accept", "application/json");
		XHRObj.send(null);
	} else {
        alert("Failed to create XHR");
    }
};

ServiceAPI.receiveUpcoming = function() {
	
	var elements = eval('('+XHRObj.responseText+')'); //TODO security
	var list = elements.ProgramList;
	Data.UpcomingList=[];
	Data.UpcomingDetail=[];	
	
	
	var index = 0;
	for (var i in elements.ProgramList.Programs) {
	    	 
	    Data.UpcomingList[index]=list.Programs[i].Title;
		 		 
		
		var r=new Object();
		Data.UpcomingDetail[index] = r;
		r.Description = list.Programs[i].Description;		
		r.ChanId = list.Programs[i].Channel.ChanId;
		r.Title=list.Programs[i].Title;	
		r.SubTitle=list.Programs[i].SubTitle;
		r.FileName=list.Programs[i].FileName;
		r.ChannelName=list.Programs[i].Channel.ChannelName;		
		r.RecordId=list.Programs[i].Recording.RecordId;
		
		r.StartTimeDate=ServiceAPI.getDate(list.Programs[i].StartTime);		
		r.EndTimeDate=ServiceAPI.getDate(list.Programs[i].EndTime);
		index++;
	}
	
	XHRObj.destroy();
	Data.loadedUpcoming=1;
	ServiceAPI.onReceived();
};

/**
 * borrowed from http://subversion.assembla.com/svn/legend/mythtv/transcode-br/bindings/perl/MythTV.pm
And the recstatus types
our $recstatus_tunerbusy         = '-8';
our $recstatus_lowdiskspace      = '-7';
our $recstatus_cancelled         = '-6';
our $recstatus_deleted           = '-5';
our $recstatus_aborted           = '-4';
our $recstatus_recorded          = '-3';
our $recstatus_recording         = '-2';
our $recstatus_willrecord        = '-1';
our $recstatus_unknown           =   0 ;
our $recstatus_dontrecord        =   1 ;
our $recstatus_previousrecording =   2 ;
our $recstatus_currentrecording  =   3 ;
our $recstatus_earliershowing    =   4 ;
our $recstatus_toomanyrecordings =   5 ;
our $recstatus_notlisted         =   6 ;
our $recstatus_conflict          =   7 ;
our $recstatus_latershowing      =   8 ;
our $recstatus_repeat            =   9 ;
our $recstatus_inactive          =  10 ;
our $recstatus_neverrecord       =  11 ;
*/