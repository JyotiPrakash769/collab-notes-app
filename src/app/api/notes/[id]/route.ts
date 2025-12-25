import { NextResponse } from 'next/server';
import { getNoteById, updateNote, deleteNote } from '@/lib/db';
import { Note } from '@/lib/types';

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const note = await getNoteById(params.id);
    if (!note) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    return NextResponse.json(note);
}

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const body = await request.json();
        const updated = await updateNote(params.id, body);

        if (!updated) {
            return NextResponse.json({ error: 'Note not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    await deleteNote(params.id);
    return NextResponse.json({ success: true });
}
