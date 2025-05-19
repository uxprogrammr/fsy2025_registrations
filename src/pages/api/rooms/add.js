import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { room_name, room_capacity, location, notes } = req.body;

    if (!room_name) {
        return res.status(400).json({ success: false, message: 'Room name is required' });
    }

    try {
        const result = await query(
            'INSERT INTO rooms (room_name, room_capacity, location, notes) VALUES (?, ?, ?, ?)',
            [room_name, room_capacity || null, location || null, notes || null]
        );

        res.status(200).json({ 
            success: true, 
            data: { 
                room_id: result.insertId,
                room_name,
                room_capacity,
                location,
                notes
            }
        });
    } catch (error) {
        console.error('Error adding room:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error adding room'
        });
    }
} 