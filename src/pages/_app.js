// _app.js
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { ParticipantProvider } from '@/context/ParticipantContext';
import { DashboardProvider } from '@/context/DashboardContext';
import { CounselorProvider } from '@/context/CounselorContext';
import '@/styles/global.css';

export default function MyApp({ Component, pageProps }) {
    const router = useRouter();
    const [selectedStake, setSelectedStake] = useState("All Stakes");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [participantType, setParticipantType] = useState("Participant");
    const [selectedMenu, setSelectedMenu] = useState("Dashboard");
    const [activeMenu, setActiveMenu] = useState("Home");
    const [participantsData, setParticipantsData] = useState([]);

    // Define the mapping of page prefixes to their context providers
    const contextMap = {
        participants: ParticipantProvider,
        dashboard: DashboardProvider,
        counselors: CounselorProvider,
        companies: ({ children }) => <>{children}</>,
        'daily-events': ({ children }) => <>{children}</>,
    };

    // Handle filter application
    const handleFilterApply = useCallback((filterResult) => {
        console.log('Filter applied in _app.js:', filterResult);
        if (filterResult?.success && Array.isArray(filterResult.data)) {
            setParticipantsData(filterResult.data);
        }
    }, []);

    // Get the context provider
    const pagePrefix = router.pathname.split('/')[1];
    const ContextProvider = contextMap[pagePrefix] || (({ children }) => <>{children}</>);

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
            onFilterApply={handleFilterApply}
        >
            <ContextProvider>
                <Component
                    {...pageProps}
                    selectedStake={selectedStake}
                    participantType={participantType}
                    setParticipantType={setParticipantType}
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                    participantsData={participantsData}
                />
            </ContextProvider>
        </Layout>
    );
}
