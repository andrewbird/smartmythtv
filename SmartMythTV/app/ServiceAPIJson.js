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
        return Data.URL + "/Content/GetRecording" +
            "?ChanId=" + item.ChanId +
            "&StartTime=" + item.StartTime;
    } else {
        return Data.URL + "/Content/GetVideo?Id=" + item.Id;
    }
};


ServiceAPI.loadRecordings = function(context, callback, errback) {
    $.ajax({
        url: Data.URL + "/Dvr/GetRecordedList?Descending=true",
        type: "GET",
        beforeSend: function(xhr){xhr.setRequestHeader('Accept', 'application/json');},
        success: function(data, textStatus, jqXHR) {
            var elements = $.parseJSON(jqXHR.responseText);
            var list = elements.ProgramList;

            Data.Titles = [];
            Data.Recordings = [];

            for (var i in elements.ProgramList.Programs) {
                Data.Titles.push(list.Programs[i].Title + ": " + list.Programs[i].SubTitle);
                Data.Recordings.push(new Rec(list.Programs[i]));
            }

            Data.loadedRecordings = 1;
            callback.call(context);
        },

        error: function() {
            errback.call(context);
        }
    });
};


ServiceAPI.deleteRecording = function(context, callback, errback, recording) {
    $.ajax({
        url: Data.URL + '/Dvr/RemoveRecorded',
        type: "POST",
        data: {ChanId: recording.ChanId, StartTime: recording.StartTime},

        success: function(data, textStatus, jqXHR) {
            callback.call(context);
        },

        error: function() {
            errback.call(context);
        }
    });
};


ServiceAPI.loadGroups = function(context, callback, errback) {
    $.ajax({
        url: Data.URL + "/Dvr/GetRecordedList?Descending=true",
        type: "GET",
        beforeSend: function(xhr){xhr.setRequestHeader('Accept', 'application/json');},
        success: function(data, textStatus, jqXHR) {
            var elements = $.parseJSON(jqXHR.responseText);
            var list = elements.ProgramList;

            Data.GroupsGroupTitles = [];
            Data.GroupsMemberTitles = [];
            Data.GroupsRecordings = [];

            for (var i in elements.ProgramList.Programs) {
                var pos = Data.GroupsGroupTitles.indexOf(list.Programs[i].Title);
                if (pos == -1) { // Not found
                    pos = Data.GroupsGroupTitles.push(list.Programs[i].Title) - 1;
                    Data.GroupsMemberTitles.push([]);
                    Data.GroupsRecordings.push([]);
                }

                var info = list.Programs[i].SubTitle;
                if (info == "") {
                    info = ServiceAPI.showDate(ServiceAPI.getDate(list.Programs[i].StartTime));
                }
                Data.GroupsMemberTitles[pos].push(info);

                Data.GroupsRecordings[pos].push(new Rec(list.Programs[i]));
            }

            Data.loadedGroups = 1;
            callback.call(context);
        },

        error: function() {
            errback.call(context);
        }
    });
};


ServiceAPI.loadUpcoming = function(context, callback, errback) {
    $.ajax({
        url: Data.URL + "/Dvr/GetUpcomingList?Count=30&ShowAll=true",
        type: "GET",
        beforeSend: function(xhr){xhr.setRequestHeader('Accept', 'application/json');},
        success: function(data, textStatus, jqXHR) {
            var elements = $.parseJSON(jqXHR.responseText);
            var list = elements.ProgramList;

            Data.UpcomingList = [];
            Data.UpcomingDetail = [];

            for (var i in list.Programs) {

                var status = list.Programs[i].Recording.Status;
                var title = list.Programs[i].Title;
                if (status == 10) { //Inactive
                    title = "<FONT COLOR='4682BE'>" + title + "</FONT>";
                } else if (status == 7) { //Conflict
                    title = "<FONT COLOR='FF0000'>" + title + "</FONT>";
                } else if (status != -1) { //Will Record
                    continue; //We don't show any other statuses
                }
                Data.UpcomingList.push(title);
                Data.UpcomingDetail.push(new Rec(list.Programs[i]));

                if (Data.UpcomingList.length == 20) {
                    break;
                }
            }

            Data.loadedUpcoming = 1;
            callback.call(context);
        },

        error: function() {
            errback.call(context);
        }
    });
};


ServiceAPI.changeRecordSchedule = function(recording, callback, errback) {
    var url;

    alert("change Record Schedule " + recording.RecordId);

    if (recording.Status == -1) {
        //Current active, need to disable
        url = Data.URL + '/Dvr/DisableRecordSchedule';
    } else {
        //Current inactive, need to enable
        url = Data.URL + '/Dvr/EnableRecordSchedule';
    }

    $.ajax({
        url: url,
        type: "POST",
        data: {RecordId: recording.RecordId},

        success: function(data, textStatus, jqXHR) {
            callback.call(context);
        },

        error: function() {
            errback.call(context);
        }
    });
};


ServiceAPI.loadVideos = function(context, callback, errback) {
    $.ajax({
        url: Data.URL + "/Video/GetVideoList?Descending=true",
        type: "GET",
        beforeSend: function(xhr){xhr.setRequestHeader('Accept', 'application/json');},
        success: function(data, textStatus, jqXHR) {
            var elements = $.parseJSON(jqXHR.responseText);
            var list = elements.VideoMetadataInfoList;

            Data.Videos = [];
            Data.VideoTitles = [];
            for (var i in list.VideoMetadataInfos) {
                Data.Videos.push(new Vid(list.VideoMetadataInfos[i]));
                Data.VideoTitles.push(list.VideoMetadataInfos[i].Title);
            }

            Data.loadedVideos = 1;

            callback.call(context);
        },

        error: function() {
            errback.call(context);
        }
    });
};


ServiceAPI.deleteVideo = function(context, callback, errback, video) {
    $.ajax({
        url: Data.URL + '/Video/RemoveVideoFromDB',
        type: "POST",
        data: {Id: video.Id},

        success: function(data, textStatus, jqXHR) {
            callback.call(context);
        },

        error: function() {
            errback.call(context);
        }
    });
};
