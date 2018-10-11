(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.RadishPit = {})));
}(this, (function (exports) { 'use strict';

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var kindOf = require('kind-of');

  var simpleKindOfTypes = ['arguments', 'boolean', 'buffer', 'date', 'error', 'float32array', 'float64array', 'function', 'generatorfunction', 'int16array', 'int32array', 'int8array', 'map', 'null', 'object', 'promise', 'regexp', 'set', 'symbol', 'uint16array', 'uint32array', 'uint8array', 'uint8clampedarray', 'undefined', 'weakmap', 'weakset'];

  var Type = function () {
    function Type(_ref) {
      var type = _ref.type,
          validate = _ref.validate;
      classCallCheck(this, Type);

      if (type) {
        this.type = type;
      }
      if (validate) {
        this.customValidate = validate;
      }
    }

    createClass(Type, [{
      key: 'validate',
      value: function validate(value, options) {
        var v = value;
        if (options.transform) {
          v = options.transform(v);
        }
        if (options.required) {
          if (v === null || v === undefined || options.type === 'string' && v === '' || options.type === 'array' && v instanceof Array && v.length === 0) {
            return ['required'];
          }
        } else if (v === null || v === undefined) {
          return null;
        }

        if ({}.hasOwnProperty.call(this, 'type')) {
          var type = kindOf(v);
          if (type !== this.type) {
            return ['expect_type', options.type];
          }
        }

        if ({}.hasOwnProperty.call(this, 'customValidate')) {
          return this.customValidate(v, options);
        }

        return null;
      }
    }]);
    return Type;
  }();

  var types = {};

  simpleKindOfTypes.forEach(function (type) {
    types[type] = {
      type: type
    };
  });

  types.array = {
    type: 'array',
    validate: function validate(value, options) {
      if ({}.hasOwnProperty.call(options, 'length') && value.length !== options.length) {
        return ['size_should_be', options.length];
      }
      if ({}.hasOwnProperty.call(options, 'min') && {}.hasOwnProperty.call(options, 'max')) {
        if (value.length < options.min || value.length > options.max) {
          return ['size_should_between', options.min, options.max];
        }
      }
      if ({}.hasOwnProperty.call(options, 'min') && value.length < options.min) {
        return ['size_should_gt', options.min];
      }
      if (options.max && value.length > options.max) {
        return ['size_should_lt', options.max];
      }

      return null;
    }
  };

  types.string = {
    type: 'string',
    validate: function validate(value, options) {
      if ({}.hasOwnProperty.call(options, 'length') && value.length !== options.length) {
        return ['length_should_be', options.length];
      }
      if ({}.hasOwnProperty.call(options, 'min') && {}.hasOwnProperty.call(options, 'max')) {
        if (value.length < options.min || value.length > options.max) {
          return ['length_should_between', options.min, options.max];
        }
      }
      if ({}.hasOwnProperty.call(options, 'min') && value.length < options.min) {
        return ['length_should_gt', options.min];
      }
      if (options.max && value.length > options.max) {
        return ['length_should_lt', options.max];
      }
      if (options.regexp && !options.regexp.test(value)) {
        return ['incorrect_format'];
      }

      return null;
    }
  };

  types.number = {
    type: 'number',
    validate: function validate(value, options) {
      if ({}.hasOwnProperty.call(options, 'min') && {}.hasOwnProperty.call(options, 'max')) {
        if (value < options.min || value > options.max) {
          return ['should_between', options.min, options.max];
        }
      }
      if ({}.hasOwnProperty.call(options, 'min') && value < options.min) {
        return ['should_gt', options.min];
      }
      if (options.max && value > options.max) {
        return ['length_should_lt', options.max];
      }

      return null;
    }
  };

  types.int = {
    validate: function validate(value, options) {
      if (kindOf(value) !== 'number' || value % 1 !== 0) {
        return ['expect_type', 'int'];
      }
      if ({}.hasOwnProperty.call(options, 'min') && {}.hasOwnProperty.call(options, 'max')) {
        if (value < options.min || value > options.max) {
          return ['should_between', options.min, options.max];
        }
      }
      if ({}.hasOwnProperty.call(options, 'min') && value < options.min) {
        return ['should_gt', options.min];
      }
      if (options.max && value > options.max) {
        return ['length_should_lt', options.max];
      }

      return null;
    }
  };

  types.mobile = {
    type: 'string',
    validate: function validate(v) {
      return (/^1[3-8]\d{9}$/.test(v) ? null : ['incorrect_format']
      );
    }
  };

  types.email = {
    type: 'string',
    validate: function validate(v) {
      return (/.+@.+\..+/.test(v) ? null : ['incorrect_format']
      );
    }
  };

  types.booleannumber = {
    validate: function validate(v) {
      return v === 1 || v === 0 ? null : ['incorrect_format'];
    }
  };

  var superpit = function superpit(customTypes) {
    if (!customTypes) customTypes = {};
    var mixedTypes = Object.assign({}, types, customTypes);
    for (var type in mixedTypes) {
      mixedTypes[type] = new Type(mixedTypes[type]);
    }

    var Pit = function () {
      function Pit(schema) {
        classCallCheck(this, Pit);

        Object.keys(schema).forEach(function (key) {
          if (typeof schema[key] === 'string') {
            schema[key] = {
              type: schema[key]
            };
          }
          if (schema[key].type.endsWith('?')) {
            schema[key].required = false;
            schema[key].type = schema[key].type.substring(0, schema[key].type.length - 1);
          } else if (schema[key].required !== false) {
            schema[key].required = true;
          }

          if (!{}.hasOwnProperty.call(mixedTypes, schema[key].type)) {
            throw new Error('[Radish-pit] type ' + schema[key].type + ' is not defined');
          }
        });

        this.schema = schema;
      }

      createClass(Pit, [{
        key: 'validate',
        value: function validate(data) {
          var errors = this.test(data);
          if (errors) {
            var error = new TypeError();
            error.errors = errors;
            throw error;
          }
        }
      }, {
        key: 'test',
        value: function test(data) {
          var _this = this;

          var errors = [];

          var _loop = function _loop(key) {
            var error = mixedTypes[_this.schema[key].type].validate(data[key], _this.schema[key]);

            if (error) {
              errors.push({
                path: key,
                value: data[key],
                message: error[0].replace(/\{(\d+)\}/g, function (m, i) {
                  return error[i + 1];
                }),
                error: error
              });
            }
          };

          for (var key in this.schema) {
            _loop(key);
          }
          return errors.length > 0 ? errors : null;
        }
      }]);
      return Pit;
    }();

    return function (schema) {
      return new Pit(schema);
    };
  };

  var pit = superpit();

  exports.superpit = superpit;
  exports.pit = pit;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
