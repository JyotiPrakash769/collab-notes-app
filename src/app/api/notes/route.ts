import { NextResponse } from 'next/server';
import { getNotes, createNote } from '@/lib/db';
import { Note } from '@/lib/types';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');

    if (ids) {
        const idList = ids.split(',');
        const validNotes = await getNotes();
        const notes = validNotes.filter(note => idList.includes(note.id));
        return NextResponse.json(notes);
    }

    // Default: return empty or all? 
    // For privacy, let's return empty if no IDs provided (unless we want a 'public feed')
    return NextResponse.json([]);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Server-side validation could go here

        // Ensure ID is generated if not provided (though store usually provides it, better to trust server?)
        // Store provides it currently. Let's accept it.
        const note = await createNote(body);
        return NextResponse.json(note);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    }
}
