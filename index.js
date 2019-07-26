process.env.NTBA_FIX_319 = 1;
const ping = require('node-http-ping')
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

var url = ['sakha.gov.ru', 'e-yakutia.ru', 'dom.e-yakutia.ru']

bot.onText(/\/status/, function (msg) {
    bot.sendMessage(msg.chat.id, 'Статус сайтов:' + pingCheck());
});

function pingCheck(){
    result = '';
    url.forEach(function(item){
        ping(item, 80)
        .then(time => {
            console.log(`${item} time: ${time}ms`);
            result += `\n${item} time: ${time}ms`;
        })
        .catch(() => {
            console.log(`Failed to ping ${item}`);
            result += `\nFailed to ping ${item}`;
        })
    });
    return result;
}
