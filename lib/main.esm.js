/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var _CookieFake_cookies, _CookieFake_location, _CookieFake_quota;
class CookieFake {
    /**
     * Crete a new Cookie Fake instance.
     *
     * @param { CookieFakeLocation | undefined } location
     */
    constructor(location) {
        /**
         * List of all cookies.
         */
        _CookieFake_cookies.set(this, []);
        /**
         * Location of the Cookie Fake instance.
         */
        _CookieFake_location.set(this, void 0);
        /**
         * Cookie quota in bytes.
         */
        _CookieFake_quota.set(this, 4 * 1024);
        __classPrivateFieldSet(this, _CookieFake_location, location || {
            host: typeof globalThis === 'undefined' ? 'localhost' : globalThis.location.host,
            pathname: typeof globalThis === 'undefined' ? '/' : globalThis.location.pathname
        }, "f");
    }
    /**
     * Get all cookies.
     */
    get cookie() {
        let cookies = [];
        const domain = `.${__classPrivateFieldGet(this, _CookieFake_location, "f").host.replace('www.', '')}`;
        const path = __classPrivateFieldGet(this, _CookieFake_location, "f").pathname.replace(/\/$/, '');
        for (const cookie of __classPrivateFieldGet(this, _CookieFake_cookies, "f")) {
            const index = __classPrivateFieldGet(this, _CookieFake_cookies, "f").indexOf(cookie);
            if (cookie.domain !== domain) {
                continue;
            }
            if (cookie.path !== path && cookie.path !== '/') {
                continue;
            }
            if (cookie.expires !== null && Date.parse(cookie.expires) < Date.now()) {
                __classPrivateFieldGet(this, _CookieFake_cookies, "f").splice(index, 1);
                continue;
            }
            cookies.push(cookie.value === null ? cookie.key : `${cookie.key}=${cookie.value}`);
        }
        return cookies.join('; ');
    }
    /**
     * Set a cookie.
     */
    set cookie(cookie) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const keyValue = (_a = cookie.split(';')[0]) !== null && _a !== void 0 ? _a : '';
        if (keyValue === '') {
            return;
        }
        const key = keyValue.split('=')[0];
        const value = (_b = keyValue.split('=')[1]) !== null && _b !== void 0 ? _b : null;
        const ttl = (_d = (_c = cookie.match(/max-age=([^;]*)/i)) === null || _c === void 0 ? void 0 : _c[1]) !== null && _d !== void 0 ? _d : null;
        let expires = (_f = (_e = cookie.match(/expires=([^;]+)/)) === null || _e === void 0 ? void 0 : _e[1]) !== null && _f !== void 0 ? _f : null;
        const domain = '.' + ((_h = (_g = cookie.match(/domain=([^;]*)/i)) === null || _g === void 0 ? void 0 : _g[1]) !== null && _h !== void 0 ? _h : __classPrivateFieldGet(this, _CookieFake_location, "f").host.replace('www.', ''));
        const path = (_k = (_j = cookie.match(/path=([^;]*)/i)) === null || _j === void 0 ? void 0 : _j[1]) !== null && _k !== void 0 ? _k : __classPrivateFieldGet(this, _CookieFake_location, "f").pathname.replace(/\/$/, '');
        const secure = /secure/i.test(cookie);
        const sameSite = (_m = (_l = cookie.match(/samesite=([^;]*)/i)) === null || _l === void 0 ? void 0 : _l[1]) !== null && _m !== void 0 ? _m : null;
        if (ttl !== null) {
            expires = new Date(Date.now() + ttl * 1000).toUTCString();
        }
        const existing = __classPrivateFieldGet(this, _CookieFake_cookies, "f").findIndex((cookie) => cookie.key === key && cookie.path === path && cookie.domain === domain);
        const expired = expires !== null && Date.parse(expires) < Date.now();
        const data = {
            key,
            value,
            expires,
            domain,
            path,
            secure,
            sameSite,
        };
        if (data.value !== null && this.exceeded(data.value)) {
            return;
        }
        if (existing >= 0) {
            if (expired) {
                __classPrivateFieldGet(this, _CookieFake_cookies, "f").splice(existing, 1);
            }
            else {
                __classPrivateFieldGet(this, _CookieFake_cookies, "f")[existing] = data;
            }
        }
        else {
            __classPrivateFieldGet(this, _CookieFake_cookies, "f").push(data);
        }
    }
    /**
     * Set the new Location of the Cookie Fake instance.
     *
     * @param { CookieFakeLocation } location
     *
     * @return { void }
     */
    location(location) {
        __classPrivateFieldSet(this, _CookieFake_location, location, "f");
    }
    /**
     * Calculate the size a new item would take in bytes.
     *
     * @param { string } cookie
     *
     * @return { number }
     */
    size(cookie) {
        return new Blob([cookie]).size;
    }
    /**
     * Determine if the Storage quota is exceeded.
     *
     * @param { string } cookie
     *
     * @return { boolean }
     */
    exceeded(cookie) {
        return this.size(cookie) >= __classPrivateFieldGet(this, _CookieFake_quota, "f");
    }
}
_CookieFake_cookies = new WeakMap(), _CookieFake_location = new WeakMap(), _CookieFake_quota = new WeakMap();

