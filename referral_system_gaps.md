# SpentSmart: Referral System Gaps & Production Requirements

This document outlines the missing components, security vulnerabilities, code bugs, and production-readiness requirements identified within the current SpentSmart referral system architecture.

---

## 1. Functional Bugs & Schema Enforcements

### ❌ Expiration Date Ignored on Code Checks
* **File Reference**: [track-click/route.ts](file:///c:/Users/ramka/Documents/codebase/webapp/divyansh/spentsmart/src/app/api/public/referral/track-click/route.ts#L16-L19) and [validate/route.ts](file:///c:/Users/ramka/Documents/codebase/webapp/divyansh/spentsmart/src/app/api/public/referral/validate/route.ts)
* **The Issue**: The `expires_at` date defined in the [ReferralCode Schema](file:///c:/Users/ramka/Documents/codebase/webapp/divyansh/spentsmart/src/features/shared/model/referral-code.ts) is not validated during tracking or verification. An expired code will still successfully track clicks and register signups if `is_active` remains `true`.
* **Fix Required**:
  ```diff
  const referralCodeDoc = await ReferralCode.findOne({
    code: code.trim().toUpperCase(),
-   is_active: true
+   is_active: true,
+   $or: [
+     { expires_at: { $exists: false } },
+     { expires_at: { $gt: new Date() } }
+   ]
  });
  ```

---

## 2. Infrastructure & Payout Integrations

### ❌ Mocked Payouts (Virtual Balance Only)
* **File Reference**: [claim-cash/route.ts](file:///c:/Users/ramka/Documents/codebase/webapp/divyansh/spentsmart/src/app/api/customer/referral/rewards/claim-cash/route.ts#L45-L63)
* **The Issue**: Cash claims are credited directly to a virtual `user.accountBalance` field inside MongoDB. There are no payment rails or bank transfer systems connected.
* **Fix Required**: Integrate payout APIs such as **Stripe Connect Payouts**, **RazorpayX Payouts**, or **PayPal Payouts** to allow users to withdraw their virtual balance to real bank accounts.

### ❌ Mocked Email/SMS Notifications
* **File Reference**: [purchase/route.ts](file:///c:/Users/ramka/Documents/codebase/webapp/divyansh/spentsmart/src/app/api/customer/subscription/purchase/route.ts#L193-L200) and [reject/route.ts](file:///c:/Users/ramka/Documents/codebase/webapp/divyansh/spentsmart/src/app/api/admin/referrals/rewards/reject/route.ts#L41)
* **The Issue**: All email confirmations (signup alerts, reward claims, and admin rejection notices) are simulated using simple `console.log()` statements.
* **Fix Required**: Set up SMTP configurations or transaction mail delivery integrations (like **Resend**, **Amazon SES**, **SendGrid**, or **Mailgun**) to deliver notifications directly to user inboxes.

---

## 3. Security & Fraud Vulnerabilities

### ❌ Direct Checkout Parameters (Simulated Purchases)
* **File Reference**: [purchase/route.ts](file:///c:/Users/ramka/Documents/codebase/webapp/divyansh/spentsmart/src/app/api/customer/subscription/purchase/route.ts#L18-L23)
* **The Issue**: The price (`grossAmount`) and item (`packageName`) are extracted directly from client JSON payloads inside a public customer endpoint. This is highly vulnerable to tempering, allowing users to fake purchase values to exploit rewards.
* **Fix Required**: Remove client-controlled checkout simulation APIs. Instead, implement a checkout session checkout flow (via Stripe Checkout) and handle reward calculations inside verified webhook endpoints (e.g. `POST /api/webhooks/stripe`).

### ❌ Lack of Self-Referral Prevention
* **File Reference**: [signup/route.ts](file:///c:/Users/ramka/Documents/codebase/webapp/divyansh/spentsmart/src/app/api/auth/signup/route.ts#L64-L75)
* **The Issue**: The system validates that the referral code is active and exists, but it does not check if the prospect is attempting to refer themselves (e.g., using the same IP address, matching device browser fingerprints, or matching phone numbers as the referrer).
* **Fix Required**: Check incoming IP addresses, browser cookies, and device fingerprints to reject registration associations where a user tries to sign up under their own referral code.

### ❌ Lack of API Rate-Limiting
* **File Reference**: Public routes under `src/app/api/public/`
* **The Issue**: Publicly accessible routes such as `track-click/route.ts` are open to automated scripts or malicious bots, which could spam requests to flood MongoDB, register thousands of fake click events, or run dictionary attacks to scan for valid referral codes.
* **Fix Required**: Implement rate-limiting middleware (such as `express-rate-limit` or Redis-backed tokens) on all public referral APIs.

---

## 4. Advanced/Multi-Market Scaling Gaps

### ❌ Hardcoded Multi-Currency Assumptions
* **File Reference**: [purchase/route.ts](file:///c:/Users/ramka/Documents/codebase/webapp/divyansh/spentsmart/src/app/api/customer/subscription/purchase/route.ts#L80-L90) and [referral-setting.ts](file:///c:/Users/ramka/Documents/codebase/webapp/divyansh/spentsmart/src/features/shared/model/referral-setting.ts)
* **The Issue**: The system assumptions are customized entirely around Indian Rupees (₹ - INR). Price bounds (₹4,000 threshold, ₹1,000 / ₹500 rewards) are hardcoded in system thresholds.
* **Fix Required**: Implement dynamic currency conversion logic or store setting profiles per local market currency to allow foreign clients to get rewarded in local currencies ($, €, etc.).

### ❌ Milestone & Tiered Rewards
* **The Issue**: The reward payout is a flat threshold check per checkout. Growth-hacking programs usually reward users with milestone targets (e.g. "Invite 5 friends who purchase, get 1 year free").
* **Fix Required**: Add a milestone/referral-count index schema to reward customers extra multipliers once they cross a threshold of successful referrals (e.g. 5, 10, or 25 successful purchases).
