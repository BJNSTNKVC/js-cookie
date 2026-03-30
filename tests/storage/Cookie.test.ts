import {
    Cookie,
    CookieAttributes,
    CookieEvent,
    KeyForgotFailed,
    KeyForgotten,
    KeyHit,
    KeyMissed,
    KeyWriteFailed,
    KeyWritten,
    RetrievingKey,
    StorageFlushed,
    StorageFlushing,
    WritingKey
} from '../../src/main';

// @ts-expect-error
const emit: typeof Cookie.emit = Cookie.emit;

// Returns the first event emitted by the listener from the mock call stack.
const getEventFromMockCalls: (listener: jest.Mock) => CookieEvent[keyof CookieEvent] = (listener: jest.Mock) => listener.mock.calls[0][0];

let events: Map<string, Event> = new Map();

beforeEach((): void => {
    Cookie.ttl(null);
    Cookie.fake();
    // @ts-expect-error
    Cookie.emit = jest.fn((event: Event) => events.set(event.type, event));
});

afterEach((): void => {
    Cookie.clear();
    Cookie.restore();

    events.clear();
});

describe('Cookie.ttl', (): void => {
    test('sets default validity period', (): void => {
        Cookie.ttl(60);

        const key: string = '$key';
        const value: string = '$value';
        const cookie: string = Cookie.set(key, value);
        const current: number = Math.floor(Date.now() / 1000) * 1000;
        const expires: RegExpMatchArray = cookie.match(/expires=([^;]+)/) as RegExpMatchArray;
        const date: number = new Date(expires[1] as string).getTime();

        expect(Cookie.get(key)).toBe(value);
        expect(cookie).toMatch(/expires=([^;]+)/);
        expect(date).toBeCloseTo(current + 60 * 1000, -2);
    });

    test('sets default validity period to null', (): void => {
        Cookie.ttl(null);

        const key: string = '$key';
        const value: string = '$value';
        const cookie: string = Cookie.set(key, value);

        expect(Cookie.get(key)).toBe(value);
        expect(cookie).not.toMatch(/expires=([^;]+)/);
    });
});

