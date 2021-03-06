'use strict';

const Hoek = require('@hapi/hoek');
const Wreck = require('@hapi/wreck');
const debug = require('debug')('simple-oauth2:client');
const { RequestOptions } = require('./request-options');

const defaultHttpHeaders = {
  Accept: 'application/json',
};

const defaultHttpOptions = {
  json: 'strict',
  redirects: 20,
  headers: defaultHttpHeaders,
};

module.exports = class Client {
  constructor(config) {
    const configHttpOptions = Hoek.applyToDefaults(config.http || {}, {
      baseUrl: config.auth.tokenHost,
    });

    const httpOptions = Hoek.applyToDefaults(defaultHttpOptions, configHttpOptions);

    this._config = config;
    this._client = Wreck.defaults(httpOptions);
  }

  async request(url, params, opts) {
    const requestOptions = new RequestOptions(this._config, params);
    const options = requestOptions.toObject(opts);

    debug('Creating request to: (POST) %s', url);
    debug('Using request options: %j', options);

    const response = await this._client.post(url, options);

    return response.payload;
  }
};
