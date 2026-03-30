export declare class KeyWriteFailed extends Event {
    #private;
    /**
     * Create a new Key Write Failed Event instance.
     *
     * @param { string } key
     * @param { string } value
     * @param { number | null } expiry
     */
    constructor(key: string, value: any, expiry?: number | null);
    /**
     * Get the key of the event.
     *
     * @return { string }
     */
    get key(): string;
    /**
     * Get the value of the key.
     *
     * @return { * }
     */
    get value(): any;
    /**
     * Get the validity period in milliseconds since Unix Epoch.
     *
     * @return { number | null }
     */
    get expiry(): number | null;
}