var _StorageFlushing_key;
class StorageFlushing extends Event {
    /**
     * Create a new Storage Flushing Event instance.
     */
    constructor() {
        super('cookie:flushing');
        /**
         * The key of the event.
         *
         * @type { string }
         */
        _StorageFlushing_key.set(this, void 0);
    }
    /**
     * Get the key of the event.
     *
     * @return { string }
     */
    get key() {
        return __classPrivateFieldGet(this, _StorageFlushing_key, "f");
    }
}
_StorageFlushing_key = new WeakMap();

var _StorageFlushed_key;
class StorageFlushed extends Event {
    /**
     * Create a new Storage Flushed Event instance.
     */
    constructor() {
        super('cookie:flushed');
        /**
         * The key of the event.
         *
         * @type { string }
         */
        _StorageFlushed_key.set(this, void 0);
    }
    /**
     * Get the key of the event.
     *
     * @return { string }
     */
    get key() {
        return __classPrivateFieldGet(this, _StorageFlushed_key, "f");
    }
}
_StorageFlushed_key = new WeakMap();

var _RetrievingKey_key;
class RetrievingKey extends Event {
    /**
     * Create a new Retrieving Key Event instance.
     *
     * @param { string } key
     */
    constructor(key) {
        super('cookie:retrieving');
        /**
         * The key of the event.
         *
         * @type { string }
         */
        _RetrievingKey_key.set(this, void 0);
        __classPrivateFieldSet(this, _RetrievingKey_key, key, "f");
    }
    /**
     * Get the key of the event.
     *
     * @return { string }
     */
    get key() {
        return __classPrivateFieldGet(this, _RetrievingKey_key, "f");
    }
}
_RetrievingKey_key = new WeakMap();

var _KeyHit_key, _KeyHit_value;
class KeyHit extends Event {
    /**
     * Create a new Key Hit Event instance.
     *
     * @param { string } key
     * @param { string } value
     */
    constructor(key, value) {
        super('cookie:hit');
        /**
         * The key of the event.
         *
         * @type { string }
         */
        _KeyHit_key.set(this, void 0);
        /**
         * The value of the key.
         *
         * @type { string }
         */
        _KeyHit_value.set(this, void 0);
        __classPrivateFieldSet(this, _KeyHit_key, key, "f");
        __classPrivateFieldSet(this, _KeyHit_value, value, "f");
    }
    /**
     * Get the key of the event.
     *
     * @return { string }
     */
    get key() {
        return __classPrivateFieldGet(this, _KeyHit_key, "f");
    }
    /**
     * Get the value of the key.
     *
     * @return { * }
     */
    get value() {
        return __classPrivateFieldGet(this, _KeyHit_value, "f");
    }
}
_KeyHit_key = new WeakMap(), _KeyHit_value = new WeakMap();

