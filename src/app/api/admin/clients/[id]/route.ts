import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/features/shared/model/user';
import ReferralCode from '@/features/shared/model/referral-code';
import { z } from 'zod';

const updateSchema = z.object({
  role: z.enum(['admin', 'referral_partner']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate session and check admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Client ID is required.' }, { status: 400 });
    }

    // 2. Connect to database
    await connectDB();

    // 3. Find the user
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
    }

    // 4. Fetch clients referred by this partner
    const Client = (await import('@/features/shared/model/client')).default;
    const referredClients = await Client.find({ 'referredBy.referrerId': id }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      user,
      enquiries: referredClients
    });

  } catch (error) {
    console.error('Admin client fetch details error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching client details.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate session and check admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Client ID is required.' }, { status: 400 });
    }

    // Prevent admin from editing their own profile role or status via this admin route
    if (session.user.id === id) {
      return NextResponse.json({ error: 'You cannot change your own role or status.' }, { status: 400 });
    }

    const body = await req.json();
    const parseResult = updateSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((err) => err.message).join(' ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // 2. Connect to database
    await connectDB();

    // 3. Update the client
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: parseResult.data },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Client profile updated successfully.',
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
      }
    });

  } catch (error) {
    console.error('Admin client update error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating the client.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate session and check admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Client ID is required.' }, { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (session.user.id === id) {
      return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
    }

    // 2. Connect to database
    await connectDB();

    // 3. Delete the client
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
    }

    // 4. Clean up associated ReferralCode records
    await ReferralCode.deleteMany({ referrer_id: id });

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully.'
    });

  } catch (error) {
    console.error('Admin client deletion error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while deleting the client.' },
      { status: 500 }
    );
  }
}
