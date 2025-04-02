import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id } = req.query;

    try {
        console.log('Fetching participant with ID:', id);

        const result = await query(`
            SELECT *
            FROM registrations
            WHERE fsy_id = ?
            AND participant_type = 'Participant'
            LIMIT 1
        `, [id]);

        console.log('Query result:', result);

        if (result.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Participant not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            data: result[0]
        });
    } catch (error) {
        console.error('Error fetching participant:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching participant data'
        });
    }
} 