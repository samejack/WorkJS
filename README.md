# WorkJS
WorkJS is a NodeJS Web Design Pattern. Use JS annotation (JS Doc) to design your backend service and defined router.
WorkJS includes basejs, express and socket.io project.
Write document and defined router at same time. Maybe, you can build your http service quickly.

## Getting Started
```sh
# get code
$ git clone https://github.com/samejack/WorkJS.git

# install depends package (npm install first)
$ cd WorkJS
$ npm install

# run example
$ npm start
```
Open your browser to go http://127.0.0.1:3000

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

## Future Work
* Integrate [APIDoc](https://github.com/samejack/apidoc-core) to defined router.

## License
Apache License 2.0
