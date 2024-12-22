import type {
  CanInferEvents,
  EventListenerOrEventListenerObjectFor,
  EventTypes,
  EventTargetLike,
  HandlerMap,
  EventListenerTuple,
} from "./types";
import { ensureOptsObject, nonNullable } from "./util";

export {
  EventForType,
  EventListenerFor,
  EventListenerObjectFor,
  EventListenerOrEventListenerObjectFor,
  EventTargetLike,
  EventTypes,
  EventListenerTuple,
} from "./types";

export function radEventListeners<
  T extends EventTargetLike,
  E extends CanInferEvents<T> extends true ? EventTypes<T> : string,
>(
  target: T,
  handlers: HandlerMap<T, E>,
  globalOpts?: boolean | AddEventListenerOptions,
): (() => void) & Record<E, () => void> {
  const globalOptions = ensureOptsObject(globalOpts);
  const globalAc = new AbortController();
  const abortsByEvent: Record<string, () => void> = {};

  for (const [event, handlerEntry] of Object.entries<
    EventListenerTuple<EventListenerOrEventListenerObjectFor<T, any>>
  >(handlers)) {
    const abortController = new AbortController();
    const [handler, handlerOptions] = Array.isArray(handlerEntry)
      ? handlerEntry
      : [handlerEntry];

    const eventOptions = ensureOptsObject(handlerOptions);

    const signals = [
      globalAc.signal,
      abortController.signal,
      globalOptions.signal,
      eventOptions.signal,
    ].filter(nonNullable);

    const options = {
      ...globalOptions,
      ...eventOptions,
      signal: AbortSignal.any(signals),
    };

    abortsByEvent[event] = () => {
      abortController.abort();
    };

    target.addEventListener(event, handler, options);
  }
  return Object.assign(() => {
    globalAc.abort();
  }, abortsByEvent);
}

export function rads<T extends EventTargetLike>(
  target: T,
  setup: (addEventListener: T["addEventListener"]) => void,
  globalOpts?: boolean | AddEventListenerOptions,
) {
  const ac = new AbortController();
  let called = false as boolean;
  const globalOptions = ensureOptsObject(globalOpts);
  setup((type, listener, options) => {
    called = true;
    options = ensureOptsObject(options);
    const signals = [ac.signal, globalOptions.signal, options.signal].filter(
      nonNullable,
    );
    target.addEventListener(type, listener, {
      ...globalOptions,
      ...options,
      signal: signals.length === 1 ? signals[0] : AbortSignal.any(signals),
    });
  });
  if (!called) {
    throw new Error("Expected addEventListener to be called at least once");
  }
  return () => {
    ac.abort();
  };
}
