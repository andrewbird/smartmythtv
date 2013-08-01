var osd = false;
var osdtimeout = 0;
var currenttime = 0;
var totaltime = 1;
var frontPanel;

function OSD() {
}

OSD.initOSD = function(total) {
	totaltime = total;
	frontPanel = document.getElementById("frontPanel");
};

OSD.updateOSD = function(msecs) {
	currenttime = msecs;
	if (osd) {
		document.getElementById("osd_bar_elapsed").style.width=(msecs*900/totaltime)+"px";
		if (parseInt(currenttime)>parseInt(osdtimeout)) {
			OSD.hideOSD();
		}
		document.getElementById("osd_data").style.visibility='visible';
	}
	var hour=Math.floor(msecs/(3600000));
	var min=Math.floor(msecs/(1000*60)-(hour*3600000));
	var sec=Math.floor(msecs/1000-(min*60000)-(hour*3600000));
	//alert("Time: "+hour+":"+min+":"+sec);
	frontPanel.DisplayVFD_Time(hour,min,sec);
};

OSD.hideOSD = function(){
	if(osd){
	  $('#osd').animate({'top' : 540},'fast',function(){
		osd = false;
		document.getElementById("osd").style.display = "none";
	  });
	}
};

OSD.showOSD = function(timeout) {
	if(osd==false){
	  osd = true;
	  document.getElementById("osd").style.display = "block";
	  $('#osd').animate({'top' : 492},'fast',function(){
	//if(Main.osd == 0)
	//{
	//  document.getElementById("osd").style.display = "none";
	//}
	  });
	}
	osdtimeout = parseInt(currenttime)+timeout;
};

OSD.toHHMMSS = function(sec_numb) {
    var hours   = Math.floor(sec_numb / 3600);
    var minutes = Math.floor((sec_numb - (hours * 3600)) / 60);
    var seconds = sec_numb - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
};

String.prototype.toHHMMSS = function () {
    return OSD.toHHMMSS(parseInt(this));
};
