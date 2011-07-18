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

// http://phpjs.org/functions/str_replace:527
window.str_replace = function (search, replace, subject, count) {
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

$(document).ready(function(){
	window.openSearch = 'head link[rel="search"][type="application/opensearchdescription+xml"]';
	window.formFound = false;
	$('form').each(function(){
		if ($('input[type="text"][name!=""][disabled!="disabled"]',this).length == 1 && $('input[type="password"]',this).length == 0 && window.formFound == false) {
			if (!strstr($(this).html().toLowerCase(), 'mail')) {
				window.method = "get";
				if ($(this).attr("method").length > 0) {
					window.method = $(this).attr("method");
				}
				var urlToGet = $(this).attr("action");
				if (urlToGet.substr(0,7) != 'http://' && urlToGet.substr(0,8) != 'https://') {
					var urlParts = window.location.href.split('/');
					var newUrl = urlParts[0]+'//'+urlParts[2];
					if (urlToGet.substr(0,1) != '/') {
						newUrl += '/';
					}
					urlToGet = newUrl + urlToGet;
				}

				var origSearchTerms = $('input[type="text"][name!=""]',this).first().val();
				$('input[type="text"][name!=""][disabled!="disabled"]',this).first().val('111111111');
				urlToGet += '?' + $(this).serialize();
				$('input[type="text"][name!=""][disabled!="disabled"]',this).first().val(origSearchTerms);
				urlToGet = window.str_replace('=111111111', '={searchTerms}', urlToGet);

				window.improper = true;
				window.actionAttr = urlToGet;

				chrome.extension.sendRequest({
					action: "showPageAction",
					improper: true,
					actionAttr: urlToGet,
					hostname: window.location.hostname
				});
				window.formFound = true;
			}
		}
	});
});