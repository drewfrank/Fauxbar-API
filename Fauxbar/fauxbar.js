//// This file is used by Fauxbar's main page. ////

// Fauxbar-crafted code begins below, after this plugin.

/* http://www.48design.de/news/2009/11/20/kollisionsabfrage-per-jquery-plugin-update-v11-8/
* Collision Check Plugin v1.1
* Copyright (c) Constantin Groß, 48design.de
* v1.2 rewrite with thanks to Daniel
*
* @requires jQuery v1.3.2
* @description Checks single or groups of objects (divs, images or any other block element) for collission / overlapping
* @returns an object collection with all colliding / overlapping html objects
*
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*
*/
(function($) {
 $.fn.collidesWith = function(elements) {
  var rects = this;
  var checkWith = $(elements);
  var c = $([]);

  if (!rects || !checkWith) { return false; }

  rects.each(function() {
   var rect = $(this);

   // define minimum and maximum coordinates
   var rectOff = rect.offset();
   var rectMinX = rectOff.left;
   var rectMinY = rectOff.top;
   var rectMaxX = rectMinX + rect.outerWidth();
   var rectMaxY = rectMinY + rect.outerHeight();

   checkWith.not(rect).each(function() {
    var otherRect = $(this);
    var otherRectOff = otherRect.offset();
    var otherRectMinX = otherRectOff.left;
    var otherRectMinY = otherRectOff.top;
    var otherRectMaxX = otherRectMinX + otherRect.outerWidth();
    var otherRectMaxY = otherRectMinY + otherRect.outerHeight();

    // check for intersection
    if ( rectMinX >= otherRectMaxX ||
         rectMaxX <= otherRectMinX ||
         rectMinY >= otherRectMaxY ||
         rectMaxY <= otherRectMinY ) {
           return true; // no intersection, continue each-loop
    } else {
		// intersection found, add only once
		if(c.length == c.not(this).length) { c.push(this); }
    }
   });
        });
   // return collection
        return c;
 }
})(jQuery);

////// Fauxbar-crafted code below ///////

function showContextMenu(e) {

	var html = '';
	var usingSuperTriangle = e.currentTarget && e.currentTarget.className && (strstr(e.currentTarget.className,"superselect") ? true : false);
	if (usingSuperTriangle == true) {
		var y = $(".superselect").first().offset().top+$(".superselect").first().outerHeight();
		var x = $(".superselect").first().offset().left;
	}
	else if ($("#opensearch_triangle .glow").length) {
		var y = $("#opensearch_triangle").offset().top+$("#opensearch_triangle").outerHeight();
		var x = $("#opensearch_triangle").offset().left;
	}
	else {
		var y = e.pageY;
		var x = e.pageX;
	}
	html += '<div id="contextMenu" style="top:'+y+'px; left:'+x+'px; opacity:0" '+(usingSuperTriangle ? 'class="supercontext"' : '')+'>';
	var cutCopyPaste = false;

	if ($('input[type="text"]:focus, textarea:focus').length) {
		var currentVal = $('input[type="text"]:focus, textarea:focus').val();
		if ($('input[type="text"]:focus, textarea:focus').getSelection().length) {
			html += '	<div class="menuOption">Cut</div>';
			html += '	<div class="menuOption">Copy</div>';
			cutCopyPaste = true;
		}

		document.execCommand("paste");
		var newVal = $('input[type="text"]:focus, textarea:focus').val();
		document.execCommand("undo");
		if (newVal != currentVal) {
			html += '	<div class="menuOption">Paste</div>';
			cutCopyPaste = true;
			if ($("#awesomeinput:focus").length && !window.keywordEngine && !window.tileEditMode) {
				html += '	<div class="menuOption">Paste &amp; Go</div>';
			} else if ($("#opensearchinput:focus").length || ($("#awesomeinput:focus").length && window.keywordEngine)) {
				html += '	<div class="menuOption">Paste &amp; Search</div>';
			}
		}

		if ($('input[type="text"]:focus, textarea:focus').getSelection().length) {
			html += '	<div class="menuOption">Delete</div>';
			cutCopyPaste = true;
		}

		if ($('input[type="text"]:focus, textarea:focus').val().length && $('input[type="text"]:focus, textarea:focus').getSelection().length != $('input[type="text"]:focus, textarea:focus').val().length) {
			if (cutCopyPaste == true) {
				html += '	<div class="menuHr"></div>';
			}
			html += '	<div class="menuOption">Select All</div>';
			cutCopyPaste = true;
		}
		if (cutCopyPaste == true) {
			html += '	<div class="menuHr"></div>';
		}
	}

	delete window.contextHref;
	delete window.linkIsApp;
	delete window.rightClickedApp;
	delete window.rightClickedResult;

	if (e.target.href && e.target.href.length) {
		window.contextHref = e.target.href;
		$(e.target).addClass("rightClickedTile");
		if (strstr(e.target.className, "result")) {
			$(e.target).addClass("rightClickedResult");
			window.rightClickedResult = e.target;
		}
		else if (strstr(e.target.className, "app")) {
			$(e.target).addClass("rightClickedApp");
			if (!strstr(e.target.href,"https://chrome.google.com/webstore")) {
				window.linkIsApp = true;
				window.rightClickedApp = e.target;
			}
		}
	} else if ($(e.target).parents('a').first().length) {
		window.contextHref = $(e.target).parents('a').first().attr("href");
		$(e.target).parents('a').first().addClass("rightClickedTile");
		if ($(e.target).parents('.result').length) {
			$(e.target).parents('.result').first().addClass("rightClickedResult");
			window.rightClickedResult = $(e.target).parents('.result').first();
		}

		$(e.target).parents('.app').first().addClass("rightClickedApp");
		if ($(e.target).parents('.app').length && !strstr($(e.target).parents('.app').first().attr("href"), "https://chrome.google.com/webstore")) {
			window.linkIsApp = true;
			window.rightClickedApp = $(e.target).parents('.app').first();
		}
	}

	if (window.contextHref && !window.tileEditMode) {
		var loadFile = "loadfile.html#";
		if (window.contextHref.substr(0,loadFile.length) == loadFile) {
			window.contextHref = window.contextHref.substr(loadFile.length);
		}
		if (window.linkIsApp) {
			html += '	<div class="menuOption disabled"><b>'+$(window.rightClickedApp).attr("appname")+'</b></div>';
			html += '	<div class="menuHr"></div>';
			html += '	<div class="menuOption">Open App in New Tab</div>';
			html += '	<div class="menuOption">Open App in New Window</div>';
			html += '	<div class="menuOption">Copy Link Address</div>';
			html += '	<div class="menuHr"></div>';
			html += '	<div class="menuOption">Uninstall</div>';
		} else {
			html += '	<div class="menuOption">Open Link in New Tab</div>';
			html += '	<div class="menuOption">Open Link in New Window</div>';
			html += '	<div class="menuOption">Open Link in Incognito Window</div>';
			html += '	<div class="menuOption">Copy Link Address</div>';
			html += '	<div class="menuHr"></div>';
			if (window.rightClickedResult) {
				if ($(window.rightClickedResult).attr("bmid") > 0) {
					html += '	<div class="menuOption">Edit Bookmark...</div>';
				} else {
					html += '	<div class="menuOption">Add Bookmark</div>';
				}
				html += '	<div class="menuHr"></div>';
				if (!$(window.rightClickedResult).attr("keyword")) {
					html += '	<div class="menuOption fauxbar16">Add Keyword...</div>';
				} else {
					html += '	<div class="menuOption fauxbar16">Edit Keyword...</div>';
				}
				html += '	<div class="menuHr"></div>';
			}
		}
	}

	if (usingSuperTriangle || $("#awesomeinput:focus").length) {
		$("#super_triangle .triangle").addClass("glow");
		html += '	<div class="menuOption" style="background-image:url(chrome://favicon/null); background-repeat:no-repeat; background-position:4px 2px">History &amp; Bookmarks</div>';
		// To do: implement these later on.
		//html += '	<div class="menuOption" style="background-image:url(omnibox_star_dark.png); background-repeat:no-repeat; background-position:3px 1px; background-size:18px 18px">Bookmarks</div>';
		//html += '	<div class="menuOption" style="background-image:url(omnibox_history_dark.png); background-repeat:no-repeat; background-position:2px 0px; background-size:20px 20px">History</div>';
		//html += '	<div class="menuOption" style="background-image:url(large_history_favicon.png); background-repeat:no-repeat; background-position:2px 0px; background-size:20px 20px">"Full" History</div>';
		html += '	<div class="menuHr"></div>';
	}

	if (($("#opensearchinput:focus, #awesomeinput:focus").length || usingSuperTriangle || $("#opensearch_triangle .glow").length) && !window.tileEditMode) {
		$(".menuitem").each(function(){
			if ($(this).attr("shortname")) {
				html += '	<div class="menuOption engine" shortname="'+$(this).attr("shortname")+'" keyword="'+$(this).attr("keyword")+'" style="background-image:url('+$(this).attr("iconsrc")+'); background-repeat:no-repeat; background-position:4px 2px">'+
				$(this).attr("shortname")+
				($(this).attr("keyword") && !strstr($(this).attr("keyword"),"fakekeyword_") ? ' <span style="display:inline-block; opacity:.5; float:right; margin-right:-20px">&nbsp;'+$(this).attr("keyword")+'</span>' : '') +
				'</div>';
			}
		});
		html += '	<div class="menuHr"></div>';
	}

	if (localStorage.indexComplete == 1 && !window.tileEditMode && !$('input[type="text"]:focus, textarea:focus').length && !usingSuperTriangle && !$("#opensearch_triangle .glow").length && !getHashVar("options") && /*localStorage.option_pagetilearrangement == "manual"*/ (localStorage.option_showtopsites == 1 || localStorage.option_showapps == 1) && !window.contextHref) {
		html += '	<div class="menuOption fauxbar16">Edit Tiles...</div>';
	}
	else if (window.tileEditMode && !$('input:focus').length) {
		delete window.tileThumb;
		if (strstr(e.target.className,"sitetile")) {
			window.tileThumb = e.target;
		}
		else if ($(e.target).parents('.sitetile').first().length) {
			window.tileThumb = $(e.target).parents('.sitetile').first();
		}
		if (window.tileThumb) {
			html += '	<div class="menuOption fauxbar16">Rename Tile...</div>';
			html += '	<div class="menuOption fauxbar16">Remove Tile</div>';
			html += '	<div class="menuHr"></div>';
		}

		if (!window.tileThumb) {
			html += '	<div class="menuOption fauxbar16">Save Changes</div>';
			html += '	<div class="menuOption fauxbar16">Cancel Changes</div>';
			html += '	<div class="menuHr"></div>';
		}
	}


	if (($("#opensearchinput:focus, #awesomeinput:focus").length || usingSuperTriangle || $("#opensearch_triangle .glow").length) && !window.tileEditMode) {
		html += '	<div class="menuOption fauxbar16">Edit Search Engines...</div>';
	}
	if (localStorage.indexComplete == 1) {
		if (!getHashVar("options").length) {
			if (!window.tileThumb && !window.linkIsApp) {
				html += '	<div class="menuOption fauxbar16">Customize Fauxbar...</div>';
				html += '	<div class="menuHr"></div>';
			}
		} else {
			html += '	<div class="menuOption fauxbar16">Close Options</div>';
			html += '	<div class="menuHr"></div>';
		}
	}

	if (!window.linkIsApp) {
		html += '	<div class="menuOption disabled" style="">Fauxbar v'+localStorage.currentVersion+'</div>';
	}

	html += '</div>';
	$("body").append(html);

	if ($("#contextMenu").offset().left + $("#contextMenu").outerWidth() > window.innerWidth) {
		$("#contextMenu").css("left",window.innerWidth - $("#contextMenu").outerWidth() + "px");
	}

	if ($("#contextMenu").offset().top + $("#contextMenu").outerHeight() > window.innerHeight) {
		$("#contextMenu").css("top",window.innerHeight - $("#contextMenu").outerHeight() + "px");
	}

	$(".menuOption.fauxbar16").first().css("background-image","url(fauxbar16.png)").css("background-repeat","no-repeat").css("background-position","4px 2px");
	$("#contextMenu").animate({opacity:1},100);
}

function removeContextMenu() {
	$("#contextMenu").remove();
	$(".glow").removeClass("glow");
	$(".rightClickedTile").removeClass("rightClickedTile");
	$(".rightClickedResult").removeClass("rightClickedResult");
	$(".rightClickedApp").removeClass("rightClickedApp");
}

