/**
 * Generates 200 unique ECG Power App / prepaid / conservation topic specs.
 * Run: node scripts/generate-power-app-topics.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const places = [
  ['accra', 'Accra'],
  ['tema', 'Tema'],
  ['kumasi', 'Kumasi'],
  ['takoradi', 'Takoradi'],
  ['cape-coast', 'Cape Coast'],
  ['tamale', 'Tamale'],
  ['koforidua', 'Koforidua'],
  ['ho', 'Ho'],
  ['sunyani', 'Sunyani'],
  ['wa', 'Wa'],
  ['bolgatanga', 'Bolgatanga'],
  ['teshie-nungua', 'Teshie-Nungua'],
  ['madina', 'Madina'],
  ['ashaiman', 'Ashaiman'],
  ['kasoa', 'Kasoa'],
  ['spintex', 'Spintex'],
  ['east-legon', 'East Legon'],
  ['dansoman', 'Dansoman'],
  ['kaneshie', 'Kaneshie'],
  ['osu', 'Osu'],
];

const audiences = [
  ['students', 'students in hostels and shared rooms'],
  ['landlords', 'landlords and compound-house owners'],
  ['tenants', 'tenants who pay their own prepaid meter'],
  ['shop-owners', 'shop and kiosk owners'],
  ['churches', 'churches and fellowship halls'],
  ['diaspora', 'Ghanaians abroad topping up a home meter'],
  ['parents', 'parents buying credit for family meters'],
  ['offices', 'small offices and co-working spaces'],
  ['restaurants', 'chop bars and restaurants'],
  ['salons', 'salons and barber shops'],
  ['pharmacies', 'pharmacies that cannot afford outages'],
  ['night-workers', 'night-shift workers who need 24/7 power'],
  ['new-tenants', 'new tenants inheriting an unknown meter'],
  ['agents', 'mobile-money agents vending ECG for customers'],
  ['estate-managers', 'estate and facility managers'],
];

const appliances = [
  ['fridge', 'fridge and freezer'],
  ['air-conditioner', 'air conditioner'],
  ['iron', 'electric iron'],
  ['water-heater', 'immersion heater and geyser'],
  ['washing-machine', 'washing machine'],
  ['tv-decoder', 'TV and decoder standby'],
  ['fan', 'ceiling and standing fans'],
  ['rice-cooker', 'rice cooker and hot plate'],
  ['deep-freezer', 'deep freezer'],
  ['phone-chargers', 'phone and laptop chargers left in the wall'],
  ['security-lights', 'compound and security lights'],
  ['pump', 'water pump'],
  ['hair-dryer', 'hair dryer and straightener'],
  ['microwave', 'microwave and kettle'],
  ['led-bulbs', 'lighting and LED upgrades'],
];

function howto() {
  return [
    ['how-to-use-ecg-power-app', 'How to Use ECG Power App in Ghana (2026)', 'how to use ECG Power App', 'First-time Power App users who need a prepaid token today'],
    ['how-to-use-power-app-ghana', 'How to Use Power App for ECG Prepaid — Step by Step', 'how to use Power App', 'Anyone searching Power App who actually needs electricity credit'],
    ['what-is-ecg-power-app', 'What Is ECG Power App? Features, Limits, and the Ewale Shortcut', 'ECG Power App', 'New ECG customers comparing app vs USSD'],
    ['ecg-power-app-download-android', 'Download ECG Power App on Android — Then Buy Prepaid Faster', 'ECG Power App download Android', 'Android users hunting the official Play Store listing'],
    ['ecg-power-app-download-iphone', 'ECG Power App iPhone Download — App Store Steps + No-App Backup', 'ECG Power App iPhone', 'iPhone users who cannot find PowerApp in the App Store'],
    ['ecg-power-app-login', 'ECG Power App Login and OTP — Fix Delays, Buy Credit Anyway', 'ECG Power App login', 'Users stuck on OTP before they can top up'],
    ['register-ecg-power-app', 'How to Register on ECG Power App', 'register ECG Power App', 'First-time registrants with a Ghana mobile number'],
    ['add-meter-ecg-power-app', 'How to Add a Meter on ECG Power App', 'add meter ECG Power App', 'Households with a new or extra prepaid meter'],
    ['buy-prepaid-with-power-app', 'Buy Prepaid with Power App — ECG Token in Minutes', 'buy prepaid with Power App', 'Prepaid customers who prefer the official app'],
    ['buy-ecg-prepaid-on-power-app', 'Buy ECG Prepaid on Power App (and Without It)', 'buy ECG prepaid on Power App', 'People who googled buying credit inside Power App'],
    ['ecg-power-app-pay-bill', 'Pay ECG Bill on Power App — Postpaid and Prepaid', 'pay ECG bill Power App', 'Postpaid and prepaid customers paying from a phone'],
    ['ecg-power-app-check-balance', 'Check ECG Balance on Power App vs the Meter Screen', 'ECG Power App check balance', 'Users whose app balance disagrees with the meter'],
    ['ecg-power-app-history', 'ECG Power App Payment History — Find a Lost Token', 'ECG Power App history', 'Anyone who paid but lost the SMS token'],
    ['ecg-power-app-multiple-meters', 'Manage Multiple Meters on ECG Power App', 'ECG Power App multiple meters', 'Landlords and families with more than one meter'],
    ['ecg-power-app-notifications', 'ECG Power App Notifications — Low Credit Alerts That Matter', 'ECG Power App notifications', 'Households that keep hitting zero overnight'],
    ['ecg-powerapp-vs-power-app', 'ECG PowerApp vs “Power App” Search — Same Official App', 'ECG PowerApp', 'Users confused by Power App vs PowerApp spelling'],
    ['ecg-power-app-update', 'Update ECG Power App — Crash Fixes and When to Skip the App', 'update ECG Power App', 'Users whose app crashes after a store update'],
    ['uninstall-reinstall-ecg-power-app', 'Uninstall and Reinstall ECG Power App Without Losing Your Meter', 'reinstall ECG Power App', 'People wiping the app after login loops'],
    ['ecg-power-app-biometric-login', 'ECG Power App PIN and Biometrics — Safer Login', 'ECG Power App PIN', 'Users setting up fingerprint or Face ID on Power App'],
    ['ecg-power-app-offline', 'Does ECG Power App Work Offline? What to Dial Instead', 'ECG Power App offline', 'Users with no data who still need a token'],
    ['ecg-226-power-app-ussd', 'ECG *226# Power App USSD — Official Menu Explained', 'ECG *226# Power App', 'People who prefer USSD over the smartphone app'],
    ['ecg-power-app-otp-713-414', 'ECG Power App OTP Code *713*414# — Retrieve and Continue', 'ECG Power App OTP *713*414#', 'Users who never received the registration OTP'],
    ['ecg-power-app-language', 'ECG Power App in English — Menu Walkthrough', 'ECG Power App English', 'First-time users who need plain-language menus'],
    ['save-meter-ecg-power-app', 'Save Your Meter on ECG Power App for One-Tap Top-Up', 'save meter Power App', 'Repeat buyers tired of retyping meter numbers'],
    ['ecg-power-app-receipt', 'ECG Power App Receipts — Download, SMS, and Ewale Backup', 'ECG Power App receipt', 'Users who need proof of payment for a landlord'],
    ['ecg-power-app-customer-care', 'ECG Power App Customer Care vs Dialling Ewale Support', 'ECG Power App customer care', 'People stuck between app chat and a dark house'],
    ['verify-official-ecg-power-app', 'Verify the Official ECG Power App — Avoid Fake Listings', 'official ECG Power App', 'Users who saw lookalike apps in search results'],
    ['ecg-power-app-permissions', 'ECG Power App Permissions — What to Allow', 'ECG Power App permissions', 'Privacy-conscious Android and iPhone users'],
    ['ecg-power-app-data-usage', 'How Much Data Does ECG Power App Use?', 'ECG Power App data usage', 'Users on small data bundles'],
    ['ecg-power-app-for-beginners', 'ECG Power App for Beginners — First Token in 10 Minutes', 'ECG Power App for beginners', 'Complete beginners buying prepaid the first time'],
    ['switch-from-power-app-to-ewale', 'Switch from Power App to Ewale *714*22# Without Changing Meters', 'switch from Power App to Ewale', 'Users tired of app OTP and store updates'],
    ['ecg-power-app-web-alternative', 'ECG Power App Web Alternative — Ewale Checkout', 'ECG Power App web alternative', 'Laptop users who do not want a mobile app'],
    ['how-to-top-up-with-power-app', 'How to Top Up ECG with Power App', 'top up with Power App', 'Searchers using “top up” instead of “buy prepaid”'],
    ['power-app-buy-electricity-ghana', 'Power App Buy Electricity Ghana — 2026 Guide', 'Power App buy electricity Ghana', 'Broad “buy electricity” searches that land on Power App'],
    ['ecg-power-app-minimum-amount', 'ECG Power App Minimum Amount — Small Top-Ups That Work', 'ECG Power App minimum amount', 'Students buying GH₵5–20 at a time'],
    ['ecg-power-app-maximum-amount', 'ECG Power App Maximum Purchase — Large Tokens Safely', 'ECG Power App maximum amount', 'Shops buying a week of credit at once'],
    ['ecg-power-app-wrong-meter', 'Wrong Meter on ECG Power App — Stop, Confirm, Re-add', 'wrong meter Power App', 'Users who almost paid the neighbour’s meter'],
    ['ecg-power-app-account-name', 'ECG Power App Account Name Check Before You Pay', 'Power App account name', 'Tenants verifying the meter belongs to the house'],
    ['ecg-power-app-split-meter-ciu', 'ECG Power App and Split Meters — Token on the CIU', 'Power App split meter CIU', 'Homes with pole meters and indoor keypads'],
    ['learn-ecg-power-app-in-5-minutes', 'Learn ECG Power App in 5 Minutes', 'learn ECG Power App', 'Busy users who want a short walkthrough'],
  ];
}

function buy() {
  return [
    ['buy-prepaid-electricity-with-power-app', 'Buy Prepaid Electricity with Power App in Ghana', 'buy prepaid with Power App', 'Prepaid households topping up from a smartphone'],
    ['buy-ecg-credit-power-app-momo', 'Buy ECG Credit on Power App with Mobile Money', 'Power App Mobile Money', 'MoMo users paying inside the official app'],
    ['buy-ecg-prepaid-power-app-mtn', 'Buy ECG Prepaid on Power App with MTN MoMo', 'Power App MTN MoMo', 'MTN subscribers using Power App checkout'],
    ['buy-ecg-prepaid-power-app-telecel', 'Buy ECG Prepaid on Power App with Telecel Cash', 'Power App Telecel Cash', 'Telecel Cash wallets paying ECG'],
    ['buy-ecg-prepaid-power-app-at-money', 'Buy ECG Prepaid on Power App with AT Money', 'Power App AT Money', 'AT Money users who also want a no-app path'],
    ['buy-ecg-prepaid-card-on-power-app', 'Pay ECG on Power App with Visa or Mastercard', 'Power App card payment', 'Card holders who do not want to use MoMo'],
    ['buy-ecg-token-power-app-sms', 'ECG Token SMS After Power App Payment', 'Power App token SMS', 'Users waiting on the 20-digit code'],
    ['buy-prepaid-for-someone-power-app', 'Buy ECG Prepaid for Someone Else on Power App', 'buy prepaid for someone Power App', 'Children and relatives paying another meter'],
    ['buy-ecg-prepaid-abroad-power-app', 'Buy ECG Prepaid from Abroad with Power App or Ewale', 'buy ECG prepaid from abroad', 'Diaspora Ghanaians sending home credit'],
    ['midnight-ecg-top-up-power-app', 'Midnight ECG Top-Up — Power App vs *714*22#', 'midnight ECG top up', 'Households whose credit dies after 10pm'],
    ['weekend-ecg-prepaid-power-app', 'Weekend ECG Prepaid — Power App When Vendors Are Closed', 'weekend ECG prepaid', 'Saturday/Sunday outages with no cash vendor'],
    ['holiday-ecg-credit-power-app', 'Holiday ECG Credit — Buy Before Christmas and Easter Rush', 'holiday ECG credit', 'Families stocking credit before public holidays'],
    ['small-shop-ecg-prepaid-power-app', 'Small Shop ECG Prepaid on Power App', 'shop ECG prepaid Power App', 'Kiosks that cannot close for a district queue'],
    ['emergency-ecg-token-power-app', 'Emergency ECG Token — Power App Down, Ewale Up', 'emergency ECG token', 'Households already on zero credit'],
    ['first-prepaid-purchase-power-app', 'Your First ECG Prepaid Purchase on Power App', 'first prepaid purchase Power App', 'Newly installed prepaid meters'],
    ['repeat-top-up-power-app', 'Repeat ECG Top-Ups on Power App Without Re-entering the Meter', 'repeat top up Power App', 'Saved-meter users doing weekly buys'],
    ['power-app-pending-payment', 'Power App Payment Pending — Do Not Pay Twice', 'Power App pending payment', 'Users whose MoMo hung after PIN'],
    ['power-app-failed-transaction', 'Power App Failed Transaction — Recover or Use Ewale', 'Power App failed transaction', 'Failed checkouts with uncertain debit'],
    ['compare-power-app-and-71422', 'Power App vs *714*22# — Which Buys ECG Prepaid Faster?', 'Power App vs *714*22#', 'Shoppers comparing official app and Ewale'],
    ['buy-ecg-without-downloading-power-app', 'Buy ECG Without Downloading Power App', 'buy ECG without downloading Power App', 'Low-storage phones and feature phones'],
    ['power-app-token-not-loading', 'Power App Token Not Loading on Meter', 'Power App token not loading', 'Paid users staring at a dark fridge'],
    ['how-much-ecg-credit-to-buy', 'How Much ECG Credit to Buy — Weekly vs Monthly', 'how much ECG credit to buy', 'Households guessing GH₵50 vs GH₵200'],
    ['lifeline-tariff-prepaid-power-app', 'Stay on ECG Lifeline Tariff — Buy Smart, Use Less', 'ECG lifeline tariff prepaid', 'Low-consumption homes protecting the first block'],
    ['debt-recovery-on-prepaid-power-app', 'ECG Prepaid Debt Recovery — Why GH₵50 Buys Fewer Units', 'prepaid debt recovery', 'Meters deducting arrears from every token'],
    ['service-charge-on-ecg-token', 'ECG Service Charge on Your Token Receipt', 'ECG service charge token', 'Users shocked by levies on a small top-up'],
  ];
}

function conserve() {
  return [
    ['energy-conservation-ghana-ecg', 'Energy Conservation in Ghana — Cut ECG Prepaid Use', 'energy conservation Ghana', 'Households whose tokens vanish in days'],
    ['save-electricity-ghana-home', 'How to Save Electricity at Home in Ghana (2026)', 'save electricity Ghana', 'Families watching PURC tariff blocks'],
    ['reduce-ecg-bill-prepaid', 'Reduce Your ECG Prepaid Bill Without Sitting in the Dark', 'reduce ECG bill', 'Prepaid users who still need fans and fridges'],
    ['ghana-energy-saving-tips', 'Ghana Energy-Saving Tips That Show Up on Your Next Token', 'Ghana energy saving tips', 'Practical conservation, not slogans'],
    ['purc-blocks-save-power', 'PURC Tariff Blocks — Why Saving kWh Saves Cedis', 'PURC tariff blocks', 'Users who crossed into a dearer consumption block'],
    ['led-bulbs-ghana-ecg', 'Switch to LED Bulbs — Fastest ECG Saving in Ghana Homes', 'LED bulbs Ghana ECG', 'Compounds still on old incandescent or CFL'],
    ['fridge-energy-tips-ghana', 'Fridge Energy Tips Ghana — Seals, Placement, Defrost', 'fridge energy Ghana', 'Homes where the fridge is the biggest load'],
    ['ac-energy-saving-ghana', 'Air Conditioner Energy Saving Ghana — 24–26°C Rules', 'AC energy saving Ghana', 'AC users in Accra heat'],
    ['iron-clothes-batch-ghana', 'Iron Clothes in Batches — Hidden ECG Drain', 'iron clothes energy Ghana', 'Households ironing one shirt at a time'],
    ['standby-power-ghana', 'Kill Standby Power — TV, Decoder, Chargers', 'standby power Ghana', 'Living rooms with always-on decoders'],
    ['water-heater-energy-ghana', 'Immersion Heater Energy Tips — Timer, Not All Day', 'water heater energy Ghana', 'Homes boiling water electrically'],
    ['washing-machine-full-load-ghana', 'Washing Machine Full Loads — Fewer Cycles, More kWh Saved', 'washing machine energy Ghana', 'Families running half-empty machines'],
    ['fan-vs-ac-ghana', 'Fan vs AC in Ghana — When a Fan Is Enough', 'fan vs AC Ghana', 'Rooms choosing comfort vs credit'],
    ['compound-lighting-ghana', 'Compound Lighting — LEDs and Motion, Not All-Night Floods', 'compound lighting energy', 'Houses with security lights till dawn'],
    ['cook-efficiently-ghana-electric', 'Efficient Electric Cooking — Kettle, Rice Cooker, Hot Plate', 'efficient electric cooking Ghana', 'Kitchen loads on prepaid meters'],
    ['seal-windows-ac-ghana', 'Close Windows Before AC — Stop Paying to Cool the Street', 'AC closed windows Ghana', 'AC rooms with open louvres'],
    ['defrost-freezer-ghana', 'Defrost the Freezer — Ice Is Wasted Electricity', 'defrost freezer Ghana', 'Iced-up chest freezers'],
    ['hot-food-in-fridge-ghana', 'Never Put Hot Food in the Fridge — Prepaid Cost', 'hot food fridge energy', 'After-cooking fridge spikes'],
    ['phone-charger-vampire-load', 'Unplug Chargers — Small Loads, 30-Day Token Leak', 'charger vampire load', 'Bedsides full of idle chargers'],
    ['solar-lantern-backup-ghana', 'Solar Lanterns for Compound Paths — Save Grid Credit', 'solar lantern Ghana', 'Compounds lighting yards from ECG'],
    ['peak-evening-load-ghana', 'Evening Peak Load — Stagger Iron, Heater, and AC', 'evening peak electricity Ghana', '6–10pm household pile-up'],
    ['one-fridge-rule-ghana', 'One Fridge Rule — Extra Freezers Eat Tokens', 'extra freezer electricity Ghana', 'Homes running two cold appliances'],
    ['natural-light-ghana-home', 'Use Daylight — Turn Off Rooms You Left', 'daylight energy Ghana', 'Daytime lights left on'],
    ['laptop-not-tv-ghana', 'Laptop vs TV Hours — Entertainment Load', 'TV electricity Ghana', 'Long decoder hours'],
    ['water-pump-timer-ghana', 'Water Pump Timer — Do Not Run Dry or All Day', 'water pump energy Ghana', 'Houses with borehole or loft tanks'],
    ['hair-tools-energy-ghana', 'Hair Dryers and Straighteners — Short Bursts', 'hair dryer electricity Ghana', 'Salons and home styling'],
    ['office-equipment-ghana', 'Printers and Photocopiers — Sleep Mode Overnight', 'office electricity Ghana', 'Small offices on prepaid'],
    ['church-hall-energy-ghana', 'Church Hall Energy — Fans, Mixers, Night Lights', 'church electricity Ghana', 'Fellowship buildings on ECG prepaid'],
    ['shop-fridge-doors-ghana', 'Shop Display Fridges — Keep Doors Shut', 'shop fridge energy Ghana', 'Retail cold drinks'],
    ['energy-audit-home-ghana', '10-Minute Home Energy Audit for ECG Prepaid', 'home energy audit Ghana', 'DIY checkers before blaming the meter'],
    ['compare-monthly-kwh-receipt', 'Compare kWh on Token Receipts — Proof Conservation Works', 'compare kWh token receipt', 'Users who want numbers, not vibes'],
    ['lifeline-keep-consumption-low', 'Keep Monthly kWh Low — Protect Lifeline Units', 'keep kWh low Ghana', 'Households near the block cliff'],
    ['share-meter-conservation', 'Shared Meter Conservation — House Rules That Stick', 'shared meter electricity Ghana', 'Compound houses on one prepaid meter'],
    ['kids-lights-out-ghana', 'Teach Lights-Out — Kids and ECG Credit', 'kids save electricity Ghana', 'Family behaviour change'],
    ['rainy-season-humidity-load', 'Rainy Season Humidity — Dehumidify Without Wasting AC', 'rainy season electricity Ghana', 'June–September moisture and AC'],
    ['harmattan-fan-use', 'Harmattan Fans — Dust vs Cooling Load', 'Harmattan electricity Ghana', 'Dry-season fan and AC patterns'],
    ['generator-vs-prepaid-mix', 'Generator vs Prepaid — When Backup Saves Tokens', 'generator vs ECG prepaid', 'Homes with small gensets'],
    ['inverter-fan-ghana', 'Inverter Fans and Fridges — Worth It on Prepaid', 'inverter appliances Ghana', 'Shoppers upgrading appliances'],
    ['unplug-microwave-ghana', 'Unplug Microwave and Kettle at the Wall', 'microwave standby Ghana', 'Kitchen sockets always live'],
    ['energy-conservation-and-power-app', 'Energy Conservation + Power App — Track, Then Top Up Smart', 'energy conservation Power App', 'Users who want app history plus lower kWh'],
  ];
}

function consume() {
  return [
    ['prepaid-consumption-tips-ghana', 'Prepaid Consumption Tips Ghana — Stretch Every Token', 'prepaid consumption tips', 'Fast-draining prepaid meters'],
    ['why-ecg-credit-finishes-fast', 'Why ECG Credit Finishes Fast — 12 Real Causes', 'ECG credit finishes fast', 'Households blaming “faulty tokens”'],
    ['track-kwh-per-cedi', 'Track kWh per Cedi on Every ECG SMS', 'kWh per cedi ECG', 'People who want a unit price'],
    ['meter-lcd-consumption-ghana', 'Read Meter LCD Consumption — Credit, kWh, Power', 'read ECG meter LCD', 'Users who never scroll the display'],
    ['avoid-zero-credit-outage', 'Never Hit Zero — Buffer Credit Strategy', 'avoid zero ECG credit', 'Night outages from empty meters'],
    ['weekly-ecg-budget', 'Weekly ECG Budget — GH₵ Amounts That Last', 'weekly ECG budget', 'Salary-week planners'],
    ['appliance-watt-estimate-ghana', 'Guess Which Appliance Ate the Token', 'appliance watts Ghana prepaid', 'Homes hunting the culprit load'],
    ['illegal-connection-on-your-meter', 'Neighbour on Your Meter — Consumption Spike Signs', 'illegal connection ECG meter', 'Sudden unexplained kWh jumps'],
    ['new-meter-faster-consumption', 'New Prepaid Meter Uses More? Accuracy, Not a Curse', 'new prepaid meter consumption', 'After analog-to-prepaid swap'],
    ['ciu-vs-main-meter-balance', 'CIU vs Main Meter Balance — Which Number to Trust', 'CIU meter balance', 'Split-meter confusion'],
    ['token-accepted-still-dark', 'Token Accepted but House Still Dark', 'token accepted no power', 'Breaker, outage, or tamper flag'],
    ['buy-before-it-rains', 'Buy ECG Credit Before Storms — Vendors and Data Fail', 'buy ECG before rain', 'Storm-night outages'],
    ['sms-token-storage', 'Save Token SMS Until Accept — Do Not Delete', 'save ECG token SMS', 'People who clear SMS too early'],
    ['forward-token-to-house', 'Forward Tokens to Whoever Is Home', 'forward ECG token', 'Payers who are not on site'],
    ['small-top-ups-vs-large', 'Many Small Top-Ups vs One Large Token', 'small vs large ECG top up', 'Fee and service-charge awareness'],
    ['check-balance-before-guests', 'Check Credit Before Weekend Guests Arrive', 'check ECG before guests', 'Hosts who get caught at zero'],
    ['shop-closing-load', 'Shop Closing Routine — Fridges and Signage', 'shop closing electricity', 'Retail prepaid discipline'],
    ['hostel-shared-prepaid', 'Hostel Shared Prepaid — Fair Rules, Faster Tokens', 'hostel ECG prepaid', 'Student hostels'],
    ['airbnb-ecg-prepaid', 'Short-Let ECG Prepaid — Guest Instructions That Work', 'Airbnb ECG prepaid', 'Hosts leaving token how-tos'],
    ['monitor-night-load', 'Night Load Check — What Runs While You Sleep', 'night electricity load Ghana', 'Mystery overnight drain'],
    ['power-app-consumption-graph', 'Power App Consumption History — Use It, Then Conserve', 'Power App consumption history', 'App users ignoring the graph'],
    ['receipt-levies-explained', 'ECG Receipt Levies Explained — Not All of It Is kWh', 'ECG receipt levies', 'Angry at “small units”'],
    ['tamper-flag-consumption', 'Meter Tamper Flag — Credit There, Supply Off', 'ECG tamper flag', 'Meters that need ECG staff'],
    ['voltage-trip-prepaid', 'Over/Under Voltage Trip — Credit Intact, Lights Off', 'ECG voltage trip', 'After grid swings'],
    ['plan-token-around-salary', 'Plan Tokens Around Payday — Avoid Panic Buys', 'payday ECG credit', 'Cash-flow matching'],
    ['two-week-credit-test', 'Two-Week Credit Test — Measure Real Household kWh', 'measure household kWh Ghana', 'Experimenters'],
    ['label-appliances-wattage', 'Label High-Watt Appliances — Iron, Heater, AC', 'label appliance wattage', 'Visual reminders'],
    ['dont-stack-heat-loads', 'Do Not Stack Heat Loads — Iron + Heater + Kettle', 'stack heat loads ECG', 'Kitchen and laundry overlap'],
    ['prepaid-for-landlords-rules', 'Landlord Prepaid Rules Tenants Will Follow', 'landlord prepaid rules', 'Owners issuing house rules'],
    ['consumption-tips-with-ewale', 'Consumption Tips + Ewale Top-Up — The Full Loop', 'consumption tips Ewale', 'People who save units then still need a channel'],
  ];
}

function fix() {
  return [
    ['ecg-power-app-not-working', 'ECG Power App Not Working — Fixes and Ewale Backup', 'ECG Power App not working', 'Users staring at a spinner'],
    ['ecg-power-app-keeps-crashing', 'ECG Power App Keeps Crashing on Android', 'ECG Power App crashing', 'Android crash loops'],
    ['ecg-power-app-stuck-on-otp', 'ECG Power App Stuck on OTP', 'Power App stuck on OTP', 'Registration hell'],
    ['ecg-power-app-invalid-meter', 'ECG Power App Invalid Meter Number', 'Power App invalid meter', 'Lookup failures'],
    ['ecg-power-app-meter-not-found', 'ECG Power App Meter Not Found', 'Power App meter not found', 'New installations'],
    ['ecg-power-app-cannot-login', 'Cannot Login to ECG Power App', 'cannot login Power App', 'PIN lockouts'],
    ['ecg-power-app-forgot-pin', 'Forgot ECG Power App PIN', 'forgot Power App PIN', 'Reset via OTP'],
    ['ecg-power-app-no-internet-error', 'ECG Power App No Internet Error', 'Power App no internet', 'Weak data'],
    ['ecg-power-app-play-store-missing', 'ECG Power App Not on Play Store', 'Power App not on Play Store', 'Region or search issues'],
    ['ecg-power-app-ios-not-installing', 'ECG Power App Not Installing on iPhone', 'Power App iPhone install fail', 'Storage and iOS version'],
    ['ecg-power-app-white-screen', 'ECG Power App White Screen', 'Power App white screen', 'Cache issues'],
    ['ecg-power-app-payment-declined', 'ECG Power App Payment Declined', 'Power App payment declined', 'MoMo/card declines'],
    ['duplicate-ecg-payment-power-app', 'Duplicate ECG Payment on Power App', 'duplicate Power App payment', 'Double debit fear'],
    ['power-app-wrong-amount', 'Wrong Amount on Power App — Stop Before PIN', 'wrong amount Power App', 'Typos on GHS'],
    ['power-app-session-timeout', 'Power App Session Timeout — Finish Faster or Use USSD', 'Power App session timeout', 'Slow typers'],
    ['power-app-token-reject-used', 'Token Says Used After Power App Buy', 'token used Power App', 'Already loaded'],
    ['power-app-token-invalid', 'Token Invalid After Power App Purchase', 'token invalid Power App', 'Digit errors'],
    ['power-app-token-old', 'Token Old / Reject Old — Buy Fresh on Ewale', 'token old reject', 'Stale unredeemed tokens'],
    ['power-app-sms-delay', 'Power App SMS Token Delay — Wait, Then Retrieve', 'Power App SMS delay', '10–15 minute waits'],
    ['power-app-update-required', 'ECG Power App Update Required Loop', 'Power App update required', 'Forced updates on poor data'],
  ];
}

const applianceTips = {
  fridge: [
    'Leave a fist of space behind the fridge for airflow — a hot compressor burns credit.',
    'Check the door seal with a paper strip; if it slips out easily, you are cooling the room.',
    'Set fridge to the middle thermostat, not the coldest number “just in case.”',
    'Defrost when ice is thicker than a coin; ice forces longer compressor runs.',
    'Top up before a long market day so a loaded fridge is not sitting at zero.',
  ],
  'air-conditioner': [
    'Set 24–26°C. Every degree colder is a visible kWh jump on the next token.',
    'Close louvres and curtains before AC — you are not cooling Makola market.',
    'Clean filters monthly; dusty filters make the compressor work like a gym.',
    'Use a timer so AC dies after you sleep, then wake to a fan.',
    'Buy credit before a heatwave weekend; Power App data also fails in storms.',
  ],
  iron: [
    'Iron a full basket once, not one school shirt every morning.',
    'Start with clothes that need high heat, then finish with damp ones as the plate cools.',
    'Unplug the iron the moment the last cloth is done — residual heat still uses nothing if unplugged.',
    'Skip the iron for already-smooth school uniforms when you can.',
    'Never iron during the same hour as the water heater and kettle.',
  ],
  'water-heater': [
    'Heat water for 10–15 minutes, not “leave it on.”',
    'A flask beats a second boil for tea and bathing water.',
    'Check for a leaking heater element — it will eat tokens silently.',
    'Do not run heater and AC together on a small prepaid meter.',
    'Keep a GH₵20 buffer so a morning shower does not black out the fridge.',
  ],
  'washing-machine': [
    'Full loads only. Half loads still heat water and spin almost as long.',
    'Use cold wash when fabric allows — heating water is the expensive part.',
    'Clean the filter so the motor is not fighting lint.',
    'Air-dry in the compound; tumble dryers are token killers if you have one.',
    'Schedule laundry when credit is healthy, not at 0.4 remaining.',
  ],
  'tv-decoder': [
    'Switch the decoder off at the wall, not with the remote only.',
    'One family TV beats three bedrooms streaming and decoding.',
    'Lower brightness; it is comfort, not a generator.',
    'Unplug speakers and soundbars overnight.',
    'If nights go dark, it is often decoder + fridge, not “bad ECG.”',
  ],
  fan: [
    'A fan uses a fraction of AC — default to fan until heat is unbearable.',
    'Ceiling fans on medium move air; high speed is not always cooler per kWh.',
    'Oil or dust the blades; imbalance wastes motor effort.',
    'Sleep with a timer if your fan has one.',
    'Do not run every room fan “for air” when nobody is inside.',
  ],
  'rice-cooker': [
    'Unplug when the keep-warm light has done its job.',
    'Cook once, store, reheat a portion — keep-warm all afternoon is a leak.',
    'Match pot size to the cooker; tiny pots on big plates waste heat.',
    'Do not run cooker, kettle, and hot plate as a band.',
    'Buy credit before Sunday rice if that is the house ritual.',
  ],
  'deep-freezer': [
    'A chest freezer as a second fridge is a classic token drain.',
    'Fill empty space with bottles of water so it holds cold when opened.',
    'Open once, plan the meal, close — browsing freezes the bill.',
    'Site it away from the cooker and sun.',
    'If consumption doubled after adding a freezer, the math is the freezer.',
  ],
  'phone-chargers': [
    'Unplug when the phone hits 100%. Overnight charging wastes little per phone but adds up in a family.',
    'Laptop bricks left in the wall sip power 24/7.',
    'Power strips with a switch beat hunting seven plugs.',
    'Do not charge and AC the same small room circuit as a lifestyle.',
    'Feature phones still need *714*22# even if smartphones are charging.',
  ],
  'security-lights': [
    'Replace halogen floods with LED. Same light, far fewer kWh.',
    'Motion sensors beat all-night blazing.',
    'One well-placed lamp beats four decorative floods.',
    'Solar path lights for the compound save grid credit for the fridge.',
    'Check that security lights are actually on your prepaid meter, not a neighbour’s.',
  ],
  pump: [
    'Fill the tank, then stop. Dry-running destroys pumps and wastes electricity.',
    'A simple timer or float switch pays for itself in tokens.',
    'Fix leaking taps; the pump should not refill a drip all night.',
    'Do not pump during the iron+heater hour.',
    'Keep credit above zero; a mid-pump outage can strand the motor.',
  ],
  'hair-dryer': [
    'Towel-dry first; the dryer should finish, not start, the job.',
    'Salon owners: stagger dryers, do not run four on one meter.',
    'Lower heat setting is slower and cheaper.',
    'Unplug after the last client.',
    'Top up before a Saturday rush so Power App OTP is not your bottleneck.',
  ],
  microwave: [
    'Microwaves on standby still draw. Wall switch off.',
    'Reheat, do not cook whole meals unless you must.',
    'Kettle then flask beats boiling a full kettle five times.',
    'Do not microwave and kettle together on a weak prepaid.',
    'Check the door seal; leaks mean longer runs.',
  ],
  'led-bulbs': [
    'Swap the five most-used bulbs first: sitting room, porch, kitchen.',
    'Warm-white LED is enough; over-bright shops waste kWh.',
    'Outdoor LEDs with dusk sensors beat forgetting the switch.',
    'Avoid cheap LEDs that fail and get replaced with old stock.',
    'After lighting upgrades, compare the next two token receipts.',
  ],
};

function hash(s) {
  let h = 0;
  for (const c of s) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

const rotatingTips = [
  'Save the last token SMS as a meter-number backup — it is more reliable than memory at 11pm.',
  'A GH₵10–20 buffer beats a dark fridge; buy before the LCD hits zero.',
  'Name lookup must match the premises. Cancel before PIN if it does not.',
  'Feature phones can still vend: Ewale *714*22# does not need Play Store.',
  'Storms kill data. Practise the USSD path while the lights are still on.',
  'Do not pay twice. Check MoMo history if Power App hangs on pending.',
  'Used on the keypad means the token already loaded — buy a new one only if credit is still zero and MoMo did not debit.',
  'Invalid usually means a mistyped digit, not a fake token.',
  'PURC blocks punish high kWh. Conservation is cheaper than a bigger token.',
  'Shared meters need a written top-up rule or someone always “forgets.”',
  'Screenshot the confirmed account name the first time you add the meter.',
  'MTN, Telecel, and AT all work on Ewale; the token format does not change.',
  'Enter all 20 digits on the meter or indoor CIU, then wait for Accept.',
  'District offices fix tamper flags and new meters; they are slow for a same-night token.',
  'Keep *714*22# on a paper on the fridge for whoever is home.',
  'Power App graphs help after the fact; USSD helps when the house is already dark.',
  'Small top-ups still carry levies — a weekly amount often stretches further than five panic buys.',
  'Never share your MoMo PIN with an agent, neighbour, or “ECG officer” on WhatsApp.',
  'If OTP takes more than two minutes, retrieve via *713*414# or switch to Ewale.',
  'Confirm you installed ECG PowerApp from Electricity Company of Ghana, not a lookalike listing.',
];

function extraTips(cluster, slug, keyword) {
  const common = {
    howto: [
      'Search the store for ECG PowerApp and confirm the publisher is Electricity Company of Ghana.',
      'If OTP takes more than two minutes, retrieve via *713*414# or abandon the app and dial *714*22#.',
      'Add the meter once, then screenshot the confirmed account name.',
    ],
    buy: [
      'Confirm MoMo balance covers amount plus any fee before you tap pay.',
      'If the name on screen is not your house, cancel before PIN.',
      'Save the token SMS; “Used” on the meter means it already loaded.',
    ],
    conserve: [
      'The cheapest kWh is the one you do not use in a higher PURC block.',
      'One behaviour change beats five posters: lights, fridge, heat loads.',
      'Track two token receipts before and after a habit change.',
    ],
    consume: [
      'Meter LCD is the source of truth; apps can lag.',
      'Zero credit is a choice if you ignore a GH₵10 buffer.',
      'Levies on the receipt are not “stolen units.”',
    ],
    fix: [
      'Do not double-pay. Check MoMo statement first.',
      'Clear app cache or reinstall only after you have bought credit another way.',
      'Invalid meter: copy digits from the sticker, no spaces.',
    ],
    place: [
      'Local vendors close; USSD does not.',
      'District offices still handle new meters and tamper resets.',
      'Storms kill data — practise *714*22# before you need it.',
    ],
    audience: [
      'Write the meter number where the user of the space can see it.',
      'Agree who pays before credit hits zero.',
      'Diaspora payers should confirm the name lookup once, then save it.',
    ],
  };
  const h = hash(slug);
  const rotated = rotatingTips[h % rotatingTips.length];
  return [
    `For “${keyword}”, treat ECG Power App as optional and Ewale *714*22# as the no-data backup.`,
    ...common[cluster].slice(0, 3),
    rotated,
  ];
}

const topics = [];
const usedSlugs = new Set();

function push(slug, title, keyword, audience, cluster, hook, tips, faqs) {
  if (reservedSlugs.has(slug)) throw new Error(`reserved ${slug}`);
  if (usedSlugs.has(slug)) throw new Error(`dup ${slug}`);
  usedSlugs.add(slug);
  topics.push({ slug, title, keyword, cluster, hook, audience, tips: tips.slice(0, 5), faqs });
}

const reservedSlugs = new Set([
  'buy-ecg-prepaid-without-power-app',
  'install-ecg-prepaid-app',
  'ecg-power-top-up-guide',
  'how-to-buy-ecg-prepaid-online',
  'how-to-buy-ecg-prepaid-with-mtn',
  'how-to-pay-ecg-bills',
  'ecg-electricity-payment-without-internet',
  'ecg-postpaid-bill-payment-shortcode-ghana',
  'ecg-meter-number-payment-guide',
  'ecg-prepaid-token-not-received-fix',
  'pay-ecg-bill-mtn-momo-shortcode',
  'ecg-ussd-code-ghana-complete-guide',
  'ecg-226-alternative-ewale-shortcode',
  'best-ecg-shortcode-ghana-2026',
  'ecg-shortcode-226-vs-71422-ewale',
  'shortcode-pay-ecg-electricity-ghana',
  'ecg-shortcode',
  'ecg-company-information',
  'ecg-prepaid-code-and-bill-payment-shortcode-guide',
]);

function faqsFor(keyword, cluster) {
  const base = [
    {
      q: `Is ECG Power App required when you search “${keyword}”?`,
      a: 'No. ECG Power App is optional. Dial *714*22# on Ewale, choose Utilities → ECG → Prepaid, pay with MoMo, and enter the SMS token on the meter.',
    },
    {
      q: `Is the token from Power App different from Ewale?`,
      a: 'No. Both issue a standard 20-digit STS token for your meter. What changes is whether you needed data, an app login, and OTP before the token arrived.',
    },
    {
      q: `What is the fastest 2026 path for ${keyword}?`,
      a: 'If Power App is already open and OTP works, finish there. Otherwise dial *714*22# on Ewale. Do not wait on a spinner while the fridge warms. Check MoMo before paying twice.',
    },
  ];
  if (cluster === 'conserve' || cluster === 'consume') {
    base[0] = {
      q: `Will conservation still help if I search ${keyword}?`,
      a: 'Yes. Saving kWh is independent of the vending channel. Use Power App history if you like graphs, and Ewale *714*22# when you need a token without data.',
    };
    base.push({
      q: `How do I know ${keyword} advice is working?`,
      a: 'Compare kWh (not only cedis) on two token SMS receipts after you change a habit. If kWh drops, the tip worked — even if tariff blocks still change the cedi amount.',
    });
  } else {
    base.push({
      q: `Can I skip Power App entirely for ${keyword}?`,
      a: 'Yes. Dial *714*22# → Utilities → ECG Power → Prepaid. The 20-digit STS token is the same. Power App is useful for history; it is not required to keep the lights on.',
    });
  }
  return base;
}

for (const [slug, title, keyword, audience] of howto()) {
  push(
    slug,
    title,
    keyword,
    audience,
    'howto',
    `Searching ${keyword} usually means you want a prepaid token, not another app tutorial.`,
    extraTips('howto', slug, keyword),
    faqsFor(keyword, 'howto'),
  );
}

for (const [slug, title, keyword, audience] of buy()) {
  push(
    slug,
    title,
    keyword,
    audience,
    'buy',
    `For ${keyword}, treat Power App as one checkout — Ewale *714*22# is the one that works on any phone.`,
    extraTips('buy', slug, keyword),
    faqsFor(keyword, 'buy'),
  );
}

for (const [slug, title, keyword, audience] of conserve()) {
  push(
    slug,
    title,
    keyword,
    audience,
    'conserve',
    `${title.replace(/ \(.*/, '')} starts with habits, then a reliable top-up so saved units are not wasted on an outage.`,
    extraTips('conserve', slug, keyword),
    faqsFor(keyword, 'conserve'),
  );
}

for (const [slug, title, keyword, audience] of consume().slice(0, 25)) {
  push(
    slug,
    title,
    keyword,
    audience,
    'consume',
    `Prepaid tips only work if you can still buy credit when the meter is low. Power App is optional; Ewale is the safety net.`,
    extraTips('consume', slug, keyword),
    faqsFor(keyword, 'consume'),
  );
}

for (const [slug, title, keyword, audience] of fix().slice(0, 15)) {
  push(
    slug,
    title,
    keyword,
    audience,
    'fix',
    `When ${keyword} hits, buy the token first on Ewale, then debug the app in the light.`,
    extraTips('fix', slug, keyword),
    faqsFor(keyword, 'fix'),
  );
}

for (const [slugPart, label] of places.slice(0, 15)) {
  push(
    `ecg-power-app-${slugPart}`,
    `ECG Power App in ${label} — Buy Prepaid Without the Queue`,
    `ECG Power App ${label}`,
    `ECG prepaid customers in ${label}`,
    'place',
    `${label} still has district offices, but day-to-day ECG prepaid does not need a queue if you have Power App data — or *714*22#.`,
    extraTips('place', slugPart, `ECG Power App ${label}`).map((t) => t.replace('the suburb', label)),
    faqsFor(`ECG Power App ${label}`, 'place'),
  );
}

