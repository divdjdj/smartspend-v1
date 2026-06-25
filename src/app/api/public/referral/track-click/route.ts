import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ReferralCode from '@/features/shared/model/referral-code';
import ReferralConversion from '@/features/shared/model/referral-conversion';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Referral code is required.' }, { status: 400 });
    }

    await connectDB();

    const referralCodeDoc = await ReferralCode.findOne({
      code: code.trim().toUpperCase(),
      is_active: true,
      $or: [
        { expires_at: { $exists: false } },
        { expires_at: { $gt: new Date() } }
      ]
    });

    if (!referralCodeDoc) {
      return NextResponse.json({ error: 'Invalid or inactive referral code.' }, { status: 404 });
    }

    // Capture metadata
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    // Parse simple device/browser info from user agent
    let deviceType = 'desktop';
    if (/mobile/i.test(userAgent)) deviceType = 'mobile';
    else if (/tablet|ipad/i.test(userAgent)) deviceType = 'tablet';

    let browser = 'Other';
    if (/chrome|crios/i.test(userAgent)) browser = 'Chrome';
    else if (/firefox|fxios/i.test(userAgent)) browser = 'Firefox';
    else if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) browser = 'Safari';
    else if (/edge|edg/i.test(userAgent)) browser = 'Edge';

    let os = 'Other';
    if (/windows/i.test(userAgent)) os = 'Windows';
    else if (/macintosh|mac os x/i.test(userAgent)) os = 'macOS';
    else if (/android/i.test(userAgent)) os = 'Android';
    else if (/iphone|ipad/i.test(userAgent)) os = 'iOS';
    else if (/linux/i.test(userAgent)) os = 'Linux';

    // Create clicked stage conversion record
    const conversion = await ReferralConversion.create({
      referral_code: referralCodeDoc.code,
      referrer_id: referralCodeDoc.referrer_id,
      conversion_stage: 'clicked',
      timeline: {
        clicked_at: new Date()
      },
      metadata: {
        user_agent: userAgent,
        ip_address: Array.isArray(ip) ? ip[0] : ip,
        device_type: deviceType,
        browser,
        os
      }
    });

    const response = NextResponse.json({
      success: true,
      message: 'Referral click tracked successfully.',
      code: referralCodeDoc.code
    });

    // Set cookie for 30 days
    response.cookies.set('referral_code', referralCodeDoc.code, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      sameSite: 'lax',
      httpOnly: false // Accessible by client-side signup page scripts
    });

    return response;

  } catch (error) {
    console.error('Track click API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while tracking referral click.' },
      { status: 500 }
    );
  }
}
