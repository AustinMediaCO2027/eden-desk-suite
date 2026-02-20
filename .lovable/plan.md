

# Affiliate and Referral System for Eden Desk

## Overview
Build a complete referral and affiliate program that allows users and external marketers to earn recurring monthly commissions by referring paying subscribers. The system includes a user referral dashboard, public affiliate application page, admin approval workflow, commission tracking, and payout management.

---

## Phase 1: Database Schema

Create the following tables with RLS policies:

**Table: `affiliates`**
- `id` (uuid, PK)
- `user_id` (uuid, references profiles.user_id, nullable for external applicants)
- `affiliate_code` (text, unique) -- e.g. "EDEN-AFF-1042"
- `full_name`, `email`, `country`, `website`, `promotion_method`, `audience_type` (text fields)
- `status` (text: pending / approved / rejected / suspended)
- `payment_method` (text: paypal / bank)
- `paypal_email` (text)
- `bank_name`, `bank_account_holder`, `bank_account_number`, `bank_branch_code`, `bank_country` (text fields)
- `total_earnings`, `pending_balance`, `paid_earnings` (numeric, default 0)
- `created_at`, `updated_at` (timestamptz)

**Table: `affiliate_clicks`**
- `id` (uuid, PK)
- `affiliate_id` (uuid, FK to affiliates)
- `visitor_id` (text) -- hashed cookie/identifier
- `ip_hash` (text)
- `created_at` (timestamptz)

**Table: `referrals`**
- `id` (uuid, PK)
- `affiliate_id` (uuid, FK to affiliates)
- `referred_user_id` (uuid)
- `subscription_plan` (text)
- `is_active` (boolean, default true)
- `created_at` (timestamptz)

**Table: `commissions`**
- `id` (uuid, PK)
- `affiliate_id` (uuid, FK to affiliates)
- `referral_id` (uuid, FK to referrals)
- `plan` (text)
- `amount` (numeric) -- R10/R20/R30 depending on plan
- `billing_cycle` (text)
- `status` (text: pending / approved / paid / revoked)
- `created_at` (timestamptz)

**Table: `payouts`**
- `id` (uuid, PK)
- `affiliate_id` (uuid, FK to affiliates)
- `amount` (numeric)
- `status` (text: pending / approved / paid)
- `paid_date` (timestamptz, nullable)
- `created_at` (timestamptz)

**Add to `profiles` table:**
- `referred_by_affiliate_id` (uuid, nullable) -- permanent link to referring affiliate

**RLS Policies:**
- Affiliates: users can view/update their own affiliate record
- Clicks, referrals, commissions, payouts: affiliates can view their own records
- Public insert on `affiliates` for application submissions (with status = 'pending')
- Admin access managed via `user_roles` table with `has_role()` function

**Admin Role Setup:**
- Create `app_role` enum and `user_roles` table per security guidelines
- Create `has_role()` security definer function
- Grant admin role to `wandilem60@gmail.com`

---

## Phase 2: Referral Link and Cookie Tracking

**Frontend Logic (in `App.tsx` or a dedicated hook `useReferralTracking.ts`):**
- On app load, check URL for `?ref=AFFILIATE_CODE`
- If found, store in `localStorage` with key `eden_ref` and timestamp
- Cookie/storage duration: 60 days (check expiry on read)
- On signup completion, read `eden_ref` from storage, look up affiliate, and update the new user's `profiles.referred_by_affiliate_id`

**Edge Function: `track-referral-click`**
- Receives affiliate code, visitor ID, IP hash
- Records click in `affiliate_clicks` table
- Returns success/failure

---

## Phase 3: Sidebar and Routing

**DashboardLayout.tsx:**
- Add new nav item: `{ to: "/dashboard/referrals", icon: Gift, label: "Referrals" }`
- Visible to all logged-in users

**App.tsx:**
- Add route: `<Route path="referrals" element={<ReferralsPage />} />`
- Add public route: `<Route path="/affiliate" element={<AffiliatePage />} />`
- Add admin route: `<Route path="admin/affiliates" element={<AdminAffiliatesPage />} />` (inside dashboard, protected by admin check)

---

## Phase 4: Referrals Dashboard Page

**New file: `src/pages/dashboard/ReferralsPage.tsx`**

Displays two states:

