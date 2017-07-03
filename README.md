# WorkJS [![Build Status](https://travis-ci.org/samejack/point-core.svg?branch=master)](https://travis-ci.org/samejack/point-core)
WorkJS is a NodeJS Web Design Pattern (tiny framework!?). Use JS annotation (JS Doc) to design your backend service (API) and defined router as the same time.
WorkJS includes basejs, express and socket.io project. You can build your controller use Object-Oriented Programming.
Write document and defined router at same time. Maybe, you can build your http service quickly.

## Getting Started
#### Install from GitHub
```sh
# get code
$ git clone https://github.com/samejack/WorkJS.git

# install depends package (npm install first)
$ cd WorkJS
$ npm install

# run example
$ npm start
```
Open your browser and go http://127.0.0.1:3000

#### Install from npm package repository
```sh
$ npm install workjs-core
```

## Controller JavaScript Example (book.js)
```javascript
var Base = require('basejs');

var BookController = Base.extend(
  {
    /**
     * Get all book list
     *
     * @Uri("/book")
     * @Method("GET")
     */
    getBookList: function(req, res) {
    },
    /**
     * Get book information by ISBN
     *
     * @Uri("/book/:isbn")
     * @Method("GET")
     */
    getBookInfo: function(req, res) {
    },
    /**
     * Create book
     *
     * @Uri("/book")
     * @Method("POST")
     */
    createBook: function(req, res) {
    },
    /**
     * Modify book
     *
     * @Uri("/book/:isbn")
     * @Method("PUT")
     */
    modifyBook: function(req, res) {
    },
    /**
     * Delete book
     *
     * @Uri("/book/:isbn")
     * @Method("DELETE")
     */
    deleteBook: function(req, res) {
    }
  }
);

module.exports = BookController;
```

## Create first WorkJS App

Create a bootstrap JavaScript file (app.js) as follows:
```javascript
var WorkCore = require('workjs-core');

var workCore = new WorkCore({
  // your controller's path
  controllerPath: [__dirname + '/controller']
}).start();
```
Run it
```sh
# run by nodejs
$ sudo node app.js
```
WorkJS default is bind on localhost:80 port. Open your browser and go http://127.0.0.1

## Configrations ([Example](https://github.com/samejack/WorkJS/blob/master/example/app.js))

Parameter | Default | Note
--------- | ------- | ----
port | 3000 | Server port
host | localhost | Server host
controllerPath | ./controller directory | Controller JS file path
cors | true | Enable CORS Header for corss domain web server
staticPath | ./public directory | HTTP document root

## Future Work
* Integrate [APIDoc](https://github.com/samejack/apidoc-core) to defined router.

## License
Apache License 2.0
