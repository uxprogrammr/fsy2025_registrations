import { useState } from "react";
import { useRouter } from 'next/router';
import ParticipantSidebar from "@/components/sidebars/ParticipantSidebar";
import DataTable from "@/components/DataTable";
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Participants() {
    const [participants, setParticipants] = useState([]);
    const router = useRouter();

    const handleApplyFilter = async (filter) => {
        try {
            const { searchTerm, selectedStake, selectedUnit, registrationStatus } = filter;
            const response = await fetch(`/api/participants?search=${searchTerm}&stake_name=${selectedStake}&unit_name=${selectedUnit}&status=${registrationStatus}`);
            const result = await response.json();
            setParticipants(result.data);
        } catch (error) {
            console.error("Error fetching participants:", error);
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
                    <h1 className="text-3xl font-bold mb-6">Participants</h1>
                    {participants.length > 0 ? (
                        <DataTable data={participants} getMenuItems={getMenuItems} />
                    ) : (
                        <p className="text-gray-700">No participants found</p>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
