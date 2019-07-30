const TelegramBot = require('node-telegram-bot-api');
const ping = require('node-http-ping')

/*
*   Константы
*/

const url = ['sakha.gov.ru', 'e-yakutia.ru', 'dom.e-yakutia.ru'];
const ip = ['91.201.237.5', '91.201.237.26', '91.201.237.17']
const admins = ['337277275'];

/*
*   Переменные
*/

var ms = [0, 0, 0], count = [0, 0, 0], err = [false, false, false];
var service = false;    //БАЗА

/*
*   Запуск
*/

console.log("Бот запущен!");
pingCheck("timer");

//  Таймеры
setInterval(pingCheck, 30000, "timer");

/*
*   Telegram
*/

process.env.NTBA_FIX_319 = 1;
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/status/, function (msg) {           
    pingCheck("status", msg.chat.id);  
});

bot.onText(/\/service/, function (msg) {
    if (admins.includes(msg.from.id.toString())){
        service = !service;
        sendMessage("service",  msg.from.id, msg.from.first_name, msg.from.last_name);  
    }
    else
    {
        bot.sendMessage(msg.chat.id, "Вы не имеете необходимого уровня доступа для использования данной команды! Если это ошибка, обратитесь к администратору для добавления вашего id: <i>" + msg.from.id + "</i>", {disable_web_page_preview : true, parse_mode : "HTML"});
    } 
});

/*
*   Функции
*/

//  pingCheck(type, NULL/chatId) -> func(type, chatId) -> sendMessage(type, chatId, urlId/name, surname)
function sendMessage(){
    var str = '';
    switch(arguments[0]) {
        case 'status':
            str = '<b>Техобслуживание: </b>';
            if (service)
                str += '<i>Включено</i>';
            else
                str += '<i>Выключено</i>';
            str += '\n\n<b>Статус сайтов: </b>\n';
            ms.forEach(function(item, i){
                if (item != '0'){
                    str += `\n<a href=\"https://${url[i]}/\">${url[i]}</a> - <i>${item}ms</i>`;
                }
                else
                {
                    str += `\n<a href=\"https://${url[i]}/\">${url[i]}</a> - <i>Не овечает</i>`;
                }
            });
            bot.sendMessage(arguments[1], str, {disable_web_page_preview : true, parse_mode : "HTML"});
            break;
        case 'service':
            str = '<b>Техобслуживание</b>: ';
            if (service)
                str += '<i>Включено</i>';
            else
                str += '<i>Выключено</i>';
            str += ` пользователем <a href="tg://user?id=${arguments[1]}">${arguments[2]} ${arguments[3]}</a>`;
            bot.sendMessage(process.env.CHAT, str, {parse_mode : "HTML"});
            console.log("service"); 
            break;
        case 'on':
            str = `Восстановлено соединение с:\n\n<a href=\"https://${url[arguments[2]]}/\">${url[arguments[2]]}</a>`;
            bot.sendMessage(process.env.CHAT, str, {parse_mode : "HTML"}); 
            console.log("on");           
            break;
        case 'off':
            str = `Потеряно соединение с:\n\n<a href=\"https://${url[arguments[2]]}/\">${url[arguments[2]]}</a>`;
            bot.sendMessage(process.env.CHAT, str, {parse_mode : "HTML"});
            console.log("off");
            break;
    }
    console.log("Сообщение отправлено:\n" + str);
}

function func(){
    switch(arguments[0]) {
        case 'status':
            sendMessage('status', arguments[1])
            break;
        case 'timer':
            if (!service){
                ms.forEach(function(item, i){
                   if (ms[i] == 0){
                       if (!err[i]){
                            if (count[i] > 9){
                                err[i] = !err[i]; 
                                sendMessage("off", arguments[1], i);
                            }
                            else
                            {
                                count[i]++; 
                            }                           
                       }
                   }
                   else
                   {
                        count[i] = 0;
                        if (err[i]){
                            err[i] = !err[i];
                            sendMessage("on", arguments[1], i);
                        }
                   }
                });
            }           
            break;        
    }    
}

async function pingCheck(){
    console.log('timer');
    if (!service || arguments[0] == 'status'){
        for (item of ip) {
            await ping(item)
            .then(time => {
                console.log(`${url[ip.indexOf(item)]} time: ${time}ms`);       
                ms[ip.indexOf(item)] = time;  
            })
            .catch(() => {
                console.log(`Failed to ping ${url[ip.indexOf(item)]}`);
                ms[ip.indexOf(item)] = 0;  
            });        
        }
        func(arguments[0], arguments[1]);
    }    
}
