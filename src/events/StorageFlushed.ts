export class StorageFlushed extends Event {
    /**
     * Create a new Storage Flushed Event instance.
     */
    constructor() {
        super('cookie:flushed');
    }
}
