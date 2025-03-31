import React, { useState } from "react";
import { MoreVertical } from "lucide-react";

export function EllipsisMenu({ items }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={toggleMenu}
                className="p-1 rounded hover:bg-gray-200"
            >
                <MoreVertical size={20} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
                    {items.map((item, index) => (
                        <button
                            key={index}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            onClick={() => {
                                item.action();
                                setIsOpen(false); // Close after clicking
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default EllipsisMenu;
