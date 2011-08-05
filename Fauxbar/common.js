// This file contains functions that are used by both the main Fauxbar page and its background page. //

// http://stackoverflow.com/questions/4155032/operating-system-detection-by-java-or-javascript/4155078#4155078
window.OS = "Unknown";
if (navigator.appVersion.indexOf("Win")!=-1) window.OS="Windows";
if (navigator.appVersion.indexOf("Mac")!=-1) window.OS="Mac";
if (navigator.appVersion.indexOf("X11")!=-1) window.OS="UNIX";
if (navigator.appVersion.indexOf("Linux")!=-1) window.OS="Linux";

if (window.OS == "Mac") {
	$(document).ready(function(){
		$("head").append('<link href="fauxbar-mac.css" media="screen" rel="stylesheet" type="text/css" />');
	});
}

// http://phpjs.org/functions/microtime:472
function microtime (get_as_float) {
	// *     example 1: timeStamp = microtime(true);
	// *     results 1: timeStamp > 1000000000 && timeStamp < 2000000000
	var now = new Date().getTime() / 1000;
	var s = parseInt(now, 10);

	return (get_as_float) ? now : (Math.round((now - s) * 1000) / 1000) + ' ' + s;
}

// Hide the Options container/page
function closeOptions() {
	var hash = window.location.hash;
	hash = str_replace("&options=1","",hash);
	hash = str_replace("options=1&","",hash);
	hash = str_replace("options=1","",hash);
	if (hash == '#') {
		window.location.hash = '';
	} else {
		window.location.hash = hash;
	}
	window.location.reload();
}

// Populate the Options' Management page with database table stats
function loadDatabaseStats() {
	if (openDb()) {
		window.db.readTransaction(function(tx){
			tx.executeSql('SELECT count(distinct url) as historyitems FROM urls WHERE type = 1 AND queuedfordeletion = 0', [], function(tx, results){
				$("#stats_historyitems").html(number_format(results.rows.item(0).historyitems));
				if (results.rows.item(0).historyitems == 1) {
					$("#itemsplural").html('item');
				}
			});
			tx.executeSql('SELECT count(url) as bookmarks FROM urls WHERE type = 2', [], function(tx, results){
				$("#stats_bookmarks").html(number_format(results.rows.item(0).bookmarks));
				if (results.rows.item(0).bookmarks == 1) {
					$("#bookmarksplural").html('bookmark');
				}
			});
			tx.executeSql('SELECT count(*) as searchengines FROM opensearches', [], function(tx, results){
				$("#stats_searchengines").html(number_format(results.rows.item(0).searchengines));
				if (results.rows.item(0).searchengines == 1) {
					$("#enginesplural").html('engine');
				}
			});
			tx.executeSql('SELECT count(distinct query) as searchqueries FROM searchqueries', [], function(tx, results){
				$("#stats_searchqueries").html(number_format(results.rows.item(0).searchqueries));
				if (results.rows.item(0).searchqueries == 1) {
					$("#queriesplural").html('query');
				} else {
					$("#queriesplural").html('queries');
				}
			});
		}, function(t){
			errorHandler(t, getLineInfo());
		});
	}
}

