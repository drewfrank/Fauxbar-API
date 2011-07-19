// This file gets loaded into Fauxbar's background page.

// Reload Fauxbar Memory Helper if it's running
chrome.management.getAll(function(extensions){
	for (var e in extensions) {
		if (extensions[e].name == "Fauxbar Memory Helper" && extensions[e].enabled == true) {
			window.doEnable = true;
			chrome.management.setEnabled(extensions[e].id, false);
		}
	}
});
// Record if we should restart the Helper next time it's disabled
chrome.management.onDisabled.addListener(function(extension) {
	if (window.doEnable == true && extension.name == "Fauxbar Memory Helper") {
		chrome.management.setEnabled(extension.id, true, function(){
			window.doEnable = false;
		});
	}
});

// If Helper detects computer is idle, Fauxbar will report back to restart Fauxbar IF no Fauxbar tabs are open.
chrome.extension.onRequestExternal.addListener(function(request){
	if (request == "restart fauxbar?" && localStorage.indexComplete == 1) {
		console.log("got message");
		chrome.windows.getAll({populate:true}, function(windows){
			var okayToRestart = true;
			for (var w in windows) {
				for (var t in windows[w].tabs) {
					if (windows[w].tabs[t].title == "Fauxbar" || windows[w].tabs[t].title == "Fauxbar Options") {
						okayToRestart = false;
					}
				}
			}
			if (okayToRestart == true) {
				chrome.management.getAll(function(extensions){
					for (var e in extensions) {
						if (extensions[e].name == "Fauxbar Memory Helper") {
							chrome.extension.sendRequest(extensions[e].id, "restart fauxbar");
						}
					}
				});
			}
		});
	}
});

// Delete top sites (eg top tiles) that have fallen below the frecency threshold
$(document).ready(function(){
	if (openDb()) {
		window.db.transaction(function(tx){
			tx.executeSql('SELECT frecency FROM urls WHERE type = 1 ORDER BY frecency DESC LIMIT 25,25', [], function(tx, results){
				window.frecencyThreshold = results.rows.item(0).frecency;
				tx.executeSql('DELETE FROM thumbs WHERE frecency < ? AND frecency > -1', [window.frecencyThreshold]);
			});
		}, errorHandler);
	}
});

window.frecencyThreshold = 0;

// If Fauxbar is being started for the first time, load in the default options.
// os* usually stands for OpenSearch
if (!localStorage.firstrundone || localStorage.firstrundone != 1) {
	localStorage.indexComplete = 0;
	localStorage.indexedbefore = 0;
	localStorage.osshortname = 'Google';
	localStorage.osiconsrc = 'google.ico';
	localStorage.sapps = 1;
	localStorage.showintro = 1;
	resetOptions();
	localStorage.firstrundone = 1;
}

// Open a Fauxbar tab if the indexing needs to be done
if (localStorage.indexComplete != 1) {
	chrome.tabs.create({});

	// User probably disabled/re-enabled Fauxbar during an indexing session, so start indexing again
	if (localStorage.indexedbefore == 1) {
		setTimeout(clearIndex, 1000);
	}
}

// Omnibox stuff!

// When user starts using Fauxbar from the Omnibox, record the current tabs and set the default suggestion
chrome.omnibox.onInputStarted.addListener(function() {
	chrome.tabs.getAllInWindow(null, function(tabs){
		window.currentTabs = tabs;
	});
	chrome.omnibox.setDefaultSuggestion({description:"Open Fauxbar"});
});
chrome.omnibox.setDefaultSuggestion({description:"Open Fauxbar"});

