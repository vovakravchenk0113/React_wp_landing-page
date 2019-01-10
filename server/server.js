const messageHandlers = require('./messageHandlers')
const _ = require('lodash');
const Util = require('./util') 
var moment = require('moment')
var geoip = require('geoip-lite');
// const fs = require('fs')

const state = {
    counter: 0,
    chat: [],
    users: {},
    clients: []
}

// var privateKey = fs.readFileSync('./file.pem').toString();
// var certificate = fs.readFileSync('./file.crt').toString();
// var ca = fs.readFileSync('YOUR SSL CA').toString();

// function requesthandler(req, res)
// {
//     res.writeHead(200);
//     res.end('Don\'t even think about it...');
// }

// const port = 8000
// const https = require('https')
// const options = {
//     key: fs.readFileSync('./file.pem'),
//     cert: fs.readFileSync('./file.crt'),
//     // ca: [fs.readFileSync('./file.crt')]
//     requestCert: false,
//     rejectUnauthorized: false,
//   };
// const server = https.createServer(options)
// server.listen(8000)

const port = 8000
const io = require('socket.io')();
io.listen(port);
console.log('listening on port', port);

io.on('connection', (client) =>
{
    client.removeAllListeners()
    client.ip = client.conn.remoteAddress.replace('::ffff:', '')
    client.geo = geoip.lookup(client.ip)
    console.log(client.geo.city, client.geo.country)
    console.log('New client connected: ' + client.id + ' on ' + client.ip + ' from ' + client.geo.city + ', ' + client.geo.country)
    state.clients.push(client)
    state.users[client.id] = {client: client, id: client.id, name: client.id}
    console.log('Number of users: ' + state.clients.length)
    
    for(var message in messageHandlers)
    {
        const closure = msg => {
            client.on(msg, data =>
                {
                    messageHandlers[msg]({
                        client: client,
                        user: state.users[client.id],
                        clients: state.clients,
                        users: state.users,
                        data: data,
                        state: state,
                    })
                })
            }
        closure(message)
    }

    client.on('disconnect', reason =>
    {
        console.log('Client ' + state.users[client.id].name + ' disconnected with reason: ' + reason)
        delete state.users[client.id];
        _.remove(state.clients, c => c.id == client.id)
        console.log('Number of users: ' + state.clients.length)
    })
});

// Start the timer
setInterval(() =>
{
    Util.sendToClients(state.clients, 'time', moment().format('MMMM Do YYYY, h:mm:ss a'))
}, 1000);