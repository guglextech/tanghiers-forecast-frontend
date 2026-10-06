'use client';

import * as React from 'react';
import { SITE } from '@/data/site';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const fieldClass = 'rounded-xl border-[#d0d5dd] bg-white px-3.5';

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
      <div className="rounded-2xl border border-[#e6e8ee] px-5 py-5">
        <p className="font-medium">Message received.</p>
        <p className="mt-2 text-sm leading-6 text-[#667085]">
          The desk can also be reached at {SITE.email}.
        </p>
        <Button type="button" variant="outline" className="mt-4 h-10 border-[#d0d5dd]" onClick={() => setSent(false)}>
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required className={`h-12 ${fieldClass}`} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required className={`h-12 ${fieldClass}`} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required rows={5} className={fieldClass} />
      </div>
      <Button type="submit" className="h-11">
        Send message
      </Button>
    </form>
  );
}
