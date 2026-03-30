export type CookieFakeLocation = {
    host: string;
    pathname: string;
};
export declare class CookieFake {
    #private;
    /**
     * Crete a new Cookie Fake instance.
     *
     * @param { CookieFakeLocation | undefined } location
     */
    constructor(location?: CookieFakeLocation);
    /**
     * Get all cookies.
     */
    get cookie(): string;
    /**
     * Set a cookie.
     */
    set cookie(cookie: string);
    /**
     * Set the new Location of the Cookie Fake instance.
     *
     * @param { CookieFakeLocation } location
     *
     * @return { void }
     */
    location(location: CookieFakeLocation): void;
    /**
     * Calculate the size a new item would take in bytes.
     *
     * @param { string } cookie
     *
     * @return { number }
     */
    private size;
    /**
     * Determine if the Storage quota is exceeded.
     *
     * @param { string } cookie
     *
     * @return { boolean }
     */
    private exceeded;
}
