
// Initial loading calls this function (icon canvas coloring), but it's slow. Real function gets created later
function processFilters() { }

// Update the Fauxbar Memory Helper status text on the Options page
function updateHelperStatus() {
	// Link to Memory Helper on the Chrome Web Store
	var link = 'https://chrome.google.com/webstore/detail/domhiadbdhomljcdankobiglghedagkm';
	var status = 'not installed. <a style="color:#06c" target="_blank" href="'+link+'">Click here to install.</a>';
	chrome.management.getAll(function(extensions){
		for (var e in extensions) {
			if (extensions[e].name == "Fauxbar Memory Helper") {
				if (extensions[e].enabled == true) {
					status = 'installed and enabled <span style="color:#090">&#10004;</span>';
				} else {
					status = 'installed but disabled. <span class="fakelink" style="color:#06c;cursor:pointer;text-decoration:underline" onclick="enableHelper()">Click here to enable.</span>';
				}
			}
		}
		$("#helperstatus").html(status);
	});
}

// Enables Fauxbar Memory Helper, called from the Options page
function enableHelper() {
	chrome.management.getAll(function(extensions){
		for (var e in extensions) {
			if (extensions[e].name == "Fauxbar Memory Helper") {
				chrome.management.setEnabled(extensions[e].id, true);
			}
		}
	});
}

// Listen to either the background page, or the Memory Helper...
chrome.extension.onRequest.addListener(function (request, sender) {
	// If Fauxbar has finished indexing history and bookmarks, reload the Fauxbar page to get rid of the progress div
	if (request == "DONE INDEXING") {
		window.location.reload();
	}

	// Update the index progress meter bar and status message
	else if (request.message && request.message == "currentStatus") {
		$("button").prop("disabled",true);
		$("body").css("cursor","progress");
		$("#awesomeinput").blur();
		$("#currentstatus").html(request.status);
		if (request.step) {
			if (request.step > 3) {
				populateOpenSearchMenu(true);
			}
			window.newProgress = (request.step-1) * 100;
			window.curProgress = $("progress").attr("value");
			increaseProgress();
		}
	}

	// Update Address Box result links, mainly to show the "Switch to tab" text or not
	else if (request.message && request.message == "refreshResults" && $(".result").length > 0 && $("#awesomeinput.description").length == 0) {
		chrome.tabs.getAllInWindow(null, function(tabs){
			var theTabs = [];
			for (var t in tabs) {
				theTabs[tabs[t].url] = tabs[t].url;
			}
			$(".result").each(function(){
				if (theTabs[$(this).attr("url")]) {
					$(this).children(".result_url").html('<img src="tabicon.png" style="opacity:.6" /> <span class="switch">Switch to tab</span>');
				} else {
					$(this).children(".result_url").html($(this).children(".result_url_hidden").html());
				}
			});
			setTimeout(toggleSwitchText, 1);
		});
	}
});

// Initialize the reindexing process
function tellBgToReindex() {
	chrome.extension.sendRequest({action:"reindex"});
	setTimeout(function(){
		window.location.reload();
	}, 500);
}

// http://stackoverflow.com/questions/890807/iterate-over-a-javascript-associative-array-in-sorted-order
function sortKeys(obj) {
    var keys = [];
    for(var key in obj) {
        keys.push(key);
    }
    return keys;
}

// Fill the Management Options' "Backup..." textarea with the user's localStorage options in JSON format
function showBackupInfo() {
	if (openDb()) {
		window.db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM opensearches', [], function(tx, results) {
				var backup = {};
				backup.options = {};
				var ls = localStorage;
				var keys = sortKeys(ls).sort();
				for (var key in keys) {
					backup.options[keys[key]] = localStorage[keys[key]];
				}
				backup.searchengines = [];
				var len = results.rows.length, i;
				if (len > 0) {
					var i = 0;
					for (i = 0; i < len; i++) {
						backup.searchengines[i] = results.rows.item(i);
					}
				}
				$("#restoreinfo").css("display","none");
				$("#backupinfo").css("display","block");
				var backupText = JSON.stringify(backup);
				backupText = str_replace('","', '",\n"', backupText);
				backupText = str_replace('":{"', '": {\n"', backupText);
				backupText = str_replace('"},"', '"},\n\n"', backupText);
				backupText = str_replace('":[{"', '": [\n{"', backupText);
				backupText = str_replace('"shortname":', '\n\n"shortname":', backupText);
				$("#backup").text(backupText).select();
			});
		}, errorHandler);
	}
}

// Show the Management Options' "Restore..." box prompt
function showRestoreInfo() {
	$("#backupinfo").css("display","none");
	$("#restoreinfo").css("display","block");
	$("#restore").focus();
}

