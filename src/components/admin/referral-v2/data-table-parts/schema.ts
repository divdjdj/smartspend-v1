import { z } from "zod"

export const ClientSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  source: z.string(),
  referrerId: z.string().nullable().optional(),
  purchase: z.number(),
  sale: z.number(),
  commission: z.number(),
  status: z.string(),
})

export type ClientItem = z.infer<typeof ClientSchema>

export const CodeSchema = z.object({
  _id: z.string(),
  code: z.string(),
  is_active: z.boolean(),
  expires_at: z.string().optional(),
  created_at: z.string().optional(),
  reward: z.object({
    type: z.enum(['cash', 'subscription']),
    cashAmount: z.number(),
    subscriptionMonths: z.number(),
    referralBonus: z.number(),
  }),
  referrer: z.object({
    _id: z.string(),
    name: z.string(),
    email: z.string(),
  }).nullable(),
  stats: z.object({
    clicks: z.number(),
    signups: z.number(),
    purchases: z.number(),
    revenue: z.number(),
  }),
})

export type CodeItem = z.infer<typeof CodeSchema>

export const ConversionSchema = z.object({
  _id: z.string(),
  referralCode: z.string(),
  conversionStage: z.string(),
  timeline: z.object({
    clicked_at: z.string().optional(),
    visited_at: z.string().optional(),
    signed_up_at: z.string().optional(),
    purchased_at: z.string().optional(),
  }),
  purchaseDetails: z.object({
    grossAmount: z.number(),
    netAmount: z.number(),
  }).optional(),
  referrerReward: z.object({
    type: z.enum(['cash', 'subscription']),
    amount: z.number(),
    status: z.string(),
  }).optional(),
  referrer: z.object({ _id: z.string().optional(), name: z.string(), email: z.string() }).nullable(),
  prospect: z.object({ name: z.string(), email: z.string() }).nullable(),
  isFlagged: z.boolean().optional(),
  flagReason: z.string().optional(),
  createdAt: z.string().optional(),
})

export type ConversionItem = z.infer<typeof ConversionSchema>

export const ProgramSettingsSchema = z.object({
  cash_reward_high: z.number(),
  cash_reward_low: z.number(),
  subscription_months: z.number(),
  referral_bonus_amount: z.number(),
  min_purchase_for_reward: z.number(),
  auto_credit_cash: z.boolean(),
  auto_apply_subscription: z.boolean(),
  currency: z.string(),
  commission_percentage: z.number(),
  default_reward_type: z.enum(['fixed_cash', 'percentage']),
})

export type ProgramSettings = z.infer<typeof ProgramSettingsSchema>

export const PendingApprovalSchema = z.object({
  customerId: z.string(),
  customerName: z.string(),
  customerEmail: z.string(),
  redemptionId: z.string(),
  type: z.enum(['cash_claim', 'subscription_activation']),
  amount: z.number(),
  months: z.number(),
  date: z.string(),
})

export type PendingApprovalItem = z.infer<typeof PendingApprovalSchema>