for (const [slugPart, audience] of audiences) {
  push(
    `ecg-prepaid-${slugPart}-power-app`,
    `ECG Prepaid for ${audience[0].toUpperCase()}${audience.slice(1)} — Power App or Ewale`,
    `ECG prepaid ${slugPart.replace(/-/g, ' ')}`,
    audience,
    'audience',
    `If you are among ${audience}, you need a meter number and a payment path that works when Power App OTP fails.`,
    extraTips('audience', slugPart, `ECG prepaid ${slugPart.replace(/-/g, ' ')}`),
    faqsFor(`ECG prepaid ${slugPart}`, 'audience'),
  );
}

for (const [slugPart, label] of appliances) {
  const tips = applianceTips[slugPart];
  push(
    `save-power-${slugPart}-ghana-ecg`,
    `Save ECG Credit on Your ${label.replace(/\b\w/g, (c) => c.toUpperCase())} — Ghana Prepaid Tips`,
    `${label} electricity Ghana`,
    `Homes and shops where ${label} dominate the prepaid meter`,
    'conserve',
    `${label.replace(/^./, (c) => c.toUpperCase())} is one of the fastest ways Ghana prepaid meters empty. Cut the waste, then top up on Ewale or Power App.`,
    tips,
    faqsFor(`${label} energy`, 'conserve'),
  );
}

