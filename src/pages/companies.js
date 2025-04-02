import { useEffect, useState } from "react";
import ProtectedRoute from '@/components/ProtectedRoute';
import DataTable from "@/components/DataTable";
import '@/styles/global.css';

export default function Companies() {
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        async function fetchCompanies() {
            try {
                const response = await fetch('/api/companies');
                const result = await response.json();
                setCompanies(result.data);
            } catch (error) {
                console.error("Error fetching companies data:", error);
            }
        }
        fetchCompanies();
    }, []);

    return (
        <ProtectedRoute>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Companies</h1>
            <DataTable data={companies} getMenuItems={() => []} />
        </ProtectedRoute>
    );
}
