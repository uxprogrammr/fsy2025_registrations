export default function Metrics({ label, value, icon }) {
    return (
        <div className="p-4 bg-white shadow rounded-lg flex items-center space-x-4">
            {icon && <div className="text-3xl">{icon}</div>}
            <div>
                <h3 className="text-lg font-semibold text-gray-700">{label}</h3>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}
