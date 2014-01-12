// Copyright (c) 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var url_link = '';

function getOpeningIds() {
        var ids = [];
        try {
                ids = JSON.parse(localStorage.openWhenComplete);
        } catch (e) {
                localStorage.openWhenComplete = JSON.stringify(ids);
        }
        return ids;
}

function setOpeningIds(ids) {
        localStorage.openWhenComplete = JSON.stringify(ids);
}

chrome.downloads.onChanged.addListener(function (delta) {
        if (!delta.state || (delta.state.current != 'complete')) {
                return;
        }
        var ids = getOpeningIds();
        if (ids.indexOf(delta.id) < 0) {
                return;
        }
        chrome.downloads.open(delta.id);
        ids.splice(ids.indexOf(delta.id), 1);
        setOpeningIds(ids);
});
chrome.contextMenus.onClicked.addListener(function (info, tab) {
        /// begin doing my testing for virus detection.
        /// Use Alerts at the moment.
        url_link = info.linkUrl;
        // check for api key value pair
        var apikey = localStorage['apikey'];
        if(undefined == apikey){
	chrome.tabs.executeScript(null, {code: 'alert("No valid API Key Found. Please Add one using the extension popup above.")'});
    }
    /// Try doing your analysis.
    else{
        data_download(url_link);
    }



        ///
        ///
/*chrome.downloads.download({url: url_link}, function(downloadId) {
    var ids = getOpeningIds();
    if (ids.indexOf(downloadId) >= 0) {
      return;
    }
    ids.push(downloadId);
    setOpeningIds(ids);
  });*/
        //
});

chrome.contextMenus.create({
        id: 'open',
        title: 'Scan link for viruses',
        contexts: ['link'],
});
