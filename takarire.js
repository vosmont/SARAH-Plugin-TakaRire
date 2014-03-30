exports.action = function(data, callback, config, SARAH){
	var myConfig = config.modules.takarire;
	var request = require('request');

	var maxJokeId = parseInt(myConfig.max_joke_id);
	var nbRetry = 0;
	var searchJoke = function () {
		var url = 'http://www.takatrouver.net/blagues/index.php?id=' + Math.floor(Math.random() * maxJokeId);
		if (config.debug) {
			console.log("[takarire] Url : " + url);
		}
		request(
			{
				'uri' : url,
				'encoding': 'binary'
			}, function (err, response, body) {
				if (err || response.statusCode != 200) {
					callback({'tts': "Je n'arrive pas à accéder aux informations du site takatrouver.net"});
					return;
				}

				var cheerio = require('cheerio')
				var $ = cheerio.load(body, { xmlMode: false, normalizeWhitespace: false, ignoreWhitespace: true, lowerCaseTags: true });
				var joke = $('#Layer11 table table:nth-child(2)').text();
				if (joke != "") {
					if (config.debug) {
						console.log("[takarire] Joke : \n" + joke);
					}
					callback({ 'tts': joke });
				} else if (nbRetry < 5) {
					nbRetry++;
					if (config.debug) {
						console.log("[takarire] Joke not founded ! Retry #" + nbRetry + ".");
					}
					searchJoke();
				} else {
					console.log("[takarire] Joke not founded ! Max retry reached : cancel search.");
					callback({'tts': "Je n'arrive pas à accéder aux informations du site takatrouver.net"});
				}
			}
		);
	}

	searchJoke();
}