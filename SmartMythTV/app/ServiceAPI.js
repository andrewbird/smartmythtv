var ServiceAPI = {
	XHRObj : null,
	onReceived : null,
	onDeleteCurrent : null
};

ServiceAPI.loadRecordings = function() {
	XHRObj = new XMLHttpRequest();

	if (XHRObj) {
        XHRObj.onreadystatechange = function() {
            if(XHRObj.readyState==4) {
				if (XHRObj.status==200) {
					ServiceAPI.receiveRecordings();
				} else {
					SceneRecordings.prototype.receivedFailed();
				}
            }
        };
        XHRObj.open("GET", "http://"+Data.URL+":6544/Dvr/GetRecordedList?Descending=true", true);
		//XHRObj.setRequestHeader("Accept", "application/json");
        XHRObj.send(null);
     } else {
        alert("Failed to create XHR");
    }
};

ServiceAPI.receiveRecordings = function() {
	var xmlElement = XHRObj.responseXML.documentElement;
	var rows = xmlElement.getElementsByTagName("Program");

	Data.Titles = [ ];
	Data.Links = [ ];
	Data.Description = [ ];
	var index = 0;
	for (var i=0, row; row=rows[i]; i++) {
		var r = new Object();
		Data.Recordings[index] = r;
		var elems = row.childNodes;
		for (var j=0, srow; srow=elems[j]; j++) {
			if (srow.nodeName == "Title") {
				Data.Titles[index] = srow.firstChild.data;
			} else if (srow.nodeName == "SubTitle" && srow.firstChild!=null) {
				Data.Titles[index] += ":" + srow.firstChild.data;
			} else if (srow.nodeName == "Description" && srow.firstChild!=null) {
				r.Description = srow.firstChild.data;
			} else if (srow.nodeName == "Recording") {
				eelems = srow.childNodes;
				for (var k=0, ssrow; ssrow=eelems[k]; k++) {
					if (ssrow.nodeName == "StartTs") {
						r.StartTime = ssrow.firstChild.data;
					}
				}
			} else if (srow.nodeName == "Channel") {
				eelems = srow.childNodes;
				for (var k=0, ssrow; ssrow=eelems[k]; k++) {
					if (ssrow.nodeName == "ChanId") {
						r.ChanId = ssrow.firstChild.data;
					}
				}
			}
		}
		index++;
	}
	Data.loaded = index;
	Data.max = 100;
	XHRObj.destroy();
	ServiceAPI.onReceived();
};

ServiceAPI.deleteRecording = function(recording) {
	XHRObj = new XMLHttpRequest();
	XHRObj.onreadystatechange = function() {
		XHRObj.destory();
	};
	XHRObj.open("POST", "http://"+Data.URL+':6544/Dvr/RemoveRecorded', true);
	XHRObj.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	XHRObj.send('ChanId='+recording.ChanId+'&StartTime='+recording.StartTime);
	ServiceAPI.onDeleteCurrent();
};