// When user types something into Omnibox+Fauxbar, get some results and display them...
chrome.omnibox.onInputChanged.addListener(function(text, suggest){
	var origText = text;
	window.currentOmniboxText = text;
	if (text.length > 0 ) {
		chrome.omnibox.setDefaultSuggestion({description:"<dim>Fauxbar: %s</dim>"});
	} else {
		chrome.omnibox.setDefaultSuggestion({description:"Open Fauxbar"});
	}
	chrome.tabs.getAllInWindow(null, function(tabs){
		window.currentTabs = tabs;
	});
	var sortedHistoryItems = {};
	var resultObjects = [];
	if (openDb()) {
		window.db.transaction(function(tx) {
			// If there is user input, split it into words.
			if (text.length > 0) { // equivalent to "!noQuery" (see getResults() in fauxbar.js)
				var words = explode(" ", text);
				var urltitleWords = new Array();
				var urltitleQMarks = new Array();
				var modifiers = '';
				for (var w in words) {
					if (words[w] != "") {
						// If word is "is:fav", add it as a modifier to the SQL query statement
						if (words[w].toLowerCase() == 'is:fav') {
							modifiers += ' AND type = 2 ';
						}
						else {
							urltitleWords[urltitleWords.length] = '%'+words[w]+'%';
							urltitleQMarks[urltitleQMarks.length] = ' urltitle like ? ';
						}
					}
				}
			}

			if (text.length == 0 || urltitleWords.length > 0 || modifiers != "") {

				// Show history items and/or bookmarks depending on user's settings
				var typeOptions = ['type = -1'];
				if (localStorage.option_showmatchinghistoryitems && localStorage.option_showmatchinghistoryitems == 1) {
					typeOptions[typeOptions.length] = ' type = 1 ';
				}
				if (localStorage.option_showmatchingfavs && localStorage.option_showmatchingfavs == 1) {
					typeOptions[typeOptions.length] = ' type = 2 ';
				}
				typeOptions = implode(" OR ", typeOptions);

				var resultLimit = localStorage.option_maxaddressboxresults ? localStorage.option_maxaddressboxresults : 12;
				resultLimit = resultLimit * 2;
				if (resultLimit > 20) {
					resultLimit = 20;
				}

				// Define Fauxbar's URL, so that results from that don't get displayed. No need to display a link to Fauxbar when you're already using Fauxbar.
				var fauxbarUrl = chrome.extension.getURL("fauxbar.html%");

				// Ignore titleless results if user has opted. But still keep proper files like .pdf, .json, .js, .php, .html, etc.
				var titleless = localStorage.option_ignoretitleless == 1 ? ' AND (title != "" OR url LIKE "%.__" OR url LIKE "%.___" OR url LIKE "%.____") ' : "";

				// If there's no input...
				if (text.length == 0) {
					var selectStatement = 'SELECT * FROM urls WHERE ('+typeOptions+') AND queuedfordeletion = 0 AND url NOT LIKE "'+fauxbarUrl+'" AND url NOT LIKE "data:%" '+titleless+' ORDER BY frecency DESC, type DESC LIMIT '+resultLimit;
				}
				// Else, If we have words...
				else if (urltitleWords.length > 0) {
					var selectStatement = 'SELECT *, (url||" "||title) AS urltitle FROM urls WHERE ('+typeOptions+') AND queuedfordeletion = 0 '+modifiers+' AND '+implode(" and ", urltitleQMarks)+' AND url NOT LIKE "'+fauxbarUrl+'" AND url NOT LIKE "data:%" '+titleless+' ORDER BY frecency DESC, type DESC LIMIT '+resultLimit;
				}
				// Else, this probably doesn't ever get used.
				else {
					var selectStatement = 'SELECT * FROM urls WHERE ('+typeOptions+') AND queuedfordeletion = 0 '+modifiers+' AND url NOT LIKE "'+fauxbarUrl+'" AND url NOT LIKE "data:%" '+titleless+' ORDER BY frecency DESC, type DESC LIMIT '+resultLimit;
				}

				// If user text no longer equals the text we're processing, cancel.
				if (window.currentOmniboxText != origText) {
					return false;
				}

				// Execute the query...
				tx.executeSql(selectStatement, urltitleWords, function (tx, results) {
					var len = results.rows.length, i;
					var newItem = {};
					// Create each result as a new object
					for (var i = 0; i < len; i++) {
						newItem = {};
						newItem.url = results.rows.item(i).url;
						newItem.title = results.rows.item(i).title;
						if (results.rows.item(i).type == 2) {
							newItem.isBookmark = true;
						}
						sortedHistoryItems[i] = newItem;
					}

					maxRows = resultLimit / 2;
					if (maxRows > 10) {
						maxRows = 10;
					}
					var currentRows = 0;
					var hI = "";
					var resultIsOkay = true;
					var titleText = "";
					var urlText = "";
					var regEx = "";
					var divvy = "";
					var resultString = "";
					var urlExplode = "";

					// Replace any cedillas with a space - it's a special character. Sorry to anyone that actually uses it!
					text = str_replace("¸", " ", text);

					var matchOpen = '<match>';
					var matchClose = '</match>';
					if (localStorage.option_bold == 0) {
						matchOpen = matchClose = '';
					}

					// Replace special characters with funky ¸%%%%%%¸ symbols
					text = replaceSpecialChars(text);
					var truncated = 0;

					// For each result...
					for (var i in sortedHistoryItems) {
						truncated = 0;
						/*if (window.currentOmniboxText != origText) {
							return false;
						}*/
						if (currentRows < maxRows) {
							hI = sortedHistoryItems[i];
							resultIsOkay = true;
							// Sort words by longest length to shortest
							if (text.length > 0) {
								words = explode(" ", text);
								if (words) {
									words.sort(compareStringLengths);
								}
							}

							if (resultIsOkay == true) {
								// If result is titleless, make the title be the URL
																/*titleText = hI.title == "" ? hI.url : hI.title;*/
								if (hI.title == "") {
									urlExplode = explode("/", hI.url);
									titleText = urldecode(urlExplode[urlExplode.length-1]);
									if (titleText.length == 0) {
										titleText = urldecode(hI.url);
									}
								} else {
									titleText = hI.title;
								}
								urlText = urldecode(hI.url);

								// Remove "http://" from the beginning of the URL
								if (urlText.substring(0,7) == 'http://' && localStorage.option_hidehttp && localStorage.option_hidehttp == 1) {
									urlText = urlText.substr(7);
									if (substr_count(urlText, '/') == 1 && urlText.substr(urlText.length-1) == '/') {
										urlText = urlText.substr(0, urlText.length-1);
									}
								}

								// Truncate the URL a bit
								if (localStorage.option_omniboxurltruncate && urlText.length > localStorage.option_omniboxurltruncate && (urlText+titleText).length > localStorage.option_omniboxurltruncate*2) {
									truncated = 1;
									urlText = urlText.substring(0,localStorage.option_omniboxurltruncate);
								}

								// Replace special characters with funky ¸%%%%%%¸ symbols
								titleText = replaceSpecialChars(titleText);
								urlText = replaceSpecialChars(urlText);

								// Wrap each word with more funky symbols
								for (var i in words) {
									if (words[i] != "") {
										regEx = new RegExp(words[i], 'gi');
										titleText = titleText.replace(regEx, '¸%%%%%¸$&¸%%%%¸');
										urlText = urlText.replace(regEx, '¸%%%%%¸$&¸%%%%¸');
									}
								}

								// Replace the previous symbols with their original characters; this was to let all characters work with RegExp
								titleText = replacePercents(titleText);
								urlText = replacePercents(urlText);

								// Replace <match> and </match> with symbols
								titleText = str_replace("¸%%%%%¸", matchOpen, titleText);
								titleText = str_replace("¸%%%%¸", matchClose, titleText);
								urlText = str_replace("¸%%%%%¸", matchOpen, urlText);
								urlText = str_replace("¸%%%%¸", matchClose, urlText);

								// Replace &
								titleText = str_replace('&', '&amp;', titleText);
								urlText = str_replace('&', '&amp;', urlText);

								// Replace symbols back to <match> and </match>
								titleText = str_replace(matchOpen, "¸%%%%%¸", titleText);
								titleText = str_replace(matchClose, "¸%%%%¸", titleText);
								urlText = str_replace(matchOpen, "¸%%%%%¸", urlText);
								urlText = str_replace(matchClose, "¸%%%%¸", urlText);

								// Replace opening and closing tags
								titleText = str_replace(">", "&gt;", titleText);
								titleText = str_replace("<", "&lt;", titleText);

								urlText = str_replace(">", "&gt;", urlText);
								urlText = str_replace("<", "&lt;", urlText);

								titleText = str_replace("¸%%%%%¸", matchOpen, titleText);
								titleText = str_replace("¸%%%%¸", matchClose, titleText);
								urlText = str_replace("¸%%%%%¸", matchOpen, urlText);
								urlText = str_replace("¸%%%%¸", matchClose, urlText);

								// Make URLs say "Switch to tab" if tab is open
								for (var ct in window.currentTabs) {
									if (currentTabs[ct].url == hI.url) {
										urlText = 'Switch to tab';
									}
								}

								if (resultIsOkay == true) {
									resultString = "";
									if (urlText.length > 0) {
										// Make a star symbol be the separator if result is a bookmark, otherwise just a dash
										divvy = hI.isBookmark ? '&#9733;' : '-';

										// If URL is truncated, add ...
										if (truncated == 1) {
											urlText += '...';
										}
										resultString += "<url>"+urlText+"</url> <dim>"+divvy+"</dim> "+titleText;
									} else {
										if (hI.isBookmark) {
											resultString += '<dim>&#9733;</dim> ';
										}
										resultString += titleText;
									}

									resultObjects[resultObjects.length] = {content:hI.url, description:resultString};
									currentRows++;
								}
							}
						}
					}
					// Give the results to Chrome to display
					suggest(resultObjects);
				}, errorHandler);
			}
		}, errorHandler);
	}
});

