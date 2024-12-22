import { describe, expect, it, vi } from "vitest";
import { EnabledEvent, ToggleEvent, ToggleTarget } from "./test-utils";
import { radEventListeners } from ".";

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
