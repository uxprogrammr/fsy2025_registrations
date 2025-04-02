// src/context/CounselorContext.js
import { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const CounselorContext = createContext();

// Custom hook to use the context
export const useCounselor = () => useContext(CounselorContext);

// Provider component
export const CounselorProvider = ({ children }) => {
    const [counselors, setCounselors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStake, setSelectedStake] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');
    const [registrationStatus, setRegistrationStatus] = useState('');

    // Fetch counselors data
    const fetchCounselors = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/counselors?search=${searchTerm}&stake_name=${selectedStake}&unit_name=${selectedUnit}&status=${registrationStatus}`
            );
            const result = await response.json();
            setCounselors(result.data || []);
        } catch (err) {
            setError("Error fetching counselors.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Trigger data fetch when filters change
    useEffect(() => {
        fetchCounselors();
    }, [searchTerm, selectedStake, selectedUnit, registrationStatus]);

    // Update the filters
    const applyFilter = (filters) => {
        setSearchTerm(filters.searchTerm);
        setSelectedStake(filters.selectedStake);
        setSelectedUnit(filters.selectedUnit);
        setRegistrationStatus(filters.registrationStatus);
    };

    return (
        <CounselorContext.Provider
            value={{
                counselors,
                loading,
                error,
                searchTerm,
                selectedStake,
                selectedUnit,
                registrationStatus,
                applyFilter,
            }}
        >
            {children}
        </CounselorContext.Provider>
    );
};
