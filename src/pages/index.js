import { useState } from "react";
import Dashboard from "@/pages/Dashboard";
import Sidebar from "@/pages/Sidebar";
import UnitsWithLowRegistrations from "@/pages/UnitsWithLowRegistrations";
import UnitsWithWaitingApproval from "@/pages/UnitsWithWaitingApproval";
import '@/styles/global.css';

export default function Home() {
    const [selectedStake, setSelectedStake] = useState("All Stakes");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [participantType, setParticipantType] = useState("Participant");
    const [selectedMenu, setSelectedMenu] = useState("Dashboard"); // New state to track selected menu

    return (
        <div className="flex flex-row h-screen">
            <Sidebar
                selectedStake={selectedStake}
                setSelectedStake={setSelectedStake}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                selectedMenu={selectedMenu}
                setSelectedMenu={setSelectedMenu} // Pass new state and setter
            />
            {selectedMenu === "Dashboard" ? (
                <Dashboard
                    selectedStake={selectedStake}
                    participantType={participantType}
                    setParticipantType={setParticipantType}
                />
            ) : selectedMenu === "Units with Low Registrations" ? (
                <UnitsWithLowRegistrations participantType={participantType} />
            ) : selectedMenu === "Units with Waiting Approval" ? (
                <UnitsWithWaitingApproval participantType={participantType} />
            ) : (
                <div className="p-4">Report Not Found</div>
            )}
        </div>
    );
}
