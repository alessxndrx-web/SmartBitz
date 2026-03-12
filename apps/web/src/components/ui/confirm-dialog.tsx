'use client';

import { useState } from 'react';
import { Button } from './button';

export function ConfirmDialog({
  triggerLabel,
  title,
  description,
  confirmLabel = 'Confirmar',
}: {
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>{triggerLabel}</Button>
      {open ? (
        <div className="dialog-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <div className="dialog" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <h3>{title}</h3>
            <p>{description}</p>
            <div className="row">
              <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={() => setOpen(false)}>{confirmLabel}</Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
