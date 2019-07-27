const ping = require('node-http-ping')
const TelegramBot = require('node-telegram-bot-api');
process.env.NTBA_FIX_319 = 1;
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

const codChat = '-351121754';
const url = ['sakha.gov.ru', 'e-yakutia.ru', 'dom.e-yakutia.ru', 'max.0code.pro'];
const admins = ['3372772756'];

var ms = [0, 0, 0, 0];
var str = ''; var chat = '';
var service = false;    //БАЗА

console.log("Бот запущен!");
pingCheck("timer");


bot.onText(/\/status/, function (msg) {           
    chat = msg.chat.id;
    pingCheck("status");  
});

bot.onText(/\/service/, function (msg) { 
    chat = msg.chat.id; 
    if (admins.includes(chat)){
        service = !service;
        sendMessage("service");  
    }
    else
    {
        bot.sendMessage(chat, "Вы не имеете необходимого уровня доступа для использования данной команды! Если это ошибка, обратитесь к администратору для добавления вашего id: <code>" + msg.from.id + "</code>", {parse_mode : "HTML"});
    } 
});

/*
*   Формирование и отправка сообщения
*/

function sendMessage(type){    
    switch(type) {
        case 'status':
            str = 'Статус сайтов:\n';
            ms.forEach(function(item, i){
                if (item != '0'){
                    str += `\n<a href=\"https://${url[i]}/\">${url[i]}</a> - <code>${item}ms</code>`;
                }
                else
                {
                    str += `\n<a href=\"https://${url[i]}/\">${url[i]}</a> - <code>Не овечает</code>`;
                }
            });
            break;
        case 'service':
            str = 'Режим техобслуживания: ';
            if (service)
                str += '<code>Включен</code>';
            else
                str += '<code>Выключен</code>';
            break;
        case 'check':
            console.log('timer');
            break;
        case 'cod':
            console.log('cod');
            break;
    }
    bot.sendMessage(chat, str, {parse_mode : "HTML"});
    console.log("Сообщение: " + str + ", успешно отправлено!");
}

/*
*   Проверки
*/

function func(type){
    switch(type) {
        case 'timer':




            sendMessage(type);
            break;
        case 'cod':
            console.log("cod");
            break;
        default:
            sendMessage(type);
    }    
}

/*
*   Проверка доступности сайтов
*/

async function pingCheck(type){
    for (item of url) {
        await ping(item)
        .then(time => {
            console.log(`${item} time: ${time}ms`);       
            ms[url.indexOf(item)] = time;  
        })
        .catch(() => {
            console.log(`Failed to ping ${item}`);
            ms[url.indexOf(item)] = 0;  
        });        
    }
    console.log(type);
    func(type);
}

//setInterval(pingCheck("timer"), 5000);
