import { Cookie, CookieAttributes } from '../src/main';
import { toHaveCookie } from './setup/matchers';

expect.extend({
    toHaveCookie,
});

type CookieObject = {
    key: string,
    value: string | null,
    expires: string | null,
    domain: string,
    path: string,
    secure: boolean,
    sameSite: string | null
}

let interval: NodeJS.Timeout | number = 0;

class DocumentCookie {
    /**
     * List of all cookies.
     */
    #cookies: CookieObject[] = [];

    /**
     * Create a new Document Cookie instance.
     */
    constructor() {
        interval = setInterval((): void => {
            this.#cookies = this.#cookies.filter((cookie: CookieObject): boolean => {
                return cookie.expires === null || Date.parse(cookie.expires) >= Date.now();
            });
        }, 1000);
    }

    /**
     * Get all cookies.
     */
    get cookie(): string {
        let cookies: string[] = [];
        const domain: string = '.' + location.host.replace('www.', '');
        const path: string = location.pathname.replace(/\/$/, '');

        this.#cookies.forEach((cookie: CookieObject, index: number): void => {
            if (cookie.domain !== domain) {
                return;
            }

            if (cookie.path !== path && cookie.path !== '/') {
                return;
            }

            if (cookie.expires !== null && Date.parse(cookie.expires) < Date.now()) {
                this.#cookies.splice(index, 1);

                return;
            }

            cookies.push(cookie.value !== null ? `${cookie.key}=${cookie.value}` : cookie.key);
        });

        return cookies.join('; ');
    }

    /**
     * Set a cookie.
     */
    set cookie(cookie: string) {
        const keyValue: string = cookie.split(';')[0] ?? '';

        if (keyValue === '') {
            return;
        }

        const key: string = keyValue.split('=')[0] as string;
        const value: string | null = keyValue.split('=')[1] ?? null;
        const ttl: string | null = cookie.match(/max-age=([^;]+);/)?.[1] ?? null;
        let expires: string | null = cookie.match(/expires=([^;]+)/)?.[1] ?? null;
        const domain: string | null = '.' + (cookie.match(/domain=([^;]+);/)?.[1] ?? location.host.replace('www.', ''));
        const path: string | null = cookie.match(/path=([^;]*)/i)?.[1] ?? location.pathname.replace(/\/$/, '');
        const secure: boolean = /secure/i.test(cookie);
        const sameSite: string | null = cookie.match(/samesite=([^;]*)/i)?.[1] ?? null;

        if (expires === null && ttl !== null) {
            expires = new Date(new Date().getTime() + (ttl as unknown as number) * 1000).toUTCString();
        }

        const expired: boolean = expires !== null && Date.parse(expires) < Date.now();

        const data: CookieObject = {
            key,
            value,
            expires,
            domain,
            path,
            secure,
            sameSite,
        };

        const existing: number = this.#cookies.findIndex((cookie: CookieObject): boolean => cookie.key === key && cookie.path === path && cookie.domain === domain);

        if (existing >= 0) {
            if (expired) {
                this.#cookies.splice(existing, 1);
            } else {
                this.#cookies[existing] = data;
            }
        } else {
            this.#cookies.push(data);
        }
    }
}

class Location {
    /**
     * A stringifier that returns a string containing the entire URL
     */
    #href: string;

    /**
     * A string containing the protocol scheme of the URL, including the final ':'.
     */
    #protocol: string;

    /**
     * A string containing the host, that is the hostname, a ':', and the port of the URL.
     */
    #host: string;

    /**
     * A string containing the domain of the URL.
     */
    #hostname: string;

    /**
     * A string containing the port number of the URL.
     */
    #port: string;

    /**
     * A string containing an initial '/' followed by the path of the URL, not including the query string or fragment.
     */
    #pathname: string;

    /**
     * A string containing a '?' followed by the parameters or "query string" of the URL.
     */
    #search: string;

    /**
     * A string containing a '#' followed by the fragment identifier of the URL.
     */
    #hash: string;

    /**
     * Returns a string containing the canonical form of the origin of the specific location.
     */
    readonly #origin: string;

    /**
     * Create a new Location instance.
     */
    constructor(href: string) {
        const url: URL = new URL(href);

        this.#href = url.href;
        this.#protocol = url.protocol;
        this.#host = url.host;
        this.#hostname = url.hostname;
        this.#port = url.port;
        this.#pathname = url.pathname;
        this.#search = url.search;
        this.#hash = url.hash;
        this.#origin = url.origin;
    }

