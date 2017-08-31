'use strict';

var fs = require('fs');
var path = require('path');
var annotations = require('conga-annotations');
var Base = require('basejs');
var express = require('express');

var WorkCore = Base.extend(
  {
    app: null,
    io: null,
    http: null,
    config: {},
    reader: null,
    logger: null,
    defaultConfig: {
      port: 80,
      host: 'localhost',
      controllerPath: 'controller',
      cors: false,
      staticPath: false,
      baseUrl: '',
      logPath: 'logs'
    },
    constructor: function (config) {

      // Base URL
      this.config = config;
      this.config.baseUrl = this.config.baseUrl || this.defaultConfig.baseUrl;
      this.logger = require('../lib/logger')(this.config.logPath);

      var socketIoPath = this.config.baseUrl + '/socket.io';
      this.app = express();
      this.http = require('http').Server(this.app);
      this.io = require('socket.io')(this.http, {path: socketIoPath});
      this.logger.info('Socket.IO route: ' + socketIoPath);

      // create the registry
      var registry = new annotations.Registry();

      registry.registerAnnotation(path.join(__dirname, '/../annotation/rest-method-annotation'));
      registry.registerAnnotation(path.join(__dirname, '/../annotation/rest-uri-annotation'));
//      registry.registerAnnotation(path.join(__dirname, '/../annotation/rest-api-annotation'));
//      registry.registerAnnotation(path.join(__dirname, '/../annotation/rest-controller-annotation'));

      // create the annotation reader
      this.reader = new annotations.Reader(registry);

      // CORS
      this.config.cors = this.config.cors || this.defaultConfig.cors;
      if (this.config.cors === true) {
        var cors = require('cors');
        this.app.use(cors());
        this.logger.info('Enable CORS.');
      }

      // Public document root
      if (typeof(this.config.staticPath) === 'string') {
        if (this.config.baseUrl === '') {
          this.app.use(express.static(this.config.staticPath));
        } else {
          this.app.use(this.config.baseUrl, express.static(this.config.staticPath));
        }
        this.logger.info('Static Path: ' + this.config.staticPath);
      }

      // load controller
      if (typeof(this.config.controllerPath) === 'object') {
        for (var index in this.config.controllerPath) {
          this.setupController(this.config.controllerPath[index]);
        }
      } else {
        this.setupController(this.config.controllerPath || this.defaultConfig.controllerPath);
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
                this.logger.info('Register route: [' +
                  controllers[func].method + '] ' +
                  this.config.baseUrl +
                  controllers[func].uri
                );
                var routeCallback = function (controller, func, workJS) {
                  return function (req, res) {
                    controller[func].apply(controller, [req, res, workJS]);
                  };
                } (controller, func, this);

                // register router
                var httpMethod = controllers[func].method.toLowerCase();
                if (typeof(this.app[httpMethod]) === 'function') {
                  this.app[httpMethod].apply(this.app, [this.config.baseUrl + controllers[func].uri, routeCallback]);
                } else {
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
      var port = this.config.port || this.defaultConfig.port;
      var host = this.config.host || this.defaultConfig.host;

      this.http.listen(
        port,
        host,
        function () {
          this.logger.info('WorkJS Server listening on ' + host + ':' + port);
        }.bind(this)
      );
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
module.exports = WorkCore;