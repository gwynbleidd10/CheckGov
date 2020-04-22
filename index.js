const ping = require('node-http-ping')
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
process.env.NTBA_FIX_319 = 1;
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});
const server = express();

const port = process.env.PORT || 8080; 
const codChat = '-1001487748065';
const url = ['https://sakha.gov.ru', 'http://e-yakutia.ru', 'https://dom.e-yakutia.ru'];
const admins = ['337277275'];

var ms = [0, 0, 0], count = [0, 0, 0], err = [false, false, false];
var str = '';
var service = false;    //БАЗА

console.log("Бот запущен!");

server.get('/', function (req, res) {
    res.send('Hello World!');
});

server.post('/', function (req, res) {
    console.log(req);
});
  
server.listen(port, function () {
    console.log(`Сервер запущен на ${port} порту`);
});

pingCheck("timer");

bot.onText(/\/status/, function (msg) {           
    pingCheck("status", msg.chat.id);  
});

bot.onText(/\/service/, function (msg) {
    console.log(msg.chat.id);
    if (admins.includes(msg.from.id.toString())){
        service = !service;
        sendMessage("service",  msg.from.id, msg.from.first_name, msg.from.last_name);  
    }
    else
    {
        bot.sendMessage(msg.chat.id, "Вы не имеете необходимого уровня доступа для использования данной команды! Если это ошибка, обратитесь к администратору для добавления вашего id: <code>" + msg.from.id + "</code>", {parse_mode : "HTML"});
    } 
});

/*
*   Формирование и отправка сообщения
*/

function sendMessage(){    
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
            bot.sendMessage(codChat, str, {parse_mode : "HTML"});
            console.log("service"); 
            break;
//         case 'on':
//             str = `Восстановлено соединение с:\n\n<a href=\"https://${url[arguments[2]]}/\">${url[arguments[2]]}</a>`;
//             bot.sendMessage(codChat, str, {parse_mode : "HTML"}); 
//             console.log("on");           
//             break;
//         case 'off':
//             str = `Потеряно соединение с:\n\n<a href=\"https://${url[arguments[2]]}/\">${url[arguments[2]]}</a>`;
//             bot.sendMessage(codChat, str, {parse_mode : "HTML"});
//             console.log("off");
//             break;
        default:
            console.log('default');
            
            break;
    }
    console.log("Сообщение отправлено:\n" + str);
}

/*
*   Проверки
*/

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

/*
*   Проверка доступности сайтов
*/

async function pingCheck(){
    console.log('timer');
    if (!service || arguments[0] == 'status'){
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
        func(arguments[0], arguments[1]);
    }    
}

/*
*   Получение даты
*/
//console.log(getTime());
function getTime() {
    return new Date().toLocaleDateString('ru', {timeZone: 'Asia/Yakutsk', hour: 'numeric', minute: 'numeric'});
}

setInterval(pingCheck, 30000, "timer");
