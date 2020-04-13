'use strict';
const http = require('http');
module.exports = class ServerlessRequest extends http.IncomingMessage {
    constructor({ method, url, headers, body, remoteAddress }) {
        super({
            encrypted: true,
            readable: false,
            remoteAddress,
            address: () => ({ port: 443 }),
            end: Function.prototype,
            destroy: Function.prototype
        });
        //  if (typeof headers['content-length'] === 'undefined') {
        //  headers['content-length'] = Buffer.byteLength(body);
        // }
        Object.assign(this, {
            complete: true,
            httpVersion: '1.1',
            httpVersionMajor: '1',
            httpVersionMinor: '1',
        });
        //this.push(body);
        this.push(null);
        this.get = null;
        this.ip = remoteAddress,
            this.body = body,
            this.header = headers;
        this.accepts = null;
        this.acceptsCharsets = null;
        this.acceptsEncodings = null;
        this.acceptsLanguages = null;
        this.range = null;
        this.accepted = null;
        this.param = null;
        this.is = null;
        this.protocol = null,
            this.secure = null,
            this.path = null,
            this.ips = null;
        this.subdomains = null,
            this.method = method,
            this.hostname = null;
        this.host = null,
            this.fresh = null;
        this.stale = null,
            this.xhr = null;
        this.url = url;
        this.cookies = null,
            this.params = null,
            this.query = null,
            this.route = null,
            this.signedCookies = null;
        this.originalUrl = null,
            this.baseUrl = null,
            this.app = null;
        this.res = null;
        this.next = null;
    }
};
//# sourceMappingURL=request.js.map