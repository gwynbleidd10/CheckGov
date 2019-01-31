const request = require('request');
const TelegramBot = require('node-telegram-bot-api');
const token = '775773770:AAFKmqPkw4MgOhSPjzdxFjG_NRxjnLZXbmY';
const bot = new TelegramBot(token, {polling: true});
const curl = new (require( 'curl-request' ))();

var url = [
  'https://www.sakha.gov.ru',
  'https://www.e-yakutia.ru/bs/main.htm'  
];

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  //bot.sendMessage(chatId, 'Received your message');
});

setInterval(checkGov, 180000);

checkGov();

function sendMessage(addr){;
  console.log('ERROR : ' + addr);
  bot.sendMessage('337277275', 'Проблемы с ' + addr);
}
  
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
  curl.setHeaders([
    'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
  ])
  .get('http://dom.e-yakutia.ru')
  .then(({statusCode, body, headers}) => {
    if (statusCode == 200) {
      console.log("OK : " + 'http://dom.e-yakutia.ru');
    } else {
      sendMessage('http://dom.e-yakutia.ru');
    }
  })
  .catch((e) => {
    console.log(e);
    sendMessage('http://dom.e-yakutia.ru');
  });
}
