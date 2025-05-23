import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const notesSummary = await query(`
           SELECT 
                c.company_number, 
                cg.group_number,
                c.company_name,
                cg.group_name,
                COUNT(CASE WHEN temp.note_type = 'Positive' THEN 1 END) AS positive_notes,
                COUNT(CASE WHEN temp.note_type = 'Negative' THEN 1 END) AS negative_notes,
                100
                + COALESCE(SUM(CASE WHEN temp.note_type = 'Positive' AND temp.severity = 'Low' THEN 1 WHEN temp.note_type = 'Positive' AND temp.severity = 'Medium' THEN 2 WHEN temp.note_type = 'Positive' AND temp.severity = 'High' THEN 3 ELSE 0 END), 0)
                - COALESCE(SUM(CASE WHEN temp.note_type = 'Negative' AND temp.severity = 'Low' THEN 3 WHEN temp.note_type = 'Negative' AND temp.severity = 'Medium' THEN 6 WHEN temp.note_type = 'Negative' AND temp.severity = 'High' THEN 10 ELSE 0 END), 0)
                AS score
            FROM companies_groups cg
            LEFT JOIN (SELECT *
            FROM participant_notes pn
            LEFT JOIN company_members cm ON cm.fsy_id = pn.participant_fsy_id) as temp 
            ON temp.company_id = cg.company_id AND temp.group_id = cg.group_id
            INNER JOIN companies c ON c.company_id = cg.company_id
            LEFT JOIN registrations r ON r.fsy_id = temp.fsy_id
            GROUP BY c.company_number, cg.group_number, c.company_name, cg.group_name
            ORDER BY c.company_number, cg.group_number;
        `);

        res.status(200).json(notesSummary);
    } catch (error) {
        console.error('Error fetching notes summary:', error);
        res.status(500).json({ message: 'Error fetching notes summary' });
    }
} 