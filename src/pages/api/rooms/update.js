import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { room_id, room_name, room_capacity, location, notes } = req.body;

    if (!room_id || !room_name) {
        return res.status(400).json({ success: false, message: 'Room ID and name are required' });
    }

    try {
        await query(
            'UPDATE rooms SET room_name = ?, room_capacity = ?, location = ?, notes = ? WHERE room_id = ?',
            [room_name, room_capacity || null, location || null, notes || null, room_id]
        );

        res.status(200).json({ 
            success: true, 
            data: { 
                room_id,
                room_name,
                room_capacity,
                location,
                notes
            }
        });
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating room'
        });
    }
} 