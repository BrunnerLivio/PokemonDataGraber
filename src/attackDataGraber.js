var cheerio = require('cheerio'),
    request = require('request');

class AttackDataGraber {
    getData(url, callback) {
        request({
            uri: url
        }, function (error, response, body) {
            var currentAttack = {};
            var $ = cheerio.load(body);
            var $table = $('#omc-full-article table');

            $table.find('strong').each(function () {
                var key = $(this).text();
                var $td = $(this).parent().siblings('td');

                switch (key) {
                    case 'Type':
                        var value = $td.find('.icon-type').text()
                        break;
                    case 'Name':
                        var value = $td.text().trim();
                        break;
                    case 'Damage':
                        var value = parseInt($td.text().trim());
                        break;
                }

                currentAttack[key] = value;
            });
            callback(currentAttack);
        });
    }
}


module.exports = AttackDataGraber;