    /**
     * Get the href.
     */
    get href(): string {
        return this.#href;
    }

    /**
     * Set the href.
     */
    set href(value: string) {
        this.#href = value;
    }

    /**
     * Get the protocol.
     */
    get protocol(): string {
        return this.#protocol;
    }

    /**
     * Set the protocol.
     */
    set protocol(value: string) {
        this.#protocol = value;
    }

    /**
     * Get the host.
     */
    get host(): string {
        return this.#host;
    }

    /**
     * Set the host.
     */
    set host(value: string) {
        this.#host = value;
    }

    /**
     * Get the hostname.
     */
    get hostname(): string {
        return this.#hostname;
    }

    /**
     * Set the hostname.
     */
    set hostname(value: string) {
        this.#hostname = value;
    }

    /**
     * Get the port.
     */
    get port(): string {
        return this.#port;
    }

    /**
     * Set the port.
     */
    set port(value: string) {
        this.#port = value;
    }

    /**
     * Get the pathname.
     */
    get pathname(): string {
        return this.#pathname;
    }

    /**
     * Set the pathname.
     */
    set pathname(value: string) {
        this.#pathname = value;
    }

    /**
     * Get the search.
     */
    get search(): string {
        return this.#search;
    }

    /**
     * Set the search.
     */
    set search(value: string) {
        this.#search = value;
    }

    /**
     * Get the hash.
     */
    get hash(): string {
        return this.#hash;
    }

    /**
     * Set the hash.
     */
    set hash(value: string) {
        this.#hash = value;
    }

    /**
     * Get the origin.
     */
    get origin(): string {
        return this.#origin;
    }

    /**
     * Loads the resource at the URL provided in parameter.
     */
    assign(url: string): void {
        const location: Location = new Location(url);

        this.href = location.href;
        this.host = location.host;
        this.hostname = location.hostname;
        this.port = location.port;
        this.href = location.href;
        this.pathname = location.pathname;
        this.protocol = location.protocol;
        this.search = location.search;
        this.hash = location.hash;
    }

    /**
     * Replaces the current resource with the one at the provided URL (redirects to the provided URL).
     */
    replace(url: string): void {
        const location: Location = new Location(url);

        this.href = location.href;
        this.host = location.host;
        this.hostname = location.hostname;
        this.port = location.port;
        this.href = location.href;
        this.pathname = location.pathname;
        this.protocol = location.protocol;
        this.search = location.search;
        this.hash = location.hash;
    }

    /**
     * Reloads the current URL, like the Refresh button.
     */
    reload(): void {
        return;
    }

    /**
     * Returns a string containing the whole URL.
     */
    toString(): string {
        return this.href;
    }

    /**
     * Get all location properties as an object.
     */
    toObject(): Record<string, string> {
        return {
            href    : this.href,
            protocol: this.protocol,
            host    : this.host,
            hostname: this.hostname,
            port    : this.port,
            pathname: this.pathname,
            search  : this.search,
            hash    : this.hash,
            origin  : this.origin,
        };
    }
}

beforeEach((): void => {
    (global as any).document = new DocumentCookie;
    (global as any).location = new Location('https://example.com');

    Cookie.ttl(null);

    clearInterval(interval);
});

describe('Cookie.ttl', (): void => {
    test('sets default validity period', (): void => {
        jest.useFakeTimers();

        Cookie.ttl(60);

        const key: string = '$key';
        const value: string = '$value';
        const cookie: string = Cookie.set(key, value);
        const current: number = Math.floor(Date.now() / 1000) * 1000; // Get time before setting cookie and round to nearest second
        const expires: RegExpMatchArray = cookie.match(/expires=([^;]+)/) as RegExpMatchArray;
        const date: number = new Date(expires[1]!).getTime();

        expect(document.cookie).toHaveCookie(key, value);
        expect(cookie).toMatch(/expires=([^;]+)/);
        expect(date).toBe(current + 60 * 1000);

        jest.advanceTimersByTime(60 * 1000);

        expect(document.cookie).not.toHaveCookie(key, value);

        jest.useRealTimers();
    });

    test('sets default validity period to null', (): void => {
        Cookie.ttl(null);

        const key: string = '$key';
        const value: string = '$value';
        const cookie: string = Cookie.set(key, value);

        expect(document.cookie).toHaveCookie(key, value);
        expect(cookie).not.toMatch(/expires=([^;]+)/);
    });
});

