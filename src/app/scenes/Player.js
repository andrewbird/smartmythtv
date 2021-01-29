var pluginAPI = new Common.API.Plugin();
var plugin;
var audio;
var letterbox;
var pstate = 0; // stopped

function ScenePlayer(options) {
    this.options = options;
    this.caller = null;
};

ScenePlayer.prototype.NAME = "Player";

ScenePlayer.prototype.initialize = function() {};

ScenePlayer.prototype.handleShow = function(args) {
    this.caller = args.caller;

    plugin = document.getElementById("pluginPlayer");
    plugin.InitPlayer(ServiceAPI.getStreamUrl(Data.currentStream));
    plugin.SetDisplayArea(0, 0, 960, 540);
    letterbox = false;
    plugin.OnRenderingComplete = 'ScenePlayer.prototype.endOfStream';
    plugin.OnCurrentPlayTime = OSD.onCurrentPlayTime;
    plugin.OnStreamInfoReady = 'ScenePlayer.prototype.getDuration';
    //plugin.SetTotalBufferSize(20*1024);
    //plugin.SetInitialBuffer(10*1024);
    //plugin.SetPendingBuffer(10*1024);
    pluginAPI.setOffScreenSaver();
    plugin.StartPlayback();
    pstate = 1; // playing

    audio = document.getElementById("pluginAudio");
    audio.SetExternalOutMode(0);

    var oKeyMap = {};
    oKeyMap.ENTER = 'Play';
    oKeyMap.RETURN = 'Cancel';
    $("#svecKeyHelp_4JNF").sfKeyHelp(oKeyMap);
    $("#svecKeyHelp_4JNF").sfKeyHelp('show');

    var nnaviPlugin = document.getElementById('pluginObjectNNavi');
    nnaviPlugin.SetBannerState(2);

    /*
      unregistKey instructs the application to ignore the keypress and so it
      gets passed to the TV itself.
    */
    //volume OSD
    pluginAPI.unregistKey(tvKey.KEY_VOL_UP);
    pluginAPI.unregistKey(tvKey.KEY_VOL_DOWN);
    pluginAPI.unregistKey(tvKey.KEY_MUTE);
    //return key
    //pluginAPI.unregistKey(tvKey.KEY_RETURN);
    pluginAPI.unregistKey(tvKey.KEY_PANEL_RETURN);
};

ScenePlayer.prototype.getDuration = function() {
    OSD.initOSD(plugin.GetDuration(), this.IsPlaying);
    OSD.setTitleOSD(Data.currentStream.Title);
    OSD.startOSD();
};

ScenePlayer.prototype.handleHide = function() {
    //sf.service.VideoPlayer.hide();
    //plugin.Stop();
};

ScenePlayer.prototype.handleFocus = function() {};

ScenePlayer.prototype.handleBlur = function() {};

/*ScenePlayer.prototype.setKeyHelp = function () {
	return;
	alert("ok");
	//sf.service.VideoPlayer.STATE_PLAYING = 1;
    //sf.service.VideoPlayer.STATE_STOPPED  = 2;
    //sf.service.VideoPlayer.STATE_PAUSED   = 3;
    //sf.service.VideoPlayer.STATE_BUFFERING    = 4;
    //sf.service.VideoPlayer.STATE_SCANNING = 5;
	var oKeyMap = {};

	//if (this.nState == sf.service.VideoPlayer.STATE_PLAYING ||
	//this.nState == sf.service.VideoPlayer.STATE_PAUSED ||
	//this.nState == sf.service.VideoPlayer.STATE_BUFFERING) {
	//	oKeyMap.RED = 'Fullscreen';
	//}

	if (sf.service.VideoPlayer.Skip.isInProgress()) {
        oKeyMap.ENTER = 'Play';
		oKeyMap.RETURN = 'Cancel';
		$("#svecKeyHelp_4JNF").sfKeyHelp(oKeyMap);
		$("#svecKeyHelp_4JNF").sfKeyHelp('show');
	} else {
		oKeyMap.UPDOWN = 'Move Item';
		oKeyMap.ENTER = 'Play';
        oKeyMap.RETURN = 'Return';
		$("#svecKeyHelp_4JNF").hide();
	}

	alert("kk");
}*/

ScenePlayer.prototype.endOfStream = function() {
    this.Stop();
};

ScenePlayer.prototype.Quit = function() {
    sf.scene.hide(this.NAME);
    sf.scene.show(this.caller);
    sf.scene.focus(this.caller);
};

ScenePlayer.prototype.IsPlaying = function() {
    return (pstate == 1);
};

