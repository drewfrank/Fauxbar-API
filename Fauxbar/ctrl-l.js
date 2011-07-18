$("*").live('keydown', 'ctrl+l', function(){
	chrome.extension.sendRequest({action:"goToNewTab", hash:'sel=ai&ai='+window.urlencode(window.location.href)});
	return false;
});

window.urlencode = function (str) {
    str = (str + '').toString();
    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
    replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
}