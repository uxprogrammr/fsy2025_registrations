import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const result = await query(`
            SELECT 
                r.room_id, 
                r.room_name, 
                r.room_capacity,
                r.location, 
                r.notes,
                COUNT(reg.fsy_id) as total_participants
            FROM rooms r
            LEFT JOIN registrations reg ON r.room_name = reg.room_name
            GROUP BY r.room_id, r.room_name, r.room_capacity, r.location, r.notes
            ORDER BY r.room_name
        `);

        res.status(200).json({ 
            success: true, 
            data: result
        });
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching rooms data'
        });
    }
} 