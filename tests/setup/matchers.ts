declare global {
    namespace jest {
        interface Matchers<R> {
            toHaveCookie(key: string, value?: any, encode?: boolean): R;
        }
    }
}

export function toHaveCookie(received: string, key: string, value?: any, encode: boolean = false): jest.CustomMatcherResult {
    let $key: string = key;
    let $value: string = value !== undefined
        ? typeof value === 'object' ? JSON.stringify(value) : value.toString()
        : '';

    if (encode) {
        $key = encodeURIComponent($key);
        $value = encodeURIComponent($value);
    }

    let cookie: string = value === null || value === undefined
        ? `${$key}`
        : `${$key}=${$value}`;

    const pass: boolean = received.includes(cookie);

    return {
        pass,
        message: (): string => pass
            ? `Expected document.cookie not to contain cookie "${cookie}"`
            : `Expected document.cookie to contain cookie "${cookie}\nReceived: ${received}`
    };
}