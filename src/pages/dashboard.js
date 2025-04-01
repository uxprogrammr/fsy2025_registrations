import { useEffect, useState } from "react";
import { LineGraph, BarGraph, PieGraph } from "@/components/Charts";
import { WordCloudChart } from "@/components/WordCloud";
import ProtectedRoute from '@/components/ProtectedRoute';
import SignOutButton from '@/components/SignOutButton';
import UserInfo from "../components/UserInfo";
import '@/styles/global.css';

export default function Dashboard({ selectedStake, participantType, setParticipantType }) {
    const [data, setData] = useState({
        age_distribution: [],
        gender_distribution: [],
        registration_status_breakdown: [],
        shirt_size_distribution: [],
        weekly_registration_growth: [],
        stake_participants: [],
        unit_participants: [],
        medical_information: [],
        dietary_information: []
    });

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
    }, [participantType, selectedStake]);

    return (
        <ProtectedRoute>
            <main className="flex-1 p-2 overflow-y-auto bg-white">
                <div className="flex justify-between items-center mb-4">
                    <UserInfo />
                    <SignOutButton />
                </div>
                <h1 className="text-3xl font-bold mb-6 text-gray-900">Dashboard</h1>

                <div className="mb-6">
                    <label className="text-lg font-semibold text-gray-700 mb-2">Select Participant Type:</label>
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center text-gray-700">
                            <input
                                type="radio"
                                name="participantType"
                                value="Participant"
                                checked={participantType === "Participant"}
                                onChange={(e) => setParticipantType(e.target.value)}
                                className="mr-2"
                            />
                            Participant
                        </label>
                        <label className="flex items-center text-gray-700">
                            <input
                                type="radio"
                                name="participantType"
                                value="Counselor"
                                checked={participantType === "Counselor"}
                                onChange={(e) => setParticipantType(e.target.value)}
                                className="mr-2"
                            />
                            Counselor
                        </label>
                    </div>
                </div>

                {selectedStake !== "All Stakes" ? (
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
                            dataName="age_group"
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
                    <div className="col-span-2">
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
                        <BarGraph
                            data={data.shirt_size_distribution}
                            dataName="shirt_size"
                            dataKey="total_registrants"
                            title="T-Shirt Size Distribution"
                            xAxisLabel="Shirt Size"
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
                </div>

                <div className="grid grid-cols-1 gap-4 mb-6">
                    <WordCloudChart
                        words={data.medical_information.map(item => item.medical_information)}
                        title="Medical Information"
                    />
                </div>
                <div className="grid grid-cols-1 gap-4 mb-6">
                    <WordCloudChart
                        words={data.dietary_information.map(item => item.dietary_information)}
                        title="Dietary Information"
                    />
                </div>
            </main>
        </ProtectedRoute>
    );
}
