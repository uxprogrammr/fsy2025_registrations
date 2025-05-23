import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { company_name, group_name } = req.query;
    if (!company_name || !group_name) {
        return res.status(400).json({ message: 'Missing company_name or group_name' });
    }

    try {
        const notes = await query(`
            SELECT concat(r.first_name, ' ', r.last_name) as full_name,
                tempNotes.note_type,
                tempNotes.category,
                tempNotes.severity,
                tempNotes.message,
                tempNotes.photo_url,
                tempNotes.created_at,
                tempNotes.updated_at,
                concat(r2.first_name, ' ', r2.last_name) as recorded_by
            FROM (
                SELECT * FROM participant_notes
                WHERE participant_fsy_id IN (
                    SELECT fsy_id FROM company_members 
                        WHERE company_id = (SELECT company_id FROM companies WHERE company_name = ?) 
                        AND group_id = (SELECT group_id FROM companies_groups WHERE group_name = ?)
                        )
            ) as tempNotes
            INNER JOIN registrations r ON r.fsy_id = tempNotes.participant_fsy_id
            INNER JOIN registrations r2 ON r2.fsy_id = tempNotes.counselor_fsy_id
            ORDER BY tempNotes.created_at DESC
        `, [company_name, group_name]);

        res.status(200).json(notes);
    } catch (error) {
        console.error('Error fetching group notes:', error);
        res.status(500).json({ message: 'Error fetching group notes' });
    }
} 