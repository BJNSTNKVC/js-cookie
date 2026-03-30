export declare class KeyForgotten extends Event {
    #private;
    /**
     * Create a new Key Forgotten Event instance.
     *
     * @param { string } key
     */
    constructor(key: string);
    /**
     * Get the key of the event.
     *
     * @return { string }
     */
    get key(): string;
}
