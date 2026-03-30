export declare class RetrievingKey extends Event {
    #private;
    /**
     * Create a new Retrieving Key Event instance.
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