// Set localStorage vars with default Fauxbar values.
// Used when first loading Fauxbar, or when user chooses to reset all the values.
function resetOptions() {
	localStorage.option_alert = 1; 							// Show a message when there's a database error.
	localStorage.option_altd = 1; 							// Use Alt+D functionality.
	localStorage.option_autofillurl = 1; 					// Auto-fill the Address Box's input with a matching URL when typing.
	localStorage.option_bgcolor = "#F0F0F0"; 				// Page background color.
	localStorage.option_bgimg = ""; 						// Page background image.
	localStorage.option_bgpos = "center"; 					// Page background image position.
	localStorage.option_bgrepeat = "no-repeat"; 			// Page background image repeat.
	localStorage.option_bgsize = "auto"; 					// Page background image size.
	localStorage.option_blacklist = ""; 					// Blacklisted sites to exclude from Address Box results
	localStorage.option_bold = 1; 							// Bolden matching words in results.
	localStorage.option_bottomgradient = "#000000"; 		// Fauxbar wraper bottom gradient color.
	localStorage.option_bottomopacity = "50"; 				// Fauxbar wrapper bottom gradient opacity.
	localStorage.option_consolidateBookmarks = 1; 			// Consolidate bookmarks in Address Box results. Means extra duplicate bookmarks won't be shown.
	localStorage.option_ctrlk = 1; 							// Use Ctrl+K functionality.
	localStorage.option_ctrll = 1; 							// Use Ctrl+L functionality.
	localStorage.option_customscoring = 0; 					// Use custom frecency scoring.
	localStorage.option_cutoff1 = 4; 						// Frecency bucket cutoff days #1
	localStorage.option_cutoff2 = 14; 						// Frecency bucket cutoff days #2
	localStorage.option_cutoff3 = 31; 						// Frecency bucket cutoff days #3
	localStorage.option_cutoff4 = 90; 						// Frecency bucket cutoff days #4
	localStorage.option_fallbacksearchurl = "http://www.google.com/search?btnI=&q={searchTerms}";	// Fallback URL for Address Box.
	localStorage.option_fauxbarfontcolor = "#000000";		// Address Box and Search Box input box font color.
	localStorage.option_favcolor = "#FFFFFF";				// Bookmark icon tint color.
	localStorage.option_favopacity = "0";					// Bookmark icon tint opacity.

	localStorage.option_frecency_auto_bookmark = 75;		// Frecency bonus scores
	localStorage.option_frecency_form_submit = 100;
	localStorage.option_frecency_generated = 100;
	localStorage.option_frecency_keyword = 100;
	localStorage.option_frecency_link = 100;
	localStorage.option_frecency_reload = 100;
	localStorage.option_frecency_start_page = 100;
	localStorage.option_frecency_typed = 100;
	localStorage.option_frecency_unvisitedbookmark = 1;

	localStorage.option_font = window.OS == "Mac" ? "Lucida Grande" : "Segoe UI";	// Global font name(s).
	localStorage.option_forceoptionsicon = 0;				// Always show the options icon on every page. Disabled by default.
	localStorage.option_hidehttp = 1;						// Hide "http://" from the beginning of URLs.
	localStorage.option_hidefiletiles = 1;					// Prevent top site tiles from displaying file:/// URLs.
	localStorage.option_hideopentiles = 0;					// Prevent top site tiles from displaying opened URLs. Disabled by default.
	localStorage.option_hidepinnedtiles = 1;				// Prevent top site tiles from displaying pinned URLs.
	localStorage.option_iconcolor = "#3374AB";				// Go Arrow and Magnifying Glass icon color.
	localStorage.option_ignoretitleless = 1;				// Ignore titleless Address Box results.
	localStorage.option_inputbgcolor = "#FFFFFF";			// Address Box and Search Box background color.
	localStorage.option_inputboxdisplayorder = "addressleft_searchright";	// Order of which Box comes first.
	localStorage.option_inputfontsize = window.OS == "Mac" ? 13 : 15;	// Address & Search Box font size.
	localStorage.option_leftcellwidthpercentage = 66;		// Width percentage of the Address Box.
	localStorage.option_maxaddressboxresults = 16;			// Max Address Box results to display to the user at a time.
	localStorage.option_maxaddressboxresultsshown = 8;		// Max Address Box results to be shown at a time; extra results will have to be scrolled to see.
	localStorage.option_maxretrievedsuggestions = 10;		// Max Search Box saved queries to retrieve. This option name is misleading; suggestions are generally JSON results from the search engine.
	localStorage.option_maxsuggestionsvisible = 20;			// Max queries/suggestions to display before needing to scroll. So with these 2 default options, 10 JSON suggestions will probably be displayed.
	localStorage.option_maxwidth = 1100;					// Max-width for the Fauxbar('s wrapper).
	localStorage.option_omniboxurltruncate = 55;			// Truncate Omnibox+Fauxbar URLs so that the titles can still be seen (hopefully).
	localStorage.option_openfauxbarfocus = "addressbox";	// Focus the Address Box when Fauxbar opens.
	localStorage.option_optionpage = "option_section_general";	// Option section/subpage to load when Options are shown.
	localStorage.option_osimproper = 1;						// Scan webpages for non-OpenSearch search engines; eg scan just lone input boxes.
	localStorage.option_osproper = 1;						// Scan webpages for proper OpenSearch declarations.
	localStorage.option_pagetilearrangement = "frecency";	// Page tile arrangement. Possible values: "frecency" "visitcount" "manual" "bookmarkbar"
	localStorage.option_prerender = 1;						// Let Chrome pre-render the first Address Box result if possible.
	localStorage.option_prerenderMs = 50;					// How many milliseconds to wait before pre-rendering
	localStorage.option_quickdelete = "0";					// Don't enable Quick Delete by default. Don't want the user randomly deleting their history without knowing it.
	localStorage.option_recentvisits = 10;					// Number of recent visits to sample when calculating frecency scores for URLs.
	localStorage.option_recordsearchboxqueries = 1;			// Keep a record of the user's Search Box queries, to suggest them to the user later on if they search for something similar.
	localStorage.option_resultbgcolor = "#FFFFFF";			// Background color for results and suggestions/queries.
	localStorage.option_sappsfontsize = 13;					// Font size (px) for main page tiles for top sites and installed apps.
	localStorage.option_selectedresultbgcolor = "#3399FF";	// Background color for .arrowed/highlighted/selected/navigated-to results/queries/suggestions.
	localStorage.option_selectedtitlecolor = "#FFFFFF";		// Title font color for .arrowed/highlighted/selected/navigated-to results/queries/suggestions.
	localStorage.option_selectedurlcolor = "#FFFFFF";		// URL font color for .arrowed/highlighted/selected/navigated-to results/queries/suggestions.
	localStorage.option_separatorcolor = "#E3E3E3";			// Color of the 1px separator line between results.
	localStorage.option_shadow = 1;							// Drop shadow for the Fauxbar.
	localStorage.option_showapps = 1;						// Display app tiles.
	localStorage.option_showErrorCount = 1;					// Show an error count on the Options' side menu.
	localStorage.option_showjsonsuggestions = 1;			// Show Search Box suggestions from the selected search engine when user is typing a query.
	localStorage.option_showmatchingfavs = 1;				// Search for and display matching bookmarks from the Address Box.
	localStorage.option_showmatchinghistoryitems = 1;		// Search for and display matching history items from the Address Box.
	localStorage.option_showQueriesViaKeyword = 1;			// Show previous search queries when seaching via keyword in the Address Box.
	localStorage.option_showqueryhistorysuggestions = 1;	// Show Search Box past queries when user is typing a query into the Search Box.
	localStorage.option_showSuggestionsViaKeyword = 1;		// Show suggestions from search engine when using keywords in the Address Box.
	localStorage.option_showtopsites = 1;					// Show top site tiles.
	localStorage.option_speech = "0";						// Show speech input icons in the Address Box and Search Box.
	localStorage.option_timing = "immediately";				// Only show Address Box results once the user has stopped typing. "immediately" shows results after every keystroke instead.
	localStorage.option_titlecolor = "#000000";				// Result title and query/suggestion font color.
	localStorage.option_titlesize = window.OS == "Mac" ? 12 : 14;					// Result title font size (px).
	localStorage.option_topgradient = "#000000";			// Fauxbar wrapper top gradient background color.
	localStorage.option_topopacity = 12;					// Fauxbar wrapper top gradient background opacity.
	localStorage.option_topsitecols = 4;					// Top site tiles, max columns.
	localStorage.option_topsiterows = 2;					// Top site titles, max rows.
	localStorage.option_underline = "0";					// Underline matching words in Address Box results. Off by default, looks a bit too busy/messy.
	localStorage.option_urlcolor = "#0066CC";				// Result URL font color.
	localStorage.option_urlsize = window.OS == "Mac" ? 11 : 12;						// Result URL font size (px).
	localStorage.option_weight1 = 100;						// Frecency bucket cutoff weight #1
	localStorage.option_weight2 = 70;						// Frecency bucket cutoff weight #2
	localStorage.option_weight3 = 50;						// Frecency bucket cutoff weight #3
	localStorage.option_weight4 = 30;						// Frecency bucket cutoff weight #4
	localStorage.option_weight5 = 10;						// Frecency bucket cutoff weight #5
}

