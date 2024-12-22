import type { EventTargetLike } from "./types";

export class EnabledEvent extends Event {
  constructor() {
    super("enabled");
  }
}

export class ToggleEvent extends Event {
  constructor(public enabled: boolean) {
    super("toggle");
  }
}

type EventHandlers<EventMap extends Record<string, Event>> = {
  [K in keyof EventMap as `on${K & string}`]:
    | ((ev: EventMap[K]) => void)
    | null;
};

export class ToggleTarget
  extends EventTarget
  implements
    EventHandlers<{
      toggle: ToggleEvent;
      enabled: EnabledEvent;
    }>
{
  enabled = false;
  toggle() {
    this.enabled = !this.enabled;

    this.dispatchEvent(new ToggleEvent(this.enabled));

    if (this.enabled) this.dispatchEvent(new EnabledEvent());
  }
  ontoggle: ((ev: ToggleEvent) => void) | null = null;
  onenabled: ((ev: EnabledEvent) => void) | null = null;
}

export class ToggleTargetLike
  implements
    EventTargetLike,
    EventHandlers<{
      toggle: ToggleEvent;
      enabled: EnabledEvent;
    }>
{
  #listeners: Record<string, Set<(ev: Event) => void>> = {};
  addEventListener(type: "toggle" | "enabled", listener: (ev: Event) => void) {
    (this.#listeners[type] ??= new Set()).add(listener);
  }
  dispatchEvent(ev: Event) {
    for (const listener of this.#listeners[ev.type] ?? []) {
      listener(ev);
    }
  }
  ontoggle: ((ev: ToggleEvent) => void) | null = null;
  onenabled: ((ev: EnabledEvent) => void) | null = null;
}
