var osdtimeout = 0;
var currenttime = 0;
var totaltime = 1;
var frontPanel;
var mediatitle = "default";

function OSD() {}

OSD.initOSD = function(total) {
    totaltime = total;
    totalmins = Math.floor(totaltime / (1000 * 60));
    frontPanel = document.getElementById("frontPanel");
};

OSD.setTitleOSD = function(title) {
    mediatitle = title;
};


OSD.draw = function() {
    var obar = document.getElementById("osd_bar_elapsed");
    if (obar) {
        obar.style.width = (currenttime * 900 / totaltime) + "px";
    }

/*  // not in use
    var odata = document.getElementById("osd_data");
    if (odata) {
        odata.style.visibility = 'visible';
    }
*/

    var currentmins = Math.floor(currenttime / (1000 * 60));

    var otext = mediatitle + " [ " + currentmins + " / " + totalmins + " mins ]";

    $('#osd_time_info').sfLabel({text: otext});
};


OSD.updateOSD = function(msecs) {
    currenttime = msecs;

//    alert(currenttime);

    var obj = $('#osd');
    if(!obj.is(':visible')) {
        return;
    }

    if (currenttime > osdtimeout) {
        OSD.hideOSD();
        return;
    }

    OSD.draw();
};

OSD.hideOSD = function() {
    var obj = $('#osd');
    if(obj.is(':visible')) {
        obj.animate({
            'top': 540
        }, 'fast', function() {
            obj.hide();
            //document.getElementById("osd").style.display = "none";
        });
    }
};

OSD.showOSD = function(timeout) {
    var obj = $('#osd');
    if(!obj.is(':visible')) {
        obj.show();
        obj.animate({
            'top': 492
        }, 'fast', function() {
            //document.getElementById("osd").style.display = "block";
            OSD.draw();
        });
    }

    osdtimeout = currenttime + timeout;
};

OSD.toHHMMSS = function(sec_numb) {
    var hours = Math.floor(sec_numb / 3600);
    var minutes = Math.floor((sec_numb - (hours * 3600)) / 60);
    var seconds = sec_numb - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    var time = hours + ':' + minutes + ':' + seconds;
    return time;
};

String.prototype.toHHMMSS = function() {
    return OSD.toHHMMSS(parseInt(this));
};
