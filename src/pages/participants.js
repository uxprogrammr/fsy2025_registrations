import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import DataTable from "@/components/DataTable";
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Participants({ participantsData }) {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);
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

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        try {
            setSearching(true);
            const response = await fetch(`/api/profiles/search?term=${encodeURIComponent(searchTerm)}`);
            const result = await response.json();

            if (result.success) {
                if (result.data.length === 1 && (
                    result.matchType === 'fsy_id' || 
                    result.matchType === 'email' || 
                    result.matchType === 'phone_number'
                )) {
                    // Single exact match - redirect to profile
                    router.push(`/profile/${result.data[0].fsy_id}`);
                } else if (result.data.length >= 1) {
                    // Multiple matches - update table
                    setParticipants(result.data);
                } else {
                    // No matches
                    setParticipants([]);
                }
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    };

    // Handle the specific logic for participants in the parent component
    const handleRowDoubleClick = (item) => {
        if (item && item.fsy_id) {
            router.push(`/profile/${item.fsy_id}`);
        }
    };

    const getMenuItems = (item) => {
        if (item && item.fsy_id) {
            return [{
                label: "View Profile",
                action: () => router.push(`/profile/${item.fsy_id}`)
            }];
        }
        return [];
    };

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

    const columns = [
        {
            name: 'ID',
            selector: row => row.fsy_id,
            sortable: true,
        },
        {
            name: 'Full Name',
            selector: row => row.full_name,
            sortable: true,
        },
        {
            name: 'Gender',
            selector: row => row.gender,
            sortable: true,
        },
        {
            name: 'Phone Number',
            selector: row => row.phone_number,
            sortable: true,
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true,
        },
        {
            name: 'Stake Name',
            selector: row => row.stake_name,
            sortable: true,
        },
        {
            name: 'Unit Name',
            selector: row => row.unit_name,
            sortable: true,
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
        },
    ];

    return (
        <ProtectedRoute>
            <div className="flex">
                <div className="flex-1 p-4">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-xl font-bold">Participants</h1>
                    </div>

                    {/* Search and Export Controls */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 max-w-4xl">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by Name, FSY ID, Contact Number, or Email"
                                    className="w-full h-9 px-3 border rounded text-gray-800 placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <p className="absolute top-full mt-1 text-xs text-gray-500">
                                    Enter Full Name for partial matches, or exact FSY ID/Contact/Email
                                </p>
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={searching || !searchTerm.trim()}
                                className={`h-9 px-4 rounded text-sm ${
                                    searching || !searchTerm.trim()
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                                } inline-flex items-center gap-2 whitespace-nowrap`}
                            >
                                {searching ? (
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                )}
                                {searching ? 'Searching...' : 'Search'}
                            </button>
                            <button
                                onClick={handleExportCSV}
                                disabled={!participants.length}
                                className={`h-9 px-4 rounded text-sm ${
                                    !participants.length
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                                } inline-flex items-center gap-2 whitespace-nowrap`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export to CSV
                            </button>
                        </div>
                    </div>
                    
                    {loading || searching ? (
                        <p className="text-gray-700">Loading participants...</p>
                    ) : participants && participants.length > 0 ? (
                        <DataTable 
                            data={participants}
                            getMenuItems={getMenuItems}
                            onRowDoubleClick={handleRowDoubleClick}
                        />
                    ) : (
                        <div>
                            <p className="text-gray-700">No participants found</p>
                            <p className="text-sm text-gray-500">
                                Try different search terms or use the filters
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
