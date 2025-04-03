import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import DataTable from "@/components/DataTable";
import ProtectedRoute from '@/components/ProtectedRoute';
import { ChevronDown, Search } from 'lucide-react';
import AddCompanyModal from '@/components/modals/AddCompanyModal';
import AddMembersModal from '@/components/modals/AddMembersModal';
import { toast } from 'react-hot-toast';
import { useCompanyFilter } from '@/context/CompanyFilterContext';

export default function Company() {
    const { filteredMembers, updateFilteredMembers } = useCompanyFilter();
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
    const [showAddMembersModal, setShowAddMembersModal] = useState(false);
    const router = useRouter();

    // Handle search from the search box
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        try {
            setSearching(true);
            const response = await fetch(`/api/company/members/search?term=${encodeURIComponent(searchTerm)}`);
            const result = await response.json();

            if (result.success) {
                updateFilteredMembers(result);
            }
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Failed to search members');
        } finally {
            setSearching(false);
        }
    };

    const handleExportCSV = async () => {
        try {
            const response = await fetch('/api/company/members/export');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `company-members-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export members');
        }
    };

    // Add this new handler for double-click
    const handleRowDoubleClick = (row) => {
        if (row.fsy_id) {
            console.log('Double clicked row:', row); // For debugging
            router.push(`/profile/${row.fsy_id}`);
        }
    };

    // Define columns for the DataTable
    const columns = [
        { 
            name: 'Full Name',
            selector: row => row.full_name,
            sortable: true,
            grow: 2
        },
        { 
            name: 'Gender',
            selector: row => row.gender,
            sortable: true,
            width: '100px'
        },
        { 
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            cell: row => (
                <span className={`px-2 py-1 rounded-full text-xs ${
                    row.status === 'Approved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                }`}>
                    {row.status}
                </span>
            )
        },
        { 
            name: 'Type',
            selector: row => row.participant_type,
            sortable: true,
            cell: row => (
                <span className={`px-2 py-1 rounded-full text-xs ${
                    row.participant_type === 'Counselor'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                }`}>
                    {row.participant_type}
                </span>
            )
        },
        { 
            name: 'Stake Name',
            selector: row => row.stake_name,
            sortable: true,
            grow: 1
        },
        { 
            name: 'Unit Name',
            selector: row => row.unit_name || '-',
            sortable: true,
            grow: 1
        },
        { 
            name: 'Company',
            selector: row => row.company_name,
            sortable: true,
            grow: 1
        },
        { 
            name: 'Group',
            selector: row => row.group_name,
            sortable: true,
            grow: 1
        }
    ];

    return (
        <ProtectedRoute>
            <div className="p-4">
                {/* Header with Actions */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold">Company Management</h1>
                    
                    {/* Actions Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowActionsMenu(!showActionsMenu)}
                            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-600"
                        >
                            Actions
                            <ChevronDown className="h-4 w-4" />
                        </button>
                        
                        {showActionsMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setShowActionsMenu(false);
                                            router.push('/company/list');
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        View Companies
                                    </button>
                                    <div className="border-t border-gray-200"></div>
                                    <button
                                        onClick={() => {
                                            setShowActionsMenu(false);
                                            setShowAddCompanyModal(true);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Add Company
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowActionsMenu(false);
                                            setShowAddMembersModal(true);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Add Members
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Search and Export Controls */}
                <div className="mb-6">
                    <div className="flex items-center gap-4">
                        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name, FSY ID, stake name, or unit name"
                                    className="w-full h-9 px-3 pl-10 border rounded text-gray-800 placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            </div>
                            <button
                                type="submit"
                                disabled={searching || !searchTerm.trim()}
                                className={`h-9 px-4 rounded text-sm ${
                                    searching || !searchTerm.trim()
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                                }`}
                            >
                                {searching ? 'Searching...' : 'Search'}
                            </button>
                        </form>
                        
                        <button
                            onClick={handleExportCSV}
                            className="h-9 px-4 rounded text-sm bg-green-500 hover:bg-green-600 text-white"
                        >
                            Export to CSV
                        </button>
                    </div>
                </div>

                {/* Debug output */}
                <div className="mb-4 text-sm text-gray-500">
                    {`Current member count: ${filteredMembers.length}`}
                </div>

                <DataTable
                    columns={columns}
                    data={filteredMembers}
                    progressPending={loading}
                    pagination
                    paginationPerPage={25}
                    paginationRowsPerPageOptions={[25, 50, 100]}
                    onRowDoubleClick={handleRowDoubleClick}
                    className="cursor-pointer"
                    noDataComponent={
                        <div className="p-4 text-center text-gray-500">
                            {searchTerm 
                                ? "No members found matching your search criteria"
                                : "Select a company from the sidebar and click Apply Filter to view members"}
                        </div>
                    }
                />

                {/* Modals */}
                <AddCompanyModal
                    isOpen={showAddCompanyModal}
                    onClose={() => setShowAddCompanyModal(false)}
                    onSuccess={() => {
                        setShowAddCompanyModal(false);
                        toast.success('Company added successfully');
                    }}
                />

                <AddMembersModal
                    isOpen={showAddMembersModal}
                    onClose={() => setShowAddMembersModal(false)}
                    onSuccess={() => {
                        setShowAddMembersModal(false);
                        toast.success('Members added successfully');
                    }}
                />
            </div>
        </ProtectedRoute>
    );
} 