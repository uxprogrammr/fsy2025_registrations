import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { stake_name, unit_name, status } = req.query;
        
        try {
            let sql = `
                SELECT fsy_id, concat(first_name, " ", last_name) as full_name, 
                    gender, phone_number, email, stake_name, unit_name, status
                FROM registrations 
                WHERE participant_type = 'Counselor'
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
