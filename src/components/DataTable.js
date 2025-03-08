export default function DataTable({ data, title }) {
    if (!data || data.length === 0) {
        return <p className="text-gray-500">No data available.</p>;
    }

    return (
        <div className="p-4 bg-white shadow rounded-lg overflow-auto">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        {Object.keys(data[0]).map((key) => (
                            <th key={key} className="border px-4 py-2 text-left text-gray-600">{key.replace(/_/g, ' ')}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border">
                            {Object.values(row).map((value, colIndex) => (
                                <td key={colIndex} className="border px-4 py-2 text-gray-700">{value}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