// When user selects which Omnibox+Fauxbar result to go to...
chrome.omnibox.onInputEntered.addListener(function(text){
	var url = text.trim();
	if (url.length == 0) {
		url = chrome.extension.getURL("fauxbar.html");
	}

	// Switch to tab if needed
	for (var t in window.currentTabs) {
		if (window.currentTabs[t].url == url) {
			chrome.tabs.update(window.currentTabs[t].id, {selected:true});
			return false;
		}
	}

	// Decide if URL is valid or not
	var urlIsValid = false;
	if (substr_count(url, " ") == 0) {
		var testUrl = url.toLowerCase();
		if (testUrl.substr(0,7) != 'http://' && testUrl.substr(0,8) != 'https://' && testUrl.substr(0,6) != 'ftp://' && testUrl.substr(0,8) != 'file:///' && testUrl.substr(0,9) != 'chrome://' && testUrl.substr(0,6) != 'about:' && testUrl.substr(0,12) != 'view-source:' && testUrl.substr(0,17) != 'chrome-extension:' && testUrl.substr(0,5) != 'data:') {
			if (substr_count(url, ".") == 0) {
				// it's a search!
			} else {
				url = 'http://'+url;
				urlIsValid = true;
			}
		} else {
			urlIsValid = true;
		}
	}

	// Do a search with Fallback URL if it's not a valid URL
	if (!urlIsValid) {
		if (localStorage.option_fallbacksearchurl && localStorage.option_fallbacksearchurl.length && strstr(localStorage.option_fallbacksearchurl, "{searchTerms}")) {
			url = str_replace("{searchTerms}", urlencode(url), localStorage.option_fallbacksearchurl);
		} else {
			url = 'http://www.google.com/search?btnI=&q='+urlencode(url);
		}
	}

	// Make the tab go to the URL (or Fallback URL)
	chrome.tabs.getSelected(null, function(tab){
		chrome.tabs.update(tab.id, {url:url, selected:true});
	});
});

