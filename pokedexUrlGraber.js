var cheerio = require('cheerio'),
    request = require('request');

var pokedexUrlGraber = {
    getUrls: function (callback) {
        request({
            uri: 'https://fevgames.net/pokedex'
        }, function (error, response, body) {
            var urls = [];
            var $ = cheerio.load(body);

            $(".pokedex-item").each(function(){
                urls.push($(this).attr('href'));
            });
            callback(urls);
        });

    }
};

module.exports = pokedexUrlGraber;