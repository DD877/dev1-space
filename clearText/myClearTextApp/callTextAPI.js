const express = require('express')
const axios = require('axios')
var app = express();

// app.configure(function(){
//     app.arguments(express.logger('dev'));
//     app.arguments(express.bodyParser());
// });

app.get('/dkjd', function(req, res){
    
    // var clientId = 'sb-na-0ebdc300-0dd2-4096-8513-102b2ec3987e!a49565';
    // var clientSecret = '2cdeb35e-530d-454f-8e26-7b8cfe6d8a3a$DWdz7LIqqu5XtbL4ro128s-U-A4y1yRGLpqGsLBt91o=';
    // const token = `${clientId}:${clientSecret}`;
    // const encodedToken = Buffer.from(token).toString('base64');
    // const session_url = 'https://b1ff4e01trial.authentication.us10.hana.ondemand.com/oauth/token?grant_type=client_credentials';

    var config = {
        method: 'get',
        url: "https://api-sandbox.clear.in:443/einv/v2/eInvoice/get?irn=6ca40d80480362014445a75ea944881f6a31d2b91fc7b88c84e3b250aec447c1",
        headers: { 
            'X-Cleartax-Auth-Token': '1.0e601f35-9b93-4d02-a133-374776f8fc47_e1c8e001e44577b3f279d738bf7c807c185f5ebd8c3beb6b122cd4d85e285985',
            'gstin': '06AAFCD5862R017',
            'owner_id':'a959273c-ae3d-4424-9feb-13d8e483ab68',
            'Content-Type':'application/json'
         }  
    }   
    axios(config)       
        .then(function(response) {
            // console.log(response.data);
            res.send(response.data);
        })
        .catch(function(error) {
            console.log(error);
        })
});

app.listen(4000);
console.log('Listening on port 4000');