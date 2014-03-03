// Copyright (c) 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//    * Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
//    * Redistributions in binary form must reproduce the above
// copyright notice, this list of conditions and the following disclaimer
// in the documentation and/or other materials provided with the
// distribution.
//    * Neither the name of Google Inc. nor the names of its
// contributors may be used to endorse or promote products derived from
// this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

var url_link = '';
/*
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
*/
chrome.contextMenus.onClicked.addListener(function (info, tab) {
	/// begin doing my testing for virus detection.
	/// Use Alerts at the moment.
	url_link = info.linkUrl;
	// check for api key value pair
	var apikey = localStorage['apikey'];
	if (undefined == apikey) {
		chrome.tabs.executeScript(null, {
			code: 'alert("No valid API Key Found. Please Add one using the extension popup above.")'
		});
	}
	/// Try doing your analysis.
	else {
		data_download(url_link);
	}
});

chrome.contextMenus.create({
	id: 'open',
	title: 'Scan url link for viruses',
	contexts: ['link'],
});
chrome.downloads.onCreated.addListener(function(downloadItem){
if(localStorage['auto'] === '1'){
	//chrome.downloads.pause(downloadItem.id);
	url_link = downloadItem.url;
	data_download(url_link);
	console.log("auto scanning started");
}
console.log(downloadItem.id);
//chrome.downloads.resume(integer downloadId, function callback)

});

