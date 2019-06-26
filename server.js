'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
var fileSystem = require("fs");


const PORT = 80;
const INDEX = path.join(__dirname, 'index.html');
const server = express()
    .use((req, res) => res.sendFile(INDEX))
    .listen(PORT, () => console.log(`Listening on ${PORT}`))
    .header("Access-Control-Allow-Origin", "*");

const io = socketIO(server);
var clientIP = null;
var allowIP = '10.32.1.210, 127.0.0.1';

io.on('connection', (socket) => {
    clientIP = socket.request.connection.remoteAddress.toString().split(':');
    clientIP = clientIP[clientIP.length - 1];
    if (allowIP.indexOf(clientIP) === -1) {
        console.log('not autherize');
        socket.emit('hitoo', clientIP + ' : <span style="color:red">คุณไม่มีสิทธิ์เข้าถึงระบบนี้ ! ./. </span>');
        socket.disconnect();

    } else {
        watchFileDataChange();
        console.log('passed');
    }
    socket.on('hello', (msg) => {
        console.log('data from hello  ' + msg);
        io.emit('hitoo', msg);
    });
    socket.on('disconnect', () => console.log('Client disconnected'));

});

// This function is used to monitor the message text file data change.
function watchFileDataChange() {
    var messageFile = 'data.json';
    console.log(messageFile);
    fileSystem.open(messageFile, 'r', function (err, fd) {

        if (err) {
            return setTimeout(watchFileDataChange, 3000);
        }
        // This is the fs watch function.
        fileSystem.watch(messageFile, function (event, filename) {
            // If data change then send new text back to client.
            if (event === "change") {
                fileSystem.readFile(messageFile, { encoding: 'utf-8' }, function (err, data) {
                    if (!!!err && data.length > 0) {
                        io.emit('hitoo', 'changed ' + data);
                    }
                });
            };
        });
    });
}