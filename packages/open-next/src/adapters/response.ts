// @ts-nocheck
import http from 'node:http';
import { Writable } from 'node:stream';

const BODY = Symbol();
const HEADERS = Symbol();

export class ServerResponse extends http.ServerResponse {
  static from(res) {
    const response = new ServerResponse(res);

    response.statusCode = res.statusCode;
    response[HEADERS] = res.headers;
    response[BODY] = [Buffer.from(res.body)];
    response.end();

    return response;
  }

  static headers(res) {
    const headers =
      typeof res.getHeaders === 'function' ? res.getHeaders() : res._headers;

    return Object.assign(headers, res[HEADERS]);
  }

  get headers() {
    return this[HEADERS];
  }

  setHeader(key, value) {
    if (this._wroteHeader) {
      this[HEADERS][key] = value;
    } else {
      super.setHeader(key, value);
    }
  }

  writeHead(statusCode, reason, obj) {
    const headers = typeof reason === 'string' ? obj : reason;

    for (const name in headers) {
      this.setHeader(name, headers[name]);

      if (!this._wroteHeader) {
        // we only need to initiate super.headers once
        // writeHead will add the other headers itself
        break;
      }
    }

    if (!this.headersSent) {
      try {
        this.responseStream = awslambda.HttpResponseStream.from(
          this.responseStream,
          {
            statusCode,
            headers: this.getHeaders(),
          }
        );
      } catch (e) {
        // error is most likely the below, does not affect actual output.
        // Runtime.InvalidStreamingOperation: Cannot set content-type, too late
        // console.log(e);
      }
    }
  }

  constructor({ method }, responseStream: Writable) {
    super({ method });

    this.responseStream = responseStream;
    this[BODY] = [];
    this[HEADERS] = {};

    this.useChunkedEncodingByDefault = false;
    this.chunkedEncoding = false;
    this._header = '';

    this.assignSocket({
      _writableState: {},
      writable: true,
      on: responseStream.on.bind(responseStream),
      removeListener: responseStream.removeListener.bind(responseStream),
      destroy: responseStream.destroy.bind(responseStream),
      cork: responseStream.cork.bind(responseStream),
      uncork: responseStream.uncork.bind(responseStream),
      write: responseStream.write.bind(responseStream),
    });

    this.once('finish', () => {
      responseStream.end();
      this.emit('close');
    });
  }
}
