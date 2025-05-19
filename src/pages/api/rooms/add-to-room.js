import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    const { fsy_id, room_name } = req.body;
    if (!fsy_id || !room_name) {
        return res.status(400).json({ success: false, message: 'Missing fsy_id or room_name' });
    }
    try {
        await query('UPDATE registrations SET room_name = ? WHERE fsy_id = ?', [room_name, fsy_id]);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error adding participant to room:', error);
        res.status(500).json({ success: false, message: 'Error adding participant to room' });
    }
} 