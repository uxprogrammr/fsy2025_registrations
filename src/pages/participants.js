import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import DataTable from "@/components/DataTable";
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Participants({ participantsData }) {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Remove initial data loading
    // useEffect(() => {
    //     fetchParticipants();
    // }, []);

    // Update participants when filtered data changes
    useEffect(() => {
        if (Array.isArray(participantsData)) {
            setParticipants(participantsData);
        }
    }, [participantsData]);

    const getMenuItems = (item) => [
        {
            label: "View Profile",
            action: () => router.push(`/profile/${item.fsy_id}`)
        }
    ];

    const handleExportCSV = () => {
        if (!participants.length) return;

        // Define the headers for the CSV
        const headers = [
            'FSY ID',
            'Full Name',
            'Gender',
            'Phone Number',
            'Email',
            'Stake Name',
            'Unit Name',
            'Status'
        ];

        // Convert participants data to CSV format
        const csvData = participants.map(participant => [
            participant.fsy_id,
            participant.full_name,
            participant.gender,
            participant.phone_number,
            participant.email,
            participant.stake_name,
            participant.unit_name,
            participant.status
        ]);

        // Combine headers and data
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        // Create a Blob containing the CSV data
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        
        // Create a download link
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `participants_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        // Add the link to the document and trigger the download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <ProtectedRoute>
            <div className="flex">
                <div className="flex-1 p-4">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-xl font-bold">Participants</h1>
                        <button
                            onClick={handleExportCSV}
                            disabled={!participants.length}
                            className={`px-4 py-2 rounded ${
                                participants.length
                                    ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            } flex items-center gap-2`}
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-5 w-5" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                                />
                            </svg>
                            Export to CSV
                        </button>
                    </div>
                    
                    {loading ? (
                        <p className="text-gray-700">Loading participants...</p>
                    ) : participants && participants.length > 0 ? (
                        <DataTable 
                            data={participants} 
                            getMenuItems={getMenuItems}
                        />
                    ) : (
                        <div>
                            <p className="text-gray-700">Please use the filters to view participants</p>
                            <p className="text-sm text-gray-500">Select your criteria and click Apply Filter</p>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
