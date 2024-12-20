import type {
  CanInferEvents,
  EventListenerOrEventListenerObjectFor,
  EventTypes,
  EventTargetLike,
  HandlerMap,
} from "./types";
import { ensureOptsObject, nonNullable } from "./util";

export {
  EventForType,
  EventListenerFor,
  EventListenerObjectFor,
  EventListenerOrEventListenerObjectFor,
  EventTargetLike,
  EventTypes,
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

  for (const [event, handler] of Object.entries<
    EventListenerOrEventListenerObjectFor<T, any>
  >(handlers)) {
    const abortController = new AbortController();

    const eventOptions =
      typeof handler === "function"
        ? undefined
        : ensureOptsObject(handler.options);

    const signals = [
      globalAc.signal,
      abortController.signal,
      globalOptions.signal,
      eventOptions?.signal,
    ].filter(nonNullable);

    const options = {
      ...globalOptions,
      ...eventOptions,
      signal: AbortSignal.any(signals),
    };

    abortsByEvent[event] = () => { abortController.abort(); };

    target.addEventListener(event, handler, options);
  }
  return Object.assign(() => { globalAc.abort(); }, abortsByEvent);
}
