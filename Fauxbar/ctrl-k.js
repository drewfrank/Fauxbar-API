$("*").live('keydown', 'ctrl+k', function(e){
	if (e.keyCode == 75) {
		chrome.extension.sendRequest({action:"goToNewTab", hash:'sel=os'});
	}
	return false;
});