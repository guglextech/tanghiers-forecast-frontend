'use client';

import * as React from 'react';
import Link from 'next/link';
import { CircleDollarSign, Mail, Radio, Sparkles, Users } from 'lucide-react';
import { gameById, type Forecast } from '@/data/forecasts';
import { formatDateTime, formatLongDate } from '@/lib/dates';
import { listAccounts } from '@/lib/session';
import { formatMoney, planById } from '@/data/site';
import { useDesk } from '@/components/forecast/useDesk';
import { LoadingState } from '@/components/app/LoadingState';
import { cn } from '@/lib/utils';

function Pill({ children, tone }: { children: React.ReactNode; tone: 'ok' | 'wait' | 'muted' }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        tone === 'ok' && 'bg-[#ecfdf3] text-[#027a48]',
        tone === 'wait' && 'bg-[#fffaeb] text-[#b54708]',
        tone === 'muted' && 'bg-[#f2f4f7] text-[#475467]',
      )}
    >
      {children}
    </span>
  );
}

function toneFor(status: string): 'ok' | 'wait' | 'muted' {
  if (status === 'published' || status === 'active' || status === 'sent' || status === 'available') return 'ok';
  if (status === 'scheduled' || status === 'queued') return 'wait';
  return 'muted';
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white', className)}>
      {children}
    </div>
  );
}

function PageLead({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-[#667085] sm:text-[15px]">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function AdminOverview() {
  const desk = useDesk();
  const [accounts, setAccounts] = React.useState<ReturnType<typeof listAccounts>>([]);

  React.useEffect(() => {
    setAccounts(listAccounts());
  }, [desk]);

  if (!desk) return <LoadingState label="Loading the desk…" />;

  const active = accounts.filter((account) => account.subscriptionStatus === 'active').length;
  const published = desk.forecasts.filter((forecast) => forecast.status === 'published').length;
  const emails = desk.deliveries.filter((row) => row.channel === 'email' && row.status === 'sent').length;
  const sms = desk.deliveries.filter((row) => row.channel === 'sms' && row.status === 'queued').length;
  const paid = accounts.reduce(
    (sum, account) => sum + account.invoices.reduce((inner, invoice) => inner + invoice.amount, 0),
    0,
  );

  const stats = [
    { label: 'Active subscribers', value: String(active), icon: Users },
    { label: 'Published forecasts', value: String(published), icon: Sparkles },
    { label: 'Emails sent', value: String(emails), icon: Mail },
    { label: 'SMS queued', value: String(sms), icon: Radio },
    { label: 'Payments recorded', value: formatMoney(paid), icon: CircleDollarSign },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageLead
        title="Publishing desk"
        description="Create the day’s forecast, publish it now or on a schedule, and review who received it on the site, by email, and by SMS."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/forecasts/new"
              className="inline-flex h-10 items-center rounded-full bg-[#101828] px-4 text-sm font-semibold text-white sm:hidden"
            >
              New forecast
            </Link>
            <Link
              href="/admin/deliveries"
              className="inline-flex h-10 items-center rounded-full border border-[#d0d5dd] bg-white px-4 text-sm font-semibold"
            >
              Delivery log
            </Link>
          </div>
        }
      />
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-[#e6e8ee] bg-white px-4 py-4">
              <dt className="flex items-center gap-2 text-xs font-medium text-[#667085] sm:text-sm">
                <Icon className="size-3.5 shrink-0 text-[#98a2b3]" />
                {stat.label}
              </dt>
              <dd className="mt-2 text-2xl font-semibold tracking-tight">{stat.value}</dd>
            </div>
          );
        })}
      </dl>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[#344054]">Recent forecasts</h3>
        <ForecastTable forecasts={desk.forecasts.slice(0, 6)} />
      </div>
    </div>
  );
}

