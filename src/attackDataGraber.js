var cheerio = require('cheerio'),
    request = require('request');

class AttackDataGraber {
    getData(urls) {
        this.urls = urls;
        return new Promise((resolve, reject) => {
            this.attacks = [];
            this.index = 0;
            this.parse(() => {
                resolve(this.attacks);
            });
        });
    }
    parse(callback) {

        var url = this.urls[this.index];

        if (url !== undefined) {
            this.index++;
            request({
                uri: url
            }, (error, response, body) => {
                var currentAttack = {};
                var $ = cheerio.load(body);
                var $table = $('#omc-full-article table');
                $table.find('strong').each((index, element) => {
                    var key = $(element).text();
                    var $td = $(element).parent().siblings('td');
                    var value;
                    switch (key) {
                        case 'Type':
                            value = $td.find('.icon-type').text();
                            break;
                        case 'Name':
                            value = $td.text().trim();
                            console.log('|--> Grabbing Attack: ' + value);
                            break;
                        case 'Damage':
                            value = parseInt($td.text().trim());
                            break;
                    }

                    currentAttack[key] = value;
                });
                this.attacks.push(currentAttack);
                this.parse(callback);
            });
        } else {
            callback();
        }

    }
}


module.exports = AttackDataGraber;