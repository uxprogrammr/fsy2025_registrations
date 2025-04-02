import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';

export default function ParticipantProfile() {
    const router = useRouter();
    const { id } = router.query;
    const [participant, setParticipant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [saving, setSaving] = useState(false);
    const [showQR, setShowQR] = useState(false);

    useEffect(() => {
        async function fetchParticipant() {
            if (!id) return;

            try {
                setLoading(true);
                const response = await fetch(`/api/participants/${id}`);
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Failed to fetch participant');
                }
                console.log('Participant data:', result.data); // Debug log
                setParticipant(result.data);
            } catch (error) {
                console.error('Error:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        fetchParticipant();
    }, [id]);

    const handleEdit = () => {
        // Create a clean copy of the current data, preserving all fields
        const editableData = {
            first_name: participant.first_name,
            last_name: participant.last_name,
            preferred_name: participant.preferred_name,
            gender: participant.gender,
            age: participant.age,
            birth_date: participant.birth_date,
            shirt_size: participant.shirt_size,
            phone_number: participant.phone_number,
            email: participant.email,
            father_name: participant.father_name,
            father_email: participant.father_email,
            father_phone_number: participant.father_phone_number,
            mother_name: participant.mother_name,
            mother_email: participant.mother_email,
            mother_phone_number: participant.mother_phone_number,
            stake_name: participant.stake_name,
            unit_name: participant.unit_name,
            bishop_name: participant.bishop_name,
            bishop_email: participant.bishop_email,
            medical_information: participant.medical_information,
            dietary_information: participant.dietary_information
        };

        console.log('Starting edit mode with data:', editableData);
        setEditedData(editableData);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditedData({});
        setIsEditing(false);
    };

    const handleChange = (field, value) => {
        console.log('Field changed:', field, value); // Debug log
        setEditedData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            console.log('Saving data:', editedData);

            const response = await fetch(`/api/participants/${id}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedData),
            });

            const result = await response.json();
            console.log('Save response:', result);

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update profile');
            }

            // Fetch fresh data after update
            const updatedResponse = await fetch(`/api/participants/${id}`);
            const updatedData = await updatedResponse.json();
            
            console.log('Updated participant data:', updatedData); // Debug log

            if (!updatedResponse.ok) {
                throw new Error('Failed to fetch updated data');
            }

            // Update the participant state with fresh data
            setParticipant(updatedData.data);
            setIsEditing(false);
            setEditedData({});

            alert('Profile updated successfully');
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to update profile: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const renderField = (label, field, type = 'text') => {
        const value = isEditing ? editedData[field] : participant[field];

        return (
            <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
                {isEditing ? (
                    type === 'date' ? (
                        <input
                            type="date"
                            value={value ? new Date(value).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleChange(field, e.target.value)}
                            className="w-full px-3 py-2 text-black bg-white border border-gray-300 rounded"
                        />
                    ) : (
                        <input
                            type={type}
                            value={value || ''}
                            onChange={(e) => handleChange(field, e.target.value)}
                            className="w-full px-3 py-2 text-black bg-white border border-gray-300 rounded"
                        />
                    )
                ) : (
                    <div className="text-gray-900">
                        {type === 'date' && value ? 
                            new Date(value).toLocaleDateString() : 
                            value || 'Not provided'}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="p-6">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute>
                <div className="p-6">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!participant) {
        return (
            <ProtectedRoute>
                <div className="p-6">
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
                        Participant not found
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="p-6">
                {/* Header with Edit/Save buttons */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Participant Profile</h1>
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleEdit}
                                    className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Edit Profile
                                </button>
                                <button
                                    onClick={() => router.back()}
                                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                >
                                    Back
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Left Column */}
                    <div className="w-64 flex flex-col gap-4">
                        {/* Profile Picture Placeholder */}
                        <div className="bg-white shadow rounded-lg p-4">
                            <div className="aspect-square w-full bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                                <svg 
                                    className="w-24 h-24 text-gray-400" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth="2" 
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                                    />
                                </svg>
                            </div>
                            <div className="text-center">
                                <h3 className="font-medium text-gray-900">{participant?.first_name} {participant?.last_name}</h3>
                                <p className="text-sm text-gray-500">FSY ID: {participant?.fsy_id}</p>
                            </div>
                        </div>

                        {/* QR Code Section */}
                        <div className="bg-white shadow rounded-lg p-4">
                            <button
                                onClick={() => setShowQR(!showQR)}
                                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                {showQR ? 'Hide QR Code' : 'Show QR Code'}
                            </button>
                            
                            {showQR && (
                                <div className="mt-4 flex flex-col items-center">
                                    <QRCodeSVG
                                        value={JSON.stringify({
                                            fsy_id: participant?.fsy_id,
                                            name: `${participant?.first_name} ${participant?.last_name}`,
                                            stake: participant?.stake_name,
                                            unit: participant?.unit_name
                                        })}
                                        size={200}
                                        level="H"
                                        includeMargin={true}
                                    />
                                    <p className="mt-2 text-sm text-gray-500">Scan for participant details</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content - Right Column */}
                    <div className="flex-1">
                        <div className="bg-white shadow rounded-lg">
                            {/* Basic Information */}
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-semibold mb-4 text-gray-900">Basic Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-4">
                                        <div>
                                            {renderField('First Name', 'first_name')}
                                        </div>
                                        <div>
                                            {renderField('Last Name', 'last_name')}
                                        </div>
                                        <div>
                                            {renderField('Preferred Name', 'preferred_name')}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            {renderField('Gender', 'gender')}
                                        </div>
                                        <div>
                                            {renderField('Age', 'age')}
                                        </div>
                                        <div>
                                            {renderField('Birth Date', 'birth_date', 'date')}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            {renderField('T-Shirt Size', 'shirt_size')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-semibold mb-4 text-gray-900">Contact Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        {renderField('Phone Number', 'phone_number')}
                                    </div>
                                    <div>
                                        {renderField('Email', 'email')}
                                    </div>
                                </div>
                            </div>

                            {/* Parent Information */}
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-semibold mb-4">Parent Information</h2>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="50 p-4 rounded-lg">
                                        <h3 className="text-lg font-medium mb-4 text-gray-900">Father's Details</h3>
                                        <div className="space-y-4">
                                            <div>
                                                {renderField('Name', 'father_name')}
                                            </div>
                                            <div>
                                                {renderField('Email', 'father_email')}
                                            </div>
                                            <div>
                                                {renderField('Phone', 'father_phone_number')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-lg">
                                        <h3 className="text-lg font-medium mb-4 text-gray-900">Mother's Details</h3>
                                        <div className="space-y-4">
                                            <div>
                                                {renderField('Name', 'mother_name')}
                                            </div>
                                            <div>
                                                {renderField('Email', 'mother_email')}
                                            </div>
                                            <div>
                                                {renderField('Phone', 'mother_phone_number')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Church Information */}
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-semibold mb-4">Church Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        {renderField('Stake', 'stake_name')}
                                    </div>
                                    <div>
                                        {renderField('Unit', 'unit_name')} 
                                    </div>
                                    <div>
                                        {renderField('Bishop Name', 'bishop_name')}
                                    </div>
                                    <div>
                                        {renderField('Bishop Email', 'bishop_email')}
                                    </div>
                                </div>
                            </div>

                            {/* Health Information */}
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-semibold mb-4">Health Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        {renderField('Medical Information', 'medical_information')}
                                    </div>
                                    <div>
                                        {renderField('Dietary Information', 'dietary_information')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Registration Date */}
                        <div className="mt-6 text-sm text-gray-500">
                            <p>Registration Date: {
                                participant?.registered_date ? format(new Date(participant.registered_date), 'MMMM d, yyyy') : 
                                participant?.date_registered || 'Not available'
                            }</p>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
} 