import { redirect } from 'next/navigation';

export default function NotePage({ params }: { params: { id: string } }) {
    // Redirect /note/[id] -> /?note=[id] to show it in the modal context
    redirect(`/?note=${params.id}`);
}
