import { useState, useEffect } from 'react';

export default function ParticipantSidebar({ onApplyFilter }) {
    const [stakes, setStakes] = useState([]);
    const [units, setUnits] = useState([]);
    const [selectedStake, setSelectedStake] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');
    const [registrationStatus, setRegistrationStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load stakes
    useEffect(() => {
        async function fetchStakes() {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch('/api/stakes');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                console.log('Stakes API response:', result); // Debug log
                
                if (result.data && Array.isArray(result.data)) {
                    setStakes(result.data);
                } else {
                    setError('Invalid stakes data received');
                }
            } catch (error) {
                console.error("Error fetching stakes:", error);
                setError('Failed to load stakes. Please try again later.');
            } finally {
                setLoading(false);
            }
        }
        fetchStakes();
    }, []);

    // Load units when stake changes
    useEffect(() => {
        async function fetchUnits() {
            if (!selectedStake) {
                setUnits([]);
                setSelectedUnit('');
                return;
            }
            try {
                setLoading(true);
                const response = await fetch(`/api/units?stake_name=${encodeURIComponent(selectedStake)}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.data && Array.isArray(result.data)) {
                    setUnits(result.data);
                }
            } catch (error) {
                console.error("Error fetching units:", error);
                setError('Failed to load units. Please try again later.');
            } finally {
                setLoading(false);
            }
        }
        fetchUnits();
    }, [selectedStake]);

    const handleApplyFilter = async () => {
        try {
            setLoading(true);
            
            const params = new URLSearchParams();
            if (selectedStake && selectedStake !== '') {
                params.append('stake_name', selectedStake);
            }
            if (selectedUnit && selectedUnit !== '') {
                params.append('unit_name', selectedUnit);
            }
            if (registrationStatus && registrationStatus !== '') {
                params.append('status', registrationStatus);
            }

            const queryString = params.toString();
            console.log('Applying filters with params:', queryString);
            
            const url = `/api/participants${queryString ? `?${queryString}` : ''}`;
            const response = await fetch(url);
            const result = await response.json();
            
            console.log('Filter API response:', result);

            // Make sure onApplyFilter exists and call it with the result
            if (typeof onApplyFilter === 'function') {
                onApplyFilter(result);
            }
        } catch (error) {
            console.error("Error applying filters:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <aside className="bg-white shadow-lg p-4 min-w-[250px] w-64">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Participants Filter</h2>
            
            {error && (
                <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
            
            <div className="mb-4">
                <label className="block mb-1 text-gray-700">Stake Name</label>
                <select
                    className="w-full p-2 border rounded text-gray-800"
                    value={selectedStake}
                    onChange={(e) => {
                        const value = e.target.value;
                        console.log('Selected stake:', value); // Debug log
                        setSelectedStake(value);
                        setSelectedUnit(''); // Reset unit when stake changes
                    }}
                >
                    <option value="">All Stakes</option>
                    {stakes.map((stake) => (
                        <option key={stake.stake_name} value={stake.stake_name}>
                            {stake.stake_name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label className="block mb-1 text-gray-700">Unit Name</label>
                <select
                    className="w-full p-2 border rounded text-gray-800"
                    value={selectedUnit}
                    onChange={(e) => {
                        const value = e.target.value;
                        console.log('Selected unit:', value); // Debug log
                        setSelectedUnit(value);
                    }}
                    disabled={!selectedStake}
                >
                    <option value="">All Units</option>
                    {units.map((unit) => (
                        <option key={unit.unit_name} value={unit.unit_name}>
                            {unit.unit_name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label className="block mb-1 text-gray-700">Registration Status</label>
                <select
                    className="w-full p-2 border rounded text-gray-800"
                    value={registrationStatus}
                    onChange={(e) => {
                        const value = e.target.value;
                        console.log('Selected status:', value); // Debug log
                        setRegistrationStatus(value);
                    }}
                >
                    <option value="">All Statuses</option>
                    <option value="Awaiting Approval">Awaiting Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Cancelled">Cancelled</option>
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
