// src/contexts/CompanyContext.js
import React, { createContext, useContext, useState } from 'react';

const CompanyContext = createContext();

export function CompanyProvider({ children }) {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);

    const updateCompanies = (data) => {
        console.log('Updating companies in context with:', data);
        setCompanies(Array.isArray(data) ? data : []);
    };

    return (
        <CompanyContext.Provider value={{ 
            companies, 
            setCompanies: updateCompanies,
            loading,
            setLoading
        }}>
            {children}
        </CompanyContext.Provider>
    );
}

export function useCompanies() {
    const context = useContext(CompanyContext);
    if (!context) {
        throw new Error('useCompanies must be used within a CompanyProvider');
    }
    return context;
}
