import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { PairedNumberInput } from "./paired-number-input";

const setup = (value = 60) => {
  const onCommit = vi.fn();
  const view = render(
    <PairedNumberInput value={value} min={10} max={100} step={1} onCommit={onCommit} aria-label="Nhập" />,
  );
  return { onCommit, input: screen.getByLabelText("Nhập") as HTMLInputElement, ...view };
};

describe("PairedNumberInput", () => {
  test("shows the committed value when not editing, and follows prop changes (slider moves)", () => {
    const { input, rerender } = setup(60);
    expect(input).toHaveValue(60);
    rerender(<PairedNumberInput value={75} min={10} max={100} step={1} onCommit={() => {}} aria-label="Nhập" />);
    expect(input).toHaveValue(75);
  });

  test("applies an in-range value immediately while typing (live preview)", async () => {
    const user = userEvent.setup();
    const { input, onCommit } = setup(60);
    await user.clear(input);
    await user.type(input, "42");
    expect(onCommit).toHaveBeenLastCalledWith(42);
  });

  test("does not preview an out-of-range value, but clamps it on blur", async () => {
    const user = userEvent.setup();
    const { input, onCommit } = setup(60);
    await user.clear(input);
    await user.type(input, "500");
    expect(onCommit).not.toHaveBeenCalledWith(500);
    await user.tab(); // blur → change semantics
    expect(onCommit).toHaveBeenLastCalledWith(100);
  });

  test("Enter commits like blur and clamps to the minimum", async () => {
    const user = userEvent.setup();
    const { input, onCommit } = setup(60);
    await user.clear(input);
    await user.type(input, "3{Enter}");
    expect(onCommit).toHaveBeenLastCalledWith(10);
  });

  test("an empty box falls back to the minimum on blur (legacy Number('') === 0 behaviour)", async () => {
    const user = userEvent.setup();
    const { input, onCommit } = setup(60);
    await user.clear(input);
    await user.tab();
    expect(onCommit).toHaveBeenLastCalledWith(10);
  });
});
