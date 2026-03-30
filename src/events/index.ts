import { StorageFlushing } from './StorageFlushing';
import { StorageFlushed } from './StorageFlushed';
import { RetrievingKey } from './RetrievingKey';
import { KeyHit } from './KeyHit';
import { KeyMissed } from './KeyMissed';
import { KeyWriteFailed } from './KeyWriteFailed';
import { KeyWritten } from './KeyWritten';
import { WritingKey } from './WritingKey';
import { KeyForgotten } from './KeyForgotten';
import { KeyForgotFailed } from './KeyForgotFailed';

export { StorageFlushing } from './StorageFlushing';
export { StorageFlushed } from './StorageFlushed';
export { RetrievingKey } from './RetrievingKey';
export { KeyHit } from './KeyHit';
export { KeyMissed } from './KeyMissed';
export { KeyWriteFailed } from './KeyWriteFailed';
export { KeyWritten } from './KeyWritten';
export { WritingKey } from './WritingKey';
export { KeyForgotten } from './KeyForgotten';
export { KeyForgotFailed } from './KeyForgotFailed';

export type CookieEvent = {
    'retrieving': RetrievingKey;
    'hit': KeyHit;
    'missed': KeyMissed;
    'writing': WritingKey;
    'written': KeyWritten;
    'write-failed': KeyWriteFailed;
    'forgot': KeyForgotten;
    'forgot-failed': KeyForgotFailed;
    'flushing': StorageFlushing;
    'flushed': StorageFlushed;
}

export type CookieEventListener<K extends keyof CookieEvent> = (event: K) => void;

export type CookieEvents = { [K in keyof CookieEvent]?: K extends 'retrieving' ? (event: RetrievingKey) => void : K extends 'hit' ? (event: KeyHit) => void : K extends 'missed' ? (event: KeyMissed) => void : K extends 'writing' ? (event: WritingKey) => void : K extends 'written' ? (event: KeyWritten) => void : K extends 'write-failed' ? (event: KeyWriteFailed) => void : K extends 'forgot' ? (event: KeyForgotten) => void : K extends 'forgot-failed' ? (event: KeyForgotFailed) => void : K extends 'flushing' ? (event: StorageFlushing) => void : K extends 'flushed' ? (event: StorageFlushed) => void : never; };