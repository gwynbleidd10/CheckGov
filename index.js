process.env.NTBA_FIX_319 = 1;
const ping = require('node-http-ping')
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

var url = ['sakha.gov.ru', 'e-yakutia.ru', 'dom.e-yakutia.ru', 'max.0code.pro'];
var ms = [0, 0, 0, 0];

console.log("Бот запущен!");

bot.onText(/\/status/, function (msg) {
    status();    
    console.log(ms);
    var str = 'Статус сайтов:';  
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
    bot.sendMessage(msg.chat.id, str, {parse_mode : "HTML"});
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
