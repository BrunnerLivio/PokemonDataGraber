var cheerio = require('cheerio'),
    request = require('request');

class MaxCPHPGrabber {
    getData(pokemons, logger) {
        this.logger = logger;
        return new Promise((resolve, reject) => {
            request({
                uri: 'https://www.reddit.com/r/pokemongodev/comments/4t7zt4/max_cphp_per_pokemon_in_a_sortable_chart/'
            }, (error, response, body) => {
                var $ = cheerio.load(body);

                let $table = $('.usertext-body.may-blank-within.md-container').find('table tbody');

                $table.find('tr').each((index, element) => {
                    let $tds = $(element).find('td');
                    let id = parseInt($($tds[0]).text());
                    let pokemon = pokemons.filter((pokemon) => {
                        return pokemon.Number == id;
                    });
                    pokemon = pokemon[0];
                    if (pokemon) {
                        let pokemonIndex = pokemons.indexOf(pokemon);
                        pokemon.MaxCP = parseInt($($tds[2]).text());
                        pokemon.MaxHP = parseInt($($tds[3]).text());
                        this.logger("| " + pokemon.Name + " MaxCP:" + pokemon.MaxCP + " MaxHP: " + pokemon.MaxHP);
                        pokemons[pokemonIndex] = pokemon;
                    }

                });
                resolve(pokemons);
            });
        });
    }
}

module.exports = MaxCPHPGrabber; 