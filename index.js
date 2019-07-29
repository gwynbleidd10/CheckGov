/*
*   Зависимости
*/

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const ping = require('node-http-ping')
const Busboy = require('busboy');
const parser = require('fast-xml-parser');
const { Pool } = require('pg');

/*
*   Константы
*/

const codChat = '-1001487748065';
const url = ['sakha.gov.ru', 'e-yakutia.ru', 'dom.e-yakutia.ru'];
const ip = ['91.201.237.5', '91.201.237.26', '91.201.237.17']
const admins = ['337277275'];
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

/*
*   Переменные
*/

var ms = [0, 0, 0], count = [0, 0, 0], err = [false, false, false];
var str = '';
var service = false;    //БАЗА
var options = {
    attributeNamePrefix : "@_",
    attrNodeName: "attr", //default is 'false'
    textNodeName : "text",
    ignoreAttributes : true,
    ignoreNameSpace : false,
    allowBooleanAttributes : false,
    parseNodeValue : true,
    parseAttributeValue : false,
    trimValues: true,
    cdataTagName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
    localeRange: "", //To support non english character in tag/attribute values.
    parseTrueNumberOnly: false
};
var body = "";

/*
*   Запуск
*/

console.log("Бот запущен!");
pingCheck("timer");

//  Таймеры
setInterval(pingCheck, 30000, "timer");

/*
*   Сервер
*/

const server = express();
const port = process.env.PORT || 8080;

server.set('view engine', 'html');
server.use(express.json());
server.use(express.urlencoded({extended: true}));

server.get('/', function (req, res) {
    res.send('Hello World!');
});

server.get('/db', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM errors');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

function database(query){
    db.connect();
    db.query(query, (err, res) => {
        if (err) throw err;
        /*for (let row of res.rows) {
          console.log(JSON.stringify(row));
        }*/
        db.end();
    });
}

server.post('/', function (req, res) {
    var busboy = new Busboy({ headers: req.headers });
    body = '';
    var jsonObj;
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
      file.on('data', function(data) {
        //console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
        body += data;
      });
      file.on('end', function() {
        console.log('File [' + fieldname + '] got ' + body.length + ' bytes');
        jsonObj = parser.parse(body, options);
        var query = "INSERT INTO errors(error) VALUES('" + body + "')";
        //database(query);   
        
        //  Debug
        console.log(body);    
        //console.log(jsonObj);
      });
    });
    busboy.on('finish', function() {    
      console.log('Done parsing!');
      //Название устройства
      console.log(jsonObj["variable-set"]["variable"][7]['metadata'][0]["nls-string-val"]);
      //Расположение
      console.log(jsonObj["variable-set"]["variable"][7]['metadata']);//[2]["struct-val"]["struct-element"][2]["string-val"])
      //console.log(jsonObj["variable-set"]["variable"][7]['metadata'][1]["nls-string-list-val"]["nls-string-val"][jsonObj["variable-set"]["variable"][7]['u32-val'] - 1] + " - " + jsonObj["variable-set"]["variable"][0]['nls-string-val'] + "\n");
      //console.log(jsonObj["variable-set"]["variable"][7]['metadata'][2]["struct-val"]["struct-element"][2]["string-val"] + "\n");
      //console.log(jsonObj["variable-set"]["variable"][6]['struct-val']["struct-element"][4]["nls-string-val"] + "\n");
      res.send(jsonObj);
    });
    req.pipe(busboy);
    //console.log(`\n${req.headers['content-type']}\n`);
    //console.log(data['variable-set']['variable'][1]['metadata']);
});

function test(){
    reg = /(\w|\W){4096}/g;
    var arr = body.match(reg);
    console.log(arr);
    for (var i = 0; i < arr.length; i++){   
        bot.sendMessage(codChat, arr[i]);
    }           
}

server.listen(port, function () {
    console.log(`Сервер запущен на ${port} порту`);
});

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
*   Функции
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

/*
*   Получение даты
*/
//console.log(getTime());
function getTime() {
    return new Date().toLocaleDateString('ru', {timeZone: 'Asia/Yakutsk', hour: 'numeric', minute: 'numeric'});
}
