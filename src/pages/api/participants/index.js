import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const { event_id, company_id, group_id } = req.query;
            
            // Debug: Log the stored procedure call and parameters
            console.log(
                'Calling get_participants with:',
                'event_id:', event_id,
                'company_id:', company_id,
                'group_id:', group_id
            );
            
            // Call the stored procedure
            const result = await query('CALL get_participants(?, ?, ?)', [
                event_id || 0,
                company_id,
                group_id
            ]);
            
            // The stored procedure returns multiple result sets, we need the first one
            const participantsData = result[0];

            return res.status(200).json({
                success: true,
                data: participantsData
            });
        } catch (error) {
            console.error('Error fetching participants:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching participants'
            });
        }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
} 