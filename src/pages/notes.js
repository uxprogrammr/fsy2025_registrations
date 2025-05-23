import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

function PhotoModal({ photoUrl, onClose }) {
    if (!photoUrl) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60" style={{ zIndex: 1000 }}>
            <div className="relative bg-white rounded-lg shadow-lg p-4 max-w-3xl w-full flex flex-col items-center">
                <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition" onClick={onClose} aria-label="Close">&times;</button>
                <img src={photoUrl} alt="Note Photo" className="max-h-[70vh] max-w-full object-contain rounded" />
            </div>
        </div>
    );
}

function NotesModal({ open, onClose, notes, loading, onPhotoClick }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl p-6 relative text-gray-800">
                <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition" onClick={onClose} aria-label="Close">&times;</button>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Notes</h2>
                    {notes && notes.length > 0 && (
                        <div className="text-lg font-bold text-yellow-700 flex items-center mr-16">
                            Final Score:&nbsp;
                            <span className="text-2xl ml-2">{notes[notes.length - 1].running_score}</span>
                        </div>
                    )}
                </div>
                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : notes.length === 0 ? (
                    <div className="text-center text-gray-500">No notes found for this company/group.</div>
                ) : (
                    <div className="overflow-x-auto max-h-96">
                        <table className="min-w-full text-sm text-gray-800">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 text-left">Participant</th>
                                    <th className="p-2 text-left">Type</th>
                                    <th className="p-2 text-left">Category</th>
                                    <th className="p-2 text-left">Severity</th>
                                    <th className="p-2 text-left">Message</th>
                                    <th className="p-2 text-left">Photo</th>
                                    <th className="p-2 text-left">Created</th>
                                    <th className="p-2 text-left">Score</th>
                                    <th className="p-2 text-left">Running Score</th>
                                    <th className="p-2 text-left">Recorded By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notes.map((note, idx) => (
                                    <tr key={idx} className="border-b">
                                        <td className="p-2 whitespace-nowrap text-gray-800">{note.full_name}</td>
                                        <td className="p-2 whitespace-nowrap text-gray-800">{note.note_type}</td>
                                        <td className="p-2 whitespace-nowrap text-gray-800">{note.category}</td>
                                        <td className="p-2 whitespace-nowrap text-gray-800">{note.severity}</td>
                                        <td className="p-2 max-w-xs truncate text-gray-800" title={note.message}>{note.message}</td>
                                        <td className="p-2">
                                            {note.photo_url ? (
                                                <button onClick={() => onPhotoClick(note.photo_url)} className="text-blue-600 underline cursor-pointer">View</button>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="p-2 whitespace-nowrap text-gray-800">{new Date(note.created_at).toLocaleString()}</td>
                                        <td className="p-2 whitespace-nowrap text-gray-800 text-center">{note.score > 0 ? `+${note.score}` : note.score}</td>
                                        <td className="p-2 whitespace-nowrap text-gray-800 text-center">{note.running_score}</td>
                                        <td className="p-2 whitespace-nowrap text-gray-800">{note.recorded_by}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Notes() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalNotes, setModalNotes] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [photoModalUrl, setPhotoModalUrl] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const response = await fetch('/api/notes/summary');
            const data = await response.json();
            console.log('Notes summary API response:', data); // Debug log
            setNotes(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching notes:', error);
            setLoading(false);
        }
    };

    const handleCardClick = async (company_name, group_name) => {
        setSelectedCompany(company_name);
        setSelectedGroup(group_name);
        setModalLoading(true);
        setModalOpen(true);
        try {
            const res = await fetch(`/api/notes/group?company_name=${encodeURIComponent(company_name)}&group_name=${encodeURIComponent(group_name)}`);
            const data = await res.json();
            setModalNotes(data);
        } catch (err) {
            setModalNotes([]);
        }
        setModalLoading(false);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Notes Management</h1>
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            ) : notes.length === 0 ? (
                <div className="text-center text-gray-500 mt-12 text-lg">
                    No notes found for any company or group.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notes.map((note) => (
                        <div
                            key={note.company_id + '-' + note.group_name}
                            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition"
                            onClick={() => handleCardClick(note.company_name, note.group_name)}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h2 className="text-xl font-semibold">{note.company_name}</h2>
                                    <p className="text-gray-600">{note.group_name}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-sm text-gray-600">Score</span>
                                    <span className="text-2xl font-bold text-yellow-600">{note.score}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-3 rounded ${note.positive_notes > 0 ? 'bg-green-50' : 'bg-gray-100'}`}>
                                    <p className="text-sm text-gray-600">Positive Notes</p>
                                    <p className="text-2xl font-bold text-gray-800">{note.positive_notes}</p>
                                </div>
                                <div className={`p-3 rounded ${note.negative_notes > 0 ? 'bg-red-50' : 'bg-gray-100'}`}>
                                    <p className="text-sm text-gray-600">Negative Notes</p>
                                    <p className="text-2xl font-bold text-gray-800">{note.negative_notes}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <NotesModal open={modalOpen} onClose={() => setModalOpen(false)} notes={modalNotes} loading={modalLoading} onPhotoClick={setPhotoModalUrl} />
            <PhotoModal photoUrl={photoModalUrl} onClose={() => setPhotoModalUrl(null)} />
        </div>
    );
} 