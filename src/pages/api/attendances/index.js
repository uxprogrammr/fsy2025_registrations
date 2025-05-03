import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const { event_id } = req.query;
            
            // Call the stored procedure
            const result = await query('CALL get_attendance_summary(?)', [event_id || 0]);
            
            // The stored procedure returns multiple result sets, we need the first one
            const attendanceData = result[0];

            return res.status(200).json({
                success: true,
                data: attendanceData
            });
        } catch (error) {
            console.error('Error fetching attendance summary:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching attendance summary'
            });
        }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
} 