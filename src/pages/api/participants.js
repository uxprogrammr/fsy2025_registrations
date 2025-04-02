import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { stake_name = '', unit_name = '', status = '' } = req.query;

        try {
            const result = await query(`
                SELECT fsy_id, concat(first_name, " ", last_name) as full_name, 
                    gender, phone_number, email, stake_name, unit_name, status
                FROM registrations 
                WHERE participant_type = 'Participant' 
                    AND (stake_name = ?) 
                    AND (unit_name = ?) 
                    AND (status = ?)`,
                [stake_name, unit_name, status]);

            if (result.length === 0) {
                return res.status(404).json({ success: false, message: 'No participants found' });
            }

            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('Error fetching participants:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
