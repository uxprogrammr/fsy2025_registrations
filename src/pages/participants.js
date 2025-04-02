import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import DataTable from "@/components/DataTable";
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Participants({ participantsData }) {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Load initial data
    useEffect(() => {
        fetchParticipants();
    }, []);

    // Update participants when filtered data changes
    useEffect(() => {
        if (Array.isArray(participantsData)) {
            setParticipants(participantsData);
        }
    }, [participantsData]);

    const fetchParticipants = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/participants');
            const result = await response.json();
            if (result.success && result.data) {
                setParticipants(result.data);
            }
        } catch (error) {
            console.error("Error fetching participants:", error);
        } finally {
            setLoading(false);
        }
    };

    const getMenuItems = (item) => [
        {
            label: "View Profile",
            action: () => router.push(`/profile/${item.fsy_id}`)
        }
    ];

    return (
        <ProtectedRoute>
            <div className="flex">
                <div className="flex-1 p-4">
                    <h1 className="text-xl font-bold mb-6">Participants</h1>
                    {loading ? (
                        <p className="text-gray-700">Loading participants...</p>
                    ) : participants && participants.length > 0 ? (
                        <DataTable 
                            data={participants} 
                            getMenuItems={getMenuItems}
                        />
                    ) : (
                        <div>
                            <p className="text-gray-700">No participants found</p>
                            <p className="text-sm text-gray-500">Try adjusting your filters</p>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
