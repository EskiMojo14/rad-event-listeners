import type {
  CanInferEvents,
  EventListenerOrEventListenerObjectFor,
  EventTypes,
  EventTargetLike,
  HandlerMap,
  EventListenerTuple,
} from "./types";
import { ensureOptsObject, mergeOptions } from "./util";

export {
  EventForType,
  EventListenerFor,
  BivariantEventListenerFor,
  EventListenerObjectFor,
  EventListenerOrEventListenerObjectFor,
  EventTargetLike,
  EventTypes,
  EventListenerTuple,
  HandlerMap,
} from "./types";

export function radEventListeners<
  T extends EventTargetLike,
  E extends CanInferEvents<T> extends true ? EventTypes<T> : string,
>(
  target: T,
  handlers: HandlerMap<T, E>,
  globalOpts?: boolean | AddEventListenerOptions,
): (() => void) & Record<E, () => void> {
  globalOpts = ensureOptsObject(globalOpts);

  const globalAc = new AbortController();
  const abortsByEvent: Record<string, () => void> = {};

  for (const [event, handlerEntry] of Object.entries<
    EventListenerTuple<EventListenerOrEventListenerObjectFor<T, any>>
  >(handlers)) {
    const abortController = new AbortController();

    abortsByEvent[event] = () => {
      abortController.abort();
    };

    const [handler, handlerOpts] = Array.isArray(handlerEntry)
      ? handlerEntry
      : [handlerEntry];

    target.addEventListener(
      event,
      handler,
      mergeOptions(globalOpts, ensureOptsObject(handlerOpts), [
        abortController.signal,
        globalAc.signal,
      ]),
    );
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
  globalOpts = ensureOptsObject(globalOpts);
  setup((type, listener, options) => {
    called = true;
    target.addEventListener(
      type,
      listener,
      mergeOptions(globalOpts, ensureOptsObject(options), [ac.signal]),
    );
  });
  if (!called) {
    throw new Error("Expected at least one event listener to be added");
  }
  return () => {
    ac.abort();
  };
}
