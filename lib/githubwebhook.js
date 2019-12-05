'use strict';
const https = require('https');
const url = require('url');
const crypto = require('crypto');
const buffer = require('buffer');

/**
 * @param {FaasEvent} event
 * @param {FaasContext} context
 * @return {Promise|*}
 */
const backend = "https://rcpduskkh8xe9q03cture-backend-srv.cfapps.eu10.hana.ondemand.com/media/Pictures";

function httpsCall(body, options) {
    return new Promise((resolve,reject) => {
        const req = https.request(options, res => {
			let data = '';
			// A chunk of data has been recieved.
			res.on('data', (chunk) => {
				data += chunk;
			});
            res.on('end', () => {
                let body = data;
                switch(res.headers['content-type']) {
                    case 'application/json':
                        body = JSON.parse(body);
                        break;
                }
                resolve(body)
            })
        })
        req.on('error',reject);
        if(body) {
			var status = req.write(body);
			console.log('Status:' + status);
        }
        req.end();
    })
}

function doesImageExist(hash) {
	return new Promise((resolve,reject) => {
		var entityUrl = backend + "('" + hash + "')";
		// console.log(entityUrl)
		https.get(entityUrl, (res) => {
		let data = '';

		// A chunk of data has been recieved.
		res.on('data', (chunk) => {
			data += chunk;
		});

		// The whole response has been received. Print out the result.
		res.on('end', () => {
			resolve(JSON.parse(data));
		});

		})
		.on("error",reject);
	})
}

async function createImage(hash) {
	var body = JSON.stringify({
		ID: hash,
	})
	var backendURL = new url.URL(backend)
	var options = {
		method: 'POST',
		hostname: backendURL.hostname,
		path: backendURL.pathname,
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		}
	};
	// console.log(options)
	return await httpsCall(body, options)
}

async function uploadImage(imageData) {
	var body = imageData
	var contentUrl = backend + "/content"
	var backendURL = new url.URL(contentUrl)
	var options = {
		method: 'PUT',
		hostname: backendURL.hostname,
		path: backendURL.pathname,
		headers: {
			'Content-Type': 'image/png'
		}
	};
	// console.log(options)
	return await httpsCall(body, options)
}

function uploadToBackend(data) {
	const hash = crypto.createHash('sha256');
	hash.update(data);
	var sha256hash = hash.digest('hex');
	console.log(sha256hash)
	doesImageExist(sha256hash).then(image => {
		// console.log(image);
		if(typeof(image.error) !== "undefined") {
			createImage(sha256hash).then(ret => {
				uploadImage(data).then(uploadres => {
					console.log(uploadres)
				}).catch(reason => {
					console.log(reason)
				})
			}).catch(reason => {
				console.log(reason)
			})
			
		} else {
			console.log("Image does already exist")
		}
	})
}

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
						var data = [];

						// A chunk of data has been recieved.
						resp.on('data', (chunk) => {
							data.push(chunk);
						});
						
						// The whole response has been received. Print out the result.
						resp.on('end', () => {
							var binary = buffer.Buffer.concat(data);
							uploadToBackend(binary);
						});
						
						})
					.on("error", (err) => {
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