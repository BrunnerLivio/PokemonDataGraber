var pokedexUrlGraber = require('./pokedexUrlGraber'),
    pokemonDataGraber = require('./pokemonDataGraber'),
    fs = require('fs');

// All the pokemons getting stored here
var pokemons = [];

pokedexUrlGraber.getUrls(function (urls) {
    getData(urls);
});


function getData(urls) {
    var url = urls[pokemons.length];
    if (url == undefined) {
        savePokemons();
    } else {
        console.log("Grabbing " + url + " " + (pokemons.length + 1) + "/" + urls.length);
        pokemonDataGraber.getData(url, function (pokemon) {
            pokemons.push(pokemon);
            getData(urls, pokemons.length);
        });
    }

}
function savePokemons() {
    fs.writeFile('output.json', JSON.stringify(pokemons), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("Pokemons saved!");
    });
}