var temp_res = JSON.parse(localStorage['history']);
		var final_html = "";
		final_html +="<h2>History</h2>";
		final_html += "<body><table style='width:100%;'><tr><td>Original Link</td><td>MetaScan Online Results</td><td>Status</td></tr>";
		for(var i = temp_res.length-1;i>=0;i--){
			var item_d = temp_res[i];
			for(var key in item_d){
				var data = item_d[key];

				final_html +="<tr><td style='padding:15px;text-align:left;width:50%;overflow:hidden;'><a target='_blank' href='"+data[1]+"'>"+data[1]+"</a></td><td style='width:30%;overflow:hidden;'><a target='_blank' href='"+data[2]+"'>Results</a></td><td style='width:20%;overflow:hidden;'>"+data[3]+"</td></tr>";
			}
		}
		final_html +="</body>";
		document.getElementById("main").innerHTML += final_html;
