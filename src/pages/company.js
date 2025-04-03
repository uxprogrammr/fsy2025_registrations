import { useState } from "react";
import { useRouter } from 'next/router';
import DataTable from "@/components/DataTable";
import ProtectedRoute from '@/components/ProtectedRoute';
import { ChevronDown } from 'lucide-react';
import AddCompanyModal from '@/components/modals/AddCompanyModal';
import AddMembersModal from '@/components/modals/AddMembersModal';
import { toast } from 'react-hot-toast';

export default function Company() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
    const [showAddMembersModal, setShowAddMembersModal] = useState(false);
    const router = useRouter();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        try {
            setSearching(true);
            const response = await fetch(`/api/company/members/search?term=${encodeURIComponent(searchTerm)}`);
            const result = await response.json();

            if (result.success) {
                setMembers(result.data);
            }
        } catch (error) {
            console.error('Search error:', error);
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
        }
    };

    return (
        <ProtectedRoute>
            <div className="flex">
                <div className="flex-1 p-4">
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
                                        placeholder="Search members (by name or ID)"
                                        className="w-full h-9 px-3 border rounded text-gray-800 placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
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
                            </form>
                            
                            <button
                                onClick={handleExportCSV}
                                className="h-9 px-4 rounded text-sm bg-green-500 hover:bg-green-600 text-white"
                            >
                                Export to CSV
                            </button>
                        </div>
                    </div>

                    {/* Members Table */}
                    <DataTable
                        data={members}
                        columns={[
                            { name: 'FSY ID', selector: row => row.fsy_id, sortable: true },
                            { name: 'Name', selector: row => row.full_name, sortable: true },
                            { name: 'Stake Name', selector: row => row.stake_name, sortable: true },
                            { name: 'Role', selector: row => row.role, sortable: true },
                            { name: 'Group Name', selector: row => row.group_name, sortable: true }
                        ]}
                        pagination
                        responsive
                        striped
                        highlightOnHover
                    />

                    {/* Add Company Modal */}
                    <AddCompanyModal
                        isOpen={showAddCompanyModal}
                        onClose={() => setShowAddCompanyModal(false)}
                        onSuccess={() => {
                            setShowAddCompanyModal(false);
                            // Refresh the data if needed
                        }}
                    />

                    {/* Add Members Modal */}
                    <AddMembersModal
                        isOpen={showAddMembersModal}
                        onClose={() => setShowAddMembersModal(false)}
                        onSuccess={() => {
                            setShowAddMembersModal(false);
                            // Refresh the data if needed
                        }}
                    />
                </div>
            </div>
        </ProtectedRoute>
    );
} 