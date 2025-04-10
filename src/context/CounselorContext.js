// src/contexts/CounselorContext.js
import React, { createContext, useContext, useState } from 'react';

const CounselorContext = createContext();

export function CounselorProvider({ children }) {
    const [counselors, setCounselors] = useState([]);
    const [loading, setLoading] = useState(false);

    const updateCounselors = (data) => {
        setCounselors(Array.isArray(data) ? data : []);
    };

    return (
        <CounselorContext.Provider value={{ 
            counselors, 
            setCounselors: updateCounselors,
            loading,
            setLoading
        }}>
            {children}
        </CounselorContext.Provider>
    );
}

export function useCounselors() {
    const context = useContext(CounselorContext);
    if (!context) {
        throw new Error('useCounselors must be used within a CounselorProvider');
    }
    return context;
}
