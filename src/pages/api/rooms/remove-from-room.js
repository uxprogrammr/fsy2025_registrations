import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    const { fsy_id } = req.body;
    if (!fsy_id) {
        return res.status(400).json({ success: false, message: 'Missing fsy_id' });
    }
    try {
        await query('UPDATE registrations SET room_name = NULL WHERE fsy_id = ?', [fsy_id]);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error removing participant from room:', error);
        res.status(500).json({ success: false, message: 'Error removing participant from room' });
    }
} 