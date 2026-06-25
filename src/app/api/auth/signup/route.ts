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
      validCodeDoc = await ReferralCode.findOne({ code: appliedCode, is_active: true });
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

    // Generate verification token
    const token = user.createEmailVerificationToken();

    // Save user
    await user.save();

    // If referred, log conversion stage "signed_up"
    if (validCodeDoc && referredByObj) {
      try {
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
          await conversion.save();
        } else {
          // Fallback: Create a new conversion entry
          await ReferralConversion.create({
            referral_code: validCodeDoc.code,
            referrer_id: validCodeDoc.referrer_id,
            prospect_id: user._id,
            prospect_email: user.email,
            conversion_stage: 'signed_up',
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
