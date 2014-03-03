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
	var url_name_f = url_link.substring(url_link.lastIndexOf('/') + 1);
	http.setRequestHeader("filename", url_name_f);		
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
				
				var file_encode_string = CryptoJS.enc.Latin1.parse(c.result);
				/// SHA1 Hash used as its hashing time was smaller then md5 and sha256 when compared. Speed test code commented out.
//				var start = new Date().getTime();
//				var hash = CryptoJS.MD5(file_encode_string);
//				var end = new Date().getTime();
//				var time = end - start;
//				console.log("Time taken for MD5: "+ time);
//				
//				var start = new Date().getTime();
//				var hash_256 = CryptoJS.SHA256(file_encode_string);
//				var end = new Date().getTime();
//				var time = end - start;
//				console.log("Time taken for 256: "+ time);
				
//				var start = new Date().getTime();
				var hash = CryptoJS.SHA1(file_encode_string);
//				var end = new Date().getTime();
//				var time = end - start;
//				console.log("Time taken for sha1: "+ time);
				
				//console.log('SHA256 Hash : ' + hash);
				console.log('SHA1 Hash : ' + hash);
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
	}
}

function history(url_or,url_res,o_name,status){
	if(o_name === ''){
	o_name = url_or;
	}
	var his_local = localStorage['history'];
	var his_item = {"item":[o_name,url_or,url_res,status]};	
	
	his_parse = JSON.parse(his_local);
	his_parse.push(his_item);
	
	his_item = JSON.stringify(his_parse);
	localStorage['history'] = his_item;
	
}

/// this is a test to see if the api is working for the given hash.
//get_results('057db92f3d0c4c2490a95297b556b9a9');
