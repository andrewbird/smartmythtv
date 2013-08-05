var ServiceAPI = {
    onReceived: null,
    onDeleteCurrent: null,
    onUpdateUpcoming: null,
    onFailed: null
};


ServiceAPI.onError = function() {
    sf.scene.hide(Data.mainScene);
    sf.scene.show('Error');
    sf.scene.focus('Error');
};


ServiceAPI.getDate = function(inTime) {
    //<StartTime>2012-09-25T09:00:00Z</StartTime>
    return new Date(inTime);
};


ServiceAPI.showDate = function(date) {
    return date.toLocaleString();
};


ServiceAPI.readableBytes = function(bytes) {
    var s = ['bytes', 'kb', 'MB', 'GB', 'TB', 'PB'];
    var e = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(e))).toFixed(2) + " " + s[e];
};


ServiceAPI.getStreamUrl = function(item) {
    if(item.StartTime) {
        return "http://" + Data.URL + ":6544/Content/GetRecording" +
            "?ChanId=" + item.ChanId +
            "&StartTime=" + item.StartTime;
    } else {
        return "http://" + Data.URL + ":6544/Content/GetVideo?Id=" + item.Id;
    }
};


ServiceAPI.loadRecordings = function() {
    $.ajax({
        url: "http://" + Data.URL + ":6544/Dvr/GetRecordedList?Descending=true",
        type: "GET",
        beforeSend: function(xhr){xhr.setRequestHeader('Accept', 'application/json');},
        success: ServiceAPI.receiveRecordings,
        error: ServiceAPI.onFailed
    });
};

ServiceAPI.receiveRecordings = function(data, textStatus, jqXHR) {
    var elements = $.parseJSON(jqXHR.responseText);
    var list = elements.ProgramList;

    Data.Titles = [];
    var index = 0;
    for (var i in elements.ProgramList.Programs) {
        Data.Titles[index] = list.Programs[i].Title + ": " + list.Programs[i].SubTitle;
        var r = new Object();
        Data.Recordings[index] = r;
        r.Description = list.Programs[i].Description;
        r.StartTime = list.Programs[i].Recording.StartTs;
        r.ChanId = list.Programs[i].Channel.ChanId;
        r.Title = list.Programs[i].Title;
        r.SubTitle = list.Programs[i].SubTitle;
        r.ChannelName = list.Programs[i].Channel.ChannelName;
        index++;
    }
    Data.loaded = index;
    Data.max = list.Count;
    $('#svecListbox_BOUK').sfList({
        data: Data.Titles,
        index: 0
    });
    $('#svecLoadingImage_RBMO').sfLoading('hide');
    widgetAPI.putInnerHTML(document.getElementById("description"), Data.Recordings[$('#svecListbox_BOUK').sfList('getIndex')].Description.replace(/\n/g, '<br>'));

    Data.loadedRecordings = 1;
    ServiceAPI.onReceived();
};


ServiceAPI.deleteRecording = function(recording) {
    $.ajax({
        url: "http://" + Data.URL + ':6544/Dvr/RemoveRecorded',
        type: "POST",
        data: {ChanId: recording.ChanId, StartTime: recording.StartTime},
        success: ServiceAPI.onDeleteCurrent,
        error: ServiceAPI.onFailed
    });
};


ServiceAPI.loadGroups = function() {
    $.ajax({
        url: "http://" + Data.URL + ":6544/Dvr/GetRecordedList?Descending=true",
        type: "GET",
        beforeSend: function(xhr){xhr.setRequestHeader('Accept', 'application/json');},
        success: ServiceAPI.receiveGroups,
        error: ServiceAPI.onFailed
    });
};



ServiceAPI.receiveGroups = function(data, textStatus, jqXHR) {
    var elements = $.parseJSON(jqXHR.responseText);
    var list = elements.ProgramList;

    Data.GroupsList = [];
    Data.GroupsGroupTitles = [];
    Data.GroupsRecordings = [];

    var index = 0;
    for (var i in elements.ProgramList.Programs) {
        var pos = Data.GroupsList.indexOf(list.Programs[i].Title);
        if (pos == -1) { //Not found
            Data.GroupsGroupTitles[index] = [];
            Data.GroupsList[index] = list.Programs[i].Title;
            Data.GroupsRecordings[index] = [];
            pos = index;
            index++;
        }

        var info = list.Programs[i].SubTitle;
        if (info == "") {
            info = ServiceAPI.showDate(ServiceAPI.getDate(list.Programs[i].StartTime));
        }
        Data.GroupsGroupTitles[pos].push(info);

        var r = new Object();
        Data.GroupsRecordings[pos].push(r);
        r.Description = list.Programs[i].Description;
        r.StartTime = list.Programs[i].Recording.StartTs;
        r.ChanId = list.Programs[i].Channel.ChanId;
        r.Title = list.Programs[i].Title;
        r.SubTitle = list.Programs[i].SubTitle;
        r.FileName = list.Programs[i].FileName;
        r.ChannelName = list.Programs[i].Channel.ChannelName;
        r.FileSize = list.Programs[i].FileSize;
        r.Status = list.Programs[i].Recording.Status;

        r.StartTimeDate = ServiceAPI.getDate(list.Programs[i].StartTime);
        r.EndTimeDate = ServiceAPI.getDate(list.Programs[i].EndTime);
    }

    Data.loadedGroups = 1;
    ServiceAPI.onReceived();
};


