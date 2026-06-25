import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/features/shared/model/user';
import ReferralConversion from '@/features/shared/model/referral-conversion';
import Enquiry from '@/features/shared/model/enquiry';

export async function GET() {
  try {
    // 1. Authenticate session and check admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    // 2. Connect to database
    await connectDB();

    // 3. Aggregate Revenue
    const revenueResult = await User.aggregate([
      { $unwind: '$subscriptions' },
      { $group: { _id: null, total: { $sum: '$subscriptions.totalPrice' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // 4. Count Active Subscriptions
    const activeSubsCount = await User.countDocuments({
      'subscriptions': {
        $elemMatch: {
          status: 'active',
          endDate: { $gt: new Date() }
        }
      }
    });

    // 5. User Counts
    const [totalClients, activeClients] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'customer', status: 'active' })
    ]);

    // 6. Conversion rate & funnel
    const [totalClicks, totalPurchases] = await Promise.all([
      ReferralConversion.countDocuments({}),
      ReferralConversion.countDocuments({ conversion_stage: 'purchased' })
    ]);
    const conversionRate = totalClicks > 0 ? parseFloat(((totalPurchases / totalClicks) * 100).toFixed(1)) : 0;

    // Funnel stages details
    const funnelStages = await ReferralConversion.aggregate([
      { $group: { _id: '$conversion_stage', count: { $sum: 1 } } }
    ]);

    const stagesMap: Record<string, number> = { clicked: 0, visited: 0, signed_up: 0, purchased: 0 };
    funnelStages.forEach(stage => {
      if (stage._id in stagesMap) {
        stagesMap[stage._id] = stage.count;
      }
    });

    const funnelChartData = [
      { name: 'Clicks', value: stagesMap.clicked + stagesMap.visited + stagesMap.signed_up + stagesMap.purchased },
      { name: 'Visits', value: stagesMap.visited + stagesMap.signed_up + stagesMap.purchased },
      { name: 'Signups', value: stagesMap.signed_up + stagesMap.purchased },
      { name: 'Purchases', value: stagesMap.purchased }
    ];

    // 7. Monthly Revenue Chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlySales = await User.aggregate([
      { $unwind: '$subscriptions' },
      { $match: { 'subscriptions.startDate': { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$subscriptions.startDate' },
            month: { $month: '$subscriptions.startDate' }
          },
          revenue: { $sum: '$subscriptions.totalPrice' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Map month indices to labels
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueChartData = [];
    
    // Fill in last 6 months with 0s as fallback
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1; // 1-indexed
      const y = d.getFullYear();
      
      const matchedMonth = monthlySales.find(s => s._id.month === m && s._id.year === y);
      revenueChartData.push({
        name: monthNames[m - 1],
        Revenue: matchedMonth ? matchedMonth.revenue : 0
      });
    }

    // 8. Recent Activities
    const recentSignups = await User.find({ role: 'customer' })
      .select('firstName lastName email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentEnquiries = await Enquiry.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    // Retrieve and flatten recent subscription purchases from users
    const usersWithSubs = await User.find({ 'subscriptions.0': { $exists: true } })
      .select('firstName lastName email subscriptions')
      .limit(50); // pull recent active users

    const allSubs: {
      userName: string;
      email: string;
      packageName: string;
      price: number;
      startDate: Date | string;
      status: string;
    }[] = [];
    usersWithSubs.forEach(u => {
      u.subscriptions.forEach(s => {
        allSubs.push({
          userName: u.fullName,
          email: u.email,
          packageName: s.packageName,
          price: s.totalPrice,
          startDate: s.startDate,
          status: s.status
        });
      });
    });

    // Sort by start date desc and limit to 5
    const recentPurchases = allSubs
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        activeSubsCount,
        totalClients,
        activeClients,
        conversionRate,
        totalClicks
      },
      charts: {
        revenueChartData,
        funnelChartData
      },
      feeds: {
        recentSignups,
        recentPurchases,
        recentEnquiries
      }
    });

  } catch (error) {
    console.error('Admin dashboard GET route error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching dashboard statistics.' },
      { status: 500 }
    );
  }
}