// Tell Fauxbar to refresh any Address Bar results.
// Used when a tab opens, closes or changes.
// Refreshing is basically so that "Switch to tab" text can be shown or displayed as needed.
function refreshResults() {
	chrome.extension.sendRequest({message:"refreshResults"});
}

// Starts the indexing procress.
function beginIndexing() {
	window.reindexing = true;
	localStorage.indexComplete = 0;
	console.log("Indexing has begun.");
	reindex();
}

// Clear the top site tiles cache every 2 mins
// But disable this for now
/*setInterval(function(){
	if (window.thumbs) {
		delete window.thumbs;
	}
}, 1000 * 60 * 2);*/

// Background page listens for requests...
chrome.extension.onRequest.addListener(function(request, sender){
	// Generate top site tile thumbnail for page if page reports page has not been scrolled at all
	if (request == "scrolltop is 0") {
		if (openDb()) {
			window.db.transaction(function(tx){
				// Check to see if page is a top site
				tx.executeSql('SELECT frecency FROM urls WHERE url = ? LIMIT 1', [sender.tab.url], function(tx, results){
					if (results.rows.length > 0) {
						var frecency = results.rows.item(0).frecency;
						if (frecency >= window.frecencyThreshold) {
							chrome.tabs.getSelected(null, function(selectedTab){
								if (selectedTab.id == sender.tab.id) {
									// Take a screenshot and save the image
									chrome.tabs.captureVisibleTab(null, {format:"png"}, function(dataUrl){
										if (dataUrl != "") {
											var myCanvas = document.createElement("canvas");
											var context = myCanvas.getContext('2d');
											var img = new Image;
											img.onload = function(){
												var width = 430;
												var height = Math.round(img.height * width / img.width)
												myCanvas.width = width;
												myCanvas.height = height;
												context.drawImage(img,0,0, width, height);
												window.db.transaction(function(tx){
													tx.executeSql('DELETE FROM thumbs WHERE url = ?', [sender.tab.url]);
													tx.executeSql('INSERT INTO thumbs (url, data, date, title, frecency) VALUES (?, ?, ?, ?, ?)', [sender.tab.url, myCanvas.toDataURL("image/png"), microtime(true), sender.tab.title, frecency]);
												}, errorHandler);
											};
											img.src = dataUrl;
										}
									});
								}
							});
						}
					}
				});
			}, errorHandler);
		}
	}

	// Store top site thumbs html
	else if (request.action && request.action == "thumbsHtml") {
		window.thumbs = request.content;
	}

	// Request received to do the indexing process
	else if (request.action && request.action == "reindex") {
		beginIndexing();
	}

	// Request to open Fauxbar in the current tab. "NewTab" meaning the New Tab page, not an actual new tab.
	else if (request.action && request.action == "goToNewTab") {
		window.newTabHash = request.hash;
		chrome.tabs.update(sender.tab.id, {url:chrome.extension.getURL("fauxbar.html")+"#"+request.hash});
		setTimeout(function(){
			delete window.newTabHash;
		}, 100);
	}

	// Chrome sometimes truncates page titles for its history items. Don't know why.
	// So, have Fauxbar update it's own database with proper, updated current titles.
	else if (request.action && request.action == "updateUrlTitles") {
		if (sender && sender.tab && sender.tab.url && openDb()) {
			window.db.transaction(function (tx) {
				tx.executeSql('UPDATE urls SET title = ? WHERE url = ? AND type = 1', [request.urltitle, sender.tab.url]);
				tx.executeSql('UPDATE thumbs SET title = ? WHERE url = ?', [request.urltitle, sender.tab.url]);
			}, errorHandler);
		}
	}

	// After user clicks the Page Action to add a new search engine to Fauxbar, this hides the Page Action.
	else if (request.action && request.action == 'waitingToClose') {
		window.lastClosureMessage = getMs();
		window.lastSenderTabId = request.tabid;
		setTimeout(function(){
			if (getMs() - window.lastClosureMessage > 75) {
				chrome.tabs.getAllInWindow(null, function(tabs){
					for (var t in tabs) {
						if (strstr(tabs[t].url, request.hostname)) {
							chrome.pageAction.hide(tabs[t].id);
							if (localStorage.option_forceoptionsicon && localStorage.option_forceoptionsicon == 1) {
								chrome.pageAction.setIcon({tabId:tabs[t].id, path:"fauxbar16options.png"});
								chrome.pageAction.setTitle({tabId:tabs[t].id, title:"Customize Fauxbar"});
								chrome.pageAction.setPopup({tabId:tabs[t].id, popup:""});
								chrome.pageAction.onClicked.addListener(function(theTab) {
									chrome.tabs.update(theTab.id, {url:"fauxbar.html#options=1"});
								});
								chrome.pageAction.show(tabs[t].id);
							}
						}
					}
				});
			}
		}, 100);
	}

	// Show the Page Action if the page has a search engine that can be added to Fauxbar.
	else if (request.action && request.action == "showPageAction") {
		if (openDb()) {
			if (request.xmlurl && request.xmlurl != '') {
				var myStatement = 'SELECT * FROM opensearches WHERE xmlurl = ?';
				var myArray = [request.xmlurl];
			}
			else if (request.improper && request.improper == true && request.actionAttr && request.actionAttr != '') {
				var myStatement = 'SELECT * FROM opensearches WHERE searchurl LIKE ?';
				var myArray = ['%'+request.hostname+'%'];
			}
			else {
				console.log('Fauxbar: Error processing PageAction.');
				return false;
			}

			window.db.transaction(function (tx) {
				tx.executeSql(myStatement, myArray, function (tx, results) {
					var len = results.rows.length, i;
					if (len == 0) {
						chrome.pageAction.setIcon({tabId:sender.tab.id, path:"fauxbar16plus.png"});
						chrome.pageAction.setTitle({tabId:sender.tab.id, title:"Add this site's search engine to Fauxbar"});
						chrome.pageAction.setPopup({tabId:sender.tab.id, popup:"fauxbar.addsearchengine.html"});
						chrome.pageAction.show(sender.tab.id);
					}// else {
						//console.log('OpenSearch found but already exists within Fauxbar.');
					//}
				});
			}, errorHandler);
		}
	}
});

