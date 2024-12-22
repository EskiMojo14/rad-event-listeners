import { describe, expect, it, vi } from "vitest";
import { EnabledEvent, ToggleEvent, ToggleTarget } from "./test-utils";
import { radEventListeners, rads } from ".";

describe("radEventListeners", () => {
  it("should add event listeners, which can be individually removed", () => {
    const target = new ToggleTarget();
    const onToggle = vi.fn();
    const onEnabled = vi.fn();
    const enabledHandler = { handleEvent: onEnabled };
    const unsub = radEventListeners(target, {
      toggle: onToggle,
      enabled: enabledHandler,
    });

    target.toggle();
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWithContext(target);
    expect(onToggle).toHaveBeenCalledWith(expect.any(ToggleEvent));
    expect(onEnabled).toHaveBeenCalledTimes(1);
    expect(onEnabled).toHaveBeenCalledWithContext(enabledHandler);
    expect(onEnabled).toHaveBeenCalledWith(expect.any(EnabledEvent));

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
    const unsub = radEventListeners(target, {
      toggle: [onToggle, { once: true }],
    });

    target.toggle();
    expect(onToggle).toHaveBeenCalledTimes(1);
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
});

describe("rads", () => {
  it("can setup multiple event listeners and returns a single unsubscribe function", () => {
    const target = new ToggleTarget();
    const onToggle = vi.fn();
    const onEnabled = vi.fn();
    const enabledHandler = { handleEvent: onEnabled };
    const unsub = rads(target, (add) => {
      add("toggle", onToggle);
      add("enabled", enabledHandler);
    });

    target.toggle();
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWithContext(target);
    expect(onToggle).toHaveBeenCalledWith(expect.any(ToggleEvent));
    expect(onEnabled).toHaveBeenCalledTimes(1);
    expect(onEnabled).toHaveBeenCalledWithContext(enabledHandler);
    expect(onEnabled).toHaveBeenCalledWith(expect.any(EnabledEvent));

    unsub();
    target.toggle();
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onEnabled).toHaveBeenCalledTimes(1);
  });
  it("allows global options", () => {
    const target = new ToggleTarget();
    const onToggle = vi.fn();
    const unsub = rads(
      target,
      (add) => {
        add("toggle", onToggle);
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
  it("merges global abort signals", () => {
    const target = new ToggleTarget();
    const onToggle = vi.fn();
    const ac = new AbortController();
    rads(
      target,
      (add) => {
        add("toggle", onToggle);
      },
      { signal: ac.signal },
    );
    target.toggle();
    expect(onToggle).toHaveBeenCalledTimes(1);

    ac.abort();
    target.toggle();
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
  it("merges event abort signals", () => {
    const target = new ToggleTarget();
    const onToggle = vi.fn();
    const ac = new AbortController();
    rads(target, (add) => {
      add("toggle", onToggle, { signal: ac.signal });
    });
    target.toggle();
    expect(onToggle).toHaveBeenCalledTimes(1);

    ac.abort();
    target.toggle();
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
  it("throws if no listeners were added", () => {
    const target = new ToggleTarget();
    expect(() =>
      rads(target, () => {
        // empty
      }),
    ).toThrowError("Expected addEventListener to be called at least once");
  });
});
