import { useState } from "react";
import Dashboard from "@/pages/Dashboard";
import Sidebar from "@/pages/Sidebar";
import '@/styles/global.css';

export default function Home() {
    const [selectedStake, setSelectedStake] = useState("All Stakes");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [participantType, setParticipantType] = useState("Participant");

    return (
        <div className="flex flex-row h-screen">
            <Sidebar
                selectedStake={selectedStake}
                setSelectedStake={setSelectedStake}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />
            <Dashboard
                selectedStake={selectedStake}
                participantType={participantType}
                setParticipantType={setParticipantType}
            />
        </div>
    );
}
