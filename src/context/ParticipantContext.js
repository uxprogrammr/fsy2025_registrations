// src/contexts/ParticipantContext.js
import React, { createContext, useContext, useState } from 'react';

const ParticipantContext = createContext();

export function ParticipantProvider({ children }) {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(false);

    const updateParticipants = (data) => {
        console.log('Updating participants in context with:', data);
        setParticipants(Array.isArray(data) ? data : []);
    };

    return (
        <ParticipantContext.Provider value={{ 
            participants, 
            setParticipants: updateParticipants,
            loading,
            setLoading
        }}>
            {children}
        </ParticipantContext.Provider>
    );
}

export function useParticipants() {
    const context = useContext(ParticipantContext);
    if (!context) {
        throw new Error('useParticipants must be used within a ParticipantProvider');
    }
    return context;
}
