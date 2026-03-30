import { type CookieFakeLocation } from './CookieFake';
import { type CookieEvents, KeyForgotFailed, KeyForgotten, KeyHit, KeyMissed, KeyWriteFailed, KeyWritten, RetrievingKey, StorageFlushed, StorageFlushing, WritingKey } from '../events';
export type CookieAttributes = {
    ttl?: number | null;
    expires?: Date | string;
    path?: string;
    domain?: string;
    sameSite?: 'Strict' | 'Lax' | 'None';
    secure?: boolean;
};
export declare class Cookie {
    #private;
    /**
     * Set the default item validity period in seconds.
     *
     * @param { number | null } value
     */
    static ttl(value: number | null): void;
    /**
     * Set the key to the Cookie.
     *
     * @param { string } key
     * @param { * } value
     * @param { CookieAttributes } attributes
     *
     * @returns { string }
     */
    static set(key: string, value: any, attributes?: CookieAttributes): string;
    /**
     * Get the key from the Cookie.
     *
     * @param { string } key
     * @param { * } fallback
     *
     * @returns { * }
     */
    static get(key: string, fallback?: any): any;
    /**
     * Get the key from the Cookie, or execute the given callback and store the result.
     *
     * @param { string } key
     * @param { Function } callback
     * @param { object } attributes
     *
     * @return { any }
     */
    static remember(key: string, callback: Function, attributes?: CookieAttributes): any;
    /**
     * Return all items stored in the Cookie.
     *
     * @return { { key: string, value: any }[] }
     */
    static all(): {
        key: string;
        value: any;
    }[];
    /**
     * Removes a key from the cookie.
     *
     * @param { string } key
     * @param { { path?: string } } attributes
     *
     * @return { boolean }
     */
    static remove(key: string, attributes?: Pick<CookieAttributes, 'path'>): boolean;
    /**
     * Clear all keys stored in the Cookie.
     *
     * @param { { path?: string } } attributes
     *
     * @return { void }
     */
    static clear(attributes?: Pick<CookieAttributes, 'path'>): void;
    /**
     * Determine if the key exists in the Cookie.
     *
     * @param { string } key
     *
     * @return { boolean }
     */
    static has(key: string): boolean;
    /**
     * Determine if the key does not exist in the Cookie.
     *
     * @param { string } key
     *
     * @return { boolean }
     */
    static missing(key: string): boolean;
    /**
     * Determine if any of the keys exists in the Cookie.
     *
     * @param { string | string[] } keys
     *
     * @return { boolean }
     */
    static hasAny(...keys: [string | string[]] | string[]): boolean;
    /**
     * Determine if the Cookie is empty.
     *
     * @return { boolean }
     */
    static isEmpty(): boolean;
    /**
     * Determine if the Cookie is not empty.
     *
     * @return { boolean }
     */
    static isNotEmpty(): boolean;
    /**
     * Retrieves all keys from the Cookie.
     *
     * @return { string[] }
     */
    static keys(): string[];
    /**
     * Returns the total number of items in the Cookie.
     *
     * @return { number }
     */
    static count(): number;
    /**
     * Updates the item expiration time.
     *
     * @param { string } key
     * @param { number | null } ttl
     * @param { { path?: string } } attributes
     *
     * @return { void | string }
     */
    static touch(key: string, ttl?: number | null, attributes?: Pick<CookieAttributes, 'path'>): void | string;
    /**
     * Dump the key from the Cookie.
     *
     * @param { string } key
     *
     * @return { void }
     */
    static dump(key: string): void;
    /**
     * Replace the Cookie instance with a fake.
     *
     * @return { void }
     */
    static fake(location?: CookieFakeLocation): void;
    /**
     * Restore the Cookie instance.
     *
     * @return { void }
     */
    static restore(): void;
    /**
     * Determines whether a "fake" has been set as the Cookie instance.
     *
     * @return { boolean }
     */
    static isFake(): boolean;
    /**
     * Set the new Location of the Cookie Fake instance.
     *
     * @param { CookieFakeLocation } location
     *
     * @return { void }
     */
    static setFakeLocation(location: CookieFakeLocation): void;
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
    /**
     * Register a listener on "retrieving" event.
     *
     * @param { (event: RetrievingKey) => void } listener
     *
     * @return { void }
     */
    static onRetrieving(listener: (event: RetrievingKey) => void): void;
    /**
     * Register a listener on "hit" event.
     *
     * @param { (event: KeyHit) => void } listener
     *
     * @return { void }
     */
    static onHit(listener: (event: KeyHit) => void): void;
    /**
     * Register a listener on "missed" event.
     *
     * @param { (event: KeyMissed) => void } listener
     *
     * @return { void }
     */
    static onMissed(listener: (event: KeyMissed) => void): void;
    /**
     * Register a listener on "writing" event.
     *
     * @param { (event: WritingKey) => void } listener
     *
     * @return { void }
     */
    static onWriting(listener: (event: WritingKey) => void): void;
    /**
     * Register a listener on "written" event.
     *
     * @param { (event: KeyWritten) => void } listener
     *
     * @return { void }
     */
    static onWritten(listener: (event: KeyWritten) => void): void;
    /**
     * Register a listener on "failed" event.
     *
     * @param { (event: KeyWriteFailed) => void } listener
     *
     * @return { void }
     */
    static onWriteFailed(listener: (event: KeyWriteFailed) => void): void;
    /**
     * Register a listener on "forgot" event.
     *
     * @param { (event: KeyForgotten) => void } listener
     *
     * @return { void }
     */
    static onForgot(listener: (event: KeyForgotten) => void): void;
    /**
     * Register a listener on "forgot-failed" event.
     *
     * @param { (event: KeyForgotFailed) => void } listener
     *
     * @return { void }
     */
    static onForgotFailed(listener: (event: KeyForgotFailed) => void): void;
    /**
     * Register a listener on "flushing" event.
     *
     * @param { (event: StorageFlushing) => void } listener
     *
     * @return { void }
     */
    static onFlushing(listener: (event: StorageFlushing) => void): void;
    /**
     * Register a listener on "flushed" event.
     *
     * @param { (event: StorageFlushed) => void } listener
     *
     * @return { void }
     */
    static onFlushed(listener: (event: StorageFlushed) => void): void;
    /**
     * Emit an event for the Local Storage instance.
     *
     * @template { keyof CookieEvents } K
     *
     * @param { CookieEvent[K] } event
     *
     * @returns { void }
     */
    private static emit;
}