var _KeyMissed_key;
class KeyMissed extends Event {
    /**
     * Create a new Key Missed Event instance.
     *
     * @param { string } key
     */
    constructor(key) {
        super('cookie:missed');
        /**
         * The key of the event.
         *
         * @type { string }
         */
        _KeyMissed_key.set(this, void 0);
        __classPrivateFieldSet(this, _KeyMissed_key, key, "f");
    }
    /**
     * Get the key of the event.
     *
     * @return { string }
     */
    get key() {
        return __classPrivateFieldGet(this, _KeyMissed_key, "f");
    }
}
_KeyMissed_key = new WeakMap();

var _KeyWriteFailed_key, _KeyWriteFailed_value, _KeyWriteFailed_expiry;
class KeyWriteFailed extends Event {
    /**
     * Create a new Key Write Failed Event instance.
     *
     * @param { string } key
     * @param { string } value
     * @param { number | null } expiry
     */
    constructor(key, value, expiry = null) {
        super('cookie:write-failed');
        /**
         * The key of the event.
         *
         * @type { string }
         */
        _KeyWriteFailed_key.set(this, void 0);
        /**
         * The value of the key.
         *
         * @type { string }
         */
        _KeyWriteFailed_value.set(this, void 0);
        /**
         * The validity period in seconds since Unix Epoch.
         *
         * @type { number | number }
         */
        _KeyWriteFailed_expiry.set(this, void 0);
        __classPrivateFieldSet(this, _KeyWriteFailed_key, key, "f");
        __classPrivateFieldSet(this, _KeyWriteFailed_value, value, "f");
        __classPrivateFieldSet(this, _KeyWriteFailed_expiry, expiry, "f");
    }
    /**
     * Get the key of the event.
     *
     * @return { string }
     */
    get key() {
        return __classPrivateFieldGet(this, _KeyWriteFailed_key, "f");
    }
    /**
     * Get the value of the key.
     *
     * @return { * }
     */
    get value() {
        return __classPrivateFieldGet(this, _KeyWriteFailed_value, "f");
    }
    /**
     * Get the validity period in milliseconds since Unix Epoch.
     *
     * @return { number | null }
     */
    get expiry() {
        return __classPrivateFieldGet(this, _KeyWriteFailed_expiry, "f");
    }
}
_KeyWriteFailed_key = new WeakMap(), _KeyWriteFailed_value = new WeakMap(), _KeyWriteFailed_expiry = new WeakMap();

var _KeyWritten_key, _KeyWritten_value, _KeyWritten_expiry;
class KeyWritten extends Event {
    /**
     * Create a new Key Written Event instance.
     *
     * @param { string } key
     * @param { string } value
     * @param { number | null} expiry
     */
    constructor(key, value, expiry = null) {
        super('cookie:written');
        /**
         * The key of the event.
         *
         * @type { string }
         */
        _KeyWritten_key.set(this, void 0);
        /**
         * The value of the key.
         *
         * @type { string }
         */
        _KeyWritten_value.set(this, void 0);
        /**
         * The validity period in seconds since Unix Epoch.
         *
         * @type { number | number }
         */
        _KeyWritten_expiry.set(this, void 0);
        __classPrivateFieldSet(this, _KeyWritten_key, key, "f");
        __classPrivateFieldSet(this, _KeyWritten_value, value, "f");
        __classPrivateFieldSet(this, _KeyWritten_expiry, expiry, "f");
    }
    /**
     * Get the key of the event.
     *
     * @return { string }
     */
    get key() {
        return __classPrivateFieldGet(this, _KeyWritten_key, "f");
    }
    /**
     * Get the value of the key.
     *
     * @return { * }
     */
    get value() {
        return __classPrivateFieldGet(this, _KeyWritten_value, "f");
    }
    /**
     * Get the validity period in milliseconds since Unix Epoch.
     *
     * @return { number | null }
     */
    get expiry() {
        return __classPrivateFieldGet(this, _KeyWritten_expiry, "f");
    }
}
_KeyWritten_key = new WeakMap(), _KeyWritten_value = new WeakMap(), _KeyWritten_expiry = new WeakMap();

