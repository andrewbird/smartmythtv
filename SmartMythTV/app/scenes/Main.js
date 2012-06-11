alert('SceneMain.js loaded');

function SceneMain() {

}

SceneMain.prototype.initialize = function () {

}

SceneMain.prototype.handleShow = function (data) {
	alert("SceneMain.handleShow()");
	// this function will be called when the scene manager show this scene 
}

SceneMain.prototype.handleHide = function () {
	alert("SceneMain.handleHide()");
	// this function will be called when the scene manager hide this scene  
}

SceneMain.prototype.handleFocus = function () {
	alert("SceneMain.handleFocus()");
	// this function will be called when the scene manager focus this scene
}

SceneMain.prototype.handleBlur = function () {
	alert("SceneMain.handleBlur()");
	// this function will be called when the scene manager move focus to another scene from this scene
}

SceneMain.prototype.handleKeyDown = function (keyCode) {
	alert("SceneMain.handleKeyDown(" + keyCode + ")");
	// TODO : write an key event handler when this scene get focued
	switch (keyCode) {
		case sf.key.LEFT:
			break;
		case sf.key.RIGHT:
			alert("setting");
			break;
	}
}