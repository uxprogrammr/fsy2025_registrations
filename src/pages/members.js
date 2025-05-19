import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import DataTable from "@/components/DataTable";
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Members({ counselorsData }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);
    const router = useRouter();

    // Update members when filtered data changes
    useEffect(() => {
        if (Array.isArray(counselorsData)) {
            setMembers(counselorsData);
        }
    }, [counselorsData]);

    // Handle filter changes from the sidebar
    const handleFilterApply = (filteredData) => {
        if (filteredData && filteredData.success) {
            setMembers(filteredData.data);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault(); // Prevent form submission default behavior
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
                    setMembers(result.data);
                } else {
                    // No matches
                    setMembers([]);
                }
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    };

    // Handle row double-click to navigate to profile
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
        if (!members.length) return;

        // Define CSV headers
        const headers = [
            'FSY ID', 'Full Name', 'Gender', 'Phone Number', 
            'Email', 'Stake Name', 'Unit Name', 'Participant Type', 'Status'
        ];

        // Map member data to CSV format
        const csvData = members.map(member => [
            member.fsy_id,
            member.full_name,
            member.gender,
            member.phone_number,
            member.email,
            member.stake_name,
            member.unit_name,
            member.participant_type,
            member.status
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `members_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        { name: 'ID', selector: row => row.fsy_id, sortable: true },
        { name: 'Full Name', selector: row => row.full_name, sortable: true },
        { name: 'Gender', selector: row => row.gender, sortable: true },
        { name: 'Phone Number', selector: row => row.phone_number, sortable: true },
        { name: 'Email', selector: row => row.email, sortable: true },
        { name: 'Stake Name', selector: row => row.stake_name, sortable: true },
        { name: 'Unit Name', selector: row => row.unit_name, sortable: true },
        { name: 'Participant Type', selector: row => row.participant_type, sortable: true },
        { name: 'Status', selector: row => row.status, sortable: true },
    ];

    return (
        <ProtectedRoute>
            <div className="flex">
                <div className="flex-1 p-4">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-xl font-bold">Members</h1>
                    </div>

                    {/* Search and Export Controls */}
                    <div className="mb-6">
                        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-4xl">
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
                                type="submit"
                                disabled={searching || !searchTerm.trim()}
                                className={`h-9 px-4 rounded text-sm ${
                                    searching || !searchTerm.trim()
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                                } inline-flex items-center gap-2`}
                            >
                                {searching ? 'Searching...' : 'Search'}
                            </button>
                            <button
                                onClick={handleExportCSV}
                                disabled={!members.length}
                                className={`h-9 px-4 rounded text-sm ${
                                    !members.length
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                                } inline-flex items-center gap-2`}
                            >
                                Export to CSV
                            </button>
                        </form>
                    </div>
                    
                    {loading || searching ? (
                        <p className="text-gray-700">Loading members...</p>
                    ) : members && members.length > 0 ? (
                        <DataTable 
                            data={members}
                            columns={columns}
                            getMenuItems={getMenuItems}
                            onRowDoubleClick={handleRowDoubleClick}
                        />
                    ) : (
                        <div>
                            <p className="text-gray-700">No members found</p>
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

export async function getServerSideProps() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/members`);
        const result = await response.json();

        return {
            props: {
                counselorsData: result.success ? result.data : []
            }
        };
    } catch (error) {
        console.error('Error fetching members:', error);
        return {
            props: {
                counselorsData: []
            }
        };
    }
} 