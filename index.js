const request = require('request');

var url = [
  'https://www.sakha.gov.ru',
  'https://www.e-yakutia.ru/bs/main.htm',
  'http://dom.e-yakutia.ru'
 ];

//setInterval(checkGov, 180000);

function sendMessage(){
  //https://api.telegram.org/bot775773770:AAFKmqPkw4MgOhSPjzdxFjG_NRxjnLZXbmY/sendMessage?chat_id=337277275&text=Проблемы%20с%20'.$val
}

checkGov();
  
function checkGov(){  
  url.forEach(function(item, i, url) {
  console.log( i + ": " + item + " (массив:" + url + ")" );
});
  
  
  
  request(val, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(val + " is OK");
    } else {
      sendMessage(val);
    }
  });
}