describe('Cookie.set', (): void => {
    test('sets the key with string value to the Cookie object', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        Cookie.set(key, value);

        expect(document.cookie).toHaveCookie(key, value);
    });

    test('sets the key with number value to the Cookie object', (): void => {
        const key: string = '$key';
        const value: number = 42;

        Cookie.set(key, value);

        expect(document.cookie).toHaveCookie(key, value);
    });

    test('sets the key with boolean value to the Cookie object', (): void => {
        const key: string = '$key';
        const value: boolean = true;

        Cookie.set(key, value);

        expect(document.cookie).toHaveCookie(key, value);
    });

    test('sets the key with object value to the Cookie object', (): void => {
        const key: string = '$key';
        const value: object = { data: '$value' };

        Cookie.set(key, value);

        expect(document.cookie).toHaveCookie(key, value);
    });

    test('sets the key with array value to the Cookie object', (): void => {
        const key: string = '$key';
        const value: object = ['$value'];

        Cookie.set(key, value);

        expect(document.cookie).toHaveCookie(key, value);
    });

    test('sets the key with null value to the Cookie object', (): void => {
        const key: string = '$key';
        const value: null = null;

        Cookie.set(key, value);

        expect(document.cookie).toHaveCookie(key, value);
    });

    test('sets the key with undefined value to the Cookie object', (): void => {
        const key: string = '$key';
        const value: undefined = undefined;

        Cookie.set(key, value);

        expect(document.cookie).toHaveCookie(key, value);
    });

    test('sets the key with ttl attribute to the Cookie object', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 60;
        const current: number = Math.floor(Date.now() / 1000) * 1000;
        const cookie: string = Cookie.set(key, value, { ttl });
        const expires: RegExpMatchArray = cookie.match(/expires=([^;]+)/) as RegExpMatchArray;
        const date: number = new Date(expires[1]!).getTime();

        expect(document.cookie).toHaveCookie(key, value);
        expect(cookie).toMatch(/expires=([^;]+)/);
        expect(date).toBe(current + ttl * 1000);
    });

    test('sets the key with expires Date attribute to the Cookie object', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const expires: Date = new Date(Date.now() + 3600 * 1000);
        const cookie: string = Cookie.set(key, value, { expires });

        expect(document.cookie).toHaveCookie(key, value);
        expect(cookie).toContain(`expires=${expires.toUTCString()}`);
    });

    test('sets the key with expires string attribute to the Cookie object', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const expires: Date = new Date(Date.now() + 3600 * 1000);

        const cookie: string = Cookie.set(key, value, { expires: expires.toISOString() });

        expect(document.cookie).toHaveCookie(key, value);
        expect(cookie).toMatch(/expires=[^;]+/);
        expect(cookie).toContain(`expires=${expires.toUTCString()}`);
    });

    test('sets the key with path attribute to the Cookie object', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const cookie: string = Cookie.set(key, value, { path: '/test' });

        location.assign('https://example.com/test');

        expect(document.cookie).toHaveCookie(key, value);
        expect(cookie).toContain(`path=/test`);
    });

    test('sets the key with domain attribute to the Cookie object', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const cookie: string = Cookie.set(key, value, { domain: 'example.com' });

        expect(document.cookie).toHaveCookie(key, value);
        expect(cookie).toContain(`domain=example.com`);
    });

    test('sets the key with sameSite="Strict" attribute to the Cookie object', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const cookie: string = Cookie.set(key, value, { sameSite: 'Strict' });

        expect(document.cookie).toHaveCookie(key, value);
        expect(cookie).toContain('SameSite=Strict');
        expect(cookie).not.toContain('Secure');
    });

    test('sets the key with sameSite="Lax" attribute to the Cookie object', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const cookie: string = Cookie.set(key, value, { sameSite: 'Lax' });

        expect(document.cookie).toHaveCookie(key, value);
        expect(cookie).toContain('SameSite=Lax');
        expect(cookie).not.toContain('Secure');
    });

    test('sets the key with sameSite="None" and secure="true" attributes to the Cookie object', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const cookie: string = Cookie.set(key, value, { sameSite: 'None', secure: true });

        expect(document.cookie).toHaveCookie(key, value);
        expect(cookie).toContain('SameSite=None');
        expect(cookie).toContain('Secure');
    });

    test('throws an error if sameSite="None" is set without secure=true', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        expect((): string => Cookie.set(key, value, { sameSite: 'None' })).toThrow('The "secure" attribute must be set to "true" if "sameSite" is set to "None".');
    });

    test('sets the key with secure attribute to the Cookie object', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const cookie: string = Cookie.set(key, value, { secure: true });

        expect(document.cookie).toHaveCookie(key, value);
        expect(cookie).toContain('Secure');
    });

    test('sets the key with multiple attributes to the Cookie object', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const attributes: CookieAttributes = {
            ttl     : 60,
            path    : '/admin',
            domain  : 'example.com',
            sameSite: 'Strict',
            secure  : true
        };

        location.assign('https://example.com/admin');

        const cookie: string = Cookie.set(key, value, attributes);

        expect(document.cookie).toHaveCookie(key, value);
        expect(cookie).toMatch(/expires=[^;]+/);
        expect(cookie).toContain('path=/admin');
        expect(cookie).toContain('domain=example.com');
        expect(cookie).toContain('SameSite=Strict');
        expect(cookie).toContain('Secure');
    });
});

