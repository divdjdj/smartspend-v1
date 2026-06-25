import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/features/shared/model/user';
import { z } from 'zod';

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50).optional(),
  lastName: z.string().trim().max(50).optional(),
  phone: z.string().trim().max(20).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').optional(),
}).refine(data => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: 'Current password is required to set a new password',
  path: ['currentPassword']
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        fullName: user.fullName,
        phone: user.phone || '',
        role: user.role,
        status: user.status,
        accountBalance: user.accountBalance || 0,
        createdAt: user.get('createdAt'),
      }
    });

  } catch (error) {
    console.error('Fetch profile error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve profile data.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const parseResult = updateProfileSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map(err => err.message).join(' ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { firstName, lastName, phone, currentPassword, newPassword } = parseResult.data;

    // Fetch user with password field explicitly selected
    const user = await User.findById(session.user.id).select('+password');
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Handle password change if requested
    if (newPassword && currentPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return NextResponse.json({ error: 'Incorrect current password.' }, { status: 400 });
      }
      user.password = newPassword;
    }

    // Update basic information
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        fullName: user.fullName,
        phone: user.phone || '',
        role: user.role,
        status: user.status,
        accountBalance: user.accountBalance || 0,
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating your profile.' },
      { status: 500 }
    );
  }
}
