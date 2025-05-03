import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const { stake_name, unit_name, status } = req.query;
            
            let sql = `
                SELECT fsy_id, concat(first_name, " ", last_name) as full_name, 
                    gender, phone_number, email, stake_name, unit_name, status
                FROM registrations 
                WHERE participant_type = 'Participant'
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

            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error filtering participants:', error);
            return res.status(500).json({
                success: false,
                message: 'Error filtering participants'
            });
        }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
} 