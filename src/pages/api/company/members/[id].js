import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id } = req.query; // Using 'id' consistently as the route parameter

    try {
        const result = await query(`
            SELECT 
                cm.*,
                c.company_name,
                c.company_number,
                cg.group_name,
                cg.group_number
            FROM company_members cm
            JOIN companies c ON cm.company_id = c.company_id
            JOIN companies_groups cg ON cm.group_id = cg.group_id
            WHERE cm.fsy_id = ?
        `, [id]);

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Company member not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('Error fetching company member:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching company member'
        });
    }
}