
# Bloc Implementation

This repository contains an implementation of a **Bloc** pattern for state management using **RxJS**. It supports dispatching events, managing subscriptions, handling errors, and provides an `autoExec` option to manually execute events when needed.

## Features

- **Event dispatching**: Dispatch events and handle responses asynchronously.
- **Auto-execution**: Automatically execute an event when dispatched or manually control when it executes using `autoExec`.
- **Error handling**: Handle errors gracefully during the dispatch process.
- **Abort support**: Cancel in-progress events with the `abort` function.
- **Timeout support**: Set a timeout to handle events that take too long.
- **Multiple subscriptions**: Support multiple subscriptions for the same event.
- **Auto unsubscribe**: Automatically unsubscribe when the event completes.

## Installation

To use the Bloc implementation, you'll need to install **RxJS**:

```bash
npm install rxjs
```

## Usage

### Basic Setup

First, create a `Bloc` class instance:

```ts
import Bloc from './bloc';

const userBloc = new Bloc();
```

### Dispatching an Event

You can dispatch an event like this:

```ts
const fetchUserDispatcher = userBloc.dispatch("fetchUser", { autoExec: false });
```

In this case, the `autoExec` option is set to `false`, meaning the event will not execute automatically.

### Dispatch Options

#### `autoExec`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: If set to `false`, the event will not automatically execute. You can manually trigger the event using the `exec()` method.

#### `autoUnsubscribe`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: If set to `true`, the subscription will automatically unsubscribe when the event completes or an error occurs.

#### `multiple`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: If set to `true`, allows multiple active subscriptions for the same event.

#### `timeout`
- **Type**: `number`
- **Default**: `5000`
- **Description**: Timeout duration in milliseconds. If the event takes longer than this to complete, it will trigger an error.

### Manually Executing the Event

You can manually execute the dispatched event using the `exec()` method:

```ts
// Manually execute the event after component mounts
onMount(() => fetchUserDispatcher.exec());

// Manually execute the event after a delay
setTimeout(() => {
  fetchUserDispatcher.exec();
}, 10000);
```

### Handling Event Responses

You can subscribe to the event's responses (next values and errors) by using the `subscribe` method:

```ts
fetchUserDispatcher.subscribe({
  next: (value) => {
    console.log('User data fetched:', value);
  },
  error: (err) => {
    console.error('Error fetching user data:', err);
  }
});
```

### Aborting an Event

If you need to abort an event, you can use the `abort` method:

```ts
fetchUserDispatcher.abort();
```

This will immediately stop the event logic from running, and it will notify any subscribed error handlers that the event was aborted.

## Example

```ts
import { onMount, onDestroy } from 'svelte';
import Bloc from './bloc';

const userBloc = new Bloc();

// Dispatch with autoExec set to false
const fetchUserDispatcher = userBloc.dispatch("fetchUser", { autoExec: false });

// Manually execute the event when component mounts
onMount(() => fetchUserDispatcher.exec());

// Execute the event after 10 seconds
setTimeout(() => {
  fetchUserDispatcher.exec();
}, 10000);

// Subscribe to event results
fetchUserDispatcher.subscribe({
  next: (data) => {
    console.log("Data received:", data);
  },
  error: (err) => {
    console.error("Error occurred:", err);
  }
});

// Optionally, abort the event if needed
setTimeout(() => {
  fetchUserDispatcher.abort();
}, 5000);
```

### Full Dispatch Method Example

Here is an example of dispatching an event with multiple options:

```ts
const fetchUserDispatcher = userBloc.dispatch("fetchUser", { autoExec: false }, {
  autoUnsubscribe: true,
  multiple: false,
  timeout: 10000,
});

// Subscribe to event responses
fetchUserDispatcher.subscribe({
  next: (data) => {
    console.log("Fetched user data:", data);
  },
  error: (err) => {
    console.error("Error:", err);
  }
});

// Manually execute the event after a delay
setTimeout(() => {
  fetchUserDispatcher.exec();
}, 5000);
```

### Handling Multiple Subscriptions

If you want to allow multiple subscriptions to the same event, set the `multiple` option to `true`:

```ts
const fetchUserDispatcher1 = userBloc.dispatch("fetchUser", { autoExec: true }, { multiple: true });
const fetchUserDispatcher2 = userBloc.dispatch("fetchUser", { autoExec: true }, { multiple: true });

// You can now have multiple active subscriptions for the same event
fetchUserDispatcher1.subscribe({ next: data => console.log('Dispatcher 1:', data) });
fetchUserDispatcher2.subscribe({ next: data => console.log('Dispatcher 2:', data) });
```

### Timeout Example

You can set a timeout to automatically handle events that take too long to complete:

```ts
const fetchUserDispatcher = userBloc.dispatch("fetchUser", { autoExec: false }, { timeout: 3000 });

// Subscribe to event responses
fetchUserDispatcher.subscribe({
  next: (data) => {
    console.log('User data fetched:', data);
  },
  error: (err) => {
    console.error('Error:', err);
  }
});

// Manually execute the event after 2 seconds
setTimeout(() => {
  fetchUserDispatcher.exec();
}, 2000);
```

If the event takes longer than 3 seconds, an error will be triggered automatically.

## Methods

### `dispatch(eventName: string, options: object = {}, dispatchOptions: DispatchOptions = {})`

Dispatches an event. Accepts the following options:

- **eventName**: The name of the event being dispatched (e.g., `"fetchUser"`).
- **options**: Any additional options you want to pass along with the event (e.g., headers, payload).
- **dispatchOptions**:
    - `autoExec`: If set to `false`, the event will not automatically execute. Default is `true`.
    - `autoUnsubscribe`: If set to `true`, the subscription will automatically unsubscribe when the event completes. Default is `true`.
    - `multiple`: If set to `true`, allows multiple subscriptions to the same event.
    - `timeout`: Timeout duration in milliseconds (default is `5000ms`).

### `exec()`

Manually executes the event logic. Useful when `autoExec` is set to `false` and you want to trigger the event at a later time.

### `abort()`

Aborts the current event if it is still in progress. This will immediately stop the event and trigger an error for any subscribed error handlers.

### `subscribe(input: { next?: function, error?: function })`

Subscribes to the event. You can pass in `next` and `error` handlers to handle successful results and errors respectively.

### `dispose()`

Cleans up all active subscriptions and abort controllers.

## License

MIT