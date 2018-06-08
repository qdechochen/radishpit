const assert = require('assert');

const { pit, superpit } = require('../dist');

describe('RadishPit', () => {
  describe('string, min:5', () => {
    const model = pit({
      name: {
        type: 'string',
        min: 5,
      },
    });
    it('"Echo" -> false', () => {
      console.dir(model.test({name: 'Echo'}));
      assert.equal(model.test({name: 'Echo'}).length > 0, true);
    });
    it('"Echo Chen" -> true', () => {
      assert.equal(model.test({name: 'Echo Chen'}), null);
    });
    it('123 -> false', () => {
      assert.equal(model.test({name: 123}).length > 0, true);
    });
  });

  describe('array, min:3', () => {
    const model = pit({
      name: {
        type: 'array',
        min: 3,
      },
    });
    it('[1, 2] -> false', () => {
      assert.equal(model.test({name: [1, 2]}).length > 0, true);
    });
    it('[1, 2, 3] -> true', () => {
      assert.equal(model.test({name: [1, 2, 3]}), null);
    });
    it('"abc" -> false', () => {
      assert.equal(model.test({name: 'abc'}).length > 0, true);
    });
  });
  describe('date', () => {
    const model = pit({
      createdAt: {
        type: 'date',
      },
    });
    it('new Date() -> true', () => {
      assert.equal(model.test({createdAt: new Date()}), null);
    });
    it('"2018-3-2" -> false', () => {
      assert.equal(model.test({createdAt: '2018-3-2'}).length > 0, true);
    });
  });

  describe('int', () => {
    const model = pit({
      age: {
        type: 'int',
      },
    });
    it('123 -> true', () => {
      assert.equal(model.test({age: 123 }), null);
    });
    it('123.4 -> false', () => {
      assert.equal(model.test({age: 123.4}).length > 0, true);
    });
    it('undefined -> false', () => {
      assert.equal(model.test({}).length > 0, true);
    });
  });
  describe('int', () => {
    const model = pit({
      age: {
        type: 'int',
      },
    });
    it('123 -> true', () => {
      assert.equal(model.test({age: 123 }), null);
    });
    it('123.4 -> false', () => {
      assert.equal(model.test({age: 123.4}).length > 0, true);
    });
    it('undefined -> false', () => {
      assert.equal(model.test({}).length > 0, true);
    });
  });
  describe('int', () => {
    const model = pit({
      age: {
        type: 'int',
      },
    });
    it('123 -> true', () => {
      assert.equal(model.test({age: 123 }), null);
    });
    it('123.4 -> false', () => {
      assert.equal(model.test({age: 123.4}).length > 0, true);
    });
    it('undefined -> false', () => {
      assert.equal(model.test({}).length > 0, true);
    });
  });
  describe('mobile', () => {
    const model = pit({
      mobile: 'mobile',
    });
    it('"13828282828" -> true', () => {
      assert.equal(model.test({mobile: '13828282828' }), null);
    });
    it('"13345" -> false', () => {
      assert.equal(model.test({mobile: '13345'}).length > 0, true);
    });
    it('"1383838383a" -> false', () => {
      assert.equal(model.test({mobile: '1383838383a'}).length > 0, true);
    });
  });
});