describe('Cookie.set', (): void => {
    test('sets the key with string value to the Cookie object', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        Cookie.set(key, value);

        expect(Cookie.get(key)).toBe(value);
    });

    test('sets the key with number value to the Cookie object', (): void => {
        const key: string = '$key';
        const value: number = 42;

        Cookie.set(key, value);

        expect(Cookie.get(key)).toBe(value);
    });

    test('sets the key with boolean value to the Cookie object', (): void => {
        const key: string = '$key';
        const value: boolean = true;

        Cookie.set(key, value);

        expect(Cookie.get(key)).toBe(value);
    });

    test('sets the key with object value to the Cookie object', (): void => {
        const key: string = '$key';
        const value: object = { data: '$value' };

        Cookie.set(key, value);

        expect(Cookie.get(key)).toStrictEqual(value);
    });

    test('sets the key with array value to the Cookie object', (): void => {
        const key: string = '$key';
        const value: object = ['$value'];

        Cookie.set(key, value);

        expect(Cookie.get(key)).toStrictEqual(value);
    });

    test('sets the key with null value to the Cookie object as an empty string', (): void => {
        const key: string = '$key';
        const value: null = null;

        Cookie.set(key, value);

        expect(Cookie.get(key)).toBe('');
    });

    test('sets the key with undefined value to the Cookie object as an empty string', (): void => {
        const key: string = '$key';
        const value: undefined = undefined;

        Cookie.set(key, value);

        expect(Cookie.get(key)).toBe('');
    });

    test('sets the key with ttl attribute to the Cookie object', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 60;
        const current: number = Math.floor(Date.now() / 1000) * 1000;
        const cookie: string = Cookie.set(key, value, { ttl });
        const expires: RegExpMatchArray = cookie.match(/expires=([^;]+)/) as RegExpMatchArray;
        const date: number = new Date(expires[1]!).getTime();

        expect(Cookie.get(key)).toBe(value);
        expect(cookie).toMatch(/expires=([^;]+)/);
        expect(date).toBeCloseTo(current + ttl * 1000, -2);
    });

    test('sets the key with expires Date attribute to the Cookie object', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const expires: Date = new Date(Date.now() + 3600 * 1000);
        const cookie: string = Cookie.set(key, value, { expires });

        expect(Cookie.get(key)).toBe(value);
        expect(cookie).toContain(`expires=${expires.toUTCString()}`);
    });

    test('sets the key with expires string attribute to the Cookie object', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const expires: Date = new Date(Date.now() + 3600 * 1000);

        const cookie: string = Cookie.set(key, value, { expires: expires.toISOString() });

        expect(Cookie.get(key)).toBe(value);
        expect(cookie).toMatch(/expires=[^;]+/);
        expect(cookie).toContain(`expires=${expires.toUTCString()}`);
    });

    test('sets the key with path attribute to the Cookie object', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const cookie: string = Cookie.set(key, value, { path: '/test' });

        expect(cookie).toContain(`path=/test`);
    });

    test('sets the key with domain attribute to the Cookie object', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const cookie: string = Cookie.set(key, value, { domain: 'example.com' });

        expect(cookie).toContain(`domain=example.com`);
    });

    test('sets the key with sameSite="Strict" attribute to the Cookie object', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const cookie: string = Cookie.set(key, value, { sameSite: 'Strict' });

        expect(Cookie.get(key)).toBe(value);
        expect(cookie).toContain('SameSite=Strict');
        expect(cookie).not.toContain('Secure');
    });

    test('sets the key with sameSite="Lax" attribute to the Cookie object', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const cookie: string = Cookie.set(key, value, { sameSite: 'Lax' });

        expect(Cookie.get(key)).toBe(value);
        expect(cookie).toContain('SameSite=Lax');
        expect(cookie).not.toContain('Secure');
    });

    test('sets the key with sameSite="None" and secure="true" attributes to the Cookie object', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const cookie: string = Cookie.set(key, value, { sameSite: 'None', secure: true });

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

        const cookie: string = Cookie.set(key, value, attributes);

        expect(cookie).toMatch(/expires=[^;]+/);
        expect(cookie).toContain('path=/admin');
        expect(cookie).toContain('domain=example.com');
        expect(cookie).toContain('SameSite=Strict');
        expect(cookie).toContain('Secure');
    });

    test('handles circular reference in value gracefully', (): void => {
        const key: string = '$key';
        const value: any = { name: 'test' };

        value.self = value;

        const cookie: string = Cookie.set(key, value);

        expect(cookie).toContain(`${key}=`);
    });

    test('throws an error when the cookie value exceeds 4KB', (): void => {
        const key: string = '$key';
        const value: string = 'x'.repeat(4 * 1024);

        expect((): string => Cookie.set(key, value)).toThrow('The "value" must be less than 4KB.');
    });

    test('emits WritingKey event before setting the value', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 60;
        const now: number = Date.now();

        Cookie.set(key, value, { ttl });

        const event: WritingKey = events.get('cookie:writing') as WritingKey;

        expect(events.has('cookie:writing')).toBeTruthy();
        expect(event).toBeInstanceOf(WritingKey);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
        expect(event.expiry).toBeCloseTo(now + ttl * 1000, -2);
    });

    test('emits KeyWritten event after successful set operation', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 60;
        const now: number = Date.now();

        Cookie.set(key, value, { ttl });

        const event: KeyWritten = events.get('cookie:written') as KeyWritten;

        expect(events.has('cookie:written')).toBeTruthy();
        expect(event).toBeInstanceOf(KeyWritten);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
        expect(event.expiry).toBeCloseTo(now + ttl * 1000, -2);
    });

    test('emits KeyWriteFailed event when the cookie value exceeds 4KB', (): void => {
        const key: string = '$key';
        const value: string = 'x'.repeat(4 * 1024);

        try {
            Cookie.set(key, value);
        } catch {
            // expected throw
        }

        const event: KeyWriteFailed = events.get('cookie:write-failed') as KeyWriteFailed;

        expect(events.has('cookie:write-failed')).toBeTruthy();
        expect(event).toBeInstanceOf(KeyWriteFailed);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
    });

    test('emits KeyWriteFailed event when sameSite="None" is used without secure=true', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        try {
            Cookie.set(key, value, { sameSite: 'None' });
        } catch {
            // expected throw
        }

        const event: KeyWriteFailed = events.get('cookie:write-failed') as KeyWriteFailed;

        expect(events.has('cookie:write-failed')).toBeTruthy();
        expect(event).toBeInstanceOf(KeyWriteFailed);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
    });
});