// Tabs! //

// When tab is removed or created, refresh any current Address Box results so they can show/hide any "Switch to tab" texts
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	refreshResults();
});
chrome.tabs.onCreated.addListener(function(tabId) {
	refreshResults();
});

// When user changes tabs, send request if the tab has not been scrolled down, to see if the page should have a new top site tile thumbnail generated
chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo){
	chrome.tabs.get(tabId, function(tab){
		if (tab.url.substr(0,7) == 'http://' || tab.url.substr(0,8) == 'https://') {
			if (tab.selected == true && tab.status == "complete") {
				chrome.tabs.executeScript(tab.id, {file:"getscrolltop.js"});
			}
		}
	});
});

// When a tab changes its URL, or finishes loading the page...
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

	// Refresh results for "Switch to tab" texts
	refreshResults();

	// If URL is a web page...
	if (tab.url.substr(0,7) == 'http://' || tab.url.substr(0,8) == 'https://') {

		// If page has finished loading, update its title in Fauxbar's database
		if (tab.status == "complete") {
			chrome.tabs.executeScript(tabId, {file:"updatetitle.js"});
		}

		// If user has opted to enable Alt+D, Ctrl+L or Ctrl+L functionality, make it so
		if ((localStorage.option_altd && localStorage.option_altd == 1) || (localStorage.option_ctrll && localStorage.option_ctrll == 1) || (localStorage.option_ctrlk && localStorage.option_ctrlk == 1)) {
			chrome.tabs.executeScript(tabId, {file:"jquery.hotkeys.js"});
			if (localStorage.option_altd && localStorage.option_altd == 1) {
				chrome.tabs.executeScript(tabId, {file:"alt-d.js"});
			}
			if (localStorage.option_ctrll && localStorage.option_ctrll == 1) {
				chrome.tabs.executeScript(tabId, {file:"ctrl-l.js"});
			}
			if (localStorage.option_ctrlk && localStorage.option_ctrlk == 1) {
				chrome.tabs.executeScript(tabId, {file:"ctrl-k.js"});
			}
		}

		// If user's opted to always show the Options icon, make it so
		if (localStorage.option_forceoptionsicon && localStorage.option_forceoptionsicon == 1) {
			chrome.pageAction.setIcon({tabId:tabId, path:"fauxbar16options.png"});
			chrome.pageAction.setTitle({tabId:tabId, title:"Customize Fauxbar"});
			chrome.pageAction.setPopup({tabId:tabId, popup:""});
			chrome.pageAction.onClicked.addListener(function(theTab) {
				chrome.tabs.update(theTab.id, {url:"fauxbar.html#options=1"});
			});
			chrome.pageAction.show(tabId);
		}

		// If user's opted to let Fauxbar look for new search engines to add, make it so
		if (localStorage.option_osproper && localStorage.option_osproper == 1) {
			chrome.tabs.executeScript(tabId, {file:"osproper.js"});
		}
		if (localStorage.option_osimproper && localStorage.option_osimproper == 1) {
			chrome.tabs.executeScript(tabId, {file:"osimproper.js"});
		}

		// Generate thumbnail if page is a top site
		if (tab.selected == true && tab.status == "complete") {
			chrome.tabs.executeScript(tab.id, {file:"getscrolltop.js"});
		}
	}
});

