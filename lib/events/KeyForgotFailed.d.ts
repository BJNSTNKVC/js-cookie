export declare class KeyForgotFailed extends Event {
    #private;
    /**
     * Create a new Key Forgot Failed Event instance.
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
