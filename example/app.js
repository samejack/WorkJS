'use strict';

var WorkCore = require(__dirname + '/../src/core/work');

var workCore = new WorkCore({
  port: 3000,
  host: 'localhost',
  controllerPath: [__dirname + '/controller'],
  cors: true,
  staticPath: __dirname + '/public'
});

var io = workCore.getIO();

io.on('connection', function(socket){
  workCore.getLogger().debug('a user connected: ' + socket.id);

  socket.broadcast.emit('say hi', socket.id);

  socket.on('chat', function(msg){
    workCore.getLogger().debug('chat: ' + msg);
    io.emit('chat', socket.id, msg);
  });

  socket.on('disconnect', function(){
    workCore.getLogger().debug('user disconnected: ' + socket.id);
  });
});

// start server
workCore.start();
