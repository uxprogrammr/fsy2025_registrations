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
        // Check if term is a number (fsy_id)
        const numericTerm = parseInt(term);
        if (!isNaN(numericTerm)) {
            // If numeric, only search by fsy_id
            const result = await query(`
                SELECT fsy_id, concat(first_name, " ", last_name) as full_name, 
                    gender, phone_number, email, stake_name, unit_name, status
                FROM registrations 
                WHERE fsy_id = ?
                LIMIT 1
            `, [numericTerm]);

            return res.status(200).json({ 
                success: true, 
                data: result,
                searchType: 'fsy_id'
            });
        }

        // If not numeric, try exact matches for email and phone
        const exactMatches = await query(`
            SELECT fsy_id, concat(first_name, " ", last_name) as full_name, 
                gender, phone_number, email, stake_name, unit_name, status
            FROM registrations 
            WHERE email = ? OR phone_number = ?
            LIMIT 1
        `, [term, term]);

        if (exactMatches.length > 0) {
            return res.status(200).json({ 
                success: true, 
                data: exactMatches,
                searchType: exactMatches[0].email === term ? 'email' : 'phone'
            });
        }

        // If no exact matches, try partial name match
        const nameMatches = await query(`
            SELECT fsy_id, concat(first_name, " ", last_name) as full_name, 
                gender, phone_number, email, stake_name, unit_name, status
            FROM registrations 
            WHERE concat(first_name, " ", last_name) LIKE ?
        `, [`%${term}%`]);

        return res.status(200).json({ 
            success: true, 
            data: nameMatches,
            searchType: 'name'
        });

    } catch (error) {
        console.error('Search error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error performing search'
        });
    }
} 