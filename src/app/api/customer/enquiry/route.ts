import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Enquiry from '@/features/shared/model/enquiry';
import User from '@/features/shared/model/user';
import { createNotification } from '@/lib/notification';
import mongoose from 'mongoose';

// GET all enquiries submitted by the logged-in client
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    await connectDB();

    const enquiries = await Enquiry.find({ 
      client_id: new mongoose.Types.ObjectId(session.user.id) 
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      enquiries
    });

  } catch (error) {
    console.error('Customer fetch enquiries error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve enquiries list.' },
      { status: 500 }
    );
  }
}

// POST to create a new enquiry
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, mobile, subscription, message } = body;

    if (!name || !mobile || !subscription || !message) {
      return NextResponse.json(
        { error: 'Name, mobile number, subscription, and message details are required.' },
        { status: 400 }
      );
    }

    await connectDB();

    const newEnquiry = new Enquiry({
      name: name.trim(),
      email: email ? email.toLowerCase().trim() : undefined,
      mobile: mobile.trim(),
      subscription: subscription.trim(),
      message: message.trim(),
      status: 'pending',
      client_id: new mongoose.Types.ObjectId(session.user.id)
    });

    await newEnquiry.save();

    // Trigger in-app notifications to admin users
    try {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await createNotification({
          recipientId: admin._id,
          title: 'New Enquiry Submitted 💬',
          message: `${name} has submitted an enquiry regarding ${subscription}.`,
          type: 'enquiry',
          actionUrl: '/admin/enquiry'
        });
      }
    } catch (notifErr) {
      console.error('Error triggering enquiry admin notifications:', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Enquiry submitted successfully! We will get back to you shortly.',
      enquiry: newEnquiry
    }, { status: 201 });

  } catch (error) {
    console.error('Customer submit enquiry error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while submitting your enquiry.' },
      { status: 500 }
    );
  }
}
