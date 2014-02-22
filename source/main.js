// Agustin Roldan 2014 https://metarco.com


///// check to see if this is a new install
function install() {
	if (localStorage.getItem('install_time')) return;

	var time = new Date().getTime();
	localStorage.setItem('install_time', time);
	localStorage.setItem('history','[]');
	localStorage.setItem('auto','0');
	/// Open a install page to enter api key.
	chrome.tabs.create({
		url: "key_input.html"
	});
}

install();

/// This the the code that implements the api and does the appropiate actions for a given file.
var obj_ret_results; /// JSON response for results
var obj_ret; /// JSON response for results
var act_id; /// Global id for file
var blob_data;
var file_name;
var se;

/// send hash and get results

function link_send(origin) {
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
			scan_check(res_scan, obj_ret);
			//console.log(obj_ret);
			//return obj_ret;
		}
	}

	xmlhttp.open("GET", "https://api.metascan-online.com/v1/hash/" + hash_data, true);
	xmlhttp.setRequestHeader("apikey", localStorage['apikey']);
	xmlhttp.send();
}

/// send id data and get results. Repeat checking till 100 percent reached.

function get_results(origin) {
	hash_data = origin;
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			/// Get response and begin analysis.
			var obj_ret_results = JSON.parse(xmlhttp.responseText);
			console.log(obj_ret_results);
			console.log('Almost done : ' + obj_ret_results.scan_results.progress_percentage);
			/// Get results and see if analysis is complete.
			if (obj_ret_results.scan_results.progress_percentage < 100) {
				// run setTimeout to wait 5 seconds and look for more updated results.
				se = setTimeout(function () {
					get_results(act_id.data_id);
				}, 5000);
			}
			if (obj_ret_results.scan_results.progress_percentage == 100) {
				clearTimeout(se);
				var res_scan = obj_ret_results.scan_results.scan_all_result_a;
				// Check if results exist for hash lookup
				scan_check(res_scan, obj_ret_results);

			}

		}
	}

	xmlhttp.open("GET", "https://api.metascan-online.com/v1/file/" + hash_data, true);
	xmlhttp.setRequestHeader("apikey", localStorage['apikey']);
	xmlhttp.send();
}

/// Send file and get data id for checking file results. This function sends the file to the api.

function send_file_api(file_data) {
	console.log('Sending File for analysis....');
	var http = new XMLHttpRequest();
	http.onreadystatechange = function (e) {
		if (http.readyState == 4 && http.status == 200) {
			// getting response from api for sending data. Get data id and send another api call for results.
			var blob_id = this.response;
			console.log(blob_id);
			act_id = JSON.parse(blob_id);
			console.log(act_id.data_id);
			get_results(act_id.data_id);
		}
	}
	http.open("POST", "https://api.metascan-online.com/v1/file", true);
	http.setRequestHeader("apikey", localStorage['apikey']);
	http.send(file_data);
}



/// download file using url and create filereader object and begin analysis. find hash first.

function data_download(url) {
	// Download data
	// send data to api for analysis
	// recieve response from api and make appropiate selection
	// if ok, then using the same data blob download without haivng to re download. - crashing bug on second download.
	// if not safe than take user to new page and show results data.
	var xhr = new XMLHttpRequest();
	//xhr.open('GET', 'http://www.awc.org/pdf/DA6-BeamFormulas.pdf', true);
	xhr.open('GET', url, true);
	/// This next line allows you to use the XMLHttpRequest to download binary data.
	xhr.overrideMimeType('text\/plain; charset=x-user-defined');
	xhr.responseType = 'blob';
	xhr.onreadystatechange = function (e) {
		if (xhr.readyState == 4 && xhr.status == 200) {
			// getting blob data and preparing for download
			blob_data = this.response;
			//var blob_type = blob_data.type;
			var c = new FileReader;
			c.onload = function (e) {
				// Calculate Hash
				/// encode binary string for hash.
				
				/// MD5 Hash used for faster hashing determination.
				var hash = CryptoJS.MD5(CryptoJS.enc.Latin1.parse(c.result));
				//var hash = CryptoJS.SHA256(CryptoJS.enc.Latin1.parse(c.result));
				//console.log('SHA256 Hash : ' + hash);
				console.log('MD5 Hash : ' + hash);
				// Do hash lookup first
				console.log('Doing Hash Lookup First....');
				link_send(hash);


			}
			// read file as binary string for hash analysis
			c.readAsBinaryString(blob_data);
		}
	}
	xhr.send();
}

/// Final step : Given results data, determine if you download the file or create a new page with results for infected files and avoid downloading.

function scan_check(res_scan, obj_ret) {
	if (undefined != res_scan) {
		var url_resf = "https://www.metascan-online.com/en/scanresult/file/"+obj_ret.data_id;
		window.open(url_resf);
		var url_name_f = url_link.substring(url_link.lastIndexOf('/') + 1);
		var url_ori = url_link;
		history(url_ori,url_resf,url_name_f,res_scan);

		// Check to see if infected or not
		if (res_scan == 'Infected') {
		/// Now links to the metascan online page for results.
		//window.open("https://www.metascan-online.com/en/scanresult/file/"+obj_ret.data_id);
			//var res_page = window.open("", "Results", "width=700,height=900px,");
			//var temp_res = JSON.stringify(obj_ret);
			//res_page.document.write("<head><title>Results</title><script src='https://google-code-prettify.googlecode.com/svn/loader/run_prettify.js'></script></head><h2>Virus Link Scanner Results : Infected</h2>");
			//res_page.document.write("<pre class='prettyprint'>" + JSON.stringify(obj_ret, undefined, 2) + "</pre>");
			//res_page.document.close();
		} else if (res_scan == 'Clean') {
				//window.open("https://www.metascan-online.com/en/scanresult/file/"+obj_ret.data_id);

			// using saveAS will reuse the blob data and avoid having to make another resource request.
			//saveAs(blob_data, url_link.substring(url_link.lastIndexOf('/') + 1));
			/*chrome.downloads.download({
				url: url_link,
				saveAs: true
			}, function (downloadId) {
				return;
			});*/
		}

	}


}

function history(url_or,url_res,o_name,status){
	var his_local = localStorage['history'];
	var his_item = {"item":[o_name,url_or,url_res,status]};	
	
	his_parse = JSON.parse(his_local);
	his_parse.push(his_item);
	
	his_item = JSON.stringify(his_parse);
	localStorage['history'] = his_item;
	
}

/// this is a test to see if the api is working for the given hash.
//get_results('057db92f3d0c4c2490a95297b556b9a9');