**State A -- User is not an affiliate yet:**
- Show referral link section with their auto-generated code (based on user ID short hash)
- "Copy Link" button for `https://eden-desk.com/?ref=USER123`
- Stats: Total Referrals, Active Subscribers, Monthly Commission, Pending Balance, Lifetime Earnings (all zero initially)
- CTA to apply as an official affiliate for higher-tier benefits

**State B -- User is an approved affiliate:**
- Full affiliate dashboard with:
  - Personal referral link + Copy button
  - Stats cards: Total Clicks, Signups, Active Paid Subscribers, Monthly Earnings, Pending Payouts, Paid Earnings
  - Commission history table
  - Payout settings section (PayPal email or Bank details form)
  - Payout request button (minimum R500)

---

## Phase 5: Public Affiliate Application Page

**New file: `src/pages/AffiliatePage.tsx`**

- Eden Desk branded page (black theme)
- Hero section: "Earn Recurring Income with Eden Desk"
- Commission structure display (R10/R20/R30 per plan per month)
- Application form: Full Name, Email, Country, Website/Social, Promotion Method, Audience Type
- "Apply Now" button -- inserts into `affiliates` table with status = 'pending'
- Success confirmation message

---

## Phase 6: Admin Affiliate Management

**New file: `src/pages/dashboard/AdminAffiliatesPage.tsx`**

- Only visible/accessible to users with admin role
- Add conditional nav item in sidebar for admins
- Tabs: Applications | Active Affiliates | Payouts
- Applications tab: List pending applications with Approve/Reject buttons
- Active Affiliates tab: List all approved affiliates with stats, Suspend option
- Payouts tab: List payout requests, Mark as Paid button
- On approve: generate affiliate code (e.g., `EDEN-AFF-${sequential_number}`)

---

## Phase 7: Commission Logic

**Edge Function: `process-commission`**
- Called after successful PayFast payment (from ITN webhook or manual trigger)
- Checks if paying user has `referred_by_affiliate_id`
- If yes, creates commission record:
  - Standard: R10
  - Silver: R20
  - Premium: R30
  - Yearly: R30 (per billing cycle)
- Updates affiliate's `pending_balance` and `total_earnings`
- Recurring: runs each billing cycle while subscriber remains active

**Protection Rules (enforced in edge function):**
- No commission during free trial (check plan !== 'trial')
- No self-referrals (affiliate user_id !== referred user_id)
- Commission only after successful payment
- One affiliate per customer (permanent `referred_by_affiliate_id`)

---

## Phase 8: Promotional Placement

**LandingFooter.tsx:**
- Add "Affiliate Program" link under Company column, linking to `/affiliate`

**LandingPricing.tsx:**
- Add subtle banner below pricing: "Earn recurring income promoting Eden Desk. Join our affiliate program."

**DashboardHome.tsx:**
- Add notification card for non-affiliate users: "Invite businesses and earn monthly income with Eden Desk Referrals." with link to `/dashboard/referrals`

---

## Phase 9: Files to Create/Edit

| Action | File |
|--------|------|
| Create | `src/pages/dashboard/ReferralsPage.tsx` |
| Create | `src/pages/AffiliatePage.tsx` |
| Create | `src/pages/dashboard/AdminAffiliatesPage.tsx` |
| Create | `src/hooks/useReferralTracking.ts` |
| Create | `src/hooks/useAffiliate.ts` |
| Create | `supabase/functions/track-referral-click/index.ts` |
| Create | `supabase/functions/process-commission/index.ts` |
| Create | Database migration (tables, RLS, roles) |
| Edit | `src/components/dashboard/DashboardLayout.tsx` (add nav item + admin item) |
| Edit | `src/App.tsx` (add routes) |
| Edit | `src/components/landing/LandingFooter.tsx` (add affiliate link) |
| Edit | `src/components/landing/LandingPricing.tsx` (add affiliate banner) |
| Edit | `src/pages/dashboard/DashboardHome.tsx` (add referral CTA card) |

---

## Technical Notes

- Admin role verification uses the `has_role()` security definer function pattern (per security guidelines) to prevent privilege escalation
- Affiliate codes are generated server-side on admin approval to prevent manipulation
- Referral cookie stored in `localStorage` with 60-day TTL check
- All commission amounts are in ZAR and calculated server-side
- PayFast ITN integration would need to call `process-commission` on successful payment notification
- Payout is manual (admin marks as paid) -- no automated payment disbursement

