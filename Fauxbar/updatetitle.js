if (!window.fauxbarLastTitle || window.fauxbarLastTitle != window.document.title) {
	window.fauxbarLastTitle = window.document.title;
	chrome.extension.sendRequest({action:"updateUrlTitles", urltitle:window.document.title, url:window.document.location.href});
}