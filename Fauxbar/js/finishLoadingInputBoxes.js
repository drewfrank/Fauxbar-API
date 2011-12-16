$('#awesomeinput').ready(function(){
	localStorage.option_openfauxbarfocus == 'addressbox' && $('#awesomeinput').focus();
});
$('#opensearchinput').ready(function(){
	localStorage.option_openfauxbarfocus == 'searchbox' && $('#opensearchinput').focus();
});

$("#awesomeinput_cell").html('<input type="text" id="awesomeinput" '+
	' spellcheck="false" placeholder="Go to a web site" autocomplete="off" '+
	speech+' />');
	
$("#opensearchinput_cell").html('<input type="text" id="opensearchinput" '+
	' spellcheck="false" autocomplete="off" placeholder="'+
	str_replace('"', '&quot;', localStorage.osshortname)+'" '+
	speech+' />');

if (localStorage.osiconsrc) {
	var ico = localStorage.osiconsrc == "google.ico" || localStorage.osiconsrc == "yahoo.ico" || localStorage.osiconsrc == "bing.ico" ? "/img/"+localStorage.osiconsrc : localStorage.osiconsrc;
	$("#opensearch_triangle span").first().html('<img class="opensearch_selectedicon" src="'+ico+'" style="height:16px; width:16px;" /><span class="triangle static" style="margin-top:1px"></span>');
} else {
	$("#opensearch_triangle span").first().html('<img class="opensearch_selectedicon" src="chrome://favicon/null" style="height:16px; width:16px;" /><span class="triangle static" style="margin-top:1px"></span>');
}

$('#awesomeinput_cell')[0].addEventListener('webkitspeechchange', function(){
	setTimeout(function(){
		$('#awesomeinput').setSelection($('#awesomeinput').val().length,$('#awesomeinput').val().length);
		getResults();
	}, 250);
});

$("#opensearchinput_cell")[0].addEventListener('webkitspeechchange', function(){
	setTimeout(function(){
		$('#opensearchinput').setSelection($('#opensearchinput').val().length,$('#opensearchinput').val().length);
		getSearchSuggestions();
	}, 250);
});