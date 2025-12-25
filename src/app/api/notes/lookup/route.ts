import { getNotes } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'Code required' }, { status: 400 });
    }

    const notes = await getNotes();
    // Find the FIRST note with this code that is strictly "Open" for collaboration
    // We prioritize open sessions.
    const match = notes.find(n => n.accessCode === code && n.isCollaborationOpen);

    if (match) {
        return NextResponse.json({ id: match.id });
    }

    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
}
