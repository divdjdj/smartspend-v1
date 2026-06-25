import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/features/shared/model/user';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user || !user.referralCode) {
      return NextResponse.json({ error: 'Referral code not found. Generate one first.' }, { status: 400 });
    }

    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const referralLink = `${appUrl}/ref/${user.referralCode}`;

    const textMessage = `Hey! I've been using SpendSmart to get premium subscriptions (like Cursor, LinkedIn, Canva) at 50% off. Sign up using my link to get an extra ₹500 discount on your first purchase! \n\n👉 Join here: ${referralLink}`;
    
    const encodedText = encodeURIComponent(textMessage);

    const shareLinks = {
      referralLink,
      whatsapp: `https://wa.me/?text=${encodedText}`,
      email: `mailto:?subject=${encodeURIComponent('Save ₹500 on SpendSmart Premium Subscriptions')}&body=${encodedText}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`
    };

    return NextResponse.json({
      success: true,
      shareLinks
    });

  } catch (error) {
    console.error('Customer share-links error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while generating share links.' },
      { status: 500 }
    );
  }
}
