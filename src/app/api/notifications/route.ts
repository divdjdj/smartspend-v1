import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Notification from '@/features/shared/model/notification';
import mongoose from 'mongoose';

// GET list of notifications for the logged-in user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '20', 10));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {
      recipientId: new mongoose.Types.ObjectId(session.user.id)
    };

    if (unreadOnly) {
      query.status = 'unread';
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query),
      Notification.countDocuments({
        recipientId: new mongoose.Types.ObjectId(session.user.id),
        status: 'unread'
      })
    ]);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve notifications.' },
      { status: 500 }
    );
  }
}

// PATCH to update notifications status (mark as read / mark all as read)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { id, markAllRead } = body;

    const userId = new mongoose.Types.ObjectId(session.user.id);

    if (markAllRead) {
      await Notification.updateMany(
        { recipientId: userId, status: 'unread' },
        { $set: { status: 'read' } }
      );
      return NextResponse.json({ success: true, message: 'All notifications marked as read.' });
    }

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required.' }, { status: 400 });
    }

    const updatedNotification = await Notification.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), recipientId: userId },
      { $set: { status: 'read' } },
      { new: true }
    );

    if (!updatedNotification) {
      return NextResponse.json({ error: 'Notification not found or access denied.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Notification marked as read.', notification: updatedNotification });

  } catch (error) {
    console.error('Update notification status error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification.' },
      { status: 500 }
    );
  }
}

// DELETE to clear notifications (delete single or clear all read)
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const clearAllRead = searchParams.get('clearAllRead') === 'true';

    const userId = new mongoose.Types.ObjectId(session.user.id);

    if (clearAllRead) {
      const result = await Notification.deleteMany({
        recipientId: userId,
        status: 'read'
      });
      return NextResponse.json({
        success: true,
        message: `${result.deletedCount} read notifications cleared.`
      });
    }

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required.' }, { status: 400 });
    }

    const deletedNotification = await Notification.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      recipientId: userId
    });

    if (!deletedNotification) {
      return NextResponse.json({ error: 'Notification not found or access denied.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Notification deleted.' });

  } catch (error) {
    console.error('Clear notification error:', error);
    return NextResponse.json(
      { error: 'Failed to clear notification.' },
      { status: 500 }
    );
  }
}
