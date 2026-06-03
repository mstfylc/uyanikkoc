import type { ReactNode } from "react";

export type ButtonProps = {
  children: ReactNode;
};

export function Button({ children }: ButtonProps) {
  return <button type="button">{children}</button>;
}