describe('Cookie.get', (): void => {
    test('returns null for non-existent cookie', (): void => {
        expect(Cookie.get('$key')).toBeNull();
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

    test('gets null value as an empty string from cookie', (): void => {
        const key: string = '$key';

        Cookie.set(key, null);

        expect(Cookie.get(key)).toBe('');
    });

    test('gets undefined value as an empty string from cookie', (): void => {
        const key: string = '$key';

        Cookie.set(key, undefined);

        expect(Cookie.get(key)).toBe('');
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
        const key1: string = '$key1';
        const value1: string = '$value1';
        const key2: string = '$key2';
        const value2: string = '$value2';

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

        Cookie.remember(key, callback);

        expect(callback).toHaveBeenCalledTimes(1);
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

        const cookie: any = Cookie.remember(key, callback, attributes);

        expect(callback).toHaveBeenCalledTimes(1);
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

    test('retrieves an empty array if the Cookie object is empty', (): void => {
        const items: Record<string, any> = Cookie.all();

        expect(items).toEqual([]);
    });
});

describe('Cookie.remove', (): void => {
    test('removes the key from the Cookie object', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        Cookie.set(key, value);

        const result: boolean = Cookie.remove(key);

        expect(result).toBeTruthy();
        expect(Cookie.get(key)).toBeNull();
    });

    test('does nothing if the key does not exist in the Cookie object', (): void => {
        const key: string = '$key';

        const result: boolean = Cookie.remove(key);

        expect(result).toBeFalsy();
        expect(Cookie.get(key)).toBeNull();
    });

    test('emits KeyForgotten event after successful remove operation', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        Cookie.set(key, value);
        Cookie.remove(key);

        const event: KeyForgotten = events.get('cookie:forgot') as KeyForgotten;

        expect(events.has('cookie:forgot')).toBeTruthy();
        expect(event).toBeInstanceOf(KeyForgotten);
        expect(event.key).toBe(key);
    });

    test('emits KeyForgotFailed event when removal operation fails', (): void => {
        const key: string = '$key';

        Cookie.remove(key);

        const event: KeyForgotFailed = events.get('cookie:forgot-failed') as KeyForgotFailed;

        expect(events.has('cookie:forgot-failed')).toBeTruthy();
        expect(event).toBeInstanceOf(KeyForgotFailed);
        expect(event.key).toBe(key);
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

        expect(Cookie.isEmpty()).toBe(true);
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

    test('returns false for an empty storage', (): void => {
        Cookie.clear();

        const key: string = '$key';

        expect(Cookie.has(key)).toEqual(false);
    });
});

describe('Cookie.missing', (): void => {
    test('returns true if the key does not exist in Storage', (): void => {
        const key: string = '$key';

        expect(Cookie.missing(key)).toBeTruthy();
    });

    test('returns false if the key exists in Storage', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        Cookie.set(key, value);

        expect(Cookie.missing(key)).toBeFalsy();
    });
});

describe('Cookie.hasAny', (): void => {
    test('returns true if at least one of the keys exists in the Cookie object', (): void => {
        const key1: string = '$key1';
        const value1: string = '$value1';

        Cookie.set(key1, value1);

        expect(Cookie.hasAny([key1, '$key2'])).toEqual(true);
    });

    test('returns false if none of the keys exist in the Cookie object', (): void => {
        expect(Cookie.hasAny(['$key1', '$key2'])).toEqual(false);
    });

    test('returns true if at least one of the keys exists when provided as individual arguments', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        Cookie.set(key, value);

        expect(Cookie.hasAny(key, '$anotherKey')).toEqual(true);
    });

    test('returns false if none of the keys exist when provided as individual arguments', (): void => {
        expect(Cookie.hasAny('$key1', '$key2')).toEqual(false);
    });

    test('returns true if at least one of the keys exists when some keys are expired', (): void => {
        const key1: string = '$key1';
        const value1: string = '$value1';

        Cookie.set(key1, value1, { ttl: -60 });

        const key2: string = '$key2';
        const value2: string = '$value2';

        Cookie.set(key2, value2);

        expect(Cookie.hasAny([key1, key2])).toEqual(true);
    });

    test('returns false if none of the keys exist or are valid', (): void => {
        const key1: string = '$key1';

        Cookie.set(key1, '$value1', { ttl: -60 });

        expect(Cookie.hasAny([key1, '$key2'])).toEqual(false);
    });
});

describe('Cookie.isEmpty', (): void => {
    test('returns true if storage is empty', (): void => {
        Cookie.clear();

        expect(Cookie.isEmpty()).toEqual(true);
    });

    test('returns false if storage has items', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        Cookie.set(key, value);

        expect(Cookie.isEmpty()).toEqual(false);
    });
});

describe('Cookie.isNotEmpty', (): void => {
    test('returns true if storage has items', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        Cookie.set(key, value);

        expect(Cookie.isNotEmpty()).toEqual(true);
    });

    test('returns false if storage is empty', (): void => {
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
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 60;

        Cookie.set(key, value);

        const cookie: string = Cookie.touch(key, ttl) as string;

        expect(cookie).toMatch(/expires=([^;]+)/);
    });

    test('updates the cookie expiration time with path attribute', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 60;

        Cookie.set(key, value);
        Cookie.set(key, value, { path: '/test' });
        Cookie.touch(key, ttl, { path: '/test' });

        expect(Cookie.get(key)).toEqual(value);
        expect(Cookie.get(key)).not.toMatch(/expires=([^;]+)/);
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

        const cookie: string = Cookie.touch(key, null) as string;

        expect(cookie).toMatch(/expires=([^;]+)/);
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

describe('Cookie.fake', (): void => {
    test('sets fake as storage instance', (): void => {
        Cookie.fake();

        expect(Cookie.isFake()).toBeTruthy();
    });

    test('accepts location parameter', (): void => {
        Cookie.fake({
            host    : 'example.com',
            pathname: '/test'
        });

        expect(Cookie.isFake()).toBeTruthy();

        const key: string = '$key';
        const value: string = '$value';

        Cookie.set(key, value);

        expect(Cookie.get(key)).toBe(value);
        expect(Cookie.count()).toBe(1);
    });

    test('interacts with fake storage', (): void => {
        Cookie.fake();

        const key: string = '$key';
        const value: string = '$value';

        Cookie.set(key, value);

        expect(Cookie.get(key)).toEqual(value);
        expect(Cookie.count()).toEqual(1);
        expect(Cookie.keys()).toContain(key);

        Cookie.clear();

        expect(Cookie.count()).toEqual(0);
    });

    test('sets new fake instance on multiple calls', (): void => {
        Cookie.fake();

        const key: string = '$key';
        const value: string = '$value';

        Cookie.set(key, value);

        expect(Cookie.get(key)).toBe(value);
        expect(Cookie.count()).toBe(1);

        Cookie.fake();

        expect(Cookie.get(key)).toBeNull();
        expect(Cookie.count()).toBe(0);
    });
});

describe('Cookie.restore', (): void => {
    test('restores Cookie storage instance', (): void => {
        Cookie.fake();

        const key: string = '$key';
        const value: string = '$value';

        Cookie.set(key, value);

        Cookie.restore();

        expect(Cookie.isFake()).toBeFalsy();
        expect(Cookie.get(key)).toBeNull();
        expect(Cookie.count()).toBe(0);
    });
});

describe('Cookie.isFake', (): void => {
    test('returns true when fake Cookie storage is set', (): void => {
        Cookie.fake();

        expect(Cookie.isFake()).toBe(true);
    });

    test('returns false when Cookie storage is restored', (): void => {
        Cookie.fake();
        Cookie.restore();

        expect(Cookie.isFake()).toBe(false);
    });
});

describe('Cookie.setFakeLocation', (): void => {
    test('throws error when called without faking first', (): void => {
        Cookie.restore();

        expect((): void => Cookie.setFakeLocation({ host: 'example.com', pathname: '/' })).toThrow('Cookie must be faked before setting location.');
    });

    test('updates the location of the fake instance', (): void => {
        Cookie.fake();

        const key: string = '$key';
        const value: string = '$value';
        const domain: string = 'example.com';
        const path: string = '/test';

        Cookie.set(key, value, { path, domain });

        expect(Cookie.get(key)).toBeNull();
        expect(Cookie.count()).toBe(0);

        Cookie.setFakeLocation({
            host    : domain,
            pathname: path
        });

        expect(Cookie.get(key)).toBe(value);
        expect(Cookie.count()).toBe(1);
    });
});

describe('Cookie.listen', (): void => {
    // @ts-expect-error
    beforeEach((): void => Cookie.emit = emit);

    test('registers a listener for "retrieving" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';

        Cookie.listen('retrieving', listener);
        Cookie.get(key);

        const event = getEventFromMockCalls(listener) as RetrievingKey;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(RetrievingKey);
        expect(event.key).toBe(key);
    });

    test('registers a listener for "hit" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';
        const value: string = '$value';

        Cookie.listen('hit', listener);
        Cookie.set(key, value);
        Cookie.get(key);

        const event: KeyHit = getEventFromMockCalls(listener) as KeyHit;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyHit);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
    });

    test('registers a listener for "missed" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';

        Cookie.listen('missed', listener);
        Cookie.get(key);

        const event: KeyMissed = getEventFromMockCalls(listener) as KeyMissed;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyMissed);
        expect(event.key).toBe(key);
    });

    test('registers a listener for "writing" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 60;
        const now: number = Date.now();

        Cookie.listen('writing', listener);
        Cookie.set(key, value, { ttl });

        const event: WritingKey = getEventFromMockCalls(listener) as WritingKey;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(WritingKey);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
        expect(event.expiry).toBeCloseTo(now + ttl * 1000, -2);
    });

    test('registers a listener for "written" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';
        const value: string = '$value';

        Cookie.listen('written', listener);
        Cookie.set(key, value);

        const event: KeyWritten = getEventFromMockCalls(listener) as KeyWritten;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyWritten);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
    });

    test('registers a listener for "write-failed" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';
        const value: string = 'x'.repeat(4 * 1024);

        Cookie.listen('write-failed', listener);

        try {
            Cookie.set(key, value);
        } catch {
            // expected throw
        }

        const event: KeyWriteFailed = getEventFromMockCalls(listener) as KeyWriteFailed;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyWriteFailed);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
    });

    test('registers a listener for "forgot" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';
        const value: string = '$value';

        Cookie.set(key, value);
        Cookie.listen('forgot', listener);
        Cookie.remove(key);

        const event: KeyForgotten = getEventFromMockCalls(listener) as KeyForgotten;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyForgotten);
        expect(event.key).toBe(key);
    });

    test('registers a listener for "forgot-failed" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';

        Cookie.listen('forgot-failed', listener);
        Cookie.remove(key);

        const event: KeyForgotFailed = getEventFromMockCalls(listener) as KeyForgotFailed;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyForgotFailed);
        expect(event.key).toBe(key);
    });

    test('registers a listener for "flushing" event', (): void => {
        const listener: jest.Mock = jest.fn();

        Cookie.listen('flushing', listener);
        Cookie.clear();

        const event: StorageFlushing = getEventFromMockCalls(listener) as StorageFlushing;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(StorageFlushing);
    });

    test('registers a listener for "flushed" event', (): void => {
        const listener: jest.Mock = jest.fn();

        Cookie.listen('flushed', listener);
        Cookie.clear();

        const event: StorageFlushed = getEventFromMockCalls(listener) as StorageFlushed;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(StorageFlushed);
    });

    test('registers multiple listeners at once', (): void => {
        const listeners: Record<keyof CookieEvent, jest.Mock> = {
            'retrieving'   : jest.fn(),
            'hit'          : jest.fn(),
            'missed'       : jest.fn(),
            'writing'      : jest.fn(),
            'written'      : jest.fn(),
            'write-failed' : jest.fn(),
            'forgot'       : jest.fn(),
            'forgot-failed': jest.fn(),
            'flushing'     : jest.fn(),
            'flushed'      : jest.fn()
        };

        Cookie.listen(listeners);

        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 60;

        Cookie.get(key);

        expect(listeners.retrieving).toHaveBeenCalledTimes(1);
        expect(getEventFromMockCalls(listeners.retrieving)).toBeInstanceOf(RetrievingKey);

        expect(listeners.missed).toHaveBeenCalledTimes(1);
        expect(getEventFromMockCalls(listeners.missed)).toBeInstanceOf(KeyMissed);

        Cookie.set(key, value, { ttl });

        expect(listeners.writing).toHaveBeenCalledTimes(1);
        expect(getEventFromMockCalls(listeners.writing)).toBeInstanceOf(WritingKey);

        expect(listeners.written).toHaveBeenCalledTimes(1);
        expect(getEventFromMockCalls(listeners.written)).toBeInstanceOf(KeyWritten);

        try {
            Cookie.set('$key-failed', 'x'.repeat(4 * 1024));
        } catch {
            // expected throw
        }

        expect(listeners['write-failed']).toHaveBeenCalledTimes(1);
        expect(getEventFromMockCalls(listeners['write-failed'])).toBeInstanceOf(KeyWriteFailed);

        Cookie.get(key);

        expect(listeners.hit).toHaveBeenCalledTimes(1);
        expect(getEventFromMockCalls(listeners.hit)).toBeInstanceOf(KeyHit);

        Cookie.remove(key);

        expect(listeners.forgot).toHaveBeenCalledTimes(1);
        expect(getEventFromMockCalls(listeners.forgot)).toBeInstanceOf(KeyForgotten);

        Cookie.remove('$key-1');

        expect(listeners['forgot-failed']).toHaveBeenCalledTimes(1);
        expect(getEventFromMockCalls(listeners['forgot-failed'])).toBeInstanceOf(KeyForgotFailed);

        Cookie.clear();

        expect(listeners.flushing).toHaveBeenCalledTimes(1);
        expect(getEventFromMockCalls(listeners.flushing)).toBeInstanceOf(StorageFlushing);

        expect(listeners.flushed).toHaveBeenCalledTimes(1);
        expect(getEventFromMockCalls(listeners.flushed)).toBeInstanceOf(StorageFlushed);
    });
});

