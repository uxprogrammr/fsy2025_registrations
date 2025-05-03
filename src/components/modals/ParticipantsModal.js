import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ParticipantsModal({ isOpen, onClose, eventId, companyId, groupId, companyName, groupName, dayNumber, eventName, timeRange }) {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchParticipants() {
            if (!isOpen || !companyId || !groupId) return;

            try {
                setLoading(true);
                const response = await fetch(`/api/company/members?company_id=${companyId}&group_id=${groupId}&event_id=${eventId}`);
                const result = await response.json();

                if (result.success) {
                    setParticipants(result.data);
                }
            } catch (error) {
                console.error('Error fetching participants:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchParticipants();
    }, [isOpen, companyId, groupId, eventId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-xl w-[1000px] max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {companyName} - {groupName}
                        </h2>
                        <p className="text-sm text-gray-500">Member Attendance</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">Day {dayNumber} - {eventName} ({timeRange})</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <>
                         
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant Type</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stake Name</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Name</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {participants.map((participant) => (
                                        <tr key={participant.fsy_id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                {participant.full_name}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                {participant.participant_type}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                {participant.stake_name}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                {participant.unit_name}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    participant.attendance_status === 'Present' ? 'bg-green-100 text-green-800' :
                                                    participant.attendance_status === 'Absent' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {participant.attendance_status || 'Not Set'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
} 