// When tab moves to a new Window, refresh Address Box results "Switch to tab" texts
chrome.tabs.onDetached.addListener(function(tabId, detachInfo) {
	refreshResults();
});
chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {
	refreshResults();
});

// History! //

// When Chrome adds a page visit to its history index, update Fauxbar's index with this information.
// note: Chrome adds a "visit" as soon as the page starts loading. But this happens before the <title> tag is read, and so visits sometimes aren't recorded with a title in Chrome's history the first time they're loaded.
chrome.history.onVisited.addListener(function(historyItem) {
	// If the visit is to Fauxbar's page, remove it from Chrome's history. Don't need to litter the user's history with every instance that Fauxbar is opened when they open a new tab.
	if (strstr(historyItem.url, chrome.extension.getURL(""))) {
		chrome.history.deleteUrl({url:historyItem.url});
	}
	// If the visit is a pure data source, like maybe viewing an inline image, don't add it to Fauxbar; it'll slow Fauxbar down too much. Plus it acts as a titleless result, which isn't very helpful.
	else if (historyItem.url.substr(0, 5) == 'data:') {
		return false;
	}
	// Otherwise, we want to add the visit to Fauxbar's database...
	else if (openDb()) {
		window.db.transaction(function (tx) {
			// See if it exists...
			tx.executeSql('SELECT * FROM urls WHERE url = ? AND type = 1 AND queuedfordeletion = 0', [historyItem.url], function(tx, results){
				var len = results.rows.length, i;
				// If URL doesn't exist in Fauxbar's database, add it
				if (len == 0) {
					chrome.history.getVisits({url:historyItem.url}, function(visitItems){
						visitItems.reverse();
						if (visitItems[0].transition != 'auto_subframe') {
							window.db.transaction(function (tx) {
								var frecency = calculateFrecency(visitItems);
								tx.executeSql('INSERT OR REPLACE INTO urls (url, type, title, frecency, queuedfordeletion) VALUES (?, ?, ?, ?, ?)', [historyItem.url, 1, historyItem.title, frecency, 0]);
								tx.executeSql('UPDATE urls SET frecency = ? WHERE url = ?', [frecency, historyItem.url]);
								tx.executeSql('UPDATE thumbs SET frecency = ? WHERE url = ?', [frecency, historyItem.url]);
							}, errorHandler);
						}
					});
				}
				// If URL *does* exist, update it with a new frecency score
				else {
					chrome.history.getVisits({url:historyItem.url}, function(visitItems){
						visitItems.reverse();
						window.db.transaction(function (tx) {
							var frecency = calculateFrecency(visitItems);
							tx.executeSql('UPDATE urls SET frecency = ? WHERE url = ?', [frecency, historyItem.url]);
							tx.executeSql('UPDATE thumbs SET frecency = ? WHERE url = ?', [frecency, historyItem.url]);
						}, errorHandler);
					});
				}
				tx.executeSql('SELECT frecency FROM urls WHERE type = 1 ORDER BY frecency DESC LIMIT 25,25', [], function(tx, results){
					window.frecencyThreshold = results.rows.item(0).frecency;
				});
			}, errorHandler);

		}, errorHandler);
	}
});

