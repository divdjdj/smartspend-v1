import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Client from '@/features/shared/model/client';
import ReferralCode from '@/features/shared/model/referral-code';
import ReferralConversion from '@/features/shared/model/referral-conversion';
import User from '@/features/shared/model/user';
import { cookies } from 'next/headers';
import { createNotification } from '@/lib/notification';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, picked = [], other = '' } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone number/WhatsApp are required fields.' },
        { status: 400 }
      );
    }

    if (picked.length === 0 && !other.trim()) {
      return NextResponse.json(
        { error: 'Pick at least one subscription or tell us what you use.' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();
    const cleanEmail = email ? email.toLowerCase().trim() : '';

    await connectDB();

    // Check if this client already exists
    const queryConditions: Array<{ mobile: string } | { email: string }> = [{ mobile: cleanPhone }];
    if (cleanEmail) queryConditions.push({ email: cleanEmail });
    const existingClient = await Client.findOne({ $or: queryConditions });

    // Read referral cookie
    let appliedCode = '';
    let referredByObj = undefined;
    let validCodeDoc = null;

    try {
      const cookieStore = await cookies();
      const cookieRef = cookieStore.get('referral_code')?.value;
      if (cookieRef) {
        appliedCode = cookieRef.trim().toUpperCase();
        validCodeDoc = await ReferralCode.findOne({
          code: appliedCode,
          is_active: true,
          $or: [{ expires_at: { $exists: false } }, { expires_at: { $gt: new Date() } }],
        });
        if (validCodeDoc) {
          const referrerUser = await User.findById(validCodeDoc.referrer_id);
          if (referrerUser) {
            referredByObj = {
              referrerId: referrerUser._id,
              referrerEmail: referrerUser.email,
            };
          }
        }
      }
    } catch (cookieErr) {
      console.warn('Could not read referral cookie during wishlist registration:', cookieErr);
    }

    const subscriptionList = picked.join(', ');
    let client;
    let isNewClient = false;

    if (existingClient) {
      existingClient.subscription = subscriptionList || existingClient.subscription;
      existingClient.message = other.trim() || existingClient.message;
      if (!existingClient.referralCode && appliedCode) {
        existingClient.referralCode = appliedCode;
        existingClient.referredBy = referredByObj;
        existingClient.source = 'referral';
      }
      await existingClient.save();
      client = existingClient;
    } else {
      isNewClient = true;
      client = await Client.create({
        name: name.trim(),
        mobile: cleanPhone,
        email: cleanEmail || undefined,
        subscription: subscriptionList || 'Custom Subscriptions',
        message: other.trim() || undefined,
        status: 'pending',
        referralCode: appliedCode || undefined,
        referredBy: referredByObj,
        source: referredByObj ? 'referral' : 'wishlist',
      });
    }

    // Log referral conversion
    if (isNewClient && validCodeDoc && referredByObj) {
      try {
        const ipHeader = req.headers.get('x-forwarded-for') || '127.0.0.1';
        const clientIp = ipHeader.split(',')[0].trim();
        await ReferralConversion.create({
          referral_code: validCodeDoc.code,
          referrer_id: validCodeDoc.referrer_id,
          prospect_email: cleanEmail || undefined,
          conversion_stage: 'enquired',
          timeline: { clicked_at: new Date(), visited_at: new Date() },
          metadata: { ip_address: clientIp, user_agent: req.headers.get('user-agent') || 'unknown' },
        });
      } catch (err) {
        console.error('Error logging wishlist signup conversion:', err);
      }
    }

    // Notify admins
    try {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await createNotification({
          recipientId: admin._id,
          title: isNewClient ? 'New Client Wishlist Submitted' : 'Client Wishlist Updated',
          message: `${client.name} submitted a subscription wishlist.`,
          type: 'system',
          actionUrl: '/admin/enquiry',
        });
      }
    } catch (err) {
      console.error('Error triggering wishlist notifications:', err);
    }

    return NextResponse.json(
      {
        success: true,
        message: isNewClient
          ? 'Wishlist saved successfully! Our team will reach out to you soon.'
          : 'Wishlist updated successfully!',
        isNewClient,
        clientId: client._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Wishlist registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during wishlist submission.' },
      { status: 500 }
    );
  }
}
