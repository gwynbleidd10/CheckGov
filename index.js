process.env.NTBA_FIX_319 = 1;
const ping = require('node-http-ping')
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});
const chat = '337277275';

var url = ['sakha.gov.ru', 'e-yakutia.ru', 'dom.e-yakutia.ru', 'max.0code.pro'];
var ms = [0, 0, 0, 0];
var str = 'Статус сайтов:';  

console.log("Бот запущен!");

bot.onText(/\/status/, function (msg) {
    str = 'Статус сайтов:'; 
    status();    
    console.log(msg.chat.id);
    console.log(ms);
});

function strConfirm(){    
    ms.forEach(function(item, i){
        if (item != '0'){
            str += `\n<a href=\"https://${url[i]}/\">${url[i]}</a> - <code>${item}ms</code>`;
        }
        else
        {
            str += `\n<a href=\"https://${url[i]}/\">${url[i]}</a> - <code>Не овечает</code>`;
        }
    });
    bot.sendMessage(chat, str, {parse_mode : "HTML"});
    console.log(str);
}

async function status(){
    for (item of url) {
        await ping("https://" + item)
        .then(time => {
            console.log(`${item} time: ${time}ms`);       
            ms[url.indexOf(item)] = time;  
        })
        .catch(() => {
            console.log(`Failed to ping ${item}`);
            ms[url.indexOf(item)] = 0;  
        });        
    }
    strConfirm();
}

//setInterval(pingCheck, 5000);
