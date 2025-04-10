import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import EllipsisMenu from "./EllipsisMenu";

export function DataTable({ 
    data, 
    getMenuItems = () => [],
    onRowDoubleClick = null
}) {
    const [visibleFields, setVisibleFields] = useState({});

    if (!Array.isArray(data) || data.length === 0) {
        return <p className="text-gray-700">No data available</p>;
    }

    const headers = Object.keys(data[0]);
    const hasActions = data.some((item) => getMenuItems(item).length > 0);

    // Toggle visibility of sensitive data
    const toggleVisibility = (index, header, event) => {
        // Prevent the double click from triggering when clicking the visibility toggle
        event.stopPropagation();
        setVisibleFields((prev) => ({
            ...prev,
            [`${index}-${header}`]: !prev[`${index}-${header}`],
        }));
    };

    const handleDoubleClick = (item, event) => {
        // Prevent double click from bubbling if clicking on sensitive data toggle
        if (event.target.closest('button')) {
            return;
        }
        if (onRowDoubleClick) {
            onRowDoubleClick(item);
        }
    };

    // Check if a header contains sensitive data (phone or email)
    const isSensitive = (header) =>
        header.toLowerCase().includes("phone") || header.toLowerCase().includes("email");

    return (
        <div className="overflow-auto rounded-lg shadow">
            <table className="min-w-full bg-white border border-gray-200 text-sm">
                <thead className="bg-gray-800 text-white">
                    <tr>
                        {headers.map((header) => (
                            <th key={header} className="py-1 px-2 text-left font-medium">
                                {header.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                            </th>
                        ))}
                        {hasActions && (
                            <th className="py-1 px-2 text-left font-medium">Actions</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr 
                            key={index} 
                            className={`border-t bg-gray-50 hover:bg-gray-100 text-gray-800 ${onRowDoubleClick ? 'cursor-pointer' : ''}`}
                            onDoubleClick={(e) => handleDoubleClick(item, e)}
                        >
                            {headers.map((header) => (
                                <td key={header} className="py-1 px-2 text-left">
                                    {isSensitive(header) ? (
                                        <div className="flex items-center gap-2">
                                            {visibleFields[`${index}-${header}`]
                                                ? item[header]
                                                : "******"}
                                            <button
                                                onClick={(e) => toggleVisibility(index, header, e)}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                {visibleFields[`${index}-${header}`] ? (
                                                    <EyeOff size={16} />
                                                ) : (
                                                    <Eye size={16} />
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        item[header]
                                    )}
                                </td>
                            ))}
                            {hasActions && (
                                <td className="py-1 px-2 text-left">
                                    <EllipsisMenu items={getMenuItems(item)} />
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;
