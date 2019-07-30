const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const parser = require('fast-xml-parser');
const Busboy = require('busboy');
const { Pool } = require('pg');


/*
*   Константы
*/

const pool = new Pool({
    connectionString: "postgres://xyqpegqsrbzjso:3cd4ae6126ae5c534fece6a6724daeb7d8cf52c51125b1bfde669eeff133ea17@ec2-54-228-246-214.eu-west-1.compute.amazonaws.com:5432/d4rj3tlq6m65jg",//process.env.DATABASE_URL,
    ssl: true
});

/*
*   Переменные
*/

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
*   Telegram
*/

process.env.NTBA_FIX_319 = 1;
const token = process.env.SERVER_TOKEN;
const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/list/, function (msg) {           
    bot.sendMessage(msg.from.id, "Данная функция в разработке", {disable_web_page_preview : true, parse_mode : "HTML"}); 
});

/*
*   Сервер
*/

const server = express();
const port = process.env.PORT || 8080;

server.use(express.json());
server.use(express.urlencoded({extended: true}));

server.get('/', function (req, res) {
    res.send('Hello World!');
});

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
        bot.sendMessage(process.env.CHAT, `Было зафиксировано новое сообщение об ошибке. Все сообщения об ошибках расположены по адресу <a href="https://checkgov.herokuapp.com/db">checkgov.herokuapp.com/db</a>`, {parse_mode : "HTML"});
        
        //  Debug
        //console.log(body);    
        console.log(jsonObj);
        });
    });
    busboy.on('finish', function() {    
      console.log('Done parsing!');
      //Название устройства
      //console.log(jsonObj["variable-set"]["variable"][7]['metadata'][0]["nls-string-val"]);
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
*   Функции
*/

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