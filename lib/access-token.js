'use strict';

const Hoek = require('@hapi/hoek');
const GrantTypeParams = require('./grant-type-params');
const { parseToken } = require('./access-token-parser');

const ACCESS_TOKEN_PROPERTY_NAME = 'access_token';
const REFRESH_TOKEN_PROPERTY_NAME = 'refresh_token';

module.exports = class AccessToken {
  constructor(config, client, token) {
    Hoek.assert(config, 'Cannot create access token without client configuration');
    Hoek.assert(client, 'Cannot create access token without client instance');
    Hoek.assert(token, 'Cannot create access token without a token to parse');

    this._config = config;
    this._client = client;
    this.token = Object.freeze(parseToken(token));
  }

  /**
  * Determines if the current access token has already expired or if it is about to expire
  *
  * @param {Number} expirationWindowSeconds Window of time before the actual expiration to refresh the token
  * @returns {Boolean}
  */
  expired(expirationWindowSeconds = 0) {
    return this.token.expires_at - (Date.now() + expirationWindowSeconds * 1000) <= 0;
  }

  /**
  * Refreshes the current access token
  *
  * @param {Object} params Optional argument for additional API request params.
  * @param {String|Array<String>} [params.scope] String or array of strings representing the application privileges
  * @returns {Promise<AccessToken>}
  */
  async refresh(params = {}) {
    const refreshParams = {
      ...params,
      refresh_token: this.token.refresh_token,
    };

    const parameters = GrantTypeParams.forGrantType(REFRESH_TOKEN_PROPERTY_NAME, this._config.options, refreshParams);
    const response = await this._client.request(this._config.auth.tokenPath, parameters.toObject());

    return new AccessToken(this._config, this._client, response);
  }

  /**
  * Revokes either the access or refresh token depending on the {tokenType} value
  *
  * @param  {String} tokenType A string containing the type of token to revoke (access_token or refresh_token)
  * @returns {Promise}
  */
  async revoke(tokenType) {
    Hoek.assert(
      tokenType === ACCESS_TOKEN_PROPERTY_NAME || tokenType === REFRESH_TOKEN_PROPERTY_NAME,
      `Invalid token type. Only ${ACCESS_TOKEN_PROPERTY_NAME} or ${REFRESH_TOKEN_PROPERTY_NAME} are valid values`,
    );

    const options = {
      token: this.token[tokenType],
      token_type_hint: tokenType,
    };

    return this._client.request(this._config.auth.revokePath, options);
  }

  /**
   * Revokes both the current access and refresh tokens
   *
   * @returns {Promise}
  */
  async revokeAll() {
    await this.revoke(ACCESS_TOKEN_PROPERTY_NAME);
    await this.revoke(REFRESH_TOKEN_PROPERTY_NAME);
  }

  /**
   * Get the access token's internal JSON representation
   *
   * @returns {String}
   */
  toJSON() {
    return this.token;
  }
};
