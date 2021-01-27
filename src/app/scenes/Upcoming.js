function SceneUpcoming() {

}

SceneUpcoming.prototype.NAME = "Upcoming";

var $uspinner;
var lastStatus = 99;

SceneUpcoming.prototype.initialize = function() {
    alert("SceneUpcoming.initialize()");
    // this function will be called only once when the scene manager show this
    // scene first time
    // initialize the scene controls and styles, and initialize your variables
    // here
    // scene HTML and CSS will be loaded before this function is called

    $uspinner = $('#svecLoadingImage_Upcoming');

    this.setHelp();
};


SceneUpcoming.prototype.setHelp = function() {
    var keys;
    var rec = this.getRecording();
    if (rec && lastStatus == rec.Status) {
        // Same status, no need to redraw
        return;
    }

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
    alert("SceneUpcoming.handleShow()");
    // this function will be called when the scene manager show this scene
};

SceneUpcoming.prototype.handleHide = function() {
    alert("SceneUpcoming.handleHide()");
    // this function will be called when the scene manager hide this scene
};

SceneUpcoming.prototype.handleFocus = function() {
    Data.mainScene = "Upcoming";
    if (Data.loadedUpcoming == 0) {
        $uspinner.sfLoading('show');

        ServiceAPI.onDeleteCurrent = function() {
            alert("onDeleteCurrent upcoming");
            //setTimeout(ServiceAPI.loadUpcoming, (5 * 1000));
            // Reload the data again as deleting one rule may remove multiple
            // items
            // Delaying the reload for 5 seconds, as my mythbackend seems to a
            // take a while to update the schedule
        };

        ServiceAPI.loadUpcoming(this,
            function() {
                alert("onReceived upcoming");
                $('#svecListbox_N9NK').sfList({
                    data: Data.UpcomingList,
                    itemsPerPage: 10,
                    index: 0
                });
                this.showDescription();
                $('#svecListbox_N9NK').sfList('focus');
                $uspinner.sfLoading('hide');
                lastStatus = 99;
            },

            function() {
                $uspinner.sfLoading('hide');
                ServiceAPI.onError();
            }
        );
    }
};

SceneUpcoming.prototype.handleBlur = function() {
    alert("SceneUpcoming.handleBlur()");
    // this function will be called when the scene manager move focus to another
    // scene from this scene
};

SceneUpcoming.prototype.handleKeyDown = function(keyCode) {
    alert("SceneUpcoming.handleKeyDown(" + keyCode + ")");
    // TODO : write an key event handler when this scene get focued
    switch (keyCode) {
        case sf.key.RETURN:
            sf.key.preventDefault();
            break;
        case sf.key.LEFT:
            break;
        case sf.key.RIGHT:
            break;
        case sf.key.UP:
            $('#svecListbox_N9NK').sfList('prev');
            this.showDescription();
            break;
        case sf.key.DOWN:
            $('#svecListbox_N9NK').sfList('next');
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
                'text': question + Data.UpcomingList[$('#svecListbox_N9NK').sfList(
                    'getIndex')] + '?',
                buttons: ['Yes', 'No'],
                callback: function(rlt) {
                    if (rlt == 0) { // Yes
                        $uspinner.sfLoading('show');
                        // TODO integrate "Don't record" feature, when
                        // available in backend
                        ServiceAPI.changeRecordSchedule(rec);
                        // onDeleteCurrent will be called back
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
    var item = $('#svecListbox_N9NK').sfList('getIndex');
    return Data.UpcomingDetail[item];
};

// Fill the Description area with details of the selected Recording
SceneUpcoming.prototype.showDescription = function() {
    var rec = this.getRecording();

    widgetAPI.putInnerHTML(document.getElementById("descriptionUpcoming"), rec.toHtmlTable());

    this.setHelp();
};