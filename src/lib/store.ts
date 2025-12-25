import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note } from './types';

interface NotesState {
    notes: Note[];
    addNote: (owner?: string) => Promise<string>;
    updateNote: (id: string, data: Partial<Note>) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    fetchNote: (id: string) => Promise<Note | null>;
    syncNotes: () => Promise<void>;
}

const INITIAL_NOTES: Note[] = [];

export const useNotesStore = create<NotesState>()(
    persist(
        (set, get) => ({
            notes: INITIAL_NOTES,
            addNote: async (owner?: string) => {
                const id = crypto.randomUUID();
                const newNote: Note = {
                    id,
                    title: '',
                    items: [],
                    content: '',
                    time: 'Just now',
                    variant: 'default',
                    users: owner ? [owner] : [],
                    owner: owner,
                    isCollaborationOpen: false,
                    accessCode: '',
                    lastEdited: Date.now(),
                };

                // Optimistic update
                set((state) => ({ notes: [newNote, ...state.notes] }));

                // Sync to backend
                try {
                    await fetch('/api/notes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newNote)
                    });
                } catch (e) {
                    console.error('Failed to save note to backend', e);
                }

                return id;
            },
            updateNote: async (id, data) => {
                // Optimistic update
                set((state) => ({
                    notes: state.notes.map((note) =>
                        note.id === id ? { ...note, ...data, lastEdited: Date.now(), time: 'Just now' } : note
                    ),
                }));

                // Debounce could be handled here or in component, but for now simple fire-and-forget
                try {
                    await fetch(`/api/notes/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                } catch (e) {
                    console.error('Failed to update note', e);
                }
            },
            deleteNote: async (id) => {
                set((state) => ({
                    notes: state.notes.filter((note) => note.id !== id),
                }));

                try {
                    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
                } catch (e) {
                    console.error('Failed to delete note', e);
                }
            },
            fetchNote: async (id) => {
                try {
                    const res = await fetch(`/api/notes/${id}`);
                    if (res.ok) {
                        const note = await res.json();
                        // Update or add to store
                        set((state) => {
                            const exists = state.notes.find(n => n.id === note.id);
                            if (exists) {
                                return {
                                    notes: state.notes.map(n => n.id === note.id ? note : n)
                                };
                            } else {
                                return {
                                    notes: [note, ...state.notes]
                                };
                            }
                        });
                        return note;
                    }
                } catch (e) {
                    console.error('Failed to fetch note', e);
                }
                return null;
            },
            syncNotes: async () => {
                const state = get();
                const ids = state.notes.map(n => n.id).join(',');
                if (!ids) return;

                try {
                    const res = await fetch(`/api/notes?ids=${ids}`);
                    if (res.ok) {
                        const serverNotes: Note[] = await res.json();
                        // Merge strategies could be complex, for now, server wins or we just update content
                        set((state) => ({
                            notes: state.notes.map(local => {
                                const server = serverNotes.find(s => s.id === local.id);
                                return server ? server : local;
                            })
                        }));
                    }
                } catch (e) {
                    console.error('Sync failed', e);
                }
            }
        }),
        {
            name: 'colabnote-storage',
        }
    )
);