// Get the value of a parameter from the page's hash.
// Example: If page's hash is "#foo=bar", getHashVar('foo') will return 'bar'
function getHashVar(varName) {
	var hash = window.location.hash.substr(1);
	var pieces = explode("&", hash);
	for (var p in pieces) {
		if (explode("=", pieces[p])[0] == varName) {
			return urldecode(explode("=", pieces[p])[1]);
		}
	}
	return '';
}

// Select a search engine to use in the Search Box. Function name is kind of misleading.
function selectOpenSearchType(el, focusToo) {
	if (document.title == "fauxbar.background") {
		return false;
	}
	if ($(".shortname", el).length == 0) {
		localStorage.option_optionpage = "option_section_searchengines";

		// If "Edit search engines..." is selected, load the options.
		// If options are already loaded, switch to the Search Box subpage
		if (getHashVar("options") != 1) {
			if (window.location.hash.length == 0) {
				window.location.hash = "#options=1";
			} else {
				window.location.hash += "options=1";
			}
			window.location.reload();
		} else {
			changeOptionPage("#option_section_searchengines");
		}
		$("#opensearch_menufocus").blur();
		return false;
	}
	$("img.opensearch_selectedicon").attr("src", $("img", el).attr("src"));
	var shortNameHtml = $(".shortname", el).html();
	var osi = $("#opensearchinput");
	if (osi.hasClass("description") == true && $(".shortname", el).length) {
		osi.val(html_entity_decode(shortNameHtml));
	}
	window.openSearchShortname = shortNameHtml;
	var newTitle = "Search using "+shortNameHtml;
	osi.attr("title",newTitle).attr("realtitle",newTitle);
	if (focusToo == true) {
		osi.focus();
		if (osi.val() !== window.openSearchShortname) {
			osi.select();
		}
		if (openDb()) {
			window.db.transaction(function (tx) {
				tx.executeSql('UPDATE opensearches SET isdefault = 0');
				tx.executeSql('UPDATE opensearches SET isdefault = 1 WHERE shortname = ?', [window.openSearchShortname]);
				localStorage.osshortname = window.openSearchShortname;
				localStorage.osiconsrc = $(".vertline2 img", el).attr("src");
			}, function(t){
				errorHandler(t, getLineInfo());
			});
		}
	}
	$('#opensearchmenu .menuitem').removeClass("bold");
	$('#opensearchmenu .menuitem[shortname="'+window.openSearchShortname+'"]').addClass("bold");
}

