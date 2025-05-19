import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { room_id, room_name } = req.body;

    if (!room_id || !room_name) {
        return res.status(400).json({ success: false, message: 'Room ID and name are required' });
    }

    try {
        // First, clear room_name in registrations table
        await query(
            'UPDATE registrations SET room_name = NULL WHERE room_name = ?',
            [room_name]
        );

        // Then delete the room
        await query(
            'DELETE FROM rooms WHERE room_id = ?',
            [room_id]
        );

        res.status(200).json({ 
            success: true, 
            message: 'Room deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting room'
        });
    }
} 