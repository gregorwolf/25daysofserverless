'use strict';
const https = require('https');
/**
 * @param {FaasEvent} event
 * @param {FaasContext} context
 * @return {Promise|*}
 */

module.exports = {
	handler: function (event, context) {
		const rawURL = "https://raw.githubusercontent.com/gregorwolf/25daysofserverlessDay3/master/"
		var githubData = event.data
		// console.log(githubData)
		githubData.commits.forEach(function(commit){
			if(commit.added.length > 0) {
				commit.added.forEach(function(file){
					var contentURL = rawURL + file
					console.log(contentURL)
					https.get(contentURL, (resp) => {
						let data = '';

						// A chunk of data has been recieved.
						resp.on('data', (chunk) => {
							data += chunk;
						});
						
						// The whole response has been received. Print out the result.
						resp.on('end', () => {
							console.log(data);
						});
						
						}).on("error", (err) => {
						console.log("Error: " + err.message);
					});
				})
			}
		});
		var ret = {
			"result": "OK"
		};
		return JSON.stringify(ret);
	}
};