// Process the user's input from the "Restore..." box and overwrite the localStorage options and the odd database option with what the user has entered
function restoreOptions() {
	if ($("#restore").val().trim().length == 0) {
		alert("Oops! The restore box appears to be empty.\n\nPaste your backup text into the box, then click Apply again.");
		$("#restore").focus();
		return false;
	}
	$("#applyrestore").prop("disabled",true);
	setTimeout(function(){
		if (window.restoreIsOkay == false) {
			alert("Oops! Fauxbar was unable to process your backup.\n\nPlease ensure the pasted text is a well-formed JSON string.");
			$("#applyrestore").prop("disabled",false);
		}
	}, 500);
	window.restoreIsOkay = false;
	var text = jQuery.parseJSON($("#restore").val());
	if (text && text.options && text.searchengines) {
		window.restoreIsOkay = true;
		for (var o in text.options) {
			localStorage[o] = text.options[o];
		}
		if (openDb()) {
			window.db.transaction(function(tx){
				tx.executeSql('DELETE FROM opensearches');
				var se = "";
				for (var s in text.searchengines) {
					se = text.searchengines[s];
					tx.executeSql('INSERT INTO opensearches (shortname, iconurl, searchurl, xmlurl, xml, isdefault, method, position, suggestUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [se.shortname, se.iconurl, se.searchurl, se.xmlurl, se.xml, se.isdefault, se.method, se.position, se.suggestUrl]);
				}
				setTimeout(function() {
					alert("The import was successful.\n\nFauxbar will now restore your options.");
					window.location.reload();
				}, 500);
			}, errorHandler);
		} else {
			alert("Oops! Fauxbar is unable to open its database to restore your search engines, but your other options will be restored.");
			window.location.reload();
		}
	} else {
		// console.log("nope");
	}
}

// When the user clicks one of the preset color buttons to apply, apply the colors.
function applyColors(browser) {
	switch (browser) {
		case "chrome":
			document.getElementById('option_titlecolor').color.fromString('000000');
			document.getElementById('option_urlcolor').color.fromString('0E860E');
			document.getElementById('option_resultbgcolor').color.fromString('FFFFFF');
			document.getElementById('option_separatorcolor').color.fromString('E3E3E3');
			document.getElementById('option_selectedtitlecolor').color.fromString('000000');
			document.getElementById('option_selectedurlcolor').color.fromString('0E860E');
			document.getElementById('option_selectedresultbgcolor').color.fromString('CBE3FC');
			break;
		case "firefox":
			document.getElementById('option_titlecolor').color.fromString('000000');
			document.getElementById('option_urlcolor').color.fromString('0066CC');
			document.getElementById('option_resultbgcolor').color.fromString('FFFFFF');
			document.getElementById('option_separatorcolor').color.fromString('E3E3E3');
			document.getElementById('option_selectedtitlecolor').color.fromString('FFFFFF');
			document.getElementById('option_selectedurlcolor').color.fromString('FFFFFF');
			document.getElementById('option_selectedresultbgcolor').color.fromString('3399FF');
			break;
		case "fauxbar":
			document.getElementById('option_titlecolor').color.fromString('000000');
			document.getElementById('option_urlcolor').color.fromString('0066CC');
			document.getElementById('option_resultbgcolor').color.fromString('FFFFFF');
			document.getElementById('option_separatorcolor').color.fromString('E3E3E3');
			document.getElementById('option_selectedtitlecolor').color.fromString('000000');
			document.getElementById('option_selectedurlcolor').color.fromString('0066CC');
			document.getElementById('option_selectedresultbgcolor').color.fromString('CBE3FC');
			break;
	}
	$("#option_titlecolor").change();
	$("#option_urlcolor").change();
	$("#option_resultbgcolor").change();
	$("#option_separatorcolor").change();
	$("#option_selectedtitlecolor").change();
	$("#option_selectedurlcolor").change();
	$("#option_selectedresultbgcolor").change();
	$("#option_favopacity").val("0").change();
}

// Change the font size of the Address Box and Search Box (but not the results from them)
function changeInputFontSize() {
	var newSize = localStorage.option_inputfontsize;
	if (newSize) {
		$("#customstyle").append('#addresswrapper input, #searchwrapper input { font-size:'+newSize+'px; }');
		var newPadding = newSize-7;
		if (newPadding > 10) {
			newPadding = 10;
		}
		if (newPadding < 6) {
			newPadding = 6;
		}

		var newWidth = newSize-11;
		if (newWidth > 6) {
			newWidth = 6;
		}
		if (newWidth < 3) {
			newWidth = 3;
		}

		$(".wrapper").css("padding", newPadding+"px");
		$("#handle").css("width",newWidth+"px").css("min-width",newWidth+"px");
	} else {
		$("#customstyle").append('#addresswrapper input, #searchwrapper input { font-size:15px; }');
		$(".wrapper").css("padding","8px");
		$("#handle").css("width","4px").css("min-width","4px");
	}
}

// Clear the saved queries from the Search Box's "history"
function clearSearchHistory() {
	if (openDb()) {
		window.db.transaction(function(tx) {
			tx.executeSql('DELETE FROM searchqueries');
		}, errorHandler);
		$("#button_clearsearchhistory").prop("disabled",true);
		loadDatabaseStats();
	}
}

// Submit the Search Box's input as a search to the selected search engine.
// Need to create a simple URL if it's a GET, otherwise create a form and POST it.
function submitOpenSearch(query) {
	var selectedMenuItem = '.menuitem[shortname="'+window.openSearchShortname+'"]';
	var searchUrl = $(selectedMenuItem).attr("searchurl");
	var openSearchInputVal = query ? query : $("#opensearchinput").val();
	searchUrl = str_replace('{searchTerms}', urlencode(openSearchInputVal), searchUrl);

	if (localStorage.option_recordsearchboxqueries == 1 && openDb()){
		window.db.transaction(function(tx){
			tx.executeSql('INSERT INTO searchqueries (query) VALUES (?)', [openSearchInputVal.trim()]);
		}, errorHandler);
	}

	if ($(selectedMenuItem).attr("method").toLowerCase() == 'get') {
		goToUrl(searchUrl);
	}
	else {
		$("#tempform").remove();
		$("body").append('<form method="post" action="'+ searchUrl.split('?')[0] +'" id="tempform" style="position:absolute;z-index:-999;opacity:0"></form>');
		var bits = explode('?', searchUrl);
		var params = explode('&', bits[1]);
		var elName = '';
		var elVal = '';
		for (var p in params) {
			elVal = '';
			elName = params[p].split('=')[0];
			if (params[p].split('=').length == 2) {
				elVal = params[p].split('=')[1];
			}
			$('#tempform').append('<input type="hidden" name="'+elName+'" value="'+elVal+'" />\r\n');
		}
		if (window.altReturn) {
			delete window.altReturn;
			$("#tempform").attr("target","_blank");
			if (window.middleMouse) {
				chrome.tabs.getCurrent(function(tab){
					$("#tempform").submit();
					setTimeout(function() {
						chrome.tabs.update(tab.id, {selected:true});
					}, 1);
				});
			} else {
				$("#tempform").submit();
			}
		} else {
			$("#tempform").submit();
		}
	}
}

// If the user selects to change the input boxes on Fauxbar, fade them out... then update with the new settings.
function changeInputBoxDisplayOrder(init) {
	if (init == true) {
		actuallyChangeInputBoxDisplayOrder();
	} else {
		$("#thefauxbar").children("table").first().animate({opacity:0},200, function(){
			actuallyChangeInputBoxDisplayOrder();
			$(this).animate({opacity:1},200);
		});
	}
}

// Alter Fauxbar's input boxes with the user's selected options.
function actuallyChangeInputBoxDisplayOrder() {
	if (localStorage.option_inputboxdisplayorder && localStorage.option_inputboxdisplayorder.length > 0) {
		switch (localStorage.option_inputboxdisplayorder) {
			case "addressleft_searchright":
				$("#addresswrapper").appendTo("#leftcell").parent("td").css("display","table-cell");
				$("#searchwrapper").appendTo("#rightcell").parent("td").css("display","table-cell");
				$("#handle").css("display","table-cell");
				break;
			case "searchleft_addressright":
				$("#searchwrapper").appendTo("#leftcell").parent("td").css("display","table-cell");
				$("#addresswrapper").appendTo("#rightcell").parent("td").css("display","table-cell");
				$("#handle").css("display","table-cell");
				break;
			case "addressonly":
				$("#searchwrapper").parent("td").css("display","none");
				$("#addresswrapper").parent("td").css("display","table-cell").css("width","100%");
				$("#handle").css("display","none");
				break;
			case "searchonly":
				$("#addresswrapper").parent("td").css("display","none");
				$("#searchwrapper").parent("td").css("display","table-cell").css("width","100%");
				$("#handle").css("display","none");
				break;
		}
	}
	$("#addresswrapper").parent("td").css("width", localStorage.option_leftcellwidthpercentage ? localStorage.option_leftcellwidthpercentage+'%' : '65%');
	$("#searchwrapper").parent("td").css("width", "auto");
}

// Change the Fauxbar's background gradient colors.
function changeFauxbarColors() {
	var r1 = hexToR(localStorage.option_topgradient);
	var g1 = hexToG(localStorage.option_topgradient);
	var b1 = hexToB(localStorage.option_topgradient);
	var r2 = hexToR(localStorage.option_bottomgradient);
	var g2 = hexToG(localStorage.option_bottomgradient);
	var b2 = hexToB(localStorage.option_bottomgradient);
	var topOpacity = localStorage.option_topopacity / 100;
	var bottomOpacity = localStorage.option_bottomopacity / 100;
	var newStyle = ".wrapper { background:-webkit-gradient(linear, left top, left bottom, from(rgba("+r1+","+g1+","+b1+","+topOpacity+")), to(rgba("+r2+","+g2+","+b2+","+bottomOpacity+"))); }";
	$("#customstyle").append(newStyle);
}

// Change the colors of the Go Arrow and Search Magnifying Glass icons.
function changeTintColors() {
	$("#address_goarrow img").attr("data-pb-tint-colour",localStorage.option_iconcolor).attr("data-pb-tint-opacity",1);
	$("#searchicon_cell img").attr("data-pb-tint-colour",localStorage.option_iconcolor).attr("data-pb-tint-opacity",1);
	processFilters();
	$("#goarrow_hovered").attr("src",$("#address_goarrow img").attr("src"));
	$("#searchicon_hovered").attr("src",$("#searchicon_cell img").attr("src"));
	setTimeout(processFilters, 10);
}

// Switch to a new Options subpage
function changeOptionPage(el) {
	$("#option_menu div").removeClass("section_selected");
	$(el).addClass("section_selected");
	$("div.optionbox").css("display","none");
	$("#"+$(el).attr("optionbox")).css("display","block");
	localStorage.option_optionpage = $(el).attr("id");
}

// Remove any custom ordering of the Search Box's search engines, and sort them alphabetically
function sortSearchEnginesAlphabetically() {
	if (openDb()) {
		window.db.transaction(function(tx){
			tx.executeSql('UPDATE opensearches SET position = 0');
			tx.executeSql('SELECT * FROM opensearches ORDER BY shortname DESC');
			getSearchEngines();
			populateOpenSearchMenu();
		}, errorHandler);
	}
}

// Update the list of search engines in the Search Box Options page
function getSearchEngines() {
	if (openDb()){
		window.db.transaction(function(tx){
			tx.executeSql('SELECT * FROM opensearches ORDER BY position DESC, shortname COLLATE NOCASE ASC', [], function(tx,results){
				var openEngines = '';
				var len = results.rows.length, i;
				var iconUrl = "";
				if (len > 0) {
					for (var i = 0; i < len; i++) {
						iconUrl = results.rows.item(i).iconurl;
						if (iconUrl != "google.ico" && iconUrl != "yahoo.ico" && iconUrl != "bing.ico") {
							iconUrl = "chrome://favicon/"+iconUrl;
						}
						openEngines += '<tr class="opensearch_optionrow">';
						openEngines += '<td class="osicon" style="width:1px; padding:0px 0px 0 5px"><img src="'+iconUrl+'" /></td>';
						openEngines += '<td style="width:25%" class="shortname"><input class="inputoption" type="text" value="'+results.rows.item(i).shortname+'" origvalue="'+results.rows.item(i).shortname+'" /></td>';
						openEngines += '<td style="width:75%" class="searchurl"><input class="inputoption" type="text" value="'+results.rows.item(i).searchurl+'" origvalue="'+results.rows.item(i).searchurl+'" style="color:rgba(0,0,0,.52)" spellcheck="false" autocomplete="off" /></td>';
						if (len > 1) {
							openEngines += '<td style="width:1px; padding:0 5px 0 4px" class="opensearchcross" title="Remove &quot;'+results.rows.item(i).shortname+'&quot; from Fauxbar"><img class="crossicon" src="cross.png" /></td>';
						} else {
							openEngines += '<td></td>';
						}
						openEngines += '</tr>\n';
					}

					$("#opensearchengines").html('<table id="opensearchoptionstable" class="opensearchoptionstable" style="width:100%" cellpadding="2" cellspacing="0" style="border-collapse:collapse">'+openEngines+'</table>');
				}
				var visibleSEButtons = 0;
				$(".searchenginebutton").each(function(){
					if ($('td.searchurl input[value="'+$(this).attr("searchurl")+'"]').length > 0) {
						$(this).css("display","none");
					} else {
						$(this).css("display","inline-block");
						visibleSEButtons++;
					}
				});
				if (visibleSEButtons == 0) {
					$("#restorebig3").css("display","none");
				} else {
					$("#restorebig3").css("display","block");
				}
			});
		}, errorHandler);
	}
}

// Once the Fauxbar page code has been loaded and is ready to go...
$(document).ready(function(){

	// Focus the Address Box when Fauxbar loads, or not.
	// The .blur() is to populate the Address Box with its "Go to a web site" text
	if (document.title != 'fauxbar.background' && document.title != 'fauxbar.popup') {
		if (localStorage.option_openfauxbarfocus && localStorage.option_openfauxbarfocus != 'chrome') {
			chrome.tabs.getCurrent(function(tab){
				chrome.tabs.update(tab.id, {selected:true});
			});
		} else {
			setTimeout(function() {
				$("#awesomeinput").blur();
			}, 1);
		}
	}

	// Load the Address Box's auto-fill plugin.
	// Doing this now, rather than before the document is ready, in order to shave off a few seconds from Fauxbar's loading time. Makes Fauxbar start up quicker
	$("head").append('<script type="text/javascript" src="jquery.rangyinputs.js"></script>');

	// Keep track of when Ctrl is pressed or not. Starts off as not being pressed
	window.ctrlDown = false;
	// Record that Ctrl is pressed
	$(document).bind("keydown", function(e) {
		if (e.keyCode == 17 ) {
			window.ctrlDown = true;
		}
	});
	// Record that Ctrl is no longer pressed
	$(document).bind("keyup", function(e) {
		if (e.keyCode == 17 ) {
			window.ctrlDown = false;
		}
	});

	// Apply Options
	// ..Most code below applies user-specified options just before the Fauxbar is shown
	// Lots of customization :)

	// Change the order of the Address Box and Search Box, if user has chosen
	changeInputBoxDisplayOrder(true);

	// Change the font size of the Address Box and Search Box
	if (localStorage.option_inputfontsize && localStorage.option_inputfontsize.length) {
		changeInputFontSize();
	}

	// Load the user's font name
	$("#customstyle").append("#apps, #topthumbs { font-family:"+localStorage.option_font+",Segoe UI, Arial, sans-serif; font-size:"+localStorage.option_sappsfontsize+"px; }");

	// Show or hide the Fauxbar's drop shadow
	if (localStorage.option_shadow && localStorage.option_shadow != 1) {
		$("#customstyle").append(".wrapper { box-shadow:none; } ");
	}

	// Apply the user's background image, if selected
	if (localStorage.option_bgimg && localStorage.option_bgimg.length) {
		$("body").css("background-image", "url("+localStorage.option_bgimg+")");
	}

	// Apply the user's background color, if selected
	if (localStorage.option_bgcolor && localStorage.option_bgcolor.length) {
		$("body").css("background-color", localStorage.option_bgcolor);
	}

	// Apply the user's background image position, if selected
	if (localStorage.option_bgpos && localStorage.option_bgpos.length) {
		$("body").css("background-position", localStorage.option_bgpos);
	}

	// Apply the user's background-repeat, if selected
	if (localStorage.option_bgrepeat && localStorage.option_bgrepeat.length) {
		$("body").css("background-repeat", localStorage.option_bgrepeat);
	}

	// Apply the user's background image size, if selected
	if (localStorage.option_bgsize && localStorage.option_bgsize.length) {
		$("body").css("background-size", localStorage.option_bgsize);
	}

	// Apply the user's maximum width of the Fauxbar, if selected
	if (localStorage.option_maxwidth && localStorage.option_maxwidth.length) {
		$("#customstyle").append(".wrapper { max-width:"+localStorage.option_maxwidth+"px; }");
	}

	// Apply the user's global font name, if selected
	if (localStorage.option_font && localStorage.option_font.length) {
		$("#customstyle").append("#thefauxbar *, #options .resultpreview * { font-family:"+localStorage.option_font+", Segoe UI, Arial, sans-serif; }");
	}

	// Apply the user's specified font size for the Address Box and Search Box
	if (localStorage.option_inputfontsize && localStorage.option_inputfontsize.length) {
		$("#customstyle").append("#addresswrapper input, #searchwrapper input { font-size:"+localStorage.option_inputfontsize+"px; }");
	}

	// Apply the user's specified color for Address Box result title texts, and Search Box queries/suggestions
	if (localStorage.option_titlecolor && localStorage.option_titlecolor.length) {
		$("#customstyle").append(".result_title, #opensearch_results .result, .result_title .dotdotdot { color:"+localStorage.option_titlecolor+"; }");
	}

	// Apply the user's specified color for Address Box result URL texts
	if (localStorage.option_urlcolor && localStorage.option_urlcolor.length) {
		$("#customstyle").append(".result_url, .result_url .dotdotdot { color:"+localStorage.option_urlcolor+"; }");
	}

	// Apply the user's specified background color for Address Box results and Search Box queries/suggestions
	if (localStorage.option_resultbgcolor && localStorage.option_resultbgcolor.length) {
		$("#customstyle").append(".result, .resultpreview, .dotdotdot { background-color:"+localStorage.option_resultbgcolor+"; }");
	}

	// Apply the user's sepcified highlighted color for results/queries/suggestions title texts
	if (localStorage.option_selectedtitlecolor && localStorage.option_selectedtitlecolor.length) {
		$("#customstyle").append("#opensearch_results .arrowed, .arrowed .result_title, .arrowed .result_title .dotdotdot { color:"+localStorage.option_selectedtitlecolor+"; }");
	}

	// Apply the user's sepcified highlighted color for result URL texts
	if (localStorage.option_selectedurlcolor && localStorage.option_selectedurlcolor.length) {
		$("#customstyle").append(".arrowed .result_url, .arrowed .result_url .dotdotdot { color:"+localStorage.option_selectedurlcolor+"; }");
	}

	// Apply the user's sepcified highlighted background color for results/queries/suggestions
	if (localStorage.option_selectedresultbgcolor && localStorage.option_selectedresultbgcolor.length) {
		$("#customstyle").append(".arrowed, #options .arrowed .dotdotdot, .arrowed .result_title .dotdotdot, .arrowed .result_url .dotdotdot { background-color:"+localStorage.option_selectedresultbgcolor+"; }");
	}

	// Apply the user's specified font size for result titles
	if (localStorage.option_titlesize && localStorage.option_titlesize.length) {
		$("#customstyle").append(".result_title, #options .result_title { font-size:"+localStorage.option_titlesize+"px; }");
	}

	// Apply the user's specified font size for result URLs and queries/suggestions
	if (localStorage.option_urlsize && localStorage.option_urlsize.length) {
		$("#customstyle").append(".result_url, #options .result_url, .historyresult, .jsonresult { font-size:"+localStorage.option_urlsize+"px; }");
	}

	// Apply the user's specified Address Box result separator color
	if (localStorage.option_separatorcolor && localStorage.option_separatorcolor.length) {
		$("#customstyle").append(".result { border-color:"+localStorage.option_separatorcolor+"; }");
	}

	// Apply the user's specified Address Box and Search Box background color
	if (localStorage.option_inputbgcolor && localStorage.option_inputbgcolor.length) {
		$("#customstyle").append(".inputwrapper { background-color:"+localStorage.option_inputbgcolor+"; }");
	}

	// Apply the bookmark/favorite icon's custom tint opacity strength
	if (localStorage.option_favopacity && localStorage.option_favopacity.length) {
		$("#fauxstar").attr("data-pb-tint-opacity", localStorage.option_favopacity / 100);
	}
	// Apply the bookmar/favorite icon's tint color
	if (localStorage.option_favcolor && localStorage.option_favcolor.length) {
		$("#fauxstar").attr("data-pb-tint-colour",localStorage.option_favcolor);
		$(".favstar").attr("src",$("#fauxstar").attr("src"));
	}

	// Load the Address Box's fallback URL into an element? Not sure why...
	if (localStorage.option_fallbacksearchurl && localStorage.option_fallbacksearchurl.length) {
		$("#option_fallbacksearchurl").val(localStorage.option_fallbacksearchurl);
	}

	// In the Options, when deciding on a new color for the input boxes' text, remove the faded/italic CSS class
	// so that the user can properly see what the text will look like when they're typing into it.
	$("#option_fauxbarfontcolor").live("focus", function(){
		$("#awesomeinput").removeClass("description");
	});
	// Then reset it back to being faded once the user is done deciding on a color.
	$("#option_fauxbarfontcolor").live("blur", function(){
		$("#awesomeinput").val("").blur();
	});

	// Apply custom Fauxbar background gradient colors
	if (localStorage.option_topgradient && localStorage.option_topgradient.length && localStorage.option_bottomgradient && localStorage.option_bottomgradient.length) {
		changeFauxbarColors();
	}

	// Apply custom icon tint colors
	if (localStorage.option_iconcolor && localStorage.option_iconcolor.length) {
		changeTintColors();
	}

	// Apply custom Address Box and Search Box font color
	if (localStorage.option_fauxbarfontcolor && localStorage.option_fauxbarfontcolor.length) {
		$("#customstyle").append(".inputwrapper input { color:"+localStorage.option_fauxbarfontcolor+"; }");
	}

	// Originally had the Fauxbar fade in once the custom colors and settings were applied... but the potential time wasted / waiting time might not be ideal.
	/*var transitionTime = (localStorage.option_bgimg && localStorage.option_bgimg.length) || getHashVar("options") == 1 ? 0 : 250;
	transitionTime = 0;
	$(".wrapper").animate({opacity:1}, transitionTime);*/

	// So, just make the Fauxbar appear instantly, now that all the custom colors and stuff have been applied.
	$(".wrapper").css("opacity",1);

	// Set the var saying that the user is not rearranging the order of the Search Box's search engines (this should probably go under / OPTIONS / below
	window.draggingOsRow = false;

	// When the user moves their mouse...
	$(document).mousemove(function(e){

		// Chrome likes to trigger mousemove() when results appear, even if the mouse hasn't moved. Bad Chrome!
		// ^ So this incorrectly hovers over results, if the mouse cursor is over a result when it appears, even if the mouse hasn't moved. Not good!
		// So let's record the actual coordinates of the mouse, and if they change from their last recorded spot, then we know that the mouse has moved for real.
		window.mouseHasMoved = false;
		if (window.mousemovePageX && window.mousemovePageY && (window.mousemovePageX != e.pageX || window.mousemovePageY != e.pageY)) {
			window.mouseHasMoved = true;
		}
		window.mousemovePageX = e.pageX;
		window.mousemovePageY = e.pageY;

		// If search queries/suggestions are displayed but the Search Box isn't focused for some reason (maybe user just clicked on a result?), focus the Search Box.
		if ($(".historyresult, .jsonresult").length > 0 && $("#opensearchinput").val().length > 0 && $("#opensearchinput:focus").length == 0) {
			$("#opensearchinput").focus();
		}

		// If user is dragging the handle between the two Boxes, apply the new widths so the user can see what they're changing
		if (window.handleStatus == 'down') {
			var leftCellWidth = e.pageX - $("#leftcell").offset().left;
			leftCellWidth = (leftCellWidth / $(".wrapper table").first().outerWidth()) * 100;
			window.leftCellWidthPercentage = leftCellWidth;
			$("#leftcell").css("width", leftCellWidth+"%");
			$("#rightcell").css("width", "auto");
		}

		// If user is dragging a search engine from the Options page to rearrange the order, make the clicking and dragging work :)
		if (window.draggingOsRow == true && window.mouseHasMoved == true) {
			$(".opensearch_optionrow").css("opacity",1);
			$("#dragging_os_row").css("top", e.pageY-10+"px");
			$(".dotted_os_row").remove();
			$("table#opensearchoptionstable tr.opensearch_optionrow").each(function(){
				if (e.pageY < $(this).offset().top+$(this).outerHeight() && $(".dotted_os_row").length == 0) {
					$(this).before('<tr class=".opensearch_optionrow dotted_os_row" style="height:'+$(this).outerHeight()+'px;"><td colspan="4">&nbsp;</td></tr>');
				}
			});
			if ($(".dotted_os_row").length == 0) {
				var lastOptionRow = "table#opensearchoptionstable tr.opensearch_optionrow:last";
				$(lastOptionRow).after('<tr class=".opensearch_optionrow dotted_os_row" style="height:'+$(lastOptionRow).outerHeight()+'px;"><td colspan="4">&nbsp;</td></tr>');
			}
		}
	});

	// Record that the user is dragging the Boxes' handle
	$("#handle").bind("mousedown", function(){
		window.handleStatus = "down";
		if (localStorage.indexComplete == 1) {
			$("*").css("cursor", "col-resize");
		}
		return false;
	});

	// When the user releases the mouse button...
	$("*").live("mouseup", function(){
		// If the user was dragging the Boxes' handle...
		if (window.handleStatus == 'down') {
			// Save the new width setting
			if ($("#addresswrapper").parent("td").attr("id") == "leftcell") {
				localStorage.option_leftcellwidthpercentage = window.leftCellWidthPercentage;
			} else {
				localStorage.option_leftcellwidthpercentage = 100 - window.leftCellWidthPercentage;
			}
			// Resize the results/queries/suggestions containers
			if ($(".result").length > 0) {
				if ($(".historyresult").length > 0 || $(".jsonresult").length > 0) {
					$("#opensearch_results").html("").css("display","none");
					getSearchSuggestions();
				} else {
					getResults();
				}
			}
			// If we're not on the reindexing progress page, make the cursor style go back to normal
			if (localStorage.indexComplete == 1) {
				$("*").css("cursor", "");
			}
			// Finish up
			window.handleStatus = 'up';
			$("input:focus").blur();
			changeInputBoxDisplayOrder(true);
			return false;
		}

		// If we're done rearranging the search engines, save the changes and update the order
		if (window.draggingOsRow == true) {
			window.draggingOsRow = false;
			var dottedOSRowOffset = $(".dotted_os_row").offset();
			$("#dragging_os_row").animate({top:dottedOSRowOffset.top+"px", left:dottedOSRowOffset.left+"px"}, 100, function(){
				$(".dotted_os_row").after($(".opensearch_optionrow:hidden"));
				$("#dragging_os_row").remove();
				$(".opensearch_optionrow").css("display","table-row");
				$(".dotted_os_row").remove();
				if (openDb()) {
					window.db.transaction(function(tx){
						tx.executeSql('UPDATE opensearches SET position = 0', []);
						var orderCount = 0;
						$($(".opensearch_optionrow").get().reverse()).each(function() {
							orderCount++;
							tx.executeSql('UPDATE opensearches SET position = ? WHERE shortname = ?', [orderCount, $("td.shortname input",this).val()]);
						});
					}, errorHandler);
					populateOpenSearchMenu();
				}
			});
		}
	});

	// jquery.hotkeys doesn't really like binding multiple hotkeys to one element, so need to check e.keyCode.
	// All three .live() things here below cascade one after another. the last `return true;` lets Chrome take over the default behaviour

	// If user presses Alt+D, focus Address Box instead of Omnibox (if selected in Options)
	$("*").live('keydown', 'alt+d', function(e){
		if (e.keyCode == 68 && localStorage.option_altd && localStorage.option_altd == 1) {
			$("#awesomeinput").focus().select();
			return false;
		}
	});
	// If user presses Ctrl+L, focus Address Box instead of Omnibox (if selected in Options)
	$("*").live('keydown', 'ctrl+l', function(e){
		if (e.keyCode == 76 && localStorage.option_ctrll && localStorage.option_ctrll == 1) {
			$("#awesomeinput").focus().select();
			return false;
		}
	});
	// If user presses Ctrl+K, focus Search Box instead of Omnibox (if selected in Options)
	$("*").live('keydown', 'ctrl+k', function(e){
		if (e.keyCode == 75 && localStorage.option_ctrlk && localStorage.option_ctrlk == 1) {
			$("#opensearchinput").focus().select();
			return false;
		}
		return true;
	});

	// When user clicks on almost anything, hide results/suggestions/queries. Assumes the user wants to hide them this way.
	$("#background, table#options, #apps, #topthumbs").live("mousedown", function(){
		$(".triangle").removeClass("glow");
		hideResults();
		$("#opensearch_results").css("display","none").html("");
	});

	// When user focuses the Address Box, hide search queries and suggestions
	$("#awesomeinput").bind("focus", function(){
		window.navigating = false;
		$("#opensearch_results").css("display","none").html("");

		// Catch speech input
		if ($(this).val().length > 0 && $(this).getSelection().length == 0 && $(".glow").length == 0) {
			getResults();
		}
	});

	// When user clicks to select a new search engine to user, make it so.
	$("#opensearchmenu .menuitem").live("mousedown", function(){
		selectOpenSearchType(this, true);
		return false;
	});

	// When the Search Box is focused, hide Address Box results and make the Search Box look good
	$("#opensearchinput").focus(function(){
		hideResults();
		if ($(this).val() == window.openSearchShortname) {
			$(this).removeClass("description").val("");
		}
		$(this).attr("title","");
	});

	// When the Search Box loses focus, make it look faded
	$("#opensearchinput").blur(function(){
		if ($(this).val() == "") {
			$(this).addClass("description").val(window.openSearchShortname);
		}
		$(this).attr("title",$(this).attr("realtitle"));
	});

	// When user stops selecting a new search engine to use, make the arrow/triangle lose its glow, and hide the search engine menu.
	$("#opensearch_menufocus").blur(function(){
		$("#opensearchmenu").css("display","none");
		$("#opensearch_triangle .triangle").removeClass("glow");
		$(this).css("display","none");
	});

	// When user clicks the Search Box's triangle/arrow, show the list of selectable search engines to choose from, or close the list if it's showing
	$("#opensearch_triangle").bind("mousedown", function(){
		if (localStorage.indexComplete == 1) {
			$("#opensearch_results").html("").css("display","none");
			if ($("#opensearchmenu").css("display") != "block") {
				$("#opensearchmenu").css("display","block");
				$("#opensearch_triangle .triangle").addClass("glow");
				setTimeout(function(){
					$("#opensearch_menufocus").css("display", "inline-block").focus();
				}, 1);
			}
			else {
				$("#opensearchmenu").css("display","none");
				$("#opensearch_triangle .triangle").removeClass("glow");
			}
		}
	});

	// When clicking the Address Box's triangle, show the user's top sites, or hide the list of results
	$("#addressbox_triangle").bind("mousedown", function(){
		if (localStorage.indexComplete == 1) {
			if (($(".historyresult").length > 0 || $(".jsonresult").length > 0 ) || $(".result").length == 0 || $("#results").attr("noquery") == 0) {
				$("#addressbox_triangle .triangle").addClass("glow");
				if ($("#awesomeinput:focus").length == 0) {
					$("#awesomeinput").focus();
				}
				$(this).attr("title","");
				getResults(true);
			} else {
				$(".triangle").removeClass("glow");
				$(this).attr("title",$(this).attr("origtitle"));
				hideResults();
			}
			return false;
		}
	});

	// The Address Box triangle's title attribute is handy, but not when the results are already being shown!
	// Blanks the title attribute when not needed, and then reinstates it.
	$("#addressbox_triangle").bind("mouseenter", function(){
		if ($(".triangle.glow").length > 0) {
			$(this).attr("title","");
		} else {
			$(this).attr("title",$(this).attr("origtitle"));
		}
	});

	$(".result").live("mousemove", function(){
		if (window.mouseHasMoved == true) {
			$(".result").removeClass("arrowed");
			$(".result:hover").addClass("arrowed");
		}
	});

	// When user clicks an Address Box result, decide what to do...
	window.clickResult = function(resultEl) {
		chrome.tabs.getAllInWindow(null, function(tabs){
			for (var t in tabs) {
				if (tabs[t].url == $(resultEl).attr("url")) {
					chrome.tabs.update(tabs[t].id, {selected:true});
					// Close current tab if the tab just had Fauxbar open to switch to find a tab to switch to
					if (history.length == 1) {
						chrome.tabs.getCurrent(function(tab){
							chrome.tabs.remove(tab.id);
						});
					}
					updateHash();
					return false;
				}
			}
		});
		// Since clicking takes focus away from the Address Box, regain focus and possibly reselect auto-filled text/URL
		setTimeout(function(){
			if ($("#awesomeinput").val().substr(0, window.actualUserInput.length) == window.actualUserInput) {
				$("#awesomeinput").focus().setSelection(window.actualUserInput.length, $("#awesomeinput").val().length);
			} else {
				$("#awesomeinput").focus();
			}
		}, 1);
		return true;
	}

	// When user clicks the Address Box or Search Box, if nothing was selected, select all the input to try and help the user out
	$("#awesomeinput").bind("mouseup", function(){
		if ($(this).getSelection().length == 0) {
			$(this).select();
		}
	});
	$("#opensearchinput").bind("mouseup", function(){
		if ($(this).getSelection().length == 0) {
			$(this).select();
		}
	});

	// When user clicks the Address Box, hide the result links
	$("#awesomeinput").bind("mousedown", function(){
		hideResults();
	});

	// When the Address Box is empty and the user double-clicks it, display the top results
	$("#awesomeinput").dblclick(function(){
		if ($(this).val() == "" || $(this).val() == "Go to a web site") {
			$("#addressbox_triangle").mousedown();
		}
	});

	// When Address Box loses focus, reinstate the faded look and generic helper text
	$("#awesomeinput").blur(function() {
		if ($(this).val() == "") {
			$(this).val("Go to a web site").addClass("description");
		}
	});

	// If Address Box is faded with generic helper text, and user clicks it, prime it
	$("#awesomeinput").focus(function() {
		if ($(this).val() == "Go to a web site") {
			$(this).val("").removeClass("description");
		}
	});

	// When user clicks the Address Box's go arrow, go to the address if something is entered
	$("#address_goarrow").bind("mousedown", function(){
		var aiVal = $("#awesomeinput").val();
		if (aiVal.length > 0 && aiVal != 'Go to a web site') {
			goToUrl(aiVal);
			hideResults();
		}
		return false;
	});

	// When user hovers over the Address Box's go arrow, make it change color slightly
	$("#address_goarrow").bind("mouseenter", function(){
		$("#address_goarrow img").attr("tintedsrc",$("#address_goarrow img").attr("src")).attr("src",$("#goarrow_hovered").attr("src"));
	});

	// When user stops hovering over the Address Box's go arrow, change the color back
	$("#address_goarrow").bind("mouseleave", function(){
		$("#address_goarrow img").attr("src",$("#address_goarrow img").attr("tintedsrc"));
	});

	// When user clicks the Search Box's magnifying glass, submit the search if text is entered
	$("#searchicon_cell").bind("mousedown", function(){
		if ($("#opensearchinput").val().trim() != "" && !$("#opensearchinput").hasClass("description")) {
			submitOpenSearch();
		}
	});

	// When user hovers over magnifying glass, change color slightly
	$("#searchicon_cell").bind("mouseenter", function(){
		$("#searchicon_cell img").attr("tintedsrc",$("#searchicon_cell img").attr("src")).attr("src",$("#searchicon_hovered").attr("src"));
	});

	// Change magnifying color back when user stops hovering over it
	$("#searchicon_cell").bind("mouseleave", function(){
		$("#searchicon_cell img").attr("src",$("#searchicon_cell img").attr("tintedsrc"));
	});

	// If Address Box is focused and user presses Ctrl+Enter, wrap "http://www." and ".com" around the text, and go to the URL
	$("#awesomeinput").bind("keydown", "ctrl+return", function(){
		var thisVal = $(this).val();
		if (!strstr(thisVal.trim(), ' ') && !strstr(thisVal, '/')) {
			if (!strstr(thisVal, '.')) {
				$(this).val('http://www.'+thisVal+'.com/');
			}
			else if (thisVal.substr(thisVal.length-3) != '.com') {
				$(this).val('http://'+thisVal+'.com/');
			}
		}
	});

	// If Address Box is focused and user presses Ctrl+K, focus the Search Box
	$("#awesomeinput").bind("keydown", "ctrl+k", function(){
		$("#opensearchinput").focus();
		return false;
	});

	// If Address Box is focused and user presses Ctrl+L, don't focus the Omnibox
	$("#awesomeinput").bind("keydown", "ctrl+l", function(){
		return false;
	});

	// If Address Box is focused and user presses Alt+D, don't focus the Omnibox
	$("#awesomeinput").bind("keydown", "alt+d", function(){
		return false;
	});

	// If Search Box is focused and user presses Ctrl+K, don't focus the Omnibox
	$("#opensearchinput").bind("keydown", "ctrl+k", function(){
		return false;
	});

	// If Search Box is focused and user presses Ctrl+L, focus the Address Box
	$("#opensearchinput").bind("keydown", "ctrl+l", function(){
		$("#awesomeinput").focus();
		return false;
	});

	// If Search Box is focused and user presses Alt+D, focus the Address Box
	$("#opensearchinput").bind("keydown", "alt+d", function(){
		$("#awesomeinput").focus();
		return false;
	});

	// Record when user presses Alt+Enter
	$("#awesomeinput").bind("keydown", "alt+return", function(){
		window.altReturn = true;
	});
	$("#opensearchinput").bind("keydown", "alt+return", function(){
		window.altReturn = true;
	});

	$("#results").bind("scroll", function() {
		window.userHasNewInput = false;
	});

	// When user types a key into the Address Box...
	$("#awesomeinput").bind("keydown",function(e){
		window.userHasNewInput = false;
		setTimeout(toggleSwitchText, 1);
		// up = 38, down = 40, esc = 27, left = 37, right = 39, enter = 13, tab = 9
		// 8 = backspace, 46 = delete, tab = 9, shift = 16, ctrl = 17, alt = 18

		// Tab, Shift, Ctrl - don't make these keys refresh results, so just return true
		if (e.keyCode == 9 || e.keyCode == 16 || e.keyCode == 17 ) {
			return true;
		}

		// Alt - nope
		if (e.keyCode == 18) {
			return false;
		}

		// Delete - if user has a result selected/hovered, delete it if Quick Delete is enabled in the options
		if (e.keyCode == 46 && localStorage.option_quickdelete && localStorage.option_quickdelete == 1) {
			if ($(".arrowed").length) {
				if (openDb()) {
					window.db.transaction(function(tx){
						var arrowedUrl = $(".arrowed").attr("url");
						tx.executeSql('UPDATE urls SET queuedfordeletion = 1 WHERE url = ? AND type = 1', [arrowedUrl]);
						tx.executeSql('DELETE FROM thumbs WHERE url = ?', [arrowedUrl]);
						chrome.history.deleteUrl({url:arrowedUrl});
						var nextNumber = $(".arrowed").next(".result").attr("number");
						$(".arrowed").remove();
						$('.result[number="'+nextNumber+'"]').addClass("arrowed");
					}, errorHandler);
					$(this).val(window.actualUserInput);
				}
				return false;
			}
		}

		// Esc - hide results and/or select all the text (user doesn't want what's currently there)
		if (e.keyCode == 27) {
			$(".arrowed").removeClass("arrowed");
			if (window.actualUserInput) {
				$(this).val(window.actualUserInput);
			}
			if ($(".result").length > 0) {
				$(".triangle").removeClass("glow");
				hideResults();
			}
			else {
				$(this).select();
			}
			return false;
		}

		// Enter/Return - go to the address entered in the Address Box
		if (e.keyCode == 13) {
			var aiVal = $(this).val();
			if (aiVal.length > 0) {
				goToUrl(aiVal);
				$(this).blur();
				if (window.altReturn == false) {
					hideResults();
				}
			}
			return false;
		}

		// Left, Right - user is reposition caret, so hide the results so user isn't as distracted
		if (e.keyCode == 37 || e.keyCode == 39) {
			hideResults();
			return true;
		}

		// Up, Down - navigate the result links
		if ((e.keyCode == 38 || e.keyCode == 40)) {
			window.navigating = true;
			return navigateResults(e);
		}

		// Hide the current results if the user has decided to show the top results instead
		if ($(".glow").length > 0) {
			hideResults();
		}

		// Since we're this far, user has entered something that should go towards getting matching history items or bookmarks as results
		window.userHasNewInput = true;
		window.lastKeyCode = e.keyCode;
		setTimeout(getResults, 1);
	});

	// If user presses Tab with the Address Box focused, and there are results displayed, navigate down the results (just like pressing Down Arrow)
	$("#awesomeinput").bind("keydown", "tab", function(){
		if ($(".result").length) {
			navigateResults({keyCode:40});
			return false;
		}
	});

	// If user presses Shift+Tab with the Address Box focused, and there are results displayed, navigate up the results (just like pressing Up Arrow)
	$("#awesomeinput").bind("keydown", "shift+tab", function(){
		if ($(".result").length) {
			navigateResults({keyCode:38});
			return false;
		}
	});

	// If user presses Tab with the Search Box focused, and there are queries/suggestions displayed, navigate down the results (just like pressing Down Arrow)
	$("#opensearchinput").bind("keydown", "tab", function(){
		if ($(".result").length) {
			navigateResults({keyCode:40});
			return false;
		}
	});

	// If user presses Tab with the Search Box focused, and there are queries/suggestions displayed, navigate up the results (just like pressing Up Arrow)
	$("#opensearchinput").bind("keydown", "shift+tab", function(){
		if ($(".result").length) {
			navigateResults({keyCode:38});
			return false;
		}
	});

	// When user releases a key with the Address Box focused...
	$("#awesomeinput").bind("keyup",function(e){
		// up = 38, down = 40, 27 = esc, left = 37, right = 39
		// 8 = backspace, 46 = delete

		// Catch the release of Enter/Return
		if (e.keyCode == 13 ) {
			return false;
		}

		// Let Left and Right go through
		if (e.keyCode == 37 || e.keyCode == 39) {
			return true;
		}

		// If results are displayed and user is navigating, prevent the caret from moving
		if ((e.keyCode == 38 || e.keyCode == 40) && $(".result").length > 0 ) {
			return false;
		}
	});

	// When the Chrome window gets resized, get results and queries/suggestions again so their containers are resized appropriately
	$(window).resize(function(){
		if ($("#awesomeinput:focus").length) {
			getResults();
		} else if ($("#opensearch_results").length) {
			getSearchSuggestions();
		}
	});

	// Populate the Search Box's list of search engines now, so that they appear instantly when the user clicks to change search engine.
	populateOpenSearchMenu();

	// When user clicks on a Search Box query/suggestion...
	$('.jsonresult, .historyresult').live("mousedown", function(){
		var query = false;
		// If user Middle-clicks or Ctrl+Clicks, record it as such, so that submitOpenSearch() knows to do the search in a new tab
		if (event.button == 1 || window.ctrlDown == true) {
			window.ctrlDown = false;
			window.middleMouse = true;
			window.altReturn = true;
			query = ($(".suggestion",this).text());
		}
		// If user hasn't Middle-clicked or Ctrl+Clicked, hide the queries/suggestions from view
		if (!window.middleMouse) {
			$("#opensearchinput").val($(".suggestion",this).text());
			$("#opensearch_results").css("display","none").html("");
		}
		// And finally, submit the search
		submitOpenSearch(query);
		return false;
	});

	// When user presses a key with the Search Box focused...
	$("#opensearchinput").bind("keydown", function(e){
		// up = 38, down = 40, esc = 27, left = 37, right = 39, enter = 13, tab = 9
		// 8 = backspace, 46 = delete, tab = 9, shift = 16, ctrl = 17, alt = 18

		// Tab, Shift, Ctrl - return true right now, don't let the key go any further
		if (e.keyCode == 9 || e.keyCode == 16 || e.keyCode == 17) {
			return true;
		}

		// Alt - nope
		if (e.keyCode == 18) {
			return false;
		}

		// Delete - Use Quick Delete to remove a selected/hovered query from the Search Box's history
		if (e.keyCode == 46) {
			if ($('.arrowed.historyresult').length > 0 && localStorage.option_quickdelete && localStorage.option_quickdelete == 1) {
				if (openDb()) {
					window.db.transaction(function(tx){
						var tempNum = microtime(true);
						$(".arrowed").next(".result").attr("tempnum",tempNum);
						tx.executeSql('DELETE FROM searchqueries WHERE query = ?', [html_entity_decode($(".arrowed .suggestion").text())]);
						$(".arrowed").remove();
						$('.result[tempnum="'+tempNum+'"]').addClass("arrowed");
					}, errorHandler);
				}
				return false;
			} else {
				return true;
			}
		}

		// Esc - hide queries/suggestions and focus the input; user doesn't want what's there
		if (e.keyCode == 27) {
			$(".arrowed").removeClass("arrowed");
			if (window.actualSearchInput) {
				$("#opensearchinput").val(window.actualSearchInput);
			}
			if ($(".result").length > 0) {
				$("#opensearch_results").css("display","none").html("");
			} else {
				$("#opensearchinput").select();
			}
			return false;
		}

		// Enter/Return - execute the search, hide the results
		if (e.keyCode == 13) {
			if ($("#opensearchinput").val().trim().length > 0) {
				$("#opensearch_results").css("display","none").html("");
				submitOpenSearch();
			}
			return false;
		}

		// Left, Right - user is moving the caret, so hide the results so they're not being a distraction
		if (e.keyCode == 37 || e.keyCode == 39) {
			$("#opensearch_results").css("display","none").html("");
			return true;
		}

		// Up, Down - navigate the queries/suggestions
		if ((e.keyCode == 38 || e.keyCode == 40)) {
			if ($(".result").length == 0) {
				getSearchSuggestions();
				return false;
			} else {
				return navigateResults(e);
			}
		}

		// This far, user has probably entered a letter or number, so get some new queries/suggestions to display
		setTimeout(function() {
			if ($("#opensearchinput").val().trim() != "") {
				getSearchSuggestions();
			} else {
				$("#opensearch_results").css("display","none").html("");
			}
		}, 1);
	});

	$("#opensearchinput").bind("focus", function(){
		// Catch speech input
		if ($(this).val().length > 0 && $(this).getSelection().length == 0) {
			getSearchSuggestions();
		}
	});

	// If the Fauxbar background page has a hash value (not sure why it would... I forget :( ), interpret it
	var bg = chrome.extension.getBackgroundPage();
	if (bg.newTabHash) {
		window.location.hash = '#'+bg.newTabHash;
		autofillInput();
		setTimeout(function(){
			$("#awesomeinput").select();
		}, 100);
	}

	///////// OPTIONS //////////////

	// If Fauxbar's hash value says to open display the Options page, and the user isn't reindexing the database, let's initialize and show the options!
	// And I decided to show the Options page inline with the normal Fauxbar page, because a lot of the options alter the Fauxbar on the fly, so wanted to have both visible at once,
	// rather than making a whole new options page by itself.
	if (getHashVar("options") == 1 && localStorage.indexComplete == 1) {

		// If and when Fauxbar Memory Helper is un/installed or disabled/enabled, update the text on the Management page
		chrome.management.onEnabled.addListener(function(extension) {
			setTimeout(updateHelperStatus, 100);
		});
		chrome.management.onDisabled.addListener(function(extension) {
			setTimeout(updateHelperStatus, 100);
		});
		chrome.management.onInstalled.addListener(function(extension) {
			setTimeout(updateHelperStatus, 100);
		});
		chrome.management.onUninstalled.addListener(function(extension) {
			setTimeout(updateHelperStatus, 100);
		});

		// Clear the blue "info bar" from the top of the page that wanted the user to open the options, since they have done so now
		localStorage.showintro = 0;
		$("#optionsintro").remove();

		// Hide the site tiles and Chrome apps since the Options page overlaps them anyway
		$("#topthumbs").remove();
		$("#apps").remove();
		$("#sapps").remove();

		// Load the Options page HTML
		$.get("options.html", function(response){
			$("#thefauxbar").after(response);

			// Update the page/tab title
			document.title = "Fauxbar Options";

			// Make the Address Box lose focus
			$("#awesomeinput").blur();

			// Apply input masks/restrictions on some of the number-only inputs, as a simple form of form validation.
			// I haven't really enforced any strict form of form validation anywhere, frankly.
			$(".color").mask("#***?***", {placeholder:""});
			$(".fontsize, .upto").mask("9?99", {placeholder:""});
			$("#option_maxwidth").mask("9?999", {placeholder:""});
			$(".opacity").mask("9?99", {placeholder:""});

			// Stop animating the Fauxbar's Address Box and Search Box reordering/fading animation when the user presses a key to change it to something else (so there's no animation queueing)
			$("select").live("keyup", function(){
				$("#thefauxbar").children("table").first().stop();
				$(this).change();
			});

			// Apply some Options page CSS automatically, sice I'm too lazy to keep on top of hard-coding the styles myself as I change the order of the HTML elements here and there.
			$("table#options td").each(function(){
				$(this).children("label.legend").last().css("margin-bottom","0");
			});

			// Some more automatic HTML insertion, making my life easier
			$("label.legend").after("<br />");

			// When user changes the Fallback URL option, disable the preset buttons if needed (usability design)
			$("#option_fallbacksearchurl").live("change", function(){
				$(".fallback").prop("disabled",false).each(function(){
					if ($(this).attr("url") == $("#option_fallbacksearchurl").val()) {
						$(this).prop("disabled",true);
					}
				});
			});

			// Although most checkbox options can be applied instantly without needing to reload the page, Chrome/WebKit's HTML5 speech input icons don't seem to be able to be changed on the fly.
			// So the page has to actually be reloaded for the user to see the page, so display a link to get the user to click to reload the page so they can see the change.
			$("#option_speech").live("change", function(){
				toggleSpeechInputIcons();
			});

			// When user clicks the little down or up arrow on a number input, trigger that the value has change()'d
			$('input[type="number"]').live("click",function(){
				$(this).change();
			});
			$('input[type="number"]').live("keyup",function(){
				$(this).change();
			});

			// When the Chrome window is resized, resize the Options page appropriately
			$(window).bind("resize", function(){
				$(".optionbox").css("height", $(window).height()-150-$("#thefauxbar").height()+"px");
			});
			// And trigger it too here, so that the Option page's dimensions are correct from the getgo
			$(window).resize();

			// When the user clicks to change to a different Options page, make it so
			$("#option_menu div").bind("mousedown", function(){
				changeOptionPage(this);
			});

			// Change to the last Options page the user was on
			changeOptionPage($("#" + (localStorage.option_optionpage ? localStorage.option_optionpage : "option_section_general")));

			// Load the list of search engines for the Search Box Options page
			getSearchEngines();

			//////////////////////////////////////////////////////
			// Drag open search engine to change position/order //
			//////////////////////////////////////////////////////

			// When user begins to click and drag a search engine to rearrange the order, make it liftable
			$(".osicon").live("mousedown", function() {
				window.mouseHasMoved = false;
				var thisParent = $(this).parent();
				var thisOffset = $(this).offset();
				$("body").append('<table id="dragging_os_row" style="width:'+thisParent.width()+'px; top:'+thisOffset.top+"px"+'; left:'+thisOffset.left+"px"+';"><tr class="opensearch_optionrow">'+thisParent.html()+'</tr></table>');
				$("#dragging_os_row tr td.shortname input").val($(this).nextAll("td.shortname").children("input").val());
				$("#dragging_os_row tr td.searchurl input").val($(this).nextAll("td.searchurl").children("input").val());
				$(this).parent().before('<tr class=".opensearch_optionrow dotted_os_row" style="height:'+$(this).parent().outerHeight()+'px;"><td colspan="4">&nbsp;</td></tr>');
				$(this).parent().css("display","none");
				window.draggingOsRow = true;
				return false;
			});

			// When user presses Enter/Return in an input box, make the input box lose focus, since the user is done making changes
			$('table#options input[type="text"], table#options input[type="number"]').live("keyup", function(e){
				if (e.keyCode == 13) {
					$(this).blur();
				}
			});

			// When the user edits one of the search engines (like its name or URL), update the database
			$("tr.opensearch_optionrow td input").live("change", function(){
				if (openDb()) {
					var osRow = $(this).parent().parent();
					window.db.transaction(function(tx){
						tx.executeSql('UPDATE opensearches SET shortname = ?, searchurl = ? WHERE shortname = ?', [$('.shortname > input',osRow).val(), $('.searchurl > input',osRow).val(), $('.shortname > input',osRow).attr("origvalue")]);
					}, errorHandler);
					setTimeout(function() {
						$("#opensearchoptionstable > tbody > tr > td.shortname > input, #opensearchoptionstable > tbody > tr > td.searchurl > input").each(function(){
							$(this).attr("origvalue",$(this).val());
						});
						populateOpenSearchMenu();
					}, 100);
				}
			});

			// When user clicks the cross next to a search engine, remove it from the database and from the screen
			$(".opensearchcross").live("mousedown", function(){
				if (openDb()) {
					var theCell = this;
					window.db.transaction(function(tx){
						tx.executeSql('DELETE FROM opensearches WHERE shortname = ?', [$(theCell).prevAll('td.shortname').children('input').first().val()]);
					}, errorHandler);
					$(theCell).parent().animate({opacity:0}, /*400*/ 0, function() {
						$(this).remove();
						populateOpenSearchMenu();
						getSearchEngines();
					});
				}
			});

			// Retrieve and set saved options from localStorage, loading the values into input boxes and checking checkboxes as needed
			var thisAttrId = "";
			$("table#options input").each(function(){
				thisAttrId = $(this).attr("id");
				switch ($(this).attr("type")) {
					case "checkbox":
						$(this).prop("checked", localStorage[thisAttrId] == 1 ? "checked" : "");
						break;
					default: //"text", "number"
						var defaultVal = '';
						if (thisAttrId == "option_maxaddressboxresults") {
							defaultVal = 16;
						} else if (thisAttrId == "option_maxaddressboxresultsshown") {
							defaultVal = 8;
						}
						$(this).val(localStorage[thisAttrId] && localStorage[thisAttrId].length > 0 ? localStorage[thisAttrId] : defaultVal);
						break;
				}
			});

			// Disable one of the Fallback URL preset buttons if needed
			$("#option_fallbacksearchurl").change();

			// Set each <select> element with the appropriate stored option
			$("table#options select").each(function(){
				$(this).val(localStorage[$(this).attr("id")]);
			});

			// If user clicks one of the 3 preset search engine buttons, restore the clicked engine by adding it to the database and have it appear on screen
			$(".searchenginebutton").live("click", function(){
				if (openDb()) {
					var button = this;
					window.db.transaction(function(tx) {
						tx.executeSql('DELETE FROM opensearches WHERE searchurl = ?', [$(button).attr("searchurl")]);
						tx.executeSql('INSERT INTO opensearches (shortname, iconurl, searchurl, xmlurl, xml, isdefault, method, suggestUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [$(button).attr("shortname"), $("img",button).attr("src"), $(button).attr("searchurl"), "", "", "0", "get", $(button).attr("suggesturl")]);
						$(button).css("display","none");
					}, errorHandler);
					getSearchEngines();
					populateOpenSearchMenu();
				}
			});

			// When the Page Background options are changed, make it so
			$("#option_bgcolor").live("change", function(){
				$("body").css("background-color", $(this).val());
			});
			$("#option_bgimg").live("change", function(){
				$("body").css("background-image", 'url('+$(this).val()+')');
			});
			$("#option_bgpos").live("change", function(){
				$("body").css("background-position", $(this).val());
			});
			$("#option_bgrepeat").live("change", function(){
				$("body").css("background-repeat", $(this).val());
			});
			$("#option_bgsize").live("change", function(){
				$("body").css("background-size", $(this).val());
			});

			// When user selects to change the order/visibility of the Address Box and/or Search Box, make it so
			$("#option_inputboxdisplayorder").live("change", function() {
				changeInputBoxDisplayOrder();
			});

			// Apply font change
			$("#option_font").live("change", function(){
				var newFont = $(this).val().trim();
				if (newFont) {
					$("#customstyle").append('#thefauxbar *, #options .resultpreview * { font-family:'+newFont+', Segoe UI, Arial, sans-serif; }');
				} else {
					var lucida = window.OS == "Mac" ? "Lucida Grande, " : "";
					$("#customstyle").append('#thefauxbar *, #options .resultpreview * { font-family:'+lucida+' Segoe UI, Arial, sans-serif; }');
				}
			});

			// Apply font size change
			$("#option_inputfontsize").live("change", function(){
				changeInputFontSize();
			});

			// When various CSS options change, apply them
			$("#option_titlecolor").live("change", function(){
				insertCustomStyles();
			});
			$("#option_urlcolor").live("change", function(){
				insertCustomStyles();
			});
			$("#option_resultbgcolor").live("change", function(){
				insertCustomStyles();
			});
			$("#option_selectedtitlecolor").live("change", function(){
				insertCustomStyles();
			});
			$("#option_selectedurlcolor").live("change", function(){
				insertCustomStyles();
			});
			$("#option_selectedresultbgcolor").live("change", function(){
				insertCustomStyles();
			});
			$("#option_titlesize").live("change", function(){
				insertCustomStyles();
			});
			$("#option_urlsize").live("change", function(){
				insertCustomStyles();
			});
			$("#option_separatorcolor").live("change", function(){
				insertCustomStyles();
			});
			$("#option_iconcolor").live("change", function(){
				setTimeout(changeTintColors,10);
			});
			$("#option_inputbgcolor").live("change", function(){
				insertCustomStyles();
			});
			$("#option_topgradient").live("change", function(){
				changeFauxbarColors();
			});
			$("#option_bottomgradient").live("change", function(){
				changeFauxbarColors();
			});
			$("#option_topopacity").live("change", function(){
				changeFauxbarColors();
			});
			$("#option_bottomopacity").live("change", function(){
				changeFauxbarColors();
			});
			$("#option_fauxbarfontcolor").live("change", function(){
				insertCustomStyles();
			});
			$("#option_maxwidth").live("change", function(){
				insertCustomStyles();
			});

			// When the drop shadow option changes, apply it
			$("#option_shadow").live("change", function(){
				$("#customstyle").append(".wrapper { box-shadow:" + (localStorage.option_shadow == 1 ? "0 5px 7px rgba(0,0,0,.25);" : "none;") + " }");
			});

			// Update favorite/bookmark icon if user changes it
			$("#option_favopacity").live("change", function(){
				$("#fauxstar").attr("src","fauxstar.png").attr("data-pb-tint-opacity", $(this).val() / 100);
				processFilters();
				$(".favstar").attr("src",$("#fauxstar").attr("src"));
			});
			$("#option_favcolor").live("change", function(){
				$("#fauxstar").attr("src","fauxstar.png").attr("data-pb-tint-colour",$(this).val());
				processFilters();
				$(".favstar").attr("src",$("#fauxstar").attr("src"));
			});

			// If user is sorting out the Page Background options, and they have an image set, make the Options be semi-transparent when the mouse goes near edge of screen,
			// so that user can see how the background looks
			$("table#options").bind("mouseleave", function(){
				if ($("#option_section_background").hasClass("section_selected") && $("#option_bgimg").val().length) {
					$(this).stop().animate({opacity:.2}, 250)
				}
			});
			$("table#options").bind("mouseenter", function(){
				$(this).stop().animate({opacity:1}, 250)
			});

			// The function that applies all the live changes to the CSS options set above
			function insertCustomStyles() {
				var toAppend = "";
				toAppend += ".wrapper { max-width:"+$("#option_maxwidth").val()+"px; }";
				toAppend += ".result_title, .result, .result_title .dotdotdot, #options .result_title { color:"+$("#option_titlecolor").val()+"; font-size:"+$("#option_titlesize").val()+"px; }";
				toAppend += ".result_url, .result_url .dotdotdot, #options .result_url, .historyresult, .jsonresult { color:"+$("#option_urlcolor").val()+"; font-size:"+$("#option_urlsize").val()+"px; }";
				toAppend += ".result, .resultpreview, .dotdotdot { background-color:"+$("#option_resultbgcolor").val()+"; }";
				toAppend += ".arrowed .result_title, #options .arrowed .result_title, #opensearch_results .arrowed { color:"+$("#option_selectedtitlecolor").val()+"; }";
				toAppend += ".arrowed .result_url, #options .arrowed .result_url { color:"+$("#option_selectedurlcolor").val()+"; }";
				toAppend += ".arrowed, #options .arrowed .dotdotdot { background-color:"+$("#option_selectedresultbgcolor").val()+"; }";
				toAppend += ".result { border-color:"+$("#option_separatorcolor").val()+"; }";
				toAppend += ".inputwrapper { background-color:"+$("#option_inputbgcolor").val()+"; }";
				toAppend += ".inputwrapper input { color:"+$("#option_fauxbarfontcolor").val()+"; }";
				$("#customstyle").append(toAppend);
			}

			// Update localStorage with the chosen option when an input element changes
			$("table#options input").bind("change", function(){
				switch ($(this).attr("type")) {
					case "checkbox":
						localStorage[$(this).attr("id")] = $(this).prop("checked") ? 1 : 0;
						break;
					case "text":
						localStorage[$(this).attr("id")] = $(this).val();
						break;
					case "number":
						localStorage[$(this).attr("id")] = $(this).val();
						break;
					default:
						break;
				}
			});
			$("table#options select").bind("change", function(){
				localStorage[$(this).attr("id")] = $(this).val();
			});

			// Update the Options Management page with the database stats
			loadDatabaseStats();

			// All the Options have been loaded and primed, so let's show the Options page now
			$("#options").css("display","block");
		});

		////// END LOADING OPTIONS ////////

	// If we're not loading the options page...

	// If we're not reindexing the database...
	} else if (localStorage.indexComplete == 1) {
		// Setup and show the Fauxbar... Options icon in the Omnibox
		chrome.tabs.getCurrent(function(tab){
			chrome.pageAction.setIcon({tabId:tab.id, path:"fauxbar16options.png"});
			chrome.pageAction.setTitle({tabId:tab.id, title:"Customize Fauxbar"});
			chrome.pageAction.setPopup({tabId:tab.id, popup:""});
			chrome.pageAction.onClicked.addListener(function(theTab) {
				chrome.tabs.getCurrent(function(currentTab){
					if (currentTab.id == theTab.id) {
						if (window.location.hash) {
							window.location.hash += '&options=1';
						} else {
							window.location.hash = '#options=1';
						}
						window.location.reload();
					}
				});
			});
			chrome.pageAction.show(tab.id);
		});
	}
	//////// END OPTIONS ////////

	// Load text into the Address Box or Search Box if needed, and if we aren't reindexing the database
	if (localStorage.indexComplete == 1) {
		refillInputs();
	}

	// If we're reindexing the database, display the progress box
	if (localStorage.indexComplete != 1) {
		$.get("indexinginfo.html", function(response){
			$("#maindiv").after(response);
			$("#addresswrapper").css("cursor","wait");
			if (localStorage.indexedbefore == 1) {
				$("#indexinginfo b").html("Fauxbar is Reindexing");
				$("#indexinginfo span").html("Fauxbar is reindexing your history items and bookmarks.");
				$("button").prop('disabled',true).html('Please Wait...');
			}
			$("#indexinginfo").css("display","block");
			$("#awesomeinput").css("cursor","wait");
			$("#searchwrapper *").css("cursor","wait");
			setTimeout(function(){
				$("#awesomeinput").prop("disabled",true).addClass("description").val("Go to a web site");
				$("#opensearchinput").prop("disabled",true).addClass("description");
				if (localStorage.indexedbefore != 1) {
					$("#opensearchinput").val("Search");
				}
			}, 100);
		});
	}

	// Now that the Fauxbar page is pretty much loaded, load the JS files to apply custom colors to the various icons.
	// Page loads a bit slower if these are loaded first, so that's why we're loading them now.
	setTimeout(function(){
		delete processFilters;
		$("head").append('<script type="text/javascript" src="mezzoblue-PaintbrushJS-098389a/common.js"></script>');
		$("head").append('<script type="text/javascript" src="mezzoblue-PaintbrushJS-098389a/paintbrush.js"></script>');
		processFilters();
	}, 1);

});

//////////////////////////////
// Lots of functions below. //
//////////////////////////////

// Resize the holding container for the Search Box's queries/suggestions that get displayed
function resizeSearchSuggestions() {
	var resultHeight = $(".result").first().outerHeight();
	window.resultsAreScrollable = false;
	if (resultHeight > 0) {
		var maxHeight = Math.floor($(window).height() - $(".wrapper").outerHeight() - 80);
		var maxVisibleRows = Math.floor(maxHeight / resultHeight);
		var defaultMaxVisible = 10;
		if (localStorage.option_maxsuggestionsvisible) {
			if (localStorage.option_maxsuggestionsvisible < maxVisibleRows) {
				maxVisibleRows = localStorage.option_maxsuggestionsvisible;
			}
		} else if (defaultMaxVisible < maxVisibleRows) {
			maxVisibleRows = defaultMaxVisible;
		}

		var newResultsHeight = 0;
		for (var x = 0; x < maxVisibleRows; x++) {
			newResultsHeight += resultHeight;
		}
		var borderHeight = 0;
		if ($(".jsonresult").length > 0 && $(".historyresult").length > 0) {
			borderHeight = 1;
		}
		$("#opensearch_results").css("max-height", (newResultsHeight+borderHeight)+"px");
		if ($(".result").length > maxVisibleRows) {
			window.resultsAreScrollable = true;
		}
	}
	$("#opensearch_results").css("display","block").css("width", $("#searchwrapper").innerWidth() - $("#opensearch_triangle").outerWidth() - 6 +"px").css("margin-left","0px").css("margin-top","4px");
}

// Fetch and display queries/suggestions related to the user's Search Box input
function getSearchSuggestions() {
	window.mouseHasMoved = false;
	// If user has opted to show queries or suggestions...
	if ($("#opensearchinput:focus").length && (localStorage.option_showqueryhistorysuggestions == 1 || localStorage.option_showjsonsuggestions == 1)) {
		// Set up the SQL select statement for Fauxbar's `searchqueries` database table
		window.actualSearchInput = $("#opensearchinput").val();
		if (openDb()) {
			window.db.transaction(function(tx){
				var osWords = explode(" ", $("#opensearchinput").val().trim());
				var queryLikes = [];
				var statementParts = [];
				for (w in osWords) {
					if (osWords[w].length > 0) {
						queryLikes[queryLikes.length] = ' query LIKE ? ';
						statementParts[statementParts.length] = "%"+osWords[w]+"%";
					}
				}
				if (queryLikes.length == 0) {
					queryLikes[0] = ' query LIKE ? ';
					statementParts[0] = "%";
				}

				var limit = localStorage.option_maxretrievedsuggestions ? localStorage.option_maxretrievedsuggestions : 30;
				statementParts[statementParts.length] = limit;
				// Execute the SQL select statement
				tx.executeSql('SELECT DISTINCT query FROM searchqueries WHERE '+implode(" AND ",queryLikes)+' ORDER BY query ASC LIMIT ?', statementParts, function(tx, results){

					// Get the JSON OpenSearch suggestions from the selected search engine suggestion URL if possible, otherwise just default to a fake URL so we can at least continue.
					// Doing it this way so that it's more streamlined here, rather than me trying to worry about dealing with asynchronus results; I think it'd be messier. This way seems cleaner.
					var suggestUrl = $('#opensearchmenu .menuitem[shortname="'+window.openSearchShortname+'"]').attr("suggesturl");
					var actualSuggestUrl = "http://0.0.0.0/";
					if (localStorage.option_showjsonsuggestions == 1 && suggestUrl != "null" && suggestUrl != "" && suggestUrl.length > 0) {
						actualSuggestUrl = suggestUrl;
					}
					var osVal = $("#opensearchinput").val();
					// Setup the JSON URL get...
					$.getJSON(str_replace("{searchTerms}", urlencode(osVal), actualSuggestUrl)).complete(function(response){
						response = jQuery.parseJSON(response.responseText);
						var historyResults = '';
						var jsonResults = '';

						// If user has opted to show past queries, make it so
						if (localStorage.option_showqueryhistorysuggestions == 1) {
							var len = results.rows.length, i;
							if (len > 0 || $(".result").length) {
								var openResults = '';
								var entQuery = '';
								for (var i = 0; i < len; i++) {
									entQuery = str_replace('<', '&lt;', results.rows.item(i).query);
									entQuery = str_replace('>', '&gt;', entQuery);
									historyResults += '<div class="result historyresult" queryid="'+results.rows.item(i).id+'"><span class="suggestion">'+entQuery+'</span></div>\n';
								}
							}
						}

						// If we have received JSON suggestions, display them
						if (response && response[1] && response[1].length) {
							var suggestionsText = false;
							var html = "";
							for (var r in response[1]) {
								html = '<span class="suggestion">'+response[1][r]+'</span>';
								if (suggestionsText == false) {
									html = '<span style="float:right; font-size:10px;opacity:.5">Suggestions&nbsp;</span>' + html;
									suggestionsText = true;
								}
								jsonResults += '<div class="result jsonresult">'+html+'</div>\n';
							}
						}

						// Display the queries and suggestions, if any
						if (osVal == $("#opensearchinput").val()) {
							if (historyResults.length > 0 || jsonResults.length > 0) {
								$("#opensearch_results").html(historyResults+jsonResults).css("display","block");
								if (historyResults.length > 0) {
									$(".jsonresult").first().css("border-top","1px solid "+localStorage.option_separatorcolor);
								}
								resizeSearchSuggestions();
							} else {
								$("#opensearch_results").css("display","none").html("");
							}
						}
					});
				});
			}, errorHandler);
		}
	}
}

// If Address Box input is a URL that has the "Switch to tab" text as a result below it, add a faded "Switch to text" bit in front of the Address Box's input box
function toggleSwitchText() {
	var switchUrl = $(".switch").parent('.result_url').parent('.result').attr("url");
	if ($('.switch').length > 0 && $("#awesomeinput").val() == switchUrl) {
		$(".switchtext").css("font-size",$("#awesomeinput").css("font-size")).css("display","table-cell");
	} else {
		$(".switchtext").css("display","none");
	}
}

// When user presses Up, Down, Shift or Shift+Tab to navigate through Address Box results or Search Box queries/suggestions
function navigateResults(e) {
	window.mouseHasMoved = false;
	// If user has pressed Up or Down (or Shift+Tab or Shift)...
	if ((e.keyCode == 38 || e.keyCode == 40)) {
		// If some results/queries/suggestions are currently displayed...
		if ($(".result").length > 0) {
			var anotherResultExists = true;

			// Highlight the appropriate result/query/suggestion
			if (e.keyCode == 40) { // down
				if ($(".arrowed").length == 0) {
					$(".result").first().addClass("arrowed");
				}
				else if ($(".arrowed").next().length > 0) {
					$(".arrowed").removeClass("arrowed").next().addClass("arrowed");
				} else {
					anotherResultExists = false;
				}
			}
			else if (e.keyCode == 38) { // up
				if ($(".arrowed").length == 0) {
					$(".result").last().addClass("arrowed");
				} else if ($(".arrowed").prev().length > 0) {
					$(".arrowed").removeClass("arrowed").prev().addClass("arrowed");
				} else {
					anotherResultExists = false;
				}
			}

			// Scroll the results automatically if needed. Uses scrollTop() a bit; using an anchor would probably be faster...
			if (anotherResultExists == true) {
				if ($(".arrowed").position().top < 0) {
					var stopScrolling = false;
					var lastScrollPosition = null;
					// If page size has been changed via ctrl+ or ctrl-, top result position can sometimes always be < 0, so need to prevent infinite loop
					while ($(".arrowed").position().top < 0 && stopScrolling == false) {
						if ($("#awesomeinput:focus").length) {
							$("#results").scrollTop($("#results").scrollTop()-1);
						} else if ($("#opensearchinput:focus").length) {
							$("#opensearch_results").scrollTop($("#opensearch_results").scrollTop()-1);
						}
						if (lastScrollPosition && $(".arrowed").position().top == lastScrollPosition) {
							stopScrolling = true;
						}
						lastScrollPosition = $(".arrowed").position().top;
					}
				}
				else {
					if ($(".arrowed").next(".result").length == 0) {
						if ($("#awesomeinput:focus").length) {
							$("#results").scrollTop(99999);
						} else if ($("#opensearchinput:focus").length) {
							$("#opensearch_results").scrollTop(99999);
						}
					}
					else {
						if ($("#awesomeinput:focus").length) {
							var resultBottomPadding = 4; // taken from css file (.result)
							while ( ($("#results").position().top+$(".arrowed .result_bottom").position().top+resultBottomPadding) > ($("#results").position().top+$("#results").height()) ) {
								$("#results").scrollTop($("#results").scrollTop()+1);
							}
						} else if ($("#opensearchinput:focus").length) {
							var resultBottomPadding = 4; // taken from css file (.result)
							while ( ($("#opensearch_results").position().top+$(".arrowed").next(".result").position().top) > ($("#opensearch_results").position().top+$("#opensearch_results").height()) ) {
								$("#opensearch_results").scrollTop($("#opensearch_results").scrollTop()+1);
							}
						}
					}
				}

				// Update the appropriate input box with the highlighted result's URL or search query
				if ($("#awesomeinput:focus").length) {
					$("#awesomeinput").val($(".arrowed").attr("url"));
				} else if ($("#opensearchinput:focus").length) {
					$("#opensearchinput").val(html_entity_decode($(".arrowed .suggestion").text()));
				}
				return false;
			}
			else {
				if ($("#awesomeinput:focus").length) {
					$("#results").scrollTop(0);
					$("#awesomeinput").val(window.actualUserInput);
				} else if ($("#opensearchinput:focus").length) {
					$("#opensearch_results").scrollTop(0);
					$("#opensearchinput").val(window.actualSearchInput);
				}
				$(".arrowed").removeClass("arrowed");
				return false;
			}
		}
		// But if no results are displayed, display some
		else if ($("#awesomeinput").val() == "" && $("#awesomeinput:focus").length) {
			getResults(true); // get the top pages
			return false;
		}
		else if ($("#awesomeinput:focus").length) {
			getResults(); // get results based on the input box's input
			return false;
		}
	}
}

// Enter text into the Address Box or Search Box if window.location.hash has input to use.
// Handy when using Chrome's Back/Forward navigation buttons
function refillInputs() {
	if (window.location.hash == '') {
		if (localStorage.option_openfauxbarfocus && localStorage.option_openfauxbarfocus != 'chrome') {
			chrome.tabs.getCurrent(function(currentTab){
				chrome.tabs.getSelected(null, function(selectedTab){
					if (currentTab.id == selectedTab.id) {
						chrome.tabs.update(currentTab.id, {selected:true}, function(){
							window.actualUserInput = '';
							if (localStorage.option_openfauxbarfocus == 'addressbox') {
								$("#opensearchinput").val("").blur();
								$("#awesomeinput").val("").focus();
							} else if (localStorage.option_openfauxbarfocus == 'searchbox') {
								$("#awesomeinput").val("").blur();
								$("#opensearchinput").val("").focus().removeClass("description");
							}
							hideResults();
						});
					}
				});
			});
		}
	}
	else {
		// Populate Address Box
		if (getHashVar('ai')) {
			$("#awesomeinput").removeClass("description").val(getHashVar('ai'));
			window.actualUserInput = getHashVar('ai');
		}
		// Populate Search Box
		if (getHashVar('os')) {
			$("#opensearchinput").removeClass("description").val(getHashVar('os'));
		}
		// Focus/select a Box
		setTimeout(function(){
			if (getHashVar('sel')) {
				if (getHashVar('sel') == 'ai') { // "if selection == #awesomeinput/AddressBox"
					$("#opensearchinput").blur();
					$("#awesomeinput").focus().setSelection(0,$("#awesomeinput").val().length);
				} else if (getHashVar('sel') == 'os') { // "if selection == #opensearchinput/SearchBox"
					setTimeout(function(){
						$("#awesomeinput").blur();
						$("#opensearchinput").focus().setSelection(0,$("#opensearchinput").val().length);
					}, 100);
				}
			}
		}, 10);
	}
	return true;
}

// When typing in the Address Box, this function appends the input box's text with the rest of a matching URL from the results, and selects it.
// So the user could go to a whole URL by just typing the first few letters, and the rest of the URL will be auto-filled automatically for them.
function autofillInput(thisQuery) {
	if (window.lastKeyCode != 8 && window.lastKeyCode != 46 && $("#awesomeinput").getSelection().length != $('#awesomeinput').val().length) {
		var ai = $("#awesomeinput").val();
		var fru = '';
		var tu = '';
		$(".result").each(function(){
			if (fru == '') {
				tu = $(this).attr("url");
				if ('http://'+ai == tu.substr(0,('http://'+ai).length) || 'http://www.'+ai == tu.substr(0,('http://www.'+ai).length) || ai == tu.substr(0,ai.length) || 'https://'+ai == tu.substr(0,('https://'+ai).length) || 'https://www.'+ai == tu.substr(0,('https://www.'+ai).length) ) {
					fru = html_entity_decode(strip_tags($(".result_url",this).html()));
					$(this).addClass("autofillmatch");
				}
			}
		});

		if (fru != '') {
			var newVal = ai + explode(ai, fru, 2)[1];
			if (substr_count(newVal, '/') == 1 && newVal.substr(newVal.length-1) == '/' && $("#awesomeinput").val().substr(-1) != '/') {
				newVal = newVal.substr(0, newVal.length-1);
			}
			//if (thisQuery == window.actualUserInput || !thisQuery) {
				if ($("#awesomeinput").getSelection().length == 0) {
					if (!localStorage.option_autofillurl || localStorage.option_autofillurl == 1) {
						$("#awesomeinput").val(newVal).setSelection(ai.length, $("#awesomeinput").val().length);
					}
				}
			//}
		}
	}
}

// Retrieves the value of the Address Box's input, excluding any selected text. Basically gets what the user has typed, and not what has also been automatically auto-filled for them.
function getAiSansSelected() {
	var aiValLength = $("#awesomeinput").val().length;
	if (aiValLength > 0 && $("#awesomeinput").getSelection().length == aiValLength) {
		return $("#awesomeinput").val();
	} else {
		return $("#awesomeinput").val().substr(0, $("#awesomeinput").val().length - $("#awesomeinput").getSelection().length);
	}
}

// Get the user's Address Box input, search Fauxbar's database for matching history items and bookmarks, display the results, and auto-fill the Address Box input with a matching URL.
function getResults(noQuery) {
	// If the Search Box is focused and something is trying to get results from the Address Box's input text, don't let it happen, since the user is focusing the Search Box.
	if ($("#opensearchinput:focus").length == 1 && !noQuery){
		return false;
	}

	// Get an array of tabs in the current Chrome window, so we can examine them soon to see if we need to use the "Switch to tab" text/functionality anywhere
	chrome.tabs.getAllInWindow(null, function(tabs){
		window.currentTabs = tabs;
	});

	// As we are getting new results, remove any indiction from any existing result URLs that have been used to auto-fill the Address Box's input for the user.
	$(".autofillmatch").removeClass("autofillmatch");

	// Define what the user has actually typed
	if ($("#awesomeinput").val() != "Go to a web site") {
		window.actualUserInput = getAiSansSelected();
	}
	var thisQuery = window.actualUserInput;

	// If the user has entered text into the Address Box, or if the user is just getting the top results...
	if ( ($("#awesomeinput").length > 0 && $("#awesomeinput").val().length > 0 && $("#awesomeinput").val() != "Go to a web site") || noQuery ) {

		// If results exist right now, auto-fill the Address Box's input with a matching URL if possible
		if ($(".result").length > 0) {
			autofillInput();
		}

		// Get ready for the results
		window.sortedHistoryItems = {};

		if (openDb()) {
			window.db.transaction(function (tx) {

				// If Address Box input exists, sort out how the SQL select statement should be crafted
				if (!noQuery) {
					var words = explode(" ", getAiSansSelected());
					var urltitleWords = new Array();
					var urltitleQMarks = new Array();
					var modifiers = '';

					for (var w in words) {
						if (words[w] != "") {
							if (words[w].toLowerCase() == 'is:fav') {
								modifiers += ' AND type = 2 ';
							}
							else {
								urltitleWords[urltitleWords.length] = '%'+str_replace("_","¸_",str_replace("%","¸%",words[w]))+'%';
								urltitleQMarks[urltitleQMarks.length] = ' urltitle like ? escape "¸" ';
							}
						}
					}
				}

				// If actual words exist in the Address Box's input (or if we're getting just getting the top results)...
				if (noQuery || urltitleWords.length > 0 || modifiers != "") {
					// Specify for the SQL statement if we're to be getting history items and/or bookmarks
					var typeOptions = ['type = -1'];
					if (localStorage.option_showmatchinghistoryitems && localStorage.option_showmatchinghistoryitems == 1) {
						typeOptions[typeOptions.length] = ' type = 1 ';
					}
					if (localStorage.option_showmatchingfavs && localStorage.option_showmatchingfavs == 1) {
						typeOptions[typeOptions.length] = ' type = 2 ';
					}
					typeOptions = implode(" OR ", typeOptions);

					// Specify the max amount of results to get
					if (noQuery) {
						var resultLimit = 12;
					} else {
						var resultLimit = localStorage.option_maxaddressboxresults ? localStorage.option_maxaddressboxresults : 12;
					}
					resultLimit = resultLimit * 2;

					// Define Fauxbar's URL, so that results from that don't get displayed. No need to display a link to Fauxbar when you're already using Fauxbar.
					var fauxbarUrl = chrome.extension.getURL("fauxbar.html%");

					// Ignore titleless results if user has opted. But still keep proper files like .js, .php, .pdf, .json, .html, etc.
					var titleless = localStorage.option_ignoretitleless == 1 ? ' AND (title != "" OR url LIKE "%.__" OR url LIKE "%.___" OR url LIKE "%.____") ' : "";

					// And now to create the statement.
					// If we're just getting the top sites...
					if (noQuery) {
						var selectStatement = 'SELECT * FROM urls WHERE ('+typeOptions+') AND queuedfordeletion = 0 AND url NOT LIKE "'+fauxbarUrl+'" AND url NOT LIKE "data:%" '+titleless+' ORDER BY frecency DESC, type ASC LIMIT '+resultLimit;
					}
					// If we're searching using the words from the Address Box's input...
					else if (urltitleWords.length > 0) {
						var selectStatement = 'SELECT *, (url||" "||title) AS urltitle FROM urls WHERE ('+typeOptions+') AND queuedfordeletion = 0 '+modifiers+' AND '+implode(" and ", urltitleQMarks)+' AND url NOT LIKE "'+fauxbarUrl+'" AND url NOT LIKE "data:%" '+titleless+' ORDER BY frecency DESC, type ASC LIMIT '+resultLimit;
					}
					// Not sure if this actually ever gets used.
					else {
						var selectStatement = 'SELECT * FROM urls WHERE ('+typeOptions+') AND queuedfordeletion = 0 '+modifiers+' AND url NOT LIKE "'+fauxbarUrl+'" AND url NOT LIKE "data:%" '+titleless+' ORDER BY frecency DESC, type ASC LIMIT '+resultLimit;
					}

					// If the user's computer is lagging and taking a while to retrieve the results, display a loading on the left side of the Address Box
					window.waitingForResults = true;
					window.fetchResultStartTime = microtime(true);
					setTimeout(function(){
						if (window.waitingForResults == true && microtime(true) - window.fetchResultStartTime > 1 && $("#awesomeinput:focus").length == 1 && $("#awesomeinput").getSelection().length != $("#awesomeinput").val().length) {
							$("#addressbaricon").attr("src","chrome://resources/images/throbber.svg");
						} else {
							$("#addressbaricon").attr("src","chrome://favicon/null");
						}
					}, 1000);

					// If, in the time it's taken to do the above, the user has entered new input that does not match what we're about to search for, cancel.
					// The new call of getResults() that's most likely occurred will take priority over this one.
					if (thisQuery != window.actualUserInput || !noQuery && $(".glow").length == 1) {
						if (localStorage.option_timing == "delayed") {
							return false;
						}
					}

					// Get the results from Fauxbar's database
					tx.executeSql(selectStatement, urltitleWords, function (tx, results) {
						window.waitingForResults = false;
						var len = results.rows.length, i;

						// If there's no matching results that have been returned, cancel.
						if (len == 0) {
							hideResults();
							return false;
						}
						var newItem = {};
						// Create each returned row into a new object
						for (var i = 0; i < len; i++) {
							newItem = {};
							newItem.url = results.rows.item(i).url;
							newItem.title = results.rows.item(i).title;
							newItem.id = results.rows.item(i).id;
							if (results.rows.item(i).type == 2) {
								newItem.isBookmark = true;
							}
							window.sortedHistoryItems[i] = newItem;
						}

						var maxRows = resultLimit / 2;
						var currentRows = 0;

						if ($(".arrowed").length == 1) {
							window.arrowedNumber = $(".arrowed").attr("number");
						}

						// If entered input has changed, or user is now longer looking for their top sites, cancel.
						if (thisQuery != window.actualUserInput || !noQuery && $(".glow").length == 1) {
							if (localStorage.option_timing == "delayed") {
								return false;
							}
						}

						// If user has navigated to a result, or scrolled #results, stop - don't display anything more.
						if (window.userHasNewInput == false && (($(".arrowed").length == 1 && window.actualUserInput.length > 0) || $("#results").scrollTop() != 0) ) {
							return false;
						}

						// As we're close to showing the new results, hide any currently shown results.
						hideResults();

						// Getting ready to make matching words appear bold/underlined
						var text = getAiSansSelected();

						// The ¸ cedilla character will largely act as a special/unique character for our bold/underline character replacement method below, so make it be a space if user happens to use it (sorry to anyone who actually uses it!)
						text = str_replace("¸", " ", text); // cedilla

						// Replace other special characters with their HTML equivalents (or is it the other way around...?)
						text = replaceSpecialChars(text);

						var resultHtml = "";

						var titleText = "";
						var urlText = "";
						var urlTextAttr = "";
						var regEx = "";
						var matchClasses = "";
						var spanOpen = "";
						var spanClose = "";
						var hI = "";
						var resultIsOkay = true;
						var arrowedClass = '';
						var urlExplode = '';

						// Another chance to cancel... don't want to waste processing time!
						if (thisQuery != window.actualUserInput || !noQuery && $(".glow").length == 1) {
							if (localStorage.option_timing == "delayed") {
								return false;
							}
						}

						// For each history item and bookmark we've retrieved that matches the user's text...
						for (var ii in window.sortedHistoryItems) {
							if (currentRows < maxRows) {
								hI = window.sortedHistoryItems[ii];
								resultIsOkay = true;

								// When searching the database, Fauxbar returns both history and bookmarks. History items come first.
								// If this is a bookmark result, add a bookmark icon to the existing history result.
								// Then, cancel continuing on with this result.
								if ($('.result[url="'+hI.url+'"]').length > 0 && $('.result[url="'+hI.url+'"] img.favstar').length == 0) {
									if (!strstr(getAiSansSelected().toLowerCase(), "is:fav")) {
										if (hI.isBookmark && !noQuery) { // bookmark
											$('.result_title[url="'+hI.url+'"]').html('<img class="result_favicon" src="chrome://favicon/'+hI.url+'" />'+titleText);
											$('.result[url="'+hI.url+'"]').prepend('<img class="favstar" />');
										}
										resultIsOkay = false;
									}
								}

								if (resultIsOkay == true) {

									// Get each word the user has entered
									if (!noQuery) {
										words = explode(" ", text);
									}

									// Sort words from longest length to shortest
									if (words) {
										words.sort(compareStringLengths);
									}

									// If result is titleless, make its URL be the title
									if (hI.title == "") {
										urlExplode = explode("/", hI.url);
										titleText = urldecode(urlExplode[urlExplode.length-1]);
										if (titleText.length == 0) {
											titleText = urldecode(hI.url);
										}
									} else {
										titleText = hI.title;
									}
									//titleText = hI.title == "" ? hI.url : hI.title;
									urlText = urldecode(hI.url);

									// Remove "http://" from the beginning of URL if user has opted for it in the Options
									if (urlText.substring(0,7) == 'http://' && localStorage.option_hidehttp && localStorage.option_hidehttp == 1) {
										urlText = urlText.substr(7);
										if (substr_count(urlText, '/') == 1 && urlText.substr(urlText.length-1) == '/') {
											urlText = urlText.substr(0, urlText.length-1);
										}
									}

									// Replace special characters with a bunch of % symbols
									titleText = replaceSpecialChars(titleText);
									urlText = replaceSpecialChars(urlText);

									// Wrap each word with some funky characters
									for (var iii in words) {
										if (words[iii] != "") {
											regEx = new RegExp(words[iii], 'gi');
											titleText = titleText.replace(regEx, '¸%%%%%¸$&¸%%%%¸');
											urlText = urlText.replace(regEx, '¸%%%%%¸$&¸%%%%¸');
										}
									}

									// Replace those funky percent symbols back to normal.
									// This is all in an effort to make RegExp work, so that the user can use full character searching :)
									titleText = replacePercents(titleText);
									urlText = replacePercents(urlText);

									// Prep the CSS classes to uses
									matchClasses = " match ";
									if (localStorage.option_underline && localStorage.option_underline == 1) {
										matchClasses += " underline ";
									}
									if (localStorage.option_bold && localStorage.option_bold == 1) {
										matchClasses += " bold ";
									}

									spanOpen = '<span class="'+matchClasses+'">';
									spanClose = '</span>';

									// Replace the last percent symbols with their original texts
									titleText = str_replace("¸%%%%%¸", spanOpen, titleText);
									titleText = str_replace("¸%%%%¸", spanClose, titleText);
									urlText = str_replace("¸%%%%%¸", spanOpen, urlText);
									urlText = str_replace("¸%%%%¸", spanClose, urlText);

									titleText = str_replace('&', '&amp;', titleText);
									urlText = str_replace('&', '&amp;', urlText);

									titleText = str_replace(spanOpen, "¸%%%%%¸", titleText);
									titleText = str_replace(spanClose, "¸%%%%¸", titleText);
									urlText = str_replace(spanOpen, "¸%%%%%¸", urlText);
									urlText = str_replace(spanClose, "¸%%%%¸", urlText);

									titleText = str_replace(">", "&gt;", titleText);
									titleText = str_replace("<", "&lt;", titleText);

									urlText = str_replace(">", "&gt;", urlText);
									urlText = str_replace("<", "&lt;", urlText);

									titleText = str_replace("¸%%%%%¸", spanOpen, titleText);
									titleText = str_replace("¸%%%%¸", spanClose, titleText);
									urlText = str_replace("¸%%%%%¸", spanOpen, urlText);
									urlText = str_replace("¸%%%%¸", spanClose, urlText);

									// Make the URL display the "Switch to tab" text if tab is already open in current window
									urlTextAttr = urlText;
									for (var ct in window.currentTabs) {
										if (currentTabs[ct].url == hI.url) {
											urlText = '<img src="tabicon.png" style="opacity:.6" /> <span class="switch">Switch to tab</span>';
										}
									}

									// Render the result's HTML
									if (resultIsOkay == true) {
										resultHtml = "";
										arrowedClass = '';
										/*if (window.arrowedNumber && window.arrowedNumber == currentRows+1) {
											arrowedClass = " arrowed ";
										}*/
										resultHtml += '<a class="result '+arrowedClass+'" url="'+hI.url+'" href="'+hI.url+'" number="'+(currentRows+1)+'" onclick="return window.clickResult(this)" bmid="'+hI.id+'">';
										if (hI.isBookmark) { // bookmark
											resultHtml += '<img class="favstar" />';
										}
										resultHtml += '	';
										resultHtml += '	<div class="result_title" url="'+hI.url+'"><img class="result_favicon" src="chrome://favicon/'+hI.url+'" />'+ titleText+'</div><br />';
										resultHtml += '	<div class="result_url">'+urlText+'</div>';
										resultHtml += ' <div class="visitinfo" id="hi_'+hI.id+'" url="'+hI.url+'"></div>';
										resultHtml += ' <div class="result_url_hidden">'+urlTextAttr+'</div>';
										resultHtml += ' <div class="result_bottom" height="1px"></div>';
										resultHtml += '</a>\r\n';

										if (!noQuery && $("#awesomeinput").getSelection().length == $("#awesomeinput").val().length) {
											if (!window.navigating) {
												return false;
											}
										}

										$("#results").append(resultHtml);
										autofillInput(thisQuery);
										currentRows++;
									}
								}
							}
						}
						delete window.navigating;

						// Remove the Address Box's loading icon
						window.fetchResultStartTime = microtime(true);
						$("#addressbaricon").attr("src","chrome://favicon/null");

						// If there's no results, hide any existing ones.
						if ($("#results").html() == "") {
							hideResults();
						}
						// Otherwise, display the results!
						else {

							// However, if Fauxbar has told Chrome to go to a URL just now, don't get results for the moment
							if (window.goingToUrl) {
								setTimeout(function(){
									delete window.goingToUrl;
								}, 200);
								return false;
							}

							// If user has deleted their query, hide and return.
							if (window.actualUserInput == "" && !noQuery) {
								hideResults();
								return;
							}

							// Display results.
							$("#results").css("display","block").css("opacity",0).css("width", $("#addresswrapper").outerWidth()-2+"px").css("margin-top","4px").css("margin-left","-4px");

							// "Truncate" result titles and urls with "..." if they're too long.
							// This is kind of dodgy because it's just creating a <span> containing "..." on top of the right side of the results.
							// Might be better to actually truncate, though it would be slower.
							window.cutoff = 70;
							if (window.resultsAreScrollable == false) {
								window.cutoff = window.cutoff - getScrollBarWidth();
							}

							$(".result_url").each(function(){
								if ($(this).innerWidth() > $("#results").innerWidth() - window.cutoff) {
									$(this).css("width", ($("#results").innerWidth()-window.cutoff) + "px").prepend('<span class="dotdotdot">...</span>');
								}
							});
							$(".result_title").each(function(){
								if ($(this).innerWidth() > $("#results").innerWidth() - window.cutoff+21) {
									$(this).css("width", ($("#results").innerWidth()-window.cutoff+21) + "px").prepend('<span class="dotdotdot">...</span>');
								}
							});

							// Resize height of #results so no results get uglily cut in half
							var resultHeight = $(".result").first().outerHeight();
							window.resultsAreScrollable = false;
							if (resultHeight > 0) {
								var maxHeight = Math.floor($(window).height() - $(".wrapper").outerHeight() - 80);
								var maxVisibleRows = Math.floor(maxHeight / resultHeight);
								var defaultMaxVisible = 8;
								if (noQuery) {
									maxVisibleRows = 12;
								} else if (localStorage.option_maxaddressboxresultsshown) {
									if (localStorage.option_maxaddressboxresultsshown < maxVisibleRows) {
										maxVisibleRows = localStorage.option_maxaddressboxresultsshown;
									}
								} else if (defaultMaxVisible < maxVisibleRows) {
									maxVisibleRows = defaultMaxVisible;
								}

								var newResultsHeight = 0;
								for (x = 0; x < maxVisibleRows; x++) {
									newResultsHeight += resultHeight;
								}
								$("#results").css("max-height", (newResultsHeight-1)+"px");
								if ($(".result").length > maxVisibleRows) {
									window.resultsAreScrollable = true;
								}
							}

							// Show the results
							$(".result").last().css("border-bottom",0);
							$(".favstar").attr("src", $("#fauxstar").attr("src"));
							toggleSwitchText();
							window.mouseHasMoved = false;

							if (thisQuery.length > 1 || thisQuery == window.actualUserInput || !noQuery && $(".glow").length == 1) {
								$("#results").attr("noquery",(noQuery?1:0)).css("opacity",1);
							}

							// Auto append Address Box input with a best-guess URL.
							// But won't autofill if user pressed backspace, delete, or if user has selected with ctrl+a
							autofillInput(thisQuery);

							///////////////////////////////////////////////////////
							// commenting out but DON'T DELETE.
							// the code below shows which type of page transition Chrome has attached to each site's history visit.
							// see getTransitions() function below for more info

							/*window.infoDivs = new Array();
							$("div.visitinfo").each(function(i,el){
								window.infoDivs[window.infoDivs.length] = el;
							});
							window.infoDivs.reverse();
							getTransitions();*/

							///////////////////////////////////////////////////////
						}
					}, errorHandler);
				}
			}, errorHandler);
		}
	}
	else {
		hideResults();
	}
}

// getTransitions() is good for debugging/finding history items that were usually accssed as an auto_subframe (ads, social media iframes).
// however, some legit things use auto_subframe (I think), like Google Instant searching (or maybe not). so best to just leave them all in.
// could build in an option later on filter out auto_subframe results, but probably more trouble than its worth.

// UPDATE: wait, maybe it is only ads?
// and strangely, when using chrome.history.search() to get every history item (empty search query), auto_subframe results are not returned. Nevermind...
function getTransitions() {
	if (window.infoDivs.length > 0) {
		chrome.history.getVisits({url:$(window.infoDivs[window.infoDivs.length-1]).attr("url")}, function(visits){
			for (var v in visits) {
				$(window.infoDivs[window.infoDivs.length-1]).append(visits[v].transition + " ");
			}
			window.infoDivs.pop();
			getTransitions();
		});
	}
}
function revealTransitions(div) {
	window.currentDiv = div;
	chrome.history.getVisits({url:$(div).attr("url")}, function(visits){
		var transitions = "";
		for (var v in visits) {
			transitions += visits[v].transition+" ";
		}
		$('div.visitinfo[url="'+$(window.currentDiv).attr("url")+'"]').html(transitions);
	});
}

// Hide the Address Box's currently displayed results.
function hideResults() {
	if ($(".result").length > 0) {
		$(".glow").removeClass("glow");
	}
	$("#results").css("display","none").html("");
}

// Update the tab's hash value with what's currently in the Address and Search Boxes, so that the input can be restored if the user navigates pages back/forth.
function updateHash() {
	var ai = $("#awesomeinput").hasClass("description") ? 'ai=' : 'ai='+urlencode($("#awesomeinput").val());
	var os = $("#opensearchinput").hasClass("description") ? '&os=' : '&os='+urlencode($("#opensearchinput").val());
	var sel = '&sel=';
	var options = "";
	if ($("#awesomeinput:focus").length) {
		sel += 'ai';
	} else if ($("#opensearchinput:focus").length) {
		sel += 'os';
	}
	if (getHashVar("options") == 1) {
		options = "&options=1";
	}
	var hash = '#'+ai+os+sel+options;
	if (hash != window.location.hash) {
		window.location.hash = hash;
	}
	return true;
}

// Tell the tab to go to a URL.
function goToUrl(url, fromClickedResult) {
	url = url.trim();
	if ($('.result[href="'+url+'"] .result_url .switch').length > 0) {
		chrome.tabs.getAllInWindow(null, function(tabs){
			for (var t in tabs) {
				if (tabs[t].url == url) {
					chrome.tabs.update(tabs[t].id, {selected:true});

					// close tab if the tab just had Fauxbar open to switch to find a tab to switch to
					if (history.length == 1) {
						chrome.tabs.getCurrent(function(tab){
							chrome.tabs.remove(tab.id);
						});
					}
					updateHash();
					return false;
				}
			}
		});
		return false;
	}

	if (fromClickedResult) {
		$("#awesomeinput").focus();
		return true;
	}

	var urlIsValid = false;
	if (substr_count(url, " ") == 0) {
		var testUrl = url.toLowerCase();
		if (testUrl.substr(0,7) != 'http://' && testUrl.substr(0,8) != 'https://' && testUrl.substr(0,6) != 'ftp://' && testUrl.substr(0,8) != 'file:///' && testUrl.substr(0,9) != 'chrome://' && testUrl.substr(0,6) != 'about:' && testUrl.substr(0,12) != 'view-source:' && testUrl.substr(0,17) != 'chrome-extension:' && testUrl.substr(0,5) != 'data:') {
			if (substr_count(url, ".") == 0) {
				// it's a search!
			}
			else {
				if ($("#awesomeinput").getSelection().length > 0 && $(".autofillmatch").length == 1 && strstr($(".autofillmatch").attr("url"), url)) {
					url = $(".autofillmatch").attr("url");
				}
				else {
					url = 'http://'+url;
				}
				urlIsValid = true;
			}
		} else {
			urlIsValid = true;
		}
	}

	if (!urlIsValid) {
		if (localStorage.option_fallbacksearchurl && localStorage.option_fallbacksearchurl.length && strstr(localStorage.option_fallbacksearchurl, "{searchTerms}")) {
			url = str_replace("{searchTerms}", urlencode(url), localStorage.option_fallbacksearchurl);
		} else {
			url = 'http://www.google.com/search?btnI=&q='+urlencode(url);
		}
	}

	if (!window.altReturn) {
		$("#awesomeinput").change();
		hideResults();
		updateHash();
	}
	window.goingToUrl = url;

	if (window.altReturn) {
		delete window.altReturn;
		var selected = true;
		if (window.middleMouse && window.middleMouse == 1) {
			selected = false;
			delete window.middleMouse;
		}
		chrome.tabs.create({url:url, selected:selected});
	} else {
		chrome.tabs.getCurrent(function(tab){
			chrome.tabs.update(tab.id, {url:url});
		});
	}
}





// Below are a lot of copied/pasted functions from other sources.
// If your code is listed below, thank you!

/////////////////////////////////////

// http://www.javascripter.net/faq/hextorgb.htm
function hexToR(h) { return parseInt((cutHex(h)).substring(0,2),16) }
function hexToG(h) { return parseInt((cutHex(h)).substring(2,4),16) }
function hexToB(h) { return parseInt((cutHex(h)).substring(4,6),16) }
function cutHex(h) { return (h.charAt(0)=="#") ? h.substring(1,7) : h}



// http://stackoverflow.com/questions/934012/get-image-data-in-javascript
function getBase64Image(img, jpgQualityDecimal) {
	if (!jpgQualityDecimal) {
		jpgQualityDecimal = .7;
	}
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to guess the
    // original format, but be aware the using "image/jpg" will re-encode the image.
   // var dataURL = canvas.toDataURL("image/png");
    var dataURL = canvas.toDataURL("image/jpeg", jpgQualityDecimal);

    //return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    return dataURL;
}

// http://www.somacon.com/p355.php
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,"");
}

