import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { term } = req.query;
    if (!term) {
        return res.status(400).json({ success: false, message: 'Search term is required' });
    }

    try {
        // First try exact matches
        const exactMatches = await query(`
            SELECT fsy_id, concat(first_name, " ", last_name) as full_name, 
                gender, phone_number, email, stake_name, unit_name, status
            FROM registrations 
            WHERE participant_type = 'Participant'
            AND (fsy_id = ? OR email = ? OR phone_number = ?)
            LIMIT 1
        `, [term, term, term]);

        if (exactMatches.length === 1) {
            return res.status(200).json({ 
                success: true, 
                data: exactMatches,
                matchType: exactMatches[0].fsy_id === term ? 'fsy_id' : 
                          exactMatches[0].email === term ? 'email' : 'phone_number'
            });
        }

        // If no exact matches, try partial name match
        const nameMatches = await query(`
            SELECT fsy_id, concat(first_name, " ", last_name) as full_name, 
                gender, phone_number, email, stake_name, unit_name, status
            FROM registrations 
            WHERE participant_type = 'Participant'
            AND concat(first_name, " ", last_name) LIKE ?
        `, [`%${term}%`]);

        return res.status(200).json({ 
            success: true, 
            data: nameMatches,
            matchType: 'name'
        });

    } catch (error) {
        console.error('Search error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error performing search'
        });
    }
} 