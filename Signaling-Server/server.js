//server for passing messages between clients
//requires node.js to be installed locally
//
//to run locally enter 'node server.js'

const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
    console.log('A new client connected.');

    ws.on('message', function incoming(message) {
        console.log('received: %s', typeof message, message);

        // Broadcast to all clients
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', function close() {
        console.log('Connection closed');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, function listening() {
    console.log(`Server started on port ${PORT}`);
});
