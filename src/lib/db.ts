import { prisma } from './prisma';
import { Note } from './types';

// Helper to convert DB Note to App Note
function toAppNote(dbNote: any): Note {
    return {
        id: dbNote.id,
        title: dbNote.title,
        content: dbNote.content || '',
        items: JSON.parse(dbNote.items),
        users: JSON.parse(dbNote.users),
        time: 'Just now', // We could calc relative time from lastEdited
        variant: dbNote.variant as any,
        lastEdited: new Date(dbNote.lastEdited).getTime(),
        owner: dbNote.owner || undefined,
        isCollaborationOpen: dbNote.isCollaborationOpen,
        accessCode: dbNote.accessCode || undefined,
    };
}

export async function getNotes(): Promise<Note[]> {
    try {
        const notes = await prisma.note.findMany({
            orderBy: { lastEdited: 'desc' }
        });
        return notes.map(toAppNote);
    } catch (e) {
        console.error('DB Error', e);
        return [];
    }
}

export async function getNoteById(id: string): Promise<Note | null> {
    try {
        const note = await prisma.note.findUnique({ where: { id } });
        return note ? toAppNote(note) : null;
    } catch (e) {
        return null;
    }
}

export async function createNote(note: Note) {
    try {
        return await prisma.note.create({
            data: {
                id: note.id,
                title: note.title,
                content: note.content,
                items: JSON.stringify(note.items),
                users: JSON.stringify(note.users),
                owner: note.owner,
                isCollaborationOpen: note.isCollaborationOpen || false,
                accessCode: note.accessCode,
                variant: note.variant,
                lastEdited: new Date(note.lastEdited),
            }
        });
    } catch (e) {
        console.error('Create Error', e);
        throw e;
    }
}

export async function updateNote(id: string, updates: Partial<Note>) {
    try {
        const data: any = { ...updates };

        // Convert specific fields
        if (updates.items) data.items = JSON.stringify(updates.items);
        if (updates.users) data.users = JSON.stringify(updates.users);
        if (updates.lastEdited) data.lastEdited = new Date(updates.lastEdited);

        // remove fields that don't exist in Prisma model or shouldn't be updated directly if mismatched
        delete data.time;

        return await prisma.note.update({
            where: { id },
            data
        });
    } catch (e) {
        console.error('Update Error', e);
        return null;
    }
}

export async function deleteNote(id: string) {
    try {
        await prisma.note.delete({ where: { id } });
    } catch (e) {
        // ignore
    }
}