var _WritingKey_key, _WritingKey_value, _WritingKey_expiry;
class WritingKey extends Event {
    /**
     * Create a new Writing Key Event instance.
     *
     * @param { string } key
     * @param { string } value
     * @param { number | null} expiry
     */
    constructor(key, value, expiry = null) {
        super('cookie:writing');
        /**
         * The key of the event.
         *
         * @type { string }
         */
        _WritingKey_key.set(this, void 0);
        /**
         * The value of the key.
         *
         * @type { string }
         */
        _WritingKey_value.set(this, void 0);
        /**
         * The validity period in seconds since Unix Epoch.
         *
         * @type { number | number }
         */
        _WritingKey_expiry.set(this, void 0);
        __classPrivateFieldSet(this, _WritingKey_key, key, "f");
        __classPrivateFieldSet(this, _WritingKey_value, value, "f");
        __classPrivateFieldSet(this, _WritingKey_expiry, expiry, "f");
    }
    /**
     * Get the key of the event.
     *
     * @return { string }
     */
    get key() {
        return __classPrivateFieldGet(this, _WritingKey_key, "f");
    }
    /**
     * Get the value of the key.
     *
     * @return { * }
     */
    get value() {
        return __classPrivateFieldGet(this, _WritingKey_value, "f");
    }
    /**
     * Get the validity period in milliseconds since Unix Epoch.
     *
     * @return { number | null }
     */
    get expiry() {
        return __classPrivateFieldGet(this, _WritingKey_expiry, "f");
    }
}
_WritingKey_key = new WeakMap(), _WritingKey_value = new WeakMap(), _WritingKey_expiry = new WeakMap();

var _KeyForgotten_key;
class KeyForgotten extends Event {
    /**
     * Create a new Key Forgotten Event instance.
     *
     * @param { string } key
     */
    constructor(key) {
        super('cookie:forgot');
        /**
         * The key of the event.
         *
         * @type { string }
         */
        _KeyForgotten_key.set(this, void 0);
        __classPrivateFieldSet(this, _KeyForgotten_key, key, "f");
    }
    /**
     * Get the key of the event.
     *
     * @return { string }
     */
    get key() {
        return __classPrivateFieldGet(this, _KeyForgotten_key, "f");
    }
}
_KeyForgotten_key = new WeakMap();

var _KeyForgotFailed_key;
class KeyForgotFailed extends Event {
    /**
     * Create a new Key Forgot Failed Event instance.
     *
     * @param { string } key
     */
    constructor(key) {
        super('cookie:forgot-failed');
        /**
         * The key of the event.
         *
         * @type { string }
         */
        _KeyForgotFailed_key.set(this, void 0);
        __classPrivateFieldSet(this, _KeyForgotFailed_key, key, "f");
    }
    /**
     * Get the key of the event.
     *
     * @return { string }
     */
    get key() {
        return __classPrivateFieldGet(this, _KeyForgotFailed_key, "f");
    }
}
_KeyForgotFailed_key = new WeakMap();