ScenePlayer.prototype.JumpBackward = function(jump) {
    if (pstate == 1) {          // playing
        if(this.Pause()){
            if(plugin.JumpBackward(jump)){
                OSD.showOSD();
            }
            return this.Play();
        }
        return false;
    } else if (pstate == 2) {   // paused
        if(plugin.JumpBackward(jump)){
            OSD.adjustCurrentPlayTime((-jump));
            OSD.showOSD();
            return true;
        }
        return false;
    }
    return false;
};

ScenePlayer.prototype.JumpForward = function(jump) {
    if (pstate == 1) {          // playing
        if(this.Pause()){
            if(plugin.JumpForward(jump)){
                OSD.showOSD();
            }
            return this.Play();
        }
        return false;
    } else if (pstate == 2) {   // paused
        if(plugin.JumpForward(jump)){
            OSD.adjustCurrentPlayTime(jump);
            OSD.showOSD();
            return true;
        }
        return false;
    }
    return false;
};

ScenePlayer.prototype.Pause = function() {
    if(plugin.Pause()) {
        pstate = 2;
        OSD.showOSD();
        OSD.autohide(false);
        pluginAPI.setOnScreenSaver();
        return true;
    }
    return false;
};

ScenePlayer.prototype.Play = function() {
    if(plugin.Resume()) {
        pstate = 1; // playing
        OSD.showOSD();
        OSD.autohide(true);
        pluginAPI.setOffScreenSaver();
        return true;
    }
    return false;
};

ScenePlayer.prototype.Stop = function() {
    if(plugin.Stop()) {
        pstate = 0; // stopped
        OSD.hideOSD();
        OSD.stopOSD();
        pluginAPI.setOnScreenSaver();
        return true;
    }
    return false;
};

ScenePlayer.prototype.Toggle = function() {
    if (pstate == 1) {        // playing
        return this.Pause();
    } else if (pstate == 2) { // paused
        return this.Play();
    }
    return false;
};

ScenePlayer.prototype.handleKeyDown = function(keyCode) {
    switch (keyCode) {
        case sf.key.EXIT:
        case sf.key.RETURN:
            sf.key.preventDefault();
            /* fall through */
        case sf.key.STOP:
            this.Stop();
            this.Quit();
            break;

        case sf.key.PAUSE:
            this.Pause();
            break;

        case sf.key.PLAY:
            this.Play();
            break;

        case tvKey.KEY_RETURN:
        case tvKey.KEY_PANEL_RETURN:
            widgetAPI.blockNavigation(keyCode);
            this.Stop();
            this.Quit();
            break;

        case sf.key.REW:
            // Jump back 5 secs
            this.JumpBackward(5);
            break;

        case sf.key.FF:
            // Jump forward 5 secs
            this.JumpForward(5);
            break;

        case sf.key.DOWN:
            sf.key.preventDefault();
            // Jump back 5 mins
            this.JumpBackward(300);
            break;

        case sf.key.UP:
            sf.key.preventDefault();
            // Jump forward 5 mins
            this.JumpForward(300);
            break;

        case sf.key.LEFT:
            // Jump back 30 secs
            this.JumpBackward(30);
            break;

        case sf.key.RIGHT:
            // Jump forward 60 secs
            this.JumpForward(60);
            break;

        case sf.key.ENTER:
            this.Toggle();
            break;

        case tvKey.KEY_VOL_UP:
        case tvKey.KEY_PANEL_VOL_UP:
            audio.SetVolumeWithKey(0);
            break;

        case tvKey.KEY_VOL_DOWN:
        case tvKey.KEY_PANEL_VOL_DOWN:
            audio.SetVolumeWithKey(1);
            break;

        case tvKey.KEY_RED:
            var item = Data.currentStream;
            var obj = this;
            $('#svecPopup_ok_cancel_PLAY').sfPopup({
                'text': 'Do you really want to delete ' + item.Title + '<BR/>' + item.SubTitle + '?',
                buttons: ['Yes', 'No'],
                callback: function(rlt) {
                    if (rlt == 0) {
                        obj.Stop();
                        obj.Quit();
                        if (item.StartTime) {
                            ServiceAPI.deleteRecording(
                                sf.scene.get(obj.caller),
                                sf.scene.get(obj.caller).onDeleteRecording,
                                ServiceAPI.onError,
                                item);
                        } else {
                            ServiceAPI.deleteVideo(
                                sf.scene.get('Videos'),               // context
                                sf.scene.get('Videos').onDeleteVideo, // callback
                                ServiceAPI.onFailed,                  // errback
                                item);
                        }
                    }
                }
            });
            $('#svecPopup_ok_cancel_PLAY').sfPopup('show');
            $('#svecPopup_ok_cancel_PLAY').sfPopup('focus');
            break;

        case tvKey.KEY_YELLOW:
            if (letterbox) {
                plugin.SetDisplayArea(0, 0, 960, 540);
                letterbox = false;
            } else {
                plugin.SetDisplayArea(120, 0, 720, 540);
                letterbox = true;
            }
            break;
    }
};