// Fill the search engine menu with the engines that have been added to Fauxbar
function populateOpenSearchMenu(force) {
	if (openDb(force)) {
		window.db.readTransaction(function (tx) {
			tx.executeSql('SELECT shortname, searchurl, method, suggestUrl, iconurl, isdefault, keyword FROM opensearches ORDER BY position DESC, shortname COLLATE NOCASE asc', [], function (tx, results) {
				var menuItems = '';
				var len = results.rows.length, i;
				var isDefault = false;
				var defaultShortname = '';
				var iconUrl = "";
				var result = "";

				for (var i = 0; i < len; i++) {
					result = results.rows.item(i);
					isDefault = result.isdefault == 1 ? true : false;
					if (isDefault == true || defaultShortname == '') {
						defaultShortname = results.rows.item(i).shortname;
					}
					iconUrl = result.iconurl;
					if (iconUrl != "google.ico" && iconUrl != "yahoo.ico" && iconUrl != "bing.ico") {
						iconUrl = "chrome://favicon/"+iconUrl;
					}
					menuItems += '<div class="menuitem" shortname="'+result.shortname+'" searchurl="'+result.searchurl+'" method="'+result.method+'" suggesturl="'+result.suggestUrl+'" keyword="'+result.keyword+'">';
					menuItems += '<div class="vertline2">';
					menuItems += '<img src="'+iconUrl+'" style="height:16px;width:16px" /> ';
					menuItems += '<div class="vertline shortname">' + result.shortname;
					menuItems += '</div></div></div>';
				}

				menuItems += '<div class="menuitemline" style="border:0">';
				menuItems += '<div class="vertline2" style="">';

				menuItems += '<div class="vertline" style="line-height:1px; font-size:1px; padding:2px">&nbsp;';
				menuItems += '</div></div></div>';

				menuItems += '<div class="osMenuLine" style="border-bottom:1px solid #fff; border-top:1px solid #e2e3e3; display:block; height:0px; line-height:0px; font-size:0px; width:100%; margin-left:27px; margin-top:-3px; position:absolute; "></div>';

				menuItems += '<div class="menuitem"><div class="vertline2">';
				menuItems += '	<img src="fauxbar16.png" style="height:16px; width:16px" /> ';
				menuItems += '	<div class="vertline">Edit search engines...</div>';
				menuItems += '</div></div>';
				var osm = $("#opensearchmenu");
				osm.html(menuItems);
				$(".osMenuLine").css("width", osm.outerWidth()-34+"px");
				if (i > 0) {
					selectOpenSearchType($('.menuitem[shortname="'+defaultShortname+'"]'), false);
				}
			});
		}, function(t){
			errorHandler(t, getLineInfo());
		});
	}
}

// Start the indexing process
function reindex() {
	window.doneApplyingFrecencyScores = 0;
	if (openDb(true)) {
		$("#addresswrapper").css("cursor","wait");
		window.indexStatus = "Initiating the indexing process..."; // Step 1
		chrome.extension.sendRequest({message:"currentStatus",status:"Initiating the indexing process...", step:1}); // Step 1
		clearIndex(true);
	}
}

