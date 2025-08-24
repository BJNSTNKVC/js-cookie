export type CookieAttributes = {
    ttl?: number | null;
    expires?: Date | string;
    path?: string;
    domain?: string;
    sameSite?: 'Strict' | 'Lax' | 'None';
    secure?: boolean;
};

export class Cookie {
    /**
     * Default item validity period in seconds.
     *
     * @type { number | null }
     */
    static #ttl: number | null = null;

    /**
     * Set the default item validity period in seconds.
     *
     * @param { number | null } value
     */
    static ttl(value: number | null): void {
        this.#ttl = value;
    }

    /**
     * Set the key to the Cookie.
     *
     * @param { string } key String containing the name of the key you want to create.
     * @param { * } value Value you want to give the key you are creating.
     * @param { CookieAttributes } attributes Cookie configuration options.
     *
     * @returns { string }
     */
    static set(key: string, value: any, attributes: CookieAttributes = {}): string {
        let cookie: string = value === null || value === undefined
            ? `${key}`
            : `${key}=${this.#stringify(value)}`;

        attributes.ttl ??= this.#ttl;
        attributes.expires = this.#expires(attributes.expires);

        if (attributes.ttl) {
            attributes.expires = new Date(Date.now() + attributes.ttl * 1000);
        }

        if (attributes.expires) {
            cookie += `; expires=${attributes.expires.toUTCString()}`;
        }

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
            throw new Error('The "secure" attribute must be set to "true" if "sameSite" is set to "None".');
        }

        document.cookie = cookie;

        return cookie;
    }

    /**
     * Get the key from the Cookie.
     *
     * @param { string } key String containing the name of the key you want to get.
     *
     * @returns { * }
     */
    static get(key: string, fallback: any = null): any {
        // Escape special regex characters in the key.
        key = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const cookies: RegExpMatchArray | null = new RegExp(`(^|;\\s*)${key}=([^;]*)`).exec(document.cookie);

        if (cookies === null) {
            return fallback instanceof Function ? fallback() : fallback ?? null;
        }

        const cookie: string = cookies[2] as string;

        try {
            return JSON.parse(cookie);
        } catch {
            return cookie;
        }
    }

    /**
     * Get the key from the Cookie, or execute the given callback and store the result.
     *
     * @param { string } key String containing the name of the key you want to create.
     * @param { Function } callback Function you want to execute.
     * @param { object } attributes
     *
     * @return { any }
     */
    static remember(key: string, callback: Function, attributes: CookieAttributes = {}): any {
        const cookie: string | null = this.get(key);

        if (cookie === null) {
            return this.set(key, callback(), attributes);
        }

        return cookie;
    }

    /**
     * Return all items stored in the Cookie.
     *
     * @return { {key: string, value: any}[] }
     */
    static all(): { key: string, value: any }[] {
        let cookies: { key: string, value: any }[] = [];

        if (document.cookie === '') {
            return cookies;
        }

        document.cookie
            .split('; ')
            .forEach((cookie: string): void => {
                if (cookie === '') {
                    return;
                }

                const key: string = cookie.split('=')[0] as string;

                cookies.push({ key, value: this.get(key) });
            });

        return cookies;
    }

    /**
     * Removes a key from the cookie.
     *
     * @param { string } key The name of the cookie key to remove.
     * @param { object} attributes Optional cookie attributes (only `path` is allowed).
     */
    static remove(key: string, attributes: Pick<CookieAttributes, 'path'> = {}): void {
        this.set(key, '', { ...attributes, expires: new Date(0) });
    }

    /**
     * Clear all keys stored in the Cookie.
     *
     * @param { object } attributes Optional cookie attributes (only `path` is allowed).
     */
    static clear(attributes: Pick<CookieAttributes, 'path'> = {}): void {
        this.all().forEach((cookie: { key: string }): void => {
            this.remove(cookie.key, attributes);
        });
    }

    /**
     * Determine if the key exists in the Cookie.
     *
     * @param { string } key String containing the name of the key you want to check against
     *
     * @return { boolean }
     */
    static has(key: string): boolean {
        return !!this.get(key);
    }

    /**
     * Determine if any of the keys exists in the Cookie.
     *
     * @param { string | string[] } keys String containing the name of the key you want to check against
     *
     * @return { boolean }
     */
    static hasAny(...keys: [string | string[]] | string[]): boolean {
        if (keys.length === 1) {
            if (Array.isArray(keys[0])) {
                keys = keys[0];
            } else {
                keys = [keys[0]];
            }
        }

        return keys.some((key: string): boolean => this.has(key));
    }

    /**
     * Determine if the Cookie is empty.
     *
     * @return { boolean }
     */
    static isEmpty(): boolean {
        return document.cookie.length === 0;
    }

    /**
     * Determine if the Cookie is not empty.
     *
     * @return { boolean }
     */
    static isNotEmpty(): boolean {
        return !this.isEmpty();
    }

    /**
     * Retrieves all keys from the Cookie.
     *
     * @return { string[] }
     */
    static keys(): string[] {
        return this.all().map((cookie: { key: string, value: any }): string => cookie.key);
    }

    /**
     * Returns the total number of items in the Cookie.
     *
     * @return { number }
     */
    static count(): number {
        return this.all().length;
    }

    /**
     * Updates the item expiration time.
     *
     * @param { string } key String containing the name of the key you want to update.
     * @param { number | null } ttl Item validity period in seconds.
     * @param { object } attributes Optional cookie attributes (only `path` is allowed).
     */
    static touch(key: string, ttl: number | null = null, attributes: Pick<CookieAttributes, 'path'> = {}): void {
        const cookie: any = this.get(key);

        if (cookie === null) {
            return;
        }

        ttl ??= this.#ttl;

        this.set(key, cookie, { ttl, ...attributes });
    }

    /**
     * Dump the key from the Cookie.
     *
     * @param { string } key String containing the name of the key you want to dump.
     */
    static dump(key: string): void {
        console.log(this.get(key));
    }

    /**
     * Stringifies a value for cookie storage.
     *
     * @param { * } value Value to be stored in cookie.
     *
     * @returns { string }
     */
    static #stringify(value: any): string {
        if (value === null || value === undefined) {
            return '';
        }

        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            return value.toString();
        }

        try {
            return JSON.stringify(value);
        } catch {
            return '';
        }
    }

    /**
     * Converts expires attribute to Date object if it's a string.
     *
     * @param { Date | string } expires Date object or date string.
     *
     * @returns { Date | undefined }
     */
    static #expires(expires?: Date | string): Date | undefined {
        if (!expires) {
            return undefined;
        }

        if (expires instanceof Date) {
            return expires;
        }

        try {
            const date = new Date(expires);

            return isNaN(date.getTime()) ? undefined : date;
        } catch {
            return undefined;
        }
    }
}