export function ForecastTable({ forecasts }: { forecasts: Forecast[] }) {
  if (forecasts.length === 0) {
    return (
      <Panel className="px-5 py-8 text-sm text-[#667085]">No forecasts yet.</Panel>
    );
  }
  return (
    <Panel>
      <ul className="divide-y divide-[#eef0f3] md:hidden">
        {forecasts.map((forecast) => (
          <li key={forecast.id}>
            <Link href={`/admin/forecasts/${forecast.id}`} className="flex flex-col gap-2 px-4 py-4">
              <span className="flex items-start justify-between gap-3">
                <span className="font-medium">{forecast.title}</span>
                <Pill tone={toneFor(forecast.status)}>{forecast.status}</Pill>
              </span>
              <span className="text-sm text-[#667085]">
                {gameById(forecast.game).label} · {formatLongDate(forecast.date)}
              </span>
              <span className="text-sm tabular-nums text-[#475467]">{forecast.numbers.join(' · ')}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-[#f9fafb] text-[#667085]">
            <tr className="border-b border-[#eef0f3]">
              <th className="px-5 py-3 font-medium">Forecast</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Numbers</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {forecasts.map((forecast) => (
              <tr key={forecast.id} className="border-b border-[#eef0f3] last:border-0">
                <td className="px-5 py-3.5">
                  <Link href={`/admin/forecasts/${forecast.id}`} className="font-medium hover:underline">
                    {forecast.title}
                  </Link>
                  <div className="text-[#98a2b3]">{gameById(forecast.game).label}</div>
                </td>
                <td className="px-5 py-3.5 text-[#475467]">{formatLongDate(forecast.date)}</td>
                <td className="px-5 py-3.5 tabular-nums text-[#475467]">{forecast.numbers.join(' · ')}</td>
                <td className="px-5 py-3.5">
                  <Pill tone={toneFor(forecast.status)}>{forecast.status}</Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function ForecastList() {
  const desk = useDesk();
  if (!desk) return <LoadingState label="Loading forecasts…" />;
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageLead
        title="Forecasts"
        description="Drafts, scheduled posts, and the live archive."
        action={
          <Link
            href="/admin/forecasts/new"
            className="inline-flex h-10 items-center rounded-full bg-[#101828] px-4 text-sm font-semibold text-white lg:hidden"
          >
            New forecast
          </Link>
        }
      />
      <ForecastTable forecasts={desk.forecasts} />
    </div>
  );
}


export function DeliveryLog() {
  const desk = useDesk();
  const [channel, setChannel] = React.useState<'all' | 'web' | 'email' | 'sms'>('all');
  if (!desk) return <LoadingState label="Loading deliveries…" />;
  const rows = desk.deliveries.filter((row) => channel === 'all' || row.channel === channel);
  const label = (value: 'web' | 'email' | 'sms') =>
    value === 'web' ? 'Site' : value === 'email' ? 'Email' : 'SMS';

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageLead
        title="Deliveries"
        description="Site, email, and SMS status for each published forecast. Text messages stay queued until delivery is active."
      />
      <div className="flex flex-wrap gap-2">
        {(['all', 'web', 'email', 'sms'] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setChannel(item)}
            className={cn(
              'h-9 rounded-full px-3 text-sm',
              channel === item ? 'bg-[#101828] text-white' : 'border border-[#e6e8ee] bg-white text-[#475467]',
            )}
          >
            {item === 'all' ? 'All' : label(item)}
          </button>
        ))}
      </div>
      <Panel>
        <ul className="divide-y divide-[#eef0f3] lg:hidden">
          {rows.map((row) => {
            const forecast = desk.forecasts.find((item) => item.id === row.forecastId);
            return (
              <li key={row.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{forecast?.title ?? row.forecastId}</p>
                  <Pill tone={toneFor(row.status)}>{row.status}</Pill>
                </div>
                <p className="mt-1 text-sm text-[#667085]">{row.userEmail}</p>
                <p className="mt-1 text-sm text-[#475467]">
                  {label(row.channel)} · {formatDateTime(row.at)}
                </p>
                <p className="mt-1 text-xs text-[#98a2b3]">{row.detail}</p>
              </li>
            );
          })}
        </ul>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#f9fafb] text-[#667085]">
              <tr className="border-b border-[#eef0f3]">
                <th className="px-5 py-3 font-medium">When</th>
                <th className="px-5 py-3 font-medium">Forecast</th>
                <th className="px-5 py-3 font-medium">Subscriber</th>
                <th className="px-5 py-3 font-medium">Channel</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const forecast = desk.forecasts.find((item) => item.id === row.forecastId);
                return (
                  <tr key={row.id} className="border-b border-[#eef0f3] last:border-0">
                    <td className="px-5 py-3.5 whitespace-nowrap text-[#475467]">{formatDateTime(row.at)}</td>
                    <td className="px-5 py-3.5">{forecast?.title ?? row.forecastId}</td>
                    <td className="px-5 py-3.5 text-[#475467]">{row.userEmail}</td>
                    <td className="px-5 py-3.5">{label(row.channel)}</td>
                    <td className="px-5 py-3.5">
                      <Pill tone={toneFor(row.status)}>{row.status}</Pill>
                      <div className="mt-1 text-xs text-[#98a2b3]">{row.detail}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

export function SubscriberTable() {
  const [accounts, setAccounts] = React.useState<ReturnType<typeof listAccounts>>([]);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setAccounts(listAccounts());
    setReady(true);
  }, []);

  if (!ready) return <LoadingState label="Loading subscribers…" />;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageLead title="Subscribers" description="Accounts, plans, and payment status." />
      <Panel>
        <ul className="divide-y divide-[#eef0f3] lg:hidden">
          {accounts.map((account) => {
            const plan = planById(account.planId);
            const paid = account.invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
            return (
              <li key={account.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="mt-1 text-sm text-[#667085]">{account.email}</p>
                  </div>
                  <Pill tone={toneFor(account.subscriptionStatus)}>{account.subscriptionStatus}</Pill>
                </div>
                <p className="mt-2 text-sm text-[#475467]">
                  {plan ? plan.name : 'No plan'} · {paid ? formatMoney(paid) : 'No payment'}
                </p>
                <p className="mt-1 text-sm text-[#667085]">
                  {account.phone || 'No mobile number'}
                  {account.phone ? ` · ${account.smsConsent ? 'Consent given' : 'No consent'}` : ''}
                </p>
              </li>
            );
          })}
        </ul>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#f9fafb] text-[#667085]">
              <tr className="border-b border-[#eef0f3]">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Mobile</th>
                <th className="px-5 py-3 font-medium">Paid</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => {
                const plan = planById(account.planId);
                const paid = account.invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
                return (
                  <tr key={account.id} className="border-b border-[#eef0f3] last:border-0">
                    <td className="px-5 py-3.5 font-medium">{account.name}</td>
                    <td className="px-5 py-3.5 text-[#475467]">{account.email}</td>
                    <td className="px-5 py-3.5">{plan ? plan.name : '—'}</td>
                    <td className="px-5 py-3.5">
                      <Pill tone={toneFor(account.subscriptionStatus)}>{account.subscriptionStatus}</Pill>
                    </td>
                    <td className="px-5 py-3.5 text-[#475467]">
                      {account.phone || '—'}
                      {account.phone ? (
                        <div className="text-xs text-[#98a2b3]">{account.smsConsent ? 'Consent given' : 'No consent'}</div>
                      ) : null}
                    </td>
                    <td className="px-5 py-3.5">{paid ? formatMoney(paid) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