describe('Cookie.get', (): void => {
    test('returns null for non-existent cookie', (): void => {
        expect(Cookie.get('key')).toBeNull();
    });

    test('gets string value from cookie', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        Cookie.set(key, value);

        expect(Cookie.get(key)).toBe(value);
    });

    test('gets number value from cookie', (): void => {
        const key: string = '$key';
        const value: number = 42;

        Cookie.set(key, value);

        expect(Cookie.get(key)).toBe(value);
    });

    test('gets boolean value from cookie', (): void => {
        const key: string = '$key';
        const value: boolean = true;

        Cookie.set(key, value);

        expect(Cookie.get(key)).toBe(true);
    });

    test('gets object value from cookie', (): void => {
        const key: string = '$key';
        const value: object = { name: 'test', id: 1 };

        Cookie.set(key, value);

        expect(Cookie.get(key)).toEqual(value);
    });

    test('gets array value from cookie', (): void => {
        const key: string = '$key';
        const value: Array<string | number | boolean> = [1, 'two', false];

        Cookie.set(key, value);

        expect(Cookie.get(key)).toEqual(value);
    });

    test('gets null value from cookie', (): void => {
        const key: string = '$key';

        Cookie.set(key, null);

        expect(Cookie.get(key)).toBeNull();
    });

    test('returns raw string when JSON parsing fails', (): void => {
        const key: string = '$key';
        const value: string = '{ invalid: json }';

        Cookie.set(key, value);

        expect(Cookie.get(key)).toBe(value);
    });

    test('handles encoded cookie values', (): void => {
        const key: string = '$key';
        const value: string = 'test value with spaces';

        Cookie.set(key, value);

        expect(Cookie.get(key)).toBe(value);
    });

    test('gets cookie when multiple cookies exist', (): void => {
        const key1 = '$key1';
        const value1 = '$value1';
        const key2 = '$key2';
        const value2 = '$value2';

        Cookie.set(key1, value1);
        Cookie.set(key2, value2);

        expect(Cookie.get(key1)).toBe(value1);
        expect(Cookie.get(key2)).toBe(value2);
    });

    test('gets cookie with special characters', (): void => {
        const key: string = '$key';
        const value: string = 'test@value$with%special&chars';

        Cookie.set(key, value);

        expect(Cookie.get(key)).toBe(value);
    });

    test('returns fallback value if key does not exist in the Cookie object', (): void => {
        const key: string = '$key';
        const fallback: string = 'fallback';

        expect(Cookie.get(key, fallback)).toEqual(fallback);
    });

    test('returns fallback function result if key does not exist in the Cookie object', (): void => {
        expect(Cookie.get('$key', (): string => 'fallback')).toEqual('fallback');
    });
});

