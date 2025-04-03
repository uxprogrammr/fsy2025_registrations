import { useState, useEffect, useMemo } from 'react';
import { X, Search, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddMembersModal({ isOpen, onClose }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [companyMembers, setCompanyMembers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [loading, setLoading] = useState(false);

    // Reset and fetch data when modal opens
    useEffect(() => {
        if (isOpen) {
            resetForm();
            fetchCompanies();
        }
    }, [isOpen]);

    // Fetch company members when company or group is selected
    useEffect(() => {
        if (selectedCompany && selectedGroup) {
            fetchCompanyMembers();
        } else {
            setCompanyMembers([]);
        }
    }, [selectedCompany, selectedGroup]);

    // Fetch groups when company is selected
    useEffect(() => {
        if (selectedCompany) {
            fetchGroups(selectedCompany);
        } else {
            setGroups([]);
            setSelectedGroup('');
        }
    }, [selectedCompany]);

    const resetForm = () => {
        setSearchTerm('');
        setSearchResults([]);
        setCompanyMembers([]);
        setSelectedCompany('');
        setSelectedGroup('');
    };

    const fetchCompanyMembers = async () => {
        if (!selectedCompany || !selectedGroup) return;

        try {
            setLoading(true);
            console.log('Fetching members for:', { 
                company_id: selectedCompany, 
                group_id: selectedGroup 
            }); // Debug log

            const response = await fetch(
                `/api/company/members?company_id=${selectedCompany}&group_id=${selectedGroup}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch company members');
            }

            const result = await response.json();
            console.log('Company members response:', result); // Debug log

            if (result.success) {
                setCompanyMembers(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching company members:', error);
            toast.error('Failed to load company members');
            setCompanyMembers([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await fetch('/api/company');
            const result = await response.json();
            if (result.success && result.data) {
                setCompanies(result.data);
                // If there's only one company, select it automatically
                if (result.data.length === 1) {
                    setSelectedCompany(result.data[0].company_id.toString());
                }
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
            toast.error('Failed to load companies');
        }
    };

    const fetchGroups = async (companyId) => {
        try {
            console.log('Fetching groups for company:', companyId); // Debug log
            const response = await fetch(`/api/company/${companyId}/groups`);
            const result = await response.json();
            
            console.log('Groups API response:', result); // Debug log

            if (result.success && result.data) {
                setGroups(result.data);
                // If there's only one group, select it automatically
                if (result.data.length === 1) {
                    setSelectedGroup(result.data[0].group_id.toString());
                }
            } else {
                setGroups([]);
                setSelectedGroup('');
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
            toast.error('Failed to load groups');
            setGroups([]);
            setSelectedGroup('');
        }
    };

    // Company selection handler
    const handleCompanyChange = (e) => {
        const value = e.target.value;
        setSelectedCompany(value);
        setSelectedGroup(''); // Reset group selection when company changes
        if (value) {
            fetchGroups(value);
        }
    };

    // Update the handleGroupChange function
    const handleGroupChange = (e) => {
        const value = e.target.value;
        setSelectedGroup(value);
        // Reset search results when group changes
        setSearchResults([]);
        setSearchTerm('');
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        try {
            setSearching(true);
            const response = await fetch(`/api/registrations/search?term=${encodeURIComponent(searchTerm)}`);
            if (!response.ok) {
                throw new Error('Failed to search members');
            }
            const result = await response.json();
            setSearchResults(result.data || []);
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Failed to search members');
        } finally {
            setSearching(false);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setSearchResults([]); // Clear the search results
    };

    const handleAddMember = async (member) => {
        if (!selectedCompany || !selectedGroup) {
            toast.error('Please select both company and group');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('/api/company/members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fsy_id: member.fsy_id,
                    company_id: parseInt(selectedCompany, 10),
                    group_id: parseInt(selectedGroup, 10)
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to add member');
            }

            toast.success('Member added successfully');
            // Refresh company members list
            fetchCompanyMembers();
            // Remove from search results
            setSearchResults(searchResults.filter(m => m.fsy_id !== member.fsy_id));
        } catch (error) {
            console.error('Error adding member:', error);
            toast.error(error.message || 'Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMember = async (member) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/company/members/${member.fsy_id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to delete member');
            }

            toast.success('Member removed successfully');
            // Refresh company members list
            fetchCompanyMembers();
        } catch (error) {
            console.error('Error deleting member:', error);
            toast.error(error.message || 'Failed to remove member');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to sort members
    const sortMembers = (members) => {
        return members.sort((a, b) => {
            // First sort by participant_type
            const typeOrder = {
                'Counselor': 1,
                'Participant': 2
            };
            
            const typeComparison = (typeOrder[a.participant_type] || 3) - (typeOrder[b.participant_type] || 3);
            
            // If same type, sort by full_name
            if (typeComparison === 0) {
                return a.full_name.localeCompare(b.full_name);
            }
            
            return typeComparison;
        });
    };

    // Combine and sort search results and company members
    const allMembers = useMemo(() => {
        // Combine search results and company members
        const combined = [...searchResults, ...companyMembers];
        
        // Remove duplicates based on fsy_id
        const unique = combined.filter((member, index, self) =>
            index === self.findIndex((m) => m.fsy_id === member.fsy_id)
        );
        
        // Sort the unique members
        return sortMembers(unique);
    }, [searchResults, companyMembers]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl relative max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Add Members</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Company and Group Selection */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company *
                        </label>
                        <select
                            value={selectedCompany}
                            onChange={handleCompanyChange}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                            required
                        >
                            <option value="" className="text-gray-500">Select a company</option>
                            {companies.map((company) => (
                                <option 
                                    key={company.company_id} 
                                    value={company.company_id}
                                    className="text-gray-900"
                                >
                                    {company.company_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Group *
                        </label>
                        <select
                            value={selectedGroup}
                            onChange={handleGroupChange}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                            disabled={!selectedCompany}
                            required
                        >
                            <option value="" className="text-gray-500">
                                {!selectedCompany ? 'Select a company first' : 'Select a group'}
                            </option>
                            {groups.map((group) => (
                                <option 
                                    key={group.group_id} 
                                    value={group.group_id}
                                    className="text-gray-900"
                                >
                                    {group.group_name}
                                </option>
                            ))}
                        </select>
                        {groups.length === 0 && selectedCompany && (
                            <p className="mt-1 text-sm text-red-500">
                                No groups available for this company
                            </p>
                        )}
                    </div>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="mb-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name, FSY ID, or stake"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                            />
                            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                        <button
                            type="submit"
                            disabled={searching || !searchTerm.trim()}
                            className={`px-4 py-2 rounded-lg flex items-center ${
                                searching || !searchTerm.trim()
                                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                        >
                            {searching ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Searching...
                                </>
                            ) : (
                                'Search'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            disabled={searching || (searchResults.length === 0 && !searchTerm)}
                            className={`px-4 py-2 rounded-lg flex items-center ${
                                searching || (searchResults.length === 0 && !searchTerm)
                                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                    : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Clear
                        </button>
                    </div>
                </form>

                {/* Show search results count if there are any */}
                {searchResults.length > 0 && (
                    <div className="mb-4 text-sm text-gray-600">
                        Found {searchResults.length} matching members
                    </div>
                )}

                {/* Members Table */}
                <div className="overflow-y-auto flex-1">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Full Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Gender
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Age
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {allMembers.map((member) => {
                                const isExistingMember = companyMembers.some(m => m.fsy_id === member.fsy_id);
                                
                                return (
                                    <tr 
                                        key={member.fsy_id} 
                                        className={`${isExistingMember ? 'bg-gray-50' : ''} ${
                                            member.participant_type === 'Counselor' ? 'bg-blue-50' : ''
                                        }`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {member.full_name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                FSY ID: {member.fsy_id}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {member.gender}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {member.age}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                member.status === 'Approved' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : member.status === 'Awaiting Approval'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {member.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {member.participant_type}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {isExistingMember ? (
                                                <button
                                                    onClick={() => handleDeleteMember(member)}
                                                    disabled={loading}
                                                    className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md ${
                                                        loading
                                                            ? 'bg-red-300 cursor-not-allowed'
                                                            : 'text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                                                    }`}
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    Delete
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleAddMember(member)}
                                                    disabled={loading || !selectedCompany || !selectedGroup}
                                                    className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md ${
                                                        loading || !selectedCompany || !selectedGroup
                                                            ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                                            : 'text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                                    }`}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {allMembers.length === 0 && !searching && (
                        <div className="text-center py-4 text-gray-500">
                            No members found. Try searching for members to add.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 