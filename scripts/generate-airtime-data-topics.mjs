/**
 * Generates 150 unique airtime / data-bundle topic specs (30 per cluster).
 * Run: node scripts/generate-airtime-data-topics.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

/** @typedef {'airtime' | 'bundle' | 'affordable' | 'allnet' | 'online'} Cluster */

function hash(s) {
  let h = 0;
  for (const c of s) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

const rotatingTips = [
  'Save *714*22# on paper — it still works when the bundle is already at zero.',
  'Confirm the recipient network on screen. Prefixes lie after number portability.',
  'Never share your MoMo PIN with a vendor, classmate, or “agent” on WhatsApp.',
  'If the first prompt hangs, check the wallet statement before you pay again.',
  'Guest checkout on Ewale web works on Wi-Fi when you cannot open an operator app.',
  'Buy for another number only after you have typed the 10 digits twice.',
  'Social bundles do not cover Google Meet, Moodle, or most banking apps.',
  'Weekly full-data often beats three panic daily plans once levies are counted.',
  'Keep the SMS until the recipient phone shows the new balance.',
  'MTN, Telecel, and AT all vend through Ewale; you do not need three apps.',
  'Feature phones can buy: USSD does not need Play Store or data.',
  'Diaspora: send from the website, then ask the recipient to reply with the balance SMS.',
  'Midnight and Sunday still work on USSD when the corner shop is closed.',
  'A lookalike “cheap data Ghana” WhatsApp seller is a scam until proven otherwise.',
  'Hotspot on a 1 GB plan will finish before the validity date — watch the users.',
  'Exam week: buy in the afternoon, not at 11:50pm when SMS queues stretch.',
  'Ported SIMs: ask which network they are on today, not what the sticker says.',
  'Small airtime buffers keep USSD alive even when data is finished.',
  'Promo screenshots from last term are not prices. Trust the confirmation line.',
  'After a failed SMS, wait and check balance codes before a second PIN.',
];

function extraTips(cluster, slug, keyword) {
  const common = {
    airtime: [
      'MTN balance is *124#. Do not guess — confirm credit landed on the right SIM.',
      'Scratch cards still work (*134*PIN# on MTN) but digital MoMo is faster at night.',
      'Buying for someone else: type the full 10-digit number, no +233 in the USSD box unless the menu asks.',
    ],
    bundle: [
      'Record four fields: GB, validity, scope (all sites vs social), and GHS on the confirm screen.',
      'MTN *138#, Telecel *700#, AT *111# are operator menus — Ewale is the all-network backup.',
      'If data does not reflect in five minutes, check the recipient SIM before you repurchase.',
    ],
    affordable: [
      'Cheapest per day is often a weekly plan, not the GH₵1 social pack used three times.',
      'WhatsApp-only is only cheap if you will not open Chrome, Maps, or lecture PDFs.',
      'Compare GB ÷ cedis on today’s menu, not a flyer from last year.',
    ],
    allnet: [
      'Your MoMo wallet network does not have to match the recipient SIM.',
      'A 024 number can be Telecel after porting — trust the lookup, not the prefix.',
      'One shortcode (*714*22#) covers MTN, Telecel, and AirtelTigo data.',
    ],
    online: [
      'When the bundle is zero, open checkout on Wi-Fi or use USSD — not the operator app.',
      'Bookmark /payments/data so you are not searching “buy data” on a dying connection.',
      'Guest checkout is enough; you do not need an Ewale account to finish one purchase.',
    ],
  };
  const rotated = rotatingTips[hash(slug) % rotatingTips.length];
  return [
    `For “${keyword}”, Ewale *714*22# is the no-app path that works on every major Ghana network.`,
    ...common[cluster],
    rotated,
  ];
}

function faqsFor(keyword, cluster) {
  const airtime = cluster === 'airtime';
  const product = airtime ? 'airtime' : 'a data bundle';
  const menu = airtime ? 'Airtime' : 'Data';
  return [
    {
      q: `What is the fastest 2026 way to handle “${keyword}”?`,
      a: `Dial *714*22# on Ewale, choose ${menu}, enter the Ghana number, confirm the network, pay with MoMo. If you have Wi-Fi, use Ewale web checkout instead.`,
    },
    {
      q: `Can I buy ${product} for MTN, Telecel, and AirtelTigo in one place?`,
      a: 'Yes. Ewale sells all three. Operator apps usually prefer their own SIM. Confirm the recipient network on the confirmation screen — prefixes are not proof after portability.',
    },
    {
      q: `Do I need data or an app for ${keyword}?`,
      a: 'No. USSD *714*22# works on any GSM phone with no internet. That matters when the bundle is already finished and the operator app cannot load.',
    },
    {
      q: `What if the SMS is slow after I pay for ${keyword}?`,
      a: 'Check Mobile Money history first so you do not double-pay. Then check the recipient balance codes (MTN *124# / *138#, Telecel *126#, AT *504#). Keep the SMS as a receipt.',
    },
  ];
}

const airtime = [
  ['how-to-buy-airtime-ghana-2026', 'How to Buy Airtime in Ghana (2026): MTN, Telecel, AT', 'airtime purchase Ghana', 'Anyone who needs prepaid credit today without a scratch card'],
  ['buy-mtn-airtime-online-ghana', 'Buy MTN Airtime Online in Ghana — MoMo in Minutes', 'buy MTN airtime online', 'MTN subscribers topping up from a phone or laptop'],
  ['buy-telecel-airtime-ghana', 'Buy Telecel Airtime with Mobile Money', 'buy Telecel airtime', 'Telecel (formerly Vodafone) users who cannot find a vendor'],
  ['buy-airteltigo-airtime-ghana', 'Buy AirtelTigo (AT) Airtime Instantly', 'buy AirtelTigo airtime', 'AT customers buying credit for themselves or family'],
  ['buy-airtime-with-momo-ghana', 'Buy Airtime with Mobile Money in Ghana', 'buy airtime with MoMo', 'MoMo wallet holders on MTN, Telecel Cash, or AT Money'],
  ['buy-airtime-for-someone-else-ghana', 'Buy Airtime for Someone Else in Ghana', 'buy airtime for someone else', 'Parents, partners, and staff buying for another number'],
  ['buy-airtime-without-scratch-card', 'Buy Airtime Without a Scratch Card', 'buy airtime without scratch card', 'People tired of faded PINs and kiosk mark-ups'],
  ['instant-airtime-recharge-ghana', 'Instant Airtime Recharge in Ghana', 'instant airtime recharge', 'Users who need credit on the SIM in the next minute'],
  ['airtime-top-up-ussd-71422', 'Airtime Top-Up on *714*22# (Ewale)', 'airtime top up USSD', 'Feature-phone and zero-data users'],
  ['buy-airtime-from-abroad-ghana', 'Buy Ghana Airtime from Abroad', 'buy Ghana airtime from abroad', 'Diaspora sending credit home'],
  ['cheap-airtime-purchase-ghana', 'Affordable Airtime Purchase in Ghana', 'cheap airtime purchase', 'Budget buyers who want face-value credit, not vendor fees'],
  ['emergency-airtime-top-up-ghana', 'Emergency Airtime Top-Up When Credit Hits Zero', 'emergency airtime top up', 'People who cannot place a call until credit lands'],
  ['bulk-airtime-for-small-business', 'Bulk Airtime for Small Businesses in Ghana', 'bulk airtime Ghana', 'Shops and offices loading several staff numbers'],
  ['midnight-airtime-recharge-ghana', 'Midnight Airtime Recharge — No Shop Needed', 'midnight airtime recharge', 'Night-shift workers and late callers'],
  ['buy-airtime-on-feature-phone', 'Buy Airtime on a Feature Phone (No App)', 'buy airtime feature phone', 'KaiOS and basic GSM handset users'],
  ['failed-airtime-transaction-fix', 'Failed Airtime Transaction — What to Do', 'failed airtime transaction', 'Users whose MoMo deducted but SMS lagged'],
  ['airtime-sent-to-wrong-number', 'Airtime Sent to the Wrong Number', 'airtime wrong number', 'Anyone who mistyped a 10-digit Ghana number'],
  ['parents-buy-airtime-for-students', 'Parents: Buy Airtime for Students in Ghana', 'parents buy airtime students', 'Guardians sending credit to campus numbers'],
  ['buy-airtime-in-accra', 'Buy Airtime in Accra — USSD and Online', 'buy airtime Accra', 'Accra residents who do not want a traffic detour for credit'],
  ['buy-airtime-in-kumasi', 'Buy Airtime in Kumasi Without a Vendor', 'buy airtime Kumasi', 'Kumasi users topping up after shop hours'],
  ['mtn-me2u-vs-ewale-airtime', 'MTN Me2U vs Ewale Airtime Purchase', 'Me2U vs Ewale airtime', 'MTN users comparing transfer vs a fresh purchase'],
  ['scratch-card-vs-digital-airtime', 'Scratch Card vs Digital Airtime in Ghana', 'scratch card vs digital airtime', 'Buyers choosing PIN cards versus MoMo'],
  ['minimum-airtime-purchase-ghana', 'Minimum Airtime Purchase Amounts in Ghana', 'minimum airtime purchase', 'Students buying small top-ups'],
  ['airtime-sms-receipt-ghana', 'Airtime SMS Receipt — How to Confirm Credit', 'airtime SMS receipt', 'Users who need proof for a parent or accounts team'],
  ['buy-airtime-on-ewale-website', 'Buy Airtime on the Ewale Website', 'buy airtime Ewale website', 'Laptop and tablet users on Wi-Fi'],
  ['guest-checkout-airtime-ghana', 'Guest Checkout: Buy Airtime Without an Account', 'guest checkout airtime', 'One-time buyers who do not want to register'],
  ['buy-airtime-all-networks-one-code', 'Buy Airtime for All Networks on One Shortcode', 'airtime all networks one code', 'Households mixing MTN, Telecel, and AT'],
  ['airtime-for-ported-numbers-ghana', 'Buy Airtime for Ported Numbers in Ghana', 'airtime ported number', 'People gifting credit after MNP'],
  ['weekend-airtime-top-up-ghana', 'Weekend Airtime Top-Up When Vendors Close', 'weekend airtime top up', 'Saturday-night and Sunday buyers'],
  ['how-to-check-airtime-after-purchase', 'Check Airtime Balance After You Buy', 'check airtime after purchase', 'First-time digital top-up users'],
];

const bundle = [
  ['ghana-data-bundle-guide-2026', 'Ghana Data Bundle Guide (2026): What You Are Buying', 'data bundle Ghana', 'Anyone confused by daily, weekly, and social plans'],
  ['buy-mtn-data-bundle-ghana', 'Buy an MTN Data Bundle in Ghana', 'buy MTN data bundle', 'MTN prepaid customers loading internet'],
  ['buy-telecel-data-bundle-ghana', 'Buy a Telecel Data Bundle in Ghana', 'buy Telecel data bundle', 'Telecel users moving off *700# when it is busy'],
  ['buy-airteltigo-data-bundle-ghana', 'Buy an AirtelTigo Data Bundle in Ghana', 'buy AirtelTigo data bundle', 'AT customers using *111# or Ewale'],
  ['mtn-138-data-bundle-explained', 'MTN *138# Data Bundle Explained — Plus the Ewale Path', 'MTN *138# data bundle', 'People who know the code but want a backup'],
  ['telecel-700-data-bundle-guide', 'Telecel *700# Data Bundle Guide', 'Telecel *700# data', 'Users still searching Vodafone *700#'],
  ['airteltigo-111-data-menu', 'AirtelTigo *111# Data Menu — Buy Without the App', 'AirtelTigo *111# data', 'AT subscribers on feature phones'],
  ['daily-data-bundle-ghana', 'Daily Data Bundles in Ghana — When They Make Sense', 'daily data bundle Ghana', 'Commuters who only need one day of internet'],
  ['weekly-data-bundle-ghana', 'Weekly Data Bundles in Ghana', 'weekly data bundle Ghana', 'Students and workers on a seven-day cycle'],
  ['monthly-data-bundle-ghana', 'Monthly Data Bundles in Ghana', 'monthly data bundle Ghana', 'Households who want one purchase per salary'],
  ['night-data-bundle-ghana', 'Night Data Bundles in Ghana — Read the Window', 'night data bundle Ghana', 'Downloaders who actually use data after midnight'],
  ['social-data-bundle-vs-full-data', 'Social Data Bundle vs Full Internet in Ghana', 'social data bundle vs full data', 'WhatsApp users who still need Chrome'],
  ['check-data-bundle-balance-ghana', 'How to Check Data Bundle Balance in Ghana', 'check data bundle balance', 'Users unsure how much GB is left'],
  ['buy-data-bundle-for-another-number', 'Buy a Data Bundle for Another Number', 'buy data bundle for another number', 'Parents and partners gifting internet'],
  ['data-bundle-not-reflecting-fix', 'Data Bundle Not Reflecting — Fix Before You Repay', 'data bundle not reflecting', 'People waiting on SMS after MoMo debit'],
  ['mtn-mashup-data-bundle-guide', 'MTN Mashup Data — What It Is and How to Buy Instead', 'MTN Mashup data', 'Users comparing Mashup *567*4# with a normal bundle'],
  ['data-bundle-validity-explained-ghana', 'Data Bundle Validity in Ghana — Hours, Days, Expiry', 'data bundle validity Ghana', 'Buyers who lost leftover GB at midnight'],
  ['hotspot-and-data-bundle-ghana', 'Using a Data Bundle as a Hotspot in Ghana', 'data bundle hotspot Ghana', 'People sharing one SIM with a laptop'],
  ['student-data-bundle-ghana', 'Student Data Bundles in Ghana', 'student data bundle Ghana', 'SHS and university students on prepaid'],
  ['whatsapp-data-bundle-ghana', 'WhatsApp Data Bundles in Ghana — Limits to Know', 'WhatsApp data bundle Ghana', 'Users who live in chats but still need maps'],
  ['youtube-data-bundle-ghana', 'YouTube and Video Bundles in Ghana', 'YouTube data bundle Ghana', 'Viewers who should not burn a full 2 GB plan on one film'],
  ['data-bundle-for-exams-ghana', 'Data Bundles for Exam Season in Ghana', 'data bundle for exams Ghana', 'Candidates checking results and uploading forms'],
  ['data-bundle-sms-confirmation', 'Data Bundle SMS Confirmation — Keep It', 'data bundle SMS confirmation', 'Anyone who needs a receipt for a sponsor'],
  ['change-data-bundle-plan-ghana', 'Changing a Data Bundle Plan in Ghana', 'change data bundle plan', 'Users switching from social to full internet'],
  ['data-bundle-expires-too-fast', 'Why Your Data Bundle Finishes Too Fast', 'data bundle expires too fast', 'People whose GB vanishes before the validity date'],
  ['data-bundle-vs-payg-ghana', 'Data Bundle vs Pay-As-You-Go in Ghana', 'data bundle vs PAYG', 'Prepaid users still on out-of-bundle rates'],
  ['family-data-bundle-gifting-ghana', 'Gift a Data Bundle to Family in Ghana', 'gift data bundle family', 'Relatives loading a parent’s or sibling’s SIM'],
  ['buy-data-bundle-android-or-iphone', 'Buy a Data Bundle on Android or iPhone', 'buy data bundle Android iPhone', 'Smartphone users who do not want three operator apps'],
  ['data-bundle-accra-kumasi-tamale', 'Data Bundles in Accra, Kumasi, and Tamale', 'data bundle Accra Kumasi', 'Urban buyers comparing USSD vs a street vendor'],
  ['how-ghana-data-bundles-work-2026', 'How Ghana Data Bundles Work in 2026', 'how data bundles work Ghana', 'New SIM owners buying internet the first time'],
];

const affordable = [
  ['cheapest-data-bundle-ghana-2026', 'Cheapest Data Bundle in Ghana (2026) — How to Compare', 'cheapest data bundle Ghana', 'Price-sensitive prepaid users'],
  ['affordable-mtn-data-bundle', 'Affordable MTN Data Bundles in Ghana', 'affordable MTN data bundle', 'MTN customers stretching a small wallet'],
  ['affordable-telecel-data-bundle', 'Affordable Telecel Data Bundles', 'affordable Telecel data bundle', 'Telecel users hunting value, not just a promo name'],
  ['affordable-airteltigo-data-bundle', 'Affordable AirtelTigo Data Bundles', 'affordable AirtelTigo data bundle', 'AT subscribers on a tight weekly budget'],
  ['cheap-daily-data-ghana', 'Cheap Daily Data in Ghana — Avoid Repeat Buys', 'cheap daily data Ghana', 'People buying GH₵1–5 packs every morning'],
  ['best-value-data-bundle-ghana', 'Best-Value Data Bundle in Ghana', 'best value data bundle Ghana', 'Buyers who care about GB per cedi'],
  ['student-cheap-data-ghana', 'Cheap Data for Students in Ghana', 'cheap student data Ghana', 'Campus users paying from chop money'],
  ['small-cedi-data-bundle-ghana', 'Small-Cedi Data Bundles in Ghana', 'small data bundle Ghana', 'Anyone who only has a few cedis on MoMo'],
  ['cheap-weekly-data-ghana', 'Cheap Weekly Data Bundles in Ghana', 'cheap weekly data Ghana', 'Workers paid weekly who need seven days of internet'],
  ['affordable-monthly-data-ghana', 'Affordable Monthly Data in Ghana', 'affordable monthly data Ghana', 'Households who want one predictable purchase'],
  ['data-bundle-value-per-gb-ghana', 'Data Bundle Value per GB in Ghana', 'data bundle value per GB', 'Researchers and careful shoppers comparing plans'],
  ['avoid-expensive-data-mistakes-ghana', 'Expensive Data Mistakes Ghanaians Make', 'expensive data mistakes Ghana', 'Users who overspend on the wrong plan type'],
  ['cheapest-way-to-buy-data-ghana', 'Cheapest Way to Buy Data in Ghana', 'cheapest way to buy data Ghana', 'People comparing vendor, app, and Ewale'],
  ['low-cost-internet-ghana-prepaid', 'Low-Cost Mobile Internet on Ghana Prepaid', 'low cost internet Ghana prepaid', 'First-time smartphone owners'],
  ['affordable-data-for-whatsapp', 'Affordable Data That Still Covers WhatsApp', 'affordable WhatsApp data Ghana', 'Families who mainly chat but need the occasional link'],
  ['cheap-data-for-job-search-ghana', 'Cheap Data for Job Search in Ghana', 'cheap data job search Ghana', 'Applicants uploading CVs and joining interviews'],
  ['budget-data-bundle-for-parents', 'Budget Data Bundles Parents Can Gift', 'budget data bundle parents', 'Guardians sending the smallest plan that still works'],
  ['affordable-data-without-promo-traps', 'Affordable Data Without Promo Traps', 'data promo traps Ghana', 'Users burned by “unlimited” small print'],
  ['compare-cheap-data-plans-ghana', 'Compare Cheap Data Plans in Ghana', 'compare cheap data plans Ghana', 'Shoppers looking at MTN, Telecel, and AT side by side'],
  ['small-data-bundle-that-lasts', 'Make a Small Data Bundle Last in Ghana', 'small data bundle that lasts', 'People whose cheap plan dies by lunch'],
  ['affordable-data-night-plan-ghana', 'Affordable Night Data Plans in Ghana', 'affordable night data Ghana', 'Users who can shift downloads after midnight'],
  ['cheap-data-telecel-vs-mtn', 'Cheap Data: Telecel vs MTN in Ghana', 'cheap data Telecel vs MTN', 'Households picking a SIM for internet value'],
  ['cheapest-data-for-shs-ghana', 'Cheapest Data for SHS Students in Ghana', 'cheapest SHS data Ghana', 'Boarding and day students with limited cedis'],
  ['affordable-data-for-university-ghana', 'Affordable Data for University in Ghana', 'affordable university data Ghana', 'Tertiary students on lecture PDFs and LMS'],
  ['low-income-data-bundle-ghana', 'Low-Income Data Bundles in Ghana', 'low income data bundle Ghana', 'Buyers who cannot miss a cedi'],
  ['save-money-on-data-bundles-ghana', 'How to Save Money on Data Bundles in Ghana', 'save money data bundles Ghana', 'Anyone whose MoMo leaves too fast on internet'],
  ['affordable-data-bundle-momo', 'Affordable Data Bundles Paid with MoMo', 'affordable data bundle MoMo', 'Wallet users skipping cash vendors'],
  ['cheap-data-when-salary-delays', 'Cheap Data When Salary Delays in Ghana', 'cheap data salary delay', 'Workers bridging a few days of internet'],
  ['best-cheap-data-bundle-2026', 'Best Cheap Data Bundle in Ghana (2026)', 'best cheap data bundle 2026', 'Searchers who want a straight recommendation path'],
  ['affordable-internet-all-networks-ghana', 'Affordable Internet on All Ghana Networks', 'affordable internet all networks', 'Families with mixed SIMs on one budget'],
];

const allnet = [
  ['buy-data-bundle-all-networks-ghana', 'Buy a Data Bundle for All Networks in Ghana', 'buy data bundle for all network', 'Anyone paying MTN, Telecel, and AT from one wallet'],
  ['one-shortcode-data-mtn-telecel-at', 'One Shortcode for MTN, Telecel, and AT Data', 'one shortcode all network data', 'Users who refuse to install three operator apps'],
  ['buy-mtn-telecel-at-data-one-place', 'Buy MTN, Telecel & AT Data in One Place', 'buy data all Ghana networks', 'Mixed-network households'],
  ['data-for-all-ghana-networks', 'Data for All Ghana Networks — Same MoMo Wallet', 'data for all Ghana networks', 'MoMo users whose family is not on one telco'],
  ['do-not-send-mtn-data-to-telecel', 'Do Not Send MTN Data to a Telecel Number', 'MTN data to Telecel number', 'People who gift by prefix and get a failure SMS'],
  ['check-network-before-buying-data', 'Check the Network Before You Buy Data in Ghana', 'check network before buying data', 'Gifters unsure which SIM the recipient uses'],
  ['buy-data-for-ported-number-ghana', 'Buy Data for a Ported Number in Ghana', 'buy data ported number', 'Users after mobile number portability'],
  ['family-mixed-networks-data-gifting', 'Gift Data Across a Mixed-Network Family', 'gift data mixed networks Ghana', 'Parents with children on different telcos'],
  ['buy-data-any-network-with-momo', 'Buy Data for Any Network with MoMo', 'buy data any network MoMo', 'Wallet holders paying a different network’s SIM'],
  ['all-network-data-bundle-ussd', 'All-Network Data Bundle USSD in Ghana', 'all network data USSD', 'Feature-phone users buying for several SIMs'],
  ['buy-mtn-data-with-telecel-cash', 'Buy MTN Data with Telecel Cash', 'buy MTN data Telecel Cash', 'Telecel Cash wallets loading an MTN phone'],
  ['buy-at-data-with-mtn-momo', 'Buy AirtelTigo Data with MTN MoMo', 'buy AT data MTN MoMo', 'MTN MoMo users paying an AT number'],
  ['cross-network-data-purchase-ghana', 'Cross-Network Data Purchase in Ghana', 'cross network data purchase', 'Anyone whose wallet and recipient differ'],
  ['all-networks-data-from-one-checkout', 'All-Network Data from One Checkout', 'all networks one checkout data', 'Web and USSD buyers who want one flow'],
  ['how-to-know-recipient-network-ghana', 'How to Know a Recipient’s Network in Ghana', 'know recipient network Ghana', 'People about to gift data or airtime'],
  ['buy-data-three-networks-ewale', 'Buy Data for Three Networks on Ewale', 'buy data three networks Ewale', 'Repeat buyers standardised on *714*22#'],
  ['data-bundle-mtn-vodafone-airteltigo', 'Data Bundles: MTN, Vodafone/Telecel, AirtelTigo', 'MTN Vodafone AirtelTigo data', 'Searchers still using the Vodafone name'],
  ['buy-data-telecel-formerly-vodafone', 'Buy Data on Telecel (Formerly Vodafone Ghana)', 'buy Telecel formerly Vodafone data', 'Users whose contacts still say Vodafone'],
  ['one-place-all-network-data-ghana', 'One Place for All-Network Data in Ghana', 'one place all network data', 'Small offices loading staff SIMs'],
  ['buy-data-for-staff-all-networks', 'Buy Data for Staff on All Networks', 'buy data for staff all networks', 'Managers topping up field teams'],
  ['church-group-data-all-networks', 'Church Group Data — All Networks', 'church group data all networks', 'Fellowship admins sending data to members'],
  ['school-data-mtn-telecel-at', 'School Data Gifts: MTN, Telecel, AT', 'school data MTN Telecel AT', 'PTAs and guardians of mixed-SIM classrooms'],
  ['diaspora-buy-data-any-ghana-network', 'Diaspora: Buy Data for Any Ghana Network', 'diaspora buy data any network', 'Relatives abroad paying a Ghana number'],
  ['confirm-network-before-data-gift', 'Confirm the Network Before a Data Gift', 'confirm network before data gift', 'First-time gifters'],
  ['all-network-data-wrong-sim-fix', 'All-Network Data Bought for the Wrong SIM', 'wrong SIM data purchase Ghana', 'Users who selected the wrong network in the menu'],
  ['buy-data-regardless-of-your-network', 'Buy Data Regardless of Your Own Network', 'buy data regardless of network', 'People whose phone network ≠ recipient network'],
  ['ghana-all-network-internet-top-up', 'Ghana All-Network Internet Top-Up', 'all network internet top up Ghana', 'Broad “top up internet” searchers'],
  ['multi-network-data-bundle-guide', 'Multi-Network Data Bundle Guide for Ghana', 'multi network data bundle Ghana', 'Households running more than one telco'],
  ['buy-data-for-any-ghana-number', 'Buy Data for Any Ghana Number', 'buy data for any Ghana number', 'Anyone with a 10-digit local mobile'],
  ['universal-data-purchase-ghana-2026', 'Universal Data Purchase in Ghana (2026)', 'universal data purchase Ghana', 'Users who want one method that always works'],
];

const online = [
  ['buy-data-online-ghana-2026', 'Buy Data Online in Ghana (2026)', 'buy data online Ghana', 'People searching buy data online on a dying connection'],
  ['buy-mtn-data-online', 'Buy MTN Data Online with MoMo', 'buy MTN data online', 'MTN internet buyers who prefer a website to *138#'],
  ['buy-telecel-data-online', 'Buy Telecel Data Online', 'buy Telecel data online', 'Telecel users avoiding a crowded *700# session'],
  ['buy-airteltigo-data-online', 'Buy AirtelTigo Data Online', 'buy AirtelTigo data online', 'AT customers on a browser'],
  ['buy-data-online-with-momo', 'Buy Data Online with Mobile Money', 'buy data online with MoMo', 'Wallet users completing checkout in the browser'],
  ['buy-data-online-without-app', 'Buy Data Online Without an Operator App', 'buy data online without app', 'Phones that cannot install another telco app'],
  ['buy-data-online-on-laptop', 'Buy Data Online on a Laptop in Ghana', 'buy data online laptop', 'Students and office workers on Wi-Fi'],
  ['buy-data-online-from-abroad', 'Buy Ghana Data Online from Abroad', 'buy Ghana data online from abroad', 'Diaspora paying a family SIM'],
  ['safest-way-to-buy-data-online-ghana', 'Safest Way to Buy Data Online in Ghana', 'safest buy data online Ghana', 'Users avoiding WhatsApp “cheap data” sellers'],
  ['buy-data-online-no-scratch-card', 'Buy Data Online — No Scratch Card', 'buy data online no scratch card', 'People who never want another PIN card'],
  ['instant-data-online-ghana', 'Instant Data Online in Ghana', 'instant data online Ghana', 'Buyers who need GB on the SIM now'],
  ['buy-data-online-guest-checkout', 'Buy Data Online with Guest Checkout', 'buy data online guest checkout', 'One-off purchasers skipping registration'],
  ['buy-data-online-ewale-website', 'Buy Data Online on the Ewale Website', 'buy data online Ewale', 'Return visitors using /payments/data'],
  ['buy-data-online-vs-ussd', 'Buy Data Online vs USSD in Ghana', 'buy data online vs USSD', 'Users choosing browser versus *714*22#'],
  ['buy-data-online-for-another-number', 'Buy Data Online for Another Number', 'buy data online for another number', 'Remote gifters on Wi-Fi'],
  ['buy-data-online-when-bundle-is-zero', 'Buy Data Online When Your Bundle Is Zero', 'buy data online zero bundle', 'Phones that cannot load operator apps'],
  ['buy-data-online-weekend', 'Buy Data Online on Weekends in Ghana', 'buy data online weekend', 'Saturday and Sunday top-ups'],
  ['buy-data-online-midnight', 'Buy Data Online at Midnight in Ghana', 'buy data online midnight', 'Night-owl downloaders'],
  ['buy-data-online-accra', 'Buy Data Online in Accra', 'buy data online Accra', 'Accra Wi-Fi and office networks'],
  ['buy-data-online-kumasi', 'Buy Data Online in Kumasi', 'buy data online Kumasi', 'Kumasi buyers using campus or home Wi-Fi'],
  ['buy-data-online-without-mtn-app', 'Buy Data Online Without the MTN App', 'buy data online without MTN app', 'MTN users with no space for MyMTN'],
  ['buy-data-online-without-telecel-app', 'Buy Data Online Without the Telecel App', 'buy data online without Telecel app', 'Telecel users skipping the operator store listing'],
  ['buy-data-online-pay-with-wallet', 'Buy Data Online and Pay with MoMo Wallet', 'buy data online MoMo wallet', 'Digital-wallet-first customers'],
  ['online-data-bundle-sms-delivery', 'Online Data Purchase — SMS Delivery', 'online data SMS delivery', 'Users watching for the confirmation text'],
  ['buy-data-online-failed-payment-fix', 'Buy Data Online: Failed Payment Fix', 'buy data online failed payment', 'Checkout errors and pending MoMo prompts'],
  ['buy-data-online-phishing-warning', 'Buy Data Online — Phishing and Fake Sites', 'buy data online phishing Ghana', 'Security-conscious buyers'],
  ['cheapest-buy-data-online-ghana', 'Cheapest Place to Buy Data Online in Ghana', 'cheapest buy data online Ghana', 'Shoppers comparing web vendors'],
  ['buy-data-online-all-networks', 'Buy Data Online for All Networks', 'buy data online all networks', 'Browser users paying mixed SIMs'],
  ['how-to-buy-internet-data-online-ghana', 'How to Buy Internet Data Online in Ghana', 'how to buy internet data online', 'Beginners using a search engine on Wi-Fi'],
  ['buy-mobile-data-online-ghana-guide', 'Buy Mobile Data Online in Ghana — Full Guide', 'buy mobile data online Ghana', 'Broad “mobile data online” searchers'],
];

const reservedSlugs = new Set([
  'airtime-top-up-guide',
  'understanding-data-bundles',
  'borrow-airtime-data-ghana-guide',
  'share-mobile-data-ghana-guide',
  'how-to-save-data-bundle-android-iphone',
  'ghana-network-prefixes-2026-guide',
  'how-to-use-phone-as-mobile-hotspot',
  'list-of-all-mtn-short-codes-ghana',
  'mtn-shortcodes-ghana-table',
  'vodafone-shortcodes-ghana-table',
  'airteltigo-shortcodes-ghana-table',
  'cheap-international-calls-ghana-guide',
]);

const hooks = {
  airtime: (keyword) =>
    `Searching ${keyword} usually means the SIM is empty and a scratch card is not nearby.`,
  bundle: (keyword) =>
    `People who search ${keyword} need gigabytes on a Ghana SIM, not a marketing flyer.`,
  affordable: (keyword) =>
    `${keyword} is about value: enough internet for the task without paying vendor mark-up or the wrong plan type.`,
  allnet: (keyword) =>
    `${keyword} fails when you assume the prefix is the network. Confirm, then pay once.`,
  online: (keyword) =>
    `${keyword} should work on Wi-Fi or USSD — never on a WhatsApp “agent” you cannot verify.`,
};

const topics = [];
const usedSlugs = new Set();

function push(slug, title, keyword, audience, cluster) {
  if (reservedSlugs.has(slug)) throw new Error(`reserved ${slug}`);
  if (usedSlugs.has(slug)) throw new Error(`dup ${slug}`);
  usedSlugs.add(slug);
  topics.push({
    slug,
    title,
    keyword,
    cluster,
    hook: hooks[cluster](keyword),
    audience,
    tips: extraTips(cluster, slug, keyword).slice(0, 5),
    faqs: faqsFor(keyword, cluster),
  });
}

for (const row of airtime) push(...row, 'airtime');
for (const row of bundle) push(...row, 'bundle');
for (const row of affordable) push(...row, 'affordable');
for (const row of allnet) push(...row, 'allnet');
for (const row of online) push(...row, 'online');

if (airtime.length !== 30 || bundle.length !== 30 || affordable.length !== 30 || allnet.length !== 30 || online.length !== 30) {
  throw new Error('each cluster must have 30 rows');
}
if (topics.length !== 150) {
  throw new Error(`expected 150 topics, got ${topics.length}`);
}

const out = `import type { AirtimeDataTopic } from './types';

export const airtimeDataTopics: AirtimeDataTopic[] = ${JSON.stringify(topics, null, 2)};
`;

const dest = path.join(process.cwd(), 'src/data/blogs/airtime-data-series/topics.ts');
fs.writeFileSync(dest, out);
console.log(`Wrote ${topics.length} topics to ${dest}`);
console.log(
  'clusters',
  topics.reduce((acc, t) => {
    acc[t.cluster] = (acc[t.cluster] || 0) + 1;
    return acc;
  }, {}),
);
