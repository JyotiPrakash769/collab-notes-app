export interface Note {
    id: string;
    title: string;
    items: string[];
    content?: string; // HTML content for rich text
    time: string;
    variant: 'default' | 'pink' | 'cyan' | 'orange';
    users: string[]; // List of names
    lastEdited: number;
    owner?: string;
    isCollaborationOpen?: boolean;
    accessCode?: string;
}
