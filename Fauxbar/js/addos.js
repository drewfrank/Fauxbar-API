// This content script is executed when the user has clicked the Fauxbar+ Page Action icon.

if (window.proper && window.proper == true) {
	chrome.extension.sendRequest({
		contents: "openSearchInfo",
		href: $(window.openSearch).attr("href"),
		title: $(window.openSearch).attr("title"),
		currentUrl: window.location.href,
		hostname: window.location.hostname,
	});
}
else if (window.improper && window.improper == true) {

	// http://stackoverflow.com/questions/1026069/capitalize-first-letter-of-string-in-javascript
	function capitaliseFirstLetter(string) {
	    return string.charAt(0).toUpperCase() + string.slice(1);
	}

	var makeshiftTitle = window.location.hostname;
	if (makeshiftTitle.substr(0,4) == 'www.') {
		makeshiftTitle = makeshiftTitle.substr(4);
	}
	makeshiftTitle = capitaliseFirstLetter(makeshiftTitle);

	chrome.extension.sendRequest({
		contents: "openSearchInfo",
		improper: true,
		actionAttr: window.actionAttr,
		title: makeshiftTitle,
		currentUrl: window.location.href,
		hostname: window.location.hostname,
		method: window.method
	});
}