// Reset or create the database tables
function clearIndex(reindexing) {
	if (openDb(true)) {
		window.clearingIndex = true;
		window.db.transaction(function(tx){
			window.indexStatus = "Creating database tables..."; // Step 2
			chrome.extension.sendRequest({message:"currentStatus",status:"Creating database tables...", step:2}); // Step 2

			// Address Box history items and bookmarks
			tx.executeSql('DROP TABLE IF EXISTS urls');
			tx.executeSql('CREATE TABLE urls (url TEXT, type NUMERIC, title TEXT, frecency NUMERIC DEFAULT -1, queuedfordeletion NUMERIC DEFAULT 0, id NUMERIC DEFAULT 0)'); // type1 = history item, type2 = bookmark
			tx.executeSql('CREATE INDEX IF NOT EXISTS urlindex ON urls (url)');
			tx.executeSql('CREATE INDEX IF NOT EXISTS titleindex ON urls (title)');
			tx.executeSql('CREATE INDEX IF NOT EXISTS frecencyindex ON urls (frecency)');
			tx.executeSql('CREATE INDEX IF NOT EXISTS idindex ON urls (id)');
			tx.executeSql('CREATE INDEX IF NOT EXISTS typeindex ON urls (type)');

			// Error log table
			tx.executeSql('CREATE TABLE IF NOT EXISTS errors (id INTEGER PRIMARY KEY, date NUMERIC, version TEXT, url TEXT, file TEXT, line NUMERIC, message TEXT, count NUMERIC)');

			// If we're setting up the database for the first time, and not just reindexing...
			if (!localStorage.indexedbefore || localStorage.indexedbefore != 1) {

				// Site tile thumbnails
				tx.executeSql('DROP TABLE IF EXISTS thumbs');
				tx.executeSql('CREATE TABLE thumbs (url TEXT UNIQUE ON CONFLICT REPLACE, data BLOB, date INTEGER, title TEXT, frecency NUMERIC DEFAULT -1, manual NUMERIC DEFAULT 0)'); // "manual" meaning, is the thumb a user-defined site tile, not necessarily a top frecency scored one
				tx.executeSql('CREATE INDEX IF NOT EXISTS urlindex ON thumbs (url)');
				tx.executeSql('CREATE INDEX IF NOT EXISTS frecencyindex ON thumbs (frecency)');

				// Search Box search engines
				tx.executeSql('DROP TABLE IF EXISTS opensearches');
				tx.executeSql('CREATE TABLE opensearches (shortname TEXT UNIQUE ON CONFLICT REPLACE, iconurl TEXT, searchurl TEXT, xmlurl TEXT, xml TEXT, isdefault NUMERIC DEFAULT 0, method TEXT DEFAULT "get", position NUMERIC DEFAULT 0, suggestUrl TEXT, keyword TEXT DEFAULT "")');

				// Search Box search queries
				tx.executeSql('DROP TABLE IF EXISTS searchqueries');
				tx.executeSql('CREATE TABLE searchqueries (id INTEGER PRIMARY KEY AUTOINCREMENT, query TEXT)');
				tx.executeSql('CREATE INDEX IF NOT EXISTS queryindex ON searchqueries (query)');

				window.indexStatus = "Adding search engines..."; // Step 3
				chrome.extension.sendRequest({message:"currentStatus",status:"Adding search engines...", step:3}); // Step 3

				// Add Google, Yahoo! and Bing to the Search Box
				tx.executeSql('INSERT INTO opensearches (shortname, iconurl, searchurl, xmlurl, xml, isdefault, method, suggestUrl, keyword) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', ["Google", "google.ico", "http://www.google.com/search?q={searchTerms}", "", "", "1", "get", "http://suggestqueries.google.com/complete/search?json&q={searchTerms}", "g"]);
				tx.executeSql('INSERT INTO opensearches (shortname, iconurl, searchurl, xmlurl, xml, isdefault, method, suggestUrl, keyword) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', ["Yahoo!", "yahoo.ico", "http://search.yahoo.com/search?p={searchTerms}", "", "", "0", "get", "http://ff.search.yahoo.com/gossip?output=fxjson&amp;command={searchTerms}", "y"]);
				tx.executeSql('INSERT INTO opensearches (shortname, iconurl, searchurl, xmlurl, xml, isdefault, method, suggestUrl, keyword) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', ["Bing", "bing.ico", "http://www.bing.com/search?q={searchTerms}", "", "", "0", "get", "http://api.bing.com/osjson.aspx?query={searchTerms}", "b"]);
			} else {
				window.indexStatus = "Skipping search engines..."; // Step 3
				chrome.extension.sendRequest({message:"currentStatus",status:"Skipping search engines...", step:3}); // Step 3
			}
		}, function(t){
			errorHandler(t, getLineInfo());
		}, startIndexing);
	}
}

// Check to see if the indexing finished
function isIndexingFinished() {
	if (window.sqlLastExecution && getMs() - window.sqlLastExecution > 1500 && window.doneApplyingFrecencyScores == 1) {
		$("#indexing").remove();
		window.stepsDone++;
		window.reindexing = false;
		localStorage.indexComplete = 1;
		localStorage.indexedbefore = 1;
		console.log("Indexing complete.");
		chrome.extension.sendRequest({message:"currentStatus",status:"Indexing complete.", step:8}); // Step 8
		localStorage.almostdone = 1;
		setTimeout(function(){
			updateTopSites();
			alert("Success!\n\nFauxbar has finished indexing your history items and bookmarks, and is now ready for use.\n\nFrom here on, Fauxbar's index will be silently updated on-the-fly for you.");
			chrome.extension.sendRequest("DONE INDEXING");
		},1200);
		return true;
	}
	else {
		chrome.extension.sendRequest({message:"currentStatus",status:window.indexStatus});
		setTimeout(isIndexingFinished, 500);
	}
}

// Really start the indexing process
function startIndexing() {
	if (openDb(true)) {
		setTimeout(isIndexingFinished, 2000);
		window.indexStatus = "Processing your history items and bookmarks..."; // Step 4
		chrome.extension.sendRequest({message:"currentStatus",status:"Processing your history items and bookmarks...", step:4});
		chrome.history.search({text:"", startTime:1, maxResults:999999999}, function(historyItems){
			window.historyItemsToCopy = historyItems;
			var hi = "";
			window.db.transaction(function(tx){
				for (var h in window.historyItemsToCopy) {
					hi = window.historyItemsToCopy[h];
					tx.executeSql('INSERT INTO urls (url, type, title, frecency) VALUES (?, ?, ?, ?)', [hi.url, 1, hi.title, -1]);
					window.sqlLastExecution = getMs();
				}
				tx.executeSql('DELETE FROM urls WHERE url LIKE "data:%" OR url LIKE "javascript:void%"');
				window.indexStatus = "Processing your history items and bookmarks..."; // Step 5
				chrome.extension.sendRequest({message:"currentStatus",status:"Processing your history items and bookmarks...", step:5});
				chrome.bookmarks.getTree(function(bookmarkTreeNodes){
					for (var b in bookmarkTreeNodes) {
						indexBookmarks(bookmarkTreeNodes[b]);
					}
				});
				console.log("Total history items: "+window.historyItemsToCopy.length);

				window.frecencyStatements = new Array();
				chrome.extension.sendRequest({message:"currentStatus",status:"Calculating frecency scores for "+number_format(window.historyItemsToCopy.length)+" different URLs...", step:6}); // Step 6
				window.indexStatus = "Calculating frecency scores for "+number_format(window.historyItemsToCopy.length)+" different URLs...";
				window.historyItemsToCopyLength = window.historyItemsToCopy.length;
				assignFrecencies(true);
			}, function(t){
				errorHandler(t, getLineInfo());
			});
		});
	}
}

