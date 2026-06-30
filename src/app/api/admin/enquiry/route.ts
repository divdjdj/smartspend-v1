import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Client from '@/features/shared/model/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'referral_partner')) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    // 2. Connect to the database
    await connectDB();

    // 3. Parse query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const dateRange = searchParams.get('dateRange') || 'all';
    const subscription = searchParams.get('subscription') || 'all';
    const sortOrder = searchParams.get('sort') || 'desc';
    
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));
    const skip = (page - 1) * limit;

    // 4. Construct query filters
    const query: Record<string, unknown> = {};

    // Referral partners can only see clients they referred
    if (session.user?.role === 'referral_partner' && session.user?.id) {
      query['referredBy.referrerId'] = session.user.id;
    }

    // Filter by status if not "all"
    if (status !== 'all') {
      query.status = status;
    }

    // Filter by subscription if not "all"
    if (subscription !== 'all') {
      query.subscription = new RegExp(`^${subscription}$`, 'i');
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      const startDate = new Date();
      if (dateRange === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (dateRange === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      }
      query.createdAt = { $gte: startDate };
    }

    // Apply search filter if query exists
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { mobile: searchRegex },
        { email: searchRegex },
        { subscription: searchRegex }
      ];
    }

    // 5. Fetch clients and total count
    const sortConfig: Record<string, 'asc' | 'desc'> = { createdAt: sortOrder === 'asc' ? 'asc' : 'desc' };
    
    const clients = await Client.find(query)
      .sort(sortConfig)
      .skip(skip)
      .limit(limit);

    const total = await Client.countDocuments(query);

    return NextResponse.json({
      success: true,
      enquiries: clients,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Admin enquiry list error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching enquiries.' },
      { status: 500 }
    );
  }
}
