import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Client from '@/features/shared/model/client';
import Invoice from '@/features/shared/model/invoice';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required.' }, { status: 400 });
    }

    await connectDB();

    // Verify that this client is indeed referred by the logged-in partner
    const client = await Client.findOne({
      _id: clientId,
      isDeleted: { $ne: true },
      'referredBy.referrerId': session.user.id,
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found or access denied.' }, { status: 404 });
    }

    // Fetch invoices for this client
    const invoices = await Invoice.find({ client_id: clientId })
      .sort({ purchase_date: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      invoices,
    });

  } catch (error) {
    console.error('Partner invoices fetch error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching invoices.' },
      { status: 500 }
    );
  }
}
