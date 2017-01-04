var AttackDataGraber = require('./attackDataGraber');
class FevgamesTableParser {
    constructor() {
        this.attackDataGraber = new AttackDataGraber();
        this.nameSuffixes = {
            "029": " ♀",
            "032": " ♂"
        };
    }
    getData($, $table) {
        this.$ = $;
        return new Promise((resolve, reject) => {
            this.currentPokemon = {};
            this.$strongs = $table.find('strong');
            this.index = 0;
            this.parse(() => {
                resolve(this.currentPokemon);
            });
        });

    }
    parse(callback) {
        let element = this.$strongs[this.index];
        if (element !== undefined) {
            this.index++;

            var key = this.$(element).text();

            var $td = this.$(element).parent().siblings('td');
            var value;
            console.log(key);
            switch (key) {
                case 'Type(s)':
                    value = [];
                    $td.find('.icon-type').each((index, element) => {
                        value.push(this.$(element).text().trim());
                    });
                    key = "Types";
                    this.currentPokemon[key] = value;
                    this.parse(callback);
                    break;
                case 'Fast Attack(s)':
                case 'Special Attack(s)':
                    value = [];
                    var urls = [];
                    if ($td.parent('tr').hasClass('show')) {
                        $td.find('a').each((index, element) => {
                            urls.push('https://fevgames.net' + this.$(element).attr('href'));
                        });
                        this.attackDataGraber
                            .getData(urls).then((attacks) => {
                                this.currentPokemon[key] = attacks;
                                this.parse(callback);
                            });
                    } else {
                        this.parse(callback);
                    }
                    break;
                case 'Next Evolution Requirements':
                    value = {};
                    var requirements = $td.text()
                        .split('x');
                    value.Amount = parseInt(requirements[0]);
                    value.Name = requirements[1].trim();
                    this.currentPokemon[key] = value;
                    this.parse(callback);
                    break;
                case 'Previous evolution(s)':
                case 'Next evolution(s)':
                    value = [];
                    $td.find('a').each((index, element) => {
                        var evolution = {};
                        evolution.Number = parseInt(this.$(element).attr('href').substring(9, 12));
                        evolution.Name = this.$(element).text().trim();
                        value.push(evolution);
                    });
                    this.currentPokemon[key] = value;
                    this.parse(callback);
                    break;
                case 'Name':
                    value = $td.text().split(')')[1].trim();
                    this.currentPokemon.Number = $td.text().substring(2, 5);

                    if (this.nameSuffixes.hasOwnProperty(this.currentPokemon.Number)) {
                        value += this.nameSuffixes[this.currentPokemon.Number];
                    }

                    this.currentPokemon[key] = value;
                    this.parse(callback);
                    break;
                case 'Avg Weight':
                case 'Avg Height':
                    value = {};
                    var txt = $td.text().trim().split('-');
                    var min = txt[0].trim();
                    var max = txt[1].trim();
                    value.Minimum = min;
                    value.Maximum = max;
                    if (key === 'Avg Weight') {
                        key = 'Weight';
                    } else if (key === 'Avg Height') {
                        key = 'Height';
                    }
                    this.currentPokemon[key] = value;
                    this.parse(callback);
                    break;
                case 'Flee Rate':
                    key = 'FleeRate';
                    value = parseInt($td.text().trim().split('%')[0]) / 100;
                    this.currentPokemon[key] = value;
                    this.parse(callback);
                    break;
                case 'Images':
                    this.parse(callback);
                    break;
                case 'Weak To (1.25x)':
                    key = 'Weaknesses';
                    value = [];
                    $td.find('.icon-type').each((index, element) => {
                        value.push(this.$(element).text().trim());
                    });
                    this.currentPokemon[key] = value;
                    this.parse(callback);
                    break;
                case 'Resistant To (0.8x)':
                    key = 'Resistant';
                    value = [];
                    $td.find('.icon-type').each((index, element) => {
                        value.push(this.$(element).text().trim());
                    });
                    this.currentPokemon[key] = value;
                    this.parse(callback);
                    break;
                case 'About':
                    $td.find('button, script').remove();
                    this.currentPokemon[key] = $td.text().trim();
                    this.parse(callback);
                    break;
                default:
                    value = $td.text().trim();
                    this.currentPokemon[key] = value;
                    this.parse(callback);
                    break;
            }

        } else {
            callback();
        }

    }
}
module.exports = FevgamesTableParser;
