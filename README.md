Carbono Component Login
=======================

This project aims to provide a simple REST service that allows the
user generated app can have a efficient and easy to user login component.
This component is available as a Docker image to be run by the carbono's
infrastructure when it is needed.

How to test on command line:
```node .```
then:
```
curl -d '{ "username" : "someuser", "otherfield" : "somepass" }' -H "Content-Type: application/json" http://localhost:7799/createuser

curl -d '{ "username" : "someuser", "password" : "somepass" }' -H "Content-Type: application/json" http://localhost:7799/createuser

curl -d '{ "username" : "someuser", "password" : "somepass" }' -H "Content-Type: application/json" http://localhost:7799/login

curl -d '{ "username" : "someuser", "password" : "wrongpwd" }' -H "Content-Type: application/json" http://localhost:7799/login

curl -d '{ "token" : "the_token_returned_by /login" }' -H "Content-Type: application/json" http://localhost:7799/authenticated

curl -d '{ "token" : "the_token_returned_by /login" }' -H "Content-Type: application/json" http://localhost:7799/logout
```
