"use client";

import { useEffect, useState } from "react";

type UkNumStepperProps = {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  size?: "sm" | "md";
};

export function UkNumStepper({
  value,
  onChange,
  step = 10,
  min = 0,
  max = 9999,
  size = "md",
}: UkNumStepperProps) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  function commit(raw: string) {
    let next = parseInt(raw.replace(/[^\d]/g, ""), 10);
    if (Number.isNaN(next)) {
      next = min;
    }
    next = Math.max(min, Math.min(max, next));
    onChange(next);
    setText(String(next));
  }

  return (
    <div
      className={`stepper${size === "sm" ? " stepper-sm" : ""}`}
      onClick={(event) => event.stopPropagation()}
    >
      <button type="button" onClick={() => commit(String(value - step))} aria-label="Azalt">
        −
      </button>
      <input
        className="stepper-input tnum"
        value={text}
        onChange={(event) => setText(event.target.value.replace(/[^\d]/g, ""))}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            commit(event.currentTarget.value);
            event.currentTarget.blur();
          }
        }}
        inputMode="numeric"
        aria-label="Deger"
      />
      <button type="button" onClick={() => commit(String(value + step))} aria-label="Artir">
        +
      </button>
    </div>
  );
}
