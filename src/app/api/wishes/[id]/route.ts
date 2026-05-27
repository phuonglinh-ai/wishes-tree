import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { WishStatus } from '@/types/wish';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const VALID_STATUSES: WishStatus[] = ['pending', 'approved', 'hidden'];

function checkAdminAuth(request: NextRequest): boolean {
  const password = request.headers.get('x-admin-password');
  return !!password && password === ADMIN_PASSWORD;
}

// ─── PATCH /api/wishes/[id] ─────────────────────────
// Update wish status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const status = body.status as WishStatus;
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Trạng thái không hợp lệ.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('wishes')
    .update({ status })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// ─── DELETE /api/wishes/[id] ─────────────────────────
// Delete a wish permanently
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { error } = await supabaseAdmin
    .from('wishes')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
