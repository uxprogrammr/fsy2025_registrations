import { useState, useEffect } from 'react';

export default function ParticipantSidebar({ onApplyFilter }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [stakes, setStakes] = useState([]);
    const [units, setUnits] = useState([]);
    const [selectedStake, setSelectedStake] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');
    const [registrationStatus, setRegistrationStatus] = useState('');

    // Load the list of stakes from the server
    useEffect(() => {
        async function fetchStakes() {
            try {
                const response = await fetch('/api/stakes');
                const result = await response.json();
                setStakes(result.data);
            } catch (error) {
                console.error("Error fetching stakes:", error);
            }
        }
        fetchStakes();
    }, []);

    // Load units based on selected stake
    useEffect(() => {
        async function fetchUnits() {
            if (!selectedStake) return;
            try {
                const response = await fetch(`/api/units?stake_name=${selectedStake}`);
                const result = await response.json();
                setUnits(result.data);
            } catch (error) {
                console.error("Error fetching units:", error);
            }
        }
        fetchUnits();
    }, [selectedStake]);

    const handleApplyFilter = () => {
        onApplyFilter({ searchTerm, selectedStake, selectedUnit, registrationStatus });
    };

    return (
        <aside className="bg-white shadow-lg p-4 min-w-[250px] w-64">
            <h2 className="text-xl font-bold mb-4">Participants Filter</h2>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search Participants"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>
            <div className="mb-4">
                <label className="block mb-1">Stake Name</label>
                <select
                    className="w-full p-2 border rounded"
                    value={selectedStake}
                    onChange={(e) => setSelectedStake(e.target.value)}
                >
                    <option value="">Select Stake</option>
                    {stakes.map((stake) => (
                        <option key={stake.stake_name} value={stake.stake_name}>{stake.stake_name}</option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block mb-1">Unit Name</label>
                <select
                    className="w-full p-2 border rounded"
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    disabled={!selectedStake}
                >
                    <option value="">Select Unit</option>
                    {units.map((unit) => (
                        <option key={unit.unit_name} value={unit.unit_name}>{unit.unit_name}</option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block mb-1">Registration Status</label>
                <select
                    className="w-full p-2 border rounded"
                    value={registrationStatus}
                    onChange={(e) => setRegistrationStatus(e.target.value)}
                >
                    <option value="">Select Status</option>
                    <option value="Awaiting Approval">Awaiting Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>
            <button
                onClick={handleApplyFilter}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
                Apply Filter
            </button>
        </aside>
    );
}
