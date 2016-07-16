var cheerio = require('cheerio'),
    request = require('request');

var pokemonDataGraber = {
    getData: function (url, callback) {
        request({
            uri: 'https://fevgames.net' + url
        }, function (error, response, body) {
            var currentPokemon = {};
            var $ = cheerio.load(body);
            var $table = $('#omc-full-article table');
            var types = [];

            $table.find('strong').each(function () {
                var key = $(this).text();
                var $td = $(this).parent().siblings('td');
                switch (key) {
                    case 'Type I':
                    case 'Type II':
                      $td.find('.icon-type').each(function () {
                        types.push($(this).text().trim());
                      })
                      key = "Types";
                      value = types;
                      break;
                    case 'Weaknesses':
                        var value = [];
                        $td.find('.icon-type').each(function () {
                            value.push($(this).text().trim());
                        })
                        break;
                    case 'Fast Attack(s)':
                    case 'Special Attack(s)':
                        var value = [];
                        $td.find('a').each(function () {
                            var attack = $(this).text()
                                .split('\n')[0].trim();
                            value.push(attack);
                        });
                        break;
                    case 'Next Evolution Requirements':
                        var value = {};
                        var requirements = $td.text()
                            .split('x');
                        value.Amount = parseInt(requirements[0]);
                        value.Name = requirements[1].trim();
                        break;
                    case 'Previous evolution(s)':
                    case 'Next evolution(s)':
                        var value = [];
                        $td.find('a').each(function () {
                            var evolution = {};
                            evolution.Number = $(this).attr('href').substring(9, 12);
                            evolution.Name = $(this).text();
                            value.push(evolution);
                        });
                        break;
                    default:
                        var value = $td.text().trim();
                        break;
                }
                currentPokemon[key] = value;
            });
            callback(currentPokemon);
        });
    }
};

module.exports = pokemonDataGraber;
