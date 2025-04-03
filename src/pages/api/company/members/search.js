import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { term } = req.query;

    if (!term) {
        return res.status(400).json({
            success: false,
            message: 'Search term is required'
        });
    }

    try {
        const searchTerm = `%${term}%`;
        const result = await query(`
            SELECT 
                r.fsy_id,
                CONCAT(r.first_name, ' ', r.last_name) as full_name,
                r.gender,
                r.status,
                r.participant_type,
                r.stake_name,
                r.unit_name,
                c.company_name,
                cg.group_name
            FROM registrations r
            LEFT JOIN company_members cm ON r.fsy_id = cm.fsy_id
            LEFT JOIN companies c ON cm.company_id = c.company_id
            LEFT JOIN companies_groups cg ON cm.group_id = cg.group_id
            WHERE 
                r.status = 'Approved'
                AND (
                    r.fsy_id LIKE ? OR
                    CONCAT(r.first_name, ' ', r.last_name) LIKE ? OR
                    r.stake_name LIKE ? OR
                    r.unit_name LIKE ?
                )
            ORDER BY 
                CASE 
                    WHEN r.participant_type = 'Counselor' THEN 1
                    WHEN r.participant_type = 'Participant' THEN 2
                    ELSE 3
                END,
                r.first_name,
                r.last_name
            LIMIT 50
        `, [searchTerm, searchTerm, searchTerm, searchTerm]);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error searching company members:', error);
        return res.status(500).json({
            success: false,
            message: 'Error searching company members'
        });
    }
} 