ServiceAPI.loadUpcoming = function() {
    $.ajax({
        url: "http://" + Data.URL + ":6544/Dvr/GetUpcomingList?Count=30&ShowAll=true",
        type: "GET",
        beforeSend: function(xhr){xhr.setRequestHeader('Accept', 'application/json');},
        success: ServiceAPI.receiveUpcoming,
        error: ServiceAPI.onFailed
    });
};


ServiceAPI.receiveUpcoming = function(data, textStatus, jqXHR) {
    var elements = $.parseJSON(jqXHR.responseText);
    var list = elements.ProgramList;

    Data.UpcomingList = [];
    Data.UpcomingDetail = [];

    var index = 0;
    for (var i in elements.ProgramList.Programs) {

        var status = list.Programs[i].Recording.Status;
        var title = list.Programs[i].Title;
        if (status == 10) { //Inactive
            title = "<FONT COLOR='4682BE'>" + title + "</FONT>";
        } else if (status == 7) { //Conflict
            title = "<FONT COLOR='FF0000'>" + title + "</FONT>";
        } else if (status != -1) { //Will Record
            continue; //We don't show any other statuses
        }
        Data.UpcomingList[index] = title;

        var r = new Object();
        Data.UpcomingDetail[index] = r;
        r.Description = list.Programs[i].Description;
        r.ChanId = list.Programs[i].Channel.ChanId;
        r.Title = list.Programs[i].Title;
        r.SubTitle = list.Programs[i].SubTitle;
        r.FileName = list.Programs[i].FileName;
        r.ChannelName = list.Programs[i].Channel.ChannelName;
        r.RecordId = list.Programs[i].Recording.RecordId;
        r.Status = status;

        r.StartTimeDate = ServiceAPI.getDate(list.Programs[i].StartTime);
        r.EndTimeDate = ServiceAPI.getDate(list.Programs[i].EndTime);

        index++;
        if (index == 20) {
            break;
        }
    }

    Data.loadedUpcoming = 1;
    ServiceAPI.onReceived();
};


ServiceAPI.changeRecordSchedule = function(recording) {
    var url;

    alert("change Record Schedule " + recording.RecordId);

    if (recording.Status == -1) {
        //Current active, need to disable
        url = "http://" + Data.URL + ':6544/Dvr/DisableRecordSchedule';
    } else {
        //Current inactive, need to enable
        url = "http://" + Data.URL + ':6544/Dvr/EnableRecordSchedule';
    }

    $.ajax({
        url: url,
        type: "POST",
        data: {RecordId: recording.RecordId},
        success: ServiceAPI.onDeleteCurrent,
        error: ServiceAPI.onFailed
    });
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


ServiceAPI.loadVideos = function() {
    $.ajax({
        url: "http://" + Data.URL + ":6544/Video/GetVideoList?Descending=true",
        type: "GET",
        beforeSend: function(xhr){xhr.setRequestHeader('Accept', 'application/json');},
        success: ServiceAPI.receiveVideos,
        error: ServiceAPI.onFailed
    });
};

ServiceAPI.receiveVideos = function(data, textStatus, jqXHR) {
    var elements = $.parseJSON(jqXHR.responseText);
    var list = elements.VideoMetadataInfoList;

    Data.VideoTitles = [];
    var index = 0;
    for (var i in list.VideoMetadataInfos) {
        Data.VideoTitles[index] = list.VideoMetadataInfos[i].Title;
        var v = new Object();
        Data.Videos[index] = v;
        v.Title = list.VideoMetadataInfos[i].Title;
        v.SubTitle = list.VideoMetadataInfos[i].SubTitle;
        v.Description = list.VideoMetadataInfos[i].Description;
        if (list.VideoMetadataInfos[i].Artwork && list.VideoMetadataInfos[i].Artwork.ArtworkInfos.length > 0) {
            for (var j in list.VideoMetadataInfos[i].Artwork.ArtworkInfos) {
                if (list.VideoMetadataInfos[i].Artwork.ArtworkInfos[j].Type == "coverart") {
                    v.coverart = list.VideoMetadataInfos[i].Artwork.ArtworkInfos[j].URL;
                }
                if (list.VideoMetadataInfos[i].Artwork.ArtworkInfos[j].Type == "fanart") {
                    v.fanart = list.VideoMetadataInfos[i].Artwork.ArtworkInfos[j].URL;
                }
            }
        }
        v.Id = list.VideoMetadataInfos[i].Id;
        v.length = list.VideoMetadataInfos[i].Length;
        index++;
    }
    Data.loaded = index;
    Data.maxVideos = list.Count;
    $('#svecListbox_BOUK').sfList({
        data: Data.Titles,
        index: 0
    });
    $('#svecLoadingImage_RBMO').sfLoading('hide');
    widgetAPI.putInnerHTML(document.getElementById("description"), Data.Videos[$('#svecListbox_BOVI').sfList('getIndex')].Description.replace(/\n/g, '<br>'));

    Data.loadedVideos = 1;
    ServiceAPI.onReceived();
};

ServiceAPI.deleteVideo = function(video) {
    $.ajax({
        url: "http://" + Data.URL + ':6544/Video/RemoveVideoFromDB',
        type: "POST",
        data: {Id: video.Id},
        success: ServiceAPI.onDeleteCurrent,
        error: ServiceAPI.onFailed
    });
};
