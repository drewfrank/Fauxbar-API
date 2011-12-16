function initJscolor() {
	if (jscolor) {
		setTimeout(jscolor.init, 1);
	} else {
		setTimeout(initJscolor, 100);
	}
}
initJscolor();

// Update Fauxbar / Fauxbar Lite name texts
$(document).ready(function(){
	if (localStorage.extensionName && localStorage.extensionName.length) {
		$(".extensionName").html(localStorage.extensionName);
		$('select#option_openfauxbarfocus option[value="addressbox"]').text(localStorage.extensionName+"'s Address Box");
		$('select#option_openfauxbarfocus option[value="searchbox"]').text(localStorage.extensionName+"'s Search Box");
	}
});