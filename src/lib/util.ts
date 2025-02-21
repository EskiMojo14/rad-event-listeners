export const nonNullable = <T>(x: T) => x != null;

export const ensureOptsObject = (
  opts: boolean | AddEventListenerOptions = {},
) => (typeof opts === "boolean" ? { capture: opts } : opts);

export const mergeOptions = (
  globalOpts: AddEventListenerOptions,
  eventOpts: AddEventListenerOptions,
  extraSignals: Array<AbortSignal>,
) => {
  const signals = [globalOpts.signal, eventOpts.signal, ...extraSignals].filter(
    nonNullable,
  );
  return {
    ...globalOpts,
    ...eventOpts,
    signal: signals.length === 1 ? signals[0] : AbortSignal.any(signals),
  };
};
