import { createContext, useContext, useState } from 'react';

const CompanyFilterContext = createContext();

export function CompanyFilterProvider({ children }) {
    const [filteredMembers, setFilteredMembers] = useState([]);

    const updateFilteredMembers = (result) => {
        console.log('Updating filtered members:', result);
        if (result && result.success && result.data) {
            setFilteredMembers(result.data);
        }
    };

    return (
        <CompanyFilterContext.Provider value={{ 
            filteredMembers, 
            updateFilteredMembers 
        }}>
            {children}
        </CompanyFilterContext.Provider>
    );
}

export function useCompanyFilter() {
    const context = useContext(CompanyFilterContext);
    if (!context) {
        throw new Error('useCompanyFilter must be used within a CompanyFilterProvider');
    }
    return context;
} 