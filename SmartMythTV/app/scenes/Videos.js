var widgetAPI = new Common.API.Widget(); // Create Common module

function SceneVideos(options) {
    this.options = options;
}

SceneVideos.prototype.initialize = function() {
    $('#svecListbox_BOVI').sfList({
        itemsPerPage: 10
    });
    $('#svecScrollbar_UKVI').sfScroll({
        page: 0
    });
    $('#svecKeyHelp_O2VI').sfKeyHelp({
        'user': Data.SMARTMYTHTVVERSION,
        'red': 'Delete',
        'yellow': 'Groups',
        'blue': 'Upcoming',
        'enter': 'Play',
        'updown': 'UpDown',
        'tools': 'Settings',
        'return': 'Back'
    });
};

SceneVideos.prototype.handleShow = function() {};

SceneVideos.prototype.handleHide = function() {
    // this function will be called when the scene manager hide this scene
};

SceneVideos.prototype.handleFocus = function() {
    Data.mainScene = "Videos";
    if (Data.loadedVideos == 0) {
        if (Data.URL == null) {
            Data.URL = sf.core.localData("serverip");
        }
        $('#svecLoadingImage_RBVI').sfLoading('show');
        ServiceAPI.onReceived = function() {
            $('#svecListbox_BOVI').sfList({
                data: Data.VideoTitles,
                index: 0
            });
            $('#svecLoadingImage_RBVI').sfLoading('hide');
            SceneVideos.prototype.showDescription();
        };
        ServiceAPI.onFailed = function() {
            $('#svecLoadingImage_RBVI').sfLoading('hide');
            ServiceAPI.onError();
        };
        ServiceAPI.onDeleteCurrent = SceneVideos.prototype.removeCurrentVideo;
        ServiceAPI.loadVideos();
    }
};

SceneVideos.prototype.handleBlur = function() {};


/*
 * function toText(value) { return (value<10?"0":"")+value; }
 */

SceneVideos.prototype.showDescription = function() {

    var vid = SceneVideos.prototype.getVideo();
    var hasinfo = false;
    var data = "<table border>";

    if (vid.SubTitle && vid.SubTitle != "") {
        hasinfo = true;
        data = data + "<tr><td>SubTitle</td><td>" + vid.SubTitle + "</td></tr>";
    }
    if (vid.length > 0) {
        hasinfo = true;
        data = data + "<tr><td>Length</td><td>" + vid.length + " minutes</td></tr>";
    }

    data = data + "</table>";
    if (hasinfo == false) {
        data = "";
    }


    if (vid.coverart) {
        var cover = "<img src=\"" + Data.URL + vid.coverart + "\" height=200>";
        //		$('#cover_VI').sfImage({src:"http://" + Data.URL + ":6544"+vid.coverart});
        //		$('#cover_VI').sfImage('show');
        widgetAPI.putInnerHTML(document.getElementById("cover_VI"), cover);
    } else {
        widgetAPI.putInnerHTML(document.getElementById("cover_VI"), "");
    }
    var detail = vid.Description.replace(/\n/g, '<br>');
    widgetAPI.putInnerHTML(document.getElementById("description_VI"), detail);
    widgetAPI.putInnerHTML(document.getElementById("descriptionTable_VI"), data);
};

SceneVideos.prototype.removeCurrentVideo = function() {
    var vlist = $('#svecListbox_BOVI');
    var current = vlist.sfList('getIndex');
    Data.Videos.splice(current, 1);
    Data.VideoTitles.splice(current, 1);
    Data.max--;
    vlist.sfList({
        data: Data.VideoTitles,
        index: 0
    });
    if (current < Data.max) {
        vlist.sfList('move', current);
    } else {
        vlist.sfList('move', Data.max);
    }
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
            if (idx == 0) break;
            $('#svecListbox_BOVI').sfList('prev');
            SceneVideos.prototype.showDescription();
            break;
        case sf.key.DOWN:
            $('#svecScrollbar_UKVI').sfScroll('next');
            var idx = $('#svecListbox_BOVI').sfList('getIndex');
            if (idx == Data.maxVideos) break;
            $('#svecListbox_BOVI').sfList('next');
            SceneVideos.prototype.showDescription();
            break;
        case sf.key.ENTER:
            Data.currentStream = SceneVideos.prototype.getVideo();
            sf.scene.hide('Videos');
            sf.scene.show('Player', {
                parent: "Videos"
            });
            sf.scene.focus('Player');
            break;
        case 108: // RED
            var item = SceneVideos.prototype.getVideo();
            $('#svecPopup_ok_cancel_0AVI').sfPopup({
                'text': 'Do you really want to delete ' + item.Title + '<BR/>' + item.SubTitle + '?',
                buttons: ['Yes', 'No'],
                callback: function(rlt) {
                    if (rlt == 0) {
                        $('#svecLoadingImage_RBMO').sfLoading('show');
                        ServiceAPI.deleteVideo(item);
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
        case sf.key.BLUE:
            sf.scene.hide('Videos');
            sf.scene.show('Upcoming');
            sf.scene.focus('Upcoming');
            return;
    }
};
