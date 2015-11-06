'use strict';

var express    = require('express');
var bodyParser = require('body-parser');
var config     = require('./config.json');
var etcd       = require('./service-register');
var request    = require('request');
var randtoken  = require('rand-token');

var app = express();

app.use(bodyParser.json());

var PROTOCOL       = 'http://';
var DB             = '/login';
var COLLECTION     = '/users';
var CRUDER_ADDRESS = PROTOCOL + config.cruder.serverAddress + ':' + config.cruder.serverPort + DB;

//----------------------------------------------------------------------

app.get('/', function (request, res) {
    res.send('You are doing it wrong! Try http://carbono.io/');
});

//----------------------------------------------------------------------

app.post('/createuser', function (req, res) {
    if (req.body.username && req.body.password) {
        var url = CRUDER_ADDRESS + COLLECTION + '?query={"username":"' + req.body.username + '"}';
        request(url, function (error, response, body) {
            var found = false;
            var item = 0;
            var message = '';
            var statusCode = 400;
            var user;
            var created = false;
            statusCode = response.statusCode;
            if (statusCode == 200) {
                var obj = JSON.parse(body);
                if (obj[0] && obj[0]._id) {
                    user = obj[0];
                    found = true;
                }
            }
            if (statusCode == 200 && !found) {
                request({
                    url: url,
                    method: 'POST',
                    json: true,
                    body: {'username': req.body.username, 'password': req.body.password}
                }, function (error, response, body) {
                    var statusCode = response.statusCode;
                    var created = false;
                    var message = '';
                    if (statusCode == 201 && body.ok == 1) {
                        created = true;
                        message = 'user created';
                    } else {
                        message = 'error creating user';
                    }
                    res.writeHead(statusCode, {'Content-Type': 'application/json'});
                    res.write(JSON.stringify({'success': created, 'created': created, 'message': message}));
                    res.end();
                });
            } else if (statusCode == 200) {
                url = CRUDER_ADDRESS + COLLECTION + '/' + user._id;
                user.password = req.body.password;
                delete user._id;
                var success = false;
                request({
                    url: url,
                    method: 'PUT',
                    json: true,
                    body: user
                }, function (error, response, body) {
                    var statusCode = response.statusCode;
                    var message = '';
                    if (statusCode == 200 && body.ok == 1) {
                        success = true;
                        message = 'password updated';
                    } else {
                        message = 'error updating user password';
                    }
                    res.writeHead(statusCode, {'Content-Type': 'application/json'});
                    res.write(JSON.stringify({'success': success, 'created': false, 'message': message}));
                    res.end();
                });
            } else {
                message = 'unexpected status ' + statusCode + ' from the cruder machine when requesting ' + url;
                res.writeHead(statusCode, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({'success': false, 'created': false, 'message': message}));
                res.end();
            }
        });
    } else {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({'success': false, 'created': false, 'message': 'invalid content'}));
        res.end();
    }
});

//----------------------------------------------------------------------

app.post('/login', function (req, res) {
    if (req.body.username && req.body.password) {
        var url = CRUDER_ADDRESS + COLLECTION + '?query={"username":"' + req.body.username + '"}';
        request(url, function (error, response, body) {
            var found = false;
            var item = 0;
            var message = '';
            var statusCode = 400;
            var user;
            var created = false;
            statusCode = response.statusCode;
            if (statusCode == 200) {
                var obj = JSON.parse(body);
                if (obj[0] && obj[0]._id) {
                    user = obj[0];
                    found = true;
                }
            }
            if (found && req.body.password == user.password) {
                url = CRUDER_ADDRESS + COLLECTION + '/' + user._id;
                delete user._id;
                user.token = randtoken.generate(16);
                var success = false;
                request({
                    url: url,
                    method: 'PUT',
                    json: true,
                    body: user
                }, function (error, response, body) {
                    var statusCode = response.statusCode;
                    if (statusCode == 200 && body.ok == 1) {
                        success = true;
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.write(JSON.stringify({'success': true, 'token': user.token}));
                        res.end();
                    } else {
                        res.writeHead(statusCode, {'Content-Type': 'application/json'});
                        res.write(JSON.stringify({'success': false, 'message': 'error on token persistence'}));
                        res.end();
                    }
                });
            } else {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({'success': false, 'message': 'wrong username/password'}));
                res.end();
            }
        });
    } else {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({'success': false, 'message': 'wrong username/password'}));
        res.end();
    }
});

//----------------------------------------------------------------------

app.post('/authenticated', function (req, res) {
    if (req.body.token) {
        var url = CRUDER_ADDRESS + COLLECTION + '?query={"token":"' + req.body.token + '"}';
        request(url, function (error, response, body) {
            var found = false;
            var item = 0;
            var message = '';
            var statusCode = 400;
            var user;
            var created = false;
            statusCode = response.statusCode;
            if (statusCode == 200) {
                var obj = JSON.parse(body);
                if (obj[0] && obj[0]._id) {
                    user = obj[0];
                    found = true;
                }
            }
            if (found) {
                res.writeHead(statusCode, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({'isAuthenticated': true, 'username': user.username}));
                res.end();
            } else {
                res.writeHead(statusCode, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({'isAuthenticated': false}));
                res.end();
            }
        });
    } else {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({'isAuthenticated': false}));
        res.end();
    }
});

//----------------------------------------------------------------------

app.post('/logout', function (req, res) {
    if (req.body.token) {
        var url = CRUDER_ADDRESS + COLLECTION + '?query={"token":"' + req.body.token + '"}';
        request(url, function (error, response, body) {
            var found = false;
            var item = 0;
            var message = '';
            var statusCode = 400;
            var user;
            var created = false;
            statusCode = response.statusCode;
            if (statusCode == 200) {
                var obj = JSON.parse(body);
                if (obj[0] && obj[0]._id) {
                    user = obj[0];
                    found = true;
                }
            }
            if (found) {
                url = CRUDER_ADDRESS + COLLECTION + '/' + user._id;
                delete user._id;
                delete user.token;
                var success = false;
                request({
                    url: url,
                    method: 'PUT',
                    json: true,
                    body: user
                }, function (error, response, body) {
                    var statusCode = response.statusCode;
                    if (statusCode == 200 && body.ok == 1) {
                        success = true;
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.write(JSON.stringify({'loggedout': true}));
                        res.end();
                    } else {
                        res.writeHead(statusCode, {'Content-Type': 'application/json'});
                        res.write(JSON.stringify({'loggedout': false}));
                        res.end();
                    }
                });
            } else {
                res.writeHead(statusCode, {'Content-Type': 'application/json'});
                res.write(JSON.stringify({'loggedout': false}));
                res.end();
            }
        });
    } else {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({'loggedout': false}));
        res.end();
    }
});

//----------------------------------------------------------------------

var server = app.listen(config.port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Listening at http://%s:%s', host, port);
    etcd.init(config.etcd);
});
