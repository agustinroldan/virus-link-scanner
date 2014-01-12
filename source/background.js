// Copyright (c) 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var url_link = '';

/*function getOpeningIds() {
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
        data_download(url_link);
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








/////////////// My code implementation of api check.



///// check to see if new install
function install(){
if (localStorage.getItem('install_time'))
        return;

    var time = new Date().getTime();
    localStorage.setItem('install_time', time);
    chrome.tabs.create({url: "key_input.html"});
}
install();



var obj_ret_results; /// JSON response for results
var obj_ret; /// JSON response for results
var act_id; /// Global id for file
var blob_data;
var file_name;

function link_send(origin) {
        str = 'ss';
        hash_data = origin;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                        var obj_ret = JSON.parse(xmlhttp.responseText);
                        //var obj_ret = eval('('+xmlhttp.responseText+')');
                        try {
                                var res_scan = obj_ret.scan_results.scan_all_result_a;
                        } catch (err) {
                                send_file_api(blob_data);
                        }

                        // Check if results exist for hash lookup
                        if (undefined != res_scan) {

                                // Check to see if infected or not
                                if (res_scan == 'Infected') {
                                        var res_page = window.open("", "Results", "width=700,height=900px,");
                                        var temp_res = JSON.stringify(obj_ret);
                                        res_page.document.write("<head><title>Results for " + file_name + "</title><script src='https://google-code-prettify.googlecode.com/svn/loader/run_prettify.js'></script></head><h1>You Shall Not Pass. This file is not safe. Run away !!!!</h1>");
                                        res_page.document.write("<pre class='prettyprint'>" + JSON.stringify(obj_ret, undefined, 2) + "</pre>");
                                        res_page.document.close();
                                } else if (res_scan == 'Clean') {
                                        saveAs(blob_data, url_link.substring(url_link.lastIndexOf('/') + 1));
                                }

                        }
                        //console.log(obj_ret);
                        //return obj_ret;
                }
        }

        xmlhttp.open("GET", "https://api.metascan-online.com/v1/hash/" + hash_data, true);
        xmlhttp.setRequestHeader("apikey", localStorage['apikey']);
        xmlhttp.send();
}

function get_results(origin) {
        str = 'ss';
        hash_data = origin;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                        var obj_ret_results = JSON.parse(xmlhttp.responseText);
                        //var obj_ret = eval('('+xmlhttp.responseText+')');
                        console.log(obj_ret_results);
                        //sleep(3000);
                        console.log('Almost done : ' + obj_ret_results.scan_results.progress_percentage);
                        if (obj_ret_results.scan_results.progress_percentage < 100) {
                                var se = setTimeout(function(){
                                get_results(obj_ret_results.data_id);
                                },5000);
                        }
                        if (obj_ret_results.scan_results.progress_percentage == 100) {
                        	clearTimeout(se);
                                var res_scan = obj_ret_results.scan_results.scan_all_result_a;
                                // Check if results exist for hash lookup
                                if (undefined != res_scan) {

                                        // Check to see if infected or not
                                        if (res_scan == 'Infected') {
                                                var res_page = window.open("", "Results", "width=700,height=900px,");
                                                var temp_res = JSON.stringify(obj_ret_results);
                                                res_page.document.write("<head><title>Results for " + file_name + "</title><script src='https://google-code-prettify.googlecode.com/svn/loader/run_prettify.js'></script></head><h1>You Shall Not Pass. This file is not safe. Run away !!!!</h1>");
                                                res_page.document.write("<pre class='prettyprint'>" + JSON.stringify(obj_ret_results, undefined, 2) + "</pre>");
                                                res_page.document.close();
                                        } else if (res_scan == 'Clean') {
                                                saveAs(blob_data, url_link.substring(url_link.lastIndexOf('/') + 1));
/*chrome.downloads.download({url: url_link}, function(downloadId) {
				    var ids = getOpeningIds();
				    if (ids.indexOf(downloadId) >= 0) {
				      return;
				    }
				    ids.push(downloadId);
				    setOpeningIds(ids);
				  });*/
                                        }

                                }
                              
                                ///////////////////
                        }

                }
        }

        xmlhttp.open("GET", "https://api.metascan-online.com/v1/file/" + hash_data, true);
        xmlhttp.setRequestHeader("apikey", localStorage['apikey']);
        xmlhttp.send();
}

function send_file_api(file_data) {

        var http = new XMLHttpRequest();
        //var fd = new FormData();
        http.onreadystatechange = function (e) {
                if (http.readyState == 4 && http.status == 200) {
                        // getting response from api for sending data. Get data id and send another api call for results.
                        var blob_id = this.response;
                        console.log(blob_id);

                        act_id = JSON.parse(blob_id);
                        //act_id = eval('('+blob_id+')');
                        console.log(act_id.data_id);
                        get_results(act_id.data_id);
                        //var rd = obj_ret_results;
/*while (rd.scan_results.progress_percentage < 100){
				    	get_results(act_id.data_id);
				    	rd = eval('('+obj_ret_results+')');
				    	console.log('Almost done : '+rd.scan_results.progress_percentage);
				    }
				    console.log(obj_ret_results);*/

                }
        }

        //fd.append("file",file_data);
        http.open("POST", "https://api.metascan-online.com/v1/file", true);
        http.setRequestHeader("apikey", localStorage['apikey']);
        http.send(file_data);

}




function data_download(url) {
        /// this dfunction will run to test the data.
        // Download data
        // send data to api for analysis
        // recieve response from api and mkae appropiate selection
        // if ok, then using the same data blob download without haivng to re download.
        // if not safe than take user to new page and show results data.
        var xhr = new XMLHttpRequest();
        //xhr.open('GET', 'http://www.awc.org/pdf/DA6-BeamFormulas.pdf', true);
        xhr.open('GET', url, true);
        xhr.overrideMimeType('text\/plain; charset=x-user-defined');
        xhr.responseType = 'blob';
        xhr.onreadystatechange = function (e) {
                if (xhr.readyState == 4 && xhr.status == 200) {
                        // getting blob data and preparing for download
                        blob_data = this.response;
                        //var blob_type = blob_data.type;
                        var c = new FileReader;
                        c.onload = function (e) {
                                //console.log('Response Data : '+c.result);
                                //console.log('Calculate Hash : MD5....');
                                // Calculate Hash - select and mentio here
                                var hash = CryptoJS.SHA256(CryptoJS.enc.Latin1.parse(c.result));
                                console.log('SHA256 Hash : ' + hash);
                                // Do hash lookup first
                                console.log('Doing Hash Lookup First....');
                                link_send(hash);

                                // Send file for analysis if no file found in api.	
                                console.log('Sending File for analysis....');
                                //send_file_api(c.result);
                                console.log('You have choosen to download the file. File download will begin now');
                                // Using the Filereader library to implement ws3 spec. This 
                                //saveAs(blob_data, url);
                        }
                        c.readAsBinaryString(blob_data);
                }
        }
        xhr.send();
}


//get_results('057db92f3d0c4c2490a95297b556b9a9');