// Sort longest string length to shortest
function compareStringLengths (a, b) {
  if ( a.length < b.length )
    return 1;
  if ( a.length > b.length )
    return -1;
  return 0; // a and b are the same length
}

// Initialize/create the database
function openDb(force) {
	if (!window.db) {
		window.db = openDatabase('fauxbar', '1.0', 'Fauxbar data', 100 * 1024 * 1024);
	}

	if (window.db) {
		if (localStorage.indexComplete == 1 || force == true) {
			return true;
		} else {
			return false;
		}
	}
	else {
		alert("Fauxbar error: Unable to create or open Fauxbar's SQLite database.");
		return false;
	}
}

// errorHandler catches errors when SQL statements don't work.
// transaction contains the SQL error code and message
// lineInfo contains contains the line number and filename for where the error came from
function errorHandler(transaction, lineInfo) {
	if (transaction.message) {
		var code = '';
		switch (transaction.code) {
			case 1:
				code = "database";
				break;
			case 2:
				code = "version";
				break;
			case 3:
				code = '"too large"';
				break;
			case 4:
				code = "quota";
				break;
			case 5:
				code = "syntax";
				break;
			case 6:
				code = "constraint";
				break;
			case 7:
				code = "timeout";
				break;
			default: // case 0:
				break;
		}
		var errorMsg = 'SQL '+code+' error: "'+transaction.message+'"';
		logError(errorMsg, lineInfo.file, lineInfo.line);
	} else {
		logError('Generic SQL error (no transaction)', lineInfo.file, lineInfo.line);
	}
}

// Current number of seconds since the epoch
function getMs() {
	var currentTime = new Date();
	return currentTime.getTime();
}

// Generate a frecency score number for a URL.
// Scoring derived from https://developer.mozilla.org/en/The_Places_frecency_algorithm
// Make sure visitItems has been .reverse()'d before calling this function
function calculateFrecency(visitItems) {
	var vi = '';
	var singleVisitPoints = 0;
	var summedVisitPoints = 0;
	var bonus = 0;
	var bucketWeight = 0;
	var days = 0;
	var frecency = -1;
	var x = 0;

	// If user has opted to use custom scoring...
	if (localStorage.option_customscoring == 1) {

		// For each sampled recent visits to this URL...
		for (x=0; x < Math.min(visitItems.length,localStorage.option_recentvisits); x++) {
			singleVisitPoints = 0;
			bonus = 0;
			bucketWeight = 0;
			days = 0;
			vi = visitItems[x];

			// Determine which bonus score to give
			switch (vi.transition) {
				case "link":
					bonus = localStorage.option_frecency_link;
					break;
				case "typed":
					bonus = localStorage.option_frecency_typed;
					break;
				case "auto_bookmark":
					bonus = localStorage.option_frecency_auto_bookmark;
					break;
				case "reload":
					bonus = localStorage.option_frecency_reload;
					break;
				case "start_page":
					bonus = localStorage.option_frecency_start_page;
					break;
				case "form_submit":
					bonus = localStorage.option_frecency_form_submit;
					break;
				case "keyword":
					bonus = localStorage.option_frecency_keyword;
					break;
				case "generated":
					bonus = localStorage.option_frecency_generated;
					break;
				default:
					break;
			}

			// Determine the weight of the score, based on the age of the visit
			days = Math.floor(Math.round(getMs() - vi.visitTime) / 86400);
			if (days < localStorage.option_cutoff1) {
				bucketWeight = localStorage.option_weight1;
			} else if (days < localStorage.option_cutoff2) {
				bucketWeight = localStorage.option_weight2;
			} else if (days < localStorage.option_cutoff3) {
				bucketWeight = localStorage.option_weight3;
			} else if (days < localStorage.option_cutoff4) {
				bucketWeight = localStorage.option_weight4;
			} else {
				bucketWeight = localStorage.option_weight5;
			}

			// Calculate the points
			singleVisitPoints = (bonus / 100) * bucketWeight;
			summedVisitPoints = summedVisitPoints + singleVisitPoints;
		}

	// Else, if user has not opted to use custom scoring, just use the defaults...
	} else {
		// For each sampled visit...
		for (x=0; x < Math.min(visitItems.length,10); x++) {
			singleVisitPoints = 0;
			bonus = 0;
			bucketWeight = 0;
			days = 0;
			vi = visitItems[x];

			// Assign bonus score based on visit type
			switch (vi.transition) {
				case "link":
					bonus = 100;
					break;
				case "typed":
					bonus = 100;
					break;
				case "auto_bookmark":
					bonus = 75;
					break;
				case "reload":
					bonus = 100;
					break;
				case "start_page":
					bonus = 100;
					break;
				case "form_submit":
					bonus = 100;
					break;
				case "keyword":
					bonus = 100;
					break;
				case "generated":
					bonus = 100;
					break;
				default:
					break;
			}

			// Assign weight based on visit's age
			days = Math.floor(Math.round(getMs() - vi.visitTime) / 86400);
			if (days < 4) {
				bucketWeight = 100;
			} else if (days < 14) {
				bucketWeight = 70;
			} else if (days < 31) {
				bucketWeight = 50;
			} else if (days < 90) {
				bucketWeight = 30;
			} else {
				bucketWeight = 10;
			}

			// Calculate points
			singleVisitPoints = (bonus / 100) * bucketWeight;
			summedVisitPoints = summedVisitPoints + singleVisitPoints;
		}
	}

	// Calculate the frecency score for the URL
	frecency = Math.ceil(visitItems.length * summedVisitPoints / x);
	return frecency;
}

