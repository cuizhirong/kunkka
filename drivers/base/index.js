"use strict";

var request = require('request');
var URL = require('url');


class RequestData {
    constructor(method, url, token) {
        // If url contains query string, initilize the object with paramter.
        var parsed = URL.parse(url, true);
        this._query = parsed || {};

        // Save the pure request url.
        parsed.search = null;
        parsed.query = null;
        this._url = URL.format(parsed);

        this._method = method;
        this._data = null;
        this._isFormData = false;
        this._oauth = null;
        this._headers = {};

        // Save the auth token if necessary.
        this._token = token;
    }

    /**
     * Set a request body. GET is not allowed.
     */
    setRequestData(data) {
        if (this._method === "GET") {
            throw new Error("Cannot set body for GET request");
        }
        this._data = data;
        return this;
    }

    /**
     * Send a request body as multipart form.
     */
    setFormData(data) {
        this._isFormData = true;
        return this.setRequestData(data);
    }

    /**
     * Set the request header.
     */
    setHeader(name, value) {
        this._headers[name] = value;
        return this;
    }

    /**
     * Mark response as the binary content.
     */
    setBinary() {
        this._binary = true;
        return this;
    }

    /**
     * Set query string value.
     */
    setQueryData(query) {
        this._query = Object.assign(this._query, query);
        return this;
    }

    /**
     * Send a request and get the response.
     */
    exec(logger, callback) {
        if (typeof logger === 'function') {
            callback = logger;
            logger = null;
        }

        if (logger && (typeof logger.logAPIError !== 'function' || typeof logger.logResponse !== 'function' || typeof logger.logRequest !== 'function')) {
            callback(new Error("logger must be valid logger instance"));
            return;
        }
        if (logger) {
            this.log(logger);
        }
        var self = this,
            method = self._method.toLowerCase();
        var requestData = {
            method: self._method,
            url: self._url,
            query: self._query,
            headers: self._headers,
            data: self._data
        };

        var options = {
            url: self._url,
            qs: self._query,
            method: method,
            headers: self._headers,
            gzip: true,
            rejectUnauthorized: false
        };
        if (self._binary) {
            options.encoding = null;
        }
        if (self._isFormData) {
            options.formData = self._data;
        } else {
            options.body = JSON.stringify(self._data);
            options.json = self._data && typeof self.data === 'object';
        }

        /**
         * Log error or response and call main callback
         * @param {Error} err the error
         * @param {Object} body the response body
         * @param {Object} response the http response
         */
        var callbackAndLog = function(err, body, response) {
            if (logger) {
                if (err) {
                    logger.logAPIError(err);
                } else {
                    logger.logResponse(response);
                }
            }
            callback(err, body, response);
        };
        request(self._url, options, function(err, response) {
            if (err) {
                return self._handleErrorResponse(err, null, callbackAndLog);
            }
            if (self._binary) {
                response.text = "<binary>";
                if (!response.body) {
                    response.body = new Buffer(0);
                }
            } else if (typeof response.body === 'object') {
                response.text = JSON.stringify(response.body);
            } else {
                try {
                    response.text = response.body;
                    response.body = JSON.parse(response.body);
                } catch (e) {
                    response.body = {};
                }
            }
            if (response.statusCode < 200 || response.statusCode > 299 || response.body.isException ||
                String(response.text).trim() === "Exception While getting Data, Please verify url and params") {
                return self._handleErrorResponse(null, response, callbackAndLog);
            }
            response.requestData = requestData;
            callbackAndLog(err, response.body, response);
        });
    }

    /**
     * Handle response from 3rd party web clients
     * @param {Error} err the error
     * @param {Object} response the http response
     * @param {function(Error, Object, Object)} callback the callback function with parameters:
     * 1) The error if any
     * 2) The response body
     * 3) The http response
     * @private
     */
    _handleErrorResponse(err, response, callback) {
        var self = this;

        //The generic error message added to error.message when http requests fail.
        var HTTP_ERROR_MSG = "An error occurred when submitting http request";

        if (err) {
            err.message = HTTP_ERROR_MSG + ": " + err.message;
            self._prepareError(err, response);
            return callback(err);
        }
        var msg = HTTP_ERROR_MSG;

        // add error message from body
        if (response.body && (response.body.title || response.body.description)) {
            //use only description if available
            msg = HTTP_ERROR_MSG + ": " + (response.body.description || response.body.title);
        } else if (response.body && (response.body.error || response.body.error_description)) {
            //oauth error contains error message in error and error_description properties
            msg = HTTP_ERROR_MSG + ": " + (response.body.error_description || response.body.error);
        } else if (response.text) {
            //remove xml tags
            msg = HTTP_ERROR_MSG + ": " + response.text.replace(/(<([^>]+)>)/ig, "").trim();
        }

        err = new Error(msg);
        self._prepareError(err, response);
        return callback(err);
    }

    /**
     * Set request information to the error object
     * @param {Error} err the error to modify
     * @param {Object|Null} response the http response
     * @private
     */
    _prepareError(err, response) {
        err.requestInfo = {
            method: this._method,
            headers: this._headers,
            url: this._url,
            query: this._query,
            data: this._data
        };
        if (response) {
            err.responseInfo = {
                status: response.status || response.statusCode,
                body: response.body,
                text: response.text
            };
        } else {
            err.responseInfo = "No response";
        }
    }
    log(logger) {
        if (!logger || typeof logger.logRequest !== 'function') {
            throw new Error("logger must be valid logger instance");
        }
        logger.logRequest(this._method, this._url, this._headers, this._query, this._data);
        return this;
    }
};

module.exports = RequestData;