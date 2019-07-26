process.env.NTBA_FIX_319 = 1;
const ping = require('node-http-ping')
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

var url = ['sakha.gov.ru', 'e-yakutia.ru', 'dom.e-yakutia.ru', 'max.0code.pro'];
var ms = [0, 0, 0];

bot.onText(/\/status/, function (msg) {
    status();
    setTimeout(function(){
        var result = 'Статус сайтов:';
        ms.forEach(function(item, i){
            if (item != '0'){
                result += `\n<a href=\"https://${url[i]}/\">${url[i]}</a> - <code>${item}ms</code>`;
            }
            else
            {
                result += `\n<a href=\"https://${url[i]}/\">${url[i]}</a> - <code>Не овечает</code>`;
            }
        });    
    }, 1000);
    bot.sendMessage(msg.chat.id, result, {parse_mode : "HTML"});
});



status();

function status(){  
    url.forEach(function(item, i){
        ping(item, 80)
        .then(time => {
            console.log(`${item} time: ${time}ms`);
            ms[i] = time;            
        })
        .catch(() => {
            console.log(`Failed to ping ${item}`);
            ms[i] = 0;
        });
    });    
}

//setInterval(pingCheck, 5000);