// Calculate and apply frecency scores for all the URLs
function assignFrecencies() {
	if (window.historyItemsToCopy.length > 0) {
		window.hi2 = window.historyItemsToCopy[window.historyItemsToCopy.length-1];
		chrome.history.getVisits({url:window.hi2.url}, function(visitItems){
			if (visitItems.length > 0 && visitItems[0]) {
				visitItems.reverse();
				var frecency = calculateFrecency(visitItems);
				window.frecencyStatements[window.frecencyStatements.length] = {statement:'UPDATE urls SET frecency = ? WHERE url = ?', inputs:[frecency, window.hi2.url]};
			}
			window.sqlLastExecution = getMs();
			window.historyItemsToCopy.pop();
			assignFrecencies();
		});
	}
	else {
		console.log("Executing frecency updates, please wait...");
		window.indexStatus = "Applying frecency scores to "+number_format(window.historyItemsToCopyLength)+" different URLs..."; // Step 7
		chrome.extension.sendRequest({message:"currentStatus",status:"Applying frecency scores to "+number_format(window.historyItemsToCopyLength)+" different URLs...", step:7});
		window.historyItemsToCopy = null;
		window.db.transaction(function(tx){
			for (var fs in window.frecencyStatements) {
				tx.executeSql(window.frecencyStatements[fs].statement, window.frecencyStatements[fs].inputs);
			}
			window.doneApplyingFrecencyScores = 1;
			delete window.frecencyStatements;
		}, function(t){
			errorHandler(t, getLineInfo());
		});
	}
}

// Add bookmarks to Fauxbar's database
function indexBookmarks(bookmarkTreeNode) {
	if (bookmarkTreeNode.url) {
		window.db.transaction(function(tx){
			tx.executeSql('INSERT OR REPLACE INTO urls (url, type, title, frecency, id) VALUES (?, ?, ?, ?, ?)', [bookmarkTreeNode.url, 2, bookmarkTreeNode.title, localStorage.option_frecency_unvisitedbookmark, bookmarkTreeNode.id]);
		}, function(t){
			errorHandler(t, getLineInfo());
		});
	}
	if (bookmarkTreeNode.children) {
		for (var b in bookmarkTreeNode.children) {
			indexBookmarks(bookmarkTreeNode.children[b]);
		}
	}
}

// Define characters that RegExp can't handle.
specialChars = "%_^$|&*.()+[\\?><";

// Replace each special character in a string with ¸%%%%%%¸ (varying lengths of %%%%%%%%%)
function replaceSpecialChars(text) {
	var p = "";
	for (var x=0; x<specialChars.length; x++) {
		p = "";
		while (p.length < specialChars.length+5-x) {
			p += '%';
		}
		//console.log("Replacing "+specialChars[x]+" with "+p);
		text = str_replace(specialChars[x], "¸"+p+"¸", text);
	}
	return text;
}

// Revert the ¸%%%%%%%%¸ strings back to their appropriate characters
function replacePercents(text) {
	var p = "";
	for (var x=0; x<specialChars.length; x++) {
		p = "";
		while (p.length < specialChars.length+5-x) {
			p += '%';
		}
		//console.log("Replacing "+specialChars[x]+" with "+p);
		text = str_replace("¸"+p+"¸", specialChars[x], text);
	}
	return text;
}


// Below are mostly borrowed functions from other sources.
// If you see your function below, thank you!

////////////////////////////////////////////////////////////////////////////


// http://phpjs.org/functions/strstr:551
function strstr (haystack, needle, bool) {
	var pos = 0;

	haystack += '';
	pos = haystack.indexOf(needle);
	if (pos == -1) {
		return false;
	} else {
		if (bool) {
			return haystack.substr(0, pos);
		} else {
			return haystack.slice(pos);
		}
	}
}

