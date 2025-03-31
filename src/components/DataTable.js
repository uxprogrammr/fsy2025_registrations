import React from "react";
import EllipsisMenu from "./EllipsisMenu";

export function DataTable({ data, getMenuItems }) {
    if (!Array.isArray(data) || data.length === 0) {
        return <p className="text-gray-700">No data available</p>;
    }

    // Dynamically extract headers from the data keys
    const headers = Object.keys(data[0]);

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
                        <th className="py-1 px-2 text-left font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index} className="border-t bg-gray-50 hover:bg-gray-100 text-gray-800">
                            {headers.map((header) => (
                                <td key={header} className="py-1 px-2">
                                    {item[header]}
                                </td>
                            ))}
                            <td className="py-1 px-2">
                                <EllipsisMenu items={getMenuItems(item)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;
