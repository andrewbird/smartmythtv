function SceneGroups(options) {
    this.options = options;
    this.level = 0;
}

var widgetAPI = new Common.API.Widget(); // Create Common module

var $glist, $mlist, itemsPerPage = 10;
var $gscroll;
var $gspinner;


SceneGroups.prototype.NAME = "Groups";

SceneGroups.prototype.initialize = function() {

    itemsPerPage = 10;

    $gscroll = $('#svecScrollbar_Groups');
    $gscroll.sfScroll({
        currentPage: 0
    });

    $glist = $('#svecListbox_Groups');
    $glist.sfList({
        itemsPerPage: itemsPerPage
    });

    $mlist = $('#svecListbox_Members');
    $mlist.sfList({
        itemsPerPage: itemsPerPage
    });

    $gspinner = $('#svecLoadingImage_GBMO');
};


SceneGroups.prototype.makeGroupsData = function() {
    var rec = null, info = "", pos = -1;

    for (var i = 0; i < Data.Recordings.length; i++) {
        rec = Data.Recordings[i];

        info = rec.SubTitle;
        if(info.length == 0) {
            info = ServiceAPI.showDate(ServiceAPI.getDate(rec.StartTime));
        }

        pos = Data.GroupsGroupTitles.indexOf(rec.Title);
        if (pos == -1) { // Not found, create new group
            pos = Data.GroupsGroupTitles.push(rec.Title) - 1;
            Data.GroupsMemberTitles.push([]);
            Data.GroupsRecordings.push([]);
        }

        Data.GroupsMemberTitles[pos].push(info);

        Data.GroupsRecordings[pos].push(rec);
    }

    numberOfItems = Data.GroupsGroupTitles.length;

    $glist.sfList({
        data: Data.GroupsGroupTitles
    });

    $gscroll.sfScroll({
        pages: Math.ceil(numberOfItems / itemsPerPage)
    });
};


SceneGroups.prototype.initView = function() {
    $gspinner.sfLoading('show');

    ServiceAPI.loadRecordings(this,

        function () {
            this.makeGroupsData();
            this.selectView(0);

            $gspinner.sfLoading('hide');
        },

        function() {
            widgetAPI.putInnerHTML(document.getElementById("svecDescription_GRPS"),
                "Failed to load data from MythTv backend");

            $gspinner.sfLoading('hide');
        }
    );

    $glist.sfList('clear');
};


SceneGroups.prototype.showView = function() {
    if (Data.GroupsGroupTitles.length == 0) {
        $gspinner.sfLoading('show');
        this.makeGroupsData();
        $gspinner.sfLoading('hide');
    }
    this.selectView(this.level);
};


SceneGroups.prototype.setHelp = function() {
    var keys = {
       user   : Data.SMARTMYTHTVVERSION,
       red    : 'Delete',
       green  : 'Videos',
       yellow : 'Flat',
       enter  : 'Play',
       tools  : 'Settings'
    };

    if (this.level == 0) {
        delete keys.red;
        keys['enter'] = 'Select';
    }

    $('#svecKeyHelp_G2NM').sfKeyHelp(keys);
};


SceneGroups.prototype.updateScrollbar = function() {
    var currentPage = $glist.sfList('getIndex') / itemsPerPage;
    $gscroll.sfScroll('move', Math.floor(currentPage));
};

SceneGroups.prototype.handleShow = function() {};

SceneGroups.prototype.handleHide = function() {
    // this function will be called when the scene manager hide this scene
};

SceneGroups.prototype.handleFocus = function() {
    Data.mainScene = "Groups";
    if (Data.Recordings.length == 0) {
        this.initView();
    } else {
        this.showView();
    }
};

SceneGroups.prototype.handleBlur = function() {};

