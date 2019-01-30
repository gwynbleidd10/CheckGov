const request = require('request');
const TelegramBot = require('node-telegram-bot-api');
const token = '775773770:AAFKmqPkw4MgOhSPjzdxFjG_NRxjnLZXbmY';
const bot = new TelegramBot(token, {polling: true});

var url = [
  'https://www.sakha.gov.ru',
  'https://www.e-yakutia.ru/bs/main.htm',
  'http://dom.e-yakutia.ru'
];

//setInterval(checkGov, 180000);

function sendMessage(addr){;
  console.log('ERROR : ' + addr);
  bot.sendMessage('337277275', 'Проблемы с ' + addr);
}

checkGov();
  
function checkGov(){  
  url.forEach(function(item, i, url) {
    request(item, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log("OK : " + item);
      } else {
        sendMessage(item);
      }
    });
  });
}
