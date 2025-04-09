import React, { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import ProtectedRoute from '@/components/ProtectedRoute';

export default function UnitsWithWaitingApproval() {
    const [ReportData, setReportData] = useState([]);
    const [participantType, setParticipantType] = useState("Participant");

    const getMenuItems = (item) => [
        {
            label: "Send Reminder",
            action: () => console.log("Send Reminder for", item.unit_name),
        },
        {
            label: "View Registrations",
            action: () => console.log("View Registrations for", item.unit_name),
        }
    ];

    useEffect(() => {
        async function fetchReportData() {
            try {
                const response = await fetch(`/api/units_waiting_approval?participant_type=${participantType}`);
                const result = await response.json();
                setReportData(result.data);
            } catch (error) {
                console.error("Error fetching low registration data:", error);
            }
        }
        fetchReportData();
    }, [participantType]);

    return (
        <ProtectedRoute>
            <div className="p-6 overflow-y-auto bg-white">
                <h1 className="text-3xl font-bold mb-6 text-gray-900">Units with Waiting Approval</h1>

                {/* Participant Type Selection */}
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

                {/* DataTable Component to Display the Data */}
                <DataTable data={ReportData} getMenuItems={getMenuItems} />
            </div>
        </ProtectedRoute>
    );
}
