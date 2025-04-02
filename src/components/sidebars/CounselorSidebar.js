// components/sidebars/participantsSidebar.js
import { Menu, X, Search } from "lucide-react";

export default function CounselorsSidebar({ isSidebarOpen, setIsSidebarOpen }) {
    return (
        <aside className={`bg-white shadow-lg p-4 transition-all duration-300 ${isSidebarOpen ? "min-w-[250px] w-64" : "min-w-[60px] w-20"} overflow-hidden`}>
            <button
                className="mb-4 p-2 bg-gray-200 rounded-lg flex items-center justify-center"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X size={24} className="text-black" /> : <Menu size={24} className="text-black" />}
            </button>

            <h2 className="text-xl font-bold mb-4 text-black">Search Counselors</h2>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by name"
                    className="w-full p-2 border rounded"
                />
            </div>

            <h2 className="text-xl font-bold mb-4 text-black">Filter Options</h2>
            <div className="mb-4">
                <select className="w-full p-2 border rounded">
                    <option value="">Select Stake</option>
                    <option value="Kalibo">Kalibo Stake</option>
                    <option value="Antique">Antique District</option>
                </select>
            </div>
            <div className="mb-4">
                <select className="w-full p-2 border rounded">
                    <option value="">Select Unit</option>
                    <option value="Unit1">Unit 1</option>
                    <option value="Unit2">Unit 2</option>
                </select>
            </div>
        </aside>
    );
}
