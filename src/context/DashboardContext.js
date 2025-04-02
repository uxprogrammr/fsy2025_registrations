// src/context/DashboardContext.js
import { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const DashboardContext = createContext();

// Custom hook to use the context
export const useDashboard = () => useContext(DashboardContext);

// Provider component
export const DashboardProvider = ({ children }) => {
    const [dashboardData, setDashboardData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedStake, setSelectedStake] = useState("All Stakes");
    const [participantType, setParticipantType] = useState("Participant");

    // Fetch dashboard data based on filters
    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/dashboard?participant_type=${participantType}&stake_name=${selectedStake}`
            );
            const result = await response.json();
            setDashboardData(result.data || []);
        } catch (err) {
            setError("Error fetching dashboard data.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when filters change
    useEffect(() => {
        fetchDashboardData();
    }, [participantType, selectedStake]);

    // Change participant type
    const changeParticipantType = (type) => {
        setParticipantType(type);
    };

    // Change selected stake
    const changeSelectedStake = (stake) => {
        setSelectedStake(stake);
    };

    return (
        <DashboardContext.Provider
            value={{
                dashboardData,
                loading,
                error,
                selectedStake,
                participantType,
                changeParticipantType,
                changeSelectedStake,
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
};
