var pluginAPI = new Common.API.Plugin();
var plugin;
var audio;
var letterbox;

function ScenePlayer(options) {
	this.options = options;
};

ScenePlayer.prototype.initialize = function () {
};

ScenePlayer.prototype.handleShow = function () {
	plugin = document.getElementById("pluginPlayer");
	plugin.InitPlayer(Data.streamURL);
	plugin.SetDisplayArea(0, 0, 960, 540);
	//var PlayerEmp = document.getElementById('PluginSef');
	//PlayerEmp.Open('Player', '1.000', 'Player');
	//PlayerEmp.Execute('InitPlayer', Data.streamURL);
	//PlayerEmp.Execute('SetDisplayArea', 0, 0, 960, 540);

	//PlayerEmp.Execute('SetStreamID', 1, 1);
	//PlayerEmp.Execute('SetInitialBufferSize', 1000*1024);
	//PlayerEmp.Execute('StartPlayback');
	/*sf.service.VideoPlayer.play({
		url: Data.streamURL,
		fullScreen: true
	});*/
	letterbox = false;
    plugin.OnRenderingComplete = 'ScenePlayer.prototype.doHide';
	plugin.OnCurrentPlayTime = 'OSD.updateOSD';
	plugin.OnStreamInfoReady = 'ScenePlayer.prototype.getDuration';
	//plugin.SetTotalBufferSize(20*1024);
	//plugin.SetInitialBuffer(10*1024);
	//plugin.SetPendingBuffer(10*1024);
	pluginAPI.setOffScreenSaver();
	plugin.StartPlayback();
	
	audio = document.getElementById("pluginAudio");
	audio.SetExternalOutMode(0);

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

	//volume OSD
	pluginAPI.unregistKey(tvKey.KEY_VOL_UP);
	pluginAPI.unregistKey(tvKey.KEY_VOL_DOWN);
	pluginAPI.unregistKey(tvKey.KEY_MUTE);
	//return key
	//pluginAPI.unregistKey(tvKey.KEY_RETURN);
	pluginAPI.unregistKey(tvKey.KEY_PANEL_RETURN);
};

ScenePlayer.prototype.getDuration = function() {
	OSD.initOSD(plugin.GetDuration());
};

ScenePlayer.prototype.handleHide = function () {
	//sf.service.VideoPlayer.hide();
	//plugin.Stop();
};

ScenePlayer.prototype.handleFocus = function () {
};

ScenePlayer.prototype.handleBlur = function () {
};

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

ScenePlayer.prototype.doHide = function() {
	pluginAPI.setOnScreenSaver();
	sf.scene.hide('Player');
	sf.scene.show(Data.mainScene);
	sf.scene.focus(Data.mainScene);
};

ScenePlayer.prototype.handleKeyDown = function (keyCode) {
	switch (keyCode) {
		case sf.key.PAUSE:
			OSD.showOSD(2000);
			plugin.Pause();
			pluginAPI.setOnScreenSaver();
			break;
		case sf.key.PLAY:
			pluginAPI.setOffScreenSaver();
			OSD.showOSD(2000);
			plugin.Resume();
			break;
		case tvKey.KEY_RETURN:
		case tvKey.KEY_PANEL_RETURN:
			widgetAPI.blockNavigation(keyCode);
		case sf.key.STOP:
			plugin.Stop();
			//plugin.ClearScreen();
			ScenePlayer.prototype.doHide();
			break;
		case sf.key.REW:
			OSD.showOSD(-3000);
			plugin.JumpBackward(5);
			break;
		case sf.key.FF:
			OSD.showOSD(7000);
			plugin.JumpForward(5);
			break;
		case sf.key.DOWN:
			// Jump back 5 mins
			OSD.showOSD(-280000);
			plugin.JumpBackward(300);
			plugin.Resume();
			break;
		case sf.key.UP:
			OSD.showOSD(280000);
			// Jump forward 5 mins
			plugin.JumpForward(300);
			plugin.Resume();
			break;
		case sf.key.LEFT:
			OSD.showOSD(-28000);
			plugin.JumpBackward(30);
			plugin.Resume();
			break;
		case sf.key.RIGHT:
			OSD.showOSD(62000);
			plugin.JumpForward(60);
			plugin.Resume();
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
						ScenePlayer.prototype.doHide();
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
};
