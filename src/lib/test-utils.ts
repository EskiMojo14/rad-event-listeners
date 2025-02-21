import type {
  EventListenerOrEventListenerObjectFor,
  EventTargetLike,
} from "./types";

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

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (
  x: infer I,
) => void
  ? I
  : never;

type EventHandlers<EventMap extends Record<string, Event>> = {
  [K in keyof EventMap as `on${K & string}`]:
    | ((ev: EventMap[K]) => void)
    | null;
} & {
  addEventListener: UnionToIntersection<
    {
      [K in keyof EventMap]: (
        type: K,
        listener: EventListenerOrEventListenerObjectFor<any, EventMap[K]>,
        options?: boolean | AddEventListenerOptions,
      ) => void;
    }[keyof EventMap]
  >;
};

export class ToggleTarget
  extends EventTarget
  implements
    EventHandlers<{
      toggle: ToggleEvent;
      enabled: EnabledEvent;
    }>
{
  addEventListener(
    type: "toggle",
    callback: EventListenerOrEventListenerObjectFor<ToggleTarget, ToggleEvent>,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: "enabled",
    callback: EventListenerOrEventListenerObjectFor<ToggleTarget, EnabledEvent>,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    super.addEventListener(type, callback, options);
  }

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
  #listeners: Record<string, Set<EventListenerOrEventListenerObject>> = {};
  addEventListener(
    type: "toggle",
    callback: EventListenerOrEventListenerObjectFor<ToggleTarget, ToggleEvent>,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: "enabled",
    callback: EventListenerOrEventListenerObjectFor<ToggleTarget, EnabledEvent>,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(type: string, callback: EventListenerOrEventListenerObject) {
    (this.#listeners[type] ??= new Set()).add(callback);
  }
  dispatchEvent(ev: Event) {
    for (const listener of this.#listeners[ev.type] ?? []) {
      try {
        if (typeof listener === "function") {
          listener.call(this, ev);
        } else {
          listener.handleEvent(ev);
        }
      } catch {
        // empty
      }
    }
  }
  ontoggle: ((ev: ToggleEvent) => void) | null = null;
  onenabled: ((ev: EnabledEvent) => void) | null = null;
}
