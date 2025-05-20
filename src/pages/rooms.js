import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Rooms() {
    const router = useRouter();
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
    const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [companyName, setCompanyName] = useState("");
    const [groupName, setGroupName] = useState("");
    const [companyOptions, setCompanyOptions] = useState([]);
    const [groupOptions, setGroupOptions] = useState([]);
    const [newRoom, setNewRoom] = useState({
        room_name: '',
        room_capacity: '',
        location: '',
        notes: ''
    });
    const [editingRoom, setEditingRoom] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchRooms();
    }, []);

    // Fetch company options on modal open
    useEffect(() => {
        if (isModalOpen) {
            fetchCompanyOptions();
        }
    }, [isModalOpen]);

    // Fetch group options when company changes
    useEffect(() => {
        if (isModalOpen && companyName) {
            fetchGroupOptions(companyName);
            setGroupName(""); // Reset groupName when company changes
        } else {
            setGroupOptions([]);
            setGroupName("");
        }
    }, [companyName, isModalOpen]);

    const fetchRooms = async () => {
        try {
            const response = await fetch('/api/rooms');
            const data = await response.json();
            if (data.success) {
                setRooms(data.data);
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanyOptions = async () => {
        try {
            const response = await fetch('/api/participants/company-group-options');
            const data = await response.json();
            if (data.success) {
                setCompanyOptions(data.companies);
            }
        } catch (error) {
            console.error('Error fetching company options:', error);
        }
    };

    const fetchGroupOptions = async (companyName) => {
        try {
            const response = await fetch(`/api/participants/company-group-options?company_name=${encodeURIComponent(companyName)}`);
            const data = await response.json();
            if (data.success) {
                setGroupOptions(data.groups);
            }
        } catch (error) {
            console.error('Error fetching group options:', error);
        }
    };

    const handleRoomClick = async (roomName) => {
        try {
            const response = await fetch(`/api/rooms/${encodeURIComponent(roomName)}`);
            const data = await response.json();
            if (data.success) {
                setParticipants(data.data);
                setSelectedRoom(rooms.find(room => room.room_name === roomName));
                // Clear search and filters when opening modal
                setSearchTerm("");
                setSearchResults([]);
                setCompanyName("");
                setGroupName("");
                setGroupOptions([]);
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error('Error fetching room participants:', error);
        }
    };

    const handleSearch = async () => {
        setSearching(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('query', searchTerm);
            else if (companyName && groupName) params.append('query', ' '); // dummy space to trigger search
            else params.append('query', '');
            if (companyName) params.append('company_name', companyName);
            if (groupName) params.append('group_name', groupName);
            if (selectedRoom) params.append('room_name', selectedRoom.room_name);
            const response = await fetch(`/api/participants/search?${params.toString()}`);
            const data = await response.json();
            if (data.success) {
                setSearchResults(data.data);
            }
        } catch (error) {
            console.error('Error searching participants:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleAddToRoom = async (fsy_id) => {
        if (!selectedRoom) return;
        try {
            const response = await fetch(`/api/rooms/add-to-room`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fsy_id, room_name: selectedRoom.room_name })
            });
            const data = await response.json();
            if (data.success) {
                // Update participants list without refreshing search results
                const updatedParticipants = [...participants, searchResults.find(p => p.fsy_id === fsy_id)];
                setParticipants(updatedParticipants);
                // Update rooms list to update participant count
                fetchRooms();
            }
        } catch (error) {
            console.error('Error adding participant to room:', error);
        }
    };

    const handleRemoveFromRoom = async (fsy_id) => {
        try {
            const response = await fetch(`/api/rooms/remove-from-room`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fsy_id })
            });
            const data = await response.json();
            if (data.success) {
                // Update participants list without refreshing search results
                const updatedParticipants = participants.filter(p => p.fsy_id !== fsy_id);
                setParticipants(updatedParticipants);
                // Update rooms list to update participant count
                fetchRooms();
            }
        } catch (error) {
            console.error('Error removing participant from room:', error);
        }
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await fetch('/api/rooms/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRoom)
            });
            const data = await response.json();
            if (data.success) {
                setRooms([...rooms, data.data]);
                setIsAddRoomModalOpen(false);
                setNewRoom({
                    room_name: '',
                    room_capacity: '',
                    location: '',
                    notes: ''
                });
            }
        } catch (error) {
            console.error('Error adding room:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleNewRoomChange = (e) => {
        const { name, value } = e.target;
        setNewRoom(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetNewRoomForm = () => {
        setNewRoom({
            room_name: '',
            room_capacity: '',
            location: '',
            notes: ''
        });
    };

    const handleEditRoom = (room, e) => {
        e.stopPropagation(); // Prevent the room card click event
        setEditingRoom(room);
        setNewRoom({
            room_name: room.room_name,
            room_capacity: room.room_capacity || '',
            location: room.location || '',
            notes: room.notes || ''
        });
        setIsEditRoomModalOpen(true);
    };

    const handleUpdateRoom = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await fetch('/api/rooms/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room_id: editingRoom.room_id,
                    ...newRoom
                })
            });
            const data = await response.json();
            if (data.success) {
                setRooms(rooms.map(room => 
                    room.room_id === editingRoom.room_id ? data.data : room
                ));
                setIsEditRoomModalOpen(false);
                setEditingRoom(null);
                setNewRoom({
                    room_name: '',
                    room_capacity: '',
                    location: '',
                    notes: ''
                });
            }
        } catch (error) {
            console.error('Error updating room:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRoom = async () => {
        if (!editingRoom) return;
        
        if (!window.confirm('Are you sure you want to delete this room? This will remove all participants from this room.')) {
            return;
        }

        setDeleting(true);
        try {
            const response = await fetch('/api/rooms/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room_id: editingRoom.room_id,
                    room_name: editingRoom.room_name
                })
            });
            const data = await response.json();
            if (data.success) {
                // Remove the room from the list
                setRooms(rooms.filter(room => room.room_id !== editingRoom.room_id));
                // Close the modal
                setIsEditRoomModalOpen(false);
                setEditingRoom(null);
            }
        } catch (error) {
            console.error('Error deleting room:', error);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Rooms  Management</h1>
                <button
                    onClick={() => {
                        resetNewRoomForm();
                        setIsAddRoomModalOpen(true);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Add Room
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                    <div
                        key={room.room_id}
                        onClick={() => handleRoomClick(room.room_name)}
                        className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow relative"
                    >
                        <button
                            onClick={(e) => handleEditRoom(room, e)}
                            className="absolute top-4 right-4 text-blue-500 hover:text-blue-700"
                        >
                            Edit
                        </button>
                        <h2 className="text-xl font-semibold mb-2">{room.room_name}</h2>
                        <div className="text-gray-600">
                            <p>Capacity: {room.room_capacity || '(not set)'}</p>
                            <p>Current Participants: {room.total_participants}</p>
                            {room.location && <p>Location: {room.location}</p>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Room Modal */}
            {isAddRoomModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Add New Room</h2>
                            <button
                                onClick={() => setIsAddRoomModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddRoom}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Room Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="room_name"
                                        value={newRoom.room_name}
                                        onChange={handleNewRoomChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Capacity
                                    </label>
                                    <input
                                        type="number"
                                        name="room_capacity"
                                        value={newRoom.room_capacity}
                                        onChange={handleNewRoomChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={newRoom.location}
                                        onChange={handleNewRoomChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={newRoom.notes}
                                        onChange={handleNewRoomChange}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddRoomModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Room'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Room Modal */}
            {isEditRoomModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Edit Room</h2>
                            <button
                                onClick={() => {
                                    setIsEditRoomModalOpen(false);
                                    setEditingRoom(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleUpdateRoom}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Room Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="room_name"
                                        value={newRoom.room_name}
                                        onChange={handleNewRoomChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Capacity
                                    </label>
                                    <input
                                        type="number"
                                        name="room_capacity"
                                        value={newRoom.room_capacity}
                                        onChange={handleNewRoomChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={newRoom.location}
                                        onChange={handleNewRoomChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={newRoom.notes}
                                        onChange={handleNewRoomChange}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-between items-center">
                                <button
                                    type="button"
                                    onClick={handleDeleteRoom}
                                    disabled={deleting}
                                    className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
                                >
                                    {deleting ? 'Deleting...' : 'Delete Room'}
                                </button>
                                <div className="flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditRoomModalOpen(false);
                                            setEditingRoom(null);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && selectedRoom && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-7xl w-full max-h-[80vh] overflow-y-auto relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-20"
                            aria-label="Close"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="flex items-center mb-4">
                            <h2 className="text-2xl font-bold">{selectedRoom.room_name} - Participants</h2>
                        </div>
                        {/* Company and Group Name filters + Search aligned horizontally */}
                        <div className="mb-4 flex flex-row justify-between gap-2 items-center">
                            <div className="flex gap-2">
                                <select
                                    className="border rounded px-3 py-2 min-w-[12rem] w-48 text-gray-900"
                                    value={companyName}
                                    onChange={e => setCompanyName(e.target.value)}
                                >
                                    <option value="">All Companies</option>
                                    {companyOptions.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <select
                                    className="border rounded px-3 py-2 min-w-[12rem] w-48 text-gray-900"
                                    value={groupName}
                                    onChange={e => setGroupName(e.target.value)}
                                    disabled={!companyName}
                                >
                                    <option value="">All Groups</option>
                                    {groupOptions.map((g) => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="border rounded px-3 py-2 min-w-[16rem] w-64 text-gray-900"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                                />
                                <button
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    onClick={handleSearch}
                                    disabled={searching}
                                >
                                    {searching ? 'Searching...' : 'Search'}
                                </button>
                            </div>
                        </div>
                        {/* Search results */}
                        {searchResults.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold mb-2">Search Results</h3>
                                <table className="min-w-full divide-y divide-gray-200 mb-2">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                                            <th className="px-6 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {searchResults.map((participant) => {
                                            const inRoom = participants.some(p => p.fsy_id === participant.fsy_id);
                                            return (
                                                <tr key={participant.fsy_id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{participant.full_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{participant.participant_type}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{participant.unit_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{participant.company_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{participant.group_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{participant.room_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                                        {inRoom ? (
                                                            <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onClick={() => handleRemoveFromRoom(participant.fsy_id)}>Remove</button>
                                                        ) : (
                                                            <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600" onClick={() => handleAddToRoom(participant.fsy_id)}>Add</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {/* Always show current room participants */}
                        <h3 className="font-semibold mb-2">Current Participants</h3>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {participants.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-4 text-center text-gray-500">No records</td>
                                    </tr>
                                ) : (
                                    participants.map((participant) => (
                                        <tr key={participant.fsy_id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">{participant.full_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">{participant.participant_type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">{participant.unit_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">{participant.company_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">{participant.group_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">{participant.room_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                                <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onClick={() => handleRemoveFromRoom(participant.fsy_id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
} 