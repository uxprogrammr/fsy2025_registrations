import { useEffect, useState } from "react";
import ProtectedRoute from '@/components/ProtectedRoute';
import DataTable from "@/components/DataTable";

export default function Participants() {
    const [participants, setParticipants] = useState([]);

    useEffect(() => {
        async function fetchParticipants() {
            try {
                const response = await fetch('/api/counselors');
                const result = await response.json();
                setParticipants(result.data);
            } catch (error) {
                console.error("Error fetching counselors data:", error);
            }
        }
        //fetchParticipants();
    }, []);

    return (
        <ProtectedRoute>
            <main className="flex-1 p-6 overflow-y-auto bg-white">
                <h1 className="text-3xl font-bold mb-6 text-gray-900">Counselors</h1>
                {participants.length > 0 ? (
                    <p className="text-gray-700">Counselors page</p>
                ) : (
                    <p className="text-gray-700">No counselors found</p>
                )}
            </main>
        </ProtectedRoute>
    );
}
