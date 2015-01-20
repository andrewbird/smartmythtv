function SceneGroups(options) {
    this.options = options;
}

var widgetAPI = new Common.API.Widget(); // Create Common module
var level = 0;

SceneGroups.prototype.NAME = "Groups";

SceneGroups.prototype.initialize = function() {
    $('#svecListbox_Groups').sfList({
        itemsPerPage: 10
    });
    $('#svecListbox_Members').sfList({
        itemsPerPage: 10
    });
    $('#svecScrollbar_GKRU').sfScroll({
        page: 0
    });
};


SceneGroups.prototype.loadData = function() {
    if(Data.GroupsGroupTitles.length == 0) {
        $('#svecLoadingImage_GBMO').sfLoading('show');

        if (Data.Recordings.length == 0) {
            ServiceAPI.loadRecordings(this,
                function() {
                    ServiceAPI.makeGroupsView();
                    $('#svecListbox_Groups').sfList({
                        data: Data.GroupsGroupTitles,
                        index: 0
                    });
                    this.Level0();
                    $('#svecLoadingImage_GBMO').sfLoading('hide');
                },

                function() {
                    widgetAPI.putInnerHTML(document
                        .getElementById("svecDescription_GRPS"),
                        "Failed to load data from MythTv backend");
                    $('#svecLoadingImage_GBMO').sfLoading('hide');
                }
            );

        } else {
            ServiceAPI.makeGroupsView();
            $('#svecListbox_Groups').sfList({
                data: Data.GroupsGroupTitles,
                index: 0
            });
            this.Level0();
            $('#svecLoadingImage_GBMO').sfLoading('hide');
        }
    }
};


SceneGroups.prototype.setHelp = function() {
    var keys = {};
    keys['user'] = Data.SMARTMYTHTVVERSION;
    keys['info'] = 'Refresh';
    if (level == 1) {
        keys['red'] = 'Delete';
    }
    keys['green'] = 'Videos';
    keys['yellow'] = 'Recordings';
    keys['blue'] = 'Upcoming';
    if (level == 0) {
        keys['enter'] = 'Select';
        keys['tools'] = 'Settings';
    } else {
        keys['enter'] = 'Play';
        keys['return'] = 'Back';
    }

    $('#svecKeyHelp_G2NM').sfKeyHelp(keys);
};

SceneGroups.prototype.handleShow = function() {};

SceneGroups.prototype.handleHide = function() {
    // this function will be called when the scene manager hide this scene
};

SceneGroups.prototype.handleFocus = function() {
    Data.mainScene = "Groups";
    this.loadData();
};

SceneGroups.prototype.handleBlur = function() {};

SceneGroups.prototype.handleKeyDown = function(keyCode) {

    switch (keyCode) {
        case 20: // GREEN
            sf.scene.hide(this.NAME);
            sf.scene.show('Videos');
            sf.scene.focus('Videos');
            return;
        case sf.key.YELLOW:
            sf.scene.hide(this.NAME);
            sf.scene.show('Recordings');
            sf.scene.focus('Recordings');
            return;
        case sf.key.TOOLS:
            sf.scene.hide(this.NAME);
            sf.scene.show('Settings', {
                caller: this.NAME
            });
            sf.scene.focus('Settings');
            return;
        case sf.key.BLUE:
            sf.scene.hide(this.NAME);
            sf.scene.show('Upcoming');
            sf.scene.focus('Upcoming');
            return;
        case sf.key.INFO:
            ServiceAPI.clearRecordings();
            this.loadData();
            return;
    };

    if (level == 0) {
        switch (keyCode) {
            case sf.key.LEFT:
                break;
            case sf.key.RIGHT:
            case sf.key.ENTER:
            case sf.key.PLAY:
                // Select a level 0 item from Group, now change the list to be All
                // the titles in that group and move to level 1
                SceneGroups.prototype.Level1();
                break;
            case sf.key.UP:
                // Show previous item in level 0 list
                $('#svecScrollbar_GKRU').sfScroll('prev');
                $('#svecListbox_Groups').sfList('prev');
                break;
            case sf.key.DOWN:
                // Show next item in level 0 list
                $('#svecScrollbar_GKRU').sfScroll('next');
                $('#svecListbox_Groups').sfList('next');
                break;
        }

    } else {
        // level 1, items in the group
        switch (keyCode) {
            case sf.key.RETURN:
                sf.key.preventDefault();
            case sf.key.LEFT:
            case sf.key.BACK:
                // Go back to previous level, show all the groups
                SceneGroups.prototype.Level0();
                break;

            case sf.key.UP:
                $('#svecScrollbar_GKRU').sfScroll('prev');
                $('#svecListbox_Members').sfList('prev');
                SceneGroups.prototype.showDescription();
                break;

            case sf.key.DOWN:
                $('#svecScrollbar_GKRU').sfScroll('next');
                $('#svecListbox_Members').sfList('next');
                SceneGroups.prototype.showDescription();
                break;

            case sf.key.RIGHT:
            case sf.key.ENTER:
            case sf.key.PLAY:
                // Play the selected item
                Data.currentStream = this.getRecording();
                sf.scene.hide(this.NAME);
                sf.scene.show('Player', {
                    caller: this.NAME
                });
                sf.scene.focus('Player');
                break;

            case sf.key.RED:
                // Delete the selected item
                var item = this.getRecording();
                $('#svecPopup_ok_cancel_GAM7').sfPopup({
                    'text': 'Do you really want to delete ' + item.Title + '<BR/>' + item.SubTitle + '?',
                    buttons: ['Yes', 'No'],
                    callback: function(rlt) {
                        if (rlt == 0) {
                            $('#svecLoadingImage_GBMO').sfLoading('show');
                            ServiceAPI.deleteRecording(
                                sf.scene.get('Groups'),                         // context
                                sf.scene.get('Groups').onDeleteRecording,       // callback
                                ServiceAPI.onError,                             // errback
                                item);
                        }
                    }
                });
                $('#svecPopup_ok_cancel_GAM7').sfPopup('show');
                $('#svecPopup_ok_cancel_GAM7').sfPopup('focus');
                break;
        }
    }
};

