import React, { useEffect, useState } from 'react';

export default function UserInfo() {
    const [fullName, setFullName] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedName = localStorage.getItem('fullName');
            setFullName(storedName);
        }
    }, []);

    return (
        <div className="text-gray-900 font-semibold">
            {fullName ? `Welcome, ${fullName}` : 'Welcome'}
        </div>
    );
}