$(document).ready(function(){
	$(".superselect").live("mousedown",function(e){
		if (localStorage.indexComplete == 1) {
			if ($("#super_triangle .triangle.glow").length) {
				removeContextMenu();
			} else {
				removeContextMenu();
				hideResults();
				$("#opensearch_results").css("display","none").html("");
				$("#super_triangle .triangle").addClass("glow");
				$("#awesomeinput").blur();
				showContextMenu(e);
			}
		}
		return false;
	});

	$("body").live("contextmenu",function(e){
		if (!$(".glow").length) {
			removeContextMenu();
			if (e.button == 2 && !e.ctrlKey) {
				if (e.target.id != "addressbaricon" && !strstr(e.target.className, "triangle")) {
					showContextMenu(e);
				}
				return false;
			}
		} else {
			return false;
		}
	});
	$("#contextMenu").live("mouseenter", function(){
		$(".arrowed").removeClass("arrowed");
	});


	$("#contextMenu .menuOption").live("mousedown", function(){
		if ($("input:focus, textarea:focus").length) {
			var elId = $("input:focus, textarea:focus").attr("id");
			var len = $("input:focus, textarea:focus").val().length;
			var sel = $("input:focus, textarea:focus").getSelection();
		}

		if (!$(this).hasClass("disabled")) {
			switch ($(this).text()) {

				case "Edit Bookmark...":
					chrome.tabs.create({url:"chrome://bookmarks/?#q="+$(window.rightClickedResult).attr("url"), selected:true});
					break;

				case "Add Bookmark":
					chrome.bookmarks.getChildren("0", function(nodes){
						for (var n in nodes) {
							if (nodes[n].id != 1) {
								chrome.bookmarks.create({parentId:nodes[n].id, title:$(window.rightClickedResult).attr("origtitle"), url:$(window.rightClickedResult).attr("url")}, function(){
									setTimeout(function(){
										if ($("#awesomeinput").val().length) {
											getResults();
										} else {
											$("#awesomeinput").focus();
											getResults(true);
										}
									}, 100);
								});
								break;
							}
						}
					});
					break;

				case "Add Keyword...":
					$("#contextMenu").css("opacity",0);
					var keyword = prompt('Add a keyword for '+$(window.rightClickedResult).attr("url"));
					if (keyword) {
						keyword = str_replace('"', '', keyword.trim());
						if (keyword.length && openDb()) {
							window.db.transaction(function(tx){
								tx.executeSql('UPDATE urls SET tag = ? WHERE url = ?', [keyword, $(window.rightClickedResult).attr("url")]);
								tx.executeSql('DELETE FROM tags WHERE url = ?', [$(window.rightClickedResult).attr("url")]);
								tx.executeSql('INSERT INTO tags (url, tag) VALUES (?, ?)', [$(window.rightClickedResult).attr("url"), keyword]);
							}, function(t){
								errorHandler(t, getLineInfo());
							}, function(){
								if ($("#awesomeinput").val().length) {
									getResults();
								} else {
									$("#awesomeinput").focus();
									getResults(true);
								}
							});
						}
					}
					break;

				case "Edit Keyword...":
					$("#contextMenu").css("opacity",0);
					var keyword = prompt('Edit the keyword for '+$(window.rightClickedResult).attr("url"), $(window.rightClickedResult).attr("keyword"));
					if (keyword != null) {
						keyword = str_replace('"', '', keyword.trim());
						if (keyword.length && openDb()) {
							window.db.transaction(function(tx){
								tx.executeSql('UPDATE urls SET tag = ? WHERE url = ?', [keyword, $(window.rightClickedResult).attr("url")]);
								tx.executeSql('UPDATE tags SET tag = ? WHERE url = ?', [keyword, $(window.rightClickedResult).attr("url")]);
							}, function(t){
								errorHandler(t, getLineInfo());
							}, function(){
								if ($("#awesomeinput").val().length) {
									getResults();
								} else {
									$("#awesomeinput").focus();
									getResults(true);
								}
							});
						}
						else if (openDb()) {
							window.db.transaction(function(tx){
								tx.executeSql('UPDATE urls SET tag = ? WHERE url = ?', ["", $(window.rightClickedResult).attr("url")]);
								tx.executeSql('DELETE FROM tags WHERE url = ?', [$(window.rightClickedResult).attr("url")]);
							}, function(t){
								errorHandler(t, getLineInfo());
							}, function(){
								if ($("#awesomeinput").val().length) {
									getResults();
								} else {
									$("#awesomeinput").focus();
									getResults(true);
								}
							});
						}
					}
					break;

				case "Uninstall":
					removeContextMenu();
					confirm("Uninstall \""+$(window.rightClickedApp).attr("appname")+"\" from Chrome?") ? chrome.management.uninstall($(window.rightClickedApp).attr("appid")) + $(window.rightClickedApp).remove() : null;
					break;

				case "Rename Tile...":
					removeContextMenu();
					var text = prompt("Rename tile:",$(window.tileThumb).attr("origtitle"));
					if (text) {
						$(".toptitletext",window.tileThumb).text(text);
						$(window.tileThumb).attr("origtitle",text);
						truncatePageTileTitle($(".toptitle",window.tileThumb));
					}
					break;

				case "Remove Tile":
					$(window.tileThumb).animate({opacity:0}, 350, function(){
						$(this).remove();
					});
					break;

				case "Open Link in New Tab":
					chrome.tabs.create({url:window.contextHref, selected:false});
					break;

				case "Open App in New Tab":
					chrome.tabs.create({url:window.contextHref, selected:false});
					break;

				case "Open Link in New Window":
					chrome.windows.create({url:window.contextHref});
					break;

				case "Open App in New Window":
					chrome.windows.create({url:window.contextHref});
					break;

				case "Open Link in Incognito Window":
					chrome.windows.create({url:window.contextHref, incognito:true});
					break;

				case "Copy Link Address":
					$("body").append('<input id="copyLink" type="text" value="'+window.contextHref+'" style="position:absolute; z-index:-500000; opacity:0" />');
					$("#copyLink").select();
					document.execCommand('copy');
					$("#copyLink").remove();
					break;

				case "Close Options":
					closeOptions();
					break;

				case "Save Changes":
					saveSiteTiles();
					break;

				case "Cancel Changes":
					cancelTiles();
					break;

				case "Reload":
					window.location.reload();
					break;

				case "Back":
					window.history.go(-1);
					break;

				case "Forward":
					window.history.go(1);
					break;

				case "Cut":
					document.execCommand("cut");
					break;

				case "Copy":
					document.execCommand("copy");
					break;

				case "Paste":
					window.justPasted = true;
					document.execCommand("paste");
					if (elId == "awesomeinput") {
						setTimeout(getResults,1);
					} else if (elId == "opensearchinput") {
						setTimeout(getSearchSuggestions,1);
					}
					break;

				case "Paste & Go":
					window.justPasted = true;
					window.navigating = true;
					$("#awesomeinput").val("");
					document.execCommand("paste");
					setTimeout(function(){
						if ($("#awesomeinput").val().trim().length) {
							if (window.keywordEngine) {
								submitOpenSearch($("#awesomeinput").val());
							} else {
								goToUrl($("#awesomeinput").val());
							}
							setTimeout(function(){
								$("#awesomeinput").blur();
							},1);
						} else {
							$("#awesomeinput").focus();
						}
					},1);
					break;

				case "Paste & Search":
					window.justPasted = true;
					window.navigating = true;
					$("#"+elId).val("");
					document.execCommand("paste");

					setTimeout(function(){
						if ($("#"+elId).val().trim().length) {
							submitOpenSearch($("#"+elId).val());
							if (elId != "awesomeinput") {
								setTimeout(function(){
									$("#"+elId).blur();
								},1);
							}
						} else {
							$("#"+elId).focus();
						}
					},1);
					break;

				case "Delete":
					window.justDeleted = true;
					document.execCommand("delete");
					break;

				case "Select All":
					document.execCommand("selectAll");
					break;

				case "History & Bookmarks":
					delete window.keywordEngine;
					$("#awesomeInsetButton").removeClass("insetButton").addClass("noInsetButton");
					$("#addressbaricon").attr("src","chrome://favicon/null").css("opacity",.75);
					$(".switchtext").html("Switch to tab:").css("display","");
					$("#awesomeinput").attr("placeholder",window.placeholder).focus();
					break;

				case "Edit Search Engines...":
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
					break;

				case "Customize Fauxbar...":
					if (window.tileEditMode) {
						localStorage.option_optionpage = "option_section_tiles";
					}
					window.location = "fauxbar.html#options=1";
					window.location.reload();
					break;

				case "Edit Tiles...":
					if (localStorage.option_showtopsites == 1 && localStorage.option_pagetilearrangement == "manual") {
						enterTileEditMode();
					} else {
						localStorage.option_optionpage = "option_section_tiles";
						window.location = "fauxbar.html#options=1";
						window.location.reload();
					}
					break;

				default:
					if ($(this).hasClass("engine")) {
						if ($("#awesomeinput:focus").length || $(".supercontext").length) {
							if (!window.keywordEngine) {
								if ($(this).attr("keyword").length) {
									$("#awesomeinput").val($(this).attr("keyword")+" "+$("#awesomeinput").val()).focus();
									setTimeout(getResults,1);
								}
							} else {
								var en = window.keywordEngine;
								var newKeyword = $(this).attr("keyword");
								$("#awesomeinput").blur().val(newKeyword+" "+$("#awesomeinput").val()).focus();
								setTimeout(function(){
									getResults();
								},1);
							}
						} else if ($("#opensearchinput:focus").length || $("#opensearch_triangle .glow").length) {
							$("#opensearch_results").css("display","none").html("");
							selectOpenSearchType($('.menuitem[shortname="'+str_replace('"','&quot;',$(this).attr("shortname"))+'"]'), false);
							if ($("#opensearch_triangle .glow").length) {
								$("#opensearchinput").focus();
							}
							if ($("#opensearchinput").val().trim().length) {
								setTimeout(getSearchSuggestions,1);
							}
						}
					}
					break;
			}
			removeContextMenu();
			return false;
		} else {
			return false;
		}
		if (window.justPasted) {
			setTimeout(function(){
				getResults();
			},10);
		}
		setTimeout(function(){
			window.justUsedContextMenu = true;
			var newLen = $("#"+elId).val().length;
			if (sel && sel.length) {

				if (len == newLen) {
					$("#"+elId).setSelection(sel.start, sel.end);
				} else if (sel.length >= newLen) {
					$("#"+elId).setSelection(sel.end, sel.end);
				} else {
					//$("#"+elId).setSelection(newLen);
					//$("#"+elId).focus();
				}
			} else {
				$("#"+elId).setSelection(sel.start+(newLen-len));
			}
		},100);
	});
});
$("body").live("mousedown", function(e){
	if (e.target.className != "menuOption" && e.target.className != "menuOption disabled" && e.target.id != "contextMenu") {
		removeContextMenu();
	}
});
$(window).bind("blur", function(){
	removeContextMenu();
});
$("*").bind("keydown", function(){
	removeContextMenu();
});

// Show update message if it hasn't been read yet
if (localStorage.readUpdateMessage && localStorage.readUpdateMessage == 0) {

	function dismissUpdateMessage(viewChangelog) {
		localStorage.readUpdateMessage = 1;
		if (viewChangelog == true) {
			chrome.tabs.create({url:"http://code.google.com/p/fauxbar/wiki/Changelog", selected:true}, function(){
				$("#editmodeContainer").remove();
			});
		} else {
			$("#editmodeContainer").remove();
		}
	}

	$(document).ready(function(){
		$("#maindiv").before('<div id="editmodeContainer" style="box-shadow:0 2px 2px rgba(0,0,0,.3);"><div id="manualmode"><img src="fauxbar48.png" /> Fauxbar has been updated to version '+localStorage.currentVersion + localStorage.updateBlurb+'</div></div>');
		$("#editmodeContainer").prepend('<div id="editModeButtons"><button onclick="dismissUpdateMessage(true)" style="font-family:'+localStorage.option_font+', Lucida Grande, Segoe UI, Arial, sans-serif;">View Full Changelog</button>&nbsp;<button onclick="dismissUpdateMessage()" style="font-family:'+localStorage.option_font+', Lucida Grande, Segoe UI, Arial, sans-serif;">Dismiss</button></div>');
	});
}

// Placeholder text for Address Box
window.placeholder = "Go to a web site";

// Initial loading calls this function (icon canvas coloring), but it's slow. Real function gets created later
function processFilters() {}

// Save new site tile configuration/layout
function saveSiteTiles(justChecking) {
	var tiles = new Array;
	$("#topthumbs a").each(function(){
		tiles[tiles.length] = {url:$(this).attr("url"), title:$(this).attr("origtitle")};
	});
	if (justChecking == true) {
		return JSON.stringify(tiles);
	} else {
		$("button").first().prop("disabled",true).text("Saving...").next().remove();
		if (openDb()) {
			window.db.transaction(function(tx){
				tx.executeSql('UPDATE thumbs SET manual = 0');
				$("#topthumbs a").each(function(){
					var a = this;
					tx.executeSql('UPDATE thumbs SET manual = 1 WHERE url = ?', [$(a).attr("url")], function(tx, results){
						if (results.rowsAffected == 0) {
							tx.executeSql('INSERT INTO thumbs (url, manual) VALUES (?, 1)', [$(a).attr("url")]);
						}
					});
				});
				tx.executeSql('DELETE FROM thumbs WHERE frecency < ? AND frecency > -1 AND manual != 1', [window.bgPage.frecencyThreshold]);

			}, function(t){
				errorHandler(t, getLineInfo());
			}, function(){
				// success
				chrome.extension.sendRequest("loadThumbsIntoMemory");
				localStorage.siteTiles = JSON.stringify(tiles);
				chrome.tabs.getCurrent(function(tab){
					chrome.tabs.update(tab.id, {url:"fauxbar.html"});
				});
			});
		}
	}
}

