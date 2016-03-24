'use strict';

var fs = require('fs');
var path = require('path');
var annotations = require('conga-annotations');
var Base = require('basejs');
var express = require('express');

module.exports = Base.extend(
  {

    //app: null,
    //io: null,
    //http: null,
    //config: {},
    //reader: null,
    //logger: null,

    constructor: function (config) {

      var defaultConfig = {
        port: 80,
        host: 'localhost',
        controllerPath: 'controller',
        cors: false,
        staticPath: false
      };

      this.app = express();
      this.http = require('http').Server(this.app);
      this.io = require('socket.io')(this.http);
      this.logger = require('../lib/logger');

      this.config = {};
      this.config.port = config.port || defaultConfig.port;
      this.config.host = config.host || defaultConfig.host;
      this.config.controllerPath = config.controllerPath || defaultConfig.controllerPath;
      this.config.cors = config.cors || defaultConfig.cors;
      this.config.staticPath = config.staticPath || defaultConfig.staticPath;

      // create the registry
      var registry = new annotations.Registry();

//      registry.registerAnnotation(path.join(__dirname, '/../annotation/rest-api-annotation'));
      registry.registerAnnotation(path.join(__dirname, '/../annotation/rest-method-annotation'));
      registry.registerAnnotation(path.join(__dirname, '/../annotation/rest-uri-annotation'));
//      registry.registerAnnotation(path.join(__dirname, '/../annotation/rest-controller-annotation'));

      // create the annotation reader
      this.reader = new annotations.Reader(registry);

      // CORS
      if (this.config.cors === true) {
        var cors = require('cors');
        this.app.use(cors());
        this.logger.info('Enable CORS.');
      }

      // Public document root
      if (typeof(this.config.staticPath) === 'string') {
        this.app.use(express.static(this.config.staticPath));
        this.logger.info('Static Path: ' + this.config.staticPath);
      }


      // load controller
      if (typeof(this.config.controllerPath) === 'object') {
        for (var index in this.config.controllerPath) {
          this.setupController(this.config.controllerPath[index]);
        }
      } else {
        this.setupController(this.config.controllerPath);
      }

      this.app.io = this.io;

    },
    setupController: function (dirPath) {

      var httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTION'];

      fs.readdir(dirPath, function (error, filenames) {

        for (var index in filenames) {

          if (filenames[index].match(/(^[^_].+)\.js$/)) {
            var controllerFile = dirPath + '/' + RegExp.$1 + '.js';
            this.logger.debug('Load controller: ' + controllerFile + '.js');

            // parse the annotations from a file
            this.reader.parse(path.join(dirPath, filenames[index]));

            // get the annotations
            var constructorAnnotations = this.reader.getConstructorAnnotations();
            var methodAnnotations = this.reader.getMethodAnnotations();
            var propertyAnnotations = this.reader.getPropertyAnnotations();

            // TODO: check constructorAnnotations has @RestfulController

            var controllers = {};

            for (var j in methodAnnotations) {
              var target = methodAnnotations[j].target;
              var method = null;
              if (typeof(controllers[target]) === 'undefined') {
                controllers[target] = {};
              }
              for (var k in httpMethods) {
                if (httpMethods[k] === methodAnnotations[j].value) {
                  method = methodAnnotations[j].value;
                  break;
                }
              }
              if (method !== null) {
                controllers[target].method = method;
              } else {
                controllers[target].uri = methodAnnotations[j].value;
              }
            }

            var controllerClass = require(controllerFile);
            var controller = new controllerClass();

            for (var func in controllers) {
              if (typeof(controllers[func].method) !== 'undefined'
                && typeof(controllers[func].uri) !== 'undefined') {
                this.logger.info('Register route: [' + controllers[func].method + '] ' + controllers[func].uri);
                var routeCallback = function (controller, func) {
                  return function (req, res) {
                    controller[func].apply( controller, arguments);
                  };
                } (controller, func);
                switch (controllers[func].method) {
                  case 'GET':
                    this.app.get(controllers[func].uri, routeCallback);
                    break;
                  case 'POST':
                    this.app.post(controllers[func].uri, routeCallback);
                    break;
                  case 'PUT':
                    this.app.put(controllers[func].uri, routeCallback);
                    break;
                  case 'DELETE':
                    this.app.delete(controllers[func].uri, routeCallback);
                    break;
                  default:
                    this.logger.error('Http method not match.');
                }
              }
            }
          }

        }
      }.bind(this));
    },
    start: function () {
      // bind server to tcp
      this.http.listen(
        this.config.port,
        this.config.host,
        function () {
          this.logger.info('WorkJS Server listening on ' + this.config.host + ':' + this.config.port);
        }.bind(this)
      );
      return this;
    },
    getApp: function () {
      return this.app;
    },
    getIO: function () {
      return this.io;
    },
    getLogger: function () {
      return this.logger;
    }
  }
);
