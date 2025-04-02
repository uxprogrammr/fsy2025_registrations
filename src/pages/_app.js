// _app.js
import { useState } from 'react';
import Layout from '@/components/Layout';
import '@/styles/global.css';

export default function MyApp({ Component, pageProps }) {
    const [selectedStake, setSelectedStake] = useState("All Stakes");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [participantType, setParticipantType] = useState("Participant");
    const [selectedMenu, setSelectedMenu] = useState("Dashboard");
    const [activeMenu, setActiveMenu] = useState("Home");
    const [participants, setParticipants] = useState([]);

    const handleApplyFilter = async (filter) => {
        try {
            const { selectedStake, selectedUnit, registrationStatus } = filter;
            const response = await fetch(`/api/participants?stake_name=${selectedStake}&unit_name=${selectedUnit}&status=${registrationStatus}`);
            const result = await response.json();
            setParticipants(result.data);
        } catch (error) {
            console.error("Error fetching participants:", error);
        }
    };

    return (
        <Layout
            selectedStake={selectedStake}
            setSelectedStake={setSelectedStake}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            selectedMenu={selectedMenu}
            setSelectedMenu={setSelectedMenu}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            onApplyFilter={handleApplyFilter} // Pass the function here
        >
            <Component
                {...pageProps}
                selectedStake={selectedStake}
                participantType={participantType}
                setParticipantType={setParticipantType}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                onApplyFilter={handleApplyFilter} // Pass it to the component as well
                participants={participants} // Pass participants as props
            />
        </Layout>
    );
}
