import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicFrame } from '@/components/chrome/Frames';
import { SITE } from '@/data/site';

export const metadata: Metadata = {
  title: 'Messaging policy',
  description: 'How LottoForecasts offers optional SMS and email forecast notifications, and how you can manage them.',
};

const sections = [
  {
    title: '1. Consent to receive messages',
    body: [
      'By checking the consent box during registration or in your account preferences, you agree to receive recurring automated SMS and/or email notifications from LottoForecasts. These messages contain manually prepared lottery-related numerical forecasts for informational and entertainment purposes only (up to one message per day per channel).',
      'Consent is optional and is not a condition of purchase or use of the service.',
      'Message and data rates may apply for SMS according to your mobile carrier plan. You may unsubscribe at any time using the methods described below.',
      'LottoForecasts does not accept wagers, sell lottery tickets, operate drawings, or award prizes. Forecasts are not guarantees of winning outcomes and are not recommendations to place any wager.',
    ],
  },
  {
    title: '2. Nature of the service',
    body: [
      'LottoForecasts provides a paid informational and entertainment subscription featuring manually prepared lottery-related numerical forecasts based on independent review and analysis. Subscription fees pay for access to forecasting content only. They do not pay for lottery entries, winnings, or any lottery outcome. LottoForecasts does not accept or facilitate wagers, sell lottery tickets, operate lottery drawings, award prizes, or guarantee results.',
    ],
  },
  {
    title: '3. SMS and email notification programs',
    body: [
      'The optional Daily Lottery Forecast SMS and Email programs deliver requested forecasts by text message and/or email. You may enroll through the consent control during account registration or later in your account preferences. You may choose SMS, email, or both channels.',
      'Frequency: Up to one daily forecast message per enrolled channel, plus any necessary confirmation or opt-out messages.',
      'Charges: SMS messages may incur standard message and data rates from your carrier. Email delivery is provided at no additional charge from LottoForecasts.',
    ],
  },
  {
    title: '4. How to opt out or get help',
    body: [
      'SMS: Reply STOP to any SMS to unsubscribe. You may receive one final confirmation text. No further forecast texts will be sent unless you opt in again. Reply HELP for assistance.',
      'Email: Click the unsubscribe link included in every forecast email, or email support@lottoforecasts.com with the subject line “Unsubscribe”.',
      'For assistance with either channel, contact support@lottoforecasts.com or visit https://lottoforecasts.com.',
    ],
  },
  {
    title: '5. Delivery',
    body: [
      'SMS and email notifications are provided on an as-is and as-available basis. Delivery depends on network availability, carrier restrictions, and email filters. Wireless carriers and email service providers are not liable for delayed or undelivered messages.',
    ],
  },
  {
    title: '6. Privacy of your contact information',
    body: [
      'When you enroll, we collect your mobile number and/or email address, your consent selection, the date and time of consent, and your messaging preferences and opt-out status. We retain records of the disclosure and method used to obtain consent.',
      'We use this information solely to send the requested forecasts, maintain consent and unsubscribe records, provide support, prevent unauthorized messages, and comply with applicable messaging laws.',
      'We do not sell or share your mobile number, email address, or consent information with third parties or affiliates for their marketing or promotional purposes.',
      'We use trusted messaging service providers (including Twilio for SMS and SendGrid for email) only as necessary to deliver the messages you have requested. For full details, see our Privacy Policy.',
    ],
  },
];

const samples = [
  {
    title: 'Welcome confirmation',
    body: 'LottoForecasts: You are subscribed to daily lottery-related entertainment forecasts (up to 1 msg/day). Msg & data rates may apply. Reply HELP for help or STOP to cancel.',
  },
  {
    title: 'Daily forecast',
    body: 'LottoForecasts: Today’s entertainment-only lottery number forecast: [numbers]. Informational purposes only; results not guaranteed. Reply STOP to unsubscribe.',
  },
  {
    title: 'Help response',
    body: 'LottoForecasts Support: For help, email support@lottoforecasts.com or visit lottoforecasts.com. Reply STOP to cancel.',
  },
  {
    title: 'Opt-out confirmation',
    body: 'LottoForecasts: You are unsubscribed from daily forecast texts. No more forecast messages will be sent unless you opt in again.',
  },
];

export default function MessagingPolicyPage() {
  return (
    <PublicFrame>
      <h1 className="text-[1.75rem] font-semibold tracking-tight">Messaging policy</h1>
      <p className="mt-1 text-sm leading-6 text-[#667085]">
        How LottoForecasts offers optional SMS and email notifications containing lottery-related
        numerical forecasts for informational and entertainment purposes, and how you can manage your
        preferences.
      </p>

      <div className="mt-8 divide-y divide-[#eef0f3] border-y border-[#eef0f3]">
        {sections.map((section) => (
          <section key={section.title} className="py-4">
            <h2 className="text-[15px] font-medium">{section.title}</h2>
            <div className="mt-1.5 space-y-2">
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-6 text-[#667085]">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-[15px] font-medium">7. Sample SMS messages</h2>
        <p className="mt-1.5 text-sm leading-6 text-[#667085]">
          The following examples illustrate the type of SMS messages you may receive.
        </p>
        <div className="mt-4 divide-y divide-[#eef0f3] border-y border-[#eef0f3]">
          {samples.map((sample) => (
            <div key={sample.title} className="py-4">
              <p className="text-sm font-medium text-[#101828]">{sample.title}</p>
              <p className="mt-1.5 text-sm leading-6 text-[#667085]">{sample.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 space-y-2 text-sm text-[#667085]">
        <p>
          Related policies:{' '}
          <Link href="/terms" className="font-medium text-[#101828] hover:underline">
            Terms
          </Link>
          {' · '}
          <Link href="/privacy" className="font-medium text-[#101828] hover:underline">
            Privacy
          </Link>
        </p>
        <p>
          Support:{' '}
          <a className="font-medium text-[#101828] hover:underline" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>
        </p>
        <p className="text-xs text-[#98a2b3]">
          © LottoForecasts. All rights reserved. This policy applies to optional SMS and email
          forecast notifications offered by LottoForecasts.
        </p>
      </div>
    </PublicFrame>
  );
}
