import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddCompanyModal({ isOpen, onClose, onSuccess }) {
    // Add debug log
    useEffect(() => {
        console.log('Modal mounted, isOpen:', isOpen);
    }, [isOpen]);

    const [companyName, setCompanyName] = useState('');
    const [companyNumber, setCompanyNumber] = useState(null);
    const [description, setDescription] = useState('');
    const [groupName, setGroupName] = useState('');
    const [groups, setGroups] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Fetch the next company number when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchNextCompanyNumber();
            setCompanyName('');
            setDescription('');
            setGroupName('');
            setGroups([]);
            setError(null);
        }
    }, [isOpen]);

    const fetchNextCompanyNumber = async () => {
        try {
            const response = await fetch('/api/company/next-number');
            const result = await response.json();
            if (result.success) {
                setCompanyNumber(result.nextNumber);
            }
        } catch (error) {
            console.error('Error fetching next company number:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            console.log('Submitting company:', { companyName, companyNumber, description, groups });

            // Transform groups to include numbers
            const numberedGroups = groups.map((name, index) => ({
                name: name,
                number: index + 1
            }));

            const response = await fetch('/api/company', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    company_name: companyName,
                    company_number: companyNumber,
                    description,
                    groups: numberedGroups
                }),
            });

            const result = await response.json();
            console.log('API Response:', { status: response.status, result });

            if (!response.ok) {
                if (response.status === 409) {
                    toast.error('A company with this name already exists');
                } else {
                    toast.error(result.message || 'Failed to create company');
                }
                setIsSubmitting(false);
                return;
            }

            toast.success('Company created successfully');
            onSuccess?.(result.data);
            onClose();
        } catch (error) {
            console.error('Error creating company:', error);
            toast.error('Failed to create company');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGroupKeyDown = (e) => {
        if (e.key === 'Enter' && groupName.trim()) {
            e.preventDefault();
            if (!groups.includes(groupName.trim())) {
                setGroups([...groups, groupName.trim()]);
            }
            setGroupName('');
        }
    };

    const removeGroup = (groupToRemove) => {
        setGroups(groups.filter(g => g !== groupToRemove));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add Company</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company Number
                        </label>
                        <input
                            type="number"
                            value={companyNumber || ''}
                            onChange={(e) => setCompanyNumber(parseInt(e.target.value) || null)}
                            className="w-full px-3 py-2 border rounded text-gray-700 focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company Name *
                        </label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full px-3 py-2 border rounded text-gray-700 focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border rounded text-gray-700 focus:outline-none focus:border-blue-500"
                            rows="3"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Groups
                        </label>
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-2 mb-2">
                                {groups.map((group, index) => (
                                    <div
                                        key={index}
                                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-2"
                                    >
                                        <span>{`${index + 1}. ${group}`}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeGroup(group)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                onKeyDown={handleGroupKeyDown}
                                placeholder="Type group name and press Enter"
                                className="w-full px-3 py-2 border rounded text-gray-700 focus:outline-none focus:border-blue-500"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Press Enter to add a group. Groups will be automatically numbered starting from 1.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !companyName.trim()}
                            className={`px-4 py-2 rounded ${
                                isSubmitting || !companyName.trim()
                                    ? 'bg-blue-300 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Company'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 