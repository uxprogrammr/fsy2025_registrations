// components/SidebarFactory.js
import MemberSidebar from "./sidebars/MemberSidebar";
import DashboardSidebar from "./sidebars/DashboardSidebar";
import ParticipantSidebar from "./sidebars/ParticipantSidebar";
import CompanySidebar from "./sidebars/CompanySidebar";

export default function SidebarFactory({ currentPage, onApplyFilter, ...props }) {
    switch (currentPage) {
        case "dashboard":
            return <DashboardSidebar {...props} />;
        case "participants":
            return <ParticipantSidebar onApplyFilter={onApplyFilter} {...props} />;
        case "members":
            return <MemberSidebar onApplyFilter={onApplyFilter} {...props} />;
        case "company":
            return <CompanySidebar onApplyFilter={onApplyFilter} {...props} />;
        default:
            return null;
    }
}
