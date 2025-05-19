import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const result = await query(`
            SELECT room_id, room_name, location, notes
            FROM rooms
            ORDER BY room_name
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