const moreHow = [
  ['ecg-power-app-vs-vendor', 'ECG Power App vs Street Vendor — Tokens Compared', 'Power App vs vendor', 'People still walking to a kiosk', 'howto'],
  ['ecg-power-app-vs-bank-app', 'ECG Power App vs Bank Bill Pay', 'Power App vs bank app', 'Bank-app bill payers', 'buy'],
  ['ecg-power-app-for-postpaid', 'ECG Power App for Postpaid Bills', 'Power App postpaid', 'Postpaid account holders', 'buy'],
  ['move-from-postpaid-to-prepaid-app', 'Moved to Prepaid? Use Power App or *714*22#', 'postpaid to prepaid Power App', 'Newly converted prepaid homes', 'howto'],
  ['ecg-power-app-business-account', 'ECG Power App for Small Business Meters', 'Power App business meter', 'Non-residential prepaid', 'audience'],
  ['read-ecg-token-sms', 'How to Read an ECG Token SMS After Power App', 'read ECG token SMS', 'First-time SMS readers', 'howto'],
  ['enter-20-digit-ecg-token', 'Enter a 20-Digit ECG Token — Keypad and CIU', 'enter 20 digit ECG token', 'Anyone with a token in hand', 'howto'],
  ['ecg-power-app-security-tips', 'ECG Power App Security — PIN, Phishing, Fake Apps', 'Power App security', 'Security-conscious customers', 'howto'],
  ['when-not-to-use-power-app', 'When Not to Use Power App — Use Ewale Instead', 'when not to use Power App', 'Low-data and feature-phone users', 'howto'],
  ['ecg-power-app-for-elderly', 'ECG Power App for Elderly Relatives — Simpler USSD', 'Power App for elderly', 'Families helping parents', 'audience'],
  ['teach-house-help-71422', 'Teach House Help *714*22# — Skip Power App Complexity', 'teach *714*22# house help', 'Homes with domestic staff', 'audience'],
  ['ecg-prepaid-for-landlords-in-accra', 'ECG Prepaid for Accra Landlords — App, USSD, Rules', 'Accra landlords ECG prepaid', 'Accra property owners', 'place'],
  ['student-hostel-power-app', 'Student Hostel ECG — Power App Login Problems', 'student hostel Power App', 'Hostel residents', 'audience'],
  ['church-generator-and-prepaid', 'Church Generator and ECG Prepaid — Split the Load', 'church generator prepaid', 'Church committees', 'audience'],
  ['pharmacy-fridge-ecg-credit', 'Pharmacy Fridge on ECG Prepaid — Never Hit Zero', 'pharmacy fridge ECG', 'Drug shops', 'audience'],
];

for (const [slug, title, keyword, audience, cluster] of moreHow.slice(0, 10)) {
  push(
    slug,
    title,
    keyword,
    audience,
    cluster,
    `${title} is a Ghana search we keep seeing. The practical answer always includes a no-app top-up.`,
    extraTips(cluster, slug, keyword),
    faqsFor(keyword, cluster),
  );
}

if (topics.length !== 200) {
  throw new Error(`expected 200 topics, got ${topics.length}`);
}

const out = `import type { PowerAppTopic } from './types';

export const powerAppTopics: PowerAppTopic[] = ${JSON.stringify(topics, null, 2)};
`;

const dest = path.join(process.cwd(), 'src/data/blogs/power-app-series/topics.ts');
fs.writeFileSync(dest, out);
console.log(`Wrote ${topics.length} topics to ${dest}`);
console.log('clusters', topics.reduce((acc, t) => {
  acc[t.cluster] = (acc[t.cluster] || 0) + 1;
  return acc;
}, {}));