// http://phpjs.org/functions/explode:396
function explode (delimiter, string, limit) {
	var emptyArray = {
		0: ''
	};

	// third argument is not required
	if (arguments.length < 2 || typeof arguments[0] == 'undefined' || typeof arguments[1] == 'undefined') {
		return null;
	}

	if (delimiter === '' || delimiter === false || delimiter === null) {
		return false;
	}

	if (typeof delimiter == 'function' || typeof delimiter == 'object' || typeof string == 'function' || typeof string == 'object') {
		return emptyArray;
	}

	if (delimiter === true) {
		delimiter = '1';
	}

	if (!limit) {
		return string.toString().split(delimiter.toString());
	} else {
		// support for limit argument
		var splitted = string.toString().split(delimiter.toString());
		var partA = splitted.splice(0, limit - 1);
		var partB = splitted.join(delimiter.toString());
		partA.push(partB);
		return partA;
	}
}

// https://github.com/kvz/phpjs/raw/master/functions/strings/implode.js
function implode (glue, pieces) {
    var i = '',
        retVal = '',
        tGlue = '';
    if (arguments.length === 1) {
        pieces = glue;
        glue = '';
    }
    if (typeof(pieces) === 'object') {
        if (Object.prototype.toString.call(pieces) === '[object Array]') {
            return pieces.join(glue);
        } else {
            for (i in pieces) {
                retVal += tGlue + pieces[i];
                tGlue = glue;
            }
            return retVal;
        }
    } else {
        return pieces;
    }
}

// http://phpjs.org/functions/substr_count:559
function substr_count (haystack, needle, offset, length) {
    var pos = 0,
        cnt = 0;

    haystack += '';
    needle += '';
    if (isNaN(offset)) {
        offset = 0;
    }
    if (isNaN(length)) {
        length = 0;
    }
    offset--;

    while ((offset = haystack.indexOf(needle, offset + 1)) != -1) {
        if (length > 0 && (offset + needle.length) > length) {
            return false;
        } else {
            cnt++;
        }
    }

    return cnt;
}

// http://phpjs.org/functions/str_replace:527
function str_replace (search, replace, subject, count) {
	var i = 0,
		j = 0,
		temp = '',
		repl = '',
		sl = 0,
		fl = 0,
		f = [].concat(search),
		r = [].concat(replace),
		s = subject,
		ra = Object.prototype.toString.call(r) === '[object Array]',
		sa = Object.prototype.toString.call(s) === '[object Array]';
	s = [].concat(s);
	if (count) {
		this.window[count] = 0;
	}

	for (i = 0, sl = s.length; i < sl; i++) {
		if (s[i] === '') {
			continue;
		}
		for (j = 0, fl = f.length; j < fl; j++) {
			temp = s[i] + '';
			repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
			s[i] = (temp).split(f[j]).join(repl);
			if (count && s[i] !== temp) {
				this.window[count] += (temp.length - s[i].length) / f[j].length;
			}
		}
	}
	return sa ? s : s[0];
}

// http://phpjs.org/functions/urlencode:573
function urlencode (str) {
    str = (str + '').toString();

    // Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
    // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
    replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
}

// http://phpjs.org/functions/urldecode:572
function urldecode (str) {
    return decodeURIComponent((str + '').replace(/\+/g, '%20'));
}

// http://phpjs.org/functions/str_ireplace:524
function str_ireplace (search, replace, subject) {
    var i, k = '';
    var searchl = 0;
    var reg;

    var escapeRegex = function (s) {
        return s.replace(/([\\\^\$*+\[\]?{}.=!:(|)])/g, '\\$1');
    };

    search += '';
    searchl = search.length;
    if (Object.prototype.toString.call(replace) !== '[object Array]') {
        replace = [replace];
        if (Object.prototype.toString.call(search) === '[object Array]') {
            // If search is an array and replace is a string,
            // then this replacement string is used for every value of search
            while (searchl > replace.length) {
                replace[replace.length] = replace[0];
            }
        }
    }

    if (Object.prototype.toString.call(search) !== '[object Array]') {
        search = [search];
    }
    while (search.length > replace.length) {
        // If replace has fewer values than search,
        // then an empty string is used for the rest of replacement values
        replace[replace.length] = '';
    }

    if (Object.prototype.toString.call(subject) === '[object Array]') {
        // If subject is an array, then the search and replace is performed
        // with every entry of subject , and the return value is an array as well.
        for (k in subject) {
            if (subject.hasOwnProperty(k)) {
                subject[k] = str_ireplace(search, replace, subject[k]);
            }
        }
        return subject;
    }

    searchl = search.length;
    for (i = 0; i < searchl; i++) {
        reg = new RegExp(escapeRegex(search[i]), 'gi');
        subject = subject.replace(reg, replace[i]);
    }

    return subject;
}

// http://phpjs.org/functions/number_format:481
function number_format (number, decimals, dec_point, thousands_sep) {
    // Strip all characters but numerical ones.
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}
