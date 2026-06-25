import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/features/shared/model/user';

export async function GET(req: Request) {
  try {
    // 1. Authenticate session and check admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    // 2. Connect to the database
    await connectDB();

    // 3. Parse query parameters
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all'; // 'referrer' or 'all'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));
    const skip = (page - 1) * limit;

    // 4. Construct query filters
    const query: Record<string, unknown> = {};

    // Filter by role if not "all"
    if (role !== 'all') {
      query.role = role;
    }

    // Filter by status if not "all"
    if (status !== 'all') {
      query.status = status;
    }

    // Filter by type (e.g. referrer)
    if (type === 'referrer') {
      query.referralCode = { $exists: true, $ne: '' };
    } else if (type === 'non-referrer') {
      query.$or = [
        { referralCode: { $exists: false } },
        { referralCode: '' }
      ];
    }

    // Apply search filter if query exists
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { referralCode: searchRegex }
      ];
    }

    // 5. Fetch users and total count
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    // 6. Calculate stats
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalUsers, activeUsers, referrerUsers, newUsersToday] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ referralCode: { $exists: true, $ne: '' } }),
      User.countDocuments({ createdAt: { $gte: startOfToday } })
    ]);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      stats: {
        totalUsers,
        activeUsers,
        referrerUsers,
        newUsersToday
      }
    });

  } catch (error) {
    console.error('Admin clients list error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching clients.' },
      { status: 500 }
    );
  }
}
