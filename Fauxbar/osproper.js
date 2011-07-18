$(document).ready(function(){
	//console.log("checking for the proper OpenSearch declaration");
	window.openSearch = 'head link[rel="search"][type="application/opensearchdescription+xml"]';
	if ($(window.openSearch).length == 1 && $(window.openSearch).attr("href") != "") {
		//console.log("looks like it exists!");
		var urlToGet = $(window.openSearch).attr("href");
		if (urlToGet.substr(0,7) != 'http://' && urlToGet.substr(0,8) != 'https://') {
			var urlParts = window.location.href.split('/');
			var newUrl = urlParts[0]+'//'+urlParts[2];
			if (urlToGet.substr(0,1) != '/') {
				newUrl += '/';
			}
			urlToGet = newUrl + urlToGet;
		}

		window.proper = true;

		chrome.extension.sendRequest({
			action: "showPageAction",
			xmlurl: urlToGet
		});
	}
});