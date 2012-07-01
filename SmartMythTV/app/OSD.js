function OSD() {
	var totaltime;
	var currenttime;
	var osdtimeout;
	var osd;
};

OSD.initOSD = function(total) {
	totaltime = total;
};

OSD.updateOSD = function(msecs) {
	currenttime = msecs;
	if (osd) {
		document.getElementById("osd_bar_elapsed").style.width=(msecs*900/totaltime)+"px";
		if (parseInt(currenttime)>parseInt(osdtimeout)) {
			$('#osd').animate({'top' : 540},'fast',function(){
				osd = false;
				document.getElementById("osd").style.display = "none";
			});
		}
	}
};

OSD.showOSD = function() {
	osd = true;
	document.getElementById("osd").style.display = "block";
	$('#osd').animate({'top' : 492},'fast',function(){
	//if(Main.osd == 0)
	//{
	//  document.getElementById("osd").style.display = "none";
	//}
	});
	osdtimeout = parseInt(currenttime)+2000;
};