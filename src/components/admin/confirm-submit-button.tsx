'use client';

// Client component: a plain `<button type="submit">` inside a Server Action
// form has no way to ask "are you sure?" first without JavaScript. Used for
// the one destructive, irreversible action on the analytics page - resetting
// all visit data.

import type { MouseEvent, ReactNode } from 'react';

export function ConfirmSubmitButton({
  confirmMessage,
  children,
  className,
}: {
  confirmMessage: string;
  children: ReactNode;
  className?: string;
}) {
  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!window.confirm(confirmMessage)) {
      event.preventDefault();
    }
  };

  return (
    <button type="submit" onClick={onClick} className={className}>
      {children}
    </button>
  );
}
