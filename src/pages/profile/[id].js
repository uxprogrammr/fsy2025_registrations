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
    const [integrityIssues, setIntegrityIssues] = useState([]);
    const [registrationStatus, setRegistrationStatus] = useState('');

    useEffect(() => {
        async function fetchParticipant() {
            if (!id) return;

            try {
                setLoading(true);
                const response = await fetch(`/api/profiles/${id}`);
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

    useEffect(() => {
        if (participant) {
            const issues = checkDataIntegrity(participant);
            checkDuplicateRegistration(participant).then(duplicates => {
                if (duplicates.length > 0) {
                    issues.push({
                        type: 'error',
                        message: 'Possible duplicate registration found',
                        details: duplicates
                    });
                }
                setIntegrityIssues(issues);
            });
        }
    }, [participant]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const statusFromUrl = urlParams.get('status');
        if (statusFromUrl) {
            setRegistrationStatus(statusFromUrl);
        }
    }, []);

    const handleEdit = () => {
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
            medical_information: participant.medical_information,
            dietary_information: participant.dietary_information
            // Exclude Church Information fields here
        };
    
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

            const response = await fetch(`/api/profiles/${id}/update`, {
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
            const updatedResponse = await fetch(`/api/profiles/${id}`);
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
    
        // Render Gender as Radio Buttons
        if (field === 'gender') {
            if (isEditing) {
                return (
                    <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                        <div className="flex gap-4 items-center">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="Male"
                                    checked={value === 'Male'}
                                    onChange={(e) => handleChange(field, e.target.value)}
                                    className="form-radio text-blue-600 h-4 w-4"
                                />
                                <span className="text-gray-700">Male</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="Female"
                                    checked={value === 'Female'}
                                    onChange={(e) => handleChange(field, e.target.value)}
                                    className="form-radio text-blue-600 h-4 w-4"
                                />
                                <span className="text-gray-700">Female</span>
                            </label>
                        </div>
                    </div>
                );
            } else {
                // Display gender as text in view mode
                return (
                    <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                        <div className="text-gray-900 px-3 py-2 bg-gray-50 border border-gray-300 rounded">
                            {value || 'Not provided'}
                        </div>
                    </div>
                );
            }
        }
    
        // Render T-Shirt Size as a ComboBox (Select)
        if (isEditing && field === 'shirt_size') {
            const shirtSizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
            return (
                <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <select
                        value={value || ''}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="w-full px-3 py-2 text-black bg-white border border-gray-300 rounded"
                    >
                        <option value="" disabled>Select T-Shirt Size</option>
                        {shirtSizes.map((size) => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
            );
        }

        // Render Status as a ComboBox (Select)
        if (field === 'status') {
            const statuses = ["Awaiting Approval", "Approved", "Cancelled"];
            return (
                <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    {isEditing ? (
                        <select
                            value={editedData[field] !== undefined ? editedData[field] : participant[field] || ''}
                            onChange={(e) => handleChange(field, e.target.value)}
                            className="w-full px-3 py-2 text-black bg-white border border-gray-300 rounded"
                        >
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div className="text-gray-900 px-3 py-2 bg-gray-50 border border-gray-300 rounded">
                            {participant[field] || 'Not provided'}
                        </div>
                    )}
                </div>
            );
        }



    
        // Default field rendering
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
                    <div className="text-gray-900 px-3 py-2 bg-gray-50 border border-gray-300 rounded">
                        {type === 'date' && value ? 
                            new Date(value).toLocaleDateString() : 
                            value || 'Not provided'}
                    </div>
                )}
            </div>
        );
    };
    
    

    

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return email ? emailRegex.test(email) : false;
    };

    const checkDataIntegrity = (data) => {
        const issues = [];

        // Check contact details
        if (!data.phone_number && !data.email) {
            issues.push({
                type: 'error',
                message: 'No contact information provided. Either phone number or email is required.'
            });
        }

        // Check email formats
        if (data.email && !validateEmail(data.email)) {
            issues.push({
                type: 'error',
                message: 'Invalid participant email format'
            });
        }
        if (data.father_email && !validateEmail(data.father_email)) {
            issues.push({
                type: 'error',
                message: 'Invalid father\'s email format'
            });
        }
        if (data.mother_email && !validateEmail(data.mother_email)) {
            issues.push({
                type: 'error',
                message: 'Invalid mother\'s email format'
            });
        }
        if (data.bishop_email && !validateEmail(data.bishop_email)) {
            issues.push({
                type: 'error',
                message: 'Invalid bishop\'s email format'
            });
        }

        // Check required fields
        const requiredFields = {
            first_name: 'First Name',
            last_name: 'Last Name',
            gender: 'Gender',
            birth_date: 'Birth Date',
            stake_name: 'Stake Name',
            unit_name: 'Unit Name'
        };

        Object.entries(requiredFields).forEach(([field, label]) => {
            if (!data[field]) {
                issues.push({
                    type: 'warning',
                    message: `${label} is missing`
                });
            }
        });

        // Check parent information
        if (!data.father_name && !data.mother_name) {
            issues.push({
                type: 'warning',
                message: 'No parent information provided'
            });
        }

        return issues;
    };

    const checkDuplicateRegistration = async (data) => {
        try {
            const response = await fetch(`/api/profiles/check-duplicate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: data.email,
                    phone_number: data.phone_number,
                    exclude_id: data.fsy_id // Exclude current profile when checking
                }),
            });
            
            const result = await response.json();
            return result.duplicates || [];
        } catch (error) {
            console.error('Error checking duplicates:', error);
            return [];
        }
    };

    const DataIntegrityWarnings = ({ issues }) => {
        if (!issues.length) return null;

        return (
            <div className="mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-semibold mb-2">Data Integrity Issues</h3>
                    <div className="space-y-2">
                        {issues.map((issue, index) => (
                            <div 
                                key={index} 
                                className={`p-3 rounded ${
                                    issue.type === 'error' 
                                        ? 'bg-red-50 text-red-700 border border-red-200' 
                                        : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                }`}
                            >
                                <div className="flex items-center">
                                    {issue.type === 'error' ? (
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    <span>{issue.message}</span>
                                </div>
                                {issue.details && (
                                    <div className="mt-2 text-sm">
                                        {issue.details.map((detail, idx) => (
                                            <div key={idx} className="ml-7">
                                                • FSY ID: {detail.fsy_id}, Name: {detail.first_name} {detail.last_name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

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
            // Only append status if it's not empty
            if (registrationStatus && registrationStatus !== '') {
                params.append('status', registrationStatus);
                console.log('[DEBUG] Applying status filter:', registrationStatus);
            }

            const queryString = params.toString();
            console.log('[DEBUG] Query params:', queryString);
            
            const url = `/api/counselors${queryString ? `?${queryString}` : ''}`;
            const response = await fetch(url);
            const result = await response.json();
            
            if (typeof onApplyFilter === 'function') {
                onApplyFilter(result);
            }
        } catch (error) {
            console.error('[DEBUG] Error:', error);
            setError('Failed to apply filters. Please try again.');
        } finally {
            setLoading(false);
        }
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
                    <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
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

                <DataIntegrityWarnings issues={integrityIssues} />

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
                                            <div>
                                                {renderField('Status', 'status')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-semibold mb-4 text-gray-900">Contact Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stake</label>
                                        <div className="text-gray-900 px-3 py-2 bg-gray-50 border border-gray-300 rounded">
                                            {participant?.stake_name || 'Not provided'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                        <div className="text-gray-900 px-3 py-2 bg-gray-50 border border-gray-300 rounded">
                                            {participant?.unit_name || 'Not provided'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bishop Name</label>
                                        <div className="text-gray-900 px-3 py-2 bg-gray-50 border border-gray-300 rounded">
                                            {participant?.bishop_name || 'Not provided'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bishop Email</label>
                                        <div className="text-gray-900 px-3 py-2 bg-gray-50 border border-gray-300 rounded">
                                            {participant?.bishop_email || 'Not provided'}
                                        </div>
                                    </div>
                                </div>
                            </div>



                            {/* Health Information */}
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-semibold mb-4">Health Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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