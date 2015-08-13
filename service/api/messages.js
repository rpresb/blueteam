function Messages() {
  var express = require('express');
  var app = express();

  app.get('/receive', function(req, res, next) {

    return res.json(global.currentEvent);

  });

  app.post('/send', function(req, res, next) {

console.log(req.body);
    var e = req.body;

    global.currentEvent = e;

    return res.json({ id: e.id });

  });

  return app;
}

module.exports = Messages;
