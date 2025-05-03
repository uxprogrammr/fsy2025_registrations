import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { User } from 'lucide-react';
import ParticipantsModal from '@/components/modals/ParticipantsModal';

export default function Attendances() {
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedEvent, setSelectedEvent] = useState('');
    const [events, setEvents] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedEventDetails, setSelectedEventDetails] = useState(null);
    const [showParticipantsModal, setShowParticipantsModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);

    // Fetch events when day is selected
    useEffect(() => {
        async function fetchEvents() {
            if (!selectedDay) return;
            
            try {
                const response = await fetch(`/api/daily-events?day_number=${selectedDay}`);
                const result = await response.json();
                
                if (result.success) {
                    // Filter events for the selected day
                    const dayEvents = result.data.filter(event => event.day_number === parseInt(selectedDay));
                    setEvents(dayEvents);
                    setSelectedEvent(''); // Reset selected event when day changes
                    setSelectedEventDetails(null);
                }
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        }

        fetchEvents();
    }, [selectedDay]);

    // Fetch attendance data when event is selected
    useEffect(() => {
        async function fetchAttendanceData() {
            if (!selectedEvent) return;
            
            try {
                setLoading(true);
                const response = await fetch(`/api/attendances?event_id=${selectedEvent}`);
                const result = await response.json();
                
                if (result.success) {
                    setAttendanceData(result.data);
                    // Set the selected event details
                    const eventDetails = events.find(e => e.event_id === parseInt(selectedEvent));
                    setSelectedEventDetails(eventDetails);
                }
            } catch (error) {
                console.error('Error fetching attendance data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchAttendanceData();
    }, [selectedEvent, events]);

    // Calculate total attendance percentage
    const calculateAttendancePercentage = () => {
        if (!attendanceData.length) return 0;
        
        const totalPresent = attendanceData
            .filter(item => item.attendance_status === 'Present')
            .reduce((sum, item) => sum + item.total, 0);
            
        const totalAll = attendanceData
            .reduce((sum, item) => sum + item.total, 0);
            
        return totalAll > 0 ? Math.round((totalPresent / totalAll) * 100) : 0;
    };

    // Group attendance data by company and then by group
    const groupedData = attendanceData.reduce((acc, item) => {
        if (!acc[item.company_name]) {
            acc[item.company_name] = {
                company_id: item.company_id,
                company_name: item.company_name,
                groups: {}
            };
        }
        
        if (!acc[item.company_name].groups[item.group_name]) {
            acc[item.company_name].groups[item.group_name] = {
                group_id: item.group_id,
                group_name: item.group_name,
                attendance: {}
            };
        }
        
        acc[item.company_name].groups[item.group_name].attendance[item.attendance_status] = item.total;
        return acc;
    }, {});

    // Calculate attendance status color
    const getAttendanceStatusColor = (group) => {
        const present = group.attendance['Present'] || 0;
        const absent = group.attendance['Absent'] || 0;
        const notSet = group.attendance['Not Set'] || 0;
        const total = present + absent + notSet;

        if (total === 0) return 'bg-gray-100';
        if (present === total) return 'bg-green-100';
        if (absent === total) return 'bg-red-100';
        if (notSet === total) return 'bg-gray-100';
        return 'bg-orange-100';
    };

    const handleCardClick = (company, group) => {
        setSelectedCompany(company);
        setSelectedGroup(group);
        setShowParticipantsModal(true);
    };

    return (
        <ProtectedRoute>
            <div className="flex min-h-screen">
                {/* Sidebar */}
                <div className="w-64 bg-white border-r p-4">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Filters</h2>
                    
                    {/* Day Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Select Day
                        </label>
                        <select
                            value={selectedDay}
                            onChange={(e) => setSelectedDay(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        >
                            <option value="" className="text-gray-900">Select a day</option>
                            {[1, 2, 3, 4, 5].map((day) => (
                                <option key={day} value={day} className="text-gray-900">
                                    Day {day}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Event Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Select Event
                        </label>
                        <select
                            value={selectedEvent}
                            onChange={(e) => setSelectedEvent(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            disabled={!selectedDay}
                        >
                            <option value="" className="text-gray-900">Select an event</option>
                            {events.map((event) => (
                                <option key={event.event_id} value={event.event_id} className="text-gray-900">
                                    Day {event.day_number} - {event.event_name} ({event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Legend */}
                    <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Status Colors</h3>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
                                <span className="text-sm text-gray-600">All Present</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
                                <span className="text-sm text-gray-600">All Absent</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
                                <span className="text-sm text-gray-600">All Not Set</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-orange-100 rounded mr-2"></div>
                                <span className="text-sm text-gray-600">Mixed Status</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Attendance Summary</h1>
                        {selectedEventDetails && (
                            <div className="text-right">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Day {selectedEventDetails.day_number} - {selectedEventDetails.event_name}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {selectedEventDetails.start_time.slice(0, 5)} - {selectedEventDetails.end_time.slice(0, 5)}
                                </p>
                                <p className="text-sm font-medium text-gray-900 mt-1">
                                    Overall Attendance: {calculateAttendancePercentage()}%
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    )}

                    {/* Attendance Cards */}
                    {!loading && selectedEvent && (
                        <div className="space-y-4">
                            {Object.values(groupedData).map((company) => (
                                <div
                                    key={company.company_name}
                                    className="bg-white rounded-lg shadow-md p-4"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        {company.company_name}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.values(company.groups).map((group, index) => (
                                            <div
                                                key={group.group_name}
                                                className={`rounded-lg p-4 ${getAttendanceStatusColor(group)} cursor-pointer hover:shadow-md transition-shadow`}
                                                onClick={() => handleCardClick(company, group)}
                                            >
                                                <div className="flex items-center mb-4">
                                                    <div className={`p-2 rounded-full ${
                                                        index === 0 ? 'bg-blue-100' : 'bg-pink-100'
                                                    }`}>
                                                        <User className={`w-5 h-5 ${
                                                            index === 0 ? 'text-blue-600' : 'text-pink-600'
                                                        }`} />
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900 ml-2">
                                                        {group.group_name}
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    {Object.entries(group.attendance).map(([status, count]) => (
                                                        <div
                                                            key={status}
                                                            className="flex justify-between items-center"
                                                        >
                                                            <span className="text-sm text-gray-900">
                                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                                            </span>
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {count}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* No Data Message */}
                    {!loading && selectedEvent && Object.keys(groupedData).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No attendance data available for this event.
                        </div>
                    )}
                </div>

                {/* Participants Modal */}
                {showParticipantsModal && selectedCompany && selectedGroup && (
                    <ParticipantsModal
                        isOpen={showParticipantsModal}
                        onClose={() => setShowParticipantsModal(false)}
                        eventId={selectedEvent}
                        companyId={selectedCompany.company_id}
                        groupId={selectedGroup.group_id}
                        companyName={selectedCompany.company_name}
                        groupName={selectedGroup.group_name}
                        dayNumber={selectedEventDetails?.day_number}
                        eventName={selectedEventDetails?.event_name}
                        timeRange={`${selectedEventDetails?.start_time.slice(0, 5)} - ${selectedEventDetails?.end_time.slice(0, 5)}`}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
} 