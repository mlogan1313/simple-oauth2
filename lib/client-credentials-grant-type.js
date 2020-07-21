'use strict';

const AccessToken = require('./access-token');
const GrantTypeParams = require('./grant-type-params');

module.exports = class ClientCredentials {
  _config = null;
  _client = null;

  constructor(config, client) {
    this._config = config;
    this._client = client;
  }

  /**
   * Requests and returns an access token from the authorization server
   *
   * @param {Object} params
   * @param {String|Array<String>} [params.scope] A String or array of strings representing the application privileges
   * @param {Object} [httpOptions] Optional http options passed through the underlying http library
   * @return {Promise<AccessToken>}
   */
  async getToken(params, httpOptions) {
    const parameters = GrantTypeParams.forGrantType('client_credentials', this._config.options, params);
    const response = await this._client.request(this._config.auth.tokenPath, parameters.toObject(), httpOptions);

    return this.createToken(response);
  }

  /**
   * Creates a new access token instance from a plain object
   *
   * @param {Object} token Plain object representation of an access token
   * @returns {AccessToken}
   */
  createToken(token) {
    return new AccessToken(this._config, this._client, token);
  }
};
