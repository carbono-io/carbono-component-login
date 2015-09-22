Carbono Component Login
=======================

This project aims to provide a simple REST service that allows the
user generated app can have a efficient and easy to user login component.
This component is available as a Docker image to be run by the carbono's
infrastructure when it is needed.

How to test:
```
curl -d '{ "username" : "someuser", "password" : "somepass" }' -H "Content-Type: application/json" http://localhost:6543/login

curl -d '{ "token" : "the_token_returned_by /login" }' -H "Content-Type: application/json" http://localhost:6543/authenticated

curl -d '{ "token" : "the_token_returned_by /login" }' -H "Content-Type: application/json" http://localhost:6543/logout
```
