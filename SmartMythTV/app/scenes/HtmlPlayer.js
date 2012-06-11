function SceneHtmlPlayer(options) {
	this.options = options;
	var plugin;
	var audio;
	var letterbox;
}

SceneHtmlPlayer.prototype.initialize = function () {
}

SceneHtmlPlayer.prototype.handleShow = function () {
	//plugin = document.getElementById("pluginPlayer");
	//plugin.InitPlayer(Data.streamURL);
	//"http://"+Data.URL+":6544/Content/GetRecording?ChanId="
	//	+Data.currentRecording.ChanId+"&StartTime="+Data.currentRecording.StartTime);
	//plugin.SetDisplayArea(0, 0, 960, 540);
	letterbox = false;
    //plugin.OnRenderingComplete = 'SceneHtmlPlayer.prototype.doHide';
	//plugin.SetTotalBufferSize(20*1024);
	//plugin.SetInitialBuffer(10*1024);
	//plugin.SetPendingBuffer(10*1024);
	//plugin.StartPlayback();
	
	audio = document.getElementById("pluginAudio");
	audio.SetExternalOutMode(0);

	var player = document.getElementById("vplayer");
	vplayer.setAttribute("src", Data.streamURL);
	player.play();
	alert("play!");

	var oKeyMap = {};
	oKeyMap.ENTER = 'Play';
	oKeyMap.RETURN = 'Cancel';
	$("#svecKeyHelp_4JNF").sfKeyHelp(oKeyMap);
	$("#svecKeyHelp_4JNF").sfKeyHelp('show');
	//$('#osd').show();
	//document.getElementById("osd").style.display = "block";
	//$('#osd').animate({'top' : 392},500,function(){
        //if(Main.osd == 0)
        //{
           // document.getElementById("osd").style.display = "none";
        //}
    //});
	
	var nnaviPlugin = document.getElementById('pluginObjectNNavi');		
	nnaviPlugin.SetBannerState(2);

	var pluginAPI = new Common.API.Plugin();
	//volume OSD
	pluginAPI.unregistKey(tvKey.KEY_VOL_UP);
	pluginAPI.unregistKey(tvKey.KEY_VOL_DOWN);
	pluginAPI.unregistKey(tvKey.KEY_MUTE);
	//return key
	//pluginAPI.unregistKey(tvKey.KEY_RETURN);
	pluginAPI.unregistKey(tvKey.KEY_PANEL_RETURN);
}

SceneHtmlPlayer.prototype.handleHide = function () {
	//sf.service.VideoPlayer.hide();
	plugin.Stop();
}

SceneHtmlPlayer.prototype.handleFocus = function () {
}

SceneHtmlPlayer.prototype.handleBlur = function () {
}

/*SceneHtmlPlayer.prototype.setKeyHelp = function () {
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

SceneHtmlPlayer.prototype.doHide = function() {
	sf.scene.hide('Player');
	sf.scene.show(parent);
	sf.scene.focus(parent);
}

SceneHtmlPlayer.prototype.handleKeyDown = function (keyCode) {
	switch (keyCode) {
		case sf.key.PAUSE:
			plugin.Pause();
			break;
		case sf.key.PLAY:
			plugin.Resume();
			break;
		case tvKey.KEY_RETURN:
		case tvKey.KEY_PANEL_RETURN:
		case sf.key.STOP:
			plugin.Stop();
			//plugin.ClearScreen();
			SceneHtmlPlayer.prototype.doHide();
			break;
		case sf.key.REW:
			plugin.JumpBackward(5);
			break;
		case sf.key.FF:
			plugin.JumpForward(5);
			break;
		case sf.key.LEFT:
			plugin.JumpBackward(30);
			break;
		case sf.key.RIGHT:
			plugin.JumpForward(60);
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
			$('#svecPopup_ok_cancel_PLAY').sfPopup({
				text:'Do you really want to delete '+Data.currentTitle+'?', 
				buttons:['Yes', 'No'], 
				callback:function (rlt){
					if(rlt==0) {
						plugin.Stop();
						ServiceAPI.deleteRecording(Data.currentRecording);
						SceneHtmlPlayer.prototype.doHide();
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
		case tvKey.KEY_BLUE:
			sf.service.AVSetting.show(function() { 
			
			});
			break;
	}
}
