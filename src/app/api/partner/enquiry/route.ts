import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Client from '@/features/shared/model/client';
import User from '@/features/shared/model/user';
import { createNotification } from '@/lib/notification';
import mongoose from 'mongoose';

// GET: Referral partner views their referred clients
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    await connectDB();

    // Partners only see clients that were referred by them
    const query: Record<string, unknown> = {};
    if (session.user.role === 'referral_partner') {
      query['referredBy.referrerId'] = new mongoose.Types.ObjectId(session.user.id);
    }
    // Admins can see all clients (no filter)

    const clients = await Client.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      enquiries: clients
    });
  } catch (error) {
    console.error('Partner fetch clients error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve clients list.' },
      { status: 500 }
    );
  }
}

// POST: Partner manually submits a client enquiry on behalf of a client
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, mobile, email, subscription, message } = body;

    if (!name || !mobile) {
      return NextResponse.json(
        { error: 'Name and mobile number are required.' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get partner details to attribute the referral
    const partner = await User.findById(session.user.id);

    const newClient = await Client.create({
      name: name.trim(),
      email: email ? email.toLowerCase().trim() : undefined,
      mobile: mobile.trim(),
      subscription: subscription?.trim(),
      message: message?.trim(),
      status: 'pending',
      source: 'referral',
      referredBy: partner
        ? { referrerId: partner._id, referrerEmail: partner.email }
        : undefined,
    });

    // Notify admins
    try {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await createNotification({
          recipientId: admin._id,
          title: 'New Client Enquiry Submitted 💬',
          message: `${name} has submitted an enquiry regarding ${subscription || 'services'}.`,
          type: 'enquiry',
          actionUrl: '/admin/enquiry',
        });
      }
    } catch (notifErr) {
      console.error('Error triggering client enquiry admin notifications:', notifErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Client enquiry submitted successfully!',
        client: newClient,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Partner submit client enquiry error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while submitting the enquiry.' },
      { status: 500 }
    );
  }
}
