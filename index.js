const ping = require('node-http-ping')
const TelegramBot = require('node-telegram-bot-api');
process.env.NTBA_FIX_319 = 1;
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

const codChat = '-351121754';
const url = ['sakha.gov.ru', 'e-yakutia.ru', 'dom.e-yakutia.ru', 'max.0code.pro'];
const admins = ['337277275'];

var ms = [0, 0, 0, 0];
var count = [0, 0, 0, 0];
var err = [false, false, false, false];
var str = '';
var service = false;    //БАЗА

console.log("Бот запущен!");
pingCheck("timer");

bot.onText(/\/status/, function (msg) {           
    pingCheck("status", msg.chat.id);  
});

bot.onText(/\/service/, function (msg) { 
    if (admins.includes(msg.from.id.toString())){
        service = !service;
        console.log(`<a href="tg://user?id=${msg.from.id}">${msg.from.first_name} ${msg.from.last_name}</a>`);
        sendMessage("service",  `<a href="tg://user?id=${msg.from.id}">${msg.from.first_name} ${msg.from.last_name}</a>`);  
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
            bot.sendMessage(arguments[1], str, {parse_mode : "HTML"});
            break;
        case 'service':
            str = 'Режим техобслуживания: ';
            if (service)
                str += '<code>Включен</code>';
            else
                str += '<code>Выключен</code>';
            str += ` пользователем ${test}`;
            bot.sendMessage(arguments[1], str, {parse_mode : "HTML"});
            console.log("service"); 
            break;
        case 'on':
            str = `Восстановлено соединение с:\n\n<a href=\"https://${url[arguments[2]]}/\">${url[arguments[2]]}</a>`;
            bot.sendMessage(codChat, str, {parse_mode : "HTML"}); 
            console.log("on");           
            break;
        case 'off':
            str = `Потеряно соединение с:\n\n<a href=\"https://${url[arguments[2]]}/\">${url[arguments[2]]}</a>`;
            bot.sendMessage(codChat, str, {parse_mode : "HTML"});
            console.log("off");
            break;
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
