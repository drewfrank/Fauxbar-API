$("*").live("keydown", function(e){
	if (e.ctrlKey == true && e.keyCode == 75) {
		window.location = chrome.extension.getURL("fauxbar.html#sel=os");
		return false;
	}
});