export declare class KeyHit extends Event {
    #private;
    /**
     * Create a new Key Hit Event instance.
     *
     * @param { string } key
     * @param { string } value
     */
    constructor(key: string, value: any);
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
}
