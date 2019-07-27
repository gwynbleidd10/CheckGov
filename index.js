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
var str = '', chat = '';
var service = false;    //БАЗА

console.log("Бот запущен!");
pingCheck("timer");

bot.onText(/\/status/, function (msg) {           
    chat = msg.chat.id;
    pingCheck("status");  
});

bot.onText(/\/service/, function (msg) { 
    chat = msg.chat.id; 
    if (admins.includes(msg.from.id.toString())){
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

function sendMessage(){    
    if (chat == ''){
        chat = codChat;
    }
    
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
            break;
        case 'service':
            str = 'Режим техобслуживания: ';
            if (service)
                str += '<code>Включен</code>';
            else
                str += '<code>Выключен</code>';
            break;
        case 'on':
            str = `Восстановлено соединение с:\n\n<a href=\"https://${url[arguments[1]]}/\">${url[arguments[1]]}</a>`; 
            console.log("on");           
            break;
        case 'off':
            str = `Потеряно соединение с:\n\n<a href=\"https://${url[arguments[1]]}/\">${url[arguments[1]]}</a>`;
            console.log("off");
            break;
        default:
            console.log('default');
            
            break;
    }
    bot.sendMessage(chat, str, {parse_mode : "HTML"});
    chat = '';
    console.log("Сообщение: " + str + ", успешно отправлено!");
}

/*
*   Проверки
*/

function func(type){
    switch(type) {
        case 'status':
            sendMessage('status')
            break;
        case 'timer':
            if (!service){
                ms.forEach(function(item, i){
                   if (ms[i] == 0){
                       //Пинг = 0
                       if (!err[i]){
                            if (count[i] > 9){
                                err[i] = !err[i]; 
                                sendMessage("off", i);
                            }
                            else
                            {
                                count[i]++; 
                            }                           
                       }
                   }
                   else
                   {
                        //Пинг > 0
                        count[i] = 0;
                        if (err[i]){
                            //Есть ошибка
                            err[i] = !err[i];
                            //Меняем статус
                            sendMessage("on", i);
                        }
                   }
                   console.log(err);
                   console.log(count);
                });
            }           
            break;        
    }    
}

/*
*   Проверка доступности сайтов
*/

async function pingCheck(){
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
    func(arguments[0]);
}

/*
*   Получение даты
*/
console.log(getTime());
function getTime() {
    return new Date().toLocaleDateString('ru', {timeZone: 'Asia/Yakutsk', hour: 'numeric', minute: 'numeric'});
}

setInterval(pingCheck, 30000, "timer");
