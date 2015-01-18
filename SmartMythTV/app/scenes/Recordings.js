var widgetAPI = new Common.API.Widget(); // Create Common module

function SceneRecordings(options) {
    this.options = options;
}

SceneRecordings.prototype.NAME = "Recordings";

SceneRecordings.prototype.initialize = function() {
    $('#svecListbox_BOUK').sfList({
        itemsPerPage: 10
    });
    $('#svecScrollbar_UKRU').sfScroll({
        page: 0
    });
    $('#svecKeyHelp_O2NM').sfKeyHelp({
        'user': Data.SMARTMYTHTVVERSION,
        'red': 'Delete',
        'green': 'Videos',
        'yellow': 'Groups',
        'blue': 'Upcoming',
        'enter': 'Play',
        'updown': 'UpDown',
        'tools': 'Settings',
        'return': 'Back'
    });
};

SceneRecordings.prototype.getRecording = function() {
    return Data.Recordings[$('#svecListbox_BOUK').sfList('getIndex')];
};

SceneRecordings.prototype.showDescription = function() {
    var rec = this.getRecording();

    widgetAPI.putInnerHTML(document.getElementById("description"), rec.toHtmlTable());
};

SceneRecordings.prototype.loadData = function() {
    $('#svecLoadingImage_RBMO').sfLoading('show');

    if (Data.loadedRecordings != 0) {
        $('#svecListbox_BOUK').sfList({
            data: Data.Titles,
            index: 0
        });
        this.showDescription();
        $('#svecLoadingImage_RBMO').sfLoading('hide');

    } else {
        ServiceAPI.loadRecordings(this,
            function() {
                $('#svecListbox_BOUK').sfList({
                    data: Data.Titles,
                        index: 0
                });
                this.showDescription();
                $('#svecLoadingImage_RBMO').sfLoading('hide');
            },

            function() {
                $('#svecLoadingImage_RBMO').sfLoading('hide');
                ServiceAPI.onError();
            }
        );
    }
};

SceneRecordings.prototype.handleShow = function() {};

SceneRecordings.prototype.handleHide = function() {
    // this function will be called when the scene manager hide this scene
};

SceneRecordings.prototype.handleFocus = function() {
    Data.mainScene = "Recordings";
    this.loadData();
};

SceneRecordings.prototype.handleBlur = function() {};

SceneRecordings.prototype.receivedFailed = function() {
    Data.Titles = [];
    Data.Recordings = [];
    Data.Titles[0] = "Failed to load mythtv recordings";
    var r = new Object();
    r.Description = "Failed to load mythtv recordings\nStatus: " + XHRObj.status + "\nURL: " + Data.URL + "/";
    Data.Recordings[0] = r;
    ServiceAPI.onReceived();
    this.showDescription();
};

function toText(value) {
    return (value < 10 ? "0" : "") + value;
}


SceneRecordings.prototype.handleKeyDown = function(keyCode) {
    switch (keyCode) {
        case sf.key.LEFT:
            break;
        case sf.key.RIGHT:
            break;
        case sf.key.UP:
            $('#svecScrollbar_UKRU').sfScroll('prev');
            $('#svecListbox_BOUK').sfList('prev');
            this.showDescription();
            break;
        case sf.key.DOWN:
            $('#svecScrollbar_UKRU').sfScroll('next');
            $('#svecListbox_BOUK').sfList('next');
            this.showDescription();
            break;
        case sf.key.ENTER:
            Data.currentStream = this.getRecording();
            sf.scene.hide(this.NAME);
            sf.scene.show('Player', {
                parent: this.NAME
            });
            sf.scene.focus('Player');
            break;
        case 108: //RED
            var item = this.getRecording();
            $('#svecPopup_ok_cancel_0AM7').sfPopup({
                'text': 'Do you really want to delete ' + item.Title + '<BR/>' + item.SubTitle + '?',
                buttons: ['Yes', 'No'],
                callback: function(rlt) {
                    if (rlt == 0) {
                        $('#svecLoadingImage_RBMO').sfLoading('show');
                        ServiceAPI.deleteRecording(
                            sf.scene.get('Recordings'),
                            sf.scene.get('Recordings').onDeleteRecording,
                            ServiceAPI.onError,
                            item);
                    }
                }
            });
            $('#svecPopup_ok_cancel_0AM7').sfPopup('show');
            $('#svecPopup_ok_cancel_0AM7').sfPopup('focus');
            break;
        case 20: //GREEN
            sf.scene.hide(this.NAME);
            sf.scene.show('Videos');
            sf.scene.focus('Videos');
            break;
        case 21: //YELLOW
            sf.scene.hide(this.NAME);
            sf.scene.show('Groups');
            sf.scene.focus('Groups');
            break;
        case sf.key.TOOLS:
            sf.scene.hide(this.NAME);
            sf.scene.show('Settings');
            sf.scene.focus('Settings');
            break;
        case sf.key.BLUE:
            sf.scene.hide(this.NAME);
            sf.scene.show('Upcoming');
            sf.scene.focus('Upcoming');
            return;
    }
};


SceneRecordings.prototype.onDeleteRecording = function() {
    var vlist = $('#svecListbox_BOUK');
    var current = vlist.sfList('getIndex');
    Data.Recordings.splice(current, 1);
    Data.Titles.splice(current, 1);
    vlist.sfList({
        data: Data.Titles,
        index: 0
    });
    if (current < vlist.Count) {
        vlist.sfList('move', current);
    }
    this.showDescription();
    $('#svecLoadingImage_RBMO').sfLoading('hide');
};
