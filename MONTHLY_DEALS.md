# Monthly studio coupons

The Deals section is in index.html, linked next to Location. Current offers:
- Two full-day tattoo sessions for USD 2,500 total.
- One half-day tattoo session for USD 1,000.

Both booking offers expire at the end of
September 30, 2026 in America/New_York (exclusive cutoff October 1 at 00:00 EDT).

Each .deal-coupon must have an explicit, timezone-qualified data-expires-at
and matching human-readable expiry date. assets/deals.js hides expired or
archived coupons, including on tabs left open across a month boundary.
A coupon is initially hidden until validated by that script. Missing or invalid
expiration dates cannot display an active offer. No countdown or automatic
renewal of the same deal.

The monthly ChatGPT task archives expired coupons by adding
data-archived="true" and keeping hidden, then asks the owner for the next offer.
It must not invent a price, discount, expiry extension, or new offer.
A replacement is published only after the owner supplies its details.
Use the final day of that offer's calendar month in America/New_York as the
expiry unless the owner specifies otherwise. Account for daylight saving time.

Retain the Deals navigation and empty state when there is no active offer.
Do not alter Instagram, reviews, biographies, or booking behavior. Use the
current GitHub file SHA/ref when updating final-1; never force-push.

## Deposit claims and quantities

Each offer is limited to five studio-confirmed claims. Deposit: USD 500 via
Zelle, phone 754-306-8422, recipient Flawless Ink LLC. Customers must confirm
availability before paying. Only studio verification of the deposit confirms
a claim; the site cannot read Zelle transactions or reserve global inventory.

The studio must reconcile deposits and prevent accepting more than five claims
per offer. After verified claims, update data-confirmed-claims on that coupon
in index.html (never above data-claim-limit=5). The site disables the claim
button at five. Do not increment from clicks, customer assertions, SMS drafts
or browser storage. No payments are processed or messages sent by the site.
Never publish customer names, receipts, transaction references or bank details.

For new owner-approved coupons, retain the five-claim limit and explicit expiry.
Reset the count only for genuinely new approved offers, not expired inventory.
