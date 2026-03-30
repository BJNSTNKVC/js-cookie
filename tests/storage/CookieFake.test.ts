import { CookieFake, CookieFakeLocation } from '../../src/main';

const location: CookieFakeLocation = {
    host    : 'example.com',
    pathname: '/',
};

let cookies: CookieFake;

beforeEach((): void => {
    cookies = new CookieFake(location);
});

describe('CookieFake', (): void => {
    test('has a cookie getter and setter', (): void => {
        expect(typeof Object.getOwnPropertyDescriptor(CookieFake.prototype, 'cookie')?.get).toBe('function');
        expect(typeof Object.getOwnPropertyDescriptor(CookieFake.prototype, 'cookie')?.set).toBe('function');
    });

    test('returns an empty string when no cookies are set', (): void => {
        expect(cookies.cookie).toBe('');
    });

    test('uses globalThis.location when no location is provided', (): void => {
        expect((): CookieFake => new CookieFake()).not.toThrow();
    });
});

describe('CookieFake.cookie setter', (): void => {
    test('sets a simple key=value cookie', (): void => {
        cookies.cookie = 'name=Alice';

        expect(cookies.cookie).toBe('name=Alice');
    });

    test('sets a cookie without a value', (): void => {
        cookies.cookie = 'secure_flag';

        expect(cookies.cookie).toBe('secure_flag');
    });

    test('does nothing when given an empty string', (): void => {
        cookies.cookie = '';

        expect(cookies.cookie).toBe('');
    });

    test('updates an existing cookie with the same key, domain, and path', (): void => {
        cookies.cookie = 'name=Alice';
        cookies.cookie = 'name=Bob';

        expect(cookies.cookie).toBe('name=Bob');
        expect(cookies.cookie.split(';').filter(c => c.trim().startsWith('name=')).length).toBe(1);
    });

    test('stores multiple cookies independently', (): void => {
        cookies.cookie = 'name=Alice';
        cookies.cookie = 'role=admin';

        const result: string = cookies.cookie;

        expect(result).toContain('name=Alice');
        expect(result).toContain('role=admin');
    });

    test('ignores cookies exceeding or equal to the 4KB quota', (): void => {
        cookies.cookie = `data=${'x'.repeat(4 * 1024)}`;

        expect(cookies.cookie).toBe('');
    });

    test('removes an expired cookie on next read', (): void => {
        const past: string = new Date(Date.now() - 1000).toUTCString();

        cookies.cookie = `name=Alice; expires=${past}`;

        expect(cookies.cookie).toBe('');
    });

    test('retains a cookie with a future expiry', (): void => {
        const future: string = new Date(Date.now() + 60_000).toUTCString();

        cookies.cookie = `name=Alice; expires=${future}`;

        expect(cookies.cookie).toBe('name=Alice');
    });

    test('removes an existing cookie when updated with an expired date', (): void => {
        const future: string = new Date(Date.now() + 60_000).toUTCString();
        const past: string = new Date(Date.now() - 1000).toUTCString();

        cookies.cookie = `name=Alice; expires=${future}`;
        cookies.cookie = `name=Alice; expires=${past}`;

        expect(cookies.cookie).toBe('');
    });

    test('sets expiry from max-age', (): void => {
        cookies.cookie = 'name=Alice; max-age=3600';

        expect(cookies.cookie).toBe('name=Alice');
    });

    test('expires a cookie with max-age=0', (): void => {
        cookies.cookie = 'name=Alice';
        cookies.cookie = 'name=Alice; max-age=0';

        expect(cookies.cookie).toBe('');
    });

    test('max-age takes precedence over expires when both are present', (): void => {
        const past: string = new Date(Date.now() - 1000).toUTCString();

        cookies.cookie = `name=Alice; max-age=3600; expires=${past}`;

        expect(cookies.cookie).toBe('name=Alice');
    });

    test('stores a cookie accessible on the current domain', (): void => {
        cookies.cookie = 'name=Alice; domain=example.com';

        expect(cookies.cookie).toBe('name=Alice');
    });

    test('does not return cookies set for a different domain', (): void => {
        cookies.cookie = 'name=Alice; domain=other.com';

        expect(cookies.cookie).toBe('');
    });

    test('strips www. when resolving the domain', (): void => {
        const cookies: CookieFake = new CookieFake({ host: 'www.example.com', pathname: '/' });

        cookies.cookie = 'name=Alice';

        expect(cookies.cookie).toBe('name=Alice');
    });

    test('returns a cookie when path matches exactly', (): void => {
        const cookies: CookieFake = new CookieFake({ host: 'example.com', pathname: '/app' });

        cookies.cookie = 'name=Alice; path=/app';

        expect(cookies.cookie).toBe('name=Alice');
    });

    test('returns a cookie with path=/ from any pathname', (): void => {
        const cookies: CookieFake = new CookieFake({ host: 'example.com', pathname: '/deep/path' });

        cookies.cookie = 'name=Alice; path=/';

        expect(cookies.cookie).toBe('name=Alice');
    });

    test('does not return a cookie when path does not match', (): void => {
        const cookies: CookieFake = new CookieFake({ host: 'example.com', pathname: '/other' });

        cookies.cookie = 'name=Alice; path=/app';

        expect(cookies.cookie).toBe('');
    });

    test('treats two cookies with the same key but different paths as distinct', (): void => {
        const cookies: CookieFake = new CookieFake({ host: 'example.com', pathname: '/app' });

        cookies.cookie = 'name=Alice; path=/app';
        cookies.cookie = 'name=Bob; path=/';

        const result: string = cookies.cookie;

        expect(result).toContain('name=Alice');
        expect(result).toContain('name=Bob');
    });

});

describe('CookieFake.location', (): void => {
    test('updates the instance location', (): void => {
        cookies.cookie = 'name=Alice; path=/admin';

        expect(cookies.cookie).toBe('');

        cookies.location({ host: 'example.com', pathname: '/admin' });

        expect(cookies.cookie).toBe('name=Alice');
    });

    test('re-evaluates domain visibility after location change', (): void => {
        cookies.cookie = 'name=Alice';
        cookies.location({ host: 'other.com', pathname: '/' });

        expect(cookies.cookie).toBe('');
    });
});