// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


let urls = require('electron').remote.getGlobal('sharedUrl');
window.$ = window.jQuery = require("jquery");
const isOnline = require('is-online');



async function getToken(userName, password) {
    var data = "username=" + userName + "&password=" + password + "&grant_type=password";
    return await fetch(urls.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-url-encoded' },
        body: data
    }).then(res => res.json())
        .then(response => {
            require('electron').remote.getGlobal('sharedObject').tokenModel = response;
            return response;
        })
        .catch(error => console.error('Error:', error));
}

async function postApi(url, data) {
    var url = urls.apiUrl + url;
    return await fetch(url, {
        method: 'POST', // or 'PUT'
        body: JSON.stringify(data), // data can be `string` or {object}!
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + require('electron').remote.getGlobal('sharedObject').tokenModel.access_token
        }
    }).then(res => res.json())
        .then(response => { return response })
        .catch(error => console.error('Error:', error));
}

var macAdrr = "";
var ipAddr = "";
var macaddress = require('macaddress');
console.log(macaddress);
macaddress.one(function (err, mac) {
    macAdrr = mac;
});

var os = require('os');
var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}
ipAddr = addresses[0];
console.log(addresses);

setInterval(() => {
    (async () => {
        console.log(await isOnline());
        //=> true
        var onlineStatus = await isOnline();

        if (onlineStatus){
            var terminalConfigModel = {
                IPAddr: ipAddr,
                LogStatus: "h",
                Code: "on",
                Message: "#plc:off#qr:on",
            };
    
            postApi('/Operation/CreateTerminalLog', terminalConfigModel).then(response => {
                console.log(response);
            });
        }
    })();
}, 60000*4);
