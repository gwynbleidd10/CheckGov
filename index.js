process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

const request = require('request');
const Curl = require( 'curl-request' );

var service = false;
var time = [0, 0, 0];
var err = [0, 0, 0];

bot.sendMessage('337277275', 'Бот запущен!');
console.log('Запуск');
/*bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Received your message');
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

function getTime() {
  return new Date().toLocaleDateString('ru', {timeZone: 'Asia/Yakutsk', hour: 'numeric', minute: 'numeric'});
}

function sendMessage(status, site, id){
  if (status == false) {
    bot.sendMessage('337277275', time[id] + ' | Потеряно соединение с ' + site);
  } else {
    bot.sendMessage('337277275', getTime() + ' | Восстановлено соединение с ' + site);
  }
  console.log("Отправлено сообщение");
}
  
function checkGov(){
  if (service == false) {
    url.forEach(function(item, i, url) {
      request(item, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          if (err[i] != 0){
            err[i] = 0;
            sendMessage(true, item, i)
          }
          console.log("OK : " + item);
        } else {
          if (err[i] == 0) {
            time[i] = getTime();
            err[i] = 1;
            sendMessage(false, item, i);
          }
          console.log('ERROR : ' + item);
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
        if (err[2] != 0){
          err[2] = 0;
          sendMessage(true, 'http://dom.e-yakutia.ru', 2)
        }
        console.log("OK : " + 'http://dom.e-yakutia.ru');
      } else {
        if (err[2] == 0) {
          time[2] = getTime();
          err[2] = 1;
          sendMessage(false, 'http://dom.e-yakutia.ru', 2);
        }
      }
    })
    .catch((e) => {
      console.log(e);
      if (err[2] == 0) {
        time[2] = getTime();
        err[2] = 1;
        sendMessage(false, 'http://dom.e-yakutia.ru', 2);
      }
    });
    console.log("------------------------------------");  
  }
};

setInterval(checkGov, 120000);
