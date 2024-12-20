# rad-event-listeners

Utility to add multiple event listeners, which can be individually removed, or all at once.

Inspired by [rad-event-listener](https://github.com/JLarky/rad-event-listener).

## Usage

```ts
import { radEventListeners } from "rad-event-listeners";

const unsub = radEventListeners(
  window,
  {
    click: (ev) => console.log(ev),
    keydown: {
      handleEvent: (ev) => console.log(ev),
      // Event options
      options: { once: true },
    },
  },
  // Global options
  { passive: true },
);

unsub.click();
unsub();
```

## Requirements

This uses [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)s (and specifically [AbortSignal.any](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any_static)) to manage event listener removal. Check the MDN docs for browser/environment support.

> [!WARNING]
> Environments that replace Node's AbortSignal with their own, such as JSDOM, may not support this static method.

## Typescript

Similarly to [rad-event-listener](https://github.com/JLarky/rad-event-listener), this library attempts to infer the event types from the event target, using the `on${EventName}` properties.

If you're using a target that doesn't specify these properties, all event names will be allowed, and the event type will default to `Event`. You can then specify the event type manually.

```ts
import { radEventListeners } from "rad-event-listeners";

const unsub = radEventListeners(customTarget, {
  // This will default the event type to Event
  something(ev) {
    console.log(ev);
  },
  // but you can specify it manually
  custom(ev: CustomEvent) {
    console.log(ev.detail);
  },
});
```
