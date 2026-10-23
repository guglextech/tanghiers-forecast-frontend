'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export function ConfirmDrawer({
  open,
  title,
  description,
  subject,
  confirmLabel,
  busy,
  destructive,
  disabled,
  onClose,
  onConfirm,
  children,
}: {
  open: boolean;
  title: string;
  description: string;
  subject?: { title: string; detail?: string };
  confirmLabel: string;
  busy?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children?: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 px-5 py-5">
          {subject ? (
            <div className="rounded-xl border border-[#eef0f3] bg-[#f9fafb] px-4 py-3">
              <p className="text-sm font-medium text-[#101828]">{subject.title}</p>
              {subject.detail ? <p className="mt-1 text-sm text-[#667085]">{subject.detail}</p> : null}
            </div>
          ) : null}
          {children}
        </div>
        <SheetFooter className="flex-row justify-end">
          <Button type="button" variant="outline" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={destructive ? 'destructive' : 'default'}
            disabled={disabled || busy}
            onClick={onConfirm}
          >
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