// http://phpjs.org/functions/get_html_translation_table:416
function get_html_translation_table (table, quote_style) {
    // *     example 1: get_html_translation_table('HTML_SPECIALCHARS');
    // *     returns 1: {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}
    var entities = {},
        hash_map = {},
        decimal = 0,
        symbol = '';
    var constMappingTable = {},
        constMappingQuoteStyle = {};
    var useTable = {},
        useQuoteStyle = {};

    // Translate arguments
    constMappingTable[0] = 'HTML_SPECIALCHARS';
    constMappingTable[1] = 'HTML_ENTITIES';
    constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
    constMappingQuoteStyle[2] = 'ENT_COMPAT';
    constMappingQuoteStyle[3] = 'ENT_QUOTES';

    useTable = !isNaN(table) ? constMappingTable[table] : table ? table.toUpperCase() : 'HTML_SPECIALCHARS';
    useQuoteStyle = !isNaN(quote_style) ? constMappingQuoteStyle[quote_style] : quote_style ? quote_style.toUpperCase() : 'ENT_COMPAT';

    if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES') {
        throw new Error("Table: " + useTable + ' not supported');
        // return false;
    }

    entities['38'] = '&amp;';
    if (useTable === 'HTML_ENTITIES') {
        entities['160'] = '&nbsp;';
        entities['161'] = '&iexcl;';
        entities['162'] = '&cent;';
        entities['163'] = '&pound;';
        entities['164'] = '&curren;';
        entities['165'] = '&yen;';
        entities['166'] = '&brvbar;';
        entities['167'] = '&sect;';
        entities['168'] = '&uml;';
        entities['169'] = '&copy;';
        entities['170'] = '&ordf;';
        entities['171'] = '&laquo;';
        entities['172'] = '&not;';
        entities['173'] = '&shy;';
        entities['174'] = '&reg;';
        entities['175'] = '&macr;';
        entities['176'] = '&deg;';
        entities['177'] = '&plusmn;';
        entities['178'] = '&sup2;';
        entities['179'] = '&sup3;';
        entities['180'] = '&acute;';
        entities['181'] = '&micro;';
        entities['182'] = '&para;';
        entities['183'] = '&middot;';
        entities['184'] = '&cedil;';
        entities['185'] = '&sup1;';
        entities['186'] = '&ordm;';
        entities['187'] = '&raquo;';
        entities['188'] = '&frac14;';
        entities['189'] = '&frac12;';
        entities['190'] = '&frac34;';
        entities['191'] = '&iquest;';
        entities['192'] = '&Agrave;';
        entities['193'] = '&Aacute;';
        entities['194'] = '&Acirc;';
        entities['195'] = '&Atilde;';
        entities['196'] = '&Auml;';
        entities['197'] = '&Aring;';
        entities['198'] = '&AElig;';
        entities['199'] = '&Ccedil;';
        entities['200'] = '&Egrave;';
        entities['201'] = '&Eacute;';
        entities['202'] = '&Ecirc;';
        entities['203'] = '&Euml;';
        entities['204'] = '&Igrave;';
        entities['205'] = '&Iacute;';
        entities['206'] = '&Icirc;';
        entities['207'] = '&Iuml;';
        entities['208'] = '&ETH;';
        entities['209'] = '&Ntilde;';
        entities['210'] = '&Ograve;';
        entities['211'] = '&Oacute;';
        entities['212'] = '&Ocirc;';
        entities['213'] = '&Otilde;';
        entities['214'] = '&Ouml;';
        entities['215'] = '&times;';
        entities['216'] = '&Oslash;';
        entities['217'] = '&Ugrave;';
        entities['218'] = '&Uacute;';
        entities['219'] = '&Ucirc;';
        entities['220'] = '&Uuml;';
        entities['221'] = '&Yacute;';
        entities['222'] = '&THORN;';
        entities['223'] = '&szlig;';
        entities['224'] = '&agrave;';
        entities['225'] = '&aacute;';
        entities['226'] = '&acirc;';
        entities['227'] = '&atilde;';
        entities['228'] = '&auml;';
        entities['229'] = '&aring;';
        entities['230'] = '&aelig;';
        entities['231'] = '&ccedil;';
        entities['232'] = '&egrave;';
        entities['233'] = '&eacute;';
        entities['234'] = '&ecirc;';
        entities['235'] = '&euml;';
        entities['236'] = '&igrave;';
        entities['237'] = '&iacute;';
        entities['238'] = '&icirc;';
        entities['239'] = '&iuml;';
        entities['240'] = '&eth;';
        entities['241'] = '&ntilde;';
        entities['242'] = '&ograve;';
        entities['243'] = '&oacute;';
        entities['244'] = '&ocirc;';
        entities['245'] = '&otilde;';
        entities['246'] = '&ouml;';
        entities['247'] = '&divide;';
        entities['248'] = '&oslash;';
        entities['249'] = '&ugrave;';
        entities['250'] = '&uacute;';
        entities['251'] = '&ucirc;';
        entities['252'] = '&uuml;';
        entities['253'] = '&yacute;';
        entities['254'] = '&thorn;';
        entities['255'] = '&yuml;';
    }

    if (useQuoteStyle !== 'ENT_NOQUOTES') {
        entities['34'] = '&quot;';
    }
    if (useQuoteStyle === 'ENT_QUOTES') {
        entities['39'] = '&#39;';
    }
    entities['60'] = '&lt;';
    entities['62'] = '&gt;';


    // ascii decimals to real symbols
    for (decimal in entities) {
        symbol = String.fromCharCode(decimal);
        hash_map[symbol] = entities[decimal];
    }

    return hash_map;
}

