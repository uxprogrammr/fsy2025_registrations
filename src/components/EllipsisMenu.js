import React, { useState, useRef, useEffect } from "react";

export default function EllipsisMenu({ items }) {
    const [isOpen, setIsOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const menuRef = useRef(null);

    const handleToggle = (event) => {
        setIsOpen(!isOpen);

        // Get the button's position and calculate the menu's position
        const rect = event.currentTarget.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Check if there is enough space to show the menu below the button
        const menuHeight = menuRef.current ? menuRef.current.offsetHeight : 0;
        const showAbove = rect.bottom + menuHeight > viewportHeight;

        setMenuPosition({
            top: showAbove ? rect.top - menuHeight : rect.bottom,
            left: rect.left,
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative inline-block">
            <button onClick={handleToggle} className="text-gray-600 hover:text-gray-800">
                &#x22EE;
            </button>
            {isOpen && (
                <div
                    ref={menuRef}
                    style={{ top: menuPosition.top, left: menuPosition.left }}
                    className="fixed bg-white border border-gray-300 shadow-lg rounded-md z-50"
                >
                    {items.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                item.action();
                                setIsOpen(false);
                            }}
                            className="block px-4 py-2 text-left text-gray-800 hover:bg-gray-100 w-full"
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
