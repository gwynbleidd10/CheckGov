//process.env.NTBA_FIX_319 = 1;
//const ping = require('node-http-ping')
//const TelegramBot = require('node-telegram-bot-api');
//const token = process.env.BOT_TOKEN;
//const bot = new TelegramBot(token, {polling: true});

var url = ['sakha.gov.ru', 'e-yakutia.ru', 'dom.e-yakutia.ru', 'max.0code.pro'];
var ms = [0, 0, 0];
/*
//bot.onText(/\/status/, function (msg) {
    status();
    var result = 'Статус сайтов:';
    ms.forEach(function(item, i){
        console.log(i);
        if (item != '0'){
            console.log(`\n<a href=\"http://${url[i]}/\">${url[i]}</a> - <code>${item}ms</code>`);
            result.concat(`\n<a href=\"http://${url[i]}/\">${url[i]}</a> - <code>${item}ms</code>`);
        }
        else
        {
            result += `\n<a href=\"http://${url[i]}/\">${url[i]}</a> - <code>Не овечает</code>`;
        }
    });    
    setTimeout(function(){        
        console.log(result);
    }, 1000);    
    //bot.sendMessage(msg.chat.id, result, {parse_mode : "HTML"});
//});


*/

https://www.npmjs.com/package/is-reachable
status();

function status(){  
    /*url.forEach(function(item, i){
        ping(item, 80)
        .then(time => {
            console.log(i);
            console.log(`${item} time: ${time}ms`);
            ms[i] = time;            
        })
        .catch(() => {
            console.log(`Failed to ping ${item}`);
            ms[i] = 0;
        });
    }); */
    const isReachable = require('is-reachable');
    s = 0;
    (async () => {        
        s = Number(await isReachable('sindresorhus.com'));
        console.log(s);
        //=> true
     
        console.log(await isReachable('google.com:80'));
        //=> true
        console.log(s);
    })();
    console.log(s);
}

//setInterval(pingCheck, 5000);