// Exit tile editing mode without saving changes
function cancelTiles() {
	$("button").prop("disabled",true);
	window.onbeforeunload = '';
	chrome.tabs.getCurrent(function(tab){
		chrome.tabs.update(tab.id, {url:"fauxbar.html"});
	});
}

// Initialise page tile editing mode
function enterTileEditMode() {
	delete window.keywordEngine;
	$("#awesomeInsetButton").removeClass("insetButton").addClass("noInsetButton");
	$("#addressbaricon").attr("src","chrome://favicon/null").css("opacity",.75);
	$(".switchtext").html("Switch to tab:").css("display","");
	$("#awesomeinput").focus();

	window.document.title = "Fauxbar: Edit Tiles";
	window.onbeforeunload = function() {
		if (localStorage.siteTiles && saveSiteTiles(true) != localStorage.siteTiles) {
			return 'You have not saved your new tile configuration yet.\n\nAre you sure you want to leave this page and discard your changes?';
		}
	}
	window.tileEditMode = true;
	window.draggingTile = false;
	$("#awesomeinput").attr("placeholder","Add a site as a tile").blur();
	hideResults();

	// Prevent links from performing their usual behaviour when user clicks them
	$("#topthumbs a").live("click", function(){
		return false;
	});

	// Prompt user to rename a tile on double-click
	$("#topthumbs a").live("dblclick", function(){
		var text = prompt("Rename tile:",$(this).attr("origtitle"));
		if (text) {
			$(".toptitletext",this).text(text);
			$(this).attr("origtitle",text);
			truncatePageTileTitle($(".toptitle",this));
		}
	});

	// Begin dragging a tile
	$("#topthumbs a").live("mousedown", function(e){
		if (e.button == 0) {
			removeContextMenu();
			window.draggingTile = true;
			window.topThumbA = this;
			setTimeout(function(){
				if (window.draggingTile == true) {
					$(window.topThumbA).addClass("draggingTile").removeClass("sitetile").css("top",(e.pageY-66)+"px").css("left",(e.pageX-106)+"px").after('<a class="holderTile"><div class="thumb" style="background:none"></div><span class="toptitle">&nbsp;</span></a>');
					$("body").css("cursor","move").append('<div id="cursorbox" style="top:'+e.pageY+'px;left:'+e.pageX+'"></div>');
					$(".tileCross").css("display","none");
				}
			}, 100);
			return false;
		}
	});

	// Drop the dragged tile to its new spot
	$("body").live("mouseup", function(){
		window.draggingTile = false;
		var dest = $(".holderTile").offset();
		if (dest) {
			$(".draggingTile").animate({top:dest.top+4+"px", left:dest.left+4+"px"}, 200, function(){
				$(".draggingTile").addClass("sitetile").removeClass("draggingTile").css("top","").css("left","").insertAfter(".holderTile");
				$(".holderTile").remove();
				$("#cursorbox").remove();
				$("body").css("cursor","");
				$(".tileCross").css("display","");
			});
		}
	});

	// Keep the dragged tile with the mouse cursor
	$("body").live("mousemove", function(e){
		if (window.draggingTile == true) {
			$(".draggingTile").css("top",(e.pageY-66)+"px").css("left",(e.pageX-106)+"px");
			$("#cursorbox").css("top",e.pageY+"px").css("left",e.pageX+"px");
			var hoveredTile = $('#cursorbox').collidesWith('.sitetile');
			if (hoveredTile.length == 1) {
				if (hoveredTile.next(".holderTile").length == 0) {
					$(".holderTile").insertAfter(hoveredTile);
				} else {
					$(".holderTile").insertBefore(hoveredTile);
				}
			}
		}
	});

	// Tile edit mode CSS
	$("#topthumbs").attr("title","Click and drag to move.\nRight-click to rename.");
	$("#editTileStyle").append('#topthumbs a { cursor:move; }');
	$("#editTileStyle").append('#topthumbs a:hover, #topthumbs a.draggingTile { background-color:'+localStorage.option_resultbgcolor+'; color:'+localStorage.option_titlecolor+'; }');
	$("#editTileStyle").append('#address_goarrow { display:none; }');
	if (navigator.appVersion.indexOf("Mac")!=-1) {
		$("#editTileStyle").append('#manualmode { font-size:13px; }');
	}
	var maxWidth = $("#addresswrapper").parent().outerWidth();
	$("#handle").css("display","none");
	$("#addresswrapper").parent().css("display","table-cell");
	$("#searchwrapper").parent().css("display","none");
	$(".wrapper").css("max-width",maxWidth+"px");
	$("#editmodeContainer").remove();
	$("#maindiv").before('<div id="editmodeContainer" style="opacity:0; box-shadow:0 2px 2px rgba(0,0,0,.3);"><div id="manualmode"><img src="fauxbar48.png" /> <b>Tile editing enabled.</b> Add sites as tiles using the modified Address Box below. Drag tiles to rearrange. Right-click to rename.</div></div>');
	$("#editmodeContainer").prepend('<div id="editModeButtons"><button onclick="saveSiteTiles()" style="font-family:'+localStorage.option_font+', Lucida Grande, Segoe UI, Arial, sans-serif;">Save</button>&nbsp;<button onclick="cancelTiles()" style="font-family:'+localStorage.option_font+', Lucida Grande, Segoe UI, Arial, sans-serif;">Cancel</button></div>');
	$("#editmodeContainer").animate({opacity:1}, 325);
	chrome.tabs.getCurrent(function(tab){
		chrome.tabs.update(tab.id, {selected:true}, function(){
			$("#awesomeinput").focus();
		});
	});

	$("#sapps").remove();
	$("#apps").remove();
	setTimeout(function(){
		$("#topthumbs").css("display","block").css("opacity",1);
		$("#topthumbs a .toptitle").each(function(){
			truncatePageTileTitle(this);
		});
	}, 1);

	// Render the user's existing site tiles
	if (window.tiles) {
		$("#topthumbs").html("");
		var thumbs = '';
		for (var t in window.tiles) {
			thumbs += renderPageTile(window.tiles[t].url, window.tiles[t].title, true);
		}
		renderSiteTiles(thumbs);
		$("#topthumbs a").css("opacity",1);
	}
}

// Truncate a page tile title and add "..." to its end
function truncatePageTileTitle(tileTitle) {
	if ($(tileTitle).outerWidth() > 212) {
		var origTitle = $(".toptitletext",tileTitle).text();
		while ($(tileTitle).outerWidth() > 200) {
			$(".toptitletext",tileTitle).text($(".toptitletext",tileTitle).text().substring(0,$(".toptitletext",tileTitle).text().length-1));
		}
		$(".toptitletext",tileTitle).text($(".toptitletext",tileTitle).text()+"...");
		$(tileTitle).attr("title",origTitle);
	}
}

// Add a new page tile to Fauxbar while in tile editing mode
function addTile(el) {
	hideResults();
	setTimeout(function(){
		$("#awesomeinput").val(window.actualUserInput).focus().setSelection(0,window.actualUserInput.length);
	}, 10);
	toggleSwitchText();
	$("#awesomeinput").focus();

	// Load thumbnail img if it exists, then add tile regardless
	if (openDb()) {
		window.db.transaction(function(tx){
			tx.executeSql('SELECT data FROM thumbs WHERE url = ? LIMIT 1', [$(el).attr("url")], function(tx, results){
				if (results.rows.length == 1) {
					window.bgPage.md5thumbs[hex_md5($(el).attr("url"))] = results.rows.item(0).data;
				}
			});
		}, function(t){
			errorHandler(t, getLineInfo());
		}, function(){
			$("#topthumbs").append(renderPageTile($(el).attr("url"), $(el).attr("origtitle"), true));
			truncatePageTileTitle($("#topthumbs a .toptitle").last());
			$("#topthumbs a").last().animate({opacity:1}, 500);
			$("#topthumbs a").attr("title","Click and drag to move.\nRight-click to rename.");
		});
	}
}

function removeTile(el) {
	$(el).parent().animate({opacity:0}, 350, function(){
		$(this).remove();
	});
}

// Create the HTML for a page tile
function renderPageTile(url, title, startHidden) {
	var urlMd5 = hex_md5(url);
	var thumbs = '';

	// Handle file:/// link if needed
	if (url.length > 8 && url.substring(0, 8) == "file:///") {
		var newHref = "loadfile.html#"+url;
	} else {
		var newHref = url;
	}

	var style = startHidden ? ' style="opacity:0" ' : '';
	thumbs += '<a class="sitetile" href="'+newHref+'" '+style+' url="'+url+'" origtitle="'+title+'">';

	if (startHidden == true) {
		thumbs += '<span class="tileCross" title="Remove tile" onclick="removeTile(this); return false"><img src="cross.png" /></span>';
	}

	thumbs += '		<div class="thumb" ';
	if (window.bgPage.md5thumbs[urlMd5]) {
		thumbs += '>	<img src="'+window.bgPage.md5thumbs[urlMd5]+'" />';
	} else {
		thumbs += '>';
	}
	thumbs += '		</div>';
	thumbs += '		<span class="toptitle"><img src="chrome://favicon/'+url+'" />';
	thumbs += '		<span class="toptitletext">'+title+'</span></span>';
	thumbs += '</a>';
	return thumbs;
}

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

	// Display error message
	else if (request.action == "displayError") {
		$("#errorLine").html(request.errorLine);
		$("#errorMessage").html(request.errorMessage);
		$("#errorBox").css("display","inline-block");
	}

	// Enter manual page tile editing mode
	else if (request.action && request.action == "editPageTiles") {
		if (!window.tileEditMode) {
			chrome.tabs.getCurrent(function(tab){
				if (request.tabId == tab.id) {
					enterTileEditMode();
				}
			});
		}
	}

	// Change to options page if user wants to open Fauxbar's options
	else if (request.action && request.action == "openOptions") {
		chrome.tabs.getCurrent(function(tab){
			if (tab.id == request.tabId) {
				window.location.reload();
			}
		});
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
		window.db.readTransaction(function(tx) {
			tx.executeSql('SELECT * FROM opensearches', [], function(tx, results) {
				tx.executeSql('SELECT * FROM tags', [], function(tx, results2) {
					var backup = {};
					backup.options = {};
					var ls = localStorage;
					var keys = sortKeys(ls).sort();
					for (var key in keys) {
						if (keys[key] != "customStyles") {
							backup.options[keys[key]] = localStorage[keys[key]];
						}
					}

					backup.searchengines = [];
					var len = results.rows.length, i;
					if (len > 0) {
						var i = 0;
						for (i = 0; i < len; i++) {
							backup.searchengines[i] = results.rows.item(i);
						}
					}

					backup.tags = [];
					var len2 = results2.rows.length, i2;
					if (len2 > 0) {
						var i2 = 0;
						for (i2 = 0; i2 < len2; i2++) {
							backup.tags[i2] = results2.rows.item(i2);
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
					backupText = str_replace(',"tags": [', ',\n\n"tags": [', backupText);
					backupText = str_replace('"},{"url":"', '"},\n{"url":"', backupText);
					backupText = str_replace('",\n"tag":"', '","tag":"', backupText);
					$("#backup").text(backupText).select();
				});
			});
		}, function(t){
			errorHandler(t, getLineInfo());
		});
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
					tx.executeSql('INSERT INTO opensearches (shortname, iconurl, searchurl, xmlurl, xml, isdefault, method, position, suggestUrl, keyword) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [se.shortname, se.iconurl, se.searchurl, se.xmlurl, se.xml, se.isdefault, se.method, se.position, se.suggestUrl, se.keyword]);
				}

				var tag = "";
				for (var t in text.tags) {
					tag = text.tags[t];
					tx.executeSql('DELETE FROM tags WHERE url = ?', [tag.url]);
					tx.executeSql('UPDATE urls SET tag = ? WHERE url = ?', [tag.tag, tag.url]);
					tx.executeSql('INSERT INTO tags (url, tag) VALUES (?, ?)', [tag.url, tag.tag]);
				}
			}, function(t){
				errorHandler(t, getLineInfo());
			}, function(){
				alert("The import was successful.\n\nFauxbar will now restore your options.");
				window.location.reload();
			});
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
		}, function(t){
			errorHandler(t, getLineInfo());
		});
		$("#button_clearsearchhistory").prop("disabled",true);
		loadDatabaseStats();
	}
}

