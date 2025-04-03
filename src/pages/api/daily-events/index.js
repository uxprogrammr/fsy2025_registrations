import { query } from '@/lib/db';

export default async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            return getEvents(req, res);
        case 'POST':
            return createEvent(req, res);
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }
}

async function getEvents(req, res) {
    try {
        const events = await query(`
            SELECT 
                event_id,
                event_name,
                day_number,
                start_time,
                end_time,
                description,
                attendance_required
            FROM daily_events 
            ORDER BY day_number, start_time
        `);

        return res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching events'
        });
    }
}

async function createEvent(req, res) {
    try {
        const { event_name, day_number, start_time, end_time, description, attendance_required } = req.body;

        // Validate required fields
        if (!event_name || !day_number || !start_time || !end_time) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Validate day number
        if (day_number < 1 || day_number > 7) {
            return res.status(400).json({ success: false, message: 'Invalid day number' });
        }

        // Validate time format and range
        if (end_time <= start_time) {
            return res.status(400).json({
                success: false,
                message: 'End time must be later than start time'
            });
        }

        // Insert new event
        const result = await query(
            `INSERT INTO daily_events 
            (event_name, day_number, start_time, end_time, description, attendance_required) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [event_name, day_number, start_time, end_time, description || null, attendance_required || 'N']
        );

        return res.status(201).json({
            success: true,
            data: {
                event_id: result.insertId,
                event_name,
                day_number,
                start_time,
                end_time,
                description,
                attendance_required
            }
        });
    } catch (error) {
        console.error('Error creating event:', error);
        return res.status(500).json({ success: false, message: 'Failed to create event' });
    }
} 