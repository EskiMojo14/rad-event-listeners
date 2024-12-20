import { describe, expectTypeOf, it } from "vitest";
import { radEventListeners } from ".";
import { ToggleEvent, ToggleTarget, EnabledEvent } from "./test-utils";
import { EventListenerObjectFor } from "./types";

describe("radEventListeners", () => {
  it("infers correct event types", () => {
    const target = new ToggleTarget();
    const unsub = radEventListeners(target, {
      toggle(e) {
        expectTypeOf(this).toEqualTypeOf<ToggleTarget>();
        expectTypeOf(e).toEqualTypeOf<ToggleEvent>();
      },
      enabled: {
        handleEvent(e) {
          expectTypeOf(this).toEqualTypeOf<
            EventListenerObjectFor<EnabledEvent>
          >();
          expectTypeOf(e).toEqualTypeOf<EnabledEvent>();
        },
      },

      // not an event
      // @ts-expect-error
      something() {},
    });
    expectTypeOf(unsub).toMatchTypeOf<() => void>();
    expectTypeOf(unsub.toggle).toMatchTypeOf<() => void>();
    expectTypeOf(unsub.enabled).toMatchTypeOf<() => void>();
    expectTypeOf(unsub).not.toHaveProperty("something");
  });

  it("defaults to allowing all events if unable to infer", () => {
    const target = new EventTarget();
    const unsub = radEventListeners(target, {
      toggle(e: ToggleEvent) {
        expectTypeOf(e).toEqualTypeOf<ToggleEvent>();
      },
      enabled: {
        handleEvent(e) {
          expectTypeOf(e).toEqualTypeOf<Event>();
        },
      },
      something: {
        handleEvent(e: ToggleEvent) {
          expectTypeOf(e).toEqualTypeOf<ToggleEvent>();
        },
      },
    });
    expectTypeOf(unsub).toMatchTypeOf<() => void>();
    expectTypeOf(unsub.toggle).toMatchTypeOf<() => void>();
    expectTypeOf(unsub.enabled).toMatchTypeOf<() => void>();
    expectTypeOf(unsub.something).toMatchTypeOf<() => void>();
  });
});
