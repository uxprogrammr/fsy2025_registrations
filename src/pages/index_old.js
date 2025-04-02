import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from 'next/dynamic';

const Dashboard = dynamic(() => import('@/pages/dashboard'));
const Participants = dynamic(() => import('@/pages/participants'));
const Counselors = dynamic(() => import('@/pages/counselors'));
const Companies = dynamic(() => import('@/pages/companies'));
const DailyEvents = dynamic(() => import('@/pages/daily-events'));
const UnitsWithLowRegistrations = dynamic(() => import('@/pages/unitswithlowregistrations'));
const UnitsWithWaitingApproval = dynamic(() => import('@/pages/unitswithwaitingapproval'));
const Sidebar = dynamic(() => import('@/pages/sidebar'));
import SignOutButton from '@/components/SignOutButton';
import UserInfo from "../components/UserInfo";
import Menu from "../components/Menu";
import '@/styles/global.css';

export default function Home() {
    const [selectedStake, setSelectedStake] = useState("All Stakes");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [participantType, setParticipantType] = useState("Participant");
    const [selectedMenu, setSelectedMenu] = useState("Dashboard");
    const [activeMenu, setActiveMenu] = useState("Home");
    const router = useRouter();

    const menuItems = [
        { label: 'Home', path: '/dashboard' },
        { label: 'Participants', path: '/participants' },
        { label: 'Counselors', path: '/counselors' },
        { label: 'Companies', path: '/companies' },
        { label: 'Daily Events', path: '/daily-events' }
    ];

    const handleMenuClick = (item) => {
        setActiveMenu(item.label);
        router.push(item.path);  // Navigate to the selected page
    };

    useEffect(() => {
        const currentPath = router.pathname;
        const matchedMenu = menuItems.find(item => item.path === currentPath);
        if (matchedMenu) {
            setActiveMenu(matchedMenu.label);
        }
    }, [router.pathname]);

    return (
        <div className="flex flex-row h-screen">
            <main className="flex-1 p-2 overflow-y-auto bg-white">
                {/* Top Menu Navigation */}
                {activeMenu === "Home" && (
                    <Dashboard
                        selectedStake={selectedStake}
                        participantType={participantType}
                        setParticipantType={setParticipantType}
                    />
                )}
                {activeMenu === "Participants" && <Participants />}
                {activeMenu === "Counselors" && <Counselors />}
                {activeMenu === "Companies" && <Companies />}
                {activeMenu === "Daily Events" && <DailyEvents />}

                {/* Sidebar Navigation for Reports */}
                {selectedMenu === "Units with Low Registrations" && <UnitsWithLowRegistrations />}
                {selectedMenu === "Units with Waiting Approval" && <UnitsWithWaitingApproval />}
            </main>
        </div>
    );
}
