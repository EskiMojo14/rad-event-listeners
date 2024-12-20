import { describe, expect, it, vi } from "vitest";
import { ToggleEvent, ToggleTarget } from "./test-utils";
import type { EventListenerObjectFor } from "./types";
import { radEventListeners } from ".";

describe("radEventListeners", () => {
  it("should add event listeners, which can be individually removed", () => {
    const target = new ToggleTarget();
    const onToggle = vi.fn();
    const onEnabled = vi.fn();
    const unsub = radEventListeners(target, {
      toggle: onToggle,
      enabled: onEnabled,
    });

    target.toggle();
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWithContext(target);
    expect(onToggle).toHaveBeenCalledWith(expect.any(ToggleEvent));
    expect(onEnabled).toHaveBeenCalledTimes(1);

    unsub.toggle();
    target.toggle();
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onEnabled).toHaveBeenCalledTimes(1);

    target.toggle();
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onEnabled).toHaveBeenCalledTimes(2);

    unsub();
    target.toggle();
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onEnabled).toHaveBeenCalledTimes(2);
  });
  it("should add event listeners with options", () => {
    const target = new ToggleTarget();
    const onToggle = vi.fn();
    const handler = {
      handleEvent: onToggle,
      options: { once: true },
    };
    const unsub = radEventListeners(target, {
      toggle: handler,
    });

    target.toggle();
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWithContext(handler);
    expect(onToggle).toHaveBeenCalledWith(expect.any(ToggleEvent));

    target.toggle();
    expect(onToggle).toHaveBeenCalledTimes(1);

    unsub();
    target.toggle();
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
  it("should add event listeners with global options", () => {
    const target = new ToggleTarget();
    const onToggle = vi.fn();
    const unsub = radEventListeners(
      target,
      {
        toggle: onToggle,
      },
      { once: true },
    );

    target.toggle();
    expect(onToggle).toHaveBeenCalledTimes(1);

    target.toggle();
    expect(onToggle).toHaveBeenCalledTimes(1);

    unsub();
    target.toggle();
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
  it("should allow custom handler objects", () => {
    class Handler implements EventListenerObjectFor<Event> {
      event: Event | null = null;
      handleEvent(this: this, e: Event) {
        this.event = e;
      }
      options = { once: true };
    }
    const target = new ToggleTarget();
    const handler = new Handler();
    radEventListeners(target, {
      toggle: handler,
    });

    target.toggle();
    expect(handler.event).toBeInstanceOf(ToggleEvent);
  });
});
