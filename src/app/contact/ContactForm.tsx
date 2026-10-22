'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function ContactForm() {
  const [sent, setSent] = React.useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    event.currentTarget.reset();
  };

  if (sent) {
    return (
      <div>
        <p className="text-sm font-medium text-[#101828]">Message sent.</p>
        <p className="mt-1 text-sm text-[#98a2b3]">We’ll reply to the email you used.</p>
        <button
          type="button"
          className="mt-4 text-sm font-medium text-[#667085] hover:text-[#101828]"
          onClick={() => setSent(false)}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" autoComplete="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required rows={5} />
      </div>
      <div className="flex justify-end">
        <Button type="submit" size="sm">
          Send
        </Button>
      </div>
    </form>
  );
}
