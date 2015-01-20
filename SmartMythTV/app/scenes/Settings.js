var widgetAPI = new Common.API.Widget(); // Create Common module
var tvKey = new Common.API.TVKeyValue();
var idx;
var idxMax = 3;

function SceneSettings(options) {
    this.options = options;
    this.caller = null;
}

SceneSettings.prototype.NAME = "Settings";

SceneSettings.prototype.initialize = function() {
    $('#svecLabel_WPTS').sfLabel({
        text: 'Mythbackend IP: '
    });
    $('#svecText_IP').focus(
    function(){
        $(this).css('border-color','#64bbf4');
        $(this).css('background-color','#64bbf4');
        $('#serverip').css('background-color','#64bbf4');
    }).blur(
    function(){
        $(this).css('border-color','#999999');
        $(this).css('background-color','#999999');
        $('#serverip').css('background-color','#999999');
    });
    $('#svecLabel_RTUS').sfLabel({
        'text': 'Please enter IP to mythbackend (e.g. 192.168.1.99)<br>' + 'Use TTX/MIX or the GREEN key for . and the RED key to delete.'
    });

    $('#svecLabel_Groups').sfLabel({
        text: 'Start in view: '
    });
    $('#svecToggleButton_Groups').sfToggleButton({
        text: {
          on: 'Groups',
          off: 'Recordings'
        },
        isOn: sf.core.localData('startgroups')
    });

    $('#svecButton_OK').sfButton({
        text: 'Ok'
    });

    $('#svecButton_CAN').sfButton({
        text: 'Cancel'
    });

    idx = 0;
};

SceneSettings.prototype.handleShow = function(args) {
    this.caller = args.caller;
};

SceneSettings.prototype.handleHide = function() {};

SceneSettings.prototype.handleFocus = function() {
    document.getElementById("serverip").value = sf.core.localData("serverip");
    if(sf.core.localData('startgroups') != $('#svecToggleButton_Groups').sfToggleButton('isOn')) {
        $('#svecToggleButton_Groups').sfToggleButton('toggle');
    }

    if (idx != 0) {
        changestate(idx, 'blur');
        idx = 0;
    }
    changestate(idx, 'focus');
};

SceneSettings.prototype.handleBlur = function() {};

changestate = function(idx, action) {
    switch (idx) {
        case 0:
            $('#svecText_IP').trigger(action);
            break;
        case 1:
            $('#svecToggleButton_Groups').sfToggleButton(action);
            break;
        case 2:
            $('#svecButton_OK').sfButton(action);
            break;
        case 3:
            $('#svecButton_CAN').sfButton(action);
            break;
    }
};

addchar = function(c) {
    document.getElementById("serverip").value += c;
};

SceneSettings.prototype.handleKeyDown = function(keyCode) {
    switch (keyCode) {
        case sf.key.LEFT:
        case sf.key.UP:
            changestate(idx, 'blur');
            if (idx > 0) {
                idx--;
            } else {
                idx = idxMax;
            }
            changestate(idx, 'focus');
            break;
        case sf.key.RIGHT:
        case sf.key.DOWN:
            changestate(idx, 'blur');
            if (idx < idxMax) {
                idx++;
            } else {
                idx = 0;
            }
            changestate(idx, 'focus');
            break;
        case sf.key.ENTER:
            switch (idx) {
                case 1: // togglebutton
                    $('#svecToggleButton_Groups').sfToggleButton('toggle');
                    break;
                case 2: //ok
                    sf.core.localData('serverip', document.getElementById("serverip").value);
                    sf.core.localData('startgroups', $('#svecToggleButton_Groups').sfToggleButton('isOn'));
                    //no break
                case 3: //cancel
                    Data.URL = "http://" + sf.core.localData("serverip") + ":6544";
                    if (sf.core.localData('startgroups')) {
                        Data.mainScene = "Groups";
                    } else {
                        Data.mainScene = "Recordings";
                    }
                    sf.scene.hide(this.NAME);
                    sf.scene.show(this.caller);
                    sf.scene.focus(this.caller);
                    break;
            }
            break;
        case tvKey.KEY_1:
            addchar(1);
            break;
        case tvKey.KEY_2:
            addchar(2);
            break;
        case tvKey.KEY_3:
            addchar(3);
            break;
        case tvKey.KEY_4:
            addchar(4);
            break;
        case tvKey.KEY_5:
            addchar(5);
            break;
        case tvKey.KEY_6:
            addchar(6);
            break;
        case tvKey.KEY_7:
            addchar(7);
            break;
        case tvKey.KEY_8:
            addchar(8);
            break;
        case tvKey.KEY_9:
            addchar(9);
            break;
        case tvKey.KEY_0:
            addchar(0);
            break;
        case 35: //emulator
        case tvKey.KEY_TTX_MIX: //TTX
        case tvKey.SUBTITLE:
        case tvKey.KEY_GREEN:
            addchar(".");
            break;
        case tvKey.KEY_PRECH:
        case tvKey.KEY_RED:
            var value = document.getElementById("serverip").value;
            document.getElementById("serverip").value = value.substr(0, value.length - 1);
            break;
    }
};
