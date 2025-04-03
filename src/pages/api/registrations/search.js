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
                r.birth_date,
                TIMESTAMPDIFF(YEAR, r.birth_date, CURDATE()) as age,
                r.status,
                r.participant_type,
                r.stake_name,
                r.unit_name
            FROM registrations r
            LEFT JOIN company_members cm ON r.fsy_id = cm.fsy_id
            WHERE 
                cm.fsy_id IS NULL
                AND (
                    r.fsy_id LIKE ? OR
                    r.first_name LIKE ? OR
                    r.last_name LIKE ? OR
                    CONCAT(r.first_name, ' ', r.last_name) LIKE ? OR
                    r.stake_name LIKE ? OR
                    r.unit_name LIKE ?
                )
                AND r.status = 'Approved'
            ORDER BY r.first_name, r.last_name
            LIMIT 100
        `, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]);

        // Add debug logging
        console.log(`Search results for term "${term}":`, result.length);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error searching registrations:', error);
        return res.status(500).json({
            success: false,
            message: 'Error searching registrations'
        });
    }
} 