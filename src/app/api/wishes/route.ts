import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { containsProfanity, normalizeVietnamese } from '@/lib/profanity';
import { LeafColor } from '@/types/wish';

const VALID_COLORS: LeafColor[] = ['green', 'teal', 'lime', 'yellow', 'orange', 'pink'];
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

export const dynamic = 'force-dynamic';

// ─── GET /api/wishes ─────────────────────────────────────────
// Public: returns approved wishes
// Admin:  returns all wishes (requires x-admin-password header)
export async function GET(request: NextRequest) {
  const isAdmin = request.nextUrl.searchParams.get('admin') === '1';

  if (isAdmin) {
    const password = request.headers.get('x-admin-password');
    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const page = parseInt(request.nextUrl.searchParams.get('page') ?? '1');
    const limit = 20;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabaseAdmin
      .from('wishes')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ wishes: data, total: count, page, limit });
  }

  // Public endpoint: only approved wishes
  const { data, error } = await supabaseAdmin
    .from('wishes')
    .select('id, sender_name, student_name, message, leaf_color, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ wishes: data ?? [] });
}

// ─── POST /api/wishes ─────────────────────────────────────────
// Submit a new wish
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Honeypot check — bots fill hidden fields, humans don't
  if (body._honey) {
    // Silently appear to succeed to confuse bots
    return NextResponse.json({ success: true });
  }

  const sender_name = typeof body.sender_name === 'string' ? body.sender_name.trim() : '';
  const student_name = typeof body.student_name === 'string' ? body.student_name.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const leaf_color = typeof body.leaf_color === 'string' ? body.leaf_color : 'green';

  // Validation
  if (!sender_name || sender_name.length > 80) {
    return NextResponse.json({ error: 'Tên người gửi không hợp lệ (tối đa 80 ký tự).' }, { status: 400 });
  }
  if (student_name && student_name.length > 80) {
    return NextResponse.json({ error: 'Tên học sinh không hợp lệ (tối đa 80 ký tự).' }, { status: 400 });
  }
  if (!message || message.length < 10 || message.length > 300) {
    return NextResponse.json({ error: 'Lời chúc phải từ 10 đến 300 ký tự.' }, { status: 400 });
  }
  if (!VALID_COLORS.includes(leaf_color as LeafColor)) {
    return NextResponse.json({ error: 'Màu lá không hợp lệ.' }, { status: 400 });
  }

  // Profanity filter (normalize then check)
  const textToCheck = `${sender_name} ${student_name} ${message}`;
  if (containsProfanity(textToCheck)) {
    return NextResponse.json({ error: 'Lời chúc chứa nội dung không phù hợp.' }, { status: 400 });
  }

  // Strip HTML from all text fields
  const clean = (s: string) => s.replace(/<[^>]*>/g, '').slice(0, 300);

  const { data, error } = await supabaseAdmin.from('wishes').insert({
    sender_name: clean(sender_name),
    student_name: student_name ? clean(student_name) : null,
    message: clean(message),
    leaf_color,
    status: 'pending',
  }).select().single();

  if (error) return NextResponse.json({ error: 'Không thể gửi lời chúc. Vui lòng thử lại.' }, { status: 500 });
  return NextResponse.json({ success: true, id: data.id }, { status: 201 });
}
