var widgetAPI = new Common.API.Widget(); // Create Common module

function SceneFlat(options) {
    this.options = options;
}

var $flist, itemsPerPage = 10;
var $fscroll;
var $fspinner;

SceneFlat.prototype.NAME = "Flat";

SceneFlat.prototype.initialize = function() {

    $flist = $('#svecListbox_BOUK');
    $flist.sfList({
        itemsPerPage: itemsPerPage
    });

    $fscroll = $('#svecScrollbar_UKRU');
    $fscroll.sfScroll({
        currentPage: 0
    });

    $fspinner = $('#svecLoadingImage_RBMO');

    $('#svecKeyHelp_O2NM').sfKeyHelp({
        user   : Data.SMARTMYTHTVVERSION,
        red    : 'Delete',
        green  : 'Videos',
        yellow : 'Upcoming',
        enter  : 'Play',
        tools  : 'Settings'
    });
};

SceneFlat.prototype.getRecording = function() {
    return Data.Recordings[$flist.sfList('getIndex')];
};

SceneFlat.prototype.showDescription = function() {
    var rec = this.getRecording();

    widgetAPI.putInnerHTML(document.getElementById("description_RE"), rec.toHtmlTable());
};

SceneFlat.prototype.makeFlatData = function() {
    Data.FlatTitles.length = 0;

    var rec = null;

    for (var i = 0; i < Data.Recordings.length; i++) {
        rec = Data.Recordings[i];

        if(rec.SubTitle.length == 0) {
            Data.FlatTitles.push(rec.Title);
        } else {
            Data.FlatTitles.push(rec.Title + ": " + rec.SubTitle);
        }
    }

    numberOfItems = Data.Recordings.length;

    $flist.sfList({
        data: Data.FlatTitles,
        index: 0
    });

    $fscroll.sfScroll({
        currentPage: 0,
        pages: Math.ceil(numberOfItems / itemsPerPage)
    });
};


SceneFlat.prototype.initView = function() {

    $fspinner.sfLoading('show');

    ServiceAPI.loadRecordings(this,

        function() {
            this.makeFlatData();
            this.showDescription();

            $fspinner.sfLoading('hide');
        },

        function() {
            $fspinner.sfLoading('hide');
            ServiceAPI.onError();
        }
    );

    $flist.sfList('clear');
};

SceneFlat.prototype.showView = function() {
    if (Data.FlatTitles.length == 0) {
        $fspinner.sfLoading('show');
        this.makeFlatData();
        $fspinner.sfLoading('hide');
    }

    $flist.sfList('show');
    $flist.sfList('focus');

    this.showDescription();
};

SceneFlat.prototype.handleShow = function() {};

SceneFlat.prototype.handleHide = function() {
    // this function will be called when the scene manager hide this scene
};

SceneFlat.prototype.handleFocus = function() {
    Data.mainScene = "Flat";
    if (Data.Recordings.length == 0) {
        this.initView();
    } else {
        this.showView();
    }
};


SceneFlat.prototype.handleBlur = function() {};


SceneFlat.prototype.updateScrollbar = function() {
    var currentPage = $flist.sfList('getIndex') / itemsPerPage;
    $fscroll.sfScroll('move', Math.floor(currentPage));
};

SceneFlat.prototype.handleKeyDown = function(keyCode) {
    switch (keyCode) {
        case sf.key.RETURN:
            sf.key.preventDefault();
            break;
        case sf.key.LEFT:
            break;
        case sf.key.RIGHT:
            break;
        case sf.key.UP:
            $flist.sfList('prev');
            this.updateScrollbar();
            this.showDescription();
            break;
        case sf.key.DOWN:
            $flist.sfList('next');
            this.updateScrollbar();
            this.showDescription();
            break;
        case sf.key.ENTER:
            Data.currentStream = this.getRecording();
            sf.scene.hide(this.NAME);
            sf.scene.show('Player', {
                caller: this.NAME
            });
            sf.scene.focus('Player');
            break;

        case sf.key.RED:
            var item = this.getRecording();

            $('#svecPopup_ok_cancel_0AM7').sfPopup({
                'text': 'Do you really want to delete ' + item.Title + '<BR/>' + item.SubTitle + '?',
                buttons: ['Yes', 'No'],
                callback: function(rlt) {
                    if (rlt == 0) {
                        $fspinner.sfLoading('show');
                        ServiceAPI.deleteRecording(
                            sf.scene.get('Flat'),                    // context
                            sf.scene.get('Flat').onDeleteRecording,  // callback
                            ServiceAPI.onError,                      // errback
                            item);
                    }
                }
            });
            $('#svecPopup_ok_cancel_0AM7').sfPopup('show');
            $('#svecPopup_ok_cancel_0AM7').sfPopup('focus');
            break;
        case sf.key.GREEN:
            sf.scene.hide(this.NAME);
            sf.scene.show('Videos');
            sf.scene.focus('Videos');
            break;
        case sf.key.YELLOW:
            sf.scene.hide(this.NAME);
            sf.scene.show('Upcoming');
            sf.scene.focus('Upcoming');
            break;

        case sf.key.TOOLS:
            sf.scene.hide(this.NAME);
            sf.scene.show('Settings', {
                caller: this.NAME
            });
            sf.scene.focus('Settings');
            break;
    }
};


SceneFlat.prototype.onDeleteRecording = function() {
    var current = $flist.sfList('getIndex');
    Data.Recordings.splice(current, 1);
    Data.FlatTitles.splice(current, 1);
    $flist.sfList({
        data: Data.FlatTitles,
        index: 0
    });
    if (current < $flist.Count) {
        $flist.sfList('move', current);
    }

    // FIXME: perhaps we need to invalidate the group data to cause reload

    this.updateScrollbar();
    this.showDescription();
    $fspinner.sfLoading('hide');
};
