# TG — Lotto Forecast

TG’s Lotto Forecast site. Subscribers register, choose a plan, and read each day’s numbers and machine video. The publishing desk creates a forecast and publishes it now or on a schedule. Active subscribers then see it on the site, with email and SMS recorded for delivery.

Accounts, plans, forecasts, and delivery logs in this preview are stored in the browser. Stripe, Twilio, and email are represented in the product flow and are ready to connect.

## Run

```bash
npm install
npm run dev
```

Open the URL printed by Next.js. The default is [http://localhost:3000](http://localhost:3000). If that port is already taken, Next.js uses the next free port. The links below use [http://localhost:3001](http://localhost:3001), which is where this app is running while another project holds port 3000.

## Demo accounts

Password for every demo account: `lotto123`

| Account | Email | What to check |
| --- | --- | --- |
| Active subscriber | subscriber@lottoforecast.test | Feed, history, Friday 2 and 7, account, messages |
| No plan yet | member@lottoforecast.test | Locked forecast, then subscribe |
| Publishing desk | admin@lottoforecast.test | Admin, schedule, publish, delivery log |

Log out between accounts. Sign out is in the top bar on large screens, and on Account on a phone.

Google on [Log in](http://localhost:3001/login) and [Sign up](http://localhost:3001/signup) is a preview: it records a Google account in the browser. Demo accounts above use **Username & password**.


## Public pages

- [Home](http://localhost:3001/) — product introduction, plans, and questions
- [Pricing](http://localhost:3001/pricing) — Weekly, Monthly, and Quarterly
- [About](http://localhost:3001/about) — what the product is, and what it does not do
- [Contact](http://localhost:3001/contact) — message the desk
- [Privacy](http://localhost:3001/privacy) — account, phone, Stripe, and delivery data
- [Terms](http://localhost:3001/terms) — subscription and the forecast disclaimer
- [Log in](http://localhost:3001/login)
- [Sign up](http://localhost:3001/signup)

## Subscriber pages

Log in as `subscriber@lottoforecast.test` / `lotto123` first.

- [Daily forecast](http://localhost:3001/feed) — latest numbers and machine video
- [Forecast history](http://localhost:3001/history)
- [Tuesday, October 6](http://localhost:3001/forecasts/f-20261006) — Pick 2, 6 and 18
- [Friday, October 2](http://localhost:3001/forecasts/f-20261002) — Pick 2 Friday Forecasts, 2 and 7
- [Monday, October 5](http://localhost:3001/forecasts/f-20261005)
- [Thursday, October 1](http://localhost:3001/forecasts/f-20261001)
- [Wednesday, September 30](http://localhost:3001/forecasts/f-20260930)
- [Account](http://localhost:3001/account) — email, mobile number, text consent
- [Subscription](http://localhost:3001/subscription) — plan, cancel, payments
- [Choose Monthly](http://localhost:3001/subscription?plan=monthly)
- [Delivery messages](http://localhost:3001/messages) — site, email, and queued SMS

To see the lock, log in as `member@lottoforecast.test` / `lotto123` and open [the feed](http://localhost:3001/feed). Choose a plan on [Subscription](http://localhost:3001/subscription). Confirming the plan marks it paid and opens the forecast.

## Publishing desk

Log in as `admin@lottoforecast.test` / `lotto123`.

- [Overview](http://localhost:3001/admin) — subscribers, forecasts, email, SMS, payments
- [Forecasts](http://localhost:3001/admin/forecasts)
- [New forecast](http://localhost:3001/admin/forecasts/new)
- [Scheduled for October 7](http://localhost:3001/admin/forecasts/f-20261007) — Pick 2, waiting to publish
- [Draft for October 8](http://localhost:3001/admin/forecasts/f-20261008)
- [Deliveries](http://localhost:3001/admin/deliveries)
- [Subscribers](http://localhost:3001/admin/subscribers)

Publish now on a new forecast, then refresh [Deliveries](http://localhost:3001/admin/deliveries). Each active subscriber gets a site row, an email row, and an SMS row.

## A short path through the product

1. Open [Home](http://localhost:3001/) while signed out.
2. Log in as the subscriber and play the draw on [Feed](http://localhost:3001/feed).
3. Open [Friday, October 2](http://localhost:3001/forecasts/f-20261002) and [Account](http://localhost:3001/account).
4. Sign out, log in as the member with no plan, and confirm the numbers are locked.
5. Sign out, log in as the desk, and open [New forecast](http://localhost:3001/admin/forecasts/new).
