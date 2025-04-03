// src/contexts/CompanyContext.js
import React, { createContext, useContext, useState } from 'react';

const ParticipantContext = createContext();

export function CompanyProvider({ children }) {
    const [companys, setCompanys] = useState([]);
    const [loading, setLoading] = useState(false);

    const updateCompanys = (data) => {
        console.log('Updating companies in context with:', data);
        setCompanys(Array.isArray(data) ? data : []);
    };

    return (
        <CompanyContext.Provider value={{ 
            companies, 
            setCompanys: updateCompanys,
            loading,
            setLoading
        }}>
            {children}
        </CompanyContext.Provider>
    );
}

export function useCompanys() {
    const context = useContext(CompanyContext);
    if (!context) {
        throw new Error('useCompanys must be used within a CompanyProvider');
    }
    return context;
}
