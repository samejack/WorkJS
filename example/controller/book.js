'use strict';

var fs = require('fs');
var uuid = require('node-uuid');
var Base = require('basejs');

var BookController = Base.extend(
  {
    constructor: function () {
      this.filename = __dirname + '/../database.db';
      this.encode = 'utf8';

      fs.writeFile(this.filename, '{}', function(err) {
        if(err) {
          return console.log(err);
        }
        console.log('Init book database.');
      });
    },
    /**
     * Get all book list
     *
     * @Uri("/book")
     * @Method("GET")
     */
    getBookList: function(req, res) {
      this.openDatabase(function(database) {
        var list = [];
        for (var isbn in database) {
          list.push(database[isbn]);
        }
        res.contentType('application/json');
        res.status(200).send(JSON.stringify(list));
      });
    },
    /**
     * Get book information by ISBN
     *
     * @Uri("/book/:isbn")
     * @Method("GET")
     */
    getBookInfo: function(req, res) {
      this.openDatabase(function(database) {
        res.contentType('application/json');
        if (typeof(database[req.params.isbn]) === 'object') {
          res.status(200).send(JSON.stringify(database[req.params.isbn]));
          return;
        }
        res.status(404).send(JSON.stringify({msg: 'not found.'}));
      });
    },
    /**
     * Create book
     *
     * @Uri("/book")
     * @Method("POST")
     */
    createBook: function(req, res) {
      req.rawBody = '';
      req.setEncoding(this.encode);
      req.on('data', function(chunk) {
        req.rawBody += chunk;
      });
      req.on('end', function() {
        console.log('Request body: ' + req.rawBody);
        var obj = JSON.parse(req.rawBody);
        this.openDatabase(function(database) {
          res.contentType('application/json');
          if (!obj.isbn) {
            res.status(400).send(JSON.stringify({msg: 'ISBN not found.'}));
            return;
          } else if (obj.isbn && typeof(database[obj.isbn]) !== 'object') {
            database[obj.isbn] = obj;
            this.saveDatabase(database, function () {
              res.status(200).send(JSON.stringify(database[obj.isbn]));
            });
            return;
          }
          res.status(400).send(JSON.stringify({msg: 'ISBN is exist already.'}));
        }.bind(this));
      }.bind(this));
    },
    /**
     * Modify book
     *
     * @Uri("/book/:isbn")
     * @Method("PUT")
     */
    modifyBook: function(req, res) {
      req.rawBody = '';
      req.setEncoding(this.encode);
      req.on('data', function(chunk) {
        req.rawBody += chunk;
      });
      req.on('end', function() {
        console.log('Request body: ' + req.rawBody);
        var obj = JSON.parse(req.rawBody);
        this.openDatabase(function(database) {
          res.contentType('application/json');
          if (req.params.isbn && typeof(database[req.params.isbn]) === 'object') {
            database[req.params.isbn] = obj;
            this.saveDatabase(database, function () {
              res.status(200).send(JSON.stringify(database[obj.isbn]));
            });
            return;
          }
          res.status(404).send(JSON.stringify({msg: 'not found.'}));
        }.bind(this));
      }.bind(this));
    },
    /**
     * Delete book
     *
     * @Uri("/book/:isbn")
     * @Method("DELETE")
     */
    deleteBook: function(req, res) {
      this.openDatabase(function(database) {
        res.contentType('application/json');
        if (req.params.isbn && typeof(database[req.params.isbn]) === 'object') {
          delete database[req.params.isbn];
          this.saveDatabase(database, function () {
            res.status(200).send({});
          });
          return;
        }
        res.status(404).send(JSON.stringify({msg: 'not found.'}));
      }.bind(this));
    },
    /**
     * Open json file to object
     *
     * @param {function} callback
     */
    openDatabase: function(callback) {
      fs.readFile(this.filename, this.encode, function(err, json) {
        if(err) {
          return console.log(err);
        }
        var database = JSON.parse(json);
        callback(database);
      });
    },
    /**
     * Save object to file
     *
     * @param {Object} database
     * @param {function} callback
     */
    saveDatabase: function(database, callback) {
      console.log(JSON.stringify(database));
      fs.writeFile(this.filename, JSON.stringify(database), function(err) {
        if(err) {
          return console.log(err);
        }
        callback();
      });
    }
  },
  {
    filename: null,
    encode: null
  }
);

module.exports = BookController;
