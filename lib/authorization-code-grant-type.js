'use strict';

const { URL } = require('url');
const querystring = require('querystring');
const AccessToken = require('./access-token');
const GrantTypeParams = require('./grant-type-params');

module.exports = class AuthorizationCode {
  constructor(config, client) {
    this._config = config;
    this._client = client;
  }

  /**
   * Get a valid redirect URL used to redirect users to an authorization page
   *
   * @param {Object} params
   * @param {String} params.redirectURI String representing the registered application URI where the user is redirected after authentication
   * @param {String|Array<String>} params.scope String or array of strings representing the application privileges
   * @param {String} params.state String representing an opaque value used by the client to main the state between the request and the callback
   *
   * @return {String} the absolute authorization url
   */
  authorizeURL(params = {}) {
    const baseParams = {
      response_type: 'code',
      [this._config.client.idParamName]: this._config.client.id,
    };

    const url = new URL(this._config.auth.authorizePath, this._config.auth.authorizeHost);
    const parameters = new GrantTypeParams(this._config.options, baseParams, params);

    return `${url}?${querystring.stringify(parameters.toObject())}`;
  }

  /**
   * Requests and returns an access token from the authorization server
   *
   * @param {String} params.code Authorization code (from previous step)
   * @param {String} params.redirectURI String representing the registered application URI where the user is redirected after authentication
   * @param {String|Array<String>} [params.scope] String or array of strings representing the application privileges
   * @param {Object} [httpOptions] Optional http options passed through the underlying http library
   * @return {Promise<AccessToken>}
   */
  async getToken(params, httpOptions) {
    const parameters = GrantTypeParams.forGrantType('authorization_code', this._config.options, params);
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
