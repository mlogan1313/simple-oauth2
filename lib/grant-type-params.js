'use strict';

function getScopeParam(scope, scopeSeparator) {
  if (scope === undefined) {
    return null;
  }

  if (Array.isArray(scope)) {
    return {
      scope: scope.join(scopeSeparator),
    };
  }

  return {
    scope,
  };
}

module.exports = class GrantTypeParams {
  _params = null;
  _baseParams = null;
  _options = null;

  static forGrantType(grantType, options, params) {
    const baseParams = {
      grant_type: grantType,
    };

    return new GrantTypeParams(options, baseParams, params);
  }

  constructor(options, baseParams, params) {
    this._options = { ...options };
    this._params = { ...params };
    this._baseParams = { ...baseParams };
  }

  toObject() {
    const scopeParams = getScopeParam(this._params.scope, this._options.scopeSeparator);

    return Object.assign(this._baseParams, this._params, scopeParams);
  }
};