// http://phpjs.org/functions/html_entity_decode:424
function html_entity_decode (string, quote_style) {
    // *     example 1: html_entity_decode('Kevin &amp; van Zonneveld');
    // *     returns 1: 'Kevin & van Zonneveld'
    // *     example 2: html_entity_decode('&amp;lt;');
    // *     returns 2: '&lt;'
    var hash_map = {},
        symbol = '',
        tmp_str = '',
        entity = '';
    tmp_str = string.toString();

    if (false === (hash_map = this.get_html_translation_table('HTML_ENTITIES', quote_style))) {
        return false;
    }

    // fix &amp; problem
    // http://phpjs.org/functions/get_html_translation_table:416#comment_97660
    delete(hash_map['&']);
    hash_map['&'] = '&amp;';

    for (symbol in hash_map) {
        entity = hash_map[symbol];
        tmp_str = tmp_str.split(entity).join(symbol);
    }
    tmp_str = tmp_str.split('&#039;').join("'");

    return tmp_str;
}


// http://phpjs.org/functions/strip_tags:535
function strip_tags (input, allowed) {
    // *     example 1: strip_tags('<p>Kevin</p> <br /><b>van</b> <i>Zonneveld</i>', '<i><b>');
    // *     returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
    // *     example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>');
    // *     returns 2: '<p>Kevin van Zonneveld</p>'
    // *     example 3: strip_tags("<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>", "<a>");
    // *     returns 3: '<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>'
    // *     example 4: strip_tags('1 < 5 5 > 1');
    // *     returns 4: '1 < 5 5 > 1'
    // *     example 5: strip_tags('1 <br/> 1');
    // *     returns 5: '1  1'
    // *     example 6: strip_tags('1 <br/> 1', '<br>');
    // *     returns 6: '1  1'
    // *     example 7: strip_tags('1 <br/> 1', '<br><br/>');
    // *     returns 7: '1 <br/> 1'
    allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
}


