var widgetAPI = new Common.API.Widget(); // Create Common module

function SceneVideos(options) {
    this.options = options;
}

var $vlist, itemsPerPage = 10;
var $vscroll;

SceneVideos.prototype.NAME = "Videos";

SceneVideos.prototype.initialize = function() {

    $vlist = $('#svecListbox_Videos');
    $vlist.sfList({
        itemsPerPage: itemsPerPage
    });

    $vscroll = $('#svecScrollbar_Videos');
    $vscroll.sfScroll({
        currentPage: 0
    });

    $('#svecKeyHelp_O2VI').sfKeyHelp({
        user   : Data.SMARTMYTHTVVERSION,
        red    : 'Delete',
        green  : 'Recordings',
        enter  : 'Play',
        updown : 'UpDown',
        info   : 'Refresh',
        tools  : 'Settings',
    });
};

SceneVideos.prototype.handleShow = function() {};

SceneVideos.prototype.handleHide = function() {
    // this function will be called when the scene manager hide this scene
};

SceneVideos.prototype.handleFocus = function() {
    Data.mainScene = "Videos";
    if (Data.loadedVideos == 0) {
        $('#svecLoadingImage_RBVI').sfLoading('show');

        ServiceAPI.loadVideos(this,
            function() {
                numberOfItems = Data.VideoTitles.length;

                $vlist.sfList({
                    data: Data.VideoTitles,
                    index: 0
                });

                $vscroll.sfScroll({
                    currentPage: 0,
                    pages: Math.ceil(numberOfItems / itemsPerPage)
                });

                $('#svecLoadingImage_RBVI').sfLoading('hide');
                this.showDescription();
            },
            function() {
                $('#svecLoadingImage_RBVI').sfLoading('hide');
                ServiceAPI.onError();
            }
        );
    }
};


SceneVideos.prototype.handleBlur = function() {};


SceneVideos.prototype.showDescription = function() {
    var vid = this.getVideo();
    if (vid) {
        widgetAPI.putInnerHTML(document.getElementById("description_VI"), vid.toHtmlTable());
    }

};


SceneVideos.prototype.getVideo = function() {
    return Data.Videos[$('#svecListbox_Videos').sfList('getIndex')];
};


SceneVideos.prototype.updateScrollbar = function() {
    var currentPage = $vlist.sfList('getIndex') / itemsPerPage;
    $vscroll.sfScroll('move', Math.floor(currentPage));
};


SceneVideos.prototype.handleKeyDown = function(keyCode) {
    switch (keyCode) {
        case sf.key.RETURN:
            sf.key.preventDefault();
            break;
        case sf.key.LEFT:
            break;
        case sf.key.RIGHT:
            break;
        case sf.key.UP:
            $('#svecListbox_Videos').sfList('prev');
            this.updateScrollbar();
            this.showDescription();
            break;
        case sf.key.DOWN:
            $('#svecListbox_Videos').sfList('next');
            this.updateScrollbar();
            this.showDescription();
            break;
        case sf.key.ENTER:
            Data.currentStream = this.getVideo();
            sf.scene.hide(this.NAME);
            sf.scene.show('Player', {
                caller: this.NAME
            });
            sf.scene.focus('Player');
            break;
        case sf.key.RED:
            var item = this.getVideo();

            $('#svecPopup_ok_cancel_0AVI').sfPopup({
                'text': 'Do you really want to delete ' + item.Title + '<BR/>' + item.SubTitle + '?',
                buttons: ['Yes', 'No'],
                callback: function(rlt) {
                    if (rlt == 0) {
                        $('#svecLoadingImage_RBMO').sfLoading('show');
                        ServiceAPI.deleteVideo(
                            sf.scene.get('Videos'),               // context
                            sf.scene.get('Videos').onDeleteVideo, // callback
                            ServiceAPI.onFailed,                  // errback
                            item);
                    }
                }
            });
            $('#svecPopup_ok_cancel_0AVI').sfPopup('show');
            $('#svecPopup_ok_cancel_0AVI').sfPopup('focus');
            break;
        case sf.key.GREEN:
            sf.scene.hide(this.NAME);
            sf.scene.show('Groups');
            sf.scene.focus('Groups');
            break;
        case sf.key.TOOLS:
            sf.scene.hide(this.NAME);
            sf.scene.show('Settings', {
                caller: this.NAME
            });
            sf.scene.focus('Settings');
            break;
        case sf.key.BLUE:
            sf.scene.hide(this.NAME);
            sf.scene.show('Upcoming');
            sf.scene.focus('Upcoming');
            return;
    }
};


SceneVideos.prototype.onDeleteVideo = function() {
    var current = $vlist.sfList('getIndex');

    Data.Videos.splice(current, 1);
    Data.VideoTitles.splice(current, 1);
    $vlist.sfList({
        data: Data.VideoTitles,
        index: 0
    });
    if (current < $vlist.Count) {
        $vlist.sfList('move', current);
    }
    this.updateScrollbar();
    this.showDescription();
    $('#svecLoadingImage_RBMO').sfLoading('hide');
};
