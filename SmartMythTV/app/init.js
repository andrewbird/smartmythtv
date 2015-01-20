function onStart() {
    var id = sf.env.getModelID();
    var ip = sf.core.localData("serverip");
    if (ip === null) {
        if (id === "SDK") {
            Data.URL = "http://192.168.3.45:6544";
            Data.mainScene = "Groups";

            sf.scene.show(Data.mainScene);
            sf.scene.focus(Data.mainScene);
        } else {
            sf.scene.show("Settings", {
                caller: Data.mainScene
            });
            sf.scene.focus("Settings");
        }
    } else {
        Data.URL = "http://" + ip + ":6544";
        if (sf.core.localData("startgroups")) {
            Data.mainScene = "Groups";
        } else {
            Data.mainScene = "Recordings";
        }
        sf.scene.show(Data.mainScene);
        sf.scene.focus(Data.mainScene);
    }
}

function onDestroy() {
    //stop your XHR or Ajax operation and put codes to destroy your application here
}

alert("init.js loaded.");
