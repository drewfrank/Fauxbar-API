// Accept connections from other extensions that want to make use of
// Fauxbar's suggestion engine.
//
// Incoming messages should have a single field named "query" whose
// value is a string to use for generating suggestions.
//
// The response message contains an arra of suggestion objects, each
// with the following fields:
//  - query (included here for convenience)
//  - url
//  - title
//  - tag
//  - tabId (possibly undefined)
//  - isBookmark
chrome.extension.onConnectExternal.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    suggestionApi(msg.query, function (suggestions) {
        port.postMessage({suggestions: suggestions})
    });
  });
});
