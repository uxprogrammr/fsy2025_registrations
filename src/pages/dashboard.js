import { useEffect, useState } from "react";
import { LineGraph, BarGraph, PieGraph } from "@/components/Charts";
import '@/app/globals.css';


export default function Dashboard() {
    const [data, setData] = useState({
        age_distribution: [],
        gender_distribution: [],
        registration_status_breakdown: [],
        shirt_size_distribution: [],
        weekly_registration_growth: [],
        stake_participants: [],
        unit_participants: [],
    });

    const [selectedStake, setSelectedStake] = useState("");

    const [participantType, setParticipantType] = useState("Participant");

    const stakes = [
        "All Stakes",
        "Antique Philippines District",
        "Kalibo Philippines Stake",
        "Pandan Philippines District",
        "Quezon City Philippines South Stake",
        "Roxas Capiz Philippines Stake",
    ];

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(
                    `/api/dashboard?participant_type=${participantType}&stake_name=${selectedStake}`
                );
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        }
        fetchData();
    }, [participantType, selectedStake]); // Re-fetch data when parameters change

    return (
        <div className="flex flex-row h-screen"> {/* ✅ flex-row ensures left-right layout */}
            <aside className="w-1/4 lg:w-1/5 bg-white shadow-lg p-4 flex-shrink-0">
                <h2 className="text-xl font-bold mb-4 text-black">Filter by Stake/District</h2>
                <ul className="space-y-2">
                    {stakes.map((stake) => (
                        <li key={stake}>
                            <button
                                onClick={() => setSelectedStake(stake)}
                                className={`w-full text-left p-2 rounded-lg text-black ${selectedStake === stake ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
                                    }`}
                            >
                                {stake}
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Right Content (70%) */}
            <main className="flex-1 p-6 overflow-y-auto bg-white">
                <h1 className="text-3xl font-bold mb-6 text-gray-900">Dashboard</h1>

                {selectedStake != "All Stakes" ? (
                    <div>
                        <BarGraph
                            data={data.unit_participants}
                            dataName="unit_name"
                            dataKey="total_registrants"
                            title={`${selectedStake} Participants`}
                            xAxisLabel="Unit Name"
                            yAxisLabel="Total Registrants"
                            showGrid={false}
                            showLegend={false}
                            showLabels={true}
                            showXAxisLabel={false}
                            showYAxisLabel={true}
                            barColor="#3498db"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 mb-6">
                        <BarGraph
                            data={data.stake_participants}
                            dataName="stake_name"
                            dataKey="total_registrants"
                            title="Stake Participants"
                            xAxisLabel="Stake Name"
                            yAxisLabel="Total Registrants"
                            showGrid={false}
                            showLegend={false}
                            showLabels={true}
                            showXAxisLabel={false}
                            showYAxisLabel={true}
                            barColor="#3498db"
                        />
                    </div>
                )}

                <div className="grid grid-cols-5 gap-4">
                    <div className="col-span-3">
                        <BarGraph
                            data={data.age_distribution}
                            dataName="youth"
                            dataKey="total_registrants"
                            title="Age Distribution"
                            xAxisLabel="Youth"
                            yAxisLabel="Total Registrants"
                            showGrid={false}
                            showLegend={false}
                            showLabels={true}
                            showXAxisLabel={false}
                            showYAxisLabel={true}
                            barColor="#3498db"
                            graphWidth="100%"
                        />
                    </div>
                    <div className="col-span-2">
                        <PieGraph
                            data={data.gender_distribution}
                            dataKey="total_registrants"
                            dataName="gender"
                            title="Gender Distribution"
                            colors={["#3498db", "#e74c3c"]}
                            showLegend={true}
                            showLabels={true}
                            outerRadius={120}
                            graphWidth="100%"
                            graphHeight={400}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                        <BarGraph
                            data={data.registration_status_breakdown}
                            dataName="status"
                            dataKey="total_registrants"
                            title="Registration Status Breakdown"
                            xAxisLabel="Status"
                            yAxisLabel="Total Registrants"
                            showGrid={false}
                            showLegend={false}
                            showLabels={true}
                            showXAxisLabel={false}
                            showYAxisLabel={true}
                            barColor="#3498db"
                            graphWidth="100%"
                        />
                    </div>
                    <div className="col-span-1">
                        <LineGraph
                            data={data.weekly_registration_growth}
                            dataName="fsy_week_number"
                            dataKey="total_registrations"
                            title="Weekly Registration Growth"
                            lineColor="#3498db"
                            showGrid={false}
                            showLegend={false}
                            showLabels={true}
                            showXAxisLabel={false}
                            lineType="linear"
                            graphWidth="100%"
                            graphHeight={300}
                        />
                    </div>
                </div>
            </main>


        </div>
    );
}
