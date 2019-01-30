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
  request('http://www.google.com', function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  });
}
