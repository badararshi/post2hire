import { NextRequest, NextResponse } from 'next/server';
import { requireUser, AuthError } from '@/lib/supabase/require-user';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

type EventType = 'download' | 'share_click';
const EVENT_TYPES: EventType[] = ['download', 'share_click'];

/**
 * Fire-and-forget event logging for the "frequent downloaders who never
 * share" admin view. Never blocks or fails the user-facing action that
 * triggered it — callers should not await meaningfully on this.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const eventType: EventType | undefined = EVENT_TYPES.includes(body.eventType)
      ? body.eventType
      : undefined;
    const platform: string | undefined = body.platform ? body.platform.toString().slice(0, 40) : undefined;

    if (!eventType) {
      return NextResponse.json({ error: 'Invalid event type.' }, { status: 400 });
    }

    const supabase = createClient();
    await supabase.from('growth_events').insert({
      user_id: user.id,
      event_type: eventType,
      platform: platform || null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Could not log event.' }, { status: 500 });
  }
}
