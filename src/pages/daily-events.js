import { useEffect, useState } from "react";
import ProtectedRoute from '@/components/ProtectedRoute';
import DataTable from "@/components/DataTable";
import '@/styles/global.css';

export default function DailyEvents() {
    // const [events, setEvents] = useState([]);

    // useEffect(() => {
    //     async function fetchEvents() {
    //         try {
    //             const response = await fetch('/api/daily-events');
    //             const result = await response.json();
    //             setEvents(result.data);
    //         } catch (error) {
    //             console.error("Error fetching daily events data:", error);
    //         }
    //     }
    //     fetchEvents();
    // }, []);

    return (
        <ProtectedRoute>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Daily Events</h1>
            {/* <DataTable data={events} getMenuItems={() => []} /> */}
        </ProtectedRoute>
    );
}
