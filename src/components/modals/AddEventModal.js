import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AddEventModal({ isOpen, onClose, dayNumber, onEventAdded }) {
    const [formData, setFormData] = useState({
        event_name: '',
        start_time: '',
        end_time: '',
        description: ''
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.end_time <= formData.start_time) {
            toast.error('End time must be later than start time');
            return;
        }

        try {
            setSaving(true);
            const response = await fetch('/api/daily-events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    day_number: dayNumber
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create event');
            }

            toast.success('Event created successfully');
            onEventAdded?.();
            onClose();
            // Reset form data
            setFormData({
                event_name: '',
                start_time: '',
                end_time: '',
                description: ''
            });
        } catch (error) {
            console.error('Error creating event:', error);
            toast.error(error.message || 'Failed to create event');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Add Event for Day {dayNumber}</h2>
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
                            {saving ? 'Saving...' : 'Save Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 