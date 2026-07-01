import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Invoice from '@/features/shared/model/invoice';

// GET: Client views all their own invoices
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id || session.user.role !== 'client') {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    await connectDB();

    // Fetch invoices where client_id matches the logged-in client
    const invoices = await Invoice.find({ client_id: session.user.id })
      .sort({ purchase_date: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      invoices,
    });

  } catch (error) {
    console.error('Client invoices fetch error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching invoices.' },
      { status: 500 }
    );
  }
}
