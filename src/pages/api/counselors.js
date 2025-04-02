import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const result = await query('SELECT * FROM registrations WHERE participant_type = "Counselor"');

            if (result.length === 0) {
                return res.status(404).json({ success: false, message: 'No counselors found' });
            }

            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('Error fetching counselors:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
