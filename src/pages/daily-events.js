import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AddEventModal from '@/components/modals/AddEventModal';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import { toast } from 'react-hot-toast';

export default function DailyEvents() {
    const [showAddEventModal, setShowAddEventModal] = useState(false);
    const [selectedDayForModal, setSelectedDayForModal] = useState(null);
    const [events, setEvents] = useState([]);
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        eventId: null,
        eventName: ''
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await fetch('/api/daily-events');
            const result = await response.json();

            if (result.success) {
                setEvents(result.data);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Failed to load events');
        }
    };

    const handleAddEvent = (dayNumber) => {
        setSelectedDayForModal(dayNumber);
        setShowAddEventModal(true);
    };

    const openDeleteModal = (event) => {
        setDeleteModal({
            isOpen: true,
            eventId: event.event_id,
            eventName: event.event_name
        });
    };

    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            eventId: null,
            eventName: ''
        });
    };

    const handleEventDelete = async () => {
        try {
            const response = await fetch(`/api/daily-events/${deleteModal.eventId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete event');
            }

            toast.success('Event deleted successfully');
            fetchEvents();
            closeDeleteModal();
        } catch (error) {
            console.error('Error deleting event:', error);
            toast.error('Failed to delete event');
        }
    };

    const groupEventsByDay = (events) => {
        const grouped = {};
        for (let i = 1; i <= 7; i++) {
            grouped[i] = {
                morning: events.filter(e => e.day_number === i && e.start_time < '12:00'),
                afternoon: events.filter(e => e.day_number === i && e.start_time >= '12:00' && e.start_time < '17:00'),
                evening: events.filter(e => e.day_number === i && e.start_time >= '17:00')
            };
        }
        return grouped;
    };

    const groupedEvents = groupEventsByDay(events);

    return (
        <ProtectedRoute>
            <div className="container mx-auto px-4 py-6">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold">Daily Events</h1>
                </div>

                <div className="space-y-4">
                    {Object.entries(groupedEvents).map(([day, periods]) => (
                        <div key={day} className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-xl font-bold">Day {day}</h2>
                                <button
                                    onClick={() => handleAddEvent(Number(day))}
                                    className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="grid gap-3">
                                {['morning', 'afternoon', 'evening'].map((period) => (
                                    <div key={period}>
                                        <h3 className={`text-base font-semibold mb-2 ${
                                            period === 'morning' ? 'text-blue-600' :
                                            period === 'afternoon' ? 'text-yellow-600' :
                                            'text-purple-600'
                                        }`}>
                                            {period.charAt(0).toUpperCase() + period.slice(1)}
                                        </h3>
                                        <div className="space-y-2">
                                            {periods[period].length > 0 ? (
                                                periods[period].map((event) => (
                                                    <div
                                                        key={event.event_id}
                                                        className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded border border-gray-200"
                                                    >
                                                        <div className="flex-1 grid grid-cols-3 gap-3">
                                                            <div className="font-medium text-gray-900 text-sm">
                                                                {event.event_name}
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                {event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {event.description || 'No description'}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => openDeleteModal(event)}
                                                            className="ml-2 p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500 py-1">
                                                    No {period} events scheduled
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <AddEventModal
                    isOpen={showAddEventModal}
                    onClose={() => setShowAddEventModal(false)}
                    dayNumber={selectedDayForModal}
                    onEventAdded={fetchEvents}
                />

                <DeleteConfirmationModal
                    isOpen={deleteModal.isOpen}
                    onClose={closeDeleteModal}
                    onConfirm={handleEventDelete}
                    eventName={deleteModal.eventName}
                />
            </div>
        </ProtectedRoute>
    );
}
