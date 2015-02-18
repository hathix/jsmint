# jsMint: Refresh your JavaScript

![jsMint logo](https://raw.githubusercontent.com/hathix/jsmint/master/icon.png)

jsMint is a smart, friendly JavaScript checking tool. Just type in some code and see it automatically checked using three smart, super-customizable tests. It provides advanced unit testing and granular feedback. 

[Try it out live!](http://jsmint.herokuapp.com)

## Building it yourself

After `git clone`'ing this repo and `cd`'ing into the created directory, run:

```
$ npm install
$ bower install
$ grunt serve
```

The last command will open up `localhost:9000`, where the app will be running.

## APIs

jsMint ships with a friendly interface to three powerful RESTful APIs to check JavaScript code against:

* `POST /api/jsmint/whitelist`: Checks if the code contains *all* the specified functionality.
* `POST /api/jsmint/blacklist`: Checks if the code contains *none* of the specified functionality.
* `POST /api/jsmint/codetree`: Generates a simplified abstract syntax tree of the code and checks if it matches a specified test tree.

## Stack

* Node.js/Express.js
* Acorn
* AngularJS
* jQuery
* Lodash
* Bootstrap
* Font Awesome

## Tools used

* npm
* Grunt
* Bower
* Yeoman
