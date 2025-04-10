import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id } = req.query;

    try {
        const result = await query(`
            SELECT *
            FROM registrations
            WHERE fsy_id = ?
            LIMIT 1
        `, [id]);

        if (result.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Profile not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            data: result[0]
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching profile data'
        });
    }
} 