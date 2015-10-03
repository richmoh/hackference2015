'use strict';

describe('Service: esir', function () {

  // load the service's module
  beforeEach(module('hackference2015App'));

  // instantiate service
  var esir;
  beforeEach(inject(function (_esir_) {
    esir = _esir_;
  }));

  it('should do something', function () {
    expect(!!esir).toBe(true);
  });

});
