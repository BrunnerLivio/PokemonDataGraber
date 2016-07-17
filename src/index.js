var PokemonDataGraber = require('./pokemonDataGraber'),
    fs = require('fs');



var pokemonDataGraber = new PokemonDataGraber();

pokemonDataGraber.getData(console.log)
    .then((pokemons) => {
        savePokemons(pokemons);
    });


// All the pokemons getting stored here
function savePokemons(pokemons) {
    fs.writeFile('output.json', JSON.stringify(pokemons), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("===============")
        console.log("Pokemons saved!");
        console.log("===============")
    });
}