describe('Cookie.remember', (): void => {
    test('executes callback and stores cookie when key does not exist', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const callback: jest.Mock = jest.fn((): string => value);

        const cookie: any = Cookie.remember(key, callback);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(cookie).toHaveCookie(key, value);
        expect(Cookie.get(key)).toBe(value);
    });

    test('returns existing value without executing callback when key exists', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const callback: jest.Mock = jest.fn((): string => 'new value');

        Cookie.set(key, value);

        const cookie: any = Cookie.remember(key, callback);

        expect(callback).not.toHaveBeenCalled();
        expect(cookie).toBe(value);
        expect(Cookie.get(key)).toBe(value);
    });

    test('stores cookie with attributes when key does not exist', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const attributes: CookieAttributes = { ttl: 60, path: '/test', secure: true };
        const callback: jest.Mock = jest.fn((): string => value);

        location.assign('https://example.com/test');

        const cookie: any = Cookie.remember(key, callback, attributes);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(cookie).toHaveCookie(key, value);
        expect(Cookie.get(key)).toBe(value);
        expect(cookie).toMatch(/expires=[^;]+/);
        expect(cookie).toContain('path=/test');
        expect(cookie).toContain('Secure');
    });
});

describe('Cookie.all', (): void => {
    test('retrieves all items from the Cookie object', (): void => {
        const key1: string = '$key1';
        const value1: string = '$value1';

        Cookie.set(key1, value1);

        const key2: string = '$key2';
        const value2: string = '$value2';

        Cookie.set(key2, value2);

        const items: { key: string, value: any }[] = Cookie.all();

        expect(items.length).toBe(2);
        expect((items[0] as { key: string, value: any }).value).toEqual(value1);
        expect((items[1] as { key: string, value: any }).value).toEqual(value2);
    });

    test('retrieves an empty object if the Cookie object is empty', (): void => {
        const items: Record<string, any> = Cookie.all();

        expect(items).toEqual([]);
    });
});

describe('Cookie.clear', (): void => {
    test('clears all keys from the Cookie object', (): void => {
        const key1: string = '$key1';
        const value1: string = '$value1';

        Cookie.set(key1, value1);

        const key2: string = '$key2';
        const value2: string = '$value2';

        Cookie.set(key2, value2);

        Cookie.clear();

        expect(Cookie.get(key1)).toEqual(null);
        expect(Cookie.get(key2)).toEqual(null);
    });

    test('clears all keys from the Cookie object with path attribute', (): void => {
        const key1: string = '$key1';
        const value1: string = '$value1';

        Cookie.set(key1, value1);

        const key2: string = '$key2';
        const value2: string = '$value2';

        Cookie.set(key2, value2, { path: '/test' });

        Cookie.clear({ path: '/test' });

        expect(Cookie.get(key1)).toEqual(value1);
        expect(Cookie.get(key2)).toEqual(null);
    });

    test('does nothing if the Cookie object is already empty', (): void => {
        Cookie.clear();

        expect(document.cookie.length).toBe(0);
    });
});

describe('Cookie.has', (): void => {
    test('returns true if the key exists in the Cookie object', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        Cookie.set(key, value);

        expect(Cookie.has(key)).toEqual(true);
    });

    test('returns false if the key does not exist in the Cookie object', (): void => {
        const key: string = '$key';

        expect(Cookie.has(key)).toEqual(false);
    });

    test('returns false if the item has expired', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = -60;

        Cookie.set(key, value, { ttl });

        expect(Cookie.has(key)).toEqual(false);
    });

    test('returns true for items with no expiry', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        Cookie.set(key, value);

        expect(Cookie.has(key)).toEqual(true);
    });

    test('returns false for an empty Storage', (): void => {
        Cookie.clear();

        const key: string = '$key';

        expect(Cookie.has(key)).toEqual(false);
    });
});

describe('Cookie.hasAny', (): void => {
    test('returns true if at least one of the keys exists in the Cookie object', (): void => {
        const key1: string = '$key1';
        const value1: string = '$value1';

        Cookie.set(key1, value1);

        const key2: string = '$key2';
        const value2: string = '$value2';

        Cookie.set(key2, value2);

        expect(Cookie.hasAny([key1, key2])).toEqual(true);
    });

    test('returns false if none of the keys exist in the Cookie object', (): void => {
        const key1: string = '$key1';
        const key2: string = '$key2';

        expect(Cookie.hasAny([key1, key2])).toEqual(false);
    });

    test('returns true if at least one of the keys exists in the Cookie object when provided as individual arguments', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        Cookie.set(key, value);


        expect(Cookie.hasAny(key, 'anotherKey')).toEqual(true);
    });

    test('returns false if none of the keys exist in the Cookie object when provided as individual arguments', (): void => {
        const key1: string = '$key1';
        const key2: string = '$key2';

        expect(Cookie.hasAny(key1, key2)).toEqual(false);
    });

    test('returns true if at least one of the keys exists when some keys are expired', (): void => {
        const key1: string = '$key1';
        const value1: string = '$value1';
        const ttl: number = -60;

        Cookie.set(key1, value1, { ttl });

        const key2: string = '$key2';
        const value2: string = '$value2';

        Cookie.set(key2, value2);

        expect(Cookie.hasAny([key1, key2])).toEqual(true);
    });

    test('returns false if none of the keys exist or are valid', (): void => {
        const key1: string = '$key1';
        const value1: string = '$value1';
        const ttl: number = -60;

        Cookie.set(key1, value1, { ttl });

        const key2: string = '$key2';

        expect(Cookie.hasAny([key1, key2])).toEqual(false);
    });
});

