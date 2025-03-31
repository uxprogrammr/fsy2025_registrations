import { Menu, X } from "lucide-react";

const stakes = [
    "All Stakes",
    "Antique Philippines District",
    "Kalibo Philippines Stake",
    "Pandan Philippines District",
    "Roxas Capiz Philippines Stake",
    "Other Stakes/Districts"
];

export default function Sidebar({ selectedStake, setSelectedStake, isSidebarOpen, setIsSidebarOpen }) {
    return (
        <aside className={`bg-white shadow-lg p-4 transition-all duration-300 ${isSidebarOpen ? "min-w-[250px] w-64" : "min-w-[60px] w-20"} overflow-hidden`}>
            {/* Sidebar Toggle Button */}
            <button
                className="mb-4 p-2 bg-gray-200 rounded-lg flex items-center justify-center"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X size={24} className="text-black" /> : <Menu size={24} className="text-black" />}
            </button>

            <h2 className={`text-xl font-bold mb-4 text-black transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 hidden"}`}>
                Filter by Stake
            </h2>

            <ul className="space-y-2">
                {stakes.map((stake) => {
                    return (
                        <li key={stake}>
                            <button
                                onClick={() => setSelectedStake(stake)}
                                className={`w-full text-left p-2 rounded-lg text-black ${selectedStake === stake ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                            >
                                {isSidebarOpen ? stake : stake.split(" ")[0]}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
}
