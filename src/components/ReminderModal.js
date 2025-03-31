import React, { useState } from "react";

export default function ReminderModal({ isOpen, onClose, stakeName, unitName, leaderName, leaderPhone, leaderEmail }) {
    const [reminderType, setReminderType] = useState("text");
    const [message, setMessage] = useState("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Send Reminder</h2>

                <div className="mb-4">
                    <p className="text-lg text-gray-800"><strong>Stake Name:</strong> {stakeName}</p>
                    <p className="text-lg text-gray-800"><strong>Unit Name:</strong> {unitName}</p>
                    <p className="text-lg text-gray-800"><strong>Leader Name:</strong> {leaderName}</p>
                    <p className="text-lg text-gray-800"><strong>Phone:</strong> {leaderPhone}</p>
                    <p className="text-lg text-gray-800"><strong>Email:</strong> {leaderEmail}</p>
                </div>

                <div className="mt-4 mb-4">
                    <label className="block text-lg font-semibold mb-2 text-gray-900">Send Reminder Via:</label>
                    <div className="flex gap-4">
                        <label className="flex items-center space-x-2 text-gray-800">
                            <input
                                type="radio"
                                name="reminderType"
                                value="text"
                                checked={reminderType === "text"}
                                onChange={(e) => setReminderType(e.target.value)}
                                className="mr-2"
                            />
                            Text
                        </label>
                        <label className="flex items-center space-x-2 text-gray-800">
                            <input
                                type="radio"
                                name="reminderType"
                                value="email"
                                checked={reminderType === "email"}
                                onChange={(e) => setReminderType(e.target.value)}
                                className="mr-2"
                            />
                            Email
                        </label>
                    </div>
                </div>

                <div className="mt-4 mb-4">
                    <label className="block text-lg font-semibold mb-2 text-gray-900">Message:</label>
                    <textarea
                        className="border p-2 w-full rounded text-gray-800"
                        rows={4}
                        placeholder="Enter your reminder message here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => alert(`Reminder sent via ${reminderType.toUpperCase()}`)}
                    >
                        Send Message
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
