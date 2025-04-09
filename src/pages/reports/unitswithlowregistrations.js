import React, { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import ReminderModal from "@/components/ReminderModal";
import RegistrantModal from "@/components/RegistrantModal";
import ProtectedRoute from '@/components/ProtectedRoute';

export default function UnitsWithLowRegistrations() {
    const [lowRegistrationData, setLowRegistrationData] = useState([]);
    const [participantType, setParticipantType] = useState("Participant");
    const [selectedRow, setSelectedRow] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRegistrantModalOpen, setIsRegistrantModalOpen] = useState(false);
    const [registrantData, setRegistrantData] = useState([]);

    const getMenuItems = (item) => [
        {
            label: "Send Reminder",
            action: () => handleSendReminder(item),
        },
        {
            label: "View Registrations",
            action: () => handleViewRegistrants(participantType, item),
        }
    ];

    const handleSendReminder = (item) => {
        setSelectedRow(item);
        setIsModalOpen(true);
    };

    const handleViewRegistrants = async (participantType, item) => {
        try {
            const response = await fetch(`/api/get_registrants_by_unit?participant_type=${participantType}&unit_name=${item.unit_name}`);
            const result = await response.json();
            setRegistrantData(result.data);
            setSelectedRow(item);
            setIsRegistrantModalOpen(true);
        } catch (error) {
            console.error("Error fetching registrants:", error);
        }
    };

    useEffect(() => {
        async function fetchLowRegistrations() {
            try {
                const response = await fetch(`/api/units_low_registrations?participant_type=${participantType}`);
                const result = await response.json();
                setLowRegistrationData(result.data);
            } catch (error) {
                console.error("Error fetching low registration data:", error);
            }
        }
        fetchLowRegistrations();
    }, [participantType]);

    return (
        <ProtectedRoute>
            <div className="p-6 overflow-y-auto bg-white">
                <h1 className="text-3xl font-bold mb-6 text-gray-900">Units with Low Registrations</h1>

                <div className="mb-6">
                    <label className="text-lg font-semibold text-gray-700 mb-2">Select Participant Type:</label>
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center text-gray-700">
                            <input
                                type="radio"
                                name="participantType"
                                value="Participant"
                                checked={participantType === "Participant"}
                                onChange={(e) => setParticipantType(e.target.value)}
                                className="mr-2"
                            />
                            Participant
                        </label>
                        <label className="flex items-center text-gray-700">
                            <input
                                type="radio"
                                name="participantType"
                                value="Counselor"
                                checked={participantType === "Counselor"}
                                onChange={(e) => setParticipantType(e.target.value)}
                                className="mr-2"
                            />
                            Counselor
                        </label>
                    </div>
                </div>

                <DataTable data={lowRegistrationData} getMenuItems={getMenuItems} />

                {isModalOpen && selectedRow && (
                    <ReminderModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        stakeName={selectedRow.stake_name}
                        unitName={selectedRow.unit_name}
                        leaderName={selectedRow.leader_name}
                        leaderPhone={selectedRow.leader_phone}
                        leaderEmail={selectedRow.leader_email}
                    />
                )}

                {isRegistrantModalOpen && (
                    <RegistrantModal
                        isOpen={isRegistrantModalOpen}
                        onClose={() => setIsRegistrantModalOpen(false)}
                        registrants={registrantData}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
}
