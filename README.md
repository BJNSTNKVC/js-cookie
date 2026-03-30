# Cookie

A class that provides a set of methods for interacting with the browser's local storage.

## Installation & setup

### NPM

You can install the package via npm:

```bash
npm install @bjnstnkvc/cookie
```

and then import it into your project

```javascript
import { Cookie } from '@bjnstnkvc/cookie';
```

### CDN

You can install the package via jsDelivr CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@bjnstnkvc/cookie/lib/main.min.js"></script>
```

## Usage

### set

Set the value for a given key in the Cookie object.

#### Parameters

- **key** - String containing the name of the key.
- **value** - The value to be stored.
- **[attributes](#cookie-attributes)** *(optional)* - Cookie configuration options.

#### Example

```javascript
Cookie.set('key', 'value'); 
```

### get

Retrieve the value associated with the given key from the Cookie object.

#### Parameters

- **key** - String containing the name of the key.
- **fallback** *(optional)* - The fallback value in case the key does not exist. Defaults to `null`.

#### Example

```javascript
Cookie.get('key', 'default');
```

You can also pass a closure as the default value. If the specified item is not found in the Cookie object, the closure will be executed and its result returned. 
This allows you to lazily load default values from other sources:

```javascript
Cookie.get('key', () => 'default');
```

### remember

Retrieve the value associated with the given key, or execute the given callback and store the result in the Cookie object.

#### Parameters

- **key** - String containing the name of the key.
- **fallback** - Function you want to execute.
- **[attributes](#cookie-attributes)** *(optional)* - Cookie configuration options.

#### Example

```javascript
Cookie.remember('key', () => 'default');
```

### all

Retrieve an array containing all keys and their associated values stored in the Cookie object.

#### Example

```javascript
Cookie.all();
```

> **Note:** The `all` method returns an array of objects with `key` and `value` properties (e.g. `[{ key: 'key', value: 'value' }]`)

### remove

Remove the key and its associated value from the Cookie object.

#### Parameters

- **key** - String containing the name of the key to be deleted.
- **[attributes](#cookie-attributes)** *(optional)* - Cookie attributes (only `path` is allowed).

#### Example

```javascript
Cookie.remove('key');
```

Optionally, you can pass attributes to the `remove` method to remove cookies from a specific path:

```javascript
Cookie.remove('key', { path: '/' });
```

### clear

Clear all keys and their associated values from the Cookie object.

#### Parameters

- **[attributes](#cookie-attributes)** *(optional)* - Cookie attributes (only `path` is allowed).

#### Example

```javascript
Cookie.clear();
```

Optionally, you can pass attributes to the `clear` method to remove cookies from a specific path:

```javascript
Cookie.clear({ path: '/' });
```

### has

Check if a key exists in the Cookie object.

#### Parameters

- **key** - String containing the name of the key to be checked.

#### Example

```javascript
Cookie.has('key');
```

### hasAny

Check if any of the provided keys exist in the Cookie object.

#### Parameters

- **keys** - String or an array of strings containing the names of the keys to be checked.

#### Example

```javascript
Cookie.hasAny(['key1', 'key2']);
```

### isEmpty

Check if the Cookie object is empty.

#### Example

```javascript
Cookie.isEmpty();
```

### isNotEmpty

Check if the Cookie object is not empty.

#### Example

```javascript
Cookie.isNotEmpty();
```

### keys

Retrieve an array containing all keys stored in the Cookie object.

#### Example

```javascript
Cookie.keys();
```

### count

Retrieve the total number of items stored in the Cookie object.

#### Example

```javascript
Cookie.count();
```

### touch

Update the expiration time of a key in the Cookie object.

#### Parameters

- **key** - String containing the name of the key.
- **ttl** *(optional)* - Time to live in seconds for the key. Defaults to `null` (no expiration) or equal to [Cookie.ttl](#ttl) value.
- **[attributes](#cookie-attributes)** *(optional)* - Cookie attributes (only `path` is allowed).

#### Example

```javascript
Cookie.touch('key', 60);
```

Optionally, you can pass attributes to the `touch` method to update cookies from a specific path:

```javascript
Cookie.touch('key', 60, { path: '/' });
```

### dump

Print the value associated with a key to the console.

#### Parameters

- **key** - String containing the name of the key.

#### Example

```javascript
Cookie.dump('key');
```


### fake

Replace the Cookie instance with a fake implementation. This is particularly useful for testing purposes where you want to avoid interacting with the actual browser's Cookie.

#### Example

```javascript
Cookie.fake();
```

### restore

Restore the original Cookie instance. This is typically used after [fake()](#fake) to return to using the real browser's Cookie.

#### Example

```javascript
Cookie.restore();
```

### isFake

Check if a fake Cookie instance is currently being used.

#### Example

```javascript
if (Cookie.isFake()) {
    // ...
}
```

### setFakeLocation

Sets the `location` object to a fake implementation. This is particularly useful for testing purposes where you want to avoid interacting with the actual browser's location.

#### Parameters

- **location** - An object containing `host` and `pathname` properties. It is used to simulate the location of the current page when using the fake Cookie instance.

#### Example

```javascript
Cookie.setFakeLocation({
    host    : 'example.com',
    pathname: '/test'
});
```

In case the Cookie is not faked, `setFakeLocation` will throw an error.

#### Example

```javascript
if (Cookie.isFake()) {
    // ...
}
```


### ttl

Define a global Time-To-Live (TTL) in seconds for all items saved using the [Cookie.set](#set) or [Cookie.touch](#touch) method, without specifying a TTL for each item. This can be particularly useful for applications needing a consistent expiry policy for most stored data.

#### Example

```javascript
Cookie.ttl(7200);
```

If a default TTL has been set using `Cookie.ttl`, it will be applied to all items set without a specified TTL.

### Cookie Attributes

When setting cookies, you can provide the following attributes:

- `ttl` - Time to live in seconds (overrides expires if both are provided)
- `expires` - Date object or date string for cookie expiration
- `path` - Path for the cookie (defaults to current path)
- `domain` - Domain for the cookie (defaults to current domain)
- `sameSite` - SameSite attribute (`Strict`, `Lax`, or `None`)
- `secure` - Whether the cookie should only be sent over secure protocols

>**Note:** If `sameSite` is set to `None`, the `secure` attribute must be set to `true`.

## Events

In case you would like to execute a callback on Cookie Storage operation, you may listen for various events dispatched by
the Cookie Storage.

| Type            | Event           |
|-----------------|-----------------|
| `retrieving`    | RetrievingKey   |
| `hit`           | KeyHit          |
| `missed`        | KeyMissed       |
| `writing`       | WritingKey      |
| `written`       | KeyWritten      |
| `write-failed`  | KeyWriteFailed  |
| `forgot`        | KeyForgotten    |
| `forgot-failed` | KeyForgotFailed |
| `flushing`      | StorageFlushing |
| `flushed`       | StorageFlushed  |

### listen

Register an event listener for one or more storage events.

#### Parameters

- **events** - String or an object of strings containing the type and a callback function.
- **callback** - Function to be executed when the event is dispatched in case an event is passed as a string.

#### Example

```javascript
Cookie.listen('retrieving', (event) => {
    console.log(event);
});
```

In case you would like to register multiple events, you can pass an object containing the type and a callback function:

```javascript
Cookie.listen({
    'retrieving': (event) => {
        // ...
    },
    'hit': (event) => {
        // ...
    },
    'missed': (event) => {
        // ...
    },
    'writing': (event) => {
        // ...
    },
    'written': (event) => {
        // ...
    },
    'write-failed': (event) => {
        // ...
    },
    'forgot': (event) => {
        // ...
    },
    'forgot-failed': (event) => {
        // ...
    },
    'flushing': (event) => {
        // ...
    },
    'flushed': (event) => {
        // ...
    },
});
```

Conveniently, you can also use the following methods to register event listeners for a specific event:

### onRetrieving

Triggered when a key is about to be retrieved from storage.

```javascript
Cookie.onRetrieving((event) => {
  // ...
});
```

### onHit

Triggered when a requested key is found in the storage.

```javascript
Cookie.onHit((event) => {
  // ...
});
```

### onMissed

Triggered when a requested key is not found in the storage.

```javascript
Cookie.onMissed((event) => {
  // ...
});
```

### onWriting

Triggered when a key is about to be written to storage.

```javascript
Cookie.onWriting((event) => {
  // ...
});
```

### onWritten

Triggered after a key has been successfully written to storage.

```javascript
Cookie.onWritten((event) => {
  // ...
});
```

### onWriteFailed

Triggered when writing a key to storage fails.

```javascript
Cookie.onWriteFailed((event) => {
  // ...
});
```

### onForgot

Triggered when a key is successfully removed from storage.

```javascript
Cookie.onForgot((event) => {
  // ...
});
```

### onForgotFailed

Triggered when removing a key from storage fails.

```javascript
Cookie.onForgotFailed((event) => {
  // ...
});
```

### onFlushing

Triggered when the storage is about to be cleared.

```javascript
Cookie.onFlushing((event) => {
  // ...
});
```

### onFlushed

Triggered after the storage has been successfully cleared.

```javascript
Cookie.onFlushed((event) => {
    // ...
});
```
