import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/features/shared/model/user';
import { sendVerificationEmail } from '@/lib/mail';
import ReferralCode from '@/features/shared/model/referral-code';
import ReferralConversion from '@/features/shared/model/referral-conversion';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password, phone, referralCode } = await req.json();

    // Server-side validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name, last name, email, and password are required fields.' },
        { status: 400 }
      );
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 400 }
      );
    }

    // Try reading referral code from cookie as fallback
    let appliedCode = (referralCode || '').trim().toUpperCase();
    if (!appliedCode) {
      try {
        const cookieStore = await cookies();
        const cookieRef = cookieStore.get('referral_code')?.value;
        if (cookieRef) {
          appliedCode = cookieRef.trim().toUpperCase();
        }
      } catch (cookieErr) {
        console.warn('Could not read referral cookie during signup:', cookieErr);
      }
    }

    // Find referrer details if code is applied
    let referredByObj = undefined;
    let validCodeDoc = null;

    if (appliedCode) {
      validCodeDoc = await ReferralCode.findOne({
        code: appliedCode,
        is_active: true,
        $or: [
          { expires_at: { $exists: false } },
          { expires_at: { $gt: new Date() } }
        ]
      });
      if (validCodeDoc) {
        const referrerUser = await User.findById(validCodeDoc.referrer_id);
        if (referrerUser) {
          referredByObj = {
            referrerId: referrerUser._id,
            referrerEmail: referrerUser.email
          };
        }
      }
    }

    // Query if there's any matching enquiry to recover referral attribution
    let matchedEnquiry = null;
    try {
      const Enquiry = (await import('@/features/shared/model/enquiry')).default;
      matchedEnquiry = await Enquiry.findOne({
        $or: [
          { email: email.toLowerCase().trim() },
          { mobile: phone ? phone.trim() : '___nonexistent___' }
        ],
        status: { $ne: 'resolved' }
      });
    } catch (enquiryErr) {
      console.error('Error finding matching enquiry during signup:', enquiryErr);
    }

    // Recover referral attribution if user has no code but did enquire with a code
    if (!referredByObj && matchedEnquiry && matchedEnquiry.referredBy?.referrerId) {
      referredByObj = {
        referrerId: matchedEnquiry.referredBy.referrerId,
        referrerEmail: matchedEnquiry.referredBy.referrerEmail
      };
      appliedCode = matchedEnquiry.referralCode || '';
      if (appliedCode) {
        validCodeDoc = await ReferralCode.findOne({
          code: appliedCode,
          is_active: true,
          $or: [
            { expires_at: { $exists: false } },
            { expires_at: { $gt: new Date() } }
          ]
        });
      }
    }

    // Create inactive user
    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone ? phone.trim() : undefined,
      role: 'customer',
      status: 'inactive', // inactive until email is verified
      emailVerified: false,
      referredBy: referredByObj
    });

    // Auto-generate referral code for this user
    let userReferralCode = '';
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      userReferralCode = user.generateReferralCode();
      const existingDoc = await ReferralCode.findOne({ code: userReferralCode });
      if (!existingDoc) {
        isUnique = true;
      }
      attempts++;
    }

    if (isUnique) {
      user.referralCode = userReferralCode;
    }

    // Generate verification token
    const token = user.createEmailVerificationToken();

    // Save user
    await user.save();

    // Link and resolve matched Enquiry
    if (matchedEnquiry) {
      try {
        matchedEnquiry.status = 'resolved';
        matchedEnquiry.client_id = user._id;
        matchedEnquiry.notes = (matchedEnquiry.notes || '') + '\nConverted to registered user during signup.';
        await matchedEnquiry.save();
      } catch (enquirySaveErr) {
        console.error('Error updating matched enquiry during signup:', enquirySaveErr);
      }
    }

    // If referral code assigned, create database record
    if (user.referralCode) {
      try {
        const { getReferralSettings } = await import('@/features/shared/model/referral-setting');
        const settings = await getReferralSettings();
        await ReferralCode.create({
          code: user.referralCode,
          referrer_id: user._id,
          is_active: true,
          reward: {
            type: 'cash',
            cashAmount: settings.cash_reward_high || 1000,
            subscriptionMonths: settings.subscription_months || 3,
            referralBonus: settings.referral_bonus_amount || 500
          }
        });
      } catch (codeCreateErr) {
        console.error('Error creating user ReferralCode document during registration:', codeCreateErr);
      }
    }

    // If referred, log conversion stage "signed_up" with IP check audits
    if (validCodeDoc && referredByObj) {
      try {
        const ipHeader = req.headers.get('x-forwarded-for') || '127.0.0.1';
        const clientIp = ipHeader.split(',')[0].trim();

        let isSelfReferralByIp = false;
        let flagReason = '';

        const referrerUser = await User.findById(referredByObj.referrerId);
        if (referrerUser) {
          const isSelfEmail = referrerUser.email.toLowerCase().trim() === email.toLowerCase().trim();
          const hasMatchingIp = referrerUser.loginHistory.some(history => history.ip === clientIp);
          if (isSelfEmail) {
            isSelfReferralByIp = true;
            flagReason = 'Prospect email matches referrer email.';
          } else if (hasMatchingIp) {
            isSelfReferralByIp = true;
            flagReason = 'Prospect signup IP matches referrer login history IP.';
          }
        }

        // Find existing conversion record (e.g. stage "clicked" / "visited")
        let conversion = await ReferralConversion.findOne({
          referral_code: validCodeDoc.code,
          prospect_email: user.email
        });

        if (!conversion) {
          // If no email match, fallback to finding one by IP or just find the latest clicked stage without prospect_id
          conversion = await ReferralConversion.findOne({
            referral_code: validCodeDoc.code,
            conversion_stage: 'clicked',
            prospect_id: { $exists: false }
          }).sort({ createdAt: -1 });
        }

        if (conversion) {
          conversion.prospect_id = user._id;
          conversion.prospect_email = user.email;
          conversion.conversion_stage = 'signed_up';
          conversion.timeline.signed_up_at = new Date();
          if (isSelfReferralByIp) {
            conversion.is_flagged = true;
            conversion.flag_reason = flagReason;
          }
          await conversion.save();
        } else {
          // Fallback: Create a new conversion entry
          await ReferralConversion.create({
            referral_code: validCodeDoc.code,
            referrer_id: validCodeDoc.referrer_id,
            prospect_id: user._id,
            prospect_email: user.email,
            conversion_stage: 'signed_up',
            is_flagged: isSelfReferralByIp,
            flag_reason: flagReason || undefined,
            timeline: {
              clicked_at: new Date(),
              signed_up_at: new Date()
            }
          });
        }
      } catch (convErr) {
        console.error('Error logging referral conversion during signup:', convErr);
      }
    }

    // Send verification email
    const emailSent = await sendVerificationEmail(user.email, token);
    if (!emailSent) {
      console.warn('User registered but email failed to send to:', user.email);
    }

    return NextResponse.json(
      { 
        message: 'Registration successful! Please check your email to verify your account.',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}
