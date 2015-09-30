'use strict';

var express    = require('express');
var bodyParser = require('body-parser');
var config     = require('./config.json');
var etcd       = require('./service-register');

var app = express();

app.use(bodyParser.json());

var fakeToken = 'dfsfksjnfb28eriewnrewkjnsdo39jdoi';
var users = [];

//----------------------------------------------------------------------

app.get('/', function (request, response) {
    response.send('You are doing it wrong! Try http://carbono.io/');
});

//----------------------------------------------------------------------

app.post('/createuser', function (request, response) {
    if (request.body.username && request.body.password) {
        var found = false;
        var item = 0;
        for (item in users) {
            if (users[item]['username'] == request.body.username) {
                found = true;
                break;
            }
        }
        if (!found) {
            users.push({'username': request.body.username, 'password': request.body.password});
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.write(JSON.stringify({'created': true, 'message': 'success'}));
        } else {
            users[item]['password'] = request.body.password;
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.write(JSON.stringify({'created': false, 'message': 'password changed'}));
        }
    } else {
        response.writeHead(400, {'Content-Type': 'application/json'});
        response.write(JSON.stringify({'created': false}));
    }
    response.end();
});

//----------------------------------------------------------------------

app.post('/login', function (request, response) {
    if (request.body.username && request.body.password) {
        var found = false;
        for (var item in users) {
            if (users[item]['username'] == request.body.username && users[item]['password'] == request.body.password) {
                found = true;
                break;
            }
        }
        if (found) {
            console.log("found");
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.write(JSON.stringify({'token': fakeToken}));
        } else {
            response.writeHead(400, {'Content-Type': 'application/json'});
            response.write(JSON.stringify({'message': 'wrong username/password'}));
        }
    } else {
        response.writeHead(400, {'Content-Type': 'application/json'});
        response.write(JSON.stringify({'message': 'wrong username/password'}));
    }
    response.end();
});

//----------------------------------------------------------------------

app.post('/authenticated', function (request, response) {
    if (request.body.token == fakeToken) {
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.write(JSON.stringify({'isAuthenticated': true}));
    } else {
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.write(JSON.stringify({'isAuthenticated': false}));
    }
    response.end();
});

//----------------------------------------------------------------------

app.post('/logout', function (request, response) {
    if (request.body.token == fakeToken) {
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.write(JSON.stringify({'loggedout': true}));
    } else {
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.write(JSON.stringify({'loggedout': false}));
    }
    response.end();
});

//----------------------------------------------------------------------

var server = app.listen(config.port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Listening at http://%s:%s', host, port);
    etcd.init(config.etcd);
});