var _a, _Cookie_document, _Cookie_ttl, _Cookie_stringify, _Cookie_expires;
class Cookie {
    /**
     * Set the default item validity period in seconds.
     *
     * @param { number | null } value
     */
    static ttl(value) {
        __classPrivateFieldSet(this, _a, value, "f", _Cookie_ttl);
    }
    /**
     * Set the key to the Cookie.
     *
     * @param { string } key
     * @param { * } value
     * @param { CookieAttributes } attributes
     *
     * @returns { string }
     */
    static set(key, value, attributes = {}) {
        var _b, _c, _d, _e, _f;
        let cookie = `${key}=${__classPrivateFieldGet(this, _a, "m", _Cookie_stringify).call(this, value)}`;
        (_b = attributes.ttl) !== null && _b !== void 0 ? _b : (attributes.ttl = __classPrivateFieldGet(this, _a, "f", _Cookie_ttl));
        attributes.expires = __classPrivateFieldGet(this, _a, "m", _Cookie_expires).call(this, attributes.expires);
        if (attributes.ttl && !attributes.expires) {
            attributes.expires = new Date(Date.now() + attributes.ttl * 1000);
        }
        if (attributes.expires) {
            cookie += `; expires=${attributes.expires.toUTCString()}`;
        }
        this.emit(new WritingKey(key, value, (_c = attributes.expires) === null || _c === void 0 ? void 0 : _c.getTime()));
        if (attributes.path) {
            cookie += `; path=${attributes.path}`;
        }
        if (attributes.domain) {
            cookie += `; domain=${attributes.domain}`;
        }
        if (attributes.sameSite) {
            cookie += `; SameSite=${attributes.sameSite}`;
        }
        if (attributes.sameSite === 'None' || attributes.secure) {
            cookie += '; Secure';
        }
        if (attributes.sameSite === 'None' && !attributes.secure) {
            this.emit(new KeyWriteFailed(key, value, (_d = attributes.expires) === null || _d === void 0 ? void 0 : _d.getTime()));
            throw new Error('The "secure" attribute must be set to "true" if "sameSite" is set to "None".');
        }
        if (new Blob([value]).size >= 4 * 1024) {
            this.emit(new KeyWriteFailed(key, value, (_e = attributes.expires) === null || _e === void 0 ? void 0 : _e.getTime()));
            throw new Error('The "value" must be less than 4KB.');
        }
        __classPrivateFieldGet(this, _a, "f", _Cookie_document).cookie = cookie;
        this.emit(new KeyWritten(key, value, (_f = attributes.expires) === null || _f === void 0 ? void 0 : _f.getTime()));
        return cookie;
    }
    /**
     * Get the key from the Cookie.
     *
     * @param { string } key
     * @param { * } fallback
     *
     * @returns { * }
     */
    static get(key, fallback = null) {
        this.emit(new RetrievingKey(key));
        const cookies = new RegExp(`(^|; )${(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))}=([^;]*)`).exec(__classPrivateFieldGet(this, _a, "f", _Cookie_document).cookie);
        if (cookies === null) {
            this.emit(new KeyMissed(key));
            return typeof fallback === 'function' ? fallback() : fallback;
        }
        let value;
        const cookie = cookies[2];
        try {
            value = JSON.parse(cookie);
        }
        catch (_b) {
            value = cookie;
        }
        this.emit(new KeyHit(key, value));
        return value;
    }
    /**
     * Get the key from the Cookie, or execute the given callback and store the result.
     *
     * @param { string } key
     * @param { Function } callback
     * @param { object } attributes
     *
     * @return { any }
     */
    static remember(key, callback, attributes = {}) {
        const cookie = this.get(key);
        if (cookie === null) {
            return this.set(key, callback(), attributes);
        }
        return cookie;
    }
    /**
     * Return all items stored in the Cookie.
     *
     * @return { { key: string, value: any }[] }
     */
    static all() {
        if (__classPrivateFieldGet(this, _a, "f", _Cookie_document).cookie === '') {
            return [];
        }
        let cookies = [];
        for (const cookie of __classPrivateFieldGet(this, _a, "f", _Cookie_document).cookie.split('; ')) {
            const key = cookie.split('=')[0];
            cookies.push({ key, value: this.get(key) });
        }
        return cookies;
    }
    /**
     * Removes a key from the cookie.
     *
     * @param { string } key
     * @param { { path?: string } } attributes
     *
     * @return { boolean }
     */
    static remove(key, attributes = {}) {
        if (this.has(key)) {
            this.set(key, '', Object.assign(Object.assign({}, attributes), { expires: new Date(0) }));
            this.emit(new KeyForgotten(key));
            return true;
        }
        else {
            this.emit(new KeyForgotFailed(key));
            return false;
        }
    }
    /**
     * Clear all keys stored in the Cookie.
     *
     * @param { { path?: string } } attributes
     *
     * @return { void }
     */
    static clear(attributes = {}) {
        this.emit(new StorageFlushing());
        for (const cookie of this.all()) {
            this.remove(cookie.key, attributes);
        }
        this.emit(new StorageFlushed());
    }
    /**
     * Determine if the key exists in the Cookie.
     *
     * @param { string } key
     *
     * @return { boolean }
     */
    static has(key) {
        return !!this.get(key);
    }
    /**
     * Determine if the key does not exist in the Cookie.
     *
     * @param { string } key
     *
     * @return { boolean }
     */
    static missing(key) {
        return !this.has(key);
    }
    /**
     * Determine if any of the keys exists in the Cookie.
     *
     * @param { string | string[] } keys
     *
     * @return { boolean }
     */
    static hasAny(...keys) {
        return keys.flat().some((key) => this.has(key));
    }
    /**
     * Determine if the Cookie is empty.
     *
     * @return { boolean }
     */
    static isEmpty() {
        return __classPrivateFieldGet(this, _a, "f", _Cookie_document).cookie.length === 0;
    }
    /**
     * Determine if the Cookie is not empty.
     *
     * @return { boolean }
     */
    static isNotEmpty() {
        return !this.isEmpty();
    }
    /**
     * Retrieves all keys from the Cookie.
     *
     * @return { string[] }
     */
    static keys() {
        return this.all().map((cookie) => cookie.key);
    }
    /**
     * Returns the total number of items in the Cookie.
     *
     * @return { number }
     */
    static count() {
        return this.all().length;
    }
    /**
     * Updates the item expiration time.
     *
     * @param { string } key
     * @param { number | null } ttl
     * @param { { path?: string } } attributes
     *
     * @return { void | string }
     */
    static touch(key, ttl = null, attributes = {}) {
        const cookie = this.get(key);
        if (cookie === null) {
            return;
        }
        return this.set(key, cookie, Object.assign({ ttl: ttl !== null && ttl !== void 0 ? ttl : __classPrivateFieldGet(this, _a, "f", _Cookie_ttl) }, attributes));
    }
    /**
     * Dump the key from the Cookie.
     *
     * @param { string } key
     *
     * @return { void }
     */
    static dump(key) {
        console.log(this.get(key));
    }
    /**
     * Replace the Cookie instance with a fake.
     *
     * @return { void }
     */
    static fake(location) {
        __classPrivateFieldSet(this, _a, new CookieFake(location), "f", _Cookie_document);
    }
    /**
     * Restore the Cookie instance.
     *
     * @return { void }
     */
    static restore() {
        __classPrivateFieldSet(this, _a, document, "f", _Cookie_document);
    }
    /**
     * Determines whether a "fake" has been set as the Cookie instance.
     *
     * @return { boolean }
     */
    static isFake() {
        return __classPrivateFieldGet(this, _a, "f", _Cookie_document) instanceof CookieFake;
    }
    /**
     * Set the new Location of the Cookie Fake instance.
     *
     * @param { CookieFakeLocation } location
     *
     * @return { void }
     */
    static setFakeLocation(location) {
        if (!this.isFake()) {
            throw new Error('Cookie must be faked before setting location.');
        }
        __classPrivateFieldGet(this, _a, "f", _Cookie_document).location(location);
    }
    static listen(events, listener = null) {
        events = typeof events === 'string' ? { [events]: listener } : events;
        for (const [event, listener] of Object.entries(events)) {
            addEventListener(`cookie:${event}`, listener, { once: true });
        }
    }
    /**
     * Register a listener on "retrieving" event.
     *
     * @param { (event: RetrievingKey) => void } listener
     *
     * @return { void }
     */
    static onRetrieving(listener) {
        this.listen('retrieving', listener);
    }
    /**
     * Register a listener on "hit" event.
     *
     * @param { (event: KeyHit) => void } listener
     *
     * @return { void }
     */
    static onHit(listener) {
        this.listen('hit', listener);
    }
    /**
     * Register a listener on "missed" event.
     *
     * @param { (event: KeyMissed) => void } listener
     *
     * @return { void }
     */
    static onMissed(listener) {
        this.listen('missed', listener);
    }
    /**
     * Register a listener on "writing" event.
     *
     * @param { (event: WritingKey) => void } listener
     *
     * @return { void }
     */
    static onWriting(listener) {
        this.listen('writing', listener);
    }
    /**
     * Register a listener on "written" event.
     *
     * @param { (event: KeyWritten) => void } listener
     *
     * @return { void }
     */
    static onWritten(listener) {
        this.listen('written', listener);
    }
    /**
     * Register a listener on "failed" event.
     *
     * @param { (event: KeyWriteFailed) => void } listener
     *
     * @return { void }
     */
    static onWriteFailed(listener) {
        this.listen('write-failed', listener);
    }
    /**
     * Register a listener on "forgot" event.
     *
     * @param { (event: KeyForgotten) => void } listener
     *
     * @return { void }
     */
    static onForgot(listener) {
        this.listen('forgot', listener);
    }
    /**
     * Register a listener on "forgot-failed" event.
     *
     * @param { (event: KeyForgotFailed) => void } listener
     *
     * @return { void }
     */
    static onForgotFailed(listener) {
        this.listen('forgot-failed', listener);
    }
    /**
     * Register a listener on "flushing" event.
     *
     * @param { (event: StorageFlushing) => void } listener
     *
     * @return { void }
     */
    static onFlushing(listener) {
        this.listen('flushing', listener);
    }
    /**
     * Register a listener on "flushed" event.
     *
     * @param { (event: StorageFlushed) => void } listener
     *
     * @return { void }
     */
    static onFlushed(listener) {
        this.listen('flushed', listener);
    }
    /**
     * Emit an event for the Local Storage instance.
     *
     * @template { keyof CookieEvents } K
     *
     * @param { CookieEvent[K] } event
     *
     * @returns { void }
     */
    static emit(event) {
        dispatchEvent(event);
    }
}
_a = Cookie, _Cookie_stringify = function _Cookie_stringify(value) {
    if (value === null || value === undefined) {
        return '';
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value.toString();
    }
    try {
        return JSON.stringify(value);
    }
    catch (_b) {
        return '';
    }
}, _Cookie_expires = function _Cookie_expires(expires) {
    if (!expires) {
        return undefined;
    }
    if (expires instanceof Date) {
        return expires;
    }
    const date = new Date(expires);
    return Number.isNaN(date.getTime()) ? undefined : date;
};
/**
 * Current Cookie instance.
 *
 * @type { Document | CookieFake }
 */
_Cookie_document = { value: document };
/**
 * Default item validity period in seconds.
 *
 * @type { number | null }
 */
_Cookie_ttl = { value: null };

export { Cookie, CookieFake, KeyForgotFailed, KeyForgotten, KeyHit, KeyMissed, KeyWriteFailed, KeyWritten, RetrievingKey, StorageFlushed, StorageFlushing, WritingKey };
//# sourceMappingURL=main.esm.js.map