SceneGroups.prototype.handleKeyDown = function(keyCode) {

    switch (keyCode) {
        case sf.key.GREEN:
            sf.scene.hide(this.NAME);
            sf.scene.show('Videos');
            sf.scene.focus('Videos');
            return;
        case sf.key.YELLOW:
            sf.scene.hide(this.NAME);
            sf.scene.show('Flat');
            sf.scene.focus('Flat');
            return;
        case sf.key.TOOLS:
            sf.scene.hide(this.NAME);
            sf.scene.show('Settings', {
                caller: this.NAME
            });
            sf.scene.focus('Settings');
            return;
        case sf.key.INFO:
            this.initView();
            return;
    };

    if (this.level == 0) {
        var curpage, maxpage;

        switch (keyCode) {
            case sf.key.RETURN:
                sf.key.preventDefault();
                break;
            case sf.key.LEFT:
            case sf.key.RIGHT:
                // Paging
                curpage = Math.floor($glist.sfList('getIndex') / itemsPerPage);
                if (keyCode == sf.key.RIGHT)
                    curpage += 1;
                else
                    curpage -= 1;
                maxpage = Math.floor(Data.GroupsGroupTitles.length / itemsPerPage);
                if (curpage < 0)
                    curpage = maxpage;
                if (curpage > maxpage)
                    curpage = 0;
                $glist.sfList('move', curpage * itemsPerPage);
                this.updateScrollbar();
                break;
            case sf.key.UP:
                // Show previous item in level 0 list
                $glist.sfList('prev');
                this.updateScrollbar();
                break;
            case sf.key.DOWN:
                // Show next item in level 0 list
                $glist.sfList('next');
                this.updateScrollbar();
                break;
            case sf.key.ENTER:
                // Select a level 0 item from Group, now change the list to be All
                // the titles in that group and move to level 1
                this.generateMemberList();
                this.selectView(1);
                break;
        }

    } else {
        // level 1, items in the group
        switch (keyCode) {
            case sf.key.RETURN:
                sf.key.preventDefault();
                /* fall through */
            case sf.key.LEFT:
                // Go back to previous level, show all the groups
                this.selectView(0);
                break;
            case sf.key.RIGHT:
                break;
            case sf.key.UP:
                $mlist.sfList('prev');
                this.showDescription();
                break;
            case sf.key.DOWN:
                $mlist.sfList('next');
                this.showDescription();
                break;

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
                            $gspinner.sfLoading('show');
                            ServiceAPI.deleteRecording(
                                sf.scene.get('Groups'),                    // context
                                sf.scene.get('Groups').onDeleteRecording,  // callback
                                ServiceAPI.onError,                        // errback
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


SceneGroups.prototype.generateMemberList = function() {
    var gitem = $glist.sfList('getIndex');

    $mlist.sfList('clear');
    $mlist.sfList({
        data: Data.GroupsMemberTitles[gitem]
    });
};


SceneGroups.prototype.selectView = function(newlevel) {
    if (newlevel == 0) {
        $mlist.sfList('hide');

        $glist.sfList('show');
        $glist.sfList('focus');
        $gscroll.sfScroll('show');

        this.hideDescription();
    } else {
        $glist.sfList('hide');
        $gscroll.sfScroll('hide');

        $mlist.sfList('show');
        $mlist.sfList('focus');

        this.showDescription();
    }

    this.level = newlevel;
    this.setHelp();
};


// Fill the Description area with details of the selected Recording
SceneGroups.prototype.showDescription = function() {
    var rec = this.getRecording();

    widgetAPI.putInnerHTML(document.getElementById("svecDescription_GRPS"), rec.toHtmlTable());
};

SceneGroups.prototype.hideDescription = function() {
    $('#svecDescription_GRPS').sfLabel('destroy');
    widgetAPI.putInnerHTML(document.getElementById("svecDescription_GRPS"), "");
};

// Find the current Recording
SceneGroups.prototype.getRecording = function() {
    var gitem = $glist.sfList('getIndex');
    var mitem = $mlist.sfList('getIndex');
    var rec = Data.GroupsRecordings[gitem][mitem];
/*
    if(rec) {
        alert("GetRecording returning groupid=" + gitem + " mitem=" + mitem + " Filename=" + rec.FileName);
    } else {
        alert("GetRecording returning groupid=" + gitem + " mitem=" + mitem + " - Not found");
    }
 */
    return rec;
};

// callback
SceneGroups.prototype.onDeleteRecording = function() {
    var gitem = $glist.sfList('getIndex');
    var mitem = $mlist.sfList('getIndex');
    var rec = Data.GroupsRecordings[gitem][mitem];

    // Remove the item from the level 1 list
    Data.GroupsMemberTitles[gitem].splice(mitem, 1);
    Data.GroupsRecordings[gitem].splice(mitem, 1);

    if (Data.GroupsMemberTitles[gitem].length == 0) {
        // Last one in this group, so remove the group from level0
        Data.GroupsMemberTitles.splice(gitem, 1);
        Data.GroupsRecordings.splice(gitem, 1);
        Data.GroupsGroupTitles.splice(gitem, 1);
        $glist.sfList({
            data: Data.GroupsGroupTitles,
            index: 0
        });
        if (gitem > 0)
            $glist.sfList('move', gitem - 1);
        this.selectView(0);
    } else {
        this.generateMemberList();
        if (mitem > 0)
            $mlist.sfList('move', mitem - 1);
        this.selectView(1);
    }

    // We find the recording and title in the Flat list
    var idx = ServiceAPI.getObjectIndexInList(rec, Data.Recordings);
    if(idx !== null) {
        Data.Recordings.splice(idx, 1);
        Data.FlatTitles.length = 0; // empty the list to cause reload on show
    }

    $gspinner.sfLoading('hide');
};
