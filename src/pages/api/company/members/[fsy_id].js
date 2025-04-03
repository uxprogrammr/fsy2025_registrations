import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { fsy_id } = req.query;

    try {
        await query('DELETE FROM company_members WHERE fsy_id = ?', [fsy_id]);

        return res.status(200).json({
            success: true,
            message: 'Member removed successfully'
        });
    } catch (error) {
        console.error('Error removing company member:', error);
        return res.status(500).json({
            success: false,
            message: 'Error removing member from company'
        });
    }
} 