// Submit the Search Box's input as a search to the selected search engine.
// Need to create a simple URL if it's a GET, otherwise create a form and POST it.
function submitOpenSearch(query) {
	var selectedMenuItem = '.menuitem[shortname="'+(window.keywordEngine ? window.keywordEngine.shortname : window.openSearchShortname)+'"]';
	var searchUrl = $(selectedMenuItem).attr("searchurl");
	var openSearchInputVal = query ? query : (window.keywordEngine ? $("#awesomeinput").val() : $("#opensearchinput").val());
	searchUrl = str_replace('{searchTerms}', urlencode(openSearchInputVal), searchUrl);

	if (localStorage.option_recordsearchboxqueries == 1 && openDb()){
		window.db.transaction(function(tx){
			tx.executeSql('INSERT INTO searchqueries (query) VALUES (?)', [openSearchInputVal.trim()]);
		}, function(t){
			errorHandler(t, getLineInfo());
		});
	}

	if ($(selectedMenuItem).attr("method").toLowerCase() == 'get') {
		if (window.keywordEngine) {
			window.executingKeywordSearch = true;
		}
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
	setTimeout(function(){
		$("#goarrow_hovered").attr("src",$("#address_goarrow img").attr("src"));
		$("#searchicon_hovered").attr("src",$("#searchicon_cell img").attr("src"));
		processFilters();
	}, 200);
}

// Switch to a new Options subpage
function changeOptionPage(el) {
	$("#option_menu div").removeClass("section_selected");
	$(el).addClass("section_selected");
	$("div.optionbox").css("display","none");
	$("#"+$(el).attr("optionbox")).css("display","block");
	localStorage.option_optionpage = $(el).attr("id");
	if ($(el).attr("id") == "option_section_support" && !window.clickedSupportMenu) {
		window.clickedSupportMenu = true;

		// Twitter follow button
		$("head").append('<script src="http://platform.twitter.com/widgets.js" type="text/javascript"></script>');

		// Facebook Like button
		$("#likeBox").html('<iframe src="http://www.facebook.com/plugins/like.php?app_id=112814858817841&amp;href=http%3A%2F%2Fwww.facebook.com%2Fpages%2FFauxbar%2F147907341953576&amp;send=false&amp;layout=standard&amp;width=450&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font=arial&amp;height=35" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:450px; height:35px;" allowTransparency="true"></iframe>');
	}
}

// Remove any custom ordering of the Search Box's search engines, and sort them alphabetically
function sortSearchEnginesAlphabetically() {
	if (openDb()) {
		window.db.transaction(function(tx){
			tx.executeSql('UPDATE opensearches SET position = 0');
			getSearchEngines();
			populateOpenSearchMenu();
		}, function(t){
			errorHandler(t, getLineInfo());
		});
	}
}

// Update the list of search engines in the Search Box Options page
function getSearchEngines() {
	if (openDb()){
		window.db.readTransaction(function(tx){
			tx.executeSql('SELECT iconurl, shortname, searchurl, keyword FROM opensearches ORDER BY position DESC, shortname COLLATE NOCASE ASC', [], function(tx,results){
				var openEngines = '';
				var len = results.rows.length, i;
				var iconUrl = "";
				var keyword = "";
				if (len > 0) {
					for (var i = 0; i < len; i++) {
						iconUrl = results.rows.item(i).iconurl;
						if (iconUrl != "google.ico" && iconUrl != "yahoo.ico" && iconUrl != "bing.ico") {
							iconUrl = "chrome://favicon/"+iconUrl;
						}
						openEngines += '<tr class="opensearch_optionrow">';
						openEngines += '<td class="osicon" style="width:1px; padding:0px 0px 0 5px"><img src="'+iconUrl+'" /></td>';
						openEngines += '<td style="width:25%" class="shortname"><input class="inputoption" type="text" value="'+str_replace('"', '&quot;', results.rows.item(i).shortname)+'" origvalue="'+str_replace('"', '&quot;', results.rows.item(i).shortname)+'" /></td>';
						openEngines += '<td style="width:13%" class="keyword"><input class="inputoption" type="text" value="'+results.rows.item(i).keyword+'" origvalue="'+results.rows.item(i).keyword+'" /></td>';
						openEngines += '<td style="width:75%" class="searchurl"><input class="inputoption" type="text" value="'+results.rows.item(i).searchurl+'" origvalue="'+results.rows.item(i).searchurl+'" style="color:rgba(0,0,0,.52)" spellcheck="false" autocomplete="off" /></td>';
						if (len > 1) {
							openEngines += '<td style="width:1px; padding:0 5px 0 4px" class="opensearchcross" title="Remove &quot;'+str_replace('"','&quot;',results.rows.item(i).shortname)+'&quot; from Fauxbar"><img class="crossicon" src="cross.png" /></td>';
						} else {
							openEngines += '<td></td>';
						}
						openEngines += '</tr>\n';
					}

					$("#opensearchengines").html('<table id="opensearchoptionstable" class="opensearchoptionstable" style="width:100%" cellpadding="2" cellspacing="0" style="border-collapse:collapse">'+
													'<tr style="opacity:.55"><td colspan="2" style="font-size:12px;font-weight:bold; padding-left:4px">Name</td>'+
														'<td style="font-size:12px; font-weight:bold; padding-right:15px; padding-left:4px">Keyword</td><td colspan="2" style="padding-left:4px; text-align:left; font-size:12px; font-weight:bold">URL</td></tr>'+
													openEngines+'</table>');
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
		}, function(t){
			errorHandler(t, getLineInfo());
		});
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

	// Apply Options
	// ..Most code below applies user-specified options just before the Fauxbar is shown
	// Lots of customization :)

	// Change the order of the Address Box and Search Box, if user has chosen
	changeInputBoxDisplayOrder(true);

	// Change the font size of the Address Box and Search Box
	if (localStorage.option_inputfontsize && localStorage.option_inputfontsize.length) {
		changeInputFontSize();
	}

	if (!localStorage.customStyles) {

		// Load the user's font name
		$("#customstyle").append("#apps, #topthumbs { font-family:"+localStorage.option_font+",Segoe UI, Arial, sans-serif; font-size:"+localStorage.option_sappsfontsize+"px; }");

		// Show or hide the Fauxbar's drop shadow
		if (localStorage.option_shadow && localStorage.option_shadow != 1) {
			$("#customstyle").append(".wrapper { box-shadow:none; } ");
		}

		// Apply the user's background image, if selected
		if (localStorage.option_bgimg && localStorage.option_bgimg.length) {
			//$("body").css("background-image", "url("+localStorage.option_bgimg+")");
			$("#customstyle").append("body { background-image:url("+localStorage.option_bgimg+"); }");
		}

		// Apply the user's background color, if selected
		if (localStorage.option_bgcolor && localStorage.option_bgcolor.length) {
			//$("body").css("background-color", localStorage.option_bgcolor);
			$("#customstyle").append("body { background-color:"+localStorage.option_bgcolor+"; }");
		}

		// Apply the user's background image position, if selected
		if (localStorage.option_bgpos && localStorage.option_bgpos.length) {
			//$("body").css("background-position", localStorage.option_bgpos);
			$("#customstyle").append("body { background-position:"+localStorage.option_bgpos+"; }");
		}

		// Apply the user's background-repeat, if selected
		if (localStorage.option_bgrepeat && localStorage.option_bgrepeat.length) {
			//$("body").css("background-repeat", localStorage.option_bgrepeat);
			$("#customstyle").append("body { background-repeat:"+localStorage.option_bgrepeat+"; }");
		}

		// Apply the user's background image size, if selected
		if (localStorage.option_bgsize && localStorage.option_bgsize.length) {
			//$("body").css("background-size", localStorage.option_bgsize);
			$("#customstyle").append("body { background-size:"+localStorage.option_bgsize+"; }");
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
			$("#customstyle").append(".result_title, #opensearch_results .result, .result_title .dotdotdot, .resultTag { color:"+localStorage.option_titlecolor+"; }");
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
			$("#customstyle").append("#opensearch_results .arrowed, .arrowed .result_title, .arrowed .result_title .dotdotdot, .rightClickedResult .result_title, .rightClickedResult .result_title .dotdotdot, .arrowed .resultTag, .rightClickedResult .resultTag { color:"+localStorage.option_selectedtitlecolor+"; }");
		}

		// Apply the user's sepcified highlighted color for result URL texts
		if (localStorage.option_selectedurlcolor && localStorage.option_selectedurlcolor.length) {
			$("#customstyle").append(".arrowed .result_url, .arrowed .result_url .dotdotdot, .rightClickedResult .result_url, .rightClickedResult .result_url .dotdotdot { color:"+localStorage.option_selectedurlcolor+"; }");
		}

		// Apply the user's sepcified highlighted background color for results/queries/suggestions
		if (localStorage.option_selectedresultbgcolor && localStorage.option_selectedresultbgcolor.length) {
			$("#customstyle").append(".arrowed, #options .arrowed .dotdotdot, .arrowed .result_title .dotdotdot, .arrowed .result_url .dotdotdot, .rightClickedResult, .rightClickedResult .result_title .dotdotdot, .rightClickedResult .result_url .dotdotdot, .rightClickedResult .resultTag, .arrowed .resultTag { background-color:"+localStorage.option_selectedresultbgcolor+"; }");
		}

		// Apply the user's specified font size for result titles
		if (localStorage.option_titlesize && localStorage.option_titlesize.length) {
			$("#customstyle").append(".result_title, #options .result_title { font-size:"+localStorage.option_titlesize+"px; }");
		}

		// Apply the user's specified font size for result URLs and queries/suggestions
		if (localStorage.option_urlsize && localStorage.option_urlsize.length) {
			$("#customstyle").append(".result_url, #options .result_url, .historyresult, .jsonresult, .resultTag { font-size:"+localStorage.option_urlsize+"px; }");
		}

		// Apply the user's specified Address Box result separator color (and right-click context menu divider)
		if (localStorage.option_separatorcolor && localStorage.option_separatorcolor.length) {
			$("#customstyle").append(".result { border-color:"+localStorage.option_separatorcolor+"; }");
			$("#customstyle").append("#contextMenu .menuHr { background-color:"+localStorage.option_separatorcolor+"; }");
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

		// Then reset it back to being faded once the user is done deciding on a color.
		$("#option_fauxbarfontcolor").live("blur", function(){
			$("#awesomeinput").val("").blur();
		});

		// Apply custom Fauxbar background gradient colors
		if (localStorage.option_topgradient && localStorage.option_topgradient.length && localStorage.option_bottomgradient && localStorage.option_bottomgradient.length) {
			changeFauxbarColors();
		}



		// Apply custom Address Box and Search Box font color
		if (localStorage.option_fauxbarfontcolor && localStorage.option_fauxbarfontcolor.length) {
			$("#customstyle").append(".inputwrapper input { color:"+localStorage.option_fauxbarfontcolor+"; }");
		}

		// So, just make the Fauxbar appear instantly, now that all the custom colors and stuff have been applied.

		localStorage.customStyles = $("#customstyle").html();
	} else {
		$("#customstyle").append(localStorage.customStyles);
	}

	// Apply custom icon tint colors
	if (localStorage.option_iconcolor && localStorage.option_iconcolor.length) {
		changeTintColors();
	}

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
		if ($(".historyresult, .jsonresult").length && $("#opensearchinput").val().length && !$("#opensearchinput:focus").length && !window.keywordEngine) {
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
					}, function(t){
						errorHandler(t, getLineInfo());
					});
					populateOpenSearchMenu();
				}
			});
		}
	});

	// Focus Address Box or Search Box if allowed, stealing from Chrome's Omnibox (shortcut keys)
	$("*").live("keydown", function(e){
		if ((e.keyCode == 68 && e.altKey == true && localStorage.option_altd == 1) || (e.keyCode == 76 && e.ctrlKey == true && localStorage.option_ctrll == 1)) {
			$("#awesomeinput").focus().select();
			return false;
		}
		else if (e.keyCode == 75 && e.ctrlKey == true && localStorage.option_ctrlk == 1) {
			$("#opensearchinput").focus().select();
			return false;
		}
	});

	// When user clicks on almost anything, hide results/suggestions/queries. Assumes the user wants to hide them this way.
	$("#background, table#options, #apps, #topthumbs").live("mousedown", function(){
		$(".triangle").removeClass("glow");
		hideResults();
		$("#opensearch_results").css("display","none").html("");
	});

	// When user focuses the Address Box, hide search queries and suggestions
	$("#awesomeinput").live("focus", function(e){
		window.navigating = false;
		if (!window.keywordEngine) {
			$("#opensearch_results").css("display","none").html("");
		}
		if (window.dontGetResults) {
			setTimeout(function(){
				delete window.dontGetResults;
			}, 50);
			return true;
		}
		if (!window.keywordEngine) {
			getResults();
		}
		setTimeout(function(){
			if (!window.justPasted && !window.justDeleted) {
				$("#awesomeinput").select();
			}
			delete window.justPasted;
			delete window.justDeleted;
		},1);
	});
	$("#opensearchinput").live("focus", function(e){
		setTimeout(function(){
			if (!window.justPasted && !window.justDeleted) {
				$("#opensearchinput").select();
			}
			delete window.justPasted;
			delete window.justDeleted;
		},1);
	});

	// When user clicks to select a new search engine to user, make it so.
	$("#opensearchmenu .menuitem").live("mousedown", function(){
		selectOpenSearchType(this, true);
		return false;
	});

	// When the Search Box is focused, hide Address Box results and make the Search Box look good
	$("#opensearchinput").focus(function(){
		hideResults();
		$(this).attr("title","");
	});

	// When the Search Box loses focus, make it look faded
	$("#opensearchinput").blur(function(){
		if ($(this).val() == "") {
			$(this).attr("placeholder",window.openSearchShortname);
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
	$("#opensearch_triangle").bind("mouseup", function(e){
		if (localStorage.indexComplete == 1) {
			$("#opensearch_results").html("").css("display","none");
			$("#opensearch_triangle .triangle").addClass("glow");
			showContextMenu(e);
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
			window.dontGetResults = true;
			if ($("#awesomeinput").val().substr(0, window.actualUserInput.length) == window.actualUserInput) {
				$("#awesomeinput").focus().setSelection(window.actualUserInput.length, $("#awesomeinput").val().length);
			} else {
				$("#awesomeinput").focus();
			}
		}, 1);

		// Don't let the click go through if the result is a "Switch to tab" result
		if (strstr($(resultEl).text(), "Switch to tab")) {
			return false;
		// But if it's a normal click, let it go through
		} else {
			window.goingToUrl = $(resultEl).attr("url");
			updateHash();
			return true;
		}
	}

	// When user clicks the Address Box, hide the result links
	$("#awesomeinput").bind("mousedown", function(){
		hideResults();
	});

	// When the Address Box is empty and the user double-clicks it, display the top results
	$("#awesomeinput").dblclick(function(){
		if (!$(this).val().length) {
			$("#addressbox_triangle").mousedown();
		}
	});

	// When user clicks the Address Box's go arrow, go to the address if something is entered
	$("#address_goarrow").bind("mousedown", function(){
		var aiVal = $("#awesomeinput").val();
		if (aiVal.length) {
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
		if ($("#opensearchinput").val().trim().length) {
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

	$("#awesomeinput").bind("keydown", function(e){

		// Ctrl+Return
		if (e.keyCode == 13 && e.ctrlKey == true) {
			var thisVal = window.actualUserInput;
			if (!strstr(thisVal.trim(), ' ') && !strstr(thisVal, '/')) {
				if (!strstr(thisVal, '.')) {
					$(this).val('http://www.'+thisVal+'.com/');
				}
				else if (thisVal.substr(thisVal.length-3) != '.com') {
					$(this).val('http://'+thisVal+'.com/');
				}
			}
		}

		// Ctrl+K
		else if (e.keyCode == 75 && e.ctrlKey == true) {
			$("#opensearchinput").focus();
			return false;
		}

		//  Ctrl+L, Alt+D
		else if ((e.keyCode == 76 && e.ctrlKey == true) || (e.keyCode == 68 && e.altKey == true)) {
			return false;
		}

		// Alt+Return
		else if (e.keyCode == 13 && e.altKey == true) {
			window.altReturn = true;
		}

		// Tab
		else if (e.keyCode == 9 && $(".result").length) {
			if (e.shiftKey == true) {
				navigateResults({keyCode:38});
			} else {
				navigateResults({keyCode:40});
			}
			return false;
		}

		// Pressing Backspace if search engine keyword is being used
		if (e.keyCode == 8 && window.keywordEngine && !$("#awesomeinput").val().length) {
			delete window.keywordEngine;
			$("#awesomeInsetButton").removeClass("insetButton").addClass("noInsetButton");
			$("#addressbaricon").attr("src","chrome://favicon/null").css("opacity",.75);
			$(".switchtext").html("Switch to tab:").css("display","");
			$("#awesomeinput").attr("placeholder",window.placeholder);
			getResults();
			return false;
		}
	});

	$("#opensearchinput").bind("keydown", function(e){
		// Ctrl+K
		if (e.keyCode == 75 && e.ctrlKey == true) {
			return false;
		}

		// Ctrl+L, Alt+D
		else if ((e.keyCode == 76 && e.ctrlKey == true) || (e.keyCode == 68 && e.altKey == true)) {
			$("#awesomeinput").focus();
			return false;
		}

		// Alt+Return
		else if (e.keyCode == 13 && e.altKey == true) {
			window.altReturn = true;
		}

		// Tab
		else if (e.keyCode == 9 && $(".result").length) {
			if (e.shiftKey == true) {
				navigateResults({keyCode:38});
			} else {
				navigateResults({keyCode:40});
			}
			return false;
		}
	});

	$("#results").bind("scroll", function() {
		window.userHasNewInput = false;
	});

	// When user types a key into the Address Box...
	$("#awesomeinput").bind("keydown",function(e){
		window.userHasNewInput = false;
		if (!window.keywordEngine) {
			setTimeout(toggleSwitchText, 1);
		}
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
				if ($('.arrowed.historyresult').length > 0 && localStorage.option_quickdelete && localStorage.option_quickdelete == 1) {
					if (openDb()) {
						window.db.transaction(function(tx){
							var tempNum = microtime(true);
							$(".arrowed").next(".result").attr("tempnum",tempNum);
							tx.executeSql('DELETE FROM searchqueries WHERE query = ?', [html_entity_decode($(".arrowed .suggestion").text())]);
							$(".arrowed").remove();
							$('.result[tempnum="'+tempNum+'"]').addClass("arrowed");
						}, function(t){
							errorHandler(t, getLineInfo());
						});
					}
					return false;
				}
				else if (openDb()) {
					window.db.transaction(function(tx){
						var arrowedUrl = $(".arrowed").attr("url");
						if (arrowedUrl) {
							tx.executeSql('UPDATE urls SET queuedfordeletion = 1 WHERE url = ? AND type = 1', [arrowedUrl]);
							tx.executeSql('DELETE FROM thumbs WHERE url = ? AND manual != 1', [arrowedUrl]);
							tx.executeSql('UPDATE thumbs SET frecency = -1 WHERE url = ?', [arrowedUrl]);
							chrome.history.deleteUrl({url:arrowedUrl});
							var nextNumber = $(".arrowed").next(".result").attr("number");
							$(".arrowed").remove();
							$('.result[number="'+nextNumber+'"]').addClass("arrowed");
						}
					}, function(t){
						errorHandler(t, getLineInfo());
					});
					$(this).val(window.actualUserInput);
				}
				return false;
			}
		}

		// Esc - hide results and/or select all the text (user doesn't want what's currently there)
		if (e.keyCode == 27) {
			$(".arrowed").removeClass("arrowed");
			if (window.keywordEngine && $("#awesomeinput").val() == "") {
				delete window.keywordEngine;
				$("#awesomeInsetButton").removeClass("insetButton").addClass("noInsetButton");
				window.actualUserInput = '';
				$("#addressbaricon").attr("src","chrome://favicon/null").css("opacity",.75);
				$(".switchtext").html("Switch to tab:").css("display","");
				$("#awesomeinput").attr("placeholder",window.placeholder);
				return false;
			}
			if (window.actualUserInput) {
				$(this).val(window.actualUserInput);
			}

			$("#opensearch_results").css("display","none").html("");
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
				if (!window.keywordEngine) {
					$(this).blur();
				}
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
			if (window.keywordEngine && !$(".result").length) {
				getSearchSuggestions();
			} else {
				window.navigating = true;
				navigateResults(e);
			}
			return false;
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
	$('.jsonresult, .historyresult').live("mousedown", function(e){
		var query = false;
		// If user Middle-clicks or Ctrl+Clicks, record it as such, so that submitOpenSearch() knows to do the search in a new tab
		if (event.button == 1 || e.ctrlKey == true) {
			window.middleMouse = true;
			window.altReturn = true;
			query = $(".suggestion",this).text();
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
					}, function(t){
						errorHandler(t, getLineInfo());
					});
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
			if ($("#opensearchinput").val().trim().length) {
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
			if ($("#opensearchinput").val().trim().length) {
				getSearchSuggestions();
			} else {
				$("#opensearch_results").css("display","none").html("");
			}
		}, 1);
	});

	// If the Fauxbar background page has a hash value (because we're autofilling the URL from the page we just came from), interpret it.
	// This is used in conjunction when the user presses Alt+D, Ctrl+L or Ctrl+K and opens Fauxbar this way.
	if (window.bgPage.newTabHash) {
		window.location.hash = '#'+window.bgPage.newTabHash;
		autofillInput();
		setTimeout(function(){
			$("#awesomeinput").select();
		}, 150);
	}

	$("#awesomeinput").live("blur", function(){
		if (window.keywordEngine) {
			setTimeout(function(){
				if (!$("#awesomeinput:focus").length) {
					if (window.keywordEngine) {
						$("#opensearch_results").css("display","none").html("");
					}
				}
			}, 1);
		}
	});

	///////// OPTIONS //////////////

	// If Fauxbar's hash value says to open display the Options page, and the user isn't reindexing the database, let's initialize and show the options!
	// And I decided to show the Options page inline with the normal Fauxbar page, because a lot of the options alter the Fauxbar on the fly, so wanted to have both visible at once,
	// rather than making a whole new options page by itself.
	if (getHashVar("options") == 1 && localStorage.indexComplete == 1) {

		// Prevent CSS caching while the options are open
		setInterval(function(){
			delete localStorage.customStyles;
		}, 2000);

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
			$("body").append(response);
			$(window).bind("resize", function(){
				$("#options").css("position","absolute").css("top",$(".wrapper").offset().top+$(".wrapper").outerHeight()+30+"px").css("margin","0");
				if (window.innerWidth >= 1100) {
					$("#options").css("width","1000");
				} else {
					$("#options").css("width",window.innerWidth - 50 + "px");
				}
				$("#options").css("left", window.innerWidth/2 - $("#options").outerWidth()/2 + "px" );
			}).trigger("resize");

			// Update the page/tab title
			document.title = "Fauxbar: Options";

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
				$("#dragging_os_row tr td.keyword input").val($(this).nextAll("td.keyword").children("input").val());
				$("#dragging_os_row tr td.searchurl input").val($(this).nextAll("td.searchurl").children("input").val());
				$(this).parent().before('<tr class=".opensearch_optionrow dotted_os_row" style="height:'+$(this).parent().outerHeight()+'px;"><td colspan="5">&nbsp;</td></tr>');
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
				$(this).val(str_replace('"','',$(this).val()));
				if (openDb()) {
					var osRow = $(this).parent().parent();
					window.db.transaction(function(tx){
						tx.executeSql('UPDATE opensearches SET shortname = ?, searchurl = ?, keyword = ? WHERE shortname = ?', [str_replace('"','',$('.shortname > input',osRow).val().trim()), $('.searchurl > input',osRow).val().trim(), $('.keyword > input',osRow).val().trim(), $('.shortname > input',osRow).attr("origvalue")]);
					}, function(t){
						errorHandler(t, getLineInfo());
					}, function(){
						$("#opensearchoptionstable > tbody > tr > td.shortname > input, #opensearchoptionstable > tbody > tr > td.searchurl > input").each(function(){
							$(this).attr("origvalue",$(this).val());
						});
						populateOpenSearchMenu();
					});
				}
			});

			// When user clicks the cross next to a search engine, remove it from the database and from the screen
			$(".opensearchcross").live("mousedown", function(){
				if (openDb()) {
					var theCell = this;
					window.db.transaction(function(tx){
						tx.executeSql('DELETE FROM opensearches WHERE shortname = ?', [$(theCell).prevAll('td.shortname').children('input').first().val()]);
					}, function(t){
						errorHandler(t, getLineInfo());
					});
					$(theCell).parent().animate({opacity:0}, 0, function() {
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
						tx.executeSql('INSERT INTO opensearches (shortname, iconurl, searchurl, xmlurl, xml, isdefault, method, suggestUrl, keyword) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [$(button).attr("shortname"), $("img",button).attr("src"), $(button).attr("searchurl"), "", "", "0", "get", $(button).attr("suggesturl"), $(button).attr("keyword")]);
						$(button).css("display","none");
					}, function(t){
						errorHandler(t, getLineInfo());
					});
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
				toAppend += ".result_title, .result, .result_title .dotdotdot, #options .result_title, .resultTag { color:"+$("#option_titlecolor").val()+"; font-size:"+$("#option_titlesize").val()+"px; }";
				toAppend += ".resultTag { font-size:"+$("#option_urlsize").val()+"px; }";
				toAppend += ".result_url, .result_url .dotdotdot, #options .result_url, .historyresult, .jsonresult { color:"+$("#option_urlcolor").val()+"; font-size:"+$("#option_urlsize").val()+"px; }";
				toAppend += ".result, .resultpreview, .dotdotdot { background-color:"+$("#option_resultbgcolor").val()+"; }";
				toAppend += ".arrowed .result_title, #options .arrowed .result_title, #opensearch_results .arrowed, .rightClickedResult .result_title, .arrowed .resultTag, .rightClickedResult .resultTag { color:"+$("#option_selectedtitlecolor").val()+"; }";
				toAppend += ".arrowed .result_url, #options .arrowed .result_url, .rightClickedResult .result_url { color:"+$("#option_selectedurlcolor").val()+"; }";
				toAppend += ".arrowed, #options .arrowed .dotdotdot, .rightClickedResult { background-color:"+$("#option_selectedresultbgcolor").val()+"; }";
				toAppend += ".result { border-color:"+$("#option_separatorcolor").val()+"; }";
				toAppend += "#contextMenu .menuHr { background-color:"+$("#option_separatorcolor").val()+"; }";
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

			loadOptionsJS();

			// All the Options have been loaded and primed, so let's show the Options page now
			$("#options").css("display","block");
		});

		////// END LOADING OPTIONS ////////

	// If we're not loading the options page...

	// If we're not reindexing the database...
	} else if (localStorage.indexComplete == 1) {

		// Setup and show the Fauxbar[...] icon in the Omnibox
		chrome.tabs.getCurrent(function(tab){
			chrome.pageAction.setIcon({tabId:tab.id, path:"fauxbar16options.png"});
			chrome.pageAction.setTitle({tabId:tab.id, title:"Customize Fauxbar"});
			chrome.pageAction.setPopup({tabId:tab.id, popup:(localStorage.option_pagetilearrangement && localStorage.option_pagetilearrangement == "manual" && localStorage.option_showtopsites == 1 ? "popup.options.html" : "")});
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
				$("#awesomeinput").prop("disabled",true);
				$("#opensearchinput").prop("disabled",true);
				if (localStorage.indexedbefore != 1) {
					$("#opensearchinput").attr("placeholder","Search");
				}
			}, 100);
		});
	}

	// Now that the Fauxbar page is pretty much loaded, load the JS files to apply custom colors to the various icons, if they're not the defaults.
	// Page loads a bit slower if these are loaded first, so that's why we're loading them now.
	if (localStorage.option_iconcolor.toLowerCase() != "#3374ab" || localStorage.option_favopacity != 0 || getHashVar("options") == 1) {
		setTimeout(function(){
			delete processFilters;
			$("head").append('<script type="text/javascript" src="mezzoblue-PaintbrushJS-098389a/common.js"></script>');
			$("head").append('<script type="text/javascript" src="mezzoblue-PaintbrushJS-098389a/paintbrush.js"></script>');
			processFilters();
		}, 1);
	}
	// If user has default colors set, load darkened icons
	else {
		$("#address_goarrow")
			.live("mouseenter", function(){
				$("img",this).attr("src","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAi0lEQVQoU2NkwAGsYmtngqSOLW5Ox6aEEZugbXyt9T8GxiMguf///s/CphmrRpAGy/i6SCYGhmW4NOPUSEgzXo34NDPaxNca4wogmPi/fwzGf///m8nEyMQAtAnsZ0aruNozQAUENf/8/Zfh////YLM4WFkekq+RbKcS8h+uaKF+dJCVAChKcoQSOQCI22/3L6cKGwAAAABJRU5ErkJggg==");
			})
			.live("mouseleave", function(){
				$("img",this).attr("src","goarrow.png");
			});
		$("#searchicon_cell")
			.live("mouseenter", function(){
				$("#searchicon").attr("src","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABdUlEQVQ4T5WTIUzDUBCG7zqWgBpqAgNBYtgWZrAEhSJZQpssm8DjIG0wGCgJDoFDQAitICEBiZ9ZslVNIVAkJAjAzECPu0fbdN1bw6rWvvd/7//vf0P4x1M1nQYhlYtUCLr+cSctwTx91XLOeUMbCGbifQTwxr8P+r57J98mAmo79gMgbighwicQffB7mWFz/P5NBLsC0QLq5uH6D4RPoiWEy77n7sUOapbTZciKOGHAshZQsZwbg2CbTxr0PLeejcmQd3FSAGNTC0jsG3jWuz05GgOY9oBzLYZI+7mAEOE+8NymxsErOyhxjLYWILXxwpUMKyRaDfzTlxiimuEByhrHK01uIcqpIACPBuIzN7ElA0wPdwwQdd8QiyweqtoyTzraCCCxF3XPFhdUHKKWfAoN/CqScZG+jQlgRKzpf9KNVYBkaNGu7OXJu+74J6ZrrmQWAYfTiFXSimkv8YQ7POF5AmzFf5K8U9NrKoJA+PS1acWi/QVHr6EUsRkP6wAAAABJRU5ErkJggg==");
			})
			.live("mouseleave", function(){
				$("#searchicon").attr("src","search.png");
			});
	}
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
	if (window.keywordEngine && $("#awesomeinput:focus").length) {
		$("#opensearch_results").css("display","block")
			.css("margin-left","0px")
			.css("margin-top","0px")
			.css("width", $("#awesomeinputwrapper2").outerWidth()-2+"px")
			.css("top",$("#awesomeinput").offset().top+$("#awesomeinput").outerHeight()+5+"px")
			.css("left",$("#awesomeinput").offset().left-1+"px")
			.css("position","fixed")
		;
	} else {
		$("#opensearch_results").css("display","block").
			css("width", $("#opensearchwrapper2").outerWidth()- 2 +"px").
			css("margin-left","0px").
			css("margin-top","0px").
			css("position","absolute").
			css("left",$("#opensearchwrapper2").offset().left+"px").
			css("top",$("#searchwrapper").offset().top+$("#searchwrapper").outerHeight()+1+"px");
	}
}

function validateJson(string) {
	try {
		jQuery.parseJSON(string);
		return true;
	} catch(e) {
		return false;
	}
}


// Fetch and display queries/suggestions related to the user's Search Box input
function getSearchSuggestions(dontActuallyGet) {
	window.mouseHasMoved = false;

	if (window.keywordEngine) {
		window.actualUserInput = $("#awesomeinput").val();
	}

	if (dontActuallyGet) {
		return false;
	}

	if ($("#opensearchinput:focus").length && $("#opensearchinput").val().length) {
		$(".menuitem").each(function(){
			if ($(this).attr("keyword") && $("#opensearchinput").val() == $(this).attr("keyword")+" ") {
				$("#opensearchinput").val("");
				window.dontActuallyGetSearchResults = true;
				selectOpenSearchType(this, true);
				return false;
			}
		});
	}

	// If user has opted to show queries or suggestions...
	if (($("#opensearchinput:focus").length && (localStorage.option_showqueryhistorysuggestions == 1 || localStorage.option_showjsonsuggestions == 1)) || (window.keywordEngine)) {

		// Set up the SQL select statement for Fauxbar's `searchqueries` database table
		window.actualSearchInput = window.keywordEngine && $("#awesomeinput:focus").length ? $("#awesomeinput").val() : $("#opensearchinput").val();
		if (openDb()) {
			window.db.readTransaction(function(tx){
				var osWords = explode(" ", window.actualSearchInput.trim());
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

				var limit = localStorage.option_maxretrievedsuggestions ? localStorage.option_maxretrievedsuggestions : 20;
				statementParts[statementParts.length] = limit;

				// Execute the SQL select statement
				tx.executeSql('SELECT DISTINCT query FROM searchqueries WHERE '+implode(" AND ",queryLikes)+' ORDER BY query ASC LIMIT ?', statementParts, function(tx, results){

					// Get the JSON OpenSearch suggestions from the selected search engine suggestion URL if possible, otherwise just default to a fake URL so we can at least continue.
					// Doing it this way so that it's more streamlined here, rather than me trying to worry about dealing with asynchronus results; I think it'd be messier. This way seems cleaner.
					var suggestUrl = window.keywordEngine ? window.keywordEngine.suggestUrl : $('#opensearchmenu .menuitem[shortname="'+str_replace('"','&quot;',window.openSearchShortname)+'"]').attr("suggesturl");
					var actualSuggestUrl = "http://0.0.0.0/";
					if (((!window.keywordEngine && localStorage.option_showjsonsuggestions == 1) || (window.keywordEngine && localStorage.option_showSuggestionsViaKeyword == 1)) && suggestUrl != "null" && suggestUrl != "" && suggestUrl.length > 0) {
						actualSuggestUrl = suggestUrl;
					}
					var osVal = window.keywordEngine && $("#awesomeinput:focus").length ? $("#awesomeinput").val() : $("#opensearchinput").val();

					// Setup the JSON URL get...
					$.getJSON(str_replace("{searchTerms}", urlencode(osVal), actualSuggestUrl)).complete(function(response){
						response = validateJson(response.responseText) ? jQuery.parseJSON(response.responseText) : '';
						var historyResults = '';
						var jsonResults = '';

						// If user has opted to show past queries, make it so
						if ((localStorage.option_showqueryhistorysuggestions == 1) || (window.keywordEngine && localStorage.option_showQueriesViaKeyword == 1)) {

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

						if (window.dontActuallyGetSearchResults) {
							$("#opensearch_results").css("display","none").html("");
							delete window.dontActuallyGetSearchResults;
							return;
						}

						// Display the queries and suggestions, if any
						if (osVal == (window.keywordEngine && $("#awesomeinput:focus").length ? $("#awesomeinput").val() : $("#opensearchinput").val())) {
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
			}, function(t){
				errorHandler(t, getLineInfo());
			});
		}
	}
}

// If Address Box input is a URL that has the "Switch to tab" text as a result below it, add a faded "Switch to text" bit in front of the Address Box's input box
function toggleSwitchText() {
	if (window.keywordEngine) {
		return false;
	}
	var switchUrl = $(".switch").parent('.result_url').parent('.result').attr("url");
	if ($('.switch').length > 0 && $("#awesomeinput").val() == switchUrl) {
		$(".switchtext").css("font-size",$("#awesomeinput").css("font-size")).css("display","table-cell");
		$("#super_triangle").css("display","none");
	}
	else if (window.tileEditMode && window.tileEditMode == true && $("#awesomeinput").val().length > 0 && $(".result[url='"+$("#awesomeinput").val()+"']").length > 0) {
		$(".switchtext").text("Add tile:").css("font-size",$("#awesomeinput").css("font-size")).css("display","table-cell");
		$("#super_triangle").css("display","none");
	}
	else {
		$(".switchtext").css("display","none");
		$("#super_triangle").css("display","");
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
						if ($("#awesomeinput:focus").length && !window.keywordEngine) {
							var resultBottomPadding = 4; // taken from css file (.result)
							while ( ($("#results").position().top+$(".arrowed .result_bottom").position().top+resultBottomPadding) > ($("#results").position().top+$("#results").height()) ) {
								$("#results").scrollTop($("#results").scrollTop()+1);
							}
						} else if ($("#opensearchinput:focus").length || window.keywordEngine) {
							var resultBottomPadding = 4; // taken from css file (.result)
							while ( ($("#opensearch_results").position().top+$(".arrowed").next(".result").position().top) > ($("#opensearch_results").position().top+$("#opensearch_results").height()) ) {
								$("#opensearch_results").scrollTop($("#opensearch_results").scrollTop()+1);
							}
						}
					}
				}

				// Update the appropriate input box with the highlighted result's URL or search query
				if ($("#awesomeinput:focus").length) {
					if (window.keywordEngine) {
						$("#awesomeinput").val(html_entity_decode($(".arrowed .suggestion").text()));
					} else {
						$("#awesomeinput").val($(".arrowed").attr("url"));
					}
				} else if ($("#opensearchinput:focus").length) {
					$("#opensearchinput").val(html_entity_decode($(".arrowed .suggestion").text()));
				}
				if (window.keywordEngine) {
					setTimeout(function(){
						$("#awesomeinput").setSelection($("#awesomeinput").val().length);
					},1);
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
		else if ($("#awesomeinput").val() == "" && $("#awesomeinput:focus").length && !window.keywordEngine) {
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
								$("#opensearchinput").val("").focus();
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
			$("#awesomeinput").val(getHashVar('ai'));
			window.actualUserInput = getHashVar('ai');
		}
		// Populate Search Box
		if (getHashVar('os')) {
			$("#opensearchinput").val(getHashVar('os'));
		}

		// Keyword search engine
		if (getHashVar('ke')) {
			$("#awesomeinput").val(getHashVar("ke")+" "+getHashVar('ai'));
		}

		// Focus/select a Box
		setTimeout(function(){
			if (getHashVar("ke")) {
				setTimeout(getResults, 100);
			}
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
				if (tu && ('http://'+ai == tu.substr(0,('http://'+ai).length) || 'http://www.'+ai == tu.substr(0,('http://www.'+ai).length) || ai == tu.substr(0,ai.length) || 'https://'+ai == tu.substr(0,('https://'+ai).length) || 'https://www.'+ai == tu.substr(0,('https://www.'+ai).length)) ) {
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
			if ($("#awesomeinput").getSelection().length == 0) {
				if ((!localStorage.option_autofillurl || localStorage.option_autofillurl == 1) && !window.tileEditMode) {
					$("#awesomeinput").val(newVal).setSelection(ai.length, $("#awesomeinput").val().length);
				}
			}
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
	if (noQuery && $("#contextMenu").length) {
		removeContextMenu();
	}

	// If the Search Box is focused and something is trying to get results from the Address Box's input text, don't let it happen, since the user is focusing the Search Box.
	if (window.justUsedContextMenu){
		delete window.justUsedContextMenu;
		return false;
	}

	// Get an array of tabs in the current Chrome window, so we can examine them soon to see if we need to use the "Switch to tab" text/functionality anywhere
	if (!window.keywordEngine && !$(".glow").length) {
		chrome.tabs.getAllInWindow(null, function(tabs){
			window.currentTabs = tabs;
		});
	}

	// As we are getting new results, remove any indiction from any existing result URLs that have been used to auto-fill the Address Box's input for the user.
	$(".autofillmatch").removeClass("autofillmatch");

	// Define what the user has actually typed
	window.actualUserInput = getAiSansSelected();

	var thisQuery = window.actualUserInput;

	if ($(".glow").length) {
		delete window.keywordEngine;
	} else {

		// Search engine keyword?
		var keywordMatch = false;
		if (!window.tileEditMode) {
			if (!window.keywordEngine) {
				var justEnabledKeywordEngine = true;
			}
			var usingKeyword = '';
			$(".menuitem").each(function(){
				var keyword = $(this).attr("keyword");
				if (keyword && thisQuery && thisQuery.substr(0,keyword.length+1) == keyword+" ") {
					keywordMatch = true;
					usingKeyword = keyword;
					$("#awesomeinput").attr("placeholder","Search");
					window.keywordEngine = {shortname:$(this).attr("shortname"), keyword:$(this).attr("keyword"), suggestUrl:$(this).attr("suggesturl")};
					$("#addressbaricon").attr("src",$("img",this).attr("src")).css("opacity",1);
					hideResults();
				}
			});
			if (keywordMatch == false && !window.keywordEngine) {
				$("#addressbaricon").attr("src","chrome://favicon/null").css("opacity",.75);
				$(".switchtext").html("Switch to tab:").css("display","");
			}
		}

		if (window.keywordEngine) {
			$("#awesomeInsetButton").addClass("insetButton").removeClass("noInsetButton");
			if (noQuery) {
				$("#opensearch_results").css("display","none").html("");
			} else {
				$(".switchtext").html(window.keywordEngine.shortname).css("display","table-cell");
				if ($("#awesomeinput").val().substr(0,window.keywordEngine.keyword.length+1) == window.keywordEngine.keyword+" ") {
					$("#awesomeinput").val($("#awesomeinput").val().substr(window.keywordEngine.keyword.length+1));
				}
				if ($("#awesomeinput").val().length) {
					if (justEnabledKeywordEngine) {
						getSearchSuggestions(true);
					} else {
						getSearchSuggestions();
					}
				} else {
					$("#opensearch_results").css("display","none").html("");
				}
				return;
			}
		} else {
			$("#awesomeInsetButton").removeClass("insetButton").addClass("noInsetButton");
			$("#opensearch_results").css("display","none").html("");
		}
	}

	// If the user has entered text into the Address Box, or if the user is just getting the top results...
	if ( ($("#awesomeinput").length > 0 && $("#awesomeinput").val().length) || noQuery ) {

		// If results exist right now, auto-fill the Address Box's input with a matching URL if possible
		if ($(".result").length > 0) {
			autofillInput();
		}

		// Get ready for the results
		var sHI = {};

		if (openDb()) {
			// has to be transaction instead of readTransaction for FTS table (not currently implemented, but just for the record)
			window.db.readTransaction(function(tx) {

				// If Address Box input exists, sort out how the SQL select statement should be crafted
				if (!noQuery) {
					var actualText = getAiSansSelected();
					actualText = actualText.trim();
					var words = explode(" ", actualText);
					var urltitleWords = new Array();
					var urltitleQMarks1 = new Array();
					var urltitleQMarks2 = new Array();
					var modifiers = '';

					urltitleWords[urltitleWords.length] = thisQuery+"%";

					for (var w in words) {
						if (words[w] != "") {
							if (words[w].toLowerCase() == 'is:fav') {
								modifiers += ' AND type = 2 ';
							}
							else {
								urltitleWords[urltitleWords.length] = '%'+str_replace("_","¸_",str_replace("%","¸%",words[w]))+'%';
								urltitleQMarks2[urltitleQMarks2.length] = ' urltitletag LIKE ? ESCAPE "¸" ';
							}
						}
					}
				}

				// If actual words exist in the Address Box's input (or if we're getting just getting the top results)...
				if (noQuery || urltitleWords.length > 0 || modifiers != "") {
					var selectStatement = '';

					// Specify the max amount of results to get
					if (noQuery) {
						var resultLimit = 12;
					} else {
						var resultLimit = localStorage.option_maxaddressboxresults ? localStorage.option_maxaddressboxresults : 12;
					}
					resultLimit = resultLimit * 2;

					// Normal SQLite table search

					// Specify for the SQL statement if we're to be getting history items and/or bookmarks
					var typeOptions = new Array;
					if (localStorage.option_showmatchinghistoryitems && localStorage.option_showmatchinghistoryitems == 1) {
						typeOptions[typeOptions.length] = ' type = 1 ';
					}
					if (localStorage.option_showmatchingfavs && localStorage.option_showmatchingfavs == 1) {
						typeOptions[typeOptions.length] = ' type = 2 ';
					}
					typeOptions[typeOptions.length] = ' type = -1 ';
					typeOptions = implode(" OR ", typeOptions);

					// Ignore titleless results if user has opted. But still keep proper files like .js, .php, .pdf, .json, .html, etc.
					var titleless = localStorage.option_ignoretitleless == 1 ? ' AND (title != "" OR urls.url LIKE "%.__" OR urls.url LIKE "%.___" OR urls.url LIKE "%.____" OR urls.url LIKE "%/") ' : "";

					// If user is editing site tiles, don't show results for tiles that have already been added.
					var editModeUrls = '';
					if (window.tileEditMode && window.tileEditMode == true) {
						$("#topthumbs a").each(function(){
							editModeUrls += ' AND urls.url != "'+$(this).attr("url")+'" ';
						});
					}

					// And now to create the statement.
					// If we're just getting the top sites...
					if (noQuery) {
						selectStatement = 'SELECT url, title, type, id, tag FROM urls WHERE ('+typeOptions+') AND queuedfordeletion = 0 '+ titleless + editModeUrls +' ORDER BY frecency DESC, type DESC LIMIT '+resultLimit;
					}

					// If we're searching using the words from the Address Box's input...
					else if (urltitleWords.length > 0) {
						selectStatement = ''
						+ ' SELECT urls.url, title, type, frecency, urls.id, urls.tag, (urls.url||" "||title||" "||urls.tag) AS urltitletag, tags.url*0 as tagscore'
						+ ' FROM urls '
						+ ' LEFT JOIN tags '
						+ ' ON urls.url = tags.url AND tags.tag LIKE ? ' 																  //OR tags.tag LIKE ?
						+ ' WHERE ('+typeOptions+') AND queuedfordeletion = 0 '+modifiers+' '+(urltitleQMarks2.length ? ' AND '+implode(" AND ", urltitleQMarks2) : ' ')+' ' + titleless + editModeUrls
						+ ' ORDER BY tagscore DESC, frecency DESC, type DESC LIMIT '+resultLimit;
					}

					// Not sure if this actually ever gets used.
					else {
						selectStatement = 'SELECT url, title, type, id, tag FROM urls WHERE ('+typeOptions+') AND queuedfordeletion = 0 '+ modifiers + titleless + editModeUrls +' ORDER BY frecency DESC, type DESC LIMIT '+resultLimit;
					}


					// If the user's computer is lagging and taking a while to retrieve the results, display a loading on the left side of the Address Box
					window.waitingForResults = true;
					window.fetchResultStartTime = microtime(true);
					setTimeout(function(){
						if (window.waitingForResults == true && microtime(true) - window.fetchResultStartTime > 1 && $("#awesomeinput:focus").length == 1 && $("#awesomeinput").getSelection().length != $("#awesomeinput").val().length) {
							$("#addressbaricon").attr("src","chrome://resources/images/throbber.svg");
						} else if ($("#addressbaricon").attr("src") == "chrome://resources/images/throbber.svg") {
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
					window.selectStatement = selectStatement;
					window.thisQuery = thisQuery;
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
						var jsTest = 'javascript:void';
						for (var i = 0; i < len; i++) {
							newItem = {};
							if (results.rows.item(i).url.toLowerCase().substring(0,jsTest.length) != jsTest) {
								newItem.url = results.rows.item(i).url;
								newItem.title = results.rows.item(i).title;
								newItem.id = results.rows.item(i).id;
								newItem.tag = results.rows.item(i).tag;
								if (results.rows.item(i).type == 2) {
									newItem.isBookmark = true;
								}
								sHI[i] = newItem;
							}
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

						// Getting ready to make matching words appear bold/underlined
						var text = getAiSansSelected();

						// The ¸ cedilla character will largely act as a special/unique character for our bold/underline character replacement method below, so make it be a space if user happens to use it (sorry to anyone who actually uses it!)
						text = str_replace("¸", " ", text);

						// Replace other special characters with their HTML equivalents (or is it the other way around...?)
						text = replaceSpecialChars(text);

						var resultHtml = "";
						var titleText = "";
						var urlText = "";
						var tagText = "";
						var urlTextAttr = "";
						var regEx = "";
						var matchClasses = "";
						var spanOpen = "";
						var spanClose = "";
						var hI = "";
						var resultIsOkay = true;
						var arrowedClass = '';
						var urlExplode = '';
						var newHref = '';

						if (window.tileEditMode && window.tileEditMode == true) {
							var resultOnClick = 'addTile(this); return false';
							var addTileText = 'Add tile: ';
						} else {
							var resultOnClick = 'return window.clickResult(this)';
							var addTileText = '';
						}

						// Another chance to cancel... don't want to waste processing time!
						if (thisQuery != window.actualUserInput || !noQuery && $(".glow").length == 1) {
							if (localStorage.option_timing == "delayed") {
								return false;
							}
						}

						// Process the blacklist
						if (localStorage.option_blacklist.length) {
							var blacksites = explode(",", localStorage.option_blacklist);
						} else {
							var blacksites = new Array;
						}

						// As we're close to showing the new results, hide any currently shown results.
						hideResults();

						// For each history item and bookmark we've retrieved that matches the user's text...
						for (var ii in sHI) {
							if (currentRows < maxRows) {
								hI = sHI[ii];
								resultIsOkay = true;

								// Check to see if site is on the blacklist
								if (resultIsOkay == true && blacksites.length) {
									for (var b in blacksites) {
										var bs = blacksites[b].trim();
										var blackparts = explode("*",bs);
										var partsMatched = 0;
										for (var p in blackparts) {
											if (strstr(hI.url, blackparts[p])) {
												partsMatched++;
											}
										}
										if (partsMatched == blackparts.length) {
											resultIsOkay = false;
											break;
										}
									}
								}

								// When searching the database, Fauxbar returns both history and bookmarks. <strike>History items</strike> Bookmarks come first.
								// If this is a bookmark result, add a bookmark icon to the existing history result.
								// Then, cancel continuing on with this result.
								if (resultIsOkay == true && $('.result[url="'+hI.url+'"]').length > 0) {
									if ($('.result[url="'+hI.url+'"] img.favstar').length == 0) {
										if (!strstr(getAiSansSelected().toLowerCase(), "is:fav")) {
											if (hI.isBookmark && !noQuery) { // bookmark
												//$('.result_title[url="'+hI.url+'"]').html('<img class="result_favicon" src="chrome://favicon/'+hI.url+'" />'+titleText);
												//$('.result[url="'+hI.url+'"]').prepend('<img class="favstar" />');
											}
											resultIsOkay = false;
										}
									} else if (localStorage.option_consolidateBookmarks && localStorage.option_consolidateBookmarks == 1) {
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

									urlText = urldecode(hI.url);

									// Remove "http://" from the beginning of URL if user has opted for it in the Options
									if (urlText.substring(0,7) == 'http://' && localStorage.option_hidehttp && localStorage.option_hidehttp == 1) {
										urlText = urlText.substr(7);
										if (substr_count(urlText, '/') == 1 && urlText.substr(urlText.length-1) == '/') {
											urlText = urlText.substr(0, urlText.length-1);
										}
									}

									tagText = hI.tag;

									// Replace special characters with a bunch of % symbols
									titleText = replaceSpecialChars(titleText);
									urlText = replaceSpecialChars(urlText);
									tagText = replaceSpecialChars(tagText);

									// Wrap each word with some funky characters
									for (var iii in words) {
										if (words[iii] != "") {
											regEx = new RegExp(words[iii], 'gi');
											titleText = titleText.replace(regEx, '¸%%%%%¸$&¸%%%%¸');
											urlText = urlText.replace(regEx, '¸%%%%%¸$&¸%%%%¸');
											tagText = tagText.replace(regEx, '¸%%%%%¸$&¸%%%%¸');
										}
									}

									// Replace those funky percent symbols back to normal.
									// This is all in an effort to make RegExp work, so that the user can use full character searching :)
									titleText = replacePercents(titleText);
									urlText = replacePercents(urlText);
									tagText = replacePercents(tagText);

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
									tagText = str_replace("¸%%%%%¸", spanOpen, tagText);
									tagText = str_replace("¸%%%%¸", spanClose, tagText);

									titleText = str_replace('&', '&amp;', titleText);
									urlText = str_replace('&', '&amp;', urlText);
									tagText = str_replace('&', '&amp;', tagText);

									titleText = str_replace(spanOpen, "¸%%%%%¸", titleText);
									titleText = str_replace(spanClose, "¸%%%%¸", titleText);
									urlText = str_replace(spanOpen, "¸%%%%%¸", urlText);
									urlText = str_replace(spanClose, "¸%%%%¸", urlText);
									tagText = str_replace(spanOpen, "¸%%%%%¸", tagText);
									tagText = str_replace(spanClose, "¸%%%%¸", tagText);

									titleText = str_replace(">", "&gt;", titleText);
									titleText = str_replace("<", "&lt;", titleText);

									urlText = str_replace(">", "&gt;", urlText);
									urlText = str_replace("<", "&lt;", urlText);

									tagText = str_replace(">", "&gt;", tagText);
									tagText = str_replace("<", "&lt;", tagText);

									titleText = str_replace("¸%%%%%¸", spanOpen, titleText);
									titleText = str_replace("¸%%%%¸", spanClose, titleText);
									urlText = str_replace("¸%%%%%¸", spanOpen, urlText);
									urlText = str_replace("¸%%%%¸", spanClose, urlText);
									tagText = str_replace("¸%%%%%¸", spanOpen, tagText);
									tagText = str_replace("¸%%%%¸", spanClose, tagText);

									// Make the URL display the "Switch to tab" text if tab is already open in current window
									urlTextAttr = urlText;
									if (!window.tileEditMode && !window.keywordEngine) {
										for (var ct in window.currentTabs) {
											if (currentTabs[ct].url == hI.url) {
												urlText = '<img src="tabicon.png" style="opacity:.6" /> <span class="switch">Switch to tab</span>';
											}
										}
									}

									// Render the result's HTML
									if (resultIsOkay == true) {
										resultHtml = "";
										arrowedClass = '';

										// If URL starts with file:/// handle the URL with Fauxbar, since Chrome doesn't interpret it as a link.
										if (hI.url.length >= 8 && hI.url.substring(0, 8) == "file:///") {
											newHref = "loadfile.html#"+hI.url;
										} else {
											newHref = hI.url;
										}

										resultHtml += '<a class="result '+arrowedClass+'" url="'+hI.url+'" href="'+newHref+'" origtitle="'+hI.title+'" number="'+(currentRows+1)+'" onclick="'+resultOnClick+'" bmid="'+hI.id+'" keyword="'+hI.tag+'">';
										if (hI.isBookmark) {
											resultHtml += '<img class="favstar" style="position:absolute;" />';
										}
										resultHtml += '	';
										if (hI.tag) {
											resultHtml += '<span class="resultTag" style="white-space:nowrap; position:absolute; display:block; font-size:'+localStorage.option_urlsize+'px; text-decoration:none">'+tagText+'</span>';
										}
										resultHtml += '	<div class="result_title" url="'+hI.url+'"><img class="result_favicon" src="chrome://favicon/'+hI.url+'" />'+titleText+'</div><br />';
										resultHtml += '	<div class="result_url">'+addTileText+urlText+'</div>';
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
						if ($("#addressbaricon").attr("src") == "chrome://resources/images/throbber.svg") {
							$("#addressbaricon").attr("src","chrome://favicon/null");
						}

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
							$("#results").css("display","block").css("opacity",0).
								css("width", $("#addresswrapper").outerWidth()-2+"px").css("position","fixed")
								.css("top",$("#awesomeinput").offset().top+$("#awesomeinput").outerHeight()+4+"px")
								.css("left",$("#addresswrapper").offset().left-2+"px")
							;

							// "Truncate" result titles and urls with "..." if they're too long.
							// This is kind of dodgy because it's just creating a <span> containing "..." on top of the right side of the results.
							// Might be better to actually truncate, though it would be slower.
							window.cutoff = 70;
							if (window.resultsAreScrollable == false) {
								window.cutoff = window.cutoff - getScrollBarWidth();
							}

							$("#results .result_url").each(function(){
								if ($(this).innerWidth() > $("#results").innerWidth() - 52) {
									$(this).css("width", ($("#results").innerWidth() - 52) + "px").prepend('<span class="dotdotdot">...</span>');
								}
							});

							var starWidth = 0;

							$("#results .result_title").each(function(){
								starWidth = 16;
								tagWidth = $(this).prev(".resultTag").innerWidth() + ($(this).prev(".resultTag").length * -6);

								if ($(this).offset().left+$(this).outerWidth() > $("#results").offset().left+$("#results").innerWidth() - 10 - starWidth - tagWidth) {
									$(this)
										.css("width", ($("#results").outerWidth()-16-starWidth-tagWidth)+"px")
										.prepend('<span class="dotdotdot" style="font-size:14px">...</span>')
									;
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
							$("#results .result").last().css("border-bottom",0);

							var scrollbarWidth = window.resultsAreScrollable ? getScrollBarWidth() : 0;

							$("#results .favstar").attr("src", $("#fauxstar").attr("src")).css("margin-left",($("#results").innerWidth()-25-scrollbarWidth)+"px").css("margin-top","2px");
							$(".resultTag").each(function(){
								$(this).css("left", $("#results").offset().left + $("#results").outerWidth() - $(this).outerWidth() - $(this).offset().left - ($(this).prev(".favstar").length*16) - scrollbarWidth);
							});

							if (keywordMatch == false && thisQuery == window.actualUserInput && !window.keywordEngine) {
								toggleSwitchText();
							}
							window.mouseHasMoved = false;

							if (window.keywordEngine && !noQuery) {
								hideResults();
								return;
							}
							if (thisQuery.length || thisQuery == window.actualUserInput || (!noQuery && $(".glow").length == 1)) {
								$("#results").attr("noquery",(noQuery?1:0)).css("opacity",1);
							}

							// Tell Chrome to pre-render the first result for the user
							if (!noQuery && localStorage.option_prerender == 1 && $(".switch").length == 0 && !window.tileEditMode) {
								setTimeout(function(){
									if (thisQuery == window.actualUserInput) {
										var theUrl = $(".result").first().attr("url");
										$("body").append('<link rel="prerender" href="'+theUrl+'">');
										console.log('Asking Chrome to pre-render '+theUrl);
										window.prerenderedUrl = theUrl;
									}
								}, parseFloat(localStorage.option_prerenderMs));
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
					});
				}
			}, function(t){
				errorHandler(t, getLineInfo());
			});
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
	var ai = 'ai='+urlencode(window.actualUserInput ? window.actualUserInput : $("#awesomeinput").val());
	var os = '&os='+urlencode($("#opensearchinput").val());
	var sel = '&sel=';
	var ke = '&ke=';
	var options = "";
	if ($("#awesomeinput:focus").length || window.goingToUrl) {
		sel += 'ai';
	} else if ($("#opensearchinput:focus").length) {
		sel += 'os';
	}
	if (getHashVar("options") == 1) {
		options = "&options=1";
	}
	if (window.keywordEngine) {
		ke += window.keywordEngine.keyword;
	}
	var hash = '#'+ai+os+sel+ke+options;
	if (hash != window.location.hash) {
		window.location.hash = hash;
	}
	return true;
}

// Tell the tab to go to a URL.
function goToUrl(url, fromClickedResult) {
	if (window.keywordEngine && !window.executingKeywordSearch) {
		//$("#opensearch_results").css("display","none").html("");
		submitOpenSearch(url);
		return;
	}
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

	// If we're editing tiles and user has pressed Enter, add tile instead of visiting URL.
	} else if (window.tileEditMode && window.tileEditMode == true) {
		if ($('.result[href="'+url+'"]').length > 0) {
			addTile($('.result[href="'+url+'"]'));
		} else {
			setTimeout(function(){
				$("#awesomeinput").focus();
			}, 10);
		}
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
		if (window.keywordEngine) {
			setTimeout(function(){
				$("#awesomeinput").focus();
			}, 100);
		}
	} else {
		chrome.tabs.getCurrent(function(tab){
			chrome.tabs.update(tab.id, {url:url});
		});
	}

	if (window.prerenderedUrl && window.prerenderedUrl == url) {
		chrome.extension.sendRequest("process prerendered page");
	}
}





// Below are a lot of copied/pasted functions from other sources.
// If your code is listed below, thank you!

// And at the very bottom of this file are some Options page functions.

/////////////////////////////////////

// http://www.javascripter.net/faq/hextorgb.htm
function hexToR(h) { return parseInt((cutHex(h)).substring(0,2),16) }
function hexToG(h) { return parseInt((cutHex(h)).substring(2,4),16) }
function hexToB(h) { return parseInt((cutHex(h)).substring(4,6),16) }
function cutHex(h) { return (h.charAt(0)=="#") ? h.substring(1,7) : h}

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


////////////// OPTIONS FUNCTIONS ////////////


if (getHashVar("options") == 1) {

	function editSiteTiles() {
		chrome.tabs.getAllInWindow(null, function(tabs){
			for (var t in tabs) {
				console.log(tabs[t].title+" - "+tabs[t].url);
				if (tabs[t].title == "Fauxbar: Edit Tiles" && (strstr(tabs[t].url, chrome.extension.getURL("fauxbar.html")) || strstr(tabs[t].url, "chrome://newtab"))) {
					chrome.tabs.update(tabs[t].id, {selected:true});
					return;
				}
			}
			chrome.tabs.create({url:"fauxbar.html#edittiles=1"});
		});
	}

	function toggleSiteTileOptions(el) {
		if ($(el).val() == "manual") {
			$("#option_topsiterows").css("display","none");
			$("#infiniterows").html("&nbsp;&#8734;").css("display","");
			$("#siteTileCheckboxes").css("display","none");
			$("#siteTileEditInfo").css("display","");
		} else {
			$("#option_topsiterows").css("display","");
			$("#infiniterows").css("display","none");
			$("#siteTileCheckboxes").css("display","");
			$("#siteTileEditInfo").css("display","none");
		}
	}

	function loadOptionsJS() {
		$("#option_showtopsites").live("change", function(){
			if ($("#option_showtopsites").prop("checked") == true) {
				$("#topSiteOptions").css("display","");
			} else {
				$("#topSiteOptions").css("display","none");
			}
		});
		$("#option_pagetilearrangement").live("change", function(){
			toggleSiteTileOptions(this);
		});

		$("#option_pagetilearrangement").trigger("change");
		$("#option_showtopsites").trigger("change");

		$(".favstar").attr("src", $("#fauxstar").attr("src"));

		var total = localStorage.unreadErrors;
		if (total > 0) {
			var words = total == 1 ? 'There is 1 error to report.' : 'There are '+total+' errors to report.';
			$("#errorLabel").css("font-weight","bold").find("span").html(words);
		} else {
			$("#errorLabel span").html('There are no errors to report.');
		}

		// Error count beside Management menu option
		$("#option_showErrorCount").bind("change", function(){
			if ($(this).prop("checked") == 1 && localStorage.unreadErrors && localStorage.unreadErrors > 0) {
				$("#errorCount").css("display","");
			} else {
				$("#errorCount").css("display","none");
			}
		});
		$("#errorCount").html(total);
		if (!localStorage.option_showErrorCount || localStorage.option_showErrorCount == 0 || !localStorage.unreadErrors || localStorage.unreadErrors == 0) {
			$("#errorCount").css("display","none");
		}

		updateHelperStatus();

		if (localStorage.option_customscoring != 1) {
			$(".customscoring").css("display","none");
		}
		$("#option_customscoring").bind("change", function(){
			if ($(this).prop("checked") == true) {
				$(".customscoring").css("display","table-row");
			} else {
				$(".customscoring").css("display","none");
			}
		});

		chrome.extension.onRequest.addListener(function(r){
			if (r == "reload options") {
				window.location.reload();
			}
		});

		$("#option_pagetilearrangement, #option_topsiterows, #option_topsitecols").bind("change", function(){
			setTimeout(function(){
				chrome.extension.sendRequest("loadThumbsIntoMemory");
			}, 200);
		});

		// Get Fauxbar's Twitter RSS feed, find the first non-reply, and use it as a news message
		// If there's no cache or if cache is more than an hour old, fetch news
		if (!localStorage.latestNewsTime || !localStorage.latestNews || parseFloat(date("U")) - parseFloat(localStorage.latestNewsTime) > 3600) {
			$.ajax({
				type: "GET",
				url: "http://twitter.com/statuses/user_timeline/Fauxbar.rss",
				dataType: "xml",
				success: function(data){
					var newText = '';
					$("title",data).each(function(){
						if (newText.length == 0 && $(this).text().substr(0,9) == "Fauxbar: " && $(this).text().substr(0,10) != "@") {
							var text = $(this).text().substr(9);
							var words = explode(" ", text);
							if (words.length) {
								var newWords = new Array;
								for (var w in words) {
									if (words[w].substr(0,4) == "http") {
										newWords[newWords.length] = '<a href="'+words[w]+'" target="_blank" style="color:#06c">'+words[w]+'</a>';
									} else {
										newWords[newWords.length] = words[w];
									}
								}
								text = implode(" ",newWords);
							}
							newText = text;
						}
						if (newText.length > 0) {
							localStorage.latestNewsTime = date("U");
							localStorage.latestNews = newText;
							$("#latestNews").html(newText);
						} else {
							$("#latestNews").html('Please view <a href="http://twitter.com/Fauxbar" target="_blank" style="color:#06c">Fauxbar\'s Twitter account</a> for the latest news.');
						}
					});
				},
				error: function(){
					$("#latestNews").html('Please view <a href="http://twitter.com/Fauxbar" target="_blank" style="color:#06c">Fauxbar\'s Twitter account</a> for the latest news.');
				}
			});

		// Otherwise just use existing news cache
		} else {
			$("#latestNews").html(localStorage.latestNews);
		}
	}
}