describe('Cookie.isEmpty', (): void => {
    test('returns true if Storage is empty', (): void => {
        Cookie.clear();

        expect(Cookie.isEmpty()).toEqual(true);
    });

    test('returns false if Storage has items', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        Cookie.set(key, value);

        expect(Cookie.isEmpty()).toEqual(false);
    });
});

describe('Cookie.isNotEmpty', (): void => {
    test('returns true if Storage has items', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        Cookie.set(key, value);

        expect(Cookie.isNotEmpty()).toEqual(true);
    });

    test('returns false if Storage is empty', (): void => {
        Cookie.clear();

        expect(Cookie.isNotEmpty()).toEqual(false);
    });
});

describe('Cookie.keys', (): void => {
    test('retrieves all keys from the Cookie object', (): void => {
        const key1: string = '$key1';
        const value1: string = '$value1';

        Cookie.set(key1, value1);

        const key2: string = '$key2';
        const value2: string = '$value2';

        Cookie.set(key2, value2);

        const keys: string[] = Cookie.keys();

        expect(keys).toContain(key1);
        expect(keys).toContain(key2);

        expect(keys.length).toBe(2);
    });

    test('returns an empty array if the Cookie object is empty', (): void => {
        Cookie.clear();

        expect(Cookie.keys()).toEqual([]);
    });
});

describe('Cookie.count', (): void => {
    test('returns the total number of items in the Cookie object', (): void => {
        const key1: string = '$key1';
        const value1: string = '$value1';

        Cookie.set(key1, value1);

        const key2: string = '$key2';
        const value2: string = '$value2';

        Cookie.set(key2, value2);

        expect(Cookie.count()).toBe(2);
    });

    test('returns 0 if the Cookie object is empty', (): void => {
        Cookie.clear();

        expect(Cookie.count()).toBe(0);
    });
});

describe('Cookie.touch', (): void => {
    test('updates the cookie expiration time', (): void => {
        jest.useFakeTimers();

        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 60;

        Cookie.set(key, value);
        Cookie.touch(key, ttl);

        jest.advanceTimersByTime(1000 * ttl);

        expect(Cookie.get(key)).not.toEqual(value);
    });

    test('updates the cookie expiration time with path attribute', (): void => {
        jest.useFakeTimers();

        const key1: string = '$key1';
        const value1: string = '$value1';
        const key2: string = '$key2';
        const value2: string = '$value2';
        const ttl: number = 60;

        Cookie.set(key1, value1);
        Cookie.set(key2, value2, { path: '/test' });
        Cookie.touch(key2, ttl, { path: '/test' });

        jest.advanceTimersByTime(1000 * ttl);

        expect(Cookie.get(key1)).toEqual(value1);
        expect(Cookie.get(key2)).not.toEqual(value2);
    });

    test('does not update expiration if item does not exist', (): void => {
        const key: string = '$key';

        Cookie.touch(key, 60);

        expect(Cookie.get(key)).toEqual(null);
    });

    test('uses default TTL if provided TTL is null', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 60;

        Cookie.set(key, value);
        Cookie.ttl(ttl);
        Cookie.touch(key);

        jest.advanceTimersByTime(1000 * ttl);

        expect(Cookie.get(key)).not.toEqual(value);
    });
});

describe('Cookie.dump', (): void => {
    it('logs the stored cookie to the console', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const $console: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]]> = jest.spyOn(console, 'log').mockImplementation();

        Cookie.set(key, value);
        Cookie.dump(key);

        expect($console).toHaveBeenCalledWith(value);

        $console.mockRestore();
    });
});
