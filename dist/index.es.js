const kindOf = require('kind-of');

const simpleKindOfTypes = [
  'arguments',
  'boolean',
  'buffer',
  'date',
  'error',
  'float32array',
  'float64array',
  'function',
  'generatorfunction',
  'int16array',
  'int32array',
  'int8array',
  'map',
  'null',
  'object',
  'promise',
  'regexp',
  'set',
  'symbol',
  'uint16array',
  'uint32array',
  'uint8array',
  'uint8clampedarray',
  'undefined',
  'weakmap',
  'weakset',
];

class Type {
  constructor({ type, validate }) {
    if (type) {
      this.type = type;
    }
    if (validate) {
      this.customValidate = validate;
    }
  }

  validate(value, options) {
    let v = value;
    if (options.transform) {
      v = options.transform(v);
    }
    if (options.required) {
      if (v === null || v === undefined || (options.type === 'string' && v === '') || (options.type === 'array' && v instanceof Array && v.length === 0)) {
        return ['required'];
      }
    } else if (v === null || v === undefined) {
      return null;
    }

    if ({}.hasOwnProperty.call(this, 'type')) {
      const type = kindOf(v);
      if (type !== this.type) {
        return ['expect_type', options.type];
      }
    }

    if ({}.hasOwnProperty.call(this, 'customValidate')) {
      return this.customValidate(v, options);
    }

    return null;
  }
}

const types = {};

simpleKindOfTypes.forEach((type) => {
  types[type] = {
    type,
  };
});

types.array = {
  type: 'array',
  validate(value, options) {
    if (
      {}.hasOwnProperty.call(options, 'length') &&
      value.length !== options.length
    ) {
      return ['size_should_be', options.length];
    }
    if (
      {}.hasOwnProperty.call(options, 'min') &&
      {}.hasOwnProperty.call(options, 'max')
    ) {
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
  },
};

types.string = {
  type: 'string',
  validate(value, options) {
    if (
      {}.hasOwnProperty.call(options, 'length') &&
      value.length !== options.length
    ) {
      return ['length_should_be', options.length];
    }
    if (
      {}.hasOwnProperty.call(options, 'min') &&
      {}.hasOwnProperty.call(options, 'max')
    ) {
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
  },
};

types.number = {
  type: 'number',
  validate(value, options) {
    if (
      {}.hasOwnProperty.call(options, 'min') &&
      {}.hasOwnProperty.call(options, 'max')
    ) {
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
  },
};

types.int = {
  validate(value, options) {
    if (kindOf(value) !== 'number' || value % 1 !== 0) {
      return ['expect_type', 'int'];
    }
    if (
      {}.hasOwnProperty.call(options, 'min') &&
      {}.hasOwnProperty.call(options, 'max')
    ) {
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
  },
};

types.mobile = {
  type: 'string',
  validate: (v) => (/^1[3-8]\d{9}$/.test(v) ? null : ['incorrect_format']),
};

types.email = {
  type: 'string',
  validate: (v) => (/.+@.+\..+/.test(v) ? null : ['incorrect_format']),
};

types.booleannumber = {
  validate: (v) => (v === 1 || v === 0 ? null : ['incorrect_format']),
};

const superpit = (customTypes) => {
  if (!customTypes) customTypes = {};
  const mixedTypes = Object.assign({}, types, customTypes);
  for (const type in mixedTypes) {
    mixedTypes[type] = new Type(mixedTypes[type]);
  }

  class Pit {
    constructor(schema, options = {}) {
      const forceRequired = Array.isArray(options.forceRequired) ? options.forceRequired : {includes: () => !!options.forceRequired};
      Object.keys(schema).forEach((key) => {
        if (typeof schema[key] === 'string') {
          schema[key] = {
            type: schema[key],
          };
        }
        const required = forceRequired.includes(key) || ('required' in schema[key] ? schema[key].required : !schema[key].type.endsWith('?'));
        const type = schema[key].type.slice(0, schema[key].type.endsWith('?') ? schema[key].type.length - 1 : undefined);
        schema[key].required = required;
        schema[key].type = type;

        if (!{}.hasOwnProperty.call(mixedTypes, schema[key].type)) {
          throw new Error(`[Radish-pit] type ${schema[key].type} is not defined`);
        }
      });

      this.schema = schema;
    }

    validate(data) {
      const errors = this.test(data);
      if (errors) {
        const error = new TypeError();
        error.errors = errors;
        throw error;
      }
    }

    test(data) {
      const errors = [];
      for (const key in this.schema) {
        const error = mixedTypes[this.schema[key].type].validate(data[key], this.schema[key]);

        if (error) {
          errors.push({
            path: key,
            value: data[key],
            message: error[0].replace(/\{(\d+)\}/g, (m, i) => error[i + 1]),
            error,
          });
        }
      }
      return errors.length > 0 ? errors : null;
    }
  }

  return (schema) => new Pit(schema);
};

const pit = superpit();

export { pit, superpit };
