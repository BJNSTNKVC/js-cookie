export declare class KeyMissed extends Event {
    #private;
    /**
     * Create a new Key Missed Event instance.
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