describe('Cookie.onRetrieving', (): void => {
    // @ts-expect-error
    beforeEach((): void => Cookie.emit = emit);

    test('registers a listener for "retrieving" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';

        Cookie.onRetrieving(listener);
        Cookie.get(key);

        const event: RetrievingKey = getEventFromMockCalls(listener) as RetrievingKey;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(RetrievingKey);
        expect(event.key).toBe(key);
    });
});

describe('Cookie.onHit', (): void => {
    // @ts-expect-error
    beforeEach((): void => Cookie.emit = emit);

    test('registers a listener for "hit" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';
        const value: string = '$value';

        Cookie.set(key, value);
        Cookie.onHit(listener);
        Cookie.get(key);

        const event: KeyHit = getEventFromMockCalls(listener) as KeyHit;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyHit);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
    });
});

describe('Cookie.onMissed', (): void => {
    // @ts-expect-error
    beforeEach((): void => Cookie.emit = emit);

    test('registers a listener for "missed" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';

        Cookie.onMissed(listener);
        Cookie.get(key);

        const event: KeyMissed = getEventFromMockCalls(listener) as KeyMissed;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyMissed);
        expect(event.key).toBe(key);
    });
});

describe('Cookie.onWriting', (): void => {
    // @ts-expect-error
    beforeEach((): void => Cookie.emit = emit);

    test('registers a listener for "writing" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';
        const value: string = '$value';

        Cookie.onWriting(listener);
        Cookie.set(key, value);

        const event: WritingKey = getEventFromMockCalls(listener) as WritingKey;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(WritingKey);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
    });
});

