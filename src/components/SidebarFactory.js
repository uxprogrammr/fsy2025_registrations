// components/SidebarFactory.js
import CounselorSidebar from "./sidebars/CounselorSidebar";
import DashboardSidebar from "./sidebars/DashboardSidebar";
import ParticipantSidebar from "./sidebars/ParticipantSidebar";

export default function SidebarFactory({ currentPage, onApplyFilter, ...props }) {
    // Add console log to debug
    console.log('SidebarFactory props:', { currentPage, hasOnApplyFilter: !!onApplyFilter });

    switch (currentPage) {
        case "dashboard":
            return <DashboardSidebar {...props} />;
        case "participants":
            return <ParticipantSidebar onApplyFilter={onApplyFilter} {...props} />;
        case "counselors":
            return <CounselorSidebar onApplyFilter={onApplyFilter} {...props} />;
        default:
            return null;
    }
}
