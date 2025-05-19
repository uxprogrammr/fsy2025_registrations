import { query } from '@/lib/db';

export default async function handler(req, res) {
    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (req.method === 'GET') {
        const { stake_name, unit_name, status, participant_type } = req.query;
        
        try {
            let sql = `
                SELECT fsy_id, concat(first_name, " ", last_name) as full_name, 
                    gender, phone_number, email, stake_name, unit_name, status,
                    participant_type
                FROM registrations 
                WHERE 1=1
            `;
            
            const params = [];

            // Add filter conditions only if they are provided
            if (stake_name && stake_name !== '') {
                sql += ` AND stake_name = ?`;
                params.push(stake_name);
            }
            
            if (unit_name && unit_name !== '') {
                sql += ` AND unit_name = ?`;
                params.push(unit_name);
            }
            
            if (status && status !== '') {
                sql += ` AND status = ?`;
                params.push(status);
            }

            if (participant_type && participant_type !== '') {
                sql += ` AND participant_type = ?`;
                params.push(participant_type);
            }

            const result = await query(sql, params);

            res.status(200).json({ 
                success: true, 
                data: result,
                debug: { sql, params } // Include debug info in development
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Server error',
                error: error.message 
            });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
} 