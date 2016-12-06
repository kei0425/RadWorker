var router = require("../routes/");
var assert = require("assert");

describe('router', function(){
  describe('get(/)', function(){
    it('Hello mocha', function(){
      var msg = 'mocha';
      assert.equal('Hello ' + msg, router.hello(msg));
    });
  });
});