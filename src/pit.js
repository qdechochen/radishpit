import { types, Type } from './types';

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

export default superpit;
