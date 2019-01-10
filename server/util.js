var _ = require('lodash');

module.exports.sendToClient = function (client, subject, data, checkFlag=undefined)
{
    if(!checkFlag || clients[i].client[checkFlag])
        client.emit(subject, data)
}

module.exports.sendToClients = function (clients, subject, data)
{
    for(var i in clients)
        if(_.includes(clients[i].subscriptions, subject))
            clients[i].emit(subject, data)
}

// Credit: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
module.exports.guid = function()
{
    function s4()
    {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}