export interface EventTargetLike {
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
}

export type EventListenerFor<T extends EventTargetLike, E extends Event> = (
  this: T,
  ev: E,
) => void;

export type BivariantEventListenerFor<
  T extends EventTargetLike,
  E extends Event,
> = {
  bivariantHack(this: T, ev: E): void;
}["bivariantHack"];

export interface EventListenerObjectFor<E extends Event> {
  handleEvent(this: this, ev: E): void;
  options?: boolean | AddEventListenerOptions;
}

export type EventListenerOrEventListenerObjectFor<
  T extends EventTargetLike,
  E extends Event,
> = EventListenerFor<T, E> | EventListenerObjectFor<E>;

export type EventNames<T extends EventTargetLike> = {
  [K in keyof T]: K extends `on${infer E}` ? E : never;
}[keyof T];

export type CanInferEvents<T extends EventTargetLike> = [
  EventNames<T>,
] extends [never]
  ? false
  : true;

export type EventForName<T extends EventTargetLike, E extends string> =
  T extends Partial<
    Record<`on${E}`, ((ev: infer F extends Event) => void) | null>
  >
    ? F
    : Event;

export type HandlerMap<T extends EventTargetLike, E extends string> =
  CanInferEvents<T> extends true
    ? {
        [K in E]: EventListenerOrEventListenerObjectFor<T, EventForName<T, K>>;
      }
    : Record<
        E,
        EventListenerObjectFor<Event> | BivariantEventListenerFor<T, Event>
      >;
