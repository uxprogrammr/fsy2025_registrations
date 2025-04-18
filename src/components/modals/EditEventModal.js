import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function EditEventModal({ isOpen, onClose, event, onEventEdited }) {
    const [formData, setFormData] = useState({
        event_name: '',
        start_time: '',
        end_time: '',
        description: '',
        attendance_required: false
    });
    const [saving, setSaving] = useState(false);

    // Correctly update form data when event prop changes
    useEffect(() => {
        if (event) {
            setFormData({
                event_name: event.event_name || '',
                start_time: event.start_time?.slice(0, 5) || '', // Format time to HH:mm
                end_time: event.end_time?.slice(0, 5) || '', // Format time to HH:mm
                description: event.description || '',
                attendance_required: event.attendance_required === 'Y'
            });
        }
    }, [event]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.end_time <= formData.start_time) {
            toast.error('End time must be later than start time');
            return;
        }

        try {
            setSaving(true);
            const response = await fetch(`/api/daily-events/${event.event_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    attendance_required: formData.attendance_required ? 'Y' : 'N',
                    day_number: event.day_number
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update event');
            }

            toast.success('Event updated successfully');
            onEventEdited?.();
            onClose();
        } catch (error) {
            console.error('Error updating event:', error);
            toast.error(error.message || 'Failed to update event');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Edit Event</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Event Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Event Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.event_name}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    event_name: e.target.value
                                }))}
                                className="w-full px-3 py-2 border rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter event name"
                            />
                        </div>

                        {/* Time Selection */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Time *
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={formData.start_time}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        start_time: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Time *
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={formData.end_time}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        end_time: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    description: e.target.value
                                }))}
                                rows="3"
                                className="w-full px-3 py-2 border rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter event description (optional)"
                            />
                        </div>

                        {/* Add Attendance Required checkbox before the buttons */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="attendance_required_edit"
                                checked={formData.attendance_required}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    attendance_required: e.target.checked
                                }))}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="attendance_required_edit" className="ml-2 block text-sm text-gray-700">
                                Attendance Required
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className={`px-4 py-2 rounded ${
                                saving
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 