// http://stackoverflow.com/questions/986937/javascript-get-the-browsers-scrollbar-sizes
function getScrollBarWidth () {
  var inner = document.createElement('p');
  inner.style.width = "100%";
  inner.style.height = "200px";

  var outer = document.createElement('div');
  outer.style.position = "absolute";
  outer.style.top = "0px";
  outer.style.left = "0px";
  outer.style.visibility = "hidden";
  outer.style.width = "200px";
  outer.style.height = "150px";
  outer.style.overflow = "hidden";
  outer.appendChild (inner);

  document.body.appendChild (outer);
  var w1 = inner.offsetWidth;
  outer.style.overflow = 'scroll';
  var w2 = inner.offsetWidth;
  if (w1 == w2) w2 = outer.clientWidth;

  document.body.removeChild (outer);

  return (w1 - w2);
};


// http://www.latentmotion.com/how-to-sort-an-associative-array-object-in-javascript/
function sortObj(arr){
	// Setup Arrays
	var sortedKeys = new Array();
	var sortedObj = {};

	// Separate keys and sort them
	for (var i in arr){
		sortedKeys.push(i);
	}
	sortedKeys.sort(function(a,b){return a-b});

	// Reconstruct sorted obj based on keys
	for (var i in sortedKeys){
		sortedObj[sortedKeys[i]] = arr[sortedKeys[i]];
	}
	return sortedObj;
}

String.prototype.filename= function(){
	var p1 = this.split("?")[0];
	var p2 = p1.split("/");
	var filename = p2[p2.length-1];
	filename = filename.split("#")[0];
	return filename;
}