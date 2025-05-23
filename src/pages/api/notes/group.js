import { query } from '@/lib/db';

function calculateScore(note_type, severity) {
    if (note_type === 'Positive') {
        if (severity === 'Low') return 1;
        if (severity === 'Medium') return 2;
        if (severity === 'High') return 3;
    } else if (note_type === 'Negative') {
        if (severity === 'Low') return -3;
        if (severity === 'Medium') return -6;
        if (severity === 'High') return -10;
    }
    return 0;
}

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

        // Add score and running_score
        let runningScore = 100;
        const notesWithScores = notes.map((note) => {
            const score = calculateScore(note.note_type, note.severity);
            runningScore += score;
            return { ...note, score, running_score: runningScore };
        });

        res.status(200).json(notesWithScores);
    } catch (error) {
        console.error('Error fetching group notes:', error);
        res.status(500).json({ message: 'Error fetching group notes' });
    }
} 