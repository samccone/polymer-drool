var serveStatic = require('serve-static');
var http = require('http');
var path = require('path');
var finalhandler = require('finalhandler');
var drool = require('drool');
var humanize = require('humanize');

function heapDiffPrinter(after, initial) {
  console.log('node delta | heap delta | event listener');
  console.log('--- | --- | --- |');
  console.log((after.nodes - initial.nodes) + '|' +
   humanize.filesize(after.jsHeapSizeUsed - initial.jsHeapSizeUsed) + '|' +
   (after.jsEventListeners - initial.jsEventListeners) + '\n');
}

module.exports = {
  serveComponent: function(rootPath, name, port) {
    part = port || 3000;
    var root = serveStatic(rootPath);
    var bower = serveStatic(path.join(rootPath, '../bower_components'));
    var server = http.createServer(function(req, res) {
      var done = finalhandler(req, res);

      root(req, res, function() {
        bower(req, res, done);
      });
    });

    // Listen
    server.listen(3000);
    return server;
  },
  test: function(componentName, driver) {
    return drool.flow({
      setup: function() {
        driver.get('http://localhost:3000/' + componentName + '.html');
      },
      action: function() {
        driver.executeScript('(function(){' +
          'var a = document.createElement("' + componentName + '");' +
          'document.body.appendChild(a);' +
          'a.remove();' +
        '})();');
        driver.sleep(400);
      },
      assert: function(after, initial) {
        heapDiffPrinter(after, initial);
      }
    }, driver);
  }
};
