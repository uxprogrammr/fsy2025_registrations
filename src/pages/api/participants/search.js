import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { query: searchQuery, company_name, group_name, room_name } = req.query;

    try {
        let sql = `
            SELECT 
                reg.fsy_id,
                CONCAT(reg.first_name, ' ', reg.last_name) as full_name,
                reg.participant_type,
                reg.stake_name,
                reg.unit_name,
                reg.company_name,
                reg.group_name,
                reg.room_name
            FROM registrations reg
            WHERE 1=1
        `;
        const params = [];

        // Add search query condition
        if (searchQuery && searchQuery.trim() !== '') {
            sql += ` AND (
                CONCAT(reg.first_name, ' ', reg.last_name) LIKE ? OR
                reg.email LIKE ?
            )`;
            const searchParam = `%${searchQuery.trim()}%`;
            params.push(searchParam, searchParam);
        }

        // Add company filter
        if (company_name) {
            sql += ' AND reg.company_name = ?';
            params.push(company_name);
        }

        // Add group filter
        if (group_name) {
            sql += ' AND reg.group_name = ?';
            params.push(group_name);
        }

        // Exclude participants who are already in the room
        if (room_name) {
            sql += ' AND (reg.room_name IS NULL OR reg.room_name != ?)';
            params.push(room_name);
        }

        sql += ' ORDER BY full_name';

        const result = await query(sql, params);

        res.status(200).json({ 
            success: true, 
            data: result
        });
    } catch (error) {
        console.error('Error searching participants:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error searching participants'
        });
    }
} 