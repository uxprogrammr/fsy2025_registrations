import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id } = req.query;

    try {
        const result = await query(`
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
            WHERE reg.room_name = ?
            ORDER BY full_name
        `, [id]);

        res.status(200).json({ 
            success: true, 
            data: result
        });
    } catch (error) {
        console.error('Error fetching room participants:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching room participants data'
        });
    }
} 