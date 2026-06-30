import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Client from '@/features/shared/model/client';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['pending', 'contacted', 'resolved', 'ignored']).optional(),
  notes: z.string().trim().max(1000).optional(),
});

// PATCH to update status or notes of a specific enquiry
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate session and check admin role
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'referral_partner')) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Enquiry ID is required.' }, { status: 400 });
    }

    const body = await req.json();
    const parseResult = updateSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((err: { message: string }) => err.message).join(' ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // 2. Connect to database
    await connectDB();

    // 3. Find and update the client
    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { $set: parseResult.data },
      { new: true, runValidators: true }
    );

    if (!updatedClient) {
      return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Client updated successfully.',
      enquiry: updatedClient
    });

  } catch (error) {
    console.error('Admin enquiry update error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating the enquiry.' },
      { status: 500 }
    );
  }
}

// DELETE to remove an enquiry
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
      return NextResponse.json({ error: 'Enquiry ID is required.' }, { status: 400 });
    }

    // 2. Connect to database
    await connectDB();

    // 3. Delete the client
    const deletedClient = await Client.findByIdAndDelete(id);

    if (!deletedClient) {
      return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully.'
    });

  } catch (error) {
    console.error('Admin enquiry deletion error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while deleting the enquiry.' },
      { status: 500 }
    );
  }
}
