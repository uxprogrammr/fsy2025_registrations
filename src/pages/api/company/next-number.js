import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Get the highest company number
        const [result] = await query(`
            SELECT MAX(company_number) as max_number
            FROM companies
        `);

        const nextNumber = (result.max_number || 0) + 1;

        return res.status(200).json({
            success: true,
            nextNumber
        });
    } catch (error) {
        console.error('Error getting next company number:', error);
        return res.status(500).json({
            success: false,
            message: 'Error getting next company number'
        });
    }
} 