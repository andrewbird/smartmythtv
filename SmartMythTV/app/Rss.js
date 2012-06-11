var ServiceAPI = {
	XHRObj : null,
	onReceived : null
}

ServiceAPI.loadRecordings = function() {
	XHRObj = new XMLHttpRequest();
    
	if (XHRObj) {
        XHRObj.onreadystatechange = function() {
            if(XHRObj.readyState==4) {
				if (XHRObj.status==200) {
					SceneRecordings.prototype.receive();
				} else {
					SceneRecordings.prototype.receivedFailed();
				}
            }
        };
        XHRObj.open("GET", "http://"+Data.URL+"/mythweb/rss/tv/recorded", true);
        XHRObj.send(null);
		//XHRObj.destroy();
     } else {
        alert("Failed to create XHR");
    }
}

ServiceAPI.receiveRecordings = function() {
	var xmlElement = XHRObj.responseXML.documentElement;
	// Parse RSS
	// Get all "item" elements
	var items = xmlElement.getElementsByTagName("item");
	
	Data.titles = [ ];
	Data.links = [ ];
	Data.description = [ ];
	for (var index = 0; index < items.length; index++) {
		Data.titles[index] = items[index].getElementsByTagName("title")[0].firstChild.data;
		Data.links[index] = items[index].getElementsByTagName("link")[0].firstChild.data;
		Data.description[index] = items[index].getElementsByTagName("description")[0].firstChild.data;
	}
	Data.max = items.length;
	$('#svecListbox_BOUK').sfList({data:Data.titles, index:current});
	$('#svecLoadingImage_RBMO').sfLoading('hide');
	widgetAPI.putInnerHTML(document.getElementById("description"), Data.description[$('#svecListbox_BOUK').sfList('getIndex')].replace(/\n/g, '<br>'));
	XHRObj.destroy();
	ServiceAPI.onReceived();
}

ServiceAPI.deleteRecording = function(startts, chanid) {
	XHRObj = new XMLHttpRequest();
	x.onreadystatechange = function() {
		XHRObj.destory();
	}
	x.open("POST", "http://"+Data.URL+"/mythweb/tv/recorded", true);
	var d = new Date(l[7]*1000);
	var starttime = d.getUTCFullYear()+"-"+toText(d.getUTCMonth()+1)+"-"+toText(d.getUTCDate())
		+"T"+toText(d.getUTCHours())+":"+toText(d.getUTCMinutes())+":"+toText(d.getUTCSeconds())+"Z";
	x.send('&ChanId='+l[6]+'&StartTime='+l[7]);
	var recording = SceneRecordings.prototype.getRecording();
	x.send('ChanId='+recording.ChanId+'&StartTime='+recording.StartTime);
}