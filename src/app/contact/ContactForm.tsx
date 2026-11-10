'use client';

import * as React from 'react';
import { Check } from '@/components/ui/icons';
import { useSession } from '@/components/app/SessionProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function ContactForm() {
  const { user } = useSession();
  const [sent, setSent] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const entry = {
      name: String(form.get('name') || ''),
      email: String(form.get('email') || ''),
      message: String(form.get('message') || ''),
      at: new Date().toISOString(),
    };
    const key = 'tg.messages.v1';
    const current = JSON.parse(window.localStorage.getItem(key) || '[]') as unknown[];
    window.localStorage.setItem(key, JSON.stringify([entry, ...current]));
    setSent(true);
    setBusy(false);
    event.currentTarget.reset();
  };

  if (sent) {
    return (
      <div className="py-2">
        <span className="grid size-9 place-items-center rounded-full bg-[#101828] text-white">
          <Check className="size-3.5" strokeWidth={2} aria-hidden />
        </span>
        <p className="mt-4 text-base font-semibold tracking-tight text-[#101828]">Message sent</p>
        <p className="mt-1 text-sm leading-6 text-[#667085]">
          We’ll reply to the email you used.
        </p>
        <button
          type="button"
          className="mt-5 text-sm font-medium text-[#667085] hover:text-[#101828]"
          onClick={() => setSent(false)}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            defaultValue={user?.name ?? ''}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            defaultValue={user?.email ?? ''}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="How can we help?"
          className="min-h-32 resize-y"
        />
      </div>
      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-xs leading-5 text-[#98a2b3]">We usually reply within one business day.</p>
        <Button type="submit" size="sm" loading={busy} disabled={busy}>
          {busy ? 'Sending' : 'Send message'}
        </Button>
      </div>
    </form>
  );
}
