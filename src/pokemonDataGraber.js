var cheerio = require('cheerio'),
    request = require('request'),
    PokedexUrlGraber = require('./pokedexUrlGraber'),
    MaxCPHPGraber = require('./maxCPHPGraber'),
    FevgamesTableParser = require('./fevgamesTableParser');
function getData(urls) {
    var url = urls[pokemons.length];
    if (url === undefined) {
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
        this.fevgamesTableParser = new FevgamesTableParser();
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
                var $ = cheerio.load(body);
                var $table = $('#omc-full-article table');
                this.fevgamesTableParser.getData($, $table)
                    .then((pokemon) => {
                        resolve(pokemon);
                    });
            });
        });
    }
}

module.exports = PokemonDataGraber;