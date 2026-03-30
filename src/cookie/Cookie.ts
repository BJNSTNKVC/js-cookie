import { CookieFake, type CookieFakeLocation } from './CookieFake';
import {
    type CookieEvent,
    type CookieEventListener,
    type CookieEvents,
    KeyForgotFailed,
    KeyForgotten,
    KeyHit,
    KeyMissed,
    KeyWriteFailed,
    KeyWritten,
    RetrievingKey,
    StorageFlushed,
    StorageFlushing,
    WritingKey,
} from '../events';

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
     * Current Cookie instance.
     *
     * @type { Document | CookieFake }
     */
    static #document: Document | CookieFake = document;

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
     * @param { string } key
     * @param { * } value
     * @param { CookieAttributes } attributes
     *
     * @returns { string }
     */
    static set(key: string, value: any, attributes: CookieAttributes = {}): string {
        let cookie: string = `${key}=${this.#stringify(value)}`;

        attributes.ttl ??= this.#ttl;
        attributes.expires = this.#expires(attributes.expires);

        if (attributes.ttl && !attributes.expires) {
            attributes.expires = new Date(Date.now() + attributes.ttl * 1000);
        }

        if (attributes.expires) {
            cookie += `; expires=${attributes.expires.toUTCString()}`;
        }

        this.emit(new WritingKey(key, value, attributes.expires?.getTime()));

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
            this.emit(new KeyWriteFailed(key, value, attributes.expires?.getTime()));

            throw new Error('The "secure" attribute must be set to "true" if "sameSite" is set to "None".');
        }

        if (new Blob([value]).size >= 4 * 1024) {
            this.emit(new KeyWriteFailed(key, value, attributes.expires?.getTime()));

            throw new Error('The "value" must be less than 4KB.');
        }

        this.#document.cookie = cookie;

        this.emit(new KeyWritten(key, value, attributes.expires?.getTime()));

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
    static get(key: string, fallback: any = null): any {
        this.emit(new RetrievingKey(key));

        const cookies: RegExpMatchArray | null = new RegExp(`(^|; )${(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))}=([^;]*)`).exec(this.#document.cookie);

        if (cookies === null) {
            this.emit(new KeyMissed(key));

            return typeof fallback === 'function' ? fallback() : fallback;
        }

        let value: any;
        const cookie: string = cookies[2] as string;

        try {
            value = JSON.parse(cookie);
        } catch {
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
     * @return { { key: string, value: any }[] }
     */
    static all(): { key: string, value: any }[] {
        if (this.#document.cookie === '') {
            return [];
        }

        let cookies: { key: string, value: any }[] = [];

        for (const cookie of this.#document.cookie.split('; ')) {
            const key: string = cookie.split('=')[0] as string;

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
    static remove(key: string, attributes: Pick<CookieAttributes, 'path'> = {}): boolean {
        if (this.has(key)) {
            this.set(key, '', { ...attributes, expires: new Date(0) });

            this.emit(new KeyForgotten(key));

            return true;
        } else {
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
    static clear(attributes: Pick<CookieAttributes, 'path'> = {}): void {
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
    static has(key: string): boolean {
        return !!this.get(key);
    }

    /**
     * Determine if the key does not exist in the Cookie.
     *
     * @param { string } key
     *
     * @return { boolean }
     */
    static missing(key: string): boolean {
        return !this.has(key);
    }

    /**
     * Determine if any of the keys exists in the Cookie.
     *
     * @param { string | string[] } keys
     *
     * @return { boolean }
     */
    static hasAny(...keys: [string | string[]] | string[]): boolean {
        return keys.flat().some((key: string): boolean => this.has(key));
    }

    /**
     * Determine if the Cookie is empty.
     *
     * @return { boolean }
     */
    static isEmpty(): boolean {
        return this.#document.cookie.length === 0;
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
     * @param { string } key
     * @param { number | null } ttl
     * @param { { path?: string } } attributes
     *
     * @return { void | string }
     */
    static touch(key: string, ttl: number | null = null, attributes: Pick<CookieAttributes, 'path'> = {}): void | string {
        const cookie: any = this.get(key);

        if (cookie === null) {
            return;
        }

        return this.set(key, cookie, { ttl: ttl ?? this.#ttl, ...attributes });
    }

    /**
     * Dump the key from the Cookie.
     *
     * @param { string } key
     *
     * @return { void }
     */
    static dump(key: string): void {
        console.log(this.get(key));
    }

    /**
     * Replace the Cookie instance with a fake.
     *
     * @return { void }
     */
    static fake(location?: CookieFakeLocation): void {
        this.#document = new CookieFake(location);
    }

    /**
     * Restore the Cookie instance.
     *
     * @return { void }
     */
    static restore(): void {
        this.#document = document;
    }

    /**
     * Determines whether a "fake" has been set as the Cookie instance.
     *
     * @return { boolean }
     */
    static isFake(): boolean {
        return this.#document instanceof CookieFake;
    }

    /**
     * Set the new Location of the Cookie Fake instance.
     *
     * @param { CookieFakeLocation } location
     *
     * @return { void }
     */
    static setFakeLocation(location: CookieFakeLocation): void {
        if (!this.isFake()) {
            throw new Error('Cookie must be faked before setting location.');
        }

        (this.#document as CookieFake).location(location);
    }

    /**
     * Register an event listener.
     *
     * @template { keyof CookieEvents } K
     *
     * @param { K | CookieEvents } events
     * @param { CookieEventListener<K> | null } listener
     *
     * @return { void }
     */
    static listen(events: 'retrieving', listener: (event: RetrievingKey) => void): void;

    static listen(events: 'hit', listener: (event: KeyHit) => void): void;

    static listen(events: 'missed', listener: (event: KeyMissed) => void): void;

    static listen(events: 'writing', listener: (event: WritingKey) => void): void;

    static listen(events: 'written', listener: (event: KeyWritten) => void): void;

    static listen(events: 'write-failed', listener: (event: KeyWriteFailed) => void): void;

    static listen(events: 'forgot', listener: (event: KeyForgotten) => void): void;

    static listen(events: 'forgot-failed', listener: (event: KeyForgotFailed) => void): void;

    static listen(events: 'flushing', listener: (event: StorageFlushing) => void): void;

    static listen(events: 'flushed', listener: (event: StorageFlushed) => void): void;

    static listen(events: CookieEvents): void;

    static listen<K extends keyof CookieEvent>(events: keyof CookieEvent | CookieEvents, listener: CookieEventListener<K> | null = null): void {
        events = typeof events === 'string' ? { [events]: listener } : events;

        for (const [event, listener] of Object.entries(events)) {
            addEventListener(`cookie:${event}`, listener as EventListener, { once: true });
        }
    }

    /**
     * Register a listener on "retrieving" event.
     *
     * @param { (event: RetrievingKey) => void } listener
     *
     * @return { void }
     */
    static onRetrieving(listener: (event: RetrievingKey) => void): void {
        this.listen('retrieving', listener);
    }

    /**
     * Register a listener on "hit" event.
     *
     * @param { (event: KeyHit) => void } listener
     *
     * @return { void }
     */
    static onHit(listener: (event: KeyHit) => void): void {
        this.listen('hit', listener);
    }

    /**
     * Register a listener on "missed" event.
     *
     * @param { (event: KeyMissed) => void } listener
     *
     * @return { void }
     */
    static onMissed(listener: (event: KeyMissed) => void): void {
        this.listen('missed', listener);
    }

    /**
     * Register a listener on "writing" event.
     *
     * @param { (event: WritingKey) => void } listener
     *
     * @return { void }
     */
    static onWriting(listener: (event: WritingKey) => void): void {
        this.listen('writing', listener);
    }

    /**
     * Register a listener on "written" event.
     *
     * @param { (event: KeyWritten) => void } listener
     *
     * @return { void }
     */
    static onWritten(listener: (event: KeyWritten) => void): void {
        this.listen('written', listener);
    }

    /**
     * Register a listener on "failed" event.
     *
     * @param { (event: KeyWriteFailed) => void } listener
     *
     * @return { void }
     */
    static onWriteFailed(listener: (event: KeyWriteFailed) => void): void {
        this.listen('write-failed', listener);
    }

    /**
     * Register a listener on "forgot" event.
     *
     * @param { (event: KeyForgotten) => void } listener
     *
     * @return { void }
     */
    static onForgot(listener: (event: KeyForgotten) => void): void {
        this.listen('forgot', listener);
    }

    /**
     * Register a listener on "forgot-failed" event.
     *
     * @param { (event: KeyForgotFailed) => void } listener
     *
     * @return { void }
     */
    static onForgotFailed(listener: (event: KeyForgotFailed) => void): void {
        this.listen('forgot-failed', listener);
    }

    /**
     * Register a listener on "flushing" event.
     *
     * @param { (event: StorageFlushing) => void } listener
     *
     * @return { void }
     */
    static onFlushing(listener: (event: StorageFlushing) => void): void {
        this.listen('flushing', listener);
    }

    /**
     * Register a listener on "flushed" event.
     *
     * @param { (event: StorageFlushed) => void } listener
     *
     * @return { void }
     */
    static onFlushed(listener: (event: StorageFlushed) => void): void {
        this.listen('flushed', listener);
    }

    /**
     * Stringifies a value for cookie storage.
     *
     * @param { * } value
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
     * @param { Date | string } expires
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

        const date = new Date(expires);

        return Number.isNaN(date.getTime()) ? undefined : date;
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
    private static emit<K extends keyof CookieEvent>(event: CookieEvent[K]): void {
        dispatchEvent(event);
    }
}