SceneGroups.prototype.Level0 = function() {
    $('#svecListbox_Members').sfList('hide');
    $('#svecListbox_Groups').sfList('show');
    $('#svecListbox_Groups').sfList('focus');

    level = 0;
    this.setHelp();

    $('#svecDescription_GRPS').sfLabel('destroy');
    widgetAPI.putInnerHTML(document.getElementById("svecDescription_GRPS"), "");
};

SceneGroups.prototype.Level1 = function() {
    var gitem = $('#svecListbox_Groups').sfList('getIndex');
    alert("Going to groupid:" + gitem);

    $('#svecListbox_Groups').sfList('hide');

    $('#svecListbox_Members').sfList('clear');
    $('#svecListbox_Members').sfList({
        data: Data.GroupsMemberTitles[gitem],
        'index': 0
    });
    $('#svecListbox_Members').sfList('show');
    $('#svecListbox_Members').sfList('focus');

    level = 1;
    this.setHelp();

    $('#svecScrollbar_GKRU').sfScroll({
        page: 0
    });
    this.showDescription();
};

// Fill the Description area with details of the selected Recording
SceneGroups.prototype.showDescription = function() {
    var rec = this.getRecording();

    widgetAPI.putInnerHTML(document.getElementById("svecDescription_GRPS"), rec.toHtmlTable());
};

// Find the current Recording
SceneGroups.prototype.getRecording = function() {
    var gitem = $('#svecListbox_Groups').sfList('getIndex');
    var ritem = $('#svecListbox_Members').sfList('getIndex');
    var rec = Data.GroupsRecordings[gitem][ritem];
    if(rec) {
        alert("GetRecording returning groupid=" + gitem + " ritem=" + ritem + " Filename=" + rec.FileName);
    } else {
        alert("GetRecording returning groupid=" + gitem + " ritem=" + ritem + " - Not found");
    }
    return rec;
};

// callback
SceneGroups.prototype.onDeleteRecording = function() {
    var gitem = $('#svecListbox_Groups').sfList('getIndex');
    var ritem = $('#svecListbox_Members').sfList('getIndex');

    // Remove the item from the level 1 list
    Data.GroupsMemberTitles[gitem].splice(ritem, 1);
    Data.GroupsRecordings[gitem].splice(ritem, 1);

    if (Data.GroupsMemberTitles[gitem].length == 0) {
        // Last one in this group, so remove the group from level0
        Data.GroupsMemberTitles.splice(gitem, 1);
        Data.GroupsRecordings.splice(gitem, 1);
        Data.GroupsGroupTitles.splice(gitem, 1);
        $('#svecListbox_Groups').sfList({
            data: Data.GroupsGroupTitles,
            index: 0
        });
        this.Level0();
    } else {
        this.Level1();
    }
    $('#svecLoadingImage_GBMO').sfLoading('hide');
};
