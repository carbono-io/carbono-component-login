'use strict';

var express    = require('express');
var bodyParser = require('body-parser');
var config     = require('./config.json');
var etcd       = require('./service-register');

var app = express();

app.use(bodyParser.json());

app.get('/', function (request, response) {
    res.send('You are doing it wrong! Try http://carbono.io/');
});

var fakeToken = 'dfsfksjnfb28eriewnrewkjnsdo39jdoi';

app.post('/login', function (request, response) {
    if (request.body.username == 'someuser' && request.body.password == 'somepass')
    {
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.write(JSON.stringify({'token': fakeToken}));
    }
    else
    {
        response.writeHead(400, {'Content-Type': 'application/json'});
        response.write(JSON.stringify({'message': 'wrong username/password'}));
    }
    response.end();
});

app.post('/authenticated', function (request, response) {
    if (request.body.token == fakeToken)
    {
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.write(JSON.stringify({'isAuthenticated': true}));
    }
    else
    {
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.write(JSON.stringify({'isAuthenticated': false}));
    }
    response.end();
});

app.post('/logout', function (request, response) {
    if (request.body.token == fakeToken)
    {
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.write(JSON.stringify({'loggedout': true}));
    }
    else
    {
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.write(JSON.stringify({'loggedout': false}));
    }
    response.end();
});

var server = app.listen(config.port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Listening at http://%s:%s', host, port);
    etcd.init(config.etcd);
});
