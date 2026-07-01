import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Client from '@/features/shared/model/client';
import User from '@/features/shared/model/user';
import { createNotification } from '@/lib/notification';

// GET: Client views their own details / active enquiry
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id || session.user.role !== 'client') {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    await connectDB();

    const client = await Client.findOne({ _id: session.user.id, isDeleted: { $ne: true } });
    if (!client) {
      return NextResponse.json({ error: 'Client account not found.' }, { status: 404 });
    }

    // Wrap the single client document in an array to match timeline logs structures
    return NextResponse.json({
      success: true,
      enquiries: [client]
    });
  } catch (error) {
    console.error('Client fetch enquiries error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve enquiries.' },
      { status: 500 }
    );
  }
}

// POST: Client submits or updates their enquiry details
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id || session.user.role !== 'client') {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, mobile, subscription, message } = body;

    await connectDB();

    const client = await Client.findOne({ _id: session.user.id, isDeleted: { $ne: true } });
    if (!client) {
      return NextResponse.json({ error: 'Client account not found.' }, { status: 404 });
    }

    // Update client enquiry fields
    if (name) client.name = name.trim();
    if (email) client.email = email.toLowerCase().trim();
    if (mobile) client.mobile = mobile.trim();
    
    client.subscription = subscription?.trim() || client.subscription;
    client.message = message?.trim() || client.message;
    client.status = 'pending'; // reset status to pending for admin review

    await client.save();

    // Trigger Admin Notification
    try {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await createNotification({
          recipientId: admin._id,
          title: 'Client Enquiry Updated 💬',
          message: `${client.name} has updated their subscription enquiry for ${client.subscription || 'services'}.`,
          type: 'enquiry',
          actionUrl: `/admin/enquiry`,
        });
      }
    } catch (notifErr) {
      console.error('Error triggering client enquiry update notifications:', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Enquiry updated successfully!',
      client
    });

  } catch (error) {
    console.error('Client submit enquiry error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating the enquiry.' },
      { status: 500 }
    );
  }
}
