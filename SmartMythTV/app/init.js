function onStart() {
    var id = sf.env.getModelID();
    var ip = sf.core.localData("serverip");
    if (ip === null) {
        if (id === "SDK") {
            Data.URL = "http://192.168.3.45:6544";
            Data.startGroups = true;
            Data.mainScene = "Groups";

            sf.scene.show(Data.mainScene);
            sf.scene.focus(Data.mainScene);
        } else {
            sf.scene.show("Settings");
            sf.scene.focus("Settings");
        }
    } else {
        Data.URL = "http://" + ip + ":6544";
        Data.startGroups = sf.core.localData("startgroups");
        if (Data.startGroups) {
            Data.mainScene = "Groups";
        } else {
            Data.mainScene = "Recordings";
        }
        sf.scene.show(Data.mainScene);
        sf.scene.focus(Data.mainScene);
    }

    sf.start();
}

function onDestroy() {
    //stop your XHR or Ajax operation and put codes to distroy your application here
}

alert("init.js loaded.");
