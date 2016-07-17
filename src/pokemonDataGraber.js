var cheerio = require('cheerio'),
    request = require('request'),
    PokedexUrlGraber = require('./pokedexUrlGraber'),
    MaxCPHPGraber = require('./maxCPHPGraber');
function getData(urls) {
    var url = urls[pokemons.length];
    if (url == undefined) {
        savePokemons();
    } else {
        console.log("Grabbing " + url + " " + (pokemons.length + 1) + "/" + urls.length);
        pokemonDataGraber.getData('https://fevgames.net' + url, function (pokemon) {
            pokemons.push(pokemon);
            getData(urls, pokemons.length);
        });
    }

}

class PokemonDataGraber {
    constructor() {
        this.pokedexUrlGraber = new PokedexUrlGraber();
        this.pokemons = [];

    }
    getData(logger) {
        return new Promise((resolve, reject) => {
            this.logger = logger;

            this.logger('=============');
            this.logger('Fetching URLS');
            this.logger('=============');
            this.logger('▼');

            this.pokedexUrlGraber.getUrls(console.log)
                .then((urls) => {
                    this.logger('▲');
                    this.urls = urls;

                    this.logger('======================');
                    this.logger('Start parsing Pokemons');
                    this.logger('======================');

                    this.logger('▼');

                    this.loadData()
                        .then(() => {
                            this.logger('▲');
                            this.logger('======================');
                            this.logger('Start getting MaxHP / MaxCP');
                            this.logger('======================');
                            this.logger('▼');

                            this.maxCPHPGraber = new MaxCPHPGraber(this.pokemons);
                            this.maxCPHPGraber.getData(this.pokemons, console.log)
                                .then((pokemons) => {
                                    this.logger('▲');
                                    resolve(pokemons);
                                });
                        });
                });
        });


    }
    loadData() {
        return new Promise((resolve, reject) => {
            var url = this.urls[this.pokemons.length];
            if (url === undefined) {
                resolve();
            } else {
                this.logger("| Grabbing " + url + " " + (this.pokemons.length + 1) + "/" + this.urls.length);
                this.parsePokemon('https://fevgames.net' + url)
                    .then((pokemon) => {

                        this.pokemons.push(pokemon);
                        this.loadData()
                            .then(() => {
                                resolve();
                            });
                    });
            }
        });
    }
    parsePokemon(url) {
        return new Promise((resolve, reject) => {
            request({
                uri: url
            }, (error, response, body) => {
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
                                evolution.Number = parseInt($(this).attr('href').substring(9, 12));
                                evolution.Name = $(this).text().trim();
                                value.push(evolution);
                            });
                            break;
                        case 'Number':
                            var value = parseInt($td.text().trim());
                            break;
                        default:
                            var value = $td.text().trim();
                            break;
                    }
                    currentPokemon[key] = value;
                });
                resolve(currentPokemon);
            });
        });
    }
}

module.exports = PokemonDataGraber;