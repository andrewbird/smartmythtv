var widgetAPI = new Common.API.Widget(); // Create Common module

function SceneUpcoming() {

}

SceneUpcoming.prototype.NAME = "Upcoming";

var $ulist;
var $uspinner;

SceneUpcoming.prototype.initialize = function() {
/*
  This function will be called only once when the scene manager shows
  this scene for the first time. Initialize the scene controls and
  styles, and initialize your variables here. The scene HTML and CSS
  will be loaded before this function is called.
*/

    $ulist = $('#svecListbox_N9NK');

    $uspinner = $('#svecLoadingImage_Upcoming');

    this.setHelp();
};


SceneUpcoming.prototype.setHelp = function() {
    var keys;
    var rec = this.getRecording();

    keys = {
        user   : Data.SMARTMYTHTVVERSION,
        red    :  'xxxx',  // placeholder to maintain the order
        green  : 'Videos',
        yellow : 'Groups',
        info   : 'Refresh',
        tools  : 'Settings'
    };

    if (rec && rec.Status == 10) {
        keys['red'] = "Enable Recording";       // Inactive
    } else if (rec && rec.Status == -1) {
        keys['red'] = "Disable Recording";      // Active
    } else {
        delete keys.red;
    }
    $('#svecKeyHelp_Upcoming').sfKeyHelp(keys);

};


SceneUpcoming.prototype.handleShow = function(data) {
    // this function will be called when the scene manager show this scene
};

SceneUpcoming.prototype.handleHide = function() {
    // this function will be called when the scene manager hide this scene
};

SceneUpcoming.prototype.handleFocus = function() {
    Data.mainScene = "Upcoming";
    if (Data.UpcomingList.length == 0) {
        $uspinner.sfLoading('show');

        ServiceAPI.loadUpcoming(this,
            function() {

                $ulist.sfList({
                    data: Data.UpcomingList,
                    itemsPerPage: 10,
                    index: 0
                });

                $ulist.sfList('focus');

                this.showDescription();
                $uspinner.sfLoading('hide');
            },

            function() {
                $uspinner.sfLoading('hide');
                ServiceAPI.onError();
            }
        );
    }
};

SceneUpcoming.prototype.handleBlur = function() {
    // this function will be called when the scene manager move focus to another
    // scene from this scene
};

SceneUpcoming.prototype.handleKeyDown = function(keyCode) {
    // TODO : write an key event handler when this scene get focued
    switch (keyCode) {
        case sf.key.EXIT:
            sf.key.preventDefault();
            widgetAPI.sendReturnEvent();
            return;
        case sf.key.RETURN:
            sf.key.preventDefault();
            break;
        case sf.key.LEFT:
            break;
        case sf.key.RIGHT:
            break;
        case sf.key.UP:
            $ulist.sfList('prev');
            this.showDescription();
            break;
        case sf.key.DOWN:
            $ulist.sfList('next');
            this.showDescription();
            break;
        case sf.key.ENTER:
            break;

        case sf.key.RED:
            var rec = this.getRecording();

            var question = "Do you really want to disable rule<br>";
            if (rec.Status == -1) {
                // default
            } else if (rec.Status == 10) {
                // Inactive
                question = "Do you really want to enable rule<br>";
            } else {
                // Not a status we handle
                break;
            }
            $('#svecPopup_ok_cancel_0AM8').sfPopup({
                'text': question + $ulist.sfList('getSelectedItem') + '?',
                buttons: ['Yes', 'No'],
                callback: function(rlt) {
                    if (rlt == 0) { // Yes
                        $uspinner.sfLoading('show');
                        ServiceAPI.changeRecordSchedule(
                            sf.scene.get('Upcoming'),               // context
                            function() {                            // callback
                                // should we redraw?
                                $uspinner.sfLoading('hide');
                            },
                            function() {                            // errback
                                $uspinner.sfLoading('hide');
                            },
                            rec);
                    }
                }
            });
            $('#svecPopup_ok_cancel_0AM8').sfPopup('show');
            $('#svecPopup_ok_cancel_0AM8').sfPopup('focus');
            break;
        case sf.key.GREEN:
            sf.scene.hide(this.NAME);
            sf.scene.show('Videos');
            sf.scene.focus('Videos');
            return;
        case sf.key.YELLOW:
            sf.scene.hide(this.NAME);
            sf.scene.show('Groups');
            sf.scene.focus('Groups');
            return;
        case sf.key.BLUE:
            break;

        case sf.key.TOOLS:
            sf.scene.hide(this.NAME);
            sf.scene.show('Settings', {
                caller: this.NAME
            });
            sf.scene.focus('Settings');
            return;

        case sf.key.INFO: // Reload
            $uspinner.sfLoading('show');
            ServiceAPI.loadUpcoming();
            $uspinner.sfLoading('hide');
            return;
    };
};

SceneUpcoming.prototype.getRecording = function() {
    var item = $ulist.sfList('getIndex');
    return Data.UpcomingDetail[item];
};

// Fill the Description area with details of the selected Recording
SceneUpcoming.prototype.showDescription = function() {
    var rec = this.getRecording();

    widgetAPI.putInnerHTML(document.getElementById("descriptionUpcoming"), rec.toHtmlTable());

    this.setHelp();
};