// If Chrome removes a visit from its history, update frecency scores in Fauxbar for the URL, or delete the URL completely if all visits have been removed.
chrome.history.onVisitRemoved.addListener(function(removed) {
	if (openDb()) {
		if (removed.allHistory == true) {
			window.db.transaction(function(tx){
				tx.executeSql('DELETE FROM urls WHERE type = 1');
				tx.executeSql('DELETE FROM thumbs');
				tx.executeSql('UPDATE urls SET frecency = ? WHERE type = 2', [localStorage.option_frecency_unvisitedbookmark]);
			}, errorHandler);
		}
		else {
			for (var r in removed.urls) {
				removedUrl = removed.urls[r];
				chrome.history.getVisits({url:removedUrl}, function(visitItems){
					visitItems.reverse();
					window.db.transaction(function (tx) {
						tx.executeSql('DELETE FROM urls WHERE type = 1 AND url = ?', [removedUrl]);
						tx.executeSql('DELETE FROM thumbs WHERE url = ?', [removedUrl]);
						var frecency = calculateFrecency(visitItems);
						tx.executeSql('UPDATE urls SET frecency = ? WHERE url = ? AND type = 2', [frecency, removedUrl]);
					}, errorHandler);
				});
			}
		}
	}
});

// Bookmarks! //

