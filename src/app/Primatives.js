
function Rec(prog) {
    this.Description = prog.Description;
    this.StartTime = prog.Recording.StartTs;
    this.ChanId = prog.Channel.ChanId;
    this.Title = prog.Title;
    this.SubTitle = prog.SubTitle;
    this.Season = prog.Season;
    this.Episode = prog.Episode;
    this.FileName = prog.FileName;
    this.ChannelName = prog.Channel.ChannelName;
    this.FileSize = prog.FileSize;
    this.Status = prog.Recording.Status;

    this.StartTimeDate = ServiceAPI.getDate(prog.StartTime);
    this.EndTimeDate = ServiceAPI.getDate(prog.EndTime);
    return this;
};
Rec.prototype = new Object();

Rec.testConstant = 12;

Rec.prototype.testProperty = "";

Rec.prototype.toHtmlTable = function() {
    var data = "<table border><tr><td>Channel</td><td>" + this.ChannelName + "</td></tr>";
    if (this.FileSize != "0") {
        data = data + "<tr><td>Size</td><td>" + ServiceAPI.readableBytes(this.FileSize) + "</td></tr>";
    }
    data = data + "<tr><td>Title</td><td>" + this.Title + "</td></tr>";
    if (this.SubTitle != "") {
        data = data + "<tr><td>SubTitle</td><td>" + this.SubTitle + "</td></tr>";
    }
    if (this.Season != "" && this.Season != 0 && this.Episode != "" && this.Episode != 0) {
        data = data + "<tr><td>Order</td><td>" + "S" + this.Season + " E" + this.Episode + "</td></tr>";
    }
    data = data + "<tr><td>Start</td><td>" + ServiceAPI.showDate(this.StartTimeDate) + "</td></tr>";
    data = data + "<tr><td>End</td><td>" + ServiceAPI.showDate(this.EndTimeDate) + "</td></tr>";
    if (this.Status == -2) {
        // Recording
        data = data + "<tr><td colspan=2>Currently recording</td></tr>";
    }
    data = data + "</table>";
    data = data + this.Description.replace(/\n/g, '<br>');
    return data;
};


function Vid(prog) {
    this.Title = prog.Title;
    this.SubTitle = prog.SubTitle;
    this.Description = prog.Description;
    this.Season = prog.Season;
    this.Episode = prog.Episode;
    this.ReleaseDate = prog.ReleaseDate;
    this.Id = prog.Id;
    this.Length = prog.Length;

    return this;
};
Vid.prototype = new Object();

Vid.testConstant = 12;

Vid.prototype.testProperty = "";

Vid.prototype.toHtmlTable = function() {
    var hasinfo = false;
    var data = "<table border>";

    if (this.Title && this.Title != "") {
        hasinfo = true;
        data = data + "<tr><td>Title</td><td>" + this.Title + "</td></tr>";
    }
    if (this.SubTitle && this.SubTitle != "") {
        hasinfo = true;
        data = data + "<tr><td>SubTitle</td><td>" + this.SubTitle + "</td></tr>";
    }
    if (this.Season != "" && this.Season != 0 && this.Episode != "" && this.Episode != 0) {
        hasinfo = true;
        data = data + "<tr><td>Order</td><td>" + "S" + this.Season + " E" + this.Episode + "</td></tr>";
    }
    if (this.ReleaseDate && this.ReleaseDate != "") {
        hasinfo = true;
        data = data + "<tr><td>Release</td><td>" + this.ReleaseDate.substring(0, 10) + "</td></tr>";
    }
    if (this.Length > 0) {
        hasinfo = true;
        data = data + "<tr><td>Length</td><td>" + this.Length + " minutes</td></tr>";
    }

    data = data + "</table>";
    data = data + this.Description.replace(/\n/g, '<br>');
    if (hasinfo == false) {
        data = "";
    }

    return data;
};
