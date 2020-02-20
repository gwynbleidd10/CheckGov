const TelegramBot = require('node-telegram-bot-api');
const ping = require('node-http-ping')
const express = require('express');
const parser = require('fast-xml-parser');
const Busboy = require('busboy');
const { Pool } = require('pg');
const http = require('http')

/*
*   Константы
*/

const url = ['sakha.gov.ru', 'e-yakutia.ru', 'dom.e-yakutia.ru'];
const ip = ['91.201.237.5', '91.201.237.26', '91.201.237.17']
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});

/*
*   Переменные
*/

var ms = [0, 0, 0], count = [0, 0, 0], err = [false, false, false];
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

server.use(express.json());
server.use(express.urlencoded({extended: true}));

server.get('/', function (req, res) {
    api(req.query.chat, req.query.text)
});

function api(chat, text){
    var options = {
    port: 80,
    hostname: 'https://api.telegram.org',
    method: 'GET',
    path: '/bot961112179:AAHjVaEbvUP7RHi_Pw4hIPtICfbaTzycT7c/sendMessage?chat_id=' + chat + '&text=' + text
  };

  var req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  });
                         
  req.end();
  console.log(chat + ' ' + text);
 
}

server.get('/db', async (req, res) => {
    res.json(await database("query", "SELECT * FROM errors"));
})

server.post('/', function (req, res) {
    var busboy = new Busboy({ headers: req.headers });
    var jsonObj;

    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {     
        var body = '';   

        console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
        file.on('data', function(data) {
        //console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
        body += data;
        });
        file.on('end', function() {
        console.log('File [' + fieldname + '] got ' + body.length + ' bytes');
        jsonObj = parser.parse(body, options);

        database("insert", "INSERT INTO errors(error) VALUES('" + body + "')");        
        //bot.sendMessage(process.env.CHAT, `Было зафиксировано новое сообщение об ошибке. Все сообщения об ошибках расположены по адресу <a href="https://checkgov.herokuapp.com/db">checkgov.herokuapp.com/db</a>`, {parse_mode : "HTML"});
        
        console.log(`Ошибка \n${jsonObj["variable-set"]["variable"][6]['metadata'][1]["nls-string-val"]}\nТип\n${fieldname}\nfilename:\n${filename}\nmimetype: ${mimetype}`);
        bot.sendMessage(process.env.CHAT, `<b>Ошибка</b>\n${jsonObj["variable-set"]["variable"][6]['metadata'][1]["nls-string-val"]}\n<b>Тип</b>\n${fieldname}\n<b>filename</b>\n${filename}\n<b>mimetype</b>\n${mimetype}`, {parse_mode : "HTML"}); 
            
        //  Debug
        //console.log(body);    
        console.log(jsonObj);
        });
    });
    busboy.on('finish', function() {    
      console.log('Done parsing!');
      //Название устройства
      console.log(jsonObj["variable-set"]["variable"]);//[7]['metadata'][0]["nls-string-val"]);
      //Расположение
      //console.log(jsonObj["variable-set"]["variable"][7]['metadata']);//[2]["struct-val"]["struct-element"][2]["string-val"])
      //console.log(jsonObj["variable-set"]["variable"][7]['metadata'][1]["nls-string-list-val"]["nls-string-val"][jsonObj["variable-set"]["variable"][7]['u32-val'] - 1] + " - " + jsonObj["variable-set"]["variable"][0]['nls-string-val'] + "\n");
      //console.log(jsonObj["variable-set"]["variable"][7]['metadata'][2]["struct-val"]["struct-element"][2]["string-val"] + "\n");
      //console.log(jsonObj["variable-set"]["variable"][6]['struct-val']["struct-element"][4]["nls-string-val"] + "\n");
      res.send(jsonObj);
    });
    req.pipe(busboy);
    //console.log(`\n${req.headers['content-type']}\n`);
    //console.log(data['variable-set']['variable'][1]['metadata']);
});
  
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

/*
*   Функции
*/

//  pingCheck(type, NULL/chatId) -> func(type, chatId) -> sendMessage(type, chatId, urlId/name, surname)
function sendMessage(){
    var str = '';
    switch(arguments[0]) {
        case 'status':
            str = '<b>Статус сайтов: </b>\n';
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
        case 'on':
            str = `Восстановлено соединение с:\n\n<a href=\"https://${url[arguments[2]]}/\">${url[arguments[2]]}</a>`;
            bot.sendMessage(process.env.CHAT, str, {disable_web_page_preview : true, parse_mode : "HTML"}); 
            console.log("on");           
            break;
        case 'off':
            str = `Потеряно соединение с:\n\n<a href=\"https://${url[arguments[2]]}/\">${url[arguments[2]]}</a>`;
            bot.sendMessage(process.env.CHAT, str, {disable_web_page_preview : true, parse_mode : "HTML"});
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
            break;        
    }    
}

async function pingCheck(){
    //console.log('timer');
    for (item of ip) {
        await ping(item)
        .then(time => {
            //console.log(`${url[ip.indexOf(item)]} time: ${time}ms`);       
            ms[ip.indexOf(item)] = time;  
        })
        .catch(() => {
            console.log(`Failed to ping ${url[ip.indexOf(item)]}`);
            ms[ip.indexOf(item)] = 0;  
        });        
    }
    func(arguments[0], arguments[1]);  
}

async function database(type, query){
    try {
            const client = await pool.connect()
            const result = await client.query(query);
            client.release(); 
            if (type == "query"){
                var results = { 'results': (result) ? result.rows : null};       
                return results;      
            }       
        } catch (err) {            
            console.error(err);
            res.send("Error " + err);
        }
}
