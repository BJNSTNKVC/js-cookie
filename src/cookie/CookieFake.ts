type CookieObject = {
    key: string,
    value: string | null,
    expires: string | null,
    domain: string,
    path: string,
    secure: boolean,
    sameSite: string | null
}

export type CookieFakeLocation = {
    host: string;
    pathname: string
}

export class CookieFake {
    /**
     * List of all cookies.
     */
    #cookies: CookieObject[] = [];

    /**
     * Location of the Cookie Fake instance.
     */
    #location: CookieFakeLocation;

    /**
     * Cookie quota in bytes.
     */
    readonly #quota: number = 4 * 1024;

    /**
     * Crete a new Cookie Fake instance.
     *
     * @param { CookieFakeLocation | undefined } location
     */
    constructor(location?: CookieFakeLocation) {
        this.#location = location || {
            host    : typeof globalThis === 'undefined' ? 'localhost' : globalThis.location.host,
            pathname: typeof globalThis === 'undefined' ? '/' : globalThis.location.pathname
        };
    }

    /**
     * Get all cookies.
     */
    get cookie(): string {
        let cookies: string[] = [];

        const domain: string = `.${this.#location.host.replace('www.', '')}`;
        const path: string = this.#location.pathname.replace(/\/$/, '');

        for (const cookie of this.#cookies) {
            const index: number = this.#cookies.indexOf(cookie);

            if (cookie.domain !== domain) {
                continue;
            }

            if (cookie.path !== path && cookie.path !== '/') {
                continue;
            }

            if (cookie.expires !== null && Date.parse(cookie.expires) < Date.now()) {
                this.#cookies.splice(index, 1);

                continue;
            }

            cookies.push(cookie.value === null ? cookie.key : `${cookie.key}=${cookie.value}`);
        }

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
        const ttl: string | null = cookie.match(/max-age=([^;]*)/i)?.[1] ?? null;
        let expires: string | null = cookie.match(/expires=([^;]+)/)?.[1] ?? null;
        const domain: string | null = '.' + (cookie.match(/domain=([^;]*)/i)?.[1] ?? this.#location.host.replace('www.', ''));
        const path: string | null = cookie.match(/path=([^;]*)/i)?.[1] ?? this.#location.pathname.replace(/\/$/, '');
        const secure: boolean = /secure/i.test(cookie);
        const sameSite: string | null = cookie.match(/samesite=([^;]*)/i)?.[1] ?? null;

        if (ttl !== null) {
            expires = new Date(Date.now() + (ttl as unknown as number) * 1000).toUTCString();
        }

        const existing: number = this.#cookies.findIndex((cookie: CookieObject): boolean => cookie.key === key && cookie.path === path && cookie.domain === domain);
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

        if (data.value !== null && this.exceeded(data.value)) {
            return;
        }

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

    /**
     * Set the new Location of the Cookie Fake instance.
     *
     * @param { CookieFakeLocation } location
     *
     * @return { void }
     */
    location(location: CookieFakeLocation): void {
        this.#location = location;
    }


    /**
     * Calculate the size a new item would take in bytes.
     *
     * @param { string } cookie
     *
     * @return { number }
     */
    private size(cookie: string): number {
        return new Blob([cookie]).size;
    }

    /**
     * Determine if the Storage quota is exceeded.
     *
     * @param { string } cookie
     *
     * @return { boolean }
     */
    private exceeded(cookie: string): boolean {
        return this.size(cookie) >= this.#quota;
    }
}