describe('Cookie.onWritten', (): void => {
    // @ts-expect-error
    beforeEach((): void => Cookie.emit = emit);

    test('registers a listener for "written" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';
        const value: string = '$value';

        Cookie.onWritten(listener);
        Cookie.set(key, value);

        const event: KeyWritten = getEventFromMockCalls(listener) as KeyWritten;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyWritten);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
    });
});

describe('Cookie.onWriteFailed', (): void => {
    // @ts-expect-error
    beforeEach((): void => Cookie.emit = emit);

    test('registers a listener for "write-failed" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';
        const value: string = 'x'.repeat(4 * 1024);

        Cookie.onWriteFailed(listener);

        try {
            Cookie.set(key, value);
        } catch {
            // expected throw
        }

        const event: KeyWriteFailed = getEventFromMockCalls(listener) as KeyWriteFailed;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyWriteFailed);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
    });
});

describe('Cookie.onForgot', (): void => {
    // @ts-expect-error
    beforeEach((): void => Cookie.emit = emit);

    test('registers a listener for "forgot" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';
        const value: string = '$value';

        Cookie.set(key, value);
        Cookie.onForgot(listener);
        Cookie.remove(key);

        const event: KeyForgotten = getEventFromMockCalls(listener) as KeyForgotten;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyForgotten);
        expect(event.key).toBe(key);
    });
});

describe('Cookie.onForgotFailed', (): void => {
    // @ts-expect-error
    beforeEach((): void => Cookie.emit = emit);

    test('registers a listener for "forgot-failed" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';

        Cookie.onForgotFailed(listener);
        Cookie.remove(key);

        const event: KeyForgotFailed = getEventFromMockCalls(listener) as KeyForgotFailed;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyForgotFailed);
        expect(event.key).toBe(key);
    });
});

describe('Cookie.onFlushing', (): void => {
    // @ts-expect-error
    beforeEach((): void => Cookie.emit = emit);

    test('registers a listener for "flushing" event', (): void => {
        const listener: jest.Mock = jest.fn();

        Cookie.onFlushing(listener);
        Cookie.clear();

        const event: StorageFlushing = getEventFromMockCalls(listener) as StorageFlushing;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(StorageFlushing);
    });
});

describe('Cookie.onFlushed', (): void => {
    // @ts-expect-error
    beforeEach((): void => Cookie.emit = emit);

    test('registers a listener for "flushed" event', (): void => {
        const listener: jest.Mock = jest.fn();

        Cookie.onFlushed(listener);
        Cookie.clear();

        const event: StorageFlushed = getEventFromMockCalls(listener) as StorageFlushed;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(StorageFlushed);
    });
});