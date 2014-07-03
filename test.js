var tape = require('tape')
var ostruct = require('./')

tape('hello string', function(t) {
  var o = ostruct({
    hello: 'string'
  })

  t.same(o.decode(o.encode({hello:'world'})), {hello:'world'})
  t.end()
})

tape('complex', function(t) {
  var o = ostruct({
    hello: 'string',
    test: 'buffer',
    a: 'boolean',
    foo: 'UInt32BE'
  })

  var input = {hello:'a', test:new Buffer('lol'), a:true, foo:10}
  t.same(o.decode(o.encode(input)), input)
  t.end()
})

tape('optional', function(t) {
  var o = ostruct({
    hello: 'string',
    test: 'buffer',
    a: 'boolean',
    foo: 'UInt32BE'
  })

  var output = {hello:'', test:new Buffer(0), a:false, foo:0}
  t.same(o.decode(o.encode({})), output)
  t.end()
})