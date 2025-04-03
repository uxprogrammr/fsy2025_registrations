// components/Layout.js
import SidebarFactory from "@/components/SidebarFactory";
import SignOutButton from '@/components/SignOutButton';
import UserInfo from "../components/UserInfo";
import Menu from "../components/Menu";
import { useRouter } from 'next/router';

export default function Layout({ children, selectedStake, setSelectedStake, isSidebarOpen, setIsSidebarOpen, selectedMenu, setSelectedMenu, activeMenu, setActiveMenu, onFilterApply }) {
    const router = useRouter();
    const currentPage = router.pathname.split('/')[1]; // Get the current page from the URL

    // Check if the current page requires authentication
    const noAuthPages = ["/login", "/counselor-signup", "/participant-signup"];
    const isAuthenticated = !noAuthPages.includes(router.pathname);

    // Add console log to debug
    console.log('Layout props:', { 
        currentPage, 
        hasOnFilterApply: !!onFilterApply 
    });

    const menuItems = [
        { label: 'Home', path: '/dashboard' },
        { label: 'Participants', path: '/participants' },
        { label: 'Counselors', path: '/counselors' },
        { label: 'Company', path: '/company' },
        { label: 'Daily Events', path: '/daily-events' },
        { label: 'Attendances', path: '/attendances' },
        {
            label: 'Reports',
            subItems: [
                { label: 'Units with Low Registrations', path: '/reports/unitswithlowregistrations' },
                { label: 'Units with Waiting Approval', path: '/reports/unitswithwaitingapproval' }
            ]
        }
    ];

    const handleMenuClick = (item) => {
        setActiveMenu(item.label);
        router.push(item.path);
    };

    return (
        <div className="flex flex-row h-screen">
            {isAuthenticated && (
                <SidebarFactory
                    currentPage={currentPage}
                    selectedStake={selectedStake}
                    setSelectedStake={setSelectedStake}
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    selectedMenu={selectedMenu}
                    setSelectedMenu={setSelectedMenu}
                    onApplyFilter={onFilterApply}
                />
            )}
            <main className="flex-1 p-2 overflow-y-auto bg-white">
                {isAuthenticated && (
                    <div className="flex justify-between items-center mb-4">
                        <UserInfo />
                        <Menu items={menuItems} activeItem={activeMenu} onItemClick={handleMenuClick} />
                        <SignOutButton />
                    </div>
                )}
                {children}
            </main>
        </div>
    );
}
