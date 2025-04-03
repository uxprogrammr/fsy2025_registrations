import { useState, useEffect } from 'react';

export default function CompanySidebar({ onApplyFilter }) {
    const [companies, setCompanies] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load companies
    useEffect(() => {
        async function fetchCompanies() {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch('/api/company');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                console.log('Companies API response:', result); // Debug log
                
                if (result.data && Array.isArray(result.data)) {
                    setCompanies(result.data);
                } else {
                    setError('Invalid companies data received');
                }
            } catch (error) {
                console.error("Error fetching companies:", error);
                setError('Failed to load companies. Please try again later.');
            } finally {
                setLoading(false);
            }
        }
        fetchCompanies();
    }, []);

    // Load groups when company changes
    useEffect(() => {
        async function fetchGroups() {
            if (!selectedCompany) {
                setGroups([]);
                setSelectedGroup('');
                return;
            }
            try {
                setLoading(true);
                const response = await fetch(`/api/company/${selectedCompany}/groups`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.data && Array.isArray(result.data)) {
                    setGroups(result.data);
                }
            } catch (error) {
                console.error("Error fetching groups:", error);
                setError('Failed to load groups. Please try again later.');
            } finally {
                setLoading(false);
            }
        }
        fetchGroups();
    }, [selectedCompany]);

    const handleApplyFilter = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const params = new URLSearchParams();
            if (selectedCompany) {
                params.append('company_id', selectedCompany);
            }
            if (selectedGroup) {
                params.append('group_id', selectedGroup);
            }

            const queryString = params.toString();
            console.log('Applying filters with params:', queryString);
            
            const url = `/api/company/members${queryString ? `?${queryString}` : ''}`;
            const response = await fetch(url);
            const result = await response.json();
            
            console.log('Filter API response:', result);

            if (typeof onApplyFilter === 'function') {
                onApplyFilter(result);
            }
        } catch (error) {
            console.error("Error applying filters:", error);
            setError('Failed to apply filters. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <aside className="bg-white shadow-lg p-4 min-w-[250px] w-64">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Company Filter</h2>
            
            {error && (
                <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
            
            <div className="mb-4">
                <label className="block mb-1 text-gray-700">Company</label>
                <select
                    className="w-full p-2 border rounded text-gray-800"
                    value={selectedCompany}
                    onChange={(e) => {
                        const value = e.target.value;
                        console.log('Selected company:', value); // Debug log
                        setSelectedCompany(value);
                        setSelectedGroup(''); // Reset group when company changes
                    }}
                >
                    <option value="">Select Company</option>
                    {companies.map((company) => (
                        <option key={company.company_id} value={company.company_id}>
                            {company.company_name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label className="block mb-1 text-gray-700">Group</label>
                <select
                    className="w-full p-2 border rounded text-gray-800"
                    value={selectedGroup}
                    onChange={(e) => {
                        const value = e.target.value;
                        console.log('Selected group:', value); // Debug log
                        setSelectedGroup(value);
                    }}
                    disabled={!selectedCompany}
                >
                    <option value="">Select Group</option>
                    {groups.map((group) => (
                        <option key={group.group_id} value={group.group_id}>
                            {group.group_name}
                        </option>
                    ))}
                </select>
            </div>

            <button
                onClick={handleApplyFilter}
                disabled={loading}
                className={`w-full p-2 rounded text-white ${
                    loading 
                    ? 'bg-blue-300 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
            >
                {loading ? 'Applying...' : 'Apply Filter'}
            </button>
        </aside>
    );
}
