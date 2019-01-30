const request = require('request');
const https = require('https');

var url = [
  'https://www.sakha.gov.ru',
  'https://www.e-yakutia.ru/bs/main.htm',
  'http://dom.e-yakutia.ru'
];

var name = [
  'sakha.gov',
  'e-yakutia',
  'dom.e-yakutia'
];

//setInterval(checkGov, 180000);

function sendMessage(addr){
 var str = 'https://api.telegram.org/bot775773770:AAFKmqPkw4MgOhSPjzdxFjG_NRxjnLZXbmY/sendMessage?chat_id=337277275&text=Проблемы';
 console.log(str);
  
  https.get(str, (res) => { });
  
  /*request(str, function (error, response, body) {
    console.log('error:', error);
    console.log('statusCode:', response && response.statusCode);
 });*/
}

checkGov();
  
function checkGov(){  
  url.forEach(function(item, i, url) {
    request(item, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log("OK : " + item);
      } else {
        sendMessage(name[i]);
      }
    });
  });
}
