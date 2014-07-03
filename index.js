var vstruct = require('varstruct')

var bool = {
  encode: function(val, b, offset) {
    if (!b) b = new Buffer(1)
    b[offset || 0] = val ? 1 : 0
    return b
  },
  decode: function(b, offset) {
    return b[offset || 0] !== 0
  },
  length: 1
}

bool.encode.bytes = bool.decode.bytes = 1

var string = {
  encode: function encode(val, b, offset) {
    if (!val) val = ''
    var len = Buffer.byteLength(val)
    var intl = vstruct.varint.encodingLength(len)
    if (!b) b = new Buffer(len+intl)
    if (!offset) offset = 0
    vstruct.varint.encode(len, b, offset)
    b.write(val, offset+intl)
    encode.bytes = intl+len
    return b
  },
  decode: function decode(b, offset) {
    var len = vstruct.varint.decode(b, offset)
    decode.bytes = len + vstruct.varint.decode.bytes
    if (!offset) offset = 0
    offset += vstruct.varint.decode.bytes
    return b.toString('utf-8', offset, offset+len)
  },
  encodingLength: function(val) {
    var len = Buffer.byteLength(val || '')
    return len+vstruct.varint.encodingLength(len)
  }
}

var optional = function(enc, def) {
  var encode = function(val, b, offset) {
    var res = enc.encode(val || def, b, offset)
    encode.bytes = enc.encode.bytes
    return res
  }

  var decode = function(buf, offset) {
    var res = enc.decode(buf, offset)
    decode.bytes = enc.decode.bytes
    return res
  }

  var encodingLength = enc.encodingLength && function(val) {
    return enc.encodingLength(val || def)
  }

  return {
    encode: encode,
    decode: decode,
    encodingLength: encodingLength,
    length: enc.length
  }
}

var compile = function(schema) {
  var struct = {}

  var visit = function(sch) {
    if (sch === 'number' || sch === 'double') sch = 'DoubleBE'

    if (sch === 'int' || sch === 'integer' || sch === 'varint')  return optional(vstruct.varint, 0)
    if (sch === 'bool' || sch === 'boolean') return bool
    if (sch === 'string') return string
    if (sch === 'bytes' || sch === 'buffer') return optional(vstruct.varbuf(vstruct.varint), new Buffer(0))

    if (Array.isArray(sch)) return optional(vstruct.vararray(vstruct.varint, visit(sch[0])), [])

    if (typeof sch === 'object' && sch) {
      var parts = {}
      Object.keys(sch).forEach(function(key) {
        parts[key] = visit(sch[key])
      })
      return optional(vstruct(parts), {})
    }

    if (vstruct[sch]) return optional(vstruct[sch], 0)
    throw new Error('Unknown encoding: '+sch)
  }

  return visit(schema)
}

module.exports = compile