process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');
const token = '775773770:AAFKmqPkw4MgOhSPjzdxFjG_NRxjnLZXbmY';
const bot = new TelegramBot(token, {polling: true});

const request = require('request');
const Curl = require( 'curl-request' );

var service = true;

/*bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Received your message');
});*/

/*bot.on('polling_error', (error) => {
  console.log(error.code);  // => 'EFATAL'
});*/

bot.onText(/\/service/, function (msg) {
  service = !service;
  bot.sendMessage(msg.from.id, 'Service успешно установлен в: ' + service);
  console.log("Service: " + service);
});

var url = [
  'https://www.sakha.gov.ru',
  'https://www.e-yakutia.ru/bs/main.htm'  
];

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
  const curl = new Curl;
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
  console.log("------------------------------------");
}

setInterval(checkGov, 180000);