// If a Chrome bookmark gets edited, update the change in Fauxbar
chrome.bookmarks.onChanged.addListener(function(id, changeInfo){
	if (changeInfo.url && changeInfo.url.length > 0 && openDb()) {
		chrome.history.getVisits({url:changeInfo.url}, function(visits){
			visits.reverse();
			window.db.transaction(function(tx){
				tx.executeSql('UPDATE urls SET url = ?, title = ?, frecency = ? WHERE type = 2 AND id = ?', [changeInfo.url, changeInfo.title, localStorage.option_frecency_unvisitedbookmark, id]);
				var frec = calculateFrecency(visits);
				tx.executeSql('UPDATE urls SET frecency = ? WHERE url = ?', [frec, changeInfo.url]);
				tx.executeSql('UPDATE thumbs SET frecency = ? WHERE url = ?', [frec, changeInfo.url]);
			}, errorHandler);
		});
	}
});

// If bookmark is created, add it to Fauxbar
chrome.bookmarks.onCreated.addListener(function(id, bookmark){
	if (bookmark.url && bookmark.url.length > 0 && openDb()) {
		chrome.history.getVisits({url:bookmark.url}, function(visits){
			visits.reverse();
			window.db.transaction(function(tx){
				tx.executeSql('INSERT INTO urls (url, title, type, id, frecency) VALUES (?, ?, ?, ?, ?)', [bookmark.url, bookmark.title, 2, bookmark.id, visits.length > 0 ? calculateFrecency(visits) : localStorage.option_frecency_unvisitedbookmark]);
			}, errorHandler);
		});
	}
});

// If bookmark is removed, remove it from Fauxbar
chrome.bookmarks.onRemoved.addListener(function(id, removeInfo){
	if (openDb()) {
		window.db.transaction(function(tx){
			tx.executeSql('DELETE FROM urls WHERE id = ? AND type = 2', [id], function(tx, results){
				window.results = results;
				if (results.rowsAffected == 0) {
					tx.executeSql('DELETE FROM urls WHERE type = 2', []);
				}
				// If a folder was deleted, Fauxbar has no idea what was inside, so need to re-index all bookmarks. Could keep proper track of bookmarks and folders, but meh.
			});
		}, errorHandler);
		setTimeout(function(){
			if (results.rowsAffected == 0) {
				chrome.bookmarks.getTree(function(bookmarkTreeNodes){
					for (var b in bookmarkTreeNodes) {
						indexBookmarks(bookmarkTreeNodes[b]);
					}
				});
				window.frecencyStatements = new Array();
				assignFrecencies();
			}
		}, 1000);
	}
});