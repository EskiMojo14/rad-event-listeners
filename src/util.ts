export const nonNullable = <T>(x: T) => x != null;

export const ensureOptsObject = (
  opts: boolean | AddEventListenerOptions = {},
) => (typeof opts === "boolean" ? { capture: opts } : opts);
