import { types, Type } from './types';

const superpit = (customTypes) => {
  if (!customTypes) customTypes = {};
  const mixedTypes = Object.assign({}, types, customTypes);
  for (const type in mixedTypes) {
    mixedTypes[type] = new Type(mixedTypes[type]);
  }

  class Pit {
    constructor(schema) {
      Object.keys(schema).forEach((key) => {
        if (typeof schema[key] === 'string') {
          schema[key] = {
            type: schema[key],
          };
        }
        if (schema[key].type.endsWith('?')) {
          schema[key].required = false;
          schema[key].type = schema[key].type.substring(0, schema[key].type.length - 1);
        } else if (schema[key].required !== false) {
          schema[key].required = true;
        }

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
