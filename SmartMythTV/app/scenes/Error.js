function SceneError() {


}

SceneError.prototype.initialize = function() {
    alert("SceneError.initialize()");
    // this function will be called only once when the scene manager show this scene first time
    // initialize the scene controls and styles, and initialize your variables here
    // scene HTML and CSS will be loaded before this function is called

    $('#svecImage_P4CH').sfImage({
        src: 'images/mythtv.png'
    }).sfImage('show');
    $('#svecKeyHelp_D1ZT').sfKeyHelp({
        'red': 'Retry',
        'tools': 'Settings',
        'return': 'Return'
    });
    $('#svecLabel_DRCH').sfLabel({
        text: 'Error'
    });
    $('#svecLabel_PLYI').sfLabel({
        'text': 'There has been an error contacting the MythTV Backend server<br>' + 'Please check the server is running.<p>Server IP: ' + Data.URL + '<p><p>' + 'For further assistance please see http://sourceforge.net/p/smartmythtv<p>' + 'Please check your settings, or retry the connection<br>'
    });
};




SceneError.prototype.handleShow = function(data) {
    alert("SceneError.handleShow()");
    // this function will be called when the scene manager show this scene
};

SceneError.prototype.handleHide = function() {
    alert("SceneError.handleHide()");
    // this function will be called when the scene manager hide this scene
};

SceneError.prototype.handleFocus = function() {
    alert("SceneError.handleFocus()");
    // this function will be called when the scene manager focus this scene
};

SceneError.prototype.handleBlur = function() {
    alert("SceneError.handleBlur()");
    // this function will be called when the scene manager move focus to another scene from this scene
};

SceneError.prototype.handleKeyDown = function(keyCode) {

    switch (keyCode) {
        case sf.key.LEFT:
            break;
        case sf.key.RIGHT:
            break;
        case sf.key.UP:
            break;
        case sf.key.DOWN:
            break;
        case sf.key.ENTER:
            break;
        case sf.key.RED:
            //Retry
            Data.loadedUpcoming = 0;
            Data.loadedVideos = 0;
            Data.loadedGroups = 0;
            Data.loadedRecordings = 0;
            sf.scene.hide('Error');
            sf.scene.show(Data.mainScene);
            sf.scene.focus(Data.mainScene);
            break;
        case sf.key.TOOLS:
            sf.scene.hide('Error');
            sf.scene.show('Settings');
            sf.scene.focus('Settings');
            return;
    }
};
