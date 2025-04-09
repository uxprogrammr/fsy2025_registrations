// _app.js
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { ParticipantProvider } from '@/context/ParticipantContext';
import { DashboardProvider } from '@/context/DashboardContext';
import { CounselorProvider } from '@/context/CounselorContext';
import { Toaster } from 'react-hot-toast';
import { CompanyFilterProvider } from '@/context/CompanyFilterContext';

export default function MyApp({ Component, pageProps }) {
    const router = useRouter();
    const [selectedStake, setSelectedStake] = useState("All Stakes");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [participantType, setParticipantType] = useState("Participant");
    const [selectedMenu, setSelectedMenu] = useState("Dashboard");
    const [activeMenu, setActiveMenu] = useState("Home");
    const [participantsData, setParticipantsData] = useState([]);
    const [counselorsData, setCounselorsData] = useState([]);

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
            const pagePrefix = router.pathname.split('/')[1];
            if (pagePrefix === 'participants') {
                setParticipantsData(filterResult.data);
            } else if (pagePrefix === 'counselors') {
                setCounselorsData(filterResult.data);
            }
        }
    }, [router.pathname]);

    // Get the context provider
    const pagePrefix = router.pathname.split('/')[1];
    const ContextProvider = contextMap[pagePrefix] || (({ children }) => <>{children}</>);

    return (
        <SessionProvider session={pageProps.session}>
            <CompanyFilterProvider>
                <Toaster 
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#333',
                            color: '#fff',
                        },
                        success: {
                            style: {
                                background: '#22c55e',
                            },
                        },
                        error: {
                            style: {
                                background: '#ef4444',
                            },
                            duration: 4000,
                        },
                    }}
                />
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
                            counselorsData={counselorsData}
                        />
                    </ContextProvider>
                </Layout>
            </CompanyFilterProvider>
        </SessionProvider>
    );
}
