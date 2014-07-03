# objectstruct

schema based object encoding/decoding using [varstruct](https://github.com/dominictarr/varstruct) that supports strings, booleans etc

```
npm install objectstruct
```

## Usage

```
var ostruct = require('objectstruct')

var example = ostruct({
  hello: 'string',
  list: [{           // [type] donates an array
    a: 'boolean',
    b: 'number',     // you can also set DoubleBE etc
    c: 'integer'     // uses a varint
  }],
  data: 'bytes'      // expect a Buffer object
  foo: {             // a nested object
    bar: 'boolean'
  }
})

var buf = example.encode({
  hello: 'world',
  list: [{
    a: true,
    b: 10.0,
    c: 10000
  }, {
    b: 1
  }],
  foo: {
    bar: true
  },
  data: new Buffer('test')
})

console.log(buf) // prints a buffer

var parsed = example.decode(buf)

console.log(buf) // prints an object similar to above
```

## Encodings

In addition to the encodings supported by [varstruct](https://github.com/dominictarr/varstruct) (`UInt32BE` etc)
the following encodings/aliases are supported as well

* `string`
* `boolean`
* `bytes` (or `buffer`)
* `number` (or `double` or `DoubleBE`)
* `integer` (or `varint`)

Use `[some-type]` in the schema declaration to specify an array

## Default values

The following default values are using if your encoded objects misses a
property specified in the schema

* `string = ""`
* `boolean = false`
* `bytes = new Buffer(0)`
* `number = 0` (same for all numbers)
* `array = []`
* `object = {}`

## License

MIT