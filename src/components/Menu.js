// components/Menu.js
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Menu({ items, activeItem, onItemClick }) {
    const router = useRouter();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleItemClick = (item) => {
        if (item.path) {
            onItemClick(item);
            router.push(item.path);
        }
        setShowDropdown(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="flex space-x-4 relative">
            {items.map((item) => (
                <div key={item.label} className="relative">
                    {item.label === 'Reports' ? (
                        <>
                            <button
                                onClick={toggleDropdown}
                                className={`text-gray-700 font-normal py-2 px-4 ${activeItem === item.label ? 'font-semibold' : 'font-normal'}`}
                            >
                                {item.label}
                            </button>
                            {showDropdown && (
                                <div ref={dropdownRef} className="absolute left-0 mt-0 bg-white border border-gray-200 rounded shadow-md z-50">
                                    {item.subItems.map((subItem) => (
                                        <button
                                            key={subItem.label}
                                            onClick={() => handleItemClick(subItem)}
                                            className="block whitespace-nowrap text-left p-2 font-normal text-gray-700 hover:bg-gray-100"
                                        >
                                            {subItem.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <button
                            onClick={() => handleItemClick(item)}
                            className={`text-gray-700 font-normal py-2 px-4 ${activeItem === item.label ? 'font-semibold' : 'font-normal'}`}
                        >
                            {item.label}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
