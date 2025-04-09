import React from "react";

export default function RegistrantModal({ isOpen, onClose, registrants }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded-lg shadow-lg w-[700px]">
                <h2 className="text-xl font-bold mb-4 text-gray-900">List of Registrants</h2>
                <div className="overflow-auto max-h-[400px]">
                    <table className="min-w-full bg-white text-gray-900">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="py-1 px-2 text-left text-sm">Name</th>
                                <th className="py-1 px-2 text-left text-sm">Age</th>
                                <th className="py-1 px-2 text-left text-sm">Gender</th>
                                <th className="py-1 px-2 text-left text-sm">Phone Number</th>
                                <th className="py-1 px-2 text-left text-sm">Email Address</th>
                                <th className="py-1 px-2 text-left text-sm">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registrants.map((reg, index) => (
                                <tr key={index} className="border-t hover:bg-gray-100">
                                    <td className="py-1 px-2 text-gray-800 text-sm">{reg.preferred_name}</td>
                                    <td className="py-1 px-2 text-gray-800 text-sm">{reg.age}</td>
                                    <td className="py-1 px-2 text-gray-800 text-sm">{reg.gender}</td>
                                    <td className="py-1 px-2 text-gray-800 text-sm">{reg.phone_number}</td>
                                    <td className="py-1 px-2 text-gray-800 text-sm">{reg.email}</td>
                                    <td className="py-1 px-2 text-gray-800 text-sm">{reg.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end mt-2">